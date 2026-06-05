import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET() {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const [roles, units, subUnits] = await Promise.all([
    prisma.role.findMany({ orderBy: { name: 'asc' } }),
    prisma.unitKerja.findMany({ orderBy: { name: 'asc' } }),
    prisma.subUnitKerja.findMany({ orderBy: { name: 'asc' } })
  ])

  return NextResponse.json({ roles, units, subUnits })
}
