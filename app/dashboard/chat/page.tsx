"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useSession } from "next-auth/react"
import {
  MessageSquare, Send, Loader2, Circle, ArrowLeft,
  Ticket, Clock, CheckCircle2, AlertCircle, User, Building2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

const statusConfig: Record<string, { label: string; className: string; icon: React.ElementType }> = {
  Open:          { label: "Open",        className: "bg-blue-100 text-blue-700",   icon: Circle },
  "In Progress": { label: "In Progress", className: "bg-yellow-100 text-yellow-700", icon: Clock },
  Pending:       { label: "Pending",     className: "bg-orange-100 text-orange-700", icon: AlertCircle },
  Resolved:      { label: "Resolved",    className: "bg-green-100 text-green-700",  icon: CheckCircle2 },
  Closed:        { label: "Closed",      className: "bg-slate-100 text-slate-600",  icon: CheckCircle2 },
}

export default function ChatPage() {
  const { data: session } = useSession()
  const [tickets, setTickets] = useState<any[]>([])
  const [selected, setSelected] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [comment, setComment] = useState("")
  const [sending, setSending] = useState(false)
  const [mobileView, setMobileView] = useState<"list" | "chat">("list")
  const bottomRef = useRef<HTMLDivElement>(null)
  const selectedIdRef = useRef<string | null>(null)

  const fetchTickets = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/tickets")
      const data = await res.json()
      if (Array.isArray(data)) {
        const active = data.filter(t => !["Resolved", "Closed"].includes(t.status))
        setTickets(active)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchDetail = useCallback(async (id: string) => {
    setLoadingDetail(true)
    try {
      const res = await fetch(`/api/tickets/${id}`)
      if (res.ok) setSelected(await res.json())
    } finally {
      setLoadingDetail(false)
    }
  }, [])

  useEffect(() => { fetchTickets() }, [fetchTickets])

  useEffect(() => {
    selectedIdRef.current = selected?.id || null
  }, [selected?.id])

  useEffect(() => {
    // Polling setiap 3 detik untuk efek "Live"
    const interval = setInterval(() => {
      // 1. Fetch daftar tiket aktif (tanpa merubah state loading)
      fetch("/api/tickets")
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            const active = data.filter((t: any) => !["Resolved", "Closed"].includes(t.status))
            setTickets(active)
          }
        }).catch(() => {})

      // 2. Fetch detail percakapan jika ada yang dipilih
      if (selectedIdRef.current) {
        fetch(`/api/tickets/${selectedIdRef.current}`)
          .then(res => res.json())
          .then(data => {
            if (data && !data.error) setSelected(data)
          }).catch(() => {})
      }
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [selected?.comments])

  const handleSelectTicket = (ticket: any) => {
    fetchDetail(ticket.id)
    setMobileView("chat")
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!comment.trim() || !selected) return
    setSending(true)
    try {
      const res = await fetch(`/api/tickets/${selected.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: comment }),
      })
      if (res.ok) {
        setComment("")
        fetchDetail(selected.id)
        // refresh ticket list
        fetchTickets()
      }
    } finally {
      setSending(false)
    }
  }

  const isHelpdesk = session?.user?.role === "superadmin" || session?.user?.role?.startsWith("helpdesk_")

  return (
    <div className="h-[calc(100vh-10rem)] flex flex-col">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <MessageSquare className="w-7 h-7 text-blue-600" />
          Live Chat Tiket
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          {isHelpdesk ? "Tangani tiket aktif dari pengguna" : "Lihat update tiket Anda"}
        </p>
      </div>

      <div className="flex-1 flex rounded-2xl overflow-hidden border border-slate-200 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900 min-h-0">

        {/* Left: Ticket List */}
        <div className={`w-full lg:w-80 flex-shrink-0 flex flex-col border-r border-slate-200 dark:border-zinc-800 ${mobileView === "chat" ? "hidden lg:flex" : "flex"}`}>
          <div className="p-4 border-b border-slate-100 dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-slate-700 dark:text-white text-sm">Tiket Aktif</p>
              <Badge className="bg-blue-600 text-white text-xs">{tickets.length}</Badge>
            </div>
            <p className="text-xs text-slate-400 mt-1">Klik tiket untuk melihat percakapan</p>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-zinc-800">
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              </div>
            ) : tickets.length === 0 ? (
              <div className="text-center py-16 px-4">
                <Ticket className="w-10 h-10 mx-auto mb-3 text-slate-300" />
                <p className="text-slate-500 text-sm">Tidak ada tiket aktif</p>
              </div>
            ) : tickets.map(t => {
              const status = statusConfig[t.status] ?? statusConfig["Open"]
              const StatusIcon = status.icon
              const isActive = selected?.id === t.id
              return (
                <button
                  key={t.id}
                  onClick={() => handleSelectTicket(t)}
                  className={`w-full text-left p-4 transition-colors ${
                    isActive ? "bg-blue-50 dark:bg-blue-900/20" : "hover:bg-slate-50 dark:hover:bg-zinc-800"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="h-9 w-9 shrink-0">
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-xs font-bold">
                        {t.creator?.name?.charAt(0) ?? "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <p className={`text-sm font-semibold truncate ${isActive ? "text-blue-700 dark:text-blue-400" : "text-slate-800 dark:text-white"}`}>
                          {t.creator?.name}
                        </p>
                      </div>
                      <p className="text-xs text-slate-500 truncate mt-0.5">{t.title}</p>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <Badge className={`text-xs px-2 py-0 ${status.className}`}>
                          <StatusIcon className="w-2.5 h-2.5 mr-1 inline" />
                          {status.label}
                        </Badge>
                        <span className="text-xs text-slate-400 font-mono">{t.ticketNumber}</span>
                      </div>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Right: Chat Area */}
        <div className={`flex-1 flex flex-col min-w-0 ${mobileView === "list" ? "hidden lg:flex" : "flex"}`}>
          {!selected ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
              <MessageSquare className="w-16 h-16 mb-4 opacity-20" />
              <p className="font-medium">Pilih tiket untuk mulai percakapan</p>
              <p className="text-sm mt-1">Klik salah satu tiket di sebelah kiri</p>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                <Button
                  variant="ghost" size="icon"
                  className="lg:hidden shrink-0"
                  onClick={() => setMobileView("list")}
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <Avatar className="h-10 w-10 shrink-0">
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold">
                    {selected.creator?.name?.charAt(0) ?? "?"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-800 dark:text-white truncate">{selected.creator?.name}</p>
                  <p className="text-xs text-slate-400 flex items-center gap-1.5 truncate">
                    <Ticket className="w-3 h-3" /> {selected.ticketNumber} · {selected.title}
                  </p>
                </div>
                <div className="hidden sm:flex items-center gap-2 shrink-0">
                  {(() => {
                    const s = statusConfig[selected.status] ?? statusConfig["Open"]
                    const SIcon = s.icon
                    return (
                      <Badge className={`text-xs ${s.className}`}>
                        <SIcon className="w-3 h-3 mr-1 inline" /> {s.label}
                      </Badge>
                    )
                  })()}
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50 dark:bg-zinc-950/30">
                {loadingDetail ? (
                  <div className="flex items-center justify-center h-32">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                  </div>
                ) : selected.comments?.length === 0 ? (
                  <div className="text-center py-10 text-slate-400">
                    <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-20" />
                    <p className="text-sm">Belum ada percakapan. Mulai dengan mengirim pesan.</p>
                  </div>
                ) : selected.comments?.map((c: any) => {
                  const isMe = c.user?.id === session?.user?.id
                  if (c.isSystem) return (
                    <div key={c.id} className="flex justify-center">
                      <span className="text-xs text-slate-400 bg-slate-100 dark:bg-zinc-800 px-3 py-1 rounded-full italic">
                        {c.content}
                      </span>
                    </div>
                  )
                  return (
                    <div key={c.id} className={`flex items-end gap-2 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                      <Avatar className="h-7 w-7 shrink-0">
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-xs font-bold">
                          {c.user?.name?.charAt(0) ?? "?"}
                        </AvatarFallback>
                      </Avatar>
                      <div className={`max-w-[70%] ${isMe ? "items-end" : "items-start"} flex flex-col`}>
                        <span className="text-xs text-slate-400 mb-1 px-1">
                          {isMe ? "Anda" : c.user?.name} · {new Date(c.createdAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                        <div className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                          isMe
                            ? "bg-blue-600 text-white rounded-br-sm"
                            : "bg-white dark:bg-zinc-800 text-slate-800 dark:text-white rounded-bl-sm shadow-sm border border-slate-100 dark:border-zinc-700"
                        }`}>
                          {c.content}
                        </div>
                      </div>
                    </div>
                  )
                })}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                <form onSubmit={handleSend} className="flex items-end gap-2">
                  <textarea
                    rows={2}
                    placeholder="Ketik pesan atau update tiket..."
                    className="flex-1 rounded-2xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 px-4 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(e) } }}
                    required
                  />
                  <Button
                    type="submit"
                    disabled={sending || !comment.trim()}
                    className="h-10 w-10 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/30 shrink-0 p-0"
                  >
                    {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </Button>
                </form>
                <p className="text-xs text-slate-400 mt-2 text-center">Enter untuk kirim · Shift+Enter untuk baris baru</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
