import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Star, Sparkles, BookOpen, Loader2, Shield, Download, FileText, Clock, CheckCircle2, Volume2 } from "lucide-react";
import { fetchProducts, ShopifyProduct } from "@/lib/shopify";
import StoryPreview from "@/components/StoryPreview";
import SEO from "@/components/SEO";

const ProductCard = ({ product }: { product: ShopifyProduct }) => {
  const image = product.node.images.edges[0]?.node;
  const price = product.node.priceRange.minVariantPrice;
  const priceNum = parseFloat(price.amount);

  return (
    <Link to={`/product/${product.node.handle}`} className="group block h-full">
      <div className="relative h-full flex flex-col bg-card rounded-3xl overflow-hidden border border-border hover:border-primary/60 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/20 hover:-translate-y-1">
        {/* Top ribbon */}
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
          {/* Rating row */}
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

          {/* Mini feature ticks */}
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
          {/* Blurred backdrop fill so portrait video doesn't leave black bars on desktop */}
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

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="relative z-10 container text-center pt-12 pb-16 sm:pt-20 sm:pb-24">
          <div className="inline-flex items-center gap-2 bg-primary/20 backdrop-blur-sm border border-primary/30 rounded-full px-4 py-2 mb-6">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-bold text-primary">Personalized Bedtime Magic</span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-extrabold mb-4 leading-tight drop-shadow-lg">
            Your Child Is
            <br />
            <span className="text-primary drop-shadow-[0_0_20px_hsl(43_75%_62%/0.5)]">the ⭐</span>
          </h1>
          <p className="text-lg text-foreground/90 max-w-lg mx-auto mb-8 leading-relaxed drop-shadow-md">
            A one-of-a-kind digital storybook where your little one is the hero. Instantly download and start the magic tonight.
          </p>
          {products.length > 0 ? (
            <Button
              asChild
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-display text-lg rounded-full px-10 py-7 shadow-xl shadow-primary/30 hover:shadow-primary/50 hover:scale-105 transition-all duration-300"
            >
              <Link to={`/product/${products[0].node.handle}`}>Start Your Magical Journey ⭐</Link>
            </Button>
          ) : (
            <Button
              asChild
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-display text-lg rounded-full px-10 py-7 shadow-xl shadow-primary/30 hover:shadow-primary/50 hover:scale-105 transition-all duration-300"
            >
              <a href="#products">Start Your Magical Journey ⭐</a>
            </Button>
          )}

          {/* Social proof */}
          <div className="mt-8 flex items-center justify-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-5 w-5 text-primary fill-primary" />
            ))}
            <span className="ml-2 text-sm text-foreground/80 font-medium">Loved by 2,000+ families</span>
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

      {/* Video Section - Coming Soon */}

      {/* How It Works */}
      <section className="py-16">
        <div className="container">
          <h2 className="font-display text-3xl font-bold text-center mb-10">How It Works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              { step: "1", icon: Sparkles, title: "Personalize It", desc: "Upload a photo, choose a theme & add details" },
              { step: "2", icon: BookOpen, title: "Place Your Order", desc: "Complete checkout — optionally add a second character" },
              { step: "3", icon: Download, title: "Download & Enjoy", desc: "Get your personalized PDF storybook instantly" },
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

      {/* Reviews — empty state until real reviews exist */}
      <section className="py-16 border-t border-border">
        <div className="container max-w-3xl text-center">
          <div className="flex items-center justify-center gap-1 mb-4">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-6 w-6 text-muted-foreground/40" />
            ))}
          </div>
          <h2 className="font-display text-2xl font-bold mb-2">Be the first to leave a review</h2>
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
              <Link to={`/product/${products[0].node.handle}`}>Create Your Story Now ⭐</Link>
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
