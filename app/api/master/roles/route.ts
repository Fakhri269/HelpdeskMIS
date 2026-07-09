import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  if (session?.user?.role !== "superadmin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const roles = await prisma.role.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { users: true } } }
  })
  return NextResponse.json(roles)
}

export async function POST(req: Request) {
  const session = await auth()
  if (session?.user?.role !== "superadmin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { name, description } = body
  
  if (!name) return NextResponse.json({ error: "Nama role wajib diisi" }, { status: 400 })
  
  try {
    const role = await prisma.role.create({ data: { name, description } })
    return NextResponse.json(role)
  } catch (error: any) {
    if (error.code === 'P2002') return NextResponse.json({ error: "Role sudah ada" }, { status: 400 })
    return NextResponse.json({ error: "Gagal membuat role" }, { status: 500 })
  }
}
