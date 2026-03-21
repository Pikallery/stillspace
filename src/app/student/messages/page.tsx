'use client'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Send, ChevronLeft, Plus } from 'lucide-react'
import { createClient, type Profile, type DbMessage, type Conversation } from '@/lib/supabase'

// ── Types for joined queries ──────────────────────────────────────────────────

interface ConversationWithProfile extends Conversation {
  counsellor: Profile
}

interface MessageWithSender extends DbMessage {
  sender: Profile
}

// ── Main component ────────────────────────────────────────────────────────────

export default function StudentMessagesPage() {
  const supabase = createClient()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const [myId, setMyId] = useState<string | null>(null)
  const [conversations, setConversations] = useState<ConversationWithProfile[]>([])
  const [selectedConv, setSelectedConv] = useState<ConversationWithProfile | null>(null)
  const [messages, setMessages] = useState<MessageWithSender[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [loadingConvs, setLoadingConvs] = useState(true)
  const [loadingMsgs, setLoadingMsgs] = useState(false)

  // Counsellor browse for new conversation
  const [showBrowse, setShowBrowse] = useState(false)
  const [counsellors, setCounsellors] = useState<Profile[]>([])

  // ── Get current user ────────────────────────────────────────────────────────

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setMyId(session.user.id)
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Load conversations ──────────────────────────────────────────────────────

  useEffect(() => {
    if (!myId) return
    const load = async () => {
      setLoadingConvs(true)
      const { data } = await supabase
        .from('conversations')
        .select('*, counsellor:profiles!conversations_counsellor_id_fkey(*)')
        .eq('student_id', myId)
        .order('created_at', { ascending: false })

      setConversations((data as ConversationWithProfile[]) ?? [])
      setLoadingConvs(false)
    }
    load()
  }, [myId]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Load messages for selected conversation ─────────────────────────────────

  useEffect(() => {
    if (!selectedConv) return
    setMessages([])
    setLoadingMsgs(true)

    const load = async () => {
      const { data } = await supabase
        .from('messages')
        .select('*, sender:profiles!messages_sender_id_fkey(*)')
        .eq('conversation_id', selectedConv.id)
        .order('created_at', { ascending: true })

      setMessages((data as MessageWithSender[]) ?? [])
      setLoadingMsgs(false)
    }
    load()

    // Real-time subscription
    const channel = supabase
      .channel(`student-msgs-${selectedConv.id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${selectedConv.id}` },
        async (payload) => {
          // Fetch with sender profile
          const { data } = await supabase
            .from('messages')
            .select('*, sender:profiles!messages_sender_id_fkey(*)')
            .eq('id', payload.new.id)
            .single()
          if (data) setMessages(prev => [...prev, data as MessageWithSender])
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [selectedConv?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // ── Send message ────────────────────────────────────────────────────────────

  const sendMessage = async () => {
    if (!input.trim() || !selectedConv || !myId || sending) return
    setSending(true)
    const content = input.trim()
    setInput('')

    await supabase.from('messages').insert({
      conversation_id: selectedConv.id,
      sender_id: myId,
      content,
    })
    setSending(false)
  }

  // ── Start conversation with a counsellor ────────────────────────────────────

  const loadCounsellors = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'counsellor')
      .eq('is_available', true)
      .order('rating', { ascending: false })
    setCounsellors((data as Profile[]) ?? [])
    setShowBrowse(true)
  }

  const startConversation = async (counsellor: Profile) => {
    if (!myId) return

    // Find existing or create new
    const existing = conversations.find(c => c.counsellor_id === counsellor.id)
    if (existing) {
      setSelectedConv(existing)
      setShowBrowse(false)
      return
    }

    const { data } = await supabase
      .from('conversations')
      .insert({ student_id: myId, counsellor_id: counsellor.id })
      .select('*, counsellor:profiles!conversations_counsellor_id_fkey(*)')
      .single()

    if (data) {
      const newConv = data as ConversationWithProfile
      setConversations(prev => [newConv, ...prev])
      setSelectedConv(newConv)
    }
    setShowBrowse(false)
  }

  // ── Browse counsellors sheet ────────────────────────────────────────────────

  if (showBrowse) {
    return (
      <div className="p-4 max-w-lg mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => setShowBrowse(false)}
            className="text-gray-400 hover:text-white p-1 min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <ChevronLeft size={22} />
          </button>
          <div>
            <h2 className="text-white font-bold">Find a Counsellor</h2>
            <p className="text-gray-400 text-xs">Choose who you'd like to message</p>
          </div>
        </div>

        <div className="space-y-3">
          {counsellors.map(c => (
            <button
              key={c.id}
              onClick={() => startConversation(c)}
              className="w-full text-left p-4 rounded-xl bg-gray-900/50 border border-gray-800
                         hover:bg-gray-800/50 transition-colors min-h-[72px]"
            >
              <div className="flex items-center gap-3">
                <Avatar className="w-11 h-11 shrink-0">
                  <AvatarFallback className="bg-indigo-700 text-white">
                    {c.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium text-sm">{c.name}</p>
                  {c.specializations && (
                    <p className="text-gray-500 text-xs truncate">{c.specializations.join(', ')}</p>
                  )}
                  <p className="text-yellow-400 text-xs mt-0.5">★ {c.rating}</p>
                </div>
                <div className="shrink-0">
                  <div className="w-2 h-2 rounded-full bg-green-400" />
                </div>
              </div>
            </button>
          ))}
          {counsellors.length === 0 && (
            <p className="text-gray-500 text-center py-8 text-sm">No counsellors available right now</p>
          )}
        </div>
      </div>
    )
  }

  // ── Conversation list ───────────────────────────────────────────────────────

  if (!selectedConv) {
    return (
      <div className="p-4 max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-white">Messages</h1>
            <p className="text-gray-400 text-sm">Chat with your counsellors</p>
          </div>
          <Button
            onClick={loadCounsellors}
            size="sm"
            className="bg-purple-700 hover:bg-purple-600 gap-2"
          >
            <Plus size={16} />
            New Chat
          </Button>
        </div>

        {loadingConvs ? (
          <div className="space-y-3">
            {[1, 2].map(i => (
              <div key={i} className="h-16 rounded-xl bg-gray-900/50 animate-pulse" />
            ))}
          </div>
        ) : conversations.length === 0 ? (
          <div className="text-center py-16 space-y-4">
            <div className="text-5xl">💬</div>
            <p className="text-gray-400 text-sm">No conversations yet</p>
            <Button onClick={loadCounsellors} className="bg-purple-700 hover:bg-purple-600 gap-2">
              <Plus size={16} />
              Message a Counsellor
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {conversations.map(conv => (
              <button
                key={conv.id}
                onClick={() => setSelectedConv(conv)}
                className="w-full flex items-center gap-3 p-4 rounded-xl
                           bg-gray-900/50 border border-gray-800
                           hover:bg-gray-800/50 transition-colors text-left min-h-[72px]"
              >
                <Avatar className="w-11 h-11 shrink-0">
                  <AvatarFallback className="bg-indigo-700 text-white">
                    {conv.counsellor.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium text-sm">{conv.counsellor.name}</p>
                  <p className="text-gray-500 text-xs">Tap to open chat</p>
                </div>
                <span className="text-gray-600 text-lg shrink-0">›</span>
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }

  // ── Chat view ───────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-[calc(100dvh-3.5rem-4rem)] md:h-[calc(100dvh-2rem)] overflow-hidden">

      {/* Header */}
      <div className="shrink-0 p-3 border-b border-gray-800 bg-gray-900/30 flex items-center gap-3">
        <button
          onClick={() => setSelectedConv(null)}
          className="text-gray-400 hover:text-white p-1 -ml-1 min-h-[44px] min-w-[44px] flex items-center justify-center"
        >
          <ChevronLeft size={22} />
        </button>
        <Avatar className="w-9 h-9 shrink-0">
          <AvatarFallback className="bg-indigo-700 text-white">
            {selectedConv.counsellor.name.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-white font-semibold text-sm truncate">{selectedConv.counsellor.name}</p>
          <p className="text-green-400 text-xs">● Online</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto overscroll-contain p-4 space-y-4">
        {loadingMsgs ? (
          <div className="flex items-center justify-center h-full">
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
        ) : (
          <>
            {messages.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500 text-sm">Start the conversation — send a message below.</p>
              </div>
            )}
            <AnimatePresence initial={false}>
              {messages.map(msg => {
                const isMe = msg.sender_id === myId
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                  >
                    {!isMe && (
                      <Avatar className="w-7 h-7 mr-2 mt-1 shrink-0">
                        <AvatarFallback className="bg-indigo-700 text-white text-xs">
                          {msg.sender.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={`max-w-[78%] rounded-2xl px-4 py-3 ${
                        isMe
                          ? 'bg-gradient-to-br from-purple-600 to-indigo-600 text-white rounded-tr-sm'
                          : 'bg-gray-800/80 text-gray-100 rounded-tl-sm'
                      }`}
                    >
                      <p className="text-sm leading-relaxed">{msg.content}</p>
                      <p className={`text-[10px] mt-1 ${isMe ? 'text-purple-200' : 'text-gray-500'}`}>
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
      <div className="shrink-0 px-3 py-3 border-t border-gray-800 bg-gray-950/90 backdrop-blur-xl safe-area-bottom">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            placeholder="Message your counsellor…"
            className="flex-1 bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500
                       focus:border-purple-500 min-h-[44px] text-base"
            disabled={sending}
            autoComplete="off"
          />
          <Button
            onClick={sendMessage}
            disabled={!input.trim() || sending}
            className="bg-purple-600 hover:bg-purple-700 text-white min-h-[44px] min-w-[44px] px-3"
          >
            <Send size={18} />
          </Button>
        </div>
      </div>
    </div>
  )
}
