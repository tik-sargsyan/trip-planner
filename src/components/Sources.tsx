import type { Status } from '../lib/apis/hooks'

export interface SourceRow { name: string; href: string; use: string; status: Status; license?: { label: string; href: string } }

const LABEL: Record<Status, string> = { loading: 'Loading', live: 'Live', fallback: 'Mock data' }

/** Data sources, their live status and the credits their licenses ask for. */
export default function Sources({ rows }: { rows: SourceRow[] }) {
  return (
    <section className="card sources">
      <h2>Data sources</h2>
      <ul>
        {rows.map((r) => (
          <li key={r.name}>
            <span className={'src-status ' + r.status}>{LABEL[r.status]}</span>
            <span><a href={r.href} target="_blank" rel="noreferrer">{r.name}</a>: {r.use}
              {r.license && <> Licensed <a href={r.license.href} target="_blank" rel="noreferrer">{r.license.label}</a>.</>}
            </span>
          </li>
        ))}
      </ul>
      <p className="muted small">Flights, hotels and transport stay mock estimates for now. When a source is down, the plan uses mock data.</p>
    </section>
  )
}
