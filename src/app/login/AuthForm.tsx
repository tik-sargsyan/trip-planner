'use client'
import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'

export default function AuthForm({ mode }: { mode: 'login' | 'signup' }) {
  const params = useSearchParams()
  const callbackUrl = safeCallback(params.get('callbackUrl'))
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const signup = mode === 'signup'

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErr(''); setBusy(true)
    if (signup) {
      const res = await fetch('/api/register', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      }).catch(() => null)
      if (!res?.ok) {
        const j = await res?.json().catch(() => null)
        setErr(j?.error ?? 'Could not create the account. Try again.'); setBusy(false)
        return
      }
    }
    const r = await signIn('credentials', { email, password, redirect: false })
    if (r?.error) { setErr('Wrong email or password.'); setBusy(false); return }
    window.location.href = callbackUrl
  }

  const other = signup ? '/login' : '/signup'
  const q = callbackUrl !== '/' ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ''

  return (
    <form className="card form auth" onSubmit={submit}>
      <h1>{signup ? 'Create your account' : 'Log in'}</h1>
      <p className="sub">{signup ? 'Save trips and open them on any device.' : 'Welcome back. Your saved trips are waiting.'}</p>
      <div className="stack">
        {signup && (
          <label>Name (optional)
            <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" maxLength={80} />
          </label>
        )}
        <label>Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
        </label>
        <label>Password
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
            autoComplete={signup ? 'new-password' : 'current-password'} minLength={signup ? 8 : undefined} required />
          {signup && <span className="hint">At least 8 characters.</span>}
        </label>
      </div>
      {err && <p className="err" role="alert">{err}</p>}
      <button className="btn primary big" type="submit" disabled={busy}>
        {busy ? 'Please wait…' : signup ? 'Create account' : 'Log in'}
      </button>
      <p className="switch">
        {signup ? 'Already have an account? ' : 'New here? '}
        <a href={other + q}>{signup ? 'Log in' : 'Create an account'}</a>
      </p>
    </form>
  )
}

// Only allow same-site paths, so a crafted link cannot bounce users to another site.
function safeCallback(v: string | null) {
  if (!v) return '/'
  try {
    const u = new URL(v, window.location.origin)
    return u.origin === window.location.origin ? u.pathname + u.search + u.hash : '/'
  } catch {
    return '/'
  }
}
