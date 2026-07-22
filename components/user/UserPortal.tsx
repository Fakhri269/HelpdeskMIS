"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useSession, signOut } from "next-auth/react"
import { Loader2, Plus, ChevronRight, LogOut, User, Ticket, MessageSquare, Home, AlertCircle, X, Send, FileText, CheckCheck, Clock, ChevronLeft } from "lucide-react"
import Image from "next/image"

/* ─────────────────────── CONFIG ─────────────────────── */
const STATUS_CONFIG: Record<string, { label: string; dot: string; bg: string; text: string }> = {
  "Open":        { label: "Open",       dot: "bg-[#16cedc]", bg: "bg-[#16cedc]",   text: "text-white" },
  "In Progress": { label: "In Progres", dot: "bg-[#f59e0b]", bg: "bg-[#f59e0b]",   text: "text-white" },
  "Pending":     { label: "Pending",    dot: "bg-[#eab308]", bg: "bg-[#eab308]",   text: "text-white" },
  "Resolved":    { label: "Resolved",   dot: "bg-[#22c55e]", bg: "bg-[#22c55e]",   text: "text-white" },
  "Closed":      { label: "Closed",     dot: "bg-[#9ca3af]", bg: "bg-[#9ca3af]",   text: "text-white" },
}

const PRIORITY_CONFIG: Record<string, { label: string; dot: string; bg: string; time: string }> = {
  "Low":      { label: "Low",      dot: "bg-[#9ca3af]", bg: "bg-[#9ca3af]", time: "72 Jam" },
  "Medium":   { label: "Medium",   dot: "bg-[#eab308]", bg: "bg-[#b1b859]", time: "24 Jam" },
  "High":     { label: "High",     dot: "bg-[#f59e0b]", bg: "bg-[#c48647]", time: "4 Jam"  },
  "Critical": { label: "Critical", dot: "bg-[#ef4444]", bg: "bg-[#c45353]", time: "1 Jam"  },
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

/* ─── STATUS BADGE ─── */
function StatusBadge({ status }: { status: string }) {
  const s = STATUS_CONFIG[status] ?? { label: status, dot: "bg-gray-400", bg: "bg-gray-400", text: "text-white" }
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${s.bg} ${s.text} whitespace-nowrap`}>
      {s.label}
    </span>
  )
}

/* ─── PRIORITY BADGE ─── */
function PriorityBadge({ priority }: { priority: string }) {
  const p = PRIORITY_CONFIG[priority] ?? { label: priority, dot: "bg-gray-400", bg: "bg-gray-400", time: "" }
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${p.bg} text-white whitespace-nowrap`}>
      {p.label}
    </span>
  )
}

/* ─────────────────────── CREATE TICKET BOTTOM SHEET ─────────────────────── */
function CreateTicketSheet({ open, onClose, onSuccess }: { open: boolean; onClose: () => void; onSuccess: () => void }) {
  const { data: session } = useSession()
  const [refs, setRefs]             = useState<{ units: any[]; subUnits: any[] }>({ units: [], subUnits: [] })
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES)
  const [refsLoaded, setRefsLoaded] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted]   = useState(false)
  const [form, setForm] = useState({ title: "", description: "", priority: "Medium", category: "", unitKerjaId: "", subUnitKerjaId: "" })

  useEffect(() => {
    if (!refsLoaded) {
      Promise.all([
        fetch("/api/master/reference").then(r => r.json()).catch(() => ({ units: [], subUnits: [] })),
        fetch("/api/master/categories").then(r => r.json()).catch(() => []),
      ]).then(([refData, catData]) => {
        if (refData.units) setRefs(refData)
        if (Array.isArray(catData) && catData.length > 0) setCategories(catData.map((c: any) => c.name))
        setRefsLoaded(true)
      })
    }
  }, [refsLoaded])

  useEffect(() => {
    if (refsLoaded && session?.user?.unitKerjaId && !form.unitKerjaId) {
      const ok = refs.units.find(u => u.id === (session.user as any).unitKerjaId)
      if (ok) setForm(p => ({ ...p, unitKerjaId: (session.user as any).unitKerjaId }))
    }
  }, [refsLoaded, refs.units, session, form.unitKerjaId])

  useEffect(() => {
    if (!open) { setForm({ title: "", description: "", priority: "Medium", category: "", unitKerjaId: "", subUnitKerjaId: "" }); setSubmitted(false) }
  }, [open])

  const isValid = form.title.trim() && form.description.trim() && form.category

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const unitKerjaId = form.unitKerjaId || refs.units[0]?.id || ""
      const res = await fetch("/api/tickets", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, unitKerjaId }),
      })
      if (res.ok) {
        setSubmitted(true)
        setTimeout(() => { onSuccess(); onClose() }, 1800)
      } else {
        const err = await res.json()
        alert(err.error || "Terjadi kesalahan")
        setIsSubmitting(false)
      }
    } catch { alert("Terjadi kesalahan sistem"); setIsSubmitting(false) }
  }

  if (!open) return null

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />
      <div className="fixed bottom-0 left-0 right-0 md:left-1/2 md:-translate-x-1/2 md:bottom-auto md:top-1/2 md:-translate-y-1/2 md:w-full md:max-w-2xl z-50 max-h-[92dvh] md:max-h-[85vh] flex flex-col rounded-t-3xl md:rounded-3xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.4)] animate-in slide-in-from-bottom-[100%] md:slide-in-from-bottom-0 md:zoom-in-95 duration-500 ease-out"
        style={{ background: "linear-gradient(160deg,#0d5f82 0%,#1a8fba 60%,#2ba8d4 100%)" }}>

        {/* Handle */}
        <div className="flex md:hidden justify-center pt-3 pb-1 shrink-0">
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
              <p className="text-white/60 text-[11px]">Laporkan kendala IT Anda</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all">
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {submitted ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 pb-10">
            <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center shadow-[0_0_40px_rgba(34,197,94,0.5)]">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-white font-bold text-lg">Tiket Terkirim!</p>
              <p className="text-white/70 text-sm mt-1">Laporan Anda berhasil dibuat.</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">

              {/* Kategori */}
              <div>
                <label className="block text-[11px] font-bold text-white/60 uppercase tracking-widest mb-1.5">Kategori <span className="text-red-400">*</span></label>
                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                  className="w-full h-11 rounded-xl border border-white/20 bg-white/10 px-3 text-sm text-white focus:ring-2 focus:ring-cyan-400/60 outline-none appearance-none" required>
                  <option value="" disabled className="text-slate-800">Pilih kategori...</option>
                  {categories.map(c => <option key={c} value={c} className="text-slate-800">{c}</option>)}
                </select>
              </div>

              {/* Judul */}
              <div>
                <label className="block text-[11px] font-bold text-white/60 uppercase tracking-widest mb-1.5">Judul Masalah <span className="text-red-400">*</span></label>
                <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                  placeholder="Contoh: Printer tidak bisa print..."
                  className="w-full h-11 rounded-xl border border-white/20 bg-white/10 px-3 text-sm text-white placeholder:text-white/35 focus:ring-2 focus:ring-cyan-400/60 outline-none" required />
              </div>

              {/* Deskripsi */}
              <div>
                <label className="block text-[11px] font-bold text-white/60 uppercase tracking-widest mb-1.5">Detail Kendala <span className="text-red-400">*</span></label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="Jelaskan secara detail masalah yang dialami..."
                  className="w-full min-h-[110px] p-3 rounded-xl border border-white/20 bg-white/10 text-sm text-white placeholder:text-white/35 focus:ring-2 focus:ring-cyan-400/60 outline-none resize-none" required />
              </div>

              {/* Prioritas */}
              <div>
                <label className="block text-[11px] font-bold text-white/60 uppercase tracking-widest mb-2">Prioritas</label>
                <div className="grid grid-cols-4 gap-2">
                  {Object.entries(PRIORITY_CONFIG).map(([key, p]) => (
                    <button key={key} type="button" onClick={() => setForm({ ...form, priority: key })}
                      className={`h-10 rounded-xl text-[11px] font-bold transition-all border ${
                        form.priority === key ? `${p.bg} border-transparent text-white shadow-md` : "bg-white/10 border-white/15 text-white/60 hover:bg-white/15"
                      }`}>
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Unit Kerja — hanya jika tidak ada di session */}
              {!(session?.user as any)?.unitKerjaId && (
                <div>
                  <label className="block text-[11px] font-bold text-white/60 uppercase tracking-widest mb-1.5">Unit Kerja</label>
                  <select value={form.unitKerjaId} onChange={e => setForm({ ...form, unitKerjaId: e.target.value, subUnitKerjaId: "" })}
                    className="w-full h-11 rounded-xl border border-white/20 bg-white/10 px-3 text-sm text-white focus:ring-2 focus:ring-cyan-400/60 outline-none appearance-none">
                    <option value="" disabled className="text-slate-800">Pilih unit kerja...</option>
                    {refs.units.map(u => <option key={u.id} value={u.id} className="text-slate-800">{u.name}</option>)}
                  </select>
                </div>
              )}
            </div>

            {/* Submit */}
            <div className="shrink-0 px-5 py-4 border-t border-white/10">
              <button type="submit" disabled={isSubmitting || !isValid}
                className="w-full h-12 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(6,182,212,0.4)] disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] transition-all">
                {isSubmitting ? <><Loader2 className="w-5 h-5 animate-spin" /> Mengirim...</> : <><Send className="w-5 h-5" /> Kirim Tiket Laporan</>}
              </button>
            </div>
          </form>
        )}
      </div>
    </>
  )
}

/* ─────────────────────── TICKET DETAIL BOTTOM SHEET ─────────────────────── */
function TicketDetailSheet({ ticket, onClose }: { ticket: any; onClose: () => void }) {
  if (!ticket) return null
  const st = STATUS_CONFIG[ticket.status] ?? { label: ticket.status, dot: "bg-gray-400", bg: "bg-gray-400", text: "text-white" }
  const pr = PRIORITY_CONFIG[ticket.priority] ?? { label: ticket.priority, dot: "bg-gray-400", bg: "bg-gray-400", time: "" }

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />
      <div className="fixed bottom-0 left-0 right-0 md:left-1/2 md:-translate-x-1/2 md:bottom-auto md:top-1/2 md:-translate-y-1/2 md:w-full md:max-w-2xl z-50 max-h-[88dvh] md:max-h-[85vh] flex flex-col rounded-t-3xl md:rounded-3xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.4)] animate-in slide-in-from-bottom-[100%] md:slide-in-from-bottom-0 md:zoom-in-95 duration-500 ease-out"
        style={{ background: "linear-gradient(160deg,#0d5f82 0%,#1a8fba 60%,#2ba8d4 100%)" }}>

        <div className="flex md:hidden justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full bg-white/30" />
        </div>

        <div className="shrink-0 px-5 py-4 flex items-start justify-between border-b border-white/10">
          <div className="flex-1 min-w-0 pr-3">
            <p className="text-white/55 text-[11px] font-mono mb-0.5">{ticket.ticketNumber}</p>
            <h2 className="text-white font-bold text-base leading-snug">{ticket.title}</h2>
          </div>
          <button onClick={onClose} className="shrink-0 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition">
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {/* Status + Prioritas badges */}
          <div className="flex flex-wrap gap-2">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold ${st.bg} ${st.text}`}>
              <span className="w-1.5 h-1.5 rounded-full bg-white/70" />Status: {st.label}
            </span>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold ${pr.bg} text-white`}>
              <span className="w-1.5 h-1.5 rounded-full bg-white/70" />Prioritas: {pr.label}
            </span>
            {ticket.category && (
              <span className="px-3 py-1 rounded-lg bg-white/15 text-white text-xs font-medium">{ticket.category}</span>
            )}
          </div>

          {/* SLA info */}
          {ticket.slaDeadline && (
            <div className="bg-white/10 rounded-xl px-4 py-3 flex items-center gap-3">
              <span className="text-white/60 text-xs">⏱ Target Selesai:</span>
              <span className="text-white text-xs font-bold">
                {new Date(ticket.slaDeadline).toLocaleString("id-ID", { day:"2-digit", month:"short", hour:"2-digit", minute:"2-digit" })}
              </span>
            </div>
          )}

          {/* Deskripsi */}
          <div className="bg-white/10 rounded-xl p-4">
            <p className="text-white/55 text-[10px] font-bold uppercase tracking-wider mb-2">Detail Masalah</p>
            <p className="text-white text-sm leading-relaxed">{ticket.description}</p>
          </div>

          {/* Meta grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/10 rounded-xl p-3">
              <p className="text-white/55 text-[10px] font-bold uppercase tracking-wider mb-1">Dibuat</p>
              <p className="text-white text-xs font-semibold">
                {new Date(ticket.createdAt).toLocaleDateString("id-ID", { day:"2-digit", month:"long", year:"numeric" })}
              </p>
            </div>
            <div className="bg-white/10 rounded-xl p-3">
              <p className="text-white/55 text-[10px] font-bold uppercase tracking-wider mb-1">Petugas</p>
              <p className="text-white text-xs font-semibold">{ticket.assignee?.name ?? "Belum ditugaskan"}</p>
            </div>
            {ticket.unitKerja && (
              <div className="col-span-2 bg-white/10 rounded-xl p-3">
                <p className="text-white/55 text-[10px] font-bold uppercase tracking-wider mb-1">Unit Kerja</p>
                <p className="text-white text-xs font-semibold">{ticket.unitKerja.name}</p>
              </div>
            )}
          </div>

          {/* Komentar/riwayat */}
          {ticket.comments && ticket.comments.length > 0 && (
            <div>
              <p className="text-white/55 text-[10px] font-bold uppercase tracking-wider mb-2">Riwayat Aktivitas</p>
              <div className="space-y-2">
                {ticket.comments.map((c: any) => (
                  <div key={c.id} className={`rounded-xl p-3 ${c.isSystem ? "bg-white/5 border border-white/10" : "bg-white/15"}`}>
                    {!c.isSystem && <p className="text-white/60 text-[10px] font-bold mb-1">{c.user?.name ?? "Tim IT"}</p>}
                    <p className="text-white text-xs leading-relaxed">{c.content}</p>
                    <p className="text-white/40 text-[10px] mt-1">
                      {new Date(c.createdAt).toLocaleString("id-ID", { day:"2-digit", month:"short", hour:"2-digit", minute:"2-digit" })}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

/* ─────────────────────── CHAT TAB & CHAT ROOM ─────────────────────── */
function ChatRoom({ session, ticket, onBack }: { session: any, ticket: any, onBack: () => void }) {
  const [messages, setMessages] = useState<any[]>([])
  const [input, setInput] = useState("")
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const fetchChat = useCallback(async () => {
    try {
      const res = await fetch(`/api/tickets/${ticket.id}`)
      if (res.ok) {
        const data = await res.json()
        setMessages(data.comments || [])
      }
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [ticket.id])

  useEffect(() => {
    fetchChat()
    const interval = setInterval(fetchChat, 5000)
    return () => clearInterval(interval)
  }, [fetchChat])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || sending) return
    const msg = input.trim()
    setInput("")
    setSending(true)
    try {
      const res = await fetch(`/api/tickets/${ticket.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: msg }),
      })
      if (res.ok) await fetchChat()
    } catch {
    } finally {
      setSending(false)
    }
  }

  // Negative margins to break out of the main container's padding and fill the white area completely.
  return (
    <div className="-mx-4 -mt-5 -mb-24 md:mx-0 md:mt-0 md:mb-0 flex flex-col h-[calc(100dvh-115px)] md:h-[calc(100vh-140px)] md:min-h-[500px] md:rounded-3xl md:shadow-2xl md:border md:border-white/50 bg-[#f4f9fb] relative z-50 animate-in slide-in-from-right-4 duration-300 overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <Image src="/PdamBG.jpg" alt="Background" fill className="object-cover opacity-[0.03]" />
      </div>

      {/* Header - Glassmorphism */}
      <div className="relative z-10 flex items-center px-4 py-3.5 bg-white/90 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.04)] shrink-0 gap-3 border-b border-white/50">
        <button onClick={onBack} className="w-9 h-9 flex items-center justify-center -ml-2 rounded-full hover:bg-[#16cedc]/10 text-[#155f7a] transition-all">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1e92bf] to-[#155f7a] flex items-center justify-center shrink-0 shadow-md">
           <Image src="/PdamLogo.svg" alt="Logo" width={22} height={22} className="brightness-0 invert" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-extrabold text-[#155f7a] text-[13px] truncate">{ticket.title}</h2>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_5px_#22c55e]" />
            <span className="text-[#155f7a]/70 text-[10px] font-semibold uppercase tracking-wider">{ticket.ticketNumber}</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="relative z-10 flex-1 overflow-y-auto p-4 space-y-4">
        {loading && messages.length === 0 ? (
           <div className="flex justify-center py-10"><Loader2 className="w-7 h-7 text-[#16cedc] animate-spin" /></div>
        ) : messages.length === 0 ? (
           <div className="flex flex-col items-center justify-center h-full gap-3 text-[#155f7a]/40">
             <div className="w-16 h-16 rounded-full bg-[#155f7a]/5 flex items-center justify-center">
               <MessageSquare className="w-7 h-7" />
             </div>
             <p className="text-[11px] font-bold tracking-wide">Mulai percakapan dengan Tim IT</p>
           </div>
        ) : (
           messages.map((msg: any) => {
             const isMe = msg.user?.id === session?.user?.id
             return (
               <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                 <div className={`max-w-[82%] relative ${isMe ? 'pl-8' : 'pr-8'}`}>
                   <div className={`rounded-2xl px-4 py-3 shadow-[0_4px_15px_rgba(0,0,0,0.05)] ${
                     isMe ? 'bg-gradient-to-br from-[#2ba8d4] to-[#1e7fa8] text-white rounded-br-sm' : 
                     msg.isSystem ? 'bg-amber-50 text-amber-900 rounded-bl-sm border border-amber-200/50' :
                     'bg-white text-slate-700 rounded-bl-sm border border-white'
                   }`}>
                     {!isMe && !msg.isSystem && <p className="text-[10px] font-bold text-[#1e92bf] mb-1">{msg.user?.name ?? "Tim IT"}</p>}
                     {msg.isSystem && <div className="flex items-center gap-1.5 text-[9px] uppercase font-bold text-amber-600 mb-1"><AlertCircle className="w-3.5 h-3.5"/> System Note</div>}
                     <p className={`text-[13px] leading-relaxed ${isMe ? 'text-white' : 'text-slate-600'}`}>{msg.content}</p>
                     
                     <div className={`flex items-center gap-1 mt-1.5 text-[9px] font-semibold ${isMe ? 'text-white/70 justify-end' : 'text-slate-400'}`}>
                       {new Date(msg.createdAt).toLocaleTimeString("id-ID", { hour:"2-digit", minute:"2-digit" })}
                       {isMe && <CheckCheck className="w-3.5 h-3.5" />}
                     </div>
                   </div>
                 </div>
               </div>
             )
           })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="relative z-10 shrink-0 p-4 bg-white/90 backdrop-blur-md border-t border-[#155f7a]/10 flex items-end gap-2 pb-6 sm:pb-4">
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ketik pesan Anda..."
          className="flex-1 max-h-28 min-h-[48px] bg-[#f4f9fb] border border-[#155f7a]/10 rounded-2xl px-4 py-3.5 text-[13px] text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#16cedc]/50 focus:bg-white resize-none shadow-inner transition-all"
          rows={1}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(e) }
          }}
        />
        <button type="submit" disabled={!input.trim() || sending} 
          className="w-12 h-12 shrink-0 rounded-full bg-gradient-to-r from-[#1e92bf] to-[#155f7a] flex items-center justify-center text-white shadow-[0_4px_15px_rgba(30,146,191,0.4)] disabled:opacity-50 disabled:shadow-none transition-all active:scale-95">
          {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 ml-1" />}
        </button>
      </form>
    </div>
  )
}

function ChatTab({ session, tickets, readCounts, markAsRead }: { session: any, tickets: any[], readCounts: Record<string, number>, markAsRead: (id: string, count: number) => void }) {
  const [activeTicket, setActiveTicket] = useState<any>(null)
  
  if (activeTicket) {
    return <ChatRoom session={session} ticket={activeTicket} onBack={() => setActiveTicket(null)} />
  }

  return (
    <div className="flex flex-col w-full bg-[#2496bb] rounded-2xl md:rounded-3xl shadow-xl overflow-hidden border border-white/10 mt-2 md:mt-0">
      {tickets.length === 0 ? (
        <div className="p-8 text-center text-white/70 text-sm">Belum ada tiket untuk di-chat.</div>
      ) : (
        <div className="flex flex-col divide-y divide-white/15">
          {tickets.map(t => {
            const totalOthers = t._count?.comments || 0
            const read = readCounts[t.id] || 0
            const unreadCount = Math.max(0, totalOthers - read)
            return (
              <button 
                key={t.id} 
                onClick={() => {
                  markAsRead(t.id, totalOthers)
                  setActiveTicket(t)
                }}
                className="flex flex-col px-5 py-4 text-left hover:bg-black/10 transition-colors relative"
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="text-white/70 text-[10px] font-bold tracking-wider uppercase">Judul</span>
                  {unreadCount > 0 && (
                    <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-sm animate-pulse">
                      {unreadCount} Pesan Baru
                    </span>
                  )}
                </div>
                <span className="text-white text-[14px] font-bold truncate w-full">{t.title}</span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

/* ─────────────────────── MAIN PORTAL ─────────────────────── */
export default function UserPortal() {
  const { data: session } = useSession()
  const [activeTab, setActiveTab]           = useState("Beranda")
  const [tickets, setTickets]               = useState<any[]>([])
  const [loading, setLoading]               = useState(true)
  const [createOpen, setCreateOpen]         = useState(false)
  const [selectedTicket, setSelectedTicket] = useState<any>(null)
  const [loadingDetail, setLoadingDetail]   = useState(false)
  const [readCounts, setReadCounts]         = useState<Record<string, number>>({})

  useEffect(() => {
    const saved = localStorage.getItem("helpdesk_chat_read")
    if (saved) {
      try { setReadCounts(JSON.parse(saved)) } catch {}
    }
  }, [])

  const markAsRead = (ticketId: string, count: number) => {
    setReadCounts(prev => {
      const next = { ...prev, [ticketId]: count }
      localStorage.setItem("helpdesk_chat_read", JSON.stringify(next))
      return next
    })
  }

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

  const handleTicketClick = async (ticket: any) => {
    setLoadingDetail(true)
    setSelectedTicket(ticket) // show basic info instantly
    try {
      const res  = await fetch(`/api/tickets/${ticket.id}`)
      const data = await res.json()
      if (data && !data.error) setSelectedTicket(data)
    } catch { /* keep basic */ }
    finally { setLoadingDetail(false) }
  }

  const openCount     = tickets.filter(t => t.status === "Open").length
  const inprogCount   = tickets.filter(t => t.status === "In Progress").length
  const pendingCount  = tickets.filter(t => t.status === "Pending").length
  const resolvedCount = tickets.filter(t => t.status === "Resolved" || t.status === "Closed").length

  /* ── TABLE ROW ── */
  const TicketRow = ({ ticket }: { ticket: any }) => (
    <div className="border-b border-white/10 last:border-0">
      {/* Header row */}
      <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)_auto_auto] gap-x-3 gap-y-0.5 px-4 pt-2.5">
        <span className="text-white/55 text-[10px] font-semibold uppercase">No. Tiket</span>
        <span className="text-white/55 text-[10px] font-semibold uppercase">Judul</span>
        <span className="text-white/55 text-[10px] font-semibold uppercase text-center">Status</span>
        <span className="text-white/55 text-[10px] font-semibold uppercase text-center">Prioritas</span>
      </div>
      {/* Data row */}
      <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)_auto_auto] gap-x-3 items-center px-4 pb-1">
        <span className="text-white text-[11px] font-bold font-mono truncate">{ticket.ticketNumber}</span>
        <span className="text-white text-[11px] truncate">{ticket.title}</span>
        <StatusBadge status={ticket.status} />
        <PriorityBadge priority={ticket.priority} />
      </div>
      <button
        onClick={() => handleTicketClick(ticket)}
        className="w-full text-center text-[11px] text-white/60 py-2.5 hover:text-white hover:bg-white/5 transition-colors"
      >
        Lihat Selengkapnya →
      </button>
    </div>
  )

  return (
    <div className="relative min-h-[100dvh] w-full bg-[#f4f9fb] flex flex-col md:flex-row overflow-x-hidden font-sans">

      {/* ══ BG WAVES ══ */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <svg className="absolute bottom-0 left-0 w-full opacity-50 md:opacity-100" viewBox="0 0 1440 200" preserveAspectRatio="none">
          <path fill="#1e7fa8" fillOpacity="0.08" d="M0,160L60,149C120,139,240,117,360,122.7C480,128,600,160,720,160C840,160,960,128,1080,117.3C1200,107,1320,117,1380,122.7L1440,128L1440,320L0,320Z" />
        </svg>
        <svg className="absolute bottom-0 left-0 w-full opacity-50 md:opacity-100" viewBox="0 0 1440 200" preserveAspectRatio="none">
          <path fill="#2b9cbf" fillOpacity="0.13" d="M0,192L80,181C160,171,320,149,480,154.7C640,160,800,192,960,192C1120,192,1280,160,1360,144L1440,128L1440,320L0,320Z" />
        </svg>
      </div>

      {/* ══ SIDEBAR (DESKTOP) ══ */}
      <aside className="hidden md:flex flex-col w-[280px] h-[100dvh] sticky top-0 bg-gradient-to-b from-[#155f7a] to-[#2496bb] shadow-xl shrink-0 z-30 relative">
        {/* Subtle dot-grid texture */}
        <div
          className="absolute inset-0 opacity-[0.05] pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(rgba(255,255,255,0.7) 1px, transparent 1px)",
            backgroundSize: "22px 22px",
          }}
        />

        {/* Wave SVG */}
        <svg
          className="absolute top-0 h-full pointer-events-none"
          style={{ right: '-24px', zIndex: 25 }}
          width="26"
          height="100%"
          viewBox="0 0 26 800"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="waveGradUser" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#155f7a" />
              <stop offset="100%" stopColor="#2496bb" />
            </linearGradient>
          </defs>
          <path
            d="M0,0 L14,0 C22,3 26,16 24,45 C22,90 12,115 12,175 C12,235 26,258 24,315 C22,372 10,390 12,455 C14,515 22,538 26,600 L26,800 L0,800 Z"
            fill="url(#waveGradUser)"
          />
        </svg>

        {/* Logo */}
        <div className="flex h-20 items-center px-6 font-bold text-2xl tracking-tight z-10 transition-all">
          <div className="flex items-center justify-center mr-3">
            <Image src="/PdamLogo.svg" alt="PDAM Logo" width={36} height={36} className="drop-shadow-md brightness-0 invert" />
          </div>
          <div className="flex items-center overflow-hidden whitespace-nowrap">
            <span className="text-white font-bold">Helpdesk</span>
            <span className="text-cyan-300 ml-1">.</span>
          </div>
        </div>

        {/* Nav */}
        <div className="flex-1 overflow-y-auto py-6 px-4 z-10 scrollbar-hide space-y-6">
          <div>
            <div className="text-[10px] font-semibold text-white/40 mb-3 uppercase tracking-widest px-3 whitespace-nowrap overflow-hidden transition-all duration-300">Menu Utama</div>
            <nav className="space-y-1">
              {TABS.map(tab => {
                if (tab.id === "Akun") return null;

                const isChat = tab.id === "Chat"
                const unreadChatsCount = isChat ? tickets.reduce((sum, t) => sum + Math.max(0, (t._count?.comments||0) - (readCounts[t.id]||0)), 0) : 0
                const active = activeTab === tab.id
                
                return (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                    className={`group w-full flex items-center justify-between rounded-xl p-2.5 text-sm font-medium transition-all duration-200 ${
                      active
                        ? "bg-white/20 text-white shadow-inner backdrop-blur-sm border border-white/20"
                        : "text-white/65 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center">
                      <tab.icon className={`mr-3 h-5 w-5 transition-transform duration-200 group-hover:scale-110 ${active ? "text-cyan-300" : "text-white/50 group-hover:text-cyan-300"}`} />
                      <span>{tab.label}</span>
                    </div>
                    {isChat && unreadChatsCount > 0 && (
                      <span className="bg-cyan-400/20 text-cyan-100 border border-cyan-300/30 text-[10px] font-bold rounded-full px-2 py-0.5 shadow-sm">
                        {unreadChatsCount}
                      </span>
                    )}
                  </button>
                )
              })}
            </nav>
          </div>
        </div>

        {/* User card */}
        <div className="p-4 z-10">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 border border-white/15 transition-all duration-300">
            <div 
              className="flex items-center space-x-3 mb-3 cursor-pointer hover:bg-white/5 p-1.5 -mx-1.5 rounded-xl transition-colors"
              onClick={() => setActiveTab("Akun")}
            >
              <div className="relative shrink-0">
                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 border-2 border-white/30 shadow-sm flex items-center justify-center">
                  <span className="text-white font-medium text-sm">{(session?.user?.name ?? "U")[0].toUpperCase()}</span>
                </div>
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-white/20"></div>
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-bold text-white truncate">
                  {session?.user?.name}
                </p>
                <p className="text-[11px] font-medium text-white/50 capitalize truncate">
                  {(session?.user as any)?.role?.replace('_', ' ') || "user"}
                </p>
              </div>
            </div>
            <button
              className="w-full flex items-center justify-center gap-2 text-xs h-8 text-white/70 hover:text-white hover:bg-white/15 border border-white/15 rounded-md transition-colors"
              onClick={() => signOut({ callbackUrl: "/login" })}
              title="Keluar"
            >
              <LogOut className="w-3.5 h-3.5" />
              Keluar
            </button>
          </div>
        </div>
      </aside>

      {/* ══ HEADER (MOBILE) ══ */}
      <header className="relative z-20 w-full bg-gradient-to-r from-[#155f7a] to-[#1e92bf] shadow-lg overflow-hidden md:hidden">
        <svg className="absolute -bottom-5 left-0 w-full h-6 z-10" viewBox="0 0 1440 60" preserveAspectRatio="none">
          <path fill="white" d="M0,30 C360,60 1080,0 1440,30 L1440,60 L0,60 Z" />
        </svg>
        <div className="px-5 pt-5 pb-9 flex items-center gap-3 relative z-10">
          <Image src="/PdamLogo.svg" alt="Logo PDAM" width={36} height={36} className="h-9 w-auto brightness-0 invert" />
          <span className="text-white font-bold text-[18px] tracking-wide">Helpdesk MIS</span>
        </div>
      </header>

      {/* ══ HERO (MOBILE) ══ */}
      <div className="relative z-10 w-full h-[175px] sm:h-[230px] overflow-hidden md:hidden">
        <Image src="/PdamBG.jpg" alt="Gedung PDAM" fill className="object-cover object-center" priority />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20" />
      </div>

      {/* ══ NAV (MOBILE) ══ */}
      <nav className="relative z-20 w-full bg-[#2496bb] shadow-md sticky top-0 md:hidden">
        <div className="flex items-stretch justify-around">
          {TABS.map(tab => {
            const isChat = tab.id === "Chat"
            const unreadChatsCount = isChat ? tickets.reduce((sum, t) => {
              const totalOthers = t._count?.comments || 0
              const read = readCounts[t.id] || 0
              return sum + Math.max(0, totalOthers - read)
            }, 0) : 0
            
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 text-[12px] font-semibold transition-all relative ${activeTab === tab.id ? "text-white" : "text-white/55 hover:text-white/80"}`}>
                <div className="relative">
                  <tab.icon className="w-[18px] h-[18px]" />
                  {isChat && unreadChatsCount > 0 && (
                    <span className="absolute -top-1.5 -right-2 min-w-[14px] h-[14px] bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-0.5 shadow-sm">
                      {unreadChatsCount}
                    </span>
                  )}
                </div>
                {tab.label}
                {activeTab === tab.id && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-[3px] rounded-full bg-[#16cedc]" />}
              </button>
            )
          })}
        </div>
      </nav>

      {/* ══ CONTENT AREA (RIGHT ON DESKTOP) ══ */}
      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        
        {/* Desktop Topbar */}
        <div className="hidden md:flex items-center justify-between px-8 py-5 bg-white/70 backdrop-blur-md border-b border-slate-200/50 sticky top-0 z-20">
          <h1 className="text-[#155f7a] font-black text-2xl tracking-tight">
            {TABS.find(t => t.id === activeTab)?.label}
          </h1>
          <div className="flex items-center gap-3">
             <span className="text-slate-500 text-sm font-medium">{new Date().toLocaleDateString("id-ID", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
        </div>

        <main className="flex-1 w-full max-w-xl md:max-w-6xl mx-auto px-4 md:px-8 pt-5 md:pt-8 pb-24 md:pb-12 flex flex-col gap-4 md:gap-6">
          
          {/* ── BERANDA ── */}
          {activeTab === "Beranda" && (
            <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 ease-out space-y-4 md:space-y-6">
              {/* CTA */}
              <button onClick={() => setCreateOpen(true)}
                className="w-full md:max-w-md md:mx-auto flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-[#1e7fa8] to-[#2196c4] text-white font-bold text-[14px] rounded-full shadow-[0_8px_30px_rgba(30,127,168,0.4)] hover:shadow-[0_12px_40px_rgba(30,127,168,0.5)] hover:-translate-y-0.5 active:scale-[0.97] active:translate-y-0 transition-all duration-300">
                <Plus className="w-5 h-5" /> Laporkan Masalah / Buat Tiket
              </button>

            {/* Stat chips */}
            {!loading && tickets.length > 0 && (
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label:"Open",      count:openCount,                   color:"text-[#16cedc]" },
                  { label:"Diproses",  count:inprogCount + pendingCount,  color:"text-[#f59e0b]" },
                  { label:"Selesai",   count:resolvedCount,               color:"text-[#22c55e]" },
                  { label:"Total",     count:tickets.length,              color:"text-[#1e7fa8]" },
                ].map(s => (
                  <div key={s.label} className="flex flex-col items-center py-3 md:py-4 rounded-2xl bg-white/90 backdrop-blur-md border border-white/50 shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300">
                    <span className={`text-[22px] md:text-[28px] font-black ${s.color} leading-none mb-1 md:mb-1.5`}>{s.count}</span>
                    <span className="text-[9px] md:text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center">{s.label}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Riwayat Laporan */}
            <div className="w-full bg-gradient-to-br from-[#2496bb] to-[#1e85a6] rounded-2xl md:rounded-3xl overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-white/10 transition-all duration-300 hover:shadow-[0_12px_40px_rgba(0,0,0,0.16)]">
              <div className="px-5 py-4 border-b border-white/15 flex items-center justify-between bg-white/5">
                <h2 className="text-white font-bold text-[13px] md:text-[14px]">Riwayat Laporan</h2>
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
                  <span>Belum ada laporan. Klik tombol di atas untuk membuat.</span>
                </div>
              ) : (
                <div>{tickets.slice(0, 3).map(t => <TicketRow key={t.id} ticket={t} />)}</div>
              )}
            </div>

            {/* INFORMASI Banner */}
            <div className="relative w-full flex items-center justify-center py-4 mt-1">
              <div className="absolute inset-0 bg-[#155f7a]" style={{ clipPath: "polygon(0 20%, 100% 0%, 100% 80%, 0% 100%)" }} />
              <h2 className="relative z-10 text-white font-extrabold text-[15px] tracking-[0.3em] uppercase">INFORMASI</h2>
            </div>

            {/* Info Status */}
            <div className="w-full bg-gradient-to-br from-[#2496bb] to-[#1e85a6] rounded-2xl md:rounded-3xl p-5 shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-white/10">
              <h3 className="text-white font-bold text-[13px] md:text-[14px] mb-3.5">Informasi Status</h3>
              <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                {Object.values(STATUS_CONFIG).map(s => (
                  <div key={s.label} className="flex items-center gap-2.5">
                    <span className={`w-3.5 h-3.5 rounded-full shrink-0 ${s.dot} shadow-[0_0_8px_rgba(255,255,255,0.3)]`} />
                    <span className="text-white text-[12px] font-medium tracking-wide">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Info Prioritas */}
            <div className="w-full bg-gradient-to-br from-[#2496bb] to-[#1e85a6] rounded-2xl md:rounded-3xl p-5 shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-white/10">
              <h3 className="text-white font-bold text-[13px] md:text-[14px] mb-3.5">Informasi Prioritas</h3>
              <div className="rounded-xl overflow-hidden border border-white/20 shadow-inner">
                {/* Labels row */}
                <div className="grid grid-cols-4 bg-black/20 backdrop-blur-sm">
                  {Object.entries(PRIORITY_CONFIG).map(([, p]) => (
                    <div key={p.label} className="flex flex-col items-center justify-center gap-1.5 py-3 border-r border-white/10 last:border-0">
                      <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${p.dot} shadow-[0_0_6px_rgba(255,255,255,0.4)]`} />
                      <span className="text-white/90 text-[10px] md:text-[11px] font-bold">{p.label}</span>
                    </div>
                  ))}
                </div>
                {/* Subheader */}
                <div className="w-full bg-black/40 py-2 text-center border-y border-white/10">
                  <span className="text-white/80 text-[10px] font-bold tracking-widest uppercase">Target Waktu Maksimal</span>
                </div>
                {/* Time row */}
                <div className="grid grid-cols-4">
                  {Object.values(PRIORITY_CONFIG).map(p => (
                    <div key={p.label} className={`py-3 text-center ${p.bg} border-r border-white/10 last:border-0 bg-opacity-90`}>
                      <span className="text-white text-[12px] md:text-[13px] font-black">{p.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            </div>
          )}

          {/* ── TIKET ── */}
          {activeTab === "Tiket" && (
            <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 ease-out space-y-4 md:space-y-6">
              <button onClick={() => setCreateOpen(true)}
                className="w-full md:max-w-md md:mx-auto flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-[#1e7fa8] to-[#2196c4] text-white font-bold text-[14px] rounded-full shadow-[0_8px_30px_rgba(30,127,168,0.4)] hover:shadow-[0_12px_40px_rgba(30,127,168,0.5)] hover:-translate-y-0.5 active:scale-[0.97] active:translate-y-0 transition-all duration-300">
                <Plus className="w-5 h-5" /> Buat Tiket Baru
              </button>
              <div className="w-full bg-gradient-to-br from-[#2496bb] to-[#1e85a6] rounded-2xl md:rounded-3xl overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-white/10 transition-all duration-300">
                <div className="px-5 py-4 border-b border-white/15 bg-white/5">
                  <h2 className="text-white font-bold text-[13px] md:text-[14px]">Semua Tiket Saya ({tickets.length})</h2>
                </div>
              {loading ? (
                <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 text-white animate-spin" /></div>
              ) : tickets.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-12 text-white/70 text-xs">
                  <AlertCircle className="w-8 h-8 opacity-40" /><span>Belum ada tiket.</span>
                </div>
              ) : (
                <div>{tickets.map(t => <TicketRow key={t.id} ticket={t} />)}</div>
              )}
            </div>
          )}

          {/* ── CHAT ── */}
          {activeTab === "Chat" && (
            <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 ease-out h-full">
              <ChatTab session={session} tickets={tickets} readCounts={readCounts} markAsRead={markAsRead} />
            </div>
          )}

          {/* ── AKUN ── */}
          {activeTab === "Akun" && (
            <div className="flex flex-col gap-4 md:max-w-2xl md:mx-auto w-full animate-in fade-in slide-in-from-bottom-6 duration-700 ease-out">
              <div className="w-full bg-gradient-to-br from-[#155f7a] to-[#2196c4] rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-[0_12px_40px_rgba(21,95,122,0.3)] flex items-center gap-5 md:gap-6 border border-white/10 hover:shadow-[0_16px_50px_rgba(21,95,122,0.4)] transition-all duration-300">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/20 flex items-center justify-center shrink-0 border-2 border-white/30 shadow-inner">
                <span className="text-white font-black text-3xl md:text-4xl">{(session?.user?.name ?? "U")[0].toUpperCase()}</span>
              </div>
              <div className="min-w-0">
                <p className="text-white font-bold text-lg md:text-2xl truncate">{session?.user?.name ?? "Pengguna"}</p>
                <p className="text-white/80 text-sm md:text-base font-mono mt-1 truncate">{session?.user?.email ?? ""}</p>
                <span className="inline-block mt-3 px-3 py-1 bg-white/20 rounded-full text-white text-[11px] font-bold uppercase tracking-widest shadow-sm">
                  {(session?.user as any)?.role ?? "user"}
                </span>
              </div>
            </div>
            {!loading && (
              <div className="grid grid-cols-3 gap-3 md:gap-4 mt-2">
                {[
                  { label:"Total Tiket", count:tickets.length,                     color:"text-[#1e7fa8]" },
                  { label:"Aktif",       count:openCount+inprogCount+pendingCount, color:"text-[#f59e0b]" },
                  { label:"Selesai",     count:resolvedCount,                      color:"text-[#22c55e]" },
                ].map((s, idx) => (
                  <div key={s.label} className="flex flex-col items-center py-5 md:py-6 rounded-2xl md:rounded-3xl bg-white/90 backdrop-blur-md border border-white/50 shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:shadow-[0_16px_40px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300"
                    style={{ animationDelay: `${idx * 100}ms` }}>
                    <span className={`text-3xl md:text-4xl font-black ${s.color} leading-none mb-1.5 md:mb-2`}>{s.count}</span>
                    <span className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-wider text-center">{s.label}</span>
                  </div>
                ))}
              </div>
            )}
            <button onClick={() => signOut({ callbackUrl: "/login" })}
              className="w-full flex items-center justify-center gap-2 py-4 bg-red-500/90 hover:bg-red-600 text-white font-bold text-sm md:text-base rounded-2xl shadow-[0_8px_30px_rgba(239,68,68,0.3)] active:scale-[0.98] transition-all duration-300 mt-4 md:mt-6">
              <LogOut className="w-5 h-5" /> Keluar dari Akun
            </button>
          </div>
        )}
        </main>
      </div>

      {/* ══ MODALS ══ */}
      <CreateTicketSheet open={createOpen} onClose={() => setCreateOpen(false)} onSuccess={fetchTickets} />
      {selectedTicket && <TicketDetailSheet ticket={selectedTicket} onClose={() => setSelectedTicket(null)} />}
    </div>
  )
}
