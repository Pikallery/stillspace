import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export type UserRole = 'student' | 'counsellor' | 'admin'

export interface User {
  id: string
  email: string
  role: UserRole
  name: string
  is_banned: boolean
}
