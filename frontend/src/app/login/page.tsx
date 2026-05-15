"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/src/store/auth.store";

import toast from "react-hot-toast";
import { Loader2, Stethoscope } from "lucide-react";
import api from "@/src/lib/axios";
import axios from "axios";

type LoginResponse = {
  user: {
    id: string;
    name: string;
    email: string;
    role: "admin" | "doctor" | "patient";
  };
  accessToken: string;
  refreshToken: string;
};

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [form, setForm] = useState({ email: "", password: "" });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post<LoginResponse>("auth/login", form);

      setAuth(data.user, data.accessToken, data.refreshToken);

      const routes: Record<string, string> = {
        admin: "/admin",
        doctor: "/doctor/prescriptions",
        patient: "/patient/prescriptions",
      };
      toast.success(`Bienvenido, ${data.user.name}`);

      router.replace(routes[data.user.role]);
    } catch (err) {
      const error = err as axios.AxiosError<any>;
      toast.error(error.response?.data?.message ?? "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="bg-white rounded-2x1 rounded-lg shadow-lg w-full max-w-md p-8">
        {/* logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="bg-blue-600 text-white rounded-full p-3 mb-3">
            <Stethoscope size={28} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">App Prescription</h1>
          <p className="text-sm text-gray-500 mt-1">
            Sistema de prescripciones médicas
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Correo electrónico
            </label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm 
              focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent"
              placeholder="email@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña
            </label>
            <input
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm 
              focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent"
              placeholder="••••••••••••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-400
            font-semibold py-2 rounded-lg transition flex items-center justify-center gap-2"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
        </form>
      </div>
    </div>
  );
}
