'use client'
import { useState } from 'react'

interface Item { id: string; title: string; href: string; summary: string }

export default function TripsList({ initial }: { initial: Item[] }) {
  const [items, setItems] = useState(initial)
  const [err, setErr] = useState('')

  const rename = async (it: Item) => {
    const title = window.prompt('Trip name', it.title)?.trim()
    if (!title || title === it.title) return
    const res = await fetch(`/api/trips/${it.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title }),
    }).catch(() => null)
    if (res?.ok) setItems((xs) => xs.map((x) => (x.id === it.id ? { ...x, title } : x)))
    else setErr('Could not rename the trip.')
  }

  const remove = async (it: Item) => {
    if (!window.confirm(`Delete "${it.title}"? This cannot be undone.`)) return
    const res = await fetch(`/api/trips/${it.id}`, { method: 'DELETE' }).catch(() => null)
    if (res?.ok) setItems((xs) => xs.filter((x) => x.id !== it.id))
    else setErr('Could not delete the trip.')
  }

  if (!items.length) {
    return (
      <div className="card empty">
        <h2>No saved trips yet</h2>
        <p className="sub">Build a trip, then press Save trip on the dashboard.</p>
        <a className="btn primary" href="/">Plan a trip</a>
      </div>
    )
  }

  return (
    <>
      {err && <p className="err" role="alert">{err}</p>}
      <ul className="triplist">
        {items.map((it) => (
          <li key={it.id} className="card tripitem">
            <a href={it.href} className="tripmain">
              <strong>{it.title}</strong>
              <span className="sub">{it.summary}</span>
            </a>
            <div className="tripactions">
              <button className="btn ghost small" onClick={() => rename(it)}>Rename</button>
              <button className="btn ghost small" onClick={() => remove(it)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </>
  )
}
