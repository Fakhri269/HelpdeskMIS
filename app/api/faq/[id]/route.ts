import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  const allowed = ["superadmin", "helpdesk_manager", "helpdesk_asmen"]
  if (!session?.user || !allowed.includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const body = await req.json()

  const faq = await prisma.fAQ.update({
    where: { id },
    data: {
      question: body.question,
      answer: body.answer,
      tags: body.tags || "",
    },
  })
  return NextResponse.json(faq)
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (session?.user?.role !== "superadmin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  await prisma.fAQ.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
