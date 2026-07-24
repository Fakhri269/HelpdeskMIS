"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { getGreeting } from "@/lib/utils"
import { useSession } from "next-auth/react"
import { X } from "lucide-react"

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
      }, 500) // slight delay before showing
      return () => clearTimeout(showTimer)
    }
  }, [session])

  useEffect(() => {
    if (!isVisible) return
    const duration = 4000 // 4 seconds duration
    const interval = 40
    const step = (interval / duration) * 100
    
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev <= 0) { 
          clearInterval(timer)
          setIsVisible(false)
          return 0 
        }
        return prev - step
      })
    }, interval)
    
    return () => clearInterval(timer)
  }, [isVisible])

  // Prevent scroll when modal is open
  useEffect(() => {
    if (isVisible) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    return () => {
      document.body.style.overflow = "unset"
    }
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
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-0">
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm"
            onClick={() => setIsVisible(false)} // Close when clicking outside
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="relative w-full max-w-[360px] bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden"
          >
            {/* Top accent bar */}
            <div className="h-1.5 w-full bg-[#1e7fa8]" />

            <div className="p-6">
              <button
                onClick={() => setIsVisible(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
                aria-label="Tutup"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex flex-col items-center text-center mt-2">
                {/* Avatar / Initial */}
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-200 flex items-center justify-center mb-4 shadow-sm">
                  <span className="text-[#1e7fa8] font-bold text-2xl">
                    {firstName.charAt(0).toUpperCase()}
                  </span>
                </div>

                <p className="text-slate-500 font-medium text-sm mb-1">{getGreeting()},</p>
                <h3 className="text-slate-800 font-bold text-xl leading-tight mb-2">
                  {session?.user?.name}
                </h3>
                
                <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold border border-slate-200">
                  {roleLabel[role]}
                </span>
              </div>
            </div>

            {/* Progress bar to indicate auto-close */}
            <div className="h-1 bg-slate-100 w-full mt-2">
              <div
                className="h-full bg-slate-300 transition-none"
                style={{ width: `${progress}%` }}
              />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
