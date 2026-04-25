/**
 * Chapter 1.6 — Inductor type gallery.
 *
 * Six labelled hand-drawn silhouettes arranged in a row so the reader
 * can put a face to each family name mentioned in §Types prose:
 *
 *   1. Air-core solenoid — open coil of wire on a transparent former.
 *   2. Ferrite rod       — same coil but wrapped on a dark cylindrical
 *                          rod (stylised black core).
 *   3. Toroid            — doughnut-shaped core wrapped with wire turns
 *                          (the ham-radio mainstay for HF/VHF networks).
 *   4. Moulded RF choke  — small cylinder painted with stripes like a
 *                          resistor (the bobbin-wound parts you find in
 *                          factory-built kits and supply chokes).
 *   5. Laminated iron    — two stacked rectangles representing E/I core
 *                          laminations, with a coil wrapped around the
 *                          centre leg (mains-frequency chokes).
 *   6. SMD               — flat rectangular chip with two end-cap
 *                          contacts, the dominant modern format for
 *                          printed-circuit-board work.
 *
 * All strokes use Rough.js for the book's hand-drawn aesthetic; fills
 * are subtle `currentColor` tints. Every visible word is pulled from
 * i18n (`t('ch1_6.type*')`).
 */
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  RoughPaths,
  type RoughPath,
  roughLine,
  roughRect,
  roughEllipse,
} from '@/lib/rough'

const VB_W = 720
const VB_H = 200

const SLOT_COUNT = 6
const SLOT_W = VB_W / SLOT_COUNT
const CENTRE_Y = 78
const LABEL_Y = 150
const LINE_GAP = 14

function slotX(i: number): number {
  return SLOT_W * (i + 0.5)
}

/* ── Silhouette drawers ─────────────────────────────────────────── */

/** Helper: draw a row of `n` arcs (coil bumps) along a horizontal axis
 *  centred at (cx, cy). Returns rough.js paths. */
function coilArcs(cx: number, cy: number, n: number, bumpW: number, bumpH: number, seed: number): RoughPath[] {
  const paths: RoughPath[] = []
  const totalW = n * bumpW
  const startX = cx - totalW / 2
  for (let i = 0; i < n; i++) {
    const x = startX + i * bumpW + bumpW / 2
    paths.push(...roughEllipse(x, cy, bumpW, bumpH * 2, {
      seed: seed + i,
      strokeWidth: 1.2,
      roughness: 0.7,
      stroke: 'currentColor',
    }))
  }
  return paths
}

/** 1. Air-core solenoid — bare cylindrical coil, no core, axial leads. */
function airCoreStrokes(cx: number, seed: number): RoughPath[] {
  const paths: RoughPath[] = []
  const n = 6
  const bumpW = 8
  const bumpH = 5
  paths.push(...coilArcs(cx, CENTRE_Y, n, bumpW, bumpH, seed))
  // Axial leads on the sides
  const halfW = (n * bumpW) / 2
  paths.push(...roughLine(cx - halfW - 16, CENTRE_Y, cx - halfW, CENTRE_Y, { seed: seed + 20, strokeWidth: 1.3 }))
  paths.push(...roughLine(cx + halfW, CENTRE_Y, cx + halfW + 16, CENTRE_Y, { seed: seed + 21, strokeWidth: 1.3 }))
  return paths
}

/** 2. Ferrite rod — coil wrapped on a dark rod (rod drawn behind coil). */
function ferriteRodStrokes(cx: number, seed: number): RoughPath[] {
  const paths: RoughPath[] = []
  const n = 6
  const bumpW = 8
  const bumpH = 5
  const halfW = (n * bumpW) / 2
  // Rod (rectangle behind the coil)
  paths.push(...roughRect(cx - halfW - 4, CENTRE_Y - 2, halfW * 2 + 8, 4, {
    seed, strokeWidth: 1.2, roughness: 0.5, fill: 'currentColor', fillStyle: 'solid',
  }))
  // Coil arcs on top
  paths.push(...coilArcs(cx, CENTRE_Y, n, bumpW, bumpH, seed + 30))
  // Leads
  paths.push(...roughLine(cx - halfW - 18, CENTRE_Y, cx - halfW - 4, CENTRE_Y, { seed: seed + 50, strokeWidth: 1.3 }))
  paths.push(...roughLine(cx + halfW + 4, CENTRE_Y, cx + halfW + 18, CENTRE_Y, { seed: seed + 51, strokeWidth: 1.3 }))
  return paths
}

/** 3. Toroid — donut-shape with windings around the rim. */
function toroidStrokes(cx: number, seed: number): RoughPath[] {
  const paths: RoughPath[] = []
  // Outer ring
  paths.push(...roughEllipse(cx, CENTRE_Y, 50, 36, {
    seed, strokeWidth: 1.2, roughness: 0.6, stroke: 'currentColor',
  }))
  // Inner hole
  paths.push(...roughEllipse(cx, CENTRE_Y, 22, 14, {
    seed: seed + 1, strokeWidth: 1.0, roughness: 0.5, stroke: 'currentColor',
  }))
  // Windings: 5 short curves crossing the ring
  for (let i = 0; i < 5; i++) {
    const angle = (-Math.PI / 2) + (i / 4) * Math.PI * 0.6 - Math.PI * 0.15
    const r1 = 11
    const r2 = 25
    const x1 = cx + r1 * Math.cos(angle)
    const y1 = CENTRE_Y + r1 * 0.65 * Math.sin(angle)
    const x2 = cx + r2 * Math.cos(angle)
    const y2 = CENTRE_Y + r2 * 0.65 * Math.sin(angle)
    paths.push(...roughLine(x1, y1, x2, y2, { seed: seed + 10 + i, strokeWidth: 1.0, roughness: 0.4 }))
  }
  // Two leads coming off the bottom
  paths.push(...roughLine(cx - 12, CENTRE_Y + 20, cx - 12, CENTRE_Y + 32, { seed: seed + 60, strokeWidth: 1.3 }))
  paths.push(...roughLine(cx + 12, CENTRE_Y + 20, cx + 12, CENTRE_Y + 32, { seed: seed + 61, strokeWidth: 1.3 }))
  return paths
}

/** 4. Moulded RF choke — chubby cylinder with stripes (resistor-like body). */
function mouldedChokeStrokes(cx: number, seed: number): RoughPath[] {
  const paths: RoughPath[] = []
  const bw = 44, bh = 22
  paths.push(...roughRect(cx - bw / 2, CENTRE_Y - bh / 2, bw, bh, {
    seed, strokeWidth: 1.2, roughness: 0.5,
  }))
  // Three stripes
  for (let i = 0; i < 3; i++) {
    const sx = cx - bw / 2 + 8 + i * 10
    paths.push(...roughLine(sx, CENTRE_Y - bh / 2 + 3, sx, CENTRE_Y + bh / 2 - 3, {
      seed: seed + 5 + i, strokeWidth: 1.1, roughness: 0.4,
    }))
  }
  // Axial leads
  paths.push(...roughLine(cx - bw / 2 - 14, CENTRE_Y, cx - bw / 2, CENTRE_Y, { seed: seed + 20, strokeWidth: 1.3 }))
  paths.push(...roughLine(cx + bw / 2, CENTRE_Y, cx + bw / 2 + 14, CENTRE_Y, { seed: seed + 21, strokeWidth: 1.3 }))
  return paths
}

/** 5. Laminated iron — stacked rectangle (E/I core) with coil winding. */
function laminatedStrokes(cx: number, seed: number): RoughPath[] {
  const paths: RoughPath[] = []
  const cw = 56, ch = 30
  // Outer core rectangle
  paths.push(...roughRect(cx - cw / 2, CENTRE_Y - ch / 2, cw, ch, {
    seed, strokeWidth: 1.2, roughness: 0.5,
  }))
  // Two horizontal lamination lines
  paths.push(...roughLine(cx - cw / 2 + 3, CENTRE_Y - 5, cx + cw / 2 - 3, CENTRE_Y - 5, { seed: seed + 5, strokeWidth: 0.7, roughness: 0.4 }))
  paths.push(...roughLine(cx - cw / 2 + 3, CENTRE_Y + 5, cx + cw / 2 - 3, CENTRE_Y + 5, { seed: seed + 6, strokeWidth: 0.7, roughness: 0.4 }))
  // Coil bobbin in the centre (small box on top of the core)
  paths.push(...roughRect(cx - 9, CENTRE_Y - ch / 2 - 10, 18, 8, { seed: seed + 10, strokeWidth: 1.0, roughness: 0.4 }))
  // Two leads down from the bobbin
  paths.push(...roughLine(cx - 5, CENTRE_Y + ch / 2, cx - 5, CENTRE_Y + ch / 2 + 12, { seed: seed + 30, strokeWidth: 1.3 }))
  paths.push(...roughLine(cx + 5, CENTRE_Y + ch / 2, cx + 5, CENTRE_Y + ch / 2 + 12, { seed: seed + 31, strokeWidth: 1.3 }))
  return paths
}

/** 6. SMD — flat rectangle with two end-cap contacts. */
function smdStrokes(cx: number, seed: number): RoughPath[] {
  const paths: RoughPath[] = []
  const bw = 32, bh = 18
  // Body
  paths.push(...roughRect(cx - bw / 2, CENTRE_Y - bh / 2, bw, bh, {
    seed, strokeWidth: 1.2, roughness: 0.5,
  }))
  // End caps (filled small rectangles at each end)
  const capW = 5
  paths.push(...roughRect(cx - bw / 2, CENTRE_Y - bh / 2, capW, bh, {
    seed: seed + 5, strokeWidth: 1.0, roughness: 0.3,
    fill: 'currentColor', fillStyle: 'solid',
  }))
  paths.push(...roughRect(cx + bw / 2 - capW, CENTRE_Y - bh / 2, capW, bh, {
    seed: seed + 6, strokeWidth: 1.0, roughness: 0.3,
    fill: 'currentColor', fillStyle: 'solid',
  }))
  return paths
}

export default function InductorTypeGallery() {
  const { t } = useTranslation('ui')

  const cxs = useMemo(
    () => Array.from({ length: SLOT_COUNT }, (_, i) => slotX(i)),
    [],
  )

  const strokes = useMemo(
    () => ({
      airCore:    airCoreStrokes(cxs[0], 107),
      ferriteRod: ferriteRodStrokes(cxs[1], 211),
      toroid:     toroidStrokes(cxs[2], 313),
      moulded:    mouldedChokeStrokes(cxs[3], 419),
      laminated:  laminatedStrokes(cxs[4], 523),
      smd:        smdStrokes(cxs[5], 631),
    }),
    [cxs],
  )

  const labels = [
    t('ch1_6.typeAirSolenoid'),
    t('ch1_6.typeFerriteRod'),
    t('ch1_6.typeToroid'),
    t('ch1_6.typeMoldedChoke'),
    t('ch1_6.typeLaminated'),
    t('ch1_6.typeSMD'),
  ]

  return (
    <figure className="my-6 not-prose">
      <svg
        width="100%"
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        role="img"
        aria-label={t('ch1_6.typesGalleryAria')}
        style={{ display: 'block', maxWidth: 720, margin: '0 auto' }}
      >
        <RoughPaths paths={strokes.airCore} />
        <RoughPaths paths={strokes.ferriteRod} />
        <RoughPaths paths={strokes.toroid} />
        <RoughPaths paths={strokes.moulded} />
        <RoughPaths paths={strokes.laminated} />
        <RoughPaths paths={strokes.smd} />

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
              {isTwoLine && <tspan x={cx} dy={LINE_GAP}>{line2}</tspan>}
            </text>
          )
        })}
      </svg>
    </figure>
  )
}
