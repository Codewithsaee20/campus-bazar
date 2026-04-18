import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useOrderStore = create(
  persist(
    (set) => ({
      orders: [],

      placeOrder: (cartItems, total) =>
        set((state) => ({
          orders: [
            {
              id: Date.now(),
              items: cartItems,
              total,
              date: new Date().toISOString(),
              status: "Confirmed",
            },
            ...state.orders,
          ],
        })),
    }),
    {
      name: "order-storage",
    }
  )
);
