'use client'
import { useEffect, useState, useRef } from 'react'
import { Bell } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { useRouter } from 'next/navigation'

interface Notification {
  id: string
  title: string
  body: string | null
  read: boolean
  link: string | null
  created_at: string
}

export function NotificationBell({ userId }: { userId: string }) {
  const supabase = useRef(createClient()).current
  const router = useRouter()
  const [notifs, setNotifs] = useState<Notification[]>([])
  const [open, setOpen] = useState(false)

  const unread = notifs.filter(n => !n.read).length

  useEffect(() => {
    if (!userId) return

    supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(30)
      .then(({ data }) => setNotifs(data ?? []))

    const channel = supabase
      .channel(`notifs-${userId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` },
        (payload) => {
          setNotifs(prev => [payload.new as Notification, ...prev])
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [userId]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleOpen = async (v: boolean) => {
    setOpen(v)
    if (v && unread > 0) {
      // Optimistically mark as read in UI
      setNotifs(prev => prev.map(n => ({ ...n, read: true })))
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', userId)
        .eq('read', false)
    }
  }

  const formatTime = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime()
    const m = Math.floor(diff / 60000)
    if (m < 1) return 'just now'
    if (m < 60) return `${m}m ago`
    const h = Math.floor(m / 60)
    if (h < 24) return `${h}h ago`
    return `${Math.floor(h / 24)}d ago`
  }

  return (
    <Sheet open={open} onOpenChange={handleOpen}>
      <SheetTrigger className="relative flex items-center justify-center w-8 h-8 rounded-full text-gray-400 hover:text-gray-200 hover:bg-gray-800/60 transition-all duration-200 shrink-0">
        <Bell size={15} />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center leading-none">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </SheetTrigger>
      <SheetContent side="bottom" className="bg-gray-950 border-t border-gray-800 rounded-t-2xl pb-safe">
        <SheetHeader className="mb-4">
          <SheetTitle className="text-white text-base">Notifications</SheetTitle>
        </SheetHeader>
        <div className="space-y-2 max-h-[60vh] overflow-y-auto pb-4">
          {notifs.length === 0 && (
            <p className="text-gray-500 text-sm text-center py-10">No notifications yet</p>
          )}
          {notifs.map(n => (
            <button
              key={n.id}
              onClick={() => { setOpen(false); if (n.link) router.push(n.link) }}
              className="w-full text-left p-3 rounded-xl bg-gray-900 hover:bg-gray-800 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-white text-sm font-medium leading-snug">{n.title}</p>
                <span className="text-gray-500 text-xs shrink-0 mt-0.5">{formatTime(n.created_at)}</span>
              </div>
              {n.body && <p className="text-gray-400 text-xs mt-1">{n.body}</p>}
            </button>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  )
}
