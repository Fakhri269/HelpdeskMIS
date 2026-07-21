"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Loader2 } from "lucide-react"

// Configuration matching the image EXACTLY
const STATUS_CONFIG: Record<string, { label: string, dot: string }> = {
  "Open": { label: "Open", dot: "bg-[#16cedc]" },
  "In Progress": { label: "In Progres", dot: "bg-[#eab308]" },
  "Pending": { label: "Pending", dot: "bg-[#f59e0b]" },
  "Resolved": { label: "Resolved", dot: "bg-[#22c55e]" },
  "Closed": { label: "Closed", dot: "bg-[#9ca3af]" },
}

const PRIORITY_CONFIG: Record<string, { label: string, dot: string, bg: string, text: string, time: string }> = {
  "Low": { label: "Low", dot: "bg-[#9ca3af]", bg: "bg-[#a6a6a6]", text: "text-white", time: "72 Jam" },
  "Medium": { label: "Medium", dot: "bg-[#eab308]", bg: "bg-[#b1b859]", text: "text-white", time: "24 Jam" },
  "High": { label: "High", dot: "bg-[#f59e0b]", bg: "bg-[#c48647]", text: "text-white", time: "4 Jam" },
  "Critical": { label: "Critical", dot: "bg-[#ef4444]", bg: "bg-[#c45353]", text: "text-white", time: "1 Jam" },
}

export default function UserPortal() {
  const router = useRouter()
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState("Beranda")
  const [tickets, setTickets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchTickets = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/tickets`)
      const data = await res.json()
      if (Array.isArray(data)) setTickets(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTickets()
  }, [fetchTickets])

  return (
    <div className="relative min-h-[100dvh] w-full bg-white overflow-x-hidden font-sans pb-10">
      
      {/* ── BACKGROUND WAVES ── */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Left Dark Blue Wave */}
        <svg className="absolute top-[30%] left-0 w-[40%] h-[70%]" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path d="M0,0 C30,20 60,60 20,100 L0,100 Z" fill="#2b769c" opacity="0.9" />
        </svg>
        {/* Left Teal Wave (behind) */}
        <svg className="absolute top-[25%] left-0 w-[50%] h-[80%]" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path d="M0,0 C50,30 80,70 30,100 L0,100 Z" fill="#75b2ce" opacity="0.6" />
        </svg>
        {/* Right Teal Wave */}
        <svg className="absolute top-[40%] right-0 w-[30%] h-[60%]" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path d="M100,0 C70,30 40,70 80,100 L100,100 Z" fill="#569ebf" opacity="0.8" />
        </svg>
        {/* Bottom Left Dark Blue Wave */}
        <svg className="absolute bottom-0 left-0 w-full h-[15%]" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path d="M0,100 L0,40 C30,20 70,60 100,30 L100,100 Z" fill="#2b769c" opacity="0.9" />
        </svg>
        {/* Bottom Right Light Wave */}
        <svg className="absolute bottom-0 right-0 w-[50%] h-[30%]" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path d="M100,100 L100,20 C60,40 30,80 0,100 Z" fill="#91c4d9" opacity="0.7" />
        </svg>
      </div>

      <div className="relative z-10 flex flex-col items-center">
        
        {/* ── HEADER ── */}
        <div className="w-full relative bg-[#2b769c] pt-5 pb-8 overflow-hidden">
          {/* Header bottom wave */}
          <svg className="absolute bottom-0 left-0 w-full h-8" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0,100 L0,50 C25,0 75,100 100,50 L100,100 Z" fill="#ffffff" />
          </svg>
          <div className="px-5 flex items-center gap-3 relative z-10">
            <Image src="/PdamLogo.svg" alt="Logo PDAM" width={40} height={40} className="w-auto h-8 brightness-0 invert" />
            <h1 className="text-white font-bold text-lg tracking-wide">Helpdesk MIS</h1>
          </div>
        </div>

        {/* ── HERO IMAGE ── */}
        <div className="w-full relative h-[200px] sm:h-[300px] -mt-4 overflow-hidden z-0">
          <Image 
            src="/PdamBG.jpg" 
            alt="Gedung PDAM" 
            fill 
            className="object-cover object-center"
            priority
          />
        </div>

        {/* ── MENU BAR ── */}
        <div className="w-full bg-[#569ebf] px-2 py-2 flex items-center justify-between text-white text-[13px] font-semibold">
          <button 
            onClick={() => setActiveTab("Beranda")}
            className={`px-4 py-1.5 rounded-full transition-all ${activeTab === "Beranda" ? "bg-[#16cedc]" : "hover:bg-white/20"}`}
          >
            Beranda
          </button>
          <button 
            onClick={() => setActiveTab("Tiket")}
            className={`px-4 py-1.5 rounded-full transition-all ${activeTab === "Tiket" ? "bg-[#16cedc]" : "hover:bg-white/20"}`}
          >
            Tiket
          </button>
          <button 
            onClick={() => setActiveTab("Chat")}
            className={`px-4 py-1.5 rounded-full transition-all ${activeTab === "Chat" ? "bg-[#16cedc]" : "hover:bg-white/20"}`}
          >
            Chat
          </button>
          <button 
            onClick={() => setActiveTab("Akun")}
            className={`px-4 py-1.5 rounded-full transition-all ${activeTab === "Akun" ? "bg-[#16cedc]" : "hover:bg-white/20"}`}
          >
            Akun
          </button>
        </div>

        {/* ── CONTENT CONTAINER ── */}
        <div className="w-full max-w-lg px-4 flex flex-col gap-5 mt-6 relative z-10">
          
          {/* Create Ticket Button */}
          <button 
            onClick={() => router.push("/user/create-ticket")}
            className="w-full max-w-[280px] mx-auto py-3 bg-[#569ebf] text-white font-bold text-sm rounded-full shadow-[0_4px_15px_rgba(0,0,0,0.2)] hover:bg-[#4787a6] active:scale-95 transition-all"
          >
            Laporkan Masalah/Buat Tiket
          </button>

          {/* Riwayat Laporan */}
          <div className="w-full bg-[#569ebf]/90 backdrop-blur-md rounded-2xl p-4 shadow-lg border border-white/10 mt-2">
            <h2 className="text-white font-bold text-sm mb-3">Riwayat Laporan</h2>
            
            {loading ? (
              <div className="flex justify-center py-6"><Loader2 className="w-6 h-6 text-white animate-spin" /></div>
            ) : tickets.length === 0 ? (
              <div className="text-white/80 text-xs text-center py-6">Belum ada tiket yang dibuat.</div>
            ) : (
              <div className="space-y-3">
                {tickets.slice(0, 2).map(ticket => {
                  const st = STATUS_CONFIG[ticket.status] ?? STATUS_CONFIG["Open"]
                  const pr = PRIORITY_CONFIG[ticket.priority] ?? PRIORITY_CONFIG["Low"]
                  return (
                    <div key={ticket.id} className="border-b border-white/20 pb-2 last:border-0 last:pb-0">
                      <div className="grid grid-cols-[auto_1fr_auto_auto] gap-x-4 gap-y-1 items-center">
                        {/* Headers */}
                        <span className="text-white/80 text-[10px] font-medium">No. Tiket</span>
                        <span className="text-white/80 text-[10px] font-medium">Judul</span>
                        <span className="text-white/80 text-[10px] font-medium text-center">Status</span>
                        <span className="text-white/80 text-[10px] font-medium text-center">Prioritas</span>
                        
                        {/* Values */}
                        <span className="text-white text-xs font-bold truncate max-w-[100px]">{ticket.ticketNumber}</span>
                        <span className="text-white text-xs font-bold truncate">{ticket.title}</span>
                        <div className="flex justify-center"><span className={`w-3 h-3 rounded-full ${st.dot} shadow-sm`} /></div>
                        <div className="flex justify-center"><span className={`w-3 h-3 rounded-full ${pr.dot} shadow-sm`} /></div>
                      </div>
                      <button 
                        onClick={() => router.push(`/user/tickets/${ticket.id}`)}
                        className="w-full text-center text-[10px] text-white/90 mt-2 hover:text-white transition-colors"
                      >
                        Lihat Selengkapnya &rarr;
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── INFORMASI BANNER ── */}
        <div className="w-full relative mt-8 h-14 flex items-center justify-center">
          {/* Banner Wave Background */}
          <div className="absolute inset-0 w-full h-full bg-[#2b769c]" style={{ clipPath: 'polygon(0 20%, 100% 0, 100% 80%, 0 100%)' }} />
          <h2 className="relative z-10 text-white font-bold text-lg tracking-wider">INFORMASI</h2>
        </div>

        {/* ── INFORMASI STATUS & PRIORITAS ── */}
        <div className="w-full max-w-lg px-4 flex flex-col gap-5 mt-6 relative z-10 pb-20">
          
          {/* Informasi Status */}
          <div className="w-full bg-[#569ebf]/90 backdrop-blur-md rounded-2xl p-4 shadow-lg border border-white/10">
            <h3 className="text-white font-bold text-sm mb-3">Informasi Status</h3>
            <div className="grid grid-cols-3 gap-y-3 gap-x-2">
              {Object.values(STATUS_CONFIG).map(s => (
                <div key={s.label} className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${s.dot} shrink-0`} />
                  <span className="text-white text-[11px] font-medium leading-none">{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Informasi Prioritas */}
          <div className="w-full bg-[#569ebf]/90 backdrop-blur-md rounded-2xl p-4 shadow-lg border border-white/10 overflow-hidden">
            <h3 className="text-white font-bold text-sm mb-3">Informasi Prioritas</h3>
            
            <div className="w-full rounded-lg overflow-hidden border border-white/20">
              {/* Header Row */}
              <div className="grid grid-cols-4 bg-white/10">
                {Object.values(PRIORITY_CONFIG).map(p => (
                  <div key={p.label} className="flex items-center justify-center gap-1.5 py-2 border-r border-white/10 last:border-0">
                    <span className={`w-2 h-2 rounded-full ${p.dot} shrink-0`} />
                    <span className="text-white text-[10px] font-bold">{p.label}</span>
                  </div>
                ))}
              </div>
              
              {/* Middle Row */}
              <div className="w-full bg-[#2b769c]/80 py-1.5 text-center border-y border-white/10">
                <span className="text-white text-[10px] font-medium">Target Waktu (Jam)</span>
              </div>
              
              {/* Bottom Row */}
              <div className="grid grid-cols-4">
                {Object.values(PRIORITY_CONFIG).map(p => (
                  <div key={p.label} className={`py-2 text-center ${p.bg} border-r border-white/10 last:border-0`}>
                    <span className="text-white text-[11px] font-bold">{p.time}</span>
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
