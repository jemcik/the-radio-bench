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
  /** SVG children — symbols, wires, labels, etc. */
  children: ReactNode
}

export default function Circuit({ width, height, caption, children }: CircuitProps) {
  return (
    <figure className="not-prose">
      <div className="rounded-xl border border-border bg-card overflow-hidden p-4">
        <SVGDiagram width={width} height={height}>
          {children}
        </SVGDiagram>
      </div>
      {caption && (
        <figcaption className="mt-2 text-center text-xs text-muted-foreground">
          {caption}
        </figcaption>
      )}
    </figure>
  )
}
