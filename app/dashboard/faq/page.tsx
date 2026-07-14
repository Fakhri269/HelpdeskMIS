"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import {
  HelpCircle, Search, Plus, ChevronDown, ChevronUp,
  Tag, BookOpen, Loader2, Pencil, Trash2, X, Check
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

export default function FAQPage() {
  const { data: session } = useSession()
  const [faqs, setFaqs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [openId, setOpenId] = useState<string | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editTarget, setEditTarget] = useState<any | null>(null)

  const [form, setForm] = useState({ question: "", answer: "", tags: "" })

  const canEdit = ["superadmin", "helpdesk_manager", "helpdesk_asmen"].includes(session?.user?.role ?? "")
  const canDelete = session?.user?.role === "superadmin"

  const fetchFaqs = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/faq")
      const data = await res.json()
      if (Array.isArray(data)) setFaqs(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchFaqs() }, [fetchFaqs])

  const openCreate = () => {
    setEditTarget(null)
    setForm({ question: "", answer: "", tags: "" })
    setFormOpen(true)
  }

  const openEdit = (faq: any) => {
    setEditTarget(faq)
    setForm({ question: faq.question, answer: faq.answer, tags: faq.tags ?? "" })
    setFormOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const url = editTarget ? `/api/faq/${editTarget.id}` : "/api/faq"
      const method = editTarget ? "PUT" : "POST"
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        setFormOpen(false)
        fetchFaqs()
      } else {
        const err = await res.json()
        alert(err.error)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/faq/${id}`, { method: "DELETE" })
      setDeleteId(null)
      fetchFaqs()
    } catch {
      alert("Gagal menghapus")
    }
  }

  const allTags = Array.from(new Set(faqs.flatMap(f => (f.tags ?? "").split(",").map((t: string) => t.trim()).filter(Boolean))))
  const [activeTag, setActiveTag] = useState<string | null>(null)

  const filtered = faqs.filter(f => {
    const matchSearch = f.question.toLowerCase().includes(search.toLowerCase()) ||
      f.answer.toLowerCase().includes(search.toLowerCase())
    const matchTag = !activeTag || (f.tags ?? "").toLowerCase().includes(activeTag.toLowerCase())
    return matchSearch && matchTag
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-7 h-7 text-blue-600" />
            Knowledge Base & FAQ
          </h1>
          <p className="text-sm text-slate-500 mt-1">Temukan jawaban untuk masalah IT yang umum terjadi</p>
        </div>
        {canEdit && (
          <Button onClick={openCreate} className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20 gap-2">
            <Plus className="w-4 h-4" />
            Tambah FAQ
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <Input
          placeholder="Cari pertanyaan, topik, atau kata kunci..."
          className="pl-12 py-6 text-base bg-white dark:bg-zinc-900 rounded-2xl border-slate-200 dark:border-zinc-800 shadow-sm focus-visible:ring-blue-500"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Tag Pills */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTag(null)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border ${
              !activeTag ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20"
                         : "bg-white dark:bg-zinc-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-zinc-800 hover:border-blue-300"
            }`}
          >
            Semua
          </button>
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => setActiveTag(tag === activeTag ? null : tag)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border ${
                activeTag === tag ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20"
                                  : "bg-white dark:bg-zinc-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-zinc-800 hover:border-blue-300"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {/* FAQ List */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800">
              <HelpCircle className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p className="text-slate-500">Tidak ada artikel ditemukan</p>
              {canEdit && (
                <Button className="mt-4 bg-blue-600 hover:bg-blue-700" onClick={openCreate}>
                  <Plus className="w-4 h-4 mr-2" /> Tambah FAQ Pertama
                </Button>
              )}
            </div>
          ) : filtered.map(faq => {
            const isOpen = openId === faq.id
            const tags = (faq.tags ?? "").split(",").map((t: string) => t.trim()).filter(Boolean)
            return (
              <div
                key={faq.id}
                className={`bg-white dark:bg-zinc-900 rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isOpen ? "border-blue-300 dark:border-blue-700 shadow-md shadow-blue-500/10" : "border-slate-200 dark:border-zinc-800 hover:border-blue-200"
                }`}
              >
                <div className="flex items-center">
                  <button
                    className="flex-1 flex items-center justify-between p-5 text-left gap-4"
                    onClick={() => setOpenId(isOpen ? null : faq.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                        isOpen ? "bg-blue-600 text-white" : "bg-blue-50 dark:bg-blue-900/20 text-blue-600"
                      }`}>
                        <HelpCircle className="w-4 h-4" />
                      </div>
                      <p className="font-semibold text-slate-800 dark:text-white text-sm sm:text-base">{faq.question}</p>
                    </div>
                    {isOpen ? <ChevronUp className="w-5 h-5 text-blue-600 shrink-0" /> : <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />}
                  </button>
                  {canEdit && (
                    <div className="flex items-center gap-1 pr-4">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-blue-600" onClick={() => openEdit(faq)}>
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      {canDelete && (
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-600" onClick={() => setDeleteId(faq.id)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </div>
                  )}
                </div>
                {isOpen && (
                  <div className="px-5 pb-5">
                    <div className="ml-11">
                      <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-zinc-800/50 rounded-xl p-4">
                        {faq.answer}
                      </p>
                      {tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {tags.map((tag: string) => (
                            <span key={tag} className="flex items-center gap-1 text-xs text-slate-400 bg-slate-100 dark:bg-zinc-800 px-2.5 py-1 rounded-full">
                              <Tag className="w-3 h-3" /> {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Bottom CTA */}
      <div className="rounded-2xl p-6 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg shadow-[#2166B3]/20" style={{ background: "linear-gradient(135deg, #2166B3 0%, #1AA0AC 100%)" }}>
        <div>
          <p className="font-bold text-lg">Tidak menemukan jawaban?</p>
          <p className="text-blue-100 text-sm mt-1">Tim MIS siap membantu Anda melalui sistem tiket</p>
        </div>
        <Button
          className="bg-white text-blue-600 hover:bg-blue-50 font-semibold shadow-lg shrink-0"
          onClick={() => window.location.href = "/dashboard/tickets"}
        >
          Buat Tiket Baru
        </Button>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle>{editTarget ? "Edit FAQ" : "Tambah FAQ Baru"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Pertanyaan *</Label>
              <Input placeholder="Tulis pertanyaan..." value={form.question} onChange={e => setForm({ ...form, question: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label>Jawaban *</Label>
              <textarea
                rows={5}
                placeholder="Tulis jawaban lengkap..."
                className="w-full rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.answer}
                onChange={e => setForm({ ...form, answer: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Tags (pisahkan dengan koma)</Label>
              <Input placeholder="e.g. password, akun, windows" value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>Batal</Button>
              <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700">
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
                {editTarget ? "Simpan Perubahan" : "Tambah FAQ"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus FAQ?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-500">Tindakan ini tidak bisa dibatalkan. FAQ akan dihapus permanen.</p>
          <DialogFooter className="pt-4">
            <Button variant="outline" onClick={() => setDeleteId(null)}>Batal</Button>
            <Button variant="destructive" onClick={() => deleteId && handleDelete(deleteId)}>Ya, Hapus</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
