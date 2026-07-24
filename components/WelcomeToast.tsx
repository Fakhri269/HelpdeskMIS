"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { getGreeting } from "@/lib/utils"
import { X } from "lucide-react"
import { useSession } from "next-auth/react"

export default function WelcomeToast() {
  const { data: session } = useSession()
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Only show if user is logged in
    if (!session?.user) return

    // Check session storage so it only shows once per session
    const hasSeenGreeting = sessionStorage.getItem("hasSeenGreeting")
    if (!hasSeenGreeting) {
      setIsVisible(true)
      sessionStorage.setItem("hasSeenGreeting", "true")

      // Auto hide after 5 seconds
      const timer = setTimeout(() => {
        setIsVisible(false)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [session])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-sm"
        >
          <div className="bg-white/90 backdrop-blur-xl border border-white/50 shadow-2xl rounded-2xl p-4 pr-10 relative overflow-hidden">
            {/* Wave accent */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 to-blue-500"></div>
            
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-[#1e7fa8] to-[#2496bb] flex items-center justify-center shadow-inner">
                <span className="text-white text-lg">👋</span>
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-sm leading-tight">
                  {getGreeting()},
                </h3>
                <p className="text-sm text-slate-600 truncate max-w-[200px]">
                  {session?.user?.name}
                </p>
              </div>
            </div>

            <button 
              onClick={() => setIsVisible(false)}
              className="absolute top-1/2 -translate-y-1/2 right-3 text-slate-400 hover:text-slate-600 transition-colors p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
