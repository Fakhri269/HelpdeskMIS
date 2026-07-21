"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import Image from "next/image"
import { ChevronLeft, Send, Loader2, FileText, AlertCircle, CheckCircle2 } from "lucide-react"

export default function CreateTicketPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [refsLoaded, setRefsLoaded] = useState(false)
  const [refs, setRefs] = useState<{ units: any[]; subUnits: any[] }>({ units: [], subUnits: [] })
  const [dbCategories, setDbCategories] = useState<string[]>([])
  const [successMessage, setSuccessMessage] = useState(false)

  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "Medium",
    category: "",
    unitKerjaId: "",
    subUnitKerjaId: ""
  })

  useEffect(() => {
    Promise.all([
      fetch("/api/master/reference").then(r => r.json()).catch(() => ({ units: [], subUnits: [] })),
      fetch("/api/master/categories").then(r => r.json()).catch(() => [])
    ]).then(([refData, catData]) => {
      if (refData.units) setRefs(refData)
      if (Array.isArray(catData) && catData.length > 0) {
        setDbCategories(catData.map((c: any) => c.name))
      }
      setRefsLoaded(true)
    })
  }, [])

  useEffect(() => {
    if (refsLoaded && session?.user?.unitKerjaId && !form.unitKerjaId) {
      const exists = refs.units.find(u => u.id === session.user?.unitKerjaId)
      if (exists) setForm(prev => ({ ...prev, unitKerjaId: session.user?.unitKerjaId as string }))
    }
  }, [refsLoaded, refs.units, session])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const unitKerjaId = form.unitKerjaId || refs.units[0]?.id || ""
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, unitKerjaId }),
      })
      if (res.ok) {
        setSuccessMessage(true)
        setTimeout(() => {
          router.push("/user")
        }, 2000)
      } else {
        const err = await res.json()
        alert(err.error || "Terjadi kesalahan")
        setIsSubmitting(false)
      }
    } catch {
      alert("Terjadi kesalahan sistem")
      setIsSubmitting(false)
    }
  }

  const isFormValid = form.title.trim().length > 0 && form.description.trim().length > 0 && form.category

  if (status === "loading" || !refsLoaded) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-[#0a4f6e]">
        <Loader2 className="w-8 h-8 text-white animate-spin" />
      </div>
    )
  }

  const CATEGORIES = dbCategories.length > 0 ? dbCategories : [
    "Jaringan & Internet", "Hardware (PC/Laptop)", "Aplikasi MIS",
    "Email & Akun", "Printer & Scanner", "Lainnya"
  ]

  if (successMessage) {
    return (
      <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-[#0a4f6e] p-6 text-center">
        <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(34,197,94,0.4)] animate-in zoom-in duration-500">
          <CheckCircle2 className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-white font-bold text-2xl mb-2">Tiket Terkirim!</h1>
        <p className="text-white/70 text-sm max-w-xs">Laporan Anda telah berhasil dibuat. Mengarahkan kembali ke beranda...</p>
      </div>
    )
  }

  return (
    <div className="min-h-[100dvh] font-sans relative flex flex-col overflow-x-hidden">
      {/* ── BACKGROUND IMAGE ── */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Image
          src="/PdamBG.jpg"
          alt="Background PDAM"
          fill
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0 bg-[#0a4f6e]/85 backdrop-blur-sm" />
      </div>

      {/* ── HEADER ── */}
      <header className="relative z-20 w-full px-4 sm:px-6 py-5 flex items-center gap-4">
        <button 
          onClick={() => router.back()} 
          className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white/10 text-white border border-white/20 hover:bg-white/20 active:scale-95 transition-all shadow-lg backdrop-blur-md"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-white font-bold text-xl leading-tight tracking-wide">Buat Laporan</h1>
          <p className="text-blue-200/70 text-xs font-medium tracking-wider uppercase mt-0.5">Helpdesk MIS PDAM</p>
        </div>
      </header>

      {/* ── MAIN CONTENT ── */}
      <main className="relative z-10 flex-1 w-full max-w-xl mx-auto p-4 sm:p-6 pb-24">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          
          {/* Card 1: Informasi Dasar */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-5 sm:p-7 shadow-2xl">
            <h2 className="text-white font-bold text-sm flex items-center gap-2 border-b border-white/10 pb-4 mb-5">
              <div className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center">
                <FileText className="w-3.5 h-3.5 text-cyan-300" />
              </div>
              Informasi Dasar
            </h2>

            <div className="space-y-5">
              <div>
                <label className="block text-[11px] font-bold text-white/60 uppercase tracking-widest mb-2 ml-1">
                  Kategori Masalah <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <select
                    value={form.category}
                    onChange={e => setForm({ ...form, category: e.target.value })}
                    className="w-full h-12 rounded-xl border border-white/20 bg-white/5 px-4 text-sm text-white focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-400/50 outline-none transition-all appearance-none cursor-pointer"
                    required
                  >
                    <option value="" disabled className="text-slate-800">Pilih kategori kendala...</option>
                    {CATEGORIES.map(c => <option key={c} value={c} className="text-slate-800">{c}</option>)}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/50">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-white/60 uppercase tracking-widest mb-2 ml-1">
                  Judul Singkat <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  placeholder="Contoh: Aplikasi MIS lambat saat dibuka"
                  className="w-full h-12 rounded-xl border border-white/20 bg-white/5 px-4 text-sm text-white placeholder:text-white/30 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-400/50 outline-none transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-white/60 uppercase tracking-widest mb-2 ml-1">
                  Detail Laporan <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="Jelaskan secara detail kendala yang dialami, pesan error (jika ada), dan kapan mulai terjadi..."
                  className="w-full min-h-[140px] p-4 rounded-xl border border-white/20 bg-white/5 text-sm text-white placeholder:text-white/30 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-400/50 outline-none resize-y transition-all"
                  required
                />
              </div>
            </div>
          </div>

          {/* Card 2: Pengaturan Tambahan */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-5 sm:p-7 shadow-2xl">
            <h2 className="text-white font-bold text-sm flex items-center gap-2 border-b border-white/10 pb-4 mb-5">
              <div className="w-6 h-6 rounded-full bg-orange-500/20 flex items-center justify-center">
                <AlertCircle className="w-3.5 h-3.5 text-orange-300" />
              </div>
              Prioritas & Lokasi
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-[11px] font-bold text-white/60 uppercase tracking-widest mb-3 ml-1">Tingkat Prioritas</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { id: "Low", color: "from-slate-500 to-slate-400" },
                    { id: "Medium", color: "from-cyan-600 to-cyan-500" },
                    { id: "High", color: "from-orange-600 to-orange-500" },
                    { id: "Critical", color: "from-red-600 to-red-500" }
                  ].map(p => (
                    <button
                      key={p.id} type="button"
                      onClick={() => setForm({ ...form, priority: p.id })}
                      className={`relative h-12 rounded-xl text-xs font-bold transition-all overflow-hidden border ${
                        form.priority === p.id 
                          ? "text-white border-transparent shadow-[0_4px_20px_rgba(0,0,0,0.3)]" 
                          : "bg-white/5 text-white/50 border-white/10 hover:bg-white/10"
                      }`}
                    >
                      {form.priority === p.id && (
                        <div className={`absolute inset-0 bg-gradient-to-br ${p.color} opacity-90`} />
                      )}
                      <span className="relative z-10">{p.id}</span>
                    </button>
                  ))}
                </div>
              </div>

              {!session?.user?.unitKerjaId && (
                <div>
                  <label className="block text-[11px] font-bold text-white/60 uppercase tracking-widest mb-2 ml-1">Unit Kerja / Cabang</label>
                  <div className="relative">
                    <select
                      value={form.unitKerjaId}
                      onChange={e => setForm({ ...form, unitKerjaId: e.target.value, subUnitKerjaId: "" })}
                      className="w-full h-12 rounded-xl border border-white/20 bg-white/5 px-4 text-sm text-white focus:ring-2 focus:ring-cyan-500/50 outline-none appearance-none"
                    >
                      <option value="" disabled className="text-slate-800">Pilih Unit Kerja Anda...</option>
                      {refs.units.map(u => <option key={u.id} value={u.id} className="text-slate-800">{u.name}</option>)}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/50">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4 pb-12">
            <button
              type="submit"
              disabled={isSubmitting || !isFormValid}
              className="group relative w-full h-14 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold text-sm flex items-center justify-center gap-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_8px_30px_rgba(6,182,212,0.4)] hover:shadow-[0_8px_40px_rgba(6,182,212,0.6)] active:scale-[0.98] overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              <span className="relative z-10 flex items-center gap-2">
                {isSubmitting ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Sedang Mengirim...</>
                ) : (
                  <><Send className="w-5 h-5" /> Kirim Tiket Laporan</>
                )}
              </span>
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
