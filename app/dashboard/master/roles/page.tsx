"use client"

import { useState, useEffect } from "react"
import { Plus, Search, Pencil, Trash2, Shield, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import HandLoader from "@/components/ui/hand-loader"

export default function RolesPage() {
  const [roles, setRoles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  
  const [formOpen, setFormOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<any>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [form, setForm] = useState({ name: "", description: "" })

  const fetchRoles = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/master/roles")
      const data = await res.json()
      if (Array.isArray(data)) setRoles(data)
    } finally {
      setTimeout(() => setLoading(false), 500)
    }
  }

  useEffect(() => { fetchRoles() }, [])

  const openCreate = () => {
    setEditTarget(null)
    setForm({ name: "", description: "" })
    setFormOpen(true)
  }

  const openEdit = (role: any) => {
    setEditTarget(role)
    setForm({ name: role.name, description: role.description || "" })
    setFormOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const url = editTarget ? `/api/master/roles/${editTarget.id}` : "/api/master/roles"
      const res = await fetch(url, {
        method: editTarget ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      })
      if (res.ok) {
        setFormOpen(false)
        fetchRoles()
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
      const res = await fetch(`/api/master/roles/${id}`, { method: "DELETE" })
      if (res.ok) {
        setDeleteId(null)
        fetchRoles()
      } else {
        const err = await res.json()
        alert(err.error)
      }
    } catch {
      alert("Terjadi kesalahan")
    }
  }

  const filtered = roles.filter(r => 
    r.name.toLowerCase().includes(search.toLowerCase()) || 
    (r.description || "").toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <HandLoader text="Memuat Data Role..." />

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2"><Shield className="w-6 h-6 text-blue-600"/> Master Peran (Roles)</h2>
          <p className="text-sm text-slate-500">Kelola daftar hak akses sistem</p>
        </div>
        <Button onClick={openCreate} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" /> Tambah Role
        </Button>
      </div>

      <Card>
        <CardHeader className="p-4 border-b">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input placeholder="Cari role..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 dark:bg-zinc-900 border-b">
                <tr>
                  <th className="px-6 py-3 font-semibold">Nama Role</th>
                  <th className="px-6 py-3 font-semibold">Deskripsi</th>
                  <th className="px-6 py-3 font-semibold">Jml Pengguna</th>
                  <th className="px-6 py-3 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map(role => (
                  <tr key={role.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/50">
                    <td className="px-6 py-4 font-medium">{role.name}</td>
                    <td className="px-6 py-4 text-slate-500">{role.description || "-"}</td>
                    <td className="px-6 py-4 text-slate-500">{role._count?.users || 0} users</td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(role)} className="h-8 w-8 text-slate-400 hover:text-blue-600"><Pencil className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeleteId(role.id)} className="h-8 w-8 text-slate-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></Button>
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
          <DialogHeader><DialogTitle>{editTarget ? "Edit Role" : "Tambah Role Baru"}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Nama Role *</Label>
              <Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required placeholder="e.g. admin" />
            </div>
            <div className="space-y-2">
              <Label>Deskripsi</Label>
              <Input value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Penjelasan singkat" />
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
          <DialogHeader><DialogTitle>Hapus Role?</DialogTitle></DialogHeader>
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
