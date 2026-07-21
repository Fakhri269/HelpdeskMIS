import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { AdminDashboard } from "@/components/dashboard/AdminDashboard"
import { ManagerDashboard } from "@/components/dashboard/ManagerDashboard"
import { StaffDashboard } from "@/components/dashboard/StaffDashboard"
import { AlertCircle } from "lucide-react"

export default async function DashboardPage() {
  const session = await auth()
  
  if (!session?.user) {
    redirect("/login")
  }

  const role = session.user.role || ""

  // Admin / Superadmin
  if (role === "admin" || role === "superadmin") {
    return <AdminDashboard />
  }

  // Manager / Asmen
  if (role.includes("manager") || role.includes("asmen")) {
    return <ManagerDashboard />
  }

  // Staff
  if (role.includes("staff")) {
    return <StaffDashboard />
  }

  // User biasa → arahkan ke User Portal
  if (role === "user" || role === "") {
    redirect("/user")
  }

  // Fallback if role is not recognized or trying to access wrong dashboard
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
        <AlertCircle className="w-8 h-8" />
      </div>
      <h2 className="text-xl font-bold text-slate-800">Akses Ditolak</h2>
      <p className="text-slate-500 mt-2 max-w-md">
        Role Anda ({role}) tidak memiliki tampilan dashboard khusus. Jika Anda pengguna biasa (user), silakan kembali ke User Portal.
      </p>
    </div>
  )
}