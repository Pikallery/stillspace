'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Play, Pause, RotateCcw, Wind } from 'lucide-react'

// ── Techniques ────────────────────────────────────────────────────────────────

interface PhaseConfig { label: string; duration: number; color: string; instruction: string }
interface Technique { id: string; name: string; description: string; phases: PhaseConfig[] }

const TECHNIQUES: Technique[] = [
  {
    id: '478',
    name: '4-7-8',
    description: 'Calm anxiety fast',
    phases: [
      { label: 'Inhale',  duration: 4, color: '#6d28d9', instruction: 'Breathe in slowly through your nose' },
      { label: 'Hold',    duration: 7, color: '#1d4ed8', instruction: 'Hold your breath gently' },
      { label: 'Exhale',  duration: 8, color: '#0d9488', instruction: 'Exhale fully through your mouth' },
    ],
  },
  {
    id: 'box',
    name: 'Box',
    description: 'Focus & clarity',
    phases: [
      { label: 'Inhale',  duration: 4, color: '#0369a1', instruction: 'Breathe in through your nose' },
      { label: 'Hold',    duration: 4, color: '#4338ca', instruction: 'Hold at the top' },
      { label: 'Exhale',  duration: 4, color: '#0f766e', instruction: 'Breathe out through your mouth' },
      { label: 'Hold',    duration: 4, color: '#7c3aed', instruction: 'Hold at the bottom' },
    ],
  },
  {
    id: 'calm',
    name: 'Deep Calm',
    description: 'Sleep & deep rest',
    phases: [
      { label: 'Inhale',  duration: 5, color: '#7c3aed', instruction: 'Long slow breath in' },
      { label: 'Exhale',  duration: 7, color: '#0f766e', instruction: 'Let it all go slowly' },
    ],
  },
]

// ── Arc helper ────────────────────────────────────────────────────────────────

function Arc({ progress, color, r = 80 }: { progress: number; color: string; r?: number }) {
  const cx = 100
  const circumference = 2 * Math.PI * r
  const dash = circumference * progress
  return (
    <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 200 200">
      <circle cx={cx} cy={cx} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
      <circle
        cx={cx} cy={cx} r={r} fill="none"
        stroke={color} strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray={`${dash} ${circumference}`}
        style={{ transition: 'stroke-dasharray 1s linear, stroke 0.8s ease' }}
      />
    </svg>
  )
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function BreathingPage() {
  const [techniqueIdx, setTechniqueIdx] = useState(0)
  const [isRunning, setIsRunning]       = useState(false)
  const [phaseIdx, setPhaseIdx]         = useState(0)
  const [timeLeft, setTimeLeft]         = useState(0)
  const [cycles, setCycles]             = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const technique   = TECHNIQUES[techniqueIdx]
  const phase       = technique.phases[phaseIdx]
  const progress    = timeLeft > 0 ? (phase.duration - timeLeft + 1) / phase.duration : 0

  // ── Timer ──────────────────────────────────────────────────────────────────

  const clearTimer = () => {
    if (intervalRef.current) clearInterval(intervalRef.current)
  }

  useEffect(() => {
    if (!isRunning) { clearTimer(); return }

    intervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // advance phase
          setPhaseIdx(pi => {
            const next = (pi + 1) % technique.phases.length
            if (next === 0) setCycles(c => c + 1)
            setTimeLeft(technique.phases[next].duration)
            return next
          })
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return clearTimer
  }, [isRunning, technique]) // eslint-disable-line react-hooks/exhaustive-deps

  const start = () => {
    setPhaseIdx(0)
    setTimeLeft(technique.phases[0].duration)
    setCycles(0)
    setIsRunning(true)
  }

  const toggle = () => {
    if (!isRunning && timeLeft === 0) { start(); return }
    setIsRunning(v => !v)
  }

  const reset = useCallback(() => {
    clearTimer()
    setIsRunning(false)
    setPhaseIdx(0)
    setTimeLeft(0)
    setCycles(0)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // When technique changes, reset
  const selectTechnique = (idx: number) => {
    reset()
    setTechniqueIdx(idx)
  }

  // Circle scale per label
  const circleScale = !isRunning
    ? 1.0
    : phase.label === 'Inhale'  ? 1.35
    : phase.label === 'Hold'    ? 1.35
    : 0.75 // Exhale

  const transitionDuration = phase.label === 'Inhale'
    ? phase.duration
    : phase.label === 'Exhale' ? phase.duration
    : 0.3

  return (
    <div
      className="flex flex-col items-center justify-start gap-5 px-5 py-6 overflow-x-hidden"
      style={{ minHeight: 'calc(100dvh - 3.5rem - 4rem)', background: 'radial-gradient(ellipse at top, #0d1a2e 0%, #030712 70%)' }}
    >
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <div className="flex items-center justify-center gap-2 mb-1">
          <Wind size={18} className="text-teal-400" />
          <h1 className="text-xl sm:text-2xl font-bold text-white">Breathing Exercises</h1>
        </div>
        <p className="text-gray-400 text-xs sm:text-sm">Breathe with the circle</p>
      </motion.div>

      {/* Technique selector */}
      <div className="flex gap-2">
        {TECHNIQUES.map((t, i) => (
          <button
            key={t.id}
            onClick={() => selectTechnique(i)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 ${
              i === techniqueIdx
                ? 'bg-teal-600 text-white shadow-lg shadow-teal-900/50'
                : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/10'
            }`}
          >
            <span className="block">{t.name}</span>
            <span className={`block text-[10px] mt-0.5 ${i === techniqueIdx ? 'text-teal-200' : 'text-gray-600'}`}>
              {t.description}
            </span>
          </button>
        ))}
      </div>

      {/* Circle */}
      <div className="relative flex items-center justify-center" style={{ width: 'clamp(220px, 64vw, 300px)', height: 'clamp(220px, 64vw, 300px)' }}>

        {/* Ripple rings (animate outward when running) */}
        {isRunning && [0, 1, 2].map(i => (
          <motion.div
            key={`${phaseIdx}-${i}`}
            className="absolute inset-0 rounded-full border"
            style={{ borderColor: `${phase.color}40` }}
            initial={{ scale: 0.65, opacity: 0.7 }}
            animate={{ scale: 1.55 + i * 0.2, opacity: 0 }}
            transition={{ duration: 2.5, delay: i * 0.7, repeat: Infinity, ease: 'easeOut' }}
          />
        ))}

        {/* Glow blob */}
        <motion.div
          className="absolute inset-0 rounded-full blur-2xl"
          style={{ background: phase.color }}
          animate={{ scale: circleScale * 0.9, opacity: isRunning ? 0.28 : 0.12 }}
          transition={{ duration: transitionDuration, ease: 'easeInOut' }}
        />

        {/* Arc progress ring */}
        {isRunning && (
          <div className="absolute inset-0">
            <Arc progress={progress} color={phase.color} r={80} />
          </div>
        )}

        {/* Main circle */}
        <motion.div
          className="relative z-10 rounded-full flex flex-col items-center justify-center select-none cursor-default"
          style={{
            width: 'clamp(150px, 44vw, 200px)',
            height: 'clamp(150px, 44vw, 200px)',
            background: `radial-gradient(circle at 38% 35%, ${phase.color}bb, ${phase.color}ff)`,
            boxShadow: `0 0 60px ${phase.color}70, inset 0 1px 0 rgba(255,255,255,0.15)`,
          }}
          animate={{ scale: circleScale }}
          transition={{ duration: transitionDuration, ease: 'easeInOut' }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={`${phaseIdx}-label`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.3 }}
              className="text-center px-4"
            >
              {isRunning ? (
                <>
                  <p className="text-white text-4xl sm:text-5xl font-bold leading-none">{timeLeft}</p>
                  <p className="text-white/80 text-xs sm:text-sm mt-1 font-medium">{phase.label}</p>
                </>
              ) : (
                <>
                  <p className="text-white text-3xl leading-none">🌬️</p>
                  <p className="text-white/70 text-xs mt-2">Tap Start</p>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Instruction */}
      <AnimatePresence mode="wait">
        <motion.p
          key={phaseIdx}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.35 }}
          className="text-center text-gray-300 text-sm min-h-[20px]"
        >
          {isRunning ? phase.instruction : technique.phases.map(p => `${p.label} ${p.duration}s`).join(' · ')}
        </motion.p>
      </AnimatePresence>

      {/* Phase indicators */}
      {isRunning && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2">
          {technique.phases.map((p, i) => (
            <div
              key={i}
              className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-all duration-300"
              style={{
                background: i === phaseIdx ? `${p.color}30` : 'rgba(255,255,255,0.04)',
                border: `1px solid ${i === phaseIdx ? p.color + '60' : 'rgba(255,255,255,0.07)'}`,
              }}
            >
              <span className="text-white text-[11px] font-medium">{p.label}</span>
              <span className="text-gray-500 text-[10px]">{p.duration}s</span>
            </div>
          ))}
        </motion.div>
      )}

      {/* Cycles */}
      {cycles > 0 && (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-2 bg-teal-900/30 border border-teal-700/30 rounded-xl px-4 py-2"
        >
          {[...Array(Math.min(cycles, 8))].map((_, i) => (
            <motion.div key={i} initial={{ scale: 0 }} animate={{ scale: 1 }}
              className="w-2.5 h-2.5 rounded-full bg-teal-400 shadow-sm shadow-teal-400/50"
            />
          ))}
          <span className="text-teal-300 text-sm font-medium ml-1">
            {cycles} {cycles === 1 ? 'cycle' : 'cycles'}
          </span>
        </motion.div>
      )}

      {/* Controls */}
      <div className="flex gap-3">
        <Button
          onClick={toggle}
          className="px-8 min-h-[52px] rounded-2xl text-white font-semibold text-base shadow-lg"
          style={{
            background: isRunning
              ? 'linear-gradient(135deg, #be123c, #9f1239)'
              : 'linear-gradient(135deg, #0d9488, #0f766e)',
            boxShadow: isRunning ? '0 4px 20px rgba(190,18,60,0.35)' : '0 4px 20px rgba(13,148,136,0.35)',
          }}
        >
          {isRunning
            ? <><Pause size={20} className="mr-2" />Pause</>
            : <><Play  size={20} className="mr-2" />{timeLeft > 0 ? 'Resume' : 'Start'}</>
          }
        </Button>
        <Button
          onClick={reset}
          variant="outline"
          className="min-h-[52px] min-w-[52px] rounded-2xl border-white/10 text-white/50 hover:bg-white/10 hover:text-white px-4"
        >
          <RotateCcw size={20} />
        </Button>
      </div>

      {/* Tip */}
      <p className="text-gray-600 text-xs text-center max-w-xs leading-relaxed pb-2">
        {technique.id === '478' && 'The 4-7-8 technique activates your parasympathetic nervous system, reducing anxiety.'}
        {technique.id === 'box' && 'Box breathing is used by Navy SEALs to stay calm under pressure.'}
        {technique.id === 'calm' && 'Deep calm breathing lowers cortisol and helps you fall asleep faster.'}
      </p>
    </div>
  )
}
