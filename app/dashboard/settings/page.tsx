"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Settings, User, Lock, Save, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function SettingsPage() {
  const { data: session, update } = useSession()
  const [loading, setLoading] = useState(false)
  const [successMsg, setSuccessMsg] = useState("")
  const [errorMsg, setErrorMsg] = useState("")

  const [form, setForm] = useState({
    name: session?.user?.name || "",
    email: session?.user?.email || "",
    currentPassword: "",
    newPassword: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg("")
    setSuccessMsg("")

    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      })
      const data = await res.json()
      
      if (!res.ok) throw new Error(data.error || "Gagal menyimpan")
      
      setSuccessMsg("Pengaturan berhasil disimpan!")
      setForm(prev => ({ ...prev, currentPassword: "", newPassword: "" }))
      
      // Update Next-Auth session
      await update({ name: form.name, email: form.email })
    } catch (error: any) {
      setErrorMsg(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2"><Settings className="w-6 h-6 text-blue-600"/> Pengaturan Sistem</h2>
        <p className="text-sm text-slate-500">Kelola profil dan preferensi akun Anda</p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="profile"><User className="w-4 h-4 mr-2"/> Profil Anda</TabsTrigger>
          <TabsTrigger value="security"><Lock className="w-4 h-4 mr-2"/> Keamanan</TabsTrigger>
        </TabsList>

        <form onSubmit={handleSubmit}>
          <TabsContent value="profile" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Informasi Profil</CardTitle>
                <CardDescription>Perbarui nama dan alamat email akun Anda.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 max-w-md">
                  <Label>Nama Lengkap</Label>
                  <Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
                </div>
                <div className="space-y-2 max-w-md">
                  <Label>Alamat Email</Label>
                  <Input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Ubah Kata Sandi</CardTitle>
                <CardDescription>Kosongkan jika Anda tidak ingin mengubah kata sandi.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 max-w-md">
                  <Label>Kata Sandi Saat Ini</Label>
                  <Input type="password" value={form.currentPassword} onChange={e => setForm({...form, currentPassword: e.target.value})} placeholder="********" />
                </div>
                <div className="space-y-2 max-w-md">
                  <Label>Kata Sandi Baru</Label>
                  <Input type="password" value={form.newPassword} onChange={e => setForm({...form, newPassword: e.target.value})} placeholder="Minimal 6 karakter" minLength={6} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <div className="mt-6 flex items-center gap-4">
            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Simpan Perubahan
            </Button>
            {successMsg && <p className="text-sm font-medium text-green-600">{successMsg}</p>}
            {errorMsg && <p className="text-sm font-medium text-red-600">{errorMsg}</p>}
          </div>
        </form>
      </Tabs>
    </div>
  )
}
