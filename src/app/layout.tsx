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

// Position every .frame at its exact grid-snapped column BEFORE first paint.
// The frame's real position is computed at runtime from the viewport width
// (grid geometry), and React only applies it post-hydration (Portfolio.relayout)
// — so without this the first paint sits at the CSS fallback and then slides
// up to ~30px when relayout runs. This runs synchronously at the end of <body>
// (frames already parsed, paint not yet flushed) and mirrors computeGeom +
// frameBox + relayout's mobile branch EXACTLY. Keep in sync with
// src/lib/engine/grid.ts and Portfolio.relayout; each frame carries data-fw.
const framePositionScript = `(function(){
  var SP=${DEFAULT_PARAMS.gridSpacing},GUT=2;
  function ci(v,lo,hi){return hi<lo?lo:Math.max(lo,Math.min(hi,v));}
  function place(){
    var w=window.innerWidth,mobile=w<720;
    var sp=mobile?Math.max(20,Math.min(SP,Math.round(w/16))):SP;
    var cols=Math.max(6,Math.floor(w/sp)),offX=(w-(cols-1)*sp)/2,maxW=Math.max(4,cols-2*GUT);
    var fr=document.querySelectorAll('.frame');
    for(var i=0;i<fr.length;i++){
      var el=fr[i],frac=mobile?0.82:(parseFloat(el.getAttribute('data-fw'))||0.6);
      var fwN=ci(Math.round(frac*cols),Math.min(6,maxW),maxW);
      var c0=ci(Math.round((cols-fwN)/2),GUT,cols-GUT-fwN);
      el.style.setProperty('--fx',(offX+c0*sp)+'px');
      el.style.setProperty('--fw',(fwN*sp)+'px');
    }
  }
  place();
})();`

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
      <body>
        {children}
        <script dangerouslySetInnerHTML={{ __html: framePositionScript }} />
      </body>
    </html>
  )
}
