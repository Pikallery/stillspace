'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<string>('student')
  const handleRoleChange = (value: string | null) => { if (value) setRole(value) }
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      // Demo: store role in localStorage and redirect
      localStorage.setItem('demo_role', role)
      localStorage.setItem('demo_name', email.split('@')[0] || 'User')
      await new Promise(r => setTimeout(r, 800))
      if (role === 'student') router.push('/student/dashboard')
      else if (role === 'counsellor') router.push('/counsellor/dashboard')
      else router.push('/admin')
    } catch {
      setError('Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const demoLogin = (demoRole: string, name: string) => {
    localStorage.setItem('demo_role', demoRole)
    localStorage.setItem('demo_name', name)
    if (demoRole === 'student') router.push('/student/dashboard')
    else if (demoRole === 'counsellor') router.push('/counsellor/dashboard')
    else router.push('/admin')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950/20 to-gray-950 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center mx-auto mb-4"
          >
            <span className="text-3xl">🧠</span>
          </motion.div>
          <h1 className="text-3xl font-bold text-white">StillSpace</h1>
          <p className="text-gray-400 mt-1">Your mental wellness companion</p>
        </div>

        <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white text-xl">Sign In</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500"
                  required
                />
              </div>
              <div>
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500"
                  required
                />
              </div>
              <div>
                <Select value={role} onValueChange={handleRoleChange}>
                  <SelectTrigger className="bg-gray-800/50 border-gray-700 text-white">
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="student" className="text-white hover:bg-gray-700">Student</SelectItem>
                    <SelectItem value="counsellor" className="text-white hover:bg-gray-700">Counsellor</SelectItem>
                    <SelectItem value="admin" className="text-white hover:bg-gray-700">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {error && <p className="text-red-400 text-sm">{error}</p>}
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            <div className="mt-4 text-center">
              <p className="text-gray-400 text-sm">
                Don&apos;t have an account?{' '}
                <Link href="/register" className="text-purple-400 hover:text-purple-300">
                  Register
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Demo Login Section */}
        <Card className="bg-gray-900/30 border-gray-800/50 backdrop-blur-sm mt-4">
          <CardContent className="pt-4">
            <p className="text-gray-400 text-sm text-center mb-3">Quick Demo Access</p>
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => demoLogin('student', 'Sai')}
                className="border-purple-700/50 text-purple-300 hover:bg-purple-900/30 text-xs"
              >
                Student Demo
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => demoLogin('counsellor', 'Dr. Sarah Chen')}
                className="border-indigo-700/50 text-indigo-300 hover:bg-indigo-900/30 text-xs"
              >
                Counsellor Demo
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => demoLogin('admin', 'Admin User')}
                className="border-blue-700/50 text-blue-300 hover:bg-blue-900/30 text-xs"
              >
                Admin Demo
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
