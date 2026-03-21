'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { FloatingNav } from '@/components/ui/floating-nav'
import { LoadingScreen } from '@/components/ui/loading-screen'
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
  Heart,
} from 'lucide-react'
import { createClient } from '@/lib/supabase'

const primaryItems = [
  { href: '/student/dashboard', label: 'Home',     icon: LayoutDashboard },
  { href: '/student/triage',   label: 'Survey',    icon: ClipboardList },
  { href: '/student/chat',     label: 'AI Chat',   icon: MessageCircle },
  { href: '/student/messages', label: 'Messages',  icon: MessageSquare },
]

const extraItems = [
  { href: '/student/community', label: 'Community', icon: Users },
  { href: '/student/diary',     label: 'Diary',     icon: BookOpen },
  { href: '/student/breathing', label: 'Breathe',   icon: Wind },
  { href: '/student/todo',      label: 'To-Do',     icon: CheckSquare },
  { href: '/student/calendar',  label: 'Calendar',  icon: Calendar },
  { href: '/student/mission',   label: 'Mission',   icon: Heart },
]

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [userName, setUserName] = useState('Student')
  const [loading, setLoading] = useState(true)
  const supabase = useRef(createClient()).current

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
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950/20 to-gray-950">

      <FloatingNav
        items={primaryItems}
        extras={extraItems}
        accentColor="purple"
        userName={userName}
        onLogout={handleLogout}
      />

      <main className="pt-20 pb-8 min-h-screen">
        {children}
      </main>
    </div>
  )
}
