import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (session?.user?.role !== "superadmin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const { name, description } = body
  
  if (!name) return NextResponse.json({ error: "Nama role wajib diisi" }, { status: 400 })

  try {
    const role = await prisma.role.update({
      where: { id },
      data: { name, description }
    })
    return NextResponse.json(role)
  } catch (error: any) {
    if (error.code === 'P2002') return NextResponse.json({ error: "Role sudah ada" }, { status: 400 })
    return NextResponse.json({ error: "Gagal mengupdate role" }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (session?.user?.role !== "superadmin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  try {
    await prisma.role.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    if (error.code === 'P2003') return NextResponse.json({ error: "Role tidak bisa dihapus karena sedang digunakan oleh pengguna" }, { status: 400 })
    return NextResponse.json({ error: "Gagal menghapus role" }, { status: 500 })
  }
}
