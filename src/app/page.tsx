'use client'
import dynamic from 'next/dynamic'

// The planner uses hash routing and window APIs, so it renders in the browser only.
const App = dynamic(() => import('../App'), { ssr: false })

export default function Home() {
  return <App />
}
