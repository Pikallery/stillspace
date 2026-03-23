import Anthropic from '@anthropic-ai/sdk'
import Groq from 'groq-sdk'

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

export const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
})

export const STILLSPACE_SYSTEM_PROMPT = `You are StillSpace AI, a warm compassionate student mental health assistant. Listen, validate, suggest coping strategies. Never diagnose. Keep responses short and friendly. If student mentions self-harm return JSON {"emergency": true}.`
