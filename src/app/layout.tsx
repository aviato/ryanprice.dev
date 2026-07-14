import type { Metadata, Viewport } from 'next'
import { bricolage, spaceGrotesk, jetbrainsMono } from './fonts'
import './globals.css'
import '../styles/site.css'

export const metadata: Metadata = {
  title: 'Ryan Price — Sr. Frontend Software Engineer',
  description:
    'Ryan Price — Sr. Frontend Software Engineer. Ten years building conversion-critical, high-traffic web experiences in React, Next.js & TypeScript.',
}

export const viewport: Viewport = {
  themeColor: '#08182b',
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
      data-theme="blueprint"
      data-frame-border="impact"
      className={fontVars}
    >
      <body>{children}</body>
    </html>
  )
}
