/**
 * Chapter 1.5 — Capacitor type gallery.
 *
 * Six labelled hand-drawn silhouettes arranged in a row so the reader
 * can put a face to each family name mentioned in the §Types prose:
 *
 *   1. Disc ceramic  — round wafer with two wire leads pointing down.
 *   2. MLCC          — stacked rectangle (multi-layer chip cap) with
 *                      two wire leads pointing down.
 *   3. Film          — cylindrical body with two AXIAL leads.
 *   4. Radial aluminium electrolytic — tall can with two radial leads
 *                      pointing down; "+" mark on the positive side.
 *   5. Axial aluminium electrolytic  — sideways cylinder with axial
 *                      leads; "+" mark on the anode end.
 *   6. Tantalum SMT teardrop — small chunky body with a polarity stripe
 *                      on the POSITIVE end (opposite of aluminium).
 *
 * All strokes use Rough.js for the book's hand-drawn aesthetic; fills
 * are subtle `currentColor` tints so the silhouettes read in both
 * themes. Every visible word is pulled from i18n (`t('ch1_5.type*')`).
 */
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  RoughPaths,
  type RoughPath,
  roughLine,
  roughRect,
  roughCircle,
  roughPath,
} from '@/lib/rough'

/* ── Layout ─────────────────────────────────────────────────────── */
const VB_W = 720
const VB_H = 200

const SLOT_COUNT = 6
const SLOT_W = VB_W / SLOT_COUNT
const CENTRE_Y = 74
/* LABEL_Y is the vertical centre of the label box. Single-line labels
 * sit on this baseline; two-line labels straddle it with `dy = ±7`.
 * UA labels for slots 1 and 2 («керамічний дисковий», «керамічний MLCC»)
 * are wider than the 120-px slot in italic Georgia at 13 px, so we
 * split them across two lines to avoid overlap with neighbours. */
const LABEL_Y = 150
const LINE_GAP = 14

/* Compute the centre-x of slot `i` (0 … 5). */
function slotX(i: number): number {
  return SLOT_W * (i + 0.5)
}

/* ── Silhouette drawers ─────────────────────────────────────────── */

/** 1. Disc ceramic — circular wafer with two vertical leads down. */
function discStrokes(cx: number, seed: number): RoughPath[] {
  const paths: RoughPath[] = []
  // Round body
  paths.push(...roughCircle(cx, CENTRE_Y, 40, { seed, strokeWidth: 1.2, roughness: 0.7 }))
  // Two vertical leads, spaced ~10 px apart
  paths.push(...roughLine(cx - 7, CENTRE_Y + 18, cx - 7, CENTRE_Y + 38, { seed: seed + 1, strokeWidth: 1.3 }))
  paths.push(...roughLine(cx + 7, CENTRE_Y + 18, cx + 7, CENTRE_Y + 38, { seed: seed + 2, strokeWidth: 1.3 }))
  return paths
}

/** 2. MLCC — rectangular block + two leads down. */
function mlccStrokes(cx: number, seed: number): RoughPath[] {
  const paths: RoughPath[] = []
  const bw = 36, bh = 24
  paths.push(...roughRect(cx - bw / 2, CENTRE_Y - bh / 2, bw, bh, {
    seed, strokeWidth: 1.2, roughness: 0.6,
  }))
  // Two thin horizontal layer lines inside, to suggest stacked layers.
  paths.push(...roughLine(cx - bw / 2 + 3, CENTRE_Y - 4, cx + bw / 2 - 3, CENTRE_Y - 4, { seed: seed + 5, strokeWidth: 0.7, roughness: 0.4 }))
  paths.push(...roughLine(cx - bw / 2 + 3, CENTRE_Y + 4, cx + bw / 2 - 3, CENTRE_Y + 4, { seed: seed + 6, strokeWidth: 0.7, roughness: 0.4 }))
  // Leads down
  paths.push(...roughLine(cx - 8, CENTRE_Y + bh / 2, cx - 8, CENTRE_Y + 26, { seed: seed + 1, strokeWidth: 1.3 }))
  paths.push(...roughLine(cx + 8, CENTRE_Y + bh / 2, cx + 8, CENTRE_Y + 26, { seed: seed + 2, strokeWidth: 1.3 }))
  return paths
}

/** 3. Film — wider rectangle with AXIAL leads. */
function filmStrokes(cx: number, seed: number): RoughPath[] {
  const paths: RoughPath[] = []
  const bw = 52, bh = 24
  paths.push(...roughRect(cx - bw / 2, CENTRE_Y - bh / 2, bw, bh, {
    seed, strokeWidth: 1.2, roughness: 0.6,
  }))
  // Axial leads — out the left and right sides
  paths.push(...roughLine(cx - bw / 2 - 18, CENTRE_Y, cx - bw / 2, CENTRE_Y, { seed: seed + 1, strokeWidth: 1.3 }))
  paths.push(...roughLine(cx + bw / 2, CENTRE_Y, cx + bw / 2 + 18, CENTRE_Y, { seed: seed + 2, strokeWidth: 1.3 }))
  return paths
}

/** 4. Radial aluminium electrolytic — tall can, two leads down.
 *  The can is drawn as a rectangle with a small ellipse at the top
 *  (can-rim hint). "+" mark on the positive (longer lead) side. */
function radialElecStrokes(cx: number, seed: number): RoughPath[] {
  const paths: RoughPath[] = []
  const bw = 28, bh = 44
  paths.push(...roughRect(cx - bw / 2, CENTRE_Y - bh / 2, bw, bh, {
    seed, strokeWidth: 1.2, roughness: 0.65,
  }))
  // Hint of a can rim at the top
  paths.push(...roughLine(cx - bw / 2, CENTRE_Y - bh / 2 + 4, cx + bw / 2, CENTRE_Y - bh / 2 + 4, {
    seed: seed + 3, strokeWidth: 0.8, roughness: 0.4,
  }))
  // Leads — left lead longer than right (positive convention).
  // Long (+): left lead; short (−): right lead.
  paths.push(...roughLine(cx - 7, CENTRE_Y + bh / 2, cx - 7, CENTRE_Y + bh / 2 + 26, { seed: seed + 1, strokeWidth: 1.3 }))
  paths.push(...roughLine(cx + 7, CENTRE_Y + bh / 2, cx + 7, CENTRE_Y + bh / 2 + 16, { seed: seed + 2, strokeWidth: 1.3 }))
  return paths
}

/** 5. Axial aluminium electrolytic — sideways cylinder, axial leads. */
function axialElecStrokes(cx: number, seed: number): RoughPath[] {
  const paths: RoughPath[] = []
  const bw = 54, bh = 22
  paths.push(...roughRect(cx - bw / 2, CENTRE_Y - bh / 2, bw, bh, {
    seed, strokeWidth: 1.2, roughness: 0.65,
  }))
  // Two end-rim hints
  paths.push(...roughLine(cx - bw / 2 + 4, CENTRE_Y - bh / 2 + 2, cx - bw / 2 + 4, CENTRE_Y + bh / 2 - 2, {
    seed: seed + 4, strokeWidth: 0.7, roughness: 0.4,
  }))
  paths.push(...roughLine(cx + bw / 2 - 4, CENTRE_Y - bh / 2 + 2, cx + bw / 2 - 4, CENTRE_Y + bh / 2 - 2, {
    seed: seed + 5, strokeWidth: 0.7, roughness: 0.4,
  }))
  // Axial leads
  paths.push(...roughLine(cx - bw / 2 - 16, CENTRE_Y, cx - bw / 2, CENTRE_Y, { seed: seed + 1, strokeWidth: 1.3 }))
  paths.push(...roughLine(cx + bw / 2, CENTRE_Y, cx + bw / 2 + 16, CENTRE_Y, { seed: seed + 2, strokeWidth: 1.3 }))
  return paths
}

/** 6. Tantalum SMT teardrop — chunky oval body. */
function tantalumStrokes(cx: number, seed: number): RoughPath[] {
  const paths: RoughPath[] = []
  // Body: use a rounded path to get the teardrop effect.
  // Width 40, height 28, corners slightly asymmetric.
  const bw = 40, bh = 28
  const x0 = cx - bw / 2
  const y0 = CENTRE_Y - bh / 2
  const d = `M ${x0 + 4} ${y0}
             Q ${x0} ${y0} ${x0} ${y0 + 4}
             L ${x0} ${y0 + bh - 4}
             Q ${x0} ${y0 + bh} ${x0 + 4} ${y0 + bh}
             L ${x0 + bw - 4} ${y0 + bh}
             Q ${x0 + bw} ${y0 + bh} ${x0 + bw} ${y0 + bh - 4}
             L ${x0 + bw} ${y0 + 4}
             Q ${x0 + bw} ${y0} ${x0 + bw - 4} ${y0}
             Z`
  paths.push(...roughPath(d, { seed, strokeWidth: 1.2, roughness: 0.7 }))
  // Two tiny lead tabs at bottom
  paths.push(...roughLine(cx - 8, CENTRE_Y + bh / 2, cx - 8, CENTRE_Y + bh / 2 + 6, { seed: seed + 1, strokeWidth: 1.1 }))
  paths.push(...roughLine(cx + 8, CENTRE_Y + bh / 2, cx + 8, CENTRE_Y + bh / 2 + 6, { seed: seed + 2, strokeWidth: 1.1 }))
  return paths
}

/* ── Main ───────────────────────────────────────────────────────── */

export default function CapacitorTypeGallery() {
  const { t } = useTranslation('ui')

  const cxs = useMemo(
    () => Array.from({ length: SLOT_COUNT }, (_, i) => slotX(i)),
    [],
  )

  const strokes = useMemo(
    () => ({
      disc:      discStrokes(cxs[0], 101),
      mlcc:      mlccStrokes(cxs[1], 203),
      film:      filmStrokes(cxs[2], 311),
      radial:    radialElecStrokes(cxs[3], 419),
      axial:     axialElecStrokes(cxs[4], 523),
      tantalum:  tantalumStrokes(cxs[5], 631),
    }),
    [cxs],
  )

  const labels = [
    t('ch1_5.typeDisc'),
    t('ch1_5.typeMLCC'),
    t('ch1_5.typeFilm'),
    t('ch1_5.typeRadial'),
    t('ch1_5.typeAxial'),
    t('ch1_5.typeTantalum'),
  ]

  return (
    <figure className="my-6 not-prose">
      <svg
        width="100%"
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        role="img"
        aria-label={t('ch1_5.typesGalleryAria')}
        style={{ display: 'block', maxWidth: 720, margin: '0 auto' }}
      >
        {/* ── Silhouettes ─────────────────────────────────────────── */}
        <RoughPaths paths={strokes.disc} />
        <RoughPaths paths={strokes.mlcc} />
        <RoughPaths paths={strokes.film} />
        <RoughPaths paths={strokes.radial} />
        <RoughPaths paths={strokes.axial} />
        <RoughPaths paths={strokes.tantalum} />

        {/* ── Polarity hints ──────────────────────────────────────── */}
        {/* Radial electrolytic: "+" symbol to the LEFT of the longer lead */}
        <text
          x={cxs[3] - 18}
          y={CENTRE_Y + 22 + 6}
          fontFamily="Menlo, Consolas, monospace"
          fontSize="0.72em"
          fontWeight="700"
          fill="currentColor"
          textAnchor="middle"
          opacity={0.75}
        >
          +
        </text>
        {/* Axial electrolytic: "+" on the anode end (left) */}
        <text
          x={cxs[4] - 38}
          y={CENTRE_Y - 16}
          fontFamily="Menlo, Consolas, monospace"
          fontSize="0.72em"
          fontWeight="700"
          fill="currentColor"
          textAnchor="middle"
          opacity={0.75}
        >
          +
        </text>
        {/* Tantalum: stripe on the POSITIVE end — a thin vertical mark on the right */}
        <line
          x1={cxs[5] + 14} y1={CENTRE_Y - 12}
          x2={cxs[5] + 14} y2={CENTRE_Y + 12}
          stroke="currentColor"
          strokeWidth={2}
          opacity={0.75}
        />

        {/* ── Labels ──────────────────────────────────────────────── */
        /* Split labels on first space so UA two-word labels
         * («керамічний дисковий», «керамічний MLCC») render as two
         * centred lines instead of spilling into neighbour slots.
         * Single-word labels render on one line at LABEL_Y. */}
        {cxs.map((cx, i) => {
          const label = labels[i]
          const firstSpace = label.indexOf(' ')
          const isTwoLine = firstSpace > 0
          const line1 = isTwoLine ? label.slice(0, firstSpace) : label
          const line2 = isTwoLine ? label.slice(firstSpace + 1) : ''
          return (
            <text
              key={i}
              x={cx}
              y={isTwoLine ? LABEL_Y - LINE_GAP / 2 : LABEL_Y}
              fontFamily="Georgia, serif"
              fontSize="0.812em"
              fontStyle="italic"
              fontWeight="700"
              fill="currentColor"
              textAnchor="middle"
            >
              <tspan x={cx}>{line1}</tspan>
              {isTwoLine && (
                <tspan x={cx} dy={LINE_GAP}>{line2}</tspan>
              )}
            </text>
          )
        })}
      </svg>
    </figure>
  )
}
