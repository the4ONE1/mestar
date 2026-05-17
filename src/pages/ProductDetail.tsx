import { useEffect, useState, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { fetchProductByHandle, ShopifyProduct } from "@/lib/shopify";
import { useCartStore } from "@/stores/cartStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Loader2, Star, Upload, CheckCircle2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import SEO from "@/components/SEO";
import { BASE_PRICE, SUPPORTING_CHARACTER_PRICE } from "@/lib/products";

const STORY_THEMES = [
  "Fairy Tale",
  "Ocean Adventure & Pirates",
  "Prince & Princess",
  "Outer Space",
  "Dinosaurs",
];

const STRENGTHS = [
  "Kindness", "Bravery", "Curiosity", "Patience",
  "Creativity", "Generosity", "Determination", "Empathy",
];

const ProductDetail = () => {
  const { handle } = useParams<{ handle: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<ShopifyProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMedia, setSelectedMedia] = useState(0);
  const addItem = useCartStore(state => state.addItem);
  const isLoading = useCartStore(state => state.isLoading);

  // Personalization form state
  const [childName, setChildName] = useState("");
  const [childGender, setChildGender] = useState("");
  const [childAge, setChildAge] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [theme, setTheme] = useState("");
  const [strength, setStrength] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Ref to scroll into the personalization form
  const personalizationRef = useRef<HTMLDivElement>(null);
  const scrollToPersonalization = () => {
    setTimeout(() => {
      personalizationRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  useEffect(() => {
    if (!handle) return;
    setLoading(true);
    fetchProductByHandle(handle)
      .then(setProduct)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [handle]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Photo must be under 5MB");
      return;
    }
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPhotoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const SUPPORTING_NAMES = ["Luna", "Max", "Pip", "Ollie", "Bella"];
  const AGE_OPTIONS = ["1-3", "4-7", "8-10", "11+"];
  const GENDER_OPTIONS = ["boy", "girl"];
  // Friendly default child names — Leo is the boy featured in the promo commercial / sample storybook
  const SURPRISE_NAMES = ["Leo", "Mia", "Sam", "Ava", "Max", "Zoe"];
  // Sample photo of Leo (the boy in the commercial) — used as default when user picks Surprise Me
  const SURPRISE_PHOTO_PATH = "/images/sample-page-1.jpg";

  const surpriseMe = async () => {
    const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
    const pickedName = pick(SURPRISE_NAMES);
    // If we picked Leo, gender is locked to boy (he's the boy from the commercial). Otherwise random.
    const pickedGender = pickedName === "Leo" ? "boy" : pick(GENDER_OPTIONS);

    setChildName(pickedName);
    setChildGender(pickedGender);
    setChildAge(pick(AGE_OPTIONS));
    setTheme(pick(STORY_THEMES));
    setStrength(pick(STRENGTHS));

    // Auto-load the default child photo (Leo from the commercial) so the user
    // doesn't have to upload anything. Convert to a data URL so it flows through
    // the cart and story-generation pipeline exactly like a real upload.
    try {
      const res = await fetch(SURPRISE_PHOTO_PATH);
      const blob = await res.blob();
      const file = new File([blob], "surprise-child.jpg", { type: blob.type || "image/jpeg" });
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(blob);
    } catch (err) {
      console.error("Failed to load surprise photo", err);
    }

    toast.success("Surprise picks loaded — just add your email and you're set!", {
      position: "top-center",
    });
    scrollToPersonalization();
  };

  const totalPrice = BASE_PRICE;

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail.trim());
  const isFormValid = childName.trim().length > 0 && childGender && childAge && theme && photoPreview && isEmailValid;

  if (loading) {
    return (
      <>
        <SEO
          title="Loading Personalized Storybook | MESTAR"
          description="Personalize a one-of-a-kind PDF storybook starring your child. Upload a photo, pick a theme, and download instantly."
          canonical={handle ? `/product/${handle}` : undefined}
        />
        <div className="min-h-screen flex flex-col items-center justify-center gap-4">
          <h1 className="sr-only">Loading personalized storybook</h1>
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </>
    );
  }

  if (!product) {
    return (
      <>
        <SEO
          title="Product Not Found | MESTAR"
          description="This storybook could not be found. Browse our personalized children's storybooks at MESTAR."
          canonical={handle ? `/product/${handle}` : undefined}
          noindex
        />
        <div className="min-h-screen flex flex-col items-center justify-center gap-4">
          <h1 className="font-display text-2xl font-bold">Product not found</h1>
          <Button asChild variant="outline"><Link to="/">Back to Home</Link></Button>
        </div>
      </>
    );
  }

  const { node } = product;
  const images = node.images.edges;
  const variant = node.variants.edges[0]?.node;

  const handleAddToCart = async () => {
    if (!variant || !isFormValid) return;

    const personalizationData = {
      childName: childName.trim(),
      childGender,
      childAge,
      theme,
      strength,
      photoUrl: photoPreview!,
      customerEmail: customerEmail.trim(),
      selectedAddons: { illustrations: true, coloring: true, character: false },
      isBundle: true,
      totalPrice,
    };
    localStorage.setItem("mestar-pending-story", JSON.stringify(personalizationData));


    await addItem({
      product,
      variantId: variant.id,
      variantTitle: variant.title,
      price: variant.price,
      quantity: 1,
      selectedOptions: variant.selectedOptions || [],
      personalization: personalizationData,
    });
    toast.success("Added to cart! ⭐", { position: "top-center" });
  };

  return (
    <div className="min-h-screen py-8">
      <SEO
        title={`${node.title} — Personalized Storybook | MESTAR`}
        description={(node.description || "").slice(0, 155) || `Personalize ${node.title}: a one-of-a-kind PDF storybook starring your child.`}
        canonical={`/product/${node.handle}`}
        type="product"
        image={node.images?.edges?.[0]?.node?.url}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: node.title,
          description: node.description,
          image: node.images?.edges?.map((e: { node: { url: string } }) => e.node.url) || [],
          brand: { "@type": "Brand", name: "MESTAR" },
          offers: {
            "@type": "Offer",
            price: node.priceRange?.minVariantPrice?.amount,
            priceCurrency: node.priceRange?.minVariantPrice?.currencyCode || "USD",
            availability: "https://schema.org/InStock",
            url: `https://mestar.pro/product/${node.handle}`,
          },
        }}
      />
      <div className="container">
        <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8">
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm font-medium">Back to Shop</span>
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {/* Media */}
          <div className="space-y-4">
            <div className="aspect-square rounded-2xl overflow-hidden bg-card border border-border">
              {images[selectedMedia] && (
                <img
                  src={images[selectedMedia].node.url}
                  alt={images[selectedMedia].node.altText || node.title}
                  className="w-full h-full object-contain"
                />
              )}
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedMedia(i)}
                  aria-label={`View product image ${i + 1}`}
                  className={`w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-colors ${
                    i === selectedMedia ? 'border-primary' : 'border-border hover:border-primary/50'
                  }`}
                >
                  <img src={img.node.url} alt={img.node.altText || ''} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Info + form */}
          <div className="flex flex-col">
            <h1 className="font-display text-3xl font-bold mb-4">{node.title}</h1>

            {/* Live total */}
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-3xl font-bold text-primary">${totalPrice.toFixed(2)}</span>
              <span className="text-sm text-muted-foreground">USD</span>
            </div>
            <p className="text-xs text-muted-foreground mb-6">
              One-time purchase — instant digital download. Story + illustrations + coloring pages included.
            </p>

            <div className="flex items-center gap-2 mb-6">
              {[1, 2, 3, 4, 5].map(i => (
                <Star key={i} className="h-5 w-5 text-primary fill-primary" />
              ))}
              <span className="text-sm text-muted-foreground ml-1">Loved by 2,000+ families</span>
            </div>

            {/* What's included */}
            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5 mb-6">
              <h2 className="font-display text-lg font-bold flex items-center gap-2 mb-3">
                <Sparkles className="h-5 w-5 text-primary" />
                Everything Included
              </h2>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" /> Personalized PDF storybook starring your child</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" /> Full-color storybook illustrations (scaled to your child's age group)</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" /> Matching printable coloring pages included</li>
              </ul>
              <p className="text-xs text-muted-foreground mt-3">
                Want to add a sibling, friend, or pet? You can add a Supporting Character (+${SUPPORTING_CHARACTER_PRICE.toFixed(2)}) on the next step.
              </p>
            </div>

            {/* Personalization Form */}
            <div ref={personalizationRef} className="bg-card rounded-2xl border border-border p-6 mb-6 space-y-5 scroll-mt-24">
              <div className="text-center">
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={surpriseMe}
                  className="border-primary/40 text-primary hover:bg-primary/10 hover:text-primary rounded-full font-display text-lg px-8 py-6 shadow-lg shadow-primary/20 hover:scale-105 transition-all"
                >
                  <Sparkles className="h-5 w-5 mr-2" />
                  Surprise Me
                </Button>
                <p className="text-[9px] text-muted-foreground/60 italic mt-2 mb-4 leading-tight">
                  "I want one now, skip the personalization — just add your email below"
                </p>
                <h2 className="font-display text-lg font-bold flex items-center justify-center gap-2">
                  ✨ Personalize Your Story
                </h2>
              </div>

              <div className="space-y-2">
                <Label className="font-medium">Child's Photo *</Label>
                <p className="text-xs text-muted-foreground">A clear, well-lit photo helps us match their look.</p>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                {photoPreview ? (
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-lg overflow-hidden border border-border">
                      <img src={photoPreview} alt="Child's photo" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium flex items-center gap-1">
                        <CheckCircle2 className="h-4 w-4 text-primary" /> Photo uploaded
                      </p>
                      <button onClick={() => fileInputRef.current?.click()} className="text-xs text-primary hover:underline">
                        Change photo
                      </button>
                    </div>
                  </div>
                ) : (
                  <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} className="w-full border-dashed border-2">
                    <Upload className="h-4 w-4 mr-2" /> Upload Photo
                  </Button>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="childName" className="font-medium">Child's Name *</Label>
                <Input id="childName" placeholder="Enter your child's name" value={childName} onChange={(e) => setChildName(e.target.value)} maxLength={50} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="childGender" className="font-medium">Boy or Girl *</Label>
                <Select value={childGender} onValueChange={setChildGender}>
                  <SelectTrigger id="childGender"><SelectValue placeholder="Select boy or girl" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="boy">Boy</SelectItem>
                    <SelectItem value="girl">Girl</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="childAge" className="font-medium">Age Group *</Label>
                <Select value={childAge} onValueChange={setChildAge}>
                  <SelectTrigger id="childAge"><SelectValue placeholder="Select age group" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-3">1–3 years old</SelectItem>
                    <SelectItem value="4-7">4–7 years old</SelectItem>
                    <SelectItem value="8-10">8–10 years old</SelectItem>
                    <SelectItem value="11+">11+ years old</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="customerEmail" className="font-medium">Your Email *</Label>
                <Input id="customerEmail" type="email" placeholder="Where we'll send your finished PDF" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} maxLength={255} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="theme" className="font-medium">Story Theme *</Label>
                <Select value={theme} onValueChange={setTheme}>
                  <SelectTrigger><SelectValue placeholder="Choose a theme" /></SelectTrigger>
                  <SelectContent>
                    {STORY_THEMES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="strength" className="font-medium">Strength to Nurture</Label>
                <p className="text-xs text-muted-foreground">Optional positive trait your child will demonstrate.</p>
                <Select value={strength} onValueChange={setStrength}>
                  <SelectTrigger><SelectValue placeholder="Choose a strength (optional)" /></SelectTrigger>
                  <SelectContent>
                    {STRENGTHS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              onClick={handleAddToCart}
              disabled={isLoading || !variant?.availableForSale || !isFormValid}
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-display text-lg rounded-full shadow-lg shadow-primary/25"
            >
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : `Add to Cart — $${totalPrice.toFixed(2)} ⭐`}
            </Button>

            {!isFormValid && childName.length === 0 && (
              <p className="text-xs text-muted-foreground mt-2 text-center">Fill in all personalization details to add to cart</p>
            )}

            {/* Features */}
            <div className="mt-10 space-y-3 border-t border-border pt-8 text-sm text-muted-foreground">
              <p>✨ Personalized with your child's name & photo</p>
              <p>📖 Personalized digital PDF storybook</p>
              <p>🌟 Your child is the hero!</p>
              <p>💝 Age-appropriate & non-violent</p>
              <p>⚡ Instant download after purchase</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
