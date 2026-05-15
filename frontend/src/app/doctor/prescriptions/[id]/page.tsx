"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { ArrowLeft } from "lucide-react";
import api from "@/src/lib/axios";
import { formatDate, getErrorMessage } from "@/src/lib/utils";
import LoadingSpinner from "@/src/components/ui/LoadingSpinner";
import Badge from "@/src/components/ui/Badge";

export default function DoctorPrescriptionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <LoadingSpinner />;
  if (!data) return null;

  return (
    <div className="max-w-2xl mx-auto">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 mb-5 transition"
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
        {/* Info general */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-400 mb-1">Paciente</p>
            <p className="font-semibold text-gray-900">
              {data.patient.user.name}
            </p>
            <p className="text-xs text-gray-500">{data.patient.user.email}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Fecha de creación</p>
            <p className="text-gray-900">{formatDate(data.createdAt)}</p>
          </div>
          {data.notes && (
            <div className="col-span-2">
              <p className="text-xs text-gray-400 mb-1">Notas</p>
              <p className="text-gray-700 text-sm">{data.notes}</p>
            </div>
          )}
        </div>

        {/* Medicamentos */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-800 mb-4">Medicamentos</h2>
          <div className="space-y-3">
            {data.items.map((item: any) => (
              <div
                key={item.id}
                className="bg-gray-50 rounded-lg p-3 border border-gray-100"
              >
                <p className="font-medium text-gray-900 text-sm">{item.name}</p>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {item.dosage && (
                    <div>
                      <p className="text-xs text-gray-400">Dosis</p>
                      <p className="text-xs text-gray-700">{item.dosage}</p>
                    </div>
                  )}
                  {item.quantity && (
                    <div>
                      <p className="text-xs text-gray-400">Cantidad</p>
                      <p className="text-xs text-gray-700">
                        {item.quantity} unidades
                      </p>
                    </div>
                  )}
                  {item.instructions && (
                    <div>
                      <p className="text-xs text-gray-400">Indicaciones</p>
                      <p className="text-xs text-gray-700">
                        {item.instructions}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
