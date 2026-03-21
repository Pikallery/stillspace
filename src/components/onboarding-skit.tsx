'use client'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'

const FULL_TEXT = "Welcome to StillSpace"

export function OnboardingSkit({ onComplete }: { onComplete: () => void }) {
  const [displayText, setDisplayText] = useState('')
  const [charIndex, setCharIndex] = useState(0)
  const [phase, setPhase] = useState<'waving' | 'typing' | 'done'>('waving')

  useEffect(() => {
    const waveTimer = setTimeout(() => setPhase('typing'), 800)
    return () => clearTimeout(waveTimer)
  }, [])

  useEffect(() => {
    if (phase !== 'typing') return
    if (charIndex < FULL_TEXT.length) {
      const timer = setTimeout(() => {
        setDisplayText(prev => prev + FULL_TEXT[charIndex])
        setCharIndex(prev => prev + 1)
      }, 60)
      return () => clearTimeout(timer)
    } else {
      setPhase('done')
      const doneTimer = setTimeout(onComplete, 1000)
      return () => clearTimeout(doneTimer)
    }
  }, [phase, charIndex, onComplete])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900">
      <div className="text-center">
        {/* SVG Character */}
        <motion.svg
          width="120" height="120" viewBox="0 0 120 120"
          className="mx-auto mb-8"
          animate={phase === 'waving' ? { rotate: [0, -10, 10, -10, 0] } : {}}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
        >
          {/* Body */}
          <circle cx="60" cy="35" r="28" fill="#a78bfa"/>
          {/* Face */}
          <circle cx="52" cy="32" r="4" fill="#1e1b4b"/>
          <circle cx="68" cy="32" r="4" fill="#1e1b4b"/>
          <path d="M 50 44 Q 60 52 70 44" stroke="#1e1b4b" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
          {/* Body */}
          <rect x="42" y="65" width="36" height="40" rx="12" fill="#7c3aed"/>
          {/* Left arm - waving */}
          <motion.rect
            x="18" y="62" width="24" height="10" rx="5" fill="#7c3aed"
            animate={phase === 'waving' ? { rotate: [-20, 20, -20, 20, 0] } : {}}
            style={{ originX: '100%', originY: '50%' }}
            transition={{ duration: 0.8 }}
          />
          {/* Right arm */}
          <rect x="78" y="62" width="24" height="10" rx="5" fill="#7c3aed"/>
          {/* Legs */}
          <rect x="46" y="98" width="12" height="20" rx="6" fill="#6d28d9"/>
          <rect x="62" y="98" width="12" height="20" rx="6" fill="#6d28d9"/>
        </motion.svg>

        <motion.h1
          className="text-4xl font-bold text-white min-h-[3rem]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {displayText}
          {phase === 'typing' && (
            <motion.span
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.5, repeat: Infinity }}
              className="inline-block w-0.5 h-8 bg-purple-400 ml-1 align-middle"
            />
          )}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: phase === 'done' ? 1 : 0 }}
          className="text-purple-200 mt-4 text-lg"
        >
          Your mental wellness companion
        </motion.p>

        <Button
          variant="ghost"
          onClick={onComplete}
          className="mt-8 text-purple-300 hover:text-white text-sm"
        >
          Skip →
        </Button>
      </div>
    </div>
  )
}
