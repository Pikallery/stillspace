'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { PageTransition } from '@/components/ui/page-transition'
import { Heart, MessageCircle, Send, ChevronDown, ChevronUp } from 'lucide-react'

interface Post {
  id: string
  author: string
  content: string
  isAnonymous: boolean
  likes: number
  liked: boolean
  comments: Comment[]
  showComments: boolean
  timestamp: string
}

interface Comment {
  id: string
  author: string
  content: string
}

const initialPosts: Post[] = [
  {
    id: '1',
    author: 'Jordan L.',
    content: 'Finals week is really getting to me. Anyone else feel like they\'re barely keeping it together? 😔',
    isAnonymous: false,
    likes: 12,
    liked: false,
    comments: [
      { id: 'c1', author: 'Sai', content: 'You\'re not alone! Try to take breaks and breathe. You got this! 💪' },
    ],
    showComments: false,
    timestamp: '2 hours ago'
  },
  {
    id: '2',
    author: 'Anonymous',
    content: 'I\'ve been using the breathing exercises and they actually help! 5 cycles before any stressful situation.',
    isAnonymous: true,
    likes: 24,
    liked: false,
    comments: [],
    showComments: false,
    timestamp: '5 hours ago'
  },
  {
    id: '3',
    author: 'Sam R.',
    content: 'Had my first session with the counsellor today. It was scary but I\'m really glad I went. Please don\'t be afraid to ask for help 🌸',
    isAnonymous: false,
    likes: 31,
    liked: false,
    comments: [
      { id: 'c2', author: 'Taylor K.', content: 'This is so brave of you to share. Thank you!' },
    ],
    showComments: false,
    timestamp: '1 day ago'
  },
]

export default function CommunityPage() {
  const [posts, setPosts] = useState<Post[]>(initialPosts)
  const [newPost, setNewPost] = useState('')
  const [posting, setPosting] = useState(false)
  const [userName, setUserName] = useState('Student')
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({})

  useEffect(() => {
    const name = localStorage.getItem('demo_name') || 'Student'
    setUserName(name)
  }, [])

  const handlePost = async (type: 'public' | 'anonymous') => {
    if (!newPost.trim()) return
    setPosting(true)
    const anonymous = type === 'anonymous'

    try {
      // Silently classify post
      fetch('/api/classify-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newPost })
      }).catch(() => {})
    } catch {}

    await new Promise(r => setTimeout(r, 500))

    const post: Post = {
      id: Date.now().toString(),
      author: anonymous ? 'Anonymous' : userName,
      content: newPost,
      isAnonymous: anonymous,
      likes: 0,
      liked: false,
      comments: [],
      showComments: false,
      timestamp: 'Just now'
    }

    setPosts(prev => [post, ...prev])
    setNewPost('')
    setPosting(false)
  }

  const toggleLike = (postId: string) => {
    setPosts(prev => prev.map(p =>
      p.id === postId
        ? { ...p, likes: p.liked ? p.likes - 1 : p.likes + 1, liked: !p.liked }
        : p
    ))
  }

  const toggleComments = (postId: string) => {
    setPosts(prev => prev.map(p =>
      p.id === postId ? { ...p, showComments: !p.showComments } : p
    ))
  }

  const addComment = (postId: string) => {
    const content = commentInputs[postId]?.trim()
    if (!content) return
    const comment: Comment = {
      id: Date.now().toString(),
      author: userName,
      content
    }
    setPosts(prev => prev.map(p =>
      p.id === postId ? { ...p, comments: [...p.comments, comment] } : p
    ))
    setCommentInputs(prev => ({ ...prev, [postId]: '' }))
  }

  const PostCard = ({ post }: { post: Post }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      layout
    >
      <Card className="bg-gray-900/50 border-gray-800">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3 mb-3">
            <Avatar className="w-9 h-9">
              <AvatarFallback className={`text-sm ${post.isAnonymous ? 'bg-gray-700 text-gray-400' : 'bg-purple-700 text-white'}`}>
                {post.isAnonymous ? '?' : post.author.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-white text-sm font-medium">{post.author}</p>
              <p className="text-gray-500 text-xs">{post.timestamp}</p>
            </div>
            {post.isAnonymous && (
              <Badge variant="secondary" className="ml-auto text-xs bg-gray-800 text-gray-400">Anonymous</Badge>
            )}
          </div>
          <p className="text-gray-200 text-sm leading-relaxed mb-4">{post.content}</p>
          <div className="flex items-center gap-4">
            <motion.button
              whileTap={{ scale: 0.8 }}
              onClick={() => toggleLike(post.id)}
              className={`flex items-center gap-1.5 text-sm transition-colors ${post.liked ? 'text-red-400' : 'text-gray-400 hover:text-red-400'}`}
            >
              <motion.div animate={post.liked ? { scale: [1, 1.3, 1] } : {}}>
                <Heart size={16} className={post.liked ? 'fill-red-400' : ''} />
              </motion.div>
              {post.likes}
            </motion.button>
            <button
              onClick={() => toggleComments(post.id)}
              className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors"
            >
              <MessageCircle size={16} />
              {post.comments.length}
              {post.showComments ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>

          <AnimatePresence>
            {post.showComments && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 space-y-3"
              >
                {post.comments.map(comment => (
                  <div key={comment.id} className="flex gap-2 p-2 bg-gray-800/40 rounded-lg">
                    <Avatar className="w-7 h-7">
                      <AvatarFallback className="text-xs bg-indigo-700 text-white">
                        {comment.author.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-gray-300 text-xs font-medium">{comment.author}</p>
                      <p className="text-gray-400 text-xs">{comment.content}</p>
                    </div>
                  </div>
                ))}
                <div className="flex gap-2 mt-2">
                  <input
                    value={commentInputs[post.id] || ''}
                    onChange={e => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                    onKeyDown={e => e.key === 'Enter' && addComment(post.id)}
                    placeholder="Add a supportive comment..."
                    className="flex-1 bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-purple-500"
                  />
                  <Button size="sm" onClick={() => addComment(post.id)} className="bg-purple-600 hover:bg-purple-700 text-white px-3">
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

  return (
    <PageTransition>
      <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Community</h1>
          <p className="text-gray-400 text-sm mt-1">Share, support, and connect with peers</p>
        </div>

        <Tabs defaultValue="public" className="w-full">
          <TabsList className="bg-gray-800/50 border border-gray-700">
            <TabsTrigger value="public" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-gray-400">
              Public
            </TabsTrigger>
            <TabsTrigger value="anonymous" className="data-[state=active]:bg-gray-600 data-[state=active]:text-white text-gray-400">
              Anonymous
            </TabsTrigger>
          </TabsList>

          <TabsContent value="public" className="space-y-4 mt-4">
            {/* Post Creator */}
            <Card className="bg-gray-900/50 border-gray-800">
              <CardContent className="pt-4">
                <Textarea
                  value={newPost}
                  onChange={e => setNewPost(e.target.value)}
                  placeholder="Share something with the community..."
                  className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 resize-none mb-3"
                  rows={3}
                />
                <Button
                  onClick={() => handlePost('public')}
                  disabled={!newPost.trim() || posting}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  {posting ? 'Posting...' : 'Post Publicly'}
                </Button>
              </CardContent>
            </Card>

            {posts.filter(p => !p.isAnonymous).map(post => (
              <PostCard key={post.id} post={post} />
            ))}
          </TabsContent>

          <TabsContent value="anonymous" className="space-y-4 mt-4">
            {/* Anonymous Post Creator */}
            <Card className="bg-gray-900/50 border-gray-800">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-3">
                  <Badge className="bg-gray-700 text-gray-300 text-xs">Anonymous Mode</Badge>
                  <p className="text-gray-500 text-xs">Your identity is hidden</p>
                </div>
                <Textarea
                  value={newPost}
                  onChange={e => setNewPost(e.target.value)}
                  placeholder="Share anonymously. Your name won't appear..."
                  className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 resize-none mb-3"
                  rows={3}
                />
                <Button
                  onClick={() => handlePost('anonymous')}
                  disabled={!newPost.trim() || posting}
                  className="bg-gray-600 hover:bg-gray-700 text-white"
                >
                  {posting ? 'Posting...' : 'Post Anonymously'}
                </Button>
              </CardContent>
            </Card>

            {posts.filter(p => p.isAnonymous).map(post => (
              <PostCard key={post.id} post={post} />
            ))}

            {posts.filter(p => p.isAnonymous).length === 0 && (
              <div className="text-center py-12">
                <p className="text-4xl mb-3">🤫</p>
                <p className="text-gray-400">No anonymous posts yet. Be the first!</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </PageTransition>
  )
}
