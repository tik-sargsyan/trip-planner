import { Suspense } from 'react'
import AuthShell from './AuthShell'
import AuthForm from './AuthForm'

export const dynamic = 'force-dynamic'

export default function LoginPage() {
  return (
    <AuthShell>
      <Suspense><AuthForm mode="login" /></Suspense>
    </AuthShell>
  )
}
