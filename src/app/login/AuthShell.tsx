import { authReady } from '@/auth'

export default function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="app">
      <header className="topbar">
        <a href="/" className="brand"><span className="logo">◎</span> Trip Planner</a>
      </header>
      <main>
        {authReady ? children : <p className="card warn">Accounts are not set up on this server yet. The database is missing.</p>}
      </main>
    </div>
  )
}
