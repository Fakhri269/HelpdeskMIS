"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import Image from "next/image"
import {
  ChevronLeft, ChevronRight, Send, Loader2, CheckCircle2,
  Wifi, Monitor, AppWindow, Mail, Printer, MoreHorizontal,
  AlertTriangle, Zap, Flame, Info, FileText, Building2, ArrowRight
} from "lucide-react"

const PRIORITY_OPTIONS = [
  {
    id: "Low",
    label: "Low",
    sublabel: "Tidak mendesak",
    desc: "Masalah ringan, bisa menunggu",
    icon: Info,
    gradient: "from-slate-500 to-slate-400",
    ring: "ring-slate-400",
    bg: "bg-slate-50",
    text: "text-slate-700",
    badge: "bg-slate-100 text-slate-500",
    sla: "72 Jam"
  },
  {
    id: "Medium",
    label: "Medium",
    sublabel: "Perlu diperhatikan",
    desc: "Mengganggu pekerjaan sebagian",
    icon: AlertTriangle,
    gradient: "from-amber-500 to-yellow-400",
    ring: "ring-amber-400",
    bg: "bg-amber-50",
    text: "text-amber-700",
    badge: "bg-amber-100 text-amber-600",
    sla: "24 Jam"
  },
  {
    id: "High",
    label: "High",
    sublabel: "Segera ditangani",
    desc: "Menghambat pekerjaan utama",
    icon: Zap,
    gradient: "from-orange-500 to-orange-400",
    ring: "ring-orange-400",
    bg: "bg-orange-50",
    text: "text-orange-700",
    badge: "bg-orange-100 text-orange-600",
    sla: "4 Jam"
  },
  {
    id: "Critical",
    label: "Critical",
    sublabel: "Darurat!",
    desc: "Operasional terhenti total",
    icon: Flame,
    gradient: "from-red-600 to-rose-500",
    ring: "ring-red-400",
    bg: "bg-red-50",
    text: "text-red-700",
    badge: "bg-red-100 text-red-600",
    sla: "1 Jam"
  }
]

const DEFAULT_CATEGORIES = [
  { name: "Jaringan & Internet", icon: Wifi,         color: "from-blue-500 to-cyan-400",    bg: "bg-blue-50",   text: "text-blue-700"   },
  { name: "Hardware (PC/Laptop)", icon: Monitor,      color: "from-slate-600 to-slate-400",  bg: "bg-slate-50",  text: "text-slate-700"  },
  { name: "Aplikasi MIS",         icon: AppWindow,    color: "from-violet-500 to-purple-400",bg: "bg-violet-50", text: "text-violet-700" },
  { name: "Email & Akun",         icon: Mail,         color: "from-green-500 to-emerald-400",bg: "bg-green-50",  text: "text-green-700"  },
  { name: "Printer & Scanner",    icon: Printer,      color: "from-orange-500 to-amber-400", bg: "bg-orange-50", text: "text-orange-700" },
  { name: "Lainnya",              icon: MoreHorizontal,color:"from-pink-500 to-rose-400",    bg: "bg-pink-50",   text: "text-pink-700"   },
]

export default function CreateTicketPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [step, setStep]                   = useState(1) // 1 = kategori, 2 = detail, 3 = prioritas
  const [isSubmitting, setIsSubmitting]   = useState(false)
  const [refsLoaded, setRefsLoaded]       = useState(false)
  const [refs, setRefs]                   = useState<{ units: any[]; subUnits: any[] }>({ units: [], subUnits: [] })
  const [dbCategories, setDbCategories]   = useState<any[]>([])
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
      if (Array.isArray(catData) && catData.length > 0) setDbCategories(catData)
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
        setTimeout(() => router.push("/user"), 2500)
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

  const CATEGORIES = dbCategories.length > 0
    ? dbCategories.map((c: any) => DEFAULT_CATEGORIES.find(d => d.name === c.name) || { name: c.name, icon: MoreHorizontal, color: "from-slate-500 to-slate-400", bg: "bg-slate-50", text: "text-slate-700" })
    : DEFAULT_CATEGORIES

  const selectedPriority = PRIORITY_OPTIONS.find(p => p.id === form.priority)!

  // ── Loading ──
  if (status === "loading" || !refsLoaded) {
    return (
      <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-gradient-to-br from-[#0c5a7a] to-[#1e92bf] gap-4">
        <div className="w-16 h-16 rounded-3xl bg-white/20 flex items-center justify-center animate-pulse">
          <FileText className="w-8 h-8 text-white" />
        </div>
        <p className="text-white/70 text-sm font-medium">Memuat formulir...</p>
      </div>
    )
  }

  // ── Success ──
  if (successMessage) {
    return (
      <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-gradient-to-br from-[#0c5a7a] to-[#1e92bf] p-6 text-center">
        <div className="relative">
          <div className="absolute inset-0 bg-green-400/30 rounded-full blur-2xl scale-150 animate-pulse" />
          <div className="relative w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-3xl flex items-center justify-center mb-6 shadow-[0_20px_60px_rgba(34,197,94,0.4)] animate-in zoom-in duration-500">
            <CheckCircle2 className="w-12 h-12 text-white" />
          </div>
        </div>
        <h1 className="text-white font-black text-3xl mb-2 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">Tiket Terkirim!</h1>
        <p className="text-white/70 text-sm max-w-xs animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
          Laporan Anda telah berhasil dibuat. Tim IT akan segera memproses permintaan Anda.
        </p>
        <div className="mt-6 flex items-center gap-2 text-white/50 text-xs animate-in fade-in duration-500 delay-500">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          Mengarahkan ke beranda...
        </div>
      </div>
    )
  }

  const canGoNext = step === 1 ? !!form.category : step === 2 ? (form.title.trim().length > 3 && form.description.trim().length > 10) : true

  return (
    <div className="min-h-[100dvh] font-sans relative flex flex-col overflow-x-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* BG */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Image src="/PdamBG.jpg" alt="BG" fill className="object-cover object-center" priority />
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a4f6e]/90 via-[#0c5a7a]/88 to-[#155f7a]/85 backdrop-blur-sm" />
        {/* Decorative circles */}
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="absolute bottom-0 -left-24 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl" />
      </div>

      {/* HEADER */}
      <header className="relative z-20 w-full px-4 sm:px-6 pt-5 pb-4 flex items-center gap-4">
        <button
          onClick={() => step > 1 ? setStep(step - 1) : router.back()}
          className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white/10 text-white border border-white/20 hover:bg-white/20 active:scale-95 transition-all shadow-lg backdrop-blur-md"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-white font-black text-lg leading-tight">Buat Laporan Masalah</h1>
          <p className="text-cyan-300/70 text-[11px] font-semibold uppercase tracking-widest mt-0.5">Helpdesk IT · PDAM Tirta Kahuripan</p>
        </div>
      </header>

      {/* STEPPER */}
      <div className="relative z-20 px-4 sm:px-6 pb-5">
        <div className="flex items-center gap-2">
          {["Kategori", "Detail", "Prioritas"].map((label, i) => {
            const num = i + 1
            const done = step > num
            const active = step === num
            return (
              <div key={label} className="flex items-center gap-2 flex-1 last:flex-none">
                <div className={`flex items-center gap-2 transition-all duration-300`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-black shrink-0 transition-all duration-300 ${
                    done ? "bg-cyan-400 text-[#0a4f6e]" : active ? "bg-white text-[#0a4f6e] shadow-[0_0_16px_rgba(255,255,255,0.3)]" : "bg-white/10 text-white/40"
                  }`}>
                    {done ? <CheckCircle2 className="w-4 h-4" /> : num}
                  </div>
                  <span className={`text-[11px] font-bold transition-all ${active ? "text-white" : done ? "text-cyan-300" : "text-white/30"}`}>{label}</span>
                </div>
                {i < 2 && <div className={`flex-1 h-[2px] rounded-full transition-all duration-500 mx-1 ${step > num ? "bg-cyan-400" : "bg-white/10"}`} />}
              </div>
            )
          })}
        </div>
      </div>

      {/* MAIN */}
      <main className="relative z-10 flex-1 w-full max-w-xl mx-auto px-4 sm:px-6 pb-28">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          {/* ── STEP 1: KATEGORI ── */}
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-400 ease-out">
              <div className="mb-5">
                <h2 className="text-white font-black text-xl">Pilih Kategori Masalah</h2>
                <p className="text-white/50 text-sm mt-1">Apa jenis kendala yang Anda alami?</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {CATEGORIES.map((cat) => {
                  const Icon = cat.icon
                  const selected = form.category === cat.name
                  return (
                    <button
                      key={cat.name}
                      type="button"
                      onClick={() => setForm({ ...form, category: cat.name })}
                      className={`relative group flex flex-col items-start gap-3 p-4 rounded-2xl border transition-all duration-200 text-left overflow-hidden ${
                        selected
                          ? "bg-white border-white shadow-[0_8px_30px_rgba(255,255,255,0.15)] scale-[1.02]"
                          : "bg-white/8 border-white/15 hover:bg-white/15 hover:border-white/30 active:scale-[0.98]"
                      }`}
                    >
                      {selected && <div className={`absolute inset-0 bg-gradient-to-br ${cat.color} opacity-8`} />}
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                        selected ? `bg-gradient-to-br ${cat.color} shadow-lg` : "bg-white/10"
                      }`}>
                        <Icon className={`w-5 h-5 ${selected ? "text-white" : "text-white/70"}`} />
                      </div>
                      <span className={`text-[12px] font-bold leading-tight relative z-10 ${selected ? "text-[#0a4f6e]" : "text-white/80"}`}>
                        {cat.name}
                      </span>
                      {selected && (
                        <div className="absolute top-2.5 right-2.5">
                          <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${cat.color} flex items-center justify-center shadow`}>
                            <CheckCircle2 className="w-3 h-3 text-white" />
                          </div>
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* ── STEP 2: DETAIL ── */}
          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-400 ease-out space-y-4">
              <div className="mb-1">
                <h2 className="text-white font-black text-xl">Detail Laporan</h2>
                <p className="text-white/50 text-sm mt-1">Jelaskan masalah Anda dengan lengkap</p>
              </div>

              {/* Category pill */}
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 border border-white/15 w-fit">
                <div className={`w-5 h-5 rounded-lg bg-gradient-to-br ${CATEGORIES.find(c => c.name === form.category)?.color || "from-slate-500 to-slate-400"} flex items-center justify-center`}>
                  {(() => { const Icon = CATEGORIES.find(c => c.name === form.category)?.icon || MoreHorizontal; return <Icon className="w-3 h-3 text-white" /> })()}
                </div>
                <span className="text-white text-[11px] font-bold">{form.category}</span>
              </div>

              {/* Title */}
              <div className="bg-white/8 backdrop-blur-sm border border-white/15 rounded-2xl p-4 space-y-1">
                <label className="text-[10px] font-bold text-cyan-300/80 uppercase tracking-widest">
                  Judul Singkat <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  placeholder="Contoh: Aplikasi MIS lambat saat dibuka"
                  maxLength={100}
                  className="w-full bg-transparent text-white text-sm placeholder:text-white/30 outline-none pt-1"
                  required
                />
                <div className="flex justify-end">
                  <span className={`text-[10px] font-semibold transition-colors ${form.title.length > 80 ? "text-orange-400" : "text-white/25"}`}>
                    {form.title.length}/100
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className="bg-white/8 backdrop-blur-sm border border-white/15 rounded-2xl p-4 space-y-1">
                <label className="text-[10px] font-bold text-cyan-300/80 uppercase tracking-widest">
                  Detail Laporan <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="Jelaskan secara detail: kapan terjadi, pesan error yang muncul, langkah yang sudah dicoba..."
                  className="w-full min-h-[140px] bg-transparent text-white text-sm placeholder:text-white/30 outline-none resize-none pt-1 leading-relaxed"
                  required
                />
                <div className="flex justify-between items-center">
                  <span className={`text-[10px] font-semibold transition-colors ${form.description.length >= 10 ? "text-emerald-400" : "text-white/30"}`}>
                    {form.description.length >= 10 ? "✓ Deskripsi cukup" : `Minimal 10 karakter (${10 - form.description.length} lagi)`}
                  </span>
                </div>
              </div>

              {/* Unit Kerja (only if not set) */}
              {!session?.user?.unitKerjaId && (
                <div className="bg-white/8 backdrop-blur-sm border border-white/15 rounded-2xl p-4 space-y-2">
                  <label className="text-[10px] font-bold text-cyan-300/80 uppercase tracking-widest flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5" /> Unit Kerja
                  </label>
                  <div className="relative">
                    <select
                      value={form.unitKerjaId}
                      onChange={e => setForm({ ...form, unitKerjaId: e.target.value, subUnitKerjaId: "" })}
                      className="w-full bg-transparent text-white text-sm outline-none appearance-none pr-6 pt-0.5"
                    >
                      <option value="" disabled className="text-slate-800">Pilih Unit Kerja Anda...</option>
                      {refs.units.map(u => <option key={u.id} value={u.id} className="text-slate-800">{u.name}</option>)}
                    </select>
                    <ChevronRight className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 rotate-90 pointer-events-none" />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── STEP 3: PRIORITAS ── */}
          {step === 3 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-400 ease-out space-y-4">
              <div className="mb-1">
                <h2 className="text-white font-black text-xl">Tingkat Prioritas</h2>
                <p className="text-white/50 text-sm mt-1">Seberapa mendesak masalah ini?</p>
              </div>

              <div className="space-y-3">
                {PRIORITY_OPTIONS.map(p => {
                  const Icon = p.icon
                  const selected = form.priority === p.id
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setForm({ ...form, priority: p.id })}
                      className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all duration-200 text-left ${
                        selected
                          ? "bg-white border-white shadow-[0_8px_30px_rgba(255,255,255,0.1)] scale-[1.01]"
                          : "bg-white/8 border-white/15 hover:bg-white/12 active:scale-[0.99]"
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-all ${
                        selected ? `bg-gradient-to-br ${p.gradient} shadow-lg` : "bg-white/10"
                      }`}>
                        <Icon className={`w-5 h-5 ${selected ? "text-white" : "text-white/60"}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className={`text-sm font-black ${selected ? "text-slate-800" : "text-white"}`}>{p.label}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${selected ? p.badge : "bg-white/10 text-white/40"}`}>{p.sublabel}</span>
                        </div>
                        <p className={`text-[11px] ${selected ? "text-slate-500" : "text-white/40"}`}>{p.desc}</p>
                      </div>
                      <div className={`shrink-0 text-center transition-all ${selected ? "opacity-100" : "opacity-30"}`}>
                        <div className={`text-[10px] font-bold px-2.5 py-1 rounded-xl ${selected ? `bg-gradient-to-br ${p.gradient} text-white shadow` : "bg-white/10 text-white"}`}>
                          ≤ {p.sla}
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>

              {/* Summary card */}
              <div className="mt-2 bg-white/8 border border-white/15 rounded-2xl p-4 space-y-2.5">
                <p className="text-[10px] font-bold text-cyan-300/70 uppercase tracking-widest">Ringkasan Laporan</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-white/40 text-[11px] w-20 shrink-0">Kategori</span>
                    <span className="text-white text-[11px] font-semibold truncate">{form.category}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-white/40 text-[11px] w-20 shrink-0">Judul</span>
                    <span className="text-white text-[11px] font-semibold truncate">{form.title}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-white/40 text-[11px] w-20 shrink-0">Prioritas</span>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r ${selectedPriority.gradient} text-white`}>{form.priority}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* NAVIGATION BUTTONS */}
          <div className="pt-2 space-y-3">
            {step < 3 ? (
              <button
                type="button"
                disabled={!canGoNext}
                onClick={() => setStep(step + 1)}
                className="group w-full h-14 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-black text-sm flex items-center justify-center gap-3 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-[0_8px_30px_rgba(6,182,212,0.35)] hover:shadow-[0_8px_40px_rgba(6,182,212,0.55)] hover:-translate-y-0.5 active:scale-[0.98] overflow-hidden"
              >
                <span>Lanjut</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting || !canGoNext}
                className="group relative w-full h-14 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-black text-sm flex items-center justify-center gap-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_8px_30px_rgba(6,182,212,0.4)] hover:shadow-[0_8px_40px_rgba(6,182,212,0.6)] hover:-translate-y-0.5 active:scale-[0.98] overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                <span className="relative z-10 flex items-center gap-2">
                  {isSubmitting ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Sedang Mengirim...</>
                  ) : (
                    <><Send className="w-5 h-5" /> Kirim Laporan</>
                  )}
                </span>
              </button>
            )}
          </div>
        </form>
      </main>
    </div>
  )
}
