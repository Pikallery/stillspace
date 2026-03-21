'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Phone, PhoneOff, PhoneIncoming, Mic, MicOff, AlertCircle } from 'lucide-react'

type CallStatus = 'idle' | 'connecting' | 'ringing' | 'active' | 'incoming'

interface CallOverlayProps {
  myId: string
  targetId: string
  targetName: string
}

export function useCall({ myId, targetId, targetName }: CallOverlayProps) {
  const deviceRef = useRef<import('@twilio/voice-sdk').Device | null>(null)
  const callRef = useRef<import('@twilio/voice-sdk').Call | null>(null)
  const [status, setStatus] = useState<CallStatus>('idle')
  const [deviceReady, setDeviceReady] = useState(false)
  const [callError, setCallError] = useState<string | null>(null)
  const [muted, setMuted] = useState(false)
  const [duration, setDuration] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [incomingCallFrom, setIncomingCallFrom] = useState<string | null>(null)

  const startTimer = () => {
    timerRef.current = setInterval(() => setDuration(d => d + 1), 1000)
  }
  const stopTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    setDuration(0)
  }

  const setupCallListeners = useCallback((call: import('@twilio/voice-sdk').Call) => {
    call.on('accept', () => { setStatus('active'); startTimer() })
    call.on('disconnect', () => { setStatus('idle'); stopTimer(); callRef.current = null })
    call.on('cancel', () => { setStatus('idle'); stopTimer(); callRef.current = null })
    call.on('reject', () => { setStatus('idle'); stopTimer(); callRef.current = null })
    call.on('error', (err: { message?: string }) => {
      setCallError(err?.message ?? 'Call failed')
      setStatus('idle')
      stopTimer()
      callRef.current = null
    })
  }, [])

  useEffect(() => {
    if (!myId) return
    let device: import('@twilio/voice-sdk').Device

    const init = async () => {
      try {
        const { Device } = await import('@twilio/voice-sdk')
        const res = await fetch('/api/twilio/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: myId }),
        })
        if (!res.ok) { setCallError('Failed to get call token'); return }
        const { token } = await res.json()

        device = new Device(token, { logLevel: 1 })
        device.on('registered', () => setDeviceReady(true))
        device.on('unregistered', () => setDeviceReady(false))
        device.on('error', (err: { message?: string }) => {
          setCallError(err?.message ?? 'Device error')
          setDeviceReady(false)
        })
        device.on('incoming', (call: import('@twilio/voice-sdk').Call) => {
          callRef.current = call
          setIncomingCallFrom(call.parameters.From ?? 'Unknown')
          setStatus('incoming')
          setupCallListeners(call)
        })
        device.register()
        deviceRef.current = device
      } catch (err) {
        setCallError(err instanceof Error ? err.message : 'Failed to initialize calling')
      }
    }

    init()
    return () => { device?.destroy(); stopTimer(); setDeviceReady(false) }
  }, [myId, setupCallListeners])

  const makeCall = useCallback(async () => {
    setCallError(null)
    if (!deviceRef.current) { setCallError('Call device not ready yet'); return }
    if (!targetId) { setCallError('No recipient selected'); return }
    if (!deviceReady) { setCallError('Connecting to call service…'); return }
    setStatus('connecting')
    try {
      const call = await deviceRef.current.connect({ params: { To: targetId } })
      callRef.current = call
      setStatus('ringing')
      setupCallListeners(call)
    } catch (err) {
      setStatus('idle')
      setCallError(err instanceof Error ? err.message : 'Could not start call')
    }
  }, [targetId, targetName, deviceReady, setupCallListeners])

  const acceptCall = useCallback(() => {
    callRef.current?.accept()
  }, [])

  const rejectCall = useCallback(() => {
    callRef.current?.reject()
    setStatus('idle')
    setIncomingCallFrom(null)
  }, [])

  const hangUp = useCallback(() => {
    callRef.current?.disconnect()
    deviceRef.current?.disconnectAll()
    setStatus('idle')
    stopTimer()
    setIncomingCallFrom(null)
  }, [])

  const toggleMute = useCallback(() => {
    if (!callRef.current) return
    const next = !muted
    callRef.current.mute(next)
    setMuted(next)
  }, [muted])

  const formatDuration = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  return {
    status, muted, duration: formatDuration(duration),
    incomingCallFrom, targetName, deviceReady, callError,
    makeCall, acceptCall, rejectCall, hangUp, toggleMute,
    clearError: () => setCallError(null),
  }
}

export function CallOverlay({
  status, muted, duration, incomingCallFrom, targetName,
  callError, makeCall, acceptCall, rejectCall, hangUp, toggleMute, clearError,
}: ReturnType<typeof useCall>) {
  return (
    <>
      {/* Error toast */}
      <AnimatePresence>
        {callError && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-24 md:bottom-6 inset-x-4 md:inset-x-auto md:right-6 md:w-80 z-50 bg-red-900/90 border border-red-700 rounded-xl p-3 flex items-start gap-2"
          >
            <AlertCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
            <p className="text-red-200 text-sm flex-1">{callError}</p>
            <button onClick={clearError} className="text-red-400 hover:text-red-200 text-xs shrink-0">✕</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Call overlay */}
      <AnimatePresence>
        {status !== 'idle' && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            className="fixed inset-x-4 bottom-24 md:bottom-6 md:right-6 md:left-auto md:w-80 z-50 bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl p-5"
          >
            {/* Incoming call */}
            {status === 'incoming' && (
              <div className="text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-indigo-700 flex items-center justify-center mx-auto">
                  <PhoneIncoming size={24} className="text-white animate-bounce" />
                </div>
                <div>
                  <p className="text-white font-semibold">Incoming Call</p>
                  <p className="text-gray-400 text-sm">{incomingCallFrom ?? targetName}</p>
                </div>
                <div className="flex gap-3 justify-center">
                  <button onClick={rejectCall} className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center transition-colors">
                    <PhoneOff size={22} className="text-white" />
                  </button>
                  <button onClick={acceptCall} className="w-14 h-14 rounded-full bg-green-600 hover:bg-green-700 flex items-center justify-center transition-colors">
                    <Phone size={22} className="text-white" />
                  </button>
                </div>
              </div>
            )}

            {/* Outgoing / active */}
            {(status === 'connecting' || status === 'ringing' || status === 'active') && (
              <div className="text-center space-y-4">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto ${status === 'active' ? 'bg-green-700' : 'bg-indigo-700'}`}>
                  <Phone size={24} className={`text-white ${status !== 'active' ? 'animate-pulse' : ''}`} />
                </div>
                <div>
                  <p className="text-white font-semibold">{targetName}</p>
                  <p className="text-gray-400 text-sm">
                    {status === 'connecting' ? 'Connecting…' : status === 'ringing' ? 'Ringing…' : duration}
                  </p>
                </div>
                <div className="flex gap-3 justify-center">
                  {status === 'active' && (
                    <button onClick={toggleMute} className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${muted ? 'bg-amber-600 hover:bg-amber-700' : 'bg-gray-700 hover:bg-gray-600'}`}>
                      {muted ? <MicOff size={18} className="text-white" /> : <Mic size={18} className="text-white" />}
                    </button>
                  )}
                  <button onClick={hangUp} className="w-12 h-12 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center transition-colors">
                    <PhoneOff size={18} className="text-white" />
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export function CallButton({ onClick, disabled, ready }: { onClick: () => void; disabled?: boolean; ready?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-9 h-9 rounded-full border flex items-center justify-center transition-colors disabled:opacity-40 ${
        ready
          ? 'bg-green-700/30 hover:bg-green-700/60 border-green-700/50'
          : 'bg-gray-700/30 hover:bg-gray-700/60 border-gray-600/50'
      }`}
      title={ready ? 'Start voice call' : 'Connecting to call service…'}
    >
      <Phone size={16} className={ready ? 'text-green-400' : 'text-gray-500'} />
    </button>
  )
}
