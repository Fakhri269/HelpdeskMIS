"use client"

import { useState, useEffect } from "react"
import { Plus, Search, Pencil, Trash2, Clock, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import HandLoader from "@/components/ui/hand-loader"

export default function SLAPage() {
  const [slas, setSlas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  
  const [formOpen, setFormOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<any>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [form, setForm] = useState({ priority: "", hours: 0 })

  const fetchSLA = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/master/sla")
      const data = await res.json()
      if (Array.isArray(data)) setSlas(data)
    } finally {
      setTimeout(() => setLoading(false), 500)
    }
  }

  useEffect(() => { fetchSLA() }, [])

  const openCreate = () => {
    setEditTarget(null)
    setForm({ priority: "", hours: 24 })
    setFormOpen(true)
  }

  const openEdit = (sla: any) => {
    setEditTarget(sla)
    setForm({ priority: sla.priority, hours: sla.hours })
    setFormOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const url = editTarget ? `/api/master/sla/${editTarget.id}` : "/api/master/sla"
      const res = await fetch(url, {
        method: editTarget ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, hours: Number(form.hours) })
      })
      if (res.ok) {
        setFormOpen(false)
        fetchSLA()
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
      const res = await fetch(`/api/master/sla/${id}`, { method: "DELETE" })
      if (res.ok) {
        setDeleteId(null)
        fetchSLA()
      } else {
        const err = await res.json()
        alert(err.error)
      }
    } catch {
      alert("Terjadi kesalahan")
    }
  }

  const filtered = slas.filter(s => 
    s.priority.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <HandLoader text="Memuat Data SLA..." />

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2"><Clock className="w-6 h-6 text-blue-600"/> Master Service Level Agreement (SLA)</h2>
          <p className="text-sm text-slate-500">Kelola target waktu penyelesaian berdasarkan prioritas</p>
        </div>
        <Button onClick={openCreate} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" /> Tambah SLA
        </Button>
      </div>

      <Card>
        <CardHeader className="p-4 border-b">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input placeholder="Cari prioritas..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 dark:bg-zinc-900 border-b">
                <tr>
                  <th className="px-6 py-3 font-semibold">Tingkat Prioritas</th>
                  <th className="px-6 py-3 font-semibold">Target Waktu (Jam)</th>
                  <th className="px-6 py-3 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map(sla => (
                  <tr key={sla.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/50">
                    <td className="px-6 py-4 font-medium">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        sla.priority === 'Critical' ? 'bg-red-100 text-red-700' :
                        sla.priority === 'High' ? 'bg-orange-100 text-orange-700' :
                        sla.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {sla.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-700 font-medium">{sla.hours} Jam</td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(sla)} className="h-8 w-8 text-slate-400 hover:text-blue-600"><Pencil className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeleteId(sla.id)} className="h-8 w-8 text-slate-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></Button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-slate-500">Data tidak ditemukan</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editTarget ? "Edit SLA" : "Tambah SLA Baru"}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Tingkat Prioritas *</Label>
              <Select value={form.priority} onValueChange={v => setForm({...form, priority: v as string})} required>
                <SelectTrigger><SelectValue placeholder="Pilih prioritas" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Target Waktu (Jam) *</Label>
              <Input type="number" min="1" value={form.hours} onChange={e => setForm({...form, hours: Number(e.target.value)})} required />
              <p className="text-xs text-slate-500">Waktu maksimal penyelesaian tiket dalam jam.</p>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>Batal</Button>
              <Button type="submit" disabled={isSubmitting} className="bg-blue-600">
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null} Simpan
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Hapus SLA?</DialogTitle></DialogHeader>
          <p className="text-sm text-slate-500">Tindakan ini tidak bisa dibatalkan.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Batal</Button>
            <Button variant="destructive" onClick={() => deleteId && handleDelete(deleteId)}>Ya, Hapus</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
