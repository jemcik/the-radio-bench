/**
 * Chapter 1.6 — Inductor type gallery.
 *
 * Six labelled hand-drawn silhouettes — one per family mentioned in
 * §Types prose:
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
 * LAYOUT — the gallery is a responsive tile grid: each tile is its own
 * small SVG icon plus its own HTML label, both in one cell. On mobile
 * (< sm breakpoint) the grid is 3 cols × 2 rows so UA labels («з
 * повітряним осердям», «феритовий стрижень») get column widths around
 * 120 px instead of overflowing into neighbours; on desktop it becomes
 * 6 cols × 1 row, identical to before. Same pattern is used in
 * CapacitorTypeGallery.
 *
 * All strokes use Rough.js for the book's hand-drawn aesthetic. Every
 * visible word is pulled from i18n (`t('ch1_6.type*')`).
 */
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  RoughPaths,
  type RoughPath,
  roughLine,
  roughPath,
  roughRect,
  roughEllipse,
} from '@/lib/rough'

/* ── Per-tile geometry ──────────────────────────────────────────────
 * Each tile is its own SVG with a 120 × 118 viewBox; the silhouette is
 * drawn around (cx, CENTRE_Y) where cx is the tile's horizontal centre. */
const TILE_VB_W = 120
const TILE_VB_H = 118
const CENTRE_Y = 70
const TILE_CX = TILE_VB_W / 2

/* ── Silhouette drawers ─────────────────────────────────────────── */

/** Helper: continuous-wire bumps (the IEC inductor symbol).
 *  Returns a single path rendered with rough.js — looks like one wire
 *  forming a row of «∩∩∩∩» bumps, not separate beads. */
function coilBumpsPath(cx: number, cy: number, n: number, bumpW: number, bumpH: number, leadLen: number): string {
  const totalW = n * bumpW
  const startX = cx - totalW / 2
  const rx = bumpW / 2
  let d = `M ${startX - leadLen} ${cy} L ${startX} ${cy}`
  for (let i = 0; i < n; i++) {
    // Each bump is a half-ellipse arcing UPWARD (sweep=0 in y-down coords).
    d += ` a ${rx} ${bumpH} 0 0 1 ${bumpW} 0`
  }
  d += ` L ${startX + totalW + leadLen} ${cy}`
  return d
}

/** 1. Air-core solenoid — bare cylindrical coil, no core, axial leads. */
function airCoreStrokes(cx: number, seed: number): RoughPath[] {
  const d = coilBumpsPath(cx, CENTRE_Y, 6, 9, 7, 14)
  return roughPath(d, {
    seed, strokeWidth: 1.3, roughness: 0.55, stroke: 'currentColor',
  })
}

/** 2. Ferrite rod — pill-shaped cylindrical rod with the wire winding
 *  drawn as slanted "/" diagonals on the FRONT FACE (same convention as
 *  the chapter hero coil). The rod fill is page background so the
 *  diagonals are clearly visible on top of it; the rod has its own
 *  outline. Reads unambiguously as «wire wraps helically around a
 *  cylindrical rod». */
function ferriteRodStrokes(cx: number, seed: number): RoughPath[] {
  const paths: RoughPath[] = []
  const n = 6
  const turnW = 8
  const totalW = n * turnW
  const cy = CENTRE_Y
  const rodH = 14
  const rodOverhang = 4    // rod sticks out past the coil on each side
  const rodL = cx - totalW / 2 - rodOverhang
  const rodRight = cx + totalW / 2 + rodOverhang
  const rodR = rodH / 2     // full pill (semicircular caps)
  const rodTop = cy - rodH / 2
  const rodBot = cy + rodH / 2

  // Rod: pill outline with background fill so the diagonals on top read
  // clearly. Drawn FIRST so subsequent strokes appear on top of it.
  const rodPath = [
    `M ${rodL + rodR} ${rodTop}`,
    `L ${rodRight - rodR} ${rodTop}`,
    `A ${rodR} ${rodR} 0 0 1 ${rodRight - rodR} ${rodBot}`,
    `L ${rodL + rodR} ${rodBot}`,
    `A ${rodR} ${rodR} 0 0 1 ${rodL + rodR} ${rodTop}`,
    'Z',
  ].join(' ')
  paths.push(...roughPath(rodPath, {
    seed, strokeWidth: 1.2, roughness: 0.5,
    fill: 'hsl(var(--background))', fillStyle: 'solid', stroke: 'currentColor',
  }))

  // Wire winding: 6 "/" diagonals on the front face — each goes from the
  // rod's bottom edge up to its top edge as you advance rightward,
  // forming a stylised helix.
  for (let i = 0; i < n; i++) {
    const xStart = cx - totalW / 2 + i * turnW
    paths.push(...roughLine(xStart, rodBot - 1, xStart + turnW, rodTop + 1, {
      seed: seed + 30 + i, strokeWidth: 1.2, roughness: 0.4, stroke: 'currentColor',
    }))
  }

  // Leads emerging from the rod's left and right ends
  paths.push(...roughLine(rodL - 10, cy, rodL, cy, { seed: seed + 50, strokeWidth: 1.3 }))
  paths.push(...roughLine(rodRight, cy, rodRight + 10, cy, { seed: seed + 51, strokeWidth: 1.3 }))

  return paths
}

/** 3. Toroid — donut-shape with windings around the rim. */
function toroidStrokes(cx: number, seed: number): RoughPath[] {
  const paths: RoughPath[] = []
  paths.push(...roughEllipse(cx, CENTRE_Y, 50, 36, {
    seed, strokeWidth: 1.2, roughness: 0.6, stroke: 'currentColor',
  }))
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
  for (let i = 0; i < 3; i++) {
    const sx = cx - bw / 2 + 8 + i * 10
    paths.push(...roughLine(sx, CENTRE_Y - bh / 2 + 3, sx, CENTRE_Y + bh / 2 - 3, {
      seed: seed + 5 + i, strokeWidth: 1.1, roughness: 0.4,
    }))
  }
  paths.push(...roughLine(cx - bw / 2 - 14, CENTRE_Y, cx - bw / 2, CENTRE_Y, { seed: seed + 20, strokeWidth: 1.3 }))
  paths.push(...roughLine(cx + bw / 2, CENTRE_Y, cx + bw / 2 + 14, CENTRE_Y, { seed: seed + 21, strokeWidth: 1.3 }))
  return paths
}

/** 5. Laminated iron — stacked rectangle (E/I core) with coil winding. */
function laminatedStrokes(cx: number, seed: number): RoughPath[] {
  const paths: RoughPath[] = []
  const cw = 56, ch = 30
  paths.push(...roughRect(cx - cw / 2, CENTRE_Y - ch / 2, cw, ch, {
    seed, strokeWidth: 1.2, roughness: 0.5,
  }))
  paths.push(...roughLine(cx - cw / 2 + 3, CENTRE_Y - 5, cx + cw / 2 - 3, CENTRE_Y - 5, { seed: seed + 5, strokeWidth: 0.7, roughness: 0.4 }))
  paths.push(...roughLine(cx - cw / 2 + 3, CENTRE_Y + 5, cx + cw / 2 - 3, CENTRE_Y + 5, { seed: seed + 6, strokeWidth: 0.7, roughness: 0.4 }))
  paths.push(...roughRect(cx - 9, CENTRE_Y - ch / 2 - 10, 18, 8, { seed: seed + 10, strokeWidth: 1.0, roughness: 0.4 }))
  paths.push(...roughLine(cx - 5, CENTRE_Y + ch / 2, cx - 5, CENTRE_Y + ch / 2 + 12, { seed: seed + 30, strokeWidth: 1.3 }))
  paths.push(...roughLine(cx + 5, CENTRE_Y + ch / 2, cx + 5, CENTRE_Y + ch / 2 + 12, { seed: seed + 31, strokeWidth: 1.3 }))
  return paths
}

/** 6. SMD — flat rectangle with two end-cap contacts. */
function smdStrokes(cx: number, seed: number): RoughPath[] {
  const paths: RoughPath[] = []
  const bw = 32, bh = 18
  paths.push(...roughRect(cx - bw / 2, CENTRE_Y - bh / 2, bw, bh, {
    seed, strokeWidth: 1.2, roughness: 0.5,
  }))
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

/* ── Per-tile component ─────────────────────────────────────────── */

type IndKind = 'airCore' | 'ferriteRod' | 'toroid' | 'moulded' | 'laminated' | 'smd'

interface IndTileProps {
  kind: IndKind
  label: string
  seed: number
}

function IndTile({ kind, label, seed }: IndTileProps) {
  const strokes = useMemo(() => {
    const cx = TILE_CX
    switch (kind) {
      case 'airCore':    return airCoreStrokes(cx, seed)
      case 'ferriteRod': return ferriteRodStrokes(cx, seed)
      case 'toroid':     return toroidStrokes(cx, seed)
      case 'moulded':    return mouldedChokeStrokes(cx, seed)
      case 'laminated':  return laminatedStrokes(cx, seed)
      case 'smd':        return smdStrokes(cx, seed)
    }
  }, [kind, seed])

  return (
    <div className="text-center">
      <svg
        viewBox={`0 0 ${TILE_VB_W} ${TILE_VB_H}`}
        className="block w-full h-auto"
        aria-hidden="true"
      >
        <RoughPaths paths={strokes} />
      </svg>
      <span className="mt-1 block text-xs leading-snug text-foreground italic">
        {label}
      </span>
    </div>
  )
}

/* ── Main ───────────────────────────────────────────────────────── */

export default function InductorTypeGallery() {
  const { t } = useTranslation('ui')

  return (
    <figure
      className="my-6 mx-auto max-w-[720px] not-prose"
      aria-label={t('ch1_6.typesGalleryAria')}
    >
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-x-2 gap-y-3">
        <IndTile kind="airCore"    seed={107} label={t('ch1_6.typeAirSolenoid')} />
        <IndTile kind="ferriteRod" seed={211} label={t('ch1_6.typeFerriteRod')} />
        <IndTile kind="toroid"     seed={313} label={t('ch1_6.typeToroid')} />
        <IndTile kind="moulded"    seed={419} label={t('ch1_6.typeMoldedChoke')} />
        <IndTile kind="laminated"  seed={523} label={t('ch1_6.typeLaminated')} />
        <IndTile kind="smd"        seed={631} label={t('ch1_6.typeSMD')} />
      </div>
    </figure>
  )
}
