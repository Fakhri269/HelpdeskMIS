"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Lock, Mail, ArrowRight, ShieldCheck, Eye, EyeOff } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

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
      } else {
        router.push("/dashboard")
        router.refresh()
      }
    } catch (err) {
      setError("Terjadi kesalahan sistem, silakan coba lagi nanti")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-dvh lg:min-h-dvh lg:h-auto w-full relative overflow-hidden lg:overflow-x-hidden bg-[#F4FAFB] dark:bg-zinc-950 font-sans selection:bg-cyan-600 selection:text-white">

      {/* ══════════ BACKGROUND PHOTO ══════════ */}
      {/* Mobile: foto menutupi seluruh tinggi halaman (bg-cover), rata atas.
          Desktop (lg+): tetap seperti semula, foto besar di sisi kanan dengan ukuran tetap. */}
      <div
        className="absolute inset-0 overflow-hidden bg-no-repeat bg-cover bg-[position:top_center] lg:bg-[length:60vw_53.2vw] lg:bg-[position:right_center]"
        style={{ backgroundImage: "url(/PdamBg.jpg)" }}
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
          className="absolute -top-[8%] -left-[54%] w-[132%] h-[118%]"
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
        <svg className="hidden lg:block absolute top-[10%] left-[26%] w-28 h-28 opacity-30" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="18" stroke="#ffffff" strokeWidth="2" fill="none" />
          <circle cx="50" cy="50" r="32" stroke="#ffffff" strokeWidth="1.4" fill="none" />
          <circle cx="50" cy="50" r="46" stroke="#ffffff" strokeWidth="1" fill="none" />
        </svg>
        <svg className="hidden lg:block absolute top-[58%] left-[2%] w-16 h-16 opacity-20" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="14" stroke="#ffffff" strokeWidth="1.6" fill="none" />
          <circle cx="50" cy="50" r="26" stroke="#ffffff" strokeWidth="1.1" fill="none" />
        </svg>

        {/* freeform blob, right side */}
        <svg
          className="absolute top-[14%] right-[2%] w-[240px] h-[240px] sm:w-[300px] sm:h-[300px] lg:w-[360px] lg:h-[360px] opacity-25"
          viewBox="0 0 200 200"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fill="#0E8A9E"
            d="M39.5,-51.6C50.4,-43.2,58,-30.2,61.8,-16C65.6,-1.8,65.6,13.6,59.2,26.4C52.8,39.2,40,49.4,25.6,55.9C11.2,62.4,-4.8,65.2,-19.7,61.5C-34.6,57.8,-48.4,47.6,-56.9,34.1C-65.4,20.6,-68.6,3.8,-65.3,-11.5C-62,-26.8,-52.2,-40.6,-39.5,-49C-26.8,-57.4,-13.4,-60.4,0.8,-61.6C15,-62.8,28.6,-60,39.5,-51.6Z"
            transform="translate(100 100)"
          />
        </svg>

        {/* soft accent blob, bottom right */}
        <svg
          className="absolute -bottom-16 right-[4%] w-[260px] h-[260px] sm:w-[360px] sm:h-[360px] lg:w-[440px] lg:h-[440px] opacity-40"
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
          className="hidden lg:block absolute top-[42%] left-[38%] w-[200px] h-[200px] opacity-[0.15]"
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
          <div className="flex items-center justify-center lg:justify-start mb-2 lg:mb-10">
            {/* mobile: plain text mark, no pill */}
            <span className="lg:hidden font-semibold text-lg tracking-tight text-white drop-shadow-[0_1px_6px_rgba(11,61,107,0.55)]">
              Perumda Tirta Kahuripan
            </span>

            {/* desktop: abstract wave/blob-backed badge with an organic (non-rectangular) outline */}
            <svg width="0" height="0" className="absolute">
              <defs>
                <clipPath id="badgeBlobClip" clipPathUnits="objectBoundingBox">
                  <path d="M0.9700,0.5000 C0.9700,0.6089 0.9273,0.7555 0.8490,0.8267 C0.7706,0.8978 0.6169,0.9263 0.5000,0.9268 C0.3831,0.9273 0.2229,0.9009 0.1477,0.8298 C0.0725,0.7587 0.0477,0.6089 0.0488,0.5000 C0.0499,0.3911 0.0792,0.2483 0.1544,0.1764 C0.2296,0.1046 0.3842,0.0693 0.5000,0.0688 C0.6158,0.0683 0.7706,0.1015 0.8490,0.1733 C0.9273,0.2452 0.9700,0.3911 0.9700,0.5000 Z" />
                </clipPath>
              </defs>
            </svg>
            <div
              className="hidden lg:flex items-center gap-4 relative overflow-hidden pl-6 pr-8 py-5"
              style={{
                clipPath: "url(#badgeBlobClip)",
                filter: "drop-shadow(0 4px 10px rgba(11,61,107,0.35))",
              }}
            >
              {/* abstract wave/blob backdrop for the badge, echoing the page's decorative motif */}
              <svg
                className="absolute inset-0 w-full h-full"
                viewBox="0 0 320 96"
                preserveAspectRatio="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <linearGradient id="badgeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#0C2E5C" />
                    <stop offset="100%" stopColor="#075A68" />
                  </linearGradient>
                </defs>
                <rect width="320" height="96" fill="url(#badgeGrad)" />
                {/* soft white highlight, low opacity so it never competes with the white text */}
                <path
                  d="M39.5,-51.6C50.4,-43.2,58,-30.2,61.8,-16C65.6,-1.8,65.6,13.6,59.2,26.4C52.8,39.2,40,49.4,25.6,55.9C11.2,62.4,-4.8,65.2,-19.7,61.5C-34.6,57.8,-48.4,47.6,-56.9,34.1C-65.4,20.6,-68.6,3.8,-65.3,-11.5C-62,-26.8,-52.2,-40.6,-39.5,-49C-26.8,-57.4,-13.4,-60.4,0.8,-61.6C15,-62.8,28.6,-60,39.5,-51.6Z"
                  fill="#ffffff"
                  opacity="0.08"
                  transform="translate(65,80) scale(0.38) rotate(35)"
                />
              </svg>
              <div className="relative z-10 flex items-center justify-center p-1 ml-2">
                <Image src="/PdamLogo.svg" alt="PDAM Logo" width={68} height={68} className="drop-shadow" />
              </div>
              <span className="relative z-10 font-semibold text-xl tracking-tight text-white">Perumda Tirta Kahuripan</span>
            </div>
          </div>

          <h1 className="hidden lg:block text-[2.4rem] sm:text-5xl font-bold leading-[1.08] mb-6 max-w-lg tracking-tight text-white">
            Air mengalir jernih,
            <br />
            <span className="text-cyan-200">layanan IT</span> tanpa hambatan.
          </h1>
          <p className="hidden lg:block text-white/90 text-[15.5px] max-w-md leading-relaxed mb-10">
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
            className="w-full max-w-[92vw] xs:max-w-sm sm:max-w-xl lg:max-w-2xl relative"
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
              <svg className="absolute -top-14 -right-14 w-48 h-48 opacity-[0.06] pointer-events-none" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                <path
                  fill="#1A56A0"
                  d="M39.5,-51.6C50.4,-43.2,58,-30.2,61.8,-16C65.6,-1.8,65.6,13.6,59.2,26.4C52.8,39.2,40,49.4,25.6,55.9C11.2,62.4,-4.8,65.2,-19.7,61.5C-34.6,57.8,-48.4,47.6,-56.9,34.1C-65.4,20.6,-68.6,3.8,-65.3,-11.5C-62,-26.8,-52.2,-40.6,-39.5,-49C-26.8,-57.4,-13.4,-60.4,0.8,-61.6C15,-62.8,28.6,-60,39.5,-51.6Z"
                  transform="translate(100 100)"
                />
              </svg>
              <svg className="absolute -bottom-20 -left-16 w-64 h-64 opacity-[0.05] pointer-events-none" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                <circle cx="100" cy="100" r="90" fill="#0E8A9E" />
              </svg>
              <svg className="absolute top-[38%] -right-8 w-20 h-20 opacity-[0.08] pointer-events-none" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <circle cx="50" cy="50" r="26" stroke="#1A56A0" strokeWidth="1.4" fill="none" />
                <circle cx="50" cy="50" r="38" stroke="#1A56A0" strokeWidth="1" fill="none" />
              </svg>
            </div>

            {/* form content — kept OUTSIDE the clipped layer above so text/inputs are never sliced by the blob's pinched waist; narrowed and nudged left to stay inside the visible shape at every height */}
            <div className="relative z-10 flex justify-center px-5 pt-6 pb-6 sm:px-6 sm:pt-16 sm:pb-16">
              <div className="w-[68%] max-w-sm mx-auto -translate-x-[4%] space-y-4 sm:space-y-9">
                <div className="text-center space-y-1.5 sm:space-y-3">
                  {/* logo mobile: tanpa kotak/latar, langsung logonya saja dengan drop-shadow tipis */}
                  <div className="lg:hidden mx-auto mb-0.5 w-9 h-9 sm:w-16 sm:h-16 flex items-center justify-center">
                    <Image
                      src="/PdamLogo.svg"
                      alt="PDAM Logo"
                      width={56}
                      height={56}
                      className="w-full h-full drop-shadow-[0_2px_6px_rgba(11,61,107,0.25)]"
                    />
                  </div>
                  <h2 className="text-[1.1rem] sm:text-[1.9rem] font-bold tracking-tight bg-gradient-to-r from-[#1A237E] to-[#1090A0] bg-clip-text text-transparent dark:text-white leading-tight">
                      Selamat datang di HelpdeskMIS
                    </h2>
                    <p className="text-xs sm:text-sm text-[#003153] dark:text-zinc-400">
                      Silakan masuk ke akun Anda untuk melanjutkan
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-6">
                    <div className="space-y-2 sm:space-y-4">
                      <div className="space-y-1 sm:space-y-2 relative group">
                        <Label htmlFor="email" className="text-[10px] sm:text-xs uppercase tracking-wider text-[#2F4F8F] dark:text-zinc-400 font-semibold ml-1">
                          Email Pegawai
                        </Label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-[#7FAFC7] group-focus-within:text-[#1A56A0] transition-colors">
                            <Mail className="w-4 h-4 sm:w-5 sm:h-5" />
                          </div>
                          <Input
                            id="email"
                            type="email"
                            placeholder="nama@tirtakahuripan.com"
                            className="pl-11 py-3 sm:py-6 text-sm bg-white/95 dark:bg-zinc-900 border-[#BFE0EE] dark:border-zinc-700 focus-visible:ring-2 focus-visible:ring-[#1A56A0]/40 focus-visible:border-[#1A56A0] transition-all rounded-xl shadow-sm text-[#0B3D6B] dark:text-white font-medium placeholder:text-[#93AFC2] placeholder:font-normal"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-1 sm:space-y-2 relative group">
                        <div className="flex items-center justify-between ml-1">
                          <Label htmlFor="password" className="text-[10px] sm:text-xs uppercase tracking-wider text-[#2F4F8F] dark:text-zinc-400 font-semibold">
                            Password
                          </Label>
                          <a href="#" className="text-[10px] sm:text-xs font-medium text-[#000080] hover:text-[#0E8A9E] hover:underline transition-all">
                            Lupa password?
                          </a>
                        </div>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-[#7FAFC7] group-focus-within:text-[#1A56A0] transition-colors">
                            <Lock className="w-4 h-4 sm:w-5 sm:h-5" />
                          </div>
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            className="pl-11 pr-11 py-3 sm:py-6 text-sm bg-white/95 dark:bg-zinc-900 border-[#BFE0EE] dark:border-zinc-700 focus-visible:ring-2 focus-visible:ring-[#1A56A0]/40 focus-visible:border-[#1A56A0] transition-all rounded-xl shadow-sm text-[#0B3D6B] dark:text-white font-medium placeholder:text-[#93AFC2] placeholder:font-normal"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword((prev) => !prev)}
                            className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-[#7FAFC7] hover:text-[#1A56A0] transition-colors"
                            aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                            tabIndex={-1}
                          >
                            {showPassword ? (
                              <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" />
                            ) : (
                              <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    {error && (
                      <div className="p-3 sm:p-4 rounded-xl bg-gradient-to-r from-[#DCEFFB] to-[#CFE4F5] border border-[#7FAFC7] text-[#0B3D6B] text-xs sm:text-sm font-semibold animate-in fade-in slide-in-from-top-2 duration-300">
                        {error}
                      </div>
                    )}

                    <Button
                      type="submit"
                      className="w-full py-3 sm:py-6 bg-gradient-to-r from-[#2166B3] via-[#1C82AC] to-[#1AA0AC] hover:from-[#1A56A0] hover:via-[#146B95] hover:to-[#0E8A9E] text-white rounded-xl shadow-lg transition-all active:scale-[0.98] group font-semibold text-sm sm:text-md"
                      disabled={loading}
                    >
                      {loading ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                          <span>Memverifikasi...</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center">
                          <span>Masuk ke Dashboard</span>
                          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </div>
                      )}
                    </Button>
                  </form>

                  <div className="pt-1.5 sm:pt-4 text-center">
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
  )
}