import { useQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { AlertTriangle, Package, PackageX, Search, Warehouse } from "lucide-react"
import { useMemo, useState } from "react"

const API_BASE = import.meta.env.VITE_API_URL?.trim() || "http://localhost:8000"

type Item = {
  id: string
  title: string
  description: string | null
  price: number
  stock: number
}

type ItemsResponse = { data: Item[]; count: number }

function getToken() {
  return localStorage.getItem("access_token") || ""
}

async function fetchItems(): Promise<ItemsResponse> {
  const res = await fetch(`${API_BASE}/api/v1/items/?skip=0&limit=200`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  })
  if (!res.ok) throw new Error("Error al cargar productos")
  return res.json()
}

export const Route = createFileRoute("/_layout/stock")({
  component: Stock,
  head: () => ({
    meta: [{ title: "Stock - Sistema de Gestión" }],
  }),
})

type Filter = "todos" | "bajo" | "sin"

function StockBadge({ stock }: { stock: number }) {
  if (stock === 0)
    return (
      <span className="inline-flex rounded-full bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-300">
        Sin stock
      </span>
    )
  if (stock <= 5)
    return (
      <span className="inline-flex rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-300">
        {stock} ud. ⚠
      </span>
    )
  return (
    <span className="inline-flex rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
      {stock} ud.
    </span>
  )
}

function Stock() {
  const [filter, setFilter] = useState<Filter>("todos")
  const [search, setSearch] = useState("")

  const { data, isLoading, isError } = useQuery({
    queryKey: ["stock-items"],
    queryFn: fetchItems,
    staleTime: 30_000,
  })

  const items = useMemo(() => (data?.data ?? []) as Item[], [data])

  const stats = useMemo(() => ({
    total:    items.length,
    sinStock: items.filter((i) => i.stock === 0).length,
    bajo:     items.filter((i) => i.stock > 0 && i.stock <= 5).length,
    ok:       items.filter((i) => i.stock > 5).length,
  }), [items])

  const filtered = useMemo(() => {
    let list = items
    if (filter === "sin")  list = list.filter((i) => i.stock === 0)
    if (filter === "bajo") list = list.filter((i) => i.stock > 0 && i.stock <= 5)
    if (search.trim())
      list = list.filter((i) =>
        i.title.toLowerCase().includes(search.trim().toLowerCase()),
      )
    return list
  }, [items, filter, search])

  const TABS: { key: Filter; label: string; count: number; color: string }[] = [
    { key: "todos", label: "Todos",      count: stats.total,    color: "text-white/70" },
    { key: "bajo",  label: "Stock bajo", count: stats.bajo,     color: "text-amber-400" },
    { key: "sin",   label: "Sin stock",  count: stats.sinStock, color: "text-red-400"   },
  ]

  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight">Stock</h1>
        <p className="text-muted-foreground">
          Control de inventario y disponibilidad de productos
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <div className="rounded-2xl border border-white/10 bg-slate-950/55 p-5 shadow-2xl backdrop-blur-md">
          <div className="mb-3 flex items-center gap-2 text-white/50">
            <Warehouse className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-widest">Total</span>
          </div>
          {isLoading ? (
            <div className="h-9 w-16 animate-pulse rounded-lg bg-white/10" />
          ) : (
            <p className="text-3xl font-bold text-white">{isError ? "—" : stats.total}</p>
          )}
          <p className="mt-1 text-xs text-white/35">productos cargados</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-950/55 p-5 shadow-2xl backdrop-blur-md">
          <div className="mb-3 flex items-center gap-2 text-emerald-400/70">
            <Package className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-widest">Con stock</span>
          </div>
          {isLoading ? (
            <div className="h-9 w-12 animate-pulse rounded-lg bg-white/10" />
          ) : (
            <p className="text-3xl font-bold text-white">{isError ? "—" : stats.ok}</p>
          )}
          <p className="mt-1 text-xs text-emerald-400/70">más de 5 unidades</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-950/55 p-5 shadow-2xl backdrop-blur-md">
          <div className="mb-3 flex items-center gap-2 text-amber-400/70">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-widest">Stock bajo</span>
          </div>
          {isLoading ? (
            <div className="h-9 w-12 animate-pulse rounded-lg bg-white/10" />
          ) : (
            <p className="text-3xl font-bold text-white">{isError ? "—" : stats.bajo}</p>
          )}
          <p className="mt-1 text-xs text-amber-400/70">entre 1 y 5 unidades</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-950/55 p-5 shadow-2xl backdrop-blur-md">
          <div className="mb-3 flex items-center gap-2 text-red-400/70">
            <PackageX className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-widest">Sin stock</span>
          </div>
          {isLoading ? (
            <div className="h-9 w-12 animate-pulse rounded-lg bg-white/10" />
          ) : (
            <p className="text-3xl font-bold text-white">{isError ? "—" : stats.sinStock}</p>
          )}
          <p className="mt-1 text-xs text-red-400/70">0 unidades disponibles</p>
        </div>
      </div>

      {/* Table card */}
      <div className="rounded-2xl border border-white/10 bg-slate-950/55 shadow-2xl backdrop-blur-md">

        {/* Filters + search */}
        <div className="flex flex-col gap-3 border-b border-white/8 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-1 rounded-xl border border-white/8 bg-slate-900/50 p-1">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setFilter(tab.key)}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                  filter === tab.key
                    ? "bg-white/10 text-white shadow-sm"
                    : "text-white/40 hover:text-white/60"
                }`}
              >
                <span className={filter === tab.key ? tab.color : ""}>{tab.label}</span>
                <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                  filter === tab.key ? "bg-white/10 text-white/70" : "text-white/25"
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/30" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar producto..."
              className="h-9 w-full rounded-xl border border-white/10 bg-slate-900/70 pl-8 pr-4 text-sm text-white placeholder:text-white/25 outline-none transition focus:border-cyan-400/40 sm:w-56"
            />
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-cyan-400" />
            <p className="mt-3 text-sm text-white/40">Cargando inventario...</p>
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 rounded-full bg-red-500/10 p-4">
              <PackageX className="h-8 w-8 text-red-300" />
            </div>
            <p className="font-medium text-white">No se pudo cargar el inventario</p>
            <p className="mt-1 text-sm text-white/40">Verificá la conexión con el servidor.</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 rounded-full bg-white/5 p-4">
              <Package className="h-8 w-8 text-white/25" />
            </div>
            <p className="font-medium text-white/60">
              {items.length === 0
                ? "Todavía no hay productos cargados"
                : "Ningún producto coincide con el filtro"}
            </p>
            <p className="mt-1 text-sm text-white/30">
              {items.length === 0
                ? "Cargá productos desde la sección Productos."
                : "Probá cambiando el filtro o el buscador."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-white/8 text-left text-white/40">
                  <th className="px-5 py-3 text-xs font-medium uppercase tracking-widest">Producto</th>
                  <th className="px-5 py-3 text-xs font-medium uppercase tracking-widest">Descripción</th>
                  <th className="px-5 py-3 text-xs font-medium uppercase tracking-widest">Precio</th>
                  <th className="px-5 py-3 text-xs font-medium uppercase tracking-widest">Stock</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-white/5 transition hover:bg-white/[0.025] last:border-0"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cyan-400/10">
                          <Package className="h-4 w-4 text-cyan-300" />
                        </div>
                        <span className="font-medium text-white">{item.title}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-white/45">
                      {item.description || <span className="text-white/20">—</span>}
                    </td>
                    <td className="px-5 py-4 text-white/70">
                      {item.price.toLocaleString("es-AR", {
                        style: "currency",
                        currency: "ARS",
                        maximumFractionDigits: 0,
                      })}
                    </td>
                    <td className="px-5 py-4">
                      <StockBadge stock={item.stock} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer count */}
        {!isLoading && !isError && filtered.length > 0 && (
          <div className="border-t border-white/5 px-5 py-3">
            <p className="text-xs text-white/25">
              {filtered.length} producto{filtered.length === 1 ? "" : "s"} mostrado{filtered.length === 1 ? "" : "s"}
              {filter !== "todos" || search ? ` de ${items.length} en total` : ""}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
