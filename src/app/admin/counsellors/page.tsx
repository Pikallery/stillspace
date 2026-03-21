'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PageTransition } from '@/components/ui/page-transition'
import { createClient, type Profile } from '@/lib/supabase'
import { Star, XCircle, Ban, ShieldCheck } from 'lucide-react'

export default function AdminCounsellorsPage() {
  const supabase = createClient()
  const [counsellors, setCounsellors] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'counsellor')
        .order('created_at', { ascending: false })
      setCounsellors((data as Profile[]) ?? [])
      setLoading(false)
    }
    load()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const setAvailable = async (counsellor: Profile, available: boolean) => {
    setBusyId(counsellor.id)
    await supabase.from('profiles').update({ is_available: available }).eq('id', counsellor.id)
    setCounsellors(prev => prev.map(c => c.id === counsellor.id ? { ...c, is_available: available } : c))
    setBusyId(null)
  }

  const toggleBan = async (counsellor: Profile) => {
    setBusyId(counsellor.id)
    const newBanned = !counsellor.is_banned
    await supabase.from('profiles').update({ is_banned: newBanned }).eq('id', counsellor.id)
    setCounsellors(prev => prev.map(c => c.id === counsellor.id ? { ...c, is_banned: newBanned } : c))
    setBusyId(null)
  }

  const statusColors = {
    available: 'bg-green-900/50 text-green-300 border-green-700/50',
    unavailable: 'bg-gray-800 text-gray-400 border-gray-700',
  }

  return (
    <PageTransition>
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Counsellors</h1>
          <p className="text-gray-400 text-sm mt-1">Manage and monitor counsellors on the platform</p>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <div key={i} className="h-24 rounded-xl bg-gray-900/50 animate-pulse" />)}
          </div>
        ) : counsellors.length === 0 ? (
          <p className="text-gray-500 text-center py-16 text-sm">No counsellors registered yet</p>
        ) : (
          <div className="space-y-4">
            {counsellors.map((counsellor, i) => (
              <motion.div
                key={counsellor.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                <Card className={`bg-gray-900/50 border-gray-800 ${counsellor.is_banned ? 'opacity-60' : ''}`}>
                  <CardContent className="pt-5 pb-5">
                    <div className="flex items-start gap-4 flex-wrap">
                      {/* Avatar */}
                      <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0 ${
                        counsellor.is_banned ? 'bg-gray-700' : 'bg-gradient-to-br from-indigo-500 to-purple-600'
                      }`}>
                        {counsellor.name.charAt(0)}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h3 className={`font-semibold ${counsellor.is_banned ? 'text-gray-400 line-through' : 'text-white'}`}>
                            {counsellor.name}
                          </h3>
                          <Badge className={`text-xs ${counsellor.is_available ? statusColors.available : statusColors.unavailable}`}>
                            {counsellor.is_available ? 'Available' : 'Unavailable'}
                          </Badge>
                          {counsellor.is_banned && (
                            <Badge className="text-xs bg-red-900/50 text-red-300 border-red-700/50">Banned</Badge>
                          )}
                          {counsellor.rating > 0 && (
                            <div className="flex items-center gap-1">
                              <Star size={12} className="text-amber-400 fill-amber-400" />
                              <span className="text-amber-300 text-sm">{counsellor.rating.toFixed(1)}</span>
                            </div>
                          )}
                        </div>
                        {counsellor.specializations && counsellor.specializations.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {counsellor.specializations.map(s => (
                              <Badge key={s} variant="secondary" className="text-xs bg-gray-800 text-gray-300">{s}</Badge>
                            ))}
                          </div>
                        )}
                        {counsellor.bio && (
                          <p className="text-gray-400 text-sm">{counsellor.bio}</p>
                        )}
                        <p className="text-gray-600 text-xs mt-1">{counsellor.email}</p>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-2 flex-shrink-0">
                        {!counsellor.is_banned && (
                          counsellor.is_available ? (
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={busyId === counsellor.id}
                              onClick={() => setAvailable(counsellor, false)}
                              className="border-amber-700/50 text-amber-400 hover:bg-amber-900/20 text-xs"
                            >
                              <XCircle size={12} className="mr-1" />
                              Set Unavailable
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              disabled={busyId === counsellor.id}
                              onClick={() => setAvailable(counsellor, true)}
                              className="bg-green-700 hover:bg-green-600 text-white text-xs"
                            >
                              <ShieldCheck size={12} className="mr-1" />
                              Set Available
                            </Button>
                          )
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={busyId === counsellor.id}
                          onClick={() => toggleBan(counsellor)}
                          className={`text-xs ${counsellor.is_banned
                            ? 'border-green-700/50 text-green-400 hover:bg-green-900/20'
                            : 'border-red-700/50 text-red-400 hover:bg-red-900/20'
                          }`}
                        >
                          <Ban size={12} className="mr-1" />
                          {counsellor.is_banned ? 'Unblock' : 'Ban'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </PageTransition>
  )
}
