import { NextRequest, NextResponse } from 'next/server'
import twilio from 'twilio'

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const to = formData.get('To') as string

  const VoiceResponse = twilio.twiml.VoiceResponse
  const twiml = new VoiceResponse()

  if (to) {
    const dial = twiml.dial({ callerId: 'client:anonymous' })
    dial.client(to)
  } else {
    twiml.say('No recipient specified.')
  }

  return new NextResponse(twiml.toString(), {
    headers: { 'Content-Type': 'text/xml' },
  })
}
