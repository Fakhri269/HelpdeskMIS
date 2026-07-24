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
      const showTimer = setTimeout(() => {
        setIsVisible(true)
        sessionStorage.setItem("hasSeenGreeting", "true")
      }, 600)
      return () => clearTimeout(showTimer)
    }
  }, [session])

  useEffect(() => {
    if (!isVisible) return

    const duration = 5000
    const interval = 50
    const step = (interval / duration) * 100

    const progressTimer = setInterval(() => {
      setProgress(prev => {
        if (prev <= 0) {
          clearInterval(progressTimer)
          setIsVisible(false)
          return 0
        }
        return prev - step
      })
    }, interval)

    return () => clearInterval(progressTimer)
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
          initial={{ opacity: 0, y: -80, scale: 0.85, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -40, scale: 0.9, filter: "blur(4px)" }}
          transition={{ type: "spring", stiffness: 320, damping: 28, mass: 0.8 }}
          className="fixed top-5 left-1/2 -translate-x-1/2 z-[100] w-[calc(100%-32px)] max-w-[360px]"
        >
          <div className="relative bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.12),0_4px_16px_rgba(0,0,0,0.06)] border border-slate-100 overflow-hidden">
            
            {/* Gradient bar top */}
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-[#1e7fa8] via-[#38bdf8] to-[#06b6d4]" />

            {/* Background accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-cyan-50/60 to-transparent rounded-bl-full pointer-events-none" />

            <div className="px-5 py-4">
              <div className="flex items-center gap-4">
                {/* Avatar */}
                <div className="relative shrink-0">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#155f7a] to-[#2496bb] flex items-center justify-center shadow-md">
                    <span className="text-white font-bold text-base">
                      {firstName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  {/* Online dot */}
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white shadow-sm">
                    <motion.div
                      animate={{ scale: [1, 1.8, 1], opacity: [1, 0, 1] }}
                      transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                      className="absolute inset-0 rounded-full bg-emerald-400"
                    />
                  </div>
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-semibold text-[#1e7fa8] uppercase tracking-widest mb-0.5">
                    {getGreeting()}
                  </p>
                  <p className="text-slate-800 font-bold text-[15px] leading-tight truncate">
                    {firstName}
                  </p>
                  <p className="text-slate-400 text-[11px] font-medium mt-0.5">
                    {roleLabel[role] ?? "Pengguna"} &mdash; Helpdesk MIS
                  </p>
                </div>

                {/* Close button */}
                <button
                  onClick={() => setIsVisible(false)}
                  className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-slate-300 hover:text-slate-600 hover:bg-slate-100 transition-all duration-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Progress bar */}
            <div className="h-[3px] bg-slate-100 w-full">
              <motion.div
                className="h-full bg-gradient-to-r from-[#1e7fa8] to-[#38bdf8] origin-left"
                style={{ scaleX: progress / 100 }}
                transition={{ ease: "linear" }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
