import type { Metadata, Viewport } from 'next'
import { bricolage, spaceGrotesk, jetbrainsMono } from './fonts'
import { DEFAULT_PARAMS, THEMES } from '../lib/config'
import './globals.css'
import '../styles/site.css'

export const metadata: Metadata = {
  title: 'Ryan Price — Sr. Frontend Software Engineer',
  description:
    'Ryan Price — Sr. Frontend Software Engineer. Ten years building conversion-critical, high-traffic web experiences in React, Next.js & TypeScript.',
}

// Derive the server-rendered theme from the same defaults the client uses, so
// the first paint already matches — no blueprint→terminal flash on hydration.
export const viewport: Viewport = {
  themeColor: THEMES[DEFAULT_PARAMS.theme].bg,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const fontVars = `${bricolage.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`
  return (
    <html
      lang="en"
      data-theme={DEFAULT_PARAMS.theme}
      data-frame-border={DEFAULT_PARAMS.frameBorder}
      className={fontVars}
    >
      <body>{children}</body>
    </html>
  )
}
