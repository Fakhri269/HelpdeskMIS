import prisma from "@/lib/prisma"
import { 
  Ticket, Clock, CheckCircle2, ArrowRight,
  ListTodo, AlertCircle
} from "lucide-react"
import Link from "next/link"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

export async function StaffDashboard() {
  const session = await auth()
  if (!session?.user) redirect("/login")
  
  const userId = session.user.id

  const [
    myActiveTickets,
    myResolvedTickets,
    newUnassignedTickets
  ] = await Promise.all([
    prisma.ticket.count({ 
      where: { 
        assigneeId: userId,
        status: { in: ["Open", "In Progress", "Pending"] } 
      } 
    }),
    prisma.ticket.count({ 
      where: { 
        assigneeId: userId,
        status: { in: ["Resolved", "Closed"] } 
      } 
    }),
    prisma.ticket.count({ 
      where: { 
        assigneeId: null,
        status: "Open"
      } 
    })
  ])

  const myRecentTickets = await prisma.ticket.findMany({
    where: { assigneeId: userId, status: { in: ["Open", "In Progress", "Pending"] } },
    orderBy: { priority: 'desc' }, // Very rough approximation since priority is string, but just getting some tickets
    take: 4,
    include: { creator: true }
  })

  return (
    <div className="space-y-6 animate-in fade-in zoom-in duration-500">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Workspace Saya</h1>
          <p className="text-sm text-slate-500">Ringkasan tugas dan tiket yang ditugaskan kepada Anda.</p>
        </div>
        <Link 
          href="/dashboard/tickets?status=Open&assignee=me" 
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded-xl transition-colors shadow-sm"
        >
          <ListTodo className="w-4 h-4" />
          Lihat Semua Tugas
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-2xl shadow-lg shadow-blue-500/20 text-white flex items-center gap-4 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full translate-x-12 -translate-y-8 pointer-events-none"></div>
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center shrink-0 backdrop-blur-sm">
            <Clock className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-sm font-medium text-blue-100">Tiket Aktif Saya</p>
            <p className="text-3xl font-bold">{myActiveTickets}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-100 dark:border-zinc-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-green-50 dark:bg-green-900/20 text-green-600 rounded-xl flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Diselesaikan (Total)</p>
            <p className="text-3xl font-bold text-slate-800 dark:text-white">{myResolvedTickets}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-100 dark:border-zinc-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-orange-50 dark:bg-orange-900/20 text-orange-600 rounded-xl flex items-center justify-center shrink-0">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Tiket Baru (Belum Assign)</p>
            <p className="text-3xl font-bold text-orange-600">{newUnassignedTickets}</p>
          </div>
        </div>
      </div>

      <div className="mt-8 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-100 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Ticket className="w-5 h-5 text-slate-400" />
            Prioritas Tugas Anda Saat Ini
          </h2>
        </div>
        
        <div className="divide-y divide-slate-100 dark:divide-zinc-800">
          {myRecentTickets.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-slate-50 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-slate-300" />
              </div>
              <p className="text-slate-600 dark:text-slate-300 font-medium">Bagus! Semua tugas sudah selesai.</p>
              <p className="text-sm text-slate-400 mt-1">Tidak ada tiket aktif yang di-assign ke Anda saat ini.</p>
            </div>
          ) : myRecentTickets.map(ticket => (
            <Link href={`/dashboard/tickets/${ticket.id}`} key={ticket.id} className="flex items-center justify-between p-6 hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors group">
              <div className="flex-1 min-w-0 pr-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono text-slate-400 bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded">
                    {ticket.ticketNumber}
                  </span>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                    ticket.priority === 'High' || ticket.priority === 'Critical' 
                      ? 'bg-red-50 text-red-700 border-red-200' 
                      : 'bg-slate-50 text-slate-600 border-slate-200'
                  }`}>
                    {ticket.priority}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border bg-blue-50 text-blue-700 border-blue-200`}>
                    {ticket.status}
                  </span>
                </div>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate mb-1 group-hover:text-blue-600 transition-colors">
                  {ticket.title}
                </p>
                <p className="text-xs text-slate-500 truncate">
                  Pelapor: {ticket.creator?.name} • Dibuat: {new Date(ticket.createdAt).toLocaleDateString('id-ID')}
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-500" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

// Needed because we use ChevronRight above but didn't import it
import { ChevronRight } from "lucide-react"
