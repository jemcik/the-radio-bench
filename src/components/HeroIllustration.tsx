import type { ReactNode } from 'react'
import SVGDiagram from './diagrams/SVGDiagram'

/**
 * Welcome page hero illustration.
 *
 * Shows an HF propagation path: signal leaves a transmitting antenna,
 * arcs through the ionosphere, and arrives at a distant receiver.
 * Three staggered animated wave paths keep the illustration alive.
 *
 * A component-symbol strip along the bottom ties the "from fundamentals
 * to radio waves" theme together.
 */
export default function HeroIllustration() {
  const W = 800, H = 340
  const earthY   = 215          // horizon line at edges
  const earthBow = 18           // convex bow: earth peaks earthBow px above earthY at center
  const ionoY    = 62           // ionosphere mid-line
  const txX      = 138          // TX antenna base x
  const rxX      = 662          // RX antenna base x
  const antH     = 52           // antenna height above ground

  // Ground Y at a given x (quadratic bezier: edges at earthY, peaks at earthY - earthBow)
  const groundAt = (x: number) => {
    const t = (x + 4) / (W + 8) // parameter along the bezier (account for -4..W+4 domain)
    return (1 - t) * (1 - t) * earthY + 2 * (1 - t) * t * (earthY - earthBow) + t * t * earthY
  }
  const txGround = groundAt(txX)
  const rxGround = groundAt(rxX)
  const txTop    = txGround - antH
  const rxTop    = rxGround - antH

  // Ray-path propagation: straight lines bouncing between ionosphere and earth
  // This is how HF skywave actually works and how the ARRL Handbook illustrates it.
  // Three rays at different launch angles = different hop counts.
  const ionoHit = ionoY + 5 // Y where rays hit the ionosphere (just below the band)
  const midX = (txX + rxX) / 2

  // Ground bounce Y at a given X (follows earth curvature)
  const bounceY = (x: number) => groundAt(x) + 2 // slightly into the ground visually

  const rays = [
    // Ray 1: single hop — high angle, direct path
    {
      points: `${txX},${txTop} ${midX},${ionoHit} ${rxX},${rxTop}`,
      w: 2, cls: 'ray1', opacity: 1,
      bounces: [] as number[],
    },
    // Ray 2: two hops — moderate angle
    {
      points: `${txX},${txTop} ${txX + (rxX - txX) * 0.25},${ionoHit} ${midX},${bounceY(midX)} ${txX + (rxX - txX) * 0.75},${ionoHit} ${rxX},${rxTop}`,
      w: 1.5, cls: 'ray2', opacity: 0.8,
      bounces: [midX],
    },
    // Ray 3: three hops — shallow angle, max range
    {
      points: (() => {
        const seg = (rxX - txX) / 6
        const b1x = txX + seg * 2
        const b2x = txX + seg * 4
        return `${txX},${txTop} ${txX + seg},${ionoHit} ${b1x},${bounceY(b1x)} ${txX + seg * 3},${ionoHit} ${b2x},${bounceY(b2x)} ${txX + seg * 5},${ionoHit} ${rxX},${rxTop}`
      })(),
      w: 1.2, cls: 'ray3', opacity: 0.6,
      bounces: (() => {
        const seg = (rxX - txX) / 6
        return [txX + seg * 2, txX + seg * 4]
      })(),
    },
  ]

  return (
    <div className="rounded-2xl overflow-hidden border border-border bg-card my-8">
      <SVGDiagram
        width={W} height={H}
        aria-label="HF radio propagation: signal rays bounce between the ionosphere and earth from transmitter to receiver"
      >
        {/* ── Keyframe animations ─────────────────────────────────────── */}
        <style>{`
          @keyframes travelRay {
            0%   { stroke-dashoffset: 800; opacity: 0;   }
            8%   { opacity: 0.9; }
            85%  { opacity: 0.85; }
            100% { stroke-dashoffset: 0;   opacity: 0;   }
          }
          .ray1 { stroke-dasharray:800; stroke-dashoffset:800;
                  animation: travelRay 2.8s ease-in-out infinite; }
          .ray2 { stroke-dasharray:800; stroke-dashoffset:800;
                  animation: travelRay 2.8s ease-in-out 0.93s infinite; }
          .ray3 { stroke-dasharray:800; stroke-dashoffset:800;
                  animation: travelRay 2.8s ease-in-out 1.87s infinite; }

          @keyframes blink {
            0%,100% { opacity:.55; } 50% { opacity:1; }
          }
          .tx-dot { animation: blink 1.4s ease-in-out infinite; }
          .rx-dot { animation: blink 1.4s ease-in-out .7s infinite; }

          @keyframes ionoFloat {
            0%,100% { opacity:.18; } 50% { opacity:.28; }
          }
          .iono-band { animation: ionoFloat 5s ease-in-out infinite; }
        `}</style>

        {/* ── Subtle dot grid ─────────────────────────────────────────── */}
        {Array.from({ length: 21 }).map((_, col) =>
          Array.from({ length: 7 }).map((_, row) => (
            <circle key={`dot-${col}-${row}`}
              cx={col * 40 + 8} cy={row * 34 + 10}
              r={0.9} fill="currentColor" opacity="0.07" />
          ))
        )}

        {/* ── Ionosphere band ─────────────────────────────────────────── */}
        <rect className="iono-band"
          x={0} y={ionoY - 13} width={W} height={24}
          fill="hsl(172 55% 38%)" />
        {/* Inner shimmer stripe */}
        <rect className="iono-band"
          x={0} y={ionoY - 5} width={W} height={8}
          fill="hsl(172 60% 55%)" opacity="0.25" />
        {/* Ionosphere label — pill background for contrast */}
        <rect x={W - 112} y={ionoY - 10} width={100} height={20}
          rx="4" fill="hsl(172 40% 18%)" opacity="0.7" />
        <text x={W - 62} y={ionoY + 5}
          textAnchor="middle" fontSize="13" fontStyle="italic" fontWeight="600"
          fill="hsl(172 80% 82%)" opacity="1">ionosphere</text>

        {/* ── Earth surface ────────────────────────────────────────────── */}
        {/* Filled ground mass — convex curvature (earth bulges upward) */}
        <path
          d={`M -4 ${earthY} Q ${W / 2} ${earthY - 18} ${W + 4} ${earthY} L ${W + 4} ${H} L -4 ${H} Z`}
          fill="hsl(142 18% 22%)" opacity="0.6" />
        {/* Horizon line */}
        <path
          d={`M -4 ${earthY} Q ${W / 2} ${earthY - 18} ${W + 4} ${earthY}`}
          fill="none" stroke="hsl(142 30% 42%)" strokeWidth="1" opacity="0.5" />

        {/* ── Propagation ray paths (ionospheric skip) ─────────────────── */}
        {rays.map(r => (
          <g key={r.cls}>
            <polyline className={r.cls} points={r.points}
              fill="none"
              stroke="hsl(38 92% 52%)"
              strokeWidth={r.w}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={r.opacity} />
            {/* Ground bounce point glows */}
            {r.bounces.map((bx, i) => (
              <circle key={`${r.cls}-b${i}`}
                cx={bx} cy={bounceY(bx)} r={3}
                fill="hsl(38 92% 52%)" opacity={0.15} />
            ))}
          </g>
        ))}

        {/* ── TX station (sits on curved ground) ─────────────────────── */}
        {/* Building */}
        <rect x={txX - 22} y={txGround - 24} width={44} height={24}
          rx="2" fill="currentColor" opacity="0.35"
          stroke="currentColor" strokeWidth="1" strokeOpacity="0.55" />
        <rect x={txX - 9} y={txGround - 24} width={18} height={8}
          fill="currentColor" opacity="0.25" />
        {/* Antenna mast */}
        <line x1={txX} y1={txGround - 24} x2={txX} y2={txTop}
          stroke="currentColor" strokeWidth="1.5" opacity="0.55" />
        {/* Guy wires */}
        <line x1={txX} y1={txTop + 10} x2={txX - 14} y2={txGround - 24}
          stroke="currentColor" strokeWidth="0.8" opacity="0.25" />
        <line x1={txX} y1={txTop + 10} x2={txX + 14} y2={txGround - 24}
          stroke="currentColor" strokeWidth="0.8" opacity="0.25" />
        {/* Antenna tip glow */}
        <circle className="tx-dot" cx={txX} cy={txTop} r={4}
          fill="hsl(38 92% 52%)" />
        {/* Label */}
        <text x={txX} y={txGround + 16} textAnchor="middle"
          fontSize="14" fontWeight="700"
          fill="hsl(0 0% 90%)" opacity="0.9" letterSpacing="2">TX</text>

        {/* ── RX station (sits on curved ground) ─────────────────────── */}
        <rect x={rxX - 22} y={rxGround - 24} width={44} height={24}
          rx="2" fill="currentColor" opacity="0.35"
          stroke="currentColor" strokeWidth="1" strokeOpacity="0.55" />
        <rect x={rxX - 9} y={rxGround - 24} width={18} height={8}
          fill="currentColor" opacity="0.25" />
        <line x1={rxX} y1={rxGround - 24} x2={rxX} y2={rxTop}
          stroke="currentColor" strokeWidth="1.5" opacity="0.55" />
        <line x1={rxX} y1={rxTop + 10} x2={rxX - 14} y2={rxGround - 24}
          stroke="currentColor" strokeWidth="0.8" opacity="0.25" />
        <line x1={rxX} y1={rxTop + 10} x2={rxX + 14} y2={rxGround - 24}
          stroke="currentColor" strokeWidth="0.8" opacity="0.25" />
        <circle className="rx-dot" cx={rxX} cy={rxTop} r={4}
          fill="hsl(172 60% 48%)" />
        <text x={rxX} y={rxGround + 16} textAnchor="middle"
          fontSize="14" fontWeight="700"
          fill="hsl(0 0% 90%)" opacity="0.9" letterSpacing="2">RX</text>

        {/* ── Distance label ───────────────────────────────────────────── */}
        <line x1={txX + 30} y1={earthY + 22} x2={rxX - 30} y2={earthY + 22}
          stroke="hsl(0 0% 85%)" strokeWidth="0.8" strokeDasharray="5 5" opacity="0.4" />
        <text x={W / 2} y={earthY + 38} textAnchor="middle"
          fontSize="13" fill="hsl(0 0% 88%)" opacity="0.8"
          letterSpacing="1.5">worldwide via multi-hop</text>

        {/* ── "HF" frequency label in the sky ─────────────────────────── */}
        <text x={W / 2} y={ionoY - 22} textAnchor="middle"
          fontSize="14" fill="currentColor" opacity="0.5"
          letterSpacing="3">HF skywave propagation</text>

        {/* ── Component symbol strip ───────────────────────────────────── */}
        <ComponentStrip cx={W / 2} y={earthY + 58} />

        {/* ── Stars above ionosphere ───────────────────────────────────── */}
        {[
          [60,20],[160,12],[310,30],[440,8],[560,25],[700,14],[750,35],
          [90,40],[220,22],[490,38],[630,18],
        ].map(([sx,sy],i) => (
          <circle key={`star-${i}`}
            cx={sx} cy={sy} r={0.8}
            fill="currentColor" opacity={0.1 + (i % 3) * 0.06} />
        ))}
      </SVGDiagram>
    </div>
  )
}

/* ── Component symbols strip ─────────────────────────────────────────────── */

function ComponentStrip({ cx, y }: { cx: number; y: number }) {
  // Symbols match the ARRL-standard circuit library (src/lib/circuit/symbols)
  // scaled to ~0.7x for the decorative strip
  const S = 1.5 // stroke width for strip symbols
  const items: Array<{ symbol: () => ReactNode; label: string }> = [
    {
      label: 'Resistor',
      // ARRL zigzag: 3.5 cycles, same proportions as passives.tsx
      symbol: () => (
        <g stroke="currentColor" strokeWidth={S} strokeLinecap="round" strokeLinejoin="round" opacity="0.75">
          <line x1={-20} y1={0} x2={-11} y2={0} />
          <polyline points="-11,0 -8.5,-6 -3,6 2.5,-6 8,6 11,0" fill="none" />
          <line x1={11} y1={0} x2={20} y2={0} />
        </g>
      ),
    },
    {
      label: 'Capacitor',
      // ARRL two parallel plates, same gap/plate proportions as passives.tsx
      symbol: () => (
        <g stroke="currentColor" strokeWidth={S} strokeLinecap="round" opacity="0.75">
          <line x1={-16} y1={0} x2={-3} y2={0} />
          <line x1={-3} y1={-8} x2={-3} y2={8} />
          <line x1={3} y1={-8} x2={3} y2={8} />
          <line x1={3} y1={0} x2={16} y2={0} />
        </g>
      ),
    },
    {
      label: 'Inductor',
      // ARRL air-core: 4 semicircular arcs, same geometry as passives.tsx
      symbol: () => (
        <g stroke="currentColor" strokeWidth={S} strokeLinecap="round" strokeLinejoin="round" opacity="0.75">
          <line x1={-20} y1={0} x2={-13} y2={0} />
          <path
            d="M -13 0 a 3.2 4.5 0 0 0 6.5 0 a 3.2 4.5 0 0 0 6.5 0 a 3.2 4.5 0 0 0 6.5 0 a 3.2 4.5 0 0 0 6.5 0"
            fill="none" />
          <line x1={13} y1={0} x2={20} y2={0} />
        </g>
      ),
    },
    {
      label: 'Waveform',
      symbol: () => (
        <path
          d="M -20,0 C -14,-10 -6,-10 0,0 C 6,10 14,10 20,0"
          fill="none" stroke="hsl(38 92% 52%)" strokeWidth="1.8"
          strokeLinecap="round" opacity="0.75" />
      ),
    },
    {
      label: 'Antenna',
      // ARRL antenna: V-shape with straight arms, same as misc.tsx
      symbol: () => (
        <g stroke="currentColor" strokeWidth={S} strokeLinecap="round" opacity="0.75">
          <line x1={0} y1={10} x2={0} y2={0} />
          <line x1={0} y1={0} x2={-9} y2={-10} />
          <line x1={0} y1={0} x2={9} y2={-10} />
        </g>
      ),
    },
  ]

  const spacing = 130
  const startX  = cx - ((items.length - 1) / 2) * spacing

  return (
    <g>
      {/* Connecting line */}
      <line
        x1={startX - 28} y1={y}
        x2={startX + (items.length - 1) * spacing + 28} y2={y}
        stroke="currentColor" strokeWidth="0.8" opacity="0.12"
        strokeDasharray="3 5" />

      {items.map((item, i) => {
        const x = startX + i * spacing
        return (
          <g key={item.label} transform={`translate(${x}, ${y})`}>
            {item.symbol()}
            <text y={22} textAnchor="middle"
              fontSize="12.5" fontWeight="500" fill="hsl(0 0% 88%)" opacity="0.9">
              {item.label}
            </text>
          </g>
        )
      })}

      {/* Arrows between symbols */}
      {items.slice(0, -1).map((_, i) => {
        const ax = startX + i * spacing + 26
        return (
          <path key={`arr-${i}`}
            d={`M ${ax},${y} L ${ax + 18},${y} M ${ax + 14},${y - 4} L ${ax + 20},${y} L ${ax + 14},${y + 4}`}
            fill="none" stroke="currentColor" strokeWidth="1"
            strokeLinecap="round" strokeLinejoin="round" opacity="0.15" />
        )
      })}
    </g>
  )
}
