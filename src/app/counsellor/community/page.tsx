'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect, useRef } from 'react'
import { PageTransition } from '@/components/ui/page-transition'
import { CommunityFeed } from '@/components/ui/community-feed'
import { createClient } from '@/lib/supabase'

export default function CounsellorCommunityPage() {
  const supabase = useRef(createClient()).current
  const [userName, setUserName] = useState('Counsellor')

  useEffect(() => {
    ;(async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      const { data } = await supabase.from('profiles').select('name').eq('id', session.user.id).single()
      if (data?.name) setUserName(data.name)
    })()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <PageTransition>
      <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Community</h1>
          <p className="text-gray-400 text-sm mt-1">Share insights, quotes and support with students</p>
        </div>
        <CommunityFeed
          userName={userName}
          userRole="counsellor"
          accentColor="indigo"
          canPostAnonymous={false}
        />
      </div>
    </PageTransition>
  )
}
