import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

// POST /api/tickets/[id]/comments - add a comment
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const body = await req.json()

  if (!body.content?.trim()) {
    return NextResponse.json({ error: "Komentar tidak boleh kosong" }, { status: 400 })
  }

  const comment = await prisma.ticketComment.create({
    data: {
      ticketId: id,
      userId: session.user.id,
      content: body.content,
      isSystem: false,
    },
    include: {
      user: { select: { id: true, name: true, role: true } },
    },
  })

  return NextResponse.json(comment)
}
