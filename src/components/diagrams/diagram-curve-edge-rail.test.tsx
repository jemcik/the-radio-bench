/**
 * «Curve rides chart edge» regression gate.
 *
 * Catches the recurring class of bug where a curve renderer clamps each
 * sample's y to the chart bounds at sample-time:
 *
 *     const yClipped = Math.max(yMin, Math.min(yMax, raw))
 *
 * The visible result is a curve that LITERALLY follows the top or
 * bottom border of the chart for the entire span past the clip point —
 * a long horizontal rail glued to the plot edge. Pedagogically this
 * reads as «the quantity saturates at this value», which is almost
 * always wrong (real diodes don't saturate at 20 mA, real filters
 * don't bottom out at −60 dB, real exponentials don't plateau).
 *
 * The right fix is universally the same: stop clamping at the sample,
 * use SVG `<clipPath>` instead. The curve then naturally exits the
 * chart with its real slope, and the reader sees «keeps going off
 * screen», not a false plateau.
 *
 * What this gate does
 * ───────────────────
 * For every diagram component (auto-discovered via import.meta.glob),
 * render it, walk every foreground `<path>`, parse the M / L sample
 * points, and look for long runs of consecutive samples at the
 * SAME y. If such a run exists at the path's bbox top OR bottom — the
 * extreme y values, where chart-edge clipping pins points — the path
 * is flagged.
 *
 * Why «at bbox top OR bottom» specifically: legitimate flat sections
 * of curves (the I=0 reverse-bias plateau in a Zener curve, the
 * passband flat-top of a Butterworth filter response) sit at INTERIOR
 * y values, not at the curve's extreme y. A flat region at the curve's
 * bbox extreme is the unambiguous signature of edge-clipping.
 *
 * Threshold: ≥ 5 consecutive samples at the same y (within 0.5 px) at
 * either extreme. Five samples is short enough to catch even modest
 * clipped tails (a Zener forward-bias rail is ~28 samples; a Bode plot
 * stopband floor pinned by a clamped −80 dB cap can be hundreds of
 * samples). It's long enough to ignore the 1-2 sample run that can
 * occur at a legitimate curve apex.
 *
 * Skipped diagrams
 * ────────────────
 * Diagrams whose CURVES legitimately run along an edge — square waves,
 * step functions, plateau signals where the «top» of the waveform is
 * a real horizontal section, not a clip artifact — would get false-
 * positive flags. They're listed in SKIP_FILES with a one-line note
 * each, same convention as the diagram-text-overlap.test.tsx gate.
 */
import type React from 'react'
import { describe, expect, it } from 'vitest'
import { renderWithProviders } from '@/test/render'

const MIN_RAIL_LENGTH = 5
const SAME_Y_TOLERANCE_PX = 0.5

const modules = import.meta.glob<{ default: React.FC }>('./*.tsx', { eager: true })

const SKIP_FILES = new Set([
  // Utility wrappers
  './DiagramFigure.tsx',
  './SVGDiagram.tsx',
  './diagram-text-overlap.test.tsx',
  './diagram-curve-edge-rail.test.tsx',
  // Requires props
  './MagnitudeLadder.tsx',
  // Curves that legitimately have plateau / flat sections at their
  // bbox extreme — the «top» of a square wave, the flat passband at
  // 0 dB of a normalised Bode plot. These are real signal shapes,
  // not clip artifacts. Each entry below should be re-justified the
  // first time it fails — a NEW long rail at the curve extreme is
  // usually a clip bug, not a deliberate plateau.
  './WaveformGallery.tsx',     // includes square-wave samples — top/bottom plateaus are the signal
  './BodePlotReadingGuide.tsx', // 0-dB passband flat-top is a real horizontal section
  './BlocksDcPassesAcDiagram.tsx', // square waves + RC step responses; their plateaus are the signal
  './BlocksAcPassesDcDiagram.tsx', // same — block diagram with square / step waveforms
])

const DIAGRAMS = Object.entries(modules)
  .filter(([path]) => !SKIP_FILES.has(path) && !path.endsWith('.test.tsx'))
  .map(([path, mod]) => {
    const name = path.replace('./', '').replace('.tsx', '')
    return { name, Component: mod.default }
  })
  .filter(d => typeof d.Component === 'function')

/* ── Helpers (mirrored from diagram-text-overlap.test.tsx) ─────── */

function isBackground(el: Element): boolean {
  let cur: Element | null = el
  while (cur) {
    if (cur.hasAttribute('data-overlap-allowed')) return true
    const opacity = parseFloat(cur.getAttribute('opacity') ?? '1')
    if (opacity < 0.7) return true
    const sw = cur.getAttribute('stroke-width')
    if (sw !== null) {
      const n = parseFloat(sw)
      if (!Number.isNaN(n) && n < 1.0) return true
    }
    cur = cur.parentElement
  }
  return false
}

function isInsideTransformedGroup(el: Element): boolean {
  let cur: Element | null = el
  while (cur && cur.tagName.toLowerCase() !== 'svg') {
    if (cur.hasAttribute('transform')) return true
    cur = cur.parentElement
  }
  return false
}

/** True when the element OR any ancestor up to the SVG root carries a
 *  `clip-path` attribute. Authors apply clipPath either directly on
 *  the path or, more often, on a wrapping `<g>` that contains the
 *  curve plus other clipped elements. Walking the chain catches both. */
function hasClipPathAncestor(el: Element): boolean {
  let cur: Element | null = el
  while (cur && cur.tagName.toLowerCase() !== 'svg') {
    if (cur.hasAttribute('clip-path')) return true
    cur = cur.parentElement
  }
  return false
}

/** Parse a path's `d` attribute into an array of sample points. Only
 *  M and L commands are considered (cubic Bezier control points are
 *  not real samples). Sufficient for the linearly-interpolated curve
 *  paths produced by the diagrams in this codebase. */
function parsePathSamples(d: string): Array<[number, number]> {
  const points: Array<[number, number]> = []
  for (const m of d.matchAll(/[ML]\s*([-\d.]+)[\s,]+([-\d.]+)/g)) {
    points.push([parseFloat(m[1]), parseFloat(m[2])])
  }
  return points
}

/** Longest run of consecutive points whose y falls within `tol` of
 *  `targetY`. Used to find rails at a specific y. */
function longestRunAtY(
  points: Array<[number, number]>,
  targetY: number,
  tol = SAME_Y_TOLERANCE_PX,
): number {
  let longest = 0
  let current = 0
  for (const [, y] of points) {
    if (Math.abs(y - targetY) <= tol) {
      current++
      if (current > longest) longest = current
    } else {
      current = 0
    }
  }
  return longest
}

/* ── The test ─────────────────────────────────────────────────── */

describe.each(DIAGRAMS)('$name — no path rides chart edge as a flat rail', ({ Component }) => {
  it('no <path> has 5+ consecutive samples at its own bbox top OR bottom', () => {
    const { container } = renderWithProviders(<Component />)
    const findings: string[] = []

    for (const svg of Array.from(container.querySelectorAll('svg'))) {
      const paths = Array.from(svg.querySelectorAll('path')) as SVGPathElement[]
      for (const path of paths) {
        if (isBackground(path) || isInsideTransformedGroup(path)) continue
        // If the author has explicitly applied a clipPath, the long
        // rail (if any) sits OUTSIDE the visible plot rectangle and is
        // intentionally hidden. The bug class we're catching is when
        // there is NO clipPath and the curve rides the chart edge as
        // a visible plateau.
        if (hasClipPathAncestor(path)) continue
        const d = path.getAttribute('d') ?? ''
        const points = parsePathSamples(d)
        if (points.length < MIN_RAIL_LENGTH) continue

        const ys = points.map(p => p[1])
        const minY = Math.min(...ys)
        const maxY = Math.max(...ys)

        // A path with no y-spread at all is a horizontal line (a wire,
        // a baseline) — not a clipped curve. Skip those.
        if (maxY - minY < 1) continue

        const runAtTop = longestRunAtY(points, minY)
        const runAtBottom = longestRunAtY(points, maxY)

        if (runAtTop >= MIN_RAIL_LENGTH) {
          findings.push(
            `path with ${points.length} samples has a ${runAtTop}-sample horizontal rail at its TOP edge (y=${minY.toFixed(1)}). This is the clip-at-sample-time bug: the renderer is calling Math.min(yMax, raw) on each sample, pinning y to the chart boundary instead of letting the curve exit naturally. Replace with SVG <clipPath> on the plot rectangle.`,
          )
        }
        if (runAtBottom >= MIN_RAIL_LENGTH) {
          findings.push(
            `path with ${points.length} samples has a ${runAtBottom}-sample horizontal rail at its BOTTOM edge (y=${maxY.toFixed(1)}). This is the clip-at-sample-time bug: the renderer is calling Math.max(yMin, raw) on each sample, pinning y to the chart boundary instead of letting the curve exit naturally. Replace with SVG <clipPath> on the plot rectangle.`,
          )
        }
      }
    }

    expect(findings, findings.join('\n')).toEqual([])
  })
})
