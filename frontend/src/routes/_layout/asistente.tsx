import { createFileRoute } from "@tanstack/react-router"
import { Bot, Info, Send, User, X } from "lucide-react"
import { useEffect, useRef, useState } from "react"

import { AILoader } from "@/components/Common/AILoader"

const API_BASE = import.meta.env.VITE_API_URL?.trim() || "http://localhost:8000"

type Message = {
  id: string
  role: "user" | "assistant"
  content: string
  isDemo?: boolean
  timestamp: Date
}

function getToken() {
  return localStorage.getItem("access_token") || ""
}

async function sendMessage(
  messages: { role: string; content: string }[],
): Promise<{ reply: string; is_demo: boolean }> {
  const response = await fetch(`${API_BASE}/api/v1/asistente/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ messages }),
  })
  if (!response.ok) throw new Error("No se pudo procesar la consulta")
  return response.json()
}

export const Route = createFileRoute("/_layout/asistente")({
  component: Asistente,
  head: () => ({
    meta: [{ title: "Asistente IA - Sistema de Gestión" }],
  }),
})

const SUGGESTIONS = [
  "Analizar stock bajo",
  "Resumen de ventas",
  "Ideas para mejorar el negocio",
  "Clientes destacados",
  "Productos más importantes",
  "Consejos de gestión",
]

function TypingIndicator() {
  return (
    <div className="flex items-end gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 shadow-lg shadow-cyan-500/20">
        <Bot className="h-4 w-4 text-white" />
      </div>
      <div className="rounded-2xl rounded-bl-sm border border-white/10 bg-slate-900/70 px-4 py-3">
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 animate-bounce rounded-full bg-cyan-400 [animation-delay:-0.3s]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-cyan-400 [animation-delay:-0.15s]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-cyan-400" />
        </div>
      </div>
    </div>
  )
}

function ChatMessage({ message }: { message: Message }) {
  const isUser = message.role === "user"
  const formatted = message.content.replace(
    /\*\*(.+?)\*\*/g,
    "<strong>$1</strong>",
  )
  return (
    <div className={`flex items-end gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full shadow-lg ${
          isUser ? "bg-white/10" : "bg-gradient-to-br from-cyan-400 to-blue-500 shadow-cyan-500/20"
        }`}
      >
        {isUser ? <User className="h-4 w-4 text-white/70" /> : <Bot className="h-4 w-4 text-white" />}
      </div>
      <div
        className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isUser
            ? "rounded-br-sm border border-cyan-400/20 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 text-white"
            : "rounded-bl-sm border border-white/10 bg-slate-900/70 text-white/90"
        }`}
      >
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: controlled markdown-lite */}
        <p className="whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: formatted }} />
        <div className="mt-1.5 flex items-center justify-between gap-2">
          <p className={`text-[10px] ${isUser ? "text-cyan-300/40" : "text-white/25"}`}>
            {message.timestamp.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}
          </p>
          {message.isDemo && !isUser && (
            <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/20 bg-amber-400/10 px-1.5 py-0.5 text-[9px] font-medium text-amber-300/80">
              <Info className="h-2.5 w-2.5" /> modo local
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

function Asistente() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isDemoMode, setIsDemoMode] = useState<boolean | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isLoading])

  async function handleSend(content?: string) {
    const text = (content ?? input).trim()
    if (!text || isLoading) return
    setInput("")
    setError(null)
    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMsg])
    setIsLoading(true)
    try {
      const history = [...messages, userMsg].map((m) => ({ role: m.role, content: m.content }))
      const { reply, is_demo } = await sendMessage(history)
      if (isDemoMode === null) setIsDemoMode(is_demo)
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: "assistant", content: reply, isDemo: is_demo, timestamp: new Date() },
      ])
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error inesperado"
      setError(msg)
      setMessages((prev) => prev.filter((m) => m.id !== userMsg.id))
      setInput(text)
    } finally {
      setIsLoading(false)
      inputRef.current?.focus()
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const isEmpty = messages.length === 0

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">Asistente IA</h1>
            {isDemoMode === true && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/25 bg-amber-400/10 px-3 py-1 text-xs font-medium text-amber-300">
                <Info className="h-3 w-3" /> Modo local
              </span>
            )}
            {isDemoMode === false && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Claude activo
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {isDemoMode === true
              ? "Modo local activo. Configurá ANTHROPIC_API_KEY para activar IA real."
              : "Consultá sobre productos, clientes, stock y gestión del sistema."}
          </p>
        </div>
        {messages.length > 0 && (
          <button
            type="button"
            onClick={() => { setMessages([]); setError(null); setInput(""); setIsDemoMode(null) }}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-white/70 transition hover:bg-white/10 hover:text-white"
          >
            <X className="h-4 w-4" /> Nueva conversación
          </button>
        )}
      </div>

      {/* Chat container */}
      <div className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-950/55 shadow-2xl backdrop-blur-md">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5">
          {isEmpty ? (
            /* ── Empty state with loader ── */
            <div className="flex h-full flex-col items-center justify-center gap-8 py-6">
              {/* Animated loader */}
              <div className="flex flex-col items-center gap-6">
                <AILoader />
                <div className="text-center">
                  <h2 className="text-xl font-semibold text-white">¿En qué te puedo ayudar?</h2>
                  <p className="mt-2 max-w-sm text-sm leading-relaxed text-white/50">
                    Preguntame sobre el sistema, productos, clientes, ventas o stock.
                  </p>
                </div>
              </div>
              {/* Suggestions */}
              <div className="grid w-full max-w-xl gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => handleSend(s)}
                    className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm text-white/70 transition hover:border-cyan-400/30 hover:bg-white/10 hover:text-white"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              {messages.map((m) => <ChatMessage key={m.id} message={m} />)}
              {isLoading && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="mx-5 mb-2 flex items-start gap-3 rounded-xl border border-red-400/20 bg-red-500/10 p-3 text-sm text-red-300">
            <span className="shrink-0">⚠️</span>
            <span>{error}</span>
            <button type="button" onClick={() => setError(null)} className="ml-auto shrink-0 text-red-300/60 hover:text-red-300">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Input */}
        <div className="border-t border-white/10 p-4">
          <div className="flex items-end gap-3">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Escribí tu consulta... (Enter para enviar)"
              rows={1}
              disabled={isLoading}
              className="flex-1 resize-none rounded-xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400/50 disabled:opacity-60"
              style={{ minHeight: "48px", maxHeight: "120px" }}
              onInput={(e) => {
                const t = e.target as HTMLTextAreaElement
                t.style.height = "48px"
                t.style.height = `${Math.min(t.scrollHeight, 120)}px`
              }}
            />
            <button
              type="button"
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
              className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 text-white shadow-lg shadow-cyan-500/20 transition-all hover:scale-105 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
          {isDemoMode === true && (
            <p className="mt-2 text-center text-[11px] text-amber-300/40">
              Respuestas en modo local. Configurá ANTHROPIC_API_KEY para activar Claude real.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
