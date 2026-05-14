import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { PDFDocument, rgb, StandardFonts } from "https://esm.sh/pdf-lib@1.17.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ── AI Image Generation (works for both color illustrations and B&W coloring pages) ──
async function generateImage(prompt: string, apiKey: string): Promise<Uint8Array | null> {
  try {
    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3.1-flash-image-preview",
        messages: [{ role: "user", content: prompt }],
        modalities: ["image", "text"],
      }),
    });

    if (!res.ok) {
      console.error("Image gen failed:", res.status, await res.text());
      return null;
    }

    const data = await res.json();
    const dataUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url as string | undefined;
    if (!dataUrl) return null;

    const base64 = dataUrl.split(",")[1];
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
  } catch (e) {
    console.error("Image gen error:", e);
    return null;
  }
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
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  // Service-role auth: this function is server-to-server only
  const authHeader = req.headers.get("Authorization");
  if (!SUPABASE_SERVICE_ROLE_KEY || authHeader !== `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`) {
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

    const addons = {
      illustrations: true,
      coloring: false,
      character: false,
      ...(selectedAddons || {}),
      audiobook: false, // audiobook deferred to separate app
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

    const illustrationPromises = addons.illustrations && illustrationPrompts?.length
      ? illustrationPrompts.slice(0, 5).map((p: string) => generateImage(p, LOVABLE_API_KEY))
      : Array(5).fill(Promise.resolve(null));

    const coloringPromises = addons.coloring && coloringPrompts?.length
      ? coloringPrompts.slice(0, 5).map((p: string) => generateImage(p, LOVABLE_API_KEY))
      : Array(5).fill(Promise.resolve(null));

    const [illustrationImages, coloringImages] = await Promise.all([
      Promise.all(illustrationPromises),
      Promise.all(coloringPromises),
    ]);

    const illustrationCount = illustrationImages.filter(Boolean).length;
    const coloringCount = coloringImages.filter(Boolean).length;
    console.log(`Generated ${illustrationCount}/5 illustrations, ${coloringCount}/5 coloring pages`);

    // Upload illustrations to storage so the audiobook reader can show them
    const illustrationPaths: string[] = [];
    if (orderId && addons.illustrations) {
      for (let i = 0; i < illustrationImages.length; i++) {
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

    // Build PDF
    console.log("Assembling PDF...");
    const { pdf: pdfBytes, pageTexts } = await buildStorybookPDF(
      title,
      story,
      illustrationImages,
      coloringImages,
      addons.illustrations,
      addons.coloring
    );

    // If audiobook purchased, seed the storybook_audio table with page text (audio comes later)
    if (orderId && addons.audiobook && pageTexts.length) {
      const audioRows = pageTexts.map((text, i) => ({
        order_id: orderId,
        page_number: i + 1,
        page_text: text,
      }));
      const { error: audioErr } = await supabase.from("storybook_audio").insert(audioRows);
      if (audioErr) console.error("Audio seed failed:", audioErr);
    }

    // Upload PDF
    const fileName = `${orderId || crypto.randomUUID()}.pdf`;
    const { error: uploadError } = await supabase.storage
      .from("storybooks")
      .upload(fileName, pdfBytes, { contentType: "application/pdf", upsert: false });

    if (uploadError) throw new Error(`PDF upload failed: ${uploadError.message}`);

    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from("storybooks")
      .createSignedUrl(fileName, 60 * 60 * 24 * 7);

    if (signedUrlError || !signedUrlData?.signedUrl) {
      throw new Error(`Failed to create signed URL: ${signedUrlError?.message}`);
    }

    const pdfUrl = signedUrlData.signedUrl;

    if (orderId) {
      await supabase
        .from("storybook_orders")
        .update({
          status: "complete",
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
