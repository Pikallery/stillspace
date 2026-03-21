'use client'
// No Claude API calls in admin panel
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PageTransition } from '@/components/ui/page-transition'
import { mockStudents, mockMoodTrends } from '@/lib/mock-data'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell
} from 'recharts'
import { Users, UserCheck, AlertTriangle, TrendingUp } from 'lucide-react'

export default function AdminPage() {
  const emergencyCount = mockStudents.filter(s => s.triage_level === 'emergency').length
  const counsellorCount = 4
  const avgMood = (mockMoodTrends.reduce((s, d) => s + d.avgMood, 0) / mockMoodTrends.length).toFixed(1)

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
            { label: 'Total Students', value: mockStudents.length, icon: Users, color: 'indigo', sub: 'Active users' },
            { label: 'Counsellors', value: counsellorCount, icon: UserCheck, color: 'green', sub: '3 available' },
            { label: 'Emergency Cases', value: emergencyCount, icon: AlertTriangle, color: 'amber', sub: 'Need attention' },
            { label: 'Avg Mood Score', value: avgMood, icon: TrendingUp, color: 'purple', sub: 'Out of 5.0' },
          ].map((stat, i) => {
            const Icon = stat.icon
            return (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <Card className="bg-gray-900/50 border-gray-800">
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
              </motion.div>
            )
          })}
        </div>

        {/* Mood Trend Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Weekly Mood Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={mockMoodTrends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="day" stroke="#9ca3af" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                  <YAxis domain={[0, 5]} stroke="#9ca3af" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: '8px', color: '#e5e7eb' }}
                  />
                  <Bar dataKey="avgMood" radius={[6, 6, 0, 0]}>
                    {mockMoodTrends.map((entry, i) => (
                      <Cell key={i} fill={entry.avgMood >= 4 ? '#4ade80' : entry.avgMood >= 3 ? '#818cf8' : '#f87171'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Triage Distribution */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Triage Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { level: 'AI Support (Low)', count: 2, color: 'bg-green-500', pct: 50 },
                  { level: 'Counsellor (Moderate)', count: 1, color: 'bg-indigo-500', pct: 25 },
                  { level: 'Emergency (High)', count: 1, color: 'bg-amber-500', pct: 25 },
                ].map((item) => (
                  <div key={item.level}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-300">{item.level}</span>
                      <span className="text-gray-400">{item.count} students</span>
                    </div>
                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${item.pct}%` }}
                        transition={{ delay: 0.6, duration: 0.8 }}
                        className={`h-full ${item.color} rounded-full`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </PageTransition>
  )
}
