/**
 * Circuit — SVG canvas wrapper for schematic diagrams.
 *
 * Provides:
 *  - Hard clipPath overflow guard (via SVGDiagram)
 *  - Themed card container with caption support
 *  - Consistent padding and rounded corners
 *
 * USAGE
 *   <Circuit width={360} height={220} caption="Simple RC filter">
 *     <Resistor x={100} y={40} label="R1" value="1 kΩ" />
 *     <Capacitor x={200} y={100} orient="down" label="C1" />
 *     <Wire points={[r1.p2, {x:200, y:40}, c1.p1]} />
 *   </Circuit>
 */

import type { ReactNode } from 'react'
import SVGDiagram from '@/components/diagrams/SVGDiagram'

interface CircuitProps {
  /** Viewbox / logical width in px. */
  width: number
  /** Viewbox / logical height in px. */
  height: number
  /** Optional caption rendered below the diagram. */
  caption?: string
  /**
   * Optional colour legend shown as a compact row beneath the SVG (inside
   * the card). Each entry gets a small swatch + label. Useful when the
   * diagram uses accent wires (e.g. voltmeter probes) whose meaning the
   * reader needs help parsing.
   */
  legend?: LegendItem[]
  /** SVG children — symbols, wires, labels, etc. */
  children: ReactNode
}

export default function Circuit({ width, height, caption, legend, children }: CircuitProps) {
  return (
    <figure className="not-prose">
      {/* text-[hsl(var(--sketch-stroke))] softens the default stroke (wires,
          component outlines, junction dots) so the schematic reads as an
          inked drawing rather than hard-black lines. Accent-coloured wires
          (e.g. meter probes) override it via their own `color` prop. */}
      <div className="rounded-xl border border-border bg-card overflow-hidden p-4 text-[hsl(var(--sketch-stroke))]">
        <SVGDiagram width={width} height={height}>
          {children}
        </SVGDiagram>
        {legend && legend.length > 0 && (
          <ul className="mt-3 flex flex-wrap justify-center gap-x-5 gap-y-1.5 text-[11px] text-muted-foreground">
            {legend.map((item, i) => (
              <li key={i} className="flex items-center gap-1.5">
                <LegendSwatch kind={item.kind ?? 'line'} color={item.color} />
                <span>{item.label}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
      {caption && (
        <figcaption className="mt-2 text-center text-xs text-muted-foreground">
          {caption}
        </figcaption>
      )}
    </figure>
  )
}

/* ── Legend helpers ──────────────────────────────────────────────────────── */

export type LegendSwatchKind = 'line' | 'dot' | 'circle' | 'resistor' | 'battery'

export interface LegendItem {
  /** Visual shape of the swatch. Defaults to 'line' (short horizontal stroke). */
  kind?: LegendSwatchKind
  /** Stroke/fill colour. Defaults to `currentColor` (the sketch-stroke token). */
  color?: string
  /** Human-readable description (already i18n-resolved). */
  label: string
}

function LegendSwatch({ kind, color }: { kind: LegendSwatchKind; color?: string }) {
  const c = color ?? 'currentColor'

  if (kind === 'dot') {
    return (
      <svg width="14" height="10" aria-hidden className="shrink-0">
        <circle cx="7" cy="5" r="3" fill={c} />
      </svg>
    )
  }
  if (kind === 'circle') {
    return (
      <svg width="14" height="10" aria-hidden className="shrink-0">
        <circle cx="7" cy="5" r="4" fill="none" stroke={c} strokeWidth={1.4} />
      </svg>
    )
  }
  if (kind === 'resistor') {
    // Miniature zigzag that matches the ARRL-style resistor symbol.
    // Three peaks — enough to be recognisable at swatch size without
    // getting noisy.
    return (
      <svg width="26" height="10" aria-hidden className="shrink-0">
        <path
          d="M 1 5 L 5 5 l 2 -3 l 3 6 l 3 -6 l 3 6 l 3 -6 l 2 3 l 4 0"
          fill="none"
          stroke={c}
          strokeWidth={1.3}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  }
  if (kind === 'battery') {
    // Classic battery symbol: one long plate (+) and one short plate (−),
    // flanked by stub leads. Drawn taller than the other swatches so the
    // plate-length contrast is readable.
    return (
      <svg width="20" height="12" aria-hidden className="shrink-0">
        <line x1="1"  y1="6" x2="8"  y2="6"  stroke={c} strokeWidth={1.5} strokeLinecap="round" />
        <line x1="8"  y1="1" x2="8"  y2="11" stroke={c} strokeWidth={1.5} strokeLinecap="round" />
        <line x1="12" y1="3" x2="12" y2="9"  stroke={c} strokeWidth={1.5} strokeLinecap="round" />
        <line x1="12" y1="6" x2="19" y2="6"  stroke={c} strokeWidth={1.5} strokeLinecap="round" />
      </svg>
    )
  }
  // 'line'
  return (
    <svg width="18" height="10" aria-hidden className="shrink-0">
      <line x1="1" y1="5" x2="17" y2="5" stroke={c} strokeWidth={2} strokeLinecap="round" />
    </svg>
  )
}
