'use client'
import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Play, Pause, RotateCcw } from 'lucide-react'

type Phase = 'idle' | 'inhale' | 'hold' | 'exhale'

const PHASES: { phase: Phase; duration: number; label: string; color: string }[] = [
  { phase: 'inhale', duration: 4, label: 'Inhale…',  color: '#6d28d9' },
  { phase: 'hold',   duration: 7, label: 'Hold…',    color: '#1d4ed8' },
  { phase: 'exhale', duration: 8, label: 'Exhale…',  color: '#0f766e' },
]

export default function BreathingPage() {
  const [isRunning, setIsRunning] = useState(false)
  const [phaseIndex, setPhaseIndex] = useState(0)
  const [timeLeft, setTimeLeft] = useState(PHASES[0].duration)
  const [cycles, setCycles] = useState(0)
  const [phase, setPhase] = useState<Phase>('idle')

  const currentPhase = PHASES[phaseIndex]

  const reset = useCallback(() => {
    setIsRunning(false)
    setPhaseIndex(0)
    setTimeLeft(PHASES[0].duration)
    setCycles(0)
    setPhase('idle')
  }, [])

  useEffect(() => {
    if (!isRunning) return
    setPhase(currentPhase.phase)
    if (timeLeft <= 0) {
      const next = (phaseIndex + 1) % PHASES.length
      if (next === 0) setCycles(prev => prev + 1)
      setPhaseIndex(next)
      setTimeLeft(PHASES[next].duration)
      return
    }
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000)
    return () => clearInterval(timer)
  }, [isRunning, timeLeft, phaseIndex, currentPhase.phase])

  const toggleRun = () => {
    if (!isRunning) setPhase(PHASES[phaseIndex].phase)
    setIsRunning(prev => !prev)
  }

  const circleScale     = phase === 'inhale' ? 1.4 : phase === 'hold' ? 1.4 : phase === 'exhale' ? 0.7 : 1.0
  const circleDuration  = phase === 'inhale' ? 4   : phase === 'hold' ? 0.2  : phase === 'exhale' ? 8   : 0.5

  const phaseColors: Record<Phase, string> = {
    idle:   '#7c3aed',
    inhale: '#6d28d9',
    hold:   '#1d4ed8',
    exhale: '#0f766e',
  }
  const phaseLabels: Record<Phase, string> = {
    idle:   'Ready to begin',
    inhale: 'Inhale…',
    hold:   'Hold…',
    exhale: 'Exhale…',
  }

  // Responsive sizing via CSS custom properties / clamp
  // circle: 52 vw on mobile, capped at 200 px on large screens
  const circleSize = 'clamp(140px, 52vw, 200px)'
  const glowSize   = 'clamp(196px, 72vw, 280px)'

  return (
    <div
      className="bg-gradient-to-br from-teal-950 via-blue-950 to-gray-950
                 flex flex-col items-center justify-center gap-6 sm:gap-8
                 px-5 py-8"
      style={{ minHeight: 'calc(100dvh - 3.5rem - 4rem)' }}
    >
      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-2xl sm:text-3xl font-bold text-white">4-7-8 Breathing</h1>
        <p className="text-teal-300 mt-1 text-sm">
          Breathe in 4 s — Hold 7 s — Breathe out 8 s
        </p>
      </motion.div>

      {/* Breathing circle */}
      <div className="relative flex items-center justify-center">
        {/* Outer glow */}
        <motion.div
          className="absolute rounded-full"
          style={{
            background: `radial-gradient(circle, ${phaseColors[phase]}40, transparent)`,
            width: glowSize,
            height: glowSize,
          }}
          animate={{ scale: circleScale * 1.4, opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: circleDuration, ease: 'easeInOut' }}
        />

        {/* Main circle */}
        <motion.div
          className="rounded-full flex items-center justify-center relative z-10 select-none"
          style={{
            background: `radial-gradient(circle at 40% 40%, ${phaseColors[phase]}80, ${phaseColors[phase]})`,
            width: circleSize,
            height: circleSize,
            boxShadow: `0 0 60px ${phaseColors[phase]}60`,
          }}
          animate={{ scale: circleScale }}
          transition={{ duration: circleDuration, ease: 'easeInOut' }}
        >
          <div className="text-center">
            <motion.p
              key={phase}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-white text-3xl sm:text-4xl font-bold"
            >
              {isRunning ? timeLeft : '✨'}
            </motion.p>
            <p className="text-white/70 text-xs sm:text-sm mt-1">{phaseLabels[phase]}</p>
          </div>
        </motion.div>
      </div>

      {/* Phase indicators */}
      {isRunning && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex gap-2 sm:gap-3"
        >
          {PHASES.map((p, i) => (
            <div
              key={p.phase}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all ${
                i === phaseIndex ? 'bg-white/20' : 'bg-white/5'
              }`}
            >
              <span className="text-white text-xs font-medium">{p.label}</span>
              <span className="text-white/60 text-xs">{p.duration}s</span>
            </div>
          ))}
        </motion.div>
      )}

      {/* Cycle dots */}
      {cycles > 0 && (
        <div className="flex items-center gap-2 flex-wrap justify-center">
          {[...Array(Math.min(cycles, 10))].map((_, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-3 h-3 rounded-full bg-teal-400"
            />
          ))}
          <span className="text-teal-300 text-sm font-medium">
            {cycles} cycle{cycles !== 1 ? 's' : ''} completed
          </span>
        </div>
      )}

      {/* Controls */}
      <div className="flex gap-3">
        <Button
          onClick={toggleRun}
          className={`px-8 min-h-[56px] rounded-2xl text-white font-semibold text-base transition-all ${
            isRunning
              ? 'bg-rose-600 hover:bg-rose-700'
              : 'bg-teal-600 hover:bg-teal-700'
          }`}
        >
          {isRunning ? (
            <><Pause size={22} className="mr-2" />Pause</>
          ) : (
            <><Play size={22} className="mr-2" />{cycles > 0 || phase !== 'idle' ? 'Resume' : 'Start'}</>
          )}
        </Button>
        <Button
          onClick={reset}
          variant="outline"
          className="min-h-[56px] min-w-[56px] rounded-2xl border-white/20 text-white/70 hover:bg-white/10 hover:text-white px-4"
        >
          <RotateCcw size={22} />
        </Button>
      </div>

      {/* Info text */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-teal-300/70 text-xs sm:text-sm text-center max-w-xs leading-relaxed"
      >
        The 4-7-8 technique activates your parasympathetic nervous system, reducing anxiety and promoting calm.
      </motion.p>
    </div>
  )
}
