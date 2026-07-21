import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  CartItem,
  ShopifyProduct,
  createShopifyCart,
  addLineToShopifyCart,
  updateShopifyCartLine,
  removeLineFromShopifyCart,
  fetchCart,
  recreateShopifyCart,
} from '@/lib/shopify';

export type { CartItem };
export type { ShopifyProduct };

export interface Personalization {
  childName: string;
  childAge: string; // age group: "1-3", "4-7", "8-10", "11+"
  childGender?: string;
  theme: string;
  photoUrl: string;
  strength?: string;
  customerEmail?: string;
  supportingCharacterPhotoUrl?: string;
  supportingCharacterName?: string;
  selectedAddons?: {
    illustrations: boolean;
    coloring: boolean;
    character: boolean;
    audiobook?: boolean;
  };
  isBundle?: boolean;
  totalPrice?: number;
}

export interface CartItemWithPersonalization extends CartItem {
  personalization?: Personalization;
}

interface CartStore {
  items: CartItemWithPersonalization[];
  cartId: string | null;
  checkoutUrl: string | null;
  isLoading: boolean;
  isSyncing: boolean;
  addItem: (item: Omit<CartItemWithPersonalization, 'lineId'>) => Promise<void>;
  updateQuantity: (variantId: string, quantity: number) => Promise<void>;
  removeItem: (variantId: string) => Promise<void>;
  clearCart: () => void;
  syncCart: () => Promise<void>;
  getCheckoutUrl: () => string | null;
   ensureCheckoutUrl: () => Promise<string | null>;
  updatePersonalization: (variantId: string, personalization: Partial<Personalization>) => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      cartId: null,
      checkoutUrl: null,
      isLoading: false,
      isSyncing: false,

      addItem: async (item) => {
        const { items, cartId, clearCart } = get();
        const existingItem = items.find(i => i.variantId === item.variantId);
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
              set({ items: get().items.map(i => i.variantId === item.variantId ? { ...i, quantity: newQuantity } : i) });
            } else if (result.cartNotFound) clearCart();
          } else {
            const result = await addLineToShopifyCart(cartId, { ...item, lineId: null });
            if (result.success) {
              set({ items: [...get().items, { ...item, lineId: result.lineId ?? null }] });
            } else if (result.cartNotFound) clearCart();
          }
        } catch (error) {
          console.error('Failed to add item:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      updateQuantity: async (variantId, quantity) => {
        if (quantity <= 0) { await get().removeItem(variantId); return; }
        const { items, cartId, clearCart } = get();
        const item = items.find(i => i.variantId === variantId);
        if (!item?.lineId || !cartId) return;
        set({ isLoading: true });
        try {
          const result = await updateShopifyCartLine(cartId, item.lineId, quantity);
          if (result.success) {
            set({ items: get().items.map(i => i.variantId === variantId ? { ...i, quantity } : i) });
          } else if (result.cartNotFound) clearCart();
        } catch (error) {
          console.error('Failed to update quantity:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      removeItem: async (variantId) => {
        const { items, cartId, clearCart } = get();
        const item = items.find(i => i.variantId === variantId);
        if (!item?.lineId || !cartId) return;
        set({ isLoading: true });
        try {
          const result = await removeLineFromShopifyCart(cartId, item.lineId);
          if (result.success) {
            const newItems = get().items.filter(i => i.variantId !== variantId);
            newItems.length === 0 ? clearCart() : set({ items: newItems });
          } else if (result.cartNotFound) clearCart();
        } catch (error) {
          console.error('Failed to remove item:', error);
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
              lineId: rebuiltCart.lineIdByVariantId[item.variantId] ?? null,
            })),
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
                lineId: rebuiltCart.lineIdByVariantId[item.variantId] ?? null,
              })),
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
              lineId: lineIdByVariantId[item.variantId] ?? item.lineId,
            })),
          });

          return cart.checkoutUrl;
        } catch (error) {
          console.error('Failed to ensure checkout URL:', error);
          return checkoutUrl;
        }
      },

      updatePersonalization: (variantId, updates) => {
        set({
          items: get().items.map(i =>
            i.variantId === variantId
              ? { ...i, personalization: { ...i.personalization!, ...updates } }
              : i
          ),
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
          console.error('Failed to sync cart:', error);
        } finally {
          set({ isSyncing: false });
        }
      },
    }),
    {
      name: 'shopify-cart',
      storage: createJSONStorage(() =>
        typeof window !== 'undefined'
          ? localStorage
          : ({ getItem: () => null, setItem: () => {}, removeItem: () => {} } as unknown as Storage)
      ),
      partialize: (state) => ({ items: state.items, cartId: state.cartId, checkoutUrl: state.checkoutUrl }),
    }
  )
);
