'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { PageTransition } from '@/components/ui/page-transition'
import { triageQuestions, mockCounsellors } from '@/lib/mock-data'
import { useRouter } from 'next/navigation'
import { Star, Phone, CheckCircle } from 'lucide-react'

type TriageResult = {
  score: number
  level: 'ai' | 'counsellor' | 'emergency'
  summary: string
}

export default function TriagePage() {
  const router = useRouter()
  const [currentQ, setCurrentQ] = useState(0)
  const [answers, setAnswers] = useState<number[]>([])
  const [direction, setDirection] = useState(1)
  const [result, setResult] = useState<TriageResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [connecting, setConnecting] = useState(false)

  const progress = (currentQ / triageQuestions.length) * 100

  const handleAnswer = async (optionIndex: number) => {
    const newAnswers = [...answers, optionIndex]
    setAnswers(newAnswers)
    setDirection(1)

    if (currentQ < triageQuestions.length - 1) {
      setCurrentQ(prev => prev + 1)
    } else {
      setLoading(true)
      try {
        const res = await fetch('/api/triage', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ answers: newAnswers }),
        })
        if (res.ok) {
          setResult(await res.json())
        } else {
          throw new Error('API error')
        }
      } catch {
        const total = newAnswers.reduce((a, b) => a + b, 0)
        const score = Math.min(10, Math.max(1, Math.round((total / newAnswers.length) * 2.5) + 1))
        const level = score <= 4 ? 'ai' : score <= 7 ? 'counsellor' : 'emergency'
        setResult({ score, level, summary: 'Assessment complete. Based on your responses, we have determined your support level.' })
      } finally {
        setLoading(false)
      }
    }
  }

  const handleBack = () => {
    if (currentQ > 0) {
      setDirection(-1)
      setCurrentQ(prev => prev - 1)
      setAnswers(prev => prev.slice(0, -1))
    }
  }

  // ── Loading state ──────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <motion.div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            className="w-14 h-14 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-white text-lg font-semibold">Analysing your responses…</p>
          <p className="text-gray-400 text-sm mt-1">This just takes a moment</p>
        </motion.div>
      </div>
    )
  }

  // ── Results ────────────────────────────────────────────────────
  if (result) {

    // Emergency
    if (result.level === 'emergency') {
      if (connecting) {
        return (
          <div className="min-h-screen flex items-center justify-center px-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center max-w-sm w-full"
            >
              <motion.div
                className="w-28 h-28 rounded-full bg-amber-500/20 border-4 border-amber-400
                           flex items-center justify-center mx-auto mb-6 emergency-pulse"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <span className="text-5xl">👩‍⚕️</span>
              </motion.div>
              <h2 className="text-2xl font-bold text-white mb-2">Connecting you to your counsellor…</h2>
              <p className="text-amber-300 mb-6 text-sm">Dr. Sarah Chen is available and will be with you shortly</p>
              <div className="flex gap-2 justify-center mb-6">
                {[0, 1, 2].map(i => (
                  <motion.div
                    key={i}
                    className="w-3 h-3 bg-amber-400 rounded-full"
                    animate={{ y: [-5, 5, -5] }}
                    transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2 }}
                  />
                ))}
              </div>
              <Button
                variant="outline"
                onClick={() => setConnecting(false)}
                className="border-gray-600 text-gray-300 min-h-[48px] px-8"
              >
                Cancel
              </Button>
            </motion.div>
          </div>
        )
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-lg w-full"
          >
            <Card className="border-amber-500/50 bg-amber-950/30 backdrop-blur-sm emergency-pulse">
              <CardContent className="pt-8 pb-8 text-center px-6">
                <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🤝</span>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">We Are Here For You</h2>
                <p className="text-amber-200 mb-2 text-lg">You are not alone in this journey</p>
                <p className="text-gray-300 text-sm mb-4">{result.summary}</p>
                <p className="text-amber-300 text-sm mb-6">
                  A counsellor is ready to support you right now. Please reach out — you deserve care.
                </p>
                <div className="space-y-3">
                  <Button
                    onClick={() => setConnecting(true)}
                    className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold min-h-[52px] text-base"
                  >
                    <Phone size={18} className="mr-2" />
                    Connect to Counsellor Now
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => router.push('/student/chat')}
                    className="w-full border-amber-600/50 text-amber-300 hover:bg-amber-900/20 min-h-[48px]"
                  >
                    Chat with AI Support First
                  </Button>
                </div>
                <p className="text-gray-400 text-xs mt-4">Crisis line: 988 (Suicide & Crisis Lifeline)</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )
    }

    // Counsellor level
    if (result.level === 'counsellor') {
      return (
        <PageTransition>
          <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-5">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="bg-indigo-900/30 border-indigo-700/40">
                <CardContent className="pt-6 pb-5 text-center px-5">
                  <span className="text-4xl mb-3 block">💙</span>
                  <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Connect with a Counsellor</h2>
                  <p className="text-indigo-200 text-sm">Score: {result.score}/10 — {result.summary}</p>
                  <p className="text-gray-300 text-sm mt-2">
                    We recommend speaking with one of our professional counsellors for personalised support.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <h3 className="text-white font-semibold">Available Counsellors</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {mockCounsellors.map((c, i) => (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className={`bg-gray-900/50 border-gray-800 ${!c.is_available ? 'opacity-60' : ''}`}>
                    <CardContent className="pt-5 pb-5">
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600
                                        flex items-center justify-center text-white font-bold text-lg shrink-0">
                          {c.name.charAt(4)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1 flex-wrap">
                            <h4 className="text-white font-semibold text-sm">{c.name}</h4>
                            <Badge className={c.is_available
                              ? 'bg-green-900/50 text-green-300 border-green-700/50 text-xs'
                              : 'bg-gray-800 text-gray-400 border-gray-700 text-xs'}>
                              {c.is_available ? 'Available' : 'Busy'}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-1 mb-2">
                            <Star size={12} className="text-amber-400 fill-amber-400" />
                            <span className="text-amber-300 text-sm font-medium">{c.rating}</span>
                          </div>
                          <div className="flex flex-wrap gap-1 mb-3">
                            {c.specializations.map(s => (
                              <Badge key={s} variant="secondary" className="text-xs bg-gray-800 text-gray-300">
                                {s}
                              </Badge>
                            ))}
                          </div>
                          <p className="text-gray-400 text-xs mb-3 line-clamp-2">{c.bio}</p>
                          <Button
                            size="sm"
                            disabled={!c.is_available}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm min-h-[44px]"
                          >
                            {c.is_available ? 'Connect Now' : 'Not Available'}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </PageTransition>
      )
    }

    // AI level
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full"
        >
          <Card className="bg-green-900/20 border-green-700/40">
            <CardContent className="pt-8 pb-8 text-center px-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.2 }}
              >
                <CheckCircle size={60} className="text-green-400 mx-auto mb-4" />
              </motion.div>
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">StillSpace AI is Here for You</h2>
              <p className="text-green-200 mb-2 font-medium">Score: {result.score}/10</p>
              <p className="text-gray-300 text-sm mb-4">{result.summary}</p>
              <p className="text-gray-300 text-sm mb-6">
                You are doing well! Our AI companion can help you navigate any challenges.
              </p>
              <div className="space-y-3">
                <Button
                  onClick={() => router.push('/student/chat')}
                  className="w-full bg-green-600 hover:bg-green-700 text-white min-h-[52px] text-base"
                >
                  Chat with AI Now
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push('/student/dashboard')}
                  className="w-full border-gray-700 text-gray-300 min-h-[48px]"
                >
                  Back to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  // ── Survey questions (full-screen card per question) ───────────
  const question = triageQuestions[currentQ]

  return (
    <div className="min-h-[calc(100dvh-3.5rem-4rem)] md:min-h-screen
                    flex flex-col px-4 pt-4 pb-6 sm:px-6 sm:pt-6">
      {/* Progress */}
      <div className="mb-6 shrink-0">
        <div className="flex justify-between text-xs text-gray-400 mb-2">
          <span>Question {currentQ + 1} of {triageQuestions.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2 bg-gray-800" />
      </div>

      {/* Question card — fills available vertical space */}
      <div className="flex-1 flex flex-col max-w-xl w-full mx-auto">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentQ}
            custom={direction}
            initial={{ opacity: 0, x: direction * 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -direction * 60 }}
            transition={{ duration: 0.28 }}
            className="flex-1 flex flex-col"
          >
            <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm flex-1 flex flex-col">
              <CardHeader className="pb-4">
                <p className="text-purple-400 text-xs font-semibold uppercase tracking-widest mb-1">
                  Mental Health Check-In
                </p>
                <CardTitle className="text-white text-lg sm:text-xl leading-snug">
                  {question.question}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-start space-y-3 pb-6">
                {question.options.map((option, i) => (
                  <motion.button
                    key={i}
                    whileHover={{ scale: 1.015 }}
                    whileTap={{ scale: 0.975 }}
                    onClick={() => handleAnswer(i)}
                    className="w-full text-left px-4 py-4 rounded-xl
                               bg-gray-800/50 hover:bg-purple-900/30
                               border border-gray-700 hover:border-purple-600/50
                               text-gray-200 hover:text-white
                               transition-all duration-200
                               min-h-[56px] text-sm sm:text-base"
                  >
                    <span className="text-purple-400 font-semibold mr-3">
                      {String.fromCharCode(65 + i)}.
                    </span>
                    {option}
                  </motion.button>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Back button */}
        {currentQ > 0 && (
          <Button
            variant="ghost"
            onClick={handleBack}
            className="mt-4 text-gray-400 hover:text-white self-start min-h-[44px]"
          >
            ← Previous
          </Button>
        )}
      </div>
    </div>
  )
}
