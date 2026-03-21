import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  const { student_id, counsellor_id, conversation_id, rating, comment, tags } = await req.json()

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key || key === 'placeholder_service_role_key') {
    return NextResponse.json({ error: 'Not configured' }, { status: 500 })
  }

  const db = createClient(url, key)

  const { error } = await db.from('feedback').insert({
    student_id, counsellor_id, conversation_id,
    rating, comment: comment || null, tags: tags?.length ? tags : null,
  })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Recompute counsellor's avg rating and persist to profiles
  const { data: allFeedback } = await db
    .from('feedback')
    .select('rating')
    .eq('counsellor_id', counsellor_id)

  if (allFeedback && allFeedback.length > 0) {
    const avg = allFeedback.reduce((s: number, f: { rating: number }) => s + f.rating, 0) / allFeedback.length
    await db.from('profiles').update({ rating: parseFloat(avg.toFixed(1)) }).eq('id', counsellor_id)
  }

  return NextResponse.json({ ok: true })
}

export async function GET(req: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key || key === 'placeholder_service_role_key') {
    return NextResponse.json({ feedback: [] })
  }

  const { searchParams } = new URL(req.url)
  const counsellorId = searchParams.get('counsellor_id')
  const limit = parseInt(searchParams.get('limit') ?? '50')

  const db = createClient(url, key)
  let query = db
    .from('feedback')
    .select('*, student:profiles!feedback_student_id_fkey(name), counsellor:profiles!feedback_counsellor_id_fkey(name)')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (counsellorId) query = query.eq('counsellor_id', counsellorId)

  const { data } = await query
  return NextResponse.json({ feedback: data ?? [] })
}
