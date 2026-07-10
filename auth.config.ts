import type { NextAuthConfig } from "next-auth"

export const authConfig = {
  providers: [], // Providers are defined in lib/auth.ts to avoid Edge Runtime issues
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.unitKerjaId = user.unitKerjaId
        token.subUnitKerjaId = user.subUnitKerjaId
        token.position = user.position
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.unitKerjaId = token.unitKerjaId as string | null
        session.user.subUnitKerjaId = token.subUnitKerjaId as string | null
        session.user.position = token.position as string | null
      }
      return session
    }
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt"
  }
} satisfies NextAuthConfig
