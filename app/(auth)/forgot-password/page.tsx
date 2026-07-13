"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Mail, ArrowLeft, CheckCircle2, Loader2 } from "lucide-react"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Terjadi kesalahan")
      } else {
        setSubmitted(true)
      }
    } catch {
      setError("Terjadi kesalahan jaringan. Silakan coba lagi.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-dvh w-full relative overflow-hidden bg-[#F4FAFB] font-sans flex items-center justify-center">
      {/* Background */}
      <div
        className="absolute inset-0 bg-no-repeat bg-cover bg-center"
        style={{ backgroundImage: "url(/PdamBG.jpg)" }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#0B3D6B]/80 via-[#1A56A0]/70 to-[#0E8A9E]/60" />
      </div>

      {/* Floating blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <svg className="absolute -top-20 -left-20 w-96 h-96 opacity-20 animate-[float_8s_ease-in-out_infinite]" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <path fill="#A5E9F2" d="M39.5,-51.6C50.4,-43.2,58,-30.2,61.8,-16C65.6,-1.8,65.6,13.6,59.2,26.4C52.8,39.2,40,49.4,25.6,55.9C11.2,62.4,-4.8,65.2,-19.7,61.5C-34.6,57.8,-48.4,47.6,-56.9,34.1C-65.4,20.6,-68.6,3.8,-65.3,-11.5C-62,-26.8,-52.2,-40.6,-39.5,-49C-26.8,-57.4,-13.4,-60.4,0.8,-61.6C15,-62.8,28.6,-60,39.5,-51.6Z" transform="translate(100 100)" />
        </svg>
        <svg className="absolute -bottom-20 -right-20 w-96 h-96 opacity-15 animate-[float_11s_ease-in-out_infinite_reverse]" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <path fill="#8FD3EA" d="M39.5,-51.6C50.4,-43.2,58,-30.2,61.8,-16C65.6,-1.8,65.6,13.6,59.2,26.4C52.8,39.2,40,49.4,25.6,55.9C11.2,62.4,-4.8,65.2,-19.7,61.5C-34.6,57.8,-48.4,47.6,-56.9,34.1C-65.4,20.6,-68.6,3.8,-65.3,-11.5C-62,-26.8,-52.2,-40.6,-39.5,-49C-26.8,-57.4,-13.4,-60.4,0.8,-61.6C15,-62.8,28.6,-60,39.5,-51.6Z" transform="translate(100 100)" />
        </svg>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translate3d(0,0,0) rotate(0deg); }
          50% { transform: translate3d(10px,-18px,0) rotate(4deg); }
        }
      `}</style>

      {/* Card */}
      <div className="relative z-10 w-full max-w-md px-4">
        <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl p-8 shadow-2xl shadow-black/30 animate-in fade-in zoom-in-95 duration-500">

          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 mb-3 drop-shadow-lg">
              <Image src="/PdamLogo.svg" alt="PDAM Logo" width={64} height={64} className="w-full h-full" />
            </div>
            <p className="text-white/70 text-sm font-medium">Perumda Tirta Kahuripan</p>
          </div>

          {submitted ? (
            /* Success State */
            <div className="text-center animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="w-16 h-16 bg-green-400/20 border border-green-400/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-300" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Email Terkirim!</h2>
              <p className="text-white/70 text-sm leading-relaxed mb-6">
                Jika email <span className="text-cyan-300 font-semibold">{email}</span> terdaftar di sistem,
                kami telah mengirimkan link reset password. Silakan cek inbox atau folder spam Anda.
              </p>
              <p className="text-white/50 text-xs mb-6">Link berlaku selama <strong className="text-white/70">1 jam</strong>.</p>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-300 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Kembali ke halaman login
              </Link>
            </div>
          ) : (
            /* Form State */
            <>
              <div className="text-center mb-7">
                <h1 className="text-2xl font-bold text-white mb-2">Lupa Password?</h1>
                <p className="text-white/65 text-sm leading-relaxed">
                  Masukkan email Anda dan kami akan mengirimkan link untuk mereset password.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-xs uppercase tracking-wider font-semibold text-white/60">
                    Email Pegawai
                  </Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-white/40">
                      <Mail className="w-5 h-5" />
                    </div>
                    <Input
                      id="email"
                      type="email"
                      placeholder="nama@tirtakahuripan.com"
                      className="pl-11 py-6 text-sm bg-white/10 border-white/20 text-white placeholder:text-white/30 focus-visible:ring-2 focus-visible:ring-cyan-400/40 focus-visible:border-cyan-400/50 rounded-xl backdrop-blur-sm hover:bg-white/15 transition-all"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {error && (
                  <div className="p-3 rounded-xl bg-red-500/20 border border-red-400/30 text-red-200 text-sm animate-in fade-in slide-in-from-top-2 duration-300">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full py-6 bg-gradient-to-r from-[#1A56A0] to-[#0E8A9E] hover:from-[#1A56A0]/90 hover:to-[#0E8A9E]/90 text-white font-semibold rounded-xl shadow-lg shadow-blue-900/40 transition-all duration-300 hover:scale-[1.015] active:scale-[0.98]"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Mengirim...
                    </div>
                  ) : (
                    "Kirim Link Reset Password"
                  )}
                </Button>

                <div className="text-center pt-1">
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-1.5 text-sm text-white/50 hover:text-white transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Kembali ke login
                  </Link>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
