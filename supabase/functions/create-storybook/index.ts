import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { PDFDocument, rgb, StandardFonts } from "https://esm.sh/pdf-lib@1.17.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ── Image Generation ──────────────────────────────────────────────

async function generateColoringImage(
  prompt: string,
  apiKey: string
): Promise<Uint8Array | null> {
  try {
    const res = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
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
      }
    );

    if (!res.ok) {
      console.error("Image gen failed:", res.status, await res.text());
      return null;
    }

    const data = await res.json();
    const dataUrl =
      data.choices?.[0]?.message?.images?.[0]?.image_url?.url as
        | string
        | undefined;
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

// ── Text Wrapping Helper ──────────────────────────────────────────

function wrapText(
  text: string,
  font: any,
  fontSize: number,
  maxWidth: number
): string[] {
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

// ── PDF Builder ───────────────────────────────────────────────────

async function buildStorybookPDF(
  title: string,
  storyText: string,
  imageDataArrays: (Uint8Array | null)[]
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const PAGE_W = 612; // Letter width in points
  const PAGE_H = 792; // Letter height in points
  const MARGIN = 54; // 0.75 inch
  const TEXT_W = PAGE_W - MARGIN * 2;

  // ── Cover Page ──
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

  // ── Story Pages ──
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

  // ── Coloring Pages ──
  // Add a divider page
  const dividerPage = pdfDoc.addPage([PAGE_W, PAGE_H]);
  const dividerText = "✏️ Bonus Coloring Pages ✏️";
  const dividerSize = 28;
  const dividerWidth = helveticaBold.widthOfTextAtSize(dividerText, dividerSize);
  dividerPage.drawText(dividerText, {
    x: (PAGE_W - dividerWidth) / 2,
    y: PAGE_H / 2,
    size: dividerSize,
    font: helveticaBold,
    color: rgb(0.2, 0.2, 0.4),
  });

  for (const imgBytes of imageDataArrays) {
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
      console.error("Failed to embed image:", e);
    }
  }

  return await pdfDoc.save();
}

// ── Main Handler ──────────────────────────────────────────────────

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!LOVABLE_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return new Response(
      JSON.stringify({ error: "Server configuration error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  try {
    const {
      title,
      story,
      coloringPrompts,
      customerEmail,
      childName,
      childAge,
      theme,
      strength,
      hasSupportingCharacter,
      supportingCharacterName,
    } = await req.json();

    if (!title || !story || !coloringPrompts?.length) {
      return new Response(
        JSON.stringify({ error: "Missing story data" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create order record
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
        coloring_prompts: coloringPrompts,
        status: "generating_images",
      })
      .select("id")
      .single();

    if (orderError) {
      console.error("Order creation failed:", orderError);
    }

    const orderId = order?.id;

    // Generate all 5 coloring page images in parallel
    console.log("Generating 5 coloring page images...");
    const imagePromises = coloringPrompts
      .slice(0, 5)
      .map((prompt: string) => generateColoringImage(prompt, LOVABLE_API_KEY));

    const images = await Promise.all(imagePromises);
    const successCount = images.filter(Boolean).length;
    console.log(`Generated ${successCount}/5 coloring page images`);

    // Update status
    if (orderId) {
      await supabase
        .from("storybook_orders")
        .update({ status: "assembling_pdf" })
        .eq("id", orderId);
    }

    // Build PDF
    console.log("Assembling PDF...");
    const pdfBytes = await buildStorybookPDF(title, story, images);

    // Upload to storage
    const fileName = `${orderId || crypto.randomUUID()}.pdf`;
    const { error: uploadError } = await supabase.storage
      .from("storybooks")
      .upload(fileName, pdfBytes, {
        contentType: "application/pdf",
        upsert: false,
      });

    if (uploadError) {
      throw new Error(`PDF upload failed: ${uploadError.message}`);
    }

    const { data: urlData } = supabase.storage
      .from("storybooks")
      .getPublicUrl(fileName);

    // Update order as complete
    if (orderId) {
      await supabase
        .from("storybook_orders")
        .update({
          status: "complete",
          pdf_storage_path: fileName,
          completed_at: new Date().toISOString(),
        })
        .eq("id", orderId);
    }

    console.log("Storybook complete!", urlData.publicUrl);

    return new Response(
      JSON.stringify({
        success: true,
        pdfUrl: urlData.publicUrl,
        orderId,
        imagesGenerated: successCount,
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
