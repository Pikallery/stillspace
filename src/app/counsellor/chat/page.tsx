'use client'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { PageTransition } from '@/components/ui/page-transition'
import { mockStudents } from '@/lib/mock-data'
import { Send, Lightbulb, ChevronLeft } from 'lucide-react'

const mockMessages: Record<string, { id: string; sender: string; content: string; time: string }[]> = {
  '1': [
    { id: '1', sender: 'student', content: "Hi Dr. Chen, I've been feeling overwhelmed with exams lately.", time: '10:30 AM' },
    { id: '2', sender: 'counsellor', content: "I understand. Exam stress is really common. Let's talk about what strategies might help you.", time: '10:32 AM' },
    { id: '3', sender: 'student', content: "I just can't seem to focus. My mind keeps wandering.", time: '10:33 AM' },
  ],
  '2': [
    { id: '1', sender: 'student', content: "I had another difficult night. The nightmares are back.", time: '9:15 AM' },
    { id: '2', sender: 'counsellor', content: "I'm sorry to hear that. We'll work through this together. Can you tell me more about what happened?", time: '9:20 AM' },
  ],
}

const mockNotes: Record<string, string[]> = {
  '1': ['Experiencing academic anxiety and focus issues', 'Responds well to CBT techniques', 'Next session: practice mindfulness'],
  '2': ['Trauma history — handle with care', 'Nightmares reported', 'Consider EMDR referral'],
}

export default function CounsellorChatPage() {
  const [selectedStudent, setSelectedStudent] = useState<typeof mockStudents[0] | null>(null)
  const [messages, setMessages] = useState<typeof mockMessages['1']>([])
  const [input, setInput] = useState('')
  const [suggestions, setSuggestions] = useState('')
  const [loadingSuggestions, setLoadingSuggestions] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!selectedStudent) return
    setMessages(mockMessages[selectedStudent.id] || [])
    fetchSuggestions(selectedStudent.id)
  }, [selectedStudent])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const fetchSuggestions = async (studentId: string) => {
    setLoadingSuggestions(true)
    try {
      const res = await fetch('/api/counsellor-suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notes: mockNotes[studentId]?.join('. ') || '',
          messages: mockMessages[studentId] || [],
        }),
      })
      if (res.ok) {
        const data = await res.json()
        setSuggestions(data.suggestions)
      } else {
        setSuggestions("• Continue exploring the student's concerns\n• Offer coping strategy resources")
      }
    } catch {
      setSuggestions("• Continue exploring the student's concerns\n• Offer coping strategy resources")
    } finally {
      setLoadingSuggestions(false)
    }
  }

  const sendMessage = () => {
    if (!input.trim()) return
    setMessages(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        sender: 'counsellor',
        content: input.trim(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ])
    setInput('')
  }

  // ── Mobile: student list view ──────────────────────────────────
  if (!selectedStudent) {
    return (
      <PageTransition>
        <div className="p-4 max-w-2xl mx-auto">
          <h1 className="text-xl font-bold text-white mb-1">Student Chats</h1>
          <p className="text-gray-400 text-sm mb-5">Tap a student to start a session</p>
          <div className="space-y-2">
            {mockStudents.map(student => (
              <button
                key={student.id}
                onClick={() => setSelectedStudent(student)}
                className="w-full flex items-center gap-3 p-4 rounded-xl
                           bg-gray-900/50 border border-gray-800
                           hover:bg-gray-800/50 active:bg-gray-800
                           transition-colors text-left min-h-[64px]"
              >
                <Avatar className="w-11 h-11 shrink-0">
                  <AvatarFallback className="bg-indigo-700 text-white">
                    {student.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium text-sm">{student.name}</p>
                  <p className="text-gray-500 text-xs">Score: {student.triage_score}/10</p>
                </div>
                {student.triage_level === 'emergency' && (
                  <Badge className="bg-amber-900/60 text-amber-300 border-amber-700/50 text-xs animate-pulse shrink-0">
                    Emergency
                  </Badge>
                )}
                <span className="text-gray-600 text-lg shrink-0">›</span>
              </button>
            ))}
          </div>
        </div>
      </PageTransition>
    )
  }

  // ── Chat view (mobile: full screen; desktop: 3-column) ─────────
  return (
    <div className="flex h-[calc(100dvh-3.5rem-4rem)] md:h-[calc(100dvh-0px)] overflow-hidden">

      {/* Left column: student list (desktop only) */}
      <div className="hidden md:flex w-64 shrink-0 border-r border-gray-800
                      bg-gray-900/30 flex-col overflow-hidden">
        <div className="p-4 border-b border-gray-800 shrink-0">
          <h3 className="text-white font-semibold text-sm">Students</h3>
        </div>
        <div className="flex-1 overflow-y-auto">
          {mockStudents.map(student => (
            <button
              key={student.id}
              onClick={() => setSelectedStudent(student)}
              className={`w-full p-4 text-left border-b border-gray-800/50
                          hover:bg-gray-800/30 transition-colors min-h-[64px] ${
                selectedStudent.id === student.id
                  ? 'bg-indigo-900/20 border-l-2 border-l-indigo-500'
                  : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-indigo-700 text-white text-xs">
                    {student.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="text-white text-sm font-medium truncate">{student.name}</p>
                  <p className="text-gray-500 text-xs">Score: {student.triage_score}/10</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Middle: chat */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Chat header */}
        <div className="shrink-0 p-3 border-b border-gray-800 bg-gray-900/30
                        flex items-center gap-3">
          {/* Back button (mobile only) */}
          <button
            onClick={() => setSelectedStudent(null)}
            className="md:hidden text-gray-400 hover:text-white p-1 -ml-1 min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <ChevronLeft size={22} />
          </button>
          <Avatar className="w-9 h-9 shrink-0">
            <AvatarFallback className="bg-indigo-700 text-white">
              {selectedStudent.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold text-sm truncate">{selectedStudent.name}</p>
            <p className="text-gray-400 text-xs">Triage score: {selectedStudent.triage_score}/10</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-4 space-y-4">
          <AnimatePresence initial={false}>
            {messages.map(msg => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.sender === 'counsellor' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[78%] rounded-2xl px-4 py-3 ${
                    msg.sender === 'counsellor'
                      ? 'bg-gradient-to-br from-indigo-600 to-blue-600 text-white rounded-tr-sm'
                      : 'bg-gray-800/80 text-gray-100 rounded-tl-sm'
                  }`}
                >
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                  <p className={`text-[10px] mt-1 ${msg.sender === 'counsellor' ? 'text-indigo-200' : 'text-gray-500'}`}>
                    {msg.time}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* Input bar */}
        <div className="shrink-0 p-3 border-t border-gray-800 bg-gray-900/30">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              placeholder="Type a message..."
              className="flex-1 bg-gray-800/50 border-gray-700 text-white
                         placeholder:text-gray-500 min-h-[44px] text-base"
            />
            <Button
              onClick={sendMessage}
              disabled={!input.trim()}
              className="bg-indigo-600 hover:bg-indigo-700 text-white min-h-[44px] min-w-[44px] px-3"
            >
              <Send size={18} />
            </Button>
          </div>
        </div>
      </div>

      {/* Right: notes + AI suggestions (desktop only) */}
      <div className="hidden md:flex w-72 shrink-0 border-l border-gray-800
                      bg-gray-900/30 flex-col overflow-y-auto p-4 space-y-5">
        <div>
          <h3 className="text-white font-semibold text-sm mb-3">Recent Notes</h3>
          <div className="space-y-2">
            {(mockNotes[selectedStudent.id] || ['No notes yet']).map((note, i) => (
              <div key={i} className="p-3 bg-gray-800/40 rounded-lg">
                <p className="text-gray-300 text-xs leading-relaxed">{note}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb size={14} className="text-amber-400" />
            <h3 className="text-white font-semibold text-sm">AI Suggestions</h3>
          </div>
          {loadingSuggestions ? (
            <div className="flex gap-1">
              {[0, 1, 2].map(i => (
                <motion.div
                  key={i}
                  className="w-2 h-2 bg-amber-400 rounded-full"
                  animate={{ y: [-3, 3, -3] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                />
              ))}
            </div>
          ) : (
            <div className="p-3 bg-amber-900/20 border border-amber-700/30 rounded-lg">
              <p className="text-amber-200 text-xs whitespace-pre-line leading-relaxed">
                {suggestions}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
