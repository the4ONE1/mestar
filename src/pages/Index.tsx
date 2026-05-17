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

  return (
    <Link to={`/product/${product.node.handle}`} className="group block">
      <div className="bg-card rounded-2xl overflow-hidden border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
        {image && (
          <div className="aspect-[4/3] overflow-hidden bg-secondary/20">
            <img
              src={image.url}
              alt={image.altText || product.node.title}
              className="w-full h-full object-contain bg-secondary/10 group-hover:scale-105 transition-transform duration-500"
            />
          </div>
        )}
        <div className="p-5">
          <h3 className="font-display text-lg font-bold leading-tight mb-2 group-hover:text-primary transition-colors">
            {product.node.title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
            {product.node.description}
          </p>
          <div className="flex items-center justify-between">
            <span className="text-xl font-bold text-primary">
              ${parseFloat(price.amount).toFixed(2)}
            </span>
            <span className="inline-flex items-center gap-1 bg-primary text-primary-foreground font-display rounded-full px-4 py-2 text-sm font-medium group-hover:bg-primary/90 transition-colors">
              <Sparkles className="h-4 w-4" />
              Personalize Now
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
          description="Create a one-of-a-kind personalized children's storybook in minutes. Upload a photo, pick a theme, and instantly download a print-ready PDF starring your child."
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
          className="fixed inset-0 z-50 bg-black flex items-center justify-center cursor-pointer"
          onClick={handleVideoEnd}
        >
          <video
            ref={videoRef}
            src="/videos/promo-ad.mp4"
            playsInline
            onEnded={handleVideoEnd}
            className="w-full h-full object-contain"
          />
          {isMuted && (
            <button
              onClick={handleUnmute}
              className="absolute bottom-8 right-8 bg-cream/20 backdrop-blur-sm text-cream rounded-full p-4 hover:bg-cream/30 transition-colors"
            >
              <Volume2 className="h-6 w-6" />
              <span className="sr-only">Tap for sound</span>
            </button>
          )}
        </div>
      </>
    );
  }

  return (
    <div className="min-h-screen">
      <SEO
        title="MESTAR — Personalized Storybooks Starring Your Child"
        description="Create a one-of-a-kind personalized children's storybook in minutes. Upload a photo, pick a theme, and instantly download a print-ready PDF starring your child."
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
        <p className="text-sm font-display font-bold animate-pulse">
          ⚡ Instant Digital Download — Get Your Story in Minutes!
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
