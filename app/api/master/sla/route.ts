import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  if (session?.user?.role !== "superadmin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const sla = await prisma.masterSLA.findMany({
    orderBy: { priority: "asc" }
  })
  return NextResponse.json(sla)
}

export async function POST(req: Request) {
  const session = await auth()
  if (session?.user?.role !== "superadmin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { priority, hours } = body
  
  if (!priority || typeof hours !== 'number') return NextResponse.json({ error: "Prioritas dan target jam SLA wajib diisi" }, { status: 400 })
  
  try {
    const sla = await prisma.masterSLA.create({ data: { priority, hours } })
    return NextResponse.json(sla)
  } catch (error: any) {
    if (error.code === 'P2002') return NextResponse.json({ error: "SLA untuk prioritas tersebut sudah ada" }, { status: 400 })
    return NextResponse.json({ error: "Gagal membuat SLA" }, { status: 500 })
  }
}
