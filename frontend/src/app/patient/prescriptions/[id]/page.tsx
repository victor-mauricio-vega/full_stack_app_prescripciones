"use client";

import { useEffect, useState } from "react";

import { useParams, useRouter } from "next/navigation";
import { useAuthStore } from "@/src/store/auth.store";



interface PrescriptionItem {
  id: string;
  name: string;
  dosage: string;
  instructions: string;
}

interface Prescription {
  id: string;
  code: string;
  notes: string;
  createdAt: string;

  doctor?: {
    name?: string;
    email?: string;
    position?: string;
  };

  patient?: {
    name?: string;
    email?: string;
  };

  items: PrescriptionItem[];
}

export default function PrescriptionPage() {
  const params = useParams();

  const router = useRouter();

  const accessToken = useAuthStore((state) => state.accessToken);

  const [loading, setLoading] = useState(true);

  const [prescription, setPrescription] = useState<Prescription | null>(null);

  useEffect(() => {
    if (params?.id && accessToken) {
      fetchPrescription();
    }
  }, [params?.id, accessToken]);

  const fetchPrescription = async () => {
    try {
      const id = params.id as string;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/patient/prescriptions/${id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      if (!response.ok) {
        console.error(await response.text());

        throw new Error("Error obteniendo prescripción");
      }

      const data = await response.json();

      console.log("PRESCRIPTION =>", data);

      setPrescription(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-10 text-center">Cargando prescripción...</div>;
  }

  if (!prescription) {
    return (
      <div className="p-10 text-center text-red-500">
        Prescripción no encontrada
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-4xl rounded-2xl bg-white p-8 shadow">
        <button
          onClick={() => router.back()}
          className="mb-6 text-sm font-medium text-blue-600 hover:underline"
        >
          ← Volver
        </button>

        <div className="mb-8 border-b pb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            Prescripción Médica
          </h1>

          <p className="mt-2 text-gray-500">Código: {prescription.code}</p>

          <p className="text-sm text-gray-400">
            Fecha: {new Date(prescription.createdAt).toLocaleDateString()}
          </p>
        </div>

        {/* MÉDICO */}
        <div className="mb-8 grid gap-6 md:grid-cols-2">
          <div className="rounded-xl border p-5">
            <h2 className="mb-4 text-xl font-semibold">Médico</h2>

            <div className="space-y-2 text-sm">
              <p>
                <strong>Nombre:</strong>{" "}
                {prescription.doctor?.name || "No disponible"}
              </p>

              <p>
                <strong>Cargo:</strong>{" "}
                {prescription.doctor?.position || "No disponible"}
              </p>

              <p>
                <strong>Email:</strong>{" "}
                {prescription.doctor?.email || "No disponible"}
              </p>
            </div>
          </div>

          {/* PACIENTE */}
          <div className="rounded-xl border p-5">
            <h2 className="mb-4 text-xl font-semibold">Paciente</h2>

            <div className="space-y-2 text-sm">
              <p>
                <strong>Nombre:</strong>{" "}
                {prescription.patient?.name || "No disponible"}
              </p>

              <p>
                <strong>Email:</strong>{" "}
                {prescription.patient?.email || "No disponible"}
              </p>
            </div>
          </div>
        </div>

        {/* NOTAS */}
        <div className="mb-8 rounded-xl border p-5">
          <h2 className="mb-4 text-xl font-semibold">Notas</h2>

          <p className="text-gray-700">{prescription.notes || "Sin notas"}</p>
        </div>

        {/* MEDICAMENTOS */}
        <div className="rounded-xl border p-5">
          <h2 className="mb-6 text-xl font-semibold">Medicamentos</h2>

          <div className="space-y-4">
            {prescription.items?.map((item, index) => (
              <div key={item.id} className="rounded-xl border bg-gray-50 p-4">
                <h3 className="mb-3 font-bold text-gray-800">
                  {index + 1}. {item.name}
                </h3>

                <div className="space-y-2 text-sm">
                  <p>
                    <strong>Dosis:</strong> {item.dosage}
                  </p>

                  <p>
                    <strong>Instrucciones:</strong> {item.instructions}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
