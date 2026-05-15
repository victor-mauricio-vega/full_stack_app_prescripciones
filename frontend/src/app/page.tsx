"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/src/store/auth.store";

export default function HomePage() {
  const router = useRouter();
  const { user } = useAuthStore();

  useEffect(() => {
    if (!user) {
      router.replace("/login");
      return;
    }
    const routes: Record<string, string> = {
      doctor: "/doctor/prescriptions",
      patient: "/patient/prescriptions",
      admin: "/admin",
    };
    router.replace(routes[user.role]);
  }, [user, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
    </div>
  );
}
