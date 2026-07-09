import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const isHelpdesk = session.user.role === "superadmin" || session.user.role.startsWith("helpdesk_")

  try {
    const whereClause: any = {
      status: { notIn: ["Resolved", "Closed"] }
    }
    
    // Jika bukan helpdesk, hanya hitung tiket miliknya sendiri
    if (!isHelpdesk) {
      whereClause.creatorId = session.user.id
    }

    const count = await prisma.ticket.count({
      where: whereClause
    })

    return NextResponse.json({ count })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch active count" }, { status: 500 })
  }
}
