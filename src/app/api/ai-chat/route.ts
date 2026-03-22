import { anthropic, STILLSPACE_SYSTEM_PROMPT } from '@/lib/anthropic'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const TOPIC_KEYWORDS: Record<string, string[]> = {
  'Anxiety & Stress':      ['anxious', 'anxiety', 'stress', 'stressed', 'panic', 'worry', 'worried', 'nervous', 'overwhelm'],
  'Depression & Low Mood': ['depress', 'sad', 'unhappy', 'hopeless', 'empty', 'numb', 'worthless', 'miserable', 'cry'],
  'Relationships':         ['friend', 'relationship', 'boyfriend', 'girlfriend', 'partner', 'crush', 'breakup', 'dating', 'love'],
  'Academic Pressure':     ['exam', 'study', 'school', 'college', 'grade', 'fail', 'assignment', 'class', 'teacher', 'uni'],
  'Family Issues':         ['family', 'parent', 'mom', 'dad', 'mother', 'father', 'sibling', 'brother', 'sister', 'home'],
  'Sleep Problems':        ['sleep', 'insomnia', 'tired', 'exhausted', 'nightmar', 'awake', 'rest', 'fatigue'],
  'Self-Harm Thoughts':    ['hurt myself', 'self harm', 'cut', 'suicid', 'die', 'kill myself', 'end my life', 'not want to live'],
  'Loneliness':            ['alone', 'lonely', 'isolat', 'no friends', 'nobody', 'left out', 'excluded'],
}

function classifyTopic(text: string): string {
  const lower = text.toLowerCase()
  for (const [topic, keywords] of Object.entries(TOPIC_KEYWORDS)) {
    if (keywords.some(k => lower.includes(k))) return topic
  }
  return 'Other'
}

function logTopic(topic: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key || key === 'placeholder_service_role_key') return
  const db = createClient(url, key)
  db.from('chat_topics').insert({ topic }).then(() => {})
}

export async function POST(req: NextRequest) {
  const { messages } = await req.json()

  // Classify the last user message (fire-and-forget)
  const lastUser = [...messages].reverse().find((m: { role: string }) => m.role === 'user')
  if (lastUser) logTopic(classifyTopic(lastUser.content))

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 400,
      system: STILLSPACE_SYSTEM_PROMPT,
      messages,
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    let emergency = false
    try { const p = JSON.parse(text); if (p.emergency) emergency = true } catch {}
    return NextResponse.json({ content: text, emergency })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[ai-chat] Anthropic error:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
