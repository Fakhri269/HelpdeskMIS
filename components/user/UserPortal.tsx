"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import {
  Loader2, Plus, ChevronRight, LogOut, User,
  Ticket, MessageSquare, Home, AlertCircle,
  X, Send, FileText, ChevronLeft
} from "lucide-react"

/* ─────────────────────── CONFIG ─────────────────────── */
const STATUS_CONFIG: Record<string, { label: string; dot: string; badge: string }> = {
  "Open":        { label: "Open",       dot: "bg-cyan-400",   badge: "bg-cyan-400/20 text-cyan-200"   },
  "In Progress": { label: "In Progres", dot: "bg-yellow-400", badge: "bg-yellow-400/20 text-yellow-200"},
  "Pending":     { label: "Pending",    dot: "bg-amber-400",  badge: "bg-amber-400/20 text-amber-200" },
  "Resolved":    { label: "Resolved",   dot: "bg-green-400",  badge: "bg-green-400/20 text-green-200" },
  "Closed":      { label: "Closed",     dot: "bg-gray-400",   badge: "bg-gray-400/20 text-gray-200"   },
}
const PRIORITY_CONFIG: Record<string, { label: string; dot: string; bg: string; time: string }> = {
  "Low":      { label: "Low",      dot: "bg-gray-400",   bg: "bg-gray-500",   time: "72 Jam" },
  "Medium":   { label: "Medium",   dot: "bg-yellow-400", bg: "bg-yellow-600", time: "24 Jam" },
  "High":     { label: "High",     dot: "bg-orange-400", bg: "bg-orange-600", time: "4 Jam"  },
  "Critical": { label: "Critical", dot: "bg-red-400",    bg: "bg-red-600",    time: "1 Jam"  },
}
const DEFAULT_CATEGORIES = [
  "Jaringan & Internet","Hardware (PC/Laptop)","Aplikasi MIS",
  "Email & Akun","Printer & Scanner","Lainnya",
]
const TABS = [
  { id: "Beranda", icon: Home,          label: "Beranda" },
  { id: "Tiket",   icon: Ticket,        label: "Tiket"   },
  { id: "Chat",    icon: MessageSquare, label: "Chat"    },
  { id: "Akun",    icon: User,          label: "Akun"    },
]

/* ─────────────────────── BOTTOM SHEET ─────────────────────── */
function CreateTicketSheet({ open, onClose, onSuccess }: {
  open: boolean; onClose: () => void; onSuccess: () => void
}) {
  const { data: session } = useSession()
  const [refs, setRefs]             = useState<{ units: any[]; subUnits: any[] }>({ units: [], subUnits: [] })
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES)
  const [refsLoaded, setRefsLoaded] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted]   = useState(false)
  const [form, setForm] = useState({
    title: "", description: "", priority: "Medium",
    category: "", unitKerjaId: "", subUnitKerjaId: "",
  })
  const sheetRef = useRef<HTMLDivElement>(null)

  /* Load refs once */
  useEffect(() => {
    if (!refsLoaded) {
      Promise.all([
        fetch("/api/master/reference").then(r => r.json()).catch(() => ({ units:[], subUnits:[] })),
        fetch("/api/master/categories").then(r => r.json()).catch(() => []),
      ]).then(([refData, catData]) => {
        if (refData.units) setRefs(refData)
        if (Array.isArray(catData) && catData.length > 0)
          setCategories(catData.map((c: any) => c.name))
        setRefsLoaded(true)
      })
    }
  }, [refsLoaded])

  /* Auto-set unit from session */
  useEffect(() => {
    if (refsLoaded && session?.user?.unitKerjaId && !form.unitKerjaId) {
      const ok = refs.units.find(u => u.id === session.user?.unitKerjaId)
      if (ok) setForm(p => ({ ...p, unitKerjaId: session.user?.unitKerjaId as string }))
    }
  }, [refsLoaded, refs.units, session, form.unitKerjaId])

  /* Reset on close */
  useEffect(() => {
    if (!open) { setForm({ title:"", description:"", priority:"Medium", category:"", unitKerjaId:"", subUnitKerjaId:"" }); setSubmitted(false) }
  }, [open])

  const isValid = form.title.trim() && form.description.trim() && form.category

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const unitKerjaId = form.unitKerjaId || refs.units[0]?.id || ""
      const res = await fetch("/api/tickets", {
        method: "POST", headers: { "Content-Type":"application/json" },
        body: JSON.stringify({ ...form, unitKerjaId }),
      })
      if (res.ok) {
        setSubmitted(true)
        setTimeout(() => { onSuccess(); onClose() }, 2000)
      } else {
        const err = await res.json()
        alert(err.error || "Terjadi kesalahan")
      }
    } catch { alert("Terjadi kesalahan sistem") }
    finally { setIsSubmitting(false) }
  }

  if (!open) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        ref={sheetRef}
        className="fixed bottom-0 left-0 right-0 z-50 max-h-[92dvh] flex flex-col rounded-t-3xl overflow-hidden shadow-2xl"
        style={{ background: "linear-gradient(160deg, #0d5f82 0%, #1a8fba 60%, #2ba8d4 100%)" }}
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full bg-white/30" />
        </div>

        {/* Header */}
        <div className="shrink-0 px-5 py-4 flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-white font-bold text-base">Buat Laporan</h2>
              <p className="text-white/60 text-[11px]">Isi form di bawah ini</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Success state */}
        {submitted ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 pb-10">
            <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center shadow-[0_0_40px_rgba(34,197,94,0.5)] animate-bounce">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-white font-bold text-lg">Tiket Terkirim!</p>
              <p className="text-white/70 text-sm">Laporan Anda berhasil dibuat.</p>
            </div>
          </div>
        ) : (
          /* Form body — scrollable */
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">

              {/* Kategori */}
              <div>
                <label className="block text-[11px] font-bold text-white/60 uppercase tracking-widest mb-1.5">
                  Kategori <span className="text-red-400">*</span>
                </label>
                <select
                  value={form.category}
                  onChange={e => setForm({ ...form, category: e.target.value })}
                  className="w-full h-11 rounded-xl border border-white/20 bg-white/10 px-3 text-sm text-white focus:ring-2 focus:ring-cyan-400/60 outline-none appearance-none"
                  required
                >
                  <option value="" disabled className="text-slate-800">Pilih kategori...</option>
                  {categories.map(c => <option key={c} value={c} className="text-slate-800">{c}</option>)}
                </select>
              </div>

              {/* Judul */}
              <div>
                <label className="block text-[11px] font-bold text-white/60 uppercase tracking-widest mb-1.5">
                  Judul Masalah <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  placeholder="Contoh: Printer tidak bisa print..."
                  className="w-full h-11 rounded-xl border border-white/20 bg-white/10 px-3 text-sm text-white placeholder:text-white/35 focus:ring-2 focus:ring-cyan-400/60 outline-none"
                  required
                />
              </div>

              {/* Deskripsi */}
              <div>
                <label className="block text-[11px] font-bold text-white/60 uppercase tracking-widest mb-1.5">
                  Detail Kendala <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="Jelaskan secara detail masalah yang dialami..."
                  className="w-full min-h-[110px] p-3 rounded-xl border border-white/20 bg-white/10 text-sm text-white placeholder:text-white/35 focus:ring-2 focus:ring-cyan-400/60 outline-none resize-none"
                  required
                />
              </div>

              {/* Prioritas */}
              <div>
                <label className="block text-[11px] font-bold text-white/60 uppercase tracking-widest mb-2">
                  Prioritas
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {Object.entries(PRIORITY_CONFIG).map(([key, p]) => (
                    <button
                      key={key} type="button"
                      onClick={() => setForm({ ...form, priority: key })}
                      className={`h-10 rounded-xl text-xs font-bold transition-all border ${
                        form.priority === key
                          ? `${p.bg} border-transparent text-white shadow-md`
                          : "bg-white/10 border-white/15 text-white/60 hover:bg-white/15"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Unit Kerja — hanya jika tidak ada di session */}
              {!session?.user?.unitKerjaId && (
                <div>
                  <label className="block text-[11px] font-bold text-white/60 uppercase tracking-widest mb-1.5">
                    Unit Kerja
                  </label>
                  <select
                    value={form.unitKerjaId}
                    onChange={e => setForm({ ...form, unitKerjaId: e.target.value, subUnitKerjaId: "" })}
                    className="w-full h-11 rounded-xl border border-white/20 bg-white/10 px-3 text-sm text-white focus:ring-2 focus:ring-cyan-400/60 outline-none appearance-none"
                  >
                    <option value="" disabled className="text-slate-800">Pilih unit kerja...</option>
                    {refs.units.map(u => <option key={u.id} value={u.id} className="text-slate-800">{u.name}</option>)}
                  </select>
                </div>
              )}
            </div>

            {/* Submit */}
            <div className="shrink-0 px-5 py-4 border-t border-white/10">
              <button
                type="submit"
                disabled={isSubmitting || !isValid}
                className="w-full h-12 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(6,182,212,0.4)] disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] transition-all"
              >
                {isSubmitting
                  ? <><Loader2 className="w-5 h-5 animate-spin" /> Mengirim...</>
                  : <><Send className="w-5 h-5" /> Kirim Tiket Laporan</>
                }
              </button>
            </div>
          </form>
        )}
      </div>
    </>
  )
}

/* ─────────────────────── TICKET DETAIL SHEET ─────────────────────── */
function TicketDetailSheet({ ticket, onClose }: { ticket: any; onClose: () => void }) {
  if (!ticket) return null
  const st = STATUS_CONFIG[ticket.status] ?? STATUS_CONFIG["Open"]
  const pr = PRIORITY_CONFIG[ticket.priority] ?? PRIORITY_CONFIG["Low"]

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed bottom-0 left-0 right-0 z-50 max-h-[85dvh] flex flex-col rounded-t-3xl overflow-hidden shadow-2xl"
        style={{ background: "linear-gradient(160deg, #0d5f82 0%, #1a8fba 60%, #2ba8d4 100%)" }}
      >
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full bg-white/30" />
        </div>
        <div className="shrink-0 px-5 py-4 flex items-center justify-between border-b border-white/10">
          <div>
            <p className="text-white/60 text-[11px] font-mono">{ticket.ticketNumber}</p>
            <h2 className="text-white font-bold text-base leading-tight">{ticket.title}</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition">
            <X className="w-4 h-4 text-white" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${st.badge}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />{st.label}
            </span>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-white`}>
              <span className={`w-1.5 h-1.5 rounded-full ${pr.dot}`} />{ticket.priority}
            </span>
            {ticket.category && (
              <span className="px-3 py-1 rounded-full bg-white/10 text-white text-xs font-medium">{ticket.category}</span>
            )}
          </div>

          {/* Description */}
          <div className="bg-white/10 rounded-xl p-4">
            <p className="text-white/60 text-[11px] font-bold uppercase tracking-wider mb-2">Detail Masalah</p>
            <p className="text-white text-sm leading-relaxed">{ticket.description}</p>
          </div>

          {/* Meta */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/10 rounded-xl p-3">
              <p className="text-white/60 text-[10px] font-bold uppercase tracking-wider mb-1">Dibuat</p>
              <p className="text-white text-xs font-semibold">
                {new Date(ticket.createdAt).toLocaleDateString("id-ID", { day:"2-digit", month:"long", year:"numeric" })}
              </p>
            </div>
            <div className="bg-white/10 rounded-xl p-3">
              <p className="text-white/60 text-[10px] font-bold uppercase tracking-wider mb-1">Petugas</p>
              <p className="text-white text-xs font-semibold">{ticket.assignee?.name ?? "Belum ditugaskan"}</p>
            </div>
            {ticket.unitKerja && (
              <div className="col-span-2 bg-white/10 rounded-xl p-3">
                <p className="text-white/60 text-[10px] font-bold uppercase tracking-wider mb-1">Unit Kerja</p>
                <p className="text-white text-xs font-semibold">{ticket.unitKerja.name}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

/* ─────────────────────── MAIN COMPONENT ─────────────────────── */
export default function UserPortal() {
  const { data: session } = useSession()
  const [activeTab, setActiveTab]         = useState("Beranda")
  const [tickets, setTickets]             = useState<any[]>([])
  const [loading, setLoading]             = useState(true)
  const [createOpen, setCreateOpen]       = useState(false)
  const [selectedTicket, setSelectedTicket] = useState<any>(null)

  const fetchTickets = useCallback(async () => {
    setLoading(true)
    try {
      const res  = await fetch("/api/tickets")
      const data = await res.json()
      if (Array.isArray(data)) setTickets(data)
    } catch { /* silent */ }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchTickets() }, [fetchTickets])

  const openCount     = tickets.filter(t => t.status === "Open").length
  const pendingCount  = tickets.filter(t => t.status === "Pending" || t.status === "In Progress").length
  const resolvedCount = tickets.filter(t => t.status === "Resolved" || t.status === "Closed").length

  const handleTicketClick = async (ticket: any) => {
    /* Fetch full detail if needed */
    try {
      const res  = await fetch(`/api/tickets/${ticket.id}`)
      const data = await res.json()
      setSelectedTicket(data)
    } catch {
      setSelectedTicket(ticket)
    }
  }

  return (
    <div className="relative min-h-[100dvh] w-full bg-white overflow-x-hidden font-sans select-none">

      {/* ══ BACKGROUND DECORATIVE ══ */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 1440 220" preserveAspectRatio="none">
          <path fill="#1e7fa8" fillOpacity="0.08"
            d="M0,160L60,149C120,139,240,117,360,122.7C480,128,600,160,720,160C840,160,960,128,1080,117.3C1200,107,1320,117,1380,122.7L1440,128L1440,320L0,320Z" />
        </svg>
        <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 1440 220" preserveAspectRatio="none">
          <path fill="#2b9cbf" fillOpacity="0.12"
            d="M0,192L80,181C160,171,320,149,480,154.7C640,160,800,192,960,192C1120,192,1280,160,1360,144L1440,128L1440,320L0,320Z" />
        </svg>
      </div>

      {/* ══ HEADER ══ */}
      <header className="relative z-20 w-full bg-gradient-to-r from-[#155f7a] to-[#1e92bf] shadow-lg overflow-hidden">
        <svg className="absolute -bottom-5 left-0 w-full h-6 z-10" viewBox="0 0 1440 60" preserveAspectRatio="none">
          <path fill="white" d="M0,30 C360,60 1080,0 1440,30 L1440,60 L0,60 Z" />
        </svg>
        <div className="px-5 pt-5 pb-9 flex items-center gap-3 relative z-10">
          <Image src="/PdamLogo.svg" alt="Logo PDAM" width={36} height={36} className="h-9 w-auto brightness-0 invert drop-shadow" />
          <span className="text-white font-bold text-[18px] tracking-wide drop-shadow">Helpdesk MIS</span>
        </div>
      </header>

      {/* ══ HERO IMAGE ══ */}
      <div className="relative z-10 w-full h-[175px] sm:h-[230px] overflow-hidden">
        <Image src="/PdamBG.jpg" alt="Gedung PDAM" fill className="object-cover object-center" priority />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/25" />
      </div>

      {/* ══ NAV TABS ══ */}
      <nav className="relative z-20 w-full bg-[#2496bb] shadow-md sticky top-0">
        <div className="flex items-stretch justify-around">
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 text-[12px] font-semibold transition-all relative ${
                activeTab === tab.id ? "text-white" : "text-white/55 hover:text-white/80"
              }`}
            >
              <tab.icon className="w-[18px] h-[18px]" />
              {tab.label}
              {activeTab === tab.id && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-[3px] rounded-full bg-[#16cedc]" />
              )}
            </button>
          ))}
        </div>
      </nav>

      {/* ══ PAGE CONTENT ══ */}
      <main className="relative z-10 w-full max-w-xl mx-auto px-4 pt-5 pb-24 flex flex-col gap-4">

        {/* ── BERANDA ── */}
        {activeTab === "Beranda" && (
          <>
            {/* CTA */}
            <button
              onClick={() => setCreateOpen(true)}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-[#1e7fa8] to-[#2196c4] text-white font-bold text-[14px] rounded-full shadow-[0_4px_22px_rgba(30,127,168,0.5)] hover:shadow-[0_6px_30px_rgba(30,127,168,0.6)] active:scale-[0.97] transition-all"
            >
              <Plus className="w-5 h-5" /> Laporkan Masalah / Buat Tiket
            </button>

            {/* Stat chips */}
            {!loading && tickets.length > 0 && (
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label:"Open",    count:openCount,     cls:"from-cyan-500 to-cyan-600"     },
                  { label:"Diproses",count:pendingCount,  cls:"from-amber-500 to-orange-500"  },
                  { label:"Selesai", count:resolvedCount, cls:"from-green-500 to-emerald-600" },
                ].map(s => (
                  <div key={s.label} className={`flex flex-col items-center py-3 rounded-2xl bg-gradient-to-br ${s.cls} shadow-md text-white`}>
                    <span className="text-2xl font-black">{s.count}</span>
                    <span className="text-[11px] font-semibold opacity-90">{s.label}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Riwayat Laporan */}
            <div className="w-full bg-[#2496bb] rounded-2xl overflow-hidden shadow-xl border border-white/10">
              <div className="px-4 py-3 border-b border-white/15 flex items-center justify-between">
                <h2 className="text-white font-bold text-[13px]">Riwayat Laporan</h2>
                {tickets.length > 3 && (
                  <button onClick={() => setActiveTab("Tiket")} className="flex items-center gap-1 text-white/70 text-[11px] hover:text-white transition">
                    Lihat Semua <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              {loading ? (
                <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 text-white animate-spin" /></div>
              ) : tickets.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-10 text-white/70 text-xs">
                  <AlertCircle className="w-8 h-8 opacity-40" />
                  <span>Belum ada laporan. Klik tombol di atas.</span>
                </div>
              ) : (
                <div className="divide-y divide-white/10">
                  <div className="grid grid-cols-[1fr_1.6fr_auto_auto] gap-2 px-4 py-2 text-white/55 text-[10px] font-semibold uppercase tracking-wider">
                    <span>No. Tiket</span><span>Judul</span><span className="text-center">Status</span><span className="text-center">Prior.</span>
                  </div>
                  {tickets.slice(0, 3).map(ticket => {
                    const st = STATUS_CONFIG[ticket.status] ?? STATUS_CONFIG["Open"]
                    const pr = PRIORITY_CONFIG[ticket.priority] ?? PRIORITY_CONFIG["Low"]
                    return (
                      <div key={ticket.id}>
                        <div className="grid grid-cols-[1fr_1.6fr_auto_auto] gap-2 px-4 py-3 items-center">
                          <span className="text-white text-[11px] font-bold font-mono truncate">{ticket.ticketNumber}</span>
                          <span className="text-white text-[11px] truncate">{ticket.title}</span>
                          <div className="flex justify-center"><span className={`w-3 h-3 rounded-full ${st.dot} shadow`} /></div>
                          <div className="flex justify-center"><span className={`w-3 h-3 rounded-full ${pr.dot} shadow`} /></div>
                        </div>
                        <button
                          onClick={() => handleTicketClick(ticket)}
                          className="w-full text-center text-[11px] text-white/65 pb-3 hover:text-white transition-colors"
                        >
                          Lihat Selengkapnya →
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* INFORMASI Banner */}
            <div className="relative w-full flex items-center justify-center py-4">
              <div className="absolute inset-0 bg-[#155f7a]" style={{ clipPath:"polygon(0 20%, 100% 0%, 100% 80%, 0% 100%)" }} />
              <h2 className="relative z-10 text-white font-extrabold text-[15px] tracking-[0.3em] uppercase">INFORMASI</h2>
            </div>

            {/* Info Status */}
            <div className="w-full bg-[#2496bb] rounded-2xl p-4 shadow-xl border border-white/10">
              <h3 className="text-white font-bold text-[13px] mb-3">Informasi Status</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-2.5 gap-x-4">
                {Object.values(STATUS_CONFIG).map(s => (
                  <div key={s.label} className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${s.dot}`} />
                    <span className="text-white text-[12px] font-medium">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Info Prioritas */}
            <div className="w-full bg-[#2496bb] rounded-2xl p-4 shadow-xl border border-white/10">
              <h3 className="text-white font-bold text-[13px] mb-3">Informasi Prioritas</h3>
              <div className="rounded-xl overflow-hidden border border-white/20">
                <div className="grid grid-cols-4 bg-black/15">
                  {Object.values(PRIORITY_CONFIG).map(p => (
                    <div key={p.label} className="flex items-center justify-center gap-1 py-2.5 border-r border-white/10 last:border-0">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${p.dot}`} />
                      <span className="text-white text-[11px] font-bold">{p.label}</span>
                    </div>
                  ))}
                </div>
                <div className="w-full bg-[#155f7a] py-1.5 text-center border-y border-white/10">
                  <span className="text-white/80 text-[11px] font-semibold tracking-wide">Target Waktu (Jam)</span>
                </div>
                <div className="grid grid-cols-4">
                  {Object.values(PRIORITY_CONFIG).map(p => (
                    <div key={p.label} className={`py-2.5 text-center ${p.bg} border-r border-white/10 last:border-0`}>
                      <span className="text-white text-[12px] font-bold">{p.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* ── TIKET ── */}
        {activeTab === "Tiket" && (
          <>
            <button
              onClick={() => setCreateOpen(true)}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-[#1e7fa8] to-[#2196c4] text-white font-bold text-[14px] rounded-full shadow-[0_4px_22px_rgba(30,127,168,0.5)] active:scale-[0.97] transition-all"
            >
              <Plus className="w-5 h-5" /> Buat Tiket Baru
            </button>
            <div className="w-full bg-[#2496bb] rounded-2xl overflow-hidden shadow-xl border border-white/10">
              <div className="px-4 py-3 border-b border-white/15">
                <h2 className="text-white font-bold text-[13px]">Semua Tiket Saya ({tickets.length})</h2>
              </div>
              {loading ? (
                <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 text-white animate-spin" /></div>
              ) : tickets.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-12 text-white/70 text-xs">
                  <AlertCircle className="w-8 h-8 opacity-40" /><span>Belum ada tiket.</span>
                </div>
              ) : (
                <div className="divide-y divide-white/10">
                  {tickets.map(ticket => {
                    const st = STATUS_CONFIG[ticket.status] ?? STATUS_CONFIG["Open"]
                    const pr = PRIORITY_CONFIG[ticket.priority] ?? PRIORITY_CONFIG["Low"]
                    return (
                      <button
                        key={ticket.id}
                        onClick={() => handleTicketClick(ticket)}
                        className="w-full px-4 py-3.5 flex items-start gap-3 hover:bg-black/10 transition-colors text-left"
                      >
                        <span className={`mt-1 w-2.5 h-2.5 rounded-full shrink-0 ${st.dot}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-[12px] font-bold truncate">{ticket.title}</p>
                          <p className="text-white/55 text-[10px] mt-0.5 font-mono">{ticket.ticketNumber}</p>
                          <p className="text-white/55 text-[10px]">
                            {new Date(ticket.createdAt).toLocaleDateString("id-ID",{day:"2-digit",month:"short",year:"numeric"})}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1.5 shrink-0">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${st.badge}`}>
                            {st.label}
                          </span>
                          <span className={`w-2 h-2 rounded-full ${pr.dot}`} />
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </>
        )}

        {/* ── CHAT ── */}
        {activeTab === "Chat" && (
          <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#2496bb] flex items-center justify-center shadow-lg">
              <MessageSquare className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-[#155f7a] font-bold text-lg">Chat Helpdesk</h3>
              <p className="text-slate-500 text-sm mt-1 max-w-[260px]">Fitur chat dengan tim IT akan segera hadir.</p>
            </div>
            <button
              onClick={() => { setActiveTab("Tiket"); setCreateOpen(true) }}
              className="mt-2 px-6 py-2.5 bg-[#2496bb] text-white text-sm font-semibold rounded-full shadow hover:bg-[#1e7fa8] transition-all"
            >
              Buat Tiket Sekarang
            </button>
          </div>
        )}

        {/* ── AKUN ── */}
        {activeTab === "Akun" && (
          <div className="flex flex-col gap-4">
            <div className="w-full bg-gradient-to-br from-[#155f7a] to-[#2196c4] rounded-2xl p-5 shadow-xl flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center shrink-0 border-2 border-white/30">
                <span className="text-white font-black text-2xl">{(session?.user?.name ?? "U")[0].toUpperCase()}</span>
              </div>
              <div className="min-w-0">
                <p className="text-white font-bold text-base truncate">{session?.user?.name ?? "Pengguna"}</p>
                <p className="text-white/70 text-xs truncate">{session?.user?.email ?? ""}</p>
                <span className="inline-block mt-1.5 px-2.5 py-0.5 bg-white/20 rounded-full text-white text-[10px] font-semibold uppercase tracking-wider">
                  {session?.user?.role ?? "user"}
                </span>
              </div>
            </div>
            {!loading && (
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label:"Total Tiket", count:tickets.length,           cls:"from-[#2496bb] to-[#1e7fa8]"    },
                  { label:"Aktif",       count:openCount+pendingCount,   cls:"from-amber-500 to-orange-500"  },
                  { label:"Selesai",     count:resolvedCount,            cls:"from-green-500 to-emerald-600" },
                ].map(s => (
                  <div key={s.label} className={`flex flex-col items-center py-4 rounded-2xl bg-gradient-to-br ${s.cls} shadow-md text-white`}>
                    <span className="text-3xl font-black">{s.count}</span>
                    <span className="text-[10px] font-semibold opacity-80 text-center leading-tight">{s.label}</span>
                  </div>
                ))}
              </div>
            )}
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-red-500/90 hover:bg-red-600 text-white font-bold text-sm rounded-2xl shadow-lg active:scale-[0.97] transition-all mt-2"
            >
              <LogOut className="w-4 h-4" /> Keluar dari Akun
            </button>
          </div>
        )}
      </main>

      {/* ══ MODALS ══ */}
      <CreateTicketSheet
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSuccess={fetchTickets}
      />
      {selectedTicket && (
        <TicketDetailSheet
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
        />
      )}
    </div>
  )
}
