import { NextRequest, NextResponse } from 'next/server'
import twilio from 'twilio'

export async function POST(req: NextRequest) {
  const { userId } = await req.json()
  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })

  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const apiKey = process.env.TWILIO_API_KEY
  const apiSecret = process.env.TWILIO_API_SECRET
  const twimlAppSid = process.env.TWILIO_TWIML_APP_SID

  console.log('[Twilio token] accountSid:', accountSid?.slice(0, 8), '| apiKey:', apiKey?.slice(0, 8), '| twimlApp:', twimlAppSid?.slice(0, 8))

  if (!accountSid || !apiKey || !apiSecret || !twimlAppSid) {
    return NextResponse.json({ error: 'Missing Twilio env vars' }, { status: 500 })
  }

  const AccessToken = twilio.jwt.AccessToken
  const VoiceGrant = AccessToken.VoiceGrant

  const token = new AccessToken(accountSid, apiKey, apiSecret, { identity: userId, ttl: 3600 })
  token.addGrant(new VoiceGrant({ outgoingApplicationSid: twimlAppSid, incomingAllow: true }))

  return NextResponse.json({ token: token.toJwt(), identity: userId })
}
