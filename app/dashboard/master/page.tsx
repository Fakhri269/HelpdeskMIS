import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Shield, Building2, Layers, Clock, AlertTriangle, Settings2, FileQuestion } from "lucide-react"

export default function MasterDataPage() {
  const masterMenus = [
    { title: "Pengguna (Users)", description: "Kelola akun pengguna dan staf helpdesk.", icon: Users, href: "/dashboard/master/users" },
    { title: "Peran (Roles)", description: "Atur hak akses dan jenis peran.", icon: Shield, href: "/dashboard/master/roles" },
    { title: "Unit Kerja", description: "Daftar kantor cabang dan pusat.", icon: Building2, href: "/dashboard/master/units" },
    { title: "Sub Unit Kerja", description: "Departemen spesifik (khusus MIS).", icon: Layers, href: "/dashboard/master/sub-units" },
    { title: "Kategori Tiket", description: "Klasifikasi masalah IT.", icon: Settings2, href: "/dashboard/master/categories" },
    { title: "SLA (Service Level)", description: "Batas waktu penyelesaian prioritas.", icon: Clock, href: "/dashboard/master/sla" },
    { title: "FAQ / Knowledge Base", description: "Data pertanyaan yang sering diajukan.", icon: FileQuestion, href: "/dashboard/master/faq" },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Master Data</h2>
        <p className="text-muted-foreground">
          Kelola parameter dinamis aplikasi Helpdesk MIS. Hanya dapat diakses oleh Superadmin.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {masterMenus.map((menu) => (
          <Link key={menu.href} href={menu.href}>
            <Card className="hover:border-blue-500 hover:shadow-md transition-all cursor-pointer h-full">
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div className="space-y-1">
                  <CardTitle className="text-base font-semibold">{menu.title}</CardTitle>
                  <CardDescription className="text-sm">{menu.description}</CardDescription>
                </div>
                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
                  <menu.icon className="w-5 h-5" />
                </div>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
