import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function PUT(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const body = await req.json()
    const { name, email, currentPassword, newPassword } = body

    const updateData: any = { name, email }

    if (newPassword && currentPassword) {
      const user = await prisma.user.findUnique({ where: { id: session.user.id } })
      if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })
      
      const isValid = await bcrypt.compare(currentPassword, user.password)
      if (!isValid) return NextResponse.json({ error: "Password saat ini salah" }, { status: 400 })
      
      updateData.password = await bcrypt.hash(newPassword, 10)
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData
    })

    return NextResponse.json({ success: true, user: { id: updatedUser.id, name: updatedUser.name, email: updatedUser.email } })
  } catch (error: any) {
    if (error.code === 'P2002') return NextResponse.json({ error: "Email sudah digunakan" }, { status: 400 })
    return NextResponse.json({ error: "Gagal menyimpan pengaturan" }, { status: 500 })
  }
}

export async function GET(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        unitKerja: true,
        subUnitKerja: true,
        role: true
      }
    })
    
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      position: user.position,
      role: user.role?.name,
      unitKerja: user.unitKerja?.name,
      subUnitKerja: user.subUnitKerja?.name
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 })
  }
}
