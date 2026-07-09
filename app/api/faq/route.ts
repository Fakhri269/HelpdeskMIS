import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const faqs = await prisma.fAQ.findMany({ orderBy: { createdAt: "desc" } })
  return NextResponse.json(faqs)
}

export async function POST(req: Request) {
  const session = await auth()
  const allowed = ["superadmin", "helpdesk_manager", "helpdesk_asmen"]
  if (!session?.user || !allowed.includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const { question, answer, tags } = body

  if (!question || !answer) {
    return NextResponse.json({ error: "Pertanyaan dan jawaban wajib diisi" }, { status: 400 })
  }

  const faq = await prisma.fAQ.create({ data: { question, answer, tags: tags || "" } })
  return NextResponse.json(faq)
}
