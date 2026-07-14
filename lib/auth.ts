import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import prisma from "@/lib/prisma"
import { supabase } from "@/lib/supabase"
import bcrypt from "bcryptjs"

import { authConfig } from "@/auth.config"

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        
        // Fetch the user's role and unit details from our Prisma 'User' table
        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
          include: { role: true, unitKerja: true }
        })
        
        if (!user || !user.password) {
          console.error("User not found or password not set")
          return null
        }
        
        // Verify password using bcrypt
        const isValid = await bcrypt.compare(credentials.password as string, user.password)
        
        if (!isValid) {
          console.error("Invalid password")
          return null
        }
        
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role?.name || "user",
          unitKerjaId: user.unitKerjaId,
          subUnitKerjaId: user.subUnitKerjaId,
          position: user.position
        }
      }
    })
  ]
})
