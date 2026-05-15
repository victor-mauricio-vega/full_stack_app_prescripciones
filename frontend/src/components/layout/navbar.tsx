"use client";
import { useAuthStore } from "@/src/store/auth.store";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { LogOut, Stethoscope } from "lucide-react";

const ROLE_LABELS: Record<string, string> = {
  admin: "Administrador",
  doctor: "Médico",
  patient: "Paciente",
};

const ROLE_COLORS: Record<string, string> = {
  admin: "bg-purple-100 text-purple-700",
  doctor: "bg-blue-100 text-blue-700",
  patient: "bg-green-100 text-green-700",
};

export default function Navbar() {
  const router = useRouter();
  const { user, clearAuth } = useAuthStore();

  const logout = () => {
    clearAuth();
    toast.success("Sesión cerrada");
    router.replace("/login");
  };

  if (!user) return null;

  return (
    <header
      className="bg-white border-b
     border-gray-200 px-6 py-3 flex items-center justify-between sticky top-0 z-40"
    >
      <div className="flex items-center gap-2">
        <div className="bg-blue-600 text-white rounded-lg p-1.5">
          <Stethoscope size={18} />
          <span className="font-bold text-gray-900">MediPrescribe</span>
        </div>
      </div>
    </header>
  );
}
