import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchProductByHandle, ShopifyProduct } from "@/lib/shopify";
import { useCartStore } from "@/stores/cartStore";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, Star } from "lucide-react";
import { toast } from "sonner";

const ProductDetail = () => {
  const { handle } = useParams<{ handle: string }>();
  const [product, setProduct] = useState<ShopifyProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const addItem = useCartStore(state => state.addItem);
  const isLoading = useCartStore(state => state.isLoading);

  useEffect(() => {
    if (!handle) return;
    setLoading(true);
    fetchProductByHandle(handle)
      .then(setProduct)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [handle]);

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
    if (!variant) return;
    await addItem({
      product,
      variantId: variant.id,
      variantTitle: variant.title,
      price: variant.price,
      quantity: 1,
      selectedOptions: variant.selectedOptions || [],
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
            <div className="flex items-center gap-2 mb-6">
              <span className="text-3xl font-bold text-primary">${parseFloat(price.amount).toFixed(2)}</span>
              <span className="text-sm text-muted-foreground">{price.currencyCode}</span>
            </div>
            <p className="text-muted-foreground leading-relaxed mb-8 whitespace-pre-line">{node.description}</p>

            <div className="flex items-center gap-2 mb-6">
              {[1, 2, 3, 4, 5].map(i => (
                <Star key={i} className="h-5 w-5 text-primary fill-primary" />
              ))}
            </div>

            <Button
              onClick={handleAddToCart}
              disabled={isLoading || !variant?.availableForSale}
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-display text-lg rounded-full shadow-lg shadow-primary/25"
            >
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Add to Cart ⭐"}
            </Button>

            {!variant?.availableForSale && (
              <p className="text-destructive text-sm mt-3">Currently out of stock</p>
            )}

            {/* Features */}
            <div className="mt-10 space-y-4 border-t border-border pt-8">
              {[
                "✨ Personalized with your child's name",
                "📖 Beautifully illustrated bedtime story",
                "🎨 Includes 5 bonus coloring pages",
                "🌟 Your child is the hero!",
                "💝 Age-appropriate & non-violent",
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
