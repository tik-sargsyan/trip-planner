import { NextResponse } from 'next/server'
import { and, eq } from 'drizzle-orm'
import { auth } from '@/auth'
import { getDb } from '@/db'
import { trips } from '@/db/schema'

type Ctx = { params: Promise<{ id: string }> }

export async function PATCH(req: Request, { params }: Ctx) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Sign in first' }, { status: 401 })
  const { id } = await params
  const body = (await req.json().catch(() => null)) as { title?: unknown } | null
  const title = typeof body?.title === 'string' ? body.title.trim() : ''
  if (!title || title.length > 120) return NextResponse.json({ error: 'Invalid title' }, { status: 400 })
  const [row] = await getDb().update(trips).set({ title, updatedAt: new Date() })
    .where(and(eq(trips.id, id), eq(trips.userId, session.user.id))).returning()
  return row ? NextResponse.json(row) : NextResponse.json({ error: 'Not found' }, { status: 404 })
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Sign in first' }, { status: 401 })
  const { id } = await params
  const rows = await getDb().delete(trips).where(and(eq(trips.id, id), eq(trips.userId, session.user.id))).returning({ id: trips.id })
  return rows.length ? new NextResponse(null, { status: 204 }) : NextResponse.json({ error: 'Not found' }, { status: 404 })
}
