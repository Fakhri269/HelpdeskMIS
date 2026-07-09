"use client"

import { useState, useEffect } from "react"
import { Plus, Search, Pencil, Trash2, Layers, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import HandLoader from "@/components/ui/hand-loader"

export default function SubUnitsPage() {
  const [subUnits, setSubUnits] = useState<any[]>([])
  const [units, setUnits] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  
  const [formOpen, setFormOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<any>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [form, setForm] = useState({ name: "", unitKerjaId: "" })

  const fetchData = async () => {
    setLoading(true)
    try {
      const [subUnitsRes, unitsRes] = await Promise.all([
        fetch("/api/master/sub-units"),
        fetch("/api/master/units")
      ])
      const subUnitsData = await subUnitsRes.json()
      const unitsData = await unitsRes.json()
      if (Array.isArray(subUnitsData)) setSubUnits(subUnitsData)
      if (Array.isArray(unitsData)) setUnits(unitsData)
    } finally {
      setTimeout(() => setLoading(false), 500)
    }
  }

  useEffect(() => { fetchData() }, [])

  const openCreate = () => {
    setEditTarget(null)
    setForm({ name: "", unitKerjaId: "" })
    setFormOpen(true)
  }

  const openEdit = (subUnit: any) => {
    setEditTarget(subUnit)
    setForm({ name: subUnit.name, unitKerjaId: subUnit.unitKerjaId })
    setFormOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const url = editTarget ? `/api/master/sub-units/${editTarget.id}` : "/api/master/sub-units"
      const res = await fetch(url, {
        method: editTarget ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      })
      if (res.ok) {
        setFormOpen(false)
        fetchData()
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
      const res = await fetch(`/api/master/sub-units/${id}`, { method: "DELETE" })
      if (res.ok) {
        setDeleteId(null)
        fetchData()
      } else {
        const err = await res.json()
        alert(err.error)
      }
    } catch {
      alert("Terjadi kesalahan")
    }
  }

  const filtered = subUnits.filter(su => 
    su.name.toLowerCase().includes(search.toLowerCase()) ||
    su.unitKerja?.name?.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <HandLoader text="Memuat Data Sub Unit..." />

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2"><Layers className="w-6 h-6 text-blue-600"/> Master Sub Unit Kerja</h2>
          <p className="text-sm text-slate-500">Kelola departemen/divisi spesifik dalam unit</p>
        </div>
        <Button onClick={openCreate} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" /> Tambah Sub Unit
        </Button>
      </div>

      <Card>
        <CardHeader className="p-4 border-b">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input placeholder="Cari sub unit atau unit..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 dark:bg-zinc-900 border-b">
                <tr>
                  <th className="px-6 py-3 font-semibold">Nama Sub Unit</th>
                  <th className="px-6 py-3 font-semibold">Induk Unit Kerja</th>
                  <th className="px-6 py-3 font-semibold">Jml Pengguna</th>
                  <th className="px-6 py-3 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map(su => (
                  <tr key={su.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/50">
                    <td className="px-6 py-4 font-medium">{su.name}</td>
                    <td className="px-6 py-4 text-slate-500">{su.unitKerja?.name}</td>
                    <td className="px-6 py-4 text-slate-500">{su._count?.users || 0} users</td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(su)} className="h-8 w-8 text-slate-400 hover:text-blue-600"><Pencil className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeleteId(su.id)} className="h-8 w-8 text-slate-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></Button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-slate-500">Data tidak ditemukan</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editTarget ? "Edit Sub Unit Kerja" : "Tambah Sub Unit Kerja Baru"}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Nama Sub Unit *</Label>
              <Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required placeholder="e.g. Divisi IT" />
            </div>
            <div className="space-y-2">
              <Label>Induk Unit Kerja *</Label>
              <Select value={form.unitKerjaId} onValueChange={v => setForm({...form, unitKerjaId: v})} required>
                <SelectTrigger><SelectValue placeholder="Pilih unit kerja" /></SelectTrigger>
                <SelectContent>
                  {units.map(u => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}
                </SelectContent>
              </Select>
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
          <DialogHeader><DialogTitle>Hapus Sub Unit Kerja?</DialogTitle></DialogHeader>
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
