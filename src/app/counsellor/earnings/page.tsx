'use client'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PageTransition } from '@/components/ui/page-transition'
import { mockEarnings } from '@/lib/mock-data'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell
} from 'recharts'
import { DollarSign, Calendar, Star, TrendingUp } from 'lucide-react'

export default function EarningsPage() {
  const totalEarnings = mockEarnings.reduce((sum, m) => sum + m.earnings, 0)
  const totalSessions = mockEarnings.reduce((sum, m) => sum + m.sessions, 0)
  const avgRating = (mockEarnings.reduce((sum, m) => sum + m.rating, 0) / mockEarnings.length).toFixed(1)

  return (
    <PageTransition>
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Earnings Dashboard</h1>
          <p className="text-gray-400 text-sm mt-1">Track your performance and income</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="bg-gradient-to-br from-green-900/40 to-emerald-900/20 border-green-800/40">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-green-900/50 flex items-center justify-center">
                    <DollarSign size={22} className="text-green-400" />
                  </div>
                  <div>
                    <p className="text-green-300/70 text-sm">Total Earnings</p>
                    <p className="text-3xl font-bold text-white">₹{totalEarnings.toLocaleString('en-IN')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
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
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="bg-gradient-to-br from-amber-900/40 to-orange-900/20 border-amber-800/40">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-900/50 flex items-center justify-center">
                    <Star size={22} className="text-amber-400" />
                  </div>
                  <div>
                    <p className="text-amber-300/70 text-sm">Avg Rating</p>
                    <p className="text-3xl font-bold text-white">⭐ {avgRating}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Earnings Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingUp size={18} className="text-green-400" />
                Monthly Earnings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={mockEarnings} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9ca3af" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                  <YAxis stroke="#9ca3af" tick={{ fill: '#9ca3af', fontSize: 12 }} tickFormatter={v => `₹${v}`} />
                  <Tooltip
                    contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: '8px', color: '#e5e7eb' }}
                    formatter={(value) => [`₹${value}`, 'Earnings']}
                  />
                  <Bar dataKey="earnings" radius={[6, 6, 0, 0]}>
                    {mockEarnings.map((_, i) => (
                      <Cell key={i} fill={`hsl(${220 + i * 10}, 70%, ${50 + i * 3}%)`} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Earnings Table */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
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
                      <th className="text-left py-3 px-4 text-gray-400 text-sm font-medium">Earnings</th>
                      <th className="text-left py-3 px-4 text-gray-400 text-sm font-medium">Per Session</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockEarnings.map((row, i) => (
                      <motion.tr
                        key={row.month}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.05 * i }}
                        className="border-b border-gray-800/50 hover:bg-gray-800/20 transition-colors"
                      >
                        <td className="py-3 px-4 text-white font-medium">{row.month} 2025</td>
                        <td className="py-3 px-4 text-gray-300">{row.sessions}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1">
                            <Star size={12} className="text-amber-400 fill-amber-400" />
                            <span className="text-gray-300">{row.rating}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-green-400 font-semibold">₹{row.earnings.toLocaleString('en-IN')}</td>
                        <td className="py-3 px-4 text-gray-400">₹{(row.earnings / row.sessions).toFixed(0)}</td>
                      </motion.tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-gray-700">
                      <td className="py-3 px-4 text-white font-bold">Total</td>
                      <td className="py-3 px-4 text-white font-bold">{totalSessions}</td>
                      <td className="py-3 px-4 text-amber-400 font-bold">⭐ {avgRating}</td>
                      <td className="py-3 px-4 text-green-400 font-bold">₹{totalEarnings.toLocaleString('en-IN')}</td>
                      <td className="py-3 px-4 text-gray-400">₹{(totalEarnings / totalSessions).toFixed(0)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </PageTransition>
  )
}
