'use client'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { BottomNav } from '@/components/ui/bottom-nav'
import {
  LayoutDashboard,
  Users,
  UserCheck,
  BarChart2,
  LogOut,
  Shield,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { createClient } from '@/lib/supabase'

const navItems = [
  { href: '/admin',             label: 'Overview',    icon: LayoutDashboard },
  { href: '/admin/students',    label: 'Students',    icon: Users },
  { href: '/admin/counsellors', label: 'Counsellors', icon: UserCheck },
  { href: '/admin/mood-trends', label: 'Trends',      icon: BarChart2 },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [userName, setUserName] = useState('Admin')
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

      if (!profile || profile.role !== 'admin') { router.replace('/login'); return }
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

  const currentItem = navItems.find(i => pathname === i.href || pathname.startsWith(i.href + '/'))

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-blue-950/10 to-gray-950 flex">

      {/* ── Sidebar (md+) ───────────────────────────────────────── */}
      <aside className="hidden md:flex fixed left-0 top-0 h-full w-64
                        bg-gray-900/90 border-r border-gray-800
                        backdrop-blur-sm z-40 flex-col">
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
              <Shield size={20} className="text-white" />
            </div>
            <div>
              <span className="text-white font-bold text-lg">StillSpace</span>
              <p className="text-blue-400 text-xs">Admin Panel</p>
            </div>
          </div>
        </div>

        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10">
              <AvatarFallback className="bg-blue-700 text-white">
                {userName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-white text-sm font-medium">{userName}</p>
              <p className="text-blue-400 text-xs">Administrator</p>
            </div>
          </div>
        </div>

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
                    ? 'bg-blue-600/20 text-blue-300 border border-blue-600/30'
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
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
              <Shield size={14} className="text-white" />
            </div>
            <span className="text-white font-semibold text-sm">
              {currentItem?.label ?? 'Admin'}
            </span>
          </div>
          <Avatar className="w-8 h-8">
            <AvatarFallback className="bg-blue-700 text-white text-xs">
              {userName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </header>

        <main className="flex-1 pb-20 md:pb-4">
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
      </div>

      <BottomNav items={navItems} accentColor="blue" />
    </div>
  )
}
