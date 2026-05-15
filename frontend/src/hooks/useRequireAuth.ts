"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../store/auth.store";


type Role = "admin" | "doctor" | "patient";

const ROLE_HOME: Record<Role, string> = {
  admin: "/admin",
  doctor: "/doctor/prescriptions",
  patient: "/patient/prescriptions",
};

export function useRequireAuth(requiredRole?: Role) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const hydrated = useAuthStore((s) => s.hydrated);

  useEffect(() => {
    // Espera hasta que Zustand termine de leer localStorage
    if (!hydrated) return;

    if (!user) {
      router.replace("/login");
      return;
    }

    if (requiredRole && user.role !== requiredRole) {
      router.replace(ROLE_HOME[user.role as Role] ?? "/login");
    }
  }, [hydrated, user]);

  // isReady = hydrated Y el usuario existe Y tiene el rol correcto
  const isReady =
    hydrated && !!user && (!requiredRole || user.role === requiredRole);

  return { user, isReady };
}
