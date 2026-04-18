import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],

      addToCart: (product) =>
        set((state) => {
          const exists = state.items.find((item) => item.id === product.id);
          if (exists) return state;
          return { items: [...state.items, { ...product, quantity: 1 }] };
        }),

      removeFromCart: (productId) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== productId),
        })),

      updateQuantity: (productId, quantity) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.id === productId ? { ...item, quantity: Math.max(1, quantity) } : item
          ),
        })),

      getTotal: () => {
        const state = get();
        return state.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      },

      getItemCount: () => {
        const state = get();
        return state.items.length;
      },

      clearCart: () => set({ items: [] }),
    }),
    {
      name: "cart-storage",
    }
  )
);
