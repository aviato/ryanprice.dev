import { Bricolage_Grotesque, Space_Grotesk, JetBrains_Mono } from 'next/font/google'

// Exposed as CSS variables and wired into src/styles/site.css (--font-display,
// --font-body, --font-mono). Self-hosted by next/font — no runtime CDN request.
export const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  weight: ['700', '800'],
  display: 'swap',
  variable: '--font-bricolage',
  // Next 14.0.4's metrics DB has no fallback override for this font; our own
  // CSS fallback stack (see site.css) covers it, so skip the auto-fallback.
  adjustFontFallback: false,
})

export const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
  variable: '--font-space-grotesk',
})

export const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  display: 'swap',
  variable: '--font-jetbrains-mono',
})
