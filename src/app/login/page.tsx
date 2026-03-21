'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase'
import { Eye, EyeOff, Shield } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // If already logged in, redirect to appropriate dashboard
  useEffect(() => {
    ;(async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      const { data } = await supabase.from('profiles').select('role').eq('id', session.user.id).single()
      if (data?.role === 'student') router.replace('/student/dashboard')
      else if (data?.role === 'counsellor') router.replace('/counsellor/dashboard')
      else if (data?.role === 'admin') router.replace('/admin')
    })()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) return
    setLoading(true)
    setError('')

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    if (data.session) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.session.user.id)
        .single()

      if (profile?.role === 'student') router.push('/student/dashboard')
      else if (profile?.role === 'counsellor') router.push('/counsellor/dashboard')
      else if (profile?.role === 'admin') router.push('/admin')
      else router.push('/student/dashboard')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950/20 to-gray-950 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🧠</span>
          </div>
          <h1 className="text-2xl font-bold text-white">StillSpace</h1>
          <p className="text-gray-400 text-sm mt-1">Sign in to your account</p>
        </div>

        {/* Card */}
        <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6 backdrop-blur-sm">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm text-gray-300 font-medium">Email</label>
              <Input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@university.edu"
                className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-purple-500 min-h-[44px]"
                required
                autoComplete="email"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm text-gray-300 font-medium">Password</label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-purple-500 min-h-[44px] pr-11"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-red-400 text-sm bg-red-900/20 border border-red-800/40 rounded-lg px-3 py-2"
              >
                {error}
              </motion.p>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white min-h-[44px] font-medium"
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </Button>
          </form>

          {/* Admin hint */}
          <div className="mt-4 p-3 bg-blue-950/30 border border-blue-800/30 rounded-lg flex items-start gap-2">
            <Shield size={14} className="text-blue-400 shrink-0 mt-0.5" />
            <p className="text-blue-300 text-xs leading-relaxed">
              Admin access is role-based. Register as a student or counsellor, then contact your administrator to upgrade your role.
            </p>
          </div>
        </div>

        <p className="text-center text-gray-500 text-sm mt-6">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-purple-400 hover:text-purple-300 font-medium">
            Create one
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
