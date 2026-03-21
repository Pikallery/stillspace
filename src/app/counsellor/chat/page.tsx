'use client'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Send, Lightbulb, ChevronLeft } from 'lucide-react'
import { createClient, type Profile, type DbMessage, type Conversation } from '@/lib/supabase'
import { useCall, CallOverlay, CallButton } from '@/components/ui/call-overlay'
import { encryptMessage, decryptMessage } from '@/lib/crypto'
import { mockStudents, mockChatHistories } from '@/lib/mock-data'

// ── Types ─────────────────────────────────────────────────────────────────────

interface ConversationWithStudent extends Conversation {
  student: Profile
  _isMock?: boolean
}

interface MessageWithSender extends DbMessage {
  sender: Profile
}

// ── Build mock conversations from mockStudents ─────────────────────────────────

const MOCK_COUNSELLOR_SENDER = 'mock-counsellor'

function buildMockProfile(s: typeof mockStudents[number]): Profile {
  return {
    id: `mock-student-${s.id}`,
    name: s.name,
    role: 'student',
    email: `${s.name.toLowerCase().replace(' ', '.')}@demo.edu`,
    mobile: null,
    is_available: true,
    is_banned: false,
    bio: null,
    specializations: null,
    rating: 0,
    triage_score: s.triage_score,
    triage_level: s.triage_level,
    college: null, course: null, reg_number: null, section: null, branch: null,
    experience: null,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
  }
}

const MOCK_CONVERSATIONS: ConversationWithStudent[] = mockStudents.map(s => ({
  id: `mock-conv-${s.id}`,
  student_id: `mock-student-${s.id}`,
  counsellor_id: MOCK_COUNSELLOR_SENDER,
  created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
  student: buildMockProfile(s),
  _isMock: true,
}))

function buildMockMessages(studentId: string): MessageWithSender[] {
  const history = mockChatHistories[studentId] ?? []
  const student = mockStudents.find(s => s.id === studentId)!
  const studentProfile = buildMockProfile(student)
  const counsellorProfile: Profile = {
    id: MOCK_COUNSELLOR_SENDER,
    name: 'You',
    role: 'counsellor',
    email: 'counsellor@demo.edu',
    mobile: null, is_available: true, is_banned: false,
    bio: null, specializations: null, rating: 4.9,
    triage_score: null, triage_level: null,
    college: null, course: null, reg_number: null, section: null, branch: null,
    experience: null,
    created_at: new Date().toISOString(),
  }
  return history.map((msg, i) => ({
    id: `mock-msg-${studentId}-${i}`,
    conversation_id: `mock-conv-${studentId}`,
    sender_id: msg.sender === 'c' ? MOCK_COUNSELLOR_SENDER : `mock-student-${studentId}`,
    content: msg.content,
    created_at: new Date(Date.now() - msg.minutesAgo * 60 * 1000).toISOString(),
    sender: msg.sender === 'c' ? counsellorProfile : studentProfile,
  }))
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function CounsellorChatPage() {
  const supabase = createClient()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const convKeyRef = useRef<string | null>(null)

  const [myId, setMyId] = useState<string | null>(null)
  const [realConvs, setRealConvs] = useState<ConversationWithStudent[]>([])
  const [selectedConv, setSelectedConv] = useState<ConversationWithStudent | null>(null)
  const [messages, setMessages] = useState<MessageWithSender[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [loadingConvs, setLoadingConvs] = useState(true)
  const [loadingMsgs, setLoadingMsgs] = useState(false)
  const [suggestions, setSuggestions] = useState('')
  const [loadingSuggestions, setLoadingSuggestions] = useState(false)

  // Merge real + mock conversations (real first if any)
  const conversations: ConversationWithStudent[] = [...realConvs, ...MOCK_CONVERSATIONS]

  const isMock = (conv: ConversationWithStudent) => !!conv._isMock

  const call = useCall({
    myId: myId ?? '',
    targetId: selectedConv?.student_id ?? '',
    targetName: selectedConv?.student.name ?? 'Student',
  })

  // ── Auth ────────────────────────────────────────────────────────────────────

  useEffect(() => {
    ;(async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) setMyId(session.user.id)
    })()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Load real conversations ─────────────────────────────────────────────────

  useEffect(() => {
    if (!myId) return
    const load = async () => {
      setLoadingConvs(true)
      const { data } = await supabase
        .from('conversations')
        .select('*, student:profiles!conversations_student_id_fkey(*)')
        .eq('counsellor_id', myId)
        .order('created_at', { ascending: false })

      setRealConvs((data as ConversationWithStudent[]) ?? [])
      setLoadingConvs(false)
    }
    load()

    const channel = supabase
      .channel(`counsellor-convs-${myId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'conversations', filter: `counsellor_id=eq.${myId}` },
        async (payload: { new: { id: string } }) => {
          const { data } = await supabase
            .from('conversations')
            .select('*, student:profiles!conversations_student_id_fkey(*)')
            .eq('id', payload.new.id)
            .single()
          if (data) setRealConvs(prev => [data as ConversationWithStudent, ...prev])
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [myId]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Load messages when conversation selected ────────────────────────────────

  useEffect(() => {
    if (!selectedConv) return
    setMessages([])
    setLoadingMsgs(true)
    convKeyRef.current = null

    if (isMock(selectedConv)) {
      // Use pre-built mock messages
      const studentId = selectedConv.student_id.replace('mock-student-', '')
      const mockMsgs = buildMockMessages(studentId)
      setTimeout(() => {
        setMessages(mockMsgs)
        setLoadingMsgs(false)
      }, 300) // small delay for realism
      fetchSuggestions(selectedConv.student.name, [])
      return
    }

    const load = async () => {
      const keyRes = await fetch(`/api/conversations/${selectedConv.id}/key`)
      if (keyRes.ok) {
        const { key } = await keyRes.json()
        convKeyRef.current = key
      }

      const { data } = await supabase
        .from('messages')
        .select('*, sender:profiles!messages_sender_id_fkey(*)')
        .eq('conversation_id', selectedConv.id)
        .order('created_at', { ascending: true })

      const raw = (data as MessageWithSender[]) ?? []
      const decrypted = convKeyRef.current
        ? await Promise.all(raw.map(async m => ({ ...m, content: await decryptMessage(m.content, convKeyRef.current!) })))
        : raw
      setMessages(decrypted)
      setLoadingMsgs(false)
    }
    load()

    const channel = supabase
      .channel(`counsellor-msgs-${selectedConv.id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${selectedConv.id}` },
        async (payload: { new: { id: string } }) => {
          const { data } = await supabase
            .from('messages')
            .select('*, sender:profiles!messages_sender_id_fkey(*)')
            .eq('id', payload.new.id)
            .single()
          if (data) {
            const msg = data as MessageWithSender
            const content = convKeyRef.current
              ? await decryptMessage(msg.content, convKeyRef.current)
              : msg.content
            setMessages(prev => [...prev, { ...msg, content }])
          }
        }
      )
      .subscribe()

    fetchSuggestions(selectedConv.student.name, [])

    return () => { supabase.removeChannel(channel) }
  }, [selectedConv?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // ── AI suggestions ──────────────────────────────────────────────────────────

  const fetchSuggestions = async (studentName: string, msgs: MessageWithSender[]) => {
    setLoadingSuggestions(true)
    try {
      const res = await fetch('/api/counsellor-suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notes: `Student: ${studentName}`,
          messages: msgs.slice(-6).map(m => ({ sender: m.sender.name, content: m.content })),
        }),
      })
      if (res.ok) {
        const data = await res.json()
        setSuggestions(data.suggestions)
      }
    } catch {
      setSuggestions('• Continue building rapport\n• Explore coping strategies')
    } finally {
      setLoadingSuggestions(false)
    }
  }

  // ── Send message ────────────────────────────────────────────────────────────

  const sendMessage = async () => {
    if (!input.trim() || !selectedConv || sending) return
    setSending(true)
    const content = input.trim()
    setInput('')

    if (isMock(selectedConv)) {
      // Append to local state only — mock conversations don't hit DB
      const counsellorProfile: Profile = {
        id: MOCK_COUNSELLOR_SENDER,
        name: 'You',
        role: 'counsellor',
        email: '', mobile: null, is_available: true, is_banned: false,
        bio: null, specializations: null, rating: 4.9,
        triage_score: null, triage_level: null,
        college: null, course: null, reg_number: null, section: null, branch: null,
        experience: null, created_at: new Date().toISOString(),
      }
      setMessages(prev => [...prev, {
        id: `local-${Date.now()}`,
        conversation_id: selectedConv.id,
        sender_id: MOCK_COUNSELLOR_SENDER,
        content,
        created_at: new Date().toISOString(),
        sender: counsellorProfile,
      }])
      setSending(false)
      return
    }

    if (!myId) { setSending(false); return }
    const stored = convKeyRef.current
      ? await encryptMessage(content, convKeyRef.current)
      : content
    await supabase.from('messages').insert({
      conversation_id: selectedConv.id,
      sender_id: myId,
      content: stored,
    })
    setSending(false)
  }

  // ── isMe helper ─────────────────────────────────────────────────────────────

  const isMyMessage = (msg: MessageWithSender) => {
    if (isMock(selectedConv!)) return msg.sender_id === MOCK_COUNSELLOR_SENDER
    return msg.sender_id === myId
  }

  // ── Conversation list component ─────────────────────────────────────────────

  const ConversationList = ({ compact = false }: { compact?: boolean }) => (
    <div className={compact ? 'flex-1 overflow-y-auto' : 'space-y-2'}>
      {loadingConvs ? (
        <div className="p-4 space-y-2">
          {[1, 2, 3].map(i => <div key={i} className="h-14 rounded-lg bg-gray-800/40 animate-pulse" />)}
        </div>
      ) : (
        conversations.map(conv => {
          const isEmergency = conv.student.triage_level === 'emergency'
          const student = mockStudents.find(s => conv.student.name === s.name)
          const preview = student?.lastMessage ?? ''
          const previewTime = student?.lastMessageTime ?? ''

          return (
            <button
              key={conv.id}
              onClick={() => setSelectedConv(conv)}
              className={`w-full text-left transition-colors ${
                compact
                  ? `p-3 border-b border-gray-800/50 hover:bg-gray-800/30 ${
                      selectedConv?.id === conv.id ? 'bg-indigo-900/20 border-l-2 border-l-indigo-500' : ''
                    }`
                  : `flex items-start gap-3 p-4 rounded-xl border hover:bg-gray-800/50 ${
                      isEmergency ? 'border-amber-700/40 bg-amber-950/10' : 'bg-gray-900/50 border-gray-800'
                    }`
              }`}
            >
              <div className={`flex items-start gap-3 ${compact ? '' : 'w-full'}`}>
                <div className="relative shrink-0">
                  <Avatar className={compact ? 'w-8 h-8' : 'w-11 h-11'}>
                    <AvatarFallback className={`text-white text-xs ${isEmergency ? 'bg-amber-700' : 'bg-indigo-700'}`}>
                      {conv.student.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  {conv._isMock && (
                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-400 border border-gray-900" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <p className="text-white font-medium text-sm truncate">{conv.student.name}</p>
                    {previewTime && <span className="text-gray-600 text-[10px] shrink-0">{previewTime}</span>}
                  </div>
                  {preview && (
                    <p className="text-gray-500 text-xs truncate mt-0.5">{preview}</p>
                  )}
                  <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                    {isEmergency && (
                      <Badge className="bg-amber-900/60 text-amber-300 border-amber-700/50 text-[9px] px-1.5 py-0 animate-pulse">
                        Emergency
                      </Badge>
                    )}
                    {conv.student.triage_level && !isEmergency && (
                      <Badge className="bg-gray-800 text-gray-400 border-gray-700 text-[9px] px-1.5 py-0">
                        {conv.student.triage_level}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </button>
          )
        })
      )}
    </div>
  )

  // ── Mobile: list when no conversation selected ──────────────────────────────

  if (!selectedConv) {
    return (
      <div className="p-4 max-w-2xl mx-auto">
        <h1 className="text-xl font-bold text-white mb-1">Student Chats</h1>
        <p className="text-gray-400 text-sm mb-5">Tap a student to open their session</p>
        <ConversationList compact={false} />
      </div>
    )
  }

  // ── Chat view ───────────────────────────────────────────────────────────────

  const isEmergency = selectedConv.student.triage_level === 'emergency'

  return (
    <div className="flex h-[calc(100dvh-3.5rem-4rem)] md:h-screen overflow-hidden">

      {/* Left: student list (desktop) */}
      <div className="hidden md:flex w-72 shrink-0 border-r border-gray-800 bg-gray-900/30 flex-col overflow-hidden">
        <div className="p-4 border-b border-gray-800 shrink-0">
          <h3 className="text-white font-semibold text-sm">Students</h3>
          <p className="text-gray-500 text-xs mt-0.5">{conversations.length} assigned</p>
        </div>
        <ConversationList compact />
      </div>

      {/* Middle: chat */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Header */}
        <div className={`shrink-0 p-3 border-b border-gray-800 flex items-center gap-3 ${
          isEmergency ? 'bg-amber-950/20' : 'bg-gray-900/30'
        }`}>
          <button
            onClick={() => setSelectedConv(null)}
            className="md:hidden text-gray-400 hover:text-white p-1 -ml-1 min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <ChevronLeft size={22} />
          </button>
          <Avatar className="w-9 h-9 shrink-0">
            <AvatarFallback className={`text-white ${isEmergency ? 'bg-amber-700' : 'bg-indigo-700'}`}>
              {selectedConv.student.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold text-sm truncate">{selectedConv.student.name}</p>
            <p className="text-gray-400 text-xs capitalize">
              {selectedConv.student.triage_level ? `Level: ${selectedConv.student.triage_level}` : 'Student'}
              {selectedConv._isMock && ' · Demo'}
            </p>
          </div>
          {isEmergency && (
            <Badge className="bg-amber-900/60 text-amber-300 border-amber-700/50 text-xs animate-pulse shrink-0">
              Emergency
            </Badge>
          )}
          <CallButton onClick={call.makeCall} disabled={call.status !== 'idle'} ready={call.deviceReady} />
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-4 space-y-4">
          {loadingMsgs ? (
            <div className="flex items-center justify-center h-full">
              <div className="flex gap-1">
                {[0, 1, 2].map(i => (
                  <motion.div key={i} className="w-2 h-2 bg-indigo-400 rounded-full"
                    animate={{ y: [-3, 3, -3] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }} />
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500 text-sm">No messages yet. Say hello!</p>
                </div>
              )}
              <AnimatePresence initial={false}>
                {messages.map(msg => {
                  const isMe = isMyMessage(msg)
                  return (
                    <motion.div key={msg.id}
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                    >
                      {!isMe && (
                        <Avatar className="w-7 h-7 mr-2 mt-1 shrink-0">
                          <AvatarFallback className="bg-purple-700 text-white text-xs">
                            {msg.sender.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div className={`max-w-[78%] rounded-2xl px-4 py-3 ${
                        isMe
                          ? 'bg-gradient-to-br from-indigo-600 to-blue-600 text-white rounded-tr-sm'
                          : 'bg-gray-800/80 text-gray-100 rounded-tl-sm'
                      }`}>
                        <p className="text-sm leading-relaxed">{msg.content}</p>
                        <p className={`text-[10px] mt-1 ${isMe ? 'text-indigo-200' : 'text-gray-500'}`}>
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="shrink-0 p-3 border-t border-gray-800 bg-gray-900/30">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder={`Message ${selectedConv.student.name}…`}
              className="flex-1 bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 min-h-[44px] text-base"
              disabled={sending}
              autoComplete="off"
            />
            <Button
              onClick={sendMessage}
              disabled={!input.trim() || sending}
              className="bg-indigo-600 hover:bg-indigo-700 text-white min-h-[44px] min-w-[44px] px-3"
            >
              <Send size={18} />
            </Button>
          </div>
          {selectedConv._isMock && (
            <p className="text-gray-700 text-[10px] text-center mt-1.5">Demo conversation — messages are not saved</p>
          )}
        </div>
      </div>

      {/* Right: AI suggestions (desktop) */}
      <div className="hidden md:flex w-72 shrink-0 border-l border-gray-800 bg-gray-900/30 flex-col overflow-y-auto p-4 space-y-5">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb size={14} className="text-amber-400" />
            <h3 className="text-white font-semibold text-sm">AI Suggestions</h3>
          </div>
          {loadingSuggestions ? (
            <div className="flex gap-1">
              {[0, 1, 2].map(i => (
                <motion.div key={i} className="w-2 h-2 bg-amber-400 rounded-full"
                  animate={{ y: [-3, 3, -3] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }} />
              ))}
            </div>
          ) : (
            <div className="p-3 bg-amber-900/20 border border-amber-700/30 rounded-lg">
              <p className="text-amber-200 text-xs whitespace-pre-line leading-relaxed">
                {suggestions || '• Build rapport and listen actively\n• Explore coping strategies'}
              </p>
            </div>
          )}
        </div>

        <div>
          <h3 className="text-white font-semibold text-sm mb-3">Student Info</h3>
          <div className="p-3 bg-gray-800/40 rounded-lg space-y-2">
            <div>
              <p className="text-gray-500 text-xs">Name</p>
              <p className="text-gray-200 text-sm">{selectedConv.student.name}</p>
            </div>
            {selectedConv.student.triage_level && (
              <div>
                <p className="text-gray-500 text-xs">Triage level</p>
                <p className={`text-sm capitalize font-medium ${
                  selectedConv.student.triage_level === 'emergency' ? 'text-amber-400' :
                  selectedConv.student.triage_level === 'counsellor' ? 'text-indigo-400' : 'text-green-400'
                }`}>
                  {selectedConv.student.triage_level}
                </p>
              </div>
            )}
            {selectedConv.student.triage_score != null && (
              <div>
                <p className="text-gray-500 text-xs">Triage score</p>
                <p className="text-gray-200 text-sm">{selectedConv.student.triage_score}/10</p>
              </div>
            )}
          </div>
        </div>

        <Button
          size="sm"
          variant="outline"
          onClick={() => fetchSuggestions(selectedConv.student.name, messages)}
          className="border-amber-700/40 text-amber-400 hover:bg-amber-900/20 text-xs"
        >
          Refresh Suggestions
        </Button>
      </div>

      <CallOverlay {...call} />
    </div>
  )
}
