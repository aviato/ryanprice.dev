import type { Metadata } from 'next'
import { workSans } from './fonts'
import './globals.css'

export const metadata: Metadata = {
  title: 'ryanprice.dev',
  description: 'The personal portfolio of Ryan Price',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`mx-auto min-h-screen bg-gradient-to-tl from-slate-950 to-sky-950 ${workSans.className} mb-24`}>
        {children}
      </body>
    </html>
  )
}
