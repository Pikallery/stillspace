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
  items: BottomNavItem[]
  extras?: BottomNavExtra[]
  accentColor?: string
}

export function BottomNav({ items, extras, accentColor = 'purple' }: BottomNavProps) {
  const pathname = usePathname()
  const [sheetOpen, setSheetOpen] = useState(false)

  const accentText = `text-${accentColor}-400`

  return (
    /* pointer-events-none on wrapper so the pill doesn't block taps on content beneath */
    <div className="md:hidden fixed bottom-5 inset-x-0 z-50 flex justify-center pointer-events-none">
      <nav
        className="pointer-events-auto flex items-center gap-0.5 px-2.5 py-2 rounded-full
                   bg-gray-900/95 border border-gray-700/50 backdrop-blur-2xl
                   shadow-[0_8px_40px_rgba(0,0,0,0.6)]"
      >
        {items.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex flex-col items-center justify-center w-[3.6rem] h-11 rounded-full gap-0.5"
            >
              {isActive && (
                <motion.div
                  layoutId="pill-glider"
                  className={`absolute inset-0 rounded-full bg-${accentColor}-500/15 border border-${accentColor}-500/20`}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <Icon
                size={19}
                className={`relative z-10 transition-colors ${isActive ? accentText : 'text-gray-500'}`}
              />
              <span
                className={`relative z-10 text-[9px] font-medium leading-none transition-colors ${
                  isActive ? accentText : 'text-gray-600'
                }`}
              >
                {item.label}
              </span>
            </Link>
          )
        })}

        {extras && extras.length > 0 && (
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger className="flex flex-col items-center justify-center w-[3.6rem] h-11 rounded-full gap-0.5">
              <MoreHorizontal size={19} className="text-gray-500" />
              <span className="text-[9px] font-medium text-gray-600">More</span>
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
                      className={`flex flex-col items-center gap-2 p-3 rounded-xl min-h-[64px] transition-colors ${
                        isActive
                          ? `bg-${accentColor}-500/15 ${accentText}`
                          : 'bg-gray-900 text-gray-400 active:bg-gray-800'
                      }`}
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
    </div>
  )
}
