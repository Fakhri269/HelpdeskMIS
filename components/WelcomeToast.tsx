"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { getGreeting } from "@/lib/utils"
import { useSession } from "next-auth/react"
import { X, Droplet } from "lucide-react"

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
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 bg-slate-900/30 backdrop-blur-md"
            onClick={() => setIsVisible(false)}
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }} // smooth spring
            className="relative w-full max-w-[340px] bg-white rounded-3xl shadow-2xl overflow-hidden"
          >
            {/* Header / Water Wave Theme */}
            <div className="relative h-28 bg-gradient-to-br from-[#155f7a] to-[#2496bb] flex justify-center pt-6">
              {/* Subtle background drop icon */}
              <Droplet className="absolute top-4 left-4 w-12 h-12 text-white/10" />

              <button
                onClick={() => setIsVisible(false)}
                className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors z-20"
                aria-label="Tutup"
              >
                <X className="w-5 h-5" />
              </button>

              {/* The SVG Wave */}
              <svg 
                className="absolute -bottom-[1px] left-0 w-full h-[40px] z-10" 
                viewBox="0 0 1440 320" 
                preserveAspectRatio="none"
              >
                <path 
                  fill="#ffffff" 
                  fillOpacity="1" 
                  d="M0,224L80,213.3C160,203,320,181,480,181.3C640,181,800,203,960,213.3C1120,224,1280,224,1360,224L1440,224L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z"
                />
              </svg>
            </div>

            {/* Content Body */}
            <div className="px-6 pb-8 pt-2 text-center relative z-20">
              <p className="text-[12px] font-bold text-[#1e7fa8] uppercase tracking-wider mb-1">
                {getGreeting()}
              </p>
              <h3 className="text-2xl font-extrabold text-slate-800 mb-3 tracking-tight">
                {session?.user?.name}
              </h3>
              
              <p className="text-sm text-slate-500 leading-relaxed font-medium">
                Selamat datang di <span className="text-slate-700 font-bold">Helpdesk MIS</span>. Kami siap mengalirkan solusi untuk kendala IT Anda.
              </p>
            </div>

            {/* Progress bar to indicate auto-close */}
            <div className="absolute bottom-0 left-0 h-1 bg-slate-100 w-full">
              <div
                className="h-full bg-gradient-to-r from-[#155f7a] to-[#2496bb] transition-none"
                style={{ width: `${progress}%` }}
              />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
