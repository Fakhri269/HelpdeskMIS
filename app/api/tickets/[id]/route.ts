import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import pusherServer from "@/lib/pusher"

// GET /api/tickets/[id] - single ticket detail
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params

  const ticket = await prisma.ticket.findUnique({
    where: { id },
    include: {
      creator: { select: { id: true, name: true, email: true, unitKerja: true } },
      assignee: { select: { id: true, name: true } },
      unitKerja: true,
      subUnitKerja: true,
      comments: {
        include: { user: { select: { id: true, name: true, role: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
  })

  if (!ticket) return NextResponse.json({ error: "Tiket tidak ditemukan" }, { status: 404 })

  return NextResponse.json(ticket)
}

// PATCH /api/tickets/[id] - update ticket (status, assignee, etc.)
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const body = await req.json()

  const isHelpdesk = session.user.role && session.user.role !== "user"

  // Only helpdesk can update status / assignee
  if (!isHelpdesk && (body.status || body.assigneeId)) {
    return NextResponse.json({ error: "Tidak diizinkan" }, { status: 403 })
  }

  try {
    const ticket = await prisma.ticket.update({
      where: { id },
      data: {
        ...(body.status ? { status: body.status } : {}),
        ...(body.assigneeId !== undefined ? { assigneeId: body.assigneeId || null } : {}),
        ...(body.title ? { title: body.title } : {}),
        ...(body.description ? { description: body.description } : {}),
        ...(body.priority ? { priority: body.priority } : {}),
      },
      include: {
        creator: { select: { id: true, name: true } },
        assignee: { select: { id: true, name: true } },
        unitKerja: { select: { id: true, name: true } },
      },
    })

    // Add system comment if status changed
    if (body.status) {
      const comment = await prisma.ticketComment.create({
        data: {
          ticketId: id,
          userId: session.user.id,
          content: `Status tiket diubah menjadi **${body.status}**`,
          isSystem: true,
        },
        include: {
          user: { select: { id: true, name: true } },
        }
      })

      // Broadcast system comment
      await pusherServer.trigger(`ticket-${id}`, "comment.created", {
        id: comment.id,
        content: comment.content,
        isSystem: comment.isSystem,
        createdAt: comment.createdAt,
        user: comment.user,
      })
    }

    // Broadcast ticket update
    await pusherServer.trigger("helpdesk-tickets", "ticket.updated", {
      id: ticket.id,
      ticketNumber: ticket.ticketNumber,
      status: ticket.status,
      priority: ticket.priority,
      assignee: ticket.assignee,
    })
    // Also broadcast on per-ticket channel for ChatRoom
    await pusherServer.trigger(`ticket-${id}`, "ticket.updated", {
      status: ticket.status,
    })

    return NextResponse.json(ticket)
  } catch (error) {
    return NextResponse.json({ error: "Gagal memperbarui tiket" }, { status: 500 })
  }
}
