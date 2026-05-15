"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { CheckCircle, Download, Eye, Filter } from "lucide-react";
import api from "@/src/lib/axios";
import { formatDate, getErrorMessage } from "@/src/lib/utils";
import LoadingSpinner from "@/src/components/ui/LoadingSpinner";
import EmptyState from "@/src/components/ui/EmptyState";
import Badge from "@/src/components/ui/Badge";

interface Prescription {
  id: string;
  code: string;
  status: "pending" | "consumed";
  notes: string | null;
  createdAt: string;
  author: { user: { name: string }; specialty: string | null };
  items: { id: string; name: string }[];
}

export default function PatientPrescriptionsPage() {
  const [data, setData] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState({ total: 0, totalPages: 1 });
  const [filters, setFilters] = useState({ status: "", page: 1, limit: 10 });
  const [consuming, setConsuming] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = Object.fromEntries(
        Object.entries(filters).filter(([, v]) => v !== ""),
      );
      const { data: res } = await api.get("/prescriptions/me", { params });
      setData(res.data);
      setMeta(res.meta);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleConsume = async (id: string) => {
    setConsuming(id);
    try {
      await api.put(`/prescriptions/${id}/consume`);
      toast.success("Prescripción marcada como consumida");
      fetchData();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setConsuming(null);
    }
  };

  const handleDownload = async (id: string, code: string) => {
    try {
      const res = await api.get(`prescriptions/${id}/pdf`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `prescripcion-${code}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      toast.error("Error al descargar el PDF");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Mis prescripciones
          </h1>
          <p className="text-sm text-gray-500 mt-1">{meta.total} en total</p>
        </div>
      </div>

      {/* Filtro estado */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-5 flex gap-3 items-center">
        <Filter size={15} className="text-gray-400" />
        <select
          value={filters.status}
          onChange={(e) =>
            setFilters({ ...filters, status: e.target.value, page: 1 })
          }
          className="text-sm border-0 outline-none bg-transparent text-gray-700"
        >
          <option value="">Todos los estados</option>
          <option value="pending">Pendiente</option>
          <option value="consumed">Consumida</option>
        </select>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : data.length === 0 ? (
        <EmptyState message="No tienes prescripciones aún" />
      ) : (
        <>
          <div className="grid gap-4">
            {data.map((p) => (
              <div
                key={p.id}
                className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-sm transition"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-mono text-xs text-gray-500">
                        {p.code}
                      </span>
                      <Badge status={p.status} />
                    </div>
                    <p className="text-sm font-medium text-gray-800">
                      Dr. {p.author?.user?.name ?? "Médico"}
                      {p.author?.specialty && (
                        <span className="text-gray-400 font-normal">
                          {" "}
                          {p.author.specialty}
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {formatDate(p.createdAt)}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {p.items.map((item) => (
                        <span
                          key={item.id}
                          className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-100"
                        >
                          {item.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="flex flex-col gap-2 shrink-0">
                    <Link
                      href={`patients/prescriptions/${p.id}`}
                      className="flex items-center gap-1.5 text-xs border border-gray-200
                                 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition text-gray-600"
                    >
                      <Eye size={13} /> Ver
                    </Link>
                    <button
                      onClick={() => handleDownload(p.id, p.code)}
                      className="flex items-center gap-1.5 text-xs border border-gray-200
                                 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition text-gray-600"
                    >
                      <Download size={13} /> PDF
                    </button>
                    {p.status === "pending" && (
                      <button
                        onClick={() => handleConsume(p.id)}
                        disabled={consuming === p.id}
                        className="flex items-center gap-1.5 text-xs bg-green-600 hover:bg-green-700
                                   disabled:bg-green-400 text-white rounded-lg px-3 py-1.5 transition"
                      >
                        <CheckCircle size={13} />
                        {consuming === p.id ? "..." : "Consumida"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Paginación */}
          <div className="flex items-center justify-between mt-4">
            <p className="text-xs text-gray-500">
              Página {filters.page} de {meta.totalPages}
            </p>
            <div className="flex gap-2">
              <button
                disabled={filters.page === 1}
                onClick={() =>
                  setFilters({ ...filters, page: filters.page - 1 })
                }
                className="px-3 py-1.5 text-xs border rounded-lg disabled:opacity-40 hover:bg-gray-50"
              >
                Anterior
              </button>
              <button
                disabled={filters.page >= meta.totalPages}
                onClick={() =>
                  setFilters({ ...filters, page: filters.page + 1 })
                }
                className="px-3 py-1.5 text-xs border rounded-lg disabled:opacity-40 hover:bg-gray-50"
              >
                Siguiente
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
