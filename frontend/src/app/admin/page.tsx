"use client";
import { useEffect, useState } from "react";

import toast from "react-hot-toast";
import { Users, Stethoscope, FileText, TrendingUp } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import api from "@/src/lib/axios";
import { getErrorMessage } from "@/src/lib/utils";
import LoadingSpinner from "@/src/components/ui/LoadingSpinner";

interface Metrics {
  totals: { doctors: number; patients: number; prescriptions: number };
  byStatus: { pending: number; consumed: number };
  byDay: { date: string; count: number }[];
  topDoctors: { authorId: string; doctorName: string; count: number }[];
}

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (from) params.from = from;
      if (to) params.to = to;
      const { data } = await api.get("/admin/metrics", { params });
      setMetrics(data);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  if (loading) return <LoadingSpinner />;
  if (!metrics) return null;

  const totalPx = metrics.byStatus.pending + metrics.byStatus.consumed;
  const pctConsumed = totalPx
    ? Math.round((metrics.byStatus.consumed / totalPx) * 100)
    : 0;

  return (
    <div>
      {/* Header + filtro fechas */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Métricas del sistema</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-gray-400 text-sm">→</span>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={fetchMetrics}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg transition"
          >
            Filtrar
          </button>
          {(from || to) && (
            <button
              onClick={() => {
                setFrom("");
                setTo("");
                setTimeout(fetchMetrics, 0);
              }}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Limpiar
            </button>
          )}
        </div>
      </div>

      {/* Tarjetas totales */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          {
            label: "Médicos",
            value: metrics.totals.doctors,
            icon: Stethoscope,
            color: "bg-blue-50   text-blue-600",
          },
          {
            label: "Pacientes",
            value: metrics.totals.patients,
            icon: Users,
            color: "bg-green-50  text-green-600",
          },
          {
            label: "Prescripciones",
            value: metrics.totals.prescriptions,
            icon: FileText,
            color: "bg-purple-50 text-purple-600",
          },
          {
            label: "Tasa consumo",
            value: `${pctConsumed}%`,
            icon: TrendingUp,
            color: "bg-amber-50  text-amber-600",
          },
        ].map(({ label, value, icon: Icon, color }) => (
          <div
            key={label}
            className="bg-white rounded-xl border border-gray-200 p-5"
          >
            <div className={`inline-flex p-2 rounded-lg ${color} mb-3`}>
              <Icon size={20} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-sm text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Estado + top médicos */}
      <div className="grid lg:grid-cols-2 gap-4 mb-6">
        {/* Por estado */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-800 mb-4">Por estado</h2>
          <div className="space-y-3">
            {[
              {
                label: "Pendientes",
                value: metrics.byStatus.pending,
                color: "bg-amber-400",
              },
              {
                label: "Consumidas",
                value: metrics.byStatus.consumed,
                color: "bg-green-500",
              },
            ].map(({ label, value, color }) => {
              const pct = totalPx ? Math.round((value / totalPx) * 100) : 0;
              return (
                <div key={label}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-gray-600">{label}</span>
                    <span className="font-semibold text-gray-900">
                      {value}{" "}
                      <span className="text-gray-400 font-normal">
                        ({pct}%)
                      </span>
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${color} rounded-full transition-all`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top médicos */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-800 mb-4">Top médicos</h2>
          {metrics.topDoctors.length === 0 ? (
            <p className="text-sm text-gray-400">Sin datos</p>
          ) : (
            <div className="space-y-2">
              {metrics.topDoctors.map((d, i) => (
                <div key={d.authorId} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-gray-400 w-4">
                    {i + 1}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">
                      {d.doctorName}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-blue-600">
                    {d.count}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Gráfico por día */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="font-semibold text-gray-800 mb-4">
          Prescripciones por día
        </h2>
        {metrics.byDay.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">
            Sin datos en el período seleccionado
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={metrics.byDay}
              margin={{ top: 4, right: 8, left: -24, bottom: 0 }}
            >
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11 }}
                tickFormatter={(d) =>
                  new Date(d).toLocaleDateString("es-CO", {
                    month: "short",
                    day: "numeric",
                  })
                }
              />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip
                formatter={(v) => [v, "Prescripciones"]}
                labelFormatter={(d) =>
                  new Date(d).toLocaleDateString("es-CO", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                }
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {metrics.byDay.map((_, i) => (
                  <Cell key={i} fill={i % 2 === 0 ? "#3b82f6" : "#6366f1"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
