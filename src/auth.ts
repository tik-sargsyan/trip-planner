import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { eq } from 'drizzle-orm'
import { dbConfigured, getDb } from './db'
import { users } from './db/schema'
import { normalizeEmail, verifyPassword } from './lib/password'

// Email and password sign-in. Sessions are signed JWT cookies; users live in Postgres.
export const authReady = dbConfigured

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: 'jwt' },
  trustHost: true,
  pages: { signIn: '/login' },
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(c) {
        if (!dbConfigured) return null
        const email = typeof c?.email === 'string' ? normalizeEmail(c.email) : ''
        const password = typeof c?.password === 'string' ? c.password : ''
        if (!email || !password) return null
        const [u] = await getDb().select().from(users).where(eq(users.email, email)).limit(1)
        if (!u || !(await verifyPassword(password, u.passwordHash))) return null
        return { id: u.id, email: u.email, name: u.name }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user?.id) token.uid = user.id
      return token
    },
    session({ session, token }) {
      if (session.user && typeof token.uid === 'string') session.user.id = token.uid
      return session
    },
  },
})
