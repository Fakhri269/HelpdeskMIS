"use client"

import { useState, useEffect } from "react"
import { Plus, Search, MoreVertical, Edit, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import HandLoader from "@/components/ui/hand-loader"

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [refs, setRefs] = useState<{roles: any[], units: any[], subUnits: any[]}>({ roles: [], units: [], subUnits: [] })
  
  // Form State
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: "", email: "", password: "", roleId: "", unitKerjaId: "", subUnitKerjaId: "", position: ""
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    try {
      const [usersRes, refsRes] = await Promise.all([
        fetch("/api/master/users"),
        fetch("/api/master/reference")
      ])
      const usersData = await usersRes.json()
      const refsData = await refsRes.json()
      
      if (Array.isArray(usersData)) setUsers(usersData)
      setRefs(refsData)
    } catch (e) {
      console.error(e)
    } finally {
      // simulate artificial delay to show loader as requested
      setTimeout(() => setLoading(false), 800)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const res = await fetch("/api/master/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })
      if (res.ok) {
        setOpen(false)
        setFormData({ name: "", email: "", password: "", roleId: "", unitKerjaId: "", subUnitKerjaId: "", position: "" })
        fetchData()
      } else {
        const err = await res.json()
        alert(err.error || "Terjadi kesalahan")
      }
    } catch (error) {
      alert("Terjadi kesalahan sistem")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return <HandLoader text="Memuat Data Pengguna..." />
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Master Pengguna</h2>
          <p className="text-muted-foreground text-sm">
            Kelola data staf dan pengguna aplikasi
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Tambah Pengguna
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Tambah Pengguna Baru</DialogTitle>
                <DialogDescription>
                  Isi data lengkap pengguna baru di bawah ini.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">Nama Lengkap</Label>
                  <Input id="name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="col-span-3" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right">Email</Label>
                  <Input id="email" type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="col-span-3" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="password" className="text-right">Password</Label>
                  <Input id="password" type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="col-span-3" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="role" className="text-right">Role</Label>
                  <div className="col-span-3">
                    <Select value={formData.roleId} onValueChange={v => setFormData({...formData, roleId: v})} required>
                      <SelectTrigger><SelectValue placeholder="Pilih role" /></SelectTrigger>
                      <SelectContent>
                        {refs.roles.map(r => <SelectItem key={r.id} value={r.id}>{r.description || r.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="unit" className="text-right">Unit Kerja</Label>
                  <div className="col-span-3">
                    <Select value={formData.unitKerjaId} onValueChange={v => setFormData({...formData, unitKerjaId: v, subUnitKerjaId: ""})}>
                      <SelectTrigger><SelectValue placeholder="Pilih unit kerja (opsional)" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Kosongkan</SelectItem>
                        {refs.units.map(u => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {formData.unitKerjaId && formData.unitKerjaId !== "none" && (
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="subunit" className="text-right">Sub Unit</Label>
                    <div className="col-span-3">
                      <Select value={formData.subUnitKerjaId} onValueChange={v => setFormData({...formData, subUnitKerjaId: v})}>
                        <SelectTrigger><SelectValue placeholder="Pilih sub unit (opsional)" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Kosongkan</SelectItem>
                          {refs.subUnits
                            .filter(su => su.unitKerjaId === formData.unitKerjaId)
                            .map(su => <SelectItem key={su.id} value={su.id}>{su.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="position" className="text-right">Jabatan</Label>
                  <Input id="position" placeholder="e.g. Asisten Manajer" value={formData.position} onChange={e => setFormData({...formData, position: e.target.value})} className="col-span-3" />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Batal</Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Menyimpan..." : "Simpan Pengguna"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="py-4 px-6 border-b">
          <div className="flex items-center">
            <div className="relative w-72">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
              <Input placeholder="Cari nama atau email..." className="pl-9 bg-slate-50 dark:bg-zinc-900 border-none" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50 dark:bg-zinc-900/50">
              <TableRow>
                <TableHead className="pl-6">Nama Pengguna</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Unit Kerja</TableHead>
                <TableHead>Jabatan</TableHead>
                <TableHead className="text-right pr-6">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-32 text-muted-foreground">
                    Belum ada data pengguna
                  </TableCell>
                </TableRow>
              ) : users.map((user) => (
                <TableRow key={user.id} className="hover:bg-slate-50 dark:hover:bg-zinc-900/50 transition-colors">
                  <TableCell className="pl-6 font-medium">
                    <div className="flex flex-col">
                      <span>{user.name}</span>
                      <span className="text-xs text-slate-500 font-normal">{user.email}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="capitalize">
                      {user.role?.name?.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>{user.unitKerja?.name || "-"}</TableCell>
                  <TableCell className="text-slate-500">{user.position || "-"}</TableCell>
                  <TableCell className="text-right pr-6">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem className="cursor-pointer">
                          <Edit className="w-4 h-4 mr-2" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-600">
                          <Trash2 className="w-4 h-4 mr-2" /> Hapus
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
