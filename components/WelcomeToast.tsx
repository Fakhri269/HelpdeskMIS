"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { getGreeting } from "@/lib/utils"
import { X } from "lucide-react"
import { useSession } from "next-auth/react"

export default function WelcomeToast() {
  const { data: session } = useSession()
  const [isVisible, setIsVisible] = useState(false)
  const [progress, setProgress] = useState(100)

  useEffect(() => {
    if (!session?.user) return
    const hasSeenGreeting = sessionStorage.getItem("hasSeenGreeting")
    if (!hasSeenGreeting) {
      const t = setTimeout(() => {
        setIsVisible(true)
        sessionStorage.setItem("hasSeenGreeting", "true")
      }, 700)
      return () => clearTimeout(t)
    }
  }, [session])

  useEffect(() => {
    if (!isVisible) return
    const duration = 5000
    const interval = 40
    const step = (interval / duration) * 100
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev <= 0) { clearInterval(timer); setIsVisible(false); return 0 }
        return prev - step
      })
    }, interval)
    return () => clearInterval(timer)
  }, [isVisible])

  const firstName = session?.user?.name?.split(" ")[0] ?? "Pengguna"
  const role = (session?.user as any)?.role ?? "user"
  const roleLabel: Record<string, string> = {
    admin: "Administrator",
    staff_it: "Staff IT",
    user: "Pengguna",
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed top-5 right-5 z-[9999] w-[300px]"
        >
          <div className="bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">

            {/* Top accent line */}
            <div className="h-[3px] w-full bg-gradient-to-r from-[#1e7fa8] to-[#38bdf8]" />

            <div className="px-4 py-3.5">
              <div className="flex items-start gap-3">
                {/* Avatar */}
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#1e7fa8] to-[#2496bb] flex items-center justify-center shrink-0">
                  <span className="text-white font-bold text-sm">
                    {firstName.charAt(0).toUpperCase()}
                  </span>
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-slate-400 font-medium">{getGreeting()}</p>
                  <p className="text-slate-800 font-semibold text-[14px] leading-snug truncate">{firstName}</p>
                  <p className="text-slate-400 text-[11px] mt-0.5">{roleLabel[role]} &mdash; Helpdesk MIS</p>
                </div>

                {/* Close */}
                <button
                  onClick={() => setIsVisible(false)}
                  className="text-slate-300 hover:text-slate-500 transition-colors mt-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Progress bar */}
            <div className="h-[2px] bg-slate-100">
              <div
                className="h-full bg-[#1e7fa8] transition-none"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
