'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PageTransition } from '@/components/ui/page-transition'
import { mockRecentActivity } from '@/lib/mock-data'
import { useRouter } from 'next/navigation'
import {
  ClipboardList,
  MessageCircle,
  Users,
  Wind,
  TrendingUp,
  BookOpen,
  CheckSquare,
  Calendar
} from 'lucide-react'

const moodEmojis: Record<number, string> = {
  1: '😢',
  2: '😕',
  3: '😐',
  4: '😊',
  5: '😄'
}

const moodLabels: Record<number, string> = {
  1: 'Very Sad',
  2: 'Sad',
  3: 'Neutral',
  4: 'Happy',
  5: 'Very Happy'
}

const quickActions = [
  { label: 'Take Triage', href: '/student/triage', icon: ClipboardList, color: 'from-purple-600 to-purple-700' },
  { label: 'Chat with AI', href: '/student/chat', icon: MessageCircle, color: 'from-indigo-600 to-indigo-700' },
  { label: 'Community', href: '/student/community', icon: Users, color: 'from-blue-600 to-blue-700' },
  { label: 'Breathing', href: '/student/breathing', icon: Wind, color: 'from-teal-600 to-teal-700' },
  { label: 'Diary', href: '/student/diary', icon: BookOpen, color: 'from-rose-600 to-rose-700' },
  { label: 'To-Do List', href: '/student/todo', icon: CheckSquare, color: 'from-amber-600 to-amber-700' },
  { label: 'Calendar', href: '/student/calendar', icon: Calendar, color: 'from-green-600 to-green-700' },
  { label: 'Progress', href: '/student/triage', icon: TrendingUp, color: 'from-cyan-600 to-cyan-700' },
]

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

export default function StudentDashboard() {
  const router = useRouter()
  const [userName, setUserName] = useState('Student')
  const [mood, setMood] = useState(3)
  const [aiQuestion, setAiQuestion] = useState('')
  const [loadingQuestion, setLoadingQuestion] = useState(false)

  useEffect(() => {
    const name = localStorage.getItem('demo_name') || 'Student'
    setUserName(name)
  }, [])

  const fetchDailyQuestion = async (moodValue: number) => {
    setLoadingQuestion(true)
    try {
      const res = await fetch('/api/daily-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mood: moodValue })
      })
      if (res.ok) {
        const data = await res.json()
        setAiQuestion(data.question)
      } else {
        setAiQuestion('What is one thing you are grateful for today?')
      }
    } catch {
      setAiQuestion('What is one thing you are grateful for today?')
    } finally {
      setLoadingQuestion(false)
    }
  }

  const handleMoodChange = (value: number) => {
    setMood(value)
    fetchDailyQuestion(value)
  }

  const activityIcons: Record<string, string> = {
    triage: '📋',
    chat: '💬',
    community: '👥',
    diary: '📔',
    breathing: '🌬️'
  }

  return (
    <PageTransition>
      <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h1 className="text-3xl font-bold text-white">
            {getGreeting()}, {userName.split(' ')[0]} 👋
          </h1>
          <p className="text-gray-400 mt-1">How are you doing today?</p>
        </motion.div>

        {/* Mood Slider */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white text-lg">Daily Mood Check</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                <span className="text-5xl transition-all duration-300">{moodEmojis[mood]}</span>
                <div className="flex-1">
                  <p className="text-white font-semibold text-lg mb-2">{moodLabels[mood]}</p>
                  <input
                    type="range"
                    min={1}
                    max={5}
                    value={mood}
                    onChange={e => handleMoodChange(Number(e.target.value))}
                    className="w-full h-2 appearance-none rounded-full bg-gray-700 cursor-pointer accent-purple-500"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Very Sad</span>
                    <span>Very Happy</span>
                  </div>
                </div>
              </div>

              {/* AI Question */}
              {(aiQuestion || loadingQuestion) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-4 p-4 bg-purple-900/30 border border-purple-700/30 rounded-lg"
                >
                  <p className="text-purple-300 text-xs font-semibold mb-1 uppercase tracking-wide">AI Reflection</p>
                  {loadingQuestion ? (
                    <div className="flex gap-1">
                      {[0, 1, 2].map(i => (
                        <motion.div
                          key={i}
                          className="w-2 h-2 bg-purple-400 rounded-full"
                          animate={{ y: [-3, 3, -3] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.1 }}
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="text-white">{aiQuestion}</p>
                  )}
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-white font-semibold mb-3">Quick Actions</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {quickActions.map((action, i) => {
              const Icon = action.icon
              return (
                <motion.button
                  key={action.href}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 * i }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => router.push(action.href)}
                  className={`p-4 rounded-xl bg-gradient-to-br ${action.color} text-white text-center shadow-lg`}
                >
                  <Icon className="mx-auto mb-2" size={22} />
                  <span className="text-sm font-medium">{action.label}</span>
                </motion.button>
              )
            })}
          </div>
        </motion.div>

        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-3 gap-2 sm:gap-4"
        >
          <Card className="bg-gray-900/50 border-gray-800">
            <CardContent className="p-3 sm:pt-6 sm:px-6 sm:pb-6 text-center sm:text-left">
              <p className="text-gray-400 text-xs sm:text-sm">Streak</p>
              <p className="text-xl sm:text-3xl font-bold text-white mt-1">7d</p>
              <p className="text-green-400 text-xs mt-1 hidden sm:block">🔥 Keep it up!</p>
            </CardContent>
          </Card>
          <Card className="bg-gray-900/50 border-gray-800">
            <CardContent className="p-3 sm:pt-6 sm:px-6 sm:pb-6 text-center sm:text-left">
              <p className="text-gray-400 text-xs sm:text-sm">Sessions</p>
              <p className="text-xl sm:text-3xl font-bold text-white mt-1">3</p>
              <p className="text-purple-400 text-xs mt-1 hidden sm:block">💬 This week</p>
            </CardContent>
          </Card>
          <Card className="bg-gray-900/50 border-gray-800">
            <CardContent className="p-3 sm:pt-6 sm:px-6 sm:pb-6 text-center sm:text-left">
              <p className="text-gray-400 text-xs sm:text-sm">Wellness</p>
              <p className="text-xl sm:text-3xl font-bold text-white mt-1">72</p>
              <p className="text-blue-400 text-xs mt-1 hidden sm:block">📈 +5 pts</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white text-lg">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {mockRecentActivity.map((activity, i) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * i }}
                  className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-lg"
                >
                  <span className="text-xl">{activityIcons[activity.type] || '📌'}</span>
                  <div className="flex-1">
                    <p className="text-white text-sm">{activity.message}</p>
                    <p className="text-gray-500 text-xs">{activity.time}</p>
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </PageTransition>
  )
}
