import { useEffect, useState, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { fetchProductByHandle, ShopifyProduct } from "@/lib/shopify";
import { useCartStore } from "@/stores/cartStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Loader2, Star, Upload, CheckCircle2, Sparkles, ShieldCheck, Download, Clock, Heart, Volume2 } from "lucide-react";
import { toast } from "sonner";
import SEO from "@/components/SEO";
import StoryPreview from "@/components/StoryPreview";
import { BASE_PRICE, SUPPORTING_CHARACTER_PRICE, AUDIOBOOK_PRICE, AUDIOBOOK_ADDON } from "@/lib/products";

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
  const [isSamplePhoto, setIsSamplePhoto] = useState(false);
  const [wantsAudiobook, setWantsAudiobook] = useState(false);
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

  // Auto-scroll to personalization form when arriving via /product/...#personalize
  useEffect(() => {
    if (loading || !product) return;
    if (typeof window !== "undefined" && window.location.hash === "#personalize") {
      setTimeout(() => {
        personalizationRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 200);
    }
  }, [loading, product]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Photo must be under 5MB");
      return;
    }
    setPhotoFile(file);
    setIsSamplePhoto(false);
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
      setIsSamplePhoto(true);
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(blob);
    } catch (err) {
      console.error("Failed to load surprise photo", err);
    }

    toast.success("Sample loaded — upload your child's photo before checkout to make them the hero!", {
      position: "top-center",
    });
    scrollToPersonalization();
  };

  const totalPrice = BASE_PRICE + (wantsAudiobook ? AUDIOBOOK_PRICE : 0);

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

    if (isSamplePhoto) {
      const proceed = window.confirm(
        "You're about to order with the sample photo (Leo). Your child won't appear as the hero unless you upload their photo first.\n\nContinue with the sample photo anyway?"
      );
      if (!proceed) {
        fileInputRef.current?.click();
        return;
      }
    }

    const personalizationData = {
      childName: childName.trim(),
      childGender,
      childAge,
      theme,
      strength,
      photoUrl: photoPreview!,
      customerEmail: customerEmail.trim(),
      selectedAddons: { illustrations: true, coloring: true, character: false, audiobook: wantsAudiobook },
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

    // If audiobook upgrade is selected, also add the audiobook variant to the cart
    if (wantsAudiobook) {
      const audiobookProduct = {
        node: {
          id: AUDIOBOOK_ADDON.variantId,
          title: AUDIOBOOK_ADDON.title,
          description: AUDIOBOOK_ADDON.description,
          handle: "audiobook-add-on-karaoke-read-aloud",
          priceRange: { minVariantPrice: { amount: AUDIOBOOK_ADDON.price.toFixed(2), currencyCode: "USD" } },
          images: product.node.images,
          variants: { edges: [] },
          options: [],
        },
      };
      await addItem({
        product: audiobookProduct as typeof product,
        variantId: AUDIOBOOK_ADDON.variantId,
        variantTitle: AUDIOBOOK_ADDON.title,
        price: { amount: AUDIOBOOK_ADDON.price.toFixed(2), currencyCode: "USD" },
        quantity: 1,
        selectedOptions: [],
      });
    }

    toast.success("Added to cart! ⭐", { position: "top-center" });
  };

  return (
    <div className="min-h-screen py-8">
      <SEO
        title={`${node.title} | MESTAR`}
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
          sku: variant?.id?.split("/").pop() || node.handle,
          mpn: node.handle,
          productID: node.id,
          category: "Media > Books > Digital Books",
          brand: { "@type": "Brand", name: "MESTAR" },
          manufacturer: { "@type": "Organization", name: "MESTAR" },
          audience: {
            "@type": "PeopleAudience",
            suggestedMinAge: 1,
            suggestedMaxAge: 11,
          },
          offers: {
            "@type": "Offer",
            price: node.priceRange?.minVariantPrice?.amount,
            priceCurrency: node.priceRange?.minVariantPrice?.currencyCode || "USD",
            availability: "https://schema.org/InStock",
            itemCondition: "https://schema.org/NewCondition",
            url: `https://mestar.pro/product/${node.handle}`,
            priceValidUntil: new Date(new Date().setFullYear(new Date().getFullYear() + 1))
              .toISOString()
              .split("T")[0],
            seller: { "@type": "Organization", name: "MESTAR" },
            // Digital product — no physical shipping, instant download
            shippingDetails: {
              "@type": "OfferShippingDetails",
              shippingRate: {
                "@type": "MonetaryAmount",
                value: "0",
                currency: node.priceRange?.minVariantPrice?.currencyCode || "USD",
              },
              shippingDestination: {
                "@type": "DefinedRegion",
                geoMidpoint: { "@type": "GeoCoordinates" },
              },
              deliveryTime: {
                "@type": "ShippingDeliveryTime",
                handlingTime: { "@type": "QuantitativeValue", minValue: 0, maxValue: 0, unitCode: "DAY" },
                transitTime: { "@type": "QuantitativeValue", minValue: 0, maxValue: 0, unitCode: "DAY" },
              },
            },
            hasMerchantReturnPolicy: {
              "@type": "MerchantReturnPolicy",
              applicableCountry: "US",
              returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
              merchantReturnDays: 30,
              returnMethod: "https://schema.org/ReturnByMail",
              returnFees: "https://schema.org/FreeReturn",
            },
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
            {/* Badge row */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1 bg-primary/15 text-primary text-[11px] font-bold uppercase tracking-wider rounded-full px-2.5 py-1">
                <Sparkles className="h-3 w-3" /> Bestseller
              </span>
              <span className="inline-flex items-center gap-1 bg-primary/10 text-primary text-[11px] font-bold uppercase tracking-wider rounded-full px-2.5 py-1">
                <Download className="h-3 w-3" /> Instant PDF
              </span>
              <span className="inline-flex items-center gap-1 bg-primary/10 text-primary text-[11px] font-bold uppercase tracking-wider rounded-full px-2.5 py-1">
                <Heart className="h-3 w-3" /> Ages 1–11+
              </span>
            </div>

            <h1 className="font-display text-3xl font-bold mb-4">{node.title}</h1>

            {/* Live total */}
            <div className="flex items-baseline gap-3 mb-2 flex-wrap">
              <span className="text-3xl font-bold text-primary">${totalPrice.toFixed(2)}</span>
            </div>
            <p className="text-xs text-muted-foreground mb-4">
              One-time purchase — no subscription required — instant digital download
            </p>

            <div className="flex items-center gap-2 mb-6">
              {[1, 2, 3, 4, 5].map(i => (
                <Star key={i} className="h-5 w-5 text-primary fill-primary" />
              ))}
              <span className="text-sm text-muted-foreground ml-1">Loved by 2,000+ families</span>
            </div>

            {/* Trust strip */}
            <div className="grid grid-cols-3 gap-2 mb-6">
              {[
                { icon: Download, label: "Instant download" },
                { icon: ShieldCheck, label: "Secure checkout" },
                { icon: Clock, label: "Ready in minutes" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex flex-col items-center gap-1 bg-card border border-border rounded-xl p-2 text-center">
                  <Icon className="h-4 w-4 text-primary" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground leading-tight">{label}</span>
                </div>
              ))}
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
                <h2 className="font-display text-lg font-bold flex items-center justify-center gap-2">
                  ✨ Personalize Your Story
                </h2>
                <p className="text-xs text-muted-foreground mt-1 mb-2">
                  Just curious?{" "}
                  <button
                    type="button"
                    onClick={surpriseMe}
                    className="text-primary font-semibold underline-offset-2 hover:underline"
                  >
                    Try a sample first →
                  </button>
                </p>
              </div>

              {isSamplePhoto && (
                <div className="bg-primary/10 border border-primary/30 rounded-xl p-3 text-xs text-foreground/80 flex items-start gap-2">
                  <Sparkles className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                  <span>
                    You're previewing a sample (Leo).{" "}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-primary font-bold underline"
                    >
                      Upload your child's photo
                    </button>{" "}
                    to make them the hero of the story.
                  </span>
                </div>
              )}

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
                  <SelectTrigger id="theme"><SelectValue placeholder="Choose a theme" /></SelectTrigger>
                  <SelectContent>
                    {STORY_THEMES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="strength" className="font-medium">Strength to Nurture</Label>
                <p className="text-xs text-muted-foreground">Optional positive trait your child will demonstrate.</p>
                <Select value={strength} onValueChange={setStrength}>
                  <SelectTrigger id="strength"><SelectValue placeholder="Choose a strength (optional)" /></SelectTrigger>
                  <SelectContent>
                    {STRENGTHS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              {/* Audiobook upgrade — temporarily under construction */}
              <div
                className="block rounded-2xl border-2 border-dashed border-border bg-muted/40 p-4"
                aria-disabled="true"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1 h-5 w-5 rounded border-2 border-muted-foreground/30 bg-background flex items-center justify-center">
                    <Volume2 className="h-3 w-3 text-muted-foreground/60" />
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-display font-bold text-sm text-foreground/80">
                        Karaoke Audiobook Add-On
                      </span>
                      <div className="flex flex-col">
                        <span className="inline-flex items-center rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5">
                          Coming soon
                        </span>
                        <span className="text-[9px] text-muted-foreground/70 tracking-wide lowercase mt-0.5">
                          under construction
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      A gentle narrated read-aloud with karaoke-style word highlighting — perfect for
                      little ones learning to follow along. We're putting the finishing touches on it now
                      and it'll be ready for your family very soon.
                    </p>

                  </div>
                </div>
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

            {/* Guarantee */}
            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <span>Love it or your money back — 100% satisfaction guarantee</span>
            </div>

            {/* Features */}
            <div className="mt-10 space-y-3 border-t border-border pt-8 text-sm text-muted-foreground">
              <p>✨ Personalized with your child's name & photo</p>
              <p>📖 Personalized digital PDF storybook</p>
              <p>🌟 Your child is the hero!</p>
              <p>💝 Age-appropriate & non-violent</p>
              <p>⚡ Instant download after purchase</p>
            </div>

            {/* Paperback coming soon — separate announcement, not an add-on */}
            <div className="mt-6 rounded-2xl border border-primary/20 bg-primary/5 p-4 text-center">
              <p className="text-[10px] font-bold uppercase tracking-wider text-primary mb-1">
                On the way
              </p>
              <p className="text-sm font-display font-bold text-foreground mb-1">
                📬 Printed paperback storybooks, mailed to your home
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                We're working with a trusted print partner to bring your child's story to life as a
                beautifully bound paperback keepsake, shipped right to your door. Coming soon — keep
                an eye on your inbox for the launch.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky mobile add-to-cart bar */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-background/95 backdrop-blur-md border-t border-border p-3 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="flex flex-col leading-none">
            <span className="text-lg font-extrabold text-primary">${totalPrice.toFixed(2)}</span>
            <span className="text-[10px] text-muted-foreground">one-time payment</span>
          </div>
          <Button
            onClick={handleAddToCart}
            disabled={isLoading || !variant?.availableForSale || !isFormValid}
            className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 font-display rounded-full shadow-lg shadow-primary/25"
          >
            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : (isFormValid ? "Add to Cart ⭐" : "Personalize above ↑")}
          </Button>
        </div>
      </div>
      {/* Spacer so sticky bar doesn't cover content */}
      <div className="md:hidden h-20" aria-hidden="true" />
    </div>
  );
};

export default ProductDetail;
