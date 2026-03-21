'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { MoreHorizontal } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface BottomNavItem {
  href: string
  label: string
  icon: LucideIcon
}

export interface BottomNavExtra {
  href: string
  label: string
  icon: LucideIcon
}

interface BottomNavProps {
  items: BottomNavItem[]          // exactly 4 direct links
  extras?: BottomNavExtra[]       // optional overflow items in "More" sheet
  accentColor?: string            // e.g. 'purple' | 'indigo' | 'blue'
}

export function BottomNav({ items, extras, accentColor = 'purple' }: BottomNavProps) {
  const pathname = usePathname()
  const [sheetOpen, setSheetOpen] = useState(false)

  const activeClass = `text-${accentColor}-400`
  const inactiveClass = 'text-gray-500'
  const activeBg = `bg-${accentColor}-500/10`

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 h-16
                    bg-gray-950/95 border-t border-gray-800 backdrop-blur-xl
                    flex items-stretch safe-area-bottom">
      {items.map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex-1 flex flex-col items-center justify-center gap-0.5 relative
                       min-h-[44px] transition-colors duration-150"
          >
            {isActive && (
              <motion.div
                layoutId="bottom-nav-indicator"
                className={`absolute inset-x-2 inset-y-1 rounded-xl ${activeBg}`}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <Icon
              size={22}
              className={`relative z-10 transition-colors ${isActive ? activeClass : inactiveClass}`}
            />
            <span className={`relative z-10 text-[10px] font-medium transition-colors ${isActive ? activeClass : inactiveClass}`}>
              {item.label}
            </span>
          </Link>
        )
      })}

      {extras && extras.length > 0 && (
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger className="flex-1 flex flex-col items-center justify-center gap-0.5 min-h-[44px]">
            <MoreHorizontal size={22} className="text-gray-500" />
            <span className="text-[10px] font-medium text-gray-500">More</span>
          </SheetTrigger>
          <SheetContent
            side="bottom"
            className="bg-gray-950 border-t border-gray-800 rounded-t-2xl pb-safe"
          >
            <SheetHeader className="mb-4">
              <SheetTitle className="text-white text-base">More</SheetTitle>
            </SheetHeader>
            <div className="grid grid-cols-4 gap-3 pb-6">
              {extras.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSheetOpen(false)}
                    className={`flex flex-col items-center gap-2 p-3 rounded-xl min-h-[64px]
                                transition-colors ${isActive ? `${activeBg} ${activeClass}` : 'bg-gray-900 text-gray-400 active:bg-gray-800'}`}
                  >
                    <Icon size={22} />
                    <span className="text-xs font-medium text-center leading-tight">{item.label}</span>
                  </Link>
                )
              })}
            </div>
          </SheetContent>
        </Sheet>
      )}
    </nav>
  )
}
