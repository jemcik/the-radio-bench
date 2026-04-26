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
import { renderLabelContent, renderSvgInlineMath } from '@/lib/circuit/SymbolLabel'
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
}: {
  x0: number
  w: number
  inputSVG: React.ReactNode
  outputSVG: React.ReactNode
}) {
  return (
    <g>
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

/** Trapezoidal current pulse for the SLOW panel: long flat at 0, brief
 *  ramp up to +amp, long flat at +amp, brief ramp back to 0, long flat
 *  at 0 again. Designed to match the panel's caption «...між ними вона
 *  поводиться як провідник» — the long flats are exactly where the
 *  inductor acts as a plain wire (dI/dt = 0 → V = 0). */
function slowPulseCurrentPath(x0: number, xEnd: number, midY: number, amp: number): string {
  const span = xEnd - x0
  const ramp = span * 0.06               // brief transition (6 % of span each)
  const flat = (span - 2 * ramp) / 3     // three equal flat sections
  let t = x0
  let d = `M ${t.toFixed(2)} ${midY.toFixed(2)}`
  t += flat;        d += ` L ${t.toFixed(2)} ${midY.toFixed(2)}`           // flat at 0
  t += ramp;        d += ` L ${t.toFixed(2)} ${(midY - amp).toFixed(2)}`   // ramp up to +amp
  t += flat;        d += ` L ${t.toFixed(2)} ${(midY - amp).toFixed(2)}`   // flat at +amp
  t += ramp;        d += ` L ${t.toFixed(2)} ${midY.toFixed(2)}`           // ramp back to 0
  d += ` L ${xEnd.toFixed(2)} ${midY.toFixed(2)}`                          // final flat at 0
  return d
}

/** Spike-like voltage trace paired with `slowPulseCurrentPath`: V is
 *  zero everywhere EXCEPT during the two ramps, where V is +amp (rising
 *  ramp) and −amp (falling ramp) respectively. The geometry must match
 *  the current path's `ramp` / `flat` proportions exactly so the spikes
 *  align with the ramps above. */
function slowSpikeVoltagePath(x0: number, xEnd: number, midY: number, amp: number): string {
  const span = xEnd - x0
  const ramp = span * 0.06
  const flat = (span - 2 * ramp) / 3
  let t = x0
  let d = `M ${t.toFixed(2)} ${midY.toFixed(2)}`
  t += flat;        d += ` L ${t.toFixed(2)} ${midY.toFixed(2)}`           // V = 0 (initial flat)
  // Positive spike during the rising ramp
  d += ` L ${t.toFixed(2)} ${(midY - amp).toFixed(2)}`                     // jump up
  t += ramp;        d += ` L ${t.toFixed(2)} ${(midY - amp).toFixed(2)}`   // horizontal at +amp
  d += ` L ${t.toFixed(2)} ${midY.toFixed(2)}`                             // jump back to 0
  t += flat;        d += ` L ${t.toFixed(2)} ${midY.toFixed(2)}`           // V = 0 (top flat)
  // Negative spike during the falling ramp
  d += ` L ${t.toFixed(2)} ${(midY + amp).toFixed(2)}`                     // jump down
  t += ramp;        d += ` L ${t.toFixed(2)} ${(midY + amp).toFixed(2)}`   // horizontal at −amp
  d += ` L ${t.toFixed(2)} ${midY.toFixed(2)}`                             // jump back to 0
  d += ` L ${xEnd.toFixed(2)} ${midY.toFixed(2)}`                          // V = 0 (final flat)
  return d
}

/** Square-wave voltage proportional to dI/dt. For a triangle-wave
 *  current, dI/dt is constant within each ramp segment but flips sign
 *  at each peak. The amplitude of V depends on the slope of the input
 *  ramp (= dI/dt).
 *
 *  The triangle current trace runs midY → +pk → −pk → … → ±pk → midY,
 *  with (2·cycles + 1) ramps total: the first and last ramps have
 *  half-width (dx/2) — they're the partial half-period at start/end —
 *  and the middle (2·cycles − 1) ramps have full width (dx). dI/dt has
 *  the same magnitude throughout but flips sign at every peak/valley.
 *
 *  V follows that sign: positive during rising ramps, negative during
 *  falling ramps, starting and ending at +amp (rising ramp). Drawn as
 *  a sequence of (2·cycles + 1) rectangles plus a final vertical drop
 *  back to the baseline at xEnd.
 *
 *  Past bug: the previous version's final segment was `L xEnd midY` —
 *  drawn from the last full-width position (still at ±amp), so it
 *  appeared as a DIAGONAL slope from the last rectangle down to the
 *  baseline. That looked like «the voltage is sloping back to zero»
 *  which contradicts the «V mirrors dI/dt» story we're telling. */
function squareVoltagePath(x0: number, xEnd: number, midY: number, amp: number, cycles: number): string {
  const totalSegs = 2 * cycles
  const dx = (xEnd - x0) / totalSegs

  let d = `M ${x0.toFixed(2)} ${midY.toFixed(2)}`
  let curX = x0

  // 2·cycles + 1 rectangles. Rectangle i has:
  //   width  = dx/2 if i is first or last,  else dx
  //   sign   = positive (above midY) when i is EVEN (0, 2, …), else negative
  // Sign convention: y = midY − amp is visually ABOVE midY (SVG y-axis
  // is inverted), corresponding to V > 0.
  for (let i = 0; i <= totalSegs; i++) {
    const isFirstOrLast = i === 0 || i === totalSegs
    const w = isFirstOrLast ? dx / 2 : dx
    const yRect = i % 2 === 0 ? midY - amp : midY + amp
    // Vertical jump (or initial rise from baseline) to yRect
    d += ` L ${curX.toFixed(2)} ${yRect.toFixed(2)}`
    // Horizontal segment of width w
    curX += w
    d += ` L ${curX.toFixed(2)} ${yRect.toFixed(2)}`
  }
  // Snap back to baseline at xEnd, mirroring the trace's initial rise
  // from baseline at x0.
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
        {/* Single global title — both panels share the same input/output
            channels (top trace = current I, bottom = voltage V), so the
            title is per-diagram, not per-panel. `renderSvgInlineMath`
            turns any <var>X</var> fragments in the i18n string into
            italic <tspan>s. */}
        <text
          x={VB_W / 2} y={22}
          fontFamily="inherit" fontSize="0.875em"
          fontStyle="italic" fontWeight="700"
          fill={svgTokens.fg} textAnchor="middle"
        >
          {renderSvgInlineMath(
            t('ch1_6.blocksVisualInput') + ' / ' + t('ch1_6.blocksVisualOutput'),
          )}
        </text>

        {/* Divider hairline */}
        <line
          x1={HALF_W} y1={32} x2={HALF_W} y2={VB_H - 30}
          stroke={svgTokens.border}
          strokeWidth={0.75}
          strokeDasharray="3 3"
        />

        {/* Slow panel: trapezoidal current pulse (long flats + brief
            transitions). The caption advertises «між ними вона
            поводиться як провідник» — those «між» moments are the
            flats, where dI/dt = 0 and V is exactly zero. The two
            spikes in V land on the two ramps. Spike amplitude matches
            the FAST panel's V height for visual balance. */}
        <Panel
          x0={leftX0}
          w={HALF_W}
          inputSVG={
            <path
              d={slowPulseCurrentPath(leftWaveX0, leftWaveX1, INPUT_MID_Y, INPUT_AMP)}
              stroke={svgTokens.fg}
              strokeWidth={1.4}
              fill="none"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          }
          outputSVG={
            <path
              d={slowSpikeVoltagePath(leftWaveX0, leftWaveX1, OUTPUT_MID_Y, OUTPUT_AMP_BASE * FAST_FACTOR)}
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
