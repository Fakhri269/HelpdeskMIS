import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

// GET /api/ai-context — realtime app stats for the AI assistant
export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  const [
    totalUsers,
    totalUnits,
    totalTickets,
    openTickets,
    inProgressTickets,
    pendingTickets,
    resolvedTickets,
    closedTickets,
    ticketsThisMonth,
    ticketsToday,
    recentTickets,
    myTickets,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.unitKerja.count(),
    prisma.ticket.count(),
    prisma.ticket.count({ where: { status: "Open" } }),
    prisma.ticket.count({ where: { status: "In Progress" } }),
    prisma.ticket.count({ where: { status: "Pending" } }),
    prisma.ticket.count({ where: { status: "Resolved" } }),
    prisma.ticket.count({ where: { status: "Closed" } }),
    prisma.ticket.count({ where: { createdAt: { gte: startOfMonth } } }),
    prisma.ticket.count({ where: { createdAt: { gte: startOfToday } } }),
    prisma.ticket.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        ticketNumber: true,
        title: true,
        status: true,
        priority: true,
        category: true,
        createdAt: true,
        creator: { select: { name: true, unitKerja: { select: { name: true } } } },
      },
    }),
    prisma.ticket.findMany({
      where: { creatorId: session.user.id },
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        ticketNumber: true,
        title: true,
        status: true,
        priority: true,
        createdAt: true,
      },
    }),
  ])

  const BULAN = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"]

  const contextText = `
=== DATA REALTIME APLIKASI HELPDESK MIS (diperbarui: ${now.toLocaleString("id-ID")}) ===

📊 STATISTIK UMUM:
- Total pengguna terdaftar: ${totalUsers} orang
- Total unit kerja: ${totalUnits} unit
- Total tiket sepanjang waktu: ${totalTickets} tiket
- Tiket masuk hari ini (${now.getDate()} ${BULAN[now.getMonth()]} ${now.getFullYear()}): ${ticketsToday} tiket
- Tiket masuk bulan ${BULAN[now.getMonth()]} ${now.getFullYear()}: ${ticketsThisMonth} tiket

🎫 STATUS TIKET SAAT INI:
- Open (baru masuk, belum diproses): ${openTickets} tiket
- In Progress (sedang dikerjakan): ${inProgressTickets} tiket
- Pending (menunggu informasi): ${pendingTickets} tiket
- Resolved (sudah diselesaikan): ${resolvedTickets} tiket
- Closed (ditutup): ${closedTickets} tiket
- Total aktif (Open + In Progress + Pending): ${openTickets + inProgressTickets + pendingTickets} tiket

📋 5 TIKET TERBARU DI SISTEM:
${recentTickets.map((t, i) => `${i+1}. [${t.ticketNumber}] "${t.title}" - Status: ${t.status}, Prioritas: ${t.priority}, Kategori: ${t.category}, Dari: ${t.creator?.name || "?"} (${t.creator?.unitKerja?.name || "?"})`).join("\n")}

👤 TIKET MILIK PENGGUNA YANG SEDANG CHAT (${session.user.name}):
${myTickets.length === 0 ? "Belum memiliki tiket." : myTickets.map((t, i) => `${i+1}. [${t.ticketNumber}] "${t.title}" - Status: ${t.status}, Prioritas: ${t.priority}`).join("\n")}
`.trim()

  return NextResponse.json({ context: contextText })
}
