import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  if (session?.user?.role !== "superadmin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const units = await prisma.unitKerja.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { users: true, subUnits: true } } }
  })
  return NextResponse.json(units)
}

export async function POST(req: Request) {
  const session = await auth()
  if (session?.user?.role !== "superadmin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { name } = body
  
  if (!name) return NextResponse.json({ error: "Nama unit kerja wajib diisi" }, { status: 400 })
  
  try {
    const unit = await prisma.unitKerja.create({ data: { name } })
    return NextResponse.json(unit)
  } catch (error: any) {
    if (error.code === 'P2002') return NextResponse.json({ error: "Unit kerja sudah ada" }, { status: 400 })
    return NextResponse.json({ error: "Gagal membuat unit kerja" }, { status: 500 })
  }
}
