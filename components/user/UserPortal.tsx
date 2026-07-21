"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import {
  Loader2, Plus, ChevronRight, LogOut, User,
  Ticket, MessageSquare, Home, AlertCircle
} from "lucide-react"

/* ─────────────────────────────── CONFIG ─────────────────────────────── */
const STATUS_CONFIG: Record<string, { label: string; dot: string; badge: string }> = {
  "Open":        { label: "Open",      dot: "bg-cyan-400",   badge: "bg-cyan-400/20 text-cyan-300" },
  "In Progress": { label: "In Progres",dot: "bg-yellow-400", badge: "bg-yellow-400/20 text-yellow-300" },
  "Pending":     { label: "Pending",   dot: "bg-amber-400",  badge: "bg-amber-400/20 text-amber-300" },
  "Resolved":    { label: "Resolved",  dot: "bg-green-400",  badge: "bg-green-400/20 text-green-300" },
  "Closed":      { label: "Closed",    dot: "bg-gray-400",   badge: "bg-gray-400/20 text-gray-300" },
}

const PRIORITY_CONFIG: Record<string, { label: string; dot: string; bg: string; time: string }> = {
  "Low":      { label: "Low",      dot: "bg-gray-400",   bg: "bg-gray-500",   time: "72 Jam" },
  "Medium":   { label: "Medium",   dot: "bg-yellow-400", bg: "bg-yellow-600", time: "24 Jam" },
  "High":     { label: "High",     dot: "bg-orange-400", bg: "bg-orange-600", time: "4 Jam"  },
  "Critical": { label: "Critical", dot: "bg-red-400",    bg: "bg-red-600",    time: "1 Jam"  },
}

const TABS = [
  { id: "Beranda", icon: Home,          label: "Beranda" },
  { id: "Tiket",   icon: Ticket,        label: "Tiket"   },
  { id: "Chat",    icon: MessageSquare, label: "Chat"    },
  { id: "Akun",    icon: User,          label: "Akun"    },
]

/* ─────────────────────────────── COMPONENT ─────────────────────────────── */
export default function UserPortal() {
  const router  = useRouter()
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState("Beranda")
  const [tickets, setTickets]     = useState<any[]>([])
  const [loading, setLoading]     = useState(true)

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

  /* Count badges */
  const openCount     = tickets.filter(t => t.status === "Open").length
  const pendingCount  = tickets.filter(t => t.status === "Pending" || t.status === "In Progress").length
  const resolvedCount = tickets.filter(t => t.status === "Resolved" || t.status === "Closed").length

  return (
    <div className="relative min-h-[100dvh] w-full bg-white overflow-x-hidden font-sans select-none">

      {/* ══════════════ DECORATIVE WAVES (background) ══════════════ */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <svg className="absolute -bottom-4 left-0 w-full" viewBox="0 0 1440 320" preserveAspectRatio="none">
          <path fill="#1e7fa8" fillOpacity="0.12"
            d="M0,192L48,186.7C96,181,192,171,288,181.3C384,192,480,224,576,213.3C672,203,768,149,864,149.3C960,149,1056,203,1152,213.3C1248,224,1344,192,1392,176L1440,160L1440,320L0,320Z" />
        </svg>
        <svg className="absolute -bottom-4 left-0 w-full" viewBox="0 0 1440 320" preserveAspectRatio="none">
          <path fill="#2b9cbf" fillOpacity="0.2"
            d="M0,256L60,240C120,224,240,192,360,192C480,192,600,224,720,224C840,224,960,192,1080,181.3C1200,171,1320,181,1380,186.7L1440,192L1440,320L0,320Z" />
        </svg>
        {/* Side accent left */}
        <div className="absolute top-[35%] -left-16 w-40 h-64 bg-[#1e7fa8] opacity-[0.07] rounded-full blur-2xl" />
        {/* Side accent right */}
        <div className="absolute top-[55%] -right-16 w-40 h-64 bg-[#16cedc] opacity-[0.07] rounded-full blur-2xl" />
      </div>

      {/* ══════════════ HEADER ══════════════ */}
      <header className="relative z-20 w-full bg-gradient-to-r from-[#1a6e97] to-[#2196c4] shadow-lg">
        {/* Wave bottom of header */}
        <svg className="absolute -bottom-5 left-0 w-full h-6 z-10" viewBox="0 0 1440 60" preserveAspectRatio="none">
          <path fill="white" d="M0,30 C360,60 1080,0 1440,30 L1440,60 L0,60 Z" />
        </svg>
        <div className="px-5 pt-5 pb-9 flex items-center gap-3">
          <Image src="/PdamLogo.svg" alt="Logo PDAM" width={36} height={36} className="h-9 w-auto brightness-0 invert drop-shadow" />
          <span className="text-white font-bold text-[18px] tracking-wide drop-shadow">Helpdesk MIS</span>
        </div>
      </header>

      {/* ══════════════ HERO IMAGE ══════════════ */}
      <div className="relative z-10 w-full h-[180px] sm:h-[240px] overflow-hidden shadow-md">
        <Image src="/PdamBG.jpg" alt="Gedung PDAM" fill className="object-cover object-center" priority />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20" />
      </div>

      {/* ══════════════ NAV TAB BAR ══════════════ */}
      <nav className="relative z-20 w-full bg-[#2b9cbf] shadow-md">
        <div className="flex items-center justify-around px-2">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-3 text-[13px] font-semibold transition-all relative ${
                activeTab === tab.id ? "text-white" : "text-white/65 hover:text-white"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {activeTab === tab.id && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-[3px] rounded-full bg-[#16cedc]" />
              )}
            </button>
          ))}
        </div>
      </nav>

      {/* ══════════════ PAGE CONTENT ══════════════ */}
      <main className="relative z-10 w-full max-w-xl mx-auto px-4 pt-6 pb-24 flex flex-col gap-5">

        {/* ── TAB: BERANDA ── */}
        {activeTab === "Beranda" && (
          <>
            {/* CTA Button */}
            <button
              onClick={() => router.push("/user/create-ticket")}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-[#1e7fa8] to-[#2196c4] text-white font-bold text-[14px] rounded-full shadow-[0_4px_20px_rgba(30,127,168,0.45)] hover:shadow-[0_6px_28px_rgba(30,127,168,0.55)] active:scale-[0.97] transition-all"
            >
              <Plus className="w-5 h-5" />
              Laporkan Masalah / Buat Tiket
            </button>

            {/* Summary Chips */}
            {!loading && tickets.length > 0 && (
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Open",       count: openCount,     color: "from-cyan-500 to-cyan-600"    },
                  { label: "Diproses",   count: pendingCount,  color: "from-amber-500 to-orange-500" },
                  { label: "Selesai",    count: resolvedCount, color: "from-green-500 to-emerald-600" },
                ].map(s => (
                  <div key={s.label} className={`flex flex-col items-center justify-center py-3 rounded-2xl bg-gradient-to-br ${s.color} shadow-md text-white`}>
                    <span className="text-2xl font-black">{s.count}</span>
                    <span className="text-[11px] font-semibold opacity-90 mt-0.5">{s.label}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Riwayat Laporan Card */}
            <div className="w-full bg-[#2b9cbf] rounded-2xl overflow-hidden shadow-xl border border-white/10">
              <div className="px-4 py-3 border-b border-white/15 flex items-center justify-between">
                <h2 className="text-white font-bold text-[13px]">Riwayat Laporan</h2>
                {tickets.length > 2 && (
                  <button onClick={() => setActiveTab("Tiket")} className="flex items-center gap-1 text-white/80 text-[11px] hover:text-white transition">
                    Lihat Semua <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {loading ? (
                <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 text-white animate-spin" /></div>
              ) : tickets.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-10 text-white/70 text-xs">
                  <AlertCircle className="w-8 h-8 opacity-40" />
                  Belum ada tiket. Klik tombol di atas untuk membuat laporan.
                </div>
              ) : (
                <div className="divide-y divide-white/10">
                  {/* Table Header */}
                  <div className="grid grid-cols-[1fr_1.6fr_auto_auto] gap-2 px-4 py-2 text-white/60 text-[10px] font-semibold uppercase tracking-wider">
                    <span>No. Tiket</span><span>Judul</span><span className="text-center">Status</span><span className="text-center">Prior.</span>
                  </div>
                  {tickets.slice(0, 3).map(ticket => {
                    const st = STATUS_CONFIG[ticket.status] ?? STATUS_CONFIG["Open"]
                    const pr = PRIORITY_CONFIG[ticket.priority] ?? PRIORITY_CONFIG["Low"]
                    return (
                      <div key={ticket.id} className="group">
                        <div className="grid grid-cols-[1fr_1.6fr_auto_auto] gap-2 px-4 py-3 items-center">
                          <span className="text-white text-[11px] font-bold font-mono truncate">{ticket.ticketNumber}</span>
                          <span className="text-white text-[11px] truncate">{ticket.title}</span>
                          <div className="flex justify-center"><span className={`w-3 h-3 rounded-full ${st.dot} shadow`} /></div>
                          <div className="flex justify-center"><span className={`w-3 h-3 rounded-full ${pr.dot} shadow`} /></div>
                        </div>
                        <button
                          onClick={() => router.push(`/user/tickets/${ticket.id}`)}
                          className="w-full text-center text-[11px] text-white/70 pb-2.5 hover:text-white transition-colors"
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
            <div className="relative w-full flex items-center justify-center py-4 mt-2">
              <div className="absolute inset-0 bg-[#1a6e97]" style={{ clipPath: "polygon(0 18%, 100% 0%, 100% 82%, 0% 100%)" }} />
              <h2 className="relative z-10 text-white font-extrabold text-base tracking-[0.25em] uppercase">INFORMASI</h2>
            </div>

            {/* Informasi Status */}
            <div className="w-full bg-[#2b9cbf] rounded-2xl p-4 shadow-xl border border-white/10">
              <h3 className="text-white font-bold text-[13px] mb-3">Informasi Status</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-2.5 gap-x-4">
                {Object.values(STATUS_CONFIG).map(s => (
                  <div key={s.label} className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${s.dot} shadow-sm`} />
                    <span className="text-white text-[12px] font-medium">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Informasi Prioritas */}
            <div className="w-full bg-[#2b9cbf] rounded-2xl p-4 shadow-xl border border-white/10">
              <h3 className="text-white font-bold text-[13px] mb-3">Informasi Prioritas</h3>
              <div className="rounded-xl overflow-hidden border border-white/20">
                {/* Header row */}
                <div className="grid grid-cols-4 bg-black/15">
                  {Object.values(PRIORITY_CONFIG).map(p => (
                    <div key={p.label} className="flex items-center justify-center gap-1.5 py-2.5 border-r border-white/10 last:border-0">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${p.dot}`} />
                      <span className="text-white text-[11px] font-bold">{p.label}</span>
                    </div>
                  ))}
                </div>
                {/* Middle label */}
                <div className="w-full bg-[#1a6e97] py-1.5 text-center border-y border-white/10">
                  <span className="text-white/90 text-[11px] font-semibold tracking-wide">Target Waktu (Jam)</span>
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

        {/* ── TAB: TIKET ── */}
        {activeTab === "Tiket" && (
          <>
            <button
              onClick={() => router.push("/user/create-ticket")}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-[#1e7fa8] to-[#2196c4] text-white font-bold text-[14px] rounded-full shadow-[0_4px_20px_rgba(30,127,168,0.45)] active:scale-[0.97] transition-all"
            >
              <Plus className="w-5 h-5" /> Buat Tiket Baru
            </button>

            <div className="w-full bg-[#2b9cbf] rounded-2xl overflow-hidden shadow-xl border border-white/10">
              <div className="px-4 py-3 border-b border-white/15">
                <h2 className="text-white font-bold text-[13px]">Semua Tiket Saya</h2>
              </div>
              {loading ? (
                <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 text-white animate-spin" /></div>
              ) : tickets.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-12 text-white/70 text-xs">
                  <AlertCircle className="w-8 h-8 opacity-40" />
                  Belum ada tiket yang dibuat.
                </div>
              ) : (
                <div className="divide-y divide-white/10">
                  <div className="grid grid-cols-[1fr_1.6fr_auto_auto] gap-2 px-4 py-2 text-white/60 text-[10px] font-semibold uppercase tracking-wider">
                    <span>No. Tiket</span><span>Judul</span><span className="text-center">Status</span><span className="text-center">Prior.</span>
                  </div>
                  {tickets.map(ticket => {
                    const st = STATUS_CONFIG[ticket.status] ?? STATUS_CONFIG["Open"]
                    const pr = PRIORITY_CONFIG[ticket.priority] ?? PRIORITY_CONFIG["Low"]
                    return (
                      <button
                        key={ticket.id}
                        onClick={() => router.push(`/user/tickets/${ticket.id}`)}
                        className="w-full grid grid-cols-[1fr_1.6fr_auto_auto] gap-2 px-4 py-3.5 items-center hover:bg-black/10 transition-colors text-left"
                      >
                        <span className="text-white text-[11px] font-bold font-mono truncate">{ticket.ticketNumber}</span>
                        <div>
                          <p className="text-white text-[11px] font-semibold truncate">{ticket.title}</p>
                          <p className="text-white/60 text-[10px] mt-0.5">{new Date(ticket.createdAt).toLocaleDateString("id-ID", { day:"2-digit", month:"short", year:"numeric" })}</p>
                        </div>
                        <div className="flex justify-center">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${st.badge}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />{st.label}
                          </span>
                        </div>
                        <div className="flex justify-center"><span className={`w-3 h-3 rounded-full ${pr.dot}`} /></div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </>
        )}

        {/* ── TAB: CHAT ── */}
        {activeTab === "Chat" && (
          <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#2b9cbf] flex items-center justify-center shadow-lg">
              <MessageSquare className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-[#1a6e97] font-bold text-lg">Chat Helpdesk</h3>
              <p className="text-slate-500 text-sm mt-1 max-w-[260px]">Fitur chat dengan tim IT akan segera hadir. Gunakan tiket untuk sementara.</p>
            </div>
            <button
              onClick={() => setActiveTab("Tiket")}
              className="mt-2 px-6 py-2.5 bg-[#2b9cbf] text-white text-sm font-semibold rounded-full shadow hover:bg-[#1e7fa8] transition-all"
            >
              Buat Tiket Sekarang
            </button>
          </div>
        )}

        {/* ── TAB: AKUN ── */}
        {activeTab === "Akun" && (
          <div className="flex flex-col gap-4">
            {/* Profile Card */}
            <div className="w-full bg-gradient-to-br from-[#1e7fa8] to-[#2196c4] rounded-2xl p-5 shadow-xl flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center shrink-0 border-2 border-white/30">
                <span className="text-white font-black text-2xl">
                  {(session?.user?.name ?? "U")[0].toUpperCase()}
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-white font-bold text-base truncate">{session?.user?.name ?? "Pengguna"}</p>
                <p className="text-white/70 text-xs truncate">{session?.user?.email ?? ""}</p>
                <span className="inline-block mt-1.5 px-2.5 py-0.5 bg-white/20 rounded-full text-white text-[10px] font-semibold uppercase tracking-wider">
                  {session?.user?.role ?? "user"}
                </span>
              </div>
            </div>

            {/* Stats */}
            {!loading && (
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Total Tiket",   count: tickets.length,    color: "from-[#2b9cbf] to-[#1e7fa8]" },
                  { label: "Aktif",         count: openCount + pendingCount, color: "from-amber-500 to-orange-500" },
                  { label: "Selesai",       count: resolvedCount,     color: "from-green-500 to-emerald-600" },
                ].map(s => (
                  <div key={s.label} className={`flex flex-col items-center justify-center py-4 rounded-2xl bg-gradient-to-br ${s.color} shadow-md text-white`}>
                    <span className="text-3xl font-black">{s.count}</span>
                    <span className="text-[10px] font-semibold opacity-80 mt-0.5 text-center leading-tight">{s.label}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Logout */}
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-red-500/90 hover:bg-red-600 text-white font-bold text-sm rounded-2xl shadow-lg active:scale-[0.97] transition-all mt-2"
            >
              <LogOut className="w-4 h-4" /> Keluar dari Akun
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
