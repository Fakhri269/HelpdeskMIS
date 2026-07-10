"use client"

import { useState, useEffect, useRef } from "react"
import { useSession } from "next-auth/react"
import { signOut } from "next-auth/react"
import Link from "next/link"
import Image from "next/image"
import {
  Ticket, Plus, MessageSquare, LogOut, Bell,
  Clock, CheckCircle2, Circle, AlertCircle,
  ChevronRight, Loader2, X, FileText, Send,
  ArrowDown, Minus, ArrowUp, AlertTriangle,
  Cpu, Wifi, KeyRound, Printer, Map, AppWindow, Zap, HelpCircle,
  User, Phone, Building2
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// ─── Configs ──────────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<string, { label: string; className: string; icon: React.ElementType }> = {
  Open:          { label: "Open",        className: "bg-blue-100 text-blue-700 border-blue-200",       icon: Circle },
  "In Progress": { label: "In Progress", className: "bg-yellow-100 text-yellow-700 border-yellow-200", icon: Clock },
  Pending:       { label: "Pending",     className: "bg-orange-100 text-orange-700 border-orange-200", icon: AlertCircle },
  Resolved:      { label: "Resolved",    className: "bg-green-100 text-green-700 border-green-200",    icon: CheckCircle2 },
  Closed:        { label: "Closed",      className: "bg-slate-100 text-slate-600 border-slate-200",    icon: CheckCircle2 },
}

const CATEGORY_META: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  "Perbaikan Komputer":   { icon: Cpu,        color: "text-blue-600",    bg: "bg-blue-50" },
  "Jaringan/Internet":    { icon: Wifi,       color: "text-green-600",   bg: "bg-green-50" },
  "Data/Akses/Password":  { icon: KeyRound,   color: "text-purple-600",  bg: "bg-purple-50" },
  "Printer/Scanner":      { icon: Printer,    color: "text-orange-600",  bg: "bg-orange-50" },
  "GIS/Peta":             { icon: Map,        color: "text-emerald-600", bg: "bg-emerald-50" },
  "Software/Aplikasi":    { icon: AppWindow,  color: "text-indigo-600",  bg: "bg-indigo-50" },
  "Hardware Peripheral":  { icon: Zap,        color: "text-yellow-600",  bg: "bg-yellow-50" },
  "Lainnya":              { icon: HelpCircle, color: "text-slate-500",   bg: "bg-slate-100" },
}

const PRIORITIES = [
  { value: "Low",      label: "Low",      icon: ArrowDown,     activeBg: "bg-slate-700",  desc: "Tidak mendesak" },
  { value: "Medium",   label: "Medium",   icon: Minus,         activeBg: "bg-yellow-500", desc: "Perlu ditangani" },
  { value: "High",     label: "High",     icon: ArrowUp,       activeBg: "bg-orange-500", desc: "Segera tangani" },
  { value: "Critical", label: "Critical", icon: AlertTriangle, activeBg: "bg-red-600",    desc: "Darurat!" },
]

type TicketItem = {
  id: string
  ticketNumber: string
  title: string
  status: string
  priority: string
  category: string
  createdAt: string
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function UserPortalPage() {
  const { data: session } = useSession()
  const [tickets, setTickets] = useState<TicketItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [activeView, setActiveView] = useState<"home" | "chat">("home")

  // Form state
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("")
  const [priority, setPriority] = useState("Medium")
  const [unitKerjaId, setUnitKerjaId] = useState("")
  const [unitKerjaList, setUnitKerjaList] = useState<{ id: string; name: string }[]>([])
  const [categories, setCategories] = useState<string[]>(Object.keys(CATEGORY_META))

  // Chat state
  const [chatMessage, setChatMessage] = useState("")
  const [chatMessages, setChatMessages] = useState<any[]>([])
  const [chatLoading, setChatLoading] = useState(false)
  const chatBottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchTickets()
    fetchUnitKerja()
    fetchCategories()
  }, [])

  // Poll chat messages when in chat view
  useEffect(() => {
    if (activeView === "chat") {
      fetchChatMessages()
      const interval = setInterval(fetchChatMessages, 3000)
      return () => clearInterval(interval)
    }
  }, [activeView])

  // Scroll to bottom when messages change
  useEffect(() => {
    if (activeView === "chat") {
      chatBottomRef.current?.scrollIntoView({ behavior: "smooth" })
    }
  }, [chatMessages, activeView])

  const fetchChatMessages = async () => {
    try {
      const res = await fetch("/api/chat")
      if (res.ok) {
        const data = await res.json()
        setChatMessages(data.messages || [])
      }
    } catch { }
  }

  const fetchTickets = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/tickets")
      const data = await res.json()
      setTickets(data.tickets || [])
    } catch { } finally {
      setLoading(false)
    }
  }

  const fetchUnitKerja = async () => {
    try {
      const res = await fetch("/api/master/unit-kerja")
      const data = await res.json()
      setUnitKerjaList(data)
    } catch { }
  }

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/master/categories")
      const data = await res.json()
      if (Array.isArray(data) && data.length > 0) {
        setCategories(data.map((c: { name: string }) => c.name))
      }
    } catch { }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !description || !category) return
    setSubmitting(true)
    try {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, category, priority, unitKerjaId: unitKerjaId || undefined }),
      })
      if (res.ok) {
        setShowForm(false)
        setTitle(""); setDescription(""); setCategory(""); setPriority("Medium"); setUnitKerjaId("")
        fetchTickets()
      }
    } catch { } finally {
      setSubmitting(false)
    }
  }

  const handleSendChat = async () => {
    if (!chatMessage.trim()) return
    const text = chatMessage.trim()
    setChatMessage("")
    setChatLoading(true)

    // Optimistic update
    const optimisticMsg = {
      id: "temp-" + Date.now(),
      content: text,
      isSystem: false,
      createdAt: new Date().toISOString(),
      user: { id: session?.user?.id, name: session?.user?.name, role: "user" }
    }
    setChatMessages(prev => [...prev, optimisticMsg])

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text })
      })
      if (res.ok) {
        fetchChatMessages()
        // Refresh ticket list in case a new ticket was created
        fetchTickets()
      }
    } catch { } finally {
      setChatLoading(false)
    }
  }

  const userInitial = session?.user?.name?.charAt(0)?.toUpperCase() || "U"
  const userName = session?.user?.name || "User"

  const myTickets = tickets.slice(0, 5)
  const openCount = tickets.filter(t => t.status === "Open" || t.status === "In Progress").length
  const resolvedCount = tickets.filter(t => t.status === "Resolved" || t.status === "Closed").length

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center">
              <Image src="../../PdamLogo.svg" alt="PDAM Logo" width={32} height={32} className="drop-shadow-md" />
            </div>
            <span className="font-bold text-slate-800">Helpdesk <span className="text-blue-600">.</span></span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="relative rounded-full text-slate-500">
              <Bell className="h-5 w-5" />
              {openCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
              )}
            </Button>
            <div className="flex items-center gap-2 pl-2 border-l border-slate-100">
              <Avatar className="h-8 w-8 border-2 border-blue-100">
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-700 text-white text-xs font-bold">
                  {userInitial}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-semibold text-slate-700 hidden sm:block">{userName.split(' ')[0]}</span>
              <Button
                variant="ghost" size="icon"
                className="text-slate-400 hover:text-red-500 rounded-full"
                onClick={() => signOut()}
                title="Keluar"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs Navigation */}
      <div className="sticky top-16 z-40 bg-white/70 backdrop-blur-lg border-b border-slate-100">
        <div className="max-w-4xl mx-auto px-4 flex gap-1">
          <button
            onClick={() => setActiveView("home")}
            className={`py-3.5 px-5 text-sm font-semibold border-b-2 transition-all ${
              activeView === "home"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            <Ticket className="h-4 w-4 inline mr-2" />
            Tiket Saya
          </button>
          <button
            onClick={() => setActiveView("chat")}
            className={`py-3.5 px-5 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeView === "chat"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            <MessageSquare className="h-4 w-4" />
            Live Chat
            <span className="flex h-2 w-2 rounded-full bg-green-500" />
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">

        {/* ── HOME VIEW ─────────────────────────────────────────────────────── */}
        {activeView === "home" && (
          <div className="space-y-6">

            {/* Welcome Banner */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 p-6 text-white shadow-xl shadow-blue-500/20">
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-12 translate-x-12 pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-8 -translate-x-8 pointer-events-none" />
              <div className="relative">
                <p className="text-blue-100 text-sm mb-1">Selamat datang 👋</p>
                <h1 className="text-2xl font-bold mb-1">{userName}</h1>
                <p className="text-blue-100/80 text-sm mb-5">Ada kendala teknis? Laporkan di sini, tim kami siap membantu.</p>
                <button
                  onClick={() => setShowForm(true)}
                  className="inline-flex items-center gap-2 bg-white text-blue-700 font-bold text-sm rounded-xl px-5 py-2.5 shadow-lg hover:bg-blue-50 active:scale-95 transition-all"
                >
                  <Plus className="h-4 w-4" />
                  Buat Tiket Baru
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm text-center">
                <div className="text-2xl font-bold text-slate-800">{tickets.length}</div>
                <div className="text-xs text-slate-500 mt-0.5">Total Tiket</div>
              </div>
              <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm text-center">
                <div className="text-2xl font-bold text-blue-600">{openCount}</div>
                <div className="text-xs text-slate-500 mt-0.5">Aktif</div>
              </div>
              <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm text-center">
                <div className="text-2xl font-bold text-green-600">{resolvedCount}</div>
                <div className="text-xs text-slate-500 mt-0.5">Selesai</div>
              </div>
            </div>

            {/* Ticket List */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Tiket Terakhir</h2>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-16 bg-white rounded-2xl border border-slate-100">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                </div>
              ) : myTickets.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-4">
                    <Ticket className="h-7 w-7 text-slate-300" />
                  </div>
                  <p className="font-semibold text-slate-600 mb-1">Belum ada tiket</p>
                  <p className="text-sm text-slate-400">Klik tombol "Buat Tiket Baru" untuk melaporkan kendala Anda.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {myTickets.map(ticket => {
                    const statusCfg = STATUS_CONFIG[ticket.status] || STATUS_CONFIG["Open"]
                    const StatusIcon = statusCfg.icon
                    const catMeta = CATEGORY_META[ticket.category]
                    const CatIcon = catMeta?.icon || HelpCircle
                    return (
                      <div key={ticket.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center gap-4 hover:shadow-md hover:border-blue-100 transition-all group cursor-pointer">
                        <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${catMeta?.bg || "bg-slate-100"}`}>
                          <CatIcon className={`h-5 w-5 ${catMeta?.color || "text-slate-500"}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-xs text-slate-400 font-medium">{ticket.ticketNumber}</span>
                            <Badge className={`text-[10px] px-2 py-0 h-4 border ${statusCfg.className}`}>
                              <StatusIcon className="h-2.5 w-2.5 mr-1" />
                              {statusCfg.label}
                            </Badge>
                          </div>
                          <p className="text-sm font-semibold text-slate-800 truncate">{ticket.title}</p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {new Date(ticket.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                          </p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-blue-500 transition-colors flex-shrink-0" />
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── CHAT VIEW ─────────────────────────────────────────────────────── */}
        {activeView === "chat" && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col" style={{ height: "calc(100vh - 160px)" }}>
            {/* Chat Header */}
            <div className="px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <MessageSquare className="h-5 w-5 text-white" />
                </div>
                <span className="absolute bottom-0 right-0 flex h-2.5 w-2.5 rounded-full bg-green-400 ring-2 ring-blue-600" />
              </div>
              <div>
                <p className="font-bold text-white text-sm">Helpdesk MIS</p>
                <p className="text-blue-100 text-xs">Aktif sekarang</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/50">
              {chatMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-3">
                  <MessageSquare className="h-12 w-12 opacity-20" />
                  <p className="text-sm">Belum ada percakapan. Mulai dengan mengirim pesan.</p>
                </div>
              ) : (
                chatMessages.map((msg, i) => {
                  const isMe = msg.user.id === session?.user?.id
                  if (msg.isSystem) return (
                    <div key={msg.id || i} className="flex justify-center my-2">
                      <span className="text-[11px] text-slate-400 bg-slate-100 px-3 py-1 rounded-full italic">
                        {msg.content}
                      </span>
                    </div>
                  )
                  return (
                    <div key={msg.id || i} className={`flex gap-3 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                      {isMe ? (
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                          <span className="text-white text-xs font-bold">{userInitial}</span>
                        </div>
                      ) : (
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shadow-md">
                          <span className="text-white text-xs font-bold">HD</span>
                        </div>
                      )}
                      <div className={`max-w-[75%] ${isMe ? "items-end" : "items-start"} flex flex-col gap-1`}>
                        <div className={`rounded-2xl px-4 py-2.5 text-sm ${
                          isMe
                            ? "bg-blue-600 text-white rounded-tr-sm shadow-sm"
                            : "bg-white text-slate-700 border border-slate-100 shadow-sm rounded-tl-sm"
                        }`}>
                          {msg.content}
                        </div>
                        <span className="text-[10px] text-slate-400 px-1">
                          {!isMe && <span className="font-medium mr-1">{msg.user.name} •</span>}
                          {new Date(msg.createdAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    </div>
                  )
                })
              )}
              <div ref={chatBottomRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-slate-100 bg-white">
              <div className="flex gap-2 items-end">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={chatMessage}
                    onChange={e => setChatMessage(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleSendChat()}
                    placeholder="Tulis pesan Anda..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-slate-400"
                    disabled={chatLoading}
                  />
                </div>
                <button
                  onClick={handleSendChat}
                  disabled={!chatMessage.trim() || chatLoading}
                  className="flex-shrink-0 w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/30 hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {chatLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── TICKET FORM MODAL ────────────────────────────────────────────────── */}
      {showForm && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowForm(false)} />

          {/* Sheet */}
          <div className="relative w-full sm:max-w-lg bg-white sm:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            {/* Handle for mobile */}
            <div className="sm:hidden flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-slate-200" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-bold text-slate-800">Buat Tiket Baru</h2>
                <p className="text-xs text-slate-500">Isi formulir di bawah ini dengan lengkap</p>
              </div>
              <button
                onClick={() => setShowForm(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

              {/* Category */}
              <div>
                <Label className="text-sm font-semibold text-slate-700 mb-3 block">Kategori Masalah</Label>
                <div className="grid grid-cols-2 gap-2">
                  {categories.map(cat => {
                    const meta = CATEGORY_META[cat] || { icon: HelpCircle, color: "text-slate-500", bg: "bg-slate-100" }
                    const Icon = meta.icon
                    const selected = category === cat
                    return (
                      <button
                        key={cat} type="button"
                        onClick={() => setCategory(cat)}
                        className={`flex items-center gap-2.5 p-3 rounded-xl border text-left text-sm transition-all ${
                          selected
                            ? "border-blue-500 bg-blue-50 text-blue-700 shadow-sm"
                            : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                        }`}
                      >
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${meta.bg}`}>
                          <Icon className={`h-4 w-4 ${meta.color}`} />
                        </div>
                        <span className="font-medium text-xs leading-tight">{cat}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Priority */}
              <div>
                <Label className="text-sm font-semibold text-slate-700 mb-3 block">Prioritas</Label>
                <div className="grid grid-cols-4 gap-2">
                  {PRIORITIES.map(p => {
                    const Icon = p.icon
                    const sel = priority === p.value
                    return (
                      <button key={p.value} type="button" onClick={() => setPriority(p.value)}
                        className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                          sel ? `${p.activeBg} text-white border-transparent shadow-sm` : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
                        }`}
                      >
                        <Icon className="h-3.5 w-3.5" />
                        {p.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Title */}
              <div>
                <Label htmlFor="title" className="text-sm font-semibold text-slate-700 mb-1.5 block">Judul Masalah</Label>
                <Input
                  id="title" value={title} onChange={e => setTitle(e.target.value)} required
                  placeholder="Contoh: Komputer tidak bisa menyala"
                  className="rounded-xl border-slate-200 focus-visible:ring-blue-500"
                />
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="desc" className="text-sm font-semibold text-slate-700 mb-1.5 block">Deskripsi Lengkap</Label>
                <textarea
                  id="desc" value={description} onChange={e => setDescription(e.target.value)} required
                  rows={4} placeholder="Jelaskan masalah yang Anda alami secara detail..."
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-slate-400 resize-none"
                />
              </div>

              {/* Unit Kerja */}
              {unitKerjaList.length > 0 && (
                <div>
                  <Label className="text-sm font-semibold text-slate-700 mb-1.5 block">Unit Kerja</Label>
                  <Select value={unitKerjaId} onValueChange={v => setUnitKerjaId(v as string)}>
                    <SelectTrigger className="rounded-xl border-slate-200 focus:ring-blue-500">
                      <SelectValue placeholder="Pilih unit kerja..." />
                    </SelectTrigger>
                    <SelectContent>
                      {unitKerjaList.map(u => (
                        <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </form>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-slate-100 flex gap-3">
              <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setShowForm(false)} type="button">
                Batal
              </Button>
              <Button
                className="flex-1 rounded-xl bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/30"
                disabled={submitting || !title || !description || !category}
                onClick={handleSubmit as unknown as React.MouseEventHandler}
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
                {submitting ? "Mengirim..." : "Kirim Tiket"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}