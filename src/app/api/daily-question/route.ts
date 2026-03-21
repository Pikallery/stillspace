import { anthropic } from '@/lib/anthropic'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { mood } = await req.json()

  const moodLabels: Record<number, string> = { 1: 'very sad', 2: 'sad', 3: 'neutral', 4: 'happy', 5: 'very happy' }

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 150,
      messages: [{
        role: 'user',
        content: `Generate one short, warm, reflective question for a student who feels ${moodLabels[mood as keyof typeof moodLabels] || 'okay'} today. The question should help them reflect on their day positively. Return just the question, no extra text.`
      }]
    })

    const question = response.content[0].type === 'text' ? response.content[0].text : 'How has your day been treating you?'
    return NextResponse.json({ question })
  } catch {
    const fallbacks: Record<number, string> = {
      1: 'What is one small thing that brought you even a tiny bit of comfort today?',
      2: 'Is there someone you could reach out to today who makes you feel supported?',
      3: 'What is one thing you are looking forward to this week?',
      4: 'What made you smile today, even briefly?',
      5: 'How can you share this positive energy with someone around you today?'
    }
    return NextResponse.json({ question: fallbacks[mood as keyof typeof fallbacks] || 'How has your day been treating you?' })
  }
}
