import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Minus,
  Package,
  Plus,
  ShoppingCart,
  Trash2,
  Users,
  X,
} from "lucide-react"
import { useMemo, useState } from "react"
import { toast } from "sonner"

const API_BASE = import.meta.env.VITE_API_URL?.trim() || "http://localhost:8000"
function getToken() { return localStorage.getItem("access_token") || "" }

async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
      ...(init.headers ?? {}),
    },
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail || "Error en la API")
  }
  return res.json()
}

type Item = { id: string; title: string; description: string | null; price: number; stock: number }
type Client = { id: string; name: string; email: string | null; is_active: boolean }
type DetallePublic = { id: string; item_id: string; item_title: string; quantity: number; unit_price: number; subtotal: number }
type VentaPublic = { id: string; client_id: string; client_name: string; owner_id: string; total: number; created_at: string | null; items_count: number; detalles: DetallePublic[] }
type CartLine = { item: Item; quantity: number }

export const Route = createFileRoute("/_layout/ventas")({
  component: Ventas,
  head: () => ({ meta: [{ title: "Ventas - Sistema de Gestión" }] }),
})

function formatARS(v: number) {
  return v.toLocaleString("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 })
}

function formatDate(s: string | null) {
  if (!s) return "—"
  return new Date(s).toLocaleString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })
}

function Ventas() {
  const qc = useQueryClient()
  const [tab, setTab] = useState<"nueva" | "historial">("nueva")
  const [clientId, setClientId] = useState("")
  const [cart, setCart] = useState<CartLine[]>([])
  const [selectedItemId, setSelectedItemId] = useState("")
  const [qty, setQty] = useState(1)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const { data: clientsData } = useQuery({
    queryKey: ["ventas-clients"],
    queryFn: () => apiFetch<{ data: Client[]; count: number }>("/api/v1/clientes/?skip=0&limit=200"),
  })
  const { data: itemsData } = useQuery({
    queryKey: ["ventas-items"],
    queryFn: () => apiFetch<{ data: Item[]; count: number }>("/api/v1/items/?skip=0&limit=200"),
  })
  const { data: ventasData, isLoading: loadingVentas } = useQuery({
    queryKey: ["ventas-list"],
    queryFn: () => apiFetch<{ data: VentaPublic[]; count: number }>("/api/v1/ventas/?skip=0&limit=50"),
    enabled: tab === "historial",
  })

  const clients = useMemo(() => (clientsData?.data ?? []).filter(c => c.is_active), [clientsData])
  const items = useMemo(() => (itemsData?.data ?? []).filter(i => i.stock > 0), [itemsData])
  const ventas = useMemo(() => ventasData?.data ?? [], [ventasData])

  const cartTotal = useMemo(() => cart.reduce((s, l) => s + l.item.price * l.quantity, 0), [cart])

  const cartItemIds = useMemo(() => new Set(cart.map(l => l.item.id)), [cart])
  const availableItems = useMemo(() => items.filter(i => !cartItemIds.has(i.id)), [items, cartItemIds])

  function addToCart() {
    const item = items.find(i => i.id === selectedItemId)
    if (!item) return
    if (qty < 1 || qty > item.stock) {
      toast.error(`Stock disponible: ${item.stock}`)
      return
    }
    setCart(prev => [...prev, { item, quantity: qty }])
    setSelectedItemId("")
    setQty(1)
  }

  function removeFromCart(id: string) {
    setCart(prev => prev.filter(l => l.item.id !== id))
  }

  function updateQty(id: string, delta: number) {
    setCart(prev => prev.map(l => {
      if (l.item.id !== id) return l
      const next = l.quantity + delta
      if (next < 1 || next > l.item.stock) return l
      return { ...l, quantity: next }
    }))
  }

  const createMutation = useMutation({
    mutationFn: () => apiFetch<VentaPublic>("/api/v1/ventas/", {
      method: "POST",
      body: JSON.stringify({
        client_id: clientId,
        items: cart.map(l => ({ item_id: l.item.id, quantity: l.quantity })),
      }),
    }),
    onSuccess: () => {
      toast.success("Venta registrada correctamente")
      setClientId("")
      setCart([])
      setSelectedItemId("")
      setQty(1)
      qc.invalidateQueries({ queryKey: ["ventas-list"] })
      qc.invalidateQueries({ queryKey: ["ventas-items"] })
      qc.invalidateQueries({ queryKey: ["dashboard-summary"] })
      qc.invalidateQueries({ queryKey: ["stock-items"] })
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiFetch<{ message: string }>(`/api/v1/ventas/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      toast.success("Venta anulada y stock restaurado")
      qc.invalidateQueries({ queryKey: ["ventas-list"] })
      qc.invalidateQueries({ queryKey: ["ventas-items"] })
      qc.invalidateQueries({ queryKey: ["dashboard-summary"] })
      qc.invalidateQueries({ queryKey: ["stock-items"] })
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const canConfirm = clientId && cart.length > 0 && !createMutation.isPending

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Ventas</h1>
          <p className="text-muted-foreground">Registrá y consultá las ventas del sistema</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl border border-white/8 bg-slate-900/50 p-1 w-fit">
        {(["nueva", "historial"] as const).map(t => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
              tab === t ? "bg-white/10 text-white shadow-sm" : "text-white/40 hover:text-white/70"
            }`}
          >
            {t === "nueva" ? <Plus className="h-4 w-4" /> : <ShoppingCart className="h-4 w-4" />}
            {t === "nueva" ? "Nueva venta" : "Historial"}
          </button>
        ))}
      </div>

      {tab === "nueva" ? (
        <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
          {/* Left: form */}
          <div className="flex flex-col gap-5">
            {/* Select client */}
            <div className="rounded-2xl border border-white/10 bg-slate-950/55 p-5 shadow-2xl backdrop-blur-md">
              <div className="mb-4 flex items-center gap-2">
                <Users className="h-4 w-4 text-cyan-300/70" />
                <h3 className="text-sm font-semibold text-white">1. Seleccioná el cliente</h3>
              </div>
              {clients.length === 0 ? (
                <p className="text-sm text-white/40">No hay clientes activos. Cargá clientes primero.</p>
              ) : (
                <select
                  value={clientId}
                  onChange={e => setClientId(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400/50"
                >
                  <option value="">— Elegí un cliente —</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.name}{c.email ? ` (${c.email})` : ""}</option>
                  ))}
                </select>
              )}
            </div>

            {/* Add products */}
            <div className="rounded-2xl border border-white/10 bg-slate-950/55 p-5 shadow-2xl backdrop-blur-md">
              <div className="mb-4 flex items-center gap-2">
                <Package className="h-4 w-4 text-cyan-300/70" />
                <h3 className="text-sm font-semibold text-white">2. Agregá productos</h3>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <select
                  value={selectedItemId}
                  onChange={e => setSelectedItemId(e.target.value)}
                  className="flex-1 rounded-xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400/50"
                >
                  <option value="">— Elegí un producto —</option>
                  {availableItems.map(i => (
                    <option key={i.id} value={i.id}>
                      {i.title} — {formatARS(i.price)} (stock: {i.stock})
                    </option>
                  ))}
                </select>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    max={items.find(i => i.id === selectedItemId)?.stock ?? 99}
                    value={qty}
                    onChange={e => setQty(Number(e.target.value))}
                    className="w-20 rounded-xl border border-white/10 bg-slate-900/70 px-3 py-3 text-center text-sm text-white outline-none transition focus:border-cyan-400/50"
                  />
                  <button
                    type="button"
                    onClick={addToCart}
                    disabled={!selectedItemId}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-4 py-3 text-sm font-semibold text-slate-950 transition-all hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Plus className="h-4 w-4" /> Agregar
                  </button>
                </div>
              </div>

              {/* Cart lines */}
              {cart.length > 0 && (
                <div className="mt-4 flex flex-col divide-y divide-white/5">
                  {cart.map(line => (
                    <div key={line.item.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cyan-400/10">
                        <Package className="h-4 w-4 text-cyan-300" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-white">{line.item.title}</p>
                        <p className="text-xs text-white/40">{formatARS(line.item.price)} c/u</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button type="button" onClick={() => updateQty(line.item.id, -1)} className="rounded-lg border border-white/10 bg-white/5 p-1 text-white/60 hover:bg-white/10 hover:text-white transition">
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-8 text-center text-sm font-medium text-white">{line.quantity}</span>
                        <button type="button" onClick={() => updateQty(line.item.id, 1)} className="rounded-lg border border-white/10 bg-white/5 p-1 text-white/60 hover:bg-white/10 hover:text-white transition">
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <span className="w-24 text-right text-sm font-semibold text-white">
                        {formatARS(line.item.price * line.quantity)}
                      </span>
                      <button type="button" onClick={() => removeFromCart(line.item.id)} className="text-red-400/60 hover:text-red-300 transition">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {cart.length === 0 && (
                <p className="mt-4 text-center text-sm text-white/25">Todavía no agregaste productos</p>
              )}
            </div>
          </div>

          {/* Right: summary & confirm */}
          <div className="rounded-2xl border border-white/10 bg-slate-950/55 p-5 shadow-2xl backdrop-blur-md h-fit">
            <h3 className="mb-4 text-sm font-semibold text-white">Resumen de la venta</h3>
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex justify-between text-white/50">
                <span>Cliente</span>
                <span className="text-white truncate max-w-[160px] text-right">
                  {clientId ? (clients.find(c => c.id === clientId)?.name ?? "—") : "—"}
                </span>
              </div>
              <div className="flex justify-between text-white/50">
                <span>Productos</span>
                <span className="text-white">{cart.length} línea{cart.length === 1 ? "" : "s"}</span>
              </div>
              <div className="flex justify-between text-white/50">
                <span>Unidades</span>
                <span className="text-white">{cart.reduce((s, l) => s + l.quantity, 0)}</span>
              </div>
              <div className="my-2 border-t border-white/10" />
              <div className="flex justify-between text-base font-bold">
                <span className="text-white/70">Total</span>
                <span className="text-white">{formatARS(cartTotal)}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => createMutation.mutate()}
              disabled={!canConfirm}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-4 py-3 text-sm font-semibold text-slate-950 transition-all hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <CheckCircle2 className="h-4 w-4" />
              {createMutation.isPending ? "Registrando..." : "Confirmar venta"}
            </button>

            {!clientId && <p className="mt-2 text-center text-xs text-white/30">Seleccioná un cliente primero</p>}
            {clientId && cart.length === 0 && <p className="mt-2 text-center text-xs text-white/30">Agregá al menos un producto</p>}
          </div>
        </div>
      ) : (
        /* Historial */
        <div className="rounded-2xl border border-white/10 bg-slate-950/55 shadow-2xl backdrop-blur-md">
          {loadingVentas ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-cyan-400" />
              <p className="mt-3 text-sm text-white/40">Cargando historial...</p>
            </div>
          ) : ventas.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-4 rounded-full bg-white/5 p-4">
                <ShoppingCart className="h-8 w-8 text-white/25" />
              </div>
              <p className="font-medium text-white/50">Todavía no hay ventas registradas</p>
              <p className="mt-1 text-sm text-white/30">Las ventas que confirmes aparecerán acá.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-white/8 text-left text-white/40">
                    <th className="px-5 py-3 text-xs font-medium uppercase tracking-widest">Fecha</th>
                    <th className="px-5 py-3 text-xs font-medium uppercase tracking-widest">Cliente</th>
                    <th className="px-5 py-3 text-xs font-medium uppercase tracking-widest">Productos</th>
                    <th className="px-5 py-3 text-xs font-medium uppercase tracking-widest">Total</th>
                    <th className="px-5 py-3 text-xs font-medium uppercase tracking-widest text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {ventas.map(v => (
                    <>
                      <tr
                        key={v.id}
                        className="border-b border-white/5 transition hover:bg-white/[0.025] cursor-pointer last:border-0"
                        onClick={() => setExpandedId(expandedId === v.id ? null : v.id)}
                      >
                        <td className="px-5 py-4 text-white/60 text-xs">{formatDate(v.created_at)}</td>
                        <td className="px-5 py-4 font-medium text-white">{v.client_name}</td>
                        <td className="px-5 py-4 text-white/60">{v.items_count} producto{v.items_count === 1 ? "" : "s"}</td>
                        <td className="px-5 py-4 font-semibold text-white">{formatARS(v.total)}</td>
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={e => { e.stopPropagation(); setExpandedId(expandedId === v.id ? null : v.id) }}
                              className="rounded-lg border border-white/10 bg-white/5 p-2 text-white/60 transition hover:bg-white/10 hover:text-white"
                            >
                              {expandedId === v.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            </button>
                            <button
                              type="button"
                              onClick={e => {
                                e.stopPropagation()
                                if (window.confirm(`¿Anular la venta de ${v.client_name}? Se restaurará el stock.`)) {
                                  deleteMutation.mutate(v.id)
                                }
                              }}
                              className="rounded-lg border border-red-400/10 bg-red-500/10 p-2 text-red-300 transition hover:bg-red-500/20"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                      {expandedId === v.id && (
                        <tr key={`${v.id}-detail`} className="border-b border-white/5 bg-white/[0.015]">
                          <td colSpan={5} className="px-8 py-3">
                            <div className="flex flex-col gap-1.5">
                              {v.detalles.map(d => (
                                <div key={d.id} className="flex items-center justify-between text-xs text-white/60">
                                  <span>{d.item_title}</span>
                                  <span>{d.quantity} × {formatARS(d.unit_price)} = <span className="text-white/80 font-medium">{formatARS(d.subtotal)}</span></span>
                                </div>
                              ))}
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
