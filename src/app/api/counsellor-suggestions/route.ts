import { anthropic } from '@/lib/anthropic'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { notes, messages } = await req.json()

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 300,
      messages: [{
        role: 'user',
        content: `Give 2 bullet point suggestions for this counsellor based on these notes and recent chat.

Counsellor notes: ${notes}
Recent messages: ${JSON.stringify(messages)}

Return exactly 2 bullet points starting with "• "`
      }]
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : '• Continue building rapport\n• Explore coping strategies'
    return NextResponse.json({ suggestions: text })
  } catch {
    return NextResponse.json({ suggestions: '• Continue building rapport and active listening\n• Explore evidence-based coping strategies relevant to the student\'s situation' })
  }
}
