'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { motivationalQuotes } from '@/lib/mock-data'

export function LoadingCard({ isVisible }: { isVisible: boolean }) {
  const quote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="text-center p-8 max-w-md"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="w-12 h-12 border-4 border-purple-400 border-t-transparent rounded-full mx-auto mb-6"
            />
            <p className="text-white text-xl font-semibold">{quote}</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
