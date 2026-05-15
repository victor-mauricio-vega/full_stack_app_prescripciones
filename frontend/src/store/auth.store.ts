import { create } from "zustand";
import { persist } from "zustand/middleware";


export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "admin" | "doctor" | "patient";
  doctor?: { id: string; specialty: string | null };
  patient?: { id: string; birthDate: string | null };
}

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  setAuth: (user: AuthUser, accessToken: string, refreshToken: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      setAuth: (user, accessToken, refreshToken) =>
        set({ user, accessToken, refreshToken }),
      clearAuth: () =>
        set({ user: null, accessToken: null, refreshToken: null }),
    }),
    { name: "auth-storage" },
  ),
);
