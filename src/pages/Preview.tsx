import { useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sparkles, Lock, Shield, ArrowLeft, Loader2 } from "lucide-react";
import SEO from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Storybook page 1 images per theme (served from /public)
const THEME_BG: Record<string, string> = {
  "Fairy Tale": "/images/sample-page-1.jpg",
  "Ocean Adventure & Pirates": "/images/samples/ocean-1.jpg",
  "Prince & Princess": "/images/samples/prince-1.jpg",
  "Outer Space": "/images/samples/space-1.jpg",
  Dinosaurs: "/images/samples/dino-1.jpg",
};

export interface PreviewDraft {
  childName: string;
  theme: string;
  photoData: string | null; // base64 data-URL or null
  savedAt: number;
}

const DRAFT_KEY = "mestar-preview-draft";

function loadDraft(): PreviewDraft | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PreviewDraft;
    // Expire drafts older than 5 days
    if (Date.now() - parsed.savedAt > 5 * 24 * 60 * 60 * 1000) {
      localStorage.removeItem(DRAFT_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

/** Draws a composite canvas: storybook page 1 + child photo circle overlay */
async function drawComposite(
  canvas: HTMLCanvasElement,
  bgSrc: string,
  childSrc: string | null,
  childName: string,
): Promise<void> {
  const SIZE = 800;
  canvas.width = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const loadImg = (src: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });

  // Draw background
  const bg = await loadImg(bgSrc);
  ctx.drawImage(bg, 0, 0, SIZE, SIZE);

  // Semi-transparent vignette at the character face area (top-right region)
  const cx = SIZE * 0.73;
  const cy = SIZE * 0.28;
  const r = SIZE * 0.15;

  if (childSrc) {
    try {
      const childImg = await loadImg(childSrc);
      // Clipping circle for child photo
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.clip();
      // Draw child photo centred & scaled to fill the circle
      const side = r * 2;
      const sx = cx - r;
      const sy = cy - r;
      const scale = Math.max(side / childImg.width, side / childImg.height);
      const sw = childImg.width * scale;
      const sh = childImg.height * scale;
      ctx.drawImage(childImg, sx - (sw - side) / 2, sy - (sh - side) / 2, sw, sh);
      ctx.restore();

      // Gold border ring
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = "hsl(43 90% 62%)";
      ctx.lineWidth = SIZE * 0.012;
      ctx.stroke();

      // Sparkle dots around ring
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const dx = cx + Math.cos(angle) * (r + SIZE * 0.022);
        const dy = cy + Math.sin(angle) * (r + SIZE * 0.022);
        ctx.beginPath();
        ctx.arc(dx, dy, SIZE * 0.01, 0, Math.PI * 2);
        ctx.fillStyle = "hsl(43 90% 75%)";
        ctx.fill();
      }
    } catch {
      // If child photo fails to load, just show a golden placeholder circle
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fillStyle = "hsl(43 75% 62% / 0.35)";
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = "hsl(43 90% 62%)";
      ctx.lineWidth = SIZE * 0.012;
      ctx.stroke();
      ctx.fillStyle = "hsl(43 90% 90%)";
      ctx.font = `bold ${SIZE * 0.05}px 'Baloo 2', cursive`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(childName.slice(0, 2).toUpperCase(), cx, cy);
    }
  }

  // "PREVIEW" diagonal watermark
  ctx.save();
  ctx.translate(SIZE / 2, SIZE / 2);
  ctx.rotate(-Math.PI / 5);
  ctx.font = `bold ${SIZE * 0.1}px 'Baloo 2', cursive`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.strokeStyle = "hsl(43 90% 62% / 0.5)";
  ctx.lineWidth = 2;
  ctx.strokeText("PREVIEW", 0, 0);
  ctx.fillStyle = "hsl(43 90% 62% / 0.18)";
  ctx.fillText("PREVIEW", 0, 0);
  ctx.restore();

  // Child name banner at the bottom
  const bannerH = SIZE * 0.08;
  ctx.fillStyle = "hsl(220 20% 10% / 0.75)";
  ctx.fillRect(0, SIZE - bannerH, SIZE, bannerH);
  ctx.fillStyle = "hsl(43 90% 90%)";
  ctx.font = `bold ${bannerH * 0.52}px 'Baloo 2', cursive`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(`${childName}'s Adventure Begins…`, SIZE / 2, SIZE - bannerH / 2);
}

const STRIPE_BASE_PRICE = import.meta.env.VITE_STRIPE_PRICE_BASE_STORY as string | undefined;

export default function Preview() {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [draft, setDraft] = useState<PreviewDraft | null>(null);
  const [rendering, setRendering] = useState(true);
  const [unlocking, setUnlocking] = useState(false);

  useEffect(() => {
    const d = loadDraft();
    if (!d) {
      navigate("/", { replace: true });
      return;
    }
    setDraft(d);
  }, [navigate]);

  useEffect(() => {
    if (!draft || !canvasRef.current) return;
    const bg = THEME_BG[draft.theme] ?? THEME_BG["Fairy Tale"];
    setRendering(true);
    drawComposite(canvasRef.current, bg, draft.photoData, draft.childName)
      .catch(console.error)
      .finally(() => setRendering(false));
  }, [draft]);

  const handleUnlock = async () => {
    if (!draft || unlocking) return;

    if (!STRIPE_BASE_PRICE) {
      navigate("/product/personalized-storybook#personalize");
      return;
    }

    setUnlocking(true);
    try {
      const { data: orderData, error } = await supabase.functions.invoke("create-pending-order", {
        body: {
          childName: draft.childName,
          childAge: "4-7",
          theme: draft.theme,
          strength: "",
          supportingCharacterName: "",
          hasSupportingCharacter: false,
          selectedAddons: { illustrations: true, coloring: true, character: false, audiobook: false },
          customerEmail: "",
          childPhotoDataUrl: draft.photoData,
          supportingCharacterPhotoDataUrl: null,
        },
      });

      if (error || !orderData?.orderId) {
        throw new Error(error?.message || "Order could not be created");
      }

      const orderId = orderData.orderId as string;
      const recoveryToken = (orderData as { recoveryToken?: string })?.recoveryToken || null;
      const pendingStory = {
        orderId,
        recoveryToken,
        childName: draft.childName,
        childAge: "4-7",
        theme: draft.theme,
        photoData: draft.photoData,
        photoUrl: draft.photoData,
        selectedAddons: { illustrations: true, coloring: true, character: false, audiobook: false },
        savedAt: Date.now(),
      };
      localStorage.setItem("mestar-pending-story", JSON.stringify(pendingStory));

      navigate(
        `/checkout?order_id=${orderId}&prices=${encodeURIComponent(STRIPE_BASE_PRICE)}&next=${encodeURIComponent("/upsell")}`,
      );
    } catch (error) {
      console.error("Preview checkout start failed:", error);
      toast.error("Could not start checkout. Please try again.", { position: "top-center" });
    } finally {
      setUnlocking(false);
    }
  };

  if (!draft) return null;

  const bgSrc = THEME_BG[draft.theme] ?? THEME_BG["Fairy Tale"];

  return (
    <div className="min-h-screen py-8">
      <SEO
        title={`${draft.childName}'s Storybook Preview — MESTAR`}
        description="See the first page of your child's personalized storybook before you buy."
        noindex
      />

      <div className="container max-w-4xl">
        {/* Back link */}
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>

        <div className="grid lg:grid-cols-2 gap-10 items-start">
          {/* ── Canvas Preview ── */}
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden border-2 border-primary/40 shadow-2xl shadow-primary/20">
              {rendering && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-card/80 backdrop-blur-sm rounded-2xl">
                  <Loader2 className="h-10 w-10 animate-spin text-primary" />
                </div>
              )}
              {/* Shimmer overlay while rendering */}
              {rendering && <div className="absolute inset-0 z-20 preview-shimmer rounded-2xl" />}

              {/* Canvas — hidden while rendering, shown once done */}
              <canvas
                ref={canvasRef}
                className="w-full aspect-square object-cover"
                style={{ display: rendering ? "none" : "block" }}
              />

              {/* Fallback background image while canvas is generating */}
              {rendering && (
                <img
                  src={bgSrc}
                  alt="Storybook preview background"
                  className="w-full aspect-square object-cover"
                />
              )}

              {/* Locked pages overlay badge */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-background/90 backdrop-blur-sm border border-border rounded-full px-4 py-2 shadow-lg">
                <Lock className="h-4 w-4 text-primary" />
                <span className="text-xs font-bold text-foreground">Page 1 of 20+ — Unlock to read all</span>
              </div>
            </div>

            {/* Page dots */}
            <div className="flex justify-center gap-1.5 mt-4">
              <div className="w-6 h-2 rounded-full bg-primary" />
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="w-2 h-2 rounded-full bg-muted-foreground/30" />
              ))}
              <div className="text-xs text-muted-foreground self-center ml-1">+15 more pages</div>
            </div>
          </div>

          {/* ── Right Panel ── */}
          <div className="flex flex-col gap-6">
            {/* Header */}
            <div>
              <div className="inline-flex items-center gap-2 bg-primary/20 border border-primary/30 rounded-full px-3 py-1.5 mb-3">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-bold text-primary uppercase tracking-wider">Free Preview</span>
              </div>
              <h1 className="font-display text-3xl md:text-4xl font-extrabold mb-3 leading-tight">
                {draft.childName}'s
                <br />
                <span className="text-primary">
                  {draft.theme} Adventure
                </span>
              </h1>
              <p className="text-muted-foreground leading-relaxed">
                This is Page&nbsp;1 of your personalised storybook. Unlock all&nbsp;20+ pages, custom illustrations, and printable coloring pages — starring&nbsp;
                <strong className="text-foreground">{draft.childName}</strong> as the hero.
              </p>
            </div>

            {/* What's included card */}
            <div className="bg-card rounded-2xl border border-border p-5 space-y-3">
              <p className="font-display font-bold text-sm uppercase tracking-wider text-muted-foreground">
                Included in your $19.99 storybook
              </p>
              {[
                "20+ page personalised story featuring " + draft.childName,
                "Full-colour AI-illustrated scenes",
                "Printable coloring pages (one per scene)",
                "Instant downloadable PDF",
                "Your child's photo woven into every page",
              ].map((item) => (
                <div key={item} className="flex items-start gap-2.5">
                  <Sparkles className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <span className="text-sm text-foreground">{item}</span>
                </div>
              ))}
            </div>

            {/* Unlock CTA */}
            <Button
              onClick={handleUnlock}
              disabled={unlocking}
              size="lg"
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-display text-lg rounded-full py-7 shadow-xl shadow-primary/30 hover:scale-105 transition-all duration-300"
            >
              {unlocking ? <Loader2 className="h-5 w-5 mr-2 animate-spin" /> : <Lock className="h-5 w-5 mr-2" />}
              {unlocking ? "Starting Secure Checkout…" : "Unlock Full Bedtime Adventure — $19.99"}
            </Button>

            {/* Trust footer */}
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Shield className="h-3.5 w-3.5 text-primary" />
              <span>Secure checkout &mdash; one-time payment &mdash; instant PDF download</span>
            </div>
            <p className="text-[10px] text-center text-muted-foreground/60">
              Your photo is stored privately and automatically deleted after 5&nbsp;days.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
