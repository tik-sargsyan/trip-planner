import { integer, jsonb, pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import type { TripInput } from '../engine/plan'

export const users = pgTable('user', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name'),
  email: text('email').notNull().unique(),
  passwordHash: text('passwordHash').notNull(),
  createdAt: timestamp('createdAt', { mode: 'date' }).notNull().defaultNow(),
})

export const trips = pgTable('trip', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  input: jsonb('input').$type<TripInput>().notNull(),
  tier: integer('tier').notNull(),
  createdAt: timestamp('createdAt', { mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updatedAt', { mode: 'date' }).notNull().defaultNow(),
})

export type TripRow = typeof trips.$inferSelect
