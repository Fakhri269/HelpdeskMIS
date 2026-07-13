import prisma from "@/lib/prisma"
import { 
  Ticket, Clock, AlertTriangle, Users, 
  ArrowRight, CheckCircle2, TrendingUp 
} from "lucide-react"
import Link from "next/link"

export async function ManagerDashboard() {
  const [
    openTickets,
    resolvedTickets,
    unassignedTickets,
    overdueTickets
  ] = await Promise.all([
    prisma.ticket.count({ where: { status: { in: ["Open", "In Progress", "Pending"] } } }),
    prisma.ticket.count({ where: { status: { in: ["Resolved", "Closed"] } } }),
    prisma.ticket.count({ where: { assigneeId: null, status: "Open" } }),
    prisma.ticket.count({ 
      where: { 
        slaDeadline: { lt: new Date() },
        status: { notIn: ["Resolved", "Closed"] }
      } 
    })
  ])

  // Get active staff workload
  const staffWorkload = await prisma.user.findMany({
    where: { role: { name: { in: ["helpdesk_staff", "admin"] } } }, // Simple approximation
    include: {
      assignedTickets: {
        where: { status: { in: ["Open", "In Progress", "Pending"] } }
      }
    },
    take: 5
  })

  // Sort by workload descending
  staffWorkload.sort((a, b) => b.assignedTickets.length - a.assignedTickets.length)

  return (
    <div className="space-y-6 animate-in fade-in zoom-in duration-500">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Manager Dashboard</h1>
        <p className="text-sm text-slate-500">Pantauan performa tim Helpdesk dan SLA.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-100 dark:border-zinc-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
            <Ticket className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Tiket Aktif</p>
            <p className="text-2xl font-bold text-slate-800 dark:text-white">{openTickets}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-100 dark:border-zinc-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-orange-50 dark:bg-orange-900/20 text-orange-600 rounded-xl flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Belum Di-assign</p>
            <p className="text-2xl font-bold text-orange-600">{unassignedTickets}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-100 dark:border-zinc-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-xl flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Melewati SLA</p>
            <p className="text-2xl font-bold text-red-600">{overdueTickets}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-100 dark:border-zinc-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-green-50 dark:bg-green-900/20 text-green-600 rounded-xl flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Selesai</p>
            <p className="text-2xl font-bold text-slate-800 dark:text-white">{resolvedTickets}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Workload */}
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-100 dark:border-zinc-800 shadow-sm">
          <h2 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-slate-400" />
            Beban Kerja Tim (Tiket Aktif)
          </h2>
          <div className="space-y-4">
            {staffWorkload.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">Belum ada data staf</p>
            ) : staffWorkload.map(staff => (
              <div key={staff.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-xs font-bold shrink-0">
                    {staff.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{staff.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-24 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 rounded-full" 
                      style={{ width: `${Math.min((staff.assignedTickets.length / 10) * 100, 100)}%` }} 
                    />
                  </div>
                  <span className="text-sm font-bold w-6 text-right">{staff.assignedTickets.length}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Needed */}
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-100 dark:border-zinc-800 shadow-sm flex flex-col justify-center items-center text-center">
          <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-full flex items-center justify-center mb-4">
            <Ticket className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Kelola Antrean Tiket</h3>
          <p className="text-sm text-slate-500 mb-6">Terdapat {unassignedTickets} tiket baru yang belum di-assign ke staf manapun.</p>
          <Link 
            href="/dashboard/tickets?status=Open" 
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-xl transition-colors shadow-lg shadow-blue-500/30"
          >
            Lihat Tiket Baru
          </Link>
        </div>
      </div>
    </div>
  )
}
