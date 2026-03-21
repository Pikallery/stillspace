'use client'
import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase'

// ── Types ───────────────────────────────────────────────────────────────────────

interface Scene {
  id: number
  npc: string
  npcName: string
  dialogue: string
  bg: string
  theme?: string
  options: { text: string; value: number }[]
}

// ── Phase 1: General screening (4 questions, determines mood level) ───────────

const GENERAL_SCENES: Scene[] = [
  {
    id: 1, npc: '🧙‍♂️', npcName: 'Elder Mage',
    dialogue: "Traveller... I sense a shadow upon thy spirit. Over the past two weeks — how oft hast thou felt down, depressed, or hopeless?",
    bg: 'from-gray-950 via-purple-950/40 to-gray-950',
    theme: 'Depression & Low Mood',
    options: [
      { text: 'Not at all',              value: 0 },
      { text: 'Several days',            value: 1 },
      { text: 'More than half the days', value: 2 },
      { text: 'Nearly every day',        value: 3 },
    ],
  },
  {
    id: 2, npc: '⚔️', npcName: 'Battle Sage',
    dialogue: "Many quests weigh upon a hero's mind. How often dost thou feel anxious, overwhelmed, or unable to stop worrying?",
    bg: 'from-gray-950 via-red-950/30 to-gray-950',
    theme: 'Anxiety & Overwhelm',
    options: [
      { text: 'Rarely',        value: 0 },
      { text: 'Sometimes',     value: 1 },
      { text: 'Often',         value: 2 },
      { text: 'Almost always', value: 3 },
    ],
  },
  {
    id: 3, npc: '🌙', npcName: 'Moon Oracle',
    dialogue: "The stars whisper of restless nights... How well art thou resting? Rate thine sleep over recent weeks.",
    bg: 'from-gray-950 via-indigo-950/40 to-gray-950',
    theme: 'Sleep & Rest',
    options: [
      { text: 'Very well',  value: 0 },
      { text: 'Fairly well', value: 1 },
      { text: 'Poorly',     value: 2 },
      { text: 'Not at all', value: 3 },
    ],
  },
  {
    id: 4, npc: '🏰', npcName: 'Village Elder',
    dialogue: "How well art thou managing thine daily responsibilities — studies, self-care, and the tasks of life?",
    bg: 'from-gray-950 via-cyan-950/30 to-gray-950',
    theme: 'Daily Functioning',
    options: [
      { text: 'Managing well',  value: 0 },
      { text: 'Getting by',     value: 1 },
      { text: 'Struggling',     value: 2 },
      { text: 'Barely coping',  value: 3 },
    ],
  },
]

// ── Phase 2: Tailored questions by mood level ─────────────────────────────────
// Mood level: 1=Thriving(0-3) 2=Struggling(4-6) 3=Distressed(7-9) 4=Crisis(10-12)

const TAILORED_SCENES: Record<number, Scene[]> = {
  1: [
    { id: 5, npc: '🌿', npcName: 'Forest Sprite', bg: 'from-gray-950 via-green-950/30 to-gray-950',
      dialogue: "Thy spirit shines bright! What brings thee the most joy and meaning in life right now?",
      options: [{ text: 'Friends & connection', value: 0 }, { text: 'Hobbies & creativity', value: 0 }, { text: 'Study & growth', value: 0 }, { text: 'Still searching', value: 1 }] },
    { id: 6, npc: '✨', npcName: 'Light Guardian', bg: 'from-gray-950 via-purple-950/20 to-gray-950',
      dialogue: "How often dost thou practice self-care — rest, movement, or moments of quiet peace?",
      options: [{ text: 'Daily', value: 0 }, { text: 'A few times a week', value: 0 }, { text: 'Rarely', value: 1 }, { text: 'Almost never', value: 2 }] },
    { id: 7, npc: '🧙‍♂️', npcName: 'Elder Mage', bg: 'from-gray-950 via-purple-950/40 to-gray-950',
      dialogue: "Dost thou have meaningful connections with others who truly support thee?",
      options: [{ text: 'Yes, strong bonds', value: 0 }, { text: 'Some connections', value: 0 }, { text: 'A few, not close', value: 1 }, { text: 'Feeling rather alone', value: 2 }] },
    { id: 8, npc: '📜', npcName: 'Scholar Golem', bg: 'from-gray-950 via-amber-950/20 to-gray-950',
      dialogue: "Is there anything on thy mind thou wouldst like to grow or explore in the near future?",
      options: [{ text: 'Building better habits', value: 0 }, { text: 'Managing occasional stress', value: 1 }, { text: 'Improving relationships', value: 1 }, { text: 'Nothing specific', value: 0 }] },
  ],
  2: [
    { id: 5, npc: '🌿', npcName: 'Forest Sprite', bg: 'from-gray-950 via-green-950/30 to-gray-950',
      dialogue: "What seems to be the greatest burden weighing upon thee right now?",
      options: [{ text: 'Academic pressure', value: 1 }, { text: 'Relationship struggles', value: 1 }, { text: 'Family stress', value: 2 }, { text: 'Financial worries', value: 2 }] },
    { id: 6, npc: '📜', npcName: 'Scholar Golem', bg: 'from-gray-950 via-amber-950/30 to-gray-950',
      dialogue: "How is thine academic performance and ability to concentrate holding up?",
      options: [{ text: 'Keeping up fine', value: 0 }, { text: 'Falling slightly behind', value: 1 }, { text: 'Struggling significantly', value: 2 }, { text: 'Unable to focus at all', value: 3 }] },
    { id: 7, npc: '🏰', npcName: 'Village Elder', bg: 'from-gray-950 via-cyan-950/30 to-gray-950',
      dialogue: "Dost thou have someone trusted to speak to — a friend, family member, or mentor?",
      options: [{ text: 'Yes, I talk to them often', value: 0 }, { text: 'Yes, sometimes', value: 1 }, { text: 'Not really', value: 2 }, { text: 'No one I can turn to', value: 3 }] },
    { id: 8, npc: '✨', npcName: 'Light Guardian', bg: 'from-gray-950 via-purple-950/30 to-gray-950',
      dialogue: "How often dost thou engage in activities that help thee recharge and feel better?",
      options: [{ text: 'Regularly', value: 0 }, { text: 'Sometimes', value: 1 }, { text: 'Rarely', value: 2 }, { text: 'I have stopped entirely', value: 3 }] },
  ],
  3: [
    { id: 5, npc: '🌙', npcName: 'Moon Oracle', bg: 'from-gray-950 via-indigo-950/40 to-gray-950',
      dialogue: "How long hast thou been carrying this heaviness within thee?",
      options: [{ text: 'A few days', value: 1 }, { text: 'About a week', value: 1 }, { text: 'Several weeks', value: 2 }, { text: 'Months or longer', value: 3 }] },
    { id: 6, npc: '⚔️', npcName: 'Battle Sage', bg: 'from-gray-950 via-red-950/20 to-gray-950',
      dialogue: "Are thine basic needs being met — food, rest, and movement through the day?",
      options: [{ text: 'Yes, mostly', value: 0 }, { text: 'Struggling with some', value: 1 }, { text: 'Struggling with most', value: 2 }, { text: 'Not at all', value: 3 }] },
    { id: 7, npc: '🏰', npcName: 'Village Elder', bg: 'from-gray-950 via-cyan-950/30 to-gray-950',
      dialogue: "Hast thou sought any support from others — friends, family, or a counsellor?",
      options: [{ text: 'Yes, seeing a counsellor', value: 0 }, { text: 'Talked to friends/family', value: 1 }, { text: 'Not yet, but open to it', value: 2 }, { text: 'No — and resistant to it', value: 3 }] },
    { id: 8, npc: '🧙‍♂️', npcName: 'Elder Mage', bg: 'from-gray-950 via-purple-950/40 to-gray-950',
      dialogue: "How dost thou feel about speaking with a trained counsellor about what thou art facing?",
      options: [{ text: 'Yes, I am ready', value: 0 }, { text: 'Open to it', value: 1 }, { text: 'Unsure', value: 2 }, { text: 'Not comfortable yet', value: 3 }] },
  ],
  4: [
    { id: 5, npc: '💀', npcName: 'Shadow Keeper', bg: 'from-gray-950 via-gray-900/60 to-gray-950',
      dialogue: "I must ask of the darkest dungeon, brave soul... Hast thou had thoughts of harming thyself or ending thy life?",
      options: [{ text: 'No, never', value: 0 }, { text: 'Fleeting thoughts only', value: 1 }, { text: 'Yes, sometimes', value: 2 }, { text: 'Yes, seriously', value: 3 }] },
    { id: 6, npc: '🏰', npcName: 'Village Elder', bg: 'from-gray-950 via-red-950/30 to-gray-950',
      dialogue: "Art thou in a safe environment right now? Is there anyone nearby with thee?",
      options: [{ text: 'Yes, safe and with others', value: 0 }, { text: 'Safe but alone', value: 1 }, { text: 'Unsure if I am safe', value: 2 }, { text: 'I do not feel safe', value: 3 }] },
    { id: 7, npc: '✨', npcName: 'Light Guardian', bg: 'from-gray-950 via-purple-950/40 to-gray-950',
      dialogue: "Is there someone in thy life who knows how thou art truly feeling right now?",
      options: [{ text: 'Yes, they know', value: 0 }, { text: 'Partially', value: 1 }, { text: 'Not really', value: 2 }, { text: 'No one knows', value: 3 }] },
    { id: 8, npc: '🌙', npcName: 'Moon Oracle', bg: 'from-gray-950 via-indigo-950/40 to-gray-950',
      dialogue: "What would help thee feel safer and more supported right now, in this very moment?",
      options: [{ text: 'Talking to a counsellor', value: 0 }, { text: 'Calling a crisis line', value: 0 }, { text: 'Speaking to someone I trust', value: 1 }, { text: 'I do not know', value: 2 }] },
  ],
}

// ── Mood level helpers ────────────────────────────────────────────────────────

function getMoodLevel(phase1Total: number): 1 | 2 | 3 | 4 {
  if (phase1Total <= 3)  return 1
  if (phase1Total <= 6)  return 2
  if (phase1Total <= 9)  return 3
  return 4
}

const MOOD_META: Record<number, { label: string; desc: string; color: string; borderColor: string; icon: string }> = {
  1: { label: 'THRIVING',   desc: "Thy spirit burns bright, hero. The path ahead holds promise.", color: 'text-green-400',  borderColor: 'border-green-600/50',  icon: '🏆' },
  2: { label: 'STRUGGLING', desc: "A burden weighs upon thee. But thou art not without allies.",  color: 'text-yellow-400', borderColor: 'border-yellow-600/50', icon: '⚔️' },
  3: { label: 'DISTRESSED', desc: "The trials are heavy, hero. Deeper questions lie ahead.",      color: 'text-orange-400', borderColor: 'border-orange-600/50', icon: '🌙' },
  4: { label: 'IN CRISIS',  desc: "Thou needest urgent aid. The healers stand ready for thee.",   color: 'text-red-400',    borderColor: 'border-red-600/50',    icon: '🆘' },
}

function getTopConcern(phase1Scores: number[]): string {
  const themes = GENERAL_SCENES.map(s => s.theme!)
  let maxVal = -1, maxIdx = 0
  phase1Scores.forEach((v, i) => { if (v > maxVal) { maxVal = v; maxIdx = i } })
  return themes[maxIdx]
}

function getFinalLevel(total: number, maxScore: number): 'ai' | 'counsellor' | 'emergency' {
  const pct = total / maxScore
  if (pct < 0.33) return 'ai'
  if (pct < 0.58) return 'counsellor'
  return 'emergency'
}

// ── Typewriter hook ───────────────────────────────────────────────────────────

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
      if (i >= text.length) { clearInterval(id); setDone(true) }
    }, speed)
    return () => clearInterval(id)
  }, [text, speed])

  const skip = useCallback(() => { setDisplayed(text); setDone(true) }, [text])
  return { displayed, done, skip }
}

// ── Component ─────────────────────────────────────────────────────────────────

type Phase = 'intro' | 'quest' | 'transition' | 'result'

export default function TriagePage() {
  const router = useRouter()
  const supabase = createClient()
  const [phase, setPhase] = useState<Phase>('intro')
  const [sceneIdx, setSceneIdx] = useState(0)    // 0-7 across both phases
  const [scores, setScores] = useState<number[]>([])
  const [moodLevel, setMoodLevel] = useState<1|2|3|4>(1)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [knightIn, setKnightIn] = useState(false)
  const [resultLevel, setResultLevel] = useState<'ai' | 'counsellor' | 'emergency'>('ai')

  // Current scene: first 4 from GENERAL, next 4 from TAILORED[moodLevel]
  const currentScene: Scene = sceneIdx < 4
    ? GENERAL_SCENES[sceneIdx]
    : TAILORED_SCENES[moodLevel][sceneIdx - 4]

  const { displayed, done, skip } = useTypewriter(
    phase === 'quest' ? currentScene.dialogue : '',
    38
  )

  useEffect(() => {
    if (phase !== 'quest') return
    setKnightIn(false)
    setSelectedOption(null)
    const t = setTimeout(() => setKnightIn(true), 120)
    return () => clearTimeout(t)
  }, [sceneIdx, phase])

  async function saveResult(total: number, level: string, allScores: number[], topConcern: string, mood: number) {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return
    const id = session.user.id
    await supabase.from('triage_results').insert({
      student_id: id, score: total, level, answers: allScores,
      top_concern: topConcern, mood_level: mood,
    })
    await supabase.from('profiles').update({ triage_score: total, triage_level: level }).eq('id', id)
  }

  function handleAnswer(value: number) {
    if (selectedOption !== null) return
    setSelectedOption(value)
    const newScores = [...scores, value]

    setTimeout(() => {
      // After Q4 → compute mood level → show transition
      if (sceneIdx === 3) {
        const phase1Total = newScores.reduce((a, b) => a + b, 0)
        const level = getMoodLevel(phase1Total)
        setMoodLevel(level)
        setScores(newScores)
        setPhase('transition')
        return
      }

      // After Q8 → compute final result
      if (sceneIdx === 7) {
        const total = newScores.reduce((a, b) => a + b, 0)
        const maxScore = 8 * 3
        const finalLevel = getFinalLevel(total, maxScore)
        const topConcern = getTopConcern(newScores.slice(0, 4))
        setResultLevel(finalLevel)
        setPhase('result')
        saveResult(total, finalLevel, newScores, topConcern, moodLevel)
        return
      }

      // Continue to next question
      setScores(newScores)
      setSceneIdx(s => s + 1)
    }, 600)
  }

  // ── INTRO ─────────────────────────────────────────────────────────────────────
  if (phase === 'intro') {
    return (
      <div className="min-h-[calc(100dvh-3.5rem-4rem)] md:min-h-[calc(100dvh-2rem)] flex flex-col items-center justify-center px-4 bg-gradient-to-br from-gray-950 via-purple-950/30 to-gray-950">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}
          className="max-w-sm w-full text-center space-y-6">
          <div className="relative border-2 border-purple-500/60 bg-gray-900/80 p-6">
            <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-purple-400" />
            <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-purple-400" />
            <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-purple-400" />
            <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-purple-400" />
            <div className="text-4xl mb-4">⚔️</div>
            <h1 className="pixel-font text-purple-300 text-[10px] leading-7 mb-1">MENTAL HEALTH</h1>
            <h2 className="pixel-font text-white text-[9px] leading-6">QUEST CHECK-IN</h2>
          </div>

          <div className="border border-gray-700/50 bg-gray-900/60 p-4 space-y-2">
            <p className="pixel-font text-gray-300 text-[7px] leading-6">
              ✦ PHASE I · 4 questions to read thy spirit
            </p>
            <p className="pixel-font text-gray-500 text-[7px] leading-6">
              ✦ PHASE II · 4 questions tailored to thee
            </p>
          </div>

          <div className="flex justify-center py-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/sprites/knight.gif" alt="Knight" width={80} height={80} style={{ imageRendering: 'pixelated' }} />
          </div>

          <Button onClick={() => setPhase('quest')}
            className="w-full rounded-none bg-purple-700 hover:bg-purple-600 border border-purple-400/40 pixel-font text-[8px] tracking-widest py-6">
            ▶ BEGIN QUEST
          </Button>
        </motion.div>
      </div>
    )
  }

  // ── TRANSITION (mood level reveal) ───────────────────────────────────────────
  if (phase === 'transition') {
    const meta = MOOD_META[moodLevel]
    return (
      <div className="min-h-[calc(100dvh-3.5rem-4rem)] md:min-h-[calc(100dvh-2rem)] flex flex-col items-center justify-center px-4 bg-gradient-to-br from-gray-950 via-purple-950/30 to-gray-950">
        <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}
          className="max-w-sm w-full text-center space-y-6">

          <motion.div animate={{ y: [-4, 4, -4] }} transition={{ duration: 2, repeat: Infinity }} className="text-5xl">
            {meta.icon}
          </motion.div>

          <div className={`relative border-2 ${meta.borderColor} bg-gray-900/80 p-5`}>
            <div className={`absolute top-1 left-1 w-2.5 h-2.5 border-t-2 border-l-2 ${meta.borderColor}`} />
            <div className={`absolute top-1 right-1 w-2.5 h-2.5 border-t-2 border-r-2 ${meta.borderColor}`} />
            <div className={`absolute bottom-1 left-1 w-2.5 h-2.5 border-b-2 border-l-2 ${meta.borderColor}`} />
            <div className={`absolute bottom-1 right-1 w-2.5 h-2.5 border-b-2 border-r-2 ${meta.borderColor}`} />
            <p className="pixel-font text-gray-500 text-[6px] leading-6 mb-1">HERO STATUS ASSESSED</p>
            <h2 className={`pixel-font ${meta.color} text-[10px] leading-7 mb-2`}>✦ {meta.label} ✦</h2>
            <p className="pixel-font text-gray-300 text-[7px] leading-6">{meta.desc}</p>
          </div>

          <div className="border border-gray-700/40 bg-gray-900/50 p-3">
            <p className="pixel-font text-gray-400 text-[6px] leading-6">
              PHASE II BEGINS · 4 questions await · tailored for thee
            </p>
          </div>

          <Button onClick={() => { setSceneIdx(4); setPhase('quest') }}
            className={`w-full rounded-none border pixel-font text-[7px] tracking-widest py-5 ${
              moodLevel === 1 ? 'bg-green-700 hover:bg-green-600 border-green-400/40' :
              moodLevel === 2 ? 'bg-yellow-700 hover:bg-yellow-600 border-yellow-400/40' :
              moodLevel === 3 ? 'bg-orange-700 hover:bg-orange-600 border-orange-400/40' :
              'bg-red-700 hover:bg-red-600 border-red-400/40'
            }`}>
            ▶ CONTINUE QUEST
          </Button>
        </motion.div>
      </div>
    )
  }

  // ── QUEST SCENE ───────────────────────────────────────────────────────────────
  if (phase === 'quest') {
    const totalQuestions = 8
    return (
      <div className={`min-h-[calc(100dvh-3.5rem-4rem)] md:min-h-[calc(100dvh-2rem)] flex flex-col bg-gradient-to-br ${currentScene.bg} transition-colors duration-700`}>

        <div className="shrink-0 h-1.5 bg-gray-800 w-full">
          <motion.div className="h-full bg-gradient-to-r from-purple-600 to-indigo-500"
            animate={{ width: `${(sceneIdx / totalQuestions) * 100}%` }}
            transition={{ duration: 0.4 }} />
        </div>

        <div className="shrink-0 flex justify-between items-center px-4 pt-3 pb-1">
          <span className="pixel-font text-[7px] text-gray-500">
            {sceneIdx < 4 ? 'PHASE I' : 'PHASE II'} · Q{sceneIdx + 1}/{totalQuestions}
          </span>
          <span className="pixel-font text-[7px] text-gray-500">{currentScene.npcName.toUpperCase()}</span>
        </div>

        <div className="flex-1 flex flex-col px-4 pb-4 gap-3 overflow-y-auto">

          <div className="flex items-end gap-4 mt-2 shrink-0">
            <motion.div initial={{ x: -80, opacity: 0 }}
              animate={knightIn ? { x: 0, opacity: 1 } : { x: -80, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 22 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/sprites/knight.gif" alt="Knight" width={56} height={56} style={{ imageRendering: 'pixelated' }} />
            </motion.div>

            <div className="flex flex-col items-center gap-1">
              <motion.div key={`npc-${sceneIdx}`} initial={{ scale: 0, rotate: -10 }} animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.15 }}
                className="text-4xl sm:text-5xl leading-none">
                {currentScene.npc}
              </motion.div>
              <span className="pixel-font text-[6px] text-gray-400">{currentScene.npcName.toUpperCase()}</span>
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={`dlg-${sceneIdx}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }} transition={{ duration: 0.2 }} onClick={skip}
              className="shrink-0 relative border-2 border-purple-700/60 bg-gray-900/90 p-4 cursor-pointer select-none">
              <div className="absolute top-1 left-1 w-2.5 h-2.5 border-t-2 border-l-2 border-purple-500/50" />
              <div className="absolute top-1 right-1 w-2.5 h-2.5 border-t-2 border-r-2 border-purple-500/50" />
              <div className="absolute bottom-1 left-1 w-2.5 h-2.5 border-b-2 border-l-2 border-purple-500/50" />
              <div className="absolute bottom-1 right-1 w-2.5 h-2.5 border-b-2 border-r-2 border-purple-500/50" />
              <p className="pixel-font text-[7px] sm:text-[8px] text-gray-100 leading-6 min-h-[3.5rem]">
                {displayed}{!done && <span className="animate-pulse">▌</span>}
              </p>
              {done && <p className="pixel-font text-[6px] text-gray-500 text-right mt-1 animate-pulse">▼</p>}
            </motion.div>
          </AnimatePresence>

          <AnimatePresence>
            {done && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }} className="space-y-2 shrink-0">
                {currentScene.options.map((opt, i) => (
                  <motion.button key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }} onClick={() => handleAnswer(opt.value)}
                    disabled={selectedOption !== null}
                    className={`w-full text-left px-4 py-3 border transition-all duration-150 pixel-font text-[7px] leading-5 flex items-center gap-3
                      ${selectedOption === opt.value
                        ? 'bg-purple-700/60 border-purple-400 text-white'
                        : selectedOption !== null
                        ? 'bg-gray-900/30 border-gray-800/30 text-gray-600 cursor-not-allowed'
                        : 'bg-gray-900/70 border-gray-700/50 text-gray-200 hover:bg-purple-900/40 hover:border-purple-600/60 hover:text-white'
                      }`}>
                    <span className="shrink-0 w-3 text-purple-400">{selectedOption === opt.value ? '►' : '·'}</span>
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

  // ── RESULTS ───────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-[calc(100dvh-3.5rem-4rem)] md:min-h-[calc(100dvh-2rem)] flex flex-col items-center justify-center px-4 bg-gradient-to-br from-gray-950 via-purple-950/30 to-gray-950">

      {resultLevel === 'ai' && (
        <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}
          className="max-w-sm w-full text-center space-y-6">
          <motion.div animate={{ y: [-6, 6, -6] }} transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }} className="text-6xl">🏆</motion.div>
          <div className="relative border-2 border-green-600/50 bg-gray-900/80 p-5">
            <div className="absolute top-1 left-1 w-2.5 h-2.5 border-t-2 border-l-2 border-green-500/50" />
            <div className="absolute top-1 right-1 w-2.5 h-2.5 border-t-2 border-r-2 border-green-500/50" />
            <div className="absolute bottom-1 left-1 w-2.5 h-2.5 border-b-2 border-l-2 border-green-500/50" />
            <div className="absolute bottom-1 right-1 w-2.5 h-2.5 border-b-2 border-r-2 border-green-500/50" />
            <h2 className="pixel-font text-green-400 text-[9px] leading-7 mb-2">QUEST COMPLETE!</h2>
            <p className="pixel-font text-gray-300 text-[7px] leading-6">Thy spirit is resilient, brave hero. The AI companion shall guide thee through these lands.</p>
          </div>
          <div className="border border-green-700/40 bg-green-950/20 p-3">
            <p className="pixel-font text-green-300 text-[7px] leading-6">✦ AI Chat is ready for thee</p>
          </div>
          <div className="space-y-3">
            <Button onClick={() => router.push('/student/chat')} className="w-full rounded-none bg-green-700 hover:bg-green-600 border border-green-400/40 pixel-font text-[7px] tracking-widest py-5">▶ TALK TO AI COMPANION</Button>
            <button onClick={() => router.push('/student/dashboard')} className="w-full pixel-font text-[6px] text-gray-500 hover:text-gray-300 py-2 transition-colors">RETURN TO VILLAGE</button>
          </div>
        </motion.div>
      )}

      {resultLevel === 'counsellor' && (
        <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}
          className="max-w-sm w-full text-center space-y-6">
          <div className="text-5xl">🏥</div>
          <div className="relative border-2 border-indigo-500/50 bg-gray-900/80 p-5">
            <div className="absolute top-1 left-1 w-2.5 h-2.5 border-t-2 border-l-2 border-indigo-500/50" />
            <div className="absolute top-1 right-1 w-2.5 h-2.5 border-t-2 border-r-2 border-indigo-500/50" />
            <div className="absolute bottom-1 left-1 w-2.5 h-2.5 border-b-2 border-l-2 border-indigo-500/50" />
            <div className="absolute bottom-1 right-1 w-2.5 h-2.5 border-b-2 border-r-2 border-indigo-500/50" />
            <h2 className="pixel-font text-indigo-300 text-[9px] leading-7 mb-2">THE HEALERS AWAIT</h2>
            <p className="pixel-font text-gray-300 text-[7px] leading-6">Thy journey hath been difficult. The guild of healers — real counsellors — stand ready to aid thee.</p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {(['🧑‍⚕️', '👩‍⚕️', '🧙‍♀️'] as const).map((npc, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.15 }}
                className="border border-indigo-700/40 bg-indigo-950/20 p-3 flex flex-col items-center gap-1">
                <span className="text-2xl">{npc}</span>
                <span className="pixel-font text-[5px] text-indigo-400">HEALER</span>
              </motion.div>
            ))}
          </div>
          <div className="space-y-3">
            <Button onClick={() => router.push('/student/messages')} className="w-full rounded-none bg-indigo-700 hover:bg-indigo-600 border border-indigo-400/40 pixel-font text-[7px] tracking-widest py-5">▶ MEET THE HEALERS</Button>
            <Button variant="outline" onClick={() => router.push('/student/chat')} className="w-full rounded-none border-gray-600 bg-transparent pixel-font text-[7px] tracking-widest py-5 text-gray-300">TALK TO AI FIRST</Button>
            <button onClick={() => router.push('/student/dashboard')} className="w-full pixel-font text-[6px] text-gray-500 hover:text-gray-300 py-2 transition-colors">RETURN TO VILLAGE</button>
          </div>
        </motion.div>
      )}

      {resultLevel === 'emergency' && (
        <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}
          className="max-w-sm w-full text-center space-y-6">
          <motion.div animate={{ scale: [1, 1.12, 1] }} transition={{ duration: 1.2, repeat: Infinity }} className="text-5xl">🆘</motion.div>
          <div className="relative border-2 border-amber-500/60 bg-gray-900/80 p-5">
            <div className="absolute top-1 left-1 w-2.5 h-2.5 border-t-2 border-l-2 border-amber-500/50" />
            <div className="absolute top-1 right-1 w-2.5 h-2.5 border-t-2 border-r-2 border-amber-500/50" />
            <div className="absolute bottom-1 left-1 w-2.5 h-2.5 border-b-2 border-l-2 border-amber-500/50" />
            <div className="absolute bottom-1 right-1 w-2.5 h-2.5 border-b-2 border-r-2 border-amber-500/50" />
            <h2 className="pixel-font text-amber-400 text-[9px] leading-7 mb-2">URGENT SUPPORT</h2>
            <p className="pixel-font text-gray-300 text-[7px] leading-6">Brave hero — thou art facing great darkness. Thou dost NOT have to face this alone. Help is here NOW.</p>
          </div>
          <div className="border border-amber-600/50 bg-amber-950/20 p-4 space-y-1">
            <p className="pixel-font text-amber-300 text-[8px]">CRISIS LIFELINE</p>
            <p className="pixel-font text-white text-base font-bold tracking-widest">988</p>
            <p className="pixel-font text-gray-400 text-[6px] leading-5">CALL OR TEXT · AVAILABLE 24/7</p>
          </div>
          <div className="space-y-3">
            <Button onClick={() => router.push('/student/messages')} className="w-full rounded-none bg-amber-600 hover:bg-amber-500 border border-amber-400/40 pixel-font text-[7px] tracking-widest py-5">▶ CONNECT NOW</Button>
            <Button variant="outline" onClick={() => router.push('/student/chat')} className="w-full rounded-none border-gray-600 bg-transparent pixel-font text-[7px] tracking-widest py-5 text-gray-300">TALK TO AI</Button>
          </div>
        </motion.div>
      )}
    </div>
  )
}
