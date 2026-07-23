"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import {
  Ticket, Plus, Search, Map,
  Clock, CheckCircle2, AlertCircle, Circle,
  Eye, Loader2, X, FileText, Send,
  Cpu, Wifi, KeyRound, Printer, Server, MonitorSmartphone, Zap, HelpCircle, AppWindow,
  AlertTriangle, ArrowUp, Minus, ArrowDown, Building2, Network
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetClose } from "@/components/ui/sheet"
import { getPusherClient } from "@/lib/pusher-client"

// ─── Configs ──────────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<string, { label: string; className: string; icon: React.ElementType }> = {
  Open:          { label: "Open",        className: "bg-blue-100 text-blue-700 border-blue-200",       icon: Circle },
  "In Progress": { label: "In Progress", className: "bg-yellow-100 text-yellow-700 border-yellow-200", icon: Clock },
  Pending:       { label: "Pending",     className: "bg-orange-100 text-orange-700 border-orange-200", icon: AlertCircle },
  Resolved:      { label: "Resolved",    className: "bg-green-100 text-green-700 border-green-200",    icon: CheckCircle2 },
  Closed:        { label: "Closed",      className: "bg-slate-100 text-slate-600 border-slate-200",    icon: CheckCircle2 },
}

const PRIORITY_CONFIG: Record<string, { className: string }> = {
  Critical: { className: "bg-red-100 text-red-700 border-red-200" },
  High:     { className: "bg-orange-100 text-orange-700 border-orange-200" },
  Medium:   { className: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  Low:      { className: "bg-slate-100 text-slate-600 border-slate-200" },
}

const STATUS_TABS = ["Semua", "Open", "In Progress", "Pending", "Resolved", "Closed"]

// Static categories - as fallback / icon mapping
const CATEGORY_META: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  "Perbaikan Komputer":     { icon: Cpu,               color: "text-blue-600",   bg: "bg-blue-50" },
  "Jaringan/Internet":      { icon: Wifi,              color: "text-green-600",  bg: "bg-green-50" },
  "Data/Akses/Password":    { icon: KeyRound,          color: "text-purple-600", bg: "bg-purple-50" },
  "Printer/Scanner":        { icon: Printer,           color: "text-orange-600", bg: "bg-orange-50" },
  "GIS/Peta":               { icon: Map,               color: "text-emerald-600",bg: "bg-emerald-50" },
  "Software/Aplikasi":      { icon: AppWindow,         color: "text-indigo-600", bg: "bg-indigo-50" },
  "Hardware Peripheral":    { icon: Zap,               color: "text-yellow-600", bg: "bg-yellow-50" },
  "Lainnya":                { icon: HelpCircle,        color: "text-slate-500",  bg: "bg-slate-100" },
}

const STATIC_CATEGORIES = Object.keys(CATEGORY_META)

const PRIORITIES = [
  { value: "Low",      label: "Low",      icon: ArrowDown,     activeBg: "bg-slate-700",  border: "border-slate-200", bg: "bg-slate-50",  desc: "Tidak mendesak" },
  { value: "Medium",   label: "Medium",   icon: Minus,         activeBg: "bg-yellow-500", border: "border-yellow-200",bg: "bg-yellow-50", desc: "Perlu ditangani" },
  { value: "High",     label: "High",     icon: ArrowUp,       activeBg: "bg-orange-500", border: "border-orange-200",bg: "bg-orange-50", desc: "Segera tangani" },
  { value: "Critical", label: "Critical", icon: AlertTriangle, activeBg: "bg-red-600",    border: "border-red-200",   bg: "bg-red-50",    desc: "Darurat!" },
]

// ─── Component ────────────────────────────────────────────────────────────────
export default function TicketsPage() {
  const { data: session } = useSession()
  const router = useRouter()

  const [tickets, setTickets]         = useState<any[]>([])
  const [loading, setLoading]         = useState(true)
  const [search, setSearch]           = useState("")
  const [activeTab, setActiveTab]     = useState("Semua")
  const [createOpen, setCreateOpen]   = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Reference data
  const [refs, setRefs]               = useState<{ units: any[]; subUnits: any[] }>({ units: [], subUnits: [] })
  const [refsLoaded, setRefsLoaded]   = useState(false)
  const [dbCategories, setDbCategories] = useState<string[]>([])

  const [form, setForm] = useState({
    title: "", description: "", priority: "Medium",
    category: "", unitKerjaId: "", subUnitKerjaId: ""
  })

  // ─── Fetch tickets ─────────────────────────────────────────────────────────
  const fetchTickets = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (activeTab !== "Semua") params.set("status", activeTab)
      if (search) params.set("search", search)
      const res = await fetch(`/api/tickets?${params}`)
      const data = await res.json()
      if (Array.isArray(data)) setTickets(data)
    } catch {}
    finally { setLoading(false) }
  }, [activeTab, search])

  useEffect(() => { 
    fetchTickets() 
    
    const pusher = getPusherClient()
    const channel = pusher.subscribe("helpdesk-tickets")
    
    channel.bind("ticket.created", (data: any) => {
      setTickets(prev => {
        // Jika sedang memfilter dan status/search ga match, bisa aja ga ditambahkan.
        // Tapi untuk simplifikasi kita tambah saja di paling atas.
        if (prev.find(t => t.id === data.id)) return prev
        return [data, ...prev]
      })
    })

    channel.bind("ticket.updated", (data: any) => {
      setTickets(prev => prev.map(t => 
        t.id === data.id ? { ...t, status: data.status, priority: data.priority, assignee: data.assignee } : t
      ))
    })

    return () => {
      channel.unbind_all()
      pusher.unsubscribe("helpdesk-tickets")
    }
  }, [fetchTickets])

  // ─── Load reference data ────────────────────────────────────────────────────
  useEffect(() => {
    Promise.all([
      fetch("/api/master/reference").then(r => r.json()),
      fetch("/api/master/categories").then(r => r.json()).catch(() => [])
    ]).then(([refData, catData]) => {
      if (refData.units) setRefs(refData)
      if (Array.isArray(catData) && catData.length > 0) {
        setDbCategories(catData.map((c: any) => c.name))
      }
      setRefsLoaded(true)
    })
  }, [])

  // ─── After refs loaded, set default unit from session ──────────────────────
  useEffect(() => {
    if (refsLoaded && session?.user?.unitKerjaId && !form.unitKerjaId) {
      // Validate that the ID actually exists in the fetched units
      const exists = refs.units.find(u => u.id === session.user.unitKerjaId)
      if (exists) setForm(prev => ({ ...prev, unitKerjaId: session.user.unitKerjaId! }))
    }
  }, [refsLoaded, refs.units]) // eslint-disable-line

  // ─── Submit ────────────────────────────────────────────────────────────────
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const unitKerjaId = form.unitKerjaId || refs.units[0]?.id || ""
      const res = await fetch("/api/tickets", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, unitKerjaId }),
      })
      if (res.ok) {
        setCreateOpen(false)
        setForm({ title: "", description: "", priority: "Medium", category: "", unitKerjaId: "", subUnitKerjaId: "" })
        fetchTickets()
      } else {
        const err = await res.json()
        alert(err.error || "Terjadi kesalahan")
      }
    } catch { alert("Terjadi kesalahan sistem") }
    finally { setIsSubmitting(false) }
  }

  // ─── Derived ──────────────────────────────────────────────────────────────
  const counts: Record<string, number> = { Semua: tickets.length }
  STATUS_TABS.slice(1).forEach(s => { counts[s] = tickets.filter(t => t.status === s).length })

  // Use DB categories if available, otherwise static
  const categories = dbCategories.length > 0 ? dbCategories : STATIC_CATEGORIES

  const subUnitsForUnit = refs.subUnits.filter(su => su.unitKerjaId === form.unitKerjaId)
  const isFormValid = form.title.trim() && form.description.trim() && form.category

  return (
    <div className="space-y-6">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Ticket className="w-7 h-7 text-blue-600" /> Manajemen Tiket
          </h1>
          <p className="text-sm text-slate-500 mt-1">Kelola dan pantau semua tiket helpdesk</p>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20 gap-2">
          <Plus className="w-4 h-4" /> Buat Tiket Baru
        </Button>
      </div>

      {/* ── Status Tabs ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {STATUS_TABS.map(s => (
          <button key={s} onClick={() => setActiveTab(s)}
            className={`rounded-xl p-3 text-left border transition-all duration-200 ${
              activeTab === s
                ? "text-white border-transparent shadow-lg shadow-blue-500/20"
                : "bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 hover:border-blue-300"
            }`}
            style={activeTab === s ? { background: "linear-gradient(160deg, #2166B3 0%, #1C82AC 55%, #1AA0AC 100%)" } : {}}
          >
            <div className={`text-2xl font-bold ${activeTab === s ? "text-white" : "text-slate-800 dark:text-white"}`}>{counts[s] ?? 0}</div>
            <div className={`text-xs font-medium mt-0.5 truncate ${activeTab === s ? "text-cyan-100" : "text-slate-500"}`}>{s}</div>
          </button>
        ))}
      </div>

      {/* ── Table ──────────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-zinc-800">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input placeholder="Cari tiket..." className="pl-9 bg-slate-50 dark:bg-zinc-800 rounded-xl" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-zinc-800/50 border-b border-slate-100 dark:border-zinc-800">
                <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">No. Tiket</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">Judul</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider hidden md:table-cell">Status</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider hidden sm:table-cell">Prioritas</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider hidden lg:table-cell">Pelapor</th>
                <th className="text-right px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
              {loading ? (
                <tr><td colSpan={6} className="text-center py-16">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600 mb-3" />
                  <p className="text-slate-400 text-sm">Memuat tiket...</p>
                </td></tr>
              ) : tickets.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-16 text-slate-400">
                  <Ticket className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p>Tidak ada tiket ditemukan</p>
                  <p className="text-sm mt-1">Klik "Buat Tiket Baru" untuk memulai</p>
                </td></tr>
              ) : tickets.map(ticket => {
                const status = STATUS_CONFIG[ticket.status] ?? STATUS_CONFIG["Open"]
                const priority = PRIORITY_CONFIG[ticket.priority] ?? PRIORITY_CONFIG["Low"]
                const StatusIcon = status.icon
                return (
                  <tr key={ticket.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors group">
                    <td className="px-4 py-3.5 font-mono text-xs text-slate-500 font-medium whitespace-nowrap">{ticket.ticketNumber}</td>
                    <td className="px-4 py-3.5">
                      <p className="font-semibold text-slate-800 dark:text-white group-hover:text-blue-600 transition-colors line-clamp-1">{ticket.title}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{ticket.category}</p>
                    </td>
                    <td className="px-4 py-3.5 hidden md:table-cell">
                      <Badge className={`gap-1.5 border text-xs font-medium ${status.className}`}><StatusIcon className="w-3 h-3" />{status.label}</Badge>
                    </td>
                    <td className="px-4 py-3.5 hidden sm:table-cell">
                      <Badge className={`border text-xs font-medium ${priority.className}`}>{ticket.priority}</Badge>
                    </td>
                    <td className="px-4 py-3.5 hidden lg:table-cell text-slate-600 dark:text-slate-300 text-xs">{ticket.creator?.name ?? "-"}</td>
                    <td className="px-4 py-3.5 text-right">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg hover:bg-blue-50 hover:text-blue-600" onClick={() => router.push(`/dashboard/tickets/${ticket.id}`)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-slate-100 dark:border-zinc-800 text-xs text-slate-400">
          Menampilkan {tickets.length} tiket
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          PREMIUM TICKET FORM — Slide-over Sheet
      ══════════════════════════════════════════════════════════════════ */}
      <Sheet open={createOpen} onOpenChange={setCreateOpen}>
        <SheetContent side="right" showCloseButton={false} className="w-full sm:max-w-[560px] p-0 flex flex-col overflow-hidden border-l border-slate-200 dark:border-zinc-800">

          {/* Header */}
          <div className="shrink-0 px-6 py-5 shadow-lg shadow-[#2166B3]/20" style={{ background: "linear-gradient(135deg, #2166B3 0%, #1AA0AC 100%)" }}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-white font-bold text-lg leading-tight">Buat Tiket Baru</h2>
                  <p className="text-blue-200 text-xs mt-0.5">Laporkan masalah IT Anda</p>
                </div>
              </div>
              <SheetClose className="w-10 h-10 sm:w-8 sm:h-8 rounded-lg bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors shrink-0">
                <X className="w-5 h-5 sm:w-4 sm:h-4 text-white" />
              </SheetClose>
            </div>

            {/* Step indicators */}
            <div className="flex items-center gap-3 mt-4">
              {["Informasi", "Kategori", "Prioritas", "Unit Kerja"].map((label, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-full bg-white/30 flex items-center justify-center text-[10px] font-bold text-white">{i + 1}</div>
                  <span className="text-blue-100 text-[10px] font-medium hidden sm:block">{label}</span>
                  {i < 3 && <div className="w-3 h-px bg-white/30" />}
                </div>
              ))}
            </div>
          </div>

          {/* Scrollable form body */}
          <form onSubmit={handleCreate} className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-zinc-800">

              {/* ── 1. Informasi Dasar ──────────────────────────────────── */}
              <div className="px-6 py-5 space-y-4">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center shrink-0">1</span>
                  <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Informasi Dasar</h3>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Judul Masalah <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    placeholder="Contoh: Printer di ruang rapat tidak bisa print"
                    value={form.title}
                    onChange={e => setForm({ ...form, title: e.target.value })}
                    required
                    maxLength={100}
                    className="h-11 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className={`text-xs text-right ${form.title.length > 80 ? "text-orange-500" : "text-slate-400"}`}>{form.title.length}/100</p>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Deskripsi <span className="text-red-500">*</span>
                  </Label>
                  <textarea
                    rows={4}
                    placeholder="Ceritakan detail masalahnya: kapan mulai terjadi, pesan error yang muncul, dan apa yang sudah dicoba..."
                    className="w-full rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-400"
                    value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                    required
                  />
                  <p className="text-xs text-slate-400 text-right">{form.description.length} karakter</p>
                </div>
              </div>

              {/* ── 2. Jenis Masalah ────────────────────────────────────── */}
              <div className="px-6 py-5 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center shrink-0">2</span>
                  <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Jenis Masalah <span className="text-red-500">*</span></h3>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {categories.map(catName => {
                    const meta = CATEGORY_META[catName] ?? { icon: HelpCircle, color: "text-slate-500", bg: "bg-slate-100" }
                    const IconComp = meta.icon
                    const isSelected = form.category === catName
                    return (
                      <button
                        type="button"
                        key={catName}
                        title={catName}
                        onClick={() => setForm({ ...form, category: catName })}
                        className={`flex items-center gap-2 p-2.5 sm:gap-3 sm:p-3 rounded-xl border-2 text-left transition-all duration-150 min-w-0 ${
                          isSelected
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30"
                            : "border-slate-200 dark:border-zinc-700 hover:border-blue-300 hover:bg-slate-50 dark:hover:bg-zinc-800/60"
                        }`}
                      >
                        <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center shrink-0 ${isSelected ? "bg-blue-100" : meta.bg}`}>
                          <IconComp className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isSelected ? "text-blue-600" : meta.color}`} />
                        </div>
                        <span className={`text-[11px] sm:text-xs font-medium leading-snug truncate flex-1 min-w-0 ${isSelected ? "text-blue-700 dark:text-blue-400" : "text-slate-600 dark:text-slate-300"}`}>
                          {catName}
                        </span>
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 ml-auto shrink-0" />}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* ── 3. Prioritas ─────────────────────────────────────────── */}
              <div className="px-6 py-5 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center shrink-0">3</span>
                  <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Tingkat Urgensi</h3>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {PRIORITIES.map(p => {
                    const IconComp = p.icon
                    const isSelected = form.priority === p.value
                    return (
                      <button
                        type="button"
                        key={p.value}
                        onClick={() => setForm({ ...form, priority: p.value })}
                        className={`flex flex-col items-center gap-1 py-3 px-1 rounded-xl border-2 transition-all duration-150 ${
                          isSelected
                            ? `${p.activeBg} border-transparent text-white shadow-md`
                            : `${p.bg} ${p.border} hover:opacity-80`
                        }`}
                      >
                        <IconComp className={`w-4 h-4 ${isSelected ? "text-white" : "text-slate-600"}`} />
                        <span className={`text-xs font-bold ${isSelected ? "text-white" : "text-slate-700 dark:text-slate-200"}`}>{p.label}</span>
                        <span className={`text-[9px] text-center leading-tight ${isSelected ? "text-white/75" : "text-slate-400"}`}>{p.desc}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* ── 4. Unit Kerja ─────────────────────────────────────────── */}
              <div className="px-6 py-5 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center shrink-0">4</span>
                  <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Unit Kerja</h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5" /> Unit Kerja <span className="text-red-500">*</span>
                    </Label>
                    {refsLoaded ? (
                      <Select
                        value={form.unitKerjaId || ""}
                        onValueChange={v => setForm({ ...form, unitKerjaId: v as string, subUnitKerjaId: "" })}
                      >
                        <SelectTrigger className="w-full h-10 rounded-xl overflow-hidden">
                          <SelectValue placeholder="Pilih unit kerja">
                            {form.unitKerjaId ? refs.units.find(u => u.id === form.unitKerjaId)?.name : undefined}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {refs.units.map(u => (
                            <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Select disabled>
                        <SelectTrigger className="h-10 rounded-xl bg-slate-50 opacity-70">
                          <SelectValue placeholder="Memuat data..." />
                        </SelectTrigger>
                      </Select>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                      <Network className="w-3.5 h-3.5" /> Sub Unit <span className="text-slate-400 font-normal">(opsional)</span>
                    </Label>
                    {refsLoaded ? (
                      <Select
                        value={form.subUnitKerjaId || ""}
                        onValueChange={v => setForm({ ...form, subUnitKerjaId: v as string })}
                        disabled={!form.unitKerjaId || subUnitsForUnit.length === 0}
                      >
                        <SelectTrigger className="w-full h-10 rounded-xl overflow-hidden">
                          <SelectValue placeholder={
                            !form.unitKerjaId ? "Pilih unit dulu"
                            : subUnitsForUnit.length === 0 ? "Tidak ada sub unit"
                            : "Pilih sub unit"
                          }>
                            {form.subUnitKerjaId ? subUnitsForUnit.find(su => su.id === form.subUnitKerjaId)?.name : undefined}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {subUnitsForUnit.map(su => (
                            <SelectItem key={su.id} value={su.id}>{su.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Select disabled>
                        <SelectTrigger className="h-10 rounded-xl bg-slate-50 opacity-70">
                          <SelectValue placeholder="Memuat data..." />
                        </SelectTrigger>
                      </Select>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* ── Sticky Footer ───────────────────────────────────────────── */}
            <div className="shrink-0 px-6 py-4 border-t border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-between gap-3">
              <div className="text-xs">
                {isFormValid ? (
                  <span className="text-green-600 font-medium flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> Siap dikirim
                  </span>
                ) : (
                  <span className="text-slate-400">Lengkapi field bertanda <span className="text-red-500">*</span></span>
                )}
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setCreateOpen(false)} className="rounded-xl px-4">
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || !isFormValid}
                  className="bg-blue-600 hover:bg-blue-700 rounded-xl gap-2 shadow-md shadow-blue-500/20 min-w-[130px]"
                >
                  {isSubmitting
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Mengirim...</>
                    : <><Send className="w-4 h-4" /> Kirim Tiket</>
                  }
                </Button>
              </div>
            </div>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  )
}
