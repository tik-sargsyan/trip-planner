import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from './schema'

export const dbConfigured = Boolean(process.env.DATABASE_URL)

let _db: ReturnType<typeof drizzle<typeof schema>> | null = null

/** Lazy so the planner still runs locally without a database. */
export function getDb() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not set')
  _db ??= drizzle(neon(process.env.DATABASE_URL), { schema })
  return _db
}
