import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { sendPasswordResetEmail } from "@/lib/mailer"
import crypto from "crypto"

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json({ error: "Email wajib diisi" }, { status: 400 })
    }

    // Check if user exists (don't reveal if not found for security)
    const user = await prisma.user.findUnique({ where: { email } })

    if (user) {
      // Delete any existing token for this email
      await prisma.passwordResetToken.deleteMany({ where: { email } })

      // Generate secure random token
      const token = crypto.randomBytes(32).toString("hex")
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

      await prisma.passwordResetToken.create({
        data: { email, token, expiresAt },
      })

      // Send email
      await sendPasswordResetEmail(email, token)
    }

    // Always return success to prevent email enumeration
    return NextResponse.json({
      message: "Jika email terdaftar, link reset password telah dikirim.",
    })
  } catch (error) {
    console.error("Forgot password error:", error)
    return NextResponse.json(
      { error: "Terjadi kesalahan. Silakan coba lagi." },
      { status: 500 }
    )
  }
}
