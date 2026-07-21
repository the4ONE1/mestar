import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { renderToString } from "react-dom/server";
import { useNavigate, Link, useSearchParams, useParams, useLocation, Navigate, StaticRouter, Routes, Route } from "react-router-dom";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as React from "react";
import { useState, useRef, useEffect, useCallback } from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import * as SheetPrimitive from "@radix-ui/react-dialog";
import { X, ShoppingCart, Trash2, Minus, Plus, Users, Upload, CheckCircle2, Loader2, CreditCard, Star, Gift, Shield, Download, Lock, Mail, ChevronDown, ChevronUp, Check, Sparkles, ChevronLeft, ChevronRight, Wand2, Camera, ArrowRight, Volume2, FileText, BookOpen, Clock, ImageIcon, ArrowLeft, Palette, Heart, ShieldCheck, HelpCircle, Mic, Package, Crown } from "lucide-react";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { createClient } from "@supabase/supabase-js";
import { toast } from "sonner";
import * as LabelPrimitive from "@radix-ui/react-label";
import * as SelectPrimitive from "@radix-ui/react-select";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
function cn(...inputs) {
  return twMerge(clsx(inputs));
}
const TooltipProvider = TooltipPrimitive.Provider;
const TooltipContent = React.forwardRef(({ className, sideOffset = 4, ...props }, ref) => /* @__PURE__ */ jsx(
  TooltipPrimitive.Content,
  {
    ref,
    sideOffset,
    className: cn(
      "z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      className
    ),
    ...props
  }
));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline"
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);
const Button = React.forwardRef(
  ({ className, variant, size: size2, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return /* @__PURE__ */ jsx(Comp, { className: cn(buttonVariants({ variant, size: size2, className })), ref, ...props });
  }
);
Button.displayName = "Button";
const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);
function Badge({ className, variant, ...props }) {
  return /* @__PURE__ */ jsx("div", { className: cn(badgeVariants({ variant }), className), ...props });
}
const Sheet = SheetPrimitive.Root;
const SheetTrigger = SheetPrimitive.Trigger;
const SheetPortal = SheetPrimitive.Portal;
const SheetOverlay = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  SheetPrimitive.Overlay,
  {
    className: cn(
      "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    ),
    ...props,
    ref
  }
));
SheetOverlay.displayName = SheetPrimitive.Overlay.displayName;
const sheetVariants = cva(
  "fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=open]:duration-500",
  {
    variants: {
      side: {
        top: "inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
        bottom: "inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
        left: "inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm",
        right: "inset-y-0 right-0 h-full w-3/4  border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm"
      }
    },
    defaultVariants: {
      side: "right"
    }
  }
);
const SheetContent = React.forwardRef(
  ({ side = "right", className, children, ...props }, ref) => /* @__PURE__ */ jsxs(SheetPortal, { children: [
    /* @__PURE__ */ jsx(SheetOverlay, {}),
    /* @__PURE__ */ jsxs(SheetPrimitive.Content, { ref, className: cn(sheetVariants({ side }), className), ...props, children: [
      children,
      /* @__PURE__ */ jsxs(SheetPrimitive.Close, { className: "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity data-[state=open]:bg-secondary hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none", children: [
        /* @__PURE__ */ jsx(X, { className: "h-4 w-4" }),
        /* @__PURE__ */ jsx("span", { className: "sr-only", children: "Close" })
      ] })
    ] })
  ] })
);
SheetContent.displayName = SheetPrimitive.Content.displayName;
const SheetHeader = ({ className, ...props }) => /* @__PURE__ */ jsx("div", { className: cn("flex flex-col space-y-2 text-center sm:text-left", className), ...props });
SheetHeader.displayName = "SheetHeader";
const SheetTitle = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(SheetPrimitive.Title, { ref, className: cn("text-lg font-semibold text-foreground", className), ...props }));
SheetTitle.displayName = SheetPrimitive.Title.displayName;
const SheetDescription = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(SheetPrimitive.Description, { ref, className: cn("text-sm text-muted-foreground", className), ...props }));
SheetDescription.displayName = SheetPrimitive.Description.displayName;
const LOCAL_VARIANT_ID = "gid://mestar/ProductVariant/personalized-storybook";
const LOCAL_PRODUCTS = [
  {
    node: {
      id: "gid://mestar/Product/personalized-storybook",
      title: "Personalized Storybook — Your Child Is the Star",
      description: "A one-of-a-kind digital PDF storybook starring your child. Upload a photo, choose a theme, and download a print-ready book plus matching coloring pages in minutes.",
      handle: "personalized-storybook",
      priceRange: {
        minVariantPrice: { amount: "19.99", currencyCode: "USD" }
      },
      images: {
        edges: [
          { node: { url: "/images/sample-page-1.jpg", altText: "Sample storybook page 1" } },
          { node: { url: "/images/sample-page-2.jpg", altText: "Sample storybook page 2" } },
          { node: { url: "/images/sample-page-3.jpg", altText: "Sample storybook page 3" } },
          { node: { url: "/images/sample-page-4.jpg", altText: "Sample storybook page 4" } }
        ]
      },
      variants: {
        edges: [
          {
            node: {
              id: LOCAL_VARIANT_ID,
              title: "Default",
              price: { amount: "19.99", currencyCode: "USD" },
              availableForSale: true,
              selectedOptions: [{ name: "Format", value: "Digital PDF" }]
            }
          }
        ]
      },
      options: [{ name: "Format", values: ["Digital PDF"] }]
    }
  }
];
async function fetchProducts(_first = 20) {
  return LOCAL_PRODUCTS;
}
async function fetchProductByHandle(handle) {
  return LOCAL_PRODUCTS.find((p) => p.node.handle === handle) ?? null;
}
const LOCAL_CART_ID = "local-cart";
const LOCAL_CHECKOUT_URL = "/checkout";
function localLineId(variantId) {
  return `local-line:${variantId}`;
}
async function createShopifyCart(item) {
  return { cartId: LOCAL_CART_ID, checkoutUrl: LOCAL_CHECKOUT_URL, lineId: localLineId(item.variantId) };
}
async function recreateShopifyCart(items) {
  if (items.length === 0) return null;
  return {
    cartId: LOCAL_CART_ID,
    checkoutUrl: LOCAL_CHECKOUT_URL,
    lineIdByVariantId: Object.fromEntries(items.map((i) => [i.variantId, localLineId(i.variantId)]))
  };
}
async function addLineToShopifyCart(_cartId, item) {
  return { success: true, lineId: localLineId(item.variantId) };
}
async function updateShopifyCartLine(_cartId, _lineId, _quantity) {
  return { success: true };
}
async function removeLineFromShopifyCart(_cartId, _lineId) {
  return { success: true };
}
async function fetchCart(_cartId) {
  return {
    id: LOCAL_CART_ID,
    checkoutUrl: LOCAL_CHECKOUT_URL,
    totalQuantity: 1,
    lines: { edges: [] }
  };
}
const useCartStore = create()(
  persist(
    (set, get) => ({
      items: [],
      cartId: null,
      checkoutUrl: null,
      isLoading: false,
      isSyncing: false,
      addItem: async (item) => {
        const { items, cartId, clearCart } = get();
        const existingItem = items.find((i) => i.variantId === item.variantId);
        set({ isLoading: true });
        try {
          if (!cartId) {
            const result = await createShopifyCart({ ...item, lineId: null });
            if (result) {
              set({ cartId: result.cartId, checkoutUrl: result.checkoutUrl, items: [{ ...item, lineId: result.lineId }] });
            }
          } else if (existingItem) {
            const newQuantity = existingItem.quantity + item.quantity;
            if (!existingItem.lineId) return;
            const result = await updateShopifyCartLine(cartId, existingItem.lineId, newQuantity);
            if (result.success) {
              set({ items: get().items.map((i) => i.variantId === item.variantId ? { ...i, quantity: newQuantity } : i) });
            } else if (result.cartNotFound) clearCart();
          } else {
            const result = await addLineToShopifyCart(cartId, { ...item, lineId: null });
            if (result.success) {
              set({ items: [...get().items, { ...item, lineId: result.lineId ?? null }] });
            } else if (result.cartNotFound) clearCart();
          }
        } catch (error) {
          console.error("Failed to add item:", error);
        } finally {
          set({ isLoading: false });
        }
      },
      updateQuantity: async (variantId, quantity) => {
        if (quantity <= 0) {
          await get().removeItem(variantId);
          return;
        }
        const { items, cartId, clearCart } = get();
        const item = items.find((i) => i.variantId === variantId);
        if (!(item == null ? void 0 : item.lineId) || !cartId) return;
        set({ isLoading: true });
        try {
          const result = await updateShopifyCartLine(cartId, item.lineId, quantity);
          if (result.success) {
            set({ items: get().items.map((i) => i.variantId === variantId ? { ...i, quantity } : i) });
          } else if (result.cartNotFound) clearCart();
        } catch (error) {
          console.error("Failed to update quantity:", error);
        } finally {
          set({ isLoading: false });
        }
      },
      removeItem: async (variantId) => {
        const { items, cartId, clearCart } = get();
        const item = items.find((i) => i.variantId === variantId);
        if (!(item == null ? void 0 : item.lineId) || !cartId) return;
        set({ isLoading: true });
        try {
          const result = await removeLineFromShopifyCart(cartId, item.lineId);
          if (result.success) {
            const newItems = get().items.filter((i) => i.variantId !== variantId);
            newItems.length === 0 ? clearCart() : set({ items: newItems });
          } else if (result.cartNotFound) clearCart();
        } catch (error) {
          console.error("Failed to remove item:", error);
        } finally {
          set({ isLoading: false });
        }
      },
      clearCart: () => set({ items: [], cartId: null, checkoutUrl: null }),
      getCheckoutUrl: () => get().checkoutUrl,
      ensureCheckoutUrl: async () => {
        const { cartId, checkoutUrl, items, clearCart } = get();
        if (items.length === 0) return null;
        if (!cartId) {
          const rebuiltCart = await recreateShopifyCart(items);
          if (!rebuiltCart) return null;
          set({
            cartId: rebuiltCart.cartId,
            checkoutUrl: rebuiltCart.checkoutUrl,
            items: items.map((item) => ({
              ...item,
              lineId: rebuiltCart.lineIdByVariantId[item.variantId] ?? null
            }))
          });
          return rebuiltCart.checkoutUrl;
        }
        try {
          const cart = await fetchCart(cartId);
          if (!cart || cart.totalQuantity === 0) {
            const rebuiltCart = await recreateShopifyCart(items);
            if (!rebuiltCart) {
              clearCart();
              return null;
            }
            set({
              cartId: rebuiltCart.cartId,
              checkoutUrl: rebuiltCart.checkoutUrl,
              items: items.map((item) => ({
                ...item,
                lineId: rebuiltCart.lineIdByVariantId[item.variantId] ?? null
              }))
            });
            return rebuiltCart.checkoutUrl;
          }
          const lineIdByVariantId = Object.fromEntries(
            (cart.lines.edges || []).map(({ node }) => [node.merchandise.id, node.id])
          );
          set({
            checkoutUrl: cart.checkoutUrl,
            items: items.map((item) => ({
              ...item,
              lineId: lineIdByVariantId[item.variantId] ?? item.lineId
            }))
          });
          return cart.checkoutUrl;
        } catch (error) {
          console.error("Failed to ensure checkout URL:", error);
          return checkoutUrl;
        }
      },
      updatePersonalization: (variantId, updates) => {
        set({
          items: get().items.map(
            (i) => i.variantId === variantId ? { ...i, personalization: { ...i.personalization, ...updates } } : i
          )
        });
      },
      syncCart: async () => {
        const { cartId, isSyncing, clearCart } = get();
        if (!cartId || isSyncing) return;
        set({ isSyncing: true });
        try {
          const cart = await fetchCart(cartId);
          if (!cart || cart.totalQuantity === 0) clearCart();
          else if (cart.checkoutUrl) set({ checkoutUrl: cart.checkoutUrl });
        } catch (error) {
          console.error("Failed to sync cart:", error);
        } finally {
          set({ isSyncing: false });
        }
      }
    }),
    {
      name: "shopify-cart",
      storage: createJSONStorage(
        () => typeof window !== "undefined" ? localStorage : { getItem: () => null, setItem: () => {
        }, removeItem: () => {
        } }
      ),
      partialize: (state) => ({ items: state.items, cartId: state.cartId, checkoutUrl: state.checkoutUrl })
    }
  )
);
const SUPABASE_URL = "https://gqgloucjqvhbbjyxfgqw.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdxZ2xvdWNqcXZoYmJqeXhmZ3F3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUyMzgwMjEsImV4cCI6MjA5MDgxNDAyMX0.MQ9w8FY6maFP-ue_1Qzar5qoOPj5Z_BQmUp4poA0UYE";
const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true
  }
});
const BASE_PRICE = 19.99;
const SUPPORTING_CHARACTER_PRICE = 9.99;
const AUDIOBOOK_PRICE = 4.99;
const SUPPORTING_CHARACTER_VARIANT_ID = "gid://shopify/ProductVariant/46218235412677";
const AUDIOBOOK_VARIANT_ID = "gid://shopify/ProductVariant/46302514806981";
const SUPPORTING_CHARACTER_ADDON = {
  variantId: SUPPORTING_CHARACTER_VARIANT_ID,
  title: "Supporting Character Add-On",
  price: SUPPORTING_CHARACTER_PRICE,
  description: "Add a sibling, friend, pet, or even yourself as a supporting character by uploading a second photo."
};
const AUDIOBOOK_ADDON = {
  variantId: AUDIOBOOK_VARIANT_ID,
  title: "Audiobook Add-On — Karaoke Read-Aloud",
  price: AUDIOBOOK_PRICE,
  description: "Narrated audiobook of your child's story with karaoke-style word highlighting — perfect for early readers learning to follow along."
};
const STRIPE_PRICE_IDS = {
  storybook: "personalized_storybook_onetime",
  supportingCharacter: "supporting_character_addon_onetime",
  coloring: "coloring_pages_addon_onetime",
  audiobookBasic: "audiobook_basic_onetime"
};
const CartDrawer = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const { items, updateQuantity, removeItem, syncCart, updatePersonalization, addItem } = useCartStore();
  const [upsellDismissed, setUpsellDismissed] = useState(false);
  const hasSupportingAddon = items.some((i) => i.variantId === SUPPORTING_CHARACTER_ADDON.variantId);
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + parseFloat(item.price.amount) * item.quantity, 0);
  const upsellInputRef = useRef(null);
  const [upsellTargetVariant, setUpsellTargetVariant] = useState(null);
  useEffect(() => {
    if (isOpen) syncCart();
  }, [isOpen, syncCart]);
  const [stripeLoading, setStripeLoading] = useState(false);
  const handleStripeCheckout = async () => {
    var _a;
    setStripeLoading(true);
    try {
      const personalized = items.find((i) => i.personalization);
      if (!(personalized == null ? void 0 : personalized.personalization)) {
        toast.error("Please personalize your storybook first.", { position: "top-center" });
        return;
      }
      const p = personalized.personalization;
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
          childPhotoDataUrl: p.photoUrl || null,
          supportingCharacterPhotoDataUrl: p.supportingCharacterPhotoUrl || null
        }
      });
      if (orderError || !(orderData == null ? void 0 : orderData.orderId)) {
        console.error("create-pending-order failed:", orderError);
        toast.error("Could not start checkout. Please try again.", { position: "top-center" });
        return;
      }
      const orderId = orderData.orderId;
      const recoveryToken = (orderData == null ? void 0 : orderData.recoveryToken) || null;
      const priceIds = [STRIPE_PRICE_IDS.storybook];
      for (const item of items) {
        if (item.variantId === SUPPORTING_CHARACTER_VARIANT_ID) priceIds.push(STRIPE_PRICE_IDS.supportingCharacter);
        else if (item.variantId === AUDIOBOOK_VARIANT_ID) priceIds.push(STRIPE_PRICE_IDS.audiobookBasic);
      }
      if ((_a = p.selectedAddons) == null ? void 0 : _a.coloring) priceIds.push(STRIPE_PRICE_IDS.coloring);
      localStorage.setItem("mestar-pending-story", JSON.stringify({ ...p, orderId, recoveryToken }));
      setIsOpen(false);
      const params = new URLSearchParams({
        order_id: orderId,
        prices: Array.from(new Set(priceIds)).join(","),
        ...p.customerEmail ? { email: p.customerEmail } : {}
      });
      navigate(`/checkout?${params.toString()}`);
    } catch (err) {
      console.error("Stripe checkout error:", err);
      toast.error("Something went wrong. Please try again.", { position: "top-center" });
    } finally {
      setStripeLoading(false);
    }
  };
  const handleUpsellPhoto = (variantId) => {
    var _a;
    setUpsellTargetVariant(variantId);
    (_a = upsellInputRef.current) == null ? void 0 : _a.click();
  };
  const ensureSupportingCharacterAddOn = async () => {
    if (hasSupportingAddon) return;
    const mainItem = items.find((i) => i.personalization);
    const addonProduct = {
      node: {
        id: SUPPORTING_CHARACTER_ADDON.variantId,
        title: SUPPORTING_CHARACTER_ADDON.title,
        description: SUPPORTING_CHARACTER_ADDON.description,
        handle: "supporting-character-add-on",
        priceRange: { minVariantPrice: { amount: SUPPORTING_CHARACTER_ADDON.price.toFixed(2), currencyCode: "USD" } },
        images: (mainItem == null ? void 0 : mainItem.product.node.images) ?? { edges: [] },
        variants: { edges: [] },
        options: []
      }
    };
    await addItem({
      product: addonProduct,
      variantId: SUPPORTING_CHARACTER_ADDON.variantId,
      variantTitle: SUPPORTING_CHARACTER_ADDON.title,
      price: { amount: SUPPORTING_CHARACTER_ADDON.price.toFixed(2), currencyCode: "USD" },
      quantity: 1,
      selectedOptions: []
    });
  };
  const handleUpsellFileChange = async (e) => {
    var _a;
    const file = (_a = e.target.files) == null ? void 0 : _a[0];
    if (!file || !upsellTargetVariant) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Photo must be under 5MB");
      return;
    }
    const targetVariant = upsellTargetVariant;
    const reader = new FileReader();
    reader.onloadend = async () => {
      updatePersonalization(targetVariant, {
        supportingCharacterPhotoUrl: reader.result,
        selectedAddons: { illustrations: true, coloring: true, character: true }
      });
      await ensureSupportingCharacterAddOn();
      toast.success("Supporting character added! 🌟 (+$9.99)", { position: "top-center" });
      setUpsellTargetVariant(null);
    };
    reader.readAsDataURL(file);
  };
  return /* @__PURE__ */ jsxs(Sheet, { open: isOpen, onOpenChange: setIsOpen, children: [
    /* @__PURE__ */ jsx(SheetTrigger, { asChild: true, children: /* @__PURE__ */ jsxs(Button, { variant: "ghost", size: "icon", "aria-label": `Open cart${totalItems > 0 ? ` (${totalItems} item${totalItems !== 1 ? "s" : ""})` : ""}`, className: "relative text-foreground hover:text-primary", children: [
      /* @__PURE__ */ jsx(ShoppingCart, { className: "h-5 w-5" }),
      totalItems > 0 && /* @__PURE__ */ jsx(Badge, { className: "absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-primary text-primary-foreground", children: totalItems })
    ] }) }),
    /* @__PURE__ */ jsxs(SheetContent, { className: "w-full sm:max-w-lg flex flex-col h-full bg-card border-border", children: [
      /* @__PURE__ */ jsxs(SheetHeader, { className: "flex-shrink-0", children: [
        /* @__PURE__ */ jsx(SheetTitle, { className: "font-display text-xl", children: "Your Cart ⭐" }),
        /* @__PURE__ */ jsx(SheetDescription, { children: totalItems === 0 ? "Your cart is empty" : `${totalItems} item${totalItems !== 1 ? "s" : ""} in your cart` })
      ] }),
      /* @__PURE__ */ jsx(
        "input",
        {
          ref: upsellInputRef,
          type: "file",
          accept: "image/*",
          onChange: handleUpsellFileChange,
          className: "hidden"
        }
      ),
      /* @__PURE__ */ jsx("div", { className: "flex flex-col flex-1 pt-6 min-h-0", children: items.length === 0 ? /* @__PURE__ */ jsx("div", { className: "flex-1 flex items-center justify-center", children: /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
        /* @__PURE__ */ jsx(ShoppingCart, { className: "h-12 w-12 text-muted-foreground mx-auto mb-4" }),
        /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: "Your cart is empty" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "Add a story to get started!" })
      ] }) }) : /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx("div", { className: "flex-1 overflow-y-auto pr-2 min-h-0", children: /* @__PURE__ */ jsx("div", { className: "space-y-4", children: items.map((item) => {
          var _a, _b, _c, _d;
          return /* @__PURE__ */ jsxs("div", { className: "rounded-lg bg-secondary/30 overflow-hidden", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex gap-4 p-3", children: [
              /* @__PURE__ */ jsx("div", { className: "w-16 h-16 rounded-lg overflow-hidden flex-shrink-0", children: ((_c = (_b = (_a = item.product.node.images) == null ? void 0 : _a.edges) == null ? void 0 : _b[0]) == null ? void 0 : _c.node) && /* @__PURE__ */ jsx("img", { src: item.product.node.images.edges[0].node.url, alt: item.product.node.title, className: "w-full h-full object-cover" }) }),
              /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
                /* @__PURE__ */ jsx("h4", { className: "font-semibold text-sm truncate", children: item.product.node.title }),
                item.personalization && /* @__PURE__ */ jsxs("div", { className: "text-xs text-muted-foreground mt-1 space-y-0.5", children: [
                  /* @__PURE__ */ jsxs("p", { children: [
                    "👤 ",
                    item.personalization.childName,
                    ", ages ",
                    item.personalization.childAge
                  ] }),
                  /* @__PURE__ */ jsxs("p", { children: [
                    "📖 ",
                    item.personalization.theme
                  ] }),
                  item.personalization.strength && /* @__PURE__ */ jsxs("p", { children: [
                    "💪 ",
                    item.personalization.strength
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("p", { className: "font-bold text-primary text-sm mt-1", children: [
                  "$",
                  parseFloat(item.price.amount).toFixed(2)
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-end gap-2 flex-shrink-0", children: [
                /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "icon", "aria-label": `Remove ${item.product.node.title} from cart`, className: "h-6 w-6 text-muted-foreground hover:text-destructive", onClick: () => removeItem(item.variantId), children: /* @__PURE__ */ jsx(Trash2, { className: "h-3 w-3" }) }),
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1", children: [
                  /* @__PURE__ */ jsx(Button, { variant: "outline", size: "icon", "aria-label": "Decrease quantity", className: "h-6 w-6", onClick: () => updateQuantity(item.variantId, item.quantity - 1), children: /* @__PURE__ */ jsx(Minus, { className: "h-3 w-3" }) }),
                  /* @__PURE__ */ jsx("span", { className: "w-8 text-center text-sm font-medium", "aria-label": `Quantity: ${item.quantity}`, children: item.quantity }),
                  /* @__PURE__ */ jsx(Button, { variant: "outline", size: "icon", "aria-label": "Increase quantity", className: "h-6 w-6", onClick: () => updateQuantity(item.variantId, item.quantity + 1), children: /* @__PURE__ */ jsx(Plus, { className: "h-3 w-3" }) })
                ] })
              ] })
            ] }),
            item.personalization && !item.personalization.supportingCharacterPhotoUrl && !hasSupportingAddon && !upsellDismissed && /* @__PURE__ */ jsxs("div", { className: "mx-3 mb-3 p-3 rounded-lg border border-primary/30 bg-primary/5 relative", children: [
              /* @__PURE__ */ jsx(
                "button",
                {
                  type: "button",
                  "aria-label": "Dismiss supporting character offer",
                  className: "absolute top-2 right-2 text-muted-foreground hover:text-foreground",
                  onClick: () => setUpsellDismissed(true),
                  children: /* @__PURE__ */ jsx(X, { className: "h-3.5 w-3.5" })
                }
              ),
              /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
                /* @__PURE__ */ jsx(Users, { className: "h-5 w-5 text-primary flex-shrink-0 mt-0.5" }),
                /* @__PURE__ */ jsxs("div", { className: "flex-1 pr-4", children: [
                  /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold", children: "Add a Supporting Character — +$9.99" }),
                  /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: "Include a sibling, friend, pet, or even yourself in the adventure. Upload a second photo and we'll write them into the story." }),
                  /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-2 mt-3", children: [
                    /* @__PURE__ */ jsxs(
                      Button,
                      {
                        variant: "default",
                        size: "sm",
                        className: "text-xs bg-primary text-primary-foreground hover:bg-primary/90",
                        onClick: () => handleUpsellPhoto(item.variantId),
                        children: [
                          /* @__PURE__ */ jsx(Upload, { className: "h-3 w-3 mr-1" }),
                          "Upload 2nd Photo (+$9.99)"
                        ]
                      }
                    ),
                    /* @__PURE__ */ jsxs(
                      Button,
                      {
                        variant: "ghost",
                        size: "sm",
                        className: "text-xs text-muted-foreground hover:text-foreground",
                        onClick: () => setUpsellDismissed(true),
                        children: [
                          "Continue without — $",
                          parseFloat(item.price.amount).toFixed(2)
                        ]
                      }
                    )
                  ] })
                ] })
              ] })
            ] }),
            ((_d = item.personalization) == null ? void 0 : _d.supportingCharacterPhotoUrl) && /* @__PURE__ */ jsx("div", { className: "mx-3 mb-3 p-3 rounded-lg border border-primary/20 bg-primary/5", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
              /* @__PURE__ */ jsx("div", { className: "w-10 h-10 rounded-lg overflow-hidden border border-border", children: /* @__PURE__ */ jsx("img", { src: item.personalization.supportingCharacterPhotoUrl, alt: "Supporting character", className: "w-full h-full object-cover" }) }),
              /* @__PURE__ */ jsx("div", { className: "flex-1", children: /* @__PURE__ */ jsxs("p", { className: "text-xs font-medium flex items-center gap-1", children: [
                /* @__PURE__ */ jsx(CheckCircle2, { className: "h-3 w-3 text-primary" }),
                "Supporting character added!"
              ] }) }),
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => handleUpsellPhoto(item.variantId),
                  className: "text-xs text-primary hover:underline",
                  children: "Change"
                }
              )
            ] }) })
          ] }, item.variantId);
        }) }) }),
        /* @__PURE__ */ jsxs("div", { className: "flex-shrink-0 space-y-4 pt-4 border-t border-border", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center", children: [
            /* @__PURE__ */ jsx("span", { className: "text-lg font-display font-bold", children: "Total" }),
            /* @__PURE__ */ jsxs("span", { className: "text-xl font-bold text-primary", children: [
              "$",
              totalPrice.toFixed(2)
            ] })
          ] }),
          /* @__PURE__ */ jsx(Button, { onClick: handleStripeCheckout, className: "w-full bg-primary text-primary-foreground hover:bg-primary/90 font-display text-base", size: "lg", disabled: items.length === 0 || stripeLoading, children: stripeLoading ? /* @__PURE__ */ jsx(Loader2, { className: "w-4 h-4 animate-spin" }) : /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx(CreditCard, { className: "w-4 h-4 mr-2" }),
            "Pay Securely with Card ⭐"
          ] }) }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-center text-muted-foreground", children: "⚡ Instant digital download after purchase • Secure checkout by Stripe" })
        ] })
      ] }) })
    ] })
  ] });
};
const Navbar = () => {
  return /* @__PURE__ */ jsx("nav", { className: "sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border", children: /* @__PURE__ */ jsxs("div", { className: "container flex items-center justify-between h-16", children: [
    /* @__PURE__ */ jsxs(Link, { to: "/", className: "flex items-center gap-2 group", children: [
      /* @__PURE__ */ jsx(Star, { className: "h-6 w-6 text-primary fill-primary group-hover:animate-twinkle" }),
      /* @__PURE__ */ jsxs("span", { className: "font-display text-xl font-bold text-foreground", children: [
        "My ",
        /* @__PURE__ */ jsx("span", { className: "text-star-yellow", children: "Star" }),
        " Stories"
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
      /* @__PURE__ */ jsx(Link, { to: "/products", className: "text-sm font-bold text-primary hover:text-primary/80 transition-colors", children: "Shop" }),
      /* @__PURE__ */ jsx(Link, { to: "/about", className: "text-sm font-medium text-muted-foreground hover:text-foreground transition-colors", children: "About" }),
      /* @__PURE__ */ jsx(Link, { to: "/faq", className: "text-sm font-medium text-muted-foreground hover:text-foreground transition-colors", children: "FAQ" }),
      /* @__PURE__ */ jsx(Link, { to: "/reviews", className: "text-sm font-medium text-muted-foreground hover:text-foreground transition-colors", children: "Reviews" }),
      /* @__PURE__ */ jsx(Link, { to: "/why-read-together", className: "hidden sm:inline text-sm font-medium text-muted-foreground hover:text-foreground transition-colors", children: "Why Read" }),
      /* @__PURE__ */ jsx(CartDrawer, {})
    ] })
  ] }) });
};
const Input = React.forwardRef(
  ({ className, type, ...props }, ref) => {
    return /* @__PURE__ */ jsx(
      "input",
      {
        type,
        className: cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        ),
        ref,
        ...props
      }
    );
  }
);
Input.displayName = "Input";
const NewsletterForm = ({ source, variant = "default", className = "" }) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [code, setCode] = useState(null);
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      toast.error("Please enter a valid email", { position: "top-center" });
      return;
    }
    setLoading(true);
    try {
      const supabaseUrl = "https://gqgloucjqvhbbjyxfgqw.supabase.co";
      const anonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdxZ2xvdWNqcXZoYmJqeXhmZ3F3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUyMzgwMjEsImV4cCI6MjA5MDgxNDAyMX0.MQ9w8FY6maFP-ue_1Qzar5qoOPj5Z_BQmUp4poA0UYE";
      const resp = await fetch(`${supabaseUrl}/functions/v1/subscribe-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${anonKey}`,
          apikey: anonKey
        },
        body: JSON.stringify({ email: email.trim(), source })
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || "Something went wrong");
      setSuccess(true);
      setCode(data.code || "WELCOME");
      toast.success(
        data.alreadySubscribed ? "You're already on the list — code: WELCOME ⭐" : "Check your inbox for your discount code! ⭐",
        { position: "top-center" }
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Try again in a moment";
      toast.error(msg, { position: "top-center" });
    } finally {
      setLoading(false);
    }
  };
  if (success && code) {
    return /* @__PURE__ */ jsxs("div", { className: `text-center ${className}`, children: [
      /* @__PURE__ */ jsxs("div", { className: "inline-flex items-center gap-2 text-primary mb-2", children: [
        /* @__PURE__ */ jsx(CheckCircle2, { className: "h-5 w-5" }),
        /* @__PURE__ */ jsx("span", { className: "font-display font-bold", children: "You're in!" })
      ] }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground mb-3", children: "Use this code at checkout (orders $25+):" }),
      /* @__PURE__ */ jsxs("div", { className: "inline-block bg-primary/10 border-2 border-dashed border-primary rounded-xl px-6 py-3", children: [
        /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wider font-medium", children: "Your code" }),
        /* @__PURE__ */ jsx("p", { className: "text-2xl font-display font-extrabold text-primary tracking-widest", children: code })
      ] }),
      /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground mt-3", children: [
        "We've also emailed it to ",
        email,
        "."
      ] })
    ] });
  }
  const isPopup = variant === "popup";
  return /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className, children: [
    isPopup && /* @__PURE__ */ jsxs("div", { className: "text-center mb-4", children: [
      /* @__PURE__ */ jsx("div", { className: "inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 border border-primary/30 mb-3", children: /* @__PURE__ */ jsx(Gift, { className: "h-7 w-7 text-primary" }) }),
      /* @__PURE__ */ jsx("h2", { className: "font-display text-2xl font-extrabold mb-1", children: "Get 20% Off Your First Story" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Join our family of parents — we'll email your code instantly. Valid on orders $25+." })
    ] }),
    !isPopup && /* @__PURE__ */ jsxs("div", { className: "mb-3", children: [
      /* @__PURE__ */ jsxs("p", { className: "font-display font-bold text-foreground flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(Gift, { className: "h-4 w-4 text-primary" }),
        " Get 20% off your first story"
      ] }),
      /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Email-only · orders $25+ · one-time use" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: `flex gap-2 ${isPopup ? "flex-col sm:flex-row" : "flex-col sm:flex-row"}`, children: [
      /* @__PURE__ */ jsx(
        Input,
        {
          type: "email",
          required: true,
          placeholder: "your@email.com",
          value: email,
          onChange: (e) => setEmail(e.target.value),
          className: "flex-1 bg-background",
          maxLength: 255,
          "aria-label": "Email address"
        }
      ),
      /* @__PURE__ */ jsx(
        Button,
        {
          type: "submit",
          disabled: loading,
          className: "bg-primary text-primary-foreground hover:bg-primary/90 font-display rounded-full px-6 whitespace-nowrap",
          children: loading ? /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 animate-spin" }) : "Send My Code"
        }
      )
    ] }),
    isPopup && /* @__PURE__ */ jsx("p", { className: "text-[11px] text-muted-foreground text-center mt-3", children: "No spam. Unsubscribe anytime." })
  ] });
};
const Footer = () => {
  return /* @__PURE__ */ jsx("footer", { className: "bg-card border-t border-border py-12", children: /* @__PURE__ */ jsxs("div", { className: "container", children: [
    /* @__PURE__ */ jsx("div", { className: "max-w-xl mx-auto mb-10 bg-background/60 border border-border rounded-2xl p-6", children: /* @__PURE__ */ jsx(NewsletterForm, { source: "footer" }) }),
    /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto mb-10", children: [
      { icon: Shield, text: "Secure Checkout" },
      { icon: Download, text: "Instant PDF" },
      { icon: Lock, text: "Privacy First" },
      { icon: Star, text: "Family Loved" }
    ].map(({ icon: Icon, text }) => /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center gap-1 text-center", children: [
      /* @__PURE__ */ jsx(Icon, { className: "h-5 w-5 text-primary" }),
      /* @__PURE__ */ jsx("span", { className: "text-[11px] font-bold text-muted-foreground uppercase tracking-wider", children: text })
    ] }, text)) }),
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center gap-4 text-center", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(Star, { className: "h-5 w-5 text-primary fill-primary" }),
        /* @__PURE__ */ jsxs("span", { className: "font-display text-lg font-bold", children: [
          "My ",
          /* @__PURE__ */ jsx("span", { className: "text-star-yellow", children: "Star" }),
          " Stories"
        ] })
      ] }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground max-w-md", children: "Where every child becomes the hero of their own bedtime adventure. ⭐" }),
      /* @__PURE__ */ jsxs("div", { className: "bg-background/60 border border-border rounded-2xl px-6 py-4 mt-2", children: [
        /* @__PURE__ */ jsx("p", { className: "text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2", children: "Questions? We'd love to hear from you" }),
        /* @__PURE__ */ jsxs(
          "a",
          {
            href: "mailto:hello@mestar.pro",
            className: "inline-flex items-center gap-2 text-base font-semibold text-foreground hover:text-primary transition-colors",
            children: [
              /* @__PURE__ */ jsx(Mail, { className: "h-4 w-4 text-primary" }),
              "hello@mestar.pro"
            ]
          }
        ),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "We reply within 24 hours, 7 days a week." })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap justify-center gap-x-6 gap-y-3 text-sm text-muted-foreground mt-2 text-center", children: [
        /* @__PURE__ */ jsx("a", { href: "/about", className: "hover:text-foreground transition-colors", children: "About" }),
        /* @__PURE__ */ jsx("a", { href: "/faq", className: "hover:text-foreground transition-colors", children: "FAQ" }),
        /* @__PURE__ */ jsx("a", { href: "/reviews", className: "hover:text-foreground transition-colors", children: "Reviews" }),
        /* @__PURE__ */ jsx("a", { href: "/why-read-together", className: "hover:text-foreground transition-colors", children: "Why Read" }),
        /* @__PURE__ */ jsx("a", { href: "/products", className: "hover:text-foreground transition-colors", children: "Shop" }),
        /* @__PURE__ */ jsx("a", { href: "/privacy-policy", className: "hover:text-foreground transition-colors", children: "Privacy Policy" }),
        /* @__PURE__ */ jsxs("a", { href: "mailto:hello@mestar.pro", className: "hover:text-foreground transition-colors inline-flex items-center gap-1", children: [
          /* @__PURE__ */ jsx(Mail, { className: "h-3 w-3" }),
          " Contact"
        ] })
      ] }),
      /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground mt-4", children: [
        "© ",
        (/* @__PURE__ */ new Date()).getFullYear(),
        " My ",
        /* @__PURE__ */ jsx("span", { className: "text-star-yellow", children: "Star" }),
        " Stories. All rights reserved."
      ] })
    ] })
  ] }) });
};
const labelVariants = cva("text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70");
const Label = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(LabelPrimitive.Root, { ref, className: cn(labelVariants(), className), ...props }));
Label.displayName = LabelPrimitive.Root.displayName;
const Select = SelectPrimitive.Root;
const SelectValue = SelectPrimitive.Value;
const SelectTrigger = React.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxs(
  SelectPrimitive.Trigger,
  {
    ref,
    className: cn(
      "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
      className
    ),
    ...props,
    children: [
      children,
      /* @__PURE__ */ jsx(SelectPrimitive.Icon, { asChild: true, children: /* @__PURE__ */ jsx(ChevronDown, { className: "h-4 w-4 opacity-50" }) })
    ]
  }
));
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;
const SelectScrollUpButton = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  SelectPrimitive.ScrollUpButton,
  {
    ref,
    className: cn("flex cursor-default items-center justify-center py-1", className),
    ...props,
    children: /* @__PURE__ */ jsx(ChevronUp, { className: "h-4 w-4" })
  }
));
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName;
const SelectScrollDownButton = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  SelectPrimitive.ScrollDownButton,
  {
    ref,
    className: cn("flex cursor-default items-center justify-center py-1", className),
    ...props,
    children: /* @__PURE__ */ jsx(ChevronDown, { className: "h-4 w-4" })
  }
));
SelectScrollDownButton.displayName = SelectPrimitive.ScrollDownButton.displayName;
const SelectContent = React.forwardRef(({ className, children, position = "popper", ...props }, ref) => /* @__PURE__ */ jsx(SelectPrimitive.Portal, { children: /* @__PURE__ */ jsxs(
  SelectPrimitive.Content,
  {
    ref,
    className: cn(
      "relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      position === "popper" && "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
      className
    ),
    position,
    ...props,
    children: [
      /* @__PURE__ */ jsx(SelectScrollUpButton, {}),
      /* @__PURE__ */ jsx(
        SelectPrimitive.Viewport,
        {
          className: cn(
            "p-1",
            position === "popper" && "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"
          ),
          children
        }
      ),
      /* @__PURE__ */ jsx(SelectScrollDownButton, {})
    ]
  }
) }));
SelectContent.displayName = SelectPrimitive.Content.displayName;
const SelectLabel = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(SelectPrimitive.Label, { ref, className: cn("py-1.5 pl-8 pr-2 text-sm font-semibold", className), ...props }));
SelectLabel.displayName = SelectPrimitive.Label.displayName;
const SelectItem = React.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxs(
  SelectPrimitive.Item,
  {
    ref,
    className: cn(
      "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 focus:bg-accent focus:text-accent-foreground",
      className
    ),
    ...props,
    children: [
      /* @__PURE__ */ jsx("span", { className: "absolute left-2 flex h-3.5 w-3.5 items-center justify-center", children: /* @__PURE__ */ jsx(SelectPrimitive.ItemIndicator, { children: /* @__PURE__ */ jsx(Check, { className: "h-4 w-4" }) }) }),
      /* @__PURE__ */ jsx(SelectPrimitive.ItemText, { children })
    ]
  }
));
SelectItem.displayName = SelectPrimitive.Item.displayName;
const SelectSeparator = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(SelectPrimitive.Separator, { ref, className: cn("-mx-1 my-1 h-px bg-muted", className), ...props }));
SelectSeparator.displayName = SelectPrimitive.Separator.displayName;
const fairy1 = "/images/sample-page-1.jpg";
const fairy2 = "/images/sample-page-2.jpg";
const fairy3 = "/images/sample-page-3.jpg";
const fairy4 = "/images/sample-page-4.jpg";
const ocean1 = "/images/samples/ocean-1.jpg";
const ocean2 = "/images/samples/ocean-2.jpg";
const ocean3 = "/images/samples/ocean-3.jpg";
const ocean4 = "/images/samples/ocean-4.jpg";
const prince1 = "/images/samples/prince-1.jpg";
const prince2 = "/images/samples/prince-2.jpg";
const prince3 = "/images/samples/prince-3.jpg";
const prince4 = "/images/samples/prince-4.jpg";
const space1 = "/images/samples/space-1.jpg";
const space2 = "/images/samples/space-2.jpg";
const space3 = "/images/samples/space-3.jpg";
const space4 = "/images/samples/space-4.jpg";
const dino1 = "/images/samples/dino-1.jpg";
const dino2 = "/images/samples/dino-2.jpg";
const dino3 = "/images/samples/dino-3.jpg";
const dino4 = "/images/samples/dino-4.jpg";
const coloringFairy = "/images/samples/coloring-fairy.jpg";
const coloringOcean = "/images/samples/coloring-ocean.jpg";
const coloringPrince = "/images/samples/coloring-prince.jpg";
const coloringSpace = "/images/samples/coloring-space.jpg";
const coloringDino = "/images/samples/coloring-dino.jpg";
const THEME_COLORING = {
  "Fairy Tale": coloringFairy,
  "Ocean Adventure & Pirates": coloringOcean,
  "Prince & Princess": coloringPrince,
  "Outer Space": coloringSpace,
  Dinosaurs: coloringDino
};
const THEME_SAMPLES = {
  "Fairy Tale": [
    { src: fairy1, alt: "Fairy Tale sample - the stars have vanished", pageNum: 1 },
    { src: fairy2, alt: "Fairy Tale sample - entering the Whispering Woods", pageNum: 2 },
    { src: fairy3, alt: "Fairy Tale sample - meeting Oliver the Owl", pageNum: 3 },
    { src: fairy4, alt: "Fairy Tale sample - cliffhanger ending", pageNum: 4 }
  ],
  "Ocean Adventure & Pirates": [
    { src: ocean1, alt: "Ocean sample - the treasure map is missing pieces", pageNum: 1 },
    { src: ocean2, alt: "Ocean sample - sailing the pirate ship", pageNum: 2 },
    { src: ocean3, alt: "Ocean sample - meeting a friendly octopus", pageNum: 3 },
    { src: ocean4, alt: "Ocean sample - cliffhanger whirlpool", pageNum: 4 }
  ],
  "Prince & Princess": [
    { src: prince1, alt: "Prince sample - the crown's jewel is missing", pageNum: 1 },
    { src: prince2, alt: "Prince sample - walking the castle halls", pageNum: 2 },
    { src: prince3, alt: "Prince sample - meeting the wise royal advisor", pageNum: 3 },
    { src: prince4, alt: "Prince sample - cliffhanger hidden door", pageNum: 4 }
  ],
  "Outer Space": [
    { src: space1, alt: "Space sample - a star has gone dark", pageNum: 1 },
    { src: space2, alt: "Space sample - flying the rocket ship", pageNum: 2 },
    { src: space3, alt: "Space sample - meeting a friendly alien", pageNum: 3 },
    { src: space4, alt: "Space sample - cliffhanger swirling nebula", pageNum: 4 }
  ],
  Dinosaurs: [
    { src: dino1, alt: "Dinosaur sample - the empty nest", pageNum: 1 },
    { src: dino2, alt: "Dinosaur sample - exploring the jungle", pageNum: 2 },
    { src: dino3, alt: "Dinosaur sample - meeting the baby T-Rex", pageNum: 3 },
    { src: dino4, alt: "Dinosaur sample - cliffhanger hidden valley", pageNum: 4 }
  ]
};
const THEME_ORDER = [
  "Fairy Tale",
  "Ocean Adventure & Pirates",
  "Prince & Princess",
  "Outer Space",
  "Dinosaurs"
];
const StoryPreview = ({ productHandle, theme, embedded = false }) => {
  const [activeTheme, setActiveTheme] = useState(
    theme && THEME_SAMPLES[theme] ? theme : "Fairy Tale"
  );
  const [currentPage, setCurrentPage] = useState(0);
  useEffect(() => {
    if (theme && THEME_SAMPLES[theme]) {
      setActiveTheme(theme);
      setCurrentPage(0);
    }
  }, [theme]);
  const pages = THEME_SAMPLES[activeTheme] ?? THEME_SAMPLES["Fairy Tale"];
  const isLastPage = currentPage === pages.length - 1;
  const isControlled = !!theme;
  const goNext = () => {
    if (currentPage < pages.length - 1) setCurrentPage(currentPage + 1);
  };
  const goPrev = () => {
    if (currentPage > 0) setCurrentPage(currentPage - 1);
  };
  const handleThemeClick = (t) => {
    setActiveTheme(t);
    setCurrentPage(0);
  };
  const Wrapper = embedded ? "div" : "section";
  return /* @__PURE__ */ jsx(Wrapper, { className: embedded ? "" : "py-16", children: /* @__PURE__ */ jsxs("div", { className: embedded ? "" : "container", children: [
    !embedded && /* @__PURE__ */ jsxs("div", { className: "text-center mb-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "inline-flex items-center gap-2 bg-primary/20 border border-primary/30 rounded-full px-4 py-2 mb-4", children: [
        /* @__PURE__ */ jsx(Sparkles, { className: "h-4 w-4 text-primary" }),
        /* @__PURE__ */ jsx("span", { className: "text-sm font-bold text-primary", children: "Sneak Peek" })
      ] }),
      /* @__PURE__ */ jsx("h2", { className: "font-display text-3xl font-bold mb-3", children: "See How the Adventure Begins…" }),
      /* @__PURE__ */ jsx("p", { className: "text-muted-foreground max-w-lg mx-auto", children: "Every story starts with a problem only your child can solve. Pick a theme below to see a real sample — flip through to see how the adventure unfolds!" })
    ] }),
    !isControlled && /* @__PURE__ */ jsx("div", { className: "max-w-2xl mx-auto mb-6 flex flex-wrap justify-center gap-2", children: THEME_ORDER.map((t) => /* @__PURE__ */ jsx(
      "button",
      {
        onClick: () => handleThemeClick(t),
        "aria-pressed": t === activeTheme,
        className: `text-xs sm:text-sm font-bold rounded-full px-3 py-1.5 border transition-all ${t === activeTheme ? "bg-primary text-primary-foreground border-primary shadow-md" : "bg-card text-foreground border-border hover:border-primary/60"}`,
        children: t
      },
      t
    )) }),
    /* @__PURE__ */ jsxs("div", { className: "max-w-md mx-auto relative", children: [
      /* @__PURE__ */ jsxs("div", { className: "relative aspect-square rounded-2xl overflow-hidden border-2 border-border bg-card shadow-xl", children: [
        /* @__PURE__ */ jsx(
          "img",
          {
            src: pages[currentPage].src,
            alt: pages[currentPage].alt,
            className: "w-full h-full object-cover transition-opacity duration-500",
            loading: "lazy",
            width: 1024,
            height: 1024
          },
          `${activeTheme}-${currentPage}`
        ),
        isLastPage && /* @__PURE__ */ jsxs("div", { className: "absolute inset-0 bg-background/70 backdrop-blur-sm flex flex-col items-center justify-center gap-3 p-5 text-center", children: [
          /* @__PURE__ */ jsx(Lock, { className: "h-10 w-10 text-primary" }),
          /* @__PURE__ */ jsx("h3", { className: "font-display text-2xl font-bold", children: "How does it end?" }),
          /* @__PURE__ */ jsx("p", { className: "text-muted-foreground text-xs max-w-xs", children: "Only your child can solve the mystery! Add matching coloring pages — one for every scene in your story:" }),
          /* @__PURE__ */ jsxs("div", { className: "rounded-xl border-2 border-primary/40 bg-white p-1 shadow-lg", children: [
            /* @__PURE__ */ jsx(
              "img",
              {
                src: THEME_COLORING[activeTheme] ?? coloringFairy,
                alt: `${activeTheme} coloring page sample`,
                className: "w-28 h-28 sm:w-32 sm:h-32 object-contain rounded-md",
                loading: "lazy",
                width: 256,
                height: 256
              }
            ),
            /* @__PURE__ */ jsx("p", { className: "text-[10px] font-bold text-primary mt-1", children: "Coloring pages add-on" }),
            /* @__PURE__ */ jsx("p", { className: "text-[9px] text-muted-foreground mt-0.5 max-w-[8rem] leading-tight", children: "One per scene — longer stories (older kids) get more pages" })
          ] }),
          /* @__PURE__ */ jsx(
            Button,
            {
              asChild: true,
              size: "lg",
              className: "bg-primary text-primary-foreground hover:bg-primary/90 font-display rounded-full px-6 py-5 shadow-lg shadow-primary/30 hover:scale-105 transition-all",
              children: /* @__PURE__ */ jsx(Link, { to: productHandle ? `/product/${productHandle}#personalize` : "#products", children: "Create Their Story ⭐" })
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "absolute bottom-3 left-1/2 -translate-x-1/2 bg-background/80 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-bold text-muted-foreground", children: [
          activeTheme,
          " · Page ",
          pages[currentPage].pageNum,
          " of ",
          pages.length
        ] })
      ] }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: goPrev,
          disabled: currentPage === 0,
          "aria-label": "Previous page",
          className: "absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm border border-border rounded-full p-2 text-foreground disabled:opacity-30 hover:bg-card transition-colors",
          children: /* @__PURE__ */ jsx(ChevronLeft, { className: "h-5 w-5" })
        }
      ),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: goNext,
          disabled: isLastPage,
          "aria-label": "Next page",
          className: "absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm border border-border rounded-full p-2 text-foreground disabled:opacity-30 hover:bg-card transition-colors",
          children: /* @__PURE__ */ jsx(ChevronRight, { className: "h-5 w-5" })
        }
      ),
      /* @__PURE__ */ jsx("div", { className: "flex justify-center gap-2 mt-4", children: pages.map((_, i) => /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => setCurrentPage(i),
          "aria-label": `Go to page ${i + 1}`,
          "aria-current": i === currentPage ? "true" : void 0,
          className: `w-2.5 h-2.5 rounded-full transition-all ${i === currentPage ? "bg-primary w-6" : "bg-muted-foreground/30"}`
        },
        i
      )) })
    ] }),
    !embedded && /* @__PURE__ */ jsx("p", { className: "text-center text-xs text-muted-foreground mt-6 max-w-sm mx-auto", children: "✨ These are sample stories. Your child's one of a kind custom storybook will feature their name, photo, and a unique adventure created just for them!" })
  ] }) });
};
const version$2 = 1;
const asset_id$2 = "3b57355e-c6c1-4d9b-8f92-c30027d6b658";
const project_id$2 = "6e9363e7-8397-4f97-8f6e-dfbe2d8291ad";
const url$2 = "/__l5e/assets-v1/3b57355e-c6c1-4d9b-8f92-c30027d6b658/izzy-real.jpg";
const r2_key$2 = "a/v1/6e9363e7-8397-4f97-8f6e-dfbe2d8291ad/3b57355e-c6c1-4d9b-8f92-c30027d6b658/izzy-real.jpg";
const original_filename$2 = "izzy-real.jpg";
const size$2 = 327484;
const content_type$2 = "image/jpeg";
const created_at$2 = "2026-07-21T05:32:30Z";
const izzyReal = {
  version: version$2,
  asset_id: asset_id$2,
  project_id: project_id$2,
  url: url$2,
  r2_key: r2_key$2,
  original_filename: original_filename$2,
  size: size$2,
  content_type: content_type$2,
  created_at: created_at$2
};
const izzyStory = "/assets/izzy-storybook-BTm55_z7.jpg";
const version$1 = 1;
const asset_id$1 = "aed688f7-bc7b-4f25-a97c-1faa6d78cf75";
const project_id$1 = "6e9363e7-8397-4f97-8f6e-dfbe2d8291ad";
const url$1 = "/__l5e/assets-v1/aed688f7-bc7b-4f25-a97c-1faa6d78cf75/jaedan-fishing.jpg";
const r2_key$1 = "a/v1/6e9363e7-8397-4f97-8f6e-dfbe2d8291ad/aed688f7-bc7b-4f25-a97c-1faa6d78cf75/jaedan-fishing.jpg";
const original_filename$1 = "jaedan-fishing.jpg";
const size$1 = 244810;
const content_type$1 = "image/jpeg";
const created_at$1 = "2026-07-21T05:32:33Z";
const jaedanFishing = {
  version: version$1,
  asset_id: asset_id$1,
  project_id: project_id$1,
  url: url$1,
  r2_key: r2_key$1,
  original_filename: original_filename$1,
  size: size$1,
  content_type: content_type$1,
  created_at: created_at$1
};
const jaedanFishingStory = "/assets/jaedan-fishing-story-DGs1PsC5.jpg";
const version = 1;
const asset_id = "fbfd3c1a-b3e2-450d-9cda-f76b455ca473";
const project_id = "6e9363e7-8397-4f97-8f6e-dfbe2d8291ad";
const url = "/__l5e/assets-v1/fbfd3c1a-b3e2-450d-9cda-f76b455ca473/jaedan-cowboy.jpg";
const r2_key = "a/v1/6e9363e7-8397-4f97-8f6e-dfbe2d8291ad/fbfd3c1a-b3e2-450d-9cda-f76b455ca473/jaedan-cowboy.jpg";
const original_filename = "jaedan-cowboy.jpg";
const size = 154464;
const content_type = "image/jpeg";
const created_at = "2026-07-21T05:32:36Z";
const jaedanCowboy = {
  version,
  asset_id,
  project_id,
  url,
  r2_key,
  original_filename,
  size,
  content_type,
  created_at
};
const jaedanCowboyStory = "/assets/jaedan-cowboy-story-4ZLpnX4n.jpg";
const EXAMPLES = [
  {
    name: "Izzy",
    realPhoto: izzyReal.url,
    characterImage: izzyStory,
    caption: "Same bow. Same big eyes. Same little hero.",
    themeLabel: "Fairy Tale"
  },
  {
    name: "Jaedan",
    realPhoto: jaedanFishing.url,
    characterImage: jaedanFishingStory,
    caption: "His real fishing day — reimagined as a storybook scene.",
    themeLabel: "Great Outdoors"
  },
  {
    name: "Jaedan",
    realPhoto: jaedanCowboy.url,
    characterImage: jaedanCowboyStory,
    caption: "One photo becomes a cowboy hero he actually recognizes.",
    themeLabel: "Wild West"
  }
];
const RealMagicShowcase = () => {
  return /* @__PURE__ */ jsx("section", { className: "py-16 bg-gradient-to-b from-background to-card/40", children: /* @__PURE__ */ jsxs("div", { className: "container", children: [
    /* @__PURE__ */ jsxs("div", { className: "text-center mb-10", children: [
      /* @__PURE__ */ jsxs("div", { className: "inline-flex items-center gap-2 bg-primary/20 border border-primary/30 rounded-full px-4 py-2 mb-4", children: [
        /* @__PURE__ */ jsx(Wand2, { className: "h-4 w-4 text-primary" }),
        /* @__PURE__ */ jsx("span", { className: "text-sm font-bold text-primary uppercase tracking-wider", children: "Real Kids, Real Magic" })
      ] }),
      /* @__PURE__ */ jsx("h2", { className: "font-display text-3xl md:text-4xl font-bold mb-3", children: "One Photo. One Hero. One Unforgettable Story." }),
      /* @__PURE__ */ jsxs("p", { className: "text-muted-foreground max-w-xl mx-auto", children: [
        "These are real MESTAR kids. Upload one photo — we turn your child into the hero of their own storybook, keeping the face, features and little details that make them ",
        /* @__PURE__ */ jsx("em", { children: "them" }),
        "."
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "grid md:grid-cols-3 gap-6 max-w-5xl mx-auto", children: EXAMPLES.map((ex, i) => /* @__PURE__ */ jsxs(
      "figure",
      {
        className: "bg-card rounded-2xl border-2 border-border overflow-hidden shadow-lg hover:shadow-xl hover:border-primary/50 transition-all",
        children: [
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-0.5 bg-border", children: [
            /* @__PURE__ */ jsxs("div", { className: "relative bg-background", children: [
              /* @__PURE__ */ jsx(
                "img",
                {
                  src: ex.realPhoto,
                  alt: `${ex.name} — real photo uploaded by parent`,
                  className: "w-full h-48 sm:h-56 object-cover",
                  loading: "lazy"
                }
              ),
              /* @__PURE__ */ jsxs("div", { className: "absolute top-2 left-2 flex items-center gap-1 bg-background/85 backdrop-blur-sm border border-border rounded-full px-2 py-0.5", children: [
                /* @__PURE__ */ jsx(Camera, { className: "h-3 w-3 text-muted-foreground" }),
                /* @__PURE__ */ jsx("span", { className: "text-[10px] font-bold text-muted-foreground uppercase tracking-wider", children: "Real Photo" })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "relative bg-background", children: [
              /* @__PURE__ */ jsx(
                "img",
                {
                  src: ex.characterImage,
                  alt: `${ex.name} illustrated as a storybook hero`,
                  className: "w-full h-48 sm:h-56 object-cover",
                  loading: "lazy"
                }
              ),
              /* @__PURE__ */ jsxs("div", { className: "absolute top-2 left-2 flex items-center gap-1 bg-primary/90 backdrop-blur-sm rounded-full px-2 py-0.5", children: [
                /* @__PURE__ */ jsx(Sparkles, { className: "h-3 w-3 text-primary-foreground" }),
                /* @__PURE__ */ jsx("span", { className: "text-[10px] font-bold text-primary-foreground uppercase tracking-wider", children: "Story Hero" })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("figcaption", { className: "p-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-1.5", children: [
              /* @__PURE__ */ jsx("span", { className: "font-display font-bold text-foreground", children: ex.name }),
              /* @__PURE__ */ jsx("span", { className: "text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 rounded-full px-2 py-0.5", children: ex.themeLabel })
            ] }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground leading-snug", children: ex.caption })
          ] })
        ]
      },
      i
    )) }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-center gap-2 mt-8 text-sm text-muted-foreground", children: [
      /* @__PURE__ */ jsx(ArrowRight, { className: "h-4 w-4 text-primary" }),
      /* @__PURE__ */ jsx("span", { children: "Upload → Preview in seconds → Full 20+ page storybook delivered to your inbox." })
    ] })
  ] }) });
};
const SITE_URL = "https://mestar.pro";
const DEFAULT_IMAGE = "https://storage.googleapis.com/gpt-engineer-file-uploads/hfdVpZRvZ4hMNWvlpFRlEdIJbxm2/social-images/social-1775247101557-576.webp";
const SEO = ({
  title,
  description,
  canonical,
  image = DEFAULT_IMAGE,
  type = "website",
  jsonLd,
  noindex = false
}) => {
  const canonicalUrl = canonical ? canonical.startsWith("http") ? canonical : `${SITE_URL}${canonical}` : void 0;
  return /* @__PURE__ */ jsxs(Helmet, { children: [
    /* @__PURE__ */ jsx("title", { children: title }),
    /* @__PURE__ */ jsx("meta", { name: "description", content: description }),
    canonicalUrl && /* @__PURE__ */ jsx("link", { rel: "canonical", href: canonicalUrl }),
    noindex && /* @__PURE__ */ jsx("meta", { name: "robots", content: "noindex, nofollow" }),
    /* @__PURE__ */ jsx("meta", { property: "og:title", content: title }),
    /* @__PURE__ */ jsx("meta", { property: "og:description", content: description }),
    /* @__PURE__ */ jsx("meta", { property: "og:type", content: type }),
    canonicalUrl && /* @__PURE__ */ jsx("meta", { property: "og:url", content: canonicalUrl }),
    /* @__PURE__ */ jsx("meta", { property: "og:image", content: image }),
    /* @__PURE__ */ jsx("meta", { name: "twitter:card", content: "summary_large_image" }),
    /* @__PURE__ */ jsx("meta", { name: "twitter:title", content: title }),
    /* @__PURE__ */ jsx("meta", { name: "twitter:description", content: description }),
    /* @__PURE__ */ jsx("meta", { name: "twitter:image", content: image }),
    jsonLd && /* @__PURE__ */ jsx("script", { type: "application/ld+json", children: JSON.stringify(jsonLd) })
  ] });
};
const DRAFT_KEY$1 = "mestar-preview-draft";
const STORY_THEMES$1 = [
  "Fairy Tale",
  "Ocean Adventure & Pirates",
  "Prince & Princess",
  "Outer Space",
  "Dinosaurs"
];
const DEMO_SLIDES = [
  {
    childLabel: "Izzy",
    beforeSrc: izzyReal.url,
    afterSrc: izzyStory,
    theme: "Fairy Tale",
    icon: "🧚"
  },
  {
    childLabel: "Jaedan",
    beforeSrc: jaedanFishing.url,
    afterSrc: jaedanFishingStory,
    theme: "Great Outdoors",
    icon: "🎣"
  },
  {
    childLabel: "Jaedan",
    beforeSrc: jaedanCowboy.url,
    afterSrc: jaedanCowboyStory,
    theme: "Wild West",
    icon: "🤠"
  }
];
const HeroDemo = () => {
  const [slideIdx, setSlideIdx] = useState(0);
  const [phase, setPhase] = useState("before");
  useEffect(() => {
    let timer;
    const cycle = () => {
      timer = setTimeout(() => {
        setPhase("transforming");
        timer = setTimeout(() => {
          setPhase("after");
          timer = setTimeout(() => {
            setSlideIdx((prev) => (prev + 1) % DEMO_SLIDES.length);
            setPhase("before");
            cycle();
          }, 3200);
        }, 900);
      }, 3e3);
    };
    cycle();
    return () => clearTimeout(timer);
  }, []);
  const slide = DEMO_SLIDES[slideIdx];
  return /* @__PURE__ */ jsxs("div", { className: "relative w-full max-w-sm mx-auto select-none", children: [
    /* @__PURE__ */ jsxs("div", { className: "relative aspect-square rounded-3xl overflow-hidden border-2 border-primary/40 shadow-2xl shadow-primary/20", children: [
      /* @__PURE__ */ jsxs(
        "div",
        {
          className: "absolute inset-0 flex flex-col items-center justify-center gap-3 transition-opacity duration-700 bg-background",
          style: { opacity: phase === "before" ? 1 : 0 },
          children: [
            /* @__PURE__ */ jsx(
              "img",
              {
                src: slide.beforeSrc,
                alt: `${slide.childLabel} — real photo uploaded by parent`,
                className: "absolute inset-0 w-full h-full object-cover",
                loading: "eager"
              }
            ),
            /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-background/85 via-background/10 to-transparent" }),
            /* @__PURE__ */ jsxs("div", { className: "relative z-10 mt-auto mb-4 text-center", children: [
              /* @__PURE__ */ jsxs("span", { className: "font-display font-bold text-foreground text-lg drop-shadow", children: [
                slide.childLabel,
                "'s Real Photo"
              ] }),
              /* @__PURE__ */ jsx("div", { className: "text-xs text-muted-foreground", children: "Tap to transform →" })
            ] })
          ]
        }
      ),
      /* @__PURE__ */ jsxs(
        "div",
        {
          className: "absolute inset-0 transition-opacity duration-300 pointer-events-none",
          style: {
            background: "radial-gradient(circle, hsl(43 90% 62% / 0.6) 0%, hsl(220 20% 10%) 70%)",
            opacity: phase === "transforming" ? 1 : 0
          },
          children: [
            /* @__PURE__ */ jsx("div", { className: "absolute inset-0 preview-shimmer" }),
            /* @__PURE__ */ jsx("div", { className: "absolute inset-0 flex items-center justify-center", children: /* @__PURE__ */ jsx(Sparkles, { className: "h-16 w-16 text-primary animate-pulse" }) })
          ]
        }
      ),
      /* @__PURE__ */ jsxs(
        "div",
        {
          className: "absolute inset-0 transition-opacity duration-700",
          style: { opacity: phase === "after" ? 1 : 0 },
          children: [
            /* @__PURE__ */ jsx(
              "img",
              {
                src: slide.afterSrc,
                alt: `${slide.childLabel} in a ${slide.theme} storybook scene`,
                className: "w-full h-full object-cover",
                loading: "eager"
              }
            ),
            /* @__PURE__ */ jsx("div", { className: "absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background/90 to-transparent p-4", children: /* @__PURE__ */ jsxs("p", { className: "font-display text-base font-bold text-foreground text-center", children: [
              slide.icon,
              " ",
              slide.childLabel,
              " — ",
              slide.theme
            ] }) })
          ]
        }
      ),
      /* @__PURE__ */ jsx("div", { className: "absolute top-3 left-1/2 -translate-x-1/2 bg-background/80 backdrop-blur-sm border border-border rounded-full px-3 py-1 text-[11px] font-bold z-10", children: phase === "before" ? "📷 Child's Photo" : phase === "transforming" ? "✨ Transforming…" : "📖 Storybook Scene" })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "flex justify-center gap-2 mt-4", children: DEMO_SLIDES.map((s, i) => /* @__PURE__ */ jsx(
      "button",
      {
        onClick: () => {
          setSlideIdx(i);
          setPhase("before");
        },
        "aria-label": `Show ${s.childLabel}'s demo`,
        className: `rounded-full transition-all ${i === slideIdx ? "w-7 h-2.5 bg-primary" : "w-2.5 h-2.5 bg-muted-foreground/30"}`
      },
      s.childLabel
    )) }),
    /* @__PURE__ */ jsx("div", { className: "absolute -top-4 -right-4 w-8 h-8 rounded-full bg-primary/20 animate-twinkle" }),
    /* @__PURE__ */ jsx("div", { className: "absolute -bottom-3 -left-3 w-5 h-5 rounded-full bg-primary/30 animate-twinkle", style: { animationDelay: "1.5s" } })
  ] });
};
const HeroForm = () => {
  const navigate = useNavigate();
  const [childName, setChildName] = useState("");
  const [theme, setTheme] = useState("");
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef(null);
  const acceptFile = useCallback((file) => {
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
    reader.onloadend = () => setPhotoPreview(reader.result);
    reader.readAsDataURL(file);
  }, []);
  const handleDrop = useCallback(
    (e) => {
      var _a;
      e.preventDefault();
      setDragging(false);
      const file = (_a = e.dataTransfer.files) == null ? void 0 : _a[0];
      if (file) acceptFile(file);
    },
    [acceptFile]
  );
  const handleFileChange = (e) => {
    var _a;
    const file = (_a = e.target.files) == null ? void 0 : _a[0];
    if (file) acceptFile(file);
  };
  const isValid = childName.trim().length > 0 && theme.length > 0 && photoPreview !== null;
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isValid) {
      toast.error("Please fill in all fields and upload a photo.");
      return;
    }
    setSubmitting(true);
    const draft = {
      childName: childName.trim(),
      theme,
      photoData: photoPreview,
      savedAt: Date.now()
    };
    localStorage.setItem(DRAFT_KEY$1, JSON.stringify(draft));
    navigate("/preview");
  };
  return /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "flex flex-col gap-5", noValidate: true, children: [
    /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
      /* @__PURE__ */ jsx(Label, { htmlFor: "hero-child-name", className: "text-sm font-bold", children: "Child's Name" }),
      /* @__PURE__ */ jsx(
        Input,
        {
          id: "hero-child-name",
          type: "text",
          placeholder: "e.g. Sophie",
          value: childName,
          onChange: (e) => setChildName(e.target.value),
          maxLength: 40,
          className: "rounded-xl bg-secondary/50 border-border h-11",
          autoComplete: "off"
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
      /* @__PURE__ */ jsx(Label, { htmlFor: "hero-theme", className: "text-sm font-bold", children: "Story Theme" }),
      /* @__PURE__ */ jsxs(Select, { value: theme, onValueChange: setTheme, children: [
        /* @__PURE__ */ jsx(SelectTrigger, { id: "hero-theme", className: "rounded-xl bg-secondary/50 border-border h-11", children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Choose a theme…" }) }),
        /* @__PURE__ */ jsx(SelectContent, { children: STORY_THEMES$1.map((t) => /* @__PURE__ */ jsx(SelectItem, { value: t, children: t }, t)) })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
      /* @__PURE__ */ jsx(Label, { className: "text-sm font-bold", children: "Upload Your Child's Photo" }),
      /* @__PURE__ */ jsxs(
        "div",
        {
          role: "button",
          tabIndex: 0,
          "aria-label": "Upload photo by clicking or dragging and dropping",
          className: `relative rounded-xl border-2 border-dashed p-4 text-center cursor-pointer transition-colors ${dragging ? "dropzone-active" : "border-border hover:border-primary/50 hover:bg-secondary/30"}`,
          onClick: () => {
            var _a;
            return (_a = fileInputRef.current) == null ? void 0 : _a.click();
          },
          onKeyDown: (e) => {
            var _a;
            return (e.key === "Enter" || e.key === " ") && ((_a = fileInputRef.current) == null ? void 0 : _a.click());
          },
          onDragOver: (e) => {
            e.preventDefault();
            setDragging(true);
          },
          onDragLeave: () => setDragging(false),
          onDrop: handleDrop,
          children: [
            photoPreview ? /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
              /* @__PURE__ */ jsx(
                "img",
                {
                  src: photoPreview,
                  alt: "Preview of uploaded child photo",
                  className: "w-14 h-14 rounded-lg object-cover shrink-0 border border-primary/30"
                }
              ),
              /* @__PURE__ */ jsxs("div", { className: "flex-1 text-left min-w-0", children: [
                /* @__PURE__ */ jsx("p", { className: "text-sm font-bold text-foreground truncate", children: photoFile == null ? void 0 : photoFile.name }),
                /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: photoFile ? `${(photoFile.size / 1024).toFixed(0)} KB` : "Photo ready" })
              ] }),
              /* @__PURE__ */ jsx(
                "button",
                {
                  type: "button",
                  "aria-label": "Remove photo",
                  onClick: (e) => {
                    e.stopPropagation();
                    setPhotoFile(null);
                    setPhotoPreview(null);
                  },
                  className: "ml-auto p-1.5 rounded-full hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors",
                  children: /* @__PURE__ */ jsx(X, { className: "h-4 w-4" })
                }
              )
            ] }) : /* @__PURE__ */ jsxs("div", { className: "py-3 flex flex-col items-center gap-2 text-muted-foreground", children: [
              /* @__PURE__ */ jsx("div", { className: "w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center", children: dragging ? /* @__PURE__ */ jsx(ImageIcon, { className: "h-6 w-6 text-primary animate-bounce" }) : /* @__PURE__ */ jsx(Upload, { className: "h-6 w-6 text-primary" }) }),
              /* @__PURE__ */ jsx("p", { className: "text-sm font-bold text-foreground", children: dragging ? "Drop it here!" : "Drag & drop or click to upload" }),
              /* @__PURE__ */ jsx("p", { className: "text-xs", children: "JPG, PNG, WEBP — max 8 MB" })
            ] }),
            /* @__PURE__ */ jsx(
              "input",
              {
                ref: fileInputRef,
                type: "file",
                accept: "image/*",
                className: "sr-only",
                "aria-label": "Upload child photo",
                onChange: handleFileChange
              }
            )
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsx(
      Button,
      {
        type: "submit",
        size: "lg",
        disabled: !isValid || submitting,
        className: "w-full bg-primary text-primary-foreground hover:bg-primary/90 font-display text-lg rounded-full py-7 shadow-xl shadow-primary/30 hover:scale-105 transition-all duration-300 disabled:scale-100 disabled:opacity-60",
        children: submitting ? /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(Loader2, { className: "h-5 w-5 mr-2 animate-spin" }),
          "Creating Preview…"
        ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(Sparkles, { className: "h-5 w-5 mr-2" }),
          "See the Magic Preview!"
        ] })
      }
    ),
    /* @__PURE__ */ jsx("p", { className: "text-[11px] text-center text-muted-foreground/70", children: "Free preview — no payment required. Photo stored privately for 5 days max." })
  ] });
};
const ProductCard = ({ product }) => {
  var _a;
  const image = (_a = product.node.images.edges[0]) == null ? void 0 : _a.node;
  const price = product.node.priceRange.minVariantPrice;
  const priceNum = parseFloat(price.amount);
  return /* @__PURE__ */ jsx(Link, { to: `/product/${product.node.handle}#personalize`, className: "group block h-full", children: /* @__PURE__ */ jsxs("div", { className: "relative h-full flex flex-col bg-card rounded-3xl overflow-hidden border border-border hover:border-primary/60 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/20 hover:-translate-y-1", children: [
    /* @__PURE__ */ jsxs("div", { className: "absolute top-3 left-3 z-10 inline-flex items-center gap-1 bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider rounded-full px-2.5 py-1 shadow-md", children: [
      /* @__PURE__ */ jsx(Sparkles, { className: "h-3 w-3" }),
      " Bestseller"
    ] }),
    /* @__PURE__ */ jsx("div", { className: "absolute top-3 right-3 z-10 bg-background/90 backdrop-blur-sm text-foreground text-[10px] font-bold uppercase tracking-wider rounded-full px-2.5 py-1 shadow-md border border-border", children: "Instant PDF" }),
    image && /* @__PURE__ */ jsx("div", { className: "aspect-[4/3] overflow-hidden bg-gradient-to-br from-secondary/30 to-primary/5", children: /* @__PURE__ */ jsx(
      "img",
      {
        src: image.url,
        alt: image.altText || product.node.title,
        loading: "lazy",
        className: "w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
      }
    ) }),
    /* @__PURE__ */ jsxs("div", { className: "p-5 flex flex-col flex-1", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 mb-2", children: [
        /* @__PURE__ */ jsx("div", { className: "flex", children: [...Array(5)].map((_, i) => /* @__PURE__ */ jsx(Star, { className: "h-3.5 w-3.5 text-primary fill-primary" }, i)) }),
        /* @__PURE__ */ jsx("span", { className: "text-xs text-muted-foreground font-medium", children: "Loved by 2,000+ families" })
      ] }),
      /* @__PURE__ */ jsx("h3", { className: "font-display text-lg font-bold leading-tight mb-2 group-hover:text-primary transition-colors", children: product.node.title }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground line-clamp-2 mb-4", children: product.node.description }),
      /* @__PURE__ */ jsxs("ul", { className: "text-xs text-muted-foreground space-y-1 mb-4", children: [
        /* @__PURE__ */ jsxs("li", { className: "flex items-center gap-1.5", children: [
          /* @__PURE__ */ jsx(CheckCircle2, { className: "h-3.5 w-3.5 text-primary" }),
          " Your child as the hero"
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex items-center gap-1.5", children: [
          /* @__PURE__ */ jsx(CheckCircle2, { className: "h-3.5 w-3.5 text-primary" }),
          " Coloring pages included"
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mt-auto flex items-end justify-between gap-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col", children: [
          /* @__PURE__ */ jsxs("span", { className: "text-2xl font-extrabold text-primary leading-none", children: [
            "$",
            priceNum.toFixed(2)
          ] }),
          /* @__PURE__ */ jsx("span", { className: "text-[10px] text-muted-foreground mt-0.5", children: "one-time payment" })
        ] }),
        /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1 bg-primary text-primary-foreground font-display rounded-full px-4 py-2.5 text-sm font-bold shadow-lg shadow-primary/30 group-hover:bg-primary/90 group-hover:scale-105 transition-all", children: [
          /* @__PURE__ */ jsx(Sparkles, { className: "h-4 w-4" }),
          "Personalize"
        ] })
      ] })
    ] })
  ] }) });
};
const Index = () => {
  var _a;
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showIntro, setShowIntro] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const videoRef = useRef(null);
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
  const handleUnmute = (e) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = false;
      setIsMuted(false);
    }
  };
  if (showIntro) {
    return /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx(
        SEO,
        {
          title: "MESTAR — Personalized Storybooks Starring Your Child",
          description: "Create a personalized children's storybook in minutes. Upload a photo, pick a theme, and download a print-ready PDF starring your child.",
          canonical: "/",
          jsonLd: {
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "MESTAR",
            url: "https://mestar.pro",
            logo: "https://mestar.pro/favicon.ico"
          }
        }
      ),
      /* @__PURE__ */ jsx("h1", { className: "sr-only", children: "MESTAR — Personalized Storybooks Starring Your Child" }),
      /* @__PURE__ */ jsxs(
        "div",
        {
          className: "fixed inset-0 z-50 bg-black flex items-center justify-center cursor-pointer overflow-hidden",
          onClick: handleVideoEnd,
          children: [
            /* @__PURE__ */ jsx(
              "video",
              {
                src: "/videos/promo-ad.mp4",
                playsInline: true,
                muted: true,
                autoPlay: true,
                loop: true,
                "aria-hidden": "true",
                className: "absolute inset-0 w-full h-full object-cover scale-110 blur-2xl opacity-50 pointer-events-none"
              }
            ),
            /* @__PURE__ */ jsx(
              "video",
              {
                ref: videoRef,
                src: "/videos/promo-ad.mp4",
                playsInline: true,
                onEnded: handleVideoEnd,
                className: "relative w-full h-full object-contain"
              }
            ),
            isMuted && /* @__PURE__ */ jsxs(
              "button",
              {
                onClick: handleUnmute,
                className: "absolute bottom-8 right-8 bg-cream/20 backdrop-blur-sm text-cream rounded-full p-4 hover:bg-cream/30 transition-colors z-10",
                children: [
                  /* @__PURE__ */ jsx(Volume2, { className: "h-6 w-6" }),
                  /* @__PURE__ */ jsx("span", { className: "sr-only", children: "Tap for sound" })
                ]
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: (e) => {
                  e.stopPropagation();
                  handleVideoEnd();
                },
                className: "absolute top-6 right-6 bg-white/10 backdrop-blur-sm text-white text-sm px-4 py-2 rounded-full hover:bg-white/20 transition-colors z-10",
                children: "Skip intro →"
              }
            )
          ]
        }
      )
    ] });
  }
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen", children: [
    /* @__PURE__ */ jsx(
      SEO,
      {
        title: "MESTAR — Personalized Storybooks Starring Your Child",
        description: "Create a personalized children's storybook in minutes. Upload a photo, pick a theme, and download a print-ready PDF starring your child.",
        canonical: "/",
        jsonLd: {
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "MESTAR",
          url: "https://mestar.pro",
          logo: "https://mestar.pro/favicon.ico"
        }
      }
    ),
    /* @__PURE__ */ jsx("div", { className: "bg-primary text-primary-foreground text-center py-2 px-4", children: /* @__PURE__ */ jsx("p", { className: "text-sm font-display font-bold", children: "⭐ Personalized digital storybooks — $19.99 one-time payment — instant digital download" }) }),
    /* @__PURE__ */ jsxs("section", { className: "relative overflow-hidden stars-bg", children: [
      /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background pointer-events-none" }),
      /* @__PURE__ */ jsx("div", { className: "relative z-10 container py-14 sm:py-20", children: /* @__PURE__ */ jsxs("div", { className: "grid lg:grid-cols-2 gap-12 items-center", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-6", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs("div", { className: "inline-flex items-center gap-2 bg-primary/20 backdrop-blur-sm border border-primary/30 rounded-full px-4 py-2 mb-5", children: [
              /* @__PURE__ */ jsx(Sparkles, { className: "h-4 w-4 text-primary" }),
              /* @__PURE__ */ jsx("span", { className: "text-sm font-bold text-primary", children: "Personalized Bedtime Magic" })
            ] }),
            /* @__PURE__ */ jsxs("h1", { className: "font-display text-4xl sm:text-5xl font-extrabold mb-4 leading-tight drop-shadow-lg", children: [
              "Make Your Child",
              /* @__PURE__ */ jsx("br", {}),
              /* @__PURE__ */ jsx("span", { className: "text-primary drop-shadow-[0_0_20px_hsl(43_75%_62%/0.5)]", children: "the ⭐ of the Story" })
            ] }),
            /* @__PURE__ */ jsxs("p", { className: "text-base text-foreground/80 leading-relaxed mb-2", children: [
              "Upload a photo, pick a theme, and see a free preview in seconds. Then unlock the full 20-page personalised storybook for just ",
              /* @__PURE__ */ jsx("strong", { children: "$19.99" }),
              "."
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "bg-card/70 backdrop-blur-md rounded-2xl border border-border p-6 shadow-xl", children: /* @__PURE__ */ jsx(HeroForm, {}) }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx("div", { className: "flex", children: [...Array(5)].map((_, i) => /* @__PURE__ */ jsx(Star, { className: "h-4 w-4 text-primary fill-primary" }, i)) }),
            /* @__PURE__ */ jsx("span", { className: "text-sm text-foreground/70 font-medium", children: "Loved by 2,000+ families" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center gap-6", children: [
          /* @__PURE__ */ jsxs("div", { className: "text-center mb-2", children: [
            /* @__PURE__ */ jsx("p", { className: "text-sm font-bold text-muted-foreground uppercase tracking-wider mb-1", children: "Watch the transformation" }),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground/70", children: "Real child photo → personalised storybook character" })
          ] }),
          /* @__PURE__ */ jsx(HeroDemo, {})
        ] })
      ] }) })
    ] }),
    /* @__PURE__ */ jsx("section", { className: "py-8 border-b border-border bg-card/50", children: /* @__PURE__ */ jsx("div", { className: "container", children: /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-4", children: [
      { icon: Shield, text: "Secure Checkout" },
      { icon: Download, text: "Instant Download" },
      { icon: FileText, text: "Digital PDF" },
      { icon: CheckCircle2, text: "Satisfaction Guaranteed" }
    ].map(({ icon: Icon, text }) => /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center gap-2 text-center py-3", children: [
      /* @__PURE__ */ jsx(Icon, { className: "h-6 w-6 text-primary" }),
      /* @__PURE__ */ jsx("span", { className: "text-xs font-bold text-muted-foreground uppercase tracking-wider", children: text })
    ] }, text)) }) }) }),
    /* @__PURE__ */ jsx("section", { className: "py-16", children: /* @__PURE__ */ jsxs("div", { className: "container", children: [
      /* @__PURE__ */ jsx("h2", { className: "font-display text-3xl font-bold text-center mb-10", children: "How It Works" }),
      /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-8", children: [
        { step: "1", icon: Sparkles, title: "Personalize It", desc: "Upload a photo, choose a theme & get a free preview" },
        { step: "2", icon: BookOpen, title: "Place Your Order", desc: "Unlock the full story for $19.99 — one-time payment" },
        { step: "3", icon: Download, title: "Download & Enjoy", desc: "Get your personalised PDF storybook instantly" }
      ].map(({ step, icon: Icon, title, desc }) => /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
        /* @__PURE__ */ jsx("div", { className: "w-14 h-14 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center mx-auto mb-4", children: /* @__PURE__ */ jsx("span", { className: "font-display text-xl font-extrabold text-primary", children: step }) }),
        /* @__PURE__ */ jsx(Icon, { className: "h-8 w-8 text-primary mx-auto mb-3" }),
        /* @__PURE__ */ jsx("h3", { className: "font-display text-lg font-bold mb-1", children: title }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: desc })
      ] }, step)) })
    ] }) }),
    /* @__PURE__ */ jsx(StoryPreview, { productHandle: (_a = products[0]) == null ? void 0 : _a.node.handle }),
    /* @__PURE__ */ jsx(RealMagicShowcase, {}),
    /* @__PURE__ */ jsx("section", { id: "products", className: "py-16 bg-card/30", children: /* @__PURE__ */ jsxs("div", { className: "container", children: [
      /* @__PURE__ */ jsxs("div", { className: "text-center mb-10", children: [
        /* @__PURE__ */ jsx("h2", { className: "font-display text-3xl font-bold mb-3", children: "Shop Our Stories" }),
        /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: "Every story is a new adventure — pick your child's today ✨" })
      ] }),
      loading ? /* @__PURE__ */ jsx("div", { className: "flex justify-center py-20", children: /* @__PURE__ */ jsx(Loader2, { className: "h-8 w-8 animate-spin text-primary" }) }) : products.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "text-center py-20", children: [
        /* @__PURE__ */ jsx(BookOpen, { className: "h-12 w-12 text-muted-foreground mx-auto mb-4" }),
        /* @__PURE__ */ jsx("p", { className: "text-muted-foreground text-lg", children: "No products found" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "New stories coming soon!" })
      ] }) : /* @__PURE__ */ jsx("div", { className: "flex flex-wrap justify-center gap-6", children: products.map((product) => /* @__PURE__ */ jsx("div", { className: "w-full sm:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)] max-w-sm", children: /* @__PURE__ */ jsx(ProductCard, { product }) }, product.node.id)) })
    ] }) }),
    /* @__PURE__ */ jsx("section", { className: "py-16 border-t border-border", children: /* @__PURE__ */ jsxs("div", { className: "container max-w-3xl text-center", children: [
      /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center gap-1 mb-4", children: [...Array(5)].map((_, i) => /* @__PURE__ */ jsx(Star, { className: "h-6 w-6 text-muted-foreground/40" }, i)) }),
      /* @__PURE__ */ jsx("h2", { className: "font-display text-2xl font-bold mb-2", children: "Please leave a review, your input is how we improve! Let us know how we can provide the best customer experience possible" }),
      /* @__PURE__ */ jsx("p", { className: "text-muted-foreground mb-6", children: "Your honest words help other families discover the magic. After your story is delivered, we'd love to hear what you and your little one thought." }),
      /* @__PURE__ */ jsx(
        Button,
        {
          asChild: true,
          variant: "outline",
          className: "rounded-full border-primary/40 text-primary hover:bg-primary/10 hover:text-primary",
          children: /* @__PURE__ */ jsx(Link, { to: "/reviews", children: "Share your story ⭐" })
        }
      )
    ] }) }),
    /* @__PURE__ */ jsxs("section", { className: "py-16 stars-bg relative overflow-hidden", children: [
      /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gradient-to-b from-background via-background/90 to-background" }),
      /* @__PURE__ */ jsxs("div", { className: "container relative z-10 text-center", children: [
        /* @__PURE__ */ jsx(Clock, { className: "h-10 w-10 text-primary mx-auto mb-4" }),
        /* @__PURE__ */ jsx("h2", { className: "font-display text-3xl font-bold mb-3", children: "Don't Miss Out!" }),
        /* @__PURE__ */ jsx("p", { className: "text-muted-foreground max-w-md mx-auto mb-6", children: "Download instantly after purchase. Give your child a gift they'll never forget." }),
        products.length > 0 ? /* @__PURE__ */ jsx(
          Button,
          {
            asChild: true,
            size: "lg",
            className: "bg-primary text-primary-foreground hover:bg-primary/90 font-display text-lg rounded-full px-10 py-7 shadow-xl shadow-primary/30 hover:scale-105 transition-all",
            children: /* @__PURE__ */ jsx(Link, { to: `/product/${products[0].node.handle}#personalize`, children: "Create Your Story Now ⭐" })
          }
        ) : /* @__PURE__ */ jsx(
          Button,
          {
            asChild: true,
            size: "lg",
            className: "bg-primary text-primary-foreground hover:bg-primary/90 font-display text-lg rounded-full px-10 py-7 shadow-xl shadow-primary/30 hover:scale-105 transition-all",
            children: /* @__PURE__ */ jsx("a", { href: "#products", children: "Create Your Story Now ⭐" })
          }
        )
      ] })
    ] })
  ] });
};
const THEME_BG = {
  "Fairy Tale": "/images/sample-page-1.jpg",
  "Ocean Adventure & Pirates": "/images/samples/ocean-1.jpg",
  "Prince & Princess": "/images/samples/prince-1.jpg",
  "Outer Space": "/images/samples/space-1.jpg",
  Dinosaurs: "/images/samples/dino-1.jpg"
};
const DRAFT_KEY = "mestar-preview-draft";
function loadDraft() {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Date.now() - parsed.savedAt > 5 * 24 * 60 * 60 * 1e3) {
      localStorage.removeItem(DRAFT_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}
async function drawComposite(canvas, bgSrc, childSrc, childName) {
  const SIZE = 800;
  canvas.width = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const loadImg = (src) => new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
  const bg = await loadImg(bgSrc);
  ctx.drawImage(bg, 0, 0, SIZE, SIZE);
  const cx = SIZE * 0.73;
  const cy = SIZE * 0.28;
  const r = SIZE * 0.15;
  if (childSrc) {
    try {
      const childImg = await loadImg(childSrc);
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.clip();
      const side = r * 2;
      const sx = cx - r;
      const sy = cy - r;
      const scale = Math.max(side / childImg.width, side / childImg.height);
      const sw = childImg.width * scale;
      const sh = childImg.height * scale;
      ctx.drawImage(childImg, sx - (sw - side) / 2, sy - (sh - side) / 2, sw, sh);
      ctx.restore();
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = "hsl(43 90% 62%)";
      ctx.lineWidth = SIZE * 0.012;
      ctx.stroke();
      for (let i = 0; i < 8; i++) {
        const angle = i / 8 * Math.PI * 2;
        const dx = cx + Math.cos(angle) * (r + SIZE * 0.022);
        const dy = cy + Math.sin(angle) * (r + SIZE * 0.022);
        ctx.beginPath();
        ctx.arc(dx, dy, SIZE * 0.01, 0, Math.PI * 2);
        ctx.fillStyle = "hsl(43 90% 75%)";
        ctx.fill();
      }
    } catch {
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
  const bannerH = SIZE * 0.08;
  ctx.fillStyle = "hsl(220 20% 10% / 0.75)";
  ctx.fillRect(0, SIZE - bannerH, SIZE, bannerH);
  ctx.fillStyle = "hsl(43 90% 90%)";
  ctx.font = `bold ${bannerH * 0.52}px 'Baloo 2', cursive`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(`${childName}'s Adventure Begins…`, SIZE / 2, SIZE - bannerH / 2);
}
const STRIPE_BASE_PRICE = "personalized_storybook_onetime";
function Preview() {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const [draft, setDraft] = useState(null);
  const [rendering, setRendering] = useState(true);
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
    drawComposite(canvasRef.current, bg, draft.photoData, draft.childName).catch(console.error).finally(() => setRendering(false));
  }, [draft]);
  const handleUnlock = () => {
    if (!draft) return;
    const orderId = crypto.randomUUID();
    const pendingStory = {
      orderId,
      childName: draft.childName,
      theme: draft.theme,
      photoData: draft.photoData,
      savedAt: Date.now()
    };
    localStorage.setItem("mestar-pending-story", JSON.stringify(pendingStory));
    {
      navigate(
        `/checkout?order_id=${orderId}&prices=${encodeURIComponent(STRIPE_BASE_PRICE)}&next=${encodeURIComponent("/upsell")}`
      );
    }
  };
  if (!draft) return null;
  const bgSrc = THEME_BG[draft.theme] ?? THEME_BG["Fairy Tale"];
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen py-8", children: [
    /* @__PURE__ */ jsx(
      SEO,
      {
        title: `${draft.childName}'s Storybook Preview — MESTAR`,
        description: "See the first page of your child's personalized storybook before you buy.",
        noindex: true
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: "container max-w-4xl", children: [
      /* @__PURE__ */ jsxs(
        Link,
        {
          to: "/",
          className: "inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors",
          children: [
            /* @__PURE__ */ jsx(ArrowLeft, { className: "h-4 w-4" }),
            "Back"
          ]
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "grid lg:grid-cols-2 gap-10 items-start", children: [
        /* @__PURE__ */ jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsxs("div", { className: "relative rounded-2xl overflow-hidden border-2 border-primary/40 shadow-2xl shadow-primary/20", children: [
            rendering && /* @__PURE__ */ jsx("div", { className: "absolute inset-0 z-10 flex items-center justify-center bg-card/80 backdrop-blur-sm rounded-2xl", children: /* @__PURE__ */ jsx(Loader2, { className: "h-10 w-10 animate-spin text-primary" }) }),
            rendering && /* @__PURE__ */ jsx("div", { className: "absolute inset-0 z-20 preview-shimmer rounded-2xl" }),
            /* @__PURE__ */ jsx(
              "canvas",
              {
                ref: canvasRef,
                className: "w-full aspect-square object-cover",
                style: { display: rendering ? "none" : "block" }
              }
            ),
            rendering && /* @__PURE__ */ jsx(
              "img",
              {
                src: bgSrc,
                alt: "Storybook preview background",
                className: "w-full aspect-square object-cover"
              }
            ),
            /* @__PURE__ */ jsxs("div", { className: "absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-background/90 backdrop-blur-sm border border-border rounded-full px-4 py-2 shadow-lg", children: [
              /* @__PURE__ */ jsx(Lock, { className: "h-4 w-4 text-primary" }),
              /* @__PURE__ */ jsx("span", { className: "text-xs font-bold text-foreground", children: "Page 1 of 20+ — Unlock to read all" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex justify-center gap-1.5 mt-4", children: [
            /* @__PURE__ */ jsx("div", { className: "w-6 h-2 rounded-full bg-primary" }),
            Array.from({ length: 5 }).map((_, i) => /* @__PURE__ */ jsx("div", { className: "w-2 h-2 rounded-full bg-muted-foreground/30" }, i)),
            /* @__PURE__ */ jsx("div", { className: "text-xs text-muted-foreground self-center ml-1", children: "+15 more pages" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-6", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs("div", { className: "inline-flex items-center gap-2 bg-primary/20 border border-primary/30 rounded-full px-3 py-1.5 mb-3", children: [
              /* @__PURE__ */ jsx(Sparkles, { className: "h-3.5 w-3.5 text-primary" }),
              /* @__PURE__ */ jsx("span", { className: "text-xs font-bold text-primary uppercase tracking-wider", children: "Free Preview" })
            ] }),
            /* @__PURE__ */ jsxs("h1", { className: "font-display text-3xl md:text-4xl font-extrabold mb-3 leading-tight", children: [
              draft.childName,
              "'s",
              /* @__PURE__ */ jsx("br", {}),
              /* @__PURE__ */ jsxs("span", { className: "text-primary", children: [
                draft.theme,
                " Adventure"
              ] })
            ] }),
            /* @__PURE__ */ jsxs("p", { className: "text-muted-foreground leading-relaxed", children: [
              "This is Page 1 of your personalised storybook. Unlock all 20+ pages, custom illustrations, and printable coloring pages — starring ",
              /* @__PURE__ */ jsx("strong", { className: "text-foreground", children: draft.childName }),
              " as the hero."
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "bg-card rounded-2xl border border-border p-5 space-y-3", children: [
            /* @__PURE__ */ jsx("p", { className: "font-display font-bold text-sm uppercase tracking-wider text-muted-foreground", children: "Included in your $19.99 storybook" }),
            [
              "20+ page personalised story featuring " + draft.childName,
              "Full-colour AI-illustrated scenes",
              "Printable coloring pages (one per scene)",
              "Instant downloadable PDF",
              "Your child's photo woven into every page"
            ].map((item) => /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-2.5", children: [
              /* @__PURE__ */ jsx(Sparkles, { className: "h-4 w-4 text-primary mt-0.5 shrink-0" }),
              /* @__PURE__ */ jsx("span", { className: "text-sm text-foreground", children: item })
            ] }, item))
          ] }),
          /* @__PURE__ */ jsxs(
            Button,
            {
              onClick: handleUnlock,
              size: "lg",
              className: "w-full bg-primary text-primary-foreground hover:bg-primary/90 font-display text-lg rounded-full py-7 shadow-xl shadow-primary/30 hover:scale-105 transition-all duration-300",
              children: [
                /* @__PURE__ */ jsx(Lock, { className: "h-5 w-5 mr-2" }),
                "Unlock Full Bedtime Adventure — $19.99"
              ]
            }
          ),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-center gap-2 text-xs text-muted-foreground", children: [
            /* @__PURE__ */ jsx(Shield, { className: "h-3.5 w-3.5 text-primary" }),
            /* @__PURE__ */ jsx("span", { children: "Secure checkout — one-time payment — instant PDF download" })
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-[10px] text-center text-muted-foreground/60", children: "Your photo is stored privately and automatically deleted after 5 days." })
        ] })
      ] })
    ] })
  ] });
}
const Checkbox = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  CheckboxPrimitive.Root,
  {
    ref,
    className: cn(
      "peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
      className
    ),
    ...props,
    children: /* @__PURE__ */ jsx(CheckboxPrimitive.Indicator, { className: cn("flex items-center justify-center text-current"), children: /* @__PURE__ */ jsx(Check, { className: "h-4 w-4" }) })
  }
));
Checkbox.displayName = CheckboxPrimitive.Root.displayName;
const STRIPE_KARAOKE_PRICE = "audiobook_basic_onetime";
const STRIPE_COLORING_PRICE = "coloring_pages_addon_onetime";
const KARAOKE_PRICE = 5.99;
const COLORING_PRICE = 4.99;
function Upsell() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const orderId = params.get("order_id");
  const [wantsKaraoke, setWantsKaraoke] = useState(false);
  const [wantsColoring, setWantsColoring] = useState(false);
  const [childName, setChildName] = useState("your child");
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (!orderId) {
      navigate("/", { replace: true });
      return;
    }
    try {
      const saved = localStorage.getItem("mestar-pending-story");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.childName) setChildName(parsed.childName);
        if (!parsed.orderId) {
          localStorage.setItem(
            "mestar-pending-story",
            JSON.stringify({ ...parsed, orderId })
          );
        }
      }
    } catch {
    }
  }, [orderId, navigate]);
  const persistAddons = (karaoke, coloring) => {
    try {
      const saved = localStorage.getItem("mestar-pending-story");
      const parsed = saved ? JSON.parse(saved) : {};
      localStorage.setItem(
        "mestar-pending-story",
        JSON.stringify({
          ...parsed,
          orderId,
          selectedAddons: { audiobook: karaoke, coloringPages: coloring }
        })
      );
    } catch {
    }
  };
  const addonsTotal = (wantsKaraoke ? KARAOKE_PRICE : 0) + (wantsColoring ? COLORING_PRICE : 0);
  const handleCompleteOrder = () => {
    if (!orderId) return;
    const selectedPrices = [];
    if (wantsKaraoke && STRIPE_KARAOKE_PRICE) selectedPrices.push(STRIPE_KARAOKE_PRICE);
    if (wantsColoring && STRIPE_COLORING_PRICE) selectedPrices.push(STRIPE_COLORING_PRICE);
    persistAddons(wantsKaraoke, wantsColoring);
    if (selectedPrices.length === 0) {
      navigate(`/order-complete?order_id=${orderId}`);
      return;
    }
    setLoading(true);
    navigate(
      `/checkout?order_id=${orderId}&prices=${encodeURIComponent(selectedPrices.join(","))}&next=${encodeURIComponent("/order-complete")}`
    );
  };
  const handleSkip = () => {
    if (!orderId) return;
    persistAddons(false, false);
    navigate(`/order-complete?order_id=${orderId}`);
  };
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen py-10", children: [
    /* @__PURE__ */ jsx(
      SEO,
      {
        title: "Personalise Your Adventure Further — MESTAR",
        description: "Add interactive read-along audio and custom coloring pages to your child's personalised storybook.",
        noindex: true
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: "container max-w-2xl", children: [
      /* @__PURE__ */ jsxs("div", { className: "text-center mb-10", children: [
        /* @__PURE__ */ jsx("div", { className: "w-16 h-16 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center mx-auto mb-4", children: /* @__PURE__ */ jsx(CheckCircle2, { className: "h-8 w-8 text-primary" }) }),
        /* @__PURE__ */ jsx("h1", { className: "font-display text-3xl md:text-4xl font-extrabold mb-3", children: "Thank you! 🎉" }),
        /* @__PURE__ */ jsxs("p", { className: "text-muted-foreground text-lg max-w-md mx-auto", children: [
          /* @__PURE__ */ jsxs("strong", { className: "text-foreground capitalize", children: [
            childName,
            "'s"
          ] }),
          " book is generating now. Personalise the adventure even further with these one-time add-ons:"
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-4 mb-8", children: [
        /* @__PURE__ */ jsxs(
          "label",
          {
            htmlFor: "karaoke",
            className: `group flex items-start gap-4 bg-card rounded-2xl border-2 p-5 cursor-pointer transition-all duration-200 ${wantsKaraoke ? "border-primary shadow-lg shadow-primary/20" : "border-border hover:border-primary/50"}`,
            children: [
              /* @__PURE__ */ jsx("div", { className: "mt-0.5", children: /* @__PURE__ */ jsx(
                Checkbox,
                {
                  id: "karaoke",
                  checked: wantsKaraoke,
                  onCheckedChange: (checked) => setWantsKaraoke(!!checked),
                  className: "h-5 w-5"
                }
              ) }),
              /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 flex-wrap mb-1", children: [
                  /* @__PURE__ */ jsx(Volume2, { className: "h-5 w-5 text-primary shrink-0" }),
                  /* @__PURE__ */ jsx("span", { className: "font-display font-bold text-lg leading-tight", children: "Interactive Karaoke Read-Along Audiobook" }),
                  /* @__PURE__ */ jsxs("span", { className: "ml-auto font-bold text-primary text-base shrink-0", children: [
                    "+$",
                    KARAOKE_PRICE.toFixed(2)
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("p", { className: "text-sm text-muted-foreground leading-relaxed", children: [
                  "A warm, narrated audiobook of",
                  " ",
                  /* @__PURE__ */ jsxs("strong", { className: "text-foreground capitalize", children: [
                    childName,
                    "'s"
                  ] }),
                  " story with",
                  " ",
                  /* @__PURE__ */ jsx("strong", { className: "text-foreground", children: "karaoke-style word-by-word highlighting" }),
                  " ",
                  "using millisecond timestamps — perfect for early readers learning to follow along. Powered by ElevenLabs AI voice, synced with every sentence in real time."
                ] })
              ] })
            ]
          }
        ),
        /* @__PURE__ */ jsxs(
          "label",
          {
            htmlFor: "coloring",
            className: `group flex items-start gap-4 bg-card rounded-2xl border-2 p-5 cursor-pointer transition-all duration-200 ${wantsColoring ? "border-primary shadow-lg shadow-primary/20" : "border-border hover:border-primary/50"}`,
            children: [
              /* @__PURE__ */ jsx("div", { className: "mt-0.5", children: /* @__PURE__ */ jsx(
                Checkbox,
                {
                  id: "coloring",
                  checked: wantsColoring,
                  onCheckedChange: (checked) => setWantsColoring(!!checked),
                  className: "h-5 w-5"
                }
              ) }),
              /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 flex-wrap mb-1", children: [
                  /* @__PURE__ */ jsx(Palette, { className: "h-5 w-5 text-primary shrink-0" }),
                  /* @__PURE__ */ jsx("span", { className: "font-display font-bold text-lg leading-tight", children: "Custom Printable Black-and-White Coloring Pages" }),
                  /* @__PURE__ */ jsxs("span", { className: "ml-auto font-bold text-primary text-base shrink-0", children: [
                    "+$",
                    COLORING_PRICE.toFixed(2)
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("p", { className: "text-sm text-muted-foreground leading-relaxed", children: [
                  "Every storybook scene transformed into a",
                  " ",
                  /* @__PURE__ */ jsx("strong", { className: "text-foreground", children: "crisp printable outline" }),
                  " keeping",
                  " ",
                  /* @__PURE__ */ jsxs("strong", { className: "text-foreground capitalize", children: [
                    childName,
                    "'s"
                  ] }),
                  " likeness intact — so they can colour themselves as the hero. Print at home on any standard printer."
                ] })
              ] })
            ]
          }
        )
      ] }),
      addonsTotal > 0 && /* @__PURE__ */ jsxs("div", { className: "bg-primary/10 border border-primary/30 rounded-xl px-5 py-3 mb-5 flex items-center justify-between", children: [
        /* @__PURE__ */ jsx("span", { className: "text-sm font-bold text-foreground", children: "Add-ons total" }),
        /* @__PURE__ */ jsxs("span", { className: "text-xl font-extrabold text-primary", children: [
          "$",
          addonsTotal.toFixed(2)
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-3", children: [
        /* @__PURE__ */ jsx(
          Button,
          {
            onClick: handleCompleteOrder,
            disabled: loading,
            size: "lg",
            className: "w-full bg-primary text-primary-foreground hover:bg-primary/90 font-display text-lg rounded-full py-7 shadow-xl shadow-primary/30 hover:scale-105 transition-all duration-300 disabled:scale-100",
            children: loading ? /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx(Loader2, { className: "h-5 w-5 mr-2 animate-spin" }),
              "Redirecting to checkout…"
            ] }) : addonsTotal > 0 ? /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx(Sparkles, { className: "h-5 w-5 mr-2" }),
              "Complete Order — $",
              addonsTotal.toFixed(2),
              /* @__PURE__ */ jsx(ArrowRight, { className: "h-5 w-5 ml-2" })
            ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx(CheckCircle2, { className: "h-5 w-5 mr-2" }),
              "Complete Order (No Add-Ons)"
            ] })
          }
        ),
        /* @__PURE__ */ jsx(
          Button,
          {
            onClick: handleSkip,
            variant: "ghost",
            size: "lg",
            className: "w-full text-muted-foreground hover:text-foreground rounded-full",
            children: "Skip and View Base Book"
          }
        )
      ] }),
      /* @__PURE__ */ jsx("p", { className: "text-center text-xs text-muted-foreground mt-6", children: "Add-ons are delivered to the same PDF / library as your base book. All prices are one-time — no subscriptions." }),
      /* @__PURE__ */ jsx("div", { className: "text-center mt-4", children: /* @__PURE__ */ jsx(
        Link,
        {
          to: `/order-complete?order_id=${orderId}`,
          className: "text-xs text-muted-foreground/60 hover:text-muted-foreground underline",
          children: "View order status"
        }
      ) })
    ] })
  ] });
}
const STORY_THEMES = [
  "Fairy Tale",
  "Ocean Adventure & Pirates",
  "Prince & Princess",
  "Outer Space",
  "Dinosaurs"
];
const STRENGTHS = [
  "Kindness",
  "Bravery",
  "Curiosity",
  "Patience",
  "Creativity",
  "Generosity",
  "Determination",
  "Empathy"
];
const ProductDetail = () => {
  var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n;
  const { handle } = useParams();
  useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMedia, setSelectedMedia] = useState(0);
  const addItem = useCartStore((state) => state.addItem);
  const isLoading = useCartStore((state) => state.isLoading);
  const [childName, setChildName] = useState("");
  const [childGender, setChildGender] = useState("");
  const [childAge, setChildAge] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [theme, setTheme] = useState("");
  const [strength, setStrength] = useState("");
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [isSamplePhoto, setIsSamplePhoto] = useState(false);
  const [wantsAudiobook, setWantsAudiobook] = useState(false);
  const fileInputRef = useRef(null);
  const personalizationRef = useRef(null);
  const scrollToPersonalization = () => {
    setTimeout(() => {
      var _a2;
      (_a2 = personalizationRef.current) == null ? void 0 : _a2.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };
  useEffect(() => {
    if (!handle) return;
    setLoading(true);
    fetchProductByHandle(handle).then(setProduct).catch(console.error).finally(() => setLoading(false));
  }, [handle]);
  useEffect(() => {
    if (loading || !product) return;
    if (typeof window !== "undefined" && window.location.hash === "#personalize") {
      setTimeout(() => {
        var _a2;
        (_a2 = personalizationRef.current) == null ? void 0 : _a2.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 200);
    }
  }, [loading, product]);
  const handlePhotoChange = (e) => {
    var _a2;
    const file = (_a2 = e.target.files) == null ? void 0 : _a2[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Photo must be under 5MB");
      return;
    }
    setPhotoFile(file);
    setIsSamplePhoto(false);
    const reader = new FileReader();
    reader.onloadend = () => setPhotoPreview(reader.result);
    reader.readAsDataURL(file);
  };
  const AGE_OPTIONS = ["1-3", "4-7", "8-10", "11+"];
  const GENDER_OPTIONS = ["boy", "girl"];
  const SURPRISE_NAMES = ["Leo", "Mia", "Sam", "Ava", "Max", "Zoe"];
  const SURPRISE_PHOTO_PATH = "/images/sample-page-1.jpg";
  const surpriseMe = async () => {
    const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
    const pickedName = pick(SURPRISE_NAMES);
    const pickedGender = pickedName === "Leo" ? "boy" : pick(GENDER_OPTIONS);
    setChildName(pickedName);
    setChildGender(pickedGender);
    setChildAge(pick(AGE_OPTIONS));
    setTheme(pick(STORY_THEMES));
    setStrength(pick(STRENGTHS));
    try {
      const res = await fetch(SURPRISE_PHOTO_PATH);
      const blob = await res.blob();
      const file = new File([blob], "surprise-child.jpg", { type: blob.type || "image/jpeg" });
      setPhotoFile(file);
      setIsSamplePhoto(true);
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result);
      reader.readAsDataURL(blob);
    } catch (err) {
      console.error("Failed to load surprise photo", err);
    }
    toast.success("Sample loaded — upload your child's photo before checkout to make them the hero!", {
      position: "top-center"
    });
    scrollToPersonalization();
  };
  const totalPrice = BASE_PRICE + (wantsAudiobook ? AUDIOBOOK_PRICE : 0);
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail.trim());
  const isFormValid = childName.trim().length > 0 && childGender && childAge && theme && photoPreview && isEmailValid;
  if (loading) {
    return /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx(
        SEO,
        {
          title: "Loading Personalized Storybook | MESTAR",
          description: "Personalize a one-of-a-kind PDF storybook starring your child. Upload a photo, pick a theme, and download instantly.",
          canonical: handle ? `/product/${handle}` : void 0
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "min-h-screen flex flex-col items-center justify-center gap-4", children: [
        /* @__PURE__ */ jsx("h1", { className: "sr-only", children: "Loading personalized storybook" }),
        /* @__PURE__ */ jsx(Loader2, { className: "h-8 w-8 animate-spin text-primary" })
      ] })
    ] });
  }
  if (!product) {
    return /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx(
        SEO,
        {
          title: "Product Not Found | MESTAR",
          description: "This storybook could not be found. Browse our personalized children's storybooks at MESTAR.",
          canonical: handle ? `/product/${handle}` : void 0,
          noindex: true
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "min-h-screen flex flex-col items-center justify-center gap-4", children: [
        /* @__PURE__ */ jsx("h1", { className: "font-display text-2xl font-bold", children: "Product not found" }),
        /* @__PURE__ */ jsx(Button, { asChild: true, variant: "outline", children: /* @__PURE__ */ jsx(Link, { to: "/", children: "Back to Home" }) })
      ] })
    ] });
  }
  const { node } = product;
  const images = node.images.edges;
  const variant = (_a = node.variants.edges[0]) == null ? void 0 : _a.node;
  const handleAddToCart = async () => {
    var _a2;
    if (!variant || !isFormValid) return;
    if (isSamplePhoto) {
      const proceed = window.confirm(
        "You're about to order with the sample photo (Leo). Your child won't appear as the hero unless you upload their photo first.\n\nContinue with the sample photo anyway?"
      );
      if (!proceed) {
        (_a2 = fileInputRef.current) == null ? void 0 : _a2.click();
        return;
      }
    }
    const personalizationData = {
      childName: childName.trim(),
      childGender,
      childAge,
      theme,
      strength,
      photoUrl: photoPreview,
      customerEmail: customerEmail.trim(),
      selectedAddons: { illustrations: true, coloring: true, character: false, audiobook: wantsAudiobook },
      isBundle: true,
      totalPrice
    };
    localStorage.setItem("mestar-pending-story", JSON.stringify(personalizationData));
    await addItem({
      product,
      variantId: variant.id,
      variantTitle: variant.title,
      price: variant.price,
      quantity: 1,
      selectedOptions: variant.selectedOptions || [],
      personalization: personalizationData
    });
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
          options: []
        }
      };
      await addItem({
        product: audiobookProduct,
        variantId: AUDIOBOOK_ADDON.variantId,
        variantTitle: AUDIOBOOK_ADDON.title,
        price: { amount: AUDIOBOOK_ADDON.price.toFixed(2), currencyCode: "USD" },
        quantity: 1,
        selectedOptions: []
      });
    }
    toast.success("Added to cart! ⭐", { position: "top-center" });
  };
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen py-8", children: [
    /* @__PURE__ */ jsx(
      SEO,
      {
        title: `${node.title} | MESTAR`,
        description: (node.description || "").slice(0, 155) || `Personalize ${node.title}: a one-of-a-kind PDF storybook starring your child.`,
        canonical: `/product/${node.handle}`,
        type: "product",
        image: (_e = (_d = (_c = (_b = node.images) == null ? void 0 : _b.edges) == null ? void 0 : _c[0]) == null ? void 0 : _d.node) == null ? void 0 : _e.url,
        jsonLd: {
          "@context": "https://schema.org",
          "@type": "Product",
          name: node.title,
          description: node.description,
          image: ((_g = (_f = node.images) == null ? void 0 : _f.edges) == null ? void 0 : _g.map((e) => e.node.url)) || [],
          sku: ((_h = variant == null ? void 0 : variant.id) == null ? void 0 : _h.split("/").pop()) || node.handle,
          mpn: node.handle,
          productID: node.id,
          category: "Media > Books > Digital Books",
          brand: { "@type": "Brand", name: "MESTAR" },
          manufacturer: { "@type": "Organization", name: "MESTAR" },
          audience: {
            "@type": "PeopleAudience",
            suggestedMinAge: 1,
            suggestedMaxAge: 11
          },
          offers: {
            "@type": "Offer",
            price: (_j = (_i = node.priceRange) == null ? void 0 : _i.minVariantPrice) == null ? void 0 : _j.amount,
            priceCurrency: ((_l = (_k = node.priceRange) == null ? void 0 : _k.minVariantPrice) == null ? void 0 : _l.currencyCode) || "USD",
            availability: "https://schema.org/InStock",
            itemCondition: "https://schema.org/NewCondition",
            url: `https://mestar.pro/product/${node.handle}`,
            priceValidUntil: new Date((/* @__PURE__ */ new Date()).setFullYear((/* @__PURE__ */ new Date()).getFullYear() + 1)).toISOString().split("T")[0],
            seller: { "@type": "Organization", name: "MESTAR" },
            // Digital product — no physical shipping, instant download
            shippingDetails: {
              "@type": "OfferShippingDetails",
              shippingRate: {
                "@type": "MonetaryAmount",
                value: "0",
                currency: ((_n = (_m = node.priceRange) == null ? void 0 : _m.minVariantPrice) == null ? void 0 : _n.currencyCode) || "USD"
              },
              shippingDestination: {
                "@type": "DefinedRegion",
                geoMidpoint: { "@type": "GeoCoordinates" }
              },
              deliveryTime: {
                "@type": "ShippingDeliveryTime",
                handlingTime: { "@type": "QuantitativeValue", minValue: 0, maxValue: 0, unitCode: "DAY" },
                transitTime: { "@type": "QuantitativeValue", minValue: 0, maxValue: 0, unitCode: "DAY" }
              }
            },
            hasMerchantReturnPolicy: {
              "@type": "MerchantReturnPolicy",
              applicableCountry: "US",
              returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
              merchantReturnDays: 30,
              returnMethod: "https://schema.org/ReturnByMail",
              returnFees: "https://schema.org/FreeReturn"
            }
          }
        }
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: "container", children: [
      /* @__PURE__ */ jsxs(Link, { to: "/", className: "inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8", children: [
        /* @__PURE__ */ jsx(ArrowLeft, { className: "h-4 w-4" }),
        /* @__PURE__ */ jsx("span", { className: "text-sm font-medium", children: "Back to Shop" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12", children: [
        /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsx("div", { className: "aspect-square rounded-2xl overflow-hidden bg-card border border-border", children: images[selectedMedia] && /* @__PURE__ */ jsx(
            "img",
            {
              src: images[selectedMedia].node.url,
              alt: images[selectedMedia].node.altText || node.title,
              className: "w-full h-full object-contain"
            }
          ) }),
          /* @__PURE__ */ jsx("div", { className: "flex gap-3 overflow-x-auto pb-2", children: images.map((img, i) => /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setSelectedMedia(i),
              "aria-label": `View product image ${i + 1}`,
              className: `w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-colors ${i === selectedMedia ? "border-primary" : "border-border hover:border-primary/50"}`,
              children: /* @__PURE__ */ jsx("img", { src: img.node.url, alt: img.node.altText || "", className: "w-full h-full object-cover" })
            },
            i
          )) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-2 mb-3", children: [
            /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1 bg-primary/15 text-primary text-[11px] font-bold uppercase tracking-wider rounded-full px-2.5 py-1", children: [
              /* @__PURE__ */ jsx(Sparkles, { className: "h-3 w-3" }),
              " Bestseller"
            ] }),
            /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1 bg-primary/10 text-primary text-[11px] font-bold uppercase tracking-wider rounded-full px-2.5 py-1", children: [
              /* @__PURE__ */ jsx(Download, { className: "h-3 w-3" }),
              " Instant PDF"
            ] }),
            /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1 bg-primary/10 text-primary text-[11px] font-bold uppercase tracking-wider rounded-full px-2.5 py-1", children: [
              /* @__PURE__ */ jsx(Heart, { className: "h-3 w-3" }),
              " Ages 1–11+"
            ] })
          ] }),
          /* @__PURE__ */ jsx("h1", { className: "font-display text-3xl font-bold mb-4", children: node.title }),
          /* @__PURE__ */ jsx("div", { className: "flex items-baseline gap-3 mb-2 flex-wrap", children: /* @__PURE__ */ jsxs("span", { className: "text-3xl font-bold text-primary", children: [
            "$",
            totalPrice.toFixed(2)
          ] }) }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground mb-4", children: "One-time purchase — no subscription required — instant digital download" }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-6", children: [
            [1, 2, 3, 4, 5].map((i) => /* @__PURE__ */ jsx(Star, { className: "h-5 w-5 text-primary fill-primary" }, i)),
            /* @__PURE__ */ jsx("span", { className: "text-sm text-muted-foreground ml-1", children: "Loved by 2,000+ families" })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "grid grid-cols-3 gap-2 mb-6", children: [
            { icon: Download, label: "Instant download" },
            { icon: ShieldCheck, label: "Secure checkout" },
            { icon: Clock, label: "Ready in minutes" }
          ].map(({ icon: Icon, label }) => /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center gap-1 bg-card border border-border rounded-xl p-2 text-center", children: [
            /* @__PURE__ */ jsx(Icon, { className: "h-4 w-4 text-primary" }),
            /* @__PURE__ */ jsx("span", { className: "text-[10px] font-bold uppercase tracking-wider text-muted-foreground leading-tight", children: label })
          ] }, label)) }),
          /* @__PURE__ */ jsxs("div", { className: "bg-primary/5 border border-primary/20 rounded-2xl p-5 mb-6", children: [
            /* @__PURE__ */ jsxs("h2", { className: "font-display text-lg font-bold flex items-center gap-2 mb-3", children: [
              /* @__PURE__ */ jsx(Sparkles, { className: "h-5 w-5 text-primary" }),
              "Everything Included"
            ] }),
            /* @__PURE__ */ jsxs("ul", { className: "space-y-2 text-sm", children: [
              /* @__PURE__ */ jsxs("li", { className: "flex items-start gap-2", children: [
                /* @__PURE__ */ jsx(CheckCircle2, { className: "h-4 w-4 text-primary mt-0.5 flex-shrink-0" }),
                " Personalized PDF storybook starring your child"
              ] }),
              /* @__PURE__ */ jsxs("li", { className: "flex items-start gap-2", children: [
                /* @__PURE__ */ jsx(CheckCircle2, { className: "h-4 w-4 text-primary mt-0.5 flex-shrink-0" }),
                " Full-color storybook illustrations (scaled to your child's age group)"
              ] }),
              /* @__PURE__ */ jsxs("li", { className: "flex items-start gap-2", children: [
                /* @__PURE__ */ jsx(CheckCircle2, { className: "h-4 w-4 text-primary mt-0.5 flex-shrink-0" }),
                " Matching printable coloring pages included"
              ] })
            ] }),
            /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground mt-3", children: [
              "Want to add a sibling, friend, or pet? You can add a Supporting Character (+$",
              SUPPORTING_CHARACTER_PRICE.toFixed(2),
              ") on the next step."
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { ref: personalizationRef, className: "bg-card rounded-2xl border border-border p-6 mb-6 space-y-5 scroll-mt-24", children: [
            /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
              /* @__PURE__ */ jsx("h2", { className: "font-display text-lg font-bold flex items-center justify-center gap-2", children: "✨ Personalize Your Story" }),
              /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground mt-1 mb-2", children: [
                "Just curious?",
                " ",
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    type: "button",
                    onClick: surpriseMe,
                    className: "text-primary font-semibold underline-offset-2 hover:underline",
                    children: "Try a sample first →"
                  }
                )
              ] })
            ] }),
            isSamplePhoto && /* @__PURE__ */ jsxs("div", { className: "bg-primary/10 border border-primary/30 rounded-xl p-3 text-xs text-foreground/80 flex items-start gap-2", children: [
              /* @__PURE__ */ jsx(Sparkles, { className: "h-4 w-4 text-primary flex-shrink-0 mt-0.5" }),
              /* @__PURE__ */ jsxs("span", { children: [
                "You're previewing a sample (Leo).",
                " ",
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    type: "button",
                    onClick: () => {
                      var _a2;
                      return (_a2 = fileInputRef.current) == null ? void 0 : _a2.click();
                    },
                    className: "text-primary font-bold underline",
                    children: "Upload your child's photo"
                  }
                ),
                " ",
                "to make them the hero of the story."
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsx(Label, { className: "font-medium", children: "Child's Photo *" }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "A clear, well-lit photo helps us match their look." }),
              /* @__PURE__ */ jsx("input", { ref: fileInputRef, type: "file", accept: "image/*", onChange: handlePhotoChange, className: "hidden" }),
              photoPreview ? /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
                /* @__PURE__ */ jsx("div", { className: "w-16 h-16 rounded-lg overflow-hidden border border-border", children: /* @__PURE__ */ jsx("img", { src: photoPreview, alt: "Child's photo", className: "w-full h-full object-cover" }) }),
                /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
                  /* @__PURE__ */ jsxs("p", { className: "text-sm font-medium flex items-center gap-1", children: [
                    /* @__PURE__ */ jsx(CheckCircle2, { className: "h-4 w-4 text-primary" }),
                    " Photo uploaded"
                  ] }),
                  /* @__PURE__ */ jsx("button", { onClick: () => {
                    var _a2;
                    return (_a2 = fileInputRef.current) == null ? void 0 : _a2.click();
                  }, className: "text-xs text-primary hover:underline", children: "Change photo" })
                ] })
              ] }) : /* @__PURE__ */ jsxs(Button, { type: "button", variant: "outline", onClick: () => {
                var _a2;
                return (_a2 = fileInputRef.current) == null ? void 0 : _a2.click();
              }, className: "w-full border-dashed border-2", children: [
                /* @__PURE__ */ jsx(Upload, { className: "h-4 w-4 mr-2" }),
                " Upload Photo"
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsx(Label, { htmlFor: "childName", className: "font-medium", children: "Child's Name *" }),
              /* @__PURE__ */ jsx(Input, { id: "childName", placeholder: "Enter your child's name", value: childName, onChange: (e) => setChildName(e.target.value), maxLength: 50 })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsx(Label, { htmlFor: "childGender", className: "font-medium", children: "Boy or Girl *" }),
              /* @__PURE__ */ jsxs(Select, { value: childGender, onValueChange: setChildGender, children: [
                /* @__PURE__ */ jsx(SelectTrigger, { id: "childGender", children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Select boy or girl" }) }),
                /* @__PURE__ */ jsxs(SelectContent, { children: [
                  /* @__PURE__ */ jsx(SelectItem, { value: "boy", children: "Boy" }),
                  /* @__PURE__ */ jsx(SelectItem, { value: "girl", children: "Girl" })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsx(Label, { htmlFor: "childAge", className: "font-medium", children: "Age Group *" }),
              /* @__PURE__ */ jsxs(Select, { value: childAge, onValueChange: setChildAge, children: [
                /* @__PURE__ */ jsx(SelectTrigger, { id: "childAge", children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Select age group" }) }),
                /* @__PURE__ */ jsxs(SelectContent, { children: [
                  /* @__PURE__ */ jsx(SelectItem, { value: "1-3", children: "1–3 years old" }),
                  /* @__PURE__ */ jsx(SelectItem, { value: "4-7", children: "4–7 years old" }),
                  /* @__PURE__ */ jsx(SelectItem, { value: "8-10", children: "8–10 years old" }),
                  /* @__PURE__ */ jsx(SelectItem, { value: "11+", children: "11+ years old" })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsx(Label, { htmlFor: "customerEmail", className: "font-medium", children: "Your Email *" }),
              /* @__PURE__ */ jsx(Input, { id: "customerEmail", type: "email", placeholder: "Where we'll send your finished PDF", value: customerEmail, onChange: (e) => setCustomerEmail(e.target.value), maxLength: 255 })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsx(Label, { htmlFor: "theme", className: "font-medium", children: "Story Theme *" }),
              /* @__PURE__ */ jsxs(Select, { value: theme, onValueChange: setTheme, children: [
                /* @__PURE__ */ jsx(SelectTrigger, { id: "theme", children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Choose a theme" }) }),
                /* @__PURE__ */ jsx(SelectContent, { children: STORY_THEMES.map((t) => /* @__PURE__ */ jsx(SelectItem, { value: t, children: t }, t)) })
              ] }),
              theme && /* @__PURE__ */ jsxs("div", { className: "mt-4 rounded-2xl border border-border bg-card/40 p-4", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-3", children: [
                  /* @__PURE__ */ jsx(Sparkles, { className: "h-4 w-4 text-primary" }),
                  /* @__PURE__ */ jsxs("span", { className: "text-sm font-bold text-primary", children: [
                    "Sample: ",
                    theme
                  ] })
                ] }),
                /* @__PURE__ */ jsx(StoryPreview, { theme, productHandle: handle, embedded: true }),
                /* @__PURE__ */ jsx("p", { className: "text-center text-[11px] text-muted-foreground mt-3", children: "Sample only — your child's book will star them by name & photo." })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsx(Label, { htmlFor: "strength", className: "font-medium", children: "Strength to Nurture" }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Optional positive trait your child will demonstrate." }),
              /* @__PURE__ */ jsxs(Select, { value: strength, onValueChange: setStrength, children: [
                /* @__PURE__ */ jsx(SelectTrigger, { id: "strength", children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Choose a strength (optional)" }) }),
                /* @__PURE__ */ jsx(SelectContent, { children: STRENGTHS.map((s) => /* @__PURE__ */ jsx(SelectItem, { value: s, children: s }, s)) })
              ] })
            ] }),
            /* @__PURE__ */ jsx(
              "div",
              {
                className: "block rounded-2xl border-2 border-dashed border-border bg-muted/40 p-4",
                "aria-disabled": "true",
                children: /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
                  /* @__PURE__ */ jsx("div", { className: "mt-1 h-5 w-5 rounded border-2 border-muted-foreground/30 bg-background flex items-center justify-center", children: /* @__PURE__ */ jsx(Volume2, { className: "h-3 w-3 text-muted-foreground/60" }) }),
                  /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
                    /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-2 mb-1", children: [
                      /* @__PURE__ */ jsx("span", { className: "font-display font-bold text-sm text-foreground/80", children: "Karaoke Audiobook Add-On" }),
                      /* @__PURE__ */ jsxs("div", { className: "flex flex-col", children: [
                        /* @__PURE__ */ jsx("span", { className: "inline-flex items-center rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5", children: "Coming soon" }),
                        /* @__PURE__ */ jsx("span", { className: "text-[9px] text-muted-foreground/70 tracking-wide lowercase mt-0.5", children: "under construction" })
                      ] })
                    ] }),
                    /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground leading-relaxed", children: "A gentle narrated read-aloud with karaoke-style word highlighting — perfect for little ones learning to follow along. We're putting the finishing touches on it now and it'll be ready for your family very soon." })
                  ] })
                ] })
              }
            )
          ] }),
          /* @__PURE__ */ jsx(
            Button,
            {
              onClick: handleAddToCart,
              disabled: isLoading || !(variant == null ? void 0 : variant.availableForSale) || !isFormValid,
              size: "lg",
              className: "bg-primary text-primary-foreground hover:bg-primary/90 font-display text-lg rounded-full shadow-lg shadow-primary/25",
              children: isLoading ? /* @__PURE__ */ jsx(Loader2, { className: "h-5 w-5 animate-spin" }) : `Add to Cart — $${totalPrice.toFixed(2)} ⭐`
            }
          ),
          !isFormValid && childName.length === 0 && /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground mt-2 text-center", children: "Fill in all personalization details to add to cart" }),
          /* @__PURE__ */ jsxs("div", { className: "mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground", children: [
            /* @__PURE__ */ jsx(ShieldCheck, { className: "h-4 w-4 text-primary" }),
            /* @__PURE__ */ jsx("span", { children: "Love it or your money back — 100% satisfaction guarantee" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "mt-10 space-y-3 border-t border-border pt-8 text-sm text-muted-foreground", children: [
            /* @__PURE__ */ jsx("p", { children: "✨ Personalized with your child's name & photo" }),
            /* @__PURE__ */ jsx("p", { children: "📖 Personalized digital PDF storybook" }),
            /* @__PURE__ */ jsx("p", { children: "🌟 Your child is the hero!" }),
            /* @__PURE__ */ jsx("p", { children: "💝 Age-appropriate & non-violent" }),
            /* @__PURE__ */ jsx("p", { children: "⚡ Instant download after purchase" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "mt-6 rounded-2xl border border-primary/20 bg-primary/5 p-4 text-center", children: [
            /* @__PURE__ */ jsx("p", { className: "text-[10px] font-bold uppercase tracking-wider text-primary mb-1", children: "On the way" }),
            /* @__PURE__ */ jsx("p", { className: "text-sm font-display font-bold text-foreground mb-1", children: "📬 Printed paperback storybooks, mailed to your home" }),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground leading-relaxed", children: "We're working with a trusted print partner to bring your child's story to life as a beautifully bound paperback keepsake, shipped right to your door. Coming soon — keep an eye on your inbox for the launch." })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "md:hidden fixed bottom-0 inset-x-0 z-40 bg-background/95 backdrop-blur-md border-t border-border p-3 shadow-2xl", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col leading-none", children: [
        /* @__PURE__ */ jsxs("span", { className: "text-lg font-extrabold text-primary", children: [
          "$",
          totalPrice.toFixed(2)
        ] }),
        /* @__PURE__ */ jsx("span", { className: "text-[10px] text-muted-foreground", children: "one-time payment" })
      ] }),
      /* @__PURE__ */ jsx(
        Button,
        {
          onClick: handleAddToCart,
          disabled: isLoading || !(variant == null ? void 0 : variant.availableForSale) || !isFormValid,
          className: "flex-1 bg-primary text-primary-foreground hover:bg-primary/90 font-display rounded-full shadow-lg shadow-primary/25",
          children: isLoading ? /* @__PURE__ */ jsx(Loader2, { className: "h-5 w-5 animate-spin" }) : isFormValid ? "Add to Cart ⭐" : "Personalize above ↑"
        }
      )
    ] }) }),
    /* @__PURE__ */ jsx("div", { className: "md:hidden h-20", "aria-hidden": "true" })
  ] });
};
const About = () => {
  const [firstHandle, setFirstHandle] = useState(null);
  useEffect(() => {
    fetchProducts(1).then((products) => {
      if (products.length > 0) setFirstHandle(products[0].node.handle);
    }).catch(console.error);
  }, []);
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen py-16", children: [
    /* @__PURE__ */ jsx(
      SEO,
      {
        title: "About MESTAR — Personalized Children's Storybooks",
        description: "Learn the story behind MESTAR: AI-personalized PDF storybooks where your child is the hero. Safe, age-appropriate, and made to be treasured.",
        canonical: "/about"
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: "container max-w-3xl", children: [
      /* @__PURE__ */ jsxs("div", { className: "text-center mb-12", children: [
        /* @__PURE__ */ jsxs("div", { className: "inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 mb-6", children: [
          /* @__PURE__ */ jsx(Heart, { className: "h-4 w-4 text-primary" }),
          /* @__PURE__ */ jsx("span", { className: "text-sm font-medium text-primary", children: "Our Story" })
        ] }),
        /* @__PURE__ */ jsxs("h1", { className: "font-display text-4xl font-extrabold mb-4", children: [
          "About ",
          /* @__PURE__ */ jsxs("span", { className: "text-foreground", children: [
            "My ",
            /* @__PURE__ */ jsx("span", { className: "text-star-yellow", children: "Star" }),
            " Stories"
          ] })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-lg text-muted-foreground leading-relaxed", children: "Where every child becomes the hero of their own adventure." })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-8", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-card rounded-2xl p-8 border border-border text-center", children: [
          /* @__PURE__ */ jsx(BookOpen, { className: "h-8 w-8 text-primary mb-4 mx-auto" }),
          /* @__PURE__ */ jsxs("h2", { className: "font-display text-2xl font-bold mb-4", children: [
            "Why We Created My ",
            /* @__PURE__ */ jsx("span", { className: "text-star-yellow", children: "Star" }),
            " Stories"
          ] }),
          /* @__PURE__ */ jsxs("p", { className: "text-muted-foreground leading-relaxed mb-4", children: [
            "Every child deserves to see themselves as the hero. My ",
            /* @__PURE__ */ jsx("span", { className: "text-star-yellow", children: "Star" }),
            " Stories was born from a simple idea: what if bedtime wasn't just about winding down, but about building confidence, sparking imagination, and showing kids that they can overcome any challenge?"
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-muted-foreground leading-relaxed", children: "Our personalized digital storybooks place your child at the center of a magical adventure. Each story is carefully crafted to be age-appropriate, non-violent, and empowering — portraying your little one as the brave problem-solver who saves the day." })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-4", children: [
          { icon: Star, title: "Personalized", desc: "Your child's name & photo creates the story" },
          { icon: Sparkles, title: "Empowering", desc: "your child is the problem solving ⭐" },
          { icon: Heart, title: "Age-Appropriate", desc: "Non-violent, positive one of a kind stories for all ages" }
        ].map(({ icon: Icon, title, desc }) => /* @__PURE__ */ jsxs("div", { className: "bg-card rounded-2xl p-6 border border-border text-center", children: [
          /* @__PURE__ */ jsx(Icon, { className: "h-6 w-6 text-primary mx-auto mb-3" }),
          /* @__PURE__ */ jsx("h3", { className: "font-display font-bold mb-2", children: title }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: desc })
        ] }, title)) }),
        /* @__PURE__ */ jsxs("div", { className: "bg-card rounded-2xl p-8 border border-border text-center", children: [
          /* @__PURE__ */ jsx(Download, { className: "h-8 w-8 text-primary mb-4 mx-auto" }),
          /* @__PURE__ */ jsx("h2", { className: "font-display text-2xl font-bold mb-4", children: "Instant Digital Download" }),
          /* @__PURE__ */ jsxs("p", { className: "text-muted-foreground leading-relaxed mb-4", children: [
            "Each My ",
            /* @__PURE__ */ jsx("span", { className: "text-star-yellow", children: "Star" }),
            " Stories set includes a personalized PDF storybook plus bonus coloring pages featuring scenes from the adventure. Download instantly after purchase and start reading tonight! ✨"
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground/60 italic", children: "Paperback books coming soon!" }),
          /* @__PURE__ */ jsxs("p", { className: "text-muted-foreground leading-relaxed", children: [
            "We believe that reading together creates lifelong memories. With My ",
            /* @__PURE__ */ jsx("span", { className: "text-star-yellow", children: "Star" }),
            " Stories, bedtime becomes the most magical part of the day."
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "text-center mt-10", children: firstHandle ? /* @__PURE__ */ jsxs(
          Link,
          {
            to: `/product/${firstHandle}#personalize`,
            className: "inline-flex items-center gap-2 bg-primary text-primary-foreground font-display font-bold rounded-full px-8 py-3 hover:opacity-90 transition-opacity",
            children: [
              /* @__PURE__ */ jsx(Sparkles, { className: "h-4 w-4" }),
              "Create Your Story Now ⭐"
            ]
          }
        ) : /* @__PURE__ */ jsxs(
          Link,
          {
            to: "/",
            className: "inline-flex items-center gap-2 bg-primary text-primary-foreground font-display font-bold rounded-full px-8 py-3 hover:opacity-90 transition-opacity",
            children: [
              /* @__PURE__ */ jsx(Sparkles, { className: "h-4 w-4" }),
              "Create Your Story Now ⭐"
            ]
          }
        ) })
      ] })
    ] })
  ] });
};
const Accordion = AccordionPrimitive.Root;
const AccordionItem = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(AccordionPrimitive.Item, { ref, className: cn("border-b", className), ...props }));
AccordionItem.displayName = "AccordionItem";
const AccordionTrigger = React.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsx(AccordionPrimitive.Header, { className: "flex", children: /* @__PURE__ */ jsxs(
  AccordionPrimitive.Trigger,
  {
    ref,
    className: cn(
      "flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline [&[data-state=open]>svg]:rotate-180",
      className
    ),
    ...props,
    children: [
      children,
      /* @__PURE__ */ jsx(ChevronDown, { className: "h-4 w-4 shrink-0 transition-transform duration-200" })
    ]
  }
) }));
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName;
const AccordionContent = React.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsx(
  AccordionPrimitive.Content,
  {
    ref,
    className: "overflow-hidden text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down",
    ...props,
    children: /* @__PURE__ */ jsx("div", { className: cn("pb-4 pt-0", className), children })
  }
));
AccordionContent.displayName = AccordionPrimitive.Content.displayName;
const faqs = [
  {
    q: "What do I get with my order?",
    a: "You'll receive a personalized digital PDF storybook where your child is the hero, plus bonus coloring pages featuring scenes from their adventure — all as an instant download you can print at home or read on any device."
  },
  {
    q: "How does the personalization work?",
    a: "Simply upload a clear photo of your child, enter their name, select boy or girl, choose their age group, and pick a story theme. Our AI creates a one-of-a-kind story and coloring pages tailored just for them!"
  },
  {
    q: "Is the content safe and age-appropriate?",
    a: "Absolutely! Every story is non-violent and age-appropriate. Your child is always the hero and problem-solver, learning positive values through fun adventures. Stories are carefully crafted for ages 1–11+."
  }
];
const FAQ = () => {
  const [firstHandle, setFirstHandle] = useState(null);
  useEffect(() => {
    fetchProducts(1).then((products) => {
      if (products.length > 0) setFirstHandle(products[0].node.handle);
    }).catch(console.error);
  }, []);
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a }
    }))
  };
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen py-16", children: [
    /* @__PURE__ */ jsx(
      SEO,
      {
        title: "FAQ — Personalized Storybook Questions Answered | MESTAR",
        description: "Answers to common questions about MESTAR's personalized PDF storybooks: how personalization works, what you get, safety, delivery, and refunds.",
        canonical: "/faq",
        jsonLd: faqJsonLd
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: "container max-w-2xl", children: [
      /* @__PURE__ */ jsxs("div", { className: "text-center mb-12", children: [
        /* @__PURE__ */ jsxs("div", { className: "inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 mb-6", children: [
          /* @__PURE__ */ jsx(HelpCircle, { className: "h-4 w-4 text-primary" }),
          /* @__PURE__ */ jsx("span", { className: "text-sm font-medium text-primary", children: "Got Questions?" })
        ] }),
        /* @__PURE__ */ jsxs("h1", { className: "font-display text-4xl font-extrabold mb-4", children: [
          "Frequently Asked ",
          /* @__PURE__ */ jsx("span", { className: "text-primary", children: "Questions" })
        ] }),
        /* @__PURE__ */ jsxs("p", { className: "text-lg text-muted-foreground", children: [
          "Everything you need to know about My ",
          /* @__PURE__ */ jsx("span", { className: "text-star-yellow", children: "Star" }),
          " Stories ⭐"
        ] })
      ] }),
      /* @__PURE__ */ jsx("h2", { className: "font-display text-2xl font-bold mb-6 text-center", children: "Questions & Answers" }),
      /* @__PURE__ */ jsx(Accordion, { type: "single", collapsible: true, className: "space-y-3", children: faqs.map((faq, i) => /* @__PURE__ */ jsxs(
        AccordionItem,
        {
          value: `faq-${i}`,
          className: "bg-card rounded-xl border border-border px-6 data-[state=open]:border-primary/30",
          children: [
            /* @__PURE__ */ jsx(AccordionTrigger, { className: "font-display text-center font-semibold hover:no-underline hover:text-primary py-5 justify-center [&>svg]:ml-2", children: faq.q }),
            /* @__PURE__ */ jsx(AccordionContent, { className: "text-muted-foreground leading-relaxed pb-5 text-center", children: faq.a })
          ]
        },
        i
      )) }),
      /* @__PURE__ */ jsxs("div", { className: "text-center mt-12", children: [
        /* @__PURE__ */ jsx("h2", { className: "font-display text-2xl font-bold mb-3", children: "Get Started" }),
        /* @__PURE__ */ jsx("p", { className: "text-muted-foreground mb-4", children: "Ready to get started?" }),
        firstHandle ? /* @__PURE__ */ jsxs(
          Link,
          {
            to: `/product/${firstHandle}#personalize`,
            className: "inline-flex items-center gap-2 bg-primary text-primary-foreground font-display font-bold rounded-full px-8 py-3 hover:opacity-90 transition-opacity",
            children: [
              /* @__PURE__ */ jsx(Sparkles, { className: "h-4 w-4" }),
              "Create Your Story Now ⭐"
            ]
          }
        ) : /* @__PURE__ */ jsxs(
          Link,
          {
            to: "/",
            className: "inline-flex items-center gap-2 bg-primary text-primary-foreground font-display font-bold rounded-full px-8 py-3 hover:opacity-90 transition-opacity",
            children: [
              /* @__PURE__ */ jsx(Sparkles, { className: "h-4 w-4" }),
              "Create Your Story Now ⭐"
            ]
          }
        )
      ] })
    ] })
  ] });
};
const reviews = [
  {
    name: "Sarah M.",
    child: "her daughter Lily",
    text: "My daughter was absolutely thrilled to see herself as the hero of her own fairy tale! The coloring pages were a huge bonus — she spent the whole afternoon coloring them. Worth every penny!"
  },
  {
    name: "James T.",
    child: "his son Noah",
    text: "I ordered this for my son's birthday and it was the highlight of the party. He kept saying 'That's ME!' while we read it together. The story quality blew me away — it didn't feel generic at all."
  },
  {
    name: "Michelle R.",
    child: "her twins",
    text: "I ordered separate stories for each of my twins and they both loved having their own unique adventure. The dinosaur theme was a huge hit! Already planning to order more as gifts for their cousins."
  }
];
const Reviews = () => {
  const [firstHandle, setFirstHandle] = useState(null);
  useEffect(() => {
    fetchProducts(1).then((products) => {
      if (products.length > 0) setFirstHandle(products[0].node.handle);
    }).catch(console.error);
  }, []);
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen py-16", children: [
    /* @__PURE__ */ jsx(
      SEO,
      {
        title: "Reviews — What Families Say About MESTAR Storybooks",
        description: "Real reviews from parents and kids who received MESTAR personalized storybooks. See why families love making their child the hero of the story.",
        canonical: "/reviews",
        jsonLd: {
          "@context": "https://schema.org",
          "@type": "Product",
          name: "MESTAR Personalized Storybook",
          description: "Personalized children's PDF storybook starring your child, with matching coloring pages.",
          brand: { "@type": "Brand", name: "MESTAR" },
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: "5",
            reviewCount: String(reviews.length),
            bestRating: "5",
            worstRating: "1"
          },
          review: reviews.map((r) => ({
            "@type": "Review",
            author: { "@type": "Person", name: r.name },
            reviewRating: {
              "@type": "Rating",
              ratingValue: "5",
              bestRating: "5",
              worstRating: "1"
            },
            reviewBody: r.text
          }))
        }
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: "container max-w-2xl", children: [
      /* @__PURE__ */ jsxs("div", { className: "text-center mb-12", children: [
        /* @__PURE__ */ jsxs("div", { className: "inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 mb-6", children: [
          /* @__PURE__ */ jsx(Star, { className: "h-4 w-4 text-primary fill-primary" }),
          /* @__PURE__ */ jsx("span", { className: "text-sm font-medium text-primary", children: "Happy Families" })
        ] }),
        /* @__PURE__ */ jsxs("h1", { className: "font-display text-4xl font-extrabold mb-4", children: [
          "What Parents Are ",
          /* @__PURE__ */ jsx("span", { className: "text-primary", children: "Saying" })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-lg text-muted-foreground", children: "Real stories from real families ⭐" })
      ] }),
      /* @__PURE__ */ jsx("h2", { className: "font-display text-2xl font-bold mb-6 text-center", children: "Customer Stories" }),
      /* @__PURE__ */ jsx("div", { className: "space-y-6", children: reviews.map((review, i) => /* @__PURE__ */ jsxs(
        "div",
        {
          className: "bg-card rounded-xl border border-border p-6 space-y-4 text-center",
          children: [
            /* @__PURE__ */ jsx("div", { className: "flex gap-1 justify-center", children: [...Array(5)].map((_, s) => /* @__PURE__ */ jsx(Star, { className: "h-5 w-5 text-primary fill-primary" }, s)) }),
            /* @__PURE__ */ jsxs("p", { className: "text-foreground leading-relaxed italic", children: [
              '"',
              review.text,
              '"'
            ] }),
            /* @__PURE__ */ jsxs("p", { className: "text-sm text-muted-foreground font-medium", children: [
              "— ",
              review.name,
              ", ordered for ",
              review.child
            ] })
          ]
        },
        i
      )) }),
      /* @__PURE__ */ jsxs("div", { className: "text-center mt-12", children: [
        /* @__PURE__ */ jsx("h2", { className: "font-display text-2xl font-bold mb-3", children: "Create Your Story" }),
        /* @__PURE__ */ jsx("p", { className: "text-muted-foreground mb-4", children: "Join these happy families!" }),
        firstHandle ? /* @__PURE__ */ jsxs(
          Link,
          {
            to: `/product/${firstHandle}#personalize`,
            className: "inline-flex items-center gap-2 bg-primary text-primary-foreground font-display font-bold rounded-full px-8 py-3 hover:opacity-90 transition-opacity",
            children: [
              /* @__PURE__ */ jsx(Sparkles, { className: "h-4 w-4" }),
              "Create Your Story Now ⭐"
            ]
          }
        ) : /* @__PURE__ */ jsxs(
          Link,
          {
            to: "/",
            className: "inline-flex items-center gap-2 bg-primary text-primary-foreground font-display font-bold rounded-full px-8 py-3 hover:opacity-90 transition-opacity",
            children: [
              /* @__PURE__ */ jsx(Sparkles, { className: "h-4 w-4" }),
              "Create Your Story Now ⭐"
            ]
          }
        )
      ] })
    ] })
  ] });
};
const benefits = [
  {
    icon: Heart,
    title: "Builds Unbreakable Bonds",
    description: "Snuggling up with a story creates moments of closeness that children carry with them for life. It tells them: you matter, and I'm here."
  },
  {
    icon: Clock,
    title: "The Gift of Undivided Attention",
    description: "In a world full of screens and schedules, sitting down to read together says more than words ever could. It's pure, focused love."
  },
  {
    icon: Sparkles,
    title: "Sparks Imagination & Confidence",
    description: "When children hear stories — especially ones where they're the hero — they start to believe they can do anything. That belief stays with them forever."
  }
];
const WhyReadTogether = () => {
  const [firstHandle, setFirstHandle] = useState(null);
  useEffect(() => {
    fetchProducts(1).then((products) => {
      if (products.length > 0) setFirstHandle(products[0].node.handle);
    }).catch(console.error);
  }, []);
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen py-16", children: [
    /* @__PURE__ */ jsx(
      SEO,
      {
        title: "Why Read Together — The Power of Bedtime Stories | MESTAR",
        description: "Reading together builds bonds, sparks imagination, and grows confidence. Discover why personalized stories where your child is the hero matter most.",
        canonical: "/why-read-together",
        type: "article",
        jsonLd: {
          "@context": "https://schema.org",
          "@type": "Article",
          headline: "Why Reading Together Is the Best Gift for Your Child",
          description: "Reading together builds bonds, sparks imagination, and grows confidence. Discover why personalized stories where your child is the hero matter most.",
          author: { "@type": "Organization", name: "MESTAR" },
          publisher: {
            "@type": "Organization",
            name: "MESTAR",
            logo: { "@type": "ImageObject", url: "https://mestar.pro/favicon.ico" }
          },
          mainEntityOfPage: {
            "@type": "WebPage",
            "@id": "https://mestar.pro/why-read-together"
          }
        }
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: "container max-w-3xl", children: [
      /* @__PURE__ */ jsxs("div", { className: "text-center mb-16", children: [
        /* @__PURE__ */ jsxs("div", { className: "inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 mb-6", children: [
          /* @__PURE__ */ jsx(BookOpen, { className: "h-4 w-4 text-primary" }),
          /* @__PURE__ */ jsx("span", { className: "text-sm font-medium text-primary", children: "Why It Matters" })
        ] }),
        /* @__PURE__ */ jsxs("h1", { className: "font-display text-4xl md:text-5xl font-extrabold mb-6 leading-tight", children: [
          "Why Reading Together Is the Best Gift",
          " ",
          /* @__PURE__ */ jsx("span", { className: "text-primary", children: "for Your Child" })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "font-display text-2xl md:text-3xl font-bold text-foreground/80 leading-tight", children: "The best gift you can give a child is your time — the second best? A story where they're the hero." })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-card border border-primary/20 rounded-2xl p-8 md:p-10 text-center mb-16", children: [
        /* @__PURE__ */ jsx(Star, { className: "h-8 w-8 text-primary fill-primary mx-auto mb-4" }),
        /* @__PURE__ */ jsx("blockquote", { className: "font-display text-xl md:text-2xl font-bold text-foreground leading-relaxed mb-4", children: `"Children won't remember the toys you bought them. They'll remember the time you spent with them — and the stories you shared."` }),
        /* @__PURE__ */ jsxs("p", { className: "text-muted-foreground text-sm", children: [
          "Every My ",
          /* @__PURE__ */ jsx("span", { className: "text-star-yellow", children: "Star" }),
          " Stories book is designed to be read together, turning bedtime into the best part of the day."
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "space-y-6 mb-16", children: benefits.map((benefit, i) => /* @__PURE__ */ jsxs(
        "div",
        {
          className: "bg-card rounded-xl border border-border p-6 flex flex-col gap-4 items-center text-center",
          children: [
            /* @__PURE__ */ jsx("div", { className: "bg-primary/10 rounded-lg p-3 shrink-0", children: /* @__PURE__ */ jsx(benefit.icon, { className: "h-6 w-6 text-primary" }) }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("h2", { className: "font-display text-lg font-bold text-foreground mb-1", children: benefit.title }),
              /* @__PURE__ */ jsx("p", { className: "text-muted-foreground leading-relaxed", children: benefit.description })
            ] })
          ]
        },
        i
      )) }),
      /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
        /* @__PURE__ */ jsx("p", { className: "text-muted-foreground mb-4", children: "Give them both gifts tonight." }),
        firstHandle ? /* @__PURE__ */ jsxs(
          Link,
          {
            to: `/product/${firstHandle}#personalize`,
            className: "inline-flex items-center gap-2 bg-primary text-primary-foreground font-display font-bold rounded-full px-8 py-3 hover:opacity-90 transition-opacity",
            children: [
              /* @__PURE__ */ jsx(Sparkles, { className: "h-4 w-4" }),
              "Create Their Story"
            ]
          }
        ) : /* @__PURE__ */ jsxs(
          Link,
          {
            to: "/",
            className: "inline-flex items-center gap-2 bg-primary text-primary-foreground font-display font-bold rounded-full px-8 py-3 hover:opacity-90 transition-opacity",
            children: [
              /* @__PURE__ */ jsx(Sparkles, { className: "h-4 w-4" }),
              "Create Their Story"
            ]
          }
        )
      ] })
    ] })
  ] });
};
const NotFound = () => {
  const location = useLocation();
  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);
  return /* @__PURE__ */ jsxs("div", { className: "flex min-h-screen items-center justify-center bg-muted", children: [
    /* @__PURE__ */ jsx(SEO, { title: "Page Not Found — MESTAR", description: "This page doesn't exist or has moved. Head back to MESTAR to explore personalized storybooks starring your child.", noindex: true }),
    /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsx("h1", { className: "mb-4 text-4xl font-bold", children: "404" }),
      /* @__PURE__ */ jsx("p", { className: "mb-4 text-xl text-muted-foreground", children: "Oops! Page not found" }),
      /* @__PURE__ */ jsx("a", { href: "/", className: "text-primary underline hover:text-primary/90", children: "Return to Home" })
    ] })
  ] });
};
const PrivacyPolicy = () => {
  return /* @__PURE__ */ jsxs("div", { className: "container py-16 max-w-3xl", children: [
    /* @__PURE__ */ jsx(
      SEO,
      {
        title: "Privacy Policy — MESTAR",
        description: "How MESTAR handles your family's information: photos, payment, and personal details. Read our privacy commitments in plain English.",
        canonical: "/privacy-policy"
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: "text-center mb-12", children: [
      /* @__PURE__ */ jsx(Shield, { className: "h-12 w-12 text-primary mx-auto mb-4" }),
      /* @__PURE__ */ jsx("h1", { className: "font-display text-4xl font-bold mb-3", children: "Privacy Policy" }),
      /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: "Your family's privacy matters to us. Here's exactly how we handle your information." })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-10 text-center", children: [
      /* @__PURE__ */ jsxs("section", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-center gap-2", children: [
          /* @__PURE__ */ jsx(Users, { className: "h-5 w-5 text-primary" }),
          /* @__PURE__ */ jsx("h2", { className: "font-display text-xl font-bold", children: "What We Collect" })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-muted-foreground leading-relaxed", children: "To create your child's personalized story, we collect:" }),
        /* @__PURE__ */ jsxs("ul", { className: "text-muted-foreground space-y-1 inline-block text-left mx-auto", children: [
          /* @__PURE__ */ jsx("li", { children: "• Child's first name and age group" }),
          /* @__PURE__ */ jsx("li", { children: "• Gender selection (boy/girl)" }),
          /* @__PURE__ */ jsx("li", { children: "• Uploaded photo(s)" }),
          /* @__PURE__ */ jsx("li", { children: "• Story preferences (theme, strength, supporting character)" }),
          /* @__PURE__ */ jsx("li", { children: "• Email address (for order delivery)" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("section", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-center gap-2", children: [
          /* @__PURE__ */ jsx(Camera, { className: "h-5 w-5 text-primary" }),
          /* @__PURE__ */ jsx("h2", { className: "font-display text-xl font-bold", children: "Photo Policy" })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "bg-primary/10 border border-primary/20 rounded-xl p-5", children: /* @__PURE__ */ jsxs("p", { className: "text-foreground font-medium leading-relaxed", children: [
          "All uploaded photos are used ",
          /* @__PURE__ */ jsx("strong", { children: "exclusively" }),
          " for generating your child's personalized story and coloring pages. Photos are ",
          /* @__PURE__ */ jsx("strong", { children: "permanently deleted after 30 days" }),
          ". We never share, sell, or use photos for any other purpose."
        ] }) })
      ] }),
      /* @__PURE__ */ jsxs("section", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-center gap-2", children: [
          /* @__PURE__ */ jsx(CreditCard, { className: "h-5 w-5 text-primary" }),
          /* @__PURE__ */ jsx("h2", { className: "font-display text-xl font-bold", children: "Payment Information" })
        ] }),
        /* @__PURE__ */ jsxs("p", { className: "text-muted-foreground leading-relaxed", children: [
          "All payments are processed securely through our payment provider. My ",
          /* @__PURE__ */ jsx("span", { className: "text-star-yellow", children: "Star" }),
          " Stories ",
          /* @__PURE__ */ jsx("strong", { children: "never sees or stores" }),
          " your credit card details, billing address, or any financial information. All payments are handled with industry-standard encryption."
        ] })
      ] }),
      /* @__PURE__ */ jsxs("section", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-center gap-2", children: [
          /* @__PURE__ */ jsx(Shield, { className: "h-5 w-5 text-primary" }),
          /* @__PURE__ */ jsx("h2", { className: "font-display text-xl font-bold", children: "No Data Sharing" })
        ] }),
        /* @__PURE__ */ jsxs("p", { className: "text-muted-foreground leading-relaxed", children: [
          "We do ",
          /* @__PURE__ */ jsx("strong", { children: "not" }),
          " sell, share, or distribute any personal data to third parties. Your information is used solely to create and deliver your child's personalized storybook."
        ] })
      ] }),
      /* @__PURE__ */ jsxs("section", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-center gap-2", children: [
          /* @__PURE__ */ jsx(Mail, { className: "h-5 w-5 text-primary" }),
          /* @__PURE__ */ jsx("h2", { className: "font-display text-xl font-bold", children: "Contact Us" })
        ] }),
        /* @__PURE__ */ jsxs("p", { className: "text-muted-foreground leading-relaxed", children: [
          "Questions about your privacy? Reach out to us anytime at",
          " ",
          /* @__PURE__ */ jsx("a", { href: "mailto:hello@mestar.pro", className: "text-primary hover:underline", children: "hello@mestar.pro" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground/60 text-center pt-6 border-t border-border", children: [
        "Last updated: ",
        (/* @__PURE__ */ new Date()).toLocaleDateString("en-US", { month: "long", year: "numeric" })
      ] })
    ] })
  ] });
};
const PRODUCTS = [
  {
    slug: "personalized-storybook",
    title: "Personalized Storybook",
    price: BASE_PRICE,
    icon: BookOpen,
    description: "A one-of-a-kind digital PDF storybook starring your child. Full-color illustrations + matching coloring pages included.",
    ctaLabel: "Personalize & Buy"
  },
  {
    slug: "supporting-character",
    title: "Supporting Character Add-On",
    price: SUPPORTING_CHARACTER_PRICE,
    icon: Users,
    description: "Add a sibling, best friend, or pet as a helpful sidekick in your child's story. Added during personalization.",
    addon: true,
    ctaLabel: "Add During Personalization"
  },
  {
    slug: "coloring-pages",
    title: "Coloring Pages Add-On",
    price: 4.99,
    icon: Palette,
    description: "Extra printable coloring pages to go with the story (a starter set is already included free with every storybook).",
    addon: true,
    ctaLabel: "Add During Personalization"
  },
  {
    slug: "karaoke-audiobook",
    title: "Karaoke Audiobook Add-On",
    price: AUDIOBOOK_PRICE,
    icon: Mic,
    description: "A gentle narrated read-aloud with karaoke-style word highlighting — perfect for early readers.",
    comingSoon: true,
    addon: true,
    ctaLabel: "Coming Soon"
  },
  {
    slug: "basic-audiobook",
    title: "Basic Audiobook Add-On",
    price: 4.99,
    icon: Volume2,
    description: "A simple narrated audio version of your child's story to listen to anywhere.",
    comingSoon: true,
    addon: true,
    ctaLabel: "Coming Soon"
  },
  {
    slug: "paperback-storybook",
    title: "Paperback Storybook",
    price: 0,
    icon: Package,
    description: "A beautifully bound printed paperback of your child's story, mailed right to your home.",
    comingSoon: true,
    ctaLabel: "Coming Soon"
  }
];
function ProductsIndex() {
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen py-10", children: [
    /* @__PURE__ */ jsx(
      SEO,
      {
        title: "Shop All Products — MESTAR Personalized Storybooks",
        description: "Browse every MESTAR product: personalized digital storybooks, coloring pages, supporting-character add-ons, karaoke audiobooks, and paperback storybooks coming soon.",
        canonical: "/products"
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: "container max-w-5xl", children: [
      /* @__PURE__ */ jsxs("div", { className: "text-center mb-10", children: [
        /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1 bg-primary/15 text-primary text-xs font-bold uppercase tracking-wider rounded-full px-3 py-1 mb-3", children: [
          /* @__PURE__ */ jsx(Sparkles, { className: "h-3 w-3" }),
          " Shop"
        ] }),
        /* @__PURE__ */ jsx("h1", { className: "font-display text-4xl font-bold mb-3", children: "Every MESTAR Product" }),
        /* @__PURE__ */ jsx("p", { className: "text-muted-foreground max-w-2xl mx-auto", children: "Everything we offer today, plus what's on the way. Every purchase starts with a quick photo upload so your child becomes the hero." })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-5", children: PRODUCTS.map((p) => {
        const Icon = p.icon;
        return /* @__PURE__ */ jsxs(
          "div",
          {
            className: `rounded-2xl border p-6 flex flex-col items-center text-center ${p.comingSoon ? "border-dashed border-border bg-muted/30" : "border-border bg-card"}`,
            children: [
              /* @__PURE__ */ jsxs(Link, { to: `/products/${p.slug}`, className: "flex flex-col items-center gap-3 mb-4 group", children: [
                /* @__PURE__ */ jsx("div", { className: `h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0 ${p.comingSoon ? "bg-muted" : "bg-primary/10"}`, children: /* @__PURE__ */ jsx(Icon, { className: `h-6 w-6 ${p.comingSoon ? "text-muted-foreground" : "text-primary"}` }) }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center justify-center gap-2 mb-1", children: [
                    /* @__PURE__ */ jsx("h2", { className: "font-display text-lg font-bold group-hover:text-primary transition-colors", children: p.title }),
                    p.comingSoon && /* @__PURE__ */ jsx("span", { className: "inline-flex items-center rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5", children: "(Coming Soon)" }),
                    p.addon && !p.comingSoon && /* @__PURE__ */ jsx("span", { className: "inline-flex items-center rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider px-2 py-0.5", children: "Add-On" })
                  ] }),
                  p.price > 0 && /* @__PURE__ */ jsxs("p", { className: "text-xl font-bold text-primary", children: [
                    p.addon ? "+" : "",
                    "$",
                    p.price.toFixed(2)
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground mb-5 flex-1", children: p.description }),
              /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row gap-2", children: [
                /* @__PURE__ */ jsx(Button, { asChild: true, variant: "outline", className: "flex-1", children: /* @__PURE__ */ jsx(Link, { to: `/products/${p.slug}`, children: "Learn more" }) }),
                p.comingSoon ? /* @__PURE__ */ jsx(Button, { disabled: true, className: "flex-1", children: p.ctaLabel }) : /* @__PURE__ */ jsx(Button, { asChild: true, className: "flex-1", children: /* @__PURE__ */ jsxs(Link, { to: "/product/personalized-storybook#personalize", children: [
                  p.ctaLabel,
                  " →"
                ] }) })
              ] })
            ]
          },
          p.slug
        );
      }) }),
      /* @__PURE__ */ jsx("div", { className: "mt-10 text-center text-xs text-muted-foreground", children: "Add-ons are selected during the personalization step for your storybook — they can't be purchased on their own." })
    ] })
  ] });
}
const HERO_IMG = "https://storage.googleapis.com/gpt-engineer-file-uploads/hfdVpZRvZ4hMNWvlpFRlEdIJbxm2/social-images/social-1775247101557-576.webp";
const LANDINGS = {
  "personalized-storybook": {
    slug: "personalized-storybook",
    title: "Personalized Storybook for Kids — Your Child Is the Hero | MESTAR",
    h1: "A Personalized Storybook Where Your Child Is the Hero",
    price: 19.99,
    metaDescription: "Upload your child's photo, pick a theme, and get a printable PDF storybook where they're the hero — plus matching coloring pages. Delivered in minutes.",
    shortPitch: "One-of-a-kind digital PDF storybook starring your child. Full-color illustrations, age-appropriate story, and matching coloring pages included.",
    icon: BookOpen,
    bullets: [
      "Your child's name, photo, and personality woven into every page",
      "Age-tuned stories from toddlers to 11+",
      "5 magical themes: fairy tale, ocean, space, dinosaurs, prince & princess",
      "Matching coloring pages included free",
      "Instant printable PDF download — no shipping wait"
    ],
    faqs: [
      { q: "How fast will I get it?", a: "Most storybooks are ready to download in 5–10 minutes after checkout." },
      { q: "Is it a physical book?", a: "It's a high-resolution printable PDF you can print at home or at any print shop." },
      { q: "Can I add a sibling or friend?", a: "Yes — add the Supporting Character add-on during personalization and upload a second photo." }
    ],
    ctaLabel: "Personalize My Storybook",
    ctaHref: "/product/personalized-storybook#personalize",
    image: HERO_IMG,
    googleCategory: "Media > Books"
  },
  "coloring-pages": {
    slug: "coloring-pages",
    title: "Personalized Coloring Pages Add-On — MESTAR",
    h1: "Personalized Coloring Pages Starring Your Child",
    price: 4.99,
    metaDescription: "Extra printable coloring pages featuring your child in scenes from their story. Add-on to the MESTAR Personalized Storybook.",
    shortPitch: "Extra printable coloring pages designed to match your child's story. Complexity scales with age — chunky shapes for toddlers, detailed line art for older kids.",
    icon: Palette,
    bullets: [
      "Extra printable coloring pages beyond the free starter set",
      "Complexity matches your child's age group",
      "Same character, same story world — full continuity",
      "Print at home on any standard printer"
    ],
    faqs: [
      { q: "Is this a standalone product?", a: "No — coloring pages are added to the Personalized Storybook during personalization." },
      { q: "How many pages will I get?", a: "The exact count scales with age group and story length." }
    ],
    addon: true,
    ctaLabel: "Add During Personalization",
    ctaHref: "/product/personalized-storybook#personalize",
    image: HERO_IMG,
    googleCategory: "Toys & Games > Toys > Art & Drawing Toys"
  },
  "supporting-character": {
    slug: "supporting-character",
    title: "Supporting Character Add-On — Add a Sibling, Friend, or Pet | MESTAR",
    h1: "Add a Sibling, Best Friend, or Pet to the Story",
    price: 9.99,
    metaDescription: "Add a second character to your child's personalized storybook. Upload a photo of a sibling, friend, or pet — they'll help the hero through the adventure.",
    shortPitch: "Upload a second photo and give your child a sidekick. The supporting character always shows up when the hero needs help.",
    icon: Users,
    bullets: [
      "Upload a second photo (sibling, friend, parent, pet)",
      "Supporting character always helps — never a villain",
      "Keeps your child as the main hero",
      "Adds warmth and real-world connection to the story"
    ],
    faqs: [
      { q: "Can I add more than one supporting character?", a: "One supporting character per storybook keeps the story tight and focused on your child as the hero." },
      { q: "Does the pet count?", a: "Absolutely — pets make wonderful sidekicks." }
    ],
    addon: true,
    ctaLabel: "Add During Personalization",
    ctaHref: "/product/personalized-storybook#personalize",
    image: HERO_IMG,
    googleCategory: "Media > Books"
  },
  "karaoke-audiobook": {
    slug: "karaoke-audiobook",
    title: "Karaoke Audiobook Add-On — Read-Along for Kids | MESTAR",
    h1: "Karaoke Audiobook — Learn to Read While You Listen",
    price: 9.99,
    metaDescription: "Gentle narrated audiobook of your child's story with karaoke-style word highlighting — perfect for early readers learning to follow along.",
    shortPitch: "Narrated audiobook of your child's personalized story with karaoke-style word highlighting so early readers can follow along word-by-word.",
    icon: Mic,
    bullets: [
      "Warm, gentle professional narration",
      "Karaoke-style word-by-word highlighting",
      "Perfect for early readers ages 3–8",
      "Streams inside your MESTAR library"
    ],
    faqs: [
      { q: "When is it available?", a: "The karaoke audiobook is rolling out soon — check the personalization page for current availability." },
      { q: "Can I download the audio?", a: "You'll be able to stream it in your MESTAR library on any device." }
    ],
    comingSoon: true,
    addon: true,
    ctaLabel: "See on Personalization Page",
    ctaHref: "/product/personalized-storybook#personalize",
    image: HERO_IMG,
    googleCategory: "Media > Books > Audiobooks"
  },
  "basic-audiobook": {
    slug: "basic-audiobook",
    title: "Basic Audiobook Add-On (Coming Soon) | MESTAR",
    h1: "Basic Audiobook — Listen Anywhere",
    price: 4.99,
    metaDescription: "Simple narrated audio version of your child's personalized story. Coming soon to MESTAR.",
    shortPitch: "A simple narrated audio version of your child's personalized story to listen to anywhere — car rides, bedtime, quiet time.",
    icon: Volume2,
    bullets: [
      "Warm professional narration",
      "Great for road trips and bedtime",
      "Available in your MESTAR library"
    ],
    faqs: [
      { q: "How is this different from the karaoke version?", a: "The karaoke version highlights words as they're spoken — great for early readers. The basic version is audio only." }
    ],
    comingSoon: true,
    addon: true,
    ctaLabel: "Notify Me — Personalize Now",
    ctaHref: "/product/personalized-storybook#personalize",
    image: HERO_IMG,
    googleCategory: "Media > Books > Audiobooks"
  },
  "paperback-storybook": {
    slug: "paperback-storybook",
    title: "Paperback Personalized Storybook (Coming Soon) | MESTAR",
    h1: "Paperback Personalized Storybook — Mailed to Your Home",
    price: 0,
    metaDescription: "A beautifully bound paperback of your child's personalized MESTAR story, mailed to your home. Coming soon.",
    shortPitch: "A beautifully bound printed paperback of your child's personalized MESTAR story, mailed right to your home.",
    icon: Package,
    bullets: [
      "Professional binding, full-color print",
      "Keepsake quality — built to last",
      "Ships in protective packaging"
    ],
    faqs: [
      { q: "When will it be available?", a: "We're finalizing print partners now. Personalize the digital version and we'll notify you when paperback ships." }
    ],
    comingSoon: true,
    ctaLabel: "Personalize the Digital Version",
    ctaHref: "/product/personalized-storybook#personalize",
    image: HERO_IMG,
    googleCategory: "Media > Books"
  }
};
const LANDING_SLUGS = Object.keys(LANDINGS);
function ProductLanding() {
  const { slug = "" } = useParams();
  const landing = LANDINGS[slug];
  if (!landing) return /* @__PURE__ */ jsx(Navigate, { to: "/products", replace: true });
  const Icon = landing.icon;
  const canonical = `/products/${landing.slug}`;
  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: landing.h1,
    description: landing.metaDescription,
    image: landing.image,
    brand: { "@type": "Brand", name: "MESTAR" },
    category: landing.googleCategory,
    url: `https://mestar.pro${canonical}`
  };
  if (!landing.comingSoon && landing.price > 0) {
    productJsonLd.offers = {
      "@type": "Offer",
      priceCurrency: "USD",
      price: landing.price.toFixed(2),
      availability: "https://schema.org/InStock",
      url: `https://mestar.pro${canonical}`
    };
  } else {
    productJsonLd.offers = {
      "@type": "Offer",
      priceCurrency: "USD",
      price: landing.price ? landing.price.toFixed(2) : "0.00",
      availability: "https://schema.org/PreOrder"
    };
  }
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: landing.faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a }
    }))
  };
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://mestar.pro/" },
      { "@type": "ListItem", position: 2, name: "Shop", item: "https://mestar.pro/products" },
      { "@type": "ListItem", position: 3, name: landing.h1, item: `https://mestar.pro${canonical}` }
    ]
  };
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen py-10", children: [
    /* @__PURE__ */ jsx(
      SEO,
      {
        title: landing.title,
        description: landing.metaDescription,
        canonical,
        image: landing.image,
        type: "product",
        jsonLd: [productJsonLd, faqJsonLd, breadcrumbJsonLd]
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: "container max-w-4xl", children: [
      /* @__PURE__ */ jsxs("nav", { "aria-label": "Breadcrumb", className: "text-xs text-muted-foreground mb-6 text-center", children: [
        /* @__PURE__ */ jsx(Link, { to: "/", className: "hover:text-foreground", children: "Home" }),
        /* @__PURE__ */ jsx("span", { className: "mx-2", children: "/" }),
        /* @__PURE__ */ jsx(Link, { to: "/products", className: "hover:text-foreground", children: "Shop" }),
        /* @__PURE__ */ jsx("span", { className: "mx-2", children: "/" }),
        /* @__PURE__ */ jsx("span", { className: "text-foreground", children: landing.h1 })
      ] }),
      /* @__PURE__ */ jsxs("header", { className: "mb-10 text-center", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center gap-3 mb-4", children: [
          /* @__PURE__ */ jsx("div", { className: `h-14 w-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${landing.comingSoon ? "bg-muted" : "bg-primary/10"}`, children: /* @__PURE__ */ jsx(Icon, { className: `h-7 w-7 ${landing.comingSoon ? "text-muted-foreground" : "text-primary"}` }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center justify-center gap-2 mb-2", children: [
              /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1 bg-primary/15 text-primary text-xs font-bold uppercase tracking-wider rounded-full px-3 py-1", children: [
                /* @__PURE__ */ jsx(Sparkles, { className: "h-3 w-3" }),
                landing.addon ? "Add-On" : "Product"
              ] }),
              landing.comingSoon && /* @__PURE__ */ jsx("span", { className: "inline-flex items-center rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5", children: "Coming Soon" })
            ] }),
            /* @__PURE__ */ jsx("h1", { className: "font-display text-3xl md:text-4xl font-bold mb-2", children: landing.h1 }),
            landing.price > 0 && /* @__PURE__ */ jsxs("p", { className: "text-2xl font-bold text-primary", children: [
              landing.addon ? "+" : "",
              "$",
              landing.price.toFixed(2),
              " ",
              /* @__PURE__ */ jsx("span", { className: "text-sm font-normal text-muted-foreground", children: "USD" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-lg text-muted-foreground mb-6 max-w-2xl mx-auto", children: landing.shortPitch }),
        /* @__PURE__ */ jsx("div", { className: "flex justify-center", children: /* @__PURE__ */ jsx(Button, { asChild: true, size: "lg", disabled: landing.comingSoon, className: "w-full sm:w-auto", children: /* @__PURE__ */ jsxs(Link, { to: landing.ctaHref, children: [
          landing.ctaLabel,
          " ",
          /* @__PURE__ */ jsx(ArrowRight, { className: "ml-2 h-4 w-4" })
        ] }) }) }),
        /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8", children: [
          { icon: Clock, text: "Ready in minutes" },
          { icon: Download, text: "Printable PDF" },
          { icon: ShieldCheck, text: "Secure checkout" },
          { icon: Star, text: "Loved by families" }
        ].map(({ icon: I, text }) => /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center gap-1 text-center rounded-xl border border-border py-3", children: [
          /* @__PURE__ */ jsx(I, { className: "h-4 w-4 text-primary" }),
          /* @__PURE__ */ jsx("span", { className: "text-[10px] font-bold uppercase tracking-wider text-muted-foreground", children: text })
        ] }, text)) })
      ] }),
      /* @__PURE__ */ jsxs("section", { className: "mb-10 text-center", children: [
        /* @__PURE__ */ jsx("h2", { className: "font-display text-2xl font-bold mb-4", children: "What's Included" }),
        /* @__PURE__ */ jsx("ul", { className: "space-y-3 inline-block text-left mx-auto", children: landing.bullets.map((b) => /* @__PURE__ */ jsxs("li", { className: "flex items-start gap-3", children: [
          /* @__PURE__ */ jsx(CheckCircle2, { className: "h-5 w-5 text-primary flex-shrink-0 mt-0.5" }),
          /* @__PURE__ */ jsx("span", { className: "text-foreground", children: b })
        ] }, b)) })
      ] }),
      /* @__PURE__ */ jsxs("section", { className: "mb-10 text-center", children: [
        /* @__PURE__ */ jsx("h2", { className: "font-display text-2xl font-bold mb-4", children: "Frequently Asked Questions" }),
        /* @__PURE__ */ jsx("div", { className: "space-y-4", children: landing.faqs.map((f) => /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border p-5 text-center", children: [
          /* @__PURE__ */ jsx("h3", { className: "font-bold mb-2", children: f.q }),
          /* @__PURE__ */ jsx("p", { className: "text-muted-foreground text-sm", children: f.a })
        ] }, f.q)) })
      ] }),
      /* @__PURE__ */ jsxs("section", { className: "mb-10", children: [
        /* @__PURE__ */ jsx("h2", { className: "font-display text-2xl font-bold mb-4", children: "You Might Also Like" }),
        /* @__PURE__ */ jsx("div", { className: "grid sm:grid-cols-2 gap-4", children: LANDING_SLUGS.filter((s) => s !== landing.slug).slice(0, 4).map((s) => {
          const rel = LANDINGS[s];
          const RIcon = rel.icon;
          return /* @__PURE__ */ jsxs(
            Link,
            {
              to: `/products/${s}`,
              className: "flex items-start gap-3 rounded-xl border border-border p-4 hover:border-primary hover:bg-primary/5 transition-colors",
              children: [
                /* @__PURE__ */ jsx("div", { className: "h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0", children: /* @__PURE__ */ jsx(RIcon, { className: "h-5 w-5 text-primary" }) }),
                /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
                  /* @__PURE__ */ jsxs("div", { className: "font-bold text-sm mb-1 flex items-center gap-2", children: [
                    rel.h1,
                    rel.comingSoon && /* @__PURE__ */ jsx("span", { className: "text-[9px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 rounded-full px-1.5 py-0.5", children: "Soon" })
                  ] }),
                  /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground line-clamp-2", children: rel.shortPitch })
                ] })
              ]
            },
            s
          );
        }) })
      ] }),
      /* @__PURE__ */ jsxs("section", { className: "text-center bg-card border border-border rounded-2xl p-8", children: [
        /* @__PURE__ */ jsx("h2", { className: "font-display text-2xl font-bold mb-3", children: "Ready to make your child the hero?" }),
        /* @__PURE__ */ jsx("p", { className: "text-muted-foreground mb-5", children: "Every MESTAR story starts with a quick photo upload — takes about 60 seconds." }),
        /* @__PURE__ */ jsx(Button, { asChild: true, size: "lg", disabled: landing.comingSoon, children: /* @__PURE__ */ jsxs(Link, { to: landing.ctaHref, children: [
          landing.ctaLabel,
          " ",
          /* @__PURE__ */ jsx(ArrowRight, { className: "ml-2 h-4 w-4" })
        ] }) })
      ] })
    ] })
  ] });
}
const Membership = () => {
  return /* @__PURE__ */ jsxs("div", { className: "container mx-auto max-w-4xl px-4 py-16 text-center", children: [
    /* @__PURE__ */ jsxs(Helmet, { children: [
      /* @__PURE__ */ jsx("title", { children: "MESTAR Story Club Membership — Monthly Personalized Stories" }),
      /* @__PURE__ */ jsx(
        "meta",
        {
          name: "description",
          content: "Join the MESTAR Story Club and receive a new personalized storybook starring your child every month. Launching soon — join the waitlist."
        }
      ),
      /* @__PURE__ */ jsx("link", { rel: "canonical", href: "https://mestar.pro/membership" }),
      /* @__PURE__ */ jsx("meta", { property: "og:title", content: "MESTAR Story Club Membership" }),
      /* @__PURE__ */ jsx(
        "meta",
        {
          property: "og:description",
          content: "A new personalized storybook starring your child, delivered every month."
        }
      ),
      /* @__PURE__ */ jsx("meta", { property: "og:url", content: "https://mestar.pro/membership" }),
      /* @__PURE__ */ jsx("meta", { property: "og:type", content: "website" })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "flex justify-center mb-4", children: /* @__PURE__ */ jsx(Crown, { className: "h-12 w-12 text-primary", "aria-hidden": "true" }) }),
    /* @__PURE__ */ jsx("h1", { className: "text-4xl md:text-5xl font-bold mb-4", children: "MESTAR Story Club — Coming Soon" }),
    /* @__PURE__ */ jsx("p", { className: "text-lg text-muted-foreground max-w-2xl mx-auto mb-10", children: "A brand-new personalized adventure starring your child, delivered automatically every month. Same magical MESTAR quality — now on a subscription so bedtime never runs out of new stories." }),
    /* @__PURE__ */ jsxs("div", { className: "grid gap-6 sm:grid-cols-3 mb-12 text-left sm:text-center", children: [
      /* @__PURE__ */ jsxs("div", { className: "p-6 rounded-xl border bg-card", children: [
        /* @__PURE__ */ jsx(BookOpen, { className: "h-8 w-8 mx-auto mb-3 text-primary", "aria-hidden": "true" }),
        /* @__PURE__ */ jsx("h2", { className: "font-semibold mb-2", children: "New story monthly" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "A fresh theme, plot, and set of illustrations every month — always personalized to your child." })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "p-6 rounded-xl border bg-card", children: [
        /* @__PURE__ */ jsx(Sparkles, { className: "h-8 w-8 mx-auto mb-3 text-primary", "aria-hidden": "true" }),
        /* @__PURE__ */ jsx("h2", { className: "font-semibold mb-2", children: "Included add-ons" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Bonus coloring pages and premium quality upgrades bundled at a lower monthly rate than one-off orders." })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "p-6 rounded-xl border bg-card", children: [
        /* @__PURE__ */ jsx(Users, { className: "h-8 w-8 mx-auto mb-3 text-primary", "aria-hidden": "true" }),
        /* @__PURE__ */ jsx("h2", { className: "font-semibold mb-2", children: "Family library" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Every story you receive is saved to your personal library — always re-downloadable as a PDF." })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row gap-3 justify-center", children: [
      /* @__PURE__ */ jsx(Button, { asChild: true, size: "lg", children: /* @__PURE__ */ jsx(Link, { to: "/products", children: "Order a story now" }) }),
      /* @__PURE__ */ jsx(Button, { asChild: true, size: "lg", variant: "outline", children: /* @__PURE__ */ jsx(Link, { to: "/about", children: "Learn more about MESTAR" }) })
    ] }),
    /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground mt-8", children: "Launch coming soon. Existing customers will get first access and founding-member pricing." })
  ] });
};
function render(url2) {
  const helmetContext = {};
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: Infinity } }
  });
  const html = renderToString(
    /* @__PURE__ */ jsx(HelmetProvider, { context: helmetContext, children: /* @__PURE__ */ jsx(QueryClientProvider, { client: queryClient, children: /* @__PURE__ */ jsx(TooltipProvider, { children: /* @__PURE__ */ jsx(StaticRouter, { location: url2, children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col min-h-screen", children: [
      /* @__PURE__ */ jsx(Navbar, {}),
      /* @__PURE__ */ jsx("main", { className: "flex-1", children: /* @__PURE__ */ jsxs(Routes, { children: [
        /* @__PURE__ */ jsx(Route, { path: "/", element: /* @__PURE__ */ jsx(Index, {}) }),
        /* @__PURE__ */ jsx(Route, { path: "/preview", element: /* @__PURE__ */ jsx(Preview, {}) }),
        /* @__PURE__ */ jsx(Route, { path: "/upsell", element: /* @__PURE__ */ jsx(Upsell, {}) }),
        /* @__PURE__ */ jsx(Route, { path: "/product/:handle", element: /* @__PURE__ */ jsx(ProductDetail, {}) }),
        /* @__PURE__ */ jsx(Route, { path: "/products", element: /* @__PURE__ */ jsx(ProductsIndex, {}) }),
        /* @__PURE__ */ jsx(Route, { path: "/products/:slug", element: /* @__PURE__ */ jsx(ProductLanding, {}) }),
        /* @__PURE__ */ jsx(Route, { path: "/about", element: /* @__PURE__ */ jsx(About, {}) }),
        /* @__PURE__ */ jsx(Route, { path: "/faq", element: /* @__PURE__ */ jsx(FAQ, {}) }),
        /* @__PURE__ */ jsx(Route, { path: "/reviews", element: /* @__PURE__ */ jsx(Reviews, {}) }),
        /* @__PURE__ */ jsx(Route, { path: "/why-read-together", element: /* @__PURE__ */ jsx(WhyReadTogether, {}) }),
        /* @__PURE__ */ jsx(Route, { path: "/privacy-policy", element: /* @__PURE__ */ jsx(PrivacyPolicy, {}) }),
        /* @__PURE__ */ jsx(Route, { path: "/membership", element: /* @__PURE__ */ jsx(Membership, {}) }),
        /* @__PURE__ */ jsx(Route, { path: "*", element: /* @__PURE__ */ jsx(NotFound, {}) })
      ] }) }),
      /* @__PURE__ */ jsx(Footer, {})
    ] }) }) }) }) })
  );
  const { helmet } = helmetContext;
  return {
    html,
    head: helmet ? `${helmet.title.toString()}${helmet.meta.toString()}${helmet.link.toString()}${helmet.script.toString()}` : ""
  };
}
export {
  render
};
