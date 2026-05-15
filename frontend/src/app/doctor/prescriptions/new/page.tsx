"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Plus, Trash2, ArrowLeft, Loader2 } from "lucide-react";
import api from "@/src/lib/axios";
import { getErrorMessage } from "@/src/lib/utils";

interface Item {
  name: string;
  dosage: string;
  quantity: string;
  instructions: string;
}
interface Patient {
  id: string;
  user: { name: string; email: string };
}

const emptyItem = (): Item => ({
  name: "",
  dosage: "",
  quantity: "",
  instructions: "",
});

export default function NewPrescriptionPage() {
  const router = useRouter();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [patientId, setPatientId] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<Item[]>([emptyItem()]);
  const [loading, setLoading] = useState(false);
  const [loadingP, setLoadingP] = useState(true);

  useEffect(() => {
    api
      .get("/patients")
      .then(({ data }) => {
        setPatients(data.data ?? data);
      })
      .catch(() => toast.error("Error al cargar pacientes"))
      .finally(() => setLoadingP(false));
  }, []);

  const updateItem = (i: number, field: keyof Item, value: string) => {
    setItems((prev) =>
      prev.map((it, idx) => (idx === i ? { ...it, [field]: value } : it)),
    );
  };

  const addItem = () => setItems((p) => [...p, emptyItem()]);
  const removeItem = (i: number) =>
    setItems((p) => p.filter((_, idx) => idx !== i));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId) {
      toast.error("Selecciona un paciente");
      return;
    }
    if (items.some((it) => !it.name.trim())) {
      toast.error("Todos los medicamentos deben tener nombre");
      return;
    }
    setLoading(true);
    try {
      await api.post("/prescriptions", {
        patientId,
        notes: notes || undefined,
        items: items.map((it) => ({
          name: it.name.trim(),
          dosage: it.dosage || undefined,
          quantity: it.quantity ? Number(it.quantity) : undefined,
          instructions: it.instructions || undefined,
        })),
      });
      toast.success("Prescripción creada exitosamente");
      router.push("/doctor/prescriptions");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 mb-5 transition"
      >
        <ArrowLeft size={15} /> Volver
      </button>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Nueva prescripción
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Paciente */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-800 mb-4">Paciente</h2>
          {loadingP ? (
            <p className="text-sm text-gray-400">Cargando pacientes...</p>
          ) : (
            <select
              required
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm
                         focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Seleccionar paciente...</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.user.name} — {p.user.email}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Notas */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-800 mb-4">Notas (opcional)</h2>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Indicaciones generales, seguimiento..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm
                       focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        {/* Ítems */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800">Medicamentos</h2>
            <button
              type="button"
              onClick={addItem}
              className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              <Plus size={15} /> Agregar
            </button>
          </div>

          <div className="space-y-4">
            {items.map((item, i) => (
              <div
                key={i}
                className="border border-gray-200 rounded-lg p-4 bg-gray-50 relative"
              >
                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItem(i)}
                    className="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
                <p className="text-xs font-medium text-gray-500 mb-3">
                  Medicamento {i + 1}
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <input
                      required
                      value={item.name}
                      onChange={(e) => updateItem(i, "name", e.target.value)}
                      placeholder="Nombre del medicamento *"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm
                                 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <input
                    value={item.dosage}
                    onChange={(e) => updateItem(i, "dosage", e.target.value)}
                    placeholder="Dosis (ej: 1 c/8h)"
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm
                               focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(e) => updateItem(i, "quantity", e.target.value)}
                    placeholder="Cantidad"
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm
                               focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="col-span-2">
                    <input
                      value={item.instructions}
                      onChange={(e) =>
                        updateItem(i, "instructions", e.target.value)
                      }
                      placeholder="Indicaciones (ej: Después de comer)"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm
                                 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400
                     text-white font-semibold py-3 rounded-xl transition
                     flex items-center justify-center gap-2"
        >
          {loading && <Loader2 size={16} className="animate-spin" />}
          {loading ? "Creando..." : "Crear prescripción"}
        </button>
      </form>
    </div>
  );
}
