'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PageTransition } from '@/components/ui/page-transition'
import { createClient, type Profile } from '@/lib/supabase'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell
} from 'recharts'
import { Users, UserCheck, AlertTriangle, TrendingUp, MessageCircle, ClipboardList } from 'lucide-react'

type TopicRow = { topic: string; count: number }

const TOPIC_COLORS = [
  '#818cf8', '#a78bfa', '#f472b6', '#fb923c',
  '#34d399', '#38bdf8', '#f87171', '#fbbf24', '#94a3b8',
]

export default function AdminPage() {
  const supabase = createClient()
  const [students, setStudents] = useState<Profile[]>([])
  const [counsellorCount, setCounsellorCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [topics, setTopics] = useState<TopicRow[]>([])
  const [triageConcerns, setTriageConcerns] = useState<TopicRow[]>([])

  useEffect(() => {
    const load = async () => {
      const [{ data: studentData }, { count }, { data: topicData }, { data: triageData }] = await Promise.all([
        supabase.from('profiles').select('*').eq('role', 'student'),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'counsellor'),
        supabase.from('chat_topics').select('topic'),
        supabase.from('triage_results').select('top_concern').not('top_concern', 'is', null),
      ])
      setStudents((studentData as Profile[]) ?? [])
      setCounsellorCount(count ?? 0)

      // Aggregate topic counts client-side
      const counts: Record<string, number> = {}
      for (const row of (topicData ?? [])) {
        counts[row.topic] = (counts[row.topic] ?? 0) + 1
      }
      const sorted = Object.entries(counts)
        .map(([topic, count]) => ({ topic, count }))
        .sort((a, b) => b.count - a.count)
      setTopics(sorted)

      // Aggregate triage top concerns
      const concernCounts: Record<string, number> = {}
      for (const row of (triageData ?? [])) {
        if (row.top_concern) concernCounts[row.top_concern] = (concernCounts[row.top_concern] ?? 0) + 1
      }
      const sortedConcerns = Object.entries(concernCounts)
        .map(([topic, count]) => ({ topic, count }))
        .sort((a, b) => b.count - a.count)
      setTriageConcerns(sortedConcerns)
      setLoading(false)
    }
    load()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const emergencyCount = students.filter(s => s.triage_level === 'emergency').length
  const aiCount = students.filter(s => s.triage_level === 'ai').length
  const counsellorLevelCount = students.filter(s => s.triage_level === 'counsellor').length
  const total = students.length

  const triageData = [
    { level: 'AI Support (Low)', count: aiCount, color: 'bg-green-500', pct: total ? Math.round(aiCount / total * 100) : 0 },
    { level: 'Counsellor (Moderate)', count: counsellorLevelCount, color: 'bg-indigo-500', pct: total ? Math.round(counsellorLevelCount / total * 100) : 0 },
    { level: 'Emergency (High)', count: emergencyCount, color: 'bg-amber-500', pct: total ? Math.round(emergencyCount / total * 100) : 0 },
  ]

  const scoreDistribution = [
    { range: '1-2', count: students.filter(s => (s.triage_score ?? 0) <= 2).length },
    { range: '3-4', count: students.filter(s => (s.triage_score ?? 0) >= 3 && (s.triage_score ?? 0) <= 4).length },
    { range: '5-6', count: students.filter(s => (s.triage_score ?? 0) >= 5 && (s.triage_score ?? 0) <= 6).length },
    { range: '7-8', count: students.filter(s => (s.triage_score ?? 0) >= 7 && (s.triage_score ?? 0) <= 8).length },
    { range: '9-10', count: students.filter(s => (s.triage_score ?? 0) >= 9).length },
  ]

  return (
    <PageTransition>
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Admin Overview</h1>
          <p className="text-gray-400 text-sm mt-1">Platform health and activity at a glance</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Students', value: loading ? '…' : total, icon: Users, color: 'indigo', sub: 'Active users' },
            { label: 'Counsellors', value: loading ? '…' : counsellorCount, icon: UserCheck, color: 'green', sub: 'On platform' },
            { label: 'Emergency Cases', value: loading ? '…' : emergencyCount, icon: AlertTriangle, color: 'amber', sub: 'Need attention' },
            { label: 'Assessed Students', value: loading ? '…' : students.filter(s => s.triage_score != null).length, icon: TrendingUp, color: 'purple', sub: 'Completed triage' },
          ].map((stat) => {
            const Icon = stat.icon
            return (
              <Card key={stat.label} className="bg-gray-900/50 border-gray-800">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-xl bg-${stat.color}-900/50 flex items-center justify-center`}>
                      <Icon size={20} className={`text-${stat.color}-400`} />
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs">{stat.label}</p>
                      <p className="text-2xl font-bold text-white">{stat.value}</p>
                      <p className="text-gray-500 text-xs">{stat.sub}</p>
                    </div>
                    </div>
                  </CardContent>
                </Card>
            )
          })}
        </div>

        {/* Score Distribution Chart */}
        <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Triage Score Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={scoreDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="range" stroke="#9ca3af" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                  <YAxis stroke="#9ca3af" tick={{ fill: '#9ca3af', fontSize: 12 }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: '8px', color: '#e5e7eb' }}
                    formatter={(val) => [val, 'Students']}
                  />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {scoreDistribution.map((_, i) => (
                      <Cell key={i} fill={i <= 1 ? '#4ade80' : i === 2 ? '#818cf8' : '#f87171'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

        {/* Triage Distribution */}
        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Triage Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {triageData.map((item) => (
                <div key={item.level}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-300">{item.level}</span>
                    <span className="text-gray-400">{item.count} students</span>
                  </div>
                  <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${item.color} rounded-full transition-all duration-700`}
                      style={{ width: `${item.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* FAQ / Topic Trends */}
        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <MessageCircle size={18} className="text-indigo-400" />
              Most Frequently Raised Topics
            </CardTitle>
            <p className="text-gray-500 text-xs mt-1">Tracked from student AI chat sessions</p>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-gray-500 text-sm">Loading…</p>
            ) : topics.length === 0 ? (
              <p className="text-gray-500 text-sm">No data yet — topics appear as students use AI Chat.</p>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={topics} layout="vertical" margin={{ left: 20, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" horizontal={false} />
                  <XAxis type="number" stroke="#9ca3af" tick={{ fill: '#9ca3af', fontSize: 12 }} allowDecimals={false} />
                  <YAxis type="category" dataKey="topic" stroke="#9ca3af" tick={{ fill: '#d1d5db', fontSize: 11 }} width={140} />
                  <Tooltip
                    contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: '8px', color: '#e5e7eb' }}
                    formatter={(val) => [val, 'Messages']}
                  />
                  <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                    {topics.map((_, i) => (
                      <Cell key={i} fill={TOPIC_COLORS[i % TOPIC_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
        {/* Triage Top Concerns */}
        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <ClipboardList size={18} className="text-purple-400" />
              Most Frequently Brought Up in Triage
            </CardTitle>
            <p className="text-gray-500 text-xs mt-1">Top concern per student triage session (Phase I)</p>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-gray-500 text-sm">Loading…</p>
            ) : triageConcerns.length === 0 ? (
              <p className="text-gray-500 text-sm">No triage data yet — appears as students complete the check-in.</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={triageConcerns} layout="vertical" margin={{ left: 20, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" horizontal={false} />
                  <XAxis type="number" stroke="#9ca3af" tick={{ fill: '#9ca3af', fontSize: 12 }} allowDecimals={false} />
                  <YAxis type="category" dataKey="topic" stroke="#9ca3af" tick={{ fill: '#d1d5db', fontSize: 11 }} width={140} />
                  <Tooltip
                    contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: '8px', color: '#e5e7eb' }}
                    formatter={(val) => [val, 'Sessions']}
                  />
                  <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                    {triageConcerns.map((_, i) => (
                      <Cell key={i} fill={TOPIC_COLORS[i % TOPIC_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  )
}
