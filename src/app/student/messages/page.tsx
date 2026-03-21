'use client'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Send, ChevronLeft, Plus, Star, X } from 'lucide-react'
import { createClient, type Profile, type DbMessage, type Conversation } from '@/lib/supabase'
import { useCall, CallOverlay, CallButton } from '@/components/ui/call-overlay'
import { encryptMessage, decryptMessage } from '@/lib/crypto'

// ── Types ─────────────────────────────────────────────────────────────────────

interface ConversationWithProfile extends Conversation {
  counsellor: Profile
}

interface MessageWithSender extends DbMessage {
  sender: Profile
}

// ── Feedback constants ────────────────────────────────────────────────────────

const FEEDBACK_TAGS = [
  'Listened well', 'Very helpful', 'Felt understood', 'Great advice',
  'Safe space', 'Non-judgmental', 'Practical tips', 'Needs improvement',
]

// ── Feedback modal ────────────────────────────────────────────────────────────

function FeedbackModal({
  conv,
  myId,
  onClose,
}: {
  conv: ConversationWithProfile
  myId: string
  onClose: () => void
}) {
  const [rating, setRating] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const toggleTag = (tag: string) =>
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])

  const submit = async () => {
    if (rating === 0) return
    setSubmitting(true)
    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: myId,
          counsellor_id: conv.counsellor_id,
          conversation_id: conv.id,
          rating,
          comment: comment.trim() || null,
          tags: selectedTags,
        }),
      })
      setSubmitted(true)
      setTimeout(onClose, 1800)
    } finally {
      setSubmitting(false)
    }
  }

  const starLabel = ['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent']

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-5"
      >
        {submitted ? (
          <div className="text-center py-4 space-y-3">
            <div className="text-5xl">🙏</div>
            <p className="text-white font-semibold text-lg">Thank you!</p>
            <p className="text-gray-400 text-sm">Your feedback helps improve counsellor quality.</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white font-semibold">Rate Your Session</h3>
                <p className="text-gray-400 text-sm">with {conv.counsellor.name}</p>
              </div>
              <button onClick={onClose} className="text-gray-500 hover:text-white p-1">
                <X size={20} />
              </button>
            </div>

            {/* Stars */}
            <div className="flex flex-col items-center gap-2">
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(i => (
                  <button
                    key={i}
                    onMouseEnter={() => setHovered(i)}
                    onMouseLeave={() => setHovered(0)}
                    onClick={() => setRating(i)}
                    className="transition-transform active:scale-90"
                  >
                    <Star
                      size={36}
                      className={`transition-colors ${
                        i <= (hovered || rating)
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-gray-700'
                      }`}
                    />
                  </button>
                ))}
              </div>
              <p className="text-amber-400 text-sm font-medium h-5">
                {starLabel[hovered || rating]}
              </p>
            </div>

            {/* Quick tags */}
            <div>
              <p className="text-gray-400 text-xs mb-2">What stood out? (optional)</p>
              <div className="flex flex-wrap gap-2">
                {FEEDBACK_TAGS.map(tag => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                      selectedTags.includes(tag)
                        ? 'bg-purple-700/60 border-purple-500 text-white'
                        : 'bg-gray-800/60 border-gray-700 text-gray-400 hover:border-gray-500 hover:text-gray-200'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Comment */}
            <div>
              <p className="text-gray-400 text-xs mb-1.5">Additional comments (optional)</p>
              <textarea
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="Share your thoughts…"
                rows={3}
                className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-purple-500 resize-none"
              />
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1 border-gray-700 text-gray-400"
              >
                Skip
              </Button>
              <Button
                onClick={submit}
                disabled={rating === 0 || submitting}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
              >
                {submitting ? 'Sending…' : 'Submit'}
              </Button>
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function StudentMessagesPage() {
  const supabase = createClient()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const convKeyRef = useRef<string | null>(null)

  const [myId, setMyId] = useState<string | null>(null)
  const [conversations, setConversations] = useState<ConversationWithProfile[]>([])
  const [selectedConv, setSelectedConv] = useState<ConversationWithProfile | null>(null)
  const [messages, setMessages] = useState<MessageWithSender[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [loadingConvs, setLoadingConvs] = useState(true)
  const [loadingMsgs, setLoadingMsgs] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)

  // Counsellor browse for new conversation
  const [showBrowse, setShowBrowse] = useState(false)
  const [counsellors, setCounsellors] = useState<Profile[]>([])

  const call = useCall({
    myId: myId ?? '',
    targetId: selectedConv?.counsellor_id ?? '',
    targetName: selectedConv?.counsellor.name ?? 'Counsellor',
  })

  // ── Get current user ────────────────────────────────────────────────────────

  useEffect(() => {
    ;(async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) setMyId(session.user.id)
    })()
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
    convKeyRef.current = null

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
      .channel(`student-msgs-${selectedConv.id}`)
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
    const existing = conversations.find(c => c.counsellor_id === counsellor.id)
    if (existing) { setSelectedConv(existing); setShowBrowse(false); return }

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
            <p className="text-gray-400 text-xs">Choose who you&apos;d like to message</p>
          </div>
        </div>

        <div className="space-y-3">
          {counsellors.map(c => (
            <button
              key={c.id}
              onClick={() => startConversation(c)}
              className="w-full text-left p-4 rounded-xl bg-gray-900/50 border border-gray-800 hover:bg-gray-800/50 transition-colors min-h-[72px]"
            >
              <div className="flex items-center gap-3">
                <Avatar className="w-11 h-11 shrink-0">
                  <AvatarFallback className="bg-indigo-700 text-white">{c.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium text-sm">{c.name}</p>
                  {c.specializations && (
                    <p className="text-gray-500 text-xs truncate">{c.specializations.join(', ')}</p>
                  )}
                  <p className="text-yellow-400 text-xs mt-0.5">★ {c.rating}</p>
                </div>
                <div className="w-2 h-2 rounded-full bg-green-400 shrink-0" />
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
          <Button onClick={loadCounsellors} size="sm" className="bg-purple-700 hover:bg-purple-600 gap-2">
            <Plus size={16} />
            New Chat
          </Button>
        </div>

        {loadingConvs ? (
          <div className="space-y-3">
            {[1, 2].map(i => <div key={i} className="h-16 rounded-xl bg-gray-900/50 animate-pulse" />)}
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
                className="w-full flex items-center gap-3 p-4 rounded-xl bg-gray-900/50 border border-gray-800 hover:bg-gray-800/50 transition-colors text-left min-h-[72px]"
              >
                <Avatar className="w-11 h-11 shrink-0">
                  <AvatarFallback className="bg-indigo-700 text-white">{conv.counsellor.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium text-sm">{conv.counsellor.name}</p>
                  {conv.counsellor.rating && (
                    <p className="text-amber-400 text-xs">★ {conv.counsellor.rating}</p>
                  )}
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
          <AvatarFallback className="bg-indigo-700 text-white">{selectedConv.counsellor.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-white font-semibold text-sm truncate">{selectedConv.counsellor.name}</p>
          <p className="text-green-400 text-xs">● Online</p>
        </div>
        {/* Rate session button */}
        <button
          onClick={() => setShowFeedback(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-amber-600/40 bg-amber-950/30 text-amber-400 text-xs hover:bg-amber-900/40 transition-colors"
        >
          <Star size={12} className="fill-amber-400" />
          Rate
        </button>
        <CallButton onClick={call.makeCall} disabled={call.status !== 'idle'} ready={call.deviceReady} />
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
              <div className="text-center py-8 space-y-3">
                <p className="text-gray-500 text-sm">Start the conversation — send a message below.</p>
                <button
                  onClick={() => setShowFeedback(true)}
                  className="text-amber-500 text-xs underline underline-offset-2"
                >
                  Already had a session? Leave a review ★
                </button>
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
                    <div className={`max-w-[78%] rounded-2xl px-4 py-3 ${
                      isMe
                        ? 'bg-gradient-to-br from-purple-600 to-indigo-600 text-white rounded-tr-sm'
                        : 'bg-gray-800/80 text-gray-100 rounded-tl-sm'
                    }`}>
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
            className="flex-1 bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-purple-500 min-h-[44px] text-base"
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

      <CallOverlay {...call} />

      {/* Feedback modal */}
      <AnimatePresence>
        {showFeedback && myId && (
          <FeedbackModal
            conv={selectedConv}
            myId={myId}
            onClose={() => setShowFeedback(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
