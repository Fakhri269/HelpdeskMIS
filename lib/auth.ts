import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import prisma from "@/lib/prisma"
import { supabase } from "@/lib/supabase"

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
        
        // 1. Verify credentials against Supabase Auth
        const { data: authData, error } = await supabase.auth.signInWithPassword({
          email: credentials.email as string,
          password: credentials.password as string,
        })
        
        if (error || !authData.user) {
          console.error("Supabase Auth Error:", error?.message || "User data missing")
          return null
        }
        
        // 2. Fetch the user's role and unit details from our Prisma 'User' table
        let user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
          include: { role: true, unitKerja: true }
        })
        
        if (!user) {
          // Auto-create user di Prisma dengan role 'user'
          const defaultRole = await prisma.role.findFirst({
            where: { name: 'user' }
          })
          
          if (!defaultRole) {
            throw new Error("Gagal auto-create: Role default 'user' tidak ditemukan di database lokal.")
          }
          
          user = await prisma.user.create({
            data: {
              email: credentials.email as string,
              name: (credentials.email as string).split('@')[0], // Gunakan bagian depan email sebagai nama
              password: "supabase-auth", // Password tidak digunakan karena pakai Supabase
              roleId: defaultRole.id
            },
            include: { role: true, unitKerja: true }
          })
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
