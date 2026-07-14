import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (session?.user?.role !== "superadmin" && session?.user?.role !== "helpdesk_manager") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const resolvedParams = await params;
  const { name, roleId, unitKerjaId, subUnitKerjaId, position } = await req.json()
  
  try {
    const updatedUser = await prisma.user.update({
      where: { id: resolvedParams.id },
      data: {
        name,
        roleId,
        unitKerjaId: unitKerjaId === "none" || !unitKerjaId ? null : unitKerjaId,
        subUnitKerjaId: subUnitKerjaId === "none" || !subUnitKerjaId ? null : subUnitKerjaId,
        position: position || null
      },
      include: {
        role: true,
        unitKerja: true,
        subUnitKerja: true
      }
    })
    
    const { password, ...safeUser } = updatedUser
    return NextResponse.json(safeUser)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Gagal memperbarui pengguna" }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (session?.user?.role !== "superadmin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const resolvedParams = await params;

  try {
    await prisma.user.delete({
      where: { id: resolvedParams.id }
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Gagal menghapus pengguna" }, { status: 500 })
  }
}
