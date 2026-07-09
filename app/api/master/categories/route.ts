import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  if (session?.user?.role !== "superadmin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const categories = await prisma.masterKategori.findMany({
    orderBy: { name: "asc" }
  })
  return NextResponse.json(categories)
}

export async function POST(req: Request) {
  const session = await auth()
  if (session?.user?.role !== "superadmin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { name } = body
  
  if (!name) return NextResponse.json({ error: "Nama kategori wajib diisi" }, { status: 400 })
  
  try {
    const category = await prisma.masterKategori.create({ data: { name } })
    return NextResponse.json(category)
  } catch (error: any) {
    if (error.code === 'P2002') return NextResponse.json({ error: "Kategori sudah ada" }, { status: 400 })
    return NextResponse.json({ error: "Gagal membuat kategori" }, { status: 500 })
  }
}
