import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ShoppingCart, Minus, Plus, Trash2, ExternalLink, Loader2, Upload, Users, CheckCircle2, X, CreditCard } from "lucide-react";
import { useCartStore, type ShopifyProduct } from "@/stores/cartStore";
import { supabase } from "@/integrations/supabase/client";
import { attachCartAttributes } from "@/lib/shopify";
import { SUPPORTING_CHARACTER_ADDON, SUPPORTING_CHARACTER_VARIANT_ID, AUDIOBOOK_VARIANT_ID } from "@/lib/products";
import { STRIPE_PRICE_IDS } from "@/lib/stripe";
import { toast } from "sonner";

export const CartDrawer = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const { items, isLoading, isSyncing, updateQuantity, removeItem, ensureCheckoutUrl, syncCart, updatePersonalization, addItem } = useCartStore();
  const [upsellDismissed, setUpsellDismissed] = useState(false);
  const hasSupportingAddon = items.some(i => i.variantId === SUPPORTING_CHARACTER_ADDON.variantId);
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + (parseFloat(item.price.amount) * item.quantity), 0);
  const upsellInputRef = useRef<HTMLInputElement>(null);
  const [upsellTargetVariant, setUpsellTargetVariant] = useState<string | null>(null);

  useEffect(() => { if (isOpen) syncCart(); }, [isOpen, syncCart]);

  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const handleCheckout = async () => {
    // CRITICAL: open the new tab SYNCHRONOUSLY inside the click handler.
    // If we open it after awaits, browsers (especially mobile Safari) block it
    // as a non-user-initiated popup, and clicking checkout appears to "do nothing".
    const checkoutTab = window.open("about:blank", "_blank");

    setCheckoutLoading(true);
    try {
      const cachedCheckoutUrl = useCartStore.getState().checkoutUrl;
      // Navigate the popup immediately to the cached URL so it doesn't sit empty.
      if (checkoutTab && cachedCheckoutUrl) {
        checkoutTab.location.href = cachedCheckoutUrl;
      }

      const checkoutUrl = (await ensureCheckoutUrl()) || cachedCheckoutUrl;
      if (!checkoutUrl) {
        if (checkoutTab) checkoutTab.close();
        toast.error("Checkout needs a fresh session", {
          description: "Please tap checkout again. Your cart is safe and we'll refresh it automatically.",
          position: "top-center",
        });
        return;
      }

      // Make sure the popup ends up at the most current checkout URL
      if (checkoutTab) {
        checkoutTab.location.href = checkoutUrl;
      } else {
        // Popup was blocked — fall back to navigating the current tab
        window.location.href = checkoutUrl;
        return;
      }

      // Find the personalized item to create a pending order from
      const personalized = items.find(i => i.personalization);
      let internalOrderId: string | null = null;

      if (personalized?.personalization) {
        const p = personalized.personalization;

        // Upload customer photos to private bucket so the AI can use them as likeness references
        const uploadDataUrl = async (dataUrl: string, label: string): Promise<string | null> => {
          try {
            if (!dataUrl?.startsWith("data:")) return null;
            const res = await fetch(dataUrl);
            const blob = await res.blob();
            const ext = (blob.type.split("/")[1] || "jpg").replace("jpeg", "jpg");
            const path = `${crypto.randomUUID()}-${label}.${ext}`;
            const { error: upErr } = await supabase.storage
              .from("customer-photos")
              .upload(path, blob, { contentType: blob.type, upsert: false });
            if (upErr) {
              console.error(`${label} photo upload failed:`, upErr);
              return null;
            }
            return path;
          } catch (e) {
            console.error(`${label} photo upload exception:`, e);
            return null;
          }
        };

        const childPhotoPath = p.photoUrl ? await uploadDataUrl(p.photoUrl, "child") : null;
        const supportingPhotoPath = p.supportingCharacterPhotoUrl
          ? await uploadDataUrl(p.supportingCharacterPhotoUrl, "supporting")
          : null;

          const { data: orderData, error: orderError } = await supabase.functions.invoke("create-pending-order", {
            body: {
              childName: p.childName,
              childAge: p.childAge,
              theme: p.theme,
              strength: p.strength || "",
              supportingCharacterName: p.supportingCharacterName || "",
              hasSupportingCharacter: !!p.supportingCharacterPhotoUrl,
              selectedAddons: p.selectedAddons || {},
              customerEmail: p.customerEmail || "",
              childPhotoPath,
              supportingCharacterPhotoPath: supportingPhotoPath,
            },
          });

        if (orderError) {
          console.error("Failed to create pending order:", orderError);
        } else if (orderData?.orderId) {
          internalOrderId = orderData.orderId as string;

          // Attach order id to Shopify cart so the webhook can match payment back
          const cartId = useCartStore.getState().cartId;
          if (cartId) {
            await attachCartAttributes(cartId, [
              { key: "mestar_order_id", value: internalOrderId },
            ]);
          }

          // Keep local copy as fallback (also useful for /order-complete to find by id)
          localStorage.setItem("mestar-pending-story", JSON.stringify({ ...p, orderId: internalOrderId }));
        }
      }

      setIsOpen(false);
      // Send user to order-complete page with order id so it can poll
      if (internalOrderId) {
        navigate(`/order-complete?order_id=${internalOrderId}`);
      } else {
        navigate("/order-complete");
      }
    } catch (err) {
      console.error("Checkout error:", err);
      if (checkoutTab) checkoutTab.close();
      toast.error("Something went wrong. Please try again.", { position: "top-center" });
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleUpsellPhoto = (variantId: string) => {
    setUpsellTargetVariant(variantId);
    upsellInputRef.current?.click();
  };

  const ensureSupportingCharacterAddOn = async () => {
    if (hasSupportingAddon) return;
    const mainItem = items.find(i => i.personalization);
    const addonProduct: ShopifyProduct = {
      node: {
        id: SUPPORTING_CHARACTER_ADDON.variantId,
        title: SUPPORTING_CHARACTER_ADDON.title,
        description: SUPPORTING_CHARACTER_ADDON.description,
        handle: "supporting-character-add-on",
        priceRange: { minVariantPrice: { amount: SUPPORTING_CHARACTER_ADDON.price.toFixed(2), currencyCode: "USD" } },
        images: mainItem?.product.node.images ?? { edges: [] },
        variants: { edges: [] },
        options: [],
      },
    };
    await addItem({
      product: addonProduct,
      variantId: SUPPORTING_CHARACTER_ADDON.variantId,
      variantTitle: SUPPORTING_CHARACTER_ADDON.title,
      price: { amount: SUPPORTING_CHARACTER_ADDON.price.toFixed(2), currencyCode: "USD" },
      quantity: 1,
      selectedOptions: [],
    });
  };

  const handleUpsellFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !upsellTargetVariant) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Photo must be under 5MB");
      return;
    }
    const targetVariant = upsellTargetVariant;
    const reader = new FileReader();
    reader.onloadend = async () => {
      updatePersonalization(targetVariant, {
        supportingCharacterPhotoUrl: reader.result as string,
        selectedAddons: { illustrations: true, coloring: true, character: true },
      });
      await ensureSupportingCharacterAddOn();
      toast.success("Supporting character added! 🌟 (+$9.99)", { position: "top-center" });
      setUpsellTargetVariant(null);
    };
    reader.readAsDataURL(file);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={`Open cart${totalItems > 0 ? ` (${totalItems} item${totalItems !== 1 ? 's' : ''})` : ''}`} className="relative text-foreground hover:text-primary">
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
                          <Button variant="ghost" size="icon" aria-label={`Remove ${item.product.node.title} from cart`} className="h-6 w-6 text-muted-foreground hover:text-destructive" onClick={() => removeItem(item.variantId)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                          <div className="flex items-center gap-1">
                            <Button variant="outline" size="icon" aria-label="Decrease quantity" className="h-6 w-6" onClick={() => updateQuantity(item.variantId, item.quantity - 1)}>
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center text-sm font-medium" aria-label={`Quantity: ${item.quantity}`}>{item.quantity}</span>
                            <Button variant="outline" size="icon" aria-label="Increase quantity" className="h-6 w-6" onClick={() => updateQuantity(item.variantId, item.quantity + 1)}>
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Upsell: Supporting Character (+$9.99) — only on personalized items, hide once dismissed or accepted */}
                      {item.personalization && !item.personalization.supportingCharacterPhotoUrl && !hasSupportingAddon && !upsellDismissed && (
                        <div className="mx-3 mb-3 p-3 rounded-lg border border-primary/30 bg-primary/5 relative">
                          <button
                            type="button"
                            aria-label="Dismiss supporting character offer"
                            className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
                            onClick={() => setUpsellDismissed(true)}
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                          <div className="flex items-start gap-3">
                            <Users className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                            <div className="flex-1 pr-4">
                              <p className="text-sm font-semibold">Add a Supporting Character — +$9.99</p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                Include a sibling, friend, pet, or even yourself in the adventure. Upload a second photo and we'll write them into the story.
                              </p>
                              <div className="flex flex-wrap gap-2 mt-3">
                                <Button
                                  variant="default"
                                  size="sm"
                                  className="text-xs bg-primary text-primary-foreground hover:bg-primary/90"
                                  onClick={() => handleUpsellPhoto(item.variantId)}
                                >
                                  <Upload className="h-3 w-3 mr-1" />
                                  Upload 2nd Photo (+$9.99)
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-xs text-muted-foreground hover:text-foreground"
                                  onClick={() => setUpsellDismissed(true)}
                                >
                                  Continue without — ${parseFloat(item.price.amount).toFixed(2)}
                                </Button>
                              </div>
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
                <Button onClick={handleCheckout} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-display text-base" size="lg" disabled={items.length === 0 || isLoading || isSyncing || checkoutLoading}>
                  {isLoading || isSyncing || checkoutLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><ExternalLink className="w-4 h-4 mr-2" />Checkout ⭐</>}
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
