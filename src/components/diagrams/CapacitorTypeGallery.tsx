/**
 * Chapter 1.5 — Capacitor type gallery.
 *
 * Six labelled hand-drawn silhouettes — one per family mentioned in the
 * §Types prose:
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
 * LAYOUT — the gallery is a responsive tile grid: each tile is its own
 * small SVG icon plus its own HTML label, both in one cell. On mobile
 * (< sm breakpoint) the grid is 3 cols × 2 rows so UA labels (~10–18
 * chars at text-xs) get column widths around 120 px; on desktop it
 * becomes 6 cols × 1 row, identical to before. The previous architecture
 * (one big 720-wide SVG with six slots, plus a 6-col grid of HTML labels
 * underneath) only worked on viewports wide enough for six 120-px
 * columns — on a 360-px phone the labels overflowed their cells and ran
 * into each other. Same pattern is used in InductorTypeGallery.
 *
 * All strokes use Rough.js for the book's hand-drawn aesthetic. Every
 * visible word is pulled from i18n (`t('ch1_5.type*')`).
 */
import { useMemo, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import {
  RoughPaths,
  type RoughPath,
  roughLine,
  roughRect,
  roughCircle,
  roughPath,
} from '@/lib/rough'

/* ── Per-tile geometry ──────────────────────────────────────────────
 * Each tile is its own SVG with a 120 × 130 viewBox; the silhouette is
 * drawn around (cx, CENTRE_Y) where cx is the tile's horizontal centre.
 * Vertical extent: top ≈ 50 (axial «+» glyph), bottom ≈ 122 (radial
 * electrolytic's longer lead) — VB_H = 130 leaves a small margin. */
const TILE_VB_W = 120
const TILE_VB_H = 130
const CENTRE_Y = 74
const TILE_CX = TILE_VB_W / 2

/* ── Silhouette drawers ─────────────────────────────────────────── */

/** 1. Disc ceramic — circular wafer with two vertical leads down. */
function discStrokes(cx: number, seed: number): RoughPath[] {
  const paths: RoughPath[] = []
  paths.push(...roughCircle(cx, CENTRE_Y, 40, { seed, strokeWidth: 1.2, roughness: 0.7 }))
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
  paths.push(...roughLine(cx - bw / 2 + 3, CENTRE_Y - 4, cx + bw / 2 - 3, CENTRE_Y - 4, { seed: seed + 5, strokeWidth: 0.7, roughness: 0.4 }))
  paths.push(...roughLine(cx - bw / 2 + 3, CENTRE_Y + 4, cx + bw / 2 - 3, CENTRE_Y + 4, { seed: seed + 6, strokeWidth: 0.7, roughness: 0.4 }))
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
  paths.push(...roughLine(cx - bw / 2 - 18, CENTRE_Y, cx - bw / 2, CENTRE_Y, { seed: seed + 1, strokeWidth: 1.3 }))
  paths.push(...roughLine(cx + bw / 2, CENTRE_Y, cx + bw / 2 + 18, CENTRE_Y, { seed: seed + 2, strokeWidth: 1.3 }))
  return paths
}

/** 4. Radial aluminium electrolytic — tall can, two leads down.
 *  "+" mark sits on the positive (longer-lead) side. */
function radialElecStrokes(cx: number, seed: number): RoughPath[] {
  const paths: RoughPath[] = []
  const bw = 28, bh = 44
  paths.push(...roughRect(cx - bw / 2, CENTRE_Y - bh / 2, bw, bh, {
    seed, strokeWidth: 1.2, roughness: 0.65,
  }))
  paths.push(...roughLine(cx - bw / 2, CENTRE_Y - bh / 2 + 4, cx + bw / 2, CENTRE_Y - bh / 2 + 4, {
    seed: seed + 3, strokeWidth: 0.8, roughness: 0.4,
  }))
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
  paths.push(...roughLine(cx - bw / 2 + 4, CENTRE_Y - bh / 2 + 2, cx - bw / 2 + 4, CENTRE_Y + bh / 2 - 2, {
    seed: seed + 4, strokeWidth: 0.7, roughness: 0.4,
  }))
  paths.push(...roughLine(cx + bw / 2 - 4, CENTRE_Y - bh / 2 + 2, cx + bw / 2 - 4, CENTRE_Y + bh / 2 - 2, {
    seed: seed + 5, strokeWidth: 0.7, roughness: 0.4,
  }))
  paths.push(...roughLine(cx - bw / 2 - 16, CENTRE_Y, cx - bw / 2, CENTRE_Y, { seed: seed + 1, strokeWidth: 1.3 }))
  paths.push(...roughLine(cx + bw / 2, CENTRE_Y, cx + bw / 2 + 16, CENTRE_Y, { seed: seed + 2, strokeWidth: 1.3 }))
  return paths
}

/** 6. Tantalum SMT teardrop — chunky oval body. */
function tantalumStrokes(cx: number, seed: number): RoughPath[] {
  const paths: RoughPath[] = []
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
  paths.push(...roughLine(cx - 8, CENTRE_Y + bh / 2, cx - 8, CENTRE_Y + bh / 2 + 6, { seed: seed + 1, strokeWidth: 1.1 }))
  paths.push(...roughLine(cx + 8, CENTRE_Y + bh / 2, cx + 8, CENTRE_Y + bh / 2 + 6, { seed: seed + 2, strokeWidth: 1.1 }))
  return paths
}

/* ── Per-tile component ─────────────────────────────────────────── */

type CapKind = 'disc' | 'mlcc' | 'film' | 'radial' | 'axial' | 'tantalum'

interface CapTileProps {
  kind: CapKind
  label: string
  seed: number
}

function CapTile({ kind, label, seed }: CapTileProps) {
  const { strokes, polarity } = useMemo(() => {
    const cx = TILE_CX
    let s: RoughPath[]
    let p: ReactNode = null
    switch (kind) {
      case 'disc': s = discStrokes(cx, seed); break
      case 'mlcc': s = mlccStrokes(cx, seed); break
      case 'film': s = filmStrokes(cx, seed); break
      case 'radial':
        s = radialElecStrokes(cx, seed)
        // "+" symbol to the LEFT of the longer (positive) lead
        p = (
          <text
            x={cx - 18}
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
        )
        break
      case 'axial':
        s = axialElecStrokes(cx, seed)
        // "+" on the anode end (left)
        p = (
          <text
            x={cx - 38}
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
        )
        break
      case 'tantalum':
        s = tantalumStrokes(cx, seed)
        // Polarity stripe on the POSITIVE end (right) — opposite of aluminium
        p = (
          <line
            x1={cx + 14} y1={CENTRE_Y - 12}
            x2={cx + 14} y2={CENTRE_Y + 12}
            stroke="currentColor"
            strokeWidth={2}
            opacity={0.75}
          />
        )
        break
    }
    return { strokes: s, polarity: p }
  }, [kind, seed])

  return (
    <div className="text-center">
      <svg
        viewBox={`0 0 ${TILE_VB_W} ${TILE_VB_H}`}
        className="block w-full h-auto"
        aria-hidden="true"
      >
        <RoughPaths paths={strokes} />
        {polarity}
      </svg>
      <span className="mt-1 block text-xs leading-snug text-foreground italic">
        {label}
      </span>
    </div>
  )
}

/* ── Main ───────────────────────────────────────────────────────── */

export default function CapacitorTypeGallery() {
  const { t } = useTranslation('ui')

  return (
    <figure
      className="my-6 mx-auto max-w-[720px] not-prose"
      aria-label={t('ch1_5.typesGalleryAria')}
    >
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-x-2 gap-y-3">
        <CapTile kind="disc"     seed={101} label={t('ch1_5.typeDisc')} />
        <CapTile kind="mlcc"     seed={203} label={t('ch1_5.typeMLCC')} />
        <CapTile kind="film"     seed={311} label={t('ch1_5.typeFilm')} />
        <CapTile kind="radial"   seed={419} label={t('ch1_5.typeRadial')} />
        <CapTile kind="axial"    seed={523} label={t('ch1_5.typeAxial')} />
        <CapTile kind="tantalum" seed={631} label={t('ch1_5.typeTantalum')} />
      </div>
    </figure>
  )
}
