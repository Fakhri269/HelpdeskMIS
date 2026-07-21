"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { ChevronLeft, Send, Loader2, FileText, AlertCircle } from "lucide-react"

export default function CreateTicketPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [refsLoaded, setRefsLoaded] = useState(false)
  const [refs, setRefs] = useState<{ units: any[]; subUnits: any[] }>({ units: [], subUnits: [] })
  const [dbCategories, setDbCategories] = useState<string[]>([])

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
        router.push("/user")
      } else {
        const err = await res.json()
        alert(err.error || "Terjadi kesalahan")
      }
    } catch {
      alert("Terjadi kesalahan sistem")
    } finally {
      setIsSubmitting(false)
    }
  }

  const isFormValid = form.title.trim().length > 0 && form.description.trim().length > 0 && form.category

  if (status === "loading" || !refsLoaded) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center" style={{ background: "linear-gradient(160deg, #0e7fb0 0%, #1aa3c8 50%, #c8ecf5 100%)" }}>
        <Loader2 className="w-8 h-8 text-white animate-spin" />
      </div>
    )
  }

  const CATEGORIES = dbCategories.length > 0 ? dbCategories : [
    "Jaringan & Internet", "Hardware (PC/Laptop)", "Aplikasi MIS",
    "Email & Akun", "Printer & Scanner", "Lainnya"
  ]

  return (
    <div className="min-h-[100dvh] font-sans flex flex-col" style={{ background: "linear-gradient(160deg, #0e7fb0 0%, #1aa3c8 50%, #c8ecf5 100%)" }}>
      <header className="sticky top-0 z-30 w-full backdrop-blur-md bg-[#0e7fb0]/80 border-b border-white/10 px-4 py-4 flex items-center gap-3">
        <button onClick={() => router.back()} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 transition-all">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-white font-bold text-lg leading-tight">Buat Tiket Baru</h1>
          <p className="text-blue-200 text-xs">Laporkan kendala IT Anda</p>
        </div>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full p-4 pb-24">
        <form onSubmit={handleSubmit} className="bg-white/95 backdrop-blur-sm rounded-2xl p-5 shadow-xl space-y-6">
          <div className="space-y-4">
            <h2 className="text-slate-800 font-bold text-sm flex items-center gap-2 border-b pb-2">
              <FileText className="w-4 h-4 text-[#0e7fb0]" /> Informasi Dasar
            </h2>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Kategori Masalah <span className="text-red-500">*</span></label>
              <select
                value={form.category}
                onChange={e => setForm({ ...form, category: e.target.value })}
                className="w-full h-11 rounded-xl border-slate-200 bg-slate-50 px-3 text-sm focus:ring-2 focus:ring-[#0e7fb0] focus:border-transparent outline-none"
                required
              >
                <option value="" disabled>Pilih kategori...</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Judul Masalah <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                placeholder="Contoh: Printer di ruang rapat tidak bisa print"
                className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm focus:ring-2 focus:ring-[#0e7fb0] focus:border-transparent outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Detail Kendala <span className="text-red-500">*</span></label>
              <textarea
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                placeholder="Jelaskan masalah secara detail..."
                className="w-full min-h-[120px] p-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:ring-2 focus:ring-[#0e7fb0] focus:border-transparent outline-none resize-y"
                required
              />
            </div>
          </div>

          <div className="space-y-4 pt-2">
            <h2 className="text-slate-800 font-bold text-sm flex items-center gap-2 border-b pb-2">
              <AlertCircle className="w-4 h-4 text-[#0e7fb0]" /> Prioritas & Lokasi
            </h2>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Tingkat Prioritas</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {["Low", "Medium", "High", "Critical"].map(p => (
                  <button
                    key={p} type="button"
                    onClick={() => setForm({ ...form, priority: p })}
                    className={`h-10 rounded-xl text-xs font-semibold transition-all border ${
                      form.priority === p ? "bg-[#0e7fb0] text-white border-transparent" : "bg-white text-slate-600 hover:bg-slate-50 border-slate-200"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {!session?.user?.unitKerjaId && (
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Unit Kerja / Cabang</label>
                <select
                  value={form.unitKerjaId}
                  onChange={e => setForm({ ...form, unitKerjaId: e.target.value, subUnitKerjaId: "" })}
                  className="w-full h-11 rounded-xl border-slate-200 bg-slate-50 px-3 text-sm focus:ring-2 focus:ring-[#0e7fb0] outline-none"
                >
                  <option value="" disabled>Pilih Unit Kerja...</option>
                  {refs.units.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
              </div>
            )}
          </div>

          <div className="pt-4 pb-2">
            <button
              type="submit"
              disabled={isSubmitting || !isFormValid}
              className="w-full h-12 rounded-xl bg-[#0e7fb0] text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#0a668f] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#0e7fb0]/30"
            >
              {isSubmitting ? <><Loader2 className="w-5 h-5 animate-spin" /> Mengirim...</> : <><Send className="w-5 h-5" /> Kirim Tiket Laporan</>}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
