"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Session } from "next-auth"
import Image from "next/image"
import { signOut } from "next-auth/react"
import {
  Home, Ticket, MessageCircle, User, LogOut,
  Plus, ChevronRight, Loader2, ExternalLink,
  ShieldCheck, Clock3
} from "lucide-react"

// ─── Configs ─────────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<string, { label: string; dot: string; badge: string }> = {
  Open:          { label: "Open",       dot: "bg-green-400",  badge: "bg-green-500/20 text-green-300 border-green-400/40" },
  "In Progress": { label: "In Progres", dot: "bg-yellow-400", badge: "bg-yellow-500/20 text-yellow-300 border-yellow-400/40" },
  Pending:       { label: "Pending",    dot: "bg-orange-400", badge: "bg-orange-500/20 text-orange-300 border-orange-400/40" },
  Resolved:      { label: "Resolved",   dot: "bg-blue-400",   badge: "bg-blue-500/20 text-blue-300 border-blue-400/40" },
  Closed:        { label: "Closed",     dot: "bg-slate-400",  badge: "bg-slate-500/20 text-slate-300 border-slate-400/40" },
}

const PRIORITY_CONFIG: Record<string, { label: string; dot: string; bg: string; target: string; badge: string }> = {
  Low:      { label: "Low",      dot: "bg-slate-400",  bg: "bg-slate-500",  target: "72 Jam", badge: "bg-slate-500/30 text-slate-200 border-slate-400/40" },
  Medium:   { label: "Medium",   dot: "bg-teal-400",   bg: "bg-teal-600",   target: "24 Jam", badge: "bg-teal-500/30 text-teal-200 border-teal-400/40" },
  High:     { label: "High",     dot: "bg-orange-400", bg: "bg-orange-500", target: "4 Jam",  badge: "bg-orange-500/30 text-orange-200 border-orange-400/40" },
  Critical: { label: "Critical", dot: "bg-red-500",    bg: "bg-red-600",    target: "1 Jam",  badge: "bg-red-500/30 text-red-200 border-red-400/40" },
}

type Tab = "beranda" | "tiket" | "chat" | "akun"

interface TicketItem {
  id: string
  ticketNumber: string
  title: string
  status: string
  priority: string
  createdAt: string
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function UserPortal({ session }: { session: Session }) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<Tab>("beranda")
  const [tickets, setTickets] = useState<TicketItem[]>([])
  const [loading, setLoading] = useState(true)

  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/tickets?limit=10")
      if (!res.ok) throw new Error("Failed")
      const data = await res.json()
      setTickets(data.tickets || [])
    } catch {
      setTickets([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchTickets() }, [fetchTickets])

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "beranda", label: "Beranda",  icon: Home },
    { id: "tiket",   label: "Tiket",    icon: Ticket },
    { id: "chat",    label: "Chat",     icon: MessageCircle },
    { id: "akun",    label: "Akun",     icon: User },
  ]

  return (
    <div
      className="min-h-[100dvh] w-full font-sans"
      style={{ background: "linear-gradient(160deg, #0e7fb0 0%, #1aa3c8 50%, #c8ecf5 100%)" }}
    >
      {/* ══ TOP NAVBAR ══ */}
      <header className="sticky top-0 z-30 w-full backdrop-blur-md bg-[#0e7fb0]/80 border-b border-white/10">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 sm:px-8 py-3">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <svg viewBox="0 0 40 20" width="32" height="16" fill="none">
              <path d="M2,12 Q8,4 14,10 Q20,16 26,8 Q32,0 38,6" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
            </svg>
            <span className="text-white font-bold text-base sm:text-lg tracking-wide">Helpdesk MIS</span>
          </div>

          {/* Desktop tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-white/10 rounded-xl p-1">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                  activeTab === id
                    ? "bg-white text-[#0e7fb0] shadow"
                    : "text-white/80 hover:text-white hover:bg-white/10"
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </nav>

          {/* User badge */}
          <div className="hidden sm:flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <span className="text-white text-sm font-medium">{session.user?.name?.split(" ")[0]}</span>
          </div>
        </div>
      </header>

      {/* ══ MAIN CONTENT ══ */}
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-4 sm:py-6">

        {/* ── BERANDA ── */}
        {activeTab === "beranda" && (
          <div className="flex flex-col gap-6">

            {/* Hero + CTA */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {/* Hero Image */}
              <div className="md:col-span-3 relative rounded-2xl overflow-hidden h-48 md:h-56 shadow-xl">
                <Image src="/gedung-pdam.jpg" alt="Gedung PDAM Tirta Kahuripan" fill className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0e7fb0]/80 via-[#0e7fb0]/20 to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <p className="text-white font-bold text-lg drop-shadow">Perumda Air Minum</p>
                  <p className="text-blue-100 text-sm drop-shadow">Tirta Kahuripan — Kabupaten Bogor</p>
                </div>
              </div>

              {/* CTA + Info Card */}
              <div className="md:col-span-2 flex flex-col gap-3">
                <button
                  onClick={() => router.push("/user/create-ticket")}
                  className="flex-1 flex items-center justify-center gap-3 rounded-2xl border-2 border-white/50 bg-white/15 backdrop-blur-sm text-white font-semibold text-sm hover:bg-white/25 active:scale-95 transition-all min-h-[70px] md:min-h-0"
                >
                  <Plus className="w-5 h-5" />
                  Laporkan Masalah / Buat Tiket
                </button>

                {/* Quick Info Status */}
                <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-4 flex-1">
                  <p className="text-white/70 text-xs font-semibold mb-2 uppercase tracking-wider">Status Tiket</p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {Object.entries(STATUS_CONFIG).map(([, val]) => (
                      <div key={val.label} className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${val.dot}`} />
                        <span className="text-white text-xs">{val.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Riwayat Laporan + Prioritas */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Riwayat Laporan */}
              <div className="lg:col-span-2 bg-white/15 backdrop-blur-sm rounded-2xl overflow-hidden shadow">
                <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
                  <h2 className="text-white font-bold text-sm">Riwayat Laporan</h2>
                  <button onClick={() => setActiveTab("tiket")} className="text-cyan-200 text-xs hover:text-white flex items-center gap-1">
                    Lihat Semua <ChevronRight className="w-3 h-3" />
                  </button>
                </div>

                {loading ? (
                  <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 text-white animate-spin" /></div>
                ) : tickets.length === 0 ? (
                  <div className="text-white/60 text-sm text-center py-10">Belum ada laporan yang dibuat.</div>
                ) : (
                  <div className="divide-y divide-white/10">
                    {/* Header */}
                    <div className="grid grid-cols-[1fr_2fr_auto_auto] gap-3 px-5 py-2 text-white/50 text-[10px] uppercase tracking-wider">
                      <span>No. Tiket</span><span>Judul</span><span>Status</span><span>Prioritas</span>
                    </div>
                    {tickets.slice(0, 5).map((ticket) => {
                      const st = STATUS_CONFIG[ticket.status] ?? { label: ticket.status, dot: "bg-gray-400", badge: "" }
                      const pr = PRIORITY_CONFIG[ticket.priority] ?? { label: ticket.priority, dot: "bg-gray-400", badge: "" }
                      return (
                        <button
                          key={ticket.id}
                          onClick={() => router.push(`/user/tickets/${ticket.id}`)}
                          className="w-full grid grid-cols-[1fr_2fr_auto_auto] gap-3 px-5 py-3 items-center hover:bg-white/10 transition-all text-left"
                        >
                          <span className="text-white text-xs font-mono truncate">{ticket.ticketNumber}</span>
                          <span className="text-white/80 text-xs truncate">{ticket.title}</span>
                          <span className={`w-2.5 h-2.5 rounded-full ${st.dot} flex-shrink-0 mx-auto`} />
                          <span className={`w-2.5 h-2.5 rounded-full ${pr.dot} flex-shrink-0 mx-auto`} />
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Informasi Prioritas */}
              <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-5 shadow">
                <h2 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
                  <Clock3 className="w-4 h-4" /> Informasi Prioritas
                </h2>
                <div className="space-y-2.5">
                  {Object.entries(PRIORITY_CONFIG).map(([, val]) => (
                    <div key={val.label} className="flex items-center justify-between bg-white/10 rounded-xl px-3 py-2">
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${val.dot}`} />
                        <span className="text-white text-xs font-semibold">{val.label}</span>
                      </div>
                      <span className="text-white/70 text-xs bg-white/10 px-2 py-0.5 rounded-lg">{val.target}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── TIKET ── */}
        {activeTab === "tiket" && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h1 className="text-white font-bold text-lg">Tiket Saya</h1>
              <button
                onClick={() => router.push("/user/create-ticket")}
                className="flex items-center gap-2 px-4 py-2 bg-white/20 border border-white/30 rounded-xl text-white text-sm font-semibold hover:bg-white/30 transition-all"
              >
                <Plus className="w-4 h-4" /> Buat Tiket Baru
              </button>
            </div>

            <div className="bg-white/15 backdrop-blur-sm rounded-2xl overflow-hidden shadow">
              {loading ? (
                <div className="flex justify-center py-12"><Loader2 className="w-7 h-7 text-white animate-spin" /></div>
              ) : tickets.length === 0 ? (
                <div className="text-white/60 text-sm text-center py-12">Belum ada tiket yang dibuat.</div>
              ) : (
                <div>
                  {/* Header */}
                  <div className="hidden sm:grid grid-cols-[1.5fr_2fr_auto_auto_auto] gap-3 px-5 py-3 text-white/50 text-[10px] uppercase tracking-wider border-b border-white/10">
                    <span>No. Tiket</span><span>Judul</span><span className="text-center">Status</span><span className="text-center">Prioritas</span><span />
                  </div>
                  <div className="divide-y divide-white/10">
                    {tickets.map((ticket) => {
                      const st = STATUS_CONFIG[ticket.status] ?? { label: ticket.status, dot: "bg-gray-400", badge: "" }
                      const pr = PRIORITY_CONFIG[ticket.priority] ?? { label: ticket.priority, dot: "bg-gray-400", badge: "" }
                      return (
                        <button
                          key={ticket.id}
                          onClick={() => router.push(`/user/tickets/${ticket.id}`)}
                          className="w-full px-5 py-4 hover:bg-white/10 transition-all text-left"
                        >
                          {/* Mobile */}
                          <div className="flex items-center justify-between sm:hidden">
                            <div className="flex-1 min-w-0">
                              <div className="text-white font-semibold text-xs font-mono">{ticket.ticketNumber}</div>
                              <div className="text-white/70 text-xs truncate mt-0.5">{ticket.title}</div>
                              <div className="flex items-center gap-2 mt-1.5">
                                <span className={`text-[10px] border px-2 py-0.5 rounded-full ${st.badge}`}>{st.label}</span>
                                <span className={`text-[10px] border px-2 py-0.5 rounded-full ${pr.badge}`}>{pr.label}</span>
                              </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-white/40 flex-shrink-0 ml-3" />
                          </div>
                          {/* Desktop */}
                          <div className="hidden sm:grid grid-cols-[1.5fr_2fr_auto_auto_auto] gap-3 items-center">
                            <span className="text-white text-xs font-mono">{ticket.ticketNumber}</span>
                            <span className="text-white/80 text-xs truncate">{ticket.title}</span>
                            <span className={`text-[10px] border px-2 py-1 rounded-full text-center ${st.badge}`}>{st.label}</span>
                            <span className={`text-[10px] border px-2 py-1 rounded-full text-center ${pr.badge}`}>{pr.label}</span>
                            <ChevronRight className="w-4 h-4 text-white/40" />
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── CHAT ── */}
        {activeTab === "chat" && (
          <div className="flex flex-col items-center justify-center min-h-[50vh] gap-5">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
              <MessageCircle className="w-10 h-10 text-white" />
            </div>
            <div className="text-center">
              <p className="text-white font-bold text-base">Fitur Chat</p>
              <p className="text-white/70 text-sm mt-1">Tersedia di portal utama Helpdesk MIS</p>
            </div>
            <button
              onClick={() => router.push("/dashboard/chat")}
              className="flex items-center gap-2 px-6 py-3 bg-white/20 border border-white/40 rounded-xl text-white text-sm font-semibold hover:bg-white/30 transition-all"
            >
              <ExternalLink className="w-4 h-4" /> Buka Chat
            </button>
          </div>
        )}

        {/* ── AKUN ── */}
        {activeTab === "akun" && (
          <div className="max-w-lg mx-auto flex flex-col gap-4 pt-2">
            <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-6 shadow">
              <div className="flex items-center gap-4 mb-5">
                <div className="w-16 h-16 bg-white/25 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-8 h-8 text-white" />
                </div>
                <div>
                  <p className="text-white font-bold text-base">{session.user?.name ?? "Pengguna"}</p>
                  <p className="text-white/70 text-sm">{session.user?.email}</p>
                  <span className="mt-1.5 inline-block bg-[#1687b5] text-white text-xs px-3 py-0.5 rounded-full capitalize">
                    {(session.user as { role?: string })?.role ?? "user"}
                  </span>
                </div>
              </div>
              <div className="border-t border-white/20 pt-5 space-y-3">
                <div className="flex items-center justify-between bg-white/10 rounded-xl px-4 py-3">
                  <div className="flex items-center gap-2 text-white/70 text-sm">
                    <ShieldCheck className="w-4 h-4" /> Status Akun
                  </div>
                  <span className="text-green-300 text-xs font-semibold">Aktif</span>
                </div>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-500/20 border border-red-400/30 text-red-200 text-sm font-semibold hover:bg-red-500/40 active:scale-95 transition-all"
                >
                  <LogOut className="w-4 h-4" /> Keluar dari Akun
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ══ BOTTOM NAV (Mobile only) ══ */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#0a4f6e]/95 backdrop-blur-md border-t border-white/10">
        <div className="flex items-center justify-around py-2 px-2">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex flex-col items-center gap-1 px-4 py-1.5 rounded-xl transition-all ${
                activeTab === id ? "text-white" : "text-white/50"
              }`}
            >
              <Icon className={`w-5 h-5 transition-all ${activeTab === id ? "scale-110" : ""}`} />
              <span className="text-[10px] font-medium">{label}</span>
              {activeTab === id && <span className="w-1 h-1 rounded-full bg-white absolute -bottom-0.5" />}
            </button>
          ))}
        </div>
      </nav>

      {/* Spacer for mobile bottom nav */}
      <div className="h-16 md:hidden" />
    </div>
  )
}
