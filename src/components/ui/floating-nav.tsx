'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { MoreHorizontal, LogOut, Sun, Moon } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import type { LucideIcon } from 'lucide-react'
import { useTheme } from '@/lib/theme-context'
import { NotificationBell } from '@/components/ui/notification-bell'

export interface NavItem {
  href: string
  label: string
  icon: LucideIcon
}

interface FloatingNavProps {
  items: NavItem[]
  extras?: NavItem[]
  accentColor?: string
  userName?: string
  userId?: string
  onLogout?: () => void
}

export function FloatingNav({
  items,
  extras,
  accentColor = 'purple',
  userName = '',
  userId = '',
  onLogout,
}: FloatingNavProps) {
  const pathname = usePathname()
  const [moreOpen, setMoreOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const { theme, toggle } = useTheme()

  const accent = {
    text: `text-${accentColor}-400`,
    bg: `bg-${accentColor}-500/15`,
    border: `border-${accentColor}-500/20`,
  }

  return (
    <div className="fixed top-4 inset-x-0 z-50 flex items-center justify-center gap-3 px-4 pointer-events-none">

      {/* ── Main pill ─────────────────────────────────────────────── */}
      <nav className="pointer-events-auto flex items-center gap-0.5 p-1.5 rounded-full
                      bg-gray-900/95 border border-gray-700/50 backdrop-blur-2xl
                      shadow-[0_8px_32px_rgba(0,0,0,0.55)]">

        {items.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex items-center gap-1.5 px-3 md:px-4 py-2 rounded-full transition-colors min-h-[36px]"
            >
              {isActive && (
                <motion.div
                  layoutId="floating-top-glider"
                  className={`absolute inset-0 rounded-full ${accent.bg} border ${accent.border}`}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <Icon
                size={16}
                className={`relative z-10 shrink-0 transition-colors ${isActive ? accent.text : 'text-gray-500'}`}
              />
              <span
                className={`relative z-10 text-sm font-medium transition-colors hidden md:block ${
                  isActive ? 'text-white' : 'text-gray-400'
                }`}
              >
                {item.label}
              </span>
            </Link>
          )
        })}

        {/* More — overflow items */}
        {extras && extras.length > 0 && (
          <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
            <SheetTrigger
              className="flex items-center gap-1.5 px-3 md:px-4 py-2 rounded-full text-gray-500 hover:text-gray-300 transition-colors min-h-[36px]"
            >
              <MoreHorizontal size={16} />
              <span className="text-sm font-medium hidden md:block">More</span>
            </SheetTrigger>
            <SheetContent side="bottom" className="bg-gray-950 border-t border-gray-800 rounded-t-2xl pb-safe">
              <SheetHeader className="mb-4">
                <SheetTitle className="text-white text-base">More</SheetTitle>
              </SheetHeader>
              <div className="grid grid-cols-4 gap-3 pb-6">
                {extras.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMoreOpen(false)}
                      className={`flex flex-col items-center gap-2 p-3 rounded-xl min-h-[64px] transition-colors ${
                        isActive
                          ? `${accent.bg} ${accent.text}`
                          : 'bg-gray-900 text-gray-400 hover:bg-gray-800'
                      }`}
                    >
                      <Icon size={22} />
                      <span className="text-xs font-medium text-center leading-tight">{item.label}</span>
                    </Link>
                  )
                })}
              </div>
            </SheetContent>
          </Sheet>
        )}

        {/* Divider */}
        <div className="w-px h-5 bg-gray-700/60 mx-0.5" />

        {/* Theme toggle */}
        <button
          onClick={toggle}
          className="flex items-center justify-center w-8 h-8 rounded-full text-gray-400 hover:text-gray-200 hover:bg-gray-800/60 transition-all duration-200 shrink-0"
          aria-label="Toggle theme"
        >
          {theme === 'dark'
            ? <Sun size={15} />
            : <Moon size={15} />}
        </button>

        {/* Notifications */}
        {userId && <NotificationBell userId={userId} />}

        {/* Divider */}
        <div className="w-px h-5 bg-gray-700/60 mx-0.5" />

        {/* Avatar / profile */}
        <Sheet open={profileOpen} onOpenChange={setProfileOpen}>
          <SheetTrigger className="flex items-center gap-2 px-2 py-1.5 rounded-full hover:bg-gray-800/60 transition-colors min-h-[36px]">
            <Avatar className="w-7 h-7">
              <AvatarFallback className={`bg-${accentColor}-700 text-white text-xs`}>
                {userName.charAt(0).toUpperCase() || '?'}
              </AvatarFallback>
            </Avatar>
            <span className="text-gray-300 text-sm font-medium hidden md:block max-w-[100px] truncate">
              {userName}
            </span>
          </SheetTrigger>
          <SheetContent side="bottom" className="bg-gray-950 border-t border-gray-800 rounded-t-2xl pb-safe">
            <SheetHeader className="mb-4">
              <SheetTitle className="text-white text-base">Account</SheetTitle>
            </SheetHeader>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-900 mb-4">
              <Avatar className="w-12 h-12">
                <AvatarFallback className={`bg-${accentColor}-700 text-white text-lg`}>
                  {userName.charAt(0).toUpperCase() || '?'}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-white font-semibold">{userName}</p>
                <p className={`text-xs ${accent.text} capitalize`}>{accentColor === 'purple' ? 'Student' : 'Counsellor'}</p>
              </div>
            </div>
            <button
              onClick={() => { setProfileOpen(false); onLogout?.() }}
              className="w-full flex items-center gap-3 p-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <LogOut size={18} />
              <span className="font-medium">Log Out</span>
            </button>
          </SheetContent>
        </Sheet>
      </nav>
    </div>
  )
}
