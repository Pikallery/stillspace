import { anthropic } from '@/lib/anthropic'
import { STILLSPACE_SYSTEM_PROMPT } from '@/lib/anthropic'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { messages } = await req.json()

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 400,
      system: STILLSPACE_SYSTEM_PROMPT,
      messages: messages
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''

    // Check for emergency
    let emergency = false
    try {
      const parsed = JSON.parse(text)
      if (parsed.emergency) emergency = true
    } catch {}

    return NextResponse.json({ content: text, emergency })
  } catch {
    return NextResponse.json({
      content: "I'm here with you. It sounds like things might be tough right now. Would you like to tell me more about how you're feeling?",
      emergency: false
    })
  }
}
