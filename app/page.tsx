"use client"

import Link from "next/link"
import Image from "next/image"
import { useState, useEffect, useRef } from "react"
import {
  TicketCheck, MessageCircle, Bell, ShieldCheck,
  ChevronRight, Clock, BarChart3, BookOpen,
  Zap, Users, CheckCircle2, ArrowRight, Menu, X
} from "lucide-react"

const BLOB_PATHS = [
  "M9.4 0.6 C13.8 4.3 19.6 10.8 17.9 16.3 C16.9 19.6 13.1 22.4 9.8 23.6 C7.6 24.4 4.6 24.8 2.8 22.6 C0.9 20.2 1.4 15.9 3.1 12.2 C4.9 8.2 7.1 3.8 9.4 0.6 Z",
  "M8.3 0.9 C10.5 3 15.9 7.8 18.1 12.9 C19.7 16.7 18.3 20.1 14.6 22.3 C11.6 24.1 8 24.6 5.6 22.4 C2.6 19.7 0.7 15.4 2.1 11.1 C3.4 7.1 6 3.4 8.3 0.9 Z",
  "M10.6 1.1 C14 4.9 17.1 10.5 15.6 15.6 C14.6 19 11 22.9 7.3 22.5 C4.4 22.2 1.8 19.4 1.5 15.8 C1.1 11.6 3.4 6.4 6.9 3.1 C8.1 2 9.4 1.4 10.6 1.1 Z",
]

function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

function dropVariant(seed: number) {
  const path = BLOB_PATHS[Math.floor(seededRandom(seed) * BLOB_PATHS.length) % BLOB_PATHS.length]
  const rotation = Math.round((seededRandom(seed + 1) - 0.5) * 50)
  return { path, rotation }
}

type Droplet = { id: number; x: number; y: number; size: number; duration: number }

const FEATURES = [
  {
    icon: TicketCheck,
    title: "Sistem Tiket Terpusat",
    desc: "Ajukan, lacak, dan selesaikan keluhan IT dalam satu platform terpadu. Setiap tiket tercatat rapi dan real-time.",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: MessageCircle,
    title: "Live Chat Langsung",
    desc: "Komunikasi langsung dengan tim helpdesk IT tanpa harus keluar dari aplikasi. Respon cepat, masalah cepat teratasi.",
    color: "from-cyan-500 to-teal-500",
  },
  {
    icon: Bell,
    title: "Notifikasi Real-Time",
    desc: "Dapatkan pembaruan status tiket secara instan. Admin langsung tahu saat ada tiket baru masuk.",
    color: "from-indigo-500 to-blue-500",
  },
  {
    icon: Clock,
    title: "Manajemen SLA",
    desc: "Pantau batas waktu penyelesaian tiket berdasarkan prioritas. Tidak ada tiket yang terlewat atau terlupakan.",
    color: "from-sky-500 to-cyan-400",
  },
  {
    icon: BookOpen,
    title: "FAQ & Knowledge Base",
    desc: "Temukan jawaban dari pertanyaan umum IT secara mandiri tanpa perlu menunggu respon tim helpdesk.",
    color: "from-teal-500 to-emerald-500",
  },
  {
    icon: BarChart3,
    title: "Laporan & Analitik",
    desc: "Monitor performa helpdesk secara menyeluruh dengan statistik tiket, waktu respon, dan produktivitas tim.",
    color: "from-blue-600 to-indigo-500",
  },
]

const STATS = [
  { value: "99%", label: "Uptime Sistem" },
  { value: "<10 dtk", label: "Notifikasi Tiket Baru" },
  { value: "1 Jam", label: "Link Reset Password" },
  { value: "24/7", label: "Akses Kapan Saja" },
]

export default function LandingPage() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [visible, setVisible] = useState(false)
  const [droplets, setDroplets] = useState<Droplet[]>([])
  const lastDropRef = useRef(0)

  useEffect(() => {
    setVisible(true)
    const onScroll = () => setScrolled(window.scrollY > 30)
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    const now = performance.now()
    if (now - lastDropRef.current < 90) return
    lastDropRef.current = now
    const id = now + Math.random()
    const size = 7 + Math.random() * 6
    const duration = 700 + Math.random() * 400
    setDroplets(prev => [...prev.slice(-12), { id, x, y, size, duration }])
    setTimeout(() => setDroplets(prev => prev.filter(d => d.id !== id)), duration + 50)
  }

  return (
    <div className="min-h-screen w-full relative overflow-x-hidden bg-[#F4FAFB] font-sans selection:bg-cyan-600 selection:text-white">

      {/* ══ KEYFRAMES ══ */}
      <style jsx global>{`
        @keyframes float-a { 0%,100%{transform:translate3d(0,0,0) rotate(0deg)} 50%{transform:translate3d(6px,-16px,0) rotate(3deg)} }
        @keyframes float-b { 0%,100%{transform:translate3d(0,0,0) rotate(0deg)} 50%{transform:translate3d(-10px,12px,0) rotate(-2.5deg)} }
        @keyframes wave-flow-1 { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
        @keyframes wave-flow-2 { 0%{transform:translateX(-50%)} 100%{transform:translateX(0)} }
        @keyframes wave-flow-3 { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
        @keyframes wave-bob { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }
        @keyframes bubble-rise { 0%{transform:translateY(0) scale(0.6);opacity:0} 15%{opacity:0.9} 85%{opacity:0.5} 100%{transform:translateY(-30px) scale(1);opacity:0} }
        @keyframes water-drop-fall {
          0%{opacity:0;transform:translate(-50%,-15%) scaleY(0.55) scaleX(1.2) rotate(var(--rot,0deg))}
          9%{opacity:1;transform:translate(-50%,0%) scaleY(1) scaleX(1) rotate(var(--rot,0deg))}
          50%{opacity:1;transform:translate(-47%,65%) scaleY(1.4) scaleX(0.8) rotate(var(--rot,0deg))}
          80%{opacity:0.9;transform:translate(-53%,125%) scaleY(1.55) scaleX(0.72) rotate(var(--rot,0deg))}
          91%{opacity:0.65;transform:translate(-50%,148%) scaleY(0.5) scaleX(1.5) rotate(var(--rot,0deg))}
          100%{opacity:0;transform:translate(-50%,152%) scaleY(0.25) scaleX(1.7) rotate(var(--rot,0deg))}
        }
        @keyframes water-trail-fade { 0%{opacity:0;transform:scaleY(0.25)} 14%{opacity:0.5;transform:scaleY(1)} 60%{opacity:0.28} 100%{opacity:0;transform:scaleY(1.15)} }
        @keyframes water-splash { 0%{opacity:0.85;transform:translate(-50%,-50%) scale(0.15)} 100%{opacity:0;transform:translate(-50%,-50%) scale(2.4)} }
        @keyframes fade-up { 0%{opacity:0;transform:translateY(28px)} 100%{opacity:1;transform:translateY(0)} }
        @keyframes logo-pop { 0%{transform:scale(0.6) rotate(-8deg);opacity:0} 60%{transform:scale(1.08) rotate(2deg);opacity:1} 100%{transform:scale(1) rotate(0deg);opacity:1} }
        @keyframes ripple-ring { 0%{box-shadow:0 0 0 0 rgba(26,86,160,0.28)} 70%{box-shadow:0 0 0 14px rgba(26,86,160,0)} 100%{box-shadow:0 0 0 0 rgba(26,86,160,0)} }
        @keyframes slide-down { 0%{opacity:0;transform:translateY(-12px)} 100%{opacity:1;transform:translateY(0)} }

        .animate-float-a{animation:float-a 8s ease-in-out infinite}
        .animate-float-b{animation:float-b 11s ease-in-out infinite}
        .animate-wave-1{animation:wave-flow-1 4.5s linear infinite,wave-bob 3s ease-in-out infinite}
        .animate-wave-2{animation:wave-flow-2 6.5s linear infinite,wave-bob 3.6s ease-in-out infinite 0.4s}
        .animate-wave-3{animation:wave-flow-3 3.2s linear infinite,wave-bob 2.4s ease-in-out infinite 0.2s}
        .animate-bubble-1{animation:bubble-rise 2.6s ease-in infinite}
        .animate-bubble-2{animation:bubble-rise 3.4s ease-in infinite 0.9s}
        .animate-bubble-3{animation:bubble-rise 2.1s ease-in infinite 1.6s}
        .animate-bubble-4{animation:bubble-rise 3s ease-in infinite 0.4s}
        .animate-fade-up{animation:fade-up 0.7s cubic-bezier(0.22,1,0.36,1) both}
        .animate-logo-pop{animation:logo-pop 0.7s cubic-bezier(0.34,1.56,0.64,1) both}
        .animate-ripple{animation:ripple-ring 1.6s ease-out 0.6s 1}
        .animate-slide-down{animation:slide-down 0.25s ease both}
        .water-drop{position:absolute;pointer-events:none;animation:water-drop-fall var(--dur,900ms) ease-in both}
        .water-trail{position:absolute;pointer-events:none;transform-origin:top center;animation:water-trail-fade var(--dur,900ms) ease-in both}
        .water-splash{position:absolute;pointer-events:none;border-radius:50%;animation:water-splash calc(var(--dur,900ms) * 0.45) ease-out calc(var(--dur,900ms) * 0.52) both}
        .delay-100{animation-delay:100ms}
        .delay-200{animation-delay:200ms}
        .delay-300{animation-delay:300ms}
        .delay-400{animation-delay:400ms}
        .delay-500{animation-delay:500ms}
        .delay-600{animation-delay:600ms}
        @media(prefers-reduced-motion:reduce){.animate-float-a,.animate-float-b,.animate-wave-1,.animate-wave-2,.animate-wave-3,.animate-bubble-1,.animate-bubble-2,.animate-bubble-3,.animate-bubble-4,.animate-fade-up,.water-drop,.water-trail,.water-splash{animation:none!important}}
      `}</style>

      {/* ══ NAVBAR ══ */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-white/90 backdrop-blur-md shadow-md shadow-blue-900/8" : "bg-transparent"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className={`relative w-9 h-9 rounded-xl overflow-hidden shadow-sm transition-all ${scrolled ? "" : "bg-white/20 backdrop-blur-sm"}`}>
                <Image src="/PdamLogo.svg" alt="PDAM Logo" fill className="object-contain p-1" />
              </div>
              <div>
                <p className={`text-sm font-bold leading-none transition-colors ${scrolled ? "text-[#0B3D6B]" : "text-white"}`}>Helpdesk MIS</p>
                <p className={`text-[10px] leading-none mt-0.5 transition-colors ${scrolled ? "text-slate-500" : "text-white/70"}`}>Tirta Kahuripan</p>
              </div>
            </div>

            {/* Desktop nav links */}
            <div className="hidden md:flex items-center gap-6">
              {["Fitur", "Statistik", "Tentang"].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className={`text-sm font-medium transition-colors hover:text-cyan-400 ${scrolled ? "text-slate-600" : "text-white/80"}`}
                >
                  {item}
                </a>
              ))}
            </div>

            {/* CTA */}
            <div className="hidden md:flex items-center gap-3">
              <Link
                href="/login"
                className={`text-sm font-semibold px-4 py-2 rounded-lg transition-all ${scrolled ? "text-[#1A56A0] hover:bg-blue-50" : "text-white/90 hover:text-white hover:bg-white/10"}`}
              >
                Masuk
              </Link>
              <Link
                href="/login"
                className="text-sm font-bold px-5 py-2 rounded-xl text-white shadow-lg shadow-blue-900/30 transition-all hover:scale-105 hover:shadow-blue-900/40"
                style={{ background: "linear-gradient(135deg, #1A56A0, #0E8A9E)" }}
              >
                Mulai Sekarang
              </Link>
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(v => !v)}
              className={`md:hidden p-2 rounded-lg transition-colors ${scrolled ? "text-slate-700 hover:bg-slate-100" : "text-white hover:bg-white/10"}`}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden animate-slide-down bg-white/95 backdrop-blur-md border-t border-slate-100 shadow-lg">
            <div className="px-4 py-4 space-y-2">
              {["Fitur", "Statistik", "Tentang"].map(item => (
                <a key={item} href={`#${item.toLowerCase()}`} onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2 text-sm font-medium text-slate-700 rounded-lg hover:bg-blue-50 hover:text-[#1A56A0]">
                  {item}
                </a>
              ))}
              <Link href="/login"
                className="block mt-2 px-3 py-2.5 text-sm font-bold text-center text-white rounded-xl"
                style={{ background: "linear-gradient(135deg,#1A56A0,#0E8A9E)" }}
                onClick={() => setMobileOpen(false)}>
                Masuk ke Aplikasi
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* ══ HERO ══ */}
      <section className="relative min-h-screen flex items-center overflow-hidden">

        {/* Background foto */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url(/PdamBG.jpg)" }}
        />

        {/* Dot grid */}
        <div className="absolute inset-0 opacity-[0.07]"
          style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.8) 1px, transparent 1px)", backgroundSize: "22px 22px" }} />

        {/* Flowing blue panel (sama seperti login) */}
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(11,61,107,0.92) 0%, rgba(14,138,158,0.7) 60%, transparent 100%)" }} />

        {/* Gelombang bawah */}
        <div className="absolute bottom-0 left-0 right-0 h-24 overflow-hidden">
          {/* wave 1 */}
          <svg className="absolute bottom-0 w-[200%] animate-wave-1" viewBox="0 0 1440 56" fill="none" preserveAspectRatio="none" style={{ height: 56 }}>
            <path d="M0 30 C240 50 480 10 720 30 C960 50 1200 10 1440 30 L1440 56 L0 56 Z" fill="rgba(255,255,255,0.12)" />
            <path d="M1440 30 C1200 50 960 10 720 30 C480 50 240 10 0 30 L0 56 L1440 56 Z" fill="rgba(255,255,255,0.12)" />
          </svg>
          {/* wave 2 */}
          <svg className="absolute bottom-0 w-[200%] animate-wave-2" viewBox="0 0 1440 44" fill="none" preserveAspectRatio="none" style={{ height: 44 }}>
            <path d="M0 22 C360 40 720 4 1080 22 C1260 31 1380 16 1440 22 L1440 44 L0 44 Z" fill="rgba(255,255,255,0.08)" />
            <path d="M1440 22 C1080 40 720 4 360 22 C180 31 60 16 0 22 L0 44 L1440 44 Z" fill="rgba(255,255,255,0.08)" />
          </svg>
          {/* wave 3 — paling depan, penuh putih */}
          <svg className="absolute bottom-0 w-[200%] animate-wave-3" viewBox="0 0 1440 32" fill="none" preserveAspectRatio="none" style={{ height: 32 }}>
            <path d="M0 16 C180 28 360 4 540 16 C720 28 900 4 1080 16 C1260 28 1380 10 1440 16 L1440 32 L0 32 Z" fill="#F4FAFB" />
            <path d="M1440 16 C1260 28 1080 4 900 16 C720 28 540 4 360 16 C180 28 60 10 0 16 L0 32 L1440 32 Z" fill="#F4FAFB" />
          </svg>
        </div>

        {/* Floating blobs dekoratif */}
        <div className="absolute top-20 right-12 w-64 h-64 rounded-full opacity-10 animate-float-a"
          style={{ background: "radial-gradient(circle, rgba(255,255,255,0.6) 0%, transparent 70%)", filter: "blur(40px)" }} />
        <div className="absolute bottom-32 left-10 w-48 h-48 rounded-full opacity-10 animate-float-b"
          style={{ background: "radial-gradient(circle, rgba(14,138,158,0.8) 0%, transparent 70%)", filter: "blur(36px)" }} />

        {/* Hero content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 flex flex-col lg:flex-row items-center gap-12">

          {/* Left: teks */}
          <div className="flex-1 text-center lg:text-left">

            {/* Badge */}
            <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-6 border border-white/20 bg-white/10 backdrop-blur-sm text-white/90 animate-fade-up ${visible ? "" : "opacity-0"}`}>
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              Platform Helpdesk IT Resmi PDAM
            </div>

            <h1 className={`text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight mb-6 animate-fade-up delay-100 ${visible ? "" : "opacity-0"}`}>
              Solusi Cerdas
              <br />
              <span style={{ backgroundImage: "linear-gradient(90deg, #7DD3FA, #67E8F9)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                Layanan IT Anda
              </span>
            </h1>

            <p className={`text-white/75 text-base sm:text-lg leading-relaxed max-w-xl mx-auto lg:mx-0 mb-8 animate-fade-up delay-200 ${visible ? "" : "opacity-0"}`}>
              Helpdesk MIS memudahkan seluruh karyawan Perumda Tirta Kahuripan untuk melaporkan, 
              melacak, dan menyelesaikan kendala IT secara efisien dalam satu platform terpadu.
            </p>

            {/* CTA buttons */}
            <div className={`flex flex-col sm:flex-row gap-3 justify-center lg:justify-start animate-fade-up delay-300 ${visible ? "" : "opacity-0"}`}>
              <Link
                href="/login"
                onMouseMove={handleMouseMove}
                className="relative overflow-hidden inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl text-white font-bold text-sm shadow-xl shadow-blue-900/40 transition-all hover:scale-105 hover:shadow-blue-900/50"
                style={{ background: "linear-gradient(135deg,#1A56A0,#0E8A9E)" }}
              >
                {/* Water droplets on hover */}
                {droplets.map(d => {
                  const v = dropVariant(d.id)
                  return (
                    <span key={d.id} style={{ left: `${d.x}%`, top: `${d.y}%`, "--rot": `${v.rotation}deg`, "--dur": `${d.duration}ms` } as React.CSSProperties}>
                      <svg className="water-drop" width={d.size} height={d.size * 1.3} viewBox="0 0 20 26" fill="none">
                        <path d={v.path} fill="rgba(255,255,255,0.55)" />
                      </svg>
                      <span className="water-trail" style={{ left: `${d.x}%`, top: `${d.y}%`, width: 1.5, height: d.size * 0.9, background: "linear-gradient(to bottom, rgba(255,255,255,0.35), transparent)" }} />
                      <span className="water-splash" style={{ left: `${d.x}%`, top: `calc(${d.y}% + ${d.size * 1.5}px)`, width: d.size * 1.4, height: d.size * 0.4, border: "1.5px solid rgba(255,255,255,0.4)" }} />
                    </span>
                  )
                })}
                <span className="relative z-10">Masuk ke Aplikasi</span>
                <ArrowRight className="w-4 h-4 relative z-10" />
              </Link>

              <Link
                href="/user-portal"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl text-white font-bold text-sm border border-white/25 bg-white/10 backdrop-blur-sm transition-all hover:bg-white/20 hover:scale-105"
              >
                <TicketCheck className="w-4 h-4" />
                Buat Tiket Baru
              </Link>
            </div>

            {/* Trust badges */}
            <div className={`mt-8 flex flex-wrap gap-4 justify-center lg:justify-start animate-fade-up delay-400 ${visible ? "" : "opacity-0"}`}>
              {[
                { icon: ShieldCheck, label: "Aman & Terenkripsi" },
                { icon: Zap, label: "Notifikasi Real-Time" },
                { icon: Users, label: "Multi-Role Access" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-1.5 text-white/70 text-xs font-medium">
                  <Icon className="w-3.5 h-3.5 text-cyan-400" />
                  {label}
                </div>
              ))}
            </div>
          </div>

          {/* Right: Card preview */}
          <div className={`flex-shrink-0 w-full max-w-sm animate-fade-up delay-500 ${visible ? "" : "opacity-0"}`}>
            <div className="rounded-3xl overflow-hidden shadow-2xl shadow-blue-950/50 border border-white/10 bg-white/10 backdrop-blur-xl">
              {/* Card header */}
              <div className="p-5 border-b border-white/10" style={{ background: "rgba(255,255,255,0.06)" }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
                    <TicketCheck className="w-5 h-5 text-cyan-300" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-bold">Tiket Terbaru</p>
                    <p className="text-white/50 text-xs">Helpdesk MIS</p>
                  </div>
                  <span className="ml-auto bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2.5 py-1 rounded-full border border-emerald-500/30">Live</span>
                </div>
              </div>
              {/* Ticket items preview */}
              {[
                { title: "Printer tidak bisa cetak", unit: "Bag. Keuangan", status: "Open", color: "bg-blue-400" },
                { title: "Akses VPN terputus", unit: "Bag. SDM", status: "In Progress", color: "bg-amber-400" },
                { title: "Email tidak bisa kirim", unit: "Bag. Umum", status: "Resolved", color: "bg-emerald-400" },
              ].map((ticket, i) => (
                <div key={i} className={`px-5 py-3.5 border-b border-white/5 flex items-center gap-3 transition-colors hover:bg-white/5 ${i === 0 ? "animate-fade-up delay-600" : ""}`}>
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${ticket.color}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-xs font-semibold truncate">{ticket.title}</p>
                    <p className="text-white/45 text-[10px]">{ticket.unit}</p>
                  </div>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border flex-shrink-0 ${
                    ticket.status === "Open" ? "bg-blue-500/20 text-blue-300 border-blue-500/30" :
                    ticket.status === "In Progress" ? "bg-amber-500/20 text-amber-300 border-amber-500/30" :
                    "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                  }`}>
                    {ticket.status}
                  </span>
                </div>
              ))}
              {/* Footer */}
              <div className="px-5 py-3 flex items-center justify-between">
                <span className="text-white/40 text-[10px]">Diperbarui baru saja</span>
                <Link href="/login" className="text-cyan-400 text-[10px] font-bold flex items-center gap-1 hover:text-cyan-300 transition-colors">
                  Lihat Semua <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ STATS ══ */}
      <section id="statistik" className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {STATS.map(({ value, label }, i) => (
              <div key={i} className="text-center p-6 rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50/50 border border-slate-100 hover:shadow-md hover:shadow-blue-100 transition-all group">
                <div className="text-3xl font-black mb-1 group-hover:scale-105 transition-transform"
                  style={{ backgroundImage: "linear-gradient(135deg,#1A56A0,#0E8A9E)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  {value}
                </div>
                <p className="text-slate-500 text-sm font-medium">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FEATURES ══ */}
      <section id="fitur" className="py-24 bg-[#F4FAFB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="inline-block text-xs font-bold px-4 py-1.5 rounded-full mb-4 text-white"
              style={{ background: "linear-gradient(135deg,#1A56A0,#0E8A9E)" }}>
              Fitur Unggulan
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#0B3D6B] mb-4">
              Semua yang Anda Butuhkan,<br />
              <span style={{ backgroundImage: "linear-gradient(135deg,#1A56A0,#0E8A9E)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                dalam Satu Platform
              </span>
            </h2>
            <p className="text-slate-500 max-w-xl mx-auto text-sm leading-relaxed">
              Dirancang khusus untuk kebutuhan operasional Perumda Tirta Kahuripan, 
              setiap fitur dihadirkan untuk meningkatkan efisiensi dan produktivitas tim IT Anda.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(({ icon: Icon, title, desc, color }, i) => (
              <div
                key={i}
                className="group relative bg-white rounded-2xl p-6 border border-slate-100 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-100/50 transition-all duration-300 hover:-translate-y-1"
              >
                <div className={`inline-flex w-12 h-12 rounded-xl items-center justify-center mb-4 bg-gradient-to-br ${color} shadow-lg shadow-blue-200/50 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-[#0B3D6B] font-bold text-base mb-2">{title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
                <div className={`absolute bottom-0 left-0 right-0 h-0.5 rounded-b-2xl bg-gradient-to-r ${color} scale-x-0 group-hover:scale-x-100 transition-transform duration-300`} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ HOW IT WORKS ══ */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="inline-block text-xs font-bold px-4 py-1.5 rounded-full mb-4 text-white"
              style={{ background: "linear-gradient(135deg,#1A56A0,#0E8A9E)" }}>
              Cara Kerja
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#0B3D6B] mb-4">Mudah & Cepat dalam 3 Langkah</h2>
            <p className="text-slate-500 max-w-md mx-auto text-sm">Proses sederhana yang dirancang agar siapa saja bisa menggunakannya.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connector line */}
            <div className="hidden md:block absolute top-10 left-1/3 right-1/3 h-px bg-gradient-to-r from-transparent via-blue-200 to-transparent" />

            {[
              { step: "01", title: "Buat Tiket", desc: "Isi formulir singkat tentang kendala IT yang Anda alami. Pilih kategori, prioritas, dan lampirkan file jika diperlukan.", icon: TicketCheck },
              { step: "02", title: "Tim Merespon", desc: "Tim Helpdesk MIS menerima notifikasi instan dan langsung menangani tiket Anda sesuai SLA yang berlaku.", icon: Bell },
              { step: "03", title: "Masalah Selesai", desc: "Lacak status penyelesaian secara real-time dan berikan rating kepuasan setelah masalah Anda terselesaikan.", icon: CheckCircle2 },
            ].map(({ step, title, desc, icon: Icon }, i) => (
              <div key={i} className="relative text-center group">
                <div className="relative inline-flex w-20 h-20 rounded-2xl items-center justify-center mb-5 shadow-lg shadow-blue-200/60 group-hover:scale-110 transition-transform"
                  style={{ background: "linear-gradient(135deg,#1A56A0,#0E8A9E)" }}>
                  <Icon className="w-8 h-8 text-white" />
                  <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-white border-2 border-blue-200 text-[10px] font-black text-[#1A56A0] flex items-center justify-center shadow-sm">
                    {step}
                  </span>
                </div>
                <h3 className="text-[#0B3D6B] font-bold text-lg mb-2">{title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed max-w-xs mx-auto">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CTA SECTION ══ */}
      <section id="tentang" className="relative py-24 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url(/PdamBG.jpg)" }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(11,61,107,0.94) 0%, rgba(14,138,158,0.85) 100%)" }} />
        {/* Dot grid */}
        <div className="absolute inset-0 opacity-[0.06]"
          style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.8) 1px, transparent 1px)", backgroundSize: "22px 22px" }} />

        {/* Gelombang atas */}
        <div className="absolute top-0 left-0 right-0 h-16 overflow-hidden rotate-180">
          <svg className="absolute bottom-0 w-[200%] animate-wave-3" viewBox="0 0 1440 32" fill="none" preserveAspectRatio="none" style={{ height: 32 }}>
            <path d="M0 16 C180 28 360 4 540 16 C720 28 900 4 1080 16 C1260 28 1380 10 1440 16 L1440 32 L0 32 Z" fill="white" />
            <path d="M1440 16 C1260 28 1080 4 900 16 C720 28 540 4 360 16 C180 28 60 10 0 16 L0 32 L1440 32 Z" fill="white" />
          </svg>
        </div>

        <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Logo */}
          <div className="inline-flex w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-sm items-center justify-center mb-6 border border-white/20 shadow-xl animate-ripple">
            <Image src="/PdamLogo.svg" alt="PDAM Logo" width={52} height={52} className="object-contain" />
          </div>

          <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
            Siap Memulai?
          </h2>
          <p className="text-white/70 text-base mb-8 max-w-lg mx-auto leading-relaxed">
            Bergabunglah dengan seluruh karyawan Perumda Tirta Kahuripan yang sudah menggunakan 
            Helpdesk MIS untuk mengelola kendala IT mereka dengan lebih efisien.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-bold text-sm text-white shadow-xl shadow-blue-900/40 transition-all hover:scale-105"
              style={{ background: "linear-gradient(135deg,#1A56A0,#0E8A9E)" }}
            >
              <ShieldCheck className="w-4 h-4" />
              Masuk sebagai Admin / Staff
            </Link>
            <Link
              href="/user-portal"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-bold text-sm text-white border border-white/25 bg-white/10 backdrop-blur-sm transition-all hover:bg-white/20 hover:scale-105"
            >
              <TicketCheck className="w-4 h-4" />
              Buat Tiket Tanpa Login
            </Link>
          </div>
        </div>

        {/* Gelombang bawah */}
        <div className="absolute bottom-0 left-0 right-0 h-16 overflow-hidden">
          <svg className="absolute bottom-0 w-[200%] animate-wave-1" viewBox="0 0 1440 32" fill="none" preserveAspectRatio="none" style={{ height: 32 }}>
            <path d="M0 16 C180 28 360 4 540 16 C720 28 900 4 1080 16 C1260 28 1380 10 1440 16 L1440 32 L0 32 Z" fill="white" />
            <path d="M1440 16 C1260 28 1080 4 900 16 C720 28 540 4 360 16 C180 28 60 10 0 16 L0 32 L1440 32 Z" fill="white" />
          </svg>
        </div>
      </section>

      {/* ══ FOOTER ══ */}
      <footer className="bg-white border-t border-slate-100 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="relative w-8 h-8 rounded-lg overflow-hidden">
                <Image src="/PdamLogo.svg" alt="PDAM" fill className="object-contain p-0.5" />
              </div>
              <div>
                <p className="text-sm font-bold text-[#0B3D6B]">Helpdesk MIS</p>
                <p className="text-[10px] text-slate-400">Perumda Tirta Kahuripan</p>
              </div>
            </div>

            {/* Links */}
            <div className="flex items-center gap-6">
              <Link href="/login" className="text-slate-500 hover:text-[#1A56A0] text-sm transition-colors">Masuk</Link>
              <Link href="/user-portal" className="text-slate-500 hover:text-[#1A56A0] text-sm transition-colors">Buat Tiket</Link>
              <Link href="/forgot-password" className="text-slate-500 hover:text-[#1A56A0] text-sm transition-colors">Lupa Password</Link>
            </div>

            {/* Copyright */}
            <p className="text-xs text-slate-400">
              © {new Date().getFullYear()} MIS Perumda Tirta Kahuripan. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

    </div>
  )
}
