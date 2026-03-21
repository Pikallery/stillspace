'use client'
import { motion } from 'framer-motion'
import { motivationalQuotes } from '@/lib/mock-data'

export function MotivationTicker() {
  const doubled = [...motivationalQuotes, ...motivationalQuotes]

  return (
    // hidden below 360px; on mobile sits above the bottom nav (bottom-16 = 64px)
    // on md+ no bottom nav so sits at bottom-0
    <div className="hidden min-[360px]:block fixed bottom-16 md:bottom-0
                    left-0 right-0 z-40
                    bg-gradient-to-r from-purple-900/80 to-indigo-900/80
                    backdrop-blur-sm border-t border-purple-500/20 py-2 overflow-hidden">
      <motion.div
        className="flex gap-12 whitespace-nowrap"
        animate={{ x: [0, -52 * motivationalQuotes.length * 8] }}
        transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
      >
        {doubled.map((quote, i) => (
          <span key={i} className="text-xs sm:text-sm text-purple-200 font-medium px-4 shrink-0">
            {quote}
          </span>
        ))}
      </motion.div>
    </div>
  )
}
