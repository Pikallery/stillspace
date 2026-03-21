'use client'
// Diary routes intentionally do not call Claude API to preserve privacy and user trust
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { PageTransition } from '@/components/ui/page-transition'
import { format } from 'date-fns'
import { BookOpen, Plus, ChevronLeft, Save } from 'lucide-react'

const themes = [
  { id: 'gradient-1', label: 'Purple Dream', class: 'from-purple-900 to-indigo-900', preview: 'bg-gradient-to-br from-purple-500 to-indigo-600' },
  { id: 'gradient-2', label: 'Sunset Rose', class: 'from-rose-900 to-orange-900', preview: 'bg-gradient-to-br from-rose-500 to-orange-600' },
  { id: 'gradient-3', label: 'Ocean Teal', class: 'from-teal-900 to-cyan-900', preview: 'bg-gradient-to-br from-teal-500 to-cyan-600' },
  { id: 'gradient-4', label: 'Emerald Forest', class: 'from-emerald-900 to-green-900', preview: 'bg-gradient-to-br from-emerald-500 to-green-600' },
]

interface DiaryEntry {
  id: string
  content: string
  theme: string
  date: string
  preview: string
}

export default function DiaryPage() {
  const [entries, setEntries] = useState<DiaryEntry[]>([])
  const [content, setContent] = useState('')
  const [selectedTheme, setSelectedTheme] = useState('gradient-1')
  const [view, setView] = useState<'list' | 'write' | 'read'>('list')
  const [selectedEntry, setSelectedEntry] = useState<DiaryEntry | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('diary_entries')
    if (stored) {
      try {
        setEntries(JSON.parse(stored))
      } catch {}
    }
  }, [])

  const saveEntry = async () => {
    if (!content.trim()) return
    setSaving(true)

    const entry: DiaryEntry = {
      id: Date.now().toString(),
      content,
      theme: selectedTheme,
      date: new Date().toISOString(),
      preview: content.substring(0, 100) + (content.length > 100 ? '...' : '')
    }

    const newEntries = [entry, ...entries]
    setEntries(newEntries)
    localStorage.setItem('diary_entries', JSON.stringify(newEntries))

    await new Promise(r => setTimeout(r, 500))
    setSaving(false)
    setSaved(true)
    setTimeout(() => {
      setSaved(false)
      setContent('')
      setView('list')
    }, 1000)
  }

  const currentTheme = themes.find(t => t.id === selectedTheme) || themes[0]

  return (
    <PageTransition>
      <div className="min-h-screen">
        <AnimatePresence mode="wait">
          {view === 'list' && (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-6 max-w-3xl mx-auto space-y-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-white">My Diary</h1>
                  <p className="text-gray-400 text-sm mt-1">Your private thoughts, safe and secure</p>
                </div>
                <Button
                  onClick={() => setView('write')}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  <Plus size={18} className="mr-2" />
                  New Entry
                </Button>
              </div>

              {entries.length === 0 ? (
                <div className="text-center py-20">
                  <BookOpen size={48} className="text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg">Your diary is empty</p>
                  <p className="text-gray-500 text-sm mt-1">Start writing your thoughts today</p>
                  <Button
                    onClick={() => setView('write')}
                    className="mt-4 bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    Write First Entry
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {entries.map((entry, i) => {
                    const theme = themes.find(t => t.id === entry.theme) || themes[0]
                    return (
                      <motion.div
                        key={entry.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                      >
                        <button
                          onClick={() => { setSelectedEntry(entry); setView('read') }}
                          className="w-full text-left"
                        >
                          <Card className={`bg-gradient-to-r ${theme.class} border-none hover:opacity-90 transition-opacity`}>
                            <CardContent className="pt-4 pb-4">
                              <p className="text-white/60 text-xs mb-1">
                                {format(new Date(entry.date), 'MMMM d, yyyy • h:mm a')}
                              </p>
                              <p className="text-white text-sm line-clamp-2">{entry.preview}</p>
                            </CardContent>
                          </Card>
                        </button>
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </motion.div>
          )}

          {view === 'write' && (
            <motion.div
              key="write"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className={`min-h-screen bg-gradient-to-br ${currentTheme.class} p-6`}
            >
              <div className="max-w-2xl mx-auto">
                <div className="flex items-center gap-3 mb-6">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setView('list')}
                    className="text-white/60 hover:text-white hover:bg-white/10"
                  >
                    <ChevronLeft size={18} />
                    Back
                  </Button>
                  <p className="text-white/60 text-sm">{format(new Date(), 'MMMM d, yyyy')}</p>
                </div>

                {/* Theme Selector */}
                <div className="flex gap-2 mb-6">
                  {themes.map(theme => (
                    <button
                      key={theme.id}
                      onClick={() => setSelectedTheme(theme.id)}
                      className={`w-8 h-8 rounded-full ${theme.preview} border-2 transition-all ${selectedTheme === theme.id ? 'border-white scale-110' : 'border-transparent scale-100'}`}
                      title={theme.label}
                    />
                  ))}
                </div>

                <Textarea
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder="Write your thoughts here... This is your safe space. No one else will see this."
                  className="w-full min-h-[60vh] bg-white/10 border-white/20 text-white placeholder:text-white/40 resize-none text-base leading-relaxed focus:border-white/40 backdrop-blur-sm"
                  autoFocus
                />

                <div className="flex justify-between items-center mt-4">
                  <p className="text-white/40 text-sm">{content.length} characters</p>
                  <Button
                    onClick={saveEntry}
                    disabled={!content.trim() || saving}
                    className="bg-white/20 hover:bg-white/30 text-white border border-white/20 backdrop-blur-sm"
                  >
                    {saving ? (
                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }}>
                        <Save size={16} className="mr-2" />
                      </motion.div>
                    ) : saved ? (
                      '✓ Saved!'
                    ) : (
                      <>
                        <Save size={16} className="mr-2" />
                        Save Entry
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {view === 'read' && selectedEntry && (
            <motion.div
              key="read"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className={`min-h-screen bg-gradient-to-br ${themes.find(t => t.id === selectedEntry.theme)?.class || themes[0].class} p-6`}
            >
              <div className="max-w-2xl mx-auto">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => { setView('list'); setSelectedEntry(null) }}
                  className="mb-6 text-white/60 hover:text-white hover:bg-white/10"
                >
                  <ChevronLeft size={18} className="mr-1" />
                  Back to Diary
                </Button>
                <p className="text-white/60 text-sm mb-4">
                  {format(new Date(selectedEntry.date), 'MMMM d, yyyy • h:mm a')}
                </p>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                  <p className="text-white text-base leading-relaxed whitespace-pre-wrap">{selectedEntry.content}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  )
}
