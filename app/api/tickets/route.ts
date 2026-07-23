import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import pusherServer from "@/lib/pusher"

// GET /api/tickets - fetch list of tickets based on role
export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const status = searchParams.get("status")
  const search = searchParams.get("search")

  const isSuperadminOrManager =
    session.user.role === "superadmin" || session.user.role === "helpdesk_manager"

  const where: any = {
    ...(status && status !== "Semua" ? { status } : {}),
    ...(search
      ? {
          OR: [
            { ticketNumber: { contains: search, mode: "insensitive" } },
            { title: { contains: search, mode: "insensitive" } },
            { creator: { name: { contains: search, mode: "insensitive" } } },
          ],
        }
      : {}),
    // If regular user, only show their own tickets
    ...(!isSuperadminOrManager && session.user.role === "user"
      ? { creatorId: session.user.id }
      : {}),
  }

  const tickets = await prisma.ticket.findMany({
    where,
    include: {
      creator: { select: { id: true, name: true, email: true } },
      assignee: { select: { id: true, name: true } },
      unitKerja: { select: { id: true, name: true } },
      subUnitKerja: { select: { id: true, name: true } },
      _count: {
        select: {
          comments: {
            where: {
              userId: { not: session.user.id },
            }
          }
        }
      }
    },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(tickets)
}

// POST /api/tickets - create a new ticket
export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const body = await req.json()
    const { title, description, priority, category, unitKerjaId, subUnitKerjaId } = body

    if (!title || !description || !priority || !category || !unitKerjaId) {
      return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 })
    }

    // Generate ticket number: TKT-YYYYMMDD-NNN
    const today = new Date()
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, "")
    const count = await prisma.ticket.count()
    const ticketNumber = `TKT-${dateStr}-${String(count + 1).padStart(3, "0")}`

    // Calculate SLA deadline
    const slaMap: Record<string, number> = { Critical: 1, High: 4, Medium: 24, Low: 72 }
    const slaHours = slaMap[priority] ?? 72
    const slaDeadline = new Date(Date.now() + slaHours * 60 * 60 * 1000)

    const ticket = await prisma.ticket.create({
      data: {
        ticketNumber,
        title,
        description,
        priority,
        category,
        status: "Open",
        creatorId: session.user.id,
        unitKerjaId,
        subUnitKerjaId: subUnitKerjaId || null,
        slaDeadline,
      },
      include: {
        creator: { select: { id: true, name: true } },
        unitKerja: { select: { id: true, name: true } },
      },
    })

    // Broadcast realtime event
    await pusherServer.trigger("helpdesk-tickets", "ticket.created", {
      id: ticket.id,
      ticketNumber: ticket.ticketNumber,
      title: ticket.title,
      status: ticket.status,
      priority: ticket.priority,
      category: ticket.category,
      creator: ticket.creator,
      unitKerja: ticket.unitKerja,
      createdAt: ticket.createdAt,
    })

    return NextResponse.json(ticket)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 })
  }
}
