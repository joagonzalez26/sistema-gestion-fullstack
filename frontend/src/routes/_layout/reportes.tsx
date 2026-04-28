import { useQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import {
  AlertTriangle,
  BarChart3,
  Download,
  Package,
  PackageX,
  ShoppingCart,
  TrendingUp,
  Users,
} from "lucide-react"
import { useState } from "react"

const API_BASE = import.meta.env.VITE_API_URL?.trim() || "http://localhost:8000"
function getToken() { return localStorage.getItem("access_token") || "" }

async function fetchResumen(dias: number) {
  const res = await fetch(`${API_BASE}/api/v1/reportes/resumen?dias=${dias}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  })
  if (!res.ok) throw new Error("Error al cargar reportes")
  return res.json() as Promise<ReportesResumen>
}

type ProductoVendido = { item_id: string; item_title: string; total_quantity: number; total_revenue: number }
type ClienteTop = { client_id: string; client_name: string; total_ventas: number; total_gastado: number }
type VentaResumen = { id: string; client_name: string; total: number; items_count: number; created_at: string | null }
type StockAlerta = { item_id: string; title: string; stock: number; status: string }

type ReportesResumen = {
  periodo_dias: number
  total_ventas: number
  ingresos_periodo: number
  ingresos_totales: number
  productos_mas_vendidos: ProductoVendido[]
  clientes_top: ClienteTop[]
  ultimas_ventas: VentaResumen[]
  alertas_stock: StockAlerta[]
}

export const Route = createFileRoute("/_layout/reportes")({
  component: Reportes,
  head: () => ({ meta: [{ title: "Reportes - Sistema de Gestión" }] }),
})

function formatARS(v: number) {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toLocaleString("es-AR", { maximumFractionDigits: 1 })}M`
  if (v >= 1_000) return `$${(v / 1_000).toLocaleString("es-AR", { maximumFractionDigits: 1 })}K`
  return v.toLocaleString("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 })
}

function formatDate(s: string | null) {
  if (!s) return "—"
  return new Date(s).toLocaleString("es-AR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })
}

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-white/10 ${className}`} />
}

const PERIODOS = [
  { label: "Hoy", dias: 1 },
  { label: "7 días", dias: 7 },
  { label: "30 días", dias: 30 },
  { label: "Todo", dias: 3650 },
]

function Reportes() {
  const [dias, setDias] = useState(30)

  const { data, isLoading, isError } = useQuery({
    queryKey: ["reportes-resumen", dias],
    queryFn: () => fetchResumen(dias),
    staleTime: 30_000,
  })

  function descargarCSV() {
    const url = `${API_BASE}/api/v1/reportes/exportar-csv?dias=${dias}`
    const a = document.createElement("a")
    a.href = url
    a.download = `ventas_${dias}dias.csv`
    // Agregar token via header no es posible en <a href>, usamos fetch blob
    fetch(url, { headers: { Authorization: `Bearer ${getToken()}` } })
      .then(r => r.blob())
      .then(blob => {
        const blobUrl = URL.createObjectURL(blob)
        a.href = blobUrl
        a.click()
        URL.revokeObjectURL(blobUrl)
      })
  }

  const maxQty = Math.max(...(data?.productos_mas_vendidos.map(p => p.total_quantity) ?? [1]), 1)
  const maxGasto = Math.max(...(data?.clientes_top.map(c => c.total_gastado) ?? [1]), 1)

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reportes</h1>
          <p className="text-muted-foreground">Métricas reales del negocio</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Period filter */}
          <div className="flex gap-1 rounded-xl border border-white/8 bg-slate-900/50 p-1">
            {PERIODOS.map(p => (
              <button
                key={p.dias}
                type="button"
                onClick={() => setDias(p.dias)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                  dias === p.dias ? "bg-white/10 text-white shadow-sm" : "text-white/40 hover:text-white/70"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={descargarCSV}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white/70 transition hover:bg-white/10 hover:text-white"
          >
            <Download className="h-3.5 w-3.5" /> CSV
          </button>
        </div>
      </div>

      {isError && (
        <div className="flex items-center gap-3 rounded-2xl border border-red-400/20 bg-red-500/10 px-5 py-4 text-sm text-red-300">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          No se pudieron cargar los reportes. Verificá la conexión con el servidor.
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {[
          { icon: ShoppingCart, label: "Ventas en período", val: isLoading ? null : data?.total_ventas ?? 0, sub: `últimos ${dias === 3650 ? "todos los" : dias} día${dias === 1 ? "" : "s"}`, accent: "cyan" },
          { icon: TrendingUp, label: "Ingresos del período", val: isLoading ? null : (data ? formatARS(data.ingresos_periodo) : "—"), sub: "ventas confirmadas", accent: "emerald" },
          { icon: BarChart3, label: "Ingresos totales", val: isLoading ? null : (data ? formatARS(data.ingresos_totales) : "—"), sub: "histórico completo", accent: "cyan" },
          { icon: AlertTriangle, label: "Alertas de stock", val: isLoading ? null : data?.alertas_stock.length ?? 0, sub: "productos con poco o sin stock", accent: (data?.alertas_stock.length ?? 0) > 0 ? "red" : "emerald" },
        ].map(card => (
          <div key={card.label} className="rounded-2xl border border-white/10 bg-slate-950/55 p-5 shadow-2xl backdrop-blur-md">
            <div className={`mb-3 inline-flex items-center justify-center rounded-xl border p-2.5 ${
              card.accent === "red" ? "border-red-400/15 bg-red-500/10 text-red-300"
              : card.accent === "emerald" ? "border-emerald-400/15 bg-emerald-500/10 text-emerald-300"
              : "border-cyan-400/15 bg-cyan-400/10 text-cyan-300"
            }`}>
              <card.icon className="h-5 w-5" />
            </div>
            <p className="text-xs font-medium uppercase tracking-widest text-white/40">{card.label}</p>
            {card.val === null ? (
              <Skeleton className="mt-2 h-8 w-20" />
            ) : (
              <p className="mt-1.5 text-2xl font-bold tracking-tight text-white">{card.val}</p>
            )}
            <p className={`mt-1 text-xs font-medium ${
              card.accent === "red" ? "text-red-400" : card.accent === "emerald" ? "text-emerald-400" : "text-cyan-400"
            }`}>{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Two-column: productos + clientes */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Productos más vendidos */}
        <div className="rounded-2xl border border-white/10 bg-slate-950/55 p-5 shadow-2xl backdrop-blur-md">
          <div className="mb-4 flex items-center gap-2">
            <Package className="h-4 w-4 text-cyan-300/70" />
            <h3 className="text-sm font-semibold text-white">Productos más vendidos</h3>
          </div>
          {isLoading ? (
            <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-10 w-full" />)}</div>
          ) : !data || data.productos_mas_vendidos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Package className="mb-2 h-8 w-8 text-white/20" />
              <p className="text-sm text-white/40">Sin ventas en este período</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {data.productos_mas_vendidos.map((p, i) => (
                <div key={p.item_id} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-white/85 truncate max-w-[70%]">
                      <span className="text-white/30 mr-2">#{i + 1}</span>{p.item_title}
                    </span>
                    <span className="text-white/50 shrink-0">{p.total_quantity} ud. · {formatARS(p.total_revenue)}</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-white/5">
                    <div
                      className="h-1.5 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-500"
                      style={{ width: `${(p.total_quantity / maxQty) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Clientes top */}
        <div className="rounded-2xl border border-white/10 bg-slate-950/55 p-5 shadow-2xl backdrop-blur-md">
          <div className="mb-4 flex items-center gap-2">
            <Users className="h-4 w-4 text-cyan-300/70" />
            <h3 className="text-sm font-semibold text-white">Clientes con más compras</h3>
          </div>
          {isLoading ? (
            <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-10 w-full" />)}</div>
          ) : !data || data.clientes_top.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Users className="mb-2 h-8 w-8 text-white/20" />
              <p className="text-sm text-white/40">Sin ventas en este período</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {data.clientes_top.map((c, i) => (
                <div key={c.client_id} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-white/85 truncate max-w-[70%]">
                      <span className="text-white/30 mr-2">#{i + 1}</span>{c.client_name}
                    </span>
                    <span className="text-white/50 shrink-0">{c.total_ventas} venta{c.total_ventas === 1 ? "" : "s"} · {formatARS(c.total_gastado)}</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-white/5">
                    <div
                      className="h-1.5 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-500"
                      style={{ width: `${(c.total_gastado / maxGasto) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom row: últimas ventas + alertas stock */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Últimas ventas */}
        <div className="rounded-2xl border border-white/10 bg-slate-950/55 p-5 shadow-2xl backdrop-blur-md">
          <div className="mb-4 flex items-center gap-2">
            <ShoppingCart className="h-4 w-4 text-cyan-300/70" />
            <h3 className="text-sm font-semibold text-white">Últimas ventas</h3>
          </div>
          {isLoading ? (
            <div className="space-y-2">{[1,2,3].map(i => <Skeleton key={i} className="h-8 w-full" />)}</div>
          ) : !data || data.ultimas_ventas.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <ShoppingCart className="mb-2 h-7 w-7 text-white/20" />
              <p className="text-sm text-white/40">Sin ventas en este período</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {data.ultimas_ventas.map(v => (
                <div key={v.id} className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-white/85">{v.client_name}</p>
                    <p className="text-xs text-white/35">{formatDate(v.created_at)} · {v.items_count} prod.</p>
                  </div>
                  <span className="shrink-0 text-sm font-semibold text-white">{formatARS(v.total)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Alertas de stock */}
        <div className="rounded-2xl border border-white/10 bg-slate-950/55 p-5 shadow-2xl backdrop-blur-md">
          <div className="mb-4 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-300/70" />
            <h3 className="text-sm font-semibold text-white">Alertas de stock</h3>
          </div>
          {isLoading ? (
            <div className="space-y-2">{[1,2,3].map(i => <Skeleton key={i} className="h-8 w-full" />)}</div>
          ) : !data || data.alertas_stock.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Package className="mb-2 h-7 w-7 text-emerald-400/40" />
              <p className="text-sm text-emerald-400/60">Todo el stock en buen nivel ✓</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {data.alertas_stock.map(a => (
                <div key={a.item_id} className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-2 min-w-0">
                    {a.status === "sin_stock" ? (
                      <PackageX className="h-4 w-4 shrink-0 text-red-400" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400" />
                    )}
                    <span className="truncate text-sm text-white/85">{a.title}</span>
                  </div>
                  <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    a.status === "sin_stock" ? "bg-red-500/10 text-red-300" : "bg-amber-500/10 text-amber-300"
                  }`}>
                    {a.stock === 0 ? "Sin stock" : `${a.stock} ud.`}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
