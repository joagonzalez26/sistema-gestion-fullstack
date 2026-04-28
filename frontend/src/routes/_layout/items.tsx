import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { Package, Pencil, Plus, Search, Trash2, X } from "lucide-react"
import { useMemo, useState } from "react"
import { toast } from "sonner"

type ItemFormData = {
  title: string
  description: string
  price: number
  stock: number
}

type ItemRecord = ItemFormData & {
  id: string
  created_at?: string | null
  owner_id?: string
}

type ItemsResponse = {
  data: ItemRecord[]
  count: number
}

const emptyForm: ItemFormData = {
  title: "",
  description: "",
  price: 0,
  stock: 0,
}

const API_BASE = import.meta.env.VITE_API_URL?.trim() || "http://localhost:8000"

function getToken() {
  return localStorage.getItem("access_token") || ""
}

async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken()

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(text || "Error en la API")
  }

  if (response.status === 204) {
    return {} as T
  }

  return response.json() as Promise<T>
}

function getItemsQueryOptions() {
  return {
    queryFn: () =>
      apiRequest<ItemsResponse>("/api/v1/items/?skip=0&limit=100"),
    queryKey: ["items"],
  }
}

function createItemRequest(payload: ItemFormData) {
  return apiRequest<ItemRecord>("/api/v1/items/", {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

function updateItemRequest(id: string, payload: ItemFormData) {
  return apiRequest<ItemRecord>(`/api/v1/items/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  })
}

function deleteItemRequest(id: string) {
  return apiRequest<{ message: string }>(`/api/v1/items/${id}`, {
    method: "DELETE",
  })
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 2,
  }).format(value)
}

export const Route = createFileRoute("/_layout/items")({
  component: Items,
  head: () => ({
    meta: [
      {
        title: "Productos - Sistema de Gestión",
      },
    ],
  }),
})

function Items() {
  const queryClient = useQueryClient()

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<ItemRecord | null>(null)
  const [form, setForm] = useState<ItemFormData>(emptyForm)

  const {
    data: itemsResponse,
    isLoading,
    isError,
  } = useQuery(getItemsQueryOptions())

  const items = useMemo(() => itemsResponse?.data ?? [], [itemsResponse])

  const createItemMutation = useMutation({
    mutationFn: (payload: ItemFormData) => createItemRequest(payload),
    onSuccess: () => {
      toast.success("Producto creado correctamente")
      queryClient.invalidateQueries({ queryKey: ["items"] })
      resetForm()
    },
    onError: () => {
      toast.error("No se pudo crear el producto")
    },
  })

  const updateItemMutation = useMutation({
    mutationFn: (payload: ItemFormData) => {
      if (!editingItem) throw new Error("Producto no seleccionado")
      return updateItemRequest(editingItem.id, payload)
    },
    onSuccess: () => {
      toast.success("Producto actualizado correctamente")
      queryClient.invalidateQueries({ queryKey: ["items"] })
      resetForm()
    },
    onError: () => {
      toast.error("No se pudo actualizar el producto")
    },
  })

  const deleteItemMutation = useMutation({
    mutationFn: (id: string) => deleteItemRequest(id),
    onSuccess: () => {
      toast.success("Producto eliminado correctamente")
      queryClient.invalidateQueries({ queryKey: ["items"] })
    },
    onError: () => {
      toast.error("No se pudo eliminar el producto")
    },
  })

  function resetForm() {
    setForm(emptyForm)
    setEditingItem(null)
    setIsFormOpen(false)
  }

  function openCreateForm() {
    setEditingItem(null)
    setForm(emptyForm)
    setIsFormOpen(true)
  }

  function openEditForm(item: ItemRecord) {
    setEditingItem(item)
    setForm({
      title: item.title ?? "",
      description: item.description ?? "",
      price: Number(item.price ?? 0),
      stock: Number(item.stock ?? 0),
    })
    setIsFormOpen(true)
  }

  function handleChange(
    field: keyof ItemFormData,
    value: string | number,
  ) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (!form.title.trim()) {
      toast.error("El nombre del producto es obligatorio")
      return
    }

    if (form.price < 0) {
      toast.error("El precio no puede ser negativo")
      return
    }

    if (form.stock < 0) {
      toast.error("El stock no puede ser negativo")
      return
    }

    const payload: ItemFormData = {
      title: form.title.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      stock: Number(form.stock),
    }

    if (editingItem) {
      updateItemMutation.mutate(payload)
      return
    }

    createItemMutation.mutate(payload)
  }

  function handleDelete(item: ItemRecord) {
    const confirmed = window.confirm(
      `¿Querés eliminar el producto "${item.title}"?`,
    )

    if (!confirmed) return

    deleteItemMutation.mutate(item.id)
  }

  const isSubmitting =
    createItemMutation.isPending || updateItemMutation.isPending

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Productos</h1>
          <p className="text-muted-foreground">
            Creá y administrá tus productos
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateForm}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition-all duration-300 hover:scale-[1.02] hover:brightness-110"
        >
          <Plus className="h-4 w-4" />
          Nuevo producto
        </button>
      </div>

      {isFormOpen && (
        <div className="rounded-2xl border border-white/10 bg-slate-950/55 p-5 shadow-2xl backdrop-blur-md">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">
                {editingItem ? "Editar producto" : "Nuevo producto"}
              </h2>
              <p className="text-sm text-white/60">
                Completá la información del producto
              </p>
            </div>

            <button
              type="button"
              onClick={resetForm}
              className="inline-flex items-center justify-center rounded-lg border border-white/10 bg-white/5 p-2 text-white/70 transition hover:bg-white/10 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="text-sm font-medium text-white/85">
                  Nombre
                </label>
                <input
                  value={form.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  placeholder="Nombre del producto"
                  className="rounded-xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400/50"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-white/85">
                  Precio
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={(e) =>
                    handleChange("price", Number(e.target.value))
                  }
                  placeholder="0"
                  className="rounded-xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400/50"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-white/85">
                  Stock
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={form.stock}
                  onChange={(e) =>
                    handleChange("stock", Number(e.target.value))
                  }
                  placeholder="0"
                  className="rounded-xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400/50"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-white/85">
                Descripción
              </label>
              <textarea
                value={form.description}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="Descripción del producto"
                rows={4}
                className="rounded-xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400/50"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition-all duration-300 hover:scale-[1.02] hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting
                  ? "Guardando..."
                  : editingItem
                    ? "Guardar cambios"
                    : "Crear producto"}
              </button>

              <button
                type="button"
                onClick={resetForm}
                className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-white/80 transition hover:bg-white/10 hover:text-white"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="rounded-2xl border border-white/10 bg-slate-950/55 p-5 shadow-2xl backdrop-blur-md">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-14 text-center">
            <div className="mb-4 rounded-full bg-white/5 p-4">
              <Search className="h-8 w-8 text-white/60" />
            </div>
            <h3 className="text-lg font-semibold text-white">
              Cargando productos...
            </h3>
            <p className="text-sm text-white/60">
              Esperá un momento mientras buscamos la información.
            </p>
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-14 text-center">
            <div className="mb-4 rounded-full bg-red-500/10 p-4">
              <Package className="h-8 w-8 text-red-300" />
            </div>
            <h3 className="text-lg font-semibold text-white">
              No se pudieron cargar los productos
            </h3>
            <p className="text-sm text-white/60">
              Reintentá en unos segundos.
            </p>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 text-center">
            <div className="mb-4 rounded-full bg-white/5 p-4">
              <Package className="h-8 w-8 text-white/60" />
            </div>
            <h3 className="text-lg font-semibold text-white">
              Todavía no tenés productos cargados
            </h3>
            <p className="text-sm text-white/60">
              Creá tu primer producto para empezar.
            </p>

            <button
              type="button"
              onClick={openCreateForm}
              className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition-all duration-300 hover:scale-[1.02] hover:brightness-110"
            >
              <Plus className="h-4 w-4" />
              Nuevo producto
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left text-white/55">
                  <th className="px-4 py-3 font-medium">Producto</th>
                  <th className="px-4 py-3 font-medium">Descripción</th>
                  <th className="px-4 py-3 font-medium">Precio</th>
                  <th className="px-4 py-3 font-medium">Stock</th>
                  <th className="px-4 py-3 font-medium text-right">Acciones</th>
                </tr>
              </thead>

              <tbody>
                {items.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-white/5 text-white/85 transition hover:bg-white/[0.03]"
                  >
                    <td className="px-4 py-4">
                      <div className="font-medium text-white">{item.title}</div>
                    </td>

                    <td className="px-4 py-4 text-white/70">
                      {item.description || "—"}
                    </td>

                    <td className="px-4 py-4 text-white/70">
                      {formatCurrency(Number(item.price ?? 0))}
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                          Number(item.stock ?? 0) > 0
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-red-500/10 text-red-300"
                        }`}
                      >
                        {Number(item.stock ?? 0)} unidad
                        {Number(item.stock ?? 0) === 1 ? "" : "es"}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEditForm(item)}
                          className="inline-flex items-center justify-center rounded-lg border border-white/10 bg-white/5 p-2 text-white/70 transition hover:bg-white/10 hover:text-white"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(item)}
                          disabled={deleteItemMutation.isPending}
                          className="inline-flex items-center justify-center rounded-lg border border-red-400/10 bg-red-500/10 p-2 text-red-300 transition hover:bg-red-500/20 disabled:opacity-60"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}