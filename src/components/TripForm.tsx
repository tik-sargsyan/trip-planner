import { useState } from 'react'
import { ACTIVITIES, ACTIVITY_LABEL, COUNTRIES, ORIGINS, type Activity } from '../data/catalog'
import { localIso, type TripInput } from '../engine/plan'

const plusDays = (n: number) => { const d = new Date(); d.setDate(d.getDate() + n); return localIso(d) }

export default function TripForm({ initial, onSubmit }: { initial?: TripInput; onSubmit: (i: TripInput) => void }) {
  const [v, setV] = useState<TripInput>(initial ?? {
    origin: 'yerevan', country: 'italy', start: plusDays(30), end: plusDays(37),
    budget: 3000, people: 2, activities: ['culture', 'food'],
  })
  const [err, setErr] = useState('')
  const set = <K extends keyof TripInput>(k: K, val: TripInput[K]) => setV({ ...v, [k]: val })
  const toggle = (a: Activity) => set('activities', v.activities.includes(a) ? v.activities.filter((x) => x !== a) : [...v.activities, a])

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const nights = (new Date(v.end).getTime() - new Date(v.start).getTime()) / 86400000
    if (!(nights >= 1)) return setErr('The return date must be after the start date.')
    if (nights > 30) return setErr('Plan up to 30 nights for now.')
    if (v.budget < 100) return setErr('Enter a budget of at least $100.')
    setErr('')
    onSubmit(v)
  }

  return (
    <form className="card form" onSubmit={submit}>
      <h1>Where to next?</h1>
      <p className="sub">Tell us the basics. We pick the cities, the sites and the route, in three budget levels.</p>

      <div className="grid2">
        <label>From
          <select value={v.origin} onChange={(e) => set('origin', e.target.value)}>
            {ORIGINS.map((o) => <option key={o.id} value={o.id}>{o.name} ({o.airport})</option>)}
          </select>
        </label>
        <label>To
          <select value={v.country} onChange={(e) => set('country', e.target.value)}>
            {COUNTRIES.map((c) => <option key={c.id} value={c.id}>{c.flag} {c.name}</option>)}
          </select>
        </label>
        <label>Start date
          <input type="date" value={v.start} onChange={(e) => set('start', e.target.value)} required />
        </label>
        <label>Return date
          <input type="date" value={v.end} min={v.start} onChange={(e) => set('end', e.target.value)} required />
        </label>
        <label>Total budget (USD)
          <input type="number" min={100} step={50} value={v.budget} onChange={(e) => set('budget', Number(e.target.value))} required />
        </label>
        <label>Travellers
          <div className="stepper">
            <button type="button" onClick={() => set('people', Math.max(1, v.people - 1))} aria-label="Fewer travellers">−</button>
            <span>{v.people}</span>
            <button type="button" onClick={() => set('people', Math.min(12, v.people + 1))} aria-label="More travellers">+</button>
          </div>
        </label>
      </div>

      <fieldset>
        <legend>What do you want to do?</legend>
        <div className="chips">
          {ACTIVITIES.map((a) => (
            <button type="button" key={a} className={'chip' + (v.activities.includes(a) ? ' on' : '')} aria-pressed={v.activities.includes(a)} onClick={() => toggle(a)}>
              {ACTIVITY_LABEL[a]}
            </button>
          ))}
        </div>
      </fieldset>

      {err && <p className="err" role="alert">{err}</p>}
      <button className="btn primary big" type="submit">Build my trip</button>
    </form>
  )
}
