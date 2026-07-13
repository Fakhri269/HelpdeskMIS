import prisma from "@/lib/prisma"
import { 
  Users, Ticket, Building2, Server, 
  ArrowRight, AlertCircle, CheckCircle2, Clock 
} from "lucide-react"
import Link from "next/link"

export async function AdminDashboard() {
  // Fetch stats directly from DB
  const [
    totalUsers,
    totalUnits,
    totalTickets,
    openTickets,
    resolvedTickets
  ] = await Promise.all([
    prisma.user.count(),
    prisma.unitKerja.count(),
    prisma.ticket.count(),
    prisma.ticket.count({ where: { status: { in: ["Open", "In Progress", "Pending"] } } }),
    prisma.ticket.count({ where: { status: { in: ["Resolved", "Closed"] } } })
  ])

  const recentUsers = await prisma.user.findMany({
    orderBy: { id: 'desc' },
    take: 5,
    include: { role: true, unitKerja: true }
  })

  return (
    <div className="space-y-6 animate-in fade-in zoom-in duration-500">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Admin Overview</h1>
        <p className="text-sm text-slate-500">Pantauan menyeluruh sistem Helpdesk MIS.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-100 dark:border-zinc-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Pengguna</p>
            <p className="text-2xl font-bold text-slate-800 dark:text-white">{totalUsers}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-100 dark:border-zinc-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Unit Kerja</p>
            <p className="text-2xl font-bold text-slate-800 dark:text-white">{totalUnits}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-100 dark:border-zinc-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-orange-50 dark:bg-orange-900/20 text-orange-600 rounded-xl flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Tiket Aktif</p>
            <p className="text-2xl font-bold text-slate-800 dark:text-white">{openTickets}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-100 dark:border-zinc-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-green-50 dark:bg-green-900/20 text-green-600 rounded-xl flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Tiket Selesai</p>
            <p className="text-2xl font-bold text-slate-800 dark:text-white">{resolvedTickets}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* System Health */}
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-100 dark:border-zinc-800 shadow-sm">
          <h2 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-4">
            <Server className="w-5 h-5 text-slate-400" />
            Status Sistem
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-zinc-800/50 rounded-xl border border-slate-100 dark:border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></div>
                <div>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Database Connection</p>
                  <p className="text-xs text-slate-500">Operational</p>
                </div>
              </div>
              <span className="text-xs font-mono text-slate-400">99.9% uptime</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-zinc-800/50 rounded-xl border border-slate-100 dark:border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></div>
                <div>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Auth Service (NextAuth)</p>
                  <p className="text-xs text-slate-500">Operational</p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-zinc-800/50 rounded-xl border border-slate-100 dark:border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></div>
                <div>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Pusher WebSocket</p>
                  <p className="text-xs text-slate-500">Operational</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Users */}
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-100 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-slate-400" />
              Pengguna Terbaru
            </h2>
            <Link href="/dashboard/master/users" className="text-xs text-blue-600 font-medium hover:underline flex items-center">
              Lihat Semua <ArrowRight className="w-3 h-3 ml-1" />
            </Link>
          </div>
          <div className="space-y-3">
            {recentUsers.map(user => (
              <div key={user.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs shrink-0">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{user.name}</p>
                    <p className="text-xs text-slate-500">{user.unitKerja?.name || "Tidak ada unit"}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 bg-slate-100 dark:bg-zinc-800 px-2 py-1 rounded">
                    {user.role.name}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
