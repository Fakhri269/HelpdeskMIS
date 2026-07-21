"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Session } from "next-auth"
import Image from "next/image"
import { signOut } from "next-auth/react"
import {
  Home, Ticket, MessageCircle, User, LogOut,
  Plus, ChevronRight, Loader2,
  Circle, Clock, AlertCircle, CheckCircle2,
  AlertTriangle, ArrowUp, Minus, ArrowDown
} from "lucide-react"

// ─── Configs ─────────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<string, { label: string; dot: string }> = {
  Open:          { label: "Open",       dot: "bg-green-400" },
  "In Progress": { label: "In Progres", dot: "bg-yellow-400" },
  Pending:       { label: "Pending",    dot: "bg-orange-400" },
  Resolved:      { label: "Resolved",   dot: "bg-blue-400" },
  Closed:        { label: "Closed",     dot: "bg-slate-400" },
}

const PRIORITY_CONFIG: Record<string, { label: string; dot: string; bg: string; target: string }> = {
  Low:      { label: "Low",      dot: "bg-slate-400",  bg: "bg-slate-500",  target: "72 Jam" },
  Medium:   { label: "Medium",   dot: "bg-teal-400",   bg: "bg-teal-500",   target: "24 Jam" },
  High:     { label: "High",     dot: "bg-orange-400", bg: "bg-orange-500", target: "4 Jam" },
  Critical: { label: "Critical", dot: "bg-red-500",    bg: "bg-red-600",    target: "1 Jam" },
}

type Tab = "beranda" | "tiket" | "chat" | "akun"

interface Ticket {
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
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)

  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/tickets?limit=5")
      if (!res.ok) throw new Error("Failed")
      const data = await res.json()
      setTickets(data.tickets || [])
    } catch {
      setTickets([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTickets()
  }, [fetchTickets])

  return (
    <div
      className="min-h-[100dvh] max-w-sm mx-auto flex flex-col font-sans relative overflow-x-hidden overflow-y-auto"
      style={{ background: "linear-gradient(180deg, #1a7fa8 0%, #1296c3 35%, #e8f6fb 100%)" }}
    >
      {/* ── TOP NAVBAR ── */}
      <header className="relative z-20 flex items-center gap-2 px-4 py-4">
        <svg viewBox="0 0 40 20" width="36" height="18" fill="none">
          <path d="M2,12 Q8,4 14,10 Q20,16 26,8 Q32,0 38,6" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
        </svg>
        <span className="text-white font-bold text-lg tracking-wide">Helpdesk MIS</span>
      </header>

      {/* ── HERO IMAGE ── */}
      <div className="relative z-10 mx-3 rounded-2xl overflow-hidden h-40 shadow-lg">
        <Image
          src="/gedung-pdam.jpg"
          alt="Gedung PDAM Tirta Kahuripan"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1a7fa8]/60 to-transparent" />
      </div>

      {/* ── TAB NAVIGATION ── */}
      <nav className="relative z-10 mx-3 mt-3">
        <div className="flex gap-0 bg-white/15 backdrop-blur-sm rounded-xl p-1">
          {([
            { id: "beranda", label: "Beranda", icon: Home },
            { id: "tiket",   label: "Tiket",   icon: Ticket },
            { id: "chat",    label: "Chat",     icon: MessageCircle },
            { id: "akun",    label: "Akun",     icon: User },
          ] as { id: Tab; label: string; icon: React.ElementType }[]).map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === id
                  ? "bg-[#1a96c0] text-white shadow"
                  : "text-white/80 hover:text-white"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </nav>

      {/* ── CONTENT ── */}
      <div className="relative z-10 flex-1 flex flex-col pb-6">
        {activeTab === "beranda" && <BerandaTab tickets={tickets} loading={loading} router={router} />}
        {activeTab === "tiket"   && <TiketTab tickets={tickets} loading={loading} router={router} />}
        {activeTab === "chat"    && <ChatTab router={router} />}
        {activeTab === "akun"    && <AkunTab session={session} />}
      </div>
    </div>
  )
}

// ─── BERANDA TAB ─────────────────────────────────────────────────────────────
function BerandaTab({ tickets, loading, router }: { tickets: Ticket[]; loading: boolean; router: ReturnType<typeof useRouter> }) {
  return (
    <div className="flex flex-col gap-4 pt-4">
      {/* Laporkan Button */}
      <div className="mx-3">
        <button
          onClick={() => router.push("/dashboard/tickets")}
          className="w-full py-3.5 rounded-2xl border-2 border-white/60 bg-white/10 backdrop-blur-sm text-white font-semibold text-sm hover:bg-white/20 active:scale-95 transition-all"
        >
          Laporkan Masalah/Buat Tiket
        </button>
      </div>

      {/* Riwayat Laporan */}
      <div className="mx-3">
        <div className="bg-white/15 backdrop-blur-sm rounded-2xl overflow-hidden">
          <div className="px-4 pt-4 pb-2">
            <h2 className="text-white font-bold text-sm">Riwayat Laporan</h2>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 text-white animate-spin" />
            </div>
          ) : tickets.length === 0 ? (
            <div className="text-white/70 text-xs text-center py-8 px-4">
              Belum ada laporan yang dibuat.
            </div>
          ) : (
            <div className="divide-y divide-white/10">
              {tickets.slice(0, 3).map((ticket) => {
                const st = STATUS_CONFIG[ticket.status] ?? { label: ticket.status, dot: "bg-gray-400" }
                const pr = PRIORITY_CONFIG[ticket.priority] ?? { dot: "bg-gray-400" }
                return (
                  <div key={ticket.id} className="px-4 py-3">
                    <div className="grid grid-cols-[1fr_auto_auto] gap-2 items-center text-[10px] text-white/60 mb-1">
                      <span>No. Tiket</span>
                      <span>Status</span>
                      <span>Prioritas</span>
                    </div>
                    <div className="grid grid-cols-[1fr_auto_auto] gap-2 items-center">
                      <div>
                        <div className="text-white font-semibold text-xs truncate">{ticket.ticketNumber}</div>
                        <div className="text-white/70 text-[10px] truncate">{ticket.title}</div>
                      </div>
                      <span className={`w-3 h-3 rounded-full ${st.dot} flex-shrink-0`} />
                      <span className={`w-3 h-3 rounded-full ${pr.dot} flex-shrink-0`} />
                    </div>
                    <button
                      onClick={() => router.push(`/dashboard/tickets/${ticket.id}`)}
                      className="mt-1.5 text-[10px] text-cyan-200 hover:text-white flex items-center gap-0.5"
                    >
                      Lihat Selengkapnya <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Wave Divider + Informasi */}
      <div className="relative mt-2">
        <svg viewBox="0 0 390 60" className="w-full block" preserveAspectRatio="none" style={{ height: 48 }}>
          <path d="M0,30 C80,60 160,0 240,35 C310,65 360,15 390,30 L390,60 L0,60 Z" fill="#1a7fa8" />
          <path d="M0,45 C100,20 200,55 300,35 C350,25 380,45 390,45 L390,60 L0,60 Z" fill="#1687b5" opacity="0.5" />
        </svg>
        <div className="bg-[#1a7fa8]">
          <h2 className="text-white font-extrabold text-lg text-center pb-4 tracking-widest">INFORMASI</h2>

          {/* Informasi Status */}
          <div className="mx-3 mb-3 bg-[#1687b5] rounded-2xl p-4">
            <h3 className="text-white font-bold text-sm mb-3">Informasi Status</h3>
            <div className="grid grid-cols-2 gap-y-2 gap-x-4">
              {Object.entries(STATUS_CONFIG).map(([key, val]) => (
                <div key={key} className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full flex-shrink-0 ${val.dot}`} />
                  <span className="text-white text-xs">{val.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Informasi Prioritas */}
          <div className="mx-3 mb-6 bg-[#1687b5] rounded-2xl p-4">
            <h3 className="text-white font-bold text-sm mb-3">Informasi Prioritas</h3>
            <div className="grid grid-cols-4 gap-2 mb-3">
              {Object.entries(PRIORITY_CONFIG).map(([key, val]) => (
                <div key={key} className={`${val.bg} rounded-lg py-1.5 text-center`}>
                  <span className="text-white text-[10px] font-semibold">{val.label}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-white/20 pt-2">
              <p className="text-white/70 text-[10px] text-center mb-2">Target Waktu (Jam)</p>
              <div className="grid grid-cols-4 gap-2">
                {Object.entries(PRIORITY_CONFIG).map(([key, val]) => (
                  <div key={key} className="bg-[#125f80] rounded-lg py-1.5 text-center">
                    <span className="text-white text-[10px] font-semibold">{val.target}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── TIKET TAB ───────────────────────────────────────────────────────────────
function TiketTab({ tickets, loading, router }: { tickets: Ticket[]; loading: boolean; router: ReturnType<typeof useRouter> }) {
  return (
    <div className="flex flex-col gap-4 pt-4 px-3">
      <button
        onClick={() => router.push("/dashboard/tickets")}
        className="w-full py-3.5 rounded-2xl border-2 border-white/60 bg-white/10 backdrop-blur-sm text-white font-semibold text-sm hover:bg-white/20 active:scale-95 transition-all flex items-center justify-center gap-2"
      >
        <Plus className="w-4 h-4" /> Buat Tiket Baru
      </button>

      <div className="bg-white/15 backdrop-blur-sm rounded-2xl overflow-hidden">
        <div className="px-4 pt-4 pb-2">
          <h2 className="text-white font-bold text-sm">Semua Tiket Saya</h2>
        </div>
        {loading ? (
          <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 text-white animate-spin" /></div>
        ) : tickets.length === 0 ? (
          <div className="text-white/70 text-xs text-center py-8">Belum ada tiket.</div>
        ) : (
          <div className="divide-y divide-white/10">
            {tickets.map((ticket) => {
              const st = STATUS_CONFIG[ticket.status] ?? { label: ticket.status, dot: "bg-gray-400" }
              const pr = PRIORITY_CONFIG[ticket.priority] ?? { dot: "bg-gray-400" }
              return (
                <button
                  key={ticket.id}
                  onClick={() => router.push(`/dashboard/tickets/${ticket.id}`)}
                  className="w-full px-4 py-3 text-left hover:bg-white/10 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="text-white font-semibold text-xs">{ticket.ticketNumber}</div>
                      <div className="text-white/70 text-[10px] truncate">{ticket.title}</div>
                    </div>
                    <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                      <span className={`w-2.5 h-2.5 rounded-full ${st.dot}`} />
                      <span className={`w-2.5 h-2.5 rounded-full ${pr.dot}`} />
                      <ChevronRight className="w-4 h-4 text-white/50" />
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── CHAT TAB ────────────────────────────────────────────────────────────────
function ChatTab({ router }: { router: ReturnType<typeof useRouter> }) {
  return (
    <div className="flex flex-col items-center justify-center flex-1 px-6 pt-12 gap-4">
      <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
        <MessageCircle className="w-8 h-8 text-white" />
      </div>
      <p className="text-white font-semibold text-sm text-center">Fitur Chat Tersedia di Portal Utama</p>
      <button
        onClick={() => router.push("/dashboard/chat")}
        className="px-6 py-2.5 bg-white/20 border border-white/40 rounded-xl text-white text-sm font-semibold hover:bg-white/30 transition-all"
      >
        Buka Chat
      </button>
    </div>
  )
}

// ─── AKUN TAB ────────────────────────────────────────────────────────────────
function AkunTab({ session }: { session: Session }) {
  return (
    <div className="flex flex-col gap-4 pt-4 px-3">
      <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-5">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 bg-white/30 rounded-full flex items-center justify-center">
            <User className="w-7 h-7 text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-sm">{session.user?.name ?? "Pengguna"}</p>
            <p className="text-white/70 text-xs">{session.user?.email}</p>
            <span className="mt-1 inline-block bg-[#1687b5] text-white text-[10px] px-2 py-0.5 rounded-full capitalize">
              {(session.user as { role?: string })?.role ?? "user"}
            </span>
          </div>
        </div>
        <div className="border-t border-white/20 pt-4">
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-500/30 border border-red-400/40 text-white text-sm font-semibold hover:bg-red-500/50 active:scale-95 transition-all"
          >
            <LogOut className="w-4 h-4" /> Keluar
          </button>
        </div>
      </div>
    </div>
  )
}
