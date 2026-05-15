"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { ArrowLeft, Download, CheckCircle } from "lucide-react";
import api from "@/src/lib/axios";
import { formatDate, getErrorMessage } from "@/src/lib/utils";
import LoadingSpinner from "@/src/components/ui/LoadingSpinner";
import Badge from "@/src/components/ui/Badge";

export default function PatientPrescriptionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [consuming, setConsuming] = useState(false);

  useEffect(() => {
    api
      .get(`/prescriptions/${id}`)
      .then(({ data }) => setData(data))
      .catch((err) => {
        toast.error(getErrorMessage(err));
        router.back();
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleConsume = async () => {
    setConsuming(true);
    try {
      const { data: updated } = await api.put(`/prescriptions/${id}/consume`);
      setData(updated);
      toast.success("Marcada como consumida");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setConsuming(false);
    }
  };

  const handleDownload = async () => {
    try {
      const res = await api.get(`/prescriptions/${id}/pdf`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `prescripcion-${data.code}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      toast.error("Error al descargar PDF");
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!data) return null;

  return (
    <div className="max-w-2xl mx-auto">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 mb-5"
      >
        <ArrowLeft size={15} /> Volver
      </button>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Prescripción</h1>
          <p className="font-mono text-sm text-gray-500 mt-1">{data.code}</p>
        </div>
        <Badge status={data.status} />
      </div>

      <div className="space-y-4">
        <div className="bg-white rounded-xl border p-5 grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-400 mb-1">Médico</p>
            <p className="font-semibold text-gray-900">
              {data.author.user.name}
            </p>
            <p className="text-xs text-gray-500">
              {data.author.specialty ?? "Médico General"}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Fecha</p>
            <p className="text-gray-900">{formatDate(data.createdAt)}</p>
          </div>
          {data.notes && (
            <div className="col-span-2">
              <p className="text-xs text-gray-400 mb-1">Notas</p>
              <p className="text-sm text-gray-700">{data.notes}</p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border p-5">
          <h2 className="font-semibold text-gray-800 mb-4">Medicamentos</h2>
          <div className="space-y-3">
            {data.items.map((item: any) => (
              <div
                key={item.id}
                className="bg-gray-50 rounded-lg p-3 border border-gray-100"
              >
                <p className="font-medium text-sm text-gray-900">{item.name}</p>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {item.dosage && (
                    <div>
                      <p className="text-xs text-gray-400">Dosis</p>
                      <p className="text-xs">{item.dosage}</p>
                    </div>
                  )}
                  {item.quantity && (
                    <div>
                      <p className="text-xs text-gray-400">Cantidad</p>
                      <p className="text-xs">{item.quantity} uds.</p>
                    </div>
                  )}
                  {item.instructions && (
                    <div>
                      <p className="text-xs text-gray-400">Indicaciones</p>
                      <p className="text-xs">{item.instructions}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Acciones */}
        <div className="flex gap-3">
          <button
            onClick={handleDownload}
            className="flex-1 flex items-center justify-center gap-2 border border-gray-300
                       rounded-xl py-3 text-sm font-medium hover:bg-gray-50 transition"
          >
            <Download size={16} /> Descargar PDF
          </button>
          {data.status === "pending" && (
            <button
              onClick={handleConsume}
              disabled={consuming}
              className="flex-1 flex items-center justify-center gap-2 bg-green-600
                         hover:bg-green-700 disabled:bg-green-400 text-white
                         rounded-xl py-3 text-sm font-medium transition"
            >
              <CheckCircle size={16} />
              {consuming ? "Procesando..." : "Marcar como consumida"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
