"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../store/auth.store";
import { Role, ROLE_ROUTES } from "../constants/roles";

export function useRequireAuth(requiredRole?: Role) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const hydrated = useAuthStore((s) => s.hydrated);

  useEffect(() => {
    // Espera hasta que Zustand termine de leer localStorage
    if (!hydrated) return;

    if (!user) {
      router.replace("/auth/login");
      return;
    }

    if (requiredRole && user.role !== requiredRole) {
      router.replace(ROLE_ROUTES[user.role as Role] ?? "/login");
    }
  }, [hydrated, user]);

  // isReady = hydrated Y el usuario existe Y tiene el rol correcto
  const isReady =
    hydrated && !!user && (!requiredRole || user.role === requiredRole);

  return { user, isReady };
}
