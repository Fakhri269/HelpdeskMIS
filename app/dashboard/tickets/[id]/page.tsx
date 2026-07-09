"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import {
  ArrowLeft, Ticket, Clock, CheckCircle2, AlertCircle, Circle,
  User, Building2, Tag, Send, Loader2, CalendarClock, UserCheck
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const statusConfig: Record<string, { label: string; className: string; icon: React.ElementType }> = {
  Open:          { label: "Open",        className: "bg-blue-100 text-blue-700 border-blue-200",       icon: Circle },
  "In Progress": { label: "In Progress", className: "bg-yellow-100 text-yellow-700 border-yellow-200", icon: Clock },
  Pending:       { label: "Pending",     className: "bg-orange-100 text-orange-700 border-orange-200", icon: AlertCircle },
  Resolved:      { label: "Resolved",    className: "bg-green-100 text-green-700 border-green-200",    icon: CheckCircle2 },
  Closed:        { label: "Closed",      className: "bg-slate-100 text-slate-600 border-slate-200",    icon: CheckCircle2 },
}

const priorityConfig: Record<string, { className: string }> = {
  Critical: { className: "bg-red-100 text-red-700 border-red-200" },
  High:     { className: "bg-orange-100 text-orange-700 border-orange-200" },
  Medium:   { className: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  Low:      { className: "bg-slate-100 text-slate-600 border-slate-200" },
}

const STATUSES = ["Open", "In Progress", "Pending", "Resolved", "Closed"]

export default function TicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { data: session } = useSession()

  const [ticket, setTicket] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [comment, setComment] = useState("")
  const [sendingComment, setSendingComment] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState(false)

  const fetchTicket = async () => {
    try {
      const res = await fetch(`/api/tickets/${id}`)
      if (res.ok) setTicket(await res.json())
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchTicket() }, [id])

  const handleStatusChange = async (newStatus: string) => {
    setUpdatingStatus(true)
    try {
      const res = await fetch(`/api/tickets/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      if (res.ok) fetchTicket()
    } finally {
      setUpdatingStatus(false)
    }
  }

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!comment.trim()) return
    setSendingComment(true)
    try {
      const res = await fetch(`/api/tickets/${id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: comment }),
      })
      if (res.ok) {
        setComment("")
        fetchTicket()
      }
    } finally {
      setSendingComment(false)
    }
  }

  const isHelpdesk = session?.user?.role === "superadmin" || session?.user?.role?.startsWith("helpdesk_")

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
    </div>
  )

  if (!ticket) return (
    <div className="text-center py-20">
      <p className="text-slate-500">Tiket tidak ditemukan</p>
      <Button variant="outline" className="mt-4" onClick={() => router.back()}>Kembali</Button>
    </div>
  )

  const status = statusConfig[ticket.status] ?? statusConfig["Open"]
  const priority = priorityConfig[ticket.priority] ?? priorityConfig["Low"]
  const StatusIcon = status.icon
  const slaDate = ticket.slaDeadline ? new Date(ticket.slaDeadline) : null
  const isOverdue = slaDate && slaDate < new Date() && !["Resolved","Closed"].includes(ticket.status)

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Back */}
      <Button variant="ghost" className="gap-2 text-slate-600 hover:text-blue-600 -ml-2" onClick={() => router.push("/dashboard/tickets")}>
        <ArrowLeft className="w-4 h-4" /> Kembali ke Daftar Tiket
      </Button>

      {/* Header Card */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="font-mono text-xs text-slate-400 bg-slate-100 dark:bg-zinc-800 px-2.5 py-1 rounded-lg">
                {ticket.ticketNumber}
              </span>
              <Badge className={`gap-1.5 border text-xs font-medium ${status.className}`}>
                <StatusIcon className="w-3 h-3" />
                {status.label}
              </Badge>
              <Badge className={`border text-xs font-medium ${priority.className}`}>
                {ticket.priority}
              </Badge>
              {isOverdue && (
                <Badge className="bg-red-100 text-red-700 border-red-200 border text-xs font-medium animate-pulse">
                  ⚠ Melewati SLA
                </Badge>
              )}
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">{ticket.title}</h1>
            <p className="text-slate-500 text-sm mt-1">{ticket.category}</p>
          </div>

          {/* Status Change (helpdesk only) */}
          {isHelpdesk && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500 whitespace-nowrap">Ubah Status:</span>
              <Select value={ticket.status} onValueChange={handleStatusChange} disabled={updatingStatus}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
              {updatingStatus && <Loader2 className="w-4 h-4 animate-spin text-blue-600" />}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Description + Comments */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm p-6">
            <h2 className="font-semibold text-slate-800 dark:text-white mb-4">Deskripsi Masalah</h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
              {ticket.description}
            </p>
          </div>

          {/* Comments / Activity */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-zinc-800">
              <h2 className="font-semibold text-slate-800 dark:text-white">
                Aktivitas & Komentar
                <span className="ml-2 text-xs text-slate-400 font-normal">({ticket.comments?.length ?? 0})</span>
              </h2>
            </div>
            <div className="p-6 space-y-4">
              {ticket.comments?.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-6">Belum ada komentar</p>
              ) : ticket.comments?.map((c: any) => (
                <div key={c.id} className={`flex gap-3 ${c.isSystem ? "opacity-70" : ""}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                    c.isSystem ? "bg-slate-100 dark:bg-zinc-800 text-slate-500" : "bg-blue-100 dark:bg-blue-900/30 text-blue-700"
                  }`}>
                    {c.isSystem ? "⚙" : c.user?.name?.charAt(0) ?? "U"}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-slate-800 dark:text-white">
                        {c.isSystem ? "Sistem" : c.user?.name}
                      </span>
                      <span className="text-xs text-slate-400">
                        {new Date(c.createdAt).toLocaleString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <div className={`text-sm rounded-xl px-4 py-2.5 ${
                      c.isSystem
                        ? "bg-slate-50 dark:bg-zinc-800 text-slate-500 border border-slate-100 dark:border-zinc-700 italic"
                        : c.user?.id === session?.user?.id
                          ? "bg-blue-600 text-white ml-auto"
                          : "bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-slate-200"
                    }`}>
                      {c.content}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Comment */}
            <div className="px-6 pb-6">
              <form onSubmit={handleComment} className="flex gap-2">
                <textarea
                  rows={2}
                  placeholder="Tambahkan komentar atau update..."
                  className="flex-1 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  required
                />
                <Button type="submit" disabled={sendingComment} className="bg-blue-600 hover:bg-blue-700 self-end px-4">
                  {sendingComment ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </Button>
              </form>
            </div>
          </div>
        </div>

        {/* Right: Info Panel */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm divide-y divide-slate-100 dark:divide-zinc-800">
            <div className="px-5 py-4">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Informasi Tiket</h3>
            </div>
            {[
              { icon: User, label: "Pelapor", value: ticket.creator?.name },
              { icon: Building2, label: "Unit Kerja", value: ticket.unitKerja?.name },
              { icon: Building2, label: "Sub Unit", value: ticket.subUnitKerja?.name ?? "-" },
              { icon: Tag, label: "Kategori", value: ticket.category },
              { icon: UserCheck, label: "Ditangani oleh", value: ticket.assignee?.name ?? "Belum ditugaskan" },
              { icon: CalendarClock, label: "Dibuat", value: new Date(ticket.createdAt).toLocaleString("id-ID", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" }) },
              { icon: Clock, label: "Deadline SLA", value: slaDate ? slaDate.toLocaleString("id-ID", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "-", danger: !!isOverdue },
            ].map(({ icon: Icon, label, value, danger }) => (
              <div key={label} className="flex items-start gap-3 px-5 py-3">
                <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${danger ? "text-red-500" : "text-slate-400"}`} />
                <div>
                  <p className="text-xs text-slate-400">{label}</p>
                  <p className={`text-sm font-medium ${danger ? "text-red-600 font-semibold" : "text-slate-800 dark:text-white"}`}>
                    {value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
