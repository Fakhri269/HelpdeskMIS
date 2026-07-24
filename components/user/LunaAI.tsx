"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Send, Bot, Loader2 } from "lucide-react"

type Message = {
  role: "system" | "user" | "assistant"
  content: string
}

// Komponen untuk animasi efek mengetik (Typewriter)
const TypewriterText = ({ text, delay = 30 }: { text: string, delay?: number }) => {
  const [displayedText, setDisplayedText] = useState("")

  useEffect(() => {
    let i = 0
    setDisplayedText("") // Reset teks saat mulai
    const timer = setInterval(() => {
      setDisplayedText(text.substring(0, i + 1))
      i++
      if (i >= text.length) {
        clearInterval(timer)
      }
    }, delay)
    return () => clearInterval(timer)
  }, [text, delay])

  return <span>{displayedText}</span>
}

export default function LunaAI() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: "system", 
      content: "Kamu adalah Helpdesk AI, asisten pintar untuk aplikasi MIS Helpdesk PDAM Tirta Kahuripan Kabupaten Bogor. Tugasmu membantu menjawab pertanyaan pengguna seputar IT dan memandu mereka menggunakan aplikasi ini. Alur aplikasi: 1) Jika ada masalah IT, pengguna harus membuat tiket. 2) Caranya klik tombol 'Buat Tiket Baru' di halaman utama. 3) Pilih kategori masalah (Hardware, Software, Jaringan, atau Lainnya). 4) Isi judul dan deskripsi masalah dengan jelas. 5) Klik 'Kirim Tiket'. 6) Setelah dikirim, Staff IT akan merespons tiket tersebut. 7) Pengguna dapat memantau status tiket di menu 'Riwayat Laporan' dan bisa melakukan chat langsung dengan IT di dalam detail tiket tersebut. Jawab pertanyaan dengan sangat singkat, jelas, ramah, dan gunakan bahasa Indonesia yang baik." 
    },
    { 
      role: "assistant", 
      content: "Halo! Saya Helpdesk AI. Ada kendala IT yang bisa saya bantu, atau butuh panduan cara membuat tiket laporan?" 
    }
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
            style={{
              // Bentuk keseluruhan form bergelombang / organik seperti tetesan air
              borderRadius: "40px 40px 12px 40px",
            }}
            className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-[9999] w-[calc(100vw-32px)] sm:w-[380px] h-[550px] max-h-[calc(100vh-64px)] bg-white shadow-[0_20px_60px_rgba(0,0,0,0.15)] overflow-hidden flex flex-col border border-slate-100"
          >
            {/* Header */}
            <div className="relative flex-shrink-0 bg-gradient-to-br from-[#1e7fa8] to-[#2496bb] pt-6 pb-6 px-6 flex items-start justify-between">
              <div className="flex items-center gap-3 relative z-10">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white backdrop-blur-sm border border-white/10 shadow-inner">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-[15px] tracking-wide">Helpdesk AI</h3>
                  <div className="text-white/80 text-[11px] font-medium tracking-wider mt-0.5">
                    ASISTEN PINTAR IT
                  </div>
                </div>
              </div>
              
              <button 
                onClick={() => setIsOpen(false)}
                className="text-white/70 hover:text-white transition-colors p-1.5 bg-black/5 hover:bg-black/10 rounded-full relative z-10"
              >
                <X className="w-4 h-4" />
              </button>
              
              {/* Gelombang air dekoratif di header */}
              <svg 
                className="absolute -bottom-[1px] left-0 w-full h-[20px] z-0" 
                viewBox="0 0 1440 320" 
                preserveAspectRatio="none"
              >
                <path 
                  fill="#f8fafc" 
                  fillOpacity="1" 
                  d="M0,224L80,213.3C160,203,320,181,480,181.3C640,181,800,203,960,213.3C1120,224,1280,224,1360,224L1440,224L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z"
                ></path>
              </svg>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-5 bg-slate-50 space-y-4">
              {(() => {
                const filteredMessages = messages.filter(m => m.role !== "system")
                return filteredMessages.map((msg, index) => {
                  const isAssistant = msg.role === "assistant"
                  const isLatestAssistantMessage = isAssistant && index === filteredMessages.length - 1

                  return (
                    <div 
                      key={index} 
                      className={`flex ${!isAssistant ? "justify-end" : "justify-start"}`}
                    >
                      <div 
                        style={{
                          // Chat bubble bergelombang/organik
                          borderRadius: !isAssistant 
                            ? "24px 24px 4px 24px" 
                            : "24px 24px 24px 4px"
                        }}
                        className={`max-w-[85%] px-5 py-3.5 text-[13.5px] leading-relaxed shadow-sm ${
                          !isAssistant 
                            ? "bg-gradient-to-br from-[#1e7fa8] to-[#2496bb] text-white" 
                            : "bg-white text-slate-700 border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)]"
                        }`}
                      >
                        {isLatestAssistantMessage ? (
                          <TypewriterText text={msg.content} delay={30} />
                        ) : (
                          msg.content
                        )}
                      </div>
                    </div>
                  )
                })
              })()}
              
              {isLoading && (
                <div className="flex justify-start flex-col gap-1">
                  <div 
                    style={{ borderRadius: "24px 24px 24px 4px" }}
                    className="bg-white border border-slate-100 px-5 py-4 flex gap-1.5 items-center shadow-[0_2px_10px_rgba(0,0,0,0.02)] w-fit"
                  >
                    <span className="w-1.5 h-1.5 bg-[#1e7fa8]/60 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-1.5 h-1.5 bg-[#1e7fa8]/60 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-1.5 h-1.5 bg-[#1e7fa8]/60 rounded-full animate-bounce"></span>
                  </div>
                  <span className="text-[10px] font-medium text-slate-400 ml-2">Helpdesk AI sedang mengetik...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="flex-shrink-0 p-3 bg-white border-t border-slate-100 z-10">
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Tanya seputar IT atau error..."
                  disabled={isLoading}
                  className="w-full bg-slate-50 border border-slate-100 focus:bg-white focus:border-[#1e7fa8] focus:ring-2 focus:ring-[#1e7fa8]/20 rounded-full pl-5 pr-14 py-3.5 text-[13px] text-slate-700 disabled:opacity-50 transition-all outline-none shadow-inner"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="absolute right-1.5 w-10 h-10 flex items-center justify-center bg-gradient-to-br from-[#1e7fa8] to-[#2496bb] text-white rounded-full disabled:opacity-50 disabled:from-slate-300 disabled:to-slate-300 hover:shadow-md transition-all"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 ml-0.5" />}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
