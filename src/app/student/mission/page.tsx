'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Shield, Moon, Sprout, ArrowLeft, Lock, Heart } from 'lucide-react'

const pillars = [
  {
    icon: Shield,
    title: 'Safe & Confidential',
    description:
      'Everything you share stays between you and your counsellor. All messages are encrypted — even we cannot read them.',
    color: 'from-purple-600/20 to-purple-800/10',
    border: 'border-purple-700/30',
    iconColor: 'text-purple-400',
    iconBg: 'bg-purple-500/15',
  },
  {
    icon: Moon,
    title: 'Always Here',
    description:
      'Support is available whenever you need it — during a rough night, a stressful exam week, or just a hard day.',
    color: 'from-indigo-600/20 to-indigo-800/10',
    border: 'border-indigo-700/30',
    iconColor: 'text-indigo-400',
    iconBg: 'bg-indigo-500/15',
  },
  {
    icon: Sprout,
    title: 'Grow & Heal',
    description:
      'Evidence-based tools — mood tracking, breathing exercises, journals — alongside real human guidance to help you thrive.',
    color: 'from-emerald-600/20 to-emerald-800/10',
    border: 'border-emerald-700/30',
    iconColor: 'text-emerald-400',
    iconBg: 'bg-emerald-500/15',
  },
]

const values = [
  { emoji: '🫂', label: 'Empathy first' },
  { emoji: '🔒', label: 'Fully encrypted' },
  { emoji: '🧠', label: 'AI-assisted' },
  { emoji: '🌍', label: 'Accessible to all' },
]

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay },
})

export default function StudentMissionPage() {
  return (
    <div className="min-h-screen pb-8">

      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-950/40 via-transparent to-transparent pointer-events-none" />
        <div className="relative px-5 pt-8 pb-10 max-w-2xl mx-auto text-center">

          <motion.div {...fadeUp(0)}>
            <Link
              href="/student/dashboard"
              className="inline-flex items-center gap-1.5 text-gray-400 hover:text-white text-sm mb-6 transition-colors"
            >
              <ArrowLeft size={15} />
              Back to dashboard
            </Link>
          </motion.div>

          <motion.div {...fadeUp(0.05)} className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center mx-auto mb-5 shadow-xl shadow-purple-500/20">
            <Heart size={28} className="text-white" />
          </motion.div>

          <motion.h1 {...fadeUp(0.1)} className="text-3xl md:text-4xl font-bold text-white mb-3">
            Our Mission
          </motion.h1>

          <motion.p {...fadeUp(0.15)} className="text-gray-300 text-base md:text-lg leading-relaxed max-w-lg mx-auto">
            StillSpace exists so that no student has to face their struggles alone.
            We believe every person deserves access to compassionate mental health support —
            without stigma, without barriers.
          </motion.p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-5 space-y-6">

        {/* Pillars */}
        <div className="space-y-4">
          {pillars.map((p, i) => {
            const Icon = p.icon
            return (
              <motion.div
                key={p.title}
                {...fadeUp(0.2 + i * 0.1)}
                className={`p-5 rounded-2xl bg-gradient-to-br ${p.color} border ${p.border} backdrop-blur-sm`}
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
        <motion.div {...fadeUp(0.5)} className="p-6 rounded-2xl bg-gray-900/60 border border-gray-800 text-center">
          <p className="text-gray-200 text-base italic leading-relaxed mb-3">
            &ldquo;Mental health is not a destination, but a process. It&apos;s about how you drive,
            not where you&apos;re going.&rdquo;
          </p>
          <p className="text-gray-500 text-sm">— Noam Shpancer</p>
        </motion.div>

        {/* Values chips */}
        <motion.div {...fadeUp(0.55)}>
          <h3 className="text-white font-semibold text-sm mb-3 text-center uppercase tracking-wider">
            What we stand for
          </h3>
          <div className="flex flex-wrap gap-3 justify-center">
            {values.map(v => (
              <div
                key={v.label}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-800/80 border border-gray-700/60 text-gray-200 text-sm"
              >
                <span>{v.emoji}</span>
                <span>{v.label}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Encryption note */}
        <motion.div {...fadeUp(0.6)} className="flex items-start gap-3 p-4 rounded-xl bg-gray-900/50 border border-gray-800">
          <Lock size={16} className="text-purple-400 shrink-0 mt-0.5" />
          <p className="text-gray-400 text-sm leading-relaxed">
            <span className="text-purple-300 font-medium">Your privacy is protected by encryption.</span>{' '}
            Messages between you and your counsellor are encrypted with AES-256. The content is never stored in plain text — not even visible to platform administrators.
          </p>
        </motion.div>

        {/* Promise */}
        <motion.div {...fadeUp(0.65)} className="p-6 rounded-2xl bg-gradient-to-br from-purple-900/30 to-indigo-900/20 border border-purple-700/20 text-center">
          <p className="text-white font-semibold text-base mb-2">Our promise to you</p>
          <p className="text-gray-300 text-sm leading-relaxed">
            You came here because something in you is searching for peace. We are here to walk
            alongside you — not to judge, not to rush, just to help you find your stillness.
          </p>
        </motion.div>

      </div>
    </div>
  )
}
