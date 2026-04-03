import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ShoppingCart, Minus, Plus, Trash2, ExternalLink, Loader2, Upload, Users, CheckCircle2 } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { toast } from "sonner";

export const CartDrawer = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const { items, isLoading, isSyncing, updateQuantity, removeItem, getCheckoutUrl, syncCart, updatePersonalization } = useCartStore();
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + (parseFloat(item.price.amount) * item.quantity), 0);
  const upsellInputRef = useRef<HTMLInputElement>(null);
  const [upsellTargetVariant, setUpsellTargetVariant] = useState<string | null>(null);

  useEffect(() => { if (isOpen) syncCart(); }, [isOpen, syncCart]);

  const handleCheckout = () => {
    const checkoutUrl = getCheckoutUrl();
    if (checkoutUrl) {
      // Save personalization data for story generation
      const personalized = items.find(i => i.personalization);
      if (personalized?.personalization) {
        localStorage.setItem("mestar-pending-story", JSON.stringify(personalized.personalization));
      }
      window.open(checkoutUrl, '_blank');
      setIsOpen(false);
      // Navigate to order complete page for story generation
      navigate("/order-complete");
    }
  };

  const handleUpsellPhoto = (variantId: string) => {
    setUpsellTargetVariant(variantId);
    upsellInputRef.current?.click();
  };

  const handleUpsellFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !upsellTargetVariant) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Photo must be under 5MB");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      updatePersonalization(upsellTargetVariant, {
        supportingCharacterPhotoUrl: reader.result as string,
      });
      toast.success("Supporting character added! 🌟", { position: "top-center" });
      setUpsellTargetVariant(null);
    };
    reader.readAsDataURL(file);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative text-foreground hover:text-primary">
          <ShoppingCart className="h-5 w-5" />
          {totalItems > 0 && (
            <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-primary text-primary-foreground">
              {totalItems}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg flex flex-col h-full bg-card border-border">
        <SheetHeader className="flex-shrink-0">
          <SheetTitle className="font-display text-xl">Your Cart ⭐</SheetTitle>
          <SheetDescription>
            {totalItems === 0 ? "Your cart is empty" : `${totalItems} item${totalItems !== 1 ? 's' : ''} in your cart`}
          </SheetDescription>
        </SheetHeader>

        {/* Hidden file input for upsell */}
        <input
          ref={upsellInputRef}
          type="file"
          accept="image/*"
          onChange={handleUpsellFileChange}
          className="hidden"
        />

        <div className="flex flex-col flex-1 pt-6 min-h-0">
          {items.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Your cart is empty</p>
                <p className="text-sm text-muted-foreground mt-1">Add a story to get started!</p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto pr-2 min-h-0">
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.variantId} className="rounded-lg bg-secondary/30 overflow-hidden">
                      <div className="flex gap-4 p-3">
                        <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                          {item.product.node.images?.edges?.[0]?.node && (
                            <img src={item.product.node.images.edges[0].node.url} alt={item.product.node.title} className="w-full h-full object-cover" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm truncate">{item.product.node.title}</h4>
                          {item.personalization && (
                            <div className="text-xs text-muted-foreground mt-1 space-y-0.5">
                              <p>👤 {item.personalization.childName}, ages {item.personalization.childAge}</p>
                              <p>📖 {item.personalization.theme}</p>
                              {item.personalization.strength && <p>💪 {item.personalization.strength}</p>}
                            </div>
                          )}
                          <p className="font-bold text-primary text-sm mt-1">${parseFloat(item.price.amount).toFixed(2)}</p>
                        </div>
                        <div className="flex flex-col items-end gap-2 flex-shrink-0">
                          <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive" onClick={() => removeItem(item.variantId)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                          <div className="flex items-center gap-1">
                            <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => updateQuantity(item.variantId, item.quantity - 1)}>
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                            <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => updateQuantity(item.variantId, item.quantity + 1)}>
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Upsell: Supporting Character */}
                      {item.personalization && !item.personalization.supportingCharacterPhotoUrl && (
                        <div className="mx-3 mb-3 p-3 rounded-lg border border-primary/20 bg-primary/5">
                          <div className="flex items-start gap-3">
                            <Users className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                              <p className="text-sm font-semibold">Add a Supporting Character!</p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                Upload a second photo to include a friend, sibling, or pet in the story
                              </p>
                              <Button
                                variant="outline"
                                size="sm"
                                className="mt-2 text-xs border-primary/30 text-primary hover:bg-primary/10"
                                onClick={() => handleUpsellPhoto(item.variantId)}
                              >
                                <Upload className="h-3 w-3 mr-1" />
                                Upload Photo
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Show supporting character if uploaded */}
                      {item.personalization?.supportingCharacterPhotoUrl && (
                        <div className="mx-3 mb-3 p-3 rounded-lg border border-primary/20 bg-primary/5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg overflow-hidden border border-border">
                              <img src={item.personalization.supportingCharacterPhotoUrl} alt="Supporting character" className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1">
                              <p className="text-xs font-medium flex items-center gap-1">
                                <CheckCircle2 className="h-3 w-3 text-primary" />
                                Supporting character added!
                              </p>
                            </div>
                            <button
                              onClick={() => handleUpsellPhoto(item.variantId)}
                              className="text-xs text-primary hover:underline"
                            >
                              Change
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex-shrink-0 space-y-4 pt-4 border-t border-border">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-display font-bold">Total</span>
                  <span className="text-xl font-bold text-primary">${totalPrice.toFixed(2)}</span>
                </div>
                <Button onClick={handleCheckout} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-display text-base" size="lg" disabled={items.length === 0 || isLoading || isSyncing}>
                  {isLoading || isSyncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <><ExternalLink className="w-4 h-4 mr-2" />Checkout ⭐</>}
                </Button>
                <p className="text-xs text-center text-muted-foreground">⚡ Instant digital download after purchase</p>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
