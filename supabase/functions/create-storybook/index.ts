import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { PDFDocument, rgb, StandardFonts } from "https://esm.sh/pdf-lib@1.17.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

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

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
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

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error(`[${label}] image gen HTTP ${res.status}: ${body.slice(0, 300)}`);
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
    // Up to 3 retries on 429 with backoff 1.5s → 4s → 10s, then give up gracefully (returns null).
    const retryWaits = [1500, 4000, 10000];
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
  hasIllustrations: boolean,
  hasColoring: boolean
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

  // ── Coloring Pages (if purchased) ──
  if (hasColoring && coloringImages.some(Boolean)) {
    const dividerPage = pdfDoc.addPage([PAGE_W, PAGE_H]);
    const dividerText = "Bonus Coloring Pages";
    const dividerSize = 28;
    const dividerWidth = helveticaBold.widthOfTextAtSize(dividerText, dividerSize);
    dividerPage.drawText(dividerText, {
      x: (PAGE_W - dividerWidth) / 2,
      y: PAGE_H / 2,
      size: dividerSize,
      font: helveticaBold,
      color: rgb(0.2, 0.2, 0.4),
    });

    for (const imgBytes of coloringImages) {
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
    const addons = {
      illustrations: true,
      coloring: false,
      character: false,
      audiobook: false,
      ...(selectedAddons || {}),
    };

    // If we were given an existing pending order, update it. Otherwise create new (legacy in-browser flow).
    let orderId: string | undefined = incomingOrderId;
    if (orderId) {
      const { error: updateError } = await supabase
        .from("storybook_orders")
        .update({
          story_title: title,
          story_text: story,
          coloring_prompts: coloringPrompts || null,
          illustration_prompts: illustrationPrompts || null,
          selected_addons: addons,
          status: "generating_images",
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

    // Run sequentially to stay within edge-function CPU/memory limits
    // (parallelizing 10 multimodal image generations exhausts the worker)
    const runIllustrations = async (
      enabled: boolean,
      prompts: string[] | undefined
    ): Promise<(Uint8Array | null)[]> => {
      const out: (Uint8Array | null)[] = [];
      if (!enabled || !prompts?.length) return Array(5).fill(null);
      for (let i = 0; i < Math.min(5, prompts.length); i++) {
        const refs = refsForPage(i, mainPhotoRef, supportingPhotoRef);
        const img = await generateImage(
          withLikenessLock(prompts[i], refs.length > 0),
          LOVABLE_API_KEY,
          refs,
          `illustration ${i + 1}/5`
        );
        out.push(img);
        await new Promise((r) => setTimeout(r, 400));
      }
      while (out.length < 5) out.push(null);
      return out;
    };

    // Scene coloring pages (ALWAYS free with every storybook).
    // Use the matching illustration as the reference for character consistency.
    const runColoring = async (
      prompts: string[] | undefined,
      illustrations: (Uint8Array | null)[],
      labelPrefix: string
    ): Promise<(Uint8Array | null)[]> => {
      const out: (Uint8Array | null)[] = [];
      if (!prompts?.length) return out;
      for (let i = 0; i < prompts.length; i++) {
        const illusRef = bytesToDataUrl(illustrations[i] || null, "image/png");
        // For bonus pages we don't have a matching illustration; fall back to the child photo
        const refs = illusRef ? [illusRef] : (mainPhotoRef ? [mainPhotoRef] : []);
        const img = await generateImage(
          withColoringLock(prompts[i], refs.length > 0, childAge),
          LOVABLE_API_KEY,
          refs,
          `${labelPrefix} ${i + 1}/${prompts.length}`
        );
        out.push(img);
        await new Promise((r) => setTimeout(r, 400));
      }
      return out;
    };

    const illustrationImages = await runIllustrations(addons.illustrations, illustrationPrompts);
    // Scene coloring pages: always generate, one per story scene
    const coloringImages = await runColoring(coloringPrompts, illustrationImages, "scene-coloring");
    // Bonus coloring book (paid add-on): 8 extra pages, only when addons.coloring
    const bonusColoringImages: (Uint8Array | null)[] = addons.coloring
      ? await runColoring(bonusColoringPrompts, [], "bonus-coloring")
      : [];

    const illustrationCount = illustrationImages.filter(Boolean).length;
    const coloringCount = coloringImages.filter(Boolean).length;
    const bonusColoringCount = bonusColoringImages.filter(Boolean).length;

    const expectedIllustrations = addons.illustrations ? (illustrationPrompts?.length || 0) : 0;
    const expectedColoring = coloringPrompts?.length || 0;
    const expectedBonusColoring = addons.coloring ? (bonusColoringPrompts?.length || 0) : 0;
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

    if (orderId) {
      await supabase
        .from("storybook_orders")
        .update({
          status: "assembling_pdf",
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
    // fire the generate-audiobook function (non-blocking background task)
    if (orderId && addons.audiobook && pageTexts.length) {
      const audioRows = pageTexts.map((text, i) => ({
        order_id: orderId,
        page_number: i + 1,
        page_text: text,
      }));
      const { error: audioErr } = await supabase.from("storybook_audio").insert(audioRows);
      if (audioErr) {
        console.error("Audio seed failed:", audioErr);
      } else {
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
      const finalStatus = illustrationsShort || coloringShort || bonusShort ? "needs_review" : "complete";
      if (finalStatus === "needs_review") {
        console.error(
          `Order ${orderId} flagged needs_review: illustrations ${illustrationCount}/${expectedIllustrations}, scene coloring ${coloringCount}/${expectedColoring}, bonus coloring ${bonusColoringCount}/${expectedBonusColoring}`
        );
      }
      await supabase
        .from("storybook_orders")
        .update({
          status: finalStatus,
          pdf_storage_path: fileName,
          pdf_url: pdfUrl,
          completed_at: new Date().toISOString(),
        })
        .eq("id", orderId);
    }


    console.log("Storybook complete!", pdfUrl);

    // Notification email (non-blocking)
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

    return new Response(
      JSON.stringify({
        success: true,
        pdfUrl,
        orderId,
        illustrationsGenerated: illustrationCount,
        coloringPagesGenerated: coloringCount,
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
