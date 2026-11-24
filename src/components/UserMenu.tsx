'use client'
import { signIn, signOut, useSession } from 'next-auth/react'

export default function UserMenu() {
  const { data, status } = useSession()
  if (status === 'loading') return <span className="tag">…</span>
  if (!data?.user) {
    return <button className="btn ghost small" onClick={() => signIn()}>Sign in</button>
  }
  return (
    <div className="usermenu">
      <a className="btn ghost small" href="/trips">My Trips</a>
      <button className="btn ghost small" onClick={() => signOut({ callbackUrl: '/' })} title={data.user.email ?? ''}>
        Sign out
      </button>
    </div>
  )
}
