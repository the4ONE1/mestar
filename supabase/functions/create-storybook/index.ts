import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { PDFDocument, rgb, StandardFonts } from "https://esm.sh/pdf-lib@1.17.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Gemini 3 Pro Image typically takes 20–27s per image, so the old 22s cap aborted
// nearly every request and shipped text-only PDFs. Give each image real headroom…
const IMAGE_REQUEST_TIMEOUT_MS = 45000;
// …but the Supabase edge runtime kills a request at 150s AND enforces a separate
// CPU-time ceiling. Racing a wall-clock budget kept blowing the CPU limit during
// PDF assembly, so cap each pass to a small batch of images instead and let the
// resume passes chain until the book is complete.
const IMAGE_GENERATION_BUDGET_MS = 100000;
const IMAGES_PER_PASS = 4;

// Set when the gateway refuses a call for billing/quota reasons (HTTP 402). The
// order is flagged so an incomplete book is never delivered silently.
let creditsExhausted = false;


// ── AI Image Generation (works for both color illustrations and B&W coloring pages) ──
// referenceImages: optional data-URL strings used as likeness references
async function generateImage(
  prompt: string,
  apiKey: string,
  referenceImages: string[] = [],
  label: string = "image"
): Promise<Uint8Array | null> {
  const attempt = async (): Promise<Uint8Array | null | "RETRY"> => {
    const userContent: any[] = [{ type: "text", text: prompt }];
    for (const refUrl of referenceImages) {
      if (refUrl) userContent.push({ type: "image_url", image_url: { url: refUrl } });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), IMAGE_REQUEST_TIMEOUT_MS);
    let res: Response;
    try {
      res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        signal: controller.signal,
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          // Gemini 3 Pro Image (Nano Banana Pro) — best-in-class character consistency
          // across multiple illustrations. Same chat-shape body as prior Gemini image models.
          model: "google/gemini-3-pro-image",
          messages: [{ role: "user", content: userContent }],
          modalities: ["image", "text"],
        }),
      });
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") {
        console.error(`[${label}] image gen timed out after ${IMAGE_REQUEST_TIMEOUT_MS}ms`);
        return null;
      }
      throw e;
    } finally {
      clearTimeout(timeout);
    }

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error(`[${label}] image gen HTTP ${res.status}: ${body.slice(0, 300)}`);
      if (res.status === 402) {
        creditsExhausted = true;
        console.error(`[${label}] AI credits exhausted (402) — remaining images cannot be generated`);
      }
      return res.status === 429 ? "RETRY" : null;
    }


    const data = await res.json();
    const dataUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url as string | undefined;
    if (!dataUrl) {
      const finish = data.choices?.[0]?.finish_reason;
      const textOut = data.choices?.[0]?.message?.content;
      console.error(`[${label}] no image in response. finish_reason=${finish} text=${String(textOut).slice(0, 200)}`);
      return null;
    }

    const base64 = dataUrl.split(",")[1];
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
  };

  try {
    // One retry on 429 only. Paid checkout must finish with a usable PDF instead
    // of spending the entire function window waiting on optional images.
    const retryWaits = [1500];
    let result = await attempt();
    for (let i = 0; i < retryWaits.length && result === "RETRY"; i++) {
      console.log(`[${label}] 429 — retrying in ${retryWaits[i]}ms (attempt ${i + 2}/${retryWaits.length + 1})...`);
      await new Promise((r) => setTimeout(r, retryWaits[i]));
      result = await attempt();
    }
    if (result === "RETRY") {
      console.error(`[${label}] still rate-limited after ${retryWaits.length + 1} attempts, giving up`);
      return null;
    }
    console.log(`[${label}] ${result ? "ok" : "failed"}`);
    return result as Uint8Array | null;
  } catch (e) {
    console.error(`[${label}] image gen error:`, e);
    return null;
  }
}

function hasImageBudget(deadlineMs: number, label: string): boolean {
  const remaining = deadlineMs - Date.now();
  if (remaining < IMAGE_REQUEST_TIMEOUT_MS + 3000) {
    console.warn(`[${label}] skipping remaining images — delivery deadline reached (${remaining}ms left)`);
    return false;
  }
  return true;
}


// Fetch a private photo from storage and convert to a base64 data URL the AI can use as reference
async function photoPathToDataUrl(
  supabase: any,
  path: string | null | undefined
): Promise<string | null> {
  if (!path) return null;
  try {
    const { data, error } = await supabase.storage.from("customer-photos").download(path);
    if (error || !data) {
      console.error("Photo download failed:", path, error);
      return null;
    }
    const buf = new Uint8Array(await data.arrayBuffer());
    let binary = "";
    for (let i = 0; i < buf.length; i++) binary += String.fromCharCode(buf[i]);
    const b64 = btoa(binary);
    const mime = (data as Blob).type || "image/jpeg";
    return `data:${mime};base64,${b64}`;
  } catch (e) {
    console.error("Photo conversion error:", e);
    return null;
  }
}

// Decide which reference photos to attach for a given page (1-indexed)
// Pages 1, 3, 5 = main only; Page 2 = both; Page 4 = supporting only (when present)
function refsForPage(pageIndex: number, mainRef: string | null, supportingRef: string | null): string[] {
  const page = pageIndex + 1;
  if (!supportingRef) return mainRef ? [mainRef] : [];
  if (page === 2) return [mainRef, supportingRef].filter(Boolean) as string[];
  if (page === 4) return [supportingRef];
  return mainRef ? [mainRef] : [];
}

// Prepend a likeness-lock instruction so the model uses the reference photo across all pages
function withLikenessLock(prompt: string, hasRef: boolean): string {
  if (!hasRef) return prompt;
  return (
    "IMPORTANT — LIKENESS REFERENCE: The attached photo(s) show the real person this character must look like. " +
    "Match the face shape, hair color and style, skin tone, and overall likeness exactly. " +
    "Keep this character visually IDENTICAL across every page so it looks like the same person throughout the book. " +
    "Do not invent a different face. Now follow this prompt:\n\n" +
    prompt
  );
}

// Age-based complexity guidance for coloring pages.
// Youngest = very simple with huge fill areas. Oldest = detailed, intricate line art.
function coloringComplexityForAge(age: number | string | undefined): string {
  const n = typeof age === "number" ? age : parseInt(String(age ?? ""), 10);
  const a = isNaN(n) ? 6 : n;
  if (a <= 3) {
    return "COMPLEXITY: VERY SIMPLE (toddler). Extra-thick chunky outlines, only 4-8 large shapes on the page, huge open fill areas, minimal background, no small details, no tiny patterns. Easy for tiny hands to color inside the lines.";
  }
  if (a <= 5) {
    return "COMPLEXITY: SIMPLE (preschool). Thick bold outlines, large easy-to-color shapes, a few background elements, no tiny details or fine patterns.";
  }
  if (a <= 7) {
    return "COMPLEXITY: MEDIUM (early elementary). Medium-weight outlines, moderate detail, some background elements and simple patterns, still plenty of open space to color.";
  }
  if (a <= 10) {
    return "COMPLEXITY: DETAILED (older kids). Finer line weight, more scene detail, patterns on clothing and background, layered composition, but still clean and printable.";
  }
  return "COMPLEXITY: ADVANCED / INTRICATE (tween+). Fine detailed line art, intricate patterns, textures on clothing/hair/background, layered scene with foreground and background detail — a satisfying challenge to color.";
}

// For coloring pages: use the matching color illustration as the reference and ask the model
// to convert it to clean B&W line art. This keeps the same character across both formats
// without confusing the model with a color photo + B&W instruction conflict.
function withColoringLock(prompt: string, hasIllustrationRef: boolean, age?: number | string): string {
  const complexity = coloringComplexityForAge(age);
  if (!hasIllustrationRef) {
    return (
      "Black-and-white printable coloring page. Clean white background, NO shading, NO grayscale, NO color fill, NO text.\n" +
      complexity + "\n\n" + prompt
    );
  }
  return (
    "IMPORTANT — REFERENCE IMAGE: The attached image is the full-color illustration of this exact scene. " +
    "Re-draw the SAME character, pose, and scene as a black-and-white printable coloring page: " +
    "clean white background, NO shading, NO grayscale, NO color fill, NO text. " +
    "The character's face, hairstyle, outfit, and proportions must match the reference exactly so it's " +
    "clearly the same person as in the storybook illustration.\n" +
    complexity + "\n\nNow follow this prompt:\n\n" + prompt
  );
}

// Convert raw image bytes to a data URL we can pass back to the model as a reference
function bytesToDataUrl(bytes: Uint8Array | null, mime = "image/png"): string | null {
  if (!bytes) return null;
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return `data:${mime};base64,${btoa(binary)}`;
}

// ── Text Wrapping ──
function wrapText(text: string, font: any, fontSize: number, maxWidth: number): string[] {
  const paragraphs = text.split("\n");
  const lines: string[] = [];
  for (const para of paragraphs) {
    if (para.trim() === "") {
      lines.push("");
      continue;
    }
    const words = para.split(" ");
    let currentLine = "";
    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const width = font.widthOfTextAtSize(testLine, fontSize);
      if (width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) lines.push(currentLine);
  }
  return lines;
}

// Split story text into 5 roughly equal chunks (one per illustration)
function splitStoryIntoPages(story: string, pages: number): string[] {
  const sentences = story.match(/[^.!?]+[.!?]+(\s|$)/g) || [story];
  const perPage = Math.ceil(sentences.length / pages);
  const chunks: string[] = [];
  for (let i = 0; i < pages; i++) {
    const slice = sentences.slice(i * perPage, (i + 1) * perPage).join("").trim();
    chunks.push(slice || "");
  }
  return chunks;
}

// ── PDF Builder ──
async function buildStorybookPDF(
  title: string,
  storyText: string,
  illustrationImages: (Uint8Array | null)[],
  coloringImages: (Uint8Array | null)[],
  bonusColoringImages: (Uint8Array | null)[],
  hasIllustrations: boolean,
  hasBonusColoringBook: boolean
): Promise<{ pdf: Uint8Array; pageTexts: string[] }> {
  const pdfDoc = await PDFDocument.create();
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const PAGE_W = 612;
  const PAGE_H = 792;
  const MARGIN = 54;
  const TEXT_W = PAGE_W - MARGIN * 2;

  // ── Cover ──
  const cover = pdfDoc.addPage([PAGE_W, PAGE_H]);
  const titleSize = 32;
  const titleWidth = helveticaBold.widthOfTextAtSize(title, titleSize);
  cover.drawText(title, {
    x: (PAGE_W - titleWidth) / 2,
    y: PAGE_H / 2 + 40,
    size: titleSize,
    font: helveticaBold,
    color: rgb(0.15, 0.15, 0.35),
  });
  const subtitle = "A Personalized Storybook by MESTAR";
  const subSize = 14;
  const subWidth = helvetica.widthOfTextAtSize(subtitle, subSize);
  cover.drawText(subtitle, {
    x: (PAGE_W - subWidth) / 2,
    y: PAGE_H / 2 - 10,
    size: subSize,
    font: helvetica,
    color: rgb(0.4, 0.4, 0.5),
  });

  const pageTexts: string[] = [];

  if (hasIllustrations && illustrationImages.some(Boolean)) {
    // ── Illustrated Story Pages: image on top, text below ──
    const pageChunks = splitStoryIntoPages(storyText, 5);
    pageTexts.push(...pageChunks);

    const storyFontSize = 12;
    const lineHeight = 18;

    for (let i = 0; i < 5; i++) {
      const page = pdfDoc.addPage([PAGE_W, PAGE_H]);
      const img = illustrationImages[i];
      let textTopY = PAGE_H - MARGIN;

      if (img) {
        try {
          const embedded = await pdfDoc.embedPng(img);
          const maxImgW = PAGE_W - MARGIN * 2;
          const maxImgH = PAGE_H * 0.55;
          const dims = embedded.scaleToFit(maxImgW, maxImgH);
          page.drawImage(embedded, {
            x: (PAGE_W - dims.width) / 2,
            y: PAGE_H - MARGIN - dims.height,
            width: dims.width,
            height: dims.height,
          });
          textTopY = PAGE_H - MARGIN - dims.height - 20;
        } catch (e) {
          console.error("Embed illustration failed:", e);
        }
      }

      const lines = wrapText(pageChunks[i] || "", helvetica, storyFontSize, TEXT_W);
      let y = textTopY;
      for (const line of lines) {
        if (y < MARGIN) break;
        if (line === "") {
          y -= lineHeight;
          continue;
        }
        page.drawText(line, {
          x: MARGIN,
          y,
          size: storyFontSize,
          font: helvetica,
          color: rgb(0.1, 0.1, 0.1),
        });
        y -= lineHeight;
      }
    }
  } else {
    // ── Text-only story pages ──
    const storyFontSize = 12;
    const lineHeight = 18;
    const lines = wrapText(storyText, helvetica, storyFontSize, TEXT_W);
    let page = pdfDoc.addPage([PAGE_W, PAGE_H]);
    let y = PAGE_H - MARGIN;
    for (const line of lines) {
      if (y < MARGIN + 40) {
        page = pdfDoc.addPage([PAGE_W, PAGE_H]);
        y = PAGE_H - MARGIN;
      }
      if (line === "") {
        y -= lineHeight;
        continue;
      }
      page.drawText(line, {
        x: MARGIN,
        y,
        size: storyFontSize,
        font: helvetica,
        color: rgb(0.1, 0.1, 0.1),
      });
      y -= lineHeight;
    }
    pageTexts.push(...splitStoryIntoPages(storyText, 5));
  }

  // Helper to render a set of coloring pages with a title divider
  const renderColoringSection = async (dividerText: string, images: (Uint8Array | null)[]) => {
    if (!images.some(Boolean)) return;
    const dividerPage = pdfDoc.addPage([PAGE_W, PAGE_H]);
    const dividerSize = 28;
    const dividerWidth = helveticaBold.widthOfTextAtSize(dividerText, dividerSize);
    dividerPage.drawText(dividerText, {
      x: (PAGE_W - dividerWidth) / 2,
      y: PAGE_H / 2,
      size: dividerSize,
      font: helveticaBold,
      color: rgb(0.2, 0.2, 0.4),
    });
    for (const imgBytes of images) {
      if (!imgBytes) continue;
      try {
        const image = await pdfDoc.embedPng(imgBytes);
        const colorPage = pdfDoc.addPage([PAGE_W, PAGE_H]);
        const imgDims = image.scaleToFit(PAGE_W - 36, PAGE_H - 36);
        colorPage.drawImage(image, {
          x: (PAGE_W - imgDims.width) / 2,
          y: (PAGE_H - imgDims.height) / 2,
          width: imgDims.width,
          height: imgDims.height,
        });
      } catch (e) {
        console.error("Failed to embed coloring image:", e);
      }
    }
  };

  // ── Scene coloring pages (ALWAYS included free — one per story scene) ──
  await renderColoringSection("Your Story Coloring Pages", coloringImages);

  // ── Bonus Coloring Book (paid add-on: extra pages across random themes) ──
  if (hasBonusColoringBook) {
    await renderColoringSection("Bonus Coloring Book", bonusColoringImages);
  }

  return { pdf: await pdfDoc.save(), pageTexts };
}

// ── Main Handler ──
function getServerKeys(): string[] {
  const keys = [Deno.env.get("LOVABLE_API_KEY"), Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")];
  const secretKeys = Deno.env.get("SUPABASE_SECRET_KEYS");
  if (secretKeys) {
    try {
      const parsed = JSON.parse(secretKeys);
      if (Array.isArray(parsed)) keys.push(...parsed);
      else if (typeof parsed === "string") keys.push(parsed);
      else if (parsed && typeof parsed === "object") keys.push(...Object.values(parsed).filter((v): v is string => typeof v === "string"));
    } catch {
      keys.push(...secretKeys.split(/[\n,]/));
    }
  }
  return keys.map((k) => k?.trim()).filter((k): k is string => Boolean(k));
}

function isAuthorized(authHeader: string | null): boolean {
  if (!authHeader?.startsWith("Bearer ")) return false;
  const token = authHeader.slice("Bearer ".length).trim();
  return getServerKeys().includes(token);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  // Server-to-server only — accept any configured server key
  if (!isAuthorized(req.headers.get("Authorization"))) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (!LOVABLE_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return new Response(
      JSON.stringify({ error: "Server configuration error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  try {
    const {
      orderId: incomingOrderId,
      title,
      story,
      coloringPrompts,
      bonusColoringPrompts,
      illustrationPrompts,
      selectedAddons,
      customerEmail,
      childName,
      childAge,
      theme,
      strength,
      hasSupportingCharacter,
      supportingCharacterName,
      reuseImages,
      // Internal: set when this run is a follow-up pass that fills in images the
      // previous pass ran out of time for.
      resumePass,
      suppressEmail,
    } = await req.json();

    if (!title || !story) {
      return new Response(
        JSON.stringify({ error: "Missing story data" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // NOTE: scene-derived coloring pages (one per story scene) are ALWAYS included
    // free with every storybook. `addons.coloring` gates the PAID bonus coloring
    // book (8 extra pages with the child across random themes).
    let orderId: string | undefined = incomingOrderId;

    // A resume pass fills in images the previous pass ran out of room for. The
    // customer already has a working PDF at their delivery link, so a resume pass
    // must NEVER move the order out of "complete" — if it crashes on a platform
    // limit the order would otherwise hang on "in progress" forever.
    const isResume = (Number(resumePass) || 0) > 0;
    let imagesThisPass = 0;
    const canGenerate = (label: string): boolean => {
      if (creditsExhausted) return false;
      if (imagesThisPass >= IMAGES_PER_PASS) {
        console.log(`[${label}] deferring to next pass — ${IMAGES_PER_PASS} images already made this pass`);
        return false;
      }
      return hasImageBudget(imageDeadlineMs, label);
    };


    // Merge with whatever is already on the order. An upsell purchase can land
    // mid-generation and set audiobook/coloring on the row — overwriting with the
    // snapshot passed in by the caller would silently drop a paid add-on.
    let existingAddons: Record<string, unknown> = {};
    if (orderId) {
      const { data: existingOrder } = await supabase
        .from("storybook_orders")
        .select("selected_addons")
        .eq("id", orderId)
        .maybeSingle();
      existingAddons = ((existingOrder as any)?.selected_addons || {}) as Record<string, unknown>;
    }

    const addons: Record<string, any> = {
      illustrations: true,
      coloring: false,
      character: false,
      audiobook: false,
      ...existingAddons,
      ...(selectedAddons || {}),
      // paid flags are sticky — never downgrade a purchased add-on
      coloring: !!(existingAddons as any).coloring || !!(selectedAddons || {}).coloring,
      audiobook: !!(existingAddons as any).audiobook || !!(selectedAddons || {}).audiobook,
    };

    // If we were given an existing pending order, update it. Otherwise create new (legacy in-browser flow).
    if (orderId) {
      const { error: updateError } = await supabase
        .from("storybook_orders")
        .update({
          story_title: title,
          story_text: story,
          coloring_prompts: coloringPrompts || null,
          illustration_prompts: illustrationPrompts || null,
          selected_addons: addons,
          // Resume passes leave status untouched so a delivered book stays "complete".
          ...(isResume ? {} : { status: "generating_images" }),
        })
        .eq("id", orderId);

      if (updateError) console.error("Order update failed:", updateError);
    } else {
      const { data: order, error: orderError } = await supabase
        .from("storybook_orders")
        .insert({
          customer_email: customerEmail || null,
          child_name: childName,
          child_age: childAge,
          theme,
          strength: strength || null,
          has_supporting_character: !!hasSupportingCharacter,
          supporting_character_name: supportingCharacterName || null,
          story_title: title,
          story_text: story,
          coloring_prompts: coloringPrompts || null,
          illustration_prompts: illustrationPrompts || null,
          selected_addons: addons,
          status: "generating_images",
        })
        .select("id")
        .single();
      if (orderError) console.error("Order creation failed:", orderError);
      orderId = order?.id;
    }

    // Generate illustrations + coloring pages in parallel where requested
    console.log("Generating images...", { addons });
    const imageDeadlineMs = Date.now() + IMAGE_GENERATION_BUDGET_MS;

    // Load the customer's reference photos (if any) so the AI uses them for likeness
    let mainPhotoRef: string | null = null;
    let supportingPhotoRef: string | null = null;
    if (orderId) {
      const { data: orderRow } = await supabase
        .from("storybook_orders")
        .select("child_photo_path, supporting_character_photo_path")
        .eq("id", orderId)
        .maybeSingle();
      if (orderRow) {
        mainPhotoRef = await photoPathToDataUrl(supabase, orderRow.child_photo_path);
        supportingPhotoRef = await photoPathToDataUrl(supabase, orderRow.supporting_character_photo_path);
      }
    }
    console.log("Photo refs:", { hasMain: !!mainPhotoRef, hasSupporting: !!supportingPhotoRef });

    // Images are generated sequentially below (parallel multimodal generations
    // exhaust the edge worker), skipping anything already stored for this order.



    // When rebuilding an already-generated book (e.g. bonus coloring bought on the
    // upsell page), reuse the illustrations and scene coloring pages already in
    // storage instead of paying to regenerate them.
    const loadStored = async (path: string): Promise<Uint8Array | null> => {
      if (!path) return null;
      const { data, error } = await supabase.storage.from("storybooks").download(path);
      if (error || !data) return null;
      return new Uint8Array(await data.arrayBuffer());
    };

    let illustrationImages: (Uint8Array | null)[] = [];
    let coloringImages: (Uint8Array | null)[] = [];
    const newIllustrationIdx = new Set<number>();
    const newColoringIdx = new Set<number>();

    // Load anything this order already has in storage. The edge runtime kills a
    // request at 150s, which isn't enough for 7+ AI images, so a run generates
    // what it can, then re-invokes itself to fill the gaps (see resume trigger
    // at the end). Loading first means no image is ever paid for twice.
    if (orderId) {
      const { data: paths } = await supabase
        .from("storybook_orders")
        .select("illustration_storage_paths")
        .eq("id", orderId)
        .maybeSingle();
      const storedPaths = (((paths as any)?.illustration_storage_paths || []) as string[]);
      const expectedIll = Math.min(5, illustrationPrompts?.length || 5);
      illustrationImages = await Promise.all(
        Array.from({ length: expectedIll }, (_, i) =>
          loadStored(storedPaths[i] || `${orderId}/illustration-${i + 1}.png`),
        ),
      );
      coloringImages = await Promise.all(
        (coloringPrompts || []).map((_: string, i: number) => loadStored(`${orderId}/coloring-${i + 1}.png`)),
      );
      console.log(
        `Existing images found: ${illustrationImages.filter(Boolean).length} illustrations, ${coloringImages.filter(Boolean).length} scene coloring`,
      );
    }

    // Generate only the missing illustrations
    if (addons.illustrations && illustrationPrompts?.length) {
      for (let i = 0; i < Math.min(5, illustrationPrompts.length); i++) {
        if (illustrationImages[i]) continue;
        if (!canGenerate(`illustration ${i + 1}`)) continue;
        const refs = refsForPage(i, mainPhotoRef, supportingPhotoRef);
        imagesThisPass++;
        const img = await generateImage(
          withLikenessLock(illustrationPrompts[i], refs.length > 0),
          LOVABLE_API_KEY,
          refs,
          `illustration ${i + 1}`,
        );
        illustrationImages[i] = img;
        if (img) newIllustrationIdx.add(i);
        await new Promise((r) => setTimeout(r, 400));
      }
    }
    while (illustrationImages.length < 5) illustrationImages.push(null);

    // Generate only the missing scene coloring pages
    for (let i = 0; i < (coloringPrompts?.length || 0); i++) {
      if (coloringImages[i]) continue;
      if (!canGenerate(`scene-coloring ${i + 1}`)) continue;
      const illusRef = bytesToDataUrl(illustrationImages[i] || null, "image/png");
      const refs = illusRef ? [illusRef] : (mainPhotoRef ? [mainPhotoRef] : []);
      imagesThisPass++;
      const img = await generateImage(
        withColoringLock(coloringPrompts[i], refs.length > 0, childAge),
        LOVABLE_API_KEY,
        refs,
        `scene-coloring ${i + 1}`,
      );
      coloringImages[i] = img;
      if (img) newColoringIdx.add(i);
      await new Promise((r) => setTimeout(r, 400));
    }

    // Bonus coloring book (paid add-on): 8 extra pages, only when addons.coloring.
    // If coloring was purchased after the story was generated, the caller may not
    // have bonus prompts — derive a themed fallback set so the paid pages exist.
    const effectiveBonusPrompts: string[] = (bonusColoringPrompts?.length ? bonusColoringPrompts : (
      addons.coloring
        ? [
            "outer space rocket launch",
            "deep ocean discovery",
            "dinosaur jungle path",
            "superhero city helper moment",
            "medieval castle garden",
            "race car track celebration",
            "pirate ship treasure map",
            "enchanted forest picnic",
          ].map((scene) =>
            `Black and white coloring page line art, thick bold outlines, printable, no shading. Bonus scene: ${childName} in a ${scene}. Clean white background, no grayscale, no color, no text.`
          )
        : []
    )) as string[];
    // Bonus pages are persisted too, so a resume pass only makes the missing ones.
    const bonusColoringImages: (Uint8Array | null)[] = [];
    const newBonusIdx = new Set<number>();
    if (addons.coloring && effectiveBonusPrompts.length) {
      if (orderId) {
        const existingBonus = await Promise.all(
          effectiveBonusPrompts.map((_: string, i: number) => loadStored(`${orderId}/bonus-coloring-${i + 1}.png`)),
        );
        existingBonus.forEach((img, i) => (bonusColoringImages[i] = img));
      }
      for (let i = 0; i < effectiveBonusPrompts.length; i++) {
        if (bonusColoringImages[i]) continue;
        if (!canGenerate(`bonus-coloring ${i + 1}`)) continue;
        const refs = mainPhotoRef ? [mainPhotoRef] : [];
        imagesThisPass++;
        const img = await generateImage(
          withColoringLock(effectiveBonusPrompts[i], refs.length > 0, childAge),
          LOVABLE_API_KEY,
          refs,
          `bonus-coloring ${i + 1}`,
        );
        bonusColoringImages[i] = img;
        if (img) newBonusIdx.add(i);
        await new Promise((r) => setTimeout(r, 400));
      }
    }


    const illustrationCount = illustrationImages.filter(Boolean).length;
    const coloringCount = coloringImages.filter(Boolean).length;
    const bonusColoringCount = bonusColoringImages.filter(Boolean).length;

    const expectedIllustrations = addons.illustrations ? (illustrationPrompts?.length || 0) : 0;
    const expectedColoring = coloringPrompts?.length || 0;
    const expectedBonusColoring = addons.coloring ? (effectiveBonusPrompts?.length || 0) : 0;
    console.log(
      `Generated ${illustrationCount}/${expectedIllustrations || 5} illustrations, ` +
        `${coloringCount}/${expectedColoring} scene coloring, ` +
        `${bonusColoringCount}/${expectedBonusColoring} bonus coloring`
    );

    // Upload illustrations to storage so the audiobook reader can show them.
    // Trim to the actual expected scene count so diagnostics aren't padded with empty slots.
    const illustrationPaths: string[] = [];
    if (orderId && addons.illustrations) {
      const uploadCount = expectedIllustrations || illustrationImages.length;
      for (let i = 0; i < uploadCount; i++) {
        const img = illustrationImages[i];
        if (!img) {
          illustrationPaths.push("");
          continue;
        }
        const path = `${orderId}/illustration-${i + 1}.png`;
        const { error: upErr } = await supabase.storage
          .from("storybooks")
          .upload(path, img, { contentType: "image/png", upsert: true });
        if (upErr) {
          console.error("Illustration upload failed:", upErr);
          illustrationPaths.push("");
        } else {
          illustrationPaths.push(path);
        }
      }
    }

    // Persist newly made coloring pages (scene + bonus) so a resume pass or a
    // later rebuild never pays to regenerate them.
    if (orderId) {
      for (const i of newColoringIdx) {
        const img = coloringImages[i];
        if (!img) continue;
        const { error: colErr } = await supabase.storage
          .from("storybooks")
          .upload(`${orderId}/coloring-${i + 1}.png`, img, { contentType: "image/png", upsert: true });
        if (colErr) console.error("Coloring page upload failed:", colErr);
      }
      for (const i of newBonusIdx) {
        const img = bonusColoringImages[i];
        if (!img) continue;
        const { error: bErr } = await supabase.storage
          .from("storybooks")
          .upload(`${orderId}/bonus-coloring-${i + 1}.png`, img, { contentType: "image/png", upsert: true });
        if (bErr) console.error("Bonus coloring upload failed:", bErr);
      }
    }


    // A resume pass that produced nothing new has no reason to rebuild the PDF —
    // re-embedding every image is what blew the platform CPU limit and left orders
    // stuck. Record why and leave the delivered book exactly as it is.
    const newImagesThisPass = newIllustrationIdx.size + newColoringIdx.size + newBonusIdx.size;
    if (isResume && newImagesThisPass === 0) {
      console.warn(`Resume pass ${resumePass} produced no new images — leaving existing PDF untouched`);
      if (orderId) {
        await supabase
          .from("storybook_orders")
          .update({
            illustration_storage_paths: illustrationPaths,
            failure_category: creditsExhausted ? "ai_credits_exhausted" : "image_generation_partial",
            failure_hint: creditsExhausted
              ? "AI image generation was refused for insufficient credits. Top up credits, then retry this order to fill in the missing pictures."
              : "A follow-up image pass produced no new pictures. The delivered PDF is unchanged; retry the order to try again.",
          })
          .eq("id", orderId);
      }
      return new Response(
        JSON.stringify({ success: true, orderId, noNewImages: true, creditsExhausted }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (orderId) {
      await supabase
        .from("storybook_orders")
        .update({
          // Never move a delivered order back to "in progress" on a resume pass.
          ...(isResume ? {} : { status: "assembling_pdf" }),
          illustration_storage_paths: illustrationPaths,
        })
        .eq("id", orderId);
    }



    // Build PDF — scene coloring pages always included; bonus book appended when purchased
    console.log("Assembling PDF...");
    const { pdf: pdfBytes, pageTexts } = await buildStorybookPDF(
      title,
      story,
      illustrationImages,
      coloringImages,
      bonusColoringImages,
      addons.illustrations,
      addons.coloring
    );

    // If audiobook purchased, seed the storybook_audio table with page text and
    // fire the generate-audiobook function (non-blocking background task).
    // Guard against duplicate seeding when this order is rebuilt (e.g. a bonus
    // coloring add-on purchased after the first PDF was assembled).
    let audioSeeded = false;
    if (orderId && addons.audiobook && pageTexts.length) {
      const { count: existingAudio } = await supabase
        .from("storybook_audio")
        .select("id", { count: "exact", head: true })
        .eq("order_id", orderId);
      if ((existingAudio || 0) > 0) {
        audioSeeded = true;
        console.log(`Audio rows already exist for ${orderId} — skipping seed`);
      } else {
        const audioRows = pageTexts.map((text, i) => ({
          order_id: orderId,
          page_number: i + 1,
          page_text: text,
        }));
        const { error: audioErr } = await supabase.from("storybook_audio").insert(audioRows);
        if (audioErr) {
          console.error("Audio seed failed:", audioErr);
        } else {
          audioSeeded = true;
          // Kick off ElevenLabs TTS generation in the background — do not await.
          // The Library page polls until pages become ready.
          fetch(`${SUPABASE_URL}/functions/v1/generate-audiobook`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            },
            body: JSON.stringify({ orderId }),
          }).catch((e) => console.error("generate-audiobook trigger failed:", e));
        }
      }
    }

    // Upload PDF
    const fileName = `${orderId || crypto.randomUUID()}.pdf`;
    const { error: uploadError } = await supabase.storage
      .from("storybooks")
      .upload(fileName, pdfBytes, { contentType: "application/pdf", upsert: true });

    if (uploadError) throw new Error(`PDF upload failed: ${uploadError.message}`);

    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from("storybooks")
      .createSignedUrl(fileName, 60 * 60 * 24 * 7);

    if (signedUrlError || !signedUrlData?.signedUrl) {
      throw new Error(`Failed to create signed URL: ${signedUrlError?.message}`);
    }

    const pdfUrl = signedUrlData.signedUrl;

    if (orderId) {
      // Safety net: if we didn't render the full expected count, flag the order for review
      // instead of silently marking it complete. PDF + email still go through as today.
      const illustrationsShort = addons.illustrations && illustrationCount < expectedIllustrations;
      const coloringShort = coloringCount < expectedColoring;
      const bonusShort = addons.coloring && bonusColoringCount < expectedBonusColoring;
      const finalStatus = "complete";
      if (illustrationsShort || coloringShort || bonusShort) {
        console.error(
          `Order ${orderId} completed with missing images: illustrations ${illustrationCount}/${expectedIllustrations}, scene coloring ${coloringCount}/${expectedColoring}, bonus coloring ${bonusColoringCount}/${expectedBonusColoring}`
        );
      }
      // Record which paid add-ons this build actually fulfilled so a later
      // upsell purchase knows whether it still needs work done.
      const { data: latest } = await supabase
        .from("storybook_orders")
        .select("selected_addons")
        .eq("id", orderId)
        .maybeSingle();
      const latestAddons = ((latest as any)?.selected_addons || addons) as Record<string, any>;
      const mergedAddons = {
        ...latestAddons,
        coloring: !!latestAddons.coloring || !!addons.coloring,
        audiobook: !!latestAddons.audiobook || !!addons.audiobook,
        addonFulfillment: {
          ...(latestAddons.addonFulfillment || {}),
          ...(bonusColoringCount > 0 && { coloring: true }),
          ...(audioSeeded && { audiobook: true }),
        },
      };

      const shortSomewhere = illustrationsShort || coloringShort || bonusShort;
      await supabase
        .from("storybook_orders")
        .update({
          status: finalStatus,
          pdf_storage_path: fileName,
          pdf_url: pdfUrl,
          completed_at: new Date().toISOString(),
          selected_addons: mergedAddons,
          failure_category: creditsExhausted
            ? "ai_credits_exhausted"
            : shortSomewhere ? "image_generation_partial" : null,
          failure_hint: creditsExhausted
            ? `AI image generation was refused for insufficient credits. Top up credits, then retry this order. Illustrations ${illustrationCount}/${expectedIllustrations}, scene coloring ${coloringCount}/${expectedColoring}, bonus coloring ${bonusColoringCount}/${expectedBonusColoring}.`
            : shortSomewhere
            ? `PDF delivered; remaining pictures are being filled in by follow-up passes. Illustrations ${illustrationCount}/${expectedIllustrations}, scene coloring ${coloringCount}/${expectedColoring}, bonus coloring ${bonusColoringCount}/${expectedBonusColoring}.`
            : null,
        })
        .eq("id", orderId);

    }


    console.log("Storybook complete!", pdfUrl);

    // Notification email (non-blocking). Resume passes skip it — the customer
    // already got their link, and the PDF at that link is replaced in place.
    if (!suppressEmail) {
      try {
        const notifyRes = await fetch(`${SUPABASE_URL}/functions/v1/send-order-notification`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
          },
          body: JSON.stringify({
            childName,
            childAge,
            theme,
            strength,
            customerEmail,
            supportingCharacterName,
            pdfUrl,
            orderId,
            selectedAddons: addons,
          }),
        });
        if (!notifyRes.ok) console.error("Notification failed:", await notifyRes.text());
      } catch (notifyErr) {
        console.error("Failed to send notification:", notifyErr);
      }
    }

    // Each pass only makes a small batch of images (IMAGES_PER_PASS) so it always
    // finishes inside the platform's time AND CPU limits. If pictures are still
    // missing, chain another pass that generates only the gaps (finished images are
    // reused from storage) and rebuilds the PDF at the same path, so the customer's
    // existing link picks up the complete book. Stop immediately if credits ran out.
    const stillShort =
      (addons.illustrations && illustrationCount < expectedIllustrations) ||
      coloringCount < expectedColoring ||
      (addons.coloring && bonusColoringCount < expectedBonusColoring);
    const pass = Number(resumePass) || 0;
    if (orderId && stillShort && !creditsExhausted && pass < 10) {
      console.log(`Scheduling resume pass ${pass + 1} for order ${orderId}`);

      const resume = fetch(`${SUPABASE_URL}/functions/v1/create-storybook`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${LOVABLE_API_KEY}` },
        body: JSON.stringify({
          orderId,
          title,
          story,
          coloringPrompts,
          bonusColoringPrompts,
          illustrationPrompts,
          selectedAddons,
          customerEmail,
          childName,
          childAge,
          theme,
          strength,
          hasSupportingCharacter,
          supportingCharacterName,
          resumePass: pass + 1,
          suppressEmail: true,
        }),
      }).catch((e) => console.error("resume pass trigger failed:", e));
      // @ts-ignore EdgeRuntime is provided by the Supabase edge runtime
      if (typeof EdgeRuntime !== "undefined") EdgeRuntime.waitUntil(resume);
    }


    return new Response(
      JSON.stringify({
        success: true,
        pdfUrl,
        orderId,
        illustrationsGenerated: illustrationCount,
        coloringPagesGenerated: coloringCount,
        bonusColoringPagesGenerated: bonusColoringCount,
        addons,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("create-storybook error:", e);
    return new Response(
      JSON.stringify({
        error: e instanceof Error ? e.message : "Failed to create storybook",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
