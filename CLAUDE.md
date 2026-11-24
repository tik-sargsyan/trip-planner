# Trip Planner

ACA course program (teaching demo), not a personal venture. Do not run Founder or venture flows here.

## What it is
User enters origin, destination country, dates, budget, travellers and activities. The app picks cities, sites and the route in 3 price tiers, with a day-by-day plan, route map and currency switch. Users sign up with email and password and save trips to My Trips.

## Live
- Production: https://trip-planner-two-mocha.vercel.app (Vercel team `tik-s-ventures`, project `trip-planner`). Every push to `main` deploys it.
- Repo: github.com/tik-sargsyan/trip-planner. The old GitHub Pages site is phase 1 only; ignore it.

## Stack
- Next.js 15 app router. The planner is a client app in `src/App.tsx` with hash routes (`#/plan?q=`); pages in `src/app/`.
- Auth.js v5 Credentials (email and password, scrypt hashes in `src/lib/password.ts`, JWT sessions) in `src/auth.ts`.
- Neon Postgres via Drizzle: `src/db/schema.ts` (`user`, `trip`). Apply schema with `npm run db:push` after `vercel env pull`.
- Free no-key APIs with mock fallback in `src/lib/apis/` (Frankfurter, World Bank, Nager.Date, Wikivoyage, Wikidata, OpenFreeMap). Flights, hotels and site prices are mock (`src/data/`).
- `vercel.json` pins the Next.js framework; `engines` pins Node 22.

## Local dev
`vercel env pull` then `npx next dev --port 3100` (port 3000 is used by wayfare).

## Open items (parked 2026-11-24)
- No page analytics: Vercel Web Analytics is off. Add `@vercel/analytics` and enable it in the project.
- No login rate limit. Logs showed 11 failed logins in 2 minutes.
- No password reset or email verification (needs an email sender).
- Phase 2b and 2c APIs: see `ROADMAP.md`.
