'use client'
// No Claude API calls in admin
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PageTransition } from '@/components/ui/page-transition'
import { mockCounsellors } from '@/lib/mock-data'
import { Star, CheckCircle, XCircle, Ban, ShieldCheck } from 'lucide-react'

type CounsellorStatus = 'pending' | 'verified' | 'rejected'

export default function AdminCounsellorsPage() {
  const [statuses, setStatuses] = useState<Record<string, CounsellorStatus>>({
    '1': 'verified',
    '2': 'verified',
    '3': 'pending',
    '4': 'pending',
  })
  const [banned, setBanned] = useState<Set<string>>(new Set())

  const updateStatus = (id: string, status: CounsellorStatus) => {
    setStatuses(prev => ({ ...prev, [id]: status }))
  }

  const toggleBan = (id: string) => {
    setBanned(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const statusColors = {
    pending: 'bg-amber-900/50 text-amber-300 border-amber-700/50',
    verified: 'bg-green-900/50 text-green-300 border-green-700/50',
    rejected: 'bg-red-900/50 text-red-300 border-red-700/50',
  }

  return (
    <PageTransition>
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Counsellors</h1>
          <p className="text-gray-400 text-sm mt-1">Verify, manage, and monitor counsellors</p>
        </div>

        <div className="space-y-4">
          {mockCounsellors.map((counsellor, i) => {
            const status = statuses[counsellor.id] || 'pending'
            const isBanned = banned.has(counsellor.id)

            return (
              <motion.div
                key={counsellor.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className={`bg-gray-900/50 border-gray-800 ${isBanned ? 'opacity-60' : ''}`}>
                  <CardContent className="pt-5 pb-5">
                    <div className="flex items-start gap-4 flex-wrap">
                      {/* Avatar */}
                      <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0 ${
                        isBanned ? 'bg-gray-700' : 'bg-gradient-to-br from-indigo-500 to-purple-600'
                      }`}>
                        {counsellor.name.charAt(4)}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h3 className={`font-semibold ${isBanned ? 'text-gray-400 line-through' : 'text-white'}`}>
                            {counsellor.name}
                          </h3>
                          <Badge className={`text-xs ${statusColors[status]}`}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </Badge>
                          {isBanned && (
                            <Badge className="text-xs bg-red-900/50 text-red-300 border-red-700/50">Banned</Badge>
                          )}
                          <div className="flex items-center gap-1">
                            <Star size={12} className="text-amber-400 fill-amber-400" />
                            <span className="text-amber-300 text-sm">{counsellor.rating}</span>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1 mb-2">
                          {counsellor.specializations.map(s => (
                            <Badge key={s} variant="secondary" className="text-xs bg-gray-800 text-gray-300">{s}</Badge>
                          ))}
                        </div>
                        <p className="text-gray-400 text-sm">{counsellor.bio}</p>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-2 flex-shrink-0">
                        {status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => updateStatus(counsellor.id, 'verified')}
                              className="bg-green-700 hover:bg-green-600 text-white text-xs"
                            >
                              <ShieldCheck size={12} className="mr-1" />
                              Verify
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => updateStatus(counsellor.id, 'rejected')}
                              className="bg-red-900/50 hover:bg-red-900 text-red-300 text-xs border border-red-700/50"
                            >
                              <XCircle size={12} className="mr-1" />
                              Reject
                            </Button>
                          </>
                        )}
                        {status === 'verified' && !isBanned && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateStatus(counsellor.id, 'pending')}
                            className="border-amber-700/50 text-amber-400 hover:bg-amber-900/20 text-xs"
                          >
                            <CheckCircle size={12} className="mr-1" />
                            Verified
                          </Button>
                        )}
                        {status === 'rejected' && (
                          <Button
                            size="sm"
                            onClick={() => updateStatus(counsellor.id, 'pending')}
                            className="bg-gray-700 hover:bg-gray-600 text-white text-xs"
                          >
                            Re-review
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleBan(counsellor.id)}
                          className={`text-xs ${isBanned
                            ? 'border-green-700/50 text-green-400 hover:bg-green-900/20'
                            : 'border-red-700/50 text-red-400 hover:bg-red-900/20'
                          }`}
                        >
                          <Ban size={12} className="mr-1" />
                          {isBanned ? 'Unblock' : 'Ban'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </div>
    </PageTransition>
  )
}
