'use client'
import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { mockRecentActivity } from '@/lib/mock-data'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
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

const moodEmojis: Record<number, string> = { 1: '😢', 2: '😕', 3: '😐', 4: '😊', 5: '😄' }
const moodLabels: Record<number, string> = { 1: 'Very Sad', 2: 'Sad', 3: 'Neutral', 4: 'Happy', 5: 'Very Happy' }

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

const activityIcons: Record<string, string> = {
  triage: '📋', chat: '💬', community: '👥', diary: '📔', breathing: '🌬️'
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

export default function StudentDashboard() {
  const router = useRouter()
  const supabase = useRef(createClient()).current
  const [userName, setUserName] = useState('Student')
  const [mood, setMood] = useState(3)
  const [aiQuestion, setAiQuestion] = useState('')
  const [loadingQuestion, setLoadingQuestion] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) return
      supabase.from('profiles').select('name').eq('id', session.user.id).single()
        .then(({ data }) => { if (data?.name) setUserName(data.name) })
    })
  }, [supabase])

  const fetchDailyQuestion = async (moodValue: number) => {
    setLoadingQuestion(true)
    try {
      const res = await fetch('/api/daily-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mood: moodValue }),
      })
      const data = res.ok ? await res.json() : null
      setAiQuestion(data?.question ?? 'What is one thing you are grateful for today?')
    } catch {
      setAiQuestion('What is one thing you are grateful for today?')
    } finally {
      setLoadingQuestion(false)
    }
  }

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-4 sm:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">
          {getGreeting()}, {userName.split(' ')[0]} 👋
        </h1>
        <p className="text-gray-400 mt-1">How are you doing today?</p>
      </div>

      {/* Mood Slider */}
      <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white text-lg">Daily Mood Check</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <span className="text-5xl">{moodEmojis[mood]}</span>
            <div className="flex-1">
              <p className="text-white font-semibold text-lg mb-2">{moodLabels[mood]}</p>
              <input
                type="range"
                min={1}
                max={5}
                value={mood}
                onChange={e => {
                  const v = Number(e.target.value)
                  setMood(v)
                  fetchDailyQuestion(v)
                }}
                className="w-full h-2 appearance-none rounded-full bg-gray-700 cursor-pointer accent-purple-500"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Very Sad</span><span>Very Happy</span>
              </div>
            </div>
          </div>

          {(aiQuestion || loadingQuestion) && (
            <div className="mt-4 p-4 bg-purple-900/30 border border-purple-700/30 rounded-lg">
              <p className="text-purple-300 text-xs font-semibold mb-1 uppercase tracking-wide">AI Reflection</p>
              {loadingQuestion ? (
                <div className="flex gap-1">
                  {[0, 1, 2].map(i => (
                    <div key={i} className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                      style={{ animationDelay: `${i * 0.1}s` }} />
                  ))}
                </div>
              ) : (
                <p className="text-white">{aiQuestion}</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div>
        <h2 className="text-white font-semibold mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {quickActions.map((action) => {
            const Icon = action.icon
            return (
              <button
                key={action.href}
                onClick={() => router.push(action.href)}
                className={`p-4 rounded-xl bg-gradient-to-br ${action.color} text-white text-center shadow-lg active:scale-95 transition-transform`}
              >
                <Icon className="mx-auto mb-2" size={22} />
                <span className="text-sm font-medium">{action.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
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
      </div>

      {/* Recent Activity */}
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white text-lg">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {mockRecentActivity.map((activity) => (
            <div
              key={activity.id}
              className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-lg"
            >
              <span className="text-xl">{activityIcons[activity.type] || '📌'}</span>
              <div className="flex-1">
                <p className="text-white text-sm">{activity.message}</p>
                <p className="text-gray-500 text-xs">{activity.time}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
