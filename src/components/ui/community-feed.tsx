'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Heart, MessageCircle, Send, ChevronDown, ChevronUp, ShieldCheck } from 'lucide-react'
import { type CommunityPost, initialCommunityPosts } from '@/lib/mock-data'

// ── Props ─────────────────────────────────────────────────────────────────────

interface CommunityFeedProps {
  userName: string
  userRole: 'student' | 'counsellor'
  accentColor: 'purple' | 'indigo'
  canPostAnonymous?: boolean
}

// ── Post card ─────────────────────────────────────────────────────────────────

function PostCard({
  post,
  accentColor,
  onLike,
  onToggleComments,
  onAddComment,
  commentValue,
  onCommentChange,
}: {
  post: CommunityPost
  accentColor: 'purple' | 'indigo'
  onLike: () => void
  onToggleComments: () => void
  onAddComment: () => void
  commentValue: string
  onCommentChange: (v: string) => void
}) {
  const avatarBg = post.isAnonymous
    ? 'bg-gray-700'
    : post.role === 'counsellor'
    ? 'bg-indigo-700'
    : accentColor === 'purple' ? 'bg-purple-700' : 'bg-indigo-600'

  const commentAvatarBg = (role: 'student' | 'counsellor') =>
    role === 'counsellor' ? 'bg-indigo-700' : accentColor === 'purple' ? 'bg-purple-700' : 'bg-indigo-600'

  const accentBtn = accentColor === 'purple'
    ? 'bg-purple-600 hover:bg-purple-700'
    : 'bg-indigo-600 hover:bg-indigo-700'
  const accentFocus = accentColor === 'purple' ? 'focus:border-purple-500' : 'focus:border-indigo-500'

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} layout>
      <Card className="bg-gray-900/50 border-gray-800">
        <CardContent className="pt-4">
          {/* Header */}
          <div className="flex items-start gap-3 mb-3">
            <Avatar className="w-9 h-9 shrink-0">
              <AvatarFallback className={`text-sm text-white ${avatarBg}`}>
                {post.isAnonymous ? '?' : post.author.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-white text-sm font-medium">{post.author}</p>
                {post.role === 'counsellor' && (
                  <Badge className="bg-indigo-900/60 text-indigo-300 border-indigo-700/50 text-[9px] px-1.5 py-0 flex items-center gap-0.5">
                    <ShieldCheck size={9} />
                    Counsellor
                  </Badge>
                )}
                {post.isAnonymous && (
                  <Badge variant="secondary" className="text-[9px] bg-gray-800 text-gray-400 px-1.5 py-0">
                    Anonymous
                  </Badge>
                )}
              </div>
              <p className="text-gray-500 text-xs">{post.timestamp}</p>
            </div>
          </div>

          {/* Content */}
          <p className="text-gray-200 text-sm leading-relaxed mb-4 whitespace-pre-line">{post.content}</p>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <motion.button
              whileTap={{ scale: 0.8 }}
              onClick={onLike}
              className={`flex items-center gap-1.5 text-sm transition-colors ${post.liked ? 'text-red-400' : 'text-gray-400 hover:text-red-400'}`}
            >
              <motion.div animate={post.liked ? { scale: [1, 1.3, 1] } : {}}>
                <Heart size={16} className={post.liked ? 'fill-red-400' : ''} />
              </motion.div>
              {post.likes}
            </motion.button>
            <button
              onClick={onToggleComments}
              className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors"
            >
              <MessageCircle size={16} />
              {post.comments.length}
              {post.showComments ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>

          {/* Comments */}
          <AnimatePresence>
            {post.showComments && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 space-y-3 overflow-hidden"
              >
                {post.comments.map(comment => (
                  <div key={comment.id} className="flex gap-2 p-2.5 bg-gray-800/40 rounded-lg">
                    <Avatar className="w-7 h-7 shrink-0">
                      <AvatarFallback className={`text-xs text-white ${commentAvatarBg(comment.role)}`}>
                        {comment.author.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="text-gray-300 text-xs font-medium">{comment.author}</p>
                        {comment.role === 'counsellor' && (
                          <Badge className="bg-indigo-900/50 text-indigo-400 border-indigo-800/40 text-[8px] px-1 py-0">
                            Counsellor
                          </Badge>
                        )}
                      </div>
                      <p className="text-gray-400 text-xs leading-relaxed">{comment.content}</p>
                    </div>
                  </div>
                ))}
                <div className="flex gap-2 mt-2">
                  <input
                    value={commentValue}
                    onChange={e => onCommentChange(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && onAddComment()}
                    placeholder="Add a supportive comment…"
                    className={`flex-1 bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-white placeholder:text-gray-500 focus:outline-none ${accentFocus}`}
                  />
                  <Button size="sm" onClick={onAddComment} className={`${accentBtn} text-white px-3`}>
                    <Send size={14} />
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export function CommunityFeed({ userName, userRole, accentColor, canPostAnonymous = true }: CommunityFeedProps) {
  const [posts, setPosts] = useState<CommunityPost[]>(initialCommunityPosts)
  const [newPost, setNewPost] = useState('')
  const [posting, setPosting] = useState(false)
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({})

  const accentBtn = accentColor === 'purple'
    ? 'bg-purple-600 hover:bg-purple-700'
    : 'bg-indigo-600 hover:bg-indigo-700'
  const accentBorder = accentColor === 'purple' ? 'data-[state=active]:bg-purple-600' : 'data-[state=active]:bg-indigo-600'

  const handlePost = async (type: 'public' | 'anonymous') => {
    if (!newPost.trim()) return
    setPosting(true)
    const anonymous = type === 'anonymous'
    await new Promise(r => setTimeout(r, 400))
    const post: CommunityPost = {
      id: Date.now().toString(),
      author: anonymous ? 'Anonymous' : userName,
      role: userRole,
      content: newPost,
      isAnonymous: anonymous,
      likes: 0,
      liked: false,
      comments: [],
      showComments: false,
      timestamp: 'Just now',
    }
    setPosts(prev => [post, ...prev])
    setNewPost('')
    setPosting(false)
  }

  const toggleLike = (id: string) =>
    setPosts(prev => prev.map(p =>
      p.id === id ? { ...p, likes: p.liked ? p.likes - 1 : p.likes + 1, liked: !p.liked } : p
    ))

  const toggleComments = (id: string) =>
    setPosts(prev => prev.map(p => p.id === id ? { ...p, showComments: !p.showComments } : p))

  const addComment = (postId: string) => {
    const content = commentInputs[postId]?.trim()
    if (!content) return
    setPosts(prev => prev.map(p =>
      p.id === postId
        ? { ...p, comments: [...p.comments, { id: Date.now().toString(), author: userName, role: userRole, content }] }
        : p
    ))
    setCommentInputs(prev => ({ ...prev, [postId]: '' }))
  }

  const PostCardWrapper = ({ post }: { post: CommunityPost }) => (
    <PostCard
      post={post}
      accentColor={accentColor}
      onLike={() => toggleLike(post.id)}
      onToggleComments={() => toggleComments(post.id)}
      onAddComment={() => addComment(post.id)}
      commentValue={commentInputs[post.id] || ''}
      onCommentChange={v => setCommentInputs(prev => ({ ...prev, [post.id]: v }))}
    />
  )

  const PostCreator = ({ mode }: { mode: 'public' | 'anonymous' }) => (
    <Card className="bg-gray-900/50 border-gray-800">
      <CardContent className="pt-4">
        {mode === 'anonymous' && (
          <div className="flex items-center gap-2 mb-3">
            <Badge className="bg-gray-700 text-gray-300 text-xs">Anonymous Mode</Badge>
            <p className="text-gray-500 text-xs">Your name won&apos;t appear</p>
          </div>
        )}
        <Textarea
          value={newPost}
          onChange={e => setNewPost(e.target.value)}
          placeholder={mode === 'anonymous' ? 'Share anonymously…' : userRole === 'counsellor' ? 'Share a tip, quote, or insight with the community…' : 'Share something with the community…'}
          className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 resize-none mb-3"
          rows={3}
        />
        <Button
          onClick={() => handlePost(mode)}
          disabled={!newPost.trim() || posting}
          className={`${mode === 'anonymous' ? 'bg-gray-600 hover:bg-gray-700' : accentBtn} text-white`}
        >
          {posting ? 'Posting…' : mode === 'anonymous' ? 'Post Anonymously' : 'Post Publicly'}
        </Button>
      </CardContent>
    </Card>
  )

  if (!canPostAnonymous) {
    // Counsellor view — single feed, no tabs, no anonymous posting
    return (
      <div className="space-y-4">
        <PostCreator mode="public" />
        {posts.map(post => <PostCardWrapper key={post.id} post={post} />)}
      </div>
    )
  }

  // Student view — tabbed (public / anonymous)
  return (
    <Tabs defaultValue="public" className="w-full">
      <TabsList className="bg-gray-800/50 border border-gray-700">
        <TabsTrigger value="public" className={`${accentBorder} data-[state=active]:text-white text-gray-400`}>
          Public
        </TabsTrigger>
        <TabsTrigger value="anonymous" className="data-[state=active]:bg-gray-600 data-[state=active]:text-white text-gray-400">
          Anonymous
        </TabsTrigger>
      </TabsList>

      <TabsContent value="public" className="space-y-4 mt-4">
        <PostCreator mode="public" />
        {posts.filter(p => !p.isAnonymous).map(post => <PostCardWrapper key={post.id} post={post} />)}
      </TabsContent>

      <TabsContent value="anonymous" className="space-y-4 mt-4">
        <PostCreator mode="anonymous" />
        {posts.filter(p => p.isAnonymous).map(post => <PostCardWrapper key={post.id} post={post} />)}
        {posts.filter(p => p.isAnonymous).length === 0 && (
          <div className="text-center py-12">
            <p className="text-4xl mb-3">🤫</p>
            <p className="text-gray-400">No anonymous posts yet. Be the first!</p>
          </div>
        )}
      </TabsContent>
    </Tabs>
  )
}
