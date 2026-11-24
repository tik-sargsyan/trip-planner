import NextAuth from 'next-auth'
import type { Provider } from 'next-auth/providers'
import GitHub from 'next-auth/providers/github'
import Google from 'next-auth/providers/google'
import { DrizzleAdapter } from '@auth/drizzle-adapter'
import { dbConfigured, getDb } from './db'
import { accounts, sessions, users, verificationTokens } from './db/schema'

// Providers switch on only when their keys are set, so local dev works without them.
const providers: Provider[] = []
if (process.env.AUTH_GOOGLE_ID) providers.push(Google)
if (process.env.AUTH_GITHUB_ID) providers.push(GitHub)

export const authReady = dbConfigured && providers.length > 0

export const { handlers, auth, signIn, signOut } = NextAuth(() => ({
  adapter: dbConfigured
    ? DrizzleAdapter(getDb(), { usersTable: users, accountsTable: accounts, sessionsTable: sessions, verificationTokensTable: verificationTokens })
    : undefined,
  session: { strategy: dbConfigured ? 'database' : 'jwt' },
  providers,
  trustHost: true,
  callbacks: {
    session({ session, user }) {
      if (user && session.user) session.user.id = user.id
      return session
    },
  },
}))
