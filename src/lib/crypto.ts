// Client-side AES-256-GCM encryption using the Web Crypto API.
// Messages are stored as "enc:<base64(iv+ciphertext)>" in the database.
// Legacy plaintext messages (no prefix) are returned as-is.

const ENC_PREFIX = 'enc:'

async function importAesKey(hexKey: string): Promise<CryptoKey> {
  const raw = new Uint8Array(hexKey.match(/.{2}/g)!.map(b => parseInt(b, 16)))
  return crypto.subtle.importKey('raw', raw, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt'])
}

export async function encryptMessage(plaintext: string, hexKey: string): Promise<string> {
  const key = await importAesKey(hexKey)
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const encoded = new TextEncoder().encode(plaintext)
  const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoded)
  const combined = new Uint8Array(12 + ciphertext.byteLength)
  combined.set(iv)
  combined.set(new Uint8Array(ciphertext), 12)
  return ENC_PREFIX + btoa(String.fromCharCode(...combined))
}

export async function decryptMessage(encoded: string, hexKey: string): Promise<string> {
  if (!encoded.startsWith(ENC_PREFIX)) return encoded // legacy plaintext
  try {
    const key = await importAesKey(hexKey)
    const combined = Uint8Array.from(atob(encoded.slice(ENC_PREFIX.length)), c => c.charCodeAt(0))
    const iv = combined.slice(0, 12)
    const ciphertext = combined.slice(12)
    const plaintext = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ciphertext)
    return new TextDecoder().decode(plaintext)
  } catch {
    return '[encrypted message]'
  }
}
