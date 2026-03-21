'use client'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PageTransition } from '@/components/ui/page-transition'
import { mockStudents } from '@/lib/mock-data'
import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts'
import { TrendingUp, TrendingDown, Minus, Phone, Users, MessageCircle, Star } from 'lucide-react'

const trendIcons = {
  up: TrendingUp,
  down: TrendingDown,
  neutral: Minus,
}

const trendColors = {
  up: 'text-red-400',
  down: 'text-green-400',
  neutral: 'text-gray-400',
}

const levelColors = {
  ai: 'bg-green-900/50 text-green-300 border-green-700/50',
  counsellor: 'bg-indigo-900/50 text-indigo-300 border-indigo-700/50',
  emergency: 'bg-amber-900/50 text-amber-300 border-amber-700/50',
}

export default function CounsellorDashboard() {
  const router = useRouter()

  return (
    <PageTransition>
      <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">Counsellor Dashboard</h1>
          <p className="text-gray-400 text-sm mt-1">Monitor and support your assigned students</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          {[
            { icon: Users,         color: 'indigo', label: 'Students',   value: mockStudents.length },
            { icon: MessageCircle, color: 'blue',   label: 'Sessions',   value: 3 },
            { icon: Star,          color: 'amber',  label: 'Avg Rating', value: '4.9' },
          ].map(({ icon: Icon, color, label, value }) => (
            <Card key={label} className="bg-gray-900/50 border-gray-800">
              <CardContent className="p-3 sm:p-4 text-center">
                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-${color}-900/50 flex items-center justify-center mx-auto mb-1.5`}>
                  <Icon size={16} className={`text-${color}-400`} />
                </div>
                <p className="text-white font-bold text-lg sm:text-2xl leading-none">{value}</p>
                <p className="text-gray-400 text-xs mt-0.5">{label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Student List */}
        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-base sm:text-lg">Assigned Students</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {mockStudents.map((student) => {
              const TrendIcon = trendIcons[student.trend as keyof typeof trendIcons]
              const isEmergency = student.triage_level === 'emergency'
              const sparkData = student.scores.map((s, idx) => ({ score: s, idx }))

              return (
                <div
                  key={student.id}
                  className={`p-3 sm:p-4 rounded-xl border transition-all ${
                    isEmergency
                      ? 'border-amber-600/40 bg-amber-950/20 emergency-pulse'
                      : 'border-gray-800 bg-gray-800/20 hover:bg-gray-800/30'
                  }`}
                >
                  {/* Row 1: Avatar + Info */}
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-bold shrink-0 text-sm ${
                      isEmergency ? 'bg-amber-600' : 'bg-indigo-700'
                    }`}>
                      {student.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="text-white font-medium text-sm">{student.name}</p>
                        {isEmergency && (
                          <Badge className="bg-amber-900/60 text-amber-300 border-amber-700/50 text-[10px] animate-pulse px-1.5 py-0">
                            Emergency
                          </Badge>
                        )}
                        <Badge className={`text-[10px] px-1.5 py-0 ${levelColors[student.triage_level as keyof typeof levelColors]}`}>
                          {student.triage_level}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-gray-400 text-xs">Score: {student.triage_score}/10</span>
                        <TrendIcon size={12} className={trendColors[student.trend as keyof typeof trendColors]} />
                      </div>
                    </div>
                    <span className="text-gray-600 text-[10px] shrink-0">{student.lastMessageTime}</span>
                  </div>

                  {/* Last message preview */}
                  <p className="text-gray-400 text-xs leading-relaxed mb-3 line-clamp-2 pl-12">
                    {student.lastMessage}
                  </p>

                  {/* Row 3: Sparkline + Actions */}
                  <div className="flex items-center gap-3">
                    <div className="flex-1 min-w-0 h-9">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={sparkData}>
                          <Line
                            type="monotone"
                            dataKey="score"
                            stroke={isEmergency ? '#f59e0b' : '#818cf8'}
                            strokeWidth={2}
                            dot={false}
                          />
                          <Tooltip
                            contentStyle={{ background: '#1f2937', border: 'none', borderRadius: '8px', fontSize: '12px' }}
                            labelStyle={{ display: 'none' }}
                            itemStyle={{ color: '#e5e7eb' }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      {isEmergency && (
                        <Button
                          size="sm"
                          onClick={() => router.push('/counsellor/chat')}
                          className="bg-amber-600 hover:bg-amber-700 text-white text-xs min-h-[40px] px-3"
                        >
                          <Phone size={14} className="mr-1" />
                          Call
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => router.push('/counsellor/chat')}
                        className="border-gray-700 text-gray-300 hover:text-white hover:bg-indigo-900/30 hover:border-indigo-600/50 text-xs min-h-[40px] px-3"
                      >
                        Chat
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  )
}
