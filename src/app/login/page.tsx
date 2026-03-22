'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

// ── Demo accounts ─────────────────────────────────────────────────────────────

const DEMO_ACCOUNTS = [
  { label: 'Student',    email: 'demo.student@stillspace.app',    password: 'Demo@1234' },
  { label: 'Counsellor', email: 'demo.counsellor@stillspace.app', password: 'Demo@1234' },
  { label: 'Admin',      email: 'demo.admin@stillspace.app',      password: 'Demo@1234' },
]

// ── Purple band position per hovered section ──────────────────────────────────

type Section = 'none' | 'email' | 'password' | 'footer'

const BAND: Record<Section, { height: string; transform: string }> = {
  none:     { height: '3.5em', transform: 'translateY(0em)' },
  email:    { height: '4.2em', transform: 'translateY(4em)' },
  password: { height: '5.5em', transform: 'translateY(7.8em)' },
  footer:   { height: '5.9em', transform: 'translateY(13.2em)' },
}

const PURPLE  = '#6041bf'
const DPURPLE = '#24135a'

// ── Component ─────────────────────────────────────────────────────────────────

export default function LoginPage() {
  const router   = useRouter()
  const supabase = createClient()

  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [hovered, setHovered]   = useState<Section>('none')
  const [cardBig, setCardBig]   = useState(false)

  // Auto-redirect if already logged in
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
    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email: loginEmail, password: loginPassword,
    })
    if (authError) { setError(authError.message); setLoading(false); return }
    if (data.session) {
      const { data: profile } = await supabase.from('profiles').select('role')
        .eq('id', data.session.user.id).single()
      if (profile?.role === 'student')         router.push('/student/dashboard')
      else if (profile?.role === 'counsellor') router.push('/counsellor/dashboard')
      else if (profile?.role === 'admin')      router.push('/admin')
      else                                     router.push('/student/dashboard')
    }
    setLoading(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && email && password && !loading) doLogin(email, password)
  }

  const isE = hovered === 'email'
  const isP = hovered === 'password'
  const isF = hovered === 'footer'
  const band = BAND[hovered]

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-10"
      style={{ background: 'linear-gradient(135deg, #ede9fe 0%, #ddd6fe 50%, #c4b5fd 100%)' }}
    >

      {/* ── Brand ────────────────────────────────────────────────────────── */}
      <div className="text-center mb-7">
        <p className="text-3xl font-extrabold" style={{ color: DPURPLE }}>StillSpace</p>
        <p className="text-sm mt-1" style={{ color: PURPLE }}>Mental health support for students</p>
      </div>

      {/* ── Card ─────────────────────────────────────────────────────────── */}
      <div
        onMouseEnter={() => setCardBig(true)}
        onMouseLeave={() => { setCardBig(false); setHovered('none') }}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          backgroundColor: 'white',
          width: cardBig ? '16em' : '15.5em',
          height: cardBig ? '23em' : '22.5em',
          border: `2px solid ${DPURPLE}`,
          borderBottomLeftRadius: '1.5em',
          borderTopRightRadius: '1.5em',
          boxShadow: `-10px 0px 0px ${DPURPLE}, -10px 5px 5px rgba(0,0,0,0.2)`,
          overflow: 'hidden',
          position: 'relative',
          transition: 'all 0.25s ease',
          fontSize: '16px',
        }}
      >
        {/* Purple sliding band */}
        <div
          style={{
            width: '100%',
            backgroundColor: PURPLE,
            position: 'absolute',
            top: 0,
            zIndex: 1,
            transition: 'all 0.5s ease',
            boxShadow: `inset 5px 0px ${DPURPLE}`,
            ...band,
          }}
        />

        {/* White corner cutout (top-right notch) */}
        <div
          style={{
            width: '3.5em',
            height: '3.5em',
            top: '2.5px',
            right: '2.5px',
            position: 'absolute',
            zIndex: 2,
            borderTopRightRadius: '1.25em',
            boxShadow: '35px -35px 0px -1px white',
            pointerEvents: 'none',
          }}
        />

        {/* ── LOGIN header ─────────────────────────────────────────────── */}
        <div
          style={{
            position: 'relative',
            zIndex: 2,
            width: '100%',
            height: '3.5em',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            color: 'white',
            pointerEvents: 'none',
          }}
        >
          <p style={{ top: '0.35em', fontSize: '1.5em', fontWeight: 'bold', position: 'absolute', zIndex: 2 }}>
            LOGIN
          </p>
          <p style={{
            top: '62%',
            left: '1em',
            fontSize: '0.72em',
            fontWeight: 'bold',
            position: 'absolute',
            zIndex: 1,
            color: (isE || isP || isF) ? 'white' : PURPLE,
            transition: 'color 0.3s ease',
          }}>
            Log in to your account
          </p>
        </div>

        {/* ── Email area ───────────────────────────────────────────────── */}
        <div
          onMouseEnter={() => setHovered('email')}
          onMouseLeave={() => setHovered('none')}
          style={{
            position: 'relative',
            zIndex: 2,
            width: '100%',
            paddingLeft: isE ? '5%' : '10%',
            paddingRight: isE ? '5%' : '10%',
            height: '5em',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'column',
            marginTop: '1em',
            transition: 'all 0.25s ease',
          }}
        >
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="EMAIL"
            autoComplete="email"
            style={{
              width: '100%',
              border: `2px solid ${isE ? 'white' : PURPLE}`,
              borderRadius: '0.5em',
              height: isE ? '3em' : '2.5em',
              paddingLeft: '1em',
              fontSize: '0.9em',
              fontWeight: 100,
              transition: 'all 0.5s ease',
              outline: 'none',
              boxShadow: '0px 5px 5px -3px rgba(0,0,0,0.2)',
              color: isE ? 'white' : PURPLE,
              backgroundColor: isE ? PURPLE : 'white',
            }}
          />
          <style>{`.login-email::placeholder { color: ${isE ? 'white' : PURPLE}; font-weight: bold; }`}</style>
          <style>{`#login-email-input::placeholder { color: ${isE ? 'white' : PURPLE}; font-weight: bold; }`}</style>
        </div>

        {/* ── Password area ────────────────────────────────────────────── */}
        <div
          onMouseEnter={() => setHovered('password')}
          onMouseLeave={() => setHovered('none')}
          style={{
            position: 'relative',
            zIndex: 2,
            width: '100%',
            paddingLeft: isP ? '5%' : '10%',
            paddingRight: isP ? '5%' : '10%',
            height: '6em',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-end',
            flexDirection: 'column',
            transition: 'all 0.25s ease',
          }}
        >
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="PASSWORD"
            autoComplete="current-password"
            style={{
              width: '100%',
              border: `2px solid ${isP ? 'white' : PURPLE}`,
              borderRadius: '0.5em',
              height: isP ? '3em' : '2.5em',
              paddingLeft: '1em',
              fontSize: '0.9em',
              transition: 'all 0.25s ease',
              outline: 'none',
              boxShadow: '0px 5px 5px -3px rgba(0,0,0,0.2)',
              color: isP ? 'white' : PURPLE,
              backgroundColor: isP ? PURPLE : 'white',
            }}
          />
          <span style={{
            paddingTop: '0.5em',
            fontSize: '0.8em',
            fontWeight: 'bold',
            color: isP ? 'white' : PURPLE,
            transition: 'all 0.25s ease',
            paddingRight: isP ? '0' : '0',
            cursor: 'default',
            userSelect: 'none',
          }}>
            Forgot password?
          </span>
        </div>

        {/* ── Footer area ──────────────────────────────────────────────── */}
        <div
          onMouseEnter={() => setHovered('footer')}
          onMouseLeave={() => setHovered('none')}
          style={{
            position: 'relative',
            zIndex: 2,
            width: '100%',
            paddingLeft: isF ? '5%' : '10%',
            paddingRight: isF ? '5%' : '10%',
            height: '7em',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'column',
            color: PURPLE,
            transition: 'all 0.25s ease',
          }}
        >
          <button
            onClick={() => { if (!loading && email && password) doLogin(email, password) }}
            disabled={loading || !email || !password}
            style={{
              width: '100%',
              border: `2px solid ${isF ? 'white' : PURPLE}`,
              borderRadius: '0.5em',
              height: isF ? '3em' : '2.5em',
              fontSize: '0.95em',
              transition: 'all 0.25s ease',
              color: 'white',
              fontWeight: 'bold',
              backgroundColor: PURPLE,
              boxShadow: '0px 5px 5px -3px rgba(0,0,0,0.2)',
              cursor: (loading || !email || !password) ? 'not-allowed' : 'pointer',
              opacity: (loading || !email || !password) ? 0.6 : 1,
            }}
          >
            {loading ? 'Signing in…' : 'Log In'}
          </button>

          <div style={{ paddingTop: '0.5em', display: 'flex', alignItems: 'center', gap: '0.2em' }}>
            <p style={{ fontSize: '0.8em', color: isF ? 'white' : PURPLE, transition: 'all 0.25s ease' }}>
              Don&apos;t have an account?
            </p>
            <Link
              href="/register"
              style={{
                fontSize: '0.8em',
                fontWeight: 'bold',
                color: isF ? 'white' : PURPLE,
                transition: 'all 0.25s ease',
                paddingLeft: '0.15em',
              }}
            >
              Sign Up
            </Link>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            position: 'absolute',
            bottom: '0.4em',
            left: '10%',
            right: '10%',
            zIndex: 10,
          }}>
            <p style={{
              color: '#dc2626',
              fontSize: '0.65em',
              textAlign: 'center',
              backgroundColor: 'rgba(255,255,255,0.95)',
              border: '1px solid #fca5a5',
              padding: '0.3em 0.5em',
              borderRadius: '0.4em',
            }}>
              {error}
            </p>
          </div>
        )}

        {/* Global placeholder color for this page */}
        <style>{`
          input::placeholder { color: ${PURPLE}; font-weight: bold; }
        `}</style>
      </div>

      {/* ── Demo accounts ────────────────────────────────────────────────── */}
      <div style={{ marginTop: '1.5em', width: '15.5em' }}>
        <p style={{
          color: PURPLE,
          fontSize: '0.65em',
          textAlign: 'center',
          marginBottom: '0.6em',
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
          opacity: 0.7,
        }}>
          Quick demo access
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5em' }}>
          {DEMO_ACCOUNTS.map(acc => (
            <button
              key={acc.label}
              onClick={() => doLogin(acc.email, acc.password)}
              disabled={loading}
              style={{
                backgroundColor: 'rgba(96,65,191,0.08)',
                border: `1px solid rgba(96,65,191,0.3)`,
                borderRadius: '0.5em',
                padding: '0.45em 0.3em',
                fontSize: '0.72em',
                color: PURPLE,
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                opacity: loading ? 0.5 : 1,
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = `rgba(96,65,191,0.18)`
                ;(e.currentTarget as HTMLButtonElement).style.borderColor = PURPLE
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = `rgba(96,65,191,0.08)`
                ;(e.currentTarget as HTMLButtonElement).style.borderColor = `rgba(96,65,191,0.3)`
              }}
            >
              {acc.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
