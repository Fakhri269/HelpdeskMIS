"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
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
    <div className="min-h-screen w-full flex bg-white dark:bg-zinc-950 font-sans selection:bg-blue-600 selection:text-white">
      {/* Left side - Branding & Image */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-blue-600">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-900 opacity-90 z-10" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')] bg-cover bg-center mix-blend-overlay opacity-40" />
        
        {/* Decorative elements */}
        <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob z-10" />
        <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000 z-10" />
        
        <div className="relative z-20 flex flex-col justify-between h-full p-16 text-white w-full">
          <div>
            <div className="flex items-center space-x-3 mb-12">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/30 shadow-xl">
                <span className="font-bold text-xl tracking-tight text-white">TK</span>
              </div>
              <span className="font-semibold text-2xl tracking-tight">Perumda Tirta Kahuripan</span>
            </div>
            
            <h1 className="text-5xl font-bold leading-tight mb-6 max-w-lg">
              Solusi Cepat untuk Setiap Kendala IT Anda.
            </h1>
            <p className="text-blue-100 text-lg max-w-md leading-relaxed">
              Sistem Ticketing & Helpdesk MIS terpadu untuk memantau, melacak, dan menyelesaikan masalah IT dengan efisien.
            </p>
          </div>
          
          <div className="flex items-center space-x-4 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 max-w-sm">
            <div className="p-3 bg-white/20 rounded-full">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="font-medium text-sm">Aman & Terenkripsi</p>
              <p className="text-xs text-blue-200">Akses hanya untuk pegawai terdaftar</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 relative">
        <div className="absolute inset-0 bg-slate-50 dark:bg-zinc-950 -z-10" />
        
        {/* Mobile Logo */}
        <div className="lg:hidden absolute top-8 left-8 flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg">
            <span className="font-bold text-xs text-white">TK</span>
          </div>
          <span className="font-semibold text-slate-800 dark:text-white">Helpdesk MIS</span>
        </div>

        <div className="w-full max-w-md space-y-10 z-10 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl p-8 sm:p-10 rounded-3xl border border-slate-200/60 dark:border-zinc-800/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Selamat Datang</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Silakan masuk ke akun Anda untuk melanjutkan
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2 relative group">
                <Label htmlFor="email" className="text-xs uppercase tracking-wider text-slate-500 font-semibold ml-1">Email Pegawai</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                    <Mail className="w-5 h-5" />
                  </div>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="nama@tirtakahuripan.com" 
                    className="pl-11 py-6 bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 focus-visible:ring-blue-500 focus-visible:border-blue-500 transition-all rounded-xl"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required 
                  />
                </div>
              </div>

              <div className="space-y-2 relative group">
                <div className="flex items-center justify-between ml-1">
                  <Label htmlFor="password" className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Password</Label>
                  <a href="#" className="text-xs font-medium text-blue-600 hover:text-blue-500 hover:underline transition-all">Lupa password?</a>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                    <Lock className="w-5 h-5" />
                  </div>
                  <Input 
                    id="password" 
                    type="password"
                    placeholder="••••••••" 
                    className="pl-11 py-6 bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 focus-visible:ring-blue-500 focus-visible:border-blue-500 transition-all rounded-xl"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required 
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 text-sm font-medium animate-in fade-in slide-in-from-top-2 duration-300">
                {error}
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full py-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-600/20 transition-all active:scale-[0.98] group font-semibold text-md" 
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
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
            <p className="text-xs text-slate-400">
              &copy; {new Date().getFullYear()} MIS Perumda Tirta Kahuripan.<br/>All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
