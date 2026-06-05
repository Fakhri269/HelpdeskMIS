import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  if (session?.user?.role !== "superadmin" && session?.user?.role !== "helpdesk_manager") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const data = await prisma.masterSLA.findMany({
    orderBy: { hours: 'asc' }
  })
  return NextResponse.json(data)
}

export async function POST(req: Request) {
  const session = await auth()
  if (session?.user?.role !== "superadmin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { priority, hours } = await req.json()
  
  const created = await prisma.masterSLA.create({
    data: { priority, hours: parseInt(hours) }
  })
  
  return NextResponse.json(created)
}
