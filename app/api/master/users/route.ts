import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function GET() {
  const session = await auth()
  if (session?.user?.role !== "superadmin" && session?.user?.role !== "helpdesk_manager") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const users = await prisma.user.findMany({
    include: {
      role: true,
      unitKerja: true,
      subUnitKerja: true
    },
    orderBy: { createdAt: 'desc' }
  })
  
  // Exclude password
  const safeUsers = users.map(user => {
    const { password, ...rest } = user
    return rest
  })
  
  return NextResponse.json(safeUsers)
}

export async function POST(req: Request) {
  const session = await auth()
  if (session?.user?.role !== "superadmin" && session?.user?.role !== "helpdesk_manager") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const { name, email, password, roleId, unitKerjaId, subUnitKerjaId, position } = body
  
  // check if email exists
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return NextResponse.json({ error: "Email sudah terdaftar" }, { status: 400 })
  }
  
  const hashedPassword = await bcrypt.hash(password, 10)
  
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      roleId,
      unitKerjaId: unitKerjaId || null,
      subUnitKerjaId: subUnitKerjaId || null,
      position: position || null
    },
    include: {
      role: true,
      unitKerja: true,
      subUnitKerja: true
    }
  })
  
  const { password: _, ...safeUser } = user
  return NextResponse.json(safeUser)
}
