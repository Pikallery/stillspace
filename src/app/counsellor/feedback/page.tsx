'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PageTransition } from '@/components/ui/page-transition'
import { Star, MessageSquare, TrendingUp } from 'lucide-react'

interface FeedbackRow {
  id: string
  rating: number
  comment: string | null
  tags: string[] | null
  created_at: string
  student: { name: string }
}

const BASE_RATE = 500

function earningsMultiplier(avg: number): number {
  if (avg >= 4.5) return 1.3
  if (avg >= 3.5) return 1.1
  if (avg >= 2.5) return 1.0
  if (avg >= 1.5) return 0.85
  return 0.7
}

export default function CounsellorFeedbackPage() {
  const supabase = useRef(createClient()).current
  const [feedback, setFeedback] = useState<FeedbackRow[]>([])
  const [loading, setLoading] = useState(true)
  const [myId, setMyId] = useState<string | null>(null)

  useEffect(() => {
    ;(async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) setMyId(session.user.id)
    })()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!myId) return
    ;(async () => {
      const { data } = await supabase
        .from('feedback')
        .select('*, student:profiles!feedback_student_id_fkey(name)')
        .eq('counsellor_id', myId)
        .order('created_at', { ascending: false })
      setFeedback((data as FeedbackRow[]) ?? [])
      setLoading(false)
    })()
  }, [myId]) // eslint-disable-line react-hooks/exhaustive-deps

  const avgRating = feedback.length > 0
    ? feedback.reduce((s, f) => s + f.rating, 0) / feedback.length
    : 0
  const avgRatingStr = feedback.length > 0 ? avgRating.toFixed(1) : '—'
  const multiplier = earningsMultiplier(avgRating)
  const perSessionEarning = Math.round(BASE_RATE * multiplier)

  const ratingCounts = [5, 4, 3, 2, 1].map(r => ({
    stars: r,
    count: feedback.filter(f => f.rating === r).length,
  }))

  const tagFrequency: Record<string, number> = {}
  for (const f of feedback) {
    for (const t of (f.tags ?? [])) {
      tagFrequency[t] = (tagFrequency[t] ?? 0) + 1
    }
  }
  const topTags = Object.entries(tagFrequency).sort((a, b) => b[1] - a[1]).slice(0, 6)

  return (
    <PageTransition>
      <div className="p-4 sm:p-6 max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">My Reviews</h1>
          <p className="text-gray-400 text-sm mt-1">Feedback from students — your rating directly affects your earnings</p>
        </div>

        {/* Summary row */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="bg-gray-900/50 border-gray-800">
            <CardContent className="pt-5 text-center">
              <p className="text-4xl font-bold text-white">{avgRatingStr}</p>
              <div className="flex justify-center gap-0.5 my-1.5">
                {[1, 2, 3, 4, 5].map(i => (
                  <Star key={i} size={13} className={avgRating >= i ? 'text-amber-400 fill-amber-400' : 'text-gray-700'} />
                ))}
              </div>
              <p className="text-gray-400 text-xs">Avg Rating</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-800">
            <CardContent className="pt-5 text-center">
              <p className="text-4xl font-bold text-white">{feedback.length}</p>
              <div className="flex justify-center mt-1.5">
                <MessageSquare size={14} className="text-indigo-400" />
              </div>
              <p className="text-gray-400 text-xs mt-1">Reviews</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-800">
            <CardContent className="pt-5 text-center">
              <p className="text-4xl font-bold text-green-400">₹{perSessionEarning}</p>
              <div className="flex justify-center mt-1.5">
                <TrendingUp size={14} className="text-green-400" />
              </div>
              <p className="text-gray-400 text-xs mt-1">Per Session</p>
            </CardContent>
          </Card>
        </div>

        {/* Rating impact banner */}
        <div className={`rounded-xl p-4 border text-sm flex items-center gap-3 ${
          multiplier >= 1.3 ? 'bg-green-900/20 border-green-700/40 text-green-300' :
          multiplier >= 1.1 ? 'bg-emerald-900/20 border-emerald-700/40 text-emerald-300' :
          multiplier >= 1.0 ? 'bg-gray-800/50 border-gray-700 text-gray-300' :
          multiplier >= 0.85 ? 'bg-orange-900/20 border-orange-700/40 text-orange-300' :
          'bg-red-900/20 border-red-700/40 text-red-300'
        }`}>
          <span className="text-2xl">
            {multiplier >= 1.3 ? '🏆' : multiplier >= 1.1 ? '⭐' : multiplier >= 1.0 ? '📊' : multiplier >= 0.85 ? '⚠️' : '📉'}
          </span>
          <div>
            <p className="font-semibold">
              {multiplier >= 1.3 ? '+30% earnings bonus — exceptional rating!' :
               multiplier >= 1.1 ? '+10% earnings bonus — great work!' :
               multiplier >= 1.0 ? 'Standard rate — keep improving!' :
               multiplier >= 0.85 ? '−15% — student satisfaction needs attention' :
               '−30% — urgent: please review your sessions'}
            </p>
            <p className="text-xs opacity-70 mt-0.5">
              Base ₹{BASE_RATE}/session × {multiplier}× = ₹{perSessionEarning}/session
            </p>
          </div>
        </div>

        {/* Rating breakdown */}
        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-sm">Rating Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {ratingCounts.map(({ stars, count }) => (
              <div key={stars} className="flex items-center gap-3">
                <span className="text-gray-400 text-xs w-10 shrink-0">{stars} ★</span>
                <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all duration-500"
                    style={{ width: feedback.length ? `${(count / feedback.length) * 100}%` : '0%' }}
                  />
                </div>
                <span className="text-gray-500 text-xs w-5 text-right">{count}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Top tags */}
        {topTags.length > 0 && (
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-sm">What Students Say</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {topTags.map(([tag, count]) => (
                  <span key={tag} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-900/40 border border-indigo-700/30 text-indigo-300 text-xs">
                    {tag}
                    <span className="bg-indigo-700/50 rounded-full px-1.5 py-0.5 text-[10px]">{count}</span>
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Reviews list */}
        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-white">Recent Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => <div key={i} className="h-24 rounded-lg bg-gray-800/40 animate-pulse" />)}
              </div>
            ) : feedback.length === 0 ? (
              <div className="text-center py-10">
                <div className="text-4xl mb-3">⭐</div>
                <p className="text-gray-400 text-sm">No reviews yet</p>
                <p className="text-gray-600 text-xs mt-1">Reviews appear when students rate their sessions</p>
              </div>
            ) : (
              <div className="space-y-4">
                {feedback.map(f => (
                  <div key={f.id} className="p-4 rounded-xl bg-gray-800/30 border border-gray-800 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-purple-700 flex items-center justify-center text-white text-xs font-bold shrink-0">
                          {f.student.name.charAt(0)}
                        </div>
                        <p className="text-white text-sm font-medium">{f.student.name}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map(i => (
                            <Star key={i} size={13} className={f.rating >= i ? 'text-amber-400 fill-amber-400' : 'text-gray-700'} />
                          ))}
                        </div>
                        <span className="text-gray-500 text-xs ml-1">{f.rating}/5</span>
                      </div>
                    </div>
                    {f.tags && f.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {f.tags.map(tag => (
                          <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-900/40 text-indigo-300 border border-indigo-700/30">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    {f.comment && (
                      <p className="text-gray-300 text-sm leading-relaxed italic">&ldquo;{f.comment}&rdquo;</p>
                    )}
                    <p className="text-gray-600 text-xs">
                      {new Date(f.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  )
}
