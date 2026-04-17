import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import SVGDiagram from './SVGDiagram'
import DiagramFigure from './DiagramFigure'
import { svgTokens } from './svgTokens'
import {
  RoughPaths,
  roughCircle,
  roughLine,
  roughLinearPath,
} from '@/lib/rough'

/**
 * Chapter 1.1 — Atomic structure (Section 2: Charge)
 *
 * Two-panel illustration supporting the chapter's charge paragraph:
 *   LEFT  — neutral atom: a small nucleus (3 protons + 3 neutrons)
 *           surrounded by 3 electrons on a single orbit. Protons and
 *           electrons balance → net charge = 0.
 *   RIGHT — positive ion: the same atom after one electron has been
 *           knocked loose. Two electrons remain on the orbit; the
 *           third flies off with a short arrow. Net charge = +1.
 *
 * A horizontal arrow in the middle annotates the transformation
 * ("−1 electron"), making the "tip the balance" idea explicit rather
 * than leaving the reader to infer it from two isolated pictures.
 *
 * Rough.js is used for orbits, vibration arcs, and arrows so the
 * aesthetic matches the chapter hero. Individual particles are
 * rendered as clean SVG circles so the +/−/· symbols stay legible
 * at small sizes.
 *
 * Sizing: viewBox 560 × 280, rendered at maxWidth 560 (1:1) so every
 * fontSize renders at its designed size on screen.
 */

type Pt = [number, number]

/**
 * Compute arrowhead wing points for a line ending at (x2, y2).
 * Returns the three points forming the V-shaped head:
 *   side1  →  tip  →  side2
 */
function arrowHead(x1: number, y1: number, x2: number, y2: number, len = 9, width = 4.5): [Pt, Pt, Pt] {
  const dx = x2 - x1
  const dy = y2 - y1
  const length = Math.sqrt(dx * dx + dy * dy)
  const nx = dx / length, ny = dy / length
  const bx = -nx, by = -ny
  const px = ny, py = -nx
  const side1: Pt = [x2 + len * bx + width * px, y2 + len * by + width * py]
  const side2: Pt = [x2 + len * bx - width * px, y2 + len * by - width * py]
  return [side1, [x2, y2], side2]
}

/**
 * Shorten a from→to segment by `dist`, returning the new endpoint.
 * Used so arrows pointing at a round target stop just outside the
 * circle instead of burying the tip inside it.
 */
function shortened(from: Pt, to: Pt, dist: number): Pt {
  const dx = to[0] - from[0]
  const dy = to[1] - from[1]
  const len = Math.sqrt(dx * dx + dy * dy)
  return [to[0] - dist * (dx / len), to[1] - dist * (dy / len)]
}

// Colour tokens (matching the rest of the chapter's convention:
// orange = ion/positive, blue = electron/negative).
const PROTON_FILL   = 'hsl(var(--callout-caution))'
const NEUTRON_FILL  = 'hsl(var(--muted-foreground) / 0.7)'
const ELECTRON_FILL = 'hsl(var(--callout-note))'
const LABEL_BG      = 'hsl(var(--background))'

export default function AtomicDiagram() {
  const { t } = useTranslation('ui')

  // ── Geometry ────────────────────────────────────────────────────
  const W = 560
  const H = 280

  const atomY = 142
  const orbitR = 40
  const protonR = 5
  const electronR = 5

  // Panel centres
  const leftX = 128
  const rightX = 432

  // Nucleus particle positions (relative to atom centre).
  // 3 protons + 3 neutrons arranged in a 2×3 grid with 12 px
  // horizontal and 12 px vertical spacing — each circle (r = 5) has
  // ~2 px of clearance from its neighbours, so the particles read as
  // distinct spheres rather than one blob. Kinds alternate like a
  // checkerboard so both species are visibly mixed through the cluster.
  const nucleusOffsets: { kind: 'p' | 'n'; dx: number; dy: number }[] = [
    { kind: 'p', dx: -12, dy: -6 },
    { kind: 'n', dx:   0, dy: -6 },
    { kind: 'p', dx:  12, dy: -6 },
    { kind: 'n', dx: -12, dy:  6 },
    { kind: 'p', dx:   0, dy:  6 },
    { kind: 'n', dx:  12, dy:  6 },
  ]

  // Electron positions on the orbit — angle in radians from 12 o'clock
  // (clockwise).
  const electronAngles = [Math.PI / 2, (7 * Math.PI) / 6, (11 * Math.PI) / 6]
  const electronAt = (cx: number, cy: number, angle: number): Pt => [
    cx + orbitR * Math.cos(angle),
    cy + orbitR * Math.sin(angle),
  ]

  // For the ion panel, the UPPER-RIGHT electron (angle 11π/6) is the
  // one that escapes — its outward trajectory clears the panel title
  // above, the middle transformation arrow to the left, and the
  // formula text below. Earlier attempts had the bottom electron
  // escape, but its downward trajectory collided with the "+1 net
  // charge" formula text.
  const escapedAngle = 11 * Math.PI / 6
  const escapedStart: Pt = electronAt(rightX, atomY, escapedAngle)
  const escapeDist = 52
  const escapedEnd: Pt = [
    escapedStart[0] + escapeDist * Math.cos(escapedAngle),
    escapedStart[1] + escapeDist * Math.sin(escapedAngle),
  ]
  // Shaft start: 6 px outward from the electron's dot so the arrow
  // doesn't begin inside the electron itself.
  const escapeShaftStart: Pt = [
    escapedStart[0] + 6 * Math.cos(escapedAngle),
    escapedStart[1] + 6 * Math.sin(escapedAngle),
  ]

  // ── Rough.js sketch ────────────────────────────────────────────
  const sketch = useMemo(() => ({
    leftOrbit: roughCircle(leftX, atomY, orbitR * 2, {
      seed: 10, strokeWidth: 1, roughness: 0.35,
    }),
    rightOrbit: roughCircle(rightX, atomY, orbitR * 2, {
      seed: 20, strokeWidth: 1, roughness: 0.35,
    }),
    // Middle transformation arrow — horizontal, pointing from the
    // neutral panel to the ion panel.
    transformShaft: roughLine(218, atomY, 342, atomY, {
      seed: 30, strokeWidth: 1.5, roughness: 0.2,
    }),
    transformHead: roughLinearPath([
      [332, atomY - 7],
      [342, atomY],
      [332, atomY + 7],
    ], { seed: 31, strokeWidth: 1.5, roughness: 0.15 }),
    // "Escape" arrow for the removed electron on the right panel.
    // Tip stops 7 px short of the escaped-electron dot (r = 5 + 2 px
    // gap) so the arrowhead doesn't pierce the dot.
    ...(() => {
      const tip = shortened(escapeShaftStart, escapedEnd, 7)
      return {
        escapeShaft: roughLine(
          escapeShaftStart[0], escapeShaftStart[1],
          tip[0], tip[1],
          { seed: 40, strokeWidth: 1.2, roughness: 0.3 },
        ),
        escapeHead: roughLinearPath(
          arrowHead(escapeShaftStart[0], escapeShaftStart[1], tip[0], tip[1]),
          { seed: 41, strokeWidth: 1.2, roughness: 0.25 },
        ),
      }
    })(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [])

  const renderNucleus = (cx: number, cy: number) => (
    <g>
      {nucleusOffsets.map((p, i) => (
        <g key={i}>
          <circle
            cx={cx + p.dx} cy={cy + p.dy} r={protonR}
            fill={p.kind === 'p' ? PROTON_FILL : NEUTRON_FILL}
          />
          {p.kind === 'p' && (
            <text
              x={cx + p.dx} y={cy + p.dy + 2.2}
              textAnchor="middle"
              fontSize={8}
              fontWeight={700}
              fill={LABEL_BG}
            >+</text>
          )}
        </g>
      ))}
    </g>
  )

  const renderElectron = (pt: Pt, key: string, opacity = 1) => (
    <g key={key}>
      <circle cx={pt[0]} cy={pt[1]} r={electronR} fill={ELECTRON_FILL}
        opacity={opacity} />
      <text
        x={pt[0]} y={pt[1] + 2.5}
        textAnchor="middle"
        fontSize={9}
        fontWeight={700}
        fill={LABEL_BG}
        opacity={opacity}
      >−</text>
    </g>
  )

  return (
    <DiagramFigure caption={t('ch1_1.atomicCaption')}>
      <SVGDiagram
        width={W}
        height={H}
        aria-label={t('ch1_1.atomicAriaLabel')}
        style={{ maxWidth: 560, margin: '0 auto' }}
      >
        {/* Panel labels (top) */}
        <text
          x={leftX} y={40}
          textAnchor="middle"
          fontSize={14}
          fontWeight={700}
          fill={svgTokens.fg}
        >
          {t('ch1_1.atomicNeutralTitle')}
        </text>
        <text
          x={rightX} y={40}
          textAnchor="middle"
          fontSize={14}
          fontWeight={700}
          fill="hsl(var(--callout-caution))"
        >
          {t('ch1_1.atomicIonTitle')}
        </text>

        {/* ── Left: neutral atom ───────────────────────────────── */}
        {/* Orbit */}
        <g style={{ color: svgTokens.mutedFg }} opacity={0.7}>
          <RoughPaths paths={sketch.leftOrbit} />
        </g>
        {/* Nucleus */}
        {renderNucleus(leftX, atomY)}
        {/* 3 electrons on orbit */}
        {electronAngles.map((a, i) =>
          renderElectron(electronAt(leftX, atomY, a), `L-${i}`),
        )}

        {/* Panel 1 summary */}
        <text
          x={leftX} y={atomY + orbitR + 28}
          textAnchor="middle"
          fontSize={13}
          fill={svgTokens.mutedFg}
        >
          {t('ch1_1.atomicNeutralFormula')}
        </text>

        {/* ── Middle: transformation arrow ─────────────────────── */}
        <g style={{ color: svgTokens.caution }}>
          <RoughPaths paths={sketch.transformShaft} />
          <RoughPaths paths={sketch.transformHead} />
        </g>
        <text
          x={280} y={atomY - 10}
          textAnchor="middle"
          fontSize={13}
          fontStyle="italic"
          fontWeight={600}
          fill={svgTokens.caution}
        >
          {t('ch1_1.atomicTransformLabel')}
        </text>

        {/* ── Right: positive ion ──────────────────────────────── */}
        {/* Orbit */}
        <g style={{ color: svgTokens.mutedFg }} opacity={0.7}>
          <RoughPaths paths={sketch.rightOrbit} />
        </g>
        {/* Nucleus (same as neutral) */}
        {renderNucleus(rightX, atomY)}
        {/* Only 2 electrons on orbit — skip angles[2] (upper-right),
            which is the one escaping. Remaining: bottom + upper-left. */}
        {electronAngles.slice(0, 2).map((a, i) =>
          renderElectron(electronAt(rightX, atomY, a), `R-${i}`),
        )}
        {/* Escape arrow */}
        <g style={{ color: svgTokens.note }} opacity={0.85}>
          <RoughPaths paths={sketch.escapeShaft} />
          <RoughPaths paths={sketch.escapeHead} />
        </g>
        {/* The escaped electron — rendered at its new position */}
        {renderElectron(escapedEnd, 'escaped', 0.85)}

        {/* Panel 2 summary */}
        <text
          x={rightX} y={atomY + orbitR + 28}
          textAnchor="middle"
          fontSize={13}
          fill={svgTokens.mutedFg}
        >
          {t('ch1_1.atomicIonFormula')}
        </text>

        {/* ── Legend (bottom) ──────────────────────────────────── */}
        <g transform={`translate(${W / 2 - 150}, ${H - 18})`}>
          {/* Proton */}
          <circle cx={4} cy={0} r={protonR} fill={PROTON_FILL} />
          <text x={4} y={2.2} textAnchor="middle" fontSize={8}
            fontWeight={700} fill={LABEL_BG}>+</text>
          <text x={13} y={3.5} fontSize={13} fill={svgTokens.mutedFg}>
            {t('ch1_1.atomicLegendProton')}
          </text>

          {/* Neutron */}
          <circle cx={110} cy={0} r={protonR} fill={NEUTRON_FILL} />
          <text x={119} y={3.5} fontSize={13} fill={svgTokens.mutedFg}>
            {t('ch1_1.atomicLegendNeutron')}
          </text>

          {/* Electron */}
          <circle cx={200} cy={0} r={electronR} fill={ELECTRON_FILL} />
          <text x={200} y={2.5} textAnchor="middle" fontSize={9}
            fontWeight={700} fill={LABEL_BG}>−</text>
          <text x={209} y={3.5} fontSize={13} fill={svgTokens.mutedFg}>
            {t('ch1_1.atomicLegendElectron')}
          </text>
        </g>
      </SVGDiagram>
    </DiagramFigure>
  )
}
