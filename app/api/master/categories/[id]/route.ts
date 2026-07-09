import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (session?.user?.role !== "superadmin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const { name } = body
  
  if (!name) return NextResponse.json({ error: "Nama kategori wajib diisi" }, { status: 400 })

  try {
    const category = await prisma.masterKategori.update({
      where: { id },
      data: { name }
    })
    return NextResponse.json(category)
  } catch (error: any) {
    if (error.code === 'P2002') return NextResponse.json({ error: "Kategori sudah ada" }, { status: 400 })
    return NextResponse.json({ error: "Gagal mengupdate kategori" }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (session?.user?.role !== "superadmin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  try {
    await prisma.masterKategori.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: "Gagal menghapus kategori" }, { status: 500 })
  }
}
