import { NextRequest, NextResponse } from 'next/server'
import { createHmac } from 'crypto'

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const masterKey = process.env.ENCRYPTION_KEY
  if (!masterKey) {
    return NextResponse.json({ error: 'Encryption not configured' }, { status: 500 })
  }

  // Derive a conversation-specific 32-byte AES key.
  // Security: ENCRYPTION_KEY never leaves the server. The derived key alone is
  // useless without the ciphertext, which is protected by Supabase RLS.
  const conversationKey = createHmac('sha256', Buffer.from(masterKey, 'hex'))
    .update(params.id)
    .digest('hex')

  return NextResponse.json({ key: conversationKey })
}
