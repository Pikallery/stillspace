'use client'
// No Claude API calls in admin
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PageTransition } from '@/components/ui/page-transition'
import { mockStudents } from '@/lib/mock-data'
import { Search, TrendingUp, TrendingDown, Minus, Ban, CheckCircle } from 'lucide-react'

const levelColors = {
  ai: 'bg-green-900/50 text-green-300 border-green-700/50',
  counsellor: 'bg-indigo-900/50 text-indigo-300 border-indigo-700/50',
  emergency: 'bg-amber-900/50 text-amber-300 border-amber-700/50',
}

export default function AdminStudentsPage() {
  const [search, setSearch] = useState('')
  const [banned, setBanned] = useState<Set<string>>(new Set())

  const filtered = mockStudents.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase())
  )

  const toggleBan = (id: string) => {
    setBanned(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <PageTransition>
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Students</h1>
          <p className="text-gray-400 text-sm mt-1">Manage and monitor all students on the platform</p>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search students..."
            className="pl-9 bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500"
          />
        </div>

        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left py-4 px-6 text-gray-400 text-sm font-medium">Student</th>
                    <th className="text-left py-4 px-6 text-gray-400 text-sm font-medium">Triage Score</th>
                    <th className="text-left py-4 px-6 text-gray-400 text-sm font-medium">Level</th>
                    <th className="text-left py-4 px-6 text-gray-400 text-sm font-medium">Trend</th>
                    <th className="text-left py-4 px-6 text-gray-400 text-sm font-medium">Status</th>
                    <th className="text-left py-4 px-6 text-gray-400 text-sm font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((student, i) => {
                    const isBanned = banned.has(student.id)
                    return (
                      <motion.tr
                        key={student.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="border-b border-gray-800/50 hover:bg-gray-800/20 transition-colors"
                      >
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm ${isBanned ? 'bg-gray-700' : 'bg-indigo-700'}`}>
                              {student.name.charAt(0)}
                            </div>
                            <div>
                              <p className={`font-medium text-sm ${isBanned ? 'text-gray-500 line-through' : 'text-white'}`}>
                                {student.name}
                              </p>
                              <p className="text-gray-500 text-xs">ID: {student.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-2 bg-gray-800 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${student.triage_score >= 8 ? 'bg-amber-500' : student.triage_score >= 5 ? 'bg-indigo-500' : 'bg-green-500'}`}
                                style={{ width: `${student.triage_score * 10}%` }}
                              />
                            </div>
                            <span className="text-white text-sm">{student.triage_score}/10</span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <Badge className={`text-xs ${levelColors[student.triage_level as keyof typeof levelColors]}`}>
                            {student.triage_level}
                          </Badge>
                        </td>
                        <td className="py-4 px-6">
                          {student.trend === 'up' ? (
                            <div className="flex items-center gap-1 text-red-400 text-sm">
                              <TrendingUp size={14} /> Worsening
                            </div>
                          ) : student.trend === 'down' ? (
                            <div className="flex items-center gap-1 text-green-400 text-sm">
                              <TrendingDown size={14} /> Improving
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 text-gray-400 text-sm">
                              <Minus size={14} /> Stable
                            </div>
                          )}
                        </td>
                        <td className="py-4 px-6">
                          <Badge className={isBanned ? 'bg-red-900/50 text-red-300 border-red-700/50' : 'bg-green-900/50 text-green-300 border-green-700/50'}>
                            {isBanned ? 'Banned' : 'Active'}
                          </Badge>
                        </td>
                        <td className="py-4 px-6">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toggleBan(student.id)}
                            className={`text-xs ${isBanned
                              ? 'border-green-700/50 text-green-400 hover:bg-green-900/20'
                              : 'border-red-700/50 text-red-400 hover:bg-red-900/20'
                            }`}
                          >
                            {isBanned ? (
                              <><CheckCircle size={12} className="mr-1" /> Unblock</>
                            ) : (
                              <><Ban size={12} className="mr-1" /> Ban</>
                            )}
                          </Button>
                        </td>
                      </motion.tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  )
}
