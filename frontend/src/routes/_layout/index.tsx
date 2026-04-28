import { useQuery } from "@tanstack/react-query"
import { Link, createFileRoute } from "@tanstack/react-router"
import {
  AlertTriangle,
  BarChart3,
  Bot,
  ChevronRight,
  Clock,
  Package,
  PackageX,
  ShoppingCart,
  TrendingUp,
  Users,
  Warehouse,
} from "lucide-react"

import useAuth from "@/hooks/useAuth"

const API_BASE = import.meta.env.VITE_API_URL?.trim() || "http://localhost:8000"
function getToken() { return localStorage.getItem("access_token") || "" }

type RecentProduct = { id: string; title: string; price: number; stock: number }
type RecentClient  = { id: string; name: string; email: string | null; is_active: boolean }
type RecentVenta   = { id: string; client_name: string; total: number; items_count: number; created_at: string | null }

type DashboardSummary = {
  total_products:  number
  total_clients:   number
  active_clients:  number
  out_of_stock:    number
  low_stock:       number
  inventory_value: number
  ventas_hoy:      number
  ventas_mes:      number
  ingresos_hoy:    number
  ingresos_mes:    number
  ingresos_totales: number
  recent_products: RecentProduct[]
  recent_clients:  RecentClient[]
  recent_ventas:   RecentVenta[]
}

async function fetchDashboardSummary(): Promise<DashboardSummary> {
  const res = await fetch(`${API_BASE}/api/v1/dashboard/summary`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  })
  if (!res.ok) throw new Error("Error al cargar el resumen")
  return res.json()
}

function friendlyName(fullName: string | null | undefined): string {
  if (fullName?.trim()) return fullName.trim().split(" ")[0]
  return "Administrador"
}

function formatARS(value: number): string {
  if (value >= 1_000_000)
    return `$${(value / 1_000_000).toLocaleString("es-AR", { maximumFractionDigits: 1 })}M`
  if (value >= 1_000)
    return `$${(value / 1_000).toLocaleString("es-AR", { maximumFractionDigits: 1 })}K`
  return value.toLocaleString("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 })
}

function formatDate(s: string | null) {
  if (!s) return "—"
  return new Date(s).toLocaleString("es-AR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })
}

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-white/10 ${className}`} />
}

type StatCardProps = {
  icon: React.ElementType
  label: string
  value: string | number
  sub?: string
  accent?: "cyan" | "red" | "amber" | "emerald"
  loading?: boolean
}

function StatCard({ icon: Icon, label, value, sub, accent = "cyan", loading }: StatCardProps) {
  const iconCls = { cyan: "border-cyan-400/15 bg-cyan-400/10 text-cyan-300", red: "border-red-400/15 bg-red-500/10 text-red-300", amber: "border-amber-400/15 bg-amber-400/10 text-amber-300", emerald: "border-emerald-400/15 bg-emerald-500/10 text-emerald-300" }
  const subCls  = { cyan: "text-cyan-400", red: "text-red-400", amber: "text-amber-400", emerald: "text-emerald-400" }
  return (
    <div className="rounded-2xl border border-white/8 bg-slate-900/60 p-5 transition-all duration-300 hover:border-white/15 hover:bg-slate-900/80">
      <div className={`mb-4 inline-flex items-center justify-center rounded-xl border p-2.5 ${iconCls[accent]}`}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-xs font-medium uppercase tracking-widest text-white/40">{label}</p>
      {loading ? (
        <><Skeleton className="mt-2 h-8 w-20" /><Skeleton className="mt-2 h-3 w-28" /></>
      ) : (
        <><p className="mt-1.5 text-3xl font-bold tracking-tight text-white">{value}</p>
        {sub && <p className={`mt-1 text-xs font-medium ${subCls[accent]}`}>{sub}</p>}</>
      )}
    </div>
  )
}

export const Route = createFileRoute("/_layout/")({
  component: Dashboard,
  head: () => ({ meta: [{ title: "Sistema de Gestión" }] }),
})

function Dashboard() {
  const { user } = useAuth()
  const name = friendlyName(user?.full_name)

  const { data: s, isLoading, isError } = useQuery({
    queryKey: ["dashboard-summary"],
    queryFn: fetchDashboardSummary,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  })

  return (
    <div
      className="-m-4 min-h-[calc(100vh-4rem)] bg-cover bg-center bg-no-repeat md:-m-6"
      style={{ backgroundImage: "url('/fondopanel.jpg')" }}
    >
      <div className="min-h-[calc(100vh-4rem)] bg-slate-950/65 px-5 py-8 md:px-8">
        <div className="mx-auto max-w-7xl space-y-10">

          {/* Greeting */}
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.3em] text-cyan-300/70">Panel principal</p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight text-white md:text-5xl">Hola, {name} 👋</h1>
            <p className="mt-2 text-sm text-white/55">Resumen actualizado de tu sistema de gestión.</p>
          </div>

          {isError && (
            <div className="flex items-center gap-3 rounded-2xl border border-red-400/20 bg-red-500/10 px-5 py-4 text-sm text-red-300">
              <AlertTriangle className="h-5 w-5 shrink-0" />
              No se pudo conectar con el servidor. Verificá que el backend esté corriendo.
            </div>
          )}

          {/* ── Inventario stats ── */}
          <div>
            <p className="mb-3 text-xs font-medium uppercase tracking-widest text-white/30">Inventario</p>
            <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
              <StatCard icon={Package} label="Productos" value={isError ? "—" : (s?.total_products ?? 0)}
                sub={s ? (s.total_products === 0 ? "Ninguno aún" : `${s.total_products - s.out_of_stock} con stock`) : undefined}
                accent="cyan" loading={isLoading} />
              <StatCard icon={Users} label="Clientes" value={isError ? "—" : (s?.total_clients ?? 0)}
                sub={s ? `${s.active_clients} activo${s.active_clients === 1 ? "" : "s"}` : undefined}
                accent="cyan" loading={isLoading} />
              <StatCard icon={PackageX} label="Sin stock" value={isError ? "—" : (s?.out_of_stock ?? 0)}
                sub={s ? (s.out_of_stock === 0 ? "Todo con stock ✓" : `${s.out_of_stock} agotado${s.out_of_stock === 1 ? "" : "s"}`) : undefined}
                accent={!isLoading && s && s.out_of_stock > 0 ? "red" : "emerald"} loading={isLoading} />
              <StatCard icon={AlertTriangle} label="Stock bajo" value={isError ? "—" : (s?.low_stock ?? 0)}
                sub={s ? (s.low_stock === 0 ? "Sin alertas" : `${s.low_stock} con ≤ 5 unidades`) : undefined}
                accent={!isLoading && s && s.low_stock > 0 ? "amber" : "emerald"} loading={isLoading} />
            </div>
          </div>

          {/* ── Ventas stats ── */}
          <div>
            <p className="mb-3 text-xs font-medium uppercase tracking-widest text-white/30">Ventas y facturación</p>
            <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
              <StatCard icon={ShoppingCart} label="Ventas hoy" value={isError ? "—" : (s?.ventas_hoy ?? 0)}
                sub={s ? formatARS(s.ingresos_hoy) : undefined} accent="cyan" loading={isLoading} />
              <StatCard icon={TrendingUp} label="Ventas este mes" value={isError ? "—" : (s?.ventas_mes ?? 0)}
                sub={s ? formatARS(s.ingresos_mes) : undefined} accent="emerald" loading={isLoading} />
              <StatCard icon={BarChart3} label="Ingresos totales" value={isError ? "—" : (s ? formatARS(s.ingresos_totales) : "—")}
                sub="histórico completo" accent="cyan" loading={isLoading} />
              <StatCard icon={Package} label="Valor inventario" value={isError ? "—" : (s ? formatARS(s.inventory_value) : "—")}
                sub="precio × stock" accent="emerald" loading={isLoading} />
            </div>
          </div>

          {/* ── Recent data ── */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Últimos productos */}
            <div className="rounded-2xl border border-white/8 bg-slate-900/60 p-5">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2"><Package className="h-4 w-4 text-cyan-300/70" /><h3 className="text-sm font-semibold text-white">Últimos productos</h3></div>
                <Link to="/items" className="flex items-center gap-1 text-xs font-medium text-cyan-400 hover:text-cyan-300 transition">Ver todos <ChevronRight className="h-3.5 w-3.5" /></Link>
              </div>
              {isLoading ? (<div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-8 w-full" />)}</div>)
              : !s || s.recent_products.length === 0 ? (
                <div className="flex flex-col items-center py-8 text-center"><Package className="mb-2 h-7 w-7 text-white/20" /><p className="text-sm text-white/40">Sin productos aún</p><Link to="/items" className="mt-3 text-xs text-cyan-400 hover:text-cyan-300">Cargar primero →</Link></div>
              ) : (
                <div className="divide-y divide-white/5">
                  {s.recent_products.map(p => (
                    <div key={p.id} className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
                      <div className="flex items-center gap-2 min-w-0"><div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-cyan-400/10"><Package className="h-3.5 w-3.5 text-cyan-300" /></div><span className="truncate text-sm text-white/85">{p.title}</span></div>
                      <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${p.stock > 5 ? "bg-emerald-500/10 text-emerald-400" : p.stock > 0 ? "bg-amber-500/10 text-amber-400" : "bg-red-500/10 text-red-300"}`}>{p.stock === 0 ? "Sin stock" : `${p.stock} ud.`}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Últimos clientes */}
            <div className="rounded-2xl border border-white/8 bg-slate-900/60 p-5">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2"><Users className="h-4 w-4 text-cyan-300/70" /><h3 className="text-sm font-semibold text-white">Últimos clientes</h3></div>
                <Link to="/clientes" className="flex items-center gap-1 text-xs font-medium text-cyan-400 hover:text-cyan-300 transition">Ver todos <ChevronRight className="h-3.5 w-3.5" /></Link>
              </div>
              {isLoading ? (<div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-8 w-full" />)}</div>)
              : !s || s.recent_clients.length === 0 ? (
                <div className="flex flex-col items-center py-8 text-center"><Users className="mb-2 h-7 w-7 text-white/20" /><p className="text-sm text-white/40">Sin clientes aún</p><Link to="/clientes" className="mt-3 text-xs text-cyan-400 hover:text-cyan-300">Registrar primero →</Link></div>
              ) : (
                <div className="divide-y divide-white/5">
                  {s.recent_clients.map(c => (
                    <div key={c.id} className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
                      <div className="flex items-center gap-2 min-w-0"><div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-cyan-400/10 text-xs font-bold text-cyan-300">{c.name.charAt(0).toUpperCase()}</div><span className="truncate text-sm text-white/85">{c.name}</span></div>
                      <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${c.is_active ? "bg-emerald-500/10 text-emerald-400" : "bg-white/5 text-white/30"}`}>{c.is_active ? "Activo" : "Inactivo"}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Últimas ventas */}
            <div className="rounded-2xl border border-white/8 bg-slate-900/60 p-5">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2"><ShoppingCart className="h-4 w-4 text-cyan-300/70" /><h3 className="text-sm font-semibold text-white">Últimas ventas</h3></div>
                <Link to="/ventas" className="flex items-center gap-1 text-xs font-medium text-cyan-400 hover:text-cyan-300 transition">Ver todas <ChevronRight className="h-3.5 w-3.5" /></Link>
              </div>
              {isLoading ? (<div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-8 w-full" />)}</div>)
              : !s || s.recent_ventas.length === 0 ? (
                <div className="flex flex-col items-center py-8 text-center"><ShoppingCart className="mb-2 h-7 w-7 text-white/20" /><p className="text-sm text-white/40">Sin ventas aún</p><Link to="/ventas" className="mt-3 text-xs text-cyan-400 hover:text-cyan-300">Registrar primera →</Link></div>
              ) : (
                <div className="divide-y divide-white/5">
                  {s.recent_ventas.map(v => (
                    <div key={v.id} className="py-2.5 first:pt-0 last:pb-0">
                      <div className="flex items-center justify-between"><span className="truncate text-sm font-medium text-white/85 max-w-[65%]">{v.client_name}</span><span className="text-sm font-semibold text-white">{formatARS(v.total)}</span></div>
                      <p className="mt-0.5 text-xs text-white/35">{formatDate(v.created_at)} · {v.items_count} prod.</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── Quick access ── */}
          <div>
            <p className="mb-4 text-xs font-medium uppercase tracking-widest text-white/30">Accesos rápidos</p>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {[
                { to: "/items" as const, icon: Package, title: "Productos", sub: "Catálogo, precios y stock" },
                { to: "/clientes" as const, icon: Users, title: "Clientes", sub: "Registro y seguimiento" },
                { to: "/ventas" as const, icon: ShoppingCart, title: "Ventas", sub: "Registrá y consultá ventas" },
                { to: "/stock" as const, icon: Warehouse, title: "Stock", sub: "Control de inventario" },
                { to: "/reportes" as const, icon: BarChart3, title: "Reportes", sub: "Métricas y exportación" },
                { to: "/asistente" as const, icon: Bot, title: "Asistente IA", sub: "Consultas inteligentes", gradient: true },
              ].map(item => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="group flex items-center gap-4 rounded-2xl border border-white/8 bg-slate-900/60 p-4 transition-all duration-200 hover:border-cyan-400/25 hover:bg-slate-900/80"
                >
                  <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-cyan-300 transition group-hover:bg-cyan-400/20 ${item.gradient ? "bg-gradient-to-br from-cyan-400/20 to-blue-500/20" : "bg-cyan-400/10"}`}>
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-white">{item.title}</p>
                    <p className="text-xs text-white/45">{item.sub}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-white/20 transition group-hover:text-cyan-300" />
                </Link>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between text-xs text-white/20">
            <p className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              Todos los datos provienen directamente de tu base de datos. Sin información inventada.
            </p>
            <span className="hidden sm:block">Sistema de Gestión v2.0</span>
          </div>
        </div>
      </div>
    </div>
  )
}
