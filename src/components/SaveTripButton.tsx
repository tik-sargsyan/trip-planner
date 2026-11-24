'use client'
import { useState } from 'react'
import { signIn, useSession } from 'next-auth/react'
import { countryById, type Tier } from '../data/catalog'
import type { TripInput } from '../engine/plan'
import { niceDate } from '../format'

export default function SaveTripButton({ input, tier }: { input: TripInput; tier: Tier }) {
  const { data } = useSession()
  const [state, setState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  const save = async () => {
    if (!data?.user) return signIn(undefined, { callbackUrl: window.location.href })
    setState('saving')
    const c = countryById(input.country)
    const title = `${c.flag} ${c.name}, ${niceDate(input.start)}`
    const res = await fetch('/api/trips', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, input, tier }),
    }).catch(() => null)
    setState(res?.ok ? 'saved' : 'error')
  }

  const label = { idle: 'Save trip', saving: 'Saving…', saved: 'Saved to My Trips', error: 'Could not save. Retry' }[state]
  return (
    <button className="btn" onClick={save} disabled={state === 'saving' || state === 'saved'}>
      {label}
    </button>
  )
}
