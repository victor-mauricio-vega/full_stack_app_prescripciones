"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

import toast from "react-hot-toast";
import { Plus, Filter } from "lucide-react";
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
  patient: { user: { name: string; email: string } };
  items: { id: string; name: string }[];
}

export default function DoctorPrescriptionsPage() {
  const [data, setData] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState({ total: 0, totalPages: 1 });
  const [filters, setFilters] = useState({
    status: "",
    from: "",
    to: "",
    page: 1,
    limit: 10,
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = Object.fromEntries(
        Object.entries(filters).filter(([, v]) => v !== ""),
      );
      const { data: res } = await api.get("/prescriptions", { params });
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

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Mis prescripciones
          </h1>
          <p className="text-sm text-gray-500 mt-1">{meta.total} en total</p>
        </div>
        <Link
          href="/doctor/prescriptions/new"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700
                     text-white px-4 py-2 rounded-lg text-sm font-medium transition"
        >
          <Plus size={16} /> Nueva prescripción
        </Link>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-5 flex flex-wrap gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[160px]">
          <Filter size={15} className="text-gray-400" />
          <select
            value={filters.status}
            onChange={(e) =>
              setFilters({ ...filters, status: e.target.value, page: 1 })
            }
            className="text-sm border-0 outline-none bg-transparent text-gray-700 w-full"
          >
            <option value="">Todos los estados</option>
            <option value="pending">Pendiente</option>
            <option value="consumed">Consumida</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">Desde</span>
          <input
            type="date"
            value={filters.from}
            onChange={(e) =>
              setFilters({ ...filters, from: e.target.value, page: 1 })
            }
            className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">Hasta</span>
          <input
            type="date"
            value={filters.to}
            onChange={(e) =>
              setFilters({ ...filters, to: e.target.value, page: 1 })
            }
            className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        {(filters.status || filters.from || filters.to) && (
          <button
            onClick={() =>
              setFilters({ status: "", from: "", to: "", page: 1, limit: 10 })
            }
            className="text-xs text-blue-600 hover:underline"
          >
            Limpiar
          </button>
        )}
      </div>

      {/* Tabla */}
      {loading ? (
        <LoadingSpinner />
      ) : data.length === 0 ? (
        <EmptyState message="No hay prescripciones con esos filtros" />
      ) : (
        <>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {[
                    "Código",
                    "Paciente",
                    "Medicamentos",
                    "Estado",
                    "Fecha",
                    "",
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left text-xs font-medium text-gray-500 px-4 py-3"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 font-mono text-xs text-gray-600">
                      {p.code}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">
                        {p.patient.user.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {p.patient.user.email}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {p.items.slice(0, 2).map((i) => (
                        <p key={i.id} className="text-xs">
                          {i.name}
                        </p>
                      ))}
                      {p.items.length > 2 && (
                        <p className="text-xs text-gray-400">
                          +{p.items.length - 2} más
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Badge status={p.status} />
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {formatDate(p.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/doctor/prescriptions/${p.id}`}
                        className="text-blue-600 hover:underline text-xs font-medium"
                      >
                        Ver
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
