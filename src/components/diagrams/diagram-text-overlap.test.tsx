/**
 * Bounding-box overlap gate for diagram text labels.
 *
 * Catches the «label sits ON the curve / axis / dashed line» class of
 * bug. ZenerIVCurve shipped four overlap bugs at once (forward curve
 * through the «пряме» label, top-edge clip through «I (mA)», breakdown
 * curve through «−V_Z», dashed V_Z marker through «пробій — стабілізація»)
 * and the user caught all four on a screenshot. None of the static
 * gates noticed because all four involved GEOMETRIC relationships
 * between elements, not anything visible in the i18n string or the JSX
 * source.
 *
 * What this gate does
 * ───────────────────
 * Render each registered diagram via React Testing Library, then for
 * every <text> element compute an approximate bounding box and check
 * whether any «foreground» <line> or <path> in the same SVG passes
 * THROUGH that bbox. If yes — fail with a descriptive message naming
 * the label, its coordinates, and the offending shape.
 *
 * Approximations & caveats
 * ────────────────────────
 *   • Text width is estimated as `chars × fontSize × CHAR_W_RATIO`,
 *     where CHAR_W_RATIO=0.55 is a sans-serif average. Real char widths
 *     vary; this over-estimates wide labels (М, Ш, …) and under-estimates
 *     narrow ones (i, l). Good enough for a 70-80 % coverage gate.
 *   • Multi-line labels (text with multiple <tspan> on different y) are
 *     treated as a single bbox covering all tspans — over-conservative,
 *     which means more potential false positives but no missed bugs.
 *   • Path crossings are checked at SAMPLE points (the M / L commands),
 *     not at every interpolated pixel. A path with widely-spaced samples
 *     could «jump over» a bbox without hitting any sample point.
 *   • Background elements (gridlines, highlight bands) are excluded by
 *     filtering on stroke-width < 1 OR opacity < 0.7 OR a parent <g>
 *     with those attributes. Authors who add a NEW background element
 *     family must keep it in that filter regime, otherwise the gate
 *     will flag every label sitting on top of it.
 *
 * Not covered
 * ───────────
 *   • Path-on-path overlap (one curve crossing another curve).
 *   • <rect> / <circle> / <polygon> shapes — only <line> and <path>.
 *   • Animated transforms (CSS transforms) — bboxes are computed from
 *     authoring coordinates, not the visible animated state.
 *
 * Originally also out-of-scope: label-on-label overlap. Re-added after
 * a real bug — the «−6» x-tick label sat between the two lines of the
 * «пробій — / стабілізація» 2-line region label, visually overlapping
 * the first line. Now flagged when two `<text>` bboxes (or two distinct
 * tspan-derived bboxes from different `<text>` parents) overlap by
 * more than 2 px in BOTH dimensions.
 *
 * If a flagged overlap is intentional (e.g. a dashed leader line that
 * is supposed to touch its label), move the label or the leader to
 * the boundary so they kiss without crossing — or wrap the leader
 * inside a `data-overlap-allowed=""` attribute that the gate skips.
 */
import type React from 'react'
import { describe, expect, it } from 'vitest'
import { renderWithProviders } from '@/test/render'

/* ── Tunables ─────────────────────────────────────────────────────── */

const CHAR_W_RATIO = 0.55           // sans-serif average char width / fontSize
const FONT_HEIGHT_RATIO = 1.10      // line-height / fontSize
const ASCENT_RATIO = 0.80           // baseline-to-top / line-height
const TOLERANCE_PX = 2              // slack for stroke widths and approximations
const PATH_SAMPLE_STEPS = 60        // samples per <line> for crossing test

/** Auto-discover every diagram component in this directory. New
 *  diagrams added in future chapters get covered automatically — no
 *  list to maintain. The `eager: true` mode imports synchronously so
 *  the module map is ready at test-collection time. */
const modules = import.meta.glob<{ default: React.FC }>('./*.tsx', { eager: true })

/** Files the gate cannot run cleanly. Three reasons:
 *
 *   1. Utility wrappers, not single renderable diagrams.
 *   2. Components that REQUIRE props (no zero-arg default render).
 *   3. Diagrams whose author has placed text labels intentionally
 *      adjacent to a graphical element — annotation pointing to a
 *      curve, GND symbol abutting its wire, capacitor «+» plate sign
 *      next to the dielectric path. The bbox approximation can't
 *      distinguish «label sits AT the shape's endpoint as designed»
 *      from «label is overlapping the shape mid-stroke as a bug». In
 *      these cases the visual review is the source of truth; the
 *      gate's bbox model is too coarse.
 *
 *   Rule of thumb for adding to this list: only skip a file AFTER
 *   visually confirming the flagged overlap is intentional. Each entry
 *   below carries a one-line note saying which label / shape pair was
 *   judged acceptable.
 */
const SKIP_FILES = new Set([
  // 1. Utility wrappers
  './DiagramFigure.tsx',
  './SVGDiagram.tsx',
  './diagram-text-overlap.test.tsx',
  // 2. Requires props
  './MagnitudeLadder.tsx',         // takes `items` prop, no default render
  // 3. Intentional close-placement designs
  './BreadboardDiagram.tsx',       // «+» / «−» power-rail labels stacked one above the other by breadboard convention
  './BodePlotReadingGuide.tsx',    // «−20 dB/decade» annotation sits ON the slope it labels
  './CapacitorTypeGallery.tsx',    // «+» plate-sign labels abut electrolytic-cap symbol stroke
  './DividerSchematic.tsx',        // voltmeter «A» designator inside the meter circle
  './FilterTypeGallery.tsx',       // tiny in-cell waveform paths intentionally pass close to the «in» / «out» labels
  './FlybackDiodeSchematic.tsx',   // «Q1» transistor designator sits inside the symbol circle by Circuit convention
  './RfChokeSchematic.tsx',        // GND symbol's vertical wire ends at the GND text label by ARRL convention
  './SeriesIslandIllustration.tsx', // charge labels («C₁», «−Q», «+Q») sit on the cap-plate Bezier paths by design
])

const DIAGRAMS = Object.entries(modules)
  .filter(([path]) => !SKIP_FILES.has(path) && !path.endsWith('.test.tsx'))
  .map(([path, mod]) => {
    const name = path.replace('./', '').replace('.tsx', '')
    return { name, Component: mod.default }
  })
  .filter(d => typeof d.Component === 'function')

/* ── Geometry primitives ─────────────────────────────────────────── */

interface BBox {
  x: number; y: number; w: number; h: number
  label: string
}

/**
 * Resolve `font-size` for an SVG node. Handles three CSS forms:
 *   • bare number ("13", "0.75") — px
 *   • em / rem ("0.75em", "1rem") — × 16
 *   • percent ("70%") — × parent's resolved font-size, recursively
 *
 * Walks up the parent chain when the element has no own `font-size`.
 *
 * The percent case matters because subscript tspans typically render as
 * `<tspan font-size="70%">`. Without the recursive resolve, a literal
 * `parseFloat("70%")` returns 70, which my bbox calc then treats as a
 * 70 px font and produces 77×77 pseudo-bboxes for «in» / «pp» labels.
 * Caught while building this gate — would have hidden every multi-tspan
 * subscript label behind a giant fake bbox.
 */
function parseFontSize(el: Element | null): number {
  if (!el) return 13
  const fs = el.getAttribute?.('font-size')
  if (fs) {
    if (fs.endsWith('em') || fs.endsWith('rem')) return parseFloat(fs) * 16
    if (fs.endsWith('%')) {
      const parentFs = parseFontSize(el.parentElement)
      return (parseFloat(fs) / 100) * parentFs
    }
    const n = parseFloat(fs)
    if (!Number.isNaN(n)) return n
  }
  return parseFontSize(el.parentElement)
}

function lineBBox(
  text: string, fs: number, x: number, y: number, anchor: string,
): BBox {
  const w = text.length * fs * CHAR_W_RATIO
  const h = fs * FONT_HEIGHT_RATIO
  let bx = x
  if (anchor === 'middle') bx = x - w / 2
  else if (anchor === 'end') bx = x - w
  return { x: bx, y: y - h * ASCENT_RATIO, w, h, label: text }
}

/**
 * Yield one BBox per visual line. Two distinct cases:
 *
 *   • Multi-line label — a `<text>` whose tspans use `dy=` or different
 *     `y=` to stack visually. Each tspan gets its own per-line bbox.
 *     Example: `<text><tspan>пробій —</tspan><tspan dy="14">стабілі-
 *     зація</tspan></text>` renders as two lines.
 *
 *   • Single-line label — anything else, including:
 *       - plain `<text>some text</text>` with no tspans.
 *       - `<text><tspan italic>V</tspan> (B)</text>` — italic-styled
 *         variable plus literal unit text (mixed tspan + raw text).
 *       - `<text>X<tspan baseline-shift="sub">Y</tspan></text>` — sub-
 *         script via baseline-shift (X_y rendered through `withSubscripts-
 *         Svg`). The «sub» glyph is part of the same visual line.
 *     For all of these we use the WHOLE textContent as one bbox. An
 *     earlier version yielded a bbox for each tspan only when tspans
 *     existed, which silently dropped the raw-text portion of mixed
 *     labels — caught when «I (мА)» under-measured to the «I» glyph
 *     alone (7 px wide instead of ~43 px) and the gate missed the
 *     overlap with the y=20 tick label.
 */
function* textBBoxes(el: SVGTextElement): Iterable<BBox> {
  const fs = parseFontSize(el)
  const baseAnchor = el.getAttribute('text-anchor') ?? 'start'
  const baseX = parseFloat(el.getAttribute('x') ?? '0')
  const baseY = parseFloat(el.getAttribute('y') ?? '0')

  const tspans = Array.from(el.querySelectorAll(':scope > tspan'))
  // A tspan is a LINE BREAK only when it carries an explicit dy or a
  // y= different from the parent's. tspans that exist purely to apply
  // style (italic, baseline-shift, font-family) are part of the same
  // visual line as the surrounding text.
  const isMultiLine = tspans.some(
    t => t.hasAttribute('dy') || t.hasAttribute('y'),
  )

  if (!isMultiLine) {
    const content = (el.textContent ?? '').trim()
    if (content) yield lineBBox(content, fs, baseX, baseY, baseAnchor)
    return
  }

  // Multi-line: one bbox per tspan, with running x/y so dx/dy
  // accumulate correctly.
  let curX = baseX
  let curY = baseY
  for (const tspan of tspans) {
    const xAttr = tspan.getAttribute('x')
    const yAttr = tspan.getAttribute('y')
    const dxAttr = tspan.getAttribute('dx')
    const dyAttr = tspan.getAttribute('dy')
    if (xAttr !== null) curX = parseFloat(xAttr)
    if (yAttr !== null) curY = parseFloat(yAttr)
    if (dxAttr !== null) curX += parseFloat(dxAttr)
    if (dyAttr !== null) curY += parseFloat(dyAttr)

    const tspanFs = parseFontSize(tspan)
    const content = (tspan.textContent ?? '').trim()
    if (content) yield lineBBox(content, tspanFs, curX, curY, baseAnchor)
  }
}

function pointInBBox(px: number, py: number, bb: BBox, tol = TOLERANCE_PX): boolean {
  return (
    px >= bb.x - tol && px <= bb.x + bb.w + tol &&
    py >= bb.y - tol && py <= bb.y + bb.h + tol
  )
}

/** Two bboxes overlap when they intersect by AT LEAST `minOverlap` px
 *  in BOTH x and y dimensions. The «in both» rule means a label that
 *  shares a row with another label but sits in a different x-range
 *  doesn't trip — only true geometric overlaps. */
function bboxesOverlap(a: BBox, b: BBox, minOverlap = 2): boolean {
  const overlapX = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x)
  const overlapY = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y)
  return overlapX >= minOverlap && overlapY >= minOverlap
}

function lineCrossesBBox(
  x1: number, y1: number, x2: number, y2: number, bb: BBox,
): boolean {
  for (let i = 0; i <= PATH_SAMPLE_STEPS; i++) {
    const t = i / PATH_SAMPLE_STEPS
    if (pointInBBox(x1 + t * (x2 - x1), y1 + t * (y2 - y1), bb)) return true
  }
  return false
}

function pathCrossesBBox(d: string, bb: BBox): boolean {
  // Walk every M / L command; check both endpoints AND interpolate
  // between consecutive points, so a curve segment that spans a label
  // bbox without landing a sample inside still counts.
  let prevX: number | null = null
  let prevY: number | null = null
  for (const m of d.matchAll(/[ML]\s*([-\d.]+)[\s,]+([-\d.]+)/g)) {
    const px = parseFloat(m[1])
    const py = parseFloat(m[2])
    if (prevX !== null && prevY !== null) {
      if (lineCrossesBBox(prevX, prevY, px, py, bb)) return true
    } else if (pointInBBox(px, py, bb)) {
      return true
    }
    prevX = px
    prevY = py
  }
  return false
}

/* ── Foreground / background filter ───────────────────────────────── */

/**
 * True when the element (or any ancestor) is part of a background
 * layer the author intends labels to sit ON TOP of: low opacity,
 * thin strokes, or `data-overlap-allowed` opt-out.
 */
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

/**
 * True when the element sits inside a `<g transform=…>` group. Circuit
 * primitives wrap every symbol body in such a group so each component
 * can be positioned by its own (cx, cy) origin, with internal coordinates
 * stored as offsets. Comparing bboxes from local-coordinate elements
 * to other elements (which might be in different transforms) gives
 * apples-to-oranges geometry — and the bug class this gate exists to
 * catch (label-on-curve in chart-style diagrams) doesn't manifest in
 * schematic-style diagrams anyway: schematics use TerminalLabel /
 * parseLabelSubscript which auto-position labels next to their leads
 * by design. Skipping transformed elements scopes the gate to the
 * chart-style diagrams where the bug class actually lives.
 */
function isInsideTransformedGroup(el: Element): boolean {
  let cur: Element | null = el
  while (cur && cur.tagName.toLowerCase() !== 'svg') {
    if (cur.hasAttribute('transform')) return true
    cur = cur.parentElement
  }
  return false
}

/* ── The actual test ──────────────────────────────────────────────── */

describe.each(DIAGRAMS)('$name — text labels do not overlap shapes', ({ Component }) => {
  it('no <text> bbox is crossed by any foreground <line> or <path>', () => {
    const { container } = renderWithProviders(<Component />)
    const findings: string[] = []

    for (const svg of Array.from(container.querySelectorAll('svg'))) {
      const texts = Array.from(svg.querySelectorAll('text')) as SVGTextElement[]
      const lines = Array.from(svg.querySelectorAll('line')) as SVGLineElement[]
      const paths = Array.from(svg.querySelectorAll('path')) as SVGPathElement[]

      // Collect every text bbox first so we can do pairwise text-vs-text
      // checks below without rebuilding bboxes inside the inner loops.
      const textBBoxList: Array<{ owner: SVGTextElement; bbox: BBox }> = []
      for (const text of texts) {
        if (isInsideTransformedGroup(text)) continue
        for (const bbox of textBBoxes(text)) {
          textBBoxList.push({ owner: text, bbox })

          for (const line of lines) {
            if (isBackground(line) || isInsideTransformedGroup(line)) continue
            const x1 = parseFloat(line.getAttribute('x1') ?? '0')
            const y1 = parseFloat(line.getAttribute('y1') ?? '0')
            const x2 = parseFloat(line.getAttribute('x2') ?? '0')
            const y2 = parseFloat(line.getAttribute('y2') ?? '0')
            if (lineCrossesBBox(x1, y1, x2, y2, bbox)) {
              findings.push(
                `text "${bbox.label}" at (${bbox.x.toFixed(0)}, ${bbox.y.toFixed(0)}, ${bbox.w.toFixed(0)}×${bbox.h.toFixed(0)}) crossed by <line> from (${x1.toFixed(0)},${y1.toFixed(0)}) to (${x2.toFixed(0)},${y2.toFixed(0)})`,
              )
            }
          }

          for (const path of paths) {
            if (isBackground(path) || isInsideTransformedGroup(path)) continue
            const d = path.getAttribute('d') ?? ''
            if (pathCrossesBBox(d, bbox)) {
              findings.push(
                `text "${bbox.label}" at (${bbox.x.toFixed(0)}, ${bbox.y.toFixed(0)}, ${bbox.w.toFixed(0)}×${bbox.h.toFixed(0)}) crossed by <path> "${d.slice(0, 60).replace(/\s+/g, ' ')}..."`,
              )
            }
          }
        }
      }

      // Pairwise text-vs-text overlap. Skip pairs where both bboxes
      // come from the same `<text>` parent — those are the multi-tspan
      // lines of one label compared against each other (always
      // non-overlapping by construction, but the iteration would
      // pointlessly enumerate them).
      for (let i = 0; i < textBBoxList.length; i++) {
        for (let j = i + 1; j < textBBoxList.length; j++) {
          const a = textBBoxList[i]
          const b = textBBoxList[j]
          if (a.owner === b.owner) continue
          if (bboxesOverlap(a.bbox, b.bbox)) {
            findings.push(
              `text "${a.bbox.label}" at (${a.bbox.x.toFixed(0)}, ${a.bbox.y.toFixed(0)}, ${a.bbox.w.toFixed(0)}×${a.bbox.h.toFixed(0)}) overlaps text "${b.bbox.label}" at (${b.bbox.x.toFixed(0)}, ${b.bbox.y.toFixed(0)}, ${b.bbox.w.toFixed(0)}×${b.bbox.h.toFixed(0)})`,
            )
          }
        }
      }
    }

    expect(findings, findings.join('\n')).toEqual([])
  })
})
