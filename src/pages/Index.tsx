import { useEffect, useState, useRef, useCallback, DragEvent, ChangeEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, Sparkles, BookOpen, Loader2, Shield, Download, FileText, Clock, CheckCircle2, Volume2, Upload, ImageIcon, X } from "lucide-react";
import { fetchProducts, ShopifyProduct } from "@/lib/shopify";
import StoryPreview from "@/components/StoryPreview";
import RealMagicShowcase from "@/components/RealMagicShowcase";
import izzyReal from "@/assets/izzy-real.jpg.asset.json";
import izzyStory from "@/assets/izzy-storybook.jpg";
import jaedanFishing from "@/assets/jaedan-fishing.jpg.asset.json";
import jaedanFishingStory from "@/assets/jaedan-fishing-story.jpg";
import jaedanCowboy from "@/assets/jaedan-cowboy.jpg.asset.json";
import jaedanCowboyStory from "@/assets/jaedan-cowboy-story.jpg";
import SEO from "@/components/SEO";
import { toast } from "sonner";
import type { PreviewDraft } from "./Preview";

const DRAFT_KEY = "mestar-preview-draft";

const STORY_THEMES = [
  "Fairy Tale",
  "Ocean Adventure & Pirates",
  "Prince & Princess",
  "Outer Space",
  "Dinosaurs",
];

// ── Demo crossfade data ──────────────────────────────────────────────────────

interface DemoSlide {
  childLabel: string;
  beforeSrc: string; // real parent-uploaded photo
  afterSrc: string;  // storybook hero version
  theme: string;
  icon: string;
}

const DEMO_SLIDES: DemoSlide[] = [
  {
    childLabel: "Izzy",
    beforeSrc: izzyReal.url,
    afterSrc: izzyStory,
    theme: "Fairy Tale",
    icon: "🧚",
  },
  {
    childLabel: "Jaedan",
    beforeSrc: jaedanFishing.url,
    afterSrc: jaedanFishingStory,
    theme: "Great Outdoors",
    icon: "🎣",
  },
  {
    childLabel: "Jaedan",
    beforeSrc: jaedanCowboy.url,
    afterSrc: jaedanCowboyStory,
    theme: "Wild West",
    icon: "🤠",
  },
];

/** Animated demo: cycles through 3 photo→storybook transformations */
const HeroDemo = () => {
  const [slideIdx, setSlideIdx] = useState(0);
  const [phase, setPhase] = useState<"before" | "transforming" | "after">("before");

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const cycle = () => {
      // before → transforming
      timer = setTimeout(() => {
        setPhase("transforming");
        // transforming → after
        timer = setTimeout(() => {
          setPhase("after");
          // after → next slide (before)
          timer = setTimeout(() => {
            setSlideIdx((prev) => (prev + 1) % DEMO_SLIDES.length);
            setPhase("before");
            cycle();
          }, 3200);
        }, 900);
      }, 3000);
    };
    cycle();
    return () => clearTimeout(timer);
  }, []);

  const slide = DEMO_SLIDES[slideIdx];

  return (
    <div className="relative w-full max-w-sm mx-auto select-none">
      {/* Main transformation frame */}
      <div className="relative aspect-square rounded-3xl overflow-hidden border-2 border-primary/40 shadow-2xl shadow-primary/20">
        {/* Before layer — real child photo */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center gap-3 transition-opacity duration-700 bg-background"
          style={{ opacity: phase === "before" ? 1 : 0 }}
        >
          <img
            src={slide.beforeSrc}
            alt={`${slide.childLabel} — real photo uploaded by parent`}
            className="absolute inset-0 w-full h-full object-cover"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/85 via-background/10 to-transparent" />
          <div className="relative z-10 mt-auto mb-4 text-center">
            <span className="font-display font-bold text-foreground text-lg drop-shadow">{slide.childLabel}'s Real Photo</span>
            <div className="text-xs text-muted-foreground">Tap to transform →</div>
          </div>
        </div>


        {/* Transforming shimmer layer */}
        <div
          className="absolute inset-0 transition-opacity duration-300 pointer-events-none"
          style={{
            background: "radial-gradient(circle, hsl(43 90% 62% / 0.6) 0%, hsl(220 20% 10%) 70%)",
            opacity: phase === "transforming" ? 1 : 0,
          }}
        >
          <div className="absolute inset-0 preview-shimmer" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles className="h-16 w-16 text-primary animate-pulse" />
          </div>
        </div>

        {/* After layer — storybook scene */}
        <div
          className="absolute inset-0 transition-opacity duration-700"
          style={{ opacity: phase === "after" ? 1 : 0 }}
        >
          <img
            src={slide.afterSrc}
            alt={`${slide.childLabel} in a ${slide.theme} storybook scene`}
            className="w-full h-full object-cover"
            loading="eager"
          />
          {/* Overlay badge */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background/90 to-transparent p-4">
            <p className="font-display text-base font-bold text-foreground text-center">
              {slide.icon} {slide.childLabel} — {slide.theme}
            </p>
          </div>
        </div>

        {/* Phase indicator pill */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-background/80 backdrop-blur-sm border border-border rounded-full px-3 py-1 text-[11px] font-bold z-10">
          {phase === "before" ? "📷 Child's Photo" : phase === "transforming" ? "✨ Transforming…" : "📖 Storybook Scene"}
        </div>
      </div>

      {/* Slide indicators */}
      <div className="flex justify-center gap-2 mt-4">
        {DEMO_SLIDES.map((s, i) => (
          <button
            key={s.childLabel}
            onClick={() => { setSlideIdx(i); setPhase("before"); }}
            aria-label={`Show ${s.childLabel}'s demo`}
            className={`rounded-full transition-all ${
              i === slideIdx ? "w-7 h-2.5 bg-primary" : "w-2.5 h-2.5 bg-muted-foreground/30"
            }`}
          />
        ))}
      </div>

      {/* Floating sparkles (decorative) */}
      <div className="absolute -top-4 -right-4 w-8 h-8 rounded-full bg-primary/20 animate-twinkle" />
      <div className="absolute -bottom-3 -left-3 w-5 h-5 rounded-full bg-primary/30 animate-twinkle" style={{ animationDelay: "1.5s" }} />
    </div>
  );
};

// ── Quick-Start Hero Form ───────────────────────────────────────────────────

const HeroForm = () => {
  const navigate = useNavigate();
  const [childName, setChildName] = useState("");
  const [theme, setTheme] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const acceptFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file (JPG, PNG, etc.)");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      toast.error("Photo must be under 8 MB");
      return;
    }
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPhotoPreview(reader.result as string);
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file) acceptFile(file);
    },
    [acceptFile],
  );

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) acceptFile(file);
  };

  const isValid = childName.trim().length > 0 && theme.length > 0 && photoPreview !== null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) {
      toast.error("Please fill in all fields and upload a photo.");
      return;
    }
    setSubmitting(true);
    const draft: PreviewDraft = {
      childName: childName.trim(),
      theme,
      photoData: photoPreview,
      savedAt: Date.now(),
    };
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    navigate("/preview");
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
      {/* Child's Name */}
      <div className="space-y-1.5">
        <Label htmlFor="hero-child-name" className="text-sm font-bold">
          Child's Name
        </Label>
        <Input
          id="hero-child-name"
          type="text"
          placeholder="e.g. Sophie"
          value={childName}
          onChange={(e) => setChildName(e.target.value)}
          maxLength={40}
          className="rounded-xl bg-secondary/50 border-border h-11"
          autoComplete="off"
        />
      </div>

      {/* Story Theme */}
      <div className="space-y-1.5">
        <Label htmlFor="hero-theme" className="text-sm font-bold">
          Story Theme
        </Label>
        <Select value={theme} onValueChange={setTheme}>
          <SelectTrigger id="hero-theme" className="rounded-xl bg-secondary/50 border-border h-11">
            <SelectValue placeholder="Choose a theme…" />
          </SelectTrigger>
          <SelectContent>
            {STORY_THEMES.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Photo Upload */}
      <div className="space-y-1.5">
        <Label className="text-sm font-bold">Upload Your Child's Photo</Label>
        <div
          role="button"
          tabIndex={0}
          aria-label="Upload photo by clicking or dragging and dropping"
          className={`relative rounded-xl border-2 border-dashed p-4 text-center cursor-pointer transition-colors ${
            dragging ? "dropzone-active" : "border-border hover:border-primary/50 hover:bg-secondary/30"
          }`}
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && fileInputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
        >
          {photoPreview ? (
            <div className="flex items-center gap-3">
              <img
                src={photoPreview}
                alt="Preview of uploaded child photo"
                className="w-14 h-14 rounded-lg object-cover shrink-0 border border-primary/30"
              />
              <div className="flex-1 text-left min-w-0">
                <p className="text-sm font-bold text-foreground truncate">{photoFile?.name}</p>
                <p className="text-xs text-muted-foreground">
                  {photoFile ? `${(photoFile.size / 1024).toFixed(0)} KB` : "Photo ready"}
                </p>
              </div>
              <button
                type="button"
                aria-label="Remove photo"
                onClick={(e) => { e.stopPropagation(); setPhotoFile(null); setPhotoPreview(null); }}
                className="ml-auto p-1.5 rounded-full hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="py-3 flex flex-col items-center gap-2 text-muted-foreground">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                {dragging ? (
                  <ImageIcon className="h-6 w-6 text-primary animate-bounce" />
                ) : (
                  <Upload className="h-6 w-6 text-primary" />
                )}
              </div>
              <p className="text-sm font-bold text-foreground">
                {dragging ? "Drop it here!" : "Drag & drop or click to upload"}
              </p>
              <p className="text-xs">JPG, PNG, WEBP — max 8 MB</p>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="sr-only"
            aria-label="Upload child photo"
            onChange={handleFileChange}
          />
        </div>
      </div>

      {/* Submit */}
      <Button
        type="submit"
        size="lg"
        disabled={!isValid || submitting}
        className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-display text-lg rounded-full py-7 shadow-xl shadow-primary/30 hover:scale-105 transition-all duration-300 disabled:scale-100 disabled:opacity-60"
      >
        {submitting ? (
          <>
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            Creating Preview…
          </>
        ) : (
          <>
            <Sparkles className="h-5 w-5 mr-2" />
            See the Magic Preview!
          </>
        )}
      </Button>

      <p className="text-[11px] text-center text-muted-foreground/70">
        Free preview — no payment required. Photo stored privately for 5&nbsp;days max.
      </p>
    </form>
  );
};

// ── Product Card (unchanged) ────────────────────────────────────────────────

const ProductCard = ({ product }: { product: ShopifyProduct }) => {
  const image = product.node.images.edges[0]?.node;
  const price = product.node.priceRange.minVariantPrice;
  const priceNum = parseFloat(price.amount);

  return (
    <Link to={`/product/${product.node.handle}#personalize`} className="group block h-full">
      <div className="relative h-full flex flex-col bg-card rounded-3xl overflow-hidden border border-border hover:border-primary/60 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/20 hover:-translate-y-1">
        <div className="absolute top-3 left-3 z-10 inline-flex items-center gap-1 bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider rounded-full px-2.5 py-1 shadow-md">
          <Sparkles className="h-3 w-3" /> Bestseller
        </div>
        <div className="absolute top-3 right-3 z-10 bg-background/90 backdrop-blur-sm text-foreground text-[10px] font-bold uppercase tracking-wider rounded-full px-2.5 py-1 shadow-md border border-border">
          Instant PDF
        </div>

        {image && (
          <div className="aspect-[4/3] overflow-hidden bg-gradient-to-br from-secondary/30 to-primary/5">
            <img
              src={image.url}
              alt={image.altText || product.node.title}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            />
          </div>
        )}

        <div className="p-5 flex flex-col flex-1">
          <div className="flex items-center gap-1.5 mb-2">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-3.5 w-3.5 text-primary fill-primary" />
              ))}
            </div>
            <span className="text-xs text-muted-foreground font-medium">Loved by 2,000+ families</span>
          </div>

          <h3 className="font-display text-lg font-bold leading-tight mb-2 group-hover:text-primary transition-colors">
            {product.node.title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
            {product.node.description}
          </p>

          <ul className="text-xs text-muted-foreground space-y-1 mb-4">
            <li className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-primary" /> Your child as the hero</li>
            <li className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-primary" /> Coloring pages included</li>
          </ul>

          <div className="mt-auto flex items-end justify-between gap-3">
            <div className="flex flex-col">
              <span className="text-2xl font-extrabold text-primary leading-none">
                ${priceNum.toFixed(2)}
              </span>
              <span className="text-[10px] text-muted-foreground mt-0.5">one-time payment</span>
            </div>
            <span className="inline-flex items-center gap-1 bg-primary text-primary-foreground font-display rounded-full px-4 py-2.5 text-sm font-bold shadow-lg shadow-primary/30 group-hover:bg-primary/90 group-hover:scale-105 transition-all">
              <Sparkles className="h-4 w-4" />
              Personalize
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

const Index = () => {
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [showIntro, setShowIntro] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    fetchProducts(20).then(setProducts).catch(console.error).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (showIntro && videoRef.current) {
      const video = videoRef.current;
      video.muted = false;
      video.play().catch(() => {
        video.muted = true;
        setIsMuted(true);
        video.play().catch(console.error);
      });
    }
  }, [showIntro]);

  const handleVideoEnd = () => {
    setShowIntro(false);
  };

  const handleUnmute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = false;
      setIsMuted(false);
    }
  };

  if (showIntro) {
    return (
      <>
        <SEO
          title="MESTAR — Personalized Storybooks Starring Your Child"
          description="Create a personalized children's storybook in minutes. Upload a photo, pick a theme, and download a print-ready PDF starring your child."
          canonical="/"
          jsonLd={{
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "MESTAR",
            url: "https://mestar.pro",
            logo: "https://mestar.pro/favicon.ico",
          }}
        />
        <h1 className="sr-only">MESTAR — Personalized Storybooks Starring Your Child</h1>
        <div
          className="fixed inset-0 z-50 bg-black flex items-center justify-center cursor-pointer overflow-hidden"
          onClick={handleVideoEnd}
        >
          <video
            src="/videos/promo-ad.mp4"
            playsInline
            muted
            autoPlay
            loop
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover scale-110 blur-2xl opacity-50 pointer-events-none"
          />
          <video
            ref={videoRef}
            src="/videos/promo-ad.mp4"
            playsInline
            onEnded={handleVideoEnd}
            className="relative w-full h-full object-contain"
          />
          {isMuted && (
            <button
              onClick={handleUnmute}
              className="absolute bottom-8 right-8 bg-cream/20 backdrop-blur-sm text-cream rounded-full p-4 hover:bg-cream/30 transition-colors z-10"
            >
              <Volume2 className="h-6 w-6" />
              <span className="sr-only">Tap for sound</span>
            </button>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); handleVideoEnd(); }}
            className="absolute top-6 right-6 bg-white/10 backdrop-blur-sm text-white text-sm px-4 py-2 rounded-full hover:bg-white/20 transition-colors z-10"
          >
            Skip intro →
          </button>
        </div>
      </>
    );
  }

  return (
    <div className="min-h-screen">
      <SEO
        title="MESTAR — Personalized Storybooks Starring Your Child"
        description="Create a personalized children's storybook in minutes. Upload a photo, pick a theme, and download a print-ready PDF starring your child."
        canonical="/"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "MESTAR",
          url: "https://mestar.pro",
          logo: "https://mestar.pro/favicon.ico",
        }}
      />

      {/* Announcement Bar */}
      <div className="bg-primary text-primary-foreground text-center py-2 px-4">
        <p className="text-sm font-display font-bold">
          ⭐ Personalized digital storybooks — $19.99 one-time payment — instant digital download
        </p>
      </div>

      {/* ── NEW Hero Section ── */}
      <section className="relative overflow-hidden stars-bg">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background pointer-events-none" />
        <div className="relative z-10 container py-14 sm:py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">

            {/* Left — form column */}
            <div className="flex flex-col gap-6 items-center text-center">
              <div className="flex flex-col items-center">
                <div className="inline-flex items-center gap-2 bg-primary/20 backdrop-blur-sm border border-primary/30 rounded-full px-4 py-2 mb-5">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="text-sm font-bold text-primary">Personalized Bedtime Magic</span>
                </div>
                <h1 className="font-display text-4xl sm:text-5xl font-extrabold mb-4 leading-tight drop-shadow-lg">
                  Make Your Child
                  <br />
                  <span className="text-primary drop-shadow-[0_0_20px_hsl(43_75%_62%/0.5)]">
                    the ⭐ of the Story
                  </span>
                </h1>
                <p className="text-base text-foreground/80 leading-relaxed mb-2">
                  Upload a photo, pick a theme, and see a free preview in seconds. Then unlock the full 20-page personalised storybook for just&nbsp;<strong>$19.99</strong>.
                </p>
              </div>

              {/* Quick-start form */}
              <div className="bg-card/70 backdrop-blur-md rounded-2xl border border-border p-6 shadow-xl w-full">
                <HeroForm />
              </div>

              {/* Social proof */}
              <div className="flex items-center justify-center gap-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-primary fill-primary" />
                  ))}
                </div>
                <span className="text-sm text-foreground/70 font-medium">Loved by 2,000+ families</span>
              </div>
            </div>

            {/* Right — animated demo column */}
            <div className="flex flex-col items-center gap-6">
              <div className="text-center mb-2">
                <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-1">
                  Watch the transformation
                </p>
                <p className="text-xs text-muted-foreground/70">
                  Real child photo → personalised storybook character
                </p>
              </div>
              <HeroDemo />
            </div>

          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-8 border-b border-border bg-card/50">
        <div className="container">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { icon: Shield, text: "Secure Checkout" },
              { icon: Download, text: "Instant Download" },
              { icon: FileText, text: "Digital PDF" },
              { icon: CheckCircle2, text: "Satisfaction Guaranteed" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex flex-col items-center gap-2 text-center py-3">
                <Icon className="h-6 w-6 text-primary" />
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16">
        <div className="container">
          <h2 className="font-display text-3xl font-bold text-center mb-10">How It Works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              { step: "1", icon: Sparkles, title: "Personalize It", desc: "Upload a photo, choose a theme & get a free preview" },
              { step: "2", icon: BookOpen, title: "Place Your Order", desc: "Unlock the full story for $19.99 — one-time payment" },
              { step: "3", icon: Download, title: "Download & Enjoy", desc: "Get your personalised PDF storybook instantly" },
            ].map(({ step, icon: Icon, title, desc }) => (
              <div key={step} className="text-center">
                <div className="w-14 h-14 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center mx-auto mb-4">
                  <span className="font-display text-xl font-extrabold text-primary">{step}</span>
                </div>
                <Icon className="h-8 w-8 text-primary mx-auto mb-3" />
                <h3 className="font-display text-lg font-bold mb-1">{title}</h3>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story Preview / Trailer */}
      <StoryPreview productHandle={products[0]?.node.handle} />

      {/* Real Kids, Real Magic — actual before/after examples */}
      <RealMagicShowcase />


      {/* Products */}
      <section id="products" className="py-16 bg-card/30">
        <div className="container">
          <div className="text-center mb-10">
            <h2 className="font-display text-3xl font-bold mb-3">Shop Our Stories</h2>
            <p className="text-muted-foreground">Every story is a new adventure — pick your child's today ✨</p>
          </div>
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground text-lg">No products found</p>
              <p className="text-sm text-muted-foreground mt-1">New stories coming soon!</p>
            </div>
          ) : (
            <div className="flex flex-wrap justify-center gap-6">
              {products.map((product) => (
                <div key={product.node.id} className="w-full sm:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)] max-w-sm">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Reviews */}
      <section className="py-16 border-t border-border">
        <div className="container max-w-3xl text-center">
          <div className="flex items-center justify-center gap-1 mb-4">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-6 w-6 text-muted-foreground/40" />
            ))}
          </div>
          <h2 className="font-display text-2xl font-bold mb-2">Please leave a review, your input is how we improve! Let us know how we can provide the best customer experience possible</h2>
          <p className="text-muted-foreground mb-6">
            Your honest words help other families discover the magic. After your story is delivered,
            we'd love to hear what you and your little one thought.
          </p>
          <Button
            asChild
            variant="outline"
            className="rounded-full border-primary/40 text-primary hover:bg-primary/10 hover:text-primary"
          >
            <Link to="/reviews">Share your story ⭐</Link>
          </Button>
        </div>
      </section>

      {/* Urgency / Final CTA */}
      <section className="py-16 stars-bg relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/90 to-background" />
        <div className="container relative z-10 text-center">
          <Clock className="h-10 w-10 text-primary mx-auto mb-4" />
          <h2 className="font-display text-3xl font-bold mb-3">Don't Miss Out!</h2>
          <p className="text-muted-foreground max-w-md mx-auto mb-6">
            Download instantly after purchase. Give your child a gift they'll never forget.
          </p>
          {products.length > 0 ? (
            <Button
              asChild
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-display text-lg rounded-full px-10 py-7 shadow-xl shadow-primary/30 hover:scale-105 transition-all"
            >
              <Link to={`/product/${products[0].node.handle}#personalize`}>Create Your Story Now ⭐</Link>
            </Button>
          ) : (
            <Button
              asChild
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-display text-lg rounded-full px-10 py-7 shadow-xl shadow-primary/30 hover:scale-105 transition-all"
            >
              <a href="#products">Create Your Story Now ⭐</a>
            </Button>
          )}
        </div>
      </section>
    </div>
  );
};

export default Index;
