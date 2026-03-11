// store/authStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  id: string; // This will be a proper UUID from the database
  email: string;
  created_at?: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isSessionLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  checkSession: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      isSessionLoading: true,
      error: null,

      checkSession: async () => {
        const currentUser = get().user;

        if (!currentUser) {
          set({ isSessionLoading: false });
          return;
        }

        try {
          // Verify with backend that the session is still valid
          const response = await fetch("/api/auth/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: currentUser.id }),
          });

          if (!response.ok) {
            // Session invalid, clear user
            set({ user: null, isSessionLoading: false });
            return;
          }

          const data = await response.json();

          if (data.valid) {
            // Update user data from server
            set({ user: data.user, isSessionLoading: false });
          } else {
            // Session invalid
            set({ user: null, isSessionLoading: false });
          }
        } catch (error) {
          console.error("Session check failed:", error);
          // On error, clear session to be safe
          set({ user: null, isSessionLoading: false });
        }
      },

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });

        try {
          const response = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error || "Login failed");
          }

          // The API should return the user with the UUID from database
          set({
            user: {
              id: data.user.id, // This will be something like "f7a98f15-dc93-4c43-b814-619346379617"
              email: data.user.email,
            },
            isLoading: false,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : "Login failed",
            isLoading: false,
          });
        }
      },

      register: async (email: string, password: string) => {
        set({ isLoading: true, error: null });

        try {
          const response = await fetch("/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error || "Registration failed");
          }

          // The API should return a user with a proper UUID from the database
          set({
            user: {
              id: data.user.id, // This will be a proper UUID from PostgreSQL
              email: data.user.email,
              created_at: data.user.created_at,
            },
            isLoading: false,
          });
        } catch (error) {
          set({
            error:
              error instanceof Error ? error.message : "Registration failed",
            isLoading: false,
          });
        }
      },

      logout: () => {
        set({ user: null, error: null });
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: "auth-storage",
      // Only persist the user object, not loading states or errors
      partialize: (state) => ({ user: state.user }),
    },
  ),
);
