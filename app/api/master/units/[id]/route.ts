import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (session?.user?.role !== "superadmin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const { name } = body
  
  if (!name) return NextResponse.json({ error: "Nama unit kerja wajib diisi" }, { status: 400 })

  try {
    const unit = await prisma.unitKerja.update({
      where: { id },
      data: { name }
    })
    return NextResponse.json(unit)
  } catch (error: any) {
    if (error.code === 'P2002') return NextResponse.json({ error: "Unit kerja sudah ada" }, { status: 400 })
    return NextResponse.json({ error: "Gagal mengupdate unit kerja" }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (session?.user?.role !== "superadmin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  try {
    await prisma.unitKerja.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    if (error.code === 'P2003') return NextResponse.json({ error: "Gagal: Unit kerja sedang digunakan oleh pengguna atau tiket" }, { status: 400 })
    return NextResponse.json({ error: "Gagal menghapus unit kerja" }, { status: 500 })
  }
}
