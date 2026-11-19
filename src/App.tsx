import { useEffect, useMemo, useState } from 'react'
import TripForm from './components/TripForm'
import Dashboard from './components/Dashboard'
import { decodePlan, encodePlan } from './engine/share'
import type { TripInput } from './engine/plan'
import type { Tier } from './data/catalog'

type Route = { view: 'form'; input?: TripInput } | { view: 'plan'; input: TripInput; tier: Tier } | { view: 'bad' }

function parse(hash: string): Route {
  const m = hash.match(/^#\/plan\?q=(.+)$/)
  if (!m) return { view: 'form' }
  const d = decodePlan(m[1])
  return d ? { view: 'plan', input: d.input, tier: d.tier } : { view: 'bad' }
}

export default function App() {
  const [hash, setHash] = useState(window.location.hash)
  const [draft, setDraft] = useState<TripInput | undefined>()
  useEffect(() => {
    const on = () => { setHash(window.location.hash); window.scrollTo(0, 0) }
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])
  const route = useMemo(() => parse(hash), [hash])

  const go = (input: TripInput, tier?: Tier) => { window.location.hash = `/plan?q=${encodePlan(input, tier ?? -1 as Tier)}` }

  return (
    <div className="app">
      <header className="topbar">
        <a href="#/" className="brand" onClick={() => setDraft(undefined)}><span className="logo">◎</span> Trip Planner</a>
        <span className="tag">Phase 1 · mock data</span>
      </header>
      <main>
        {route.view === 'form' && <TripForm initial={draft} onSubmit={(i) => go(i)} />}
        {route.view === 'bad' && (
          <div className="card empty"><h2>This link is broken</h2><p>The shared plan could not be read.</p><a className="btn primary" href="#/">Plan a new trip</a></div>
        )}
        {route.view === 'plan' && (
          <Dashboard
            input={route.input}
            tier={route.tier}
            onTier={(t) => window.history.replaceState(null, '', `#/plan?q=${encodePlan(route.input, t)}`)}
            onEdit={() => { setDraft(route.input); window.location.hash = '/' }}
          />
        )}
      </main>
      <footer className="foot">Prices and times are mock estimates for the demo. Live data arrives in phase 2.</footer>
    </div>
  )
}
