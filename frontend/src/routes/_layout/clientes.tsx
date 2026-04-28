import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { Pencil, Plus, Search, Trash2, Users, X } from "lucide-react"
import { useMemo, useState } from "react"
import { toast } from "sonner"

import { ClientesService } from "@/client"

type ClientFormData = {
  name: string
  email: string
  phone: string
  address: string
  notes: string
  is_active: boolean
}

type ClientPayload = {
  name: string
  email: string | null
  phone: string | null
  address: string | null
  notes: string | null
  is_active: boolean
}

type ClientRecord = ClientFormData & {
  id: string
  created_at?: string | null
  owner_id?: string
}

const emptyForm: ClientFormData = {
  name: "",
  email: "",
  phone: "",
  address: "",
  notes: "",
  is_active: true,
}

function getClientsQueryOptions() {
  return {
    queryFn: () => ClientesService.readClients({ skip: 0, limit: 100 }),
    queryKey: ["clients"],
  }
}

export const Route = createFileRoute("/_layout/clientes")({
  component: Clientes,
  head: () => ({
    meta: [
      {
        title: "Clientes - Sistema de Gestión",
      },
    ],
  }),
})

function Clientes() {
  const queryClient = useQueryClient()

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingClient, setEditingClient] = useState<ClientRecord | null>(null)
  const [form, setForm] = useState<ClientFormData>(emptyForm)

  const {
    data: clientsResponse,
    isLoading,
    isError,
  } = useQuery(getClientsQueryOptions())

  const clients = useMemo(
    () => (clientsResponse?.data ?? []) as ClientRecord[],
    [clientsResponse],
  )

  const createClientMutation = useMutation({
    mutationFn: (payload: ClientPayload) =>
      ClientesService.createClient({
        requestBody: payload,
      }),
    onSuccess: () => {
      toast.success("Cliente creado correctamente")
      queryClient.invalidateQueries({ queryKey: ["clients"] })
      resetForm()
    },
    onError: () => {
      toast.error("No se pudo crear el cliente")
    },
  })

  const updateClientMutation = useMutation({
    mutationFn: (payload: ClientPayload) => {
      if (!editingClient) throw new Error("Cliente no seleccionado")
      return ClientesService.updateClient({
        id: editingClient.id,
        requestBody: payload,
      })
    },
    onSuccess: () => {
      toast.success("Cliente actualizado correctamente")
      queryClient.invalidateQueries({ queryKey: ["clients"] })
      resetForm()
    },
    onError: () => {
      toast.error("No se pudo actualizar el cliente")
    },
  })

  const deleteClientMutation = useMutation({
    mutationFn: (id: string) =>
      ClientesService.deleteClient({
        id,
      }),
    onSuccess: () => {
      toast.success("Cliente eliminado correctamente")
      queryClient.invalidateQueries({ queryKey: ["clients"] })
    },
    onError: () => {
      toast.error("No se pudo eliminar el cliente")
    },
  })

  function resetForm() {
    setForm(emptyForm)
    setEditingClient(null)
    setIsFormOpen(false)
  }

  function openCreateForm() {
    setEditingClient(null)
    setForm(emptyForm)
    setIsFormOpen(true)
  }

  function openEditForm(client: ClientRecord) {
    setEditingClient(client)
    setForm({
      name: client.name ?? "",
      email: client.email ?? "",
      phone: client.phone ?? "",
      address: client.address ?? "",
      notes: client.notes ?? "",
      is_active: client.is_active ?? true,
    })
    setIsFormOpen(true)
  }

  function handleChange(
    field: keyof ClientFormData,
    value: string | boolean,
  ) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (!form.name.trim()) {
      toast.error("El nombre es obligatorio")
      return
    }

    const payload: ClientPayload = {
      name: form.name.trim(),
      email: form.email.trim() || null,
      phone: form.phone.trim() || null,
      address: form.address.trim() || null,
      notes: form.notes.trim() || null,
      is_active: form.is_active,
    }

    if (editingClient) {
      updateClientMutation.mutate(payload)
      return
    }

    createClientMutation.mutate(payload)
  }

  function handleDelete(client: ClientRecord) {
    const confirmed = window.confirm(
      `¿Querés eliminar a "${client.name}"?`,
    )

    if (!confirmed) return

    deleteClientMutation.mutate(client.id)
  }

  const isSubmitting =
    createClientMutation.isPending || updateClientMutation.isPending

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Clientes</h1>
          <p className="text-muted-foreground">
            Creá y administrá tus clientes
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateForm}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition-all duration-300 hover:scale-[1.02] hover:brightness-110"
        >
          <Plus className="h-4 w-4" />
          Nuevo cliente
        </button>
      </div>

      {isFormOpen && (
        <div className="rounded-2xl border border-white/10 bg-slate-950/55 p-5 shadow-2xl backdrop-blur-md">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">
                {editingClient ? "Editar cliente" : "Nuevo cliente"}
              </h2>
              <p className="text-sm text-white/60">
                Completá la información del cliente
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
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-white/85">
                  Nombre
                </label>
                <input
                  value={form.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="Nombre del cliente"
                  className="rounded-xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400/50"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-white/85">
                  Email
                </label>
                <input
                  value={form.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  placeholder="correo@ejemplo.com"
                  className="rounded-xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400/50"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-white/85">
                  Teléfono
                </label>
                <input
                  value={form.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  placeholder="351..."
                  className="rounded-xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400/50"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-white/85">
                  Dirección
                </label>
                <input
                  value={form.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                  placeholder="Dirección"
                  className="rounded-xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400/50"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-white/85">
                Observaciones
              </label>
              <textarea
                value={form.notes}
                onChange={(e) => handleChange("notes", e.target.value)}
                placeholder="Notas adicionales"
                rows={4}
                className="rounded-xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400/50"
              />
            </div>

            <label className="inline-flex items-center gap-3 text-sm text-white/80">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => handleChange("is_active", e.target.checked)}
                className="h-4 w-4 rounded border-white/20 bg-slate-900"
              />
              Cliente activo
            </label>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition-all duration-300 hover:scale-[1.02] hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting
                  ? "Guardando..."
                  : editingClient
                    ? "Guardar cambios"
                    : "Crear cliente"}
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
              Cargando clientes...
            </h3>
            <p className="text-sm text-white/60">
              Esperá un momento mientras buscamos la información.
            </p>
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-14 text-center">
            <div className="mb-4 rounded-full bg-red-500/10 p-4">
              <Users className="h-8 w-8 text-red-300" />
            </div>
            <h3 className="text-lg font-semibold text-white">
              No se pudieron cargar los clientes
            </h3>
            <p className="text-sm text-white/60">
              Reintentá en unos segundos.
            </p>
          </div>
        ) : clients.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 text-center">
            <div className="mb-4 rounded-full bg-white/5 p-4">
              <Users className="h-8 w-8 text-white/60" />
            </div>
            <h3 className="text-lg font-semibold text-white">
              Todavía no tenés clientes cargados
            </h3>
            <p className="text-sm text-white/60">
              Creá tu primer cliente para empezar.
            </p>

            <button
              type="button"
              onClick={openCreateForm}
              className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition-all duration-300 hover:scale-[1.02] hover:brightness-110"
            >
              <Plus className="h-4 w-4" />
              Nuevo cliente
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left text-white/55">
                  <th className="px-4 py-3 font-medium">Nombre</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Teléfono</th>
                  <th className="px-4 py-3 font-medium">Estado</th>
                  <th className="px-4 py-3 font-medium text-right">Acciones</th>
                </tr>
              </thead>

              <tbody>
                {clients.map((client) => (
                  <tr
                    key={client.id}
                    className="border-b border-white/5 text-white/85 transition hover:bg-white/[0.03]"
                  >
                    <td className="px-4 py-4">
                      <div className="font-medium text-white">{client.name}</div>
                      {client.address && (
                        <div className="mt-1 text-xs text-white/45">
                          {client.address}
                        </div>
                      )}
                    </td>

                    <td className="px-4 py-4 text-white/70">
                      {client.email || "—"}
                    </td>

                    <td className="px-4 py-4 text-white/70">
                      {client.phone || "—"}
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                          client.is_active
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-red-500/10 text-red-300"
                        }`}
                      >
                        {client.is_active ? "Activo" : "Inactivo"}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEditForm(client)}
                          className="inline-flex items-center justify-center rounded-lg border border-white/10 bg-white/5 p-2 text-white/70 transition hover:bg-white/10 hover:text-white"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(client)}
                          disabled={deleteClientMutation.isPending}
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