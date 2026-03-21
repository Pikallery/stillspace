'use client'
import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { MotivationTicker } from '@/components/ui/motivation-ticker'
import { BottomNav } from '@/components/ui/bottom-nav'
import {
  LayoutDashboard,
  ClipboardList,
  MessageCircle,
  MessageSquare,
  Users,
  BookOpen,
  Wind,
  CheckSquare,
  Calendar,
  LogOut,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { createClient } from '@/lib/supabase'

const bottomPrimary = [
  { href: '/student/dashboard', label: 'Home',     icon: LayoutDashboard },
  { href: '/student/triage',   label: 'Survey',    icon: ClipboardList },
  { href: '/student/chat',     label: 'AI Chat',   icon: MessageCircle },
  { href: '/student/messages', label: 'Messages',  icon: MessageSquare },
]
const bottomExtras = [
  { href: '/student/community', label: 'Community', icon: Users },
  { href: '/student/diary',     label: 'Diary',     icon: BookOpen },
  { href: '/student/breathing', label: 'Breathe',   icon: Wind },
  { href: '/student/todo',      label: 'To-Do',     icon: CheckSquare },
  { href: '/student/calendar',  label: 'Calendar',  icon: Calendar },
]

const allNavItems = [
  { href: '/student/dashboard', label: 'Dashboard',    icon: LayoutDashboard },
  { href: '/student/triage',    label: 'Triage Survey', icon: ClipboardList },
  { href: '/student/chat',      label: 'AI Chat',      icon: MessageCircle },
  { href: '/student/messages',  label: 'Messages',     icon: MessageSquare },
  { href: '/student/community', label: 'Community',    icon: Users },
  { href: '/student/diary',     label: 'Diary',        icon: BookOpen },
  { href: '/student/breathing', label: 'Breathing',    icon: Wind },
  { href: '/student/todo',      label: 'To-Do',        icon: CheckSquare },
  { href: '/student/calendar',  label: 'Calendar',     icon: Calendar },
]

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [userName, setUserName] = useState('Student')
  const supabase = createClient()

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.replace('/login'); return }

      const { data: profile } = await supabase
        .from('profiles')
        .select('name, role')
        .eq('id', session.user.id)
        .single()

      if (!profile || profile.role !== 'student') { router.replace('/login'); return }
      setUserName(profile.name)
    }

    checkAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') router.replace('/login')
    })
    return () => subscription.unsubscribe()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const currentItem = allNavItems.find(i => pathname === i.href || pathname.startsWith(i.href + '/'))

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950/20 to-gray-950 flex">

      {/* ── Sidebar (md+) ───────────────────────────────────────── */}
      <aside className="hidden md:flex fixed left-0 top-0 h-full w-64
                        bg-gray-900/90 border-r border-gray-800
                        backdrop-blur-sm z-40 flex-col">
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
              <span className="text-xl">🧠</span>
            </div>
            <span className="text-white font-bold text-lg">StillSpace</span>
          </div>
        </div>

        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10">
              <AvatarFallback className="bg-purple-700 text-white">
                {userName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-white text-sm font-medium">{userName}</p>
              <p className="text-gray-400 text-xs">Student</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {allNavItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 min-h-[44px] ${
                  isActive
                    ? 'bg-purple-600/20 text-purple-300 border border-purple-600/30'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                <Icon size={18} />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            )
          })}
        </nav>

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

        <header className="md:hidden sticky top-0 z-30 h-14
                           flex items-center justify-between px-4
                           bg-gray-950/90 border-b border-gray-800 backdrop-blur-xl">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-sm">
              🧠
            </div>
            <span className="text-white font-semibold text-sm">
              {currentItem?.label ?? 'StillSpace'}
            </span>
          </div>
          <Avatar className="w-8 h-8">
            <AvatarFallback className="bg-purple-700 text-white text-xs">
              {userName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </header>

        <main className="flex-1 pb-24 md:pb-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>

        <MotivationTicker />
      </div>

      <BottomNav items={bottomPrimary} extras={bottomExtras} accentColor="purple" />
    </div>
  )
}
