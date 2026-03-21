import { createServerClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  // Refresh the session cookie so it doesn't expire mid-session
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name) => req.cookies.get(name)?.value,
        set: () => {},
        remove: () => {},
      },
    }
  )
  await supabase.auth.getSession()
  return res
}

export const config = {
  matcher: [
    // Run on all routes except static assets
    '/((?!_next/static|_next/image|favicon.ico|sprites|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
