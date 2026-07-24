"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MessageSquare, X, Send, Bot, Loader2 } from "lucide-react"

type Message = {
  role: "system" | "user" | "assistant"
  content: string
}

export default function LunaAI() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { role: "system", content: "Kamu adalah Luna, Asisten IT pintar yang bekerja untuk MIS Helpdesk PDAM Tirta Kahuripan Kabupaten Bogor. Tugasmu adalah membantu pegawai menyelesaikan masalah dasar terkait komputer, jaringan, printer, atau aplikasi, sebelum mereka membuat tiket bantuan. Jawablah menggunakan bahasa Indonesia yang ramah, sopan, dan jelas." },
    { role: "assistant", content: "Halo! Saya Luna, Asisten IT Anda hari ini. Ada keluhan seputar IT yang bisa saya bantu sebelum Anda membuat tiket?" }
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    if (isOpen) {
      scrollToBottom()
    }
  }, [messages, isOpen])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = { role: "user", content: input.trim() }
    const newMessages = [...messages, userMessage]
    
    setMessages(newMessages)
    setInput("")
    setIsLoading(true)

    try {
      const response = await fetch("https://luna-ai.helpdesk-mis-tirtakahuripan.workers.dev/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages: newMessages }),
      })

      if (!response.ok) {
        throw new Error("Gagal terhubung ke AI")
      }

      const data = await response.json()
      
      setMessages([...newMessages, { role: "assistant", content: data.response }])
    } catch (error) {
      setMessages([...newMessages, { role: "assistant", content: "Maaf, saya sedang mengalami kendala jaringan. Silakan coba beberapa saat lagi." }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-[9000] w-14 h-14 bg-gradient-to-br from-[#1e7fa8] to-[#38bdf8] rounded-full shadow-2xl flex items-center justify-center text-white border-4 border-white/20"
          >
            <Bot className="w-7 h-7" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-[9999] w-[calc(100vw-32px)] sm:w-[380px] h-[500px] max-h-[calc(100vh-64px)] bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] border border-slate-200 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex-shrink-0 bg-gradient-to-r from-[#1e7fa8] to-[#2496bb] p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white backdrop-blur-sm">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">Luna AI</h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse"></span>
                    <span className="text-white/80 text-[11px] font-medium">Asisten Pintar IT</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-white/70 hover:text-white transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 bg-slate-50 space-y-4">
              {messages.filter(m => m.role !== "system").map((msg, index) => (
                <div 
                  key={index} 
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div 
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-[13.5px] leading-relaxed shadow-sm ${
                      msg.role === "user" 
                        ? "bg-[#1e7fa8] text-white rounded-tr-sm" 
                        : "bg-white text-slate-700 border border-slate-200 rounded-tl-sm"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1 items-center shadow-sm">
                    <span className="w-1.5 h-1.5 bg-[#1e7fa8]/50 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-1.5 h-1.5 bg-[#1e7fa8]/50 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-1.5 h-1.5 bg-[#1e7fa8]/50 rounded-full animate-bounce"></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="flex-shrink-0 p-3 bg-white border-t border-slate-100">
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Ketik pertanyaan IT Anda..."
                  disabled={isLoading}
                  className="w-full bg-slate-100 border-transparent focus:bg-white focus:border-[#1e7fa8] focus:ring-2 focus:ring-[#1e7fa8]/20 rounded-full pl-4 pr-12 py-2.5 text-sm text-slate-700 disabled:opacity-50 transition-all outline-none"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="absolute right-1.5 w-8 h-8 flex items-center justify-center bg-[#1e7fa8] text-white rounded-full disabled:opacity-50 disabled:bg-slate-300 hover:bg-[#155f7a] transition-colors"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-3.5 h-3.5 ml-0.5" />}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
