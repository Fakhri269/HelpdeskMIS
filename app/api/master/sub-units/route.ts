import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  if (session?.user?.role !== "superadmin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const subUnits = await prisma.subUnitKerja.findMany({
    orderBy: { createdAt: "desc" },
    include: { 
      unitKerja: true,
      _count: { select: { users: true } } 
    }
  })
  return NextResponse.json(subUnits)
}

export async function POST(req: Request) {
  const session = await auth()
  if (session?.user?.role !== "superadmin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { name, unitKerjaId } = body
  
  if (!name || !unitKerjaId) return NextResponse.json({ error: "Nama sub unit dan unit kerja wajib diisi" }, { status: 400 })
  
  try {
    const subUnit = await prisma.subUnitKerja.create({ data: { name, unitKerjaId } })
    return NextResponse.json(subUnit)
  } catch (error: any) {
    if (error.code === 'P2002') return NextResponse.json({ error: "Sub unit kerja sudah ada di unit ini" }, { status: 400 })
    return NextResponse.json({ error: "Gagal membuat sub unit kerja" }, { status: 500 })
  }
}
