"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Loader2, Stethoscope } from "lucide-react";
import { useAuthStore } from "@/src/store/auth.store";
import api from "@/src/lib/axios";
import { Role, ROLE_ROUTES } from "@/src/constants/roles";
import { getErrorMessage } from "@/src/lib/utils";
import { Menu } from "@/src/components/ui/menu";

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const submitting = useRef(false); // bloquea doble submit

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Bloqueo estricto de doble submit
    if (submitting.current) return;
    submitting.current = true;
    setLoading(true);

    try {
      const { data } = await api.post("/auth/login", { email, password });

      if (!data?.user?.role) {
        toast.error("Respuesta inválida del servidor");
        return;
      }

      setAuth(data.user, data.accessToken, data.refreshToken);

      toast.success(`Bienvenido, ${data.user.name}`);
      router.push(ROLE_ROUTES[data.user.role as Role]);
    } catch (err: unknown) {
     toast.error(getErrorMessage(err, "Error al iniciar sesión"));
      // Solo libera el bloqueo si hay error para poder reintentar
      submitting.current = false;
      setLoading(false);
    }
  };

  return (
      
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100 px-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-blue-600 text-white rounded-full p-3 mb-3">
            <Stethoscope size={28} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">MediPrescribe</h1>
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
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm
                         focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="correo@ejemplo.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña
            </label>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm
                         focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400
                       text-white font-semibold py-2.5 rounded-lg transition
                       flex items-center justify-center gap-2"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
        </form>

        <div className="mt-6 border-t pt-4">
          <p className="text-xs text-gray-400 text-center mb-3">
            Cuentas de prueba
          </p>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Admin", email: "admin@test.com", pw: "admin123" },
              { label: "Médico", email: "dr@test.com", pw: "dr123" },
              {
                label: "Paciente",
                email: "patient@test.com",
                pw: "patient123",
              },
            ].map((acc) => (
              <button
                key={acc.label}
                type="button" // ← importante: evita submit del form
                onClick={() => {
                  setEmail(acc.email);
                  setPassword(acc.pw);
                }}
                className="text-xs border border-gray-200 rounded-lg py-1.5 px-2
                           hover:bg-gray-50 text-gray-600 transition"
              >
                {acc.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
