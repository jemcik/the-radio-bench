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
 *     <Resistor x={100} y={40} label="R1" value="1kΩ" />
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
   * Optional max-width (CSS value) for the surrounding card. Without this,
   * `SVGDiagram` sets `width="100%"` so a small schematic scales up to fill
   * the entire chapter column, rendering as if at 2–3× its design size.
   * Pass e.g. `480` (treated as px) or `"32rem"` to keep the diagram at a
   * comfortable reading size.
   */
  maxWidth?: number | string
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

export default function Circuit({ width, height, caption, maxWidth, legend, children }: CircuitProps) {
  const mw = typeof maxWidth === 'number' ? `${maxWidth}px` : maxWidth
  const hasLegend = legend && legend.length > 0
  return (
    <figure
      className="not-prose"
      style={mw ? { maxWidth: mw, marginInline: 'auto' } : undefined}
    >
      {/* text-[hsl(var(--sketch-stroke))] softens the default stroke (wires,
          component outlines, junction dots) so the schematic reads as an
          inked drawing rather than hard-black lines. Accent-coloured wires
          (e.g. meter probes) override it via their own `color` prop.

          With a legend: side-by-side on sm+ (SVG on the left, legend stack
          on the right, each item in its own row); stacks vertically on
          narrow screens so neither gets squished. */}
      <div className="rounded-xl border border-border bg-card overflow-hidden p-4 text-[hsl(var(--sketch-stroke))]">
        {hasLegend ? (
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            {/* SVG capped at 560 px so the schematic renders at a comfortable
                reading size even when the card spans the full column width.
                Remaining horizontal space becomes a gap between the diagram
                and the legend — the card itself stays edge-to-edge. */}
            <div className="flex-1 min-w-0 max-w-[560px]">
              <SVGDiagram width={width} height={height}>
                {children}
              </SVGDiagram>
            </div>
            {/* 2-column table: swatches in a fixed-width column on the left,
                labels aligned on the right. The `contents` class on <li>
                removes the list item from layout so dt/dd act as direct grid
                children and all swatches + labels line up cleanly. */}
            <dl className="shrink-0 grid grid-cols-[1.5rem_1fr] gap-x-3 gap-y-2 text-[11px] text-muted-foreground">
              {legend.map((item, i) => (
                <div key={i} className="contents">
                  <dt className="flex items-center justify-center">
                    <LegendSwatch kind={item.kind ?? 'line'} color={item.color} />
                  </dt>
                  <dd className="flex items-center">{item.label}</dd>
                </div>
              ))}
            </dl>
          </div>
        ) : (
          <SVGDiagram width={width} height={height}>
            {children}
          </SVGDiagram>
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

export type LegendSwatchKind = 'line' | 'dot' | 'circle' | 'resistor' | 'battery' | 'led'

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
  if (kind === 'led') {
    // LED = diode triangle + cathode bar + tiny emission arrow. Drawn at
    // swatch scale (24×16). The viewBox is tall enough that the emission
    // arrow tip stays fully inside — the old 22×14 version clipped the
    // arrow at the top edge, which is the bug this commit fixes.
    return (
      <svg width="24" height="16" viewBox="0 0 24 16" aria-hidden className="shrink-0">
        {/* Leads */}
        <line x1="1"  y1="10" x2="7"  y2="10" stroke={c} strokeWidth={1.3} strokeLinecap="round" />
        <line x1="15" y1="10" x2="23" y2="10" stroke={c} strokeWidth={1.3} strokeLinecap="round" />
        {/* Triangle — filled so it reads as a diode at swatch size */}
        <polygon points="7,6 7,14 15,10" fill={c} stroke={c} strokeWidth={1} strokeLinejoin="round" />
        {/* Cathode bar */}
        <line x1="15" y1="6" x2="15" y2="14" stroke={c} strokeWidth={1.3} strokeLinecap="round" />
        {/* Emission arrow — shaft + small chevron arrowhead, all inside viewBox */}
        <line x1="11" y1="5" x2="16" y2="1" stroke={c} strokeWidth={1} strokeLinecap="round" />
        <polyline points="13,1 16,1 16,4" fill="none" stroke={c} strokeWidth={1} strokeLinecap="round" strokeLinejoin="round" />
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
