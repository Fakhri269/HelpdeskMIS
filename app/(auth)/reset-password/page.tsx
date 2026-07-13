"use client"

import { useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Lock, Eye, EyeOff, CheckCircle2, Loader2, AlertTriangle } from "lucide-react"

function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get("token")

  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  if (!token) {
    return (
      <div className="text-center">
        <div className="w-16 h-16 bg-red-400/20 border border-red-400/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-8 h-8 text-red-300" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Link Tidak Valid</h2>
        <p className="text-white/65 text-sm mb-6">
          Link reset password tidak ditemukan atau sudah tidak berlaku.
        </p>
        <Link href="/forgot-password" className="text-cyan-300 hover:text-white text-sm font-semibold transition-colors">
          Minta link baru
        </Link>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (newPassword !== confirmPassword) {
      setError("Konfirmasi password tidak cocok")
      return
    }

    if (newPassword.length < 6) {
      setError("Password minimal 6 karakter")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Terjadi kesalahan")
      } else {
        setSuccess(true)
        setTimeout(() => router.push("/login"), 3000)
      }
    } catch {
      setError("Terjadi kesalahan jaringan. Silakan coba lagi.")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="text-center animate-in fade-in slide-in-from-bottom-2 duration-500">
        <div className="w-16 h-16 bg-green-400/20 border border-green-400/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8 text-green-300" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Password Berhasil Diubah!</h2>
        <p className="text-white/70 text-sm leading-relaxed mb-2">
          Password Anda telah berhasil diperbarui.
        </p>
        <p className="text-white/50 text-xs">Mengalihkan ke halaman login dalam 3 detik...</p>
      </div>
    )
  }

  return (
    <>
      <div className="text-center mb-7">
        <h1 className="text-2xl font-bold text-white mb-2">Buat Password Baru</h1>
        <p className="text-white/65 text-sm leading-relaxed">
          Masukkan password baru untuk akun Anda.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="newPassword" className="text-xs uppercase tracking-wider font-semibold text-white/60">
            Password Baru
          </Label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-white/40">
              <Lock className="w-5 h-5" />
            </div>
            <Input
              id="newPassword"
              type={showPassword ? "text" : "password"}
              placeholder="Min. 6 karakter"
              className="pl-11 pr-11 py-6 text-sm bg-white/10 border-white/20 text-white placeholder:text-white/30 focus-visible:ring-2 focus-visible:ring-cyan-400/40 focus-visible:border-cyan-400/50 rounded-xl backdrop-blur-sm hover:bg-white/15 transition-all"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(p => !p)}
              className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-white/40 hover:text-white transition-colors"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-xs uppercase tracking-wider font-semibold text-white/60">
            Konfirmasi Password
          </Label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-white/40">
              <Lock className="w-5 h-5" />
            </div>
            <Input
              id="confirmPassword"
              type={showPassword ? "text" : "password"}
              placeholder="Ulangi password baru"
              className="pl-11 py-6 text-sm bg-white/10 border-white/20 text-white placeholder:text-white/30 focus-visible:ring-2 focus-visible:ring-cyan-400/40 focus-visible:border-cyan-400/50 rounded-xl backdrop-blur-sm hover:bg-white/15 transition-all"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
              Menyimpan...
            </div>
          ) : (
            "Simpan Password Baru"
          )}
        </Button>
      </form>
    </>
  )
}

export default function ResetPasswordPage() {
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
        <svg className="absolute -top-20 -right-20 w-96 h-96 opacity-20 animate-[float_9s_ease-in-out_infinite]" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <path fill="#A5E9F2" d="M39.5,-51.6C50.4,-43.2,58,-30.2,61.8,-16C65.6,-1.8,65.6,13.6,59.2,26.4C52.8,39.2,40,49.4,25.6,55.9C11.2,62.4,-4.8,65.2,-19.7,61.5C-34.6,57.8,-48.4,47.6,-56.9,34.1C-65.4,20.6,-68.6,3.8,-65.3,-11.5C-62,-26.8,-52.2,-40.6,-39.5,-49C-26.8,-57.4,-13.4,-60.4,0.8,-61.6C15,-62.8,28.6,-60,39.5,-51.6Z" transform="translate(100 100)" />
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

          <Suspense fallback={
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 text-white/50 animate-spin" />
            </div>
          }>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
