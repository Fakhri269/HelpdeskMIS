"use client"

import { useState, useRef } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Lock, Mail, ArrowRight, ShieldCheck, Eye, EyeOff } from "lucide-react"

type Droplet = { id: number; x: number; y: number; size: number; duration: number }

// generator sederhana angka semu-acak dari sebuah seed, dipakai supaya bentuk & rotasi tiap tetes konsisten selama animasinya berjalan
function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

// beberapa varian kontur blob air yang sengaja tidak simetris/rapi — benjolan dan lekukan tidak beraturan seperti tetesan air sungguhan
const BLOB_PATHS = [
  "M9.4 0.6 C13.8 4.3 19.6 10.8 17.9 16.3 C16.9 19.6 13.1 22.4 9.8 23.6 C7.6 24.4 4.6 24.8 2.8 22.6 C0.9 20.2 1.4 15.9 3.1 12.2 C4.9 8.2 7.1 3.8 9.4 0.6 Z",
  "M8.3 0.9 C10.5 3 15.9 7.8 18.1 12.9 C19.7 16.7 18.3 20.1 14.6 22.3 C11.6 24.1 8 24.6 5.6 22.4 C2.6 19.7 0.7 15.4 2.1 11.1 C3.4 7.1 6 3.4 8.3 0.9 Z",
  "M10.6 1.1 C14 4.9 17.1 10.5 15.6 15.6 C14.6 19 11 22.9 7.3 22.5 C4.4 22.2 1.8 19.4 1.5 15.8 C1.1 11.6 3.4 6.4 6.9 3.1 C8.1 2 9.4 1.4 10.6 1.1 Z",
  "M9 0.8 C12.9 4 18.4 10.3 17.5 15.8 C16.9 19.6 12.7 23.9 8.5 24.6 C5.8 25 2.4 23.7 1.4 20.6 C0.2 17 1.5 12 3.7 8.3 C5.6 5.1 7.3 2.5 9 0.8 Z",
]

// sudut rotasi & sedikit variasi ukuran horizontal per tetes, supaya tiap tetes miring berbeda-beda dan tidak terlihat seragam
function dropVariant(seed: number) {
  const path = BLOB_PATHS[Math.floor(seededRandom(seed) * BLOB_PATHS.length) % BLOB_PATHS.length]
  const rotation = Math.round((seededRandom(seed + 1) - 0.5) * 50) // -25deg .. +25deg
  return { path, rotation }
}

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [errorKey, setErrorKey] = useState(0) // dipakai untuk re-trigger animasi shake tiap kali error baru muncul
  const [droplets, setDroplets] = useState<Droplet[]>([]) // tetes air yang muncul & jatuh mengikuti posisi kursor di dalam tombol
  const lastDropletAt = useRef(0)

  const handleButtonMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100

    const now = performance.now()
    if (now - lastDropletAt.current < 90) return // throttle supaya tidak spawn terlalu rapat saat kursor digerakkan cepat
    lastDropletAt.current = now

    const id = now + Math.random()
    const size = 8 + Math.random() * 6 // variasi ukuran tetes, 8–14px
    const duration = 700 + Math.random() * 400 // variasi kecepatan jatuh, 700–1100ms
    setDroplets((prev) => [...prev.slice(-12), { id, x, y, size, duration }]) // batasi maksimal ~12 tetes aktif sekaligus

    setTimeout(() => {
      setDroplets((prev) => prev.filter((d) => d.id !== id))
    }, duration + 50)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      })

      if (res?.error) {
        setError("Email atau password yang Anda masukkan salah")
        setErrorKey((k) => k + 1)
      } else {
        router.push("/dashboard")
        router.refresh()
      }
    } catch (err) {
      setError("Terjadi kesalahan sistem, silakan coba lagi nanti")
      setErrorKey((k) => k + 1)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-dvh lg:min-h-dvh lg:h-auto w-full relative overflow-hidden lg:overflow-x-hidden bg-[#F4FAFB] dark:bg-zinc-950 font-sans selection:bg-cyan-600 selection:text-white">

      {/* ══════════ KEYFRAMES & UTILITAS ANIMASI KUSTOM ══════════ */}
      <style jsx global>{`
        @keyframes float-a {
          0%, 100% { transform: translate3d(0, 0, 0) rotate(0deg); }
          50% { transform: translate3d(6px, -16px, 0) rotate(3deg); }
        }
        @keyframes float-b {
          0%, 100% { transform: translate3d(0, 0, 0) rotate(0deg); }
          50% { transform: translate3d(-10px, 12px, 0) rotate(-2.5deg); }
        }
        @keyframes float-c {
          0%, 100% { transform: translate3d(0, 0, 0); opacity: 0.15; }
          50% { transform: translate3d(4px, 8px, 0); opacity: 0.22; }
        }
        @keyframes wave-flow-1 {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes wave-flow-2 {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
        @keyframes wave-flow-3 {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes wave-bob {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-2px); }
        }
        @keyframes bubble-rise {
          0% { transform: translateY(0) scale(0.6); opacity: 0; }
          15% { opacity: 0.9; }
          85% { opacity: 0.5; }
          100% { transform: translateY(-26px) scale(1); opacity: 0; }
        }
        @keyframes water-drop-fall {
          0% { opacity: 0; transform: translate(-50%, -15%) scaleY(0.55) scaleX(1.2) rotate(var(--rot, 0deg)); }
          9% { opacity: 1; transform: translate(-50%, 0%) scaleY(1) scaleX(1) rotate(var(--rot, 0deg)); }
          50% { opacity: 1; transform: translate(-47%, 65%) scaleY(1.4) scaleX(0.8) rotate(var(--rot, 0deg)); }
          80% { opacity: 0.9; transform: translate(-53%, 125%) scaleY(1.55) scaleX(0.72) rotate(var(--rot, 0deg)); }
          91% { opacity: 0.65; transform: translate(-50%, 148%) scaleY(0.5) scaleX(1.5) rotate(var(--rot, 0deg)); }
          100% { opacity: 0; transform: translate(-50%, 152%) scaleY(0.25) scaleX(1.7) rotate(var(--rot, 0deg)); }
        }
        @keyframes water-trail-fade {
          0% { opacity: 0; transform: scaleY(0.25); }
          14% { opacity: 0.5; transform: scaleY(1); }
          60% { opacity: 0.28; }
          100% { opacity: 0; transform: scaleY(1.15); }
        }
        @keyframes splash-ring {
          0% { opacity: 0.85; transform: translate(-50%, -50%) scale(0.15); }
          100% { opacity: 0; transform: translate(-50%, -50%) scale(2.4); }
        }
        @keyframes shake-x {
          10%, 90% { transform: translateX(-1px); }
          20%, 80% { transform: translateX(2px); }
          30%, 50%, 70% { transform: translateX(-4px); }
          40%, 60% { transform: translateX(4px); }
        }
        @keyframes logo-pop {
          0% { transform: scale(0.6) rotate(-8deg); opacity: 0; }
          60% { transform: scale(1.08) rotate(2deg); opacity: 1; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes ripple-ring {
          0% { box-shadow: 0 0 0 0 rgba(26,86,160,0.28); }
          70% { box-shadow: 0 0 0 14px rgba(26,86,160,0); }
          100% { box-shadow: 0 0 0 0 rgba(26,86,160,0); }
        }
        .animate-float-a { animation: float-a 8s ease-in-out infinite; }
        .animate-float-b { animation: float-b 11s ease-in-out infinite; }
        .animate-float-c { animation: float-c 6s ease-in-out infinite; }
        .animate-shake-x { animation: shake-x 0.5s ease-in-out; }
        .animate-logo-pop { animation: logo-pop 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) both; }
        .animate-ripple-once { animation: ripple-ring 1.6s ease-out 0.6s 1; }
        .animate-wave-1 { animation: wave-flow-1 4.5s linear infinite, wave-bob 3s ease-in-out infinite; }
        .animate-wave-2 { animation: wave-flow-2 6.5s linear infinite, wave-bob 3.6s ease-in-out infinite 0.4s; }
        .animate-wave-3 { animation: wave-flow-3 3.2s linear infinite, wave-bob 2.4s ease-in-out infinite 0.2s; }
        .animate-bubble-1 { animation: bubble-rise 2.6s ease-in infinite; }
        .animate-bubble-2 { animation: bubble-rise 3.4s ease-in infinite 0.9s; }
        .animate-bubble-3 { animation: bubble-rise 2.1s ease-in infinite 1.6s; }
        .animate-bubble-4 { animation: bubble-rise 3s ease-in infinite 0.4s; }
        @media (prefers-reduced-motion: reduce) {
          .animate-float-a, .animate-float-b, .animate-float-c,
          .animate-shake-x, .animate-logo-pop, .animate-ripple-once,
          .animate-wave-1, .animate-wave-2, .animate-wave-3,
          .animate-bubble-1, .animate-bubble-2, .animate-bubble-3, .animate-bubble-4,
          .water-drop, .water-trail, .water-splash {
            animation: none !important;
          }
        }
      `}</style>

      {/* ══════════ BACKGROUND PHOTO ══════════ */}
      {/* Mobile: foto menutupi seluruh tinggi halaman (bg-cover), rata atas.
          Desktop (lg+): tetap seperti semula, foto besar di sisi kanan dengan ukuran tetap. */}
      <div
        className="absolute inset-0 overflow-hidden bg-no-repeat bg-cover bg-[position:top_center] lg:bg-[length:60vw_53.2vw] lg:bg-[position:right_center] animate-in fade-in duration-1000"
        style={{ backgroundImage: "url(/PdamBG.jpg)" }}
      >
        {/* wash tipis khusus mobile supaya foto tidak terlalu kontras/silau di bawah kartu form */}
        <div
          className="absolute inset-0 lg:hidden"
          style={{
            background: "linear-gradient(180deg, rgba(11,61,107,0.05) 0%, rgba(11,61,107,0.18) 55%, rgba(11,61,107,0.32) 100%)",
          }}
        />
      </div>

      {/* ══════════ SHARED ABSTRACT BACKGROUND ══════════ */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* dot-grid texture */}
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: "radial-gradient(rgba(30,95,150,0.7) 1px, transparent 1px)",
            backgroundSize: "22px 22px",
          }}
        />

        {/* dominant flowing panel — now fully opaque so the photo behind it never bleeds through */}
        <svg
          className="absolute -top-[8%] -left-[54%] w-[132%] h-[118%] animate-in fade-in duration-1000"
          viewBox="0 0 1200 800"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="flowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2166B3" />
              <stop offset="45%" stopColor="#1C82AC" />
              <stop offset="100%" stopColor="#1AA0AC" />
            </linearGradient>
          </defs>
          {/* solid fallback fill behind the gradient path, same shape, guarantees zero see-through */}
          <path
            fill="#1C82AC"
            d="M0,0 L780,0 C920,60 1010,150 980,270 C955,375 870,410 875,520 C880,630 935,690 890,800 L0,800 Z"
          />
          <path
            fill="url(#flowGrad)"
            opacity="1"
            d="M0,0 L780,0 C920,60 1010,150 980,270 C955,375 870,410 875,520 C880,630 935,690 890,800 L0,800 Z"
          />
          <path
            fill="#1E5FA0"
            opacity="0.2"
            d="M0,0 L620,0 C740,80 800,190 740,300 C685,400 610,430 620,540 C630,650 690,700 650,800 L0,800 Z"
          />
          <path
            fill="#2E8FB0"
            opacity="0.35"
            d="M0,120 C260,60 420,200 380,340 C340,480 250,520 260,640 C268,725 340,760 300,800 L0,800 Z"
          />
        </svg>

        {/* ripple rings — droplet motif */}
        <svg className="hidden lg:block absolute top-[10%] left-[26%] w-28 h-28 opacity-30 animate-float-c" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="18" stroke="#ffffff" strokeWidth="2" fill="none" />
          <circle cx="50" cy="50" r="32" stroke="#ffffff" strokeWidth="1.4" fill="none" />
          <circle cx="50" cy="50" r="46" stroke="#ffffff" strokeWidth="1" fill="none" />
        </svg>
        <svg className="hidden lg:block absolute top-[58%] left-[2%] w-16 h-16 opacity-20 animate-float-c" style={{ animationDelay: "1.5s" }} viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="14" stroke="#ffffff" strokeWidth="1.6" fill="none" />
          <circle cx="50" cy="50" r="26" stroke="#ffffff" strokeWidth="1.1" fill="none" />
        </svg>

        {/* freeform blob, right side — melayang halus */}
        <svg
          className="absolute top-[14%] right-[2%] w-[240px] h-[240px] sm:w-[300px] sm:h-[300px] lg:w-[360px] lg:h-[360px] opacity-25 animate-float-a"
          viewBox="0 0 200 200"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fill="#0E8A9E"
            d="M39.5,-51.6C50.4,-43.2,58,-30.2,61.8,-16C65.6,-1.8,65.6,13.6,59.2,26.4C52.8,39.2,40,49.4,25.6,55.9C11.2,62.4,-4.8,65.2,-19.7,61.5C-34.6,57.8,-48.4,47.6,-56.9,34.1C-65.4,20.6,-68.6,3.8,-65.3,-11.5C-62,-26.8,-52.2,-40.6,-39.5,-49C-26.8,-57.4,-13.4,-60.4,0.8,-61.6C15,-62.8,28.6,-60,39.5,-51.6Z"
            transform="translate(100 100)"
          />
        </svg>

        {/* soft accent blob, bottom right — melayang halus, arah berbeda */}
        <svg
          className="absolute -bottom-16 right-[4%] w-[260px] h-[260px] sm:w-[360px] sm:h-[360px] lg:w-[440px] lg:h-[440px] opacity-40 animate-float-b"
          viewBox="0 0 200 200"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="softBlob" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#A5E9F2" />
              <stop offset="100%" stopColor="#8FD3EA" />
            </linearGradient>
          </defs>
          <path
            fill="url(#softBlob)"
            d="M39.5,-51.6C50.4,-43.2,58,-30.2,61.8,-16C65.6,-1.8,65.6,13.6,59.2,26.4C52.8,39.2,40,49.4,25.6,55.9C11.2,62.4,-4.8,65.2,-19.7,61.5C-34.6,57.8,-48.4,47.6,-56.9,34.1C-65.4,20.6,-68.6,3.8,-65.3,-11.5C-62,-26.8,-52.2,-40.6,-39.5,-49C-26.8,-57.4,-13.4,-60.4,0.8,-61.6C15,-62.8,28.6,-60,39.5,-51.6Z"
            transform="translate(100 100)"
          />
        </svg>

        {/* small teal accent, mid-page */}
        <svg
          className="hidden lg:block absolute top-[42%] left-[38%] w-[200px] h-[200px] opacity-[0.15] animate-float-c"
          style={{ animationDelay: "0.7s" }}
          viewBox="0 0 200 200"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="100" cy="100" r="90" fill="#0E8A9E" />
        </svg>
      </div>

      {/* ══════════ CONTENT — hero + form side by side ══════════ */}
      <div className="relative z-10 flex h-full lg:min-h-dvh w-full flex-col justify-center lg:flex-row lg:items-center gap-2 lg:gap-16 px-5 sm:px-10 lg:px-16 xl:px-24 py-3 lg:py-16 overflow-hidden lg:overflow-visible">

        {/* ── Brand / hero column ── */}
        <div className="w-full lg:w-1/2 text-white pt-0 lg:pt-0 shrink-0">
          <div className="flex items-center justify-center lg:justify-start mb-2 lg:mb-10 animate-in fade-in slide-in-from-top-3 duration-700">
            {/* mobile: plain text mark, no pill */}
            <span className="lg:hidden font-semibold text-lg tracking-tight text-white drop-shadow-[0_1px_6px_rgba(11,61,107,0.55)]">
              Perumda Tirta Kahuripan
            </span>

            {/* desktop: abstract wave/blob-backed badge with an organic (non-rectangular) outline */}
            <div className="hidden lg:flex items-center gap-4">
              <Image src="/PdamLogo.svg" alt="PDAM Logo" width={68} height={68} className="drop-shadow" />
              <span className="font-semibold text-xl tracking-tight text-white">Perumda Tirta Kahuripan</span>
            </div>
          </div>

          <h1 className="hidden lg:block text-[2.4rem] sm:text-5xl font-bold leading-[1.08] mb-6 max-w-lg tracking-tight text-white animate-in fade-in slide-in-from-left-4 duration-700 delay-150">
            Air mengalir jernih,
            <br />
            <span className="text-cyan-200">layanan IT</span> tanpa hambatan.
          </h1>
          <p className="hidden lg:block text-white/90 text-[15.5px] max-w-md leading-relaxed mb-10 animate-in fade-in slide-in-from-left-4 duration-700 delay-300">
            Sistem Ticketing &amp; Helpdesk MIS terpadu untuk memantau, melacak,
            dan menyelesaikan kendala teknis di seluruh unit kerja Perumda.
          </p>
        </div>

        {/* ── Form column — same organic blob-shaped card, now solid white for strong contrast against the blue backdrop ── */}
        <div className="w-full lg:w-1/2 flex justify-center">
          <svg width="0" height="0" className="absolute">
            <defs>
              <clipPath id="formCardClip" clipPathUnits="objectBoundingBox">
                <path d="M0.083,0.075 C0.133,0.033 0.207,0.017 0.288,0.007 C0.370,-0.003 0.460,-0.007 0.550,-0.002 C0.640,0.003 0.730,0.017 0.802,0.040 C0.873,0.063 0.927,0.097 0.940,0.137 C0.953,0.177 0.927,0.223 0.897,0.265 C0.867,0.307 0.833,0.343 0.817,0.390 C0.800,0.437 0.800,0.493 0.817,0.543 C0.833,0.593 0.867,0.637 0.897,0.682 C0.927,0.727 0.953,0.773 0.940,0.817 C0.927,0.860 0.873,0.900 0.802,0.932 C0.730,0.963 0.640,0.987 0.550,0.997 C0.460,1.007 0.370,1.003 0.288,0.993 C0.207,0.983 0.133,0.967 0.083,0.925 C0.033,0.883 0.007,0.817 0.013,0.742 C0.020,0.667 0.060,0.583 0.060,0.500 C0.060,0.417 0.020,0.333 0.013,0.258 C0.007,0.183 0.033,0.117 0.083,0.075 Z" />
              </clipPath>
            </defs>
          </svg>

          <div
            className="w-full max-w-sm sm:max-w-xl lg:max-w-2xl relative mx-auto animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-700 transition-transform hover:-translate-y-0.5"
            style={{ filter: "drop-shadow(0 22px 45px rgba(11,61,107,0.35))" }}
          >
            <div
              className="absolute inset-0 dark:bg-zinc-900 backdrop-blur-xl"
              style={{
                background: "linear-gradient(160deg, rgba(234,247,252,0.55) 0%, rgba(214,238,247,0.55) 45%, rgba(195,228,240,0.55) 100%)",
                clipPath: "url(#formCardClip)",
                WebkitBackdropFilter: "blur(24px)",
              }}
            >
              {/* decorative accents in brand blue, kept faint so they never compete with text */}
              <svg className="absolute -top-14 -right-14 w-48 h-48 opacity-[0.06] pointer-events-none animate-float-c" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                <path
                  fill="#1A56A0"
                  d="M39.5,-51.6C50.4,-43.2,58,-30.2,61.8,-16C65.6,-1.8,65.6,13.6,59.2,26.4C52.8,39.2,40,49.4,25.6,55.9C11.2,62.4,-4.8,65.2,-19.7,61.5C-34.6,57.8,-48.4,47.6,-56.9,34.1C-65.4,20.6,-68.6,3.8,-65.3,-11.5C-62,-26.8,-52.2,-40.6,-39.5,-49C-26.8,-57.4,-13.4,-60.4,0.8,-61.6C15,-62.8,28.6,-60,39.5,-51.6Z"
                  transform="translate(100 100)"
                />
              </svg>
              <svg className="absolute -bottom-20 -left-16 w-64 h-64 opacity-[0.05] pointer-events-none animate-float-c" style={{ animationDelay: "1s" }} viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                <circle cx="100" cy="100" r="90" fill="#0E8A9E" />
              </svg>
              <svg className="absolute top-[38%] -right-8 w-20 h-20 opacity-[0.08] pointer-events-none" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <circle cx="50" cy="50" r="26" stroke="#1A56A0" strokeWidth="1.4" fill="none" />
                <circle cx="50" cy="50" r="38" stroke="#1A56A0" strokeWidth="1" fill="none" />
              </svg>
            </div>

            {/* form content — kept OUTSIDE the clipped layer above so text/inputs are never sliced by the blob's pinched waist; narrowed and nudged left to stay inside the visible shape at every height */}
            <div className="relative z-10 flex justify-center px-5 pt-6 pb-6 sm:px-6 sm:pt-16 sm:pb-16">
              <div className="w-[80%] max-w-xs mx-auto sm:w-[68%] sm:max-w-sm sm:-translate-x-[4%] space-y-4 sm:space-y-9">
                <div className="text-center space-y-1.5 sm:space-y-3">
                  {/* logo mobile: tanpa kotak/latar, langsung logonya saja, muncul dengan pop + ripple halus sekali */}
                  <div className="lg:hidden mx-auto mb-0.5 w-9 h-9 sm:w-16 sm:h-16 flex items-center justify-center rounded-full animate-logo-pop animate-ripple-once">
                    <Image
                      src="/PdamLogo.svg"
                      alt="PDAM Logo"
                      width={56}
                      height={56}
                      className="w-full h-full drop-shadow-[0_2px_6px_rgba(11,61,107,0.25)]"
                    />
                  </div>
                  <h2 className="text-[1.1rem] sm:text-[1.9rem] font-bold tracking-tight bg-gradient-to-r from-[#1A237E] to-[#1090A0] bg-clip-text text-transparent dark:text-white leading-tight animate-in fade-in slide-in-from-bottom-2 duration-500 delay-150">
                      Selamat datang di HelpdeskMIS
                    </h2>
                    <p className="text-xs sm:text-sm text-[#003153] dark:text-zinc-400 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-200">
                      Silakan masuk ke akun Anda untuk melanjutkan
                    </p>

                  <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-6">
                    <div className="space-y-2 sm:space-y-4">
                      <div className="space-y-1 sm:space-y-2 relative group animate-in fade-in slide-in-from-bottom-2 duration-500 delay-300">
                        <Label htmlFor="email" className="text-[10px] sm:text-xs uppercase tracking-wider text-[#2F4F8F] dark:text-zinc-400 font-semibold ml-1 transition-colors group-focus-within:text-[#1A56A0]">
                          Email Pegawai
                        </Label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-[#7FAFC7] group-focus-within:text-[#1A56A0] group-focus-within:scale-110 transition-all duration-200">
                            <Mail className="w-4 h-4 sm:w-5 sm:h-5" />
                          </div>
                          <Input
                            id="email"
                            type="email"
                            placeholder="nama@tirtakahuripan.com"
                            className="pl-11 py-3 sm:py-6 text-sm bg-white/95 dark:bg-zinc-900 border-[#BFE0EE] dark:border-zinc-700 focus-visible:ring-2 focus-visible:ring-[#1A56A0]/40 focus-visible:border-[#1A56A0] transition-all duration-200 rounded-xl shadow-sm hover:border-[#8FC0D9] hover:shadow-md focus:shadow-md text-[#0B3D6B] dark:text-white font-medium placeholder:text-[#93AFC2] placeholder:font-normal"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-1 sm:space-y-2 relative group animate-in fade-in slide-in-from-bottom-2 duration-500 delay-500">
                        <div className="flex items-center justify-between ml-1">
                          <Label htmlFor="password" className="text-[10px] sm:text-xs uppercase tracking-wider text-[#2F4F8F] dark:text-zinc-400 font-semibold transition-colors group-focus-within:text-[#1A56A0]">
                            Password
                          </Label>
                          <Link href="/forgot-password" className="text-[10px] sm:text-xs font-medium text-[#000080] hover:text-[#0E8A9E] transition-colors relative after:absolute after:left-0 after:-bottom-0.5 after:h-px after:w-0 after:bg-[#0E8A9E] after:transition-all after:duration-300 hover:after:w-full">
                            Lupa password?
                          </Link>
                        </div>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-[#7FAFC7] group-focus-within:text-[#1A56A0] group-focus-within:scale-110 transition-all duration-200">
                            <Lock className="w-4 h-4 sm:w-5 sm:h-5" />
                          </div>
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            className="pl-11 pr-11 py-3 sm:py-6 text-sm bg-white/95 dark:bg-zinc-900 border-[#BFE0EE] dark:border-zinc-700 focus-visible:ring-2 focus-visible:ring-[#1A56A0]/40 focus-visible:border-[#1A56A0] transition-all duration-200 rounded-xl shadow-sm hover:border-[#8FC0D9] hover:shadow-md focus:shadow-md text-[#0B3D6B] dark:text-white font-medium placeholder:text-[#93AFC2] placeholder:font-normal"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword((prev) => !prev)}
                            className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-[#7FAFC7] hover:text-[#1A56A0] active:scale-90 transition-all duration-150"
                            aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                            tabIndex={-1}
                          >
                            <span className="relative block w-4 h-4 sm:w-5 sm:h-5">
                              <Eye
                                className={`absolute inset-0 w-full h-full transition-all duration-200 ${
                                  showPassword ? "opacity-0 scale-75 rotate-12" : "opacity-100 scale-100 rotate-0"
                                }`}
                              />
                              <EyeOff
                                className={`absolute inset-0 w-full h-full transition-all duration-200 ${
                                  showPassword ? "opacity-100 scale-100 rotate-0" : "opacity-0 scale-75 -rotate-12"
                                }`}
                              />
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {error && (
                      <div
                        key={errorKey}
                        className="p-3 sm:p-4 rounded-xl bg-gradient-to-r from-[#DCEFFB] to-[#CFE4F5] border border-[#7FAFC7] text-[#0B3D6B] text-xs sm:text-sm font-semibold animate-in fade-in slide-in-from-top-2 duration-300 animate-shake-x"
                      >
                        {error}
                      </div>
                    )}

                    {/* ══════════ TOMBOL "MASUK KE DASHBOARD" dengan air.png sebagai latar belakang ══════════ */}
                    <Button
                      type="submit"
                      className="relative overflow-hidden w-full py-3 sm:py-6 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 active:scale-[0.97] hover:scale-[1.015] group font-semibold text-sm sm:text-md animate-in fade-in slide-in-from-bottom-2 duration-500 delay-700"
                      disabled={loading}
                      onMouseMove={handleButtonMouseMove}
                    >
                      {/* ── lapisan gambar air.png sebagai latar tombol (paling belakang) ── */}
                      <span className="absolute inset-0">
                        <Image
                          src="/air.png" // file harus ada di public/air.png
                          alt=""
                          fill
                          className="object-cover"
                        />
                        {/* overlay biru tipis supaya tulisan tetap kontras & senada dengan warna brand */}
                        <span className="absolute inset-0 bg-gradient-to-r from-[#1A56A0]/75 via-[#146B95]/65 to-[#0E8A9E]/75 group-hover:from-[#1A56A0]/85 group-hover:via-[#146B95]/75 group-hover:to-[#0E8A9E]/85 transition-all duration-300" />
                      </span>

                      {/* ── lapisan air mengalir — pita riak tipis di dasar tombol, amplitudo kecil supaya terlihat seperti air, bukan duri ── */}
                      <span className="pointer-events-none absolute inset-x-0 bottom-0 h-[38%] sm:h-[34%] overflow-hidden rounded-b-xl">
                        {/* genangan dasar tipis, memberi kesan air punya volume */}
                        <span
                          className="absolute inset-0"
                          style={{ background: "linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.10) 100%)" }}
                        />

                        {/* gelembung kecil naik dari dasar, memperkuat ilusi air — dibatasi ketat di pita bawah */}
                        <span className="absolute left-[14%] bottom-0.5 w-[3px] h-[3px] rounded-full bg-white/70 animate-bubble-1" />
                        <span className="absolute left-[38%] bottom-0 w-1 h-1 rounded-full bg-white/60 animate-bubble-2" />
                        <span className="absolute left-[62%] bottom-0.5 w-[3px] h-[3px] rounded-full bg-white/70 animate-bubble-3" />
                        <span className="absolute left-[84%] bottom-0 w-[2.5px] h-[2.5px] rounded-full bg-white/60 animate-bubble-4" />

                       
                        
                          <path
                            d="M0,22 C50,17 100,27 150,22 C200,17 250,27 300,22 C350,17 400,27 450,22
                               C500,17 550,27 600,22 C650,17 700,27 750,22 C800,17 850,27 900,22
                               C950,17 1000,27 1050,22 C1100,17 1150,27 1200,22
                               L1200,40 L0,40 Z"
                            fill="rgba(255,255,255,0.22)"
                          />
                        
                      </span>

                    

                      <span className="relative z-10">
                      {loading ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                          <span>Memverifikasi...</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center">
                          <span>Masuk ke Dashboard</span>
                          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1.5 transition-transform duration-300" />
                        </div>
                      )}
                      </span>
                    </Button>
                  </form>

                  <div className="pt-1.5 sm:pt-4 text-center animate-in fade-in duration-700 delay-1000">
                    <p className="text-[9px] sm:text-xs leading-snug text-[#000080] dark:text-zinc-500">
                      &copy; {new Date().getFullYear()} MIS Perumda Tirta Kahuripan.
                      <br />
                      All rights reserved.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}