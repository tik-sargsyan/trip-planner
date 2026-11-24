'use client'
import { signOut, useSession } from 'next-auth/react'

export default function UserMenu() {
  const { data, status } = useSession()
  if (status === 'loading') return <span className="tag">…</span>
  if (!data?.user) {
    return (
      <div className="usermenu">
        <a className="btn ghost small" href="/login">Log in</a>
        <a className="btn primary small" href="/signup">Sign up</a>
      </div>
    )
  }
  return (
    <div className="usermenu">
      <a className="btn ghost small" href="/trips">My Trips</a>
      <button className="btn ghost small" onClick={() => signOut({ callbackUrl: '/' })} title={data.user.email ?? ''}>
        Log out
      </button>
    </div>
  )
}
