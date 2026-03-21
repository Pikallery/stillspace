'use client'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { BottomNav } from '@/components/ui/bottom-nav'
import {
  LayoutDashboard,
  MessageCircle,
  FileText,
  DollarSign,
  Calendar,
  LogOut,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

const navItems = [
  { href: '/counsellor/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/counsellor/chat',      label: 'Chat',      icon: MessageCircle },
  { href: '/counsellor/notes',     label: 'Notes',     icon: FileText },
  { href: '/counsellor/earnings',  label: 'Earnings',  icon: DollarSign },
  { href: '/counsellor/calendar',  label: 'Calendar',  icon: Calendar },
]

// Bottom nav uses same 5 items directly (no "More" needed)
const bottomItems = navItems.map(({ href, label, icon }) => ({ href, label, icon }))

export default function CounsellorLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [userName, setUserName] = useState('Counsellor')

  useEffect(() => {
    const role = localStorage.getItem('demo_role')
    if (role !== 'counsellor') {
      router.replace('/login')
      return
    }
    const name = localStorage.getItem('demo_name') || 'Dr. Counsellor'
    setUserName(name)
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('demo_role')
    localStorage.removeItem('demo_name')
    router.push('/login')
  }

  const currentItem = navItems.find(i => pathname === i.href || pathname.startsWith(i.href + '/'))

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-indigo-950/20 to-gray-950 flex">

      {/* ── Sidebar (md+) ───────────────────────────────────────── */}
      <aside className="hidden md:flex fixed left-0 top-0 h-full w-64
                        bg-gray-900/90 border-r border-gray-800
                        backdrop-blur-sm z-40 flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center">
              <span className="text-xl">🧠</span>
            </div>
            <div>
              <span className="text-white font-bold text-lg">StillSpace</span>
              <p className="text-indigo-400 text-xs">Counsellor Portal</p>
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10">
              <AvatarFallback className="bg-indigo-700 text-white">
                {userName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-white text-sm font-medium">{userName}</p>
              <p className="text-green-400 text-xs">● Available</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 min-h-[44px] ${
                  isActive
                    ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-600/30'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                <Icon size={18} />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-800">
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="w-full justify-start gap-3 text-gray-400 hover:text-white hover:bg-gray-800/50 min-h-[44px]"
          >
            <LogOut size={18} />
            <span className="text-sm">Log Out</span>
          </Button>
        </div>
      </aside>

      {/* ── Main content area ────────────────────────────────────── */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">

        {/* Mobile top bar */}
        <header className="md:hidden sticky top-0 z-30 h-14
                           flex items-center justify-between px-4
                           bg-gray-950/90 border-b border-gray-800 backdrop-blur-xl">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-sm">
              🧠
            </div>
            <span className="text-white font-semibold text-sm">
              {currentItem?.label ?? 'StillSpace'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-green-400 text-xs">● Available</span>
            <Avatar className="w-8 h-8">
              <AvatarFallback className="bg-indigo-700 text-white text-xs">
                {userName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
        </header>

        {/* Page content — pb-20 mobile (just bottom nav, no ticker in counsellor) */}
        <main className="flex-1 pb-20 md:pb-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* ── Bottom nav (mobile only) ─────────────────────────────── */}
      <BottomNav items={bottomItems} accentColor="indigo" />
    </div>
  )
}
