import { NextResponse } from 'next/server'
import { desc, eq } from 'drizzle-orm'
import { auth } from '@/auth'
import { getDb } from '@/db'
import { trips } from '@/db/schema'
import { parseTripBody } from '../validate'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Sign in first' }, { status: 401 })
  const rows = await getDb().select().from(trips).where(eq(trips.userId, session.user.id)).orderBy(desc(trips.updatedAt))
  return NextResponse.json(rows)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Sign in first' }, { status: 401 })
  const body = parseTripBody(await req.json().catch(() => null))
  if (!body) return NextResponse.json({ error: 'Invalid trip' }, { status: 400 })
  const [row] = await getDb().insert(trips).values({ ...body, userId: session.user.id }).returning()
  return NextResponse.json(row, { status: 201 })
}
