/**
 * Chapter 1.10 §5 — Zener I–V curve, both quadrants.
 *
 * Static diagram showing the full Zener I–V characteristic from reverse
 * breakdown on the left to forward conduction on the right. Three labelled
 * regions:
 *
 *   – Forward bias (right): looks just like an ordinary silicon diode,
 *     ≈ 0.7 V knee, then steep climb.
 *   – Reverse bias near zero (centre): a wide flat near-zero region — the
 *     diode looks like an open switch.
 *   – Reverse breakdown (left): below the Zener voltage V_Z (≈ −5.1 V in
 *     this illustration, a 5.1 V Zener), the curve takes a sharp downward
 *     turn. The voltage stays nearly fixed at V_Z over a wide range of
 *     currents — that flat «cliff» is what makes a Zener useful as a
 *     reference.
 *
 * Pure SVG (axes + curve) — no interactive widget; the goal is to plant
 * the *shape* of the Zener curve in the reader's head, alongside the
 * regulator schematic.
 */
import { Trans } from 'react-i18next'
import DiagramFigure from './DiagramFigure'
import SVGDiagram from './SVGDiagram'
import { svgTokens } from './svgTokens'
import { MathVar } from '@/components/ui/math'

const VB_W = 540
const VB_H = 280

const PAD_L = 56
const PAD_R = 16
const PAD_T = 22
const PAD_B = 38

const PLOT_X0 = PAD_L
const PLOT_Y0 = PAD_T
const PLOT_W = VB_W - PAD_L - PAD_R
const PLOT_H = VB_H - PAD_T - PAD_B

// V axis: −7 to +1.5 V so the breakdown «cliff» at −5.1 V and the
// forward knee at ~+0.7 V are both visible.
const V_MIN = -7
const V_MAX = 1.5

// I axis: −20 to +20 mA; symmetric so the curve is centred about
// the V axis line. Reverse-breakdown current is negative on this scale.
const I_MIN = -20
const I_MAX = 20

const V_Z = 5.1 // Zener breakdown voltage in V

function vToX(v: number) {
  return PLOT_X0 + ((v - V_MIN) / (V_MAX - V_MIN)) * PLOT_W
}
function iMaToY(i: number) {
  return PLOT_Y0 + PLOT_H - ((i - I_MIN) / (I_MAX - I_MIN)) * PLOT_H
}

const X_TICKS = [-7, -6, -5, -4, -3, -2, -1, 0, 1]
const Y_TICKS_MA = [-20, -10, 0, 10, 20]

/* Build a piecewise approximation: */
function curvePath(): string {
  const samples: Array<{ v: number; iMa: number }> = []
  // Forward: above 0.5 V the curve climbs quasi-exponentially (use a soft
  // ramp so it leaves the chart cleanly).
  for (let v = V_MAX; v >= 0; v -= 0.05) {
    let iMa = 0
    if (v > 0.5) {
      // Rough Shockley-like rise; calibrated so V=0.7 gives I≈3 mA, V=1.0 gives I≈20+ mA.
      iMa = 0.001 * Math.exp((v - 0) / 0.06)
    }
    samples.push({ v, iMa })
  }
  // Around 0 V: I ≈ 0.
  for (let v = 0; v >= -V_Z + 0.3; v -= 0.1) {
    samples.push({ v, iMa: 0 })
  }
  // Breakdown corner: smooth knee from V = -V_Z + 0.3 down to V = -V_Z - 0.05
  // where current ramps from 0 to a large negative value.
  for (let v = -V_Z + 0.3; v >= -V_Z - 0.05; v -= 0.05) {
    const t = (-V_Z + 0.3 - v) / 0.35 // 0..1
    const iMa = -t * t * 18 // quadratic ramp, hits ≈ −18 mA at the corner
  samples.push({ v, iMa })
  }
  // Past the corner: vertical-ish drop. Sample very fine V so the line
  // is steep but smooth.
  for (let v = -V_Z - 0.05; v >= V_MIN; v -= 0.05) {
    const t = (-V_Z - 0.05 - v) / Math.abs(V_MIN - (-V_Z - 0.05)) // 0..1
    // Voltage barely changes; current grows linearly past the corner.
    const iMa = -18 - t * 8 // from −18 to −26 mA over the cliff (clipped at chart bottom)
    samples.push({ v, iMa })
  }
  // Build path; clip iMa to chart range so the line truncates cleanly.
  const sorted = samples.slice().sort((a, b) => a.v - b.v) // left-to-right
  let d = ''
  let first = true
  for (const s of sorted) {
    const x = vToX(s.v)
    const iClipped = Math.max(I_MIN, Math.min(I_MAX, s.iMa))
    const y = iMaToY(iClipped)
    d += first ? `M${x.toFixed(2)} ${y.toFixed(2)}` : ` L${x.toFixed(2)} ${y.toFixed(2)}`
    first = false
  }
  return d
}

export default function ZenerIVCurve() {
  const path = curvePath()
  const xZero = vToX(0)
  const yZero = iMaToY(0)
  const xVz = vToX(-V_Z)

  return (
    <DiagramFigure
      caption={
        <Trans
          i18nKey="ch1_10.zenerIvCaption"
          ns="ui"
          components={{ var: <MathVar />, strong: <strong /> }}
        />
      }
    >
      <SVGDiagram
        width={VB_W}
        height={VB_H}
        aria-label="Zener diode I–V curve. Forward bias rises steeply past 0.7 V; reverse bias is near zero until the breakdown voltage V_Z, where the curve drops near-vertically — the useful regulating region."
      >
        {/* Gridlines (light) */}
        <g stroke={svgTokens.border} strokeWidth={0.5} opacity={0.5}>
          {X_TICKS.filter(v => v !== 0).map(v => (
            <line key={`gx${v}`} x1={vToX(v)} y1={PLOT_Y0} x2={vToX(v)} y2={PLOT_Y0 + PLOT_H} />
          ))}
          {Y_TICKS_MA.filter(i => i !== 0).map(i => (
            <line key={`gy${i}`} x1={PLOT_X0} y1={iMaToY(i)} x2={PLOT_X0 + PLOT_W} y2={iMaToY(i)} />
          ))}
        </g>

        {/* Highlight band over the Zener-breakdown region (vertical strip
            around V = −V_Z, on the left side of the chart) */}
        <rect
          x={vToX(-V_Z - 1.5)}
          y={PLOT_Y0}
          width={vToX(-V_Z + 0.6) - vToX(-V_Z - 1.5)}
          height={PLOT_H}
          fill={svgTokens.experiment}
          opacity={0.10}
        />

        {/* V axis (horizontal through I = 0) */}
        <line
          x1={PLOT_X0} y1={yZero} x2={PLOT_X0 + PLOT_W} y2={yZero}
          stroke={svgTokens.fg} strokeWidth={1}
        />
        {/* I axis (vertical through V = 0) */}
        <line
          x1={xZero} y1={PLOT_Y0} x2={xZero} y2={PLOT_Y0 + PLOT_H}
          stroke={svgTokens.fg} strokeWidth={1}
        />

        {/* X-tick labels (skip 0) */}
        <g
          fill={svgTokens.mutedFg}
          fontSize="13"
          fontFamily="ui-sans-serif, system-ui, sans-serif"
        >
          {X_TICKS.filter(v => v !== 0).map(v => (
            <text key={`tx${v}`} x={vToX(v)} y={yZero + 16} textAnchor="middle">
              {v}
            </text>
          ))}
          {Y_TICKS_MA.filter(i => i !== 0).map(i => (
            <text key={`ty${i}`} x={xZero - 6} y={iMaToY(i) + 4} textAnchor="end">
              {i}
            </text>
          ))}
        </g>

        {/* Axis titles */}
        <text
          x={PLOT_X0 + PLOT_W - 4}
          y={yZero - 6}
          fontSize="14"
          fontStyle="italic"
          fontFamily="Georgia, serif"
          fill={svgTokens.fg}
          textAnchor="end"
        >
          V (V)
        </text>
        <text
          x={xZero + 8}
          y={PLOT_Y0 + 12}
          fontSize="14"
          fontStyle="italic"
          fontFamily="Georgia, serif"
          fill={svgTokens.fg}
        >
          I (mA)
        </text>

        {/* Curve */}
        <path
          d={path}
          fill="none"
          stroke={svgTokens.primary}
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Labelled marker at V = −V_Z */}
        <line
          x1={xVz}
          y1={iMaToY(0)}
          x2={xVz}
          y2={iMaToY(-18)}
          stroke={svgTokens.experiment}
          strokeWidth={1}
          strokeDasharray="3 3"
          opacity={0.7}
        />
        <text
          x={xVz}
          y={iMaToY(-18) - 4}
          fontSize="13"
          fontWeight={600}
          fontFamily="Georgia, serif"
          fill={svgTokens.fg}
          textAnchor="middle"
        >
          <tspan>−</tspan>
          <tspan fontStyle="italic">V</tspan>
          <tspan dy="3" fontSize="10" fontStyle="normal">Z</tspan>
        </text>

        {/* Region labels */}
        <text
          x={vToX(0.7)}
          y={iMaToY(15)}
          fontSize="13"
          fill={svgTokens.mutedFg}
          textAnchor="start"
          fontFamily="ui-sans-serif, system-ui, sans-serif"
        >
          forward
        </text>
        <text
          x={vToX(-2.5)}
          y={iMaToY(2.5)}
          fontSize="13"
          fill={svgTokens.mutedFg}
          textAnchor="middle"
          fontFamily="ui-sans-serif, system-ui, sans-serif"
        >
          off (reverse, no current)
        </text>
        <text
          x={vToX(-V_Z - 0.7)}
          y={iMaToY(-7)}
          fontSize="13"
          fontWeight={600}
          fill={svgTokens.experiment}
          textAnchor="middle"
          fontFamily="ui-sans-serif, system-ui, sans-serif"
        >
          breakdown — regulating
        </text>
      </SVGDiagram>
    </DiagramFigure>
  )
}
