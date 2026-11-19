export const usd = (n: number) => '$' + Math.round(n).toLocaleString('en-US')
export const hrs = (h: number) => {
  const H = Math.floor(h), M = Math.round((h - H) * 60)
  return H ? `${H}h${M ? ` ${M}m` : ''}` : `${M}m`
}
export const niceDate = (iso: string) =>
  new Date(iso + 'T00:00:00').toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
export const MODE_ICON: Record<string, string> = { flight: '✈️', train: '🚄', bus: '🚌', car: '🚗', transfer: '🚕' }
