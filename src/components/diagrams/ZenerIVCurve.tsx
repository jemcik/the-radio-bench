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
import { Trans, useTranslation } from 'react-i18next'
import DiagramFigure from './DiagramFigure'
import { svgTokens } from './svgTokens'
import { MathVar } from '@/components/ui/math'
import { useUnitFormatter } from '@/lib/hooks/useLocaleFormatter'
import { withSubscriptsSvg } from '@/lib/text-with-subscripts'

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

// X_TICKS deliberately omits −5: that position is dominated by the
// dashed V_Z marker at V = −V_Z = −5.1, and the tick label sat directly
// in the path of both the marker line AND the cliff portion of the
// curve. Letting V_Z own that x position keeps the chart readable.
const X_TICKS = [-7, -6, -4, -3, -2, -1, 0, 1]
// Y_TICKS_MA omits the +20 mark: that label sat at y≈15..29, directly
// in the path of the «I (mA)» axis title above the plot (real bbox
// y=4..20). The scale is unambiguous from the −20 / −10 / +10 ticks,
// and dropping the redundant top tick removes the only remaining
// label-on-label overlap. Same trick as removing −5 below for the
// V_Z marker.
const Y_TICKS_MA = [-20, -10, 0, 10]

/* Build a piecewise approximation: */
function curvePath(): string {
  const samples: Array<{ v: number; iMa: number }> = []
  // Forward: above 0.5 V the curve climbs quasi-exponentially (Shockley-
  // like rise). The exponential is intentionally aggressive — at V=0.7
  // it already evaluates well past the chart's I_MAX=20 mA, so the
  // sample-and-clip pipeline below produces a clean vertical segment
  // that exits the top of the chart at V≈0.6, exactly the visual we
  // want for a forward-conducting diode knee.
  for (let v = V_MAX; v >= 0; v -= 0.05) {
    let iMa = 0
    if (v > 0.5) {
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

/** Render a tick value as a string with a true Unicode minus (U+2212)
 *  for negatives instead of an ASCII hyphen-minus. The rest of the
 *  diagram (e.g. the −V_Z marker label) already uses U+2212; this keeps
 *  axis ticks typographically consistent. */
const fmtTick = (n: number): string =>
  n < 0 ? `−${Math.abs(n)}` : `${n}`

export default function ZenerIVCurve() {
  const { t } = useTranslation('ui')
  const tUnit = useUnitFormatter()
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
      <svg
        width={VB_W}
        height={VB_H}
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        role="img"
        aria-label={t('ch1_10.zenerIvAria')}
        style={{ display: 'block', margin: '0 auto', maxWidth: '100%', height: 'auto', fontSize: '1rem' }}
        xmlns="http://www.w3.org/2000/svg"
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

        {/* X-tick labels (skip 0). Use Unicode minus (U+2212) for
            negatives instead of ASCII hyphen-minus so the typography
            matches the −V_Z marker label below. */}
        <g
          fill={svgTokens.mutedFg}
          fontSize={svgTokens.font.tickLabel}
          fontFamily="ui-sans-serif, system-ui, sans-serif"
        >
          {X_TICKS.filter(v => v !== 0).map(v => (
            <text key={`tx${v}`} x={vToX(v)} y={yZero + 16} textAnchor="middle">
              {fmtTick(v)}
            </text>
          ))}
          {Y_TICKS_MA.filter(i => i !== 0).map(i => (
            <text key={`ty${i}`} x={xZero - 6} y={iMaToY(i) + 4} textAnchor="end">
              {fmtTick(i)}
            </text>
          ))}
        </g>

        {/* Axis titles
            ────────────
            Variable name (V / I) is invariant across locales — italic
            Latin-style letter, baked into JSX. The unit symbol comes
            from `tUnit()` so UA readers see «(В)» / «(мА)» while EN
            sees «(V)» / «(mA)».

            Position:
            • V-axis title sits at the right end of the V-axis line, just
              above it. Forward curve at this x-range (V > 1) is clipped
              at I_MAX and runs along y=PLOT_Y0 — about 100 px above the
              V-axis. No overlap.
            • I-axis title sits ABOVE the plot, centred on the I-axis,
              within the PAD_T padding strip. Anchor='middle'. Putting it
              inside the plot at the top would intersect the forward-
              curve clip segment that runs along the top edge — the bug
              the user flagged. */}
        <text
          x={PLOT_X0 + PLOT_W - 4}
          y={yZero - 6}
          fontSize={svgTokens.font.axisLabel}
          fontFamily="ui-sans-serif, system-ui, sans-serif"
          fill={svgTokens.fg}
          textAnchor="end"
        >
          <tspan fontStyle="italic" fontFamily="Georgia, serif">V</tspan>
          {` (${tUnit('v')})`}
        </text>
        <text
          x={xZero}
          y={PLOT_Y0 - 6}
          fontSize={svgTokens.font.axisLabel}
          fontFamily="ui-sans-serif, system-ui, sans-serif"
          fill={svgTokens.fg}
          textAnchor="middle"
        >
          <tspan fontStyle="italic" fontFamily="Georgia, serif">I</tspan>
          {` (${tUnit('ma')})`}
        </text>

        {/* Curve */}
        <path
          d={path}
          fill="none"
          stroke={svgTokens.primary}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Labelled marker at V = −V_Z
            ───────────────────────────
            Dashed line traces from V-axis (I=0) DOWN to the corner of
            the cliff. Label sits to the RIGHT of the dashed line, in
            the empty region between the V-axis (y=yZero) and the chart
            bottom — the cliff itself runs at the SAME x as the dashed
            line, so a centred label there would be skewered by both
            the line and the curve (the bug the user flagged). Putting
            the label start ~10 px right of xVz and below the V-axis
            keeps it clear of every nearby graphical element.

            Subscript uses withSubscriptsSvg so that V_Z renders with a
            real <tspan baseline-shift="sub"> — same treatment we apply
            elsewhere for `<var>X_y</var>`-style labels. */}
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
          x={xVz + 8}
          y={iMaToY(-16)}
          fontSize={svgTokens.font.axisLabel}
          fontWeight={600}
          fontStyle="italic"
          fontFamily="Georgia, serif"
          fill={svgTokens.fg}
          textAnchor="start"
        >
          {withSubscriptsSvg(t('ch1_10.zenerIvVzMarker'))}
        </text>

        {/* Region labels
            ─────────────
            Each label is positioned in the empty space of its region so
            that no curve / axis / dashed-line passes through the text.

            • «forward» (right side of plot, positive V): the forward
              curve goes vertical at V≈0.6 then clips along the top edge.
              Place label in quadrant 4 (positive V, NEGATIVE I) at
              y=iMaToY(−5), to the right of the I-axis but well clear of
              the vertical jump and the top-edge clip. Anchor='start' at
              x=vToX(0.4) so the text reads left-to-right starting just
              right of the I-axis.

            • «off (reverse, no current)» — labels the wide flat region
              along the V-axis between V=−V_Z and V=0 where the curve
              sits at I≈0. Place label clearly above the V-axis (the
              flat region), well clear of the dashed V_Z marker that
              stands at xVz on the left side of this region.

            • «breakdown — regulating» — the dashed V_Z marker stands at
              xVz inside the breakdown region. A single-line label centred
              on the highlight band would be skewered by the dashed line
              (the bug the user flagged). Render as TWO LINES centred
              well left of xVz so the label box stops before reaching
              the dashed line. */}
        {/* «forward» sits in quadrant 4 (positive V, negative I) at
            iMaToY(-8) — far enough below the V-axis to clear the V=1
            tick label above it. iMaToY(-5) put the label box top at
            y=148, which overlapped the bottom of the V=1 tick label
            at y=137..150 by 2 px. Caught by the text-vs-text check
            in diagram-text-overlap.test.tsx. */}
        <text
          x={vToX(0.4)}
          y={iMaToY(-8)}
          fontSize={svgTokens.font.axisLabel}
          fill={svgTokens.mutedFg}
          textAnchor="start"
          fontFamily="ui-sans-serif, system-ui, sans-serif"
        >
          {t('ch1_10.zenerIvForwardLabel')}
        </text>
        <text
          x={vToX(-2.5)}
          y={iMaToY(4)}
          fontSize={svgTokens.font.axisLabel}
          fill={svgTokens.mutedFg}
          textAnchor="middle"
          fontFamily="ui-sans-serif, system-ui, sans-serif"
        >
          {t('ch1_10.zenerIvOffLabel')}
        </text>
        {/* Breakdown label: moved DOWN to iMaToY(-12) so the gap
            between «пробій —» line 1 and «стабілізація» line 2 no
            longer aligns with the V=−6 tick label at y=148.
            iMaToY(-4)=142 put line 1 at the same y row as the −6 tick
            (which sits at y≈137..150), and the «−6» glyph fell into
            the inter-line gap at x=104..118 — visually overlapping
            line 1 from x=66..145. Caught by the text-vs-text check.
            iMaToY(-12)=198 keeps the label inside the highlight band
            and clear of every other label / tick. */}
        <text
          x={vToX(-V_Z - 1.0)}
          y={iMaToY(-12)}
          fontSize={svgTokens.font.axisLabel}
          fontWeight={600}
          fill={svgTokens.experiment}
          textAnchor="middle"
          fontFamily="ui-sans-serif, system-ui, sans-serif"
        >
          <tspan x={vToX(-V_Z - 1.0)}>{t('ch1_10.zenerIvBreakdownLabel1')}</tspan>
          <tspan x={vToX(-V_Z - 1.0)} dy="14">{t('ch1_10.zenerIvBreakdownLabel2')}</tspan>
        </text>
      </svg>
    </DiagramFigure>
  )
}
