'use client'
export const dynamic = 'force-dynamic'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { OnboardingSkit } from '@/components/onboarding-skit'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

export default function HomePage() {
  const router = useRouter()
  const supabase = createClient()
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single()
        if (profile?.role === 'student') { router.push('/student/dashboard'); return }
        if (profile?.role === 'counsellor') { router.push('/counsellor/dashboard'); return }
        if (profile?.role === 'admin') { router.push('/admin'); return }
      }
      const hasSeenOnboarding = localStorage.getItem('seen_onboarding')
      if (!hasSeenOnboarding) {
        setShowOnboarding(true)
      } else {
        setChecked(true)
      }
    }
    check()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleOnboardingComplete = () => {
    localStorage.setItem('seen_onboarding', 'true')
    setShowOnboarding(false)
    setChecked(true)
  }

  if (!checked && !showOnboarding) return null

  return (
    <>
      {showOnboarding && <OnboardingSkit onComplete={handleOnboardingComplete} />}

      {checked && (
        <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950/20 to-gray-950 flex flex-col items-center justify-center p-6">
          {/* Background Effects */}
          <div className="fixed inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 -left-20 w-72 h-72 bg-purple-600/10 rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 -right-20 w-72 h-72 bg-indigo-600/10 rounded-full blur-3xl" />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-xl relative z-10"
          >
            {/* Logo */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="w-24 h-24 rounded-3xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-purple-500/30"
            >
              <span className="text-5xl">🧠</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-5xl font-bold text-white mb-3"
            >
              StillSpace
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xl text-purple-200 mb-2"
            >
              Your mental wellness companion
            </motion.p>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-gray-400 mb-10 max-w-sm mx-auto"
            >
              AI-powered support, real counsellors, and a caring community — all in one safe space.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center mb-8"
            >
              <Link href="/login">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-8 py-6 text-lg rounded-2xl shadow-lg shadow-purple-600/30"
                >
                  Sign In
                </Button>
              </Link>
              <Link href="/register">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto border-indigo-600/50 text-indigo-300 hover:bg-indigo-900/20 px-8 py-6 text-lg rounded-2xl"
                >
                  Create Account
                </Button>
              </Link>
            </motion.div>

            {/* Features */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="mt-16 grid grid-cols-3 gap-6"
            >
              {[
                { icon: '🤖', title: 'AI Support', desc: '24/7 compassionate chat' },
                { icon: '👩‍⚕️', title: 'Real Counsellors', desc: 'Professional guidance' },
                { icon: '🌱', title: 'Community', desc: 'Peer support network' },
              ].map((feature, i) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 + i * 0.1 }}
                  className="text-center"
                >
                  <div className="text-3xl mb-2">{feature.icon}</div>
                  <p className="text-white text-sm font-semibold">{feature.title}</p>
                  <p className="text-gray-500 text-xs">{feature.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      )}
    </>
  )
}
