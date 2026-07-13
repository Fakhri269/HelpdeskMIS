"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Lock, Mail, ArrowRight, ShieldCheck } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

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
    <div className="min-h-dvh w-full relative overflow-x-hidden bg-[#F4FAFB] dark:bg-zinc-950 font-sans selection:bg-cyan-600 selection:text-white">

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

        {/* dominant flowing panel, deepened for stronger contrast against the white card */}
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
          <path
            fill="url(#flowGrad)"
            opacity="0.97"
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
      <div className="relative z-10 flex min-h-dvh w-full flex-col lg:flex-row lg:items-center gap-6 lg:gap-16 px-6 sm:px-10 lg:px-16 xl:px-24 py-8 lg:py-16">

        {/* ── Brand / hero column ── */}
        <div className="w-full lg:w-1/2 text-white pt-6 lg:pt-0">
          <div className="flex items-center justify-center lg:justify-start mb-6 lg:mb-10">
            {/* mobile: plain text mark, no pill */}
            <span className="lg:hidden font-semibold text-lg tracking-tight text-white">Perumda Tirta Kahuripan</span>

            {/* desktop: abstract wave/blob-backed pill, echoing the page's decorative motif */}
            <div className="hidden lg:flex items-center gap-3 relative overflow-hidden rounded-2xl border border-white/25 shadow-sm pr-5">
              {/* abstract wave/blob backdrop for the badge, echoing the page's decorative motif */}
              <svg
                className="absolute inset-0 w-full h-full"
                viewBox="0 0 280 72"
                preserveAspectRatio="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <linearGradient id="badgeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#123E75" stopOpacity="0.55" />
                    <stop offset="100%" stopColor="#0A7686" stopOpacity="0.55" />
                  </linearGradient>
                </defs>
                <rect width="280" height="72" fill="url(#badgeGrad)" />
                <path
                  d="M0,50 C40,20 80,70 130,45 C180,20 220,60 280,35 L280,72 L0,72 Z"
                  fill="#ffffff"
                  opacity="0.07"
                />
                <path
                  d="M0,15 C50,35 90,-5 150,15 C200,30 240,5 280,20 L280,0 L0,0 Z"
                  fill="#ffffff"
                  opacity="0.05"
                />
              </svg>
              <div className="relative z-10 flex items-center justify-center bg-white/15 rounded-xl p-3 backdrop-blur-sm ml-1">
                <Image src="/PdamLogo.svg" alt="PDAM Logo" width={56} height={56} className="drop-shadow" />
              </div>
              <span className="relative z-10 font-semibold text-lg tracking-tight text-white">Perumda Tirta Kahuripan</span>
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

          <div className="hidden lg:block space-y-3 max-w-sm">
            <div className="flex items-center gap-4 bg-gradient-to-r from-white/15 to-cyan-200/10 backdrop-blur-md p-4 rounded-2xl border border-white/25">
              <div className="p-2.5 bg-white/20 rounded-xl shrink-0">
                <ShieldCheck className="w-5 h-5 text-cyan-200" />
              </div>
              <div>
                <p className="font-medium text-sm text-white">Aman &amp; terenkripsi</p>
                <p className="text-xs text-white/80">Akses hanya untuk pegawai terdaftar</p>
              </div>
            </div>
          </div>
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
            className="w-full max-w-md sm:max-w-xl lg:max-w-2xl relative"
            style={{ filter: "drop-shadow(0 22px 45px rgba(11,61,107,0.35))" }}
          >
            <div
              className="absolute inset-0 dark:bg-zinc-900"
              style={{
                background: "linear-gradient(160deg, #EAF7FC 0%, #D6EEF7 45%, #C3E4F0 100%)",
                clipPath: "url(#formCardClip)",
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
            <div className="relative z-10 flex justify-center px-6 pt-14 pb-14 sm:pt-16 sm:pb-16">
              <div className="w-[68%] max-w-sm mx-auto -translate-x-[4%] space-y-9">
                <div className="text-center space-y-3">
                  <div className="lg:hidden mx-auto mb-1 w-16 h-16 rounded-2xl bg-gradient-to-br from-white to-[#DCEEF5] shadow-sm border border-[#D2E9F2] flex items-center justify-center">
                    <Image src="/PdamLogo.svg" alt="PDAM Logo" width={40} height={40} />
                  </div>
                  <h2 className="text-[1.55rem] sm:text-[1.9rem] font-bold tracking-tight bg-gradient-to-r from-[#1A5A8C] to-[#1090A0] bg-clip-text text-transparent dark:text-white leading-tight">
                      Selamat datang di HelpdeskMIS
                    </h2>
                    <p className="text-sm text-[#3E7799] dark:text-zinc-400">
                      Silakan masuk ke akun Anda untuk melanjutkan
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                      <div className="space-y-2 relative group">
                        <Label htmlFor="email" className="text-xs uppercase tracking-wider text-[#4A7B9C] dark:text-zinc-400 font-semibold ml-1">
                          Email Pegawai
                        </Label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-[#7FAFC7] group-focus-within:text-[#1A56A0] transition-colors">
                            <Mail className="w-5 h-5" />
                          </div>
                          <Input
                            id="email"
                            type="email"
                            placeholder="nama@tirtakahuripan.com"
                            className="pl-11 py-6 bg-white/80 dark:bg-zinc-900 border-[#BFE0EE] dark:border-zinc-700 focus-visible:ring-2 focus-visible:ring-[#1A56A0]/40 focus-visible:border-[#1A56A0] transition-all rounded-xl shadow-sm text-[#1D5C89] dark:text-white"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2 relative group">
                        <div className="flex items-center justify-between ml-1">
                          <Label htmlFor="password" className="text-xs uppercase tracking-wider text-[#4A7B9C] dark:text-zinc-400 font-semibold">
                            Password
                          </Label>
                          <a href="#" className="text-xs font-medium text-[#1A56A0] hover:text-[#0E8A9E] hover:underline transition-all">
                            Lupa password?
                          </a>
                        </div>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-[#7FAFC7] group-focus-within:text-[#1A56A0] transition-colors">
                            <Lock className="w-5 h-5" />
                          </div>
                          <Input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            className="pl-11 py-6 bg-white/80 dark:bg-zinc-900 border-[#BFE0EE] dark:border-zinc-700 focus-visible:ring-2 focus-visible:ring-[#1A56A0]/40 focus-visible:border-[#1A56A0] transition-all rounded-xl shadow-sm text-[#1D5C89] dark:text-white"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                    </div>

                    {error && (
                      <div className="p-4 rounded-xl bg-gradient-to-r from-[#DCEFFB] to-[#CFE4F5] border border-[#7FAFC7] text-[#1D5C89] text-sm font-medium animate-in fade-in slide-in-from-top-2 duration-300">
                        {error}
                      </div>
                    )}

                    <Button
                      type="submit"
                      className="w-full py-6 bg-gradient-to-r from-[#2166B3] via-[#1C82AC] to-[#1AA0AC] hover:from-[#1A56A0] hover:via-[#146B95] hover:to-[#0E8A9E] text-white rounded-xl shadow-lg transition-all active:scale-[0.98] group font-semibold text-md"
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

                  <div className="pt-4 text-center">
                    <p className="text-xs text-[#7FAFC7] dark:text-zinc-500">
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