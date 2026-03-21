import { anthropic } from '@/lib/anthropic'
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(req: NextRequest) {
  const { answers } = await req.json()

  let result: { score: number; level: string; summary: string }

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 500,
      messages: [{
        role: 'user',
        content: `Score these student mental health survey answers 1-10. Return only JSON: {"score": number, "level": "ai"|"counsellor"|"emergency", "summary": string}

Survey answers: ${JSON.stringify(answers)}`
      }]
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    result = jsonMatch ? JSON.parse(jsonMatch[0]) : { score: 5, level: 'counsellor', summary: 'Assessment complete' }
  } catch {
    const total = (answers as number[]).reduce((a: number, b: number) => a + b, 0)
    const avg = total / answers.length
    const score = Math.min(10, Math.max(1, Math.round(avg * 3 + 1)))
    result = {
      score,
      level: score <= 4 ? 'ai' : score <= 7 ? 'counsellor' : 'emergency',
      summary: 'Assessment complete. Based on your responses, we have determined your support level.'
    }
  }

  // Save to Supabase
  try {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get: (name) => cookieStore.get(name)?.value,
        },
      }
    )
    const { data: { session } } = await supabase.auth.getSession()

    if (session?.user?.id) {
      const studentId = session.user.id
      await Promise.all([
        supabase.from('triage_results').insert({
          student_id: studentId,
          score: result.score,
          level: result.level,
          answers,
        }),
        supabase.from('profiles').update({
          triage_score: result.score,
          triage_level: result.level,
        }).eq('id', studentId),
      ])
    }
  } catch {
    // Don't fail the response if DB write fails
  }

  return NextResponse.json(result)
}
