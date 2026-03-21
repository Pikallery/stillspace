import { anthropic } from '@/lib/anthropic'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { content } = await req.json()

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 100,
      messages: [{
        role: 'user',
        content: `Classify this student post's risk level. Return only JSON: {"risk_level": "low"|"medium"|"high", "flag": boolean}

Post: "${content}"`
      }]
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    const result = jsonMatch ? JSON.parse(jsonMatch[0]) : { risk_level: 'low', flag: false }

    return NextResponse.json(result)
  } catch {
    return NextResponse.json({ risk_level: 'low', flag: false })
  }
}
