import { useMemo } from 'react'
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
 * Sizing (per feedback_svg_font_minimum_on_screen): viewBox 620 × 300
 * rendered 1:1 — `maxWidth` equals the viewBox width, so every
 * fontSize in source is the fontSize on screen. Primary labels at 15;
 * sub-labels at 13 (the project's floor). The bottom note row and the
 * legend row are separated by 44 px of vertical gap to prevent the
 * collision where a reader reads "many free electrons / + ion core"
 * as a single caption stack.
 */
export default function MaterialsComparison() {
  const { t } = useTranslation('ui')

  // ── Geometry ────────────────────────────────────────────────────
  const W = 620
  const H = 300

  const panelW = 180
  const panelH = 160
  const gutter = 10
  const panelY = 62
  const panelStartX = (W - (panelW * 3 + gutter * 2)) / 2

  const panels = [0, 1, 2].map((i) => ({
    i,
    x: panelStartX + i * (panelW + gutter),
  }))

  // Atoms per panel — 3 in a horizontal row, centred vertically.
  const atomRadius = 16
  const atomY = panelY + panelH / 2 + 6
  const atomXs = (panelX: number) => [
    panelX + panelW * 0.22,
    panelX + panelW * 0.5,
    panelX + panelW * 0.78,
  ]

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <DiagramFigure caption={t('ch1_1.materialsCaption')}>
      <SVGDiagram
        width={W}
        height={H}
        aria-label={t('ch1_1.materialsAriaLabel')}
        style={{ maxWidth: W, margin: '0 auto' }}
      >
        {panels.map((p) => {
          const titleKey = p.i === 0
            ? 'ch1_1.materialsConductorTitle'
            : p.i === 1
              ? 'ch1_1.materialsInsulatorTitle'
              : 'ch1_1.materialsSemiTitle'
          const exampleKey = p.i === 0
            ? 'ch1_1.materialsConductorExample'
            : p.i === 1
              ? 'ch1_1.materialsInsulatorExample'
              : 'ch1_1.materialsSemiExample'
          const noteKey = p.i === 0
            ? 'ch1_1.materialsConductorNote'
            : p.i === 1
              ? 'ch1_1.materialsInsulatorNote'
              : 'ch1_1.materialsSemiNote'
          const titleColor = p.i === 0
            ? svgTokens.note
            : p.i === 1
              ? svgTokens.mutedFg
              : svgTokens.caution

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

              {/* Title */}
              <text
                x={p.x + panelW / 2}
                y={26}
                textAnchor="middle"
                fontSize={15}
                fontWeight={700}
                fill={titleColor}
              >
                {t(titleKey)}
              </text>
              <text
                x={p.x + panelW / 2}
                y={48}
                textAnchor="middle"
                fontSize={13}
                fill={svgTokens.mutedFg}
                fontStyle="italic"
              >
                {t(exampleKey)}
              </text>

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
                    fontSize={9}
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

              {/* Free electrons */}
              {freeOffsets.map((off, k) => (
                <circle
                  key={`free-${k}`}
                  cx={p.x + off[0]}
                  cy={atomY + off[1]}
                  r={3.5}
                  fill="hsl(var(--callout-note))"
                />
              ))}

              {/* Per-panel note — OUTSIDE the frame, clear gap from
                  the legend row so the reader doesn't stack-read them
                  as one caption.  Note row at y=244; legend at y=282. */}
              <text
                x={p.x + panelW / 2}
                y={244}
                textAnchor="middle"
                fontSize={14}
                fontWeight={600}
                fill={svgTokens.fg}
              >
                {t(noteKey)}
              </text>
            </g>
          )
        })}

        {/* Legend row — each item is column-aligned with its panel
            above, so the reader's eye tracks [title → frame → note →
            legend] as one clean vertical stack per category.
            Previous version spaced circle-centres at a constant 130 px
            regardless of text width, which left a wide gap between
            item 1 ("ion core") and item 2 ("bound electron") and a
            cramped gap between items 2 and 3. Column-alignment makes
            both gaps a function of panel spacing instead of text
            width, which is what the eye expects. */}
        {panels.map((p) => {
          const centreX = p.x + panelW / 2
          const isIon = p.i === 0
          const circleR = isIon ? 5 : 3.5
          const circleFill = isIon
            ? 'hsl(var(--callout-caution) / 0.85)'
            : 'hsl(var(--callout-note))'
          const labelKey = isIon
            ? 'ch1_1.materialsLegendIon'
            : p.i === 1
              ? 'ch1_1.materialsLegendBound'
              : 'ch1_1.materialsLegendFree'
          // Rough text widths at fontSize 13 (sans). Only used to
          // position the circle/text pair so the pair reads as
          // visually centred under the panel. Real rendered width
          // may differ by a few px — fine, we're aligning pairs to
          // columns, not text edges to a grid.
          const textWidth = isIon ? 48 : p.i === 1 ? 92 : 84
          const gap = 7
          const itemW = circleR * 2 + gap + textWidth
          const startX = centreX - itemW / 2
          const circleCx = startX + circleR
          const textX = startX + circleR * 2 + gap
          return (
            <g key={`legend-${p.i}`}>
              <circle cx={circleCx} cy={282} r={circleR} fill={circleFill} />
              {isIon && (
                <text x={circleCx} y={285} textAnchor="middle"
                  fontSize={9} fontWeight={700}
                  fill="hsl(var(--background))">+</text>
              )}
              <text x={textX} y={286} fontSize={13} fill={svgTokens.mutedFg}>
                {t(labelKey)}
              </text>
            </g>
          )
        })}
      </SVGDiagram>
    </DiagramFigure>
  )
}
