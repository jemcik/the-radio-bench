/**
 * Thin wrapper around Rough.js for the hand-drawn / sketchy
 * illustration style used in chapter heroes.
 *
 * Why we wrap it:
 *   1. Theme compatibility. Rough.js bakes `stroke="..."` into its
 *      generated SVG, which freezes colours at draw-time and breaks
 *      dark-mode switching. We call `generator.toPaths()` to get raw
 *      path `d` strings and then render the `<path>` elements OURSELVES
 *      with `stroke="currentColor"`, so CSS tokens (`--sketch-stroke`,
 *      etc.) flow through normally.
 *
 *   2. Stable output. Every shape takes a seed. A module-level seeded
 *      generator produces deterministic paths on every render, so the
 *      "sketch" does not re-roll on hot reload or scroll. Pass
 *      different seeds per shape when you want them to look distinct.
 *
 *   3. Friendly surface. The caller works with simple helper functions
 *      (`roughLine`, `roughRect`, `roughCircle`, `roughPath`) that
 *      return plain `{ d, strokeWidth }[]` arrays. No DOM access, no
 *      React refs, no imperative `RoughSVG`.
 *
 * Typical use inside a chapter-hero component:
 *
 *   const wireTop = roughLine(110, 58, 370, 58, { seed: 2 })
 *   ...
 *   <svg ...>
 *     {wireTop.map((p, i) => (
 *       <path key={i} d={p.d} stroke="currentColor" fill="none"
 *             strokeWidth={p.strokeWidth} />
 *     ))}
 *   </svg>
 */
import type { SVGProps } from 'react'
import rough from 'roughjs'
import type { Options } from 'roughjs/bin/core'
import type { Point } from 'roughjs/bin/geometry'

const gen = rough.generator()

export type RoughPath = { d: string; strokeWidth: number }

/** Default options — subtle roughness, consistent with textbook style. */
const DEFAULT: Options = {
  roughness: 0.7,
  bowing: 0.5,
  strokeWidth: 1.3,
  disableMultiStroke: false,
}

function merge(opts: Options | undefined): Options {
  return opts ? { ...DEFAULT, ...opts } : DEFAULT
}

function toPaths(drawable: ReturnType<typeof gen.line>): RoughPath[] {
  return gen.toPaths(drawable).map(p => ({ d: p.d, strokeWidth: p.strokeWidth }))
}

export function roughLine(x1: number, y1: number, x2: number, y2: number, opts?: Options): RoughPath[] {
  return toPaths(gen.line(x1, y1, x2, y2, merge(opts)))
}

export function roughRect(x: number, y: number, w: number, h: number, opts?: Options): RoughPath[] {
  return toPaths(gen.rectangle(x, y, w, h, merge(opts)))
}

export function roughCircle(cx: number, cy: number, diameter: number, opts?: Options): RoughPath[] {
  return toPaths(gen.circle(cx, cy, diameter, merge(opts)))
}

export function roughLinearPath(points: Point[], opts?: Options): RoughPath[] {
  return toPaths(gen.linearPath(points, merge(opts)))
}

export function roughPath(d: string, opts?: Options): RoughPath[] {
  return toPaths(gen.path(d, merge(opts)))
}

/**
 * Render an array of Rough.js-generated paths as `<path>` elements with
 * `stroke="currentColor"`. Extra SVG props are forwarded to every path
 * (useful for opacity, clip-path, etc.).
 */
export function RoughPaths({
  paths,
  ...rest
}: { paths: RoughPath[] } & SVGProps<SVGPathElement>) {
  return (
    <>
      {paths.map((p, i) => (
        <path
          key={i}
          d={p.d}
          stroke="currentColor"
          fill="none"
          strokeWidth={p.strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          {...rest}
        />
      ))}
    </>
  )
}
