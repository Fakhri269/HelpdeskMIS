import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
})

export async function sendPasswordResetEmail(email: string, token: string) {
  const baseUrl = process.env.AUTH_URL || process.env.NEXTAUTH_URL || "http://localhost:3000"
  const resetUrl = `${baseUrl}/reset-password?token=${token}`

  // Log link ke terminal untuk keperluan testing jika email belum disetting
  console.log(`\n========================================================`)
  console.log(`[SYSTEM] RESET PASSWORD LINK UNTUK: ${email}`)
  console.log(`[SYSTEM] ${resetUrl}`)
  console.log(`========================================================\n`)

  const html = `
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      <title>Reset Password</title>
    </head>
    <body style="margin:0;padding:0;background:#F0F8FF;font-family:'Segoe UI',Arial,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#F0F8FF;padding:40px 0;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(26,86,160,0.10);">
              <!-- Header -->
              <tr>
                <td style="background:linear-gradient(135deg,#1A56A0 0%,#0E8A9E 100%);padding:36px 40px;text-align:center;">
                  <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:-0.5px;">
                    Perumda Tirta Kahuripan
                  </h1>
                  <p style="margin:6px 0 0;color:rgba(255,255,255,0.75);font-size:13px;">Sistem Helpdesk MIS</p>
                </td>
              </tr>
              <!-- Body -->
              <tr>
                <td style="padding:40px;">
                  <h2 style="margin:0 0 12px;color:#0B3D6B;font-size:20px;font-weight:700;">Reset Password Anda</h2>
                  <p style="margin:0 0 24px;color:#4A6A8A;font-size:15px;line-height:1.6;">
                    Kami menerima permintaan untuk mereset password akun Helpdesk MIS yang terhubung dengan email ini.
                    Klik tombol di bawah untuk melanjutkan.
                  </p>
                  <div style="text-align:center;margin:32px 0;">
                    <a href="${resetUrl}"
                       style="display:inline-block;background:linear-gradient(135deg,#1A56A0,#0E8A9E);color:#ffffff;text-decoration:none;font-size:15px;font-weight:700;padding:14px 36px;border-radius:12px;letter-spacing:0.3px;box-shadow:0 4px 16px rgba(26,86,160,0.30);">
                      Reset Password Sekarang
                    </a>
                  </div>
                  <p style="margin:24px 0 0;color:#7A96AE;font-size:13px;line-height:1.6;">
                    Link ini hanya berlaku selama <strong>1 jam</strong>. Jika Anda tidak meminta reset password,
                    abaikan email ini — password Anda tidak akan berubah.
                  </p>
                  <hr style="border:none;border-top:1px solid #E8F0F7;margin:28px 0;" />
                  <p style="margin:0;color:#A0B4C8;font-size:12px;text-align:center;">
                    Jika tombol tidak berfungsi, salin link berikut ke browser Anda:<br/>
                    <a href="${resetUrl}" style="color:#1A56A0;word-break:break-all;">${resetUrl}</a>
                  </p>
                </td>
              </tr>
              <!-- Footer -->
              <tr>
                <td style="background:#F7FBFE;padding:20px 40px;text-align:center;border-top:1px solid #E8F0F7;">
                  <p style="margin:0;color:#A0B4C8;font-size:12px;">
                    © ${new Date().getFullYear()} MIS Perumda Tirta Kahuripan. All rights reserved.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `

  if (!process.env.GMAIL_USER || process.env.GMAIL_USER.includes("isi_email_gmail")) {
    console.log("[SYSTEM] Email kredensial belum disetting di .env. Melewati proses kirim email SMTP.")
    return
  }

  try {
    await transporter.sendMail({
      from: `"Helpdesk MIS PDAM" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "Reset Password - Helpdesk MIS Perumda Tirta Kahuripan",
      html,
    })
  } catch (error) {
    console.error("[SYSTEM] Gagal mengirim email:", error)
    // Jangan throw error agar frontend tetap menganggap sukses dan user bisa pakai link di console
  }
}
