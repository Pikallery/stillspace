'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient, type UserRole } from '@/lib/supabase'
import { Eye, EyeOff, GraduationCap, Stethoscope, ChevronDown } from 'lucide-react'

// ── Constants ─────────────────────────────────────────────────────────────────

const COURSES = [
  'B.Tech / B.E.',
  'B.Sc',
  'B.Com',
  'B.A.',
  'BCA',
  'BBA',
  'M.Tech / M.E.',
  'M.Sc',
  'MCA',
  'MBA',
  'Ph.D',
  'Diploma',
  'Other',
]

const BRANCHES: Record<string, string[]> = {
  'B.Tech / B.E.': ['CSE', 'ECE', 'EEE', 'Mechanical', 'Civil', 'Chemical', 'IT', 'Aerospace', 'Biomedical', 'Other'],
  'M.Tech / M.E.': ['CSE', 'ECE', 'EEE', 'Mechanical', 'Civil', 'Chemical', 'IT', 'Other'],
  'B.Sc': ['Physics', 'Chemistry', 'Mathematics', 'Biology', 'Computer Science', 'Other'],
  'M.Sc': ['Physics', 'Chemistry', 'Mathematics', 'Biology', 'Computer Science', 'Other'],
}

const EXPERTISE_OPTIONS = [
  'Anxiety & Stress',
  'Depression',
  'Academic Pressure',
  'Relationship Issues',
  'Trauma & PTSD',
  'Grief & Loss',
  'Substance Abuse',
  'Eating Disorders',
  'Career Counselling',
  'Family Therapy',
  'Child & Adolescent',
  'Crisis Intervention',
]

const roles: { value: UserRole; label: string; desc: string; icon: React.ReactNode; color: string }[] = [
  {
    value: 'student',
    label: 'Student',
    desc: 'Access mental health tools, AI chat, and connect with counsellors',
    icon: <GraduationCap size={22} />,
    color: 'purple',
  },
  {
    value: 'counsellor',
    label: 'Counsellor',
    desc: 'Support students, manage sessions, and track mental health trends',
    icon: <Stethoscope size={22} />,
    color: 'indigo',
  },
]

// ── Reusable field ─────────────────────────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm text-gray-300 font-medium">{label}</label>
      {children}
    </div>
  )
}

const inputCls = 'bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-purple-500 min-h-[44px]'
const selectCls = `${inputCls} w-full rounded-md px-3 py-2 text-sm appearance-none pr-9`

// ── Main component ─────────────────────────────────────────────────────────────

export default function RegisterPage() {
  const router = useRouter()
  const supabase = createClient()

  const [step, setStep] = useState<'role' | 'details'>('role')
  const [role, setRole] = useState<UserRole>('student')

  // Shared
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [mobile, setMobile] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // Student-specific
  const [college, setCollege] = useState('')
  const [course, setCourse] = useState('')
  const [regNumber, setRegNumber] = useState('')
  const [section, setSection] = useState('')
  const [branch, setBranch] = useState('')

  // Counsellor-specific
  const [expertise, setExpertise] = useState<string[]>([])
  const [experience, setExperience] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const toggleExpertise = (item: string) => {
    setExpertise(prev => prev.includes(item) ? prev.filter(e => e !== item) : [...prev, item])
  }

  const hasBranches = BRANCHES[course] !== undefined

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !email || !password || !mobile) return
    if (password.length < 6) { setError('Password must be at least 6 characters'); return }
    if (role === 'student' && !college) { setError('Please enter your college name'); return }
    if (role === 'student' && !course) { setError('Please select your course'); return }
    if (role === 'counsellor' && expertise.length === 0) { setError('Please select at least one area of expertise'); return }

    setLoading(true)
    setError('')

    const meta: Record<string, string> = { name, role, mobile }

    if (role === 'student') {
      meta.college = college
      meta.course = course
      if (regNumber) meta.reg_number = regNumber
      if (section) meta.section = section
      if (branch) meta.branch = branch
    } else {
      meta.experience = experience
      meta.specializations = expertise.join(',')
    }

    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: meta },
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    if (data.session) {
      if (role === 'student') router.push('/student/dashboard')
      else router.push('/counsellor/dashboard')
    } else {
      setSuccess(true)
    }
    setLoading(false)
  }

  // ── Success screen ──────────────────────────────────────────────────────────

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950/20 to-gray-950 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-sm text-center space-y-4"
        >
          <div className="text-5xl">📧</div>
          <h2 className="text-xl font-bold text-white">Check your email</h2>
          <p className="text-gray-400 text-sm">
            We sent a confirmation link to <span className="text-purple-300">{email}</span>. Click it to activate your account.
          </p>
          <Link href="/login">
            <Button variant="outline" className="border-gray-700 text-gray-300 mt-4">
              Back to Sign In
            </Button>
          </Link>
        </motion.div>
      </div>
    )
  }

  // ── Page ────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950/20 to-gray-950 flex items-center justify-center px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-7">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center mx-auto mb-3">
            <span className="text-2xl">🧠</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Create Account</h1>
          <p className="text-gray-400 text-sm mt-1">Join StillSpace</p>
        </div>

        <AnimatePresence mode="wait">

          {/* ── Step 1: Role ── */}
          {step === 'role' && (
            <motion.div key="role" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              <p className="text-gray-300 text-sm text-center">I am a…</p>
              <div className="space-y-3">
                {roles.map(r => (
                  <button
                    key={r.value}
                    onClick={() => setRole(r.value)}
                    className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${
                      role === r.value
                        ? r.color === 'purple'
                          ? 'bg-purple-900/30 border-purple-500/60 text-white'
                          : 'bg-indigo-900/30 border-indigo-500/60 text-white'
                        : 'bg-gray-900/40 border-gray-800 text-gray-400 hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 ${role === r.value ? (r.color === 'purple' ? 'text-purple-400' : 'text-indigo-400') : 'text-gray-500'}`}>
                        {r.icon}
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{r.label}</p>
                        <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{r.desc}</p>
                      </div>
                      {role === r.value && (
                        <div className="ml-auto mt-0.5">
                          <div className={`w-4 h-4 rounded-full flex items-center justify-center ${r.color === 'purple' ? 'bg-purple-500' : 'bg-indigo-500'}`}>
                            <div className="w-1.5 h-1.5 rounded-full bg-white" />
                          </div>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
              <Button
                onClick={() => setStep('details')}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white min-h-[44px] mt-2"
              >
                Continue as {role === 'student' ? 'Student' : 'Counsellor'}
              </Button>
            </motion.div>
          )}

          {/* ── Step 2: Details ── */}
          {step === 'details' && (
            <motion.div key="details" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
              <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6 backdrop-blur-sm">
                <button
                  onClick={() => setStep('role')}
                  className="text-gray-500 hover:text-gray-300 text-xs mb-4 flex items-center gap-1"
                >
                  ← Change role
                </button>

                <div className="mb-5 px-3 py-2 bg-gray-800/50 rounded-lg">
                  <p className="text-xs text-gray-400">
                    Registering as{' '}
                    <span className="font-medium capitalize" style={{ color: role === 'student' ? '#c4b5fd' : '#a5b4fc' }}>
                      {role}
                    </span>
                  </p>
                </div>

                <form onSubmit={handleRegister} className="space-y-4">

                  {/* ── Shared: Name, Email, Mobile ── */}
                  <Field label="Full Name">
                    <Input value={name} onChange={e => setName(e.target.value)}
                      placeholder={role === 'counsellor' ? 'Dr. Jane Smith' : 'Your full name'}
                      className={inputCls} required autoComplete="name" />
                  </Field>

                  <Field label="Email Address">
                    <Input type="email" value={email} onChange={e => setEmail(e.target.value)}
                      placeholder={role === 'student' ? 'you@university.edu' : 'counsellor@domain.com'}
                      className={inputCls} required autoComplete="email" />
                  </Field>

                  <Field label="Mobile Number">
                    <Input type="tel" value={mobile} onChange={e => setMobile(e.target.value)}
                      placeholder="+91 98765 43210"
                      className={inputCls} required autoComplete="tel" />
                  </Field>

                  {/* ── Student fields ── */}
                  {role === 'student' && (
                    <>
                      <Field label="College / University">
                        <Input value={college} onChange={e => setCollege(e.target.value)}
                          placeholder="e.g. Anna University"
                          className={inputCls} required />
                      </Field>

                      <Field label="Course">
                        <div className="relative">
                          <select
                            value={course}
                            onChange={e => { setCourse(e.target.value); setBranch('') }}
                            className={selectCls}
                            required
                          >
                            <option value="" disabled>Select your course</option>
                            {COURSES.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                          <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                        </div>
                      </Field>

                      {/* These appear after course is picked */}
                      <AnimatePresence>
                        {course && (
                          <motion.div
                            key="academic-details"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-4 overflow-hidden"
                          >
                            <Field label="Registration Number">
                              <Input value={regNumber} onChange={e => setRegNumber(e.target.value)}
                                placeholder="e.g. 21CS1234"
                                className={inputCls} />
                            </Field>

                            <Field label="Section">
                              <Input value={section} onChange={e => setSection(e.target.value)}
                                placeholder="e.g. A, B, C"
                                className={inputCls} />
                            </Field>

                            <Field label="Branch / Specialisation">
                              {hasBranches ? (
                                <div className="relative">
                                  <select
                                    value={branch}
                                    onChange={e => setBranch(e.target.value)}
                                    className={selectCls}
                                  >
                                    <option value="">Select branch</option>
                                    {BRANCHES[course].map(b => <option key={b} value={b}>{b}</option>)}
                                  </select>
                                  <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                                </div>
                              ) : (
                                <Input value={branch} onChange={e => setBranch(e.target.value)}
                                  placeholder="e.g. Mathematics, Commerce"
                                  className={inputCls} />
                              )}
                            </Field>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </>
                  )}

                  {/* ── Counsellor fields ── */}
                  {role === 'counsellor' && (
                    <>
                      <Field label="Areas of Expertise">
                        <div className="flex flex-wrap gap-2 mt-1">
                          {EXPERTISE_OPTIONS.map(item => (
                            <button
                              key={item}
                              type="button"
                              onClick={() => toggleExpertise(item)}
                              className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                                expertise.includes(item)
                                  ? 'bg-indigo-700/60 border-indigo-500 text-indigo-200'
                                  : 'bg-gray-800/50 border-gray-700 text-gray-400 hover:border-gray-500'
                              }`}
                            >
                              {item}
                            </button>
                          ))}
                        </div>
                        {expertise.length > 0 && (
                          <p className="text-gray-600 text-xs mt-1.5">{expertise.length} selected</p>
                        )}
                      </Field>

                      <Field label="Experience">
                        <Input value={experience} onChange={e => setExperience(e.target.value)}
                          placeholder="e.g. 5 years in campus counselling"
                          className={inputCls} />
                      </Field>
                    </>
                  )}

                  {/* ── Password ── */}
                  <Field label="Password">
                    <div className="relative">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        value={password} onChange={e => setPassword(e.target.value)}
                        placeholder="Min. 6 characters"
                        className={`${inputCls} pr-11`}
                        required autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(v => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </Field>

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
                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white min-h-[44px] font-medium mt-2"
                  >
                    {loading ? 'Creating account…' : 'Create Account'}
                  </Button>
                </form>
              </div>
            </motion.div>
          )}

        </AnimatePresence>

        <p className="text-center text-gray-500 text-sm mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-purple-400 hover:text-purple-300 font-medium">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
