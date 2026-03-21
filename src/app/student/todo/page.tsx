'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { PageTransition } from '@/components/ui/page-transition'
import { Plus, CheckCircle2, Circle, Calendar, Trash2 } from 'lucide-react'
import { format } from 'date-fns'

interface TodoItem {
  id: string
  task: string
  isDone: boolean
  dueDate: string
  createdAt: string
}

type Filter = 'all' | 'active' | 'done'

export default function TodoPage() {
  const [todos, setTodos] = useState<TodoItem[]>([
    { id: '1', task: 'Complete psychology assignment', isDone: false, dueDate: '2026-03-25', createdAt: new Date().toISOString() },
    { id: '2', task: 'Attend counselling session', isDone: true, dueDate: '2026-03-21', createdAt: new Date().toISOString() },
    { id: '3', task: 'Practice breathing exercises', isDone: false, dueDate: '2026-03-22', createdAt: new Date().toISOString() },
  ])
  const [newTask, setNewTask] = useState('')
  const [newDate, setNewDate] = useState('')
  const [filter, setFilter] = useState<Filter>('all')

  useEffect(() => {
    const stored = localStorage.getItem('todo_items')
    if (stored) {
      try {
        setTodos(JSON.parse(stored))
      } catch {}
    }
  }, [])

  const saveTodos = (updated: TodoItem[]) => {
    setTodos(updated)
    localStorage.setItem('todo_items', JSON.stringify(updated))
  }

  const addTodo = () => {
    if (!newTask.trim()) return
    const todo: TodoItem = {
      id: Date.now().toString(),
      task: newTask.trim(),
      isDone: false,
      dueDate: newDate,
      createdAt: new Date().toISOString()
    }
    saveTodos([todo, ...todos])
    setNewTask('')
    setNewDate('')
  }

  const toggleTodo = (id: string) => {
    saveTodos(todos.map(t => t.id === id ? { ...t, isDone: !t.isDone } : t))
  }

  const deleteTodo = (id: string) => {
    saveTodos(todos.filter(t => t.id !== id))
  }

  const filteredTodos = todos.filter(t => {
    if (filter === 'active') return !t.isDone
    if (filter === 'done') return t.isDone
    return true
  })

  const activeCount = todos.filter(t => !t.isDone).length

  return (
    <PageTransition>
      <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">To-Do List</h1>
          <p className="text-gray-400 text-sm mt-1">
            {activeCount > 0 ? `${activeCount} task${activeCount !== 1 ? 's' : ''} remaining` : 'All tasks complete! 🎉'}
          </p>
        </div>

        {/* Add Task */}
        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="pt-4">
            <div className="flex gap-2 mb-3">
              <Input
                value={newTask}
                onChange={e => setNewTask(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addTodo()}
                placeholder="Add a new task..."
                className="flex-1 bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500"
              />
              <Button onClick={addTodo} disabled={!newTask.trim()} className="bg-purple-600 hover:bg-purple-700 text-white">
                <Plus size={18} />
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={14} className="text-gray-500" />
              <input
                type="date"
                value={newDate}
                onChange={e => setNewDate(e.target.value)}
                className="bg-gray-800/50 border border-gray-700 rounded-lg px-2 py-1 text-sm text-gray-300 focus:outline-none focus:border-purple-500"
              />
              <span className="text-gray-500 text-xs">Due date (optional)</span>
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <div className="flex gap-2">
          {(['all', 'active', 'done'] as Filter[]).map(f => (
            <Button
              key={f}
              variant={filter === f ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(f)}
              className={filter === f
                ? 'bg-purple-600 hover:bg-purple-700 text-white'
                : 'border-gray-700 text-gray-400 hover:text-white hover:bg-gray-800/50'
              }
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
              {f === 'all' && <Badge className="ml-2 bg-gray-700 text-gray-300 text-xs">{todos.length}</Badge>}
              {f === 'active' && <Badge className="ml-2 bg-gray-700 text-gray-300 text-xs">{activeCount}</Badge>}
              {f === 'done' && <Badge className="ml-2 bg-gray-700 text-gray-300 text-xs">{todos.length - activeCount}</Badge>}
            </Button>
          ))}
        </div>

        {/* Todo Items */}
        <div className="space-y-2">
          <AnimatePresence>
            {filteredTodos.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16"
              >
                <p className="text-4xl mb-3">{filter === 'done' ? '🎯' : '✨'}</p>
                <p className="text-gray-400">
                  {filter === 'done' ? 'No completed tasks yet' :
                   filter === 'active' ? 'No active tasks! Great job!' :
                   'Add your first task above'}
                </p>
              </motion.div>
            ) : (
              filteredTodos.map((todo) => (
                <motion.div
                  key={todo.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20, height: 0 }}
                  layout
                >
                  <Card className={`bg-gray-900/50 border-gray-800 transition-all ${todo.isDone ? 'opacity-60' : ''}`}>
                    <CardContent className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <motion.button
                          whileTap={{ scale: 0.8 }}
                          onClick={() => toggleTodo(todo.id)}
                          className="flex-shrink-0"
                        >
                          <AnimatePresence mode="wait">
                            {todo.isDone ? (
                              <motion.div
                                key="checked"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring' }}
                              >
                                <CheckCircle2 size={22} className="text-green-400 fill-green-400/20" />
                              </motion.div>
                            ) : (
                              <motion.div key="unchecked">
                                <Circle size={22} className="text-gray-600 hover:text-purple-400 transition-colors" />
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.button>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm ${todo.isDone ? 'line-through text-gray-500' : 'text-white'}`}>
                            {todo.task}
                          </p>
                          {todo.dueDate && (
                            <p className="text-gray-500 text-xs mt-0.5">
                              Due: {format(new Date(todo.dueDate), 'MMM d, yyyy')}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => deleteTodo(todo.id)}
                          className="text-gray-600 hover:text-red-400 transition-colors flex-shrink-0"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </PageTransition>
  )
}
