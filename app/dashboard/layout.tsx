"use client"

import { formatDistanceToNow } from "date-fns"
import { id } from "date-fns/locale"
import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import { 
  LayoutDashboard, 
  Ticket, 
  MessageSquare, 
  Settings, 
  Menu, 
  X, 
  LogOut, 
  HelpCircle,
  Database,
  Bell,
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session } = useSession()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [desktopCollapsed, setDesktopCollapsed] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [activeChatCount, setActiveChatCount] = useState<number | null>(null)
  const [notifications, setNotifications] = useState<{id: string, title: string, status: string, createdAt: string, isNew: boolean}[]>([])
  const [newCount, setNewCount] = useState(0)
  const [notifOpen, setNotifOpen] = useState(false)

  const isAdminOrStaff = session?.user?.role !== 'user'

  useEffect(() => {
    if (!session?.user) return

    const STORAGE_KEY = `seen_tickets_${session.user.id}`

    const fetchTickets = () => {
      fetch("/api/tickets")
        .then(res => res.json())
        .then(data => {
          const tickets = Array.isArray(data) ? data : (data.tickets ?? [])
          // For admin/staff: all open+in_progress; for user: their own open tickets
          const relevant = tickets.filter((t: {status: string}) => t.status.toLowerCase() === 'open' || t.status.toLowerCase() === 'in_progress')

          // Load seen IDs from localStorage
          let seenIds: string[] = []
          try {
            seenIds = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
          } catch {}

          const mapped = relevant.map((t: {id: string, title: string, status: string, createdAt: string}) => ({
            id: t.id,
            title: t.title,
            status: t.status,
            createdAt: t.createdAt,
            isNew: !seenIds.includes(t.id)
          }))

          const unseen = mapped.filter((n: {isNew: boolean}) => n.isNew).length
          setActiveChatCount(relevant.length > 0 ? relevant.length : null)
          setNewCount(unseen)
          setNotifications(mapped.slice(0, 8))
        }).catch(() => {})
    }

    fetchTickets()
    const interval = setInterval(fetchTickets, 10000)
    return () => clearInterval(interval)
  }, [session?.user])

  // Mark all as read when dropdown opens
  const handleNotifOpen = (open: boolean) => {
    setNotifOpen(open)
    if (open && session?.user) {
      const STORAGE_KEY = `seen_tickets_${session.user.id}`
      const allIds = notifications.map(n => n.id)
      try {
        const existing: string[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
        const merged = Array.from(new Set([...existing, ...allIds]))
        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged))
      } catch {}
      setNewCount(0)
      setNotifications(prev => prev.map(n => ({ ...n, isNew: false })))
    }
  }

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const isSuperadmin = session?.user?.role === "superadmin"
  const isHelpdesk = session?.user?.role?.startsWith("helpdesk_") || isSuperadmin

  const mainRoutes = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Tiket", path: "/dashboard/tickets", icon: Ticket },
    { name: "Live Chat", path: "/dashboard/chat", icon: MessageSquare, badge: activeChatCount?.toString() },
    { name: "Knowledge Base", path: "/dashboard/faq", icon: HelpCircle },
  ]

  const adminRoutes = isSuperadmin ? [
    { name: "Master Data", path: "/dashboard/master", icon: Database },
    { name: "Pengaturan", path: "/dashboard/settings", icon: Settings },
  ] : []

  const SidebarContent = () => (
    <div
      className="flex h-full flex-col relative transition-all duration-300"
      style={{
        background: "linear-gradient(160deg, #2166B3 0%, #1C82AC 55%, #1AA0AC 100%)",
      }}
    >
      {/* Subtle dot-grid texture like login */}
      <div
        className="absolute inset-0 opacity-[0.05] pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(rgba(30,95,150,0.7) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
        }}
      />

      {/* Logo */}
      <div className={`flex h-20 items-center px-6 font-bold text-2xl tracking-tight z-10 transition-all ${desktopCollapsed ? "justify-center px-0" : ""}`}>
        <div className={`transition-all flex items-center justify-center ${desktopCollapsed ? "mr-0" : "mr-3"}`}>
          <Image src="../../PdamLogo.svg" alt="PDAM Logo" width={36} height={36} className="drop-shadow-md brightness-0 invert" />
        </div>
        {!desktopCollapsed && (
          <div className="flex items-center overflow-hidden whitespace-nowrap animate-in fade-in zoom-in duration-300">
            <span className="text-white font-bold">Helpdesk</span>
            <span className="text-cyan-300 ml-1">.</span>
          </div>
        )}
      </div>

      {/* Nav */}
      <div className="flex-1 overflow-y-auto py-6 px-3 z-10 scrollbar-hide space-y-6">
        <div>
          {!desktopCollapsed && <div className="text-[10px] font-semibold text-white/40 mb-3 uppercase tracking-widest px-3 whitespace-nowrap overflow-hidden transition-all duration-300">Menu Utama</div>}
          <nav className="space-y-1">
            {mainRoutes.map((route) => {
              const active = route.path === "/dashboard"
                ? pathname === "/dashboard"
                : pathname === route.path || pathname.startsWith(`${route.path}/`)
              return (
                <Link
                  key={route.path}
                  href={route.path}
                  title={desktopCollapsed ? route.name : undefined}
                  className={`group flex items-center ${desktopCollapsed ? "justify-center" : "justify-between"} rounded-xl p-2.5 text-sm font-medium transition-all duration-200 ${
                    active
                      ? "bg-white/20 text-white shadow-inner backdrop-blur-sm border border-white/20"
                      : "text-white/65 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <div className="flex items-center">
                    <route.icon
                      className={`${desktopCollapsed ? "" : "mr-3"} h-5 w-5 transition-transform duration-200 group-hover:scale-110 ${
                        active ? "text-cyan-300" : "text-white/50 group-hover:text-cyan-300"
                      }`}
                    />
                    {!desktopCollapsed && <span className="whitespace-nowrap overflow-hidden transition-all duration-300">{route.name}</span>}
                  </div>
                  {!desktopCollapsed && route.badge && (
                    <Badge className="bg-cyan-400/20 text-cyan-200 border-cyan-300/30 text-[10px]">
                      {route.badge}
                    </Badge>
                  )}
                </Link>
              )
            })}
          </nav>
        </div>

        {adminRoutes.length > 0 && (
          <div>
            {!desktopCollapsed && <div className="text-[10px] font-semibold text-white/40 mb-3 uppercase tracking-widest px-3 whitespace-nowrap overflow-hidden transition-all duration-300">Administrasi</div>}
            <nav className="space-y-1">
              {adminRoutes.map((route) => {
                const active = route.path === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname === route.path || pathname.startsWith(`${route.path}/`)
                return (
                  <Link
                    key={route.path}
                    href={route.path}
                    title={desktopCollapsed ? route.name : undefined}
                    className={`group flex items-center ${desktopCollapsed ? "justify-center" : "justify-between"} rounded-xl p-2.5 text-sm font-medium transition-all duration-200 ${
                      active
                        ? "bg-white/20 text-white shadow-inner backdrop-blur-sm border border-white/20"
                        : "text-white/65 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center">
                      <route.icon
                        className={`${desktopCollapsed ? "" : "mr-3"} h-5 w-5 transition-transform duration-200 group-hover:scale-110 ${
                          active ? "text-cyan-300" : "text-white/50 group-hover:text-cyan-300"
                        }`}
                      />
                      {!desktopCollapsed && <span className="whitespace-nowrap overflow-hidden transition-all duration-300">{route.name}</span>}
                    </div>
                  </Link>
                )
              })}
            </nav>
          </div>
        )}
      </div>

      {/* User card */}
      <div className="p-3 z-10">
        <div className={`bg-white/10 backdrop-blur-sm rounded-2xl ${desktopCollapsed ? "p-2" : "p-3"} border border-white/15 transition-all duration-300`}>
          <div className={`flex items-center ${desktopCollapsed ? "justify-center" : "space-x-3"} mb-3`}>
            <div className="relative shrink-0">
              <Avatar className="h-9 w-9 border-2 border-white/30 shadow-sm">
                <AvatarFallback className="bg-gradient-to-br from-cyan-400 to-blue-600 text-white font-medium text-sm">
                  {session?.user?.name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-white/20"></div>
            </div>
            {!desktopCollapsed && (
              <div className="flex-1 min-w-0 animate-in fade-in zoom-in duration-300">
                <p className="text-sm font-bold text-white truncate">
                  {session?.user?.name}
                </p>
                <p className="text-[11px] font-medium text-white/50 capitalize truncate">
                  {session?.user?.role?.replace('_', ' ')}
                </p>
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            className={`w-full text-xs h-8 text-white/70 hover:text-white hover:bg-white/15 border border-white/15 ${desktopCollapsed ? "px-0" : ""}`}
            onClick={() => signOut({ callbackUrl: "/login" })}
            title="Keluar"
          >
            <LogOut className={`w-3.5 h-3.5 ${desktopCollapsed ? "" : "mr-2"}`} />
            {!desktopCollapsed && "Keluar"}
          </Button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen overflow-x-hidden bg-[#F0F6FC] dark:bg-zinc-950">
      {/* Mobile sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="p-0 w-[280px] border-none bg-transparent shadow-none overflow-visible">
          <SidebarContent />
          {/* Wave SVG for mobile */}
          <svg
            className="absolute top-0 h-full pointer-events-none"
            style={{ right: '-24px', zIndex: -1 }}
            width="26"
            height="100%"
            viewBox="0 0 26 800"
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="waveGradMobile" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#2166B3" />
                <stop offset="50%" stopColor="#1C82AC" />
                <stop offset="100%" stopColor="#1AA0AC" />
              </linearGradient>
            </defs>
            <path
              d="M0,0 L14,0 C22,3 26,16 24,45 C22,90 12,115 12,175 C12,235 26,258 24,315 C22,372 10,390 12,455 C14,515 22,538 26,600 L26,800 L0,800 Z"
              fill="url(#waveGradMobile)"
            />
          </svg>
        </SheetContent>
      </Sheet>

      {/* Desktop sidebar */}
      <div className={`hidden lg:flex flex-col flex-shrink-0 transition-all duration-300 ease-in-out ${desktopCollapsed ? "w-[88px]" : "w-[280px]"} relative`} style={{zIndex: 30}}>
        <SidebarContent />

        {/* Wave SVG rendered at sidebar wrapper level so it's not clipped */}
        <svg
          className="absolute top-0 h-full pointer-events-none"
          style={{ right: '-24px', zIndex: 25 }}
          width="26"
          height="100%"
          viewBox="0 0 26 800"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="waveGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#2166B3" />
              <stop offset="50%" stopColor="#1C82AC" />
              <stop offset="100%" stopColor="#1AA0AC" />
            </linearGradient>
          </defs>
          <path
            d="M0,0 L14,0 C22,3 26,16 24,45 C22,90 12,115 12,175 C12,235 26,258 24,315 C22,372 10,390 12,455 C14,515 22,538 26,600 L26,800 L0,800 Z"
            fill="url(#waveGrad)"
          />
        </svg>

        <button
          onClick={() => setDesktopCollapsed(!desktopCollapsed)}
          className="absolute top-24 z-50 flex h-6 w-6 items-center justify-center rounded-full border border-white/30 text-white shadow-sm transition-colors"
          style={{ right: '-12px', background: 'linear-gradient(135deg, #1A56A0, #0E8A9E)' }}
        >
          {desktopCollapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
        </button>
      </div>

      <div className="flex w-0 flex-1 flex-col overflow-hidden relative bg-[#F0F6FC] dark:bg-zinc-950 lg:pl-6">
        {/* Header */}
        <header className={`flex h-16 flex-shrink-0 items-center justify-between px-4 sm:px-8 transition-all duration-200 z-20 ${scrolled ? 'bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-slate-200/60 shadow-sm' : 'bg-transparent'}`}>
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden mr-2"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </Button>
          </div>
          
          <div className="flex flex-1 justify-end items-center space-x-2 sm:space-x-4">

            {/* Notification Bell */}
            <DropdownMenu onOpenChange={handleNotifOpen}>
              <DropdownMenuTrigger className="relative flex h-10 w-10 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 focus:outline-none transition-colors">
                <Bell className="h-5 w-5" />
                {newCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white ring-2 ring-white dark:ring-zinc-900 animate-pulse">
                    {newCount > 9 ? '9+' : newCount}
                  </span>
                )}
                {activeChatCount && newCount === 0 && (
                  <span className="absolute top-1 right-1 flex h-2 w-2 rounded-full bg-slate-400 ring-2 ring-white dark:ring-zinc-900"></span>
                )}
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-80" align="end">
                <div className="flex items-center justify-between px-3 py-2.5 border-b border-slate-100 dark:border-zinc-800">
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Notifikasi Tiket</span>
                  <div className="flex items-center gap-2">
                    {newCount > 0 && <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-500 text-white">{newCount} baru</span>}
                    {activeChatCount && <span className="text-xs font-normal px-2 py-0.5 rounded-full text-white" style={{background: 'linear-gradient(135deg,#2166B3,#1AA0AC)'}}>{activeChatCount} aktif</span>}
                  </div>
                </div>
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-sm text-slate-400">
                    <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-slate-200" />
                    <p className="font-medium">Semua tiket selesai!</p>
                    <p className="text-xs mt-0.5">Tidak ada tiket yang perlu ditangani</p>
                  </div>
                ) : (
                  <div className="max-h-72 overflow-y-auto">
                    {notifications.map(n => (
                      <DropdownMenuItem key={n.id} className={`cursor-pointer py-3 px-3 focus:bg-slate-50 ${n.isNew ? 'bg-blue-50/50 dark:bg-blue-950/20' : ''}`} onClick={() => router.push(`/dashboard/tickets`)}>
                        <div className="flex items-start gap-3 w-full">
                          <div className={`mt-0.5 shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
                            n.status === 'open' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'
                          }`}>
                            {n.status === 'open' ? <AlertCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate flex-1">{n.title}</p>
                              {n.isNew && <span className="shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-red-500 text-white">Baru</span>}
                            </div>
                            <p className="text-xs text-slate-400 mt-0.5">{n.status.toLowerCase() === 'open' ? '🟡 Menunggu ditangani' : '🔵 Sedang diproses'}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">
                              {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true, locale: id })}
                            </p>
                          </div>
                        </div>
                      </DropdownMenuItem>
                    ))}
                  </div>
                )}
                <div className="border-t border-slate-100 dark:border-zinc-800 p-1">
                  <DropdownMenuItem className="cursor-pointer justify-center text-sm font-semibold rounded-lg py-2" style={{color: '#2166B3'}} onClick={() => router.push('/dashboard/tickets')}>
                    Lihat Semua Tiket →
                  </DropdownMenuItem>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger className="focus:outline-none flex items-center space-x-2 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors">
                <Avatar className="h-9 w-9 border border-slate-200 dark:border-zinc-700">
                  <AvatarFallback className="text-white font-semibold" style={{background: 'linear-gradient(135deg,#2166B3,#1AA0AC)'}}>
                    {session?.user?.name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:block text-left mr-1">
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 leading-tight">{session?.user?.name?.split(' ')[0]}</p>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <div className="px-3 py-2 border-b border-slate-100 dark:border-zinc-800 mb-1">
                  <p className="text-sm font-semibold leading-none text-slate-800 dark:text-slate-100">{session?.user?.name}</p>
                  <p className="text-xs leading-none text-muted-foreground mt-1">{session?.user?.email}</p>
                </div>
                <DropdownMenuItem className="cursor-pointer" onClick={() => router.push('/dashboard/settings')}>
                  <Settings className="mr-2 h-4 w-4 text-slate-500" />
                  <span>Pengaturan</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-600" onClick={() => signOut({ callbackUrl: "/login" })}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Keluar</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Main content */}
        <main className="relative flex-1 overflow-y-scroll focus:outline-none scroll-smooth">
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] dark:bg-[url('/grid-dark.svg')] opacity-20 pointer-events-none"></div>
          <div className="relative p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto min-h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
