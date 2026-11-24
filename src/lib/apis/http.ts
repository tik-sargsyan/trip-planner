// Shared fetch helper for the phase 2a browser APIs.
// Every call has a timeout. Responses are cached in memory for the session.
// Failed calls are not cached, so a later render can try again.

export const CLIENT_NAME = 'TripPlanner/0.2 (https://tik-sargsyan.github.io/trip-planner/; github.com/tik-sargsyan/trip-planner)'

const cache = new Map<string, Promise<unknown>>()

export interface GetOptions {
  timeoutMs?: number
  retries?: number
  headers?: Record<string, string>
}

/** GET a JSON body. Resolves to null on HTTP 204. Throws on timeout, HTTP error or bad JSON. */
export function getJson<T>(url: string, opts: GetOptions = {}): Promise<T | null> {
  const hit = cache.get(url)
  if (hit) return hit as Promise<T | null>
  const p = run<T>(url, opts)
  cache.set(url, p)
  p.catch(() => cache.delete(url))
  return p
}

async function run<T>(url: string, { timeoutMs = 6000, retries = 0, headers }: GetOptions): Promise<T | null> {
  let last: unknown
  for (let i = 0; i <= retries; i++) {
    const ctl = new AbortController()
    const timer = setTimeout(() => ctl.abort(), timeoutMs)
    try {
      const res = await fetch(url, { signal: ctl.signal, headers })
      if (res.status === 204) return null
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const text = await res.text()
      if (!text.trim()) throw new Error('Empty body')
      return JSON.parse(text) as T
    } catch (e) {
      last = e
    } finally {
      clearTimeout(timer)
    }
  }
  throw last
}

/** Run async jobs one at a time. Used for services that rate-limit bursts. */
export function serialQueue() {
  let tail: Promise<unknown> = Promise.resolve()
  return <T>(job: () => Promise<T>): Promise<T> => {
    const next = tail.then(job, job)
    tail = next.catch(() => undefined)
    return next
  }
}
