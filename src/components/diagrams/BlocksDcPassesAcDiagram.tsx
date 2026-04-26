/**
 * Chapter 1.5 — Side-by-side waveforms illustrating the "blocks DC,
 * passes AC" headline.
 *
 * Left half:  a SLOW square wave fed into an RC network. The output
 *             (voltage across C) settles to the time-averaged DC level —
 *             the fast edges get smoothed out because τ ≫ period.
 * Right half: a FAST square wave fed into the same RC network. Now
 *             τ ≪ period, so the capacitor is effectively a short to AC
 *             and the output closely tracks the input.
 *
 * Same two RC values, two input frequencies — the point is that the
 * SAME capacitor behaves like an open circuit (to DC and very slow
 * signals) and like a short circuit (to fast signals), purely because
 * dV/dt scales with frequency.
 *
 * Rendered as clean SVG with programmatically-computed traces so the
 * curvature of the output exponentials is physically correct (not
 * hand-drawn). Ticks and grid are kept sparse — this is a transition
 * figure, not a plot to read values off.
 */
import { useTranslation } from 'react-i18next'
import { svgTokens } from './svgTokens'
import { renderLabelContent, renderSvgInlineMath } from '@/lib/circuit/SymbolLabel'
import { MathText } from '@/components/ui/math-text'

const VB_W = 540
// Captions now live in HTML under the SVG (see the return JSX), so the
// viewBox is cropped tight to the plot area — no more 30-px empty strip
// under the lower trace.
const VB_H = 210
const HALF_W = VB_W / 2

/* Per-panel geometry (left and right use the same layout) */
const PANEL_PAD_X = 30
const INPUT_MID_Y = 70
const INPUT_AMP = 26
const OUTPUT_MID_Y = 170
const OUTPUT_AMP = 26

const AXIS_LABEL_X_OFFSET = 6

/* Build one panel (input on top, output on bottom). The panel occupies
 * the horizontal span [x0, x0 + w]. */
function Panel({
  x0,
  w,
  inputSVG,
  outputSVG,
  idSuffix,
}: {
  x0: number
  w: number
  inputSVG: React.ReactNode
  outputSVG: React.ReactNode
  idSuffix: string
}) {
  const inputBaselineY = INPUT_MID_Y
  const outputBaselineY = OUTPUT_MID_Y
  return (
    <g>
      {/* Input baseline (reference) */}
      <line
        x1={x0 + PANEL_PAD_X} y1={inputBaselineY}
        x2={x0 + w - PANEL_PAD_X} y2={inputBaselineY}
        stroke={svgTokens.border}
        strokeWidth={0.7}
        strokeDasharray="2 3"
      />
      {inputSVG}

      {/* Output baseline */}
      <line
        x1={x0 + PANEL_PAD_X} y1={outputBaselineY}
        x2={x0 + w - PANEL_PAD_X} y2={outputBaselineY}
        stroke={svgTokens.border}
        strokeWidth={0.7}
        strokeDasharray="2 3"
      />
      {outputSVG}

      {/* Row labels — V_in / V_out with proper baseline-shifted
       *  subscripts via the shared `renderLabelContent` helper. The
       *  <text> is italic (matches math convention for variables);
       *  the helper's subscript <tspan> overrides to upright, matching
       *  how HTML <sub> renders in the prose. */}
      <text
        x={x0 + PANEL_PAD_X - AXIS_LABEL_X_OFFSET} y={inputBaselineY - INPUT_AMP - 4}
        fontFamily="inherit" fontSize="0.72em"
        fontStyle="italic"
        fill={svgTokens.mutedFg} textAnchor="end" dominantBaseline="central"
      >
        {renderLabelContent('V_in')}
      </text>
      <text
        x={x0 + PANEL_PAD_X - AXIS_LABEL_X_OFFSET} y={outputBaselineY - OUTPUT_AMP - 4}
        fontFamily="inherit" fontSize="0.72em"
        fontStyle="italic"
        fill={svgTokens.mutedFg} textAnchor="end" dominantBaseline="central"
      >
        {renderLabelContent('V_out')}
      </text>

      {/* Captions are rendered as HTML under the SVG (see the parent
       * component) — keeping them in SVG forced them to fit inside a
       * 270-px panel width, which long UA captions overflow. The HTML
       * version wraps naturally.
       *
       * Keep the `idSuffix` hook so tests / future CSS can still target
       * each half. */}
      <g data-panel={idSuffix} />
    </g>
  )
}

/** Build a slow square wave as a polyline path: one full period
 *  that fits in the panel, high for the first half, low for the second. */
function slowSquarePath(x0: number, xEnd: number, midY: number, amp: number): string {
  // One full period. Transitions are drawn sharp (vertical segments).
  const xMid = (x0 + xEnd) / 2
  const yHi = midY - amp
  const yLo = midY + amp
  return `M ${x0} ${yHi} L ${xMid} ${yHi} L ${xMid} ${yLo} L ${xEnd} ${yLo}`
}

/** Build a fast square wave: four periods inside the panel. */
function fastSquarePath(x0: number, xEnd: number, midY: number, amp: number): string {
  const yHi = midY - amp
  const yLo = midY + amp
  const periods = 4
  const step = (xEnd - x0) / (periods * 2)
  let d = `M ${x0} ${yHi}`
  let y = yHi
  for (let i = 1; i <= periods * 2; i++) {
    const x = x0 + i * step
    // Horizontal segment to x, then vertical flip (unless last).
    d += ` L ${x} ${y}`
    if (i !== periods * 2) {
      y = y === yHi ? yLo : yHi
      d += ` L ${x} ${y}`
    }
  }
  return d
}

/** Build the high-pass RC output when period ≫ τ (slow input):
 *
 *   - Left half (input held HIGH and has been high for a long time):
 *     the cap is fully charged against it, so V_out = 0 (flat at the
 *     baseline).
 *   - At xMid (input steps HIGH→LOW): the cap can't change its
 *     voltage instantly, so the full input change appears across R.
 *     V_out jumps down by the input amplitude.
 *   - Right half: exponential recovery back to 0 with time constant
 *     τ ≪ half-period, so by the right edge the output has settled
 *     (visually ≈ 0).
 *
 *  This is the derivative-like «spike + decay» response that justifies
 *  the caption «V_out settles near zero — blocks DC».
 */
function slowRcOutputPath(x0: number, xEnd: number, midY: number, amp: number): string {
  const xMid = (x0 + xEnd) / 2
  // Left half: steady-state flat at the baseline.
  let d = `M ${x0} ${midY} L ${xMid} ${midY}`
  // Vertical drop at the input transition (instantaneous jump through C).
  d += ` L ${xMid} ${midY + amp}`
  // Exponential recovery. Pick τ so 5τ ≈ right-half span → visibly
  // back to baseline by the right edge (matches the «settles» claim).
  const N = 40
  const halfSpan = xEnd - xMid
  const tau = halfSpan / 5
  for (let i = 1; i <= N; i++) {
    const t = (i / N) * halfSpan
    const x = xMid + t
    const y = midY + amp * Math.exp(-t / tau)
    d += ` L ${x.toFixed(2)} ${y.toFixed(2)}`
  }
  return d
}

/** Build the high-pass RC output when period ≪ τ (fast input):
 *
 *  The capacitor passes each input step through unchanged (at high
 *  frequency its impedance is much smaller than R), so the output
 *  steps vertically in sync with the input. The residual τ-induced
 *  droop within each half-period is negligible at this frequency
 *  ratio and we elide it to keep the pedagogy crisp — the take-away
 *  is «V_out = V_in with the DC removed», which for a symmetric
 *  ±amp square wave is just V_in.
 *
 *  Visually this looks almost identical to the V_in trace above, on
 *  purpose: that IS the point of «passes AC».
 */
function fastRcOutputPath(x0: number, xEnd: number, midY: number, amp: number): string {
  const yHi = midY - amp
  const yLo = midY + amp
  const periods = 4
  const stepX = (xEnd - x0) / (periods * 2)
  let y = yHi
  let d = `M ${x0.toFixed(2)} ${y.toFixed(2)}`
  for (let i = 1; i <= periods * 2; i++) {
    const xi = x0 + i * stepX
    // Flat segment at the current level …
    d += ` L ${xi.toFixed(2)} ${y.toFixed(2)}`
    // … then a sharp vertical jump to the opposite level at each
    // transition except the last (the trace just ends at the right
    // edge of the panel).
    if (i !== periods * 2) {
      const newY = y === yHi ? yLo : yHi
      d += ` L ${xi.toFixed(2)} ${newY.toFixed(2)}`
      y = newY
    }
  }
  return d
}

export default function BlocksDcPassesAcDiagram() {
  const { t } = useTranslation('ui')

  const leftX0 = 0
  const rightX0 = HALF_W

  // Inner span (input waveform horizontal extent) for each panel
  const leftWaveX0 = leftX0 + PANEL_PAD_X
  const leftWaveX1 = leftX0 + HALF_W - PANEL_PAD_X
  const rightWaveX0 = rightX0 + PANEL_PAD_X
  const rightWaveX1 = rightX0 + HALF_W - PANEL_PAD_X

  return (
    <figure className="my-6 not-prose">
      <svg
        width="100%"
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        role="img"
        aria-label={t('ch1_5.blocksVisualAria')}
        style={{ display: 'block', maxWidth: 640, margin: '0 auto' }}
      >
        {/* Single global title — both panels share the same input/output
            channels (top trace = input, bottom = output), so the title
            is per-diagram, not per-panel. `renderSvgInlineMath` turns
            any <var>X</var> fragments in the i18n string into italic
            <tspan>s. */}
        <text
          x={VB_W / 2} y={22}
          fontFamily="inherit" fontSize="0.875em"
          fontStyle="italic" fontWeight="700"
          fill={svgTokens.fg} textAnchor="middle"
        >
          {renderSvgInlineMath(
            t('ch1_5.blocksVisualInput') + ' / ' + t('ch1_5.blocksVisualOutput'),
          )}
        </text>

        {/* Divider hairline */}
        <line
          x1={HALF_W} y1={32} x2={HALF_W} y2={VB_H - 30}
          stroke={svgTokens.border}
          strokeWidth={0.75}
          strokeDasharray="3 3"
        />

        <Panel
          x0={leftX0}
          w={HALF_W}
          idSuffix="slow"
          inputSVG={
            <path
              d={slowSquarePath(leftWaveX0, leftWaveX1, INPUT_MID_Y, INPUT_AMP)}
              stroke={svgTokens.fg}
              strokeWidth={1.4}
              fill="none"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          }
          outputSVG={
            <path
              d={slowRcOutputPath(leftWaveX0, leftWaveX1, OUTPUT_MID_Y, OUTPUT_AMP)}
              stroke={svgTokens.fg}
              strokeWidth={1.4}
              fill="none"
              strokeLinejoin="round"
              strokeLinecap="round"
              opacity={0.85}
            />
          }
        />

        <Panel
          x0={rightX0}
          w={HALF_W}
          idSuffix="fast"
          inputSVG={
            <path
              d={fastSquarePath(rightWaveX0, rightWaveX1, INPUT_MID_Y, INPUT_AMP)}
              stroke={svgTokens.fg}
              strokeWidth={1.4}
              fill="none"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          }
          outputSVG={
            <path
              d={fastRcOutputPath(rightWaveX0, rightWaveX1, OUTPUT_MID_Y, OUTPUT_AMP)}
              stroke={svgTokens.fg}
              strokeWidth={1.4}
              fill="none"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          }
        />
      </svg>

      {/* Captions for the two panels, rendered as HTML so long UA
       * text can wrap naturally inside the 50 % column width. */}
      <figcaption className="mt-2 grid grid-cols-2 gap-x-6 text-[12px] italic text-muted-foreground max-w-[640px] mx-auto px-2">
        <span className="text-center"><MathText>{t('ch1_5.blocksVisualSlow')}</MathText></span>
        <span className="text-center"><MathText>{t('ch1_5.blocksVisualFast')}</MathText></span>
      </figcaption>
    </figure>
  )
}
