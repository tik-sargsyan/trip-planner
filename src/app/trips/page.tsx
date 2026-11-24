import { desc, eq } from 'drizzle-orm'
import { auth, authReady } from '@/auth'
import { getDb } from '@/db'
import { trips } from '@/db/schema'
import { countryById, originById, TIER_NAMES } from '@/data/catalog'
import { encodePlan } from '@/engine/share'
import { niceDate, usd } from '@/format'
import TripsList from './TripsList'
import SignInPrompt from './SignInPrompt'

export const dynamic = 'force-dynamic'

export default async function TripsPage() {
  const session = authReady ? await auth() : null
  const userId = session?.user?.id

  const rows = userId
    ? await getDb().select().from(trips).where(eq(trips.userId, userId)).orderBy(desc(trips.updatedAt))
    : []

  const items = rows.map((r) => ({
    id: r.id,
    title: r.title,
    href: `/#/plan?q=${encodePlan(r.input, r.tier as 0 | 1 | 2)}`,
    summary: `${originById(r.input.origin)?.name ?? r.input.origin} to ${countryById(r.input.country)?.name ?? r.input.country} · ${niceDate(r.input.start)} to ${niceDate(r.input.end)} · ${r.input.people} ${r.input.people === 1 ? 'traveller' : 'travellers'} · ${usd(r.input.budget)} · ${TIER_NAMES[r.tier]}`,
  }))

  return (
    <div className="app">
      <header className="topbar">
        <a href="/" className="brand"><span className="logo">◎</span> Trip Planner</a>
        <a className="btn ghost small" href="/">New trip</a>
      </header>
      <main>
        <h1>My Trips</h1>
        {!authReady && <p className="card warn">Sign-in is not set up on this server yet. Add the database and a login provider to enable My Trips.</p>}
        {authReady && !userId && <SignInPrompt />}
        {userId && <TripsList initial={items} />}
      </main>
    </div>
  )
}
