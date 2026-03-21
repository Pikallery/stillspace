import { createClient as _createClient } from '@supabase/supabase-js'

// ── Types ──────────────────────────────────────────────────────────────────────

export type UserRole = 'student' | 'counsellor' | 'admin'

export interface Profile {
  id: string
  name: string
  role: UserRole
  email: string
  mobile: string | null
  is_available: boolean
  is_banned: boolean
  bio: string | null
  specializations: string[] | null
  rating: number
  triage_score: number | null
  triage_level: string | null
  // Student fields
  college: string | null
  course: string | null
  reg_number: string | null
  section: string | null
  branch: string | null
  // Counsellor fields
  experience: string | null
  created_at: string
}

export interface DbMessage {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  created_at: string
  sender?: Profile
}

export interface Conversation {
  id: string
  student_id: string
  counsellor_id: string
  created_at: string
  student?: Profile
  counsellor?: Profile
}

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'created_at' | 'is_banned' | 'rating' | 'triage_score' | 'triage_level' | 'mobile' | 'college' | 'course' | 'reg_number' | 'section' | 'branch' | 'experience'> & {
          is_banned?: boolean
          rating?: number
          triage_score?: number | null
          triage_level?: string | null
          mobile?: string | null
          college?: string | null
          course?: string | null
          reg_number?: string | null
          section?: string | null
          branch?: string | null
          experience?: string | null
        }
        Update: Partial<Omit<Profile, 'id' | 'created_at'>>
      }
      conversations: {
        Row: Conversation
        Insert: { student_id: string; counsellor_id: string }
        Update: never
      }
      messages: {
        Row: DbMessage
        Insert: { conversation_id: string; sender_id: string; content: string }
        Update: never
      }
      triage_results: {
        Row: {
          id: string
          student_id: string
          score: number
          level: string
          answers: unknown
          created_at: string
        }
        Insert: { student_id: string; score: number; level: string; answers?: unknown }
        Update: never
      }
    }
  }
}

// ── Client factory ─────────────────────────────────────────────────────────────

export const createClient = () => _createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
