"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { getGreeting } from "@/lib/utils"
import { X, Sparkles } from "lucide-react"
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
    const duration = 6000
    const interval = 50
    const step = (interval / duration) * 100
    const progressTimer = setInterval(() => {
      setProgress(prev => {
        if (prev <= 0) { clearInterval(progressTimer); setIsVisible(false); return 0 }
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
  const greeting = getGreeting()

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -100, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -60, scale: 0.85 }}
          transition={{ type: "spring", stiffness: 280, damping: 22, mass: 0.9 }}
          className="fixed top-5 left-1/2 -translate-x-1/2 z-[9999] w-[calc(100%-24px)] max-w-[380px]"
        >
          {/* Outer glow */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 blur-xl opacity-40 scale-105" />

          <div className="relative rounded-2xl overflow-hidden shadow-2xl">
            {/* Main gradient background */}
            <div className="bg-gradient-to-br from-[#0c4f6e] via-[#0e6b8f] to-[#1485b0] p-px rounded-2xl">
              <div className="bg-gradient-to-br from-[#0d5f82] via-[#1070a0] to-[#155f7a] rounded-2xl p-5">

                {/* Floating particles (decorative dots) */}
                <div className="absolute top-3 right-12 w-1.5 h-1.5 rounded-full bg-cyan-300/40" />
                <div className="absolute top-6 right-7 w-1 h-1 rounded-full bg-white/30" />
                <div className="absolute bottom-6 left-6 w-1 h-1 rounded-full bg-cyan-400/30" />
                <div className="absolute top-1/2 right-5 w-2 h-2 rounded-full bg-blue-300/20" />

                {/* Wave shape on the right side */}
                <svg className="absolute right-0 top-0 h-full opacity-10 pointer-events-none" viewBox="0 0 60 100" preserveAspectRatio="none" width="80">
                  <path d="M60,0 C40,20 20,30 30,50 C40,70 20,80 0,100 L60,100 Z" fill="white" />
                </svg>

                <div className="flex items-center gap-4 relative">
                  {/* Avatar */}
                  <div className="relative shrink-0">
                    <motion.div
                      animate={{ boxShadow: ["0 0 0 0 rgba(56,189,248,0.4)", "0 0 0 10px rgba(56,189,248,0)", "0 0 0 0 rgba(56,189,248,0)"] }}
                      transition={{ repeat: Infinity, duration: 2.5, ease: "easeOut" }}
                      className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-300 to-blue-400 flex items-center justify-center shadow-lg"
                    >
                      <span className="text-white font-black text-2xl drop-shadow-sm">
                        {firstName.charAt(0).toUpperCase()}
                      </span>
                    </motion.div>
                    {/* Online dot */}
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-[#0d5f82] shadow">
                      <motion.div
                        animate={{ scale: [1, 2, 1], opacity: [0.8, 0, 0.8] }}
                        transition={{ repeat: Infinity, duration: 2, ease: "easeOut" }}
                        className="absolute inset-0 rounded-full bg-emerald-400"
                      />
                    </div>
                  </div>

                  {/* Text content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <Sparkles className="w-3 h-3 text-cyan-300" />
                      <span className="text-cyan-300 text-[11px] font-bold uppercase tracking-widest">
                        {greeting}
                      </span>
                    </div>
                    <p className="text-white font-black text-[18px] leading-tight truncate drop-shadow">
                      {firstName}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="px-2 py-0.5 rounded-full bg-white/15 border border-white/20 text-white/80 text-[10px] font-semibold">
                        {roleLabel[role] ?? "Pengguna"}
                      </span>
                      <span className="text-white/40 text-[10px]">Helpdesk MIS</span>
                    </div>
                  </div>

                  {/* Close button */}
                  <button
                    onClick={() => setIsVisible(false)}
                    className="shrink-0 self-start w-7 h-7 rounded-full flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all duration-200"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Divider */}
                <div className="mt-4 h-px bg-white/10" />

                {/* Progress bar */}
                <div className="mt-3 h-1 w-full bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-blue-300"
                    style={{ width: `${progress}%` }}
                    transition={{ ease: "linear" }}
                  />
                </div>
                <p className="text-white/30 text-[10px] mt-1.5 text-right font-medium">
                  Menutup otomatis...
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
