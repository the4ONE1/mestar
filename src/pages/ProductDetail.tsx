import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchProductByHandle, ShopifyProduct } from "@/lib/shopify";
import { useCartStore } from "@/stores/cartStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Loader2, Star, Upload, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

const STORY_THEMES = [
  "Fairy Tale",
  "Ocean Adventure & Pirates",
  "Prince & Princess",
  "Mythical Creatures",
  "Dinosaurs",
];

const STRENGTHS = [
  "Kindness",
  "Bravery",
  "Curiosity",
  "Patience",
  "Creativity",
  "Generosity",
  "Determination",
  "Empathy",
];

const ProductDetail = () => {
  const { handle } = useParams<{ handle: string }>();
  const [product, setProduct] = useState<ShopifyProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
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

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail.trim());
  const isFormValid = childName.trim().length > 0 && childGender && childAge && theme && photoPreview && isEmailValid;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-xl font-display">Product not found</p>
        <Button asChild variant="outline"><Link to="/">Back to Home</Link></Button>
      </div>
    );
  }

  const { node } = product;
  const images = node.images.edges;
  const variant = node.variants.edges[0]?.node;
  const price = node.priceRange.minVariantPrice;

  const handleAddToCart = async () => {
    if (!variant || !isFormValid) return;

    // Save personalization for story generation after checkout
    const personalizationData = {
      childName: childName.trim(),
      childAge: childAge, // age group string like "1-3", "4-7", "8-10", "11+"
      theme,
      strength,
      photoUrl: photoPreview!,
      customerEmail: customerEmail.trim(),
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
      <div className="container">
        <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8">
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm font-medium">Back to Shop</span>
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {/* Images */}
          <div className="space-y-4">
            <div className="aspect-square rounded-2xl overflow-hidden bg-card border border-border">
              {images[selectedImage] && (
                <img
                  src={images[selectedImage].node.url}
                  alt={images[selectedImage].node.altText || node.title}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-colors ${
                      i === selectedImage ? 'border-primary' : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <img src={img.node.url} alt={img.node.altText || ''} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col">
            <h1 className="font-display text-3xl font-bold mb-4">{node.title}</h1>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-3xl font-bold text-primary">${parseFloat(price.amount).toFixed(2)}</span>
              <span className="text-sm text-muted-foreground">{price.currencyCode}</span>
            </div>
            <p className="text-muted-foreground leading-relaxed mb-6 whitespace-pre-line">{node.description}</p>

            <div className="flex items-center gap-2 mb-6">
              {[1, 2, 3, 4, 5].map(i => (
                <Star key={i} className="h-5 w-5 text-primary fill-primary" />
              ))}
            </div>

            {/* Personalization Form */}
            <div className="bg-card rounded-2xl border border-border p-6 mb-6 space-y-5">
              <h3 className="font-display text-lg font-bold flex items-center gap-2">
                ✨ Personalize Your Story
              </h3>

              <div className="space-y-2">
                <Label htmlFor="customerEmail" className="font-medium">Your Email *</Label>
                <Input
                  id="customerEmail"
                  type="email"
                  placeholder="Where we'll send your finished PDF"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  maxLength={255}
                />
                <p className="text-xs text-muted-foreground">We'll email your storybook PDF to this address</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="childName" className="font-medium">Child's Name *</Label>
                <Input
                  id="childName"
                  placeholder="Enter your child's name"
                  value={childName}
                  onChange={(e) => setChildName(e.target.value)}
                  maxLength={50}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="childAge" className="font-medium">Age Group *</Label>
                <Select value={childAge} onValueChange={setChildAge}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select age group" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-3">1–3 years old</SelectItem>
                    <SelectItem value="4-7">4–7 years old</SelectItem>
                    <SelectItem value="8-10">8–10 years old</SelectItem>
                    <SelectItem value="11+">11+ years old</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="theme" className="font-medium">Story Theme *</Label>
                <Select value={theme} onValueChange={setTheme}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a theme" />
                  </SelectTrigger>
                  <SelectContent>
                    {STORY_THEMES.map(t => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="strength" className="font-medium">Strength to Nurture</Label>
                <p className="text-xs text-muted-foreground">Optional — choose a positive trait your child will demonstrate in the story</p>
                <Select value={strength} onValueChange={setStrength}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a strength (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {STRENGTHS.map(s => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="font-medium">Child's Photo *</Label>
                <p className="text-xs text-muted-foreground">Upload a clear photo of your child to be featured in the story</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
                {photoPreview ? (
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-lg overflow-hidden border border-border">
                      <img src={photoPreview} alt="Child's photo" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium flex items-center gap-1">
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                        Photo uploaded
                      </p>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="text-xs text-primary hover:underline"
                      >
                        Change photo
                      </button>
                    </div>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full border-dashed border-2"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Photo
                  </Button>
                )}
              </div>
            </div>

            <Button
              onClick={handleAddToCart}
              disabled={isLoading || !variant?.availableForSale || !isFormValid}
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-display text-lg rounded-full shadow-lg shadow-primary/25"
            >
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Add to Cart ⭐"}
            </Button>

            {!isFormValid && childName.length === 0 && (
              <p className="text-xs text-muted-foreground mt-2 text-center">Fill in all personalization details to add to cart</p>
            )}

            {!variant?.availableForSale && (
              <p className="text-destructive text-sm mt-3">Currently unavailable</p>
            )}

            {/* Features */}
            <div className="mt-10 space-y-4 border-t border-border pt-8">
              {[
                "✨ Personalized with your child's name & photo",
                "📖 Beautifully illustrated digital PDF storybook",
                "🎨 Includes 5 bonus coloring pages",
                "🌟 Your child is the hero!",
                "💝 Age-appropriate & non-violent",
                "⚡ Instant download after purchase",
              ].map((feature) => (
                <div key={feature} className="text-sm text-muted-foreground">{feature}</div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
