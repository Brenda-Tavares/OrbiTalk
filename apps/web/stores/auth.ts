import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api, authApi, type User } from "@/lib/api";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  logout: () => void;
  setLoading: (isLoading: boolean) => void;
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: {
    email: string;
    password: string;
    name: string;
    country: string;
    languages: string[];
  }) => Promise<boolean>;
  fetchUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: true,
      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
        }),
      setTokens: (accessToken, refreshToken) => {
        api.setToken(accessToken);
        set({
          accessToken,
          refreshToken,
          isAuthenticated: true,
        });
      },
      logout: () => {
        api.setToken(null);
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        });
      },
      setLoading: (isLoading) => set({ isLoading }),
      login: async (email: string, password: string) => {
        const response = await authApi.login(email, password);
        if (response.success && response.data) {
          get().setTokens(
            response.data.accessToken,
            response.data.refreshToken,
          );
          get().setUser(response.data.user);
          return true;
        }
        return false;
      },
      register: async (data) => {
        const response = await authApi.register(data);
        if (response.success && response.data) {
          get().setTokens(
            response.data.accessToken,
            response.data.refreshToken,
          );
          get().setUser(response.data.user);
          return true;
        }
        return false;
      },
      fetchUser: async () => {
        const response = await authApi.me();
        if (response.success && response.data) {
          get().setUser(response.data);
        } else {
          get().logout();
        }
      },
    }),
    {
      name: "orbitalk-auth",
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
    },
  ),
);

export const useAuth = useAuthStore;
