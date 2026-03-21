'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PageTransition } from '@/components/ui/page-transition'
import { mockStudents } from '@/lib/mock-data'
import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts'
import {
  TrendingUp, TrendingDown, Minus, Phone, Users, MessageCircle, Star,
  Plus, Trash2, CheckSquare, Square, StickyNote, BookOpen,
} from 'lucide-react'

const trendIcons = { up: TrendingUp, down: TrendingDown, neutral: Minus }
const trendColors = { up: 'text-red-400', down: 'text-green-400', neutral: 'text-gray-400' }
const levelColors = {
  ai: 'bg-green-900/50 text-green-300 border-green-700/50',
  counsellor: 'bg-indigo-900/50 text-indigo-300 border-indigo-700/50',
  emergency: 'bg-amber-900/50 text-amber-300 border-amber-700/50',
}

interface Todo { id: string; text: string; done: boolean }

const TODOS_KEY  = 'counsellor-todos'
const NOTES_KEY  = 'counsellor-patient-notes'

export default function CounsellorDashboard() {
  const router = useRouter()

  // ── Todo state ──────────────────────────────────────────────────────────────
  const [todos, setTodos]     = useState<Todo[]>([])
  const [newTodo, setNewTodo] = useState('')

  // ── Notes state ─────────────────────────────────────────────────────────────
  const [notes, setNotes]                     = useState<Record<string, string>>({})
  const [selectedStudent, setSelectedStudent] = useState(mockStudents[0].name)
  const [noteText, setNoteText]               = useState('')
  const [noteSaved, setNoteSaved]             = useState(false)

  // ── Load from localStorage ──────────────────────────────────────────────────
  useEffect(() => {
    try {
      const t = localStorage.getItem(TODOS_KEY)
      if (t) setTodos(JSON.parse(t))
      const n = localStorage.getItem(NOTES_KEY)
      if (n) setNotes(JSON.parse(n))
    } catch { /* ignore */ }
  }, [])

  // ── When student selection changes, load their note ─────────────────────────
  useEffect(() => {
    setNoteText(notes[selectedStudent] ?? '')
    setNoteSaved(false)
  }, [selectedStudent, notes])

  // ── Todo helpers ────────────────────────────────────────────────────────────
  const saveTodos = (updated: Todo[]) => {
    setTodos(updated)
    localStorage.setItem(TODOS_KEY, JSON.stringify(updated))
  }

  const addTodo = () => {
    if (!newTodo.trim()) return
    saveTodos([...todos, { id: Date.now().toString(), text: newTodo.trim(), done: false }])
    setNewTodo('')
  }

  const toggleTodo = (id: string) =>
    saveTodos(todos.map(t => t.id === id ? { ...t, done: !t.done } : t))

  const deleteTodo = (id: string) =>
    saveTodos(todos.filter(t => t.id !== id))

  // ── Notes helpers ───────────────────────────────────────────────────────────
  const saveNote = () => {
    const updated = { ...notes, [selectedStudent]: noteText }
    setNotes(updated)
    localStorage.setItem(NOTES_KEY, JSON.stringify(updated))
    setNoteSaved(true)
    setTimeout(() => setNoteSaved(false), 2000)
  }

  const doneTodos  = todos.filter(t => t.done).length
  const totalTodos = todos.length

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
                        {notes[student.name] && (
                          <Badge className="bg-teal-900/50 text-teal-300 border-teal-700/40 text-[10px] px-1.5 py-0 flex items-center gap-0.5">
                            <StickyNote size={8} />
                            Notes
                          </Badge>
                        )}
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
                          <Line type="monotone" dataKey="score"
                            stroke={isEmergency ? '#f59e0b' : '#818cf8'}
                            strokeWidth={2} dot={false}
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
                        <Button size="sm" onClick={() => router.push('/counsellor/chat')}
                          className="bg-amber-600 hover:bg-amber-700 text-white text-xs min-h-[40px] px-3">
                          <Phone size={14} className="mr-1" />
                          Call
                        </Button>
                      )}
                      <Button size="sm" variant="outline" onClick={() => router.push('/counsellor/chat')}
                        className="border-gray-700 text-gray-300 hover:text-white hover:bg-indigo-900/30 hover:border-indigo-600/50 text-xs min-h-[40px] px-3">
                        Chat
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>

        {/* Todo + Notes row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">

          {/* ── Todo List ───────────────────────────────────────────────────── */}
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen size={15} className="text-indigo-400" />
                  <CardTitle className="text-white text-base">To-Do List</CardTitle>
                </div>
                {totalTodos > 0 && (
                  <span className="text-gray-500 text-xs">{doneTodos}/{totalTodos} done</span>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Add task */}
              <div className="flex gap-2">
                <input
                  value={newTodo}
                  onChange={e => setNewTodo(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addTodo()}
                  placeholder="Add a task…"
                  className="flex-1 bg-gray-800/60 border border-gray-700 focus:border-indigo-500/60 rounded-xl px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:outline-none transition-colors"
                />
                <button
                  onClick={addTodo}
                  disabled={!newTodo.trim()}
                  className="w-9 h-9 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 flex items-center justify-center transition-colors shrink-0"
                >
                  <Plus size={16} className="text-white" />
                </button>
              </div>

              {/* Task list */}
              {todos.length === 0 ? (
                <p className="text-gray-600 text-xs text-center py-4">No tasks yet — add one above</p>
              ) : (
                <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                  {todos.map(todo => (
                    <div key={todo.id} className="flex items-start gap-2 group p-2 rounded-lg hover:bg-gray-800/40 transition-colors">
                      <button onClick={() => toggleTodo(todo.id)} className="mt-0.5 shrink-0 text-gray-500 hover:text-indigo-400 transition-colors">
                        {todo.done
                          ? <CheckSquare size={15} className="text-indigo-400" />
                          : <Square size={15} />}
                      </button>
                      <p className={`flex-1 text-sm leading-snug ${todo.done ? 'line-through text-gray-600' : 'text-gray-200'}`}>
                        {todo.text}
                      </p>
                      <button
                        onClick={() => deleteTodo(todo.id)}
                        className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-400 transition-all shrink-0"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* ── Patient Notes ───────────────────────────────────────────────── */}
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <StickyNote size={15} className="text-teal-400" />
                <CardTitle className="text-white text-base">Patient Notes</CardTitle>
              </div>
              <p className="text-gray-500 text-xs mt-0.5">Notes appear as recommendations during chat sessions</p>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Student selector */}
              <select
                value={selectedStudent}
                onChange={e => setSelectedStudent(e.target.value)}
                className="w-full bg-gray-800/60 border border-gray-700 focus:border-teal-500/60 rounded-xl px-3 py-2 text-sm text-white focus:outline-none transition-colors"
              >
                {mockStudents.map(s => (
                  <option key={s.id} value={s.name} className="bg-gray-900">{s.name}</option>
                ))}
              </select>

              {/* Notes textarea */}
              <textarea
                value={noteText}
                onChange={e => { setNoteText(e.target.value); setNoteSaved(false) }}
                placeholder={`Write clinical notes, observations, or reminders for ${selectedStudent}…`}
                rows={5}
                className="w-full bg-gray-800/60 border border-gray-700 focus:border-teal-500/60 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none transition-colors resize-none"
              />

              <Button
                onClick={saveNote}
                disabled={!noteText.trim()}
                className={`w-full text-sm transition-all ${
                  noteSaved
                    ? 'bg-teal-700 hover:bg-teal-700 text-white'
                    : 'bg-teal-600 hover:bg-teal-700 text-white'
                }`}
              >
                {noteSaved ? '✓ Saved' : 'Save Notes'}
              </Button>
            </CardContent>
          </Card>

        </div>
      </div>
    </PageTransition>
  )
}
