'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PageTransition } from '@/components/ui/page-transition'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { DollarSign, Calendar, Star, TrendingUp, Info } from 'lucide-react'

// ── Earnings logic ────────────────────────────────────────────────────────────

const BASE_RATE = 500   // ₹ per session before rating multiplier

function ratingMultiplier(avg: number): number {
  if (avg >= 4.5) return 1.3
  if (avg >= 3.5) return 1.1
  if (avg >= 2.5) return 1.0
  if (avg >= 1.5) return 0.85
  return 0.7
}

function multiplierLabel(m: number) {
  if (m >= 1.3) return { text: '+30% bonus', color: 'text-green-400' }
  if (m >= 1.1) return { text: '+10% bonus', color: 'text-emerald-400' }
  if (m >= 1.0) return { text: 'Standard rate', color: 'text-gray-400' }
  if (m >= 0.85) return { text: '−15% penalty', color: 'text-orange-400' }
  return { text: '−30% penalty', color: 'text-red-400' }
}

interface FeedbackRow { id: string; rating: number; created_at: string }
interface ConvRow { id: string; created_at: string }

interface MonthBucket {
  month: string
  sessions: number
  avgRating: number
  earnings: number
}

function bucketByMonth(convs: ConvRow[], feedbacks: FeedbackRow[]): MonthBucket[] {
  const map: Record<string, { sessions: number; ratings: number[] }> = {}

  for (const c of convs) {
    const key = new Date(c.created_at).toLocaleDateString('en-IN', { month: 'short', year: '2-digit' })
    if (!map[key]) map[key] = { sessions: 0, ratings: [] }
    map[key].sessions++
  }
  for (const f of feedbacks) {
    const key = new Date(f.created_at).toLocaleDateString('en-IN', { month: 'short', year: '2-digit' })
    if (!map[key]) map[key] = { sessions: 0, ratings: [] }
    map[key].ratings.push(f.rating)
  }

  return Object.entries(map).slice(-6).map(([month, { sessions, ratings }]) => {
    const avg = ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 3
    const earnings = Math.round(sessions * BASE_RATE * ratingMultiplier(avg))
    return { month, sessions, avgRating: parseFloat(avg.toFixed(1)), earnings }
  })
}

// Fallback mock if no real data
const MOCK_MONTHS: MonthBucket[] = [
  { month: 'Jan 25', sessions: 24, avgRating: 4.8, earnings: Math.round(24 * BASE_RATE * 1.3) },
  { month: 'Feb 25', sessions: 28, avgRating: 4.9, earnings: Math.round(28 * BASE_RATE * 1.3) },
  { month: 'Mar 25', sessions: 22, avgRating: 4.7, earnings: Math.round(22 * BASE_RATE * 1.1) },
  { month: 'Apr 25', sessions: 31, avgRating: 4.9, earnings: Math.round(31 * BASE_RATE * 1.3) },
  { month: 'May 25', sessions: 26, avgRating: 4.8, earnings: Math.round(26 * BASE_RATE * 1.3) },
  { month: 'Jun 25', sessions: 29, avgRating: 5.0, earnings: Math.round(29 * BASE_RATE * 1.3) },
]

export default function EarningsPage() {
  const supabase = useRef(createClient()).current
  const [myId, setMyId] = useState<string | null>(null)
  const [feedbacks, setFeedbacks] = useState<FeedbackRow[]>([])
  const [convs, setConvs] = useState<ConvRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) setMyId(session.user.id)
    })()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!myId) return
    ;(async () => {
      const [{ data: fb }, { data: cv }] = await Promise.all([
        supabase.from('feedback').select('id, rating, created_at').eq('counsellor_id', myId),
        supabase.from('conversations').select('id, created_at').eq('counsellor_id', myId),
      ])
      setFeedbacks((fb as FeedbackRow[]) ?? [])
      setConvs((cv as ConvRow[]) ?? [])
      setLoading(false)
    })()
  }, [myId]) // eslint-disable-line react-hooks/exhaustive-deps

  const hasRealData = convs.length > 0 || feedbacks.length > 0
  const monthData = hasRealData ? bucketByMonth(convs, feedbacks) : MOCK_MONTHS

  const totalSessions = monthData.reduce((s, m) => s + m.sessions, 0)
  const totalEarnings = monthData.reduce((s, m) => s + m.earnings, 0)
  const avgRating = feedbacks.length
    ? feedbacks.reduce((s, f) => s + f.rating, 0) / feedbacks.length
    : (hasRealData ? 0 : 4.85)
  const avgRatingStr = (feedbacks.length || !hasRealData) ? avgRating.toFixed(1) : '—'
  const multiplier = ratingMultiplier(avgRating)
  const mlabel = multiplierLabel(multiplier)

  return (
    <PageTransition>
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Earnings Dashboard</h1>
          <p className="text-gray-400 text-sm mt-1">Your rating directly determines your per-session earnings</p>
        </div>

        {/* How it works banner */}
        <div className="flex items-start gap-3 p-4 rounded-xl bg-indigo-950/40 border border-indigo-800/40">
          <Info size={16} className="text-indigo-400 mt-0.5 shrink-0" />
          <p className="text-indigo-300 text-xs leading-relaxed">
            <span className="font-semibold">How earnings work: </span>
            Base rate ₹{BASE_RATE}/session × rating multiplier.
            ⭐4.5+ → ×1.3 &nbsp;|&nbsp; ⭐3.5+ → ×1.1 &nbsp;|&nbsp; ⭐2.5+ → ×1.0 &nbsp;|&nbsp; ⭐1.5+ → ×0.85 &nbsp;|&nbsp; below → ×0.7
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-green-900/40 to-emerald-900/20 border-green-800/40">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-green-900/50 flex items-center justify-center">
                  <DollarSign size={22} className="text-green-400" />
                </div>
                <div>
                  <p className="text-green-300/70 text-sm">Total Earnings</p>
                  <p className="text-3xl font-bold text-white">₹{totalEarnings.toLocaleString('en-IN')}</p>
                  {!hasRealData && <p className="text-green-600 text-[10px]">demo data</p>}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-indigo-900/40 to-blue-900/20 border-indigo-800/40">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-900/50 flex items-center justify-center">
                  <Calendar size={22} className="text-indigo-400" />
                </div>
                <div>
                  <p className="text-indigo-300/70 text-sm">Total Sessions</p>
                  <p className="text-3xl font-bold text-white">{totalSessions}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-900/40 to-orange-900/20 border-amber-800/40">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-900/50 flex items-center justify-center">
                  <Star size={22} className="text-amber-400" />
                </div>
                <div>
                  <p className="text-amber-300/70 text-sm">Avg Rating</p>
                  <p className="text-3xl font-bold text-white">⭐ {avgRatingStr}</p>
                  <p className={`text-xs font-medium mt-0.5 ${mlabel.color}`}>{mlabel.text}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Earnings Chart */}
        {!loading && (
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingUp size={18} className="text-green-400" />
                Monthly Earnings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={monthData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9ca3af" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                  <YAxis stroke="#9ca3af" tick={{ fill: '#9ca3af', fontSize: 12 }} tickFormatter={v => `₹${v}`} />
                  <Tooltip
                    contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: '8px', color: '#e5e7eb' }}
                    formatter={(value, name) => name === 'earnings' ? [`₹${value}`, 'Earnings'] : [value, name]}
                  />
                  <Bar dataKey="earnings" radius={[6, 6, 0, 0]}>
                    {monthData.map((_, i) => (
                      <Cell key={i} fill={`hsl(${220 + i * 10}, 70%, ${50 + i * 3}%)`} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Breakdown table */}
        {!loading && (
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Monthly Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="text-left py-3 px-4 text-gray-400 text-sm font-medium">Month</th>
                      <th className="text-left py-3 px-4 text-gray-400 text-sm font-medium">Sessions</th>
                      <th className="text-left py-3 px-4 text-gray-400 text-sm font-medium">Avg Rating</th>
                      <th className="text-left py-3 px-4 text-gray-400 text-sm font-medium">Multiplier</th>
                      <th className="text-left py-3 px-4 text-gray-400 text-sm font-medium">Earnings</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthData.map((row) => {
                      const m = ratingMultiplier(row.avgRating)
                      const ml = multiplierLabel(m)
                      return (
                        <tr key={row.month} className="border-b border-gray-800/50 hover:bg-gray-800/20 transition-colors">
                          <td className="py-3 px-4 text-white font-medium">{row.month}</td>
                          <td className="py-3 px-4 text-gray-300">{row.sessions}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1">
                              <Star size={12} className="text-amber-400 fill-amber-400" />
                              <span className="text-gray-300">{row.avgRating > 0 ? row.avgRating : '—'}</span>
                            </div>
                          </td>
                          <td className={`py-3 px-4 text-xs font-medium ${ml.color}`}>{ml.text} (×{m})</td>
                          <td className="py-3 px-4 text-green-400 font-semibold">₹{row.earnings.toLocaleString('en-IN')}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-gray-700">
                      <td className="py-3 px-4 text-white font-bold">Total</td>
                      <td className="py-3 px-4 text-white font-bold">{totalSessions}</td>
                      <td className="py-3 px-4 text-amber-400 font-bold">⭐ {avgRatingStr}</td>
                      <td className={`py-3 px-4 text-xs font-bold ${mlabel.color}`}>{mlabel.text}</td>
                      <td className="py-3 px-4 text-green-400 font-bold">₹{totalEarnings.toLocaleString('en-IN')}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </PageTransition>
  )
}
