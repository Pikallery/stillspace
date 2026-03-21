'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PageTransition } from '@/components/ui/page-transition'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval,
  startOfWeek, endOfWeek, isSameMonth, isSameDay, isToday
} from 'date-fns'

interface CalendarEvent {
  id: string
  title: string
  type: 'session' | 'personal' | 'admin'
  date: string
}

const initialEvents: CalendarEvent[] = [
  { id: '1', title: 'Session: Sai', type: 'session', date: '2026-03-24' },
  { id: '2', title: 'Session: Jordan Lee', type: 'session', date: '2026-03-25' },
  { id: '3', title: 'Staff Meeting', type: 'admin', date: '2026-03-26' },
  { id: '4', title: 'Session: Sam Rivera', type: 'session', date: '2026-03-28' },
  { id: '5', title: 'Personal — Doctor', type: 'personal', date: '2026-03-29' },
]

const eventColors = {
  session: { bg: 'bg-blue-500/80', dot: 'bg-blue-400', label: 'Student Sessions' },
  personal: { bg: 'bg-green-500/80', dot: 'bg-green-400', label: 'Personal' },
  admin: { bg: 'bg-purple-500/80', dot: 'bg-purple-400', label: 'Admin' },
}

export default function CounsellorCalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [events, setEvents] = useState<CalendarEvent[]>(initialEvents)
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [newTitle, setNewTitle] = useState('')
  const [newType, setNewType] = useState<'session' | 'personal' | 'admin'>('session')

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const calStart = startOfWeek(monthStart)
  const calEnd = endOfWeek(monthEnd)
  const days = eachDayOfInterval({ start: calStart, end: calEnd })

  const getEventsForDay = (day: Date) =>
    events.filter(e => isSameDay(new Date(e.date), day))

  const addEvent = () => {
    if (!newTitle.trim() || !selectedDate) return
    const event: CalendarEvent = {
      id: Date.now().toString(),
      title: newTitle,
      type: newType,
      date: format(selectedDate, 'yyyy-MM-dd')
    }
    setEvents(prev => [...prev, event])
    setNewTitle('')
    setShowAddModal(false)
  }

  return (
    <PageTransition>
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Calendar</h1>
            <p className="text-gray-400 text-sm mt-1">Manage sessions and personal events</p>
          </div>
          <div className="flex gap-2">
            {Object.entries(eventColors).map(([type, colors]) => (
              <div key={type} className="flex items-center gap-1">
                <div className={`w-2.5 h-2.5 rounded-full ${colors.dot}`} />
                <span className="text-gray-400 text-xs">{colors.label}</span>
              </div>
            ))}
          </div>
        </div>

        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))}
                className="text-gray-400 hover:text-white"
              >
                <ChevronLeft size={18} />
              </Button>
              <h2 className="text-white font-semibold text-lg">{format(currentDate, 'MMMM yyyy')}</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))}
                className="text-gray-400 hover:text-white"
              >
                <ChevronRight size={18} />
              </Button>
            </div>

            <div className="grid grid-cols-7 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-gray-500 text-xs font-medium py-2">{day}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {days.map(day => {
                const dayEvents = getEventsForDay(day)
                const inMonth = isSameMonth(day, currentDate)
                const today = isToday(day)

                return (
                  <motion.button
                    key={day.toISOString()}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => { setSelectedDate(day); setShowAddModal(true) }}
                    className={`relative p-2 min-h-[60px] rounded-lg text-left transition-colors ${
                      inMonth ? 'hover:bg-gray-800/60' : 'opacity-30'
                    } ${today ? 'bg-indigo-900/30 border border-indigo-600/40' : ''}`}
                  >
                    <span className={`text-xs font-medium ${today ? 'text-indigo-300' : inMonth ? 'text-gray-300' : 'text-gray-600'}`}>
                      {format(day, 'd')}
                    </span>
                    <div className="space-y-0.5 mt-1">
                      {dayEvents.slice(0, 2).map(event => (
                        <div
                          key={event.id}
                          className={`text-xs px-1 py-0.5 rounded truncate ${eventColors[event.type].bg} text-white`}
                        >
                          {event.title}
                        </div>
                      ))}
                      {dayEvents.length > 2 && (
                        <p className="text-gray-500 text-xs">+{dayEvents.length - 2}</p>
                      )}
                    </div>
                  </motion.button>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
          <DialogContent className="bg-gray-900 border-gray-700 text-white">
            <DialogHeader>
              <DialogTitle>Add Event {selectedDate && `— ${format(selectedDate, 'MMMM d, yyyy')}`}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-gray-400 text-sm mb-1 block">Title</label>
                <Input
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="e.g., Session: Student Name"
                  className="bg-gray-800/50 border-gray-700 text-white"
                  autoFocus
                />
              </div>
              <div>
                <label className="text-gray-400 text-sm mb-1 block">Type</label>
                <Select value={newType} onValueChange={(v) => setNewType(v as typeof newType)}>
                  <SelectTrigger className="bg-gray-800/50 border-gray-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="session" className="text-white">💬 Student Session</SelectItem>
                    <SelectItem value="personal" className="text-white">🌿 Personal</SelectItem>
                    <SelectItem value="admin" className="text-white">📋 Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={addEvent}
                disabled={!newTitle.trim()}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                <Plus size={16} className="mr-2" />
                Add Event
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </PageTransition>
  )
}
