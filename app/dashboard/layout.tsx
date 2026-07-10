"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
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
  ChevronRight
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
  const { data: session } = useSession()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [desktopCollapsed, setDesktopCollapsed] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [activeChatCount, setActiveChatCount] = useState<number | null>(null)

  useEffect(() => {
    // Fetch initial chat count
    const fetchChatCount = () => {
      fetch("/api/tickets/active-count")
        .then(res => res.json())
        .then(data => {
          if (typeof data.count === 'number') {
            setActiveChatCount(data.count > 0 ? data.count : null)
          }
        }).catch(() => {})
    }
    
    fetchChatCount()
    // Poll every 10 seconds
    const interval = setInterval(fetchChatCount, 10000)
    return () => clearInterval(interval)
  }, [])

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
    <div className="flex h-full flex-col bg-white dark:bg-zinc-950 border-r shadow-sm relative transition-all duration-300">
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-blue-50/50 to-transparent dark:from-blue-900/10 pointer-events-none" />
      
      <div className={`flex h-20 items-center px-6 font-bold text-2xl tracking-tight z-10 transition-all ${desktopCollapsed ? "justify-center px-0" : ""}`}>
        <div className={`transition-all flex items-center justify-center ${desktopCollapsed ? "mr-0" : "mr-3"}`}>
          <Image src="../../PdamLogo.svg" alt="PDAM Logo" width={36} height={36} className="drop-shadow-md" />
        </div>
        {!desktopCollapsed && (
          <div className="flex items-center overflow-hidden whitespace-nowrap animate-in fade-in zoom-in duration-300">
            <span className="text-slate-900 dark:text-white">Helpdesk</span>
            <span className="text-blue-600 ml-1">.</span>
          </div>
        )}
      </div>
      
      <div className="flex-1 overflow-y-auto py-6 px-3 z-10 scrollbar-hide space-y-6">
        <div>
          {!desktopCollapsed && <div className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider px-3 whitespace-nowrap overflow-hidden transition-all duration-300">Menu Utama</div>}
          <nav className="space-y-1.5">
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
                      ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-900 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <div className="flex items-center">
                    <route.icon
                      className={`${desktopCollapsed ? "" : "mr-3"} h-5 w-5 transition-transform duration-200 group-hover:scale-110 ${
                        active ? "text-white" : "text-slate-400 group-hover:text-blue-500"
                      }`}
                    />
                    {!desktopCollapsed && <span className="whitespace-nowrap overflow-hidden transition-all duration-300">{route.name}</span>}
                  </div>
                  {!desktopCollapsed && route.badge && (
                    <Badge variant="secondary" className={`${active ? "bg-white/20 text-white hover:bg-white/30" : "bg-blue-100 text-blue-700"}`}>
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
            {!desktopCollapsed && <div className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider px-3 whitespace-nowrap overflow-hidden transition-all duration-300">Administrasi</div>}
            <nav className="space-y-1.5">
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
                        ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-900 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    <div className="flex items-center">
                      <route.icon
                        className={`${desktopCollapsed ? "" : "mr-3"} h-5 w-5 transition-transform duration-200 group-hover:scale-110 ${
                          active ? "text-white" : "text-slate-400 group-hover:text-blue-500"
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
      
      <div className="p-3 z-10 border-t border-slate-100 dark:border-zinc-800">
        <div className={`bg-slate-50 dark:bg-zinc-900 rounded-2xl ${desktopCollapsed ? "p-2" : "p-3"} border border-slate-100 dark:border-zinc-800 transition-all duration-300`}>
          <div className={`flex items-center ${desktopCollapsed ? "justify-center" : "space-x-3"} mb-3`}>
            <div className="relative shrink-0">
              <Avatar className="h-9 w-9 border-2 border-white dark:border-zinc-800 shadow-sm">
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-700 text-white font-medium">
                  {session?.user?.name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white dark:border-zinc-900"></div>
            </div>
            {!desktopCollapsed && (
              <div className="flex-1 min-w-0 animate-in fade-in zoom-in duration-300">
                <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                  {session?.user?.name}
                </p>
                <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 capitalize truncate">
                  {session?.user?.role?.replace('_', ' ')}
                </p>
              </div>
            )}
          </div>
          <Button variant="outline" className={`w-full text-xs h-8 text-slate-600 ${desktopCollapsed ? "px-0" : ""}`} onClick={() => signOut({ callbackUrl: "/login" })} title="Keluar">
            <LogOut className={`w-3.5 h-3.5 ${desktopCollapsed ? "" : "mr-2"}`} />
            {!desktopCollapsed && "Keluar"}
          </Button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-zinc-950/50">
      {/* Mobile sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="p-0 w-[280px] border-r-0">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Desktop sidebar */}
      <div className={`hidden lg:flex flex-col flex-shrink-0 transition-all duration-300 ease-in-out ${desktopCollapsed ? "w-[88px]" : "w-[280px]"} relative`}>
        <SidebarContent />
        <button
          onClick={() => setDesktopCollapsed(!desktopCollapsed)}
          className="absolute -right-3 top-24 z-50 flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm hover:bg-slate-50 hover:text-slate-900 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900 transition-colors"
        >
          {desktopCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      <div className="flex w-0 flex-1 flex-col overflow-hidden relative">
        {/* Header */}
        <header className={`flex h-20 flex-shrink-0 items-center justify-between px-4 sm:px-8 transition-all duration-200 z-20 ${scrolled ? 'bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b shadow-sm' : 'bg-transparent'}`}>
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden mr-2"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </Button>
            <div className="hidden md:flex items-center bg-white dark:bg-zinc-900 rounded-full px-4 py-2 border shadow-sm w-64 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all">
              <Search className="w-4 h-4 text-slate-400 mr-2" />
              <input 
                type="text" 
                placeholder="Cari tiket, artikel..." 
                className="bg-transparent border-none outline-none text-sm w-full text-slate-700 dark:text-slate-200 placeholder:text-slate-400"
              />
            </div>
          </div>
          
          <div className="flex flex-1 justify-end items-center space-x-2 sm:space-x-4">
            <Button variant="ghost" size="icon" className="relative rounded-full text-slate-500 hover:bg-slate-100">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 flex h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-zinc-900"></span>
            </Button>

            <DropdownMenu>
              {/* Using standard div inside DropdownMenuTrigger without asChild to avoid button nesting */}
              <DropdownMenuTrigger className="focus:outline-none flex items-center space-x-2 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors">
                <Avatar className="h-9 w-9 border border-slate-200 dark:border-zinc-700">
                  <AvatarFallback className="bg-blue-100 text-blue-700 font-semibold">
                    {session?.user?.name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:block text-left mr-1">
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 leading-tight">{session?.user?.name?.split(' ')[0]}</p>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{session?.user?.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {session?.user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer">
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
        <main className="relative flex-1 overflow-y-auto focus:outline-none scroll-smooth">
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] dark:bg-[url('/grid-dark.svg')] opacity-20 pointer-events-none"></div>
          <div className="relative p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto min-h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
