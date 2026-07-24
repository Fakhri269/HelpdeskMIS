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
      }, 500)
      return () => clearTimeout(showTimer)
    }
  }, [session])

  useEffect(() => {
    if (!isVisible) return
    const duration = 5000
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
            onClick={() => setIsVisible(false)}
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="relative w-full max-w-[360px] bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100"
          >
            {/* Top Wave Background */}
            <div className="absolute top-0 left-0 w-full h-[120px] bg-gradient-to-br from-[#155f7a] to-[#2496bb]">
              <svg 
                className="absolute bottom-0 w-full h-[40px]" 
                viewBox="0 0 1440 320" 
                preserveAspectRatio="none"
              >
                <path 
                  fill="#ffffff" 
                  fillOpacity="1" 
                  d="M0,160L48,170.7C96,181,192,203,288,197.3C384,192,480,160,576,165.3C672,171,768,213,864,224C960,235,1056,213,1152,192C1248,171,1344,149,1392,138.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
                ></path>
              </svg>
            </div>

            <button
              onClick={() => setIsVisible(false)}
              className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors z-10"
              aria-label="Tutup"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-7 pt-24 relative z-10">
              <div className="flex flex-col items-center text-center mt-2">
                <p className="text-[#155f7a] font-medium text-sm mb-1">{getGreeting()},</p>
                <h3 className="text-slate-800 font-bold text-2xl leading-tight mb-3">
                  {session?.user?.name}
                </h3>
                
                <p className="text-slate-500 text-sm leading-relaxed">
                  Selamat datang di <strong>Helpdesk MIS</strong>. Kami siap membantu menyelesaikan kendala IT Anda hari ini.
                </p>
              </div>
            </div>

            {/* Progress bar to indicate auto-close */}
            <div className="h-1.5 bg-slate-100 w-full mt-1">
              <div
                className="h-full bg-gradient-to-r from-[#155f7a] to-[#2496bb] transition-none rounded-r-full"
                style={{ width: `${progress}%` }}
              />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
