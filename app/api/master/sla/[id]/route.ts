import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await auth()
  if (session?.user?.role !== "superadmin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { priority, hours } = await req.json()
  const { id } = await params // Next.js 15 params are promises, but in route handlers it can be destructured safely if awaited. Wait, Next 15 `params` is a promise in layouts/pages, in route handlers it's also a Promise now.

  const updated = await prisma.masterSLA.update({
    where: { id },
    data: { priority, hours: parseInt(hours) }
  })
  
  return NextResponse.json(updated)
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const session = await auth()
  if (session?.user?.role !== "superadmin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  
  const { id } = await params
  
  await prisma.masterSLA.delete({
    where: { id }
  })
  
  return NextResponse.json({ success: true })
}
