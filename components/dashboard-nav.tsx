"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { useSession, signOut } from "next-auth/react"
import {
  Brain,
  MessageSquareText,
  Shield,
  Heart,
  BarChart3,
  Mic,
  Users,
  Calendar,
  Settings,
  LogOut,
  Menu,
  X,
  Sparkles,
  Target,
  Lightbulb,
  MessageCircle,
  ChevronDown,
  Bell,
  Crown,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useSubscription } from "@/hooks/use-subscription"
import { sendClientEvent } from "@/lib/analytics"

const navigationGroups = [
  {
    title: "Overview",
    items: [
      {
        name: "Dashboard",
        href: "/dashboard",
        icon: BarChart3,
      },
      {
        name: "Timeline",
        href: "/dashboard/timeline",
        icon: Calendar,
      },
    ],
  },
  {
    title: "AI Analysis Tools",
    items: [
      {
        name: "Chat Analyzer",
        href: "/dashboard/analyzer",
        icon: MessageSquareText,
      },
      {
        name: "Voice Analyzer",
        href: "/dashboard/voice",
        icon: Mic,
      },
      {
        name: "Red Flag Detection",
        href: "/dashboard/red-flags",
        icon: Shield,
      },
      {
        name: "AI Replies",
        href: "/dashboard/replies",
        icon: MessageCircle,
      },
    ],
  },
  {
    title: "Relationship Psychology",
    items: [
      {
        name: "Emotional Intelligence",
        href: "/dashboard/emotions",
        icon: Heart,
      },
      {
        name: "Attachment Style",
        href: "/dashboard/attachment",
        icon: Target,
      },
      {
        name: "Conflict Resolution",
        href: "/dashboard/conflict",
        icon: Lightbulb,
      },
      {
        name: "Compatibility",
        href: "/dashboard/compatibility",
        icon: Users,
      },
      {
        name: "AI Coach",
        href: "/dashboard/coach",
        icon: Sparkles,
      },
    ],
  },
]

const navigationItems = navigationGroups.flatMap((group) => group.items)

type SidebarContentProps = {
  pathname: string
  onNavigate?: () => void
}

export function DashboardNav({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const { subscription } = useSubscription()
  const activeTier = subscription?.tier || "free"
  const user = session?.user
  const userName = user?.name || "Guest"
  const userEmail = user?.email || ""
  const userImage = user?.image || ""

  const [mounted, setMounted] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const [notifications, setNotifications] = useState<any[]>([])
  const [readIds, setReadIds] = useState<string[]>([])
  const [notificationsOpen, setNotificationsOpen] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    // Load read notification IDs from localStorage
    const saved = localStorage.getItem("heartmind_read_notifications")
    if (saved) {
      try {
        setReadIds(JSON.parse(saved))
      } catch (e) {
        console.error(e)
      }
    }

    // Fetch dynamic notifications from API
    const fetchNotifications = async () => {
      try {
        const res = await fetch("/api/notifications")
        const data = await res.json()
        if (data.success) {
          setNotifications(data.notifications || [])
        }
      } catch (err) {
        console.error("Error fetching notifications:", err)
      }
    }

    fetchNotifications()
  }, [])

  const unreadCount = useMemo(() => {
    return notifications.filter(n => !readIds.includes(n.id)).length
  }, [notifications, readIds])

  const handleMarkAllAsRead = () => {
    const allIds = notifications.map(n => n.id)
    setReadIds(allIds)
    localStorage.setItem("heartmind_read_notifications", JSON.stringify(allIds))
  }

  const handleNotificationClick = (id: string) => {
    if (!readIds.includes(id)) {
      const updated = [...readIds, id]
      setReadIds(updated)
      localStorage.setItem("heartmind_read_notifications", JSON.stringify(updated))
    }
  }

  const formatTime = (isoString: string) => {
    try {
      const now = new Date()
      const date = new Date(isoString)
      const diffMs = now.getTime() - date.getTime()
      const diffMins = Math.floor(diffMs / 60000)
      const diffHours = Math.floor(diffMs / 3600000)
      const diffDays = Math.floor(diffMs / 86400000)

      if (diffMins < 1) return "Just now"
      if (diffMins < 60) return `${diffMins}m ago`
      if (diffHours < 24) return `${diffHours}h ago`
      if (diffDays === 1) return "Yesterday"
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
    } catch (e) {
      return ""
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "tip":
        return Lightbulb
      case "promo":
        return Sparkles
      case "system":
        return Brain
      case "user":
      default:
        return Shield
    }
  }

  const userInitials = useMemo(() => {
    if (!userName) return "U"
    const parts = userName.trim().split(/\s+/)
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    }
    return userName.slice(0, 2).toUpperCase()
  }, [userName])

  const cleanPath = useMemo(() => {
    if (!pathname) return "/dashboard"
    return pathname.split("#")[0]
  }, [pathname])

  const currentPage =
    navigationItems.find((item) => item.href === cleanPath)?.name ||
    "Dashboard"

  // Prevent hydration mismatch
  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 glass-strong h-16">
        <div className="flex items-center justify-between h-full px-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>

            <span className="font-bold gradient-text">
              HeartMind
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="relative"
                onClick={() => {
                  setNotificationsOpen((prev) => !prev)
                  setUserMenuOpen(false)
                }}
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full animate-pulse" />
                )}
              </Button>

              <AnimatePresence>
                {notificationsOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-40 bg-transparent" 
                      onClick={() => setNotificationsOpen(false)} 
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-[-48px] top-full mt-3 w-80 bg-[#071022]/98 backdrop-blur-xl rounded-2xl border border-white/[0.08] shadow-2xl z-50 overflow-hidden"
                    >
                      <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.08] bg-black/30 select-none">
                        <span className="text-[10px] font-bold tracking-wider uppercase text-zinc-300">
                          Notifications
                        </span>
                        {unreadCount > 0 && (
                          <button
                            onClick={handleMarkAllAsRead}
                            className="text-[9px] font-semibold text-primary hover:underline transition-all"
                          >
                            Mark all as read
                          </button>
                        )}
                      </div>

                      <div className="max-h-[320px] overflow-y-auto divide-y divide-white/[0.06] bg-black/10">
                        {notifications.length === 0 ? (
                          <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                            <Sparkles className="w-8 h-8 text-zinc-600 mb-2 animate-pulse" />
                            <p className="text-[11px] text-zinc-400 font-semibold">All quiet here</p>
                            <p className="text-[9px] text-zinc-500 mt-0.5">No notifications yet.</p>
                          </div>
                        ) : (
                          notifications.map((notif) => {
                            const isRead = readIds.includes(notif.id)
                            const IconComponent = getNotificationIcon(notif.type)
                            
                            const itemContent = (
                              <div className="flex gap-3 p-3 items-start">
                                <div className={cn(
                                  "w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border",
                                  notif.type === "system" && "bg-blue-500/10 border-blue-500/20 text-blue-400",
                                  notif.type === "user" && "bg-green-500/10 border-green-500/20 text-green-400",
                                  notif.type === "promo" && "bg-pink-500/10 border-pink-500/20 text-pink-400",
                                  notif.type === "tip" && "bg-amber-500/10 border-amber-500/20 text-amber-400"
                                )}>
                                  <IconComponent className="w-3.5 h-3.5" />
                                </div>

                                <div className="flex-1 space-y-0.5 min-w-0 text-left">
                                  <div className="flex items-center justify-between gap-1.5">
                                    <h4 className={cn(
                                      "text-[10px] font-semibold truncate text-zinc-300",
                                      !isRead && "text-white font-bold"
                                    )}>
                                      {notif.title}
                                    </h4>
                                    {!isRead && (
                                      <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                                    )}
                                  </div>
                                  <p className="text-[9px] text-zinc-400 leading-normal font-normal break-words">
                                    {notif.message}
                                  </p>
                                  <span className="text-[7.5px] text-zinc-500 block pt-0.5">
                                    {formatTime(notif.timestamp)}
                                  </span>
                                </div>
                              </div>
                            )

                            if (notif.link) {
                              return (
                                <Link
                                  key={notif.id}
                                  href={notif.link}
                                  onClick={() => {
                                    handleNotificationClick(notif.id)
                                    setNotificationsOpen(false)
                                  }}
                                  className="block hover:bg-white/[0.01] active:bg-white/[0.02] transition-colors"
                                >
                                  {itemContent}
                                </Link>
                              )
                            }

                            return (
                              <div
                                key={notif.id}
                                onClick={() => handleNotificationClick(notif.id)}
                                className="hover:bg-white/[0.01] active:bg-white/[0.02] transition-colors cursor-pointer"
                              >
                                {itemContent}
                              </div>
                            )
                          })
                        )}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen((prev) => !prev)}
            >
              {sidebarOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black/60 z-40"
              onClick={() => setSidebarOpen(false)}
            />

            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{
                type: "spring",
                damping: 25,
                stiffness: 200,
              }}
              className="lg:hidden fixed top-0 left-0 bottom-0 w-72 z-50 glass-strong border-r border-border overflow-y-auto"
            >
              <SidebarContent
                pathname={cleanPath}
                onNavigate={() => setSidebarOpen(false)}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col fixed top-0 left-0 bottom-0 w-72 glass-strong border-r border-border overflow-y-auto">
        <SidebarContent pathname={cleanPath} />
      </aside>

      {/* Main Content */}
      <main className="lg:ml-72 pt-16 lg:pt-0 min-h-screen">
        {/* Desktop Header */}
        <header className="hidden lg:flex items-center justify-between h-16 px-6 glass-strong border-b border-border sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-semibold">
              {currentPage}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="relative"
                onClick={() => {
                  setNotificationsOpen((prev) => !prev)
                  setUserMenuOpen(false)
                }}
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full animate-pulse" />
                )}
              </Button>

              <AnimatePresence>
                {notificationsOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-40 bg-transparent" 
                      onClick={() => setNotificationsOpen(false)} 
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 top-full mt-2 w-96 bg-[#071022]/98 backdrop-blur-xl rounded-2xl border border-white/[0.08] shadow-2xl z-50 overflow-hidden"
                    >
                      <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.08] bg-black/30 select-none">
                        <span className="text-xs font-bold tracking-wider uppercase text-zinc-300">
                          Notifications
                        </span>
                        {unreadCount > 0 && (
                          <button
                            onClick={handleMarkAllAsRead}
                            className="text-[10px] font-semibold text-primary hover:underline transition-all"
                          >
                            Mark all as read
                          </button>
                        )}
                      </div>

                      <div className="max-h-[360px] overflow-y-auto divide-y divide-white/[0.06] bg-black/10">
                        {notifications.length === 0 ? (
                          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                            <Sparkles className="w-8 h-8 text-zinc-600 mb-2 animate-pulse" />
                            <p className="text-xs text-zinc-400 font-semibold">All quiet here</p>
                            <p className="text-[10px] text-zinc-500 mt-0.5">No notifications yet.</p>
                          </div>
                        ) : (
                          notifications.map((notif) => {
                            const isRead = readIds.includes(notif.id)
                            const IconComponent = getNotificationIcon(notif.type)
                            
                            const itemContent = (
                              <div className="flex gap-3.5 p-3.5 items-start">
                                <div className={cn(
                                  "w-7.5 h-7.5 rounded-lg flex items-center justify-center shrink-0 border",
                                  notif.type === "system" && "bg-blue-500/10 border-blue-500/20 text-blue-400",
                                  notif.type === "user" && "bg-green-500/10 border-green-500/20 text-green-400",
                                  notif.type === "promo" && "bg-pink-500/10 border-pink-500/20 text-pink-400",
                                  notif.type === "tip" && "bg-amber-500/10 border-amber-500/20 text-amber-400"
                                )}>
                                  <IconComponent className="w-4 h-4" />
                                </div>

                                <div className="flex-1 space-y-0.5 min-w-0 text-left">
                                  <div className="flex items-center justify-between gap-1.5">
                                    <h4 className={cn(
                                      "text-[11px] font-semibold truncate text-zinc-300",
                                      !isRead && "text-white font-bold"
                                    )}>
                                      {notif.title}
                                    </h4>
                                    {!isRead && (
                                      <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                                    )}
                                  </div>
                                  <p className="text-[10px] text-zinc-400 leading-relaxed font-normal break-words">
                                    {notif.message}
                                  </p>
                                  <span className="text-[8px] text-zinc-500 block pt-0.5">
                                    {formatTime(notif.timestamp)}
                                  </span>
                                </div>
                              </div>
                            )

                            if (notif.link) {
                              return (
                                <Link
                                  key={notif.id}
                                  href={notif.link}
                                  onClick={() => {
                                    handleNotificationClick(notif.id)
                                    setNotificationsOpen(false)
                                  }}
                                  className="block hover:bg-white/[0.01] active:bg-white/[0.02] transition-colors"
                                >
                                  {itemContent}
                                </Link>
                              )
                            }

                            return (
                              <div
                                key={notif.id}
                                onClick={() => handleNotificationClick(notif.id)}
                                className="hover:bg-white/[0.01] active:bg-white/[0.02] transition-colors cursor-pointer"
                              >
                                {itemContent}
                              </div>
                            )
                          })
                        )}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            <div className="relative">
              <button
                onClick={() =>
                  setUserMenuOpen((prev) => !prev)
                }
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-secondary transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center overflow-hidden">
                  {userImage ? (
                    <img key={userImage} src={userImage} alt={userName} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-sm font-medium text-white">
                      {userInitials}
                    </span>
                  )}
                </div>

                <span className="text-sm font-medium">
                  {userName}
                </span>

                <ChevronDown
                  className={cn(
                    "w-4 h-4 transition-transform",
                    userMenuOpen && "rotate-180"
                  )}
                />
              </button>

              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{
                      opacity: 0,
                      y: 10,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    exit={{
                      opacity: 0,
                      y: 10,
                    }}
                    className="absolute right-0 top-full mt-2 w-48 bg-[#071022]/98 backdrop-blur-xl rounded-xl border border-white/[0.08] shadow-2xl z-50 overflow-hidden"
                  >
                    <Link
                      href="/dashboard/settings"
                      className="flex items-center gap-2 px-4 py-3 hover:bg-secondary transition-colors"
                      onClick={() =>
                        setUserMenuOpen(false)
                      }
                    >
                      <Settings className="w-4 h-4" />

                      <span className="text-sm">
                        Settings
                      </span>
                    </Link>

                    <Link
                      href="/dashboard/upgrade"
                      className="flex items-center gap-2 px-4 py-3 hover:bg-secondary transition-colors"
                      onClick={() =>
                        setUserMenuOpen(false)
                      }
                    >
                      <Crown className="w-4 h-4 text-primary" />

                      <span className="text-sm">
                        {activeTier === "free" ? "Upgrade to Pro" : activeTier === "pro" ? "Upgrade to Premium" : "View Subscription"}
                      </span>
                    </Link>

                    <hr className="border-border" />

                    <button
                      onClick={() => {
                        setUserMenuOpen(false)
                        signOut()
                      }}
                      className="flex w-full items-center gap-2 px-4 py-3 hover:bg-secondary transition-colors text-danger text-left"
                    >
                      <LogOut className="w-4 h-4" />

                      <span className="text-sm">
                        Sign Out
                      </span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        <div className="p-4 lg:p-6">{children}</div>
      </main>
    </div>
  )
}

function SidebarContent({
  pathname,
  onNavigate,
}: SidebarContentProps) {
  const { data: session } = useSession()
  const { subscription } = useSubscription()
  const activeTier = subscription?.tier || "free"
  const isTrialActive = subscription?.isTrialActive || false
  const hasUsedTrial = subscription?.hasUsedTrial || false
  const premiumAccessSource = subscription?.premiumAccessSource || "none"
  const user = session?.user
  const userName = user?.name || "Guest"
  const userEmail = user?.email || ""
  const userImage = user?.image || ""

  const userInitials = useMemo(() => {
    if (!userName) return "U"
    const parts = userName.trim().split(/\s+/)
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    }
    return userName.slice(0, 2).toUpperCase()
  }, [userName])

  return (
    <div className="flex flex-col h-full p-5">
      {/* Logo */}
      <Link
        href="/dashboard"
        className="flex items-center gap-2.5 px-3 py-4 mb-4"
      >
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-md shadow-primary/10">
          <Brain className="w-4.5 h-4.5 text-white" />
        </div>

        <span className="text-lg font-bold tracking-tight text-white">
          HeartMind<span className="text-primary">.ai</span>
        </span>
      </Link>

      {/* Navigation Groups */}
      <div className="flex-1 overflow-y-auto pr-1 -mr-2 space-y-6">
        {navigationGroups.map((group) => (
          <div key={group.title} className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500/80 px-3 block select-none">
              {group.title}
            </span>
            <nav className="space-y-0.5">
              {group.items.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/dashboard" &&
                    pathname.startsWith(item.href))

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={onNavigate}
                    className={cn(
                      "flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all duration-300 border text-xs font-medium relative group",
                      isActive
                        ? "text-foreground border-transparent"
                        : "text-zinc-400 hover:text-foreground border-transparent hover:bg-white/[0.01]"
                    )}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeNavBackground"
                        className="absolute inset-0 bg-white/[0.04] border border-white/[0.03] rounded-lg -z-10 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.02)] shadow-sm"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}

                    <item.icon
                      className={cn(
                        "w-4 h-4 transition-colors z-10",
                        isActive ? "text-primary" : "text-zinc-500 group-hover:text-zinc-300"
                      )}
                    />

                    <span className="flex-1 z-10">{item.name}</span>

                    {isActive && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="w-1 h-1 rounded-full bg-primary z-10"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                  </Link>
                )
              })}
            </nav>
          </div>
        ))}
      </div>

      {/* Dynamic Membership/Upgrade Card */}
      <div className={cn(
        "mt-6 p-4 rounded-xl relative overflow-hidden shadow-xl shadow-black/20 border transition-all duration-300",
        isTrialActive
          ? "bg-gradient-to-b from-zinc-950/60 to-zinc-900/60 border-primary/30 neon-glow-pink"
          : activeTier === "premium" && premiumAccessSource === "subscription"
          ? "bg-gradient-to-b from-zinc-950/60 to-zinc-900/60 border-amber-500/30"
          : activeTier === "pro"
          ? "bg-gradient-to-b from-zinc-950/60 to-zinc-900/60 border-accent/30"
          : "bg-gradient-to-b from-zinc-900/60 to-zinc-950/60 border-white/[0.04]"
      )}>
        <div className={cn(
          "absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r",
          isTrialActive
            ? "from-transparent via-primary to-transparent"
            : activeTier === "premium" && premiumAccessSource === "subscription"
            ? "from-transparent via-amber-500 to-transparent"
            : activeTier === "pro"
            ? "from-transparent via-accent to-transparent"
            : "from-transparent via-primary/30 to-transparent"
        )} />
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Crown className={cn(
              "w-3.5 h-3.5", 
              isTrialActive 
                ? "text-primary animate-pulse" 
                : activeTier === "premium" && premiumAccessSource === "subscription"
                ? "text-amber-400"
                : activeTier === "pro"
                ? "text-accent"
                : "text-zinc-500"
            )} />
            <span className="font-semibold text-xs text-zinc-200">
              {isTrialActive 
                ? "Premium Trial" 
                : activeTier === "premium" && premiumAccessSource === "subscription"
                ? "HeartMind Premium" 
                : activeTier === "pro"
                ? "HeartMind Pro" 
                : "HeartMind Free"}
            </span>
          </div>
          <span className={cn(
            "text-[9px] font-bold py-0.5 px-1.5 rounded-full uppercase border",
            isTrialActive
              ? "bg-primary/10 border-primary/20 text-primary animate-pulse"
              : activeTier === "premium" && premiumAccessSource === "subscription"
              ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
              : activeTier === "pro"
              ? "bg-accent/10 border-accent/20 text-accent"
              : "bg-zinc-800 border-zinc-700 text-zinc-400"
          )}>
            {isTrialActive 
              ? "PREMIUM TRIAL" 
              : activeTier === "premium" && premiumAccessSource === "subscription"
              ? "PREMIUM MEMBER"
              : activeTier === "pro"
              ? "PRO MEMBER"
              : "FREE PLAN"}
          </span>
        </div>

        <p className="text-[11px] text-zinc-400 mb-3 leading-relaxed">
          {isTrialActive
            ? "You are currently exploring the complete HeartMind Premium experience."
            : activeTier === "premium" && premiumAccessSource === "subscription"
            ? "Full emotional intelligence suite active."
            : activeTier === "pro"
            ? "Unlock AI Coach, memory timeline, and compatibility alignment."
            : "Get 1 initial relationship analysis session for free. Upgrade to unlock full insights."}
        </p>

        <Link href="/dashboard/upgrade">
          <Button
            className={cn(
              "w-full text-xs font-semibold py-1.5 h-8 rounded-lg border transition-all duration-300",
              isTrialActive
                ? "bg-primary hover:bg-primary/95 text-white border border-white/5 shadow-md shadow-primary/10"
                : activeTier === "premium" && premiumAccessSource === "subscription"
                ? "bg-zinc-900 border-white/[0.06] hover:bg-zinc-800 text-white"
                : activeTier === "pro"
                ? "bg-gradient-to-r from-primary to-accent hover:from-primary/95 hover:to-accent/95 text-white border-white/5 shadow-md shadow-primary/10"
                : "bg-primary hover:bg-primary/95 text-white border border-white/5 shadow-md shadow-primary/10"
            )}
            size="sm"
          >
            {isTrialActive 
              ? "Lock In Premium Access" 
              : activeTier === "premium" && premiumAccessSource === "subscription"
              ? "Manage Subscription" 
              : activeTier === "pro"
              ? "Go Premium" 
              : "Upgrade Now"}
          </Button>
        </Link>
      </div>

      {/* Mobile User Section */}
      <div className="lg:hidden mt-4 pt-4 border-t border-white/[0.04]">
        <div className="flex items-center gap-3 px-2 mb-4">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center overflow-hidden">
            {userImage ? (
              <img key={userImage} src={userImage} alt={userName} className="w-full h-full object-cover" />
            ) : (
              <span className="text-xs font-semibold text-white">
                {userInitials}
              </span>
            )}
          </div>

          <div>
            <p className="text-sm font-semibold text-zinc-200">{userName}</p>

            <p className="text-[10px] text-zinc-500 max-w-[150px] truncate">
              {userEmail}
            </p>
          </div>
        </div>

        <div className="space-y-0.5">
          <Link
            href="/dashboard/settings"
            onClick={onNavigate}
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-zinc-400 hover:text-foreground hover:bg-white/[0.02] transition-colors"
          >
            <Settings className="w-4 h-4 text-zinc-500" />

            <span>Settings</span>
          </Link>

          <button
            onClick={() => {
              if (onNavigate) onNavigate()
              signOut()
            }}
            className="flex w-full items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-danger hover:bg-danger/10 transition-colors text-left"
          >
            <LogOut className="w-4 h-4" />

            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  )
}