/**
 * Chapter 1.6 — Side-by-side waveforms illustrating the "opposes AC,
 * passes DC" headline for inductors.
 *
 * Left half:  a SLOW triangle-wave current. dI/dt is small, so the
 *             induced voltage across the inductor (V = L·dI/dt) is
 *             also small — small voltage rectangles between the
 *             current ramps. Average opposition: low.
 * Right half: a FAST triangle-wave current with the same amplitude.
 *             dI/dt is much larger, so the induced voltage is much
 *             larger — much taller voltage rectangles. Average
 *             opposition: high.
 *
 * Same inductor, two input frequencies — the point is that the SAME L
 * develops near-zero voltage at low frequency (passes DC, just a wire)
 * and large voltage at high frequency (opposes AC, like a high
 * impedance) purely because dI/dt scales with frequency.
 *
 * Mirror of `BlocksDcPassesAcDiagram` but with the V↔I axes swapped.
 */
import { useTranslation } from 'react-i18next'
import { svgTokens } from './svgTokens'
import { renderLabelContent } from '@/lib/circuit/SymbolLabel'
import { MathText } from '@/components/ui/math-text'

const VB_W = 540
const VB_H = 210
const HALF_W = VB_W / 2

const PANEL_PAD_X = 30
const INPUT_MID_Y = 70
const INPUT_AMP = 26
const OUTPUT_MID_Y = 170
// Output amplitude is computed per-panel based on dI/dt, so the SLOW
// panel's voltage rectangle is visibly smaller than the FAST panel's.
const OUTPUT_AMP_BASE = 10
const FAST_FACTOR = 3 // fast panel V is 3× the slow panel V

const AXIS_LABEL_X_OFFSET = 6

function Panel({
  x0,
  w,
  inputSVG,
  outputSVG,
  title,
}: {
  x0: number
  w: number
  inputSVG: React.ReactNode
  outputSVG: React.ReactNode
  title: string
}) {
  return (
    <g>
      <text
        x={x0 + w / 2} y={22}
        fontFamily="inherit" fontSize="0.875em"
        fontStyle="italic" fontWeight="700"
        fill={svgTokens.fg} textAnchor="middle"
      >
        {title}
      </text>

      {/* Input baseline */}
      <line
        x1={x0 + PANEL_PAD_X} y1={INPUT_MID_Y}
        x2={x0 + w - PANEL_PAD_X} y2={INPUT_MID_Y}
        stroke={svgTokens.border}
        strokeWidth={0.7}
        strokeDasharray="2 3"
      />
      {inputSVG}

      {/* Output baseline */}
      <line
        x1={x0 + PANEL_PAD_X} y1={OUTPUT_MID_Y}
        x2={x0 + w - PANEL_PAD_X} y2={OUTPUT_MID_Y}
        stroke={svgTokens.border}
        strokeWidth={0.7}
        strokeDasharray="2 3"
      />
      {outputSVG}

      {/* Row labels: I (input current) on top, V (output voltage) on bottom. */}
      <text
        x={x0 + PANEL_PAD_X - AXIS_LABEL_X_OFFSET} y={INPUT_MID_Y - INPUT_AMP - 4}
        fontFamily="inherit" fontSize="0.72em"
        fontStyle="italic"
        fill={svgTokens.mutedFg} textAnchor="end" dominantBaseline="central"
      >
        {renderLabelContent('I')}
      </text>
      <text
        x={x0 + PANEL_PAD_X - AXIS_LABEL_X_OFFSET}
        y={OUTPUT_MID_Y - OUTPUT_AMP_BASE * FAST_FACTOR - 4}
        fontFamily="inherit" fontSize="0.72em"
        fontStyle="italic"
        fill={svgTokens.mutedFg} textAnchor="end" dominantBaseline="central"
      >
        {renderLabelContent('V')}
      </text>
    </g>
  )
}

/** Triangle-wave current: rises linearly to +amp, falls to −amp, rises
 *  back. `cycles` controls the number of full periods inside the panel. */
function trianglePath(x0: number, xEnd: number, midY: number, amp: number, cycles: number): string {
  const span = xEnd - x0
  const segPerCycle = 2 // up-then-down per cycle = 2 segments
  const totalSegs = cycles * segPerCycle
  const dx = span / totalSegs
  let d = `M ${x0} ${midY}`
  const yHi = midY - amp
  const yLo = midY + amp
  // Start at midY, go up to yHi over the first half-segment, then alternate.
  // For a clean triangle starting at the baseline going up:
  // segments: midY→yHi over dx/2, yHi→yLo over dx, ... then back down.
  // For simplicity we use a sequence of ramps from extrema:
  // first ramp: midY → yHi (half segment)
  d += ` L ${(x0 + dx / 2).toFixed(2)} ${yHi.toFixed(2)}`
  let cur: 'hi' | 'lo' = 'hi'
  for (let i = 0; i < totalSegs - 1; i++) {
    cur = cur === 'hi' ? 'lo' : 'hi'
    const xi = x0 + dx / 2 + (i + 1) * dx
    const yi = cur === 'hi' ? yHi : yLo
    d += ` L ${xi.toFixed(2)} ${yi.toFixed(2)}`
  }
  // Final tail back to midY at the right edge
  d += ` L ${xEnd.toFixed(2)} ${midY.toFixed(2)}`
  return d
}

/** Square-wave voltage proportional to dI/dt. For a triangle-wave
 *  current, dI/dt is constant within each ramp segment but flips sign
 *  at each peak. The amplitude of V depends on the slope of the input
 *  ramp (= dI/dt). */
function squareVoltagePath(x0: number, xEnd: number, midY: number, amp: number, cycles: number): string {
  const span = xEnd - x0
  const segPerCycle = 2
  const totalSegs = cycles * segPerCycle
  const dx = span / totalSegs
  let d = `M ${x0} ${midY}`
  // First half-segment: I is ramping up (midY → yHi), so dI/dt > 0,
  // so V is positive (above baseline).
  // Within each ramp, V is constant.
  // First segment is half-length (matching the triangle's first half-up).
  let cur: 'pos' | 'neg' = 'pos'
  // First half-segment from x0 to x0 + dx/2 at +amp (V positive)
  d += ` L ${x0.toFixed(2)} ${(midY - amp).toFixed(2)}`
  d += ` L ${(x0 + dx / 2).toFixed(2)} ${(midY - amp).toFixed(2)}`
  // Then a vertical step back to baseline-then-flip
  for (let i = 0; i < totalSegs - 1; i++) {
    cur = cur === 'pos' ? 'neg' : 'pos'
    const yNext = cur === 'pos' ? midY - amp : midY + amp
    const xi = x0 + dx / 2 + i * dx
    const xNext = x0 + dx / 2 + (i + 1) * dx
    // Vertical jump at xi
    d += ` L ${xi.toFixed(2)} ${yNext.toFixed(2)}`
    // Horizontal segment to xNext at yNext
    d += ` L ${xNext.toFixed(2)} ${yNext.toFixed(2)}`
  }
  // Final vertical drop back to midY at xEnd
  d += ` L ${xEnd.toFixed(2)} ${midY.toFixed(2)}`
  return d
}

export default function BlocksAcPassesDcDiagram() {
  const { t } = useTranslation('ui')

  const leftX0 = 0
  const rightX0 = HALF_W

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
        aria-label={t('ch1_6.blocksVisualAria')}
        style={{ display: 'block', maxWidth: 640, margin: '0 auto' }}
      >
        {/* Divider hairline */}
        <line
          x1={HALF_W} y1={12} x2={HALF_W} y2={VB_H - 30}
          stroke={svgTokens.border}
          strokeWidth={0.75}
          strokeDasharray="3 3"
        />

        {/* Slow panel: 1 cycle, small dI/dt, small V output */}
        <Panel
          x0={leftX0}
          w={HALF_W}
          title={t('ch1_6.blocksVisualInput') + ' / ' + t('ch1_6.blocksVisualOutput')}
          inputSVG={
            <path
              d={trianglePath(leftWaveX0, leftWaveX1, INPUT_MID_Y, INPUT_AMP, 1)}
              stroke={svgTokens.fg}
              strokeWidth={1.4}
              fill="none"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          }
          outputSVG={
            <path
              d={squareVoltagePath(leftWaveX0, leftWaveX1, OUTPUT_MID_Y, OUTPUT_AMP_BASE, 1)}
              stroke={svgTokens.fg}
              strokeWidth={1.4}
              fill="none"
              strokeLinejoin="round"
              strokeLinecap="round"
              opacity={0.85}
            />
          }
        />

        {/* Fast panel: 3 cycles, same I amplitude → 3× steeper dI/dt → 3× V */}
        <Panel
          x0={rightX0}
          w={HALF_W}
          title={t('ch1_6.blocksVisualInput') + ' / ' + t('ch1_6.blocksVisualOutput')}
          inputSVG={
            <path
              d={trianglePath(rightWaveX0, rightWaveX1, INPUT_MID_Y, INPUT_AMP, 3)}
              stroke={svgTokens.fg}
              strokeWidth={1.4}
              fill="none"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          }
          outputSVG={
            <path
              d={squareVoltagePath(rightWaveX0, rightWaveX1, OUTPUT_MID_Y, OUTPUT_AMP_BASE * FAST_FACTOR, 3)}
              stroke={svgTokens.fg}
              strokeWidth={1.4}
              fill="none"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          }
        />
      </svg>

      <figcaption className="mt-2 grid grid-cols-2 gap-x-6 text-[12px] italic text-muted-foreground max-w-[640px] mx-auto px-2">
        <span className="text-center"><MathText>{t('ch1_6.blocksVisualSlow')}</MathText></span>
        <span className="text-center"><MathText>{t('ch1_6.blocksVisualFast')}</MathText></span>
      </figcaption>
    </figure>
  )
}
