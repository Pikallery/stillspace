'use client'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { FloatingNav } from '@/components/ui/floating-nav'
import { LoadingScreen } from '@/components/ui/loading-screen'
import {
  LayoutDashboard,
  MessageCircle,
  FileText,
  DollarSign,
  Calendar,
  HeartHandshake,
} from 'lucide-react'
import { createClient } from '@/lib/supabase'

const primaryItems = [
  { href: '/counsellor/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/counsellor/chat',      label: 'Chat',      icon: MessageCircle },
  { href: '/counsellor/notes',     label: 'Notes',     icon: FileText },
  { href: '/counsellor/earnings',  label: 'Earnings',  icon: DollarSign },
]

const extraItems = [
  { href: '/counsellor/calendar', label: 'Calendar',    icon: Calendar },
  { href: '/counsellor/mission',  label: 'Our Mission', icon: HeartHandshake },
]

export default function CounsellorLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [userName, setUserName] = useState('Counsellor')
  const [loading, setLoading] = useState(true)
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

      if (!profile || profile.role !== 'counsellor') { router.replace('/login'); return }
      setUserName(profile.name)
      setLoading(false)
    }

    checkAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: string) => {
      if (event === 'SIGNED_OUT') router.replace('/login')
    })
    return () => subscription.unsubscribe()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) return <LoadingScreen />

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-indigo-950/20 to-gray-950">

      <FloatingNav
        items={primaryItems}
        extras={extraItems}
        accentColor="indigo"
        userName={userName}
        onLogout={handleLogout}
      />

      <main className="pt-20 pb-8 min-h-screen">
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
  )
}
