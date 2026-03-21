'use client'
import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase'

// ── Quest data ─────────────────────────────────────────────────────────────────

interface Scene {
  id: number
  npc: string
  npcName: string
  dialogue: string
  bg: string
  options: { text: string; value: number }[]
}

const scenes: Scene[] = [
  {
    id: 1,
    npc: '🧙‍♂️',
    npcName: 'Elder Mage',
    dialogue: "Traveller... I sense a shadow upon thy spirit. Over the past two weeks — how oft hast thou felt down, depressed, or hopeless?",
    bg: 'from-gray-950 via-purple-950/40 to-gray-950',
    options: [
      { text: 'Not at all',             value: 0 },
      { text: 'Several days',           value: 1 },
      { text: 'More than half the days', value: 2 },
      { text: 'Nearly every day',       value: 3 },
    ],
  },
  {
    id: 2,
    npc: '🌿',
    npcName: 'Forest Sprite',
    dialogue: "The enchanted forest grows dim... How often hast thou lost interest or pleasure in the things thou once loved?",
    bg: 'from-gray-950 via-green-950/30 to-gray-950',
    options: [
      { text: 'Not at all',             value: 0 },
      { text: 'Several days',           value: 1 },
      { text: 'More than half the days', value: 2 },
      { text: 'Nearly every day',       value: 3 },
    ],
  },
  {
    id: 3,
    npc: '🌙',
    npcName: 'Moon Oracle',
    dialogue: "The stars whisper of restless nights... How wouldst thou rate thine sleep quality of late?",
    bg: 'from-gray-950 via-indigo-950/40 to-gray-950',
    options: [
      { text: 'Very good', value: 0 },
      { text: 'Good',      value: 1 },
      { text: 'Fair',      value: 2 },
      { text: 'Poor',      value: 3 },
    ],
  },
  {
    id: 4,
    npc: '⚔️',
    npcName: 'Battle Sage',
    dialogue: "Many quests weigh upon a hero's mind. How often dost thou feel anxious or worried about thine studies?",
    bg: 'from-gray-950 via-red-950/30 to-gray-950',
    options: [
      { text: 'Rarely',        value: 0 },
      { text: 'Sometimes',     value: 1 },
      { text: 'Often',         value: 2 },
      { text: 'Almost always', value: 3 },
    ],
  },
  {
    id: 5,
    npc: '📜',
    npcName: 'Scholar Golem',
    dialogue: "The tome of knowledge awaits... Yet how well art thou able to concentrate upon thine work?",
    bg: 'from-gray-950 via-amber-950/30 to-gray-950',
    options: [
      { text: 'Very well',       value: 0 },
      { text: 'Reasonably well', value: 1 },
      { text: 'Not very well',   value: 2 },
      { text: 'Not at all',      value: 3 },
    ],
  },
  {
    id: 6,
    npc: '🏰',
    npcName: 'Village Elder',
    dialogue: "No hero walks alone. How supported dost thou feel by thine allies — friends and family?",
    bg: 'from-gray-950 via-cyan-950/30 to-gray-950',
    options: [
      { text: 'Very supported',     value: 0 },
      { text: 'Somewhat supported', value: 1 },
      { text: 'Slightly supported', value: 2 },
      { text: 'Not supported',      value: 3 },
    ],
  },
  {
    id: 7,
    npc: '💀',
    npcName: 'Shadow Keeper',
    dialogue: "I must ask thee of the darkest dungeon... Hast thou experienced thoughts of harming thyself?",
    bg: 'from-gray-950 via-gray-900/60 to-gray-950',
    options: [
      { text: 'Never',     value: 0 },
      { text: 'Rarely',    value: 1 },
      { text: 'Sometimes', value: 2 },
      { text: 'Often',     value: 3 },
    ],
  },
  {
    id: 8,
    npc: '✨',
    npcName: 'Light Guardian',
    dialogue: "We near the end of this quest. How wouldst thou rate thine overall mental wellbeing right now?",
    bg: 'from-gray-950 via-purple-950/40 to-gray-950',
    options: [
      { text: 'Excellent', value: 0 },
      { text: 'Good',      value: 1 },
      { text: 'Fair',      value: 2 },
      { text: 'Poor',      value: 3 },
    ],
  },
]

// ── Typewriter hook ─────────────────────────────────────────────────────────────

function useTypewriter(text: string, speed = 38) {
  const [displayed, setDisplayed] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    setDisplayed('')
    setDone(false)
    let i = 0
    const id = setInterval(() => {
      i++
      setDisplayed(text.slice(0, i))
      if (i >= text.length) {
        clearInterval(id)
        setDone(true)
      }
    }, speed)
    return () => clearInterval(id)
  }, [text, speed])

  const skip = useCallback(() => {
    setDisplayed(text)
    setDone(true)
  }, [text])

  return { displayed, done, skip }
}

// ── Score → result level ────────────────────────────────────────────────────────

function getResult(score: number): 'ai' | 'counsellor' | 'emergency' {
  const max = scenes.length * 3   // 24
  const pct = score / max
  if (pct < 0.33) return 'ai'
  if (pct < 0.58) return 'counsellor'
  return 'emergency'
}

// ── Component ───────────────────────────────────────────────────────────────────

type Phase = 'intro' | 'quest' | 'result'

export default function TriagePage() {
  const router = useRouter()
  const supabase = createClient()
  const [phase, setPhase] = useState<Phase>('intro')
  const [sceneIdx, setSceneIdx] = useState(0)
  const [scores, setScores] = useState<number[]>([])
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [knightIn, setKnightIn] = useState(false)
  const [resultLevel, setResultLevel] = useState<'ai' | 'counsellor' | 'emergency'>('ai')

  const scene = scenes[sceneIdx]
  const { displayed, done, skip } = useTypewriter(
    phase === 'quest' ? scene.dialogue : '',
    38
  )

  // Knight walks in fresh on each new scene
  useEffect(() => {
    if (phase !== 'quest') return
    setKnightIn(false)
    setSelectedOption(null)
    const t = setTimeout(() => setKnightIn(true), 120)
    return () => clearTimeout(t)
  }, [sceneIdx, phase])

  async function saveResult(total: number, level: string, allScores: number[]) {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return
    const studentId = session.user.id
    // Save triage result
    await supabase.from('triage_results').insert({
      student_id: studentId,
      score: total,
      level,
      answers: allScores,
    })
    // Update profile with latest triage level
    await supabase.from('profiles').update({
      triage_score: total,
      triage_level: level,
    }).eq('id', studentId)
  }

  function handleAnswer(value: number) {
    if (selectedOption !== null) return
    setSelectedOption(value)
    const newScores = [...scores, value]
    setTimeout(() => {
      if (sceneIdx < scenes.length - 1) {
        setScores(newScores)
        setSceneIdx(s => s + 1)
      } else {
        const total = newScores.reduce((a, b) => a + b, 0)
        const level = getResult(total)
        setResultLevel(level)
        setPhase('result')
        saveResult(total, level, newScores)
      }
    }, 600)
  }

  // ── INTRO ────────────────────────────────────────────────────────────────────
  if (phase === 'intro') {
    return (
      <div className="min-h-[calc(100dvh-3.5rem-4rem)] md:min-h-[calc(100dvh-2rem)] flex flex-col items-center justify-center px-4 bg-gradient-to-br from-gray-950 via-purple-950/30 to-gray-950">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-sm w-full text-center space-y-6"
        >
          {/* Title card */}
          <div className="relative border-2 border-purple-500/60 bg-gray-900/80 p-6">
            <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-purple-400" />
            <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-purple-400" />
            <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-purple-400" />
            <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-purple-400" />
            <div className="text-4xl mb-4">⚔️</div>
            <h1 className="pixel-font text-purple-300 text-[10px] leading-7 mb-1">MENTAL HEALTH</h1>
            <h2 className="pixel-font text-white text-[9px] leading-6">QUEST CHECK-IN</h2>
          </div>

          {/* Description */}
          <div className="border border-gray-700/50 bg-gray-900/60 p-4">
            <p className="pixel-font text-gray-300 text-[7px] leading-6">
              A short quest of 8 questions awaits thee. Answer honestly — thine answers guide the healers.
            </p>
          </div>

          {/* Knight sprite */}
          <div className="flex justify-center py-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/sprites/knight.gif"
              alt="Your knight"
              width={80}
              height={80}
              style={{ imageRendering: 'pixelated' }}
            />
          </div>

          <Button
            onClick={() => setPhase('quest')}
            className="w-full rounded-none bg-purple-700 hover:bg-purple-600 border border-purple-400/40 pixel-font text-[8px] tracking-widest py-6"
          >
            ▶ BEGIN QUEST
          </Button>
        </motion.div>
      </div>
    )
  }

  // ── QUEST SCENE ──────────────────────────────────────────────────────────────
  if (phase === 'quest') {
    return (
      <div className={`min-h-[calc(100dvh-3.5rem-4rem)] md:min-h-[calc(100dvh-2rem)] flex flex-col bg-gradient-to-br ${scene.bg} transition-colors duration-700`}>

        {/* Progress strip */}
        <div className="shrink-0 h-1.5 bg-gray-800 w-full">
          <motion.div
            className="h-full bg-gradient-to-r from-purple-600 to-indigo-500"
            animate={{ width: `${(sceneIdx / scenes.length) * 100}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>

        {/* Counter */}
        <div className="shrink-0 flex justify-between items-center px-4 pt-3 pb-1">
          <span className="pixel-font text-[7px] text-gray-500">
            QUEST {sceneIdx + 1}/{scenes.length}
          </span>
          <span className="pixel-font text-[7px] text-gray-500">
            {scene.npcName.toUpperCase()}
          </span>
        </div>

        {/* Scene stage */}
        <div className="flex-1 flex flex-col px-4 pb-4 gap-3 overflow-y-auto">

          {/* Characters */}
          <div className="flex items-end gap-4 mt-2 shrink-0">
            {/* Knight */}
            <motion.div
              initial={{ x: -80, opacity: 0 }}
              animate={knightIn ? { x: 0, opacity: 1 } : { x: -80, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 22 }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/sprites/knight.gif"
                alt="Knight"
                width={56}
                height={56}
                style={{ imageRendering: 'pixelated' }}
              />
            </motion.div>

            {/* NPC */}
            <div className="flex flex-col items-center gap-1">
              <motion.div
                key={`npc-${sceneIdx}`}
                initial={{ scale: 0, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.15 }}
                className="text-4xl sm:text-5xl leading-none"
              >
                {scene.npc}
              </motion.div>
              <span className="pixel-font text-[6px] text-gray-400">{scene.npcName.toUpperCase()}</span>
            </div>
          </div>

          {/* Dialogue box */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`dlg-${sceneIdx}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={skip}
              className="shrink-0 relative border-2 border-purple-700/60 bg-gray-900/90 p-4 cursor-pointer select-none"
            >
              {/* Corner accents */}
              <div className="absolute top-1 left-1 w-2.5 h-2.5 border-t-2 border-l-2 border-purple-500/50" />
              <div className="absolute top-1 right-1 w-2.5 h-2.5 border-t-2 border-r-2 border-purple-500/50" />
              <div className="absolute bottom-1 left-1 w-2.5 h-2.5 border-b-2 border-l-2 border-purple-500/50" />
              <div className="absolute bottom-1 right-1 w-2.5 h-2.5 border-b-2 border-r-2 border-purple-500/50" />

              <p className="pixel-font text-[7px] sm:text-[8px] text-gray-100 leading-6 min-h-[3.5rem]">
                {displayed}
                {!done && <span className="animate-pulse">▌</span>}
              </p>
              {done && (
                <p className="pixel-font text-[6px] text-gray-500 text-right mt-1 animate-pulse">▼</p>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Answer menu */}
          <AnimatePresence>
            {done && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="space-y-2 shrink-0"
              >
                {scene.options.map((opt, i) => (
                  <motion.button
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    onClick={() => handleAnswer(opt.value)}
                    disabled={selectedOption !== null}
                    className={`
                      w-full text-left px-4 py-3 border transition-all duration-150
                      pixel-font text-[7px] leading-5 flex items-center gap-3
                      ${selectedOption === opt.value
                        ? 'bg-purple-700/60 border-purple-400 text-white'
                        : selectedOption !== null
                        ? 'bg-gray-900/30 border-gray-800/30 text-gray-600 cursor-not-allowed'
                        : 'bg-gray-900/70 border-gray-700/50 text-gray-200 hover:bg-purple-900/40 hover:border-purple-600/60 hover:text-white'
                      }
                    `}
                  >
                    <span className="shrink-0 w-3 text-purple-400">
                      {selectedOption === opt.value ? '►' : '·'}
                    </span>
                    {opt.text}
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
    )
  }

  // ── RESULTS ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-[calc(100dvh-3.5rem-4rem)] md:min-h-[calc(100dvh-2rem)] flex flex-col items-center justify-center px-4 bg-gradient-to-br from-gray-950 via-purple-950/30 to-gray-950">

      {resultLevel === 'ai' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-sm w-full text-center space-y-6"
        >
          <motion.div
            animate={{ y: [-6, 6, -6] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            className="text-6xl"
          >
            🏆
          </motion.div>

          <div className="relative border-2 border-green-600/50 bg-gray-900/80 p-5">
            <div className="absolute top-1 left-1 w-2.5 h-2.5 border-t-2 border-l-2 border-green-500/50" />
            <div className="absolute top-1 right-1 w-2.5 h-2.5 border-t-2 border-r-2 border-green-500/50" />
            <div className="absolute bottom-1 left-1 w-2.5 h-2.5 border-b-2 border-l-2 border-green-500/50" />
            <div className="absolute bottom-1 right-1 w-2.5 h-2.5 border-b-2 border-r-2 border-green-500/50" />
            <h2 className="pixel-font text-green-400 text-[9px] leading-7 mb-2">QUEST COMPLETE!</h2>
            <p className="pixel-font text-gray-300 text-[7px] leading-6">
              Thy spirit is resilient, brave hero. The AI companion shall guide thee through these lands.
            </p>
          </div>

          <div className="border border-green-700/40 bg-green-950/20 p-3">
            <p className="pixel-font text-green-300 text-[7px] leading-6">✦ AI Chat is ready for thee</p>
          </div>

          <div className="space-y-3">
            <Button
              onClick={() => router.push('/student/chat')}
              className="w-full rounded-none bg-green-700 hover:bg-green-600 border border-green-400/40 pixel-font text-[7px] tracking-widest py-5"
            >
              ▶ TALK TO AI COMPANION
            </Button>
            <button
              onClick={() => router.push('/student/dashboard')}
              className="w-full pixel-font text-[6px] text-gray-500 hover:text-gray-300 py-2 transition-colors"
            >
              RETURN TO VILLAGE
            </button>
          </div>
        </motion.div>
      )}

      {resultLevel === 'counsellor' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-sm w-full text-center space-y-6"
        >
          <div className="text-5xl">🏥</div>

          <div className="relative border-2 border-indigo-500/50 bg-gray-900/80 p-5">
            <div className="absolute top-1 left-1 w-2.5 h-2.5 border-t-2 border-l-2 border-indigo-500/50" />
            <div className="absolute top-1 right-1 w-2.5 h-2.5 border-t-2 border-r-2 border-indigo-500/50" />
            <div className="absolute bottom-1 left-1 w-2.5 h-2.5 border-b-2 border-l-2 border-indigo-500/50" />
            <div className="absolute bottom-1 right-1 w-2.5 h-2.5 border-b-2 border-r-2 border-indigo-500/50" />
            <h2 className="pixel-font text-indigo-300 text-[9px] leading-7 mb-2">THE HEALERS AWAIT</h2>
            <p className="pixel-font text-gray-300 text-[7px] leading-6">
              Thy journey hath been difficult. The guild of healers — real counsellors — stand ready to aid thee.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {(['🧑‍⚕️', '👩‍⚕️', '🧙‍♀️'] as const).map((npc, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.15 }}
                className="border border-indigo-700/40 bg-indigo-950/20 p-3 flex flex-col items-center gap-1"
              >
                <span className="text-2xl">{npc}</span>
                <span className="pixel-font text-[5px] text-indigo-400">HEALER</span>
              </motion.div>
            ))}
          </div>

          <div className="space-y-3">
            <Button
              onClick={() => router.push('/student/counsellors')}
              className="w-full rounded-none bg-indigo-700 hover:bg-indigo-600 border border-indigo-400/40 pixel-font text-[7px] tracking-widest py-5"
            >
              ▶ MEET THE HEALERS
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push('/student/chat')}
              className="w-full rounded-none border-gray-600 bg-transparent pixel-font text-[7px] tracking-widest py-5 text-gray-300"
            >
              TALK TO AI FIRST
            </Button>
            <button
              onClick={() => router.push('/student/dashboard')}
              className="w-full pixel-font text-[6px] text-gray-500 hover:text-gray-300 py-2 transition-colors"
            >
              RETURN TO VILLAGE
            </button>
          </div>
        </motion.div>
      )}

      {resultLevel === 'emergency' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-sm w-full text-center space-y-6"
        >
          <motion.div
            animate={{ scale: [1, 1.12, 1] }}
            transition={{ duration: 1.2, repeat: Infinity }}
            className="text-5xl"
          >
            🆘
          </motion.div>

          <div className="relative border-2 border-amber-500/60 bg-gray-900/80 p-5 emergency-pulse">
            <div className="absolute top-1 left-1 w-2.5 h-2.5 border-t-2 border-l-2 border-amber-500/50" />
            <div className="absolute top-1 right-1 w-2.5 h-2.5 border-t-2 border-r-2 border-amber-500/50" />
            <div className="absolute bottom-1 left-1 w-2.5 h-2.5 border-b-2 border-l-2 border-amber-500/50" />
            <div className="absolute bottom-1 right-1 w-2.5 h-2.5 border-b-2 border-r-2 border-amber-500/50" />
            <h2 className="pixel-font text-amber-400 text-[9px] leading-7 mb-2">URGENT SUPPORT</h2>
            <p className="pixel-font text-gray-300 text-[7px] leading-6">
              Brave hero — thou art facing great darkness. Thou dost NOT have to face this alone. Help is here NOW.
            </p>
          </div>

          <div className="border border-amber-600/50 bg-amber-950/20 p-4 space-y-1">
            <p className="pixel-font text-amber-300 text-[8px]">CRISIS LIFELINE</p>
            <p className="pixel-font text-white text-base font-bold tracking-widest">988</p>
            <p className="pixel-font text-gray-400 text-[6px] leading-5">CALL OR TEXT · AVAILABLE 24/7</p>
          </div>

          <div className="space-y-3">
            <Button
              onClick={() => router.push('/student/counsellors')}
              className="w-full rounded-none bg-amber-600 hover:bg-amber-500 border border-amber-400/40 pixel-font text-[7px] tracking-widest py-5"
            >
              ▶ CONNECT NOW
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push('/student/chat')}
              className="w-full rounded-none border-gray-600 bg-transparent pixel-font text-[7px] tracking-widest py-5 text-gray-300"
            >
              TALK TO AI
            </Button>
          </div>
        </motion.div>
      )}

    </div>
  )
}
