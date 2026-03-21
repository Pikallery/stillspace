'use client'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Send, AlertTriangle, Phone } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export default function ChatPage() {
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'assistant',
      content: "Hi! I'm StillSpace AI, your mental wellness companion 💜 I'm here to listen and support you. How are you feeling today?",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [showCounsellorPrompt, setShowCounsellorPrompt] = useState(false)
  const [showEmergencyModal, setShowEmergencyModal] = useState(false)
  const [exitCount, setExitCount] = useState(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    const stored = localStorage.getItem('chat_exit_count')
    if (stored) setExitCount(parseInt(stored))
  }, [])

  useEffect(() => {
    return () => {
      const newCount = exitCount + 1
      localStorage.setItem('chat_exit_count', String(newCount))
      if (newCount > 3) setShowCounsellorPrompt(true)
    }
  }, [exitCount])

  const sendMessage = async () => {
    if (!input.trim() || loading) return

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const apiMessages = [...messages, userMsg].map(m => ({
        role: m.role,
        content: m.content,
      }))
      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages }),
      })
      if (res.ok) {
        const data = await res.json()
        if (data.emergency) setShowEmergencyModal(true)
        setMessages(prev => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: data.content,
            timestamp: new Date(),
          },
        ])
      } else {
        throw new Error('API error')
      }
    } catch {
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content:
            "I'm here with you. Sometimes things can feel overwhelming, and it's okay to take it one step at a time. What's on your mind?",
          timestamp: new Date(),
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    // WhatsApp-style: fixed height = viewport minus top bar (3.5rem) and bottom nav (4rem)
    // On md+ no bottom nav: just viewport minus nothing (full screen)
    <div className="flex flex-col overflow-hidden
                    h-[calc(100dvh-3.5rem-4rem)]
                    md:h-[calc(100dvh-0px)]">

      {/* ── Chat header ────────────────────────────────────────── */}
      <div className="shrink-0 px-4 py-3 border-b border-gray-800 bg-gray-900/50
                      flex items-center gap-3 backdrop-blur-sm">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600
                        flex items-center justify-center shrink-0">
          <span className="text-base">🧠</span>
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-white font-semibold text-sm">StillSpace AI</h2>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <p className="text-gray-400 text-xs">Always here for you</p>
          </div>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => router.push('/student/triage')}
          className="shrink-0 border-purple-700/50 text-purple-300
                     hover:bg-purple-900/20 text-xs min-h-[36px]"
        >
          Need Help?
        </Button>
      </div>

      {/* ── Messages (scrollable) ──────────────────────────────── */}
      <div className="flex-1 overflow-y-auto overscroll-contain p-4 space-y-4">
        <AnimatePresence initial={false}>
          {messages.map(message => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 16, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.25 }}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600
                                flex items-center justify-center mr-2 mt-1 shrink-0">
                  <span className="text-sm">🧠</span>
                </div>
              )}
              <div
                className={`max-w-[78%] sm:max-w-[70%] rounded-2xl px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-gradient-to-br from-purple-600 to-indigo-600 text-white rounded-tr-sm'
                    : 'bg-gray-800/80 text-gray-100 rounded-tl-sm'
                }`}
              >
                <p className="text-sm leading-relaxed">{message.content}</p>
                <p
                  className={`text-[10px] mt-1 ${
                    message.role === 'user' ? 'text-purple-200' : 'text-gray-500'
                  }`}
                >
                  {message.timestamp.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing indicator */}
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex items-center gap-2"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600
                              flex items-center justify-center">
                <span className="text-sm">🧠</span>
              </div>
              <div className="bg-gray-800/80 rounded-2xl rounded-tl-sm px-4 py-3">
                <div className="flex gap-1">
                  {[0, 1, 2].map(i => (
                    <motion.div
                      key={i}
                      className="w-2 h-2 bg-purple-400 rounded-full"
                      animate={{ y: [-3, 3, -3] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* ── Counsellor escalation banner ──────────────────────── */}
      <AnimatePresence>
        {showCounsellorPrompt && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="shrink-0 px-3 pb-2"
          >
            <Card className="bg-indigo-900/40 border-indigo-700/50">
              <CardContent className="p-3 flex flex-wrap items-center gap-3">
                <p className="text-indigo-200 text-sm flex-1 min-w-0">
                  Would you like to connect with a real counsellor?
                </p>
                <div className="flex gap-2 shrink-0">
                  <Button
                    size="sm"
                    onClick={() => router.push('/student/triage')}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs min-h-[36px]"
                  >
                    Yes, Connect
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowCounsellorPrompt(false)}
                    className="text-gray-400 text-xs min-h-[36px]"
                  >
                    No
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Fixed bottom input bar ─────────────────────────────── */}
      <div className="shrink-0 px-3 py-3 border-t border-gray-800
                      bg-gray-950/90 backdrop-blur-xl safe-area-bottom">
        <div className="flex gap-2 max-w-3xl mx-auto">
          <Input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Share how you're feeling..."
            className="flex-1 bg-gray-800/50 border-gray-700 text-white
                       placeholder:text-gray-500 focus:border-purple-500
                       min-h-[44px] text-base" // text-base prevents iOS zoom
            disabled={loading}
            autoComplete="off"
          />
          <Button
            onClick={sendMessage}
            disabled={!input.trim() || loading}
            className="bg-purple-600 hover:bg-purple-700 text-white min-h-[44px] min-w-[44px] px-3"
          >
            <Send size={18} />
          </Button>
        </div>
      </div>

      {/* ── Emergency modal ────────────────────────────────────── */}
      <Dialog open={showEmergencyModal} onOpenChange={setShowEmergencyModal}>
        <DialogContent className="bg-gray-900 border-amber-600/50 text-white max-w-md mx-4">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-400">
              <AlertTriangle size={20} />
              We Care About You
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-300">
              It sounds like you may be going through something really difficult right now. You don&apos;t
              have to face this alone.
            </p>
            <div className="p-3 bg-amber-900/20 border border-amber-700/40 rounded-lg">
              <p className="text-amber-300 font-semibold">Crisis Support: 988</p>
              <p className="text-gray-400 text-xs">Suicide & Crisis Lifeline — Available 24/7</p>
            </div>
            <Button
              onClick={() => {
                setShowEmergencyModal(false)
                router.push('/student/triage')
              }}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white min-h-[48px]"
            >
              <Phone size={16} className="mr-2" />
              Connect with Counsellor
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
