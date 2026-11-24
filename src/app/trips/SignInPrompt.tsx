'use client'
import { signIn } from 'next-auth/react'

export default function SignInPrompt() {
  return (
    <div className="card empty">
      <h2>Sign in to see your trips</h2>
      <p className="sub">Saved plans live in your account, so you can open them on any device.</p>
      <button className="btn primary" onClick={() => signIn(undefined, { callbackUrl: '/trips' })}>Sign in</button>
    </div>
  )
}
