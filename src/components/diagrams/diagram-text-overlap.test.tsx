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
 * Box overlap (<rect>)
 * ────────────────────
 * Block-diagram labels normally sit CENTRED INSIDE their own box, so a
 * naive text-vs-rect test would flag every «Генерація»-in-a-box title.
 * The gate instead flags only labels whose bbox overlaps a foreground
 * <rect> by ≥ 2 px in BOTH dimensions WHILE their centre falls OUTSIDE
 * that rect — i.e. a caption from elsewhere poking into a box, not a
 * label living in its container. Added June 2026 after the ch3.2
 * «ваше повідомлення» caption (left-anchored, wide UA string) ran under
 * the first job box's lower-left corner. The bug was invisible because
 * this gate sampled only <line>/<path>/<circle>, never <rect>; the EN
 * string «your message» was short enough to miss the box, so EN passed
 * both the gate and the (EN-only) visual pass and the UA overlap shipped.
 *
 * Not covered
 * ───────────
 *   • Path-on-path overlap (one curve crossing another curve).
 *   • <polygon> shapes — only <line>, <path>, <circle> and <rect>.
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
  './BenchMeasurementSchematic.tsx', // NodePoint «S» scope-probe letter sits inside its own node circle (by design); descriptive labels verified overlap-free via the browser getBoundingClientRect detector (see CLAUDE.md)
  './FilterTypeGallery.tsx',       // tiny in-cell waveform paths intentionally pass close to the «in» / «out» labels
  // FlybackDiodeSchematic was previously skipped citing «Q1 inside the
  // transistor circle» — that overlap was fixed at the primitive level
  // (TransistorNPN gap=26). Skip removed so the file is checked again.
  './RfChokeSchematic.tsx',        // GND symbol's vertical wire ends at the GND text label by ARRL convention
  './SeriesIslandIllustration.tsx', // charge labels («C₁», «−Q», «+Q») sit on the cap-plate Bezier paths by design
  // ch1_11 schematics — the Resistor primitive's default `label` placement
  // (positioned just above the body) ends up on the same y as the wire
  // that runs along one edge of the resistor in tightly-packed layouts.
  // Visually clear once rendered (the wire passes through empty space
  // between the label glyphs and the resistor body), but the overlap
  // gate's bbox check sees a 1–2 px y-overlap that's a render-time
  // false-positive. The CE / BJT-switch / MOSFET-switch schematics here
  // were verified visually via Claude-in-Chrome.
  './CommonEmitterAmplifierSchematic.tsx',
  // Physics illustrations where `+` / `−` charge glyphs sit INSIDE
  // circles (atoms, charges, ions) by design — the circle IS the charge
  // marker and the sign goes in its centre. Same pattern across all
  // three diagrams. Verified visually.
  './AtomicDiagram.tsx',
  './FaradayDemoDiagram.tsx',
  './MaterialsComparison.tsx',
  // Math axis diagram with origin marker — the «0» label sits at the
  // origin circle by convention.
  './SineOriginDiagram.tsx',
  // ch2_2 waveform diagrams whose curves legitimately reach their bbox
  // extremes — the "rides chart edge" check (also run from this file)
  // false-positives on them. Labels are simple row titles + axis captions
  // kept well clear of the traces; verified visually via Claude-in-Chrome.
  './AudioDigitalWaveforms.tsx', // digital row is a square wave (flat top/bottom levels are the signal)
  './CarrierKnobs.tsx',          // message / FM / PM rows are pure sinusoids (real peaks, not clip rails)
  './ClassModeMatch.tsx',        // AM-envelope curves are pure sinusoids (real crests, not clip rails); labels are simple panel titles, verified visually
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

/**
 * True when a circle (centre cx,cy, radius r) intersects the text bbox.
 *
 * Uses the standard «closest point on rectangle to point» test: clamp the
 * circle centre to the bbox; the resulting point is the rectangle's
 * nearest point to the centre. If that distance ≤ r the disc and the
 * rectangle share area. For stroke-only circles (no fill) this includes
 * both «text is inside the circle» AND «circle outline crosses text»,
 * which is exactly the overlap class we want to flag.
 *
 * Added May 2026 after a label-on-AC-source-body overlap shipped: the
 * `TerminalLabel y={TOP_Y - 22}` offset was baked for the previous
 * r=12 AC source body, but after the chris-pikul migration the body
 * is r=20 and the 2-px clearance became a 5-px overlap. The line/path
 * overlap branches of this test don't see `<circle>` elements, so the
 * regression slipped past the gate.
 */
function circleCrossesBBox(cx: number, cy: number, r: number, bb: BBox): boolean {
  const closestX = Math.max(bb.x, Math.min(cx, bb.x + bb.w))
  const closestY = Math.max(bb.y, Math.min(cy, bb.y + bb.h))
  const dx = cx - closestX
  const dy = cy - closestY
  return Math.sqrt(dx * dx + dy * dy) <= r + TOLERANCE_PX
}

/**
 * True when a foreground <rect> (a block-diagram box, a bracket frame, …)
 * overlaps the text bbox by ≥ 2 px in BOTH dimensions WHILE the text's
 * centre lies OUTSIDE the rect.
 *
 * The centre-outside clause is what makes this usable on block diagrams: a
 * label centred inside its own box (its container) is the norm and must not
 * flag, whereas a caption whose home is elsewhere but whose edge pokes into
 * a neighbouring box IS the bug. Validated on the ch3.2 jobs diagram — the
 * three box titles («Генерація» …) have their centres inside their boxes
 * (ignored), while «ваше повідомлення» had its centre to the LEFT of the
 * first box yet overlapped its lower-left corner (flagged).
 */
function rectCrossesBBox(rx: number, ry: number, rw: number, rh: number, bb: BBox): boolean {
  const overlapX = Math.min(bb.x + bb.w, rx + rw) - Math.max(bb.x, rx)
  const overlapY = Math.min(bb.y + bb.h, ry + rh) - Math.max(bb.y, ry)
  if (overlapX < 2 || overlapY < 2) return false
  const cx = bb.x + bb.w / 2
  const cy = bb.y + bb.h / 2
  const centreInside = cx >= rx && cx <= rx + rw && cy >= ry && cy <= ry + rh
  return !centreInside
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

// Render each diagram in BOTH locales. Rendering only EN was a real blind
// spot: the ch3.2 «ваше повідомлення» caption overlapped the first job box
// ONLY in Ukrainian (17 chars, ~124 px) — EN «your message» (12 chars,
// ~86 px) stopped 2 px short of the box, so an EN-only sweep passed while the
// UA build shipped the overlap. UA strings are wider far more often than not,
// so UA is where most label-collision regressions surface; EN stays because a
// few labels are wider in EN (expanded acronyms, longer English compounds).
const LOCALES = ['en', 'uk'] as const

describe.each(DIAGRAMS)('$name — text labels do not overlap shapes', ({ Component }) => {
  it.each(LOCALES)('no <text> bbox is crossed by a foreground shape (%s)', (language) => {
    const { container } = renderWithProviders(<Component />, { language })
    const findings: string[] = []

    for (const svg of Array.from(container.querySelectorAll('svg'))) {
      const texts = Array.from(svg.querySelectorAll('text')) as SVGTextElement[]
      const lines = Array.from(svg.querySelectorAll('line')) as SVGLineElement[]
      const paths = Array.from(svg.querySelectorAll('path')) as SVGPathElement[]
      const circles = Array.from(svg.querySelectorAll('circle')) as SVGCircleElement[]
      const rects = Array.from(svg.querySelectorAll('rect')) as SVGRectElement[]

      // SVG canvas area, used to tell a CONTENT box (small — a block-diagram
      // node, ~4 % of canvas) from a FRAME/BACKGROUND rect (a plot-area border
      // or full-canvas fill, ≥ 50 %). Axis titles legitimately graze the top
      // edge of a plot frame; only content boxes get the text-vs-rect check.
      // bboxes here are computed from attributes (jsdom has no getBBox), so the
      // canvas size comes from the viewBox (preferred) or width/height attrs.
      const vb = (svg.getAttribute('viewBox') ?? '').split(/[\s,]+/).map(Number).filter(n => !Number.isNaN(n))
      const svgW = vb.length === 4 ? vb[2] : parseFloat(svg.getAttribute('width') ?? '0')
      const svgH = vb.length === 4 ? vb[3] : parseFloat(svg.getAttribute('height') ?? '0')
      const svgArea = svgW * svgH

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

          for (const circle of circles) {
            if (isBackground(circle) || isInsideTransformedGroup(circle)) continue
            const cx = parseFloat(circle.getAttribute('cx') ?? '0')
            const cy = parseFloat(circle.getAttribute('cy') ?? '0')
            const r = parseFloat(circle.getAttribute('r') ?? '0')
            if (!Number.isFinite(r) || r <= 0) continue
            if (circleCrossesBBox(cx, cy, r, bbox)) {
              findings.push(
                `text "${bbox.label}" at (${bbox.x.toFixed(0)}, ${bbox.y.toFixed(0)}, ${bbox.w.toFixed(0)}×${bbox.h.toFixed(0)}) crossed by <circle> centre (${cx.toFixed(0)},${cy.toFixed(0)}) r=${r.toFixed(0)}`,
              )
            }
          }

          for (const rect of rects) {
            if (isBackground(rect) || isInsideTransformedGroup(rect)) continue
            const rx = parseFloat(rect.getAttribute('x') ?? '0')
            const ry = parseFloat(rect.getAttribute('y') ?? '0')
            const rw = parseFloat(rect.getAttribute('width') ?? '0')
            const rh = parseFloat(rect.getAttribute('height') ?? '0')
            if (!(rw > 0 && rh > 0)) continue
            // A rect spanning ≥ 50 % of the canvas is a plot frame / background,
            // not a content box — labels legitimately sit at its edge. Skip it.
            if (svgArea > 0 && rw * rh >= 0.5 * svgArea) continue
            if (rectCrossesBBox(rx, ry, rw, rh, bbox)) {
              findings.push(
                `text "${bbox.label}" at (${bbox.x.toFixed(0)}, ${bbox.y.toFixed(0)}, ${bbox.w.toFixed(0)}×${bbox.h.toFixed(0)}) pokes into <rect> (${rx.toFixed(0)},${ry.toFixed(0)},${rw.toFixed(0)}×${rh.toFixed(0)}) with its centre outside the box`,
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

      // ── Label fits its own block ─────────────────────────────────────
      // A label centred INSIDE a content box must not spill past that box's
      // left/right edge. The neighbour-collision check (text-vs-rect, above)
      // only fires when a too-wide label reaches an ADJACENT block; a label
      // that merely overflows its OWN box — its centre still inside it — slips
      // straight through. ch3.2 shipped this twice on the same PA block (UA
      // «підсилювач потужності» 133 px, then «кінцевий каскад» 93 px, both
      // wider than the 82-px block) because nothing compared a label to its
      // container. Now it does, in both locales.
      const contentRects = rects
        .filter(r => !isBackground(r) && !isInsideTransformedGroup(r))
        .map(r => ({
          x: parseFloat(r.getAttribute('x') ?? '0'),
          y: parseFloat(r.getAttribute('y') ?? '0'),
          w: parseFloat(r.getAttribute('width') ?? '0'),
          h: parseFloat(r.getAttribute('height') ?? '0'),
        }))
        .filter(r => r.w > 0 && r.h > 0 && !(svgArea > 0 && r.w * r.h >= 0.5 * svgArea))
      // A label must not merely FIT its block — a CENTRED label must also clear
      // the border by a small margin on each side, or it reads as «text jammed
      // against the box». Two refinements over the old no-overflow check:
      //   1. the flat 0.55 char-width average UNDER-measures short, wide-glyph
      //      strings (мережа: м, ж are wide) and OVER-measures narrow ones. A
      //      flat fatten would over-flag long labels, so weight glyphs
      //      individually and judge the fit against that per-string width.
      //   2. for a centred label, require ≥ MIN_CLEARANCE px of breathing room,
      //      not just «edge not crossed». Edge-anchored labels (a scope readout
      //      hugging its panel's left edge) are exempt from the clearance rule —
      //      only the genuine overflow check applies to them.
      // Shipped July 2026: UK «мережа» rendered flush against a 48-px block and
      // the old check (centre-inside, spill ≤ 3) waved it through. Now it fails.
      const WIDE = /[мшщжфюъыёМШЩЖФЮЪЫWMmw@%&]/
      const NARROW = /[іїjlItr.,:;'’!|() -]/
      const fitFactor = (s: string) => {
        let u = 0
        for (const ch of s) u += WIDE.test(ch) ? 0.72 : NARROW.test(ch) ? 0.36 : 0.55
        return u / ((s.length || 1) * 0.55) // ratio vs the flat 0.55 baseline
      }
      const MIN_CLEARANCE = 2 // px gap required on each side for a CENTRED label
      for (const { bbox } of textBBoxList) {
        const cx = bbox.x + bbox.w / 2
        const cy = bbox.y + bbox.h / 2
        // the smallest content box whose area contains the label's centre = its container
        const box = contentRects
          .filter(r => cx >= r.x && cx <= r.x + r.w && cy >= r.y && cy <= r.y + r.h)
          .sort((a, b) => a.w * a.h - b.w * b.h)[0]
        if (!box) continue
        const halfW = (bbox.w * fitFactor(bbox.label)) / 2
        const overflow = Math.max(box.x - (cx - halfW), cx + halfW - (box.x + box.w))
        const centred = Math.abs(cx - (box.x + box.w / 2)) < box.w * 0.15
        if (overflow > 1) {
          findings.push(
            `text "${bbox.label}" (~${(halfW * 2).toFixed(0)} px wide) overflows its own block ` +
            `<rect> (${box.w.toFixed(0)} px wide) by ${overflow.toFixed(0)} px`,
          )
        } else if (centred && -overflow < MIN_CLEARANCE) {
          findings.push(
            `text "${bbox.label}" (~${(halfW * 2).toFixed(0)} px wide) has only ` +
            `${(-overflow).toFixed(0)} px clearance inside its own block <rect> ` +
            `(${box.w.toFixed(0)} px wide) — needs ≥ ${MIN_CLEARANCE} px on each side`,
          )
        }
      }
    }

    expect(findings, findings.join('\n')).toEqual([])
  })
})
