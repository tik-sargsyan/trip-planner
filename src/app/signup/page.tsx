import { Suspense } from 'react'
import AuthShell from '../login/AuthShell'
import AuthForm from '../login/AuthForm'

export const dynamic = 'force-dynamic'

export default function SignupPage() {
  return (
    <AuthShell>
      <Suspense><AuthForm mode="signup" /></Suspense>
    </AuthShell>
  )
}
