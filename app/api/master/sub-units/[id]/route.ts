import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (session?.user?.role !== "superadmin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const { name, unitKerjaId } = body
  
  if (!name || !unitKerjaId) return NextResponse.json({ error: "Nama dan Unit Kerja wajib diisi" }, { status: 400 })

  try {
    const subUnit = await prisma.subUnitKerja.update({
      where: { id },
      data: { name, unitKerjaId }
    })
    return NextResponse.json(subUnit)
  } catch (error: any) {
    if (error.code === 'P2002') return NextResponse.json({ error: "Sub unit kerja sudah ada di unit ini" }, { status: 400 })
    return NextResponse.json({ error: "Gagal mengupdate sub unit kerja" }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (session?.user?.role !== "superadmin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  try {
    await prisma.subUnitKerja.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    if (error.code === 'P2003') return NextResponse.json({ error: "Gagal: Sub unit kerja sedang digunakan oleh pengguna atau tiket" }, { status: 400 })
    return NextResponse.json({ error: "Gagal menghapus sub unit kerja" }, { status: 500 })
  }
}
