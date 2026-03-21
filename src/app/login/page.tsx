'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { Eye, EyeOff, Shield } from 'lucide-react'

const DEMO_ACCOUNTS = [
  { label: 'Student',    email: 'demo.student@stillspace.app',    password: 'Demo@1234' },
  { label: 'Counsellor', email: 'demo.counsellor@stillspace.app', password: 'Demo@1234' },
  { label: 'Admin',      email: 'demo.admin@stillspace.app',      password: 'Demo@1234' },
]

export default function LoginPage() {
  const router   = useRouter()
  const supabase = createClient()
  const cardRef  = useRef<HTMLDivElement>(null)

  const [email, setEmail]               = useState('')
  const [password, setPassword]         = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading]           = useState(false)
  const [error, setError]               = useState('')
  const [cursor, setCursor]             = useState({ x: -999, y: -999 })

  useEffect(() => {
    ;(async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      const { data } = await supabase.from('profiles').select('role').eq('id', session.user.id).single()
      if (data?.role === 'student')         router.replace('/student/dashboard')
      else if (data?.role === 'counsellor') router.replace('/counsellor/dashboard')
      else if (data?.role === 'admin')      router.replace('/admin')
    })()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const doLogin = async (loginEmail: string, loginPassword: string) => {
    setLoading(true)
    setError('')
    const { data, error: authError } = await supabase.auth.signInWithPassword({ email: loginEmail, password: loginPassword })
    if (authError) { setError(authError.message); setLoading(false); return }
    if (data.session) {
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.session.user.id).single()
      if (profile?.role === 'student')         router.push('/student/dashboard')
      else if (profile?.role === 'counsellor') router.push('/counsellor/dashboard')
      else if (profile?.role === 'admin')      router.push('/admin')
      else                                     router.push('/student/dashboard')
    }
    setLoading(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) return
    doLogin(email, password)
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = cardRef.current?.getBoundingClientRect()
    if (!rect) return
    setCursor({ x: e.clientX - rect.left, y: e.clientY - rect.top })
  }

  const handleMouseLeave = () => setCursor({ x: -999, y: -999 })

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-[#A8D1F0]/10 to-gray-950 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-6">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3"
            style={{ background: 'linear-gradient(135deg, #A8D1F0, #5fa8d3)', boxShadow: '0 8px 24px rgba(168,209,240,0.25)' }}
          >
            <span className="text-2xl">🧠</span>
          </div>
          <h1 className="text-2xl font-bold text-white">StillSpace</h1>
          <p className="text-gray-400 text-sm mt-1">Sign in to your account</p>
        </div>

        {/* Card — cursor spotlight + left-border accent */}
        <div
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="relative bg-gray-900 rounded-2xl overflow-hidden border border-gray-800/60"
          style={{ boxShadow: '-4px 0 0 #A8D1F0, 0 24px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(168,209,240,0.10)' }}
        >
          {/* Cursor-following spotlight overlay */}
          <div
            className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-300"
            style={{
              background: `radial-gradient(380px circle at ${cursor.x}px ${cursor.y}px, rgba(168,209,240,0.11) 0%, transparent 65%)`,
            }}
          />

          {/* Demo accounts section */}
          <div className="relative z-10 group px-6 pt-5 pb-4">
            <div className="absolute inset-0 bg-[#A8D1F0]/0 group-hover:bg-[#A8D1F0]/[0.04] transition-colors duration-300 pointer-events-none rounded-t-2xl" />
            <p className="relative text-gray-500 text-[10px] font-semibold uppercase tracking-widest mb-2.5">Quick demo access</p>
            <div className="relative grid grid-cols-3 gap-2">
              {DEMO_ACCOUNTS.map(acc => (
                <button
                  key={acc.label}
                  onClick={() => doLogin(acc.email, acc.password)}
                  disabled={loading}
                  className="bg-gray-800 hover:bg-[#A8D1F0]/20 border border-gray-700 hover:border-[#A8D1F0]/40 text-gray-300 hover:text-white text-xs font-medium py-2 px-1 rounded-xl transition-all duration-200 disabled:opacity-50"
                >
                  {acc.label}
                </button>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="relative z-10 flex items-center gap-3 px-6 py-1">
            <div className="flex-1 h-px bg-gray-800" />
            <span className="text-gray-700 text-[10px] uppercase tracking-wider">or</span>
            <div className="flex-1 h-px bg-gray-800" />
          </div>

          <form onSubmit={handleSubmit} className="relative z-10">
            {/* Email section */}
            <div className="group relative px-6 pt-4 pb-3">
              <div className="absolute inset-0 bg-[#A8D1F0]/0 group-hover:bg-[#A8D1F0]/[0.04] transition-colors duration-300 pointer-events-none" />
              <label className="relative block text-xs text-gray-400 font-medium mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@university.edu"
                className="relative w-full bg-gray-800/70 border border-gray-700 focus:border-[#A8D1F0]/60 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none transition-colors"
                required
                autoComplete="email"
              />
            </div>

            {/* Password section */}
            <div className="group relative px-6 pt-2 pb-3">
              <div className="absolute inset-0 bg-[#A8D1F0]/0 group-hover:bg-[#A8D1F0]/[0.04] transition-colors duration-300 pointer-events-none" />
              <label className="relative block text-xs text-gray-400 font-medium mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-gray-800/70 border border-gray-700 focus:border-[#A8D1F0]/60 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none transition-colors pr-10"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="relative px-6 pb-2">
                <p className="text-red-400 text-xs bg-red-900/20 border border-red-800/40 rounded-lg px-3 py-2">{error}</p>
              </div>
            )}

            {/* Submit section */}
            <div className="group relative px-6 pt-2 pb-5">
              <div className="absolute inset-0 bg-[#A8D1F0]/0 group-hover:bg-[#A8D1F0]/[0.04] transition-colors duration-300 pointer-events-none" />
              <button
                type="submit"
                disabled={loading || !email || !password}
                className="relative w-full font-semibold py-2.5 rounded-xl text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: '#A8D1F0', color: '#1a2535', boxShadow: '0 4px 16px rgba(168,209,240,0.25)' }}
              >
                {loading ? 'Signing in…' : 'Sign In'}
              </button>
            </div>
          </form>

          {/* Footer */}
          <div className="relative z-10 group border-t border-gray-800/60 px-6 py-3">
            <div className="absolute inset-0 bg-[#A8D1F0]/0 group-hover:bg-[#A8D1F0]/[0.04] transition-colors duration-300 pointer-events-none rounded-b-2xl" />
            <div className="relative flex items-center justify-center gap-1.5">
              <Shield size={11} className="text-gray-600" />
              <span className="text-[11px] text-gray-600">End-to-end encrypted · Secure login</span>
            </div>
          </div>

        </div>

        <p className="text-center text-gray-600 text-sm mt-5">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-[#A8D1F0] hover:text-white font-medium transition-colors">
            Create one
          </Link>
        </p>

      </div>
    </div>
  )
}
