import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

// GET /api/chat - get or create live chat ticket for the current user, and return messages
export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  // Find existing open live-chat ticket for this user
  let ticket = await prisma.ticket.findFirst({
    where: {
      creatorId: session.user.id,
      category: "Live Chat",
      status: { notIn: ["Resolved", "Closed"] },
    },
    include: {
      comments: {
        include: { user: { select: { id: true, name: true, role: { select: { name: true } } } } },
        orderBy: { createdAt: "asc" },
      },
      creator: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  if (!ticket) {
    return NextResponse.json({ ticket: null, messages: [] })
  }

  return NextResponse.json({
    ticket: {
      id: ticket.id,
      ticketNumber: ticket.ticketNumber,
      status: ticket.status,
    },
    messages: ticket.comments.map(c => ({
      id: c.id,
      content: c.content,
      isSystem: c.isSystem,
      createdAt: c.createdAt,
      user: {
        id: c.user.id,
        name: c.user.name,
        role: (c.user.role as { name: string })?.name || "user",
      },
    })),
  })
}

// POST /api/chat - send a message (creates ticket if none exists)
export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { message } = body

  if (!message?.trim()) {
    return NextResponse.json({ error: "Pesan tidak boleh kosong" }, { status: 400 })
  }

  // Find or create a live chat ticket for this user
  let ticket = await prisma.ticket.findFirst({
    where: {
      creatorId: session.user.id,
      category: "Live Chat",
      status: { notIn: ["Resolved", "Closed"] },
    },
  })

  if (!ticket) {
    // Get first available UnitKerja (required field)
    const unitKerja = await prisma.unitKerja.findFirst()
    if (!unitKerja) {
      return NextResponse.json({ error: "Unit kerja belum dikonfigurasi" }, { status: 500 })
    }

    // Generate ticket number
    const today = new Date()
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, "")
    const count = await prisma.ticket.count()
    const ticketNumber = `LVC-${dateStr}-${String(count + 1).padStart(3, "0")}`

    ticket = await prisma.ticket.create({
      data: {
        ticketNumber,
        title: `Live Chat - ${session.user.name}`,
        description: "Sesi Live Chat dengan Helpdesk MIS",
        priority: "Medium",
        category: "Live Chat",
        status: "Open",
        creatorId: session.user.id,
        unitKerjaId: session.user.unitKerjaId || unitKerja.id,
        slaDeadline: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    })
  }

  // Add message as a comment
  const comment = await prisma.ticketComment.create({
    data: {
      ticketId: ticket.id,
      userId: session.user.id,
      content: message.trim(),
      isSystem: false,
    },
    include: {
      user: { select: { id: true, name: true, role: { select: { name: true } } } },
    },
  })

  return NextResponse.json({
    ticketId: ticket.id,
    message: {
      id: comment.id,
      content: comment.content,
      isSystem: comment.isSystem,
      createdAt: comment.createdAt,
      user: {
        id: comment.user.id,
        name: comment.user.name,
        role: (comment.user.role as { name: string })?.name || "user",
      },
    },
  })
}
