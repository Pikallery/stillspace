'use client'
// No Claude API calls in admin
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PageTransition } from '@/components/ui/page-transition'
import { mockMoodTrends } from '@/lib/mock-data'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, LineChart, Line, Legend
} from 'recharts'
import { TrendingUp } from 'lucide-react'

const weeklyData = mockMoodTrends
const monthlyData = [
  { week: 'Week 1', avgMood: 3.1, responses: 42 },
  { week: 'Week 2', avgMood: 3.4, responses: 38 },
  { week: 'Week 3', avgMood: 2.9, responses: 51 },
  { week: 'Week 4', avgMood: 3.7, responses: 45 },
]

export default function MoodTrendsPage() {
  return (
    <PageTransition>
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Mood Trends</h1>
          <p className="text-gray-400 text-sm mt-1">Platform-wide mood analytics</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="bg-gray-900/50 border-gray-800">
              <CardContent className="pt-6">
                <p className="text-gray-400 text-sm">This Week Avg</p>
                <p className="text-3xl font-bold text-white mt-1">3.5 / 5.0</p>
                <p className="text-green-400 text-xs mt-1">+0.3 from last week</p>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <Card className="bg-gray-900/50 border-gray-800">
              <CardContent className="pt-6">
                <p className="text-gray-400 text-sm">Total Check-ins</p>
                <p className="text-3xl font-bold text-white mt-1">176</p>
                <p className="text-purple-400 text-xs mt-1">This month</p>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="bg-gray-900/50 border-gray-800">
              <CardContent className="pt-6">
                <p className="text-gray-400 text-sm">Lowest Day</p>
                <p className="text-3xl font-bold text-white mt-1">Wednesday</p>
                <p className="text-amber-400 text-xs mt-1">Avg 2.8 — monitor closely</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Daily Mood Bar Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingUp size={18} className="text-purple-400" />
                Daily Average Mood — This Week
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={weeklyData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="day" stroke="#9ca3af" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                  <YAxis domain={[0, 5]} stroke="#9ca3af" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: '8px', color: '#e5e7eb' }}
                    formatter={(val) => [`${val}/5.0`, 'Avg Mood']}
                  />
                  <Bar dataKey="avgMood" radius={[8, 8, 0, 0]}>
                    {weeklyData.map((entry: { avgMood: number }, i) => (
                      <Cell
                        key={i}
                        fill={entry.avgMood >= 4 ? '#4ade80' : entry.avgMood >= 3 ? '#818cf8' : '#fb923c'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Monthly Trend Line Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Monthly Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="week" stroke="#9ca3af" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                  <YAxis stroke="#9ca3af" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: '8px', color: '#e5e7eb' }}
                  />
                  <Legend wrapperStyle={{ color: '#9ca3af', fontSize: 12 }} />
                  <Line type="monotone" dataKey="avgMood" name="Avg Mood" stroke="#818cf8" strokeWidth={2} dot={{ fill: '#818cf8', r: 4 }} />
                  <Line type="monotone" dataKey="responses" name="Responses" stroke="#34d399" strokeWidth={2} dot={{ fill: '#34d399', r: 4 }} yAxisId={0} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </PageTransition>
  )
}
