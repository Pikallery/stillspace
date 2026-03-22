'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

const DEMO_ACCOUNTS = [
  { label: 'Student',    email: 'demo.student@stillspace.app',    password: 'Demo@1234' },
  { label: 'Counsellor', email: 'demo.counsellor@stillspace.app', password: 'Demo@1234' },
  { label: 'Admin',      email: 'demo.admin@stillspace.app',      password: 'Demo@1234' },
]

type Section = 'none' | 'email' | 'password' | 'footer'

// Purple band position for each hovered section (matches original CSS)
const BAND: Record<Section, { height: string; transform: string }> = {
  none:     { height: '3.5em', transform: 'translateY(0em)' },
  email:    { height: '4.2em', transform: 'translateY(4em)' },
  password: { height: '5.5em', transform: 'translateY(7.8em)' },
  footer:   { height: '5.9em', transform: 'translateY(13.2em)' },
}

const P  = '#6041bf'   // purple
const DP = '#24135a'   // dark purple

export default function LoginPage() {
  const router   = useRouter()
  const supabase = createClient()

  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [hovered, setHovered]   = useState<Section>('none')
  const [cardBig, setCardBig]   = useState(false)

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

  const doLogin = async (le: string, lp: string) => {
    setLoading(true); setError('')
    const { data, error: e } = await supabase.auth.signInWithPassword({ email: le, password: lp })
    if (e) { setError(e.message); setLoading(false); return }
    if (data.session) {
      const { data: p } = await supabase.from('profiles').select('role').eq('id', data.session.user.id).single()
      if (p?.role === 'student')         router.push('/student/dashboard')
      else if (p?.role === 'counsellor') router.push('/counsellor/dashboard')
      else if (p?.role === 'admin')      router.push('/admin')
      else                               router.push('/student/dashboard')
    }
    setLoading(false)
  }

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && email && password && !loading) doLogin(email, password)
  }

  const isE = hovered === 'email'
  const isP = hovered === 'password'
  const isF = hovered === 'footer'
  const b   = BAND[hovered]

  return (
    <div
      style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2.5rem 1rem',
        background: 'linear-gradient(135deg, #ede9fe 0%, #ddd6fe 50%, #c4b5fd 100%)',
      }}
    >
      {/* Brand */}
      <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
        <p style={{ fontSize: '1.875rem', fontWeight: 800, color: DP, margin: 0 }}>StillSpace</p>
        <p style={{ fontSize: '0.875rem', color: P, marginTop: '0.25rem' }}>Mental health support for students</p>
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
          border: `2px solid ${DP}`,
          borderBottomLeftRadius: '1.5em',
          borderTopRightRadius: '1.5em',
          boxShadow: `-10px 0px 0px ${DP}, -10px 5px 5px rgba(0,0,0,0.2)`,
          overflow: 'hidden',
          position: 'relative',
          transition: 'width 0.25s ease, height 0.25s ease',
          fontSize: '16px',
        }}
      >
        {/* Sliding purple band */}
        <div style={{
          width: '100%',
          backgroundColor: P,
          position: 'absolute',
          top: 0,
          left: 0,
          zIndex: 1,
          boxShadow: `inset 5px 0px ${DP}`,
          transition: 'height 0.5s ease, transform 0.5s ease',
          ...b,
        }} />

        {/* White corner cutout — top-right notch */}
        <div style={{
          width: '3.5em',
          height: '3.5em',
          position: 'absolute',
          top: '2.5px',
          right: '2.5px',
          zIndex: 2,
          borderTopRightRadius: '1.25em',
          boxShadow: '35px -35px 0px -1px white',
          pointerEvents: 'none',
        }} />

        {/* ── LOGIN header ─────────────────────────────────────────────── */}
        <div style={{
          position: 'relative',
          zIndex: 2,
          width: '100%',
          height: '3.5em',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          pointerEvents: 'none',
        }}>
          <p style={{ position: 'absolute', top: '0.35em', fontSize: '1.5em', fontWeight: 'bold', color: 'white', zIndex: 2, margin: 0 }}>
            LOGIN
          </p>
          <p style={{
            position: 'absolute',
            top: '62%',
            left: '1em',
            fontSize: '0.72em',
            fontWeight: 'bold',
            margin: 0,
            zIndex: 1,
            color: (isE || isP || isF) ? 'white' : P,
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
            marginTop: '1em',
            transition: 'padding 0.25s ease',
          }}
        >
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={onKey}
            placeholder="EMAIL"
            autoComplete="email"
            className={isE ? 'login-input-active' : 'login-input-default'}
            style={{
              width: '100%',
              border: `2px solid ${isE ? 'white' : P}`,
              borderRadius: '0.5em',
              height: isE ? '3em' : '2.5em',
              paddingLeft: '1em',
              paddingRight: '0.5em',
              fontSize: '0.9em',
              outline: 'none',
              boxShadow: '0px 5px 5px -3px rgba(0,0,0,0.2)',
              color: isE ? 'white' : P,
              backgroundColor: isE ? P : 'white',
              transition: 'all 0.4s ease',
            }}
          />
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
            transition: 'padding 0.25s ease',
          }}
        >
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={onKey}
            placeholder="PASSWORD"
            autoComplete="current-password"
            className={isP ? 'login-input-active' : 'login-input-default'}
            style={{
              width: '100%',
              border: `2px solid ${isP ? 'white' : P}`,
              borderRadius: '0.5em',
              height: isP ? '3em' : '2.5em',
              paddingLeft: '1em',
              paddingRight: '0.5em',
              fontSize: '0.9em',
              outline: 'none',
              boxShadow: '0px 5px 5px -3px rgba(0,0,0,0.2)',
              color: isP ? 'white' : P,
              backgroundColor: isP ? P : 'white',
              transition: 'all 0.4s ease',
            }}
          />
          <span style={{
            marginTop: '0.5em',
            fontSize: '0.8em',
            fontWeight: 'bold',
            color: isP ? 'white' : P,
            transition: 'color 0.25s ease',
            userSelect: 'none',
          }}>
            Forgot password?
          </span>
        </div>

        {/* ── Footer / button area ──────────────────────────────────────── */}
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
            transition: 'padding 0.25s ease',
          }}
        >
          <button
            onClick={() => { if (!loading && email && password) doLogin(email, password) }}
            disabled={loading || !email || !password}
            style={{
              width: '100%',
              border: `2px solid ${isF ? 'white' : P}`,
              borderRadius: '0.5em',
              height: isF ? '3em' : '2.5em',
              fontSize: '0.95em',
              color: 'white',
              fontWeight: 'bold',
              backgroundColor: P,
              boxShadow: '0px 5px 5px -3px rgba(0,0,0,0.2)',
              cursor: (loading || !email || !password) ? 'not-allowed' : 'pointer',
              opacity: (loading || !email || !password) ? 0.65 : 1,
              transition: 'all 0.25s ease',
            }}
          >
            {loading ? 'Signing in…' : 'Log In'}
          </button>
          <div style={{ marginTop: '0.5em', display: 'flex', alignItems: 'center', gap: '0.25em' }}>
            <p style={{ margin: 0, fontSize: '0.8em', color: isF ? 'white' : P, transition: 'color 0.25s ease' }}>
              Don&apos;t have an account?
            </p>
            <Link href="/register" style={{
              fontSize: '0.8em',
              fontWeight: 'bold',
              color: isF ? 'white' : P,
              textDecoration: 'none',
              paddingLeft: '0.1em',
              transition: 'color 0.25s ease',
            }}>
              Sign Up
            </Link>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            position: 'absolute',
            bottom: '0.5em',
            left: '8%',
            right: '8%',
            zIndex: 10,
            backgroundColor: 'rgba(255,255,255,0.97)',
            border: '1px solid #fca5a5',
            borderRadius: '0.4em',
            padding: '0.3em 0.5em',
            textAlign: 'center',
          }}>
            <p style={{ margin: 0, color: '#dc2626', fontSize: '0.65em' }}>{error}</p>
          </div>
        )}
      </div>

      {/* ── Demo accounts ────────────────────────────────────────────────── */}
      <div style={{ marginTop: '1.5em', width: '15.5em' }}>
        <p style={{
          margin: '0 0 0.6em',
          color: P,
          fontSize: '0.65em',
          textAlign: 'center',
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
                backgroundColor: 'rgba(96,65,191,0.1)',
                border: `1px solid rgba(96,65,191,0.35)`,
                borderRadius: '0.5em',
                padding: '0.4em 0.2em',
                fontSize: '0.72em',
                color: P,
                fontWeight: 'bold',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.5 : 1,
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgba(96,65,191,0.2)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgba(96,65,191,0.1)' }}
            >
              {acc.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
