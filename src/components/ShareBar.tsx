import { useState } from 'react'
import type { Tier } from '../data/catalog'
import type { TripInput } from '../engine/plan'
import { shareUrl } from '../engine/share'
import SaveTripButton from './SaveTripButton'

export default function ShareBar({ input, tier, onEdit }: { input: TripInput; tier: Tier; onEdit: () => void }) {
  const [msg, setMsg] = useState('')
  const url = shareUrl(input, tier)
  const copy = async () => {
    try { await navigator.clipboard.writeText(url); setMsg('Link copied') } catch { window.prompt('Copy this link', url) }
    setTimeout(() => setMsg(''), 2000)
  }
  const share = async () => {
    try { await navigator.share({ title: 'Our trip plan', url }) } catch { /* user closed the sheet */ }
  }
  return (
    <div className="sharebar">
      <SaveTripButton input={input} tier={tier} />
      <button className="btn primary" onClick={copy}>{msg || 'Copy share link'}</button>
      {'share' in navigator && <button className="btn" onClick={share}>Share</button>}
      <button className="btn ghost" onClick={onEdit}>Edit trip</button>
    </div>
  )
}
