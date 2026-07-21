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
      <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed bottom-0 left-0 right-0 z-50 max-h-[92dvh] flex flex-col rounded-t-3xl overflow-hidden shadow-2xl"
        style={{ background: "linear-gradient(160deg,#0d5f82 0%,#1a8fba 60%,#2ba8d4 100%)" }}>

        {/* Handle */}
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
      <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed bottom-0 left-0 right-0 z-50 max-h-[88dvh] flex flex-col rounded-t-3xl overflow-hidden shadow-2xl"
        style={{ background: "linear-gradient(160deg,#0d5f82 0%,#1a8fba 60%,#2ba8d4 100%)" }}>

        <div className="flex justify-center pt-3 pb-1 shrink-0">
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
    <div className="-mx-4 -mt-5 -mb-24 flex flex-col h-[calc(100dvh-115px)] bg-[#f4f9fb] relative z-50 animate-in slide-in-from-right-4 duration-300 overflow-hidden">
      
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
    <div className="flex flex-col w-full bg-[#2496bb] rounded-2xl shadow-xl overflow-hidden border border-white/10 mt-2">
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
                className="flex flex-col px-5 py-4 text-left hover:bg-black/5 transition-colors relative"
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="text-white/70 text-[10px] font-bold tracking-wider uppercase">Judul</span>
                  {unreadCount > 0 && (
                    <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-sm">
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
        className="w-full text-center text-[11px] text-white/60 py-2 hover:text-white transition-colors"
      >
        Lihat Selengkapnya →
      </button>
    </div>
  )

  return (
    <div className="relative min-h-[100dvh] w-full bg-white overflow-x-hidden font-sans">

      {/* ══ BG WAVES ══ */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 1440 200" preserveAspectRatio="none">
          <path fill="#1e7fa8" fillOpacity="0.08" d="M0,160L60,149C120,139,240,117,360,122.7C480,128,600,160,720,160C840,160,960,128,1080,117.3C1200,107,1320,117,1380,122.7L1440,128L1440,320L0,320Z" />
        </svg>
        <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 1440 200" preserveAspectRatio="none">
          <path fill="#2b9cbf" fillOpacity="0.13" d="M0,192L80,181C160,171,320,149,480,154.7C640,160,800,192,960,192C1120,192,1280,160,1360,144L1440,128L1440,320L0,320Z" />
        </svg>
      </div>

      {/* ══ HEADER ══ */}
      <header className="relative z-20 w-full bg-gradient-to-r from-[#155f7a] to-[#1e92bf] shadow-lg overflow-hidden">
        <svg className="absolute -bottom-5 left-0 w-full h-6 z-10" viewBox="0 0 1440 60" preserveAspectRatio="none">
          <path fill="white" d="M0,30 C360,60 1080,0 1440,30 L1440,60 L0,60 Z" />
        </svg>
        <div className="px-5 pt-5 pb-9 flex items-center gap-3 relative z-10">
          <Image src="/PdamLogo.svg" alt="Logo PDAM" width={36} height={36} className="h-9 w-auto brightness-0 invert" />
          <span className="text-white font-bold text-[18px] tracking-wide">Helpdesk MIS</span>
        </div>
      </header>

      {/* ══ HERO ══ */}
      <div className="relative z-10 w-full h-[175px] sm:h-[230px] overflow-hidden">
        <Image src="/PdamBG.jpg" alt="Gedung PDAM" fill className="object-cover object-center" priority />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20" />
      </div>

      {/* ══ NAV ══ */}
      <nav className="relative z-20 w-full bg-[#2496bb] shadow-md sticky top-0">
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

      {/* ══ CONTENT ══ */}
      <main className="relative z-10 w-full max-w-xl mx-auto px-4 pt-5 pb-24 flex flex-col gap-4">

        {/* ── BERANDA ── */}
        {activeTab === "Beranda" && (
          <>
            {/* CTA */}
            <button onClick={() => setCreateOpen(true)}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-[#1e7fa8] to-[#2196c4] text-white font-bold text-[14px] rounded-full shadow-[0_4px_22px_rgba(30,127,168,0.5)] hover:shadow-[0_6px_30px_rgba(30,127,168,0.6)] active:scale-[0.97] transition-all">
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
                  <div key={s.label} className="flex flex-col items-center py-3 rounded-2xl bg-white border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.04)]">
                    <span className={`text-[22px] font-black ${s.color} leading-none mb-1`}>{s.count}</span>
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider text-center">{s.label}</span>
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
            <div className="w-full bg-[#2496bb] rounded-2xl p-4 shadow-xl border border-white/10">
              <h3 className="text-white font-bold text-[13px] mb-3">Informasi Status</h3>
              <div className="grid grid-cols-2 gap-y-2.5 gap-x-3">
                {Object.values(STATUS_CONFIG).map(s => (
                  <div key={s.label} className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full shrink-0 ${s.dot}`} />
                    <span className="text-white text-[12px] font-medium">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Info Prioritas */}
            <div className="w-full bg-[#2496bb] rounded-2xl p-4 shadow-xl border border-white/10">
              <h3 className="text-white font-bold text-[13px] mb-3">Informasi Prioritas</h3>
              <div className="rounded-xl overflow-hidden border border-white/20">
                {/* Labels row */}
                <div className="grid grid-cols-4 bg-black/15">
                  {Object.entries(PRIORITY_CONFIG).map(([, p]) => (
                    <div key={p.label} className="flex items-center justify-center gap-1 py-2.5 border-r border-white/10 last:border-0">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${p.dot}`} />
                      <span className="text-white text-[11px] font-bold">{p.label}</span>
                    </div>
                  ))}
                </div>
                {/* Subheader */}
                <div className="w-full bg-[#155f7a] py-1.5 text-center border-y border-white/10">
                  <span className="text-white/80 text-[11px] font-semibold tracking-wide">Target Waktu (Jam)</span>
                </div>
                {/* Time row */}
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
            <button onClick={() => setCreateOpen(true)}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-[#1e7fa8] to-[#2196c4] text-white font-bold text-[14px] rounded-full shadow-[0_4px_22px_rgba(30,127,168,0.5)] active:scale-[0.97] transition-all">
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
                <div>{tickets.map(t => <TicketRow key={t.id} ticket={t} />)}</div>
              )}
            </div>
          </>
        )}

        {/* ── CHAT ── */}
        {activeTab === "Chat" && (
          <ChatTab session={session} tickets={tickets} readCounts={readCounts} markAsRead={markAsRead} />
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
                  {(session?.user as any)?.role ?? "user"}
                </span>
              </div>
            </div>
            {!loading && (
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label:"Total Tiket", count:tickets.length,                     color:"text-[#1e7fa8]" },
                  { label:"Aktif",       count:openCount+inprogCount+pendingCount, color:"text-[#f59e0b]" },
                  { label:"Selesai",     count:resolvedCount,                      color:"text-[#22c55e]" },
                ].map(s => (
                  <div key={s.label} className="flex flex-col items-center py-4 rounded-2xl bg-white border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.04)]">
                    <span className={`text-2xl font-black ${s.color} leading-none mb-1`}>{s.count}</span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center">{s.label}</span>
                  </div>
                ))}
              </div>
            )}
            <button onClick={() => signOut({ callbackUrl: "/login" })}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-red-500/90 hover:bg-red-600 text-white font-bold text-sm rounded-2xl shadow-lg active:scale-[0.97] transition-all mt-2">
              <LogOut className="w-4 h-4" /> Keluar dari Akun
            </button>
          </div>
        )}
      </main>

      {/* ══ MODALS ══ */}
      <CreateTicketSheet open={createOpen} onClose={() => setCreateOpen(false)} onSuccess={fetchTickets} />
      {selectedTicket && <TicketDetailSheet ticket={selectedTicket} onClose={() => setSelectedTicket(null)} />}
    </div>
  )
}
