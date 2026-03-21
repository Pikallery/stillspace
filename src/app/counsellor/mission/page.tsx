'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft, HeartHandshake, Users, ShieldCheck, BarChart3, Lock, Star } from 'lucide-react'

const pillars = [
  {
    icon: Users,
    title: 'Student-Centered Care',
    description:
      'Every student who reaches out is taking a brave step. Your role is to meet them with compassion, patience, and professional expertise.',
    color: 'from-indigo-600/20 to-indigo-800/10',
    border: 'border-indigo-700/30',
    iconColor: 'text-indigo-400',
    iconBg: 'bg-indigo-500/15',
  },
  {
    icon: ShieldCheck,
    title: 'A Platform You Can Trust',
    description:
      'Secure, encrypted, and built with counsellor workflows in mind. Focus on the session — not the software.',
    color: 'from-blue-600/20 to-blue-800/10',
    border: 'border-blue-700/30',
    iconColor: 'text-blue-400',
    iconBg: 'bg-blue-500/15',
  },
  {
    icon: BarChart3,
    title: 'Insight-Driven Practice',
    description:
      'AI-assisted suggestions, mood trend analytics, and triage summaries help you prioritise effectively and deliver better outcomes.',
    color: 'from-cyan-600/20 to-cyan-800/10',
    border: 'border-cyan-700/30',
    iconColor: 'text-cyan-400',
    iconBg: 'bg-cyan-500/15',
  },
]

const impact = [
  { value: '24/7', label: 'Student access' },
  { value: 'E2E', label: 'Encrypted chats' },
  { value: 'AI', label: 'Triage support' },
  { value: '∞', label: 'Lives touched' },
]

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay },
})

export default function CounsellorMissionPage() {
  return (
    <div className="min-h-screen pb-8">

      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/40 via-transparent to-transparent pointer-events-none" />
        <div className="relative px-5 pt-8 pb-10 max-w-2xl mx-auto text-center">

          <motion.div {...fadeUp(0)}>
            <Link
              href="/counsellor/dashboard"
              className="inline-flex items-center gap-1.5 text-gray-400 hover:text-white text-sm mb-6 transition-colors"
            >
              <ArrowLeft size={15} />
              Back to dashboard
            </Link>
          </motion.div>

          <motion.div {...fadeUp(0.05)} className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center mx-auto mb-5 shadow-xl shadow-indigo-500/20">
            <HeartHandshake size={28} className="text-white" />
          </motion.div>

          <motion.h1 {...fadeUp(0.1)} className="text-3xl md:text-4xl font-bold text-white mb-3">
            Our Mission
          </motion.h1>

          <motion.p {...fadeUp(0.15)} className="text-gray-300 text-base md:text-lg leading-relaxed max-w-lg mx-auto">
            StillSpace empowers counsellors to do what they do best — listen, guide, and heal.
            We handle the tools so you can focus entirely on the people who need you.
          </motion.p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-5 space-y-6">

        {/* Impact row */}
        <motion.div {...fadeUp(0.18)} className="grid grid-cols-4 gap-3">
          {impact.map(item => (
            <div
              key={item.label}
              className="flex flex-col items-center p-3 rounded-2xl bg-gray-900/60 border border-gray-800"
            >
              <span className="text-indigo-300 font-bold text-xl">{item.value}</span>
              <span className="text-gray-500 text-[11px] mt-0.5 text-center leading-tight">{item.label}</span>
            </div>
          ))}
        </motion.div>

        {/* Pillars */}
        <div className="space-y-4">
          {pillars.map((p, i) => {
            const Icon = p.icon
            return (
              <motion.div
                key={p.title}
                {...fadeUp(0.25 + i * 0.1)}
                className={`p-5 rounded-2xl bg-gradient-to-br ${p.color} border ${p.border}`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-11 h-11 rounded-xl ${p.iconBg} flex items-center justify-center shrink-0`}>
                    <Icon size={20} className={p.iconColor} />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-base mb-1">{p.title}</h3>
                    <p className="text-gray-300 text-sm leading-relaxed">{p.description}</p>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Quote */}
        <motion.div {...fadeUp(0.55)} className="p-6 rounded-2xl bg-gray-900/60 border border-gray-800 text-center">
          <p className="text-gray-200 text-base italic leading-relaxed mb-3">
            &ldquo;The greatest healing therapy is friendship and love.&rdquo;
          </p>
          <p className="text-gray-500 text-sm">— Hubert H. Humphrey</p>
        </motion.div>

        {/* Encryption note */}
        <motion.div {...fadeUp(0.6)} className="flex items-start gap-3 p-4 rounded-xl bg-gray-900/50 border border-gray-800">
          <Lock size={16} className="text-indigo-400 shrink-0 mt-0.5" />
          <p className="text-gray-400 text-sm leading-relaxed">
            <span className="text-indigo-300 font-medium">All conversations are end-to-end encrypted.</span>{' '}
            Messages are encrypted with AES-256-GCM before being stored. Students&apos; disclosures remain confidential — even from database administrators.
          </p>
        </motion.div>

        {/* Appreciation */}
        <motion.div {...fadeUp(0.65)} className="p-6 rounded-2xl bg-gradient-to-br from-indigo-900/30 to-blue-900/20 border border-indigo-700/20 text-center">
          <div className="flex justify-center mb-3">
            <Star size={20} className="text-indigo-400" />
          </div>
          <p className="text-white font-semibold text-base mb-2">Thank you for being here</p>
          <p className="text-gray-300 text-sm leading-relaxed">
            The work you do matters more than any metric can measure. Every conversation you
            hold is a lifeline for someone who needed exactly you, exactly then. StillSpace
            exists to support the supporters.
          </p>
        </motion.div>

      </div>
    </div>
  )
}
