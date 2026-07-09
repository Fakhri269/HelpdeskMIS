import { SessionProvider } from "next-auth/react"

export default function UserPortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {children}
    </SessionProvider>
  )
}
