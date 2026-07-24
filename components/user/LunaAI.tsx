"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Send, Bot, Loader2 } from "lucide-react"

type Message = {
  role: "system" | "user" | "assistant"
  content: string
}

// Fungsi untuk format teks (bolding)
const formatMessageText = (raw: string) => {
  let formatted = raw
  
  // Tangani single quotes 'Teks'
  const sqCount = (formatted.match(/'/g) || []).length
  if (sqCount % 2 !== 0) formatted += "'"
  formatted = formatted.replace(/'([^']+)'/g, '<strong class="text-[#1e7fa8] font-bold">$1</strong>')

  // Tangani double quotes "Teks"
  const dqCount = (formatted.match(/"/g) || []).length
  if (dqCount % 2 !== 0) formatted += '"'
  formatted = formatted.replace(/"([^"]+)"/g, '<strong class="text-[#1e7fa8] font-bold">$1</strong>')

  // Tangani markdown bold **Teks**
  const astCount = (formatted.match(/\*\*/g) || []).length
  if (astCount % 2 !== 0) formatted += '**'
  formatted = formatted.replace(/\*\*([^*]+)\*\*/g, '<strong class="text-[#1e7fa8] font-bold">$1</strong>')

  // Tangani newline
  formatted = formatted.replace(/\n/g, '<br />')

  return { __html: formatted }
}

const TypewriterText = ({ text, delay = 25 }: { text: string, delay?: number }) => {
  const [displayedText, setDisplayedText] = useState("")

  useEffect(() => {
    let i = 0
    setDisplayedText("") 
    const timer = setInterval(() => {
      setDisplayedText(text.substring(0, i + 1))
      i++
      if (i >= text.length) {
        clearInterval(timer)
      }
    }, delay)
    return () => clearInterval(timer)
  }, [text, delay])

  return <span dangerouslySetInnerHTML={formatMessageText(displayedText)} />
}

export default function LunaAI() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: "system", 
      content: "Kamu adalah Helpdesk AI, asisten pintar untuk aplikasi MIS Helpdesk PDAM Tirta Kahuripan Kabupaten Bogor. Tugasmu membantu menjawab pertanyaan pengguna seputar IT dan memandu mereka menggunakan aplikasi ini. Alur aplikasi: 1) Jika ada masalah IT, pengguna harus membuat tiket. 2) Caranya klik tombol 'Buat Tiket Baru' di halaman utama. 3) Pilih kategori masalah (Hardware, Software, Jaringan, atau Lainnya). 4) Isi judul dan deskripsi masalah dengan jelas. 5) Klik 'Kirim Tiket'. 6) Setelah dikirim, Staff IT akan merespons tiket tersebut. 7) Pengguna dapat memantau status tiket di menu 'Riwayat Laporan' dan bisa melakukan chat langsung dengan IT di dalam detail tiket tersebut. Jawab pertanyaan dengan sangat singkat, jelas, ramah, dan gunakan bahasa Indonesia yang baik. Gunakan tanda kutip tunggal ('...') untuk menyebut nama menu atau tombol." 
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

      {/* Backdrop Overlay (Hanya di Mobile) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm sm:hidden z-[9998]"
          />
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
            className="fixed bottom-0 right-0 sm:bottom-8 sm:right-8 z-[9999] w-full sm:w-[380px] h-[85vh] sm:h-[550px] sm:max-h-[calc(100vh-64px)] flex flex-col drop-shadow-[0_-10px_40px_rgba(0,0,0,0.15)] sm:drop-shadow-[0_20px_60px_rgba(0,0,0,0.15)]"
          >
            {/* Wavy Top Edge SVG */}
            <svg 
              className="block w-full h-[25px] sm:h-[30px] flex-shrink-0 -mb-[1px]" 
              viewBox="0 0 1440 100" 
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="header-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#1e7fa8" />
                  <stop offset="100%" stopColor="#2496bb" />
                </linearGradient>
              </defs>
              <path 
                fill="url(#header-gradient)" 
                d="M0,100 C360,0 1080,100 1440,0 L1440,100 L0,100 Z"
              ></path>
            </svg>

            {/* Header */}
            <div className="relative flex-shrink-0 bg-gradient-to-r from-[#1e7fa8] to-[#2496bb] pt-2 pb-7 px-6 flex items-start justify-between overflow-hidden">
              {/* Gelombang air abstrak di background header */}
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none"></div>
              <div className="absolute top-10 -left-10 w-24 h-24 bg-cyan-300/20 rounded-full blur-lg pointer-events-none"></div>

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
              
              {/* Gelombang dangkal yang sangat halus / shallow wave */}
              <svg 
                className="absolute -bottom-[1px] left-0 w-full h-[16px] sm:h-[20px] z-0" 
                viewBox="0 0 1440 100" 
                preserveAspectRatio="none"
              >
                <path 
                  fill="#f8fafc" 
                  d="M0,40 C360,100 1080,0 1440,40 L1440,100 L0,100 Z"
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
                        {!isAssistant ? (
                          msg.content
                        ) : isLatestAssistantMessage ? (
                          <TypewriterText text={msg.content} delay={25} />
                        ) : (
                          <span dangerouslySetInnerHTML={formatMessageText(msg.content)} />
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
            <div className="flex-shrink-0 p-3 bg-white border-t border-slate-100 z-10 rounded-b-none sm:rounded-b-[24px]">
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
