import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isAuthReady: true,

      setAuth: (user, token) =>
        set({
          user,
          token,
          isAuthenticated: Boolean(token),
        }),
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
      setAuthReady: (isAuthReady) => set({ isAuthReady }),
    }),
    {
      name: "auth-storage",
    }
  )
);
