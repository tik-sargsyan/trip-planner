import { NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { dbConfigured, getDb } from '@/db'
import { users } from '@/db/schema'
import { EMAIL_RE, MIN_PASSWORD, hashPassword, normalizeEmail } from '@/lib/password'

export async function POST(req: Request) {
  if (!dbConfigured) return NextResponse.json({ error: 'Accounts are not set up on this server yet.' }, { status: 503 })
  const b = (await req.json().catch(() => null)) as Record<string, unknown> | null
  const email = typeof b?.email === 'string' ? normalizeEmail(b.email) : ''
  const password = typeof b?.password === 'string' ? b.password : ''
  const name = typeof b?.name === 'string' ? b.name.trim().slice(0, 80) : ''

  if (!EMAIL_RE.test(email) || email.length > 200) return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 })
  if (password.length < MIN_PASSWORD || password.length > 200) {
    return NextResponse.json({ error: `Use a password of at least ${MIN_PASSWORD} characters.` }, { status: 400 })
  }

  const db = getDb()
  const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1)
  if (existing) return NextResponse.json({ error: 'An account with this email already exists. Log in instead.' }, { status: 409 })

  await db.insert(users).values({ email, name: name || null, passwordHash: await hashPassword(password) })
  return NextResponse.json({ ok: true }, { status: 201 })
}
