import { useEffect, useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import SVGDiagram from './SVGDiagram'
import DiagramFigure from './DiagramFigure'
import { svgTokens } from './svgTokens'
import {
  RoughPaths,
  roughCircle,
  roughRect,
} from '@/lib/rough'

/**
 * Chapter 1.1 — Conductor / Insulator / Semiconductor (Section 5)
 *
 * Three side-by-side atomic-scale panels showing WHY the three
 * categories behave differently:
 *   • Conductor — ion cores with many loose electrons drifting
 *     freely between them.
 *   • Insulator — ion cores each clinging to their full complement
 *     of electrons on tight orbitals; nothing is free to move.
 *   • Semiconductor — mostly bound like an insulator, but with a
 *     few carriers liberated (thermal excitation / doping / light).
 *
 * The count of FREE electrons (blue dots NOT on an orbit) encodes
 * the whole idea: many → good conductor, none → insulator, few →
 * semiconductor.  All strokes via Rough.js for the chapter's
 * hand-sketched aesthetic; ions and electrons stay clean circles.
 *
 * ANIMATION — relative drift speed IS the lesson. Free electrons in
 * the conductor panel drift rightward at a readable pace (~5 s per
 * panel traversal); free electrons in the semiconductor panel creep
 * at a quarter of that speed (~14 s) to sell "a few carriers slowly
 * making their way through"; the insulator panel stays fully static
 * because nothing moves there, and seeing zero motion against the
 * conductor's flow is exactly the contrast the reader needs. Each
 * electron wraps from the right edge back to the left so the panel
 * never runs out of carriers. Imperative DOM writes via refs keep
 * React out of the per-frame loop.
 *
 * Respects `prefers-reduced-motion`: the rAF loop doesn't start and
 * electrons sit at their original positions — which already compose
 * a valid static snapshot of the idea.
 *
 * LAYOUT — the SVG holds only the GRAPHIC content (panel frames,
 * atoms, electrons). Every translatable label — the panel title, the
 * example formula (Cu / SiO₂ / Si), the bottom one-line note, and the
 * legend item under each panel — lives in HTML, in three column-grid
 * rows that wrap the SVG. Two reasons:
 *   1. SVG `<text>` does not auto-wrap. The previous version had a
 *      hardcoded `textWidth = isIon ? 48 : p.i === 1 ? 92 : 84` table
 *      to position legend pairs — those numbers were guessed pixel
 *      widths of the EN / UA strings, and any rewording broke layout.
 *   2. Ukrainian translations run ~30–60% wider than English. With
 *      HTML, each column auto-wraps to two lines if needed instead of
 *      clipping. Same pattern as InductorTypeGallery / WaveformGallery.
 *
 * The HTML grid columns line up exactly with the SVG panels because
 * both use percentage-based positioning over the same `maxWidth: W`
 * wrapper: padding = panelStartX / W, columnGap = gutter / W.
 */

const CONDUCTOR_PERIOD_MS = 5000
const SEMI_PERIOD_MS = 14000

// ── Geometry ────────────────────────────────────────────────────
const W = 620

const panelW = 180
const panelH = 160
const gutter = 10
const panelStartX = (W - (panelW * 3 + gutter * 2)) / 2  // 30
// Panel sits 10 px below the top of the SVG — enough breathing room
// without leaving a wide blank band (titles used to occupy y=0..62).
const panelY = 10
const H = panelY + panelH + 10  // 180 — small bottom margin

// HTML grid columns must align with SVG panels at every render width.
// Express padding and gap as percentages of W so they scale together
// when the wrapper shrinks on narrow viewports.
const paddingPct = `${(panelStartX / W) * 100}%`  // ≈ 4.838710%
const gapPct = `${(gutter / W) * 100}%`           // ≈ 1.612903%

// Atoms per panel — 3 in a horizontal row, centred vertically.
const atomRadius = 16
const atomY = panelY + panelH / 2 + 6

// Electron positions relative to atom centre for bound electrons
// (NE / SW on the orbit circle for visibility).
const BOUND_OFFSET = atomRadius
const boundOffsets: [number, number][] = [
  [BOUND_OFFSET * 0.7, -BOUND_OFFSET * 0.7],
  [-BOUND_OFFSET * 0.7, BOUND_OFFSET * 0.7],
]

// Free electron positions relative to panel (x offset from panelX,
// y offset from atomY).  Hand-placed so dots sprinkle between
// atoms without touching orbits.
const conductorFreeOffsets: [number, number][] = [
  [panelW * 0.12, -48], [panelW * 0.38, -38], [panelW * 0.60, -52],
  [panelW * 0.86, -40], [panelW * 0.22, 40],  [panelW * 0.48, 50],
  [panelW * 0.72, 38],  [panelW * 0.92, 46],
]
const semiFreeOffsets: [number, number][] = [
  [panelW * 0.38, -44], [panelW * 0.78, 46],
]

const panels = [0, 1, 2].map((i) => ({
  i,
  x: panelStartX + i * (panelW + gutter),
}))

const atomXs = (panelX: number) => [
  panelX + panelW * 0.22,
  panelX + panelW * 0.5,
  panelX + panelW * 0.78,
]

/** Small inline SVG dot used in the HTML legend row — visually identical
 *  to the per-electron / ion glyphs rendered inside the panels. */
function LegendDot({ kind }: { kind: 'ion' | 'electron' }) {
  if (kind === 'ion') {
    return (
      <svg width={14} height={14} viewBox="0 0 14 14" aria-hidden="true" className="inline-block flex-shrink-0">
        <circle cx={7} cy={7} r={5} fill="hsl(var(--callout-caution) / 0.85)" />
        <text x={7} y={9.5} textAnchor="middle" fontSize={9} fontWeight={700} fill="hsl(var(--background))">+</text>
      </svg>
    )
  }
  return (
    <svg width={14} height={14} viewBox="0 0 14 14" aria-hidden="true" className="inline-block flex-shrink-0">
      <circle cx={7} cy={7} r={3.5} fill="hsl(var(--callout-note))" />
    </svg>
  )
}

export default function MaterialsComparison() {
  const { t } = useTranslation('ui')
  const conductorRefs = useRef<(SVGCircleElement | null)[]>([])
  const semiRefs = useRef<(SVGCircleElement | null)[]>([])

  // ── Drift animation ─────────────────────────────────────────────
  const conductorPanelX = panelStartX
  const semiPanelX = panelStartX + 2 * (panelW + gutter)

  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return
    }
    let raf = 0
    let start: number | null = null
    const tick = (now: number) => {
      if (start === null) start = now
      const elapsed = now - start
      const cBase = (elapsed % CONDUCTOR_PERIOD_MS) / CONDUCTOR_PERIOD_MS
      conductorFreeOffsets.forEach((off, i) => {
        const initialPhase = off[0] / panelW
        const p = (cBase + initialPhase) % 1
        const el = conductorRefs.current[i]
        if (el) el.setAttribute('cx', String(conductorPanelX + p * panelW))
      })
      const sBase = (elapsed % SEMI_PERIOD_MS) / SEMI_PERIOD_MS
      semiFreeOffsets.forEach((off, i) => {
        const initialPhase = off[0] / panelW
        const p = (sBase + initialPhase) % 1
        const el = semiRefs.current[i]
        if (el) el.setAttribute('cx', String(semiPanelX + p * panelW))
      })
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [conductorPanelX, semiPanelX])

  // ── Rough.js geometry ──────────────────────────────────────────
  const sketch = useMemo(() => {
    const seeds: Record<string, number> = { a: 10, b: 30, c: 50 }
    return panels.map((p) => {
      const key = p.i === 0 ? 'a' : p.i === 1 ? 'b' : 'c'
      const base = seeds[key]
      return {
        frame: roughRect(p.x, panelY, panelW, panelH, {
          seed: base, strokeWidth: 1.2, roughness: 0.4,
        }),
        orbits: atomXs(p.x).map((ax, j) =>
          roughCircle(ax, atomY, atomRadius * 2, {
            seed: base + 1 + j, strokeWidth: 0.9, roughness: 0.35,
          }),
        ),
      }
    })
  }, [])

  // ── Per-panel translation keys ──────────────────────────────────
  const titleKey = (i: number) =>
    i === 0 ? 'ch1_1.materialsConductorTitle'
    : i === 1 ? 'ch1_1.materialsInsulatorTitle'
    : 'ch1_1.materialsSemiTitle'

  const exampleKey = (i: number) =>
    i === 0 ? 'ch1_1.materialsConductorExample'
    : i === 1 ? 'ch1_1.materialsInsulatorExample'
    : 'ch1_1.materialsSemiExample'

  const noteKey = (i: number) =>
    i === 0 ? 'ch1_1.materialsConductorNote'
    : i === 1 ? 'ch1_1.materialsInsulatorNote'
    : 'ch1_1.materialsSemiNote'

  const legendKey = (i: number) =>
    i === 0 ? 'ch1_1.materialsLegendIon'
    : i === 1 ? 'ch1_1.materialsLegendBound'
    : 'ch1_1.materialsLegendFree'

  const titleColor = (i: number) =>
    i === 0 ? svgTokens.note
    : i === 1 ? svgTokens.mutedFg
    : svgTokens.caution

  return (
    <DiagramFigure caption={t('ch1_1.materialsCaption')}>
      <div className="mx-auto" style={{ maxWidth: W }}>
        {/* Title + example row — one column per panel, padded and gapped
            in percentages so the column centres line up with the SVG
            panel centres at any render width. */}
        <div
          className="grid grid-cols-3 mb-2 text-center"
          style={{
            paddingLeft: paddingPct,
            paddingRight: paddingPct,
            columnGap: gapPct,
          }}
        >
          {panels.map((p) => (
            <div key={p.i}>
              <div
                className="font-bold leading-tight"
                style={{ fontSize: 15, color: titleColor(p.i) }}
              >
                {t(titleKey(p.i))}
              </div>
              <div
                className="italic leading-tight mt-0.5"
                style={{ fontSize: 13, color: svgTokens.mutedFg }}
              >
                {t(exampleKey(p.i))}
              </div>
            </div>
          ))}
        </div>

        {/* SVG: panel frames, atoms, electrons — graphic content only. */}
        <SVGDiagram
          width={W}
          height={H}
          aria-label={t('ch1_1.materialsAriaLabel')}
          style={{ maxWidth: W, margin: '0 auto' }}
        >
          {panels.map((p) => {
            const freeOffsets =
              p.i === 0 ? conductorFreeOffsets
                : p.i === 2 ? semiFreeOffsets
                  : []
            const boundPerAtom = p.i === 0 ? 0 : 2

            return (
              <g key={p.i}>
                {/* Panel frame */}
                <g style={{ color: svgTokens.border }}>
                  <RoughPaths paths={sketch[p.i].frame} />
                </g>

                {/* Atom orbits */}
                <g style={{ color: svgTokens.mutedFg }} opacity={0.7}>
                  {sketch[p.i].orbits.map((o, j) => (
                    <RoughPaths key={j} paths={o} />
                  ))}
                </g>

                {/* Ion cores */}
                {atomXs(p.x).map((ax, j) => (
                  <g key={`ion-${j}`}>
                    <circle cx={ax} cy={atomY} r={5}
                      fill="hsl(var(--callout-caution) / 0.85)" />
                    <text
                      x={ax} y={atomY + 3}
                      textAnchor="middle"
                      fontSize="0.562em"
                      fontWeight={700}
                      fill="hsl(var(--background))"
                    >+</text>
                  </g>
                ))}

                {/* Bound electrons */}
                {atomXs(p.x).flatMap((ax, j) =>
                  Array.from({ length: boundPerAtom }, (_, k) => {
                    const off = boundOffsets[k]
                    return (
                      <circle
                        key={`bound-${j}-${k}`}
                        cx={ax + off[0]}
                        cy={atomY + off[1]}
                        r={3.5}
                        fill="hsl(var(--callout-note))"
                      />
                    )
                  }),
                )}

                {/* Free electrons — animated: conductor drifts quickly,
                    semi drifts slowly, insulator has none at all.
                    Initial cx doubles as the prefers-reduced-motion
                    snapshot. */}
                {freeOffsets.map((off, k) => (
                  <circle
                    key={`free-${k}`}
                    ref={el => {
                      if (p.i === 0) conductorRefs.current[k] = el
                      else if (p.i === 2) semiRefs.current[k] = el
                    }}
                    cx={p.x + off[0]}
                    cy={atomY + off[1]}
                    r={3.5}
                    fill="hsl(var(--callout-note))"
                  />
                ))}
              </g>
            )
          })}
        </SVGDiagram>

        {/* Note row — one short take-away sentence per panel. */}
        <div
          className="grid grid-cols-3 mt-2 text-center"
          style={{
            paddingLeft: paddingPct,
            paddingRight: paddingPct,
            columnGap: gapPct,
          }}
        >
          {panels.map((p) => (
            <div
              key={p.i}
              className="font-semibold leading-tight"
              style={{ fontSize: 14, color: svgTokens.fg }}
            >
              {t(noteKey(p.i))}
            </div>
          ))}
        </div>

        {/* Legend row — one icon-and-label pair per panel, column-aligned
            with the panel above so the eye reads
            [title → frame → note → legend] as one stack per category. */}
        <div
          className="grid grid-cols-3 mt-3 text-center"
          style={{
            paddingLeft: paddingPct,
            paddingRight: paddingPct,
            columnGap: gapPct,
          }}
        >
          {panels.map((p) => (
            <div
              key={p.i}
              className="flex items-center justify-center gap-1.5 leading-tight"
              style={{ fontSize: 13, color: svgTokens.mutedFg }}
            >
              <LegendDot kind={p.i === 0 ? 'ion' : 'electron'} />
              <span>{t(legendKey(p.i))}</span>
            </div>
          ))}
        </div>
      </div>
    </DiagramFigure>
  )
}
