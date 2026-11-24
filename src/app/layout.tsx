import type { Metadata, Viewport } from 'next'
import { SessionProvider } from 'next-auth/react'
import '../styles.css'

export const metadata: Metadata = {
  title: 'Trip Planner',
  description: 'Tell us your budget, dates and interests. We pick the cities, sites and route in three price levels.',
}
export const viewport: Viewport = { width: 'device-width', initialScale: 1 }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  )
}
