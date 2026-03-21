'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { PageTransition } from '@/components/ui/page-transition'
import { mockStudents } from '@/lib/mock-data'
import { FileText, Save, Tag } from 'lucide-react'
import { format } from 'date-fns'

interface Note {
  id: string
  studentId: string
  studentName: string
  content: string
  category: string
  createdAt: string
}

const categories = ['General', 'Progress', 'Concern', 'Action Item', 'Follow-up']

const categoryColors: Record<string, string> = {
  'General': 'bg-gray-800 text-gray-300',
  'Progress': 'bg-green-900/50 text-green-300',
  'Concern': 'bg-red-900/50 text-red-300',
  'Action Item': 'bg-blue-900/50 text-blue-300',
  'Follow-up': 'bg-amber-900/50 text-amber-300',
}

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([
    { id: '1', studentId: '1', studentName: 'Sai', content: 'Student reports difficulty concentrating during exams. Suggested time-management techniques and mindfulness before tests.', category: 'Progress', createdAt: new Date(Date.now() - 86400000).toISOString() },
    { id: '2', studentId: '2', studentName: 'Jordan Lee', content: 'Significant improvement in mood since last session. Still experiencing sleep issues. Recommend sleep hygiene worksheet.', category: 'Progress', createdAt: new Date(Date.now() - 172800000).toISOString() },
    { id: '3', studentId: '3', studentName: 'Sam Rivera', content: 'Increased triage score to 8. Immediate follow-up required. Discussed crisis resources.', category: 'Concern', createdAt: new Date().toISOString() },
  ])
  const [selectedStudent, setSelectedStudent] = useState('')
  const handleStudentChange = (v: string | null) => { if (v !== null) setSelectedStudent(v) }
  const handleCategoryChange = (v: string | null) => { if (v !== null) setCategory(v) }
  const handleFilterChange = (v: string | null) => { if (v !== null) setFilterStudent(v) }
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('General')
  const [saving, setSaving] = useState(false)
  const [filterStudent, setFilterStudent] = useState('all')

  const saveNote = async () => {
    if (!content.trim() || !selectedStudent) return
    setSaving(true)
    await new Promise(r => setTimeout(r, 400))

    const student = mockStudents.find(s => s.id === selectedStudent)
    const note: Note = {
      id: Date.now().toString(),
      studentId: selectedStudent,
      studentName: student?.name || 'Unknown',
      content: content.trim(),
      category,
      createdAt: new Date().toISOString()
    }
    setNotes(prev => [note, ...prev])
    setContent('')
    setSaving(false)
  }

  const filteredNotes = filterStudent === 'all'
    ? notes
    : notes.filter(n => n.studentId === filterStudent)

  return (
    <PageTransition>
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Session Notes</h1>
          <p className="text-gray-400 text-sm mt-1">Keep detailed notes about each student</p>
        </div>

        {/* Add Note Form */}
        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white text-lg flex items-center gap-2">
              <FileText size={18} />
              New Note
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-gray-400 text-sm mb-1 block">Student</label>
                <Select value={selectedStudent} onValueChange={handleStudentChange}>
                  <SelectTrigger className="bg-gray-800/50 border-gray-700 text-white">
                    <SelectValue placeholder="Select student..." />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    {mockStudents.map(s => (
                      <SelectItem key={s.id} value={s.id} className="text-white">
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-gray-400 text-sm mb-1 block">Category</label>
                <Select value={category} onValueChange={handleCategoryChange}>
                  <SelectTrigger className="bg-gray-800/50 border-gray-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    {categories.map(c => (
                      <SelectItem key={c} value={c} className="text-white">{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Write your session notes here..."
              className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 min-h-[120px] resize-none"
            />
            <Button
              onClick={saveNote}
              disabled={!content.trim() || !selectedStudent || saving}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {saving ? (
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }}>
                  <Save size={16} className="mr-2" />
                </motion.div>
              ) : (
                <Save size={16} className="mr-2" />
              )}
              {saving ? 'Saving...' : 'Save Note'}
            </Button>
          </CardContent>
        </Card>

        {/* Filter */}
        <div className="flex items-center gap-3">
          <Tag size={16} className="text-gray-500" />
          <Select value={filterStudent} onValueChange={handleFilterChange}>
            <SelectTrigger className="w-48 bg-gray-800/50 border-gray-700 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              <SelectItem value="all" className="text-white">All Students</SelectItem>
              {mockStudents.map(s => (
                <SelectItem key={s.id} value={s.id} className="text-white">{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Notes List */}
        <div className="space-y-3">
          <AnimatePresence>
            {filteredNotes.map((note, i) => (
              <motion.div
                key={note.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="bg-gray-900/50 border-gray-800">
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-medium text-sm">{note.studentName}</span>
                        <Badge className={`text-xs ${categoryColors[note.category]}`}>
                          {note.category}
                        </Badge>
                      </div>
                      <p className="text-gray-500 text-xs">
                        {format(new Date(note.createdAt), 'MMM d, yyyy • h:mm a')}
                      </p>
                    </div>
                    <p className="text-gray-300 text-sm leading-relaxed">{note.content}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
          {filteredNotes.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-400">No notes found</p>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  )
}
