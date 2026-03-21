import { anthropic } from '@/lib/anthropic'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { answers } = await req.json()

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
    // Parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    const result = jsonMatch ? JSON.parse(jsonMatch[0]) : { score: 5, level: 'counsellor', summary: 'Assessment complete' }

    return NextResponse.json(result)
  } catch {
    // Fallback: compute score from answers
    const total = (answers as number[]).reduce((a: number, b: number) => a + b, 0)
    const avg = total / answers.length
    const score = Math.min(10, Math.max(1, Math.round(avg * 3 + 1)))
    const level = score <= 4 ? 'ai' : score <= 7 ? 'counsellor' : 'emergency'
    return NextResponse.json({
      score,
      level,
      summary: 'Assessment complete. Based on your responses, we have determined your support level.'
    })
  }
}
