"use client"

import { useState, useEffect } from "react"
import { Plus, Search, Pencil, Trash2, Building2, Loader2, FolderPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import HandLoader from "@/components/ui/hand-loader"

export default function UnitsPage() {
  const [units, setUnits] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  
  const [formOpen, setFormOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<any>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [form, setForm] = useState({ name: "" })

  // State for Sub Unit Form
  const [subUnitFormOpen, setSubUnitFormOpen] = useState(false)
  const [selectedUnit, setSelectedUnit] = useState<any>(null)
  const [subUnitName, setSubUnitName] = useState("")
  const [isSubmittingSub, setIsSubmittingSub] = useState(false)

  const fetchUnits = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/master/units")
      const data = await res.json()
      if (Array.isArray(data)) setUnits(data)
    } finally {
      setTimeout(() => setLoading(false), 500)
    }
  }

  useEffect(() => { fetchUnits() }, [])

  const openCreate = () => {
    setEditTarget(null)
    setForm({ name: "" })
    setFormOpen(true)
  }

  const openEdit = (unit: any) => {
    setEditTarget(unit)
    setForm({ name: unit.name })
    setFormOpen(true)
  }

  const openCreateSubUnit = (unit: any) => {
    setSelectedUnit(unit)
    setSubUnitName("")
    setSubUnitFormOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const url = editTarget ? `/api/master/units/${editTarget.id}` : "/api/master/units"
      const res = await fetch(url, {
        method: editTarget ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      })
      if (res.ok) {
        setFormOpen(false)
        fetchUnits()
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
      const res = await fetch(`/api/master/units/${id}`, { method: "DELETE" })
      if (res.ok) {
        setDeleteId(null)
        fetchUnits()
      } else {
        const err = await res.json()
        alert(err.error)
      }
    } catch {
      alert("Terjadi kesalahan")
    }
  }

  const handleSubUnitSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmittingSub(true)
    try {
      const res = await fetch("/api/master/sub-units", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: subUnitName, unitKerjaId: selectedUnit.id })
      })
      if (res.ok) {
        setSubUnitFormOpen(false)
        fetchUnits() // Refresh count
        alert(`Berhasil menambahkan sub unit ${subUnitName}`)
      } else {
        const err = await res.json()
        alert(err.error)
      }
    } finally {
      setIsSubmittingSub(false)
    }
  }

  const filtered = units.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <HandLoader text="Memuat Data Unit Kerja..." />

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2"><Building2 className="w-6 h-6 text-blue-600"/> Master Unit Kerja</h2>
          <p className="text-sm text-slate-500">Kelola daftar unit/cabang perusahaan</p>
        </div>
        <Button onClick={openCreate} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" /> Tambah Unit
        </Button>
      </div>

      <Card>
        <CardHeader className="p-4 border-b">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input placeholder="Cari unit..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 dark:bg-zinc-900 border-b">
                <tr>
                  <th className="px-6 py-3 font-semibold">Nama Unit Kerja</th>
                  <th className="px-6 py-3 font-semibold">Jml Sub Unit</th>
                  <th className="px-6 py-3 font-semibold">Jml Pengguna</th>
                  <th className="px-6 py-3 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map(unit => (
                  <tr key={unit.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/50">
                    <td className="px-6 py-4 font-medium">{unit.name}</td>
                    <td className="px-6 py-4 text-slate-500">{unit._count?.subUnits || 0} sub unit</td>
                    <td className="px-6 py-4 text-slate-500">{unit._count?.users || 0} users</td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="ghost" size="icon" onClick={() => openCreateSubUnit(unit)} className="h-8 w-8 text-slate-400 hover:text-green-600" title="Tambah Sub Unit"><FolderPlus className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => openEdit(unit)} className="h-8 w-8 text-slate-400 hover:text-blue-600" title="Edit"><Pencil className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeleteId(unit.id)} className="h-8 w-8 text-slate-400 hover:text-red-600" title="Hapus"><Trash2 className="w-4 h-4" /></Button>
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
          <DialogHeader><DialogTitle>{editTarget ? "Edit Unit Kerja" : "Tambah Unit Kerja Baru"}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Nama Unit Kerja *</Label>
              <Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required placeholder="e.g. Cabang Bandung" />
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
          <DialogHeader><DialogTitle>Hapus Unit Kerja?</DialogTitle></DialogHeader>
          <p className="text-sm text-slate-500">Tindakan ini tidak bisa dibatalkan.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Batal</Button>
            <Button variant="destructive" onClick={() => deleteId && handleDelete(deleteId)}>Ya, Hapus</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Sub Unit Dialog */}
      <Dialog open={subUnitFormOpen} onOpenChange={setSubUnitFormOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Tambah Sub Unit untuk {selectedUnit?.name}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubUnitSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Nama Sub Unit *</Label>
              <Input value={subUnitName} onChange={e => setSubUnitName(e.target.value)} required placeholder="e.g. Divisi IT" />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setSubUnitFormOpen(false)}>Batal</Button>
              <Button type="submit" disabled={isSubmittingSub} className="bg-green-600 hover:bg-green-700">
                {isSubmittingSub ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null} Simpan Sub Unit
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
