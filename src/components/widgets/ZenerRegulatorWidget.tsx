/**
 * Chapter 1.10 §5 — Interactive Zener regulator + I–V chart.
 *
 * Replaces the static `ZenerIVCurve` diagram. Reader controls four
 * inputs and watches three places update simultaneously:
 *
 *   • Slider V_in            — supply voltage (0..15 V)
 *   • Slider R_s             — series resistor (100 Ω..5 kΩ, log)
 *   • Selector zener type    — 5.1 V / 9.1 V / 12 V (each with its
 *                              own r_z and power rating)
 *   • Toggle + slider R_L    — optional load resistor (100 Ω..100 kΩ, log)
 *
 * Three live panes:
 *   1. Schematic with live numerical labels at each component.
 *   2. I–V chart (zoomed onto the regulating region) with the static
 *      Zener curve, the dynamic load line, and the operating point at
 *      their intersection.
 *   3. ResultBox with formulas + numbers + warnings.
 *
 * Why this works as the central pedagogical tool of the section:
 *
 *   • The 100× attenuation of supply variation becomes GEOMETRICALLY
 *     visible — the load line slides horizontally with V_in, the
 *     intersection ovens up the near-vertical Zener curve, ΔV_Z is
 *     visibly tiny vs the ΔV_in slider drag.
 *
 *   • "V_in must be larger than V_Z" becomes self-evident — drop V_in
 *     below V_Z0 and the load line entirely misses the breakdown
 *     region; operating point falls onto the OFF region (I=0), and
 *     the schematic readout shows V_Z = V_in · R_L / (R_s + R_L) with
 *     a "regulator dropped out" warning.
 *
 *   • R_s sizing becomes discoverable — too small → high I_Z → P_Z
 *     past 0.5 W with a power warning; too large → I_Z under the
 *     knee minimum with a "below regulating range" warning.
 *
 *   • Load line concept (KVL applied to the resistor) gets
 *     introduced visually here, ready to be reused for transistor
 *     biasing in later chapters.
 *
 * Math model is in `computeOperatingPoint` below; sketches the
 * regulating-mode + dropout-mode formulas explicitly. Tested in
 * `ZenerRegulatorWidget.test.tsx`.
 */
import { useId, useMemo, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import Widget from '@/components/ui/widget'
import { Slider } from '@/components/ui/slider'
import { ResultBox } from '@/components/ui/result-box'
import { useLocaleFormatter, useUnitFormatter } from '@/lib/hooks/useLocaleFormatter'
import { formatDecimal } from '@/lib/format'
import { withSubscripts } from '@/lib/text-with-subscripts'
import { svgTokens } from '@/components/diagrams/svgTokens'
import {
  Circuit,
  Wire,
  Junction,
  Resistor,
  Battery,
  pins2,
} from '@/lib/circuit'
import { DiodeZener } from '@/lib/circuit/symbols/semiconductors'
import { G } from '@/features/glossary/glossary-term'
import { MathVar } from '@/components/ui/math'

/* ── Zener spec table ──────────────────────────────────────────────
   Three preset Zener types covering common breakdown voltages. r_z
   values are typical datasheet figures at the rated test current. */

interface ZenerSpec {
  id: 'v5_1' | 'v9_1' | 'v12'
  v_z0: number   // nominal V_Z (V)
  r_z:  number   // dynamic resistance (Ω)
  /** Maximum continuous power dissipation (W) for the typical 0.5 W
   *  glass-body part — used to drive the over-power warning. */
  p_max: number
}

const ZENERS: ReadonlyArray<ZenerSpec> = [
  { id: 'v5_1', v_z0:  5.1, r_z: 10, p_max: 0.5 },
  { id: 'v9_1', v_z0:  9.1, r_z:  8, p_max: 0.5 },
  { id: 'v12',  v_z0: 12.0, r_z:  9, p_max: 0.5 },
] as const

/* ── Operating-point math ─────────────────────────────────────────── */

interface OperatingPoint {
  /** Voltage across the Zener (V). */
  v_z: number
  /** Current through the Zener (mA). */
  i_z: number
  /** Current through R_L (mA). 0 when no load. */
  i_load: number
  /** Total current through R_s (mA). */
  i_total: number
  /** Voltage across R_s (V). */
  v_rs: number
  /** Power dissipated in the Zener (mW). */
  p_zener_mw: number
  /** Whether the Zener is actually in breakdown / regulating mode. */
  is_regulating: boolean
}

/**
 * Solve for the steady-state operating point.
 *
 * Two cases:
 *
 *   1. REGULATING. Assume the Zener is in breakdown, so the voltage
 *      across it equals (nominal V plus current times r). Combine with
 *      KCL at the regulated node (current through R is the sum of
 *      Zener current and load current) and KVL around the loop (V_in
 *      equals voltage on R plus voltage on Zener) to solve one linear
 *      equation. With no load, this reduces to the formula used in
 *      Step 3 of the chapter callout. If the resulting Zener voltage
 *      is at or above the nominal breakdown level, the regulating
 *      assumption holds and we accept the solution.
 *
 *   2. DROPOUT. If the regulating-mode solution would put the Zener
 *      below its breakdown threshold, the Zener cannot be conducting:
 *      its current is essentially zero, and the regulated node is just
 *      the upper leg of a series-resistor / load-resistor voltage
 *      divider. With no load, the output is whatever V_in supplies (no
 *      current flows anywhere). With load, the output is the standard
 *      divider ratio.
 *
 * Returns currents in mA, voltages in V, power in mW.
 */
export function computeOperatingPoint(
  v_in: number,
  r_s_ohms: number,
  zener: ZenerSpec,
  r_l_ohms: number | null,
): OperatingPoint {
  // Try regulating mode.
  const r_s = r_s_ohms
  const r_z = zener.r_z
  const inv_r_l = r_l_ohms === null ? 0 : 1 / r_l_ohms

  // V_Z (regulating) = (V_Z0 + r_z·V_in/R_s) / (1 + r_z/R_s + r_z·inv_R_L)
  const v_z_reg = (zener.v_z0 + (r_z * v_in) / r_s) / (1 + r_z / r_s + r_z * inv_r_l)

  if (v_z_reg >= zener.v_z0) {
    // Regulating.
    const v_z = v_z_reg
    const i_z_a = (v_z - zener.v_z0) / r_z          // A
    const i_load_a = v_z * inv_r_l                  // A (0 if no load)
    const i_total_a = i_z_a + i_load_a              // A
    const v_rs = i_total_a * r_s                    // V
    return {
      v_z,
      i_z: i_z_a * 1000,
      i_load: i_load_a * 1000,
      i_total: i_total_a * 1000,
      v_rs,
      p_zener_mw: v_z * i_z_a * 1000,
      is_regulating: true,
    }
  }

  // Dropout: Zener is reverse-biased but not in breakdown. I_Z ≈ 0.
  // V_Z = V_in · R_L / (R_s + R_L) when load present, else V_Z = V_in.
  const v_z = r_l_ohms === null
    ? v_in
    : (v_in * r_l_ohms) / (r_s + r_l_ohms)
  const i_load_a = r_l_ohms === null ? 0 : v_z / r_l_ohms
  const i_total_a = i_load_a
  const v_rs = i_total_a * r_s
  return {
    v_z,
    i_z: 0,
    i_load: i_load_a * 1000,
    i_total: i_total_a * 1000,
    v_rs,
    p_zener_mw: 0,
    is_regulating: false,
  }
}

/* ── Plot geometry ────────────────────────────────────────────────── */

const CHART_W = 360
const CHART_H = 240
const CHART_PAD_L = 44
const CHART_PAD_R = 12
const CHART_PAD_T = 18
const CHART_PAD_B = 36

const CHART_PLOT_X0 = CHART_PAD_L
const CHART_PLOT_Y0 = CHART_PAD_T
const CHART_PLOT_W = CHART_W - CHART_PAD_L - CHART_PAD_R
const CHART_PLOT_H = CHART_H - CHART_PAD_T - CHART_PAD_B

// X axis: V_Z from 0 to 15 V (covers all three Zener types)
const V_AXIS_MAX = 15
const V_TICKS = [0, 3, 6, 9, 12, 15]

// Y axis: I_Z from 0 to 60 mA (covers comfortable operating range
// plus headroom for the load line at low V_Z). The breakdown rated
// current of a 0.5 W / 5.1 V Zener is ~98 mA — we cap the chart well
// below that so most operating points sit comfortably inside.
const I_AXIS_MAX_MA = 60
const I_TICKS_MA = [0, 15, 30, 45, 60]

function vToChartX(v: number): number {
  return CHART_PLOT_X0 + (v / V_AXIS_MAX) * CHART_PLOT_W
}
function iMaToChartY(iMa: number): number {
  return CHART_PLOT_Y0 + CHART_PLOT_H - (iMa / I_AXIS_MAX_MA) * CHART_PLOT_H
}

/* Build the Zener I-V curve in (V, I) space. Two regions:
 *  - V < V_Z0: I = 0 (idealised flat OFF state)
 *  - V >= V_Z0: I = (V - V_Z0) / r_z (regulating) — straight line. */
function buildZenerCurvePath(z: ZenerSpec): string {
  const points: Array<{ x: number; y: number }> = []
  // OFF: walk from V=0 to V=V_Z0.
  points.push({ x: vToChartX(0),         y: iMaToChartY(0) })
  points.push({ x: vToChartX(z.v_z0),    y: iMaToChartY(0) })
  // BREAKDOWN: line to (V_AXIS_MAX, I at that voltage).
  const i_at_max_a = (V_AXIS_MAX - z.v_z0) / z.r_z
  const i_at_max_ma = i_at_max_a * 1000
  points.push({ x: vToChartX(V_AXIS_MAX), y: iMaToChartY(i_at_max_ma) })
  return points.map((p, i) => (i === 0 ? `M${p.x.toFixed(2)} ${p.y.toFixed(2)}` : `L${p.x.toFixed(2)} ${p.y.toFixed(2)}`)).join(' ')
}

/* Build the load line in (V_Z, I_Z) space.
 *
 *   I_Z = (V_in - V_Z) / R_s - V_Z / R_L
 *
 *  Two intercepts:
 *    - V_Z = 0 → I_Z = V_in / R_s
 *    - I_Z = 0 → V_Z = V_in · R_L / (R_s + R_L)  (or V_in if no load)
 */
function buildLoadLinePath(
  v_in: number,
  r_s_ohms: number,
  r_l_ohms: number | null,
): string {
  const inv_r_l = r_l_ohms === null ? 0 : 1 / r_l_ohms
  // I_Z (mA) at V_Z = 0
  const i_at_v0_ma = (v_in / r_s_ohms) * 1000
  // V_Z at I_Z = 0
  const v_at_i0 = inv_r_l === 0 ? v_in : (v_in * r_l_ohms!) / (r_s_ohms + r_l_ohms!)
  const x1 = vToChartX(0)
  const y1 = iMaToChartY(i_at_v0_ma)
  const x2 = vToChartX(v_at_i0)
  const y2 = iMaToChartY(0)
  return `M${x1.toFixed(2)} ${y1.toFixed(2)} L${x2.toFixed(2)} ${y2.toFixed(2)}`
}

/* ── Schematic geometry — uses @/lib/circuit primitives ────────────
   Layout follows `ZenerRegulatorSchematic.tsx` (the static version of
   this same circuit). Going through Circuit primitives is the
   project's hard rule (CLAUDE.md, circuit-schematics.md): zero
   hand-drawn SVG.
   ─────
   SCH_TOP_Y = 50 (vs the canonical SCHEMATIC_PAD_TOP=35) because the
   horizontal R_s carries BOTH a designator and a live voltage value
   in PassiveLabel, which stacks the two ~32 px above the body —
   wider than the 35 px canonical pad. The static schematic doesn't
   need this extra room because it labels R_s with `label` only. */

const SCH_W = 440        // R_L value «100,0 Ом» extends to x≈400 from
                          // CenteredLabel's sideX=SCH_RL_X+20=350; canvas
                          // needs to clear that to avoid clipping the «Ом».
// Schematic SVG height matches the chart's CHART_H (240) so the two
// side-by-side cards line up. Without this, the schematic at its
// natural compact height ≈ 200 px sat shorter than the chart and the
// row looked lopsided. The extra height becomes vertical breathing
// room around the topology — top-rail-to-canvas-top padding grows
// from 35 to 55, bottom from 20 to 40, both inside acceptable
// schematic-style ranges.
const SCH_TOP_Y = 55
const SCH_RAIL_SPAN = 145
const SCH_BOT_Y = SCH_TOP_Y + SCH_RAIL_SPAN   // 200
const SCH_H = 240                              // matches CHART_H below
const SCH_MID_Y = (SCH_TOP_Y + SCH_BOT_Y) / 2

// Component x-positions — same proportions as ZenerRegulatorSchematic
const SCH_SRC_X = 60
const SCH_RS_X  = 150
const SCH_ZD_X  = 240
const SCH_RL_X  = 330

// Pin helpers — pure constants, no state dependence. Reused at every
// render to wire up the schematic.
const src = pins2(SCH_SRC_X, SCH_MID_Y, 'down')
const rs  = pins2(SCH_RS_X,  SCH_TOP_Y)
const zd  = pins2(SCH_ZD_X,  SCH_MID_Y, 'up')
const rl  = pins2(SCH_RL_X,  SCH_MID_Y, 'down')

/* ── Slider config ─────────────────────────────────────────────────── */

const V_IN_MIN = 0
const V_IN_MAX = 15
const V_IN_STEP = 0.1
const V_IN_DEFAULT = 9

// R_s slider on log scale: 100 Ω → 5 kΩ
const RS_LOG_MIN = 2          // log10(100)  = 2
const RS_LOG_MAX = Math.log10(5000)  // ≈ 3.7
const RS_LOG_STEP = 0.02
const RS_LOG_DEFAULT = 3      // log10(1000) = 3 → 1 kΩ

// R_L slider on log scale: 100 Ω → 100 kΩ
const RL_LOG_MIN = 2          // log10(100)
const RL_LOG_MAX = 5          // log10(100 000)
const RL_LOG_STEP = 0.05
const RL_LOG_DEFAULT = 3      // log10(1 000) = 3 → 1 kΩ

/* ── Component ─────────────────────────────────────────────────────── */

export default function ZenerRegulatorWidget() {
  const { t } = useTranslation('ui')
  const { locale } = useLocaleFormatter()
  const tUnit = useUnitFormatter()
  const chartClipId = useId()

  const [vIn, setVIn] = useState<number>(V_IN_DEFAULT)
  const [rsLog, setRsLog] = useState<number>(RS_LOG_DEFAULT)
  const [zenerId, setZenerId] = useState<ZenerSpec['id']>('v5_1')
  const [rlEnabled, setRlEnabled] = useState<boolean>(false)
  const [rlLog, setRlLog] = useState<number>(RL_LOG_DEFAULT)
  const r_s = Math.pow(10, rsLog)
  const r_l = rlEnabled ? Math.pow(10, rlLog) : null
  const zener = ZENERS.find(z => z.id === zenerId) ?? ZENERS[0]

  const op = useMemo(
    () => computeOperatingPoint(vIn, r_s, zener, r_l),
    [vIn, r_s, zener, r_l],
  )

  const zenerCurvePath = useMemo(() => buildZenerCurvePath(zener), [zener])
  const loadLinePath = useMemo(() => buildLoadLinePath(vIn, r_s, r_l), [vIn, r_s, r_l])

  // Operating point in chart coordinates (clamped to plot bounds).
  const opX = vToChartX(Math.max(0, Math.min(V_AXIS_MAX, op.v_z)))
  const opY = iMaToChartY(Math.max(0, Math.min(I_AXIS_MAX_MA, op.i_z)))

  const fmtV = (v: number, decimals = 2): string =>
    `${formatDecimal(v, decimals, locale)} ${tUnit('v')}`
  const fmtI = (mA: number): string => {
    if (Math.abs(mA) < 0.01) return `≈ 0 ${tUnit('ma')}`
    if (Math.abs(mA) < 1) return `${formatDecimal(mA * 1000, 0, locale)} ${tUnit('ua')}`
    return `${formatDecimal(mA, 2, locale)} ${tUnit('ma')}`
  }
  const fmtR = (ohms: number): string => {
    if (ohms < 1000) return `${formatDecimal(ohms, 0, locale)} ${tUnit('ohm')}`
    return `${formatDecimal(ohms / 1000, ohms < 10000 ? 2 : 1, locale)} ${tUnit('kohm')}`
  }
  const fmtP = (mW: number): string => {
    if (mW < 1000) return `${formatDecimal(mW, 1, locale)} ${tUnit('mw')}`
    return `${formatDecimal(mW / 1000, 2, locale)} ${tUnit('w')}`
  }

  const overPower = op.p_zener_mw > zener.p_max * 1000
  const underKnee = op.is_regulating && op.i_z < 1     // typical I_Z(min) ≈ 1 mA
  const droppedOut = !op.is_regulating

  return (
    <Widget
      title={t('ch1_10.widget.zenerRegulator.title')}
      description={
        <Trans
          i18nKey="ch1_10.widget.zenerRegulator.description"
          ns="ui"
          components={{
            var: <MathVar />,
            ll: <G k="load line" />,
          }}
        />
      }
    >
      {/* ── Side-by-side schematic + chart ───────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Schematic — composed entirely from @/lib/circuit primitives,
            mirroring the topology and proportions of the static
            ZenerRegulatorSchematic. Live values flow through component
            props (Battery.value, Resistor.value, DiodeZener.value),
            so the symbol stays canonical and the labels update on
            every slider tick.
            ─────
            Topology: V_in (Battery, vertical) → R_s (horizontal,
            top rail) → regulating node → Zener to ground rail →
            (optional R_L in parallel with Zener) → back to source.
            Junctions appear at the regulating-node tap (top + bottom)
            ONLY when R_L is connected — otherwise those nodes are
            two-way corners, no dot. */}
        <div role="img" aria-label={t('ch1_10.widget.zenerRegulator.ariaLabelSchematic')}>
        <Circuit
          width={SCH_W}
          height={SCH_H}
          maxWidth={460}
        >
          {/* Source ↑ → top rail → R_s → Zener top */}
          <Wire points={[src.p1, { x: SCH_SRC_X, y: SCH_TOP_Y }, rs.p1]} />
          <Wire points={[rs.p2, { x: SCH_ZD_X, y: SCH_TOP_Y }, zd.p2]} />
          {/* Bottom rail back from Zener to source */}
          <Wire points={[zd.p1, { x: SCH_ZD_X, y: SCH_BOT_Y }, { x: SCH_SRC_X, y: SCH_BOT_Y }, src.p2]} />
          {/* R_L branch (only drawn when load enabled) */}
          {rlEnabled && (
            <>
              <Wire points={[{ x: SCH_ZD_X, y: SCH_TOP_Y }, { x: SCH_RL_X, y: SCH_TOP_Y }, rl.p1]} />
              <Wire points={[rl.p2, { x: SCH_RL_X, y: SCH_BOT_Y }, { x: SCH_ZD_X, y: SCH_BOT_Y }]} />
            </>
          )}

          {/* Each component carries TWO labels: the designator
              (R_s / Z / R_L / V_in — primary, size=14) and a live
              numeric reading (the voltage across it — secondary,
              size=13). Both render at regular weight as of May 2026;
              the size hierarchy alone carries the designator/value
              distinction. The primitives lay them out in their canonical
              slots: Battery puts them side-by-side (left/right of the
              vertical body), DiodeZener stacks them right of the body
              (CenteredLabel), Resistor stacks them above the body
              (PassiveLabel — fixed for both-label case to give the
              value enough vertical room above the zigzag, see comment
              in passives.tsx). */}
          <Battery x={SCH_SRC_X} y={SCH_MID_Y} orient="down" label="V_in" value={fmtV(vIn, 1)} />
          <Resistor x={SCH_RS_X} y={SCH_TOP_Y} label="R_s" value={fmtV(op.v_rs, 2)} />
          <DiodeZener x={SCH_ZD_X} y={SCH_MID_Y} orient="up" label="Z" value={fmtV(op.v_z, 2)} />
          {rlEnabled && (
            <Resistor x={SCH_RL_X} y={SCH_MID_Y} orient="down" label="R_L" value={fmtR(Math.pow(10, rlLog))} />
          )}

          {/* Junctions — only at the genuine 3-way taps that appear
              when R_L is connected. Without R_L the regulating node
              is just a corner (R_s end + Zener top), no dot. */}
          {rlEnabled && (
            <>
              <Junction x={SCH_ZD_X} y={SCH_TOP_Y} />
              <Junction x={SCH_ZD_X} y={SCH_BOT_Y} />
            </>
          )}

        </Circuit>
        </div>

        {/* I-V chart with Zener curve, load line, operating point */}
        <div className="rounded-lg border border-border bg-card/60 p-3">
          <svg
            width={CHART_W}
            height={CHART_H}
            viewBox={`0 0 ${CHART_W} ${CHART_H}`}
            role="img"
            aria-label={t('ch1_10.widget.zenerRegulator.ariaLabelChart')}
            style={{ display: 'block', margin: '0 auto', maxWidth: '100%', height: 'auto' }}
          >
            <defs>
              <clipPath id={chartClipId}>
                <rect
                  x={CHART_PLOT_X0 - 2}
                  y={CHART_PLOT_Y0 - 2}
                  width={CHART_PLOT_W + 4}
                  height={CHART_PLOT_H + 4}
                />
              </clipPath>
            </defs>

            {/* Gridlines */}
            <g stroke={svgTokens.border} strokeWidth={0.5} opacity={0.5}>
              {V_TICKS.slice(1).map(v => (
                <line key={`gx${v}`} x1={vToChartX(v)} y1={CHART_PLOT_Y0}
                      x2={vToChartX(v)} y2={CHART_PLOT_Y0 + CHART_PLOT_H} />
              ))}
              {I_TICKS_MA.slice(1).map(i => (
                <line key={`gy${i}`} x1={CHART_PLOT_X0} y1={iMaToChartY(i)}
                      x2={CHART_PLOT_X0 + CHART_PLOT_W} y2={iMaToChartY(i)} />
              ))}
            </g>

            {/* Axes */}
            <g stroke={svgTokens.fg} strokeWidth={1} fill="none">
              <line x1={CHART_PLOT_X0} y1={CHART_PLOT_Y0} x2={CHART_PLOT_X0} y2={CHART_PLOT_Y0 + CHART_PLOT_H} />
              <line x1={CHART_PLOT_X0} y1={CHART_PLOT_Y0 + CHART_PLOT_H}
                    x2={CHART_PLOT_X0 + CHART_PLOT_W} y2={CHART_PLOT_Y0 + CHART_PLOT_H} />
            </g>

            {/* Tick labels */}
            <g fill={svgTokens.mutedFg} fontSize="11" fontFamily="ui-sans-serif, system-ui, sans-serif">
              {V_TICKS.map(v => (
                <text key={`tx${v}`} x={vToChartX(v)} y={CHART_PLOT_Y0 + CHART_PLOT_H + 14}
                      textAnchor="middle">
                  {v}
                </text>
              ))}
              {I_TICKS_MA.map(i => (
                <text key={`ty${i}`} x={CHART_PLOT_X0 - 6} y={iMaToChartY(i) + 4}
                      textAnchor="end">
                  {i}
                </text>
              ))}
            </g>

            {/* Axis titles */}
            <text x={CHART_PLOT_X0 + CHART_PLOT_W / 2} y={CHART_PLOT_Y0 + CHART_PLOT_H + 30}
                  fontSize="12" fill={svgTokens.fg} textAnchor="middle">
              <tspan fontStyle="italic" fontFamily="Georgia, serif">V</tspan>
              {' (' + tUnit('v') + ')'}
            </text>
            <text x={12} y={CHART_PLOT_Y0 + CHART_PLOT_H / 2}
                  fontSize="12" fill={svgTokens.fg} textAnchor="middle"
                  transform={`rotate(-90 12 ${CHART_PLOT_Y0 + CHART_PLOT_H / 2})`}>
              <tspan fontStyle="italic" fontFamily="Georgia, serif">I</tspan>
              {' (' + tUnit('ma') + ')'}
            </text>

            {/* Zener curve — primary stroke */}
            <g clipPath={`url(#${chartClipId})`}>
              <path
                d={zenerCurvePath}
                fill="none"
                stroke={svgTokens.primary}
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>

            {/* Load line — dashed, experiment colour */}
            <g clipPath={`url(#${chartClipId})`}>
              <path
                d={loadLinePath}
                fill="none"
                stroke={svgTokens.experiment}
                strokeWidth={1.75}
                strokeDasharray="5 4"
              />
            </g>

            {/* Operating point */}
            <g clipPath={`url(#${chartClipId})`}>
              <circle
                cx={opX}
                cy={opY}
                r={5}
                fill="hsl(var(--background))"
                stroke={op.is_regulating ? svgTokens.fg : svgTokens.caution}
                strokeWidth={2}
              />
            </g>

          </svg>
        </div>
      </div>

      {/* Shared legend for the chart, rendered as a row UNDERNEATH
          the schematic+chart grid so it doesn't add height to one
          card more than the other (which made the row look lopsided
          when the legend lived inside the chart card). The labels
          here name the chart's three visual elements: the Zener
          curve (orange solid), the load line (teal dashed — wrapped
          with `<G>` so the term gets a tooltip the first time the
          reader meets it), and the operating-point marker (open
          circle). */}
      <ul className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1 text-[12px] text-muted-foreground">
        <li className="inline-flex items-center gap-2">
          <span aria-hidden="true" className="inline-block h-[3px] w-5 rounded-full"
                style={{ background: svgTokens.primary }} />
          {t('ch1_10.widget.zenerRegulator.zenerCurveLabel')}
        </li>
        {/* «лінія навантаження» term is introduced (with glossary
            tooltip) in the widget description above; legend just
            labels the swatch as plain text. */}
        <li className="inline-flex items-center gap-2">
          <span aria-hidden="true" className="inline-block w-5"
                style={{
                  backgroundImage: `repeating-linear-gradient(to right, ${svgTokens.experiment} 0 4px, transparent 4px 7px)`,
                  height: '2px',
                }} />
          {t('ch1_10.widget.zenerRegulator.loadLineLabel')}
        </li>
        <li className="inline-flex items-center gap-2">
          <span aria-hidden="true" className="inline-block h-[10px] w-[10px] rounded-full border-[2px]"
                style={{ borderColor: svgTokens.fg, background: 'hsl(var(--background))' }} />
          {t('ch1_10.widget.zenerRegulator.operatingPointLabel')}
        </li>
      </ul>

      {/* ── V_in slider ─────────────────────────────────────────── */}
      <div>
        <div className="flex items-baseline justify-between mb-2">
          <label htmlFor="zrw-vin" className="text-sm font-medium text-foreground">
            {t('ch1_10.widget.zenerRegulator.vinLabel')}
          </label>
          <span className="text-sm font-mono text-muted-foreground">{fmtV(vIn, 1)}</span>
        </div>
        <Slider id="zrw-vin" min={V_IN_MIN} max={V_IN_MAX} step={V_IN_STEP}
                value={[vIn]} onValueChange={([v]) => setVIn(v ?? V_IN_DEFAULT)}
                aria-label={t('ch1_10.widget.zenerRegulator.vinLabel')} />
        <div className="flex justify-between mt-1 text-[11px] text-muted-foreground font-mono">
          <span>0 {tUnit('v')}</span>
          <span>{V_IN_MAX} {tUnit('v')}</span>
        </div>
      </div>

      {/* ── R_s slider ───────────────────────────────────────────── */}
      <div>
        <div className="flex items-baseline justify-between mb-2">
          <label htmlFor="zrw-rs" className="text-sm font-medium text-foreground">
            {t('ch1_10.widget.zenerRegulator.rsLabel')}
          </label>
          <span className="text-sm font-mono text-muted-foreground">{fmtR(r_s)}</span>
        </div>
        <Slider id="zrw-rs" min={RS_LOG_MIN} max={RS_LOG_MAX} step={RS_LOG_STEP}
                value={[rsLog]} onValueChange={([v]) => setRsLog(v ?? RS_LOG_DEFAULT)}
                aria-label={t('ch1_10.widget.zenerRegulator.rsLabel')} />
        <div className="flex justify-between mt-1 text-[11px] text-muted-foreground font-mono">
          <span>100 {tUnit('ohm')}</span>
          <span>5 {tUnit('kohm')}</span>
        </div>
      </div>

      {/* ── Zener type picker ────────────────────────────────────── */}
      <div>
        <span className="text-sm font-medium text-foreground block mb-2">
          {t('ch1_10.widget.zenerRegulator.zenerTypeLabel')}
        </span>
        <div className="flex flex-wrap gap-2">
          {ZENERS.map(z => {
            const isActive = z.id === zenerId
            return (
              <button
                key={z.id}
                type="button"
                onClick={() => setZenerId(z.id)}
                aria-pressed={isActive}
                className={[
                  'inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm transition-colors',
                  isActive
                    ? 'border-foreground bg-card font-medium text-foreground'
                    : 'border-border text-muted-foreground hover:text-foreground',
                ].join(' ')}
              >
                {fmtV(z.v_z0, 1)}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── R_L toggle + slider ──────────────────────────────────── */}
      <div>
        <div className="flex items-baseline justify-between mb-2">
          <label className="text-sm font-medium text-foreground inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={rlEnabled}
              onChange={e => setRlEnabled(e.target.checked)}
              className="h-4 w-4 rounded border-border"
            />
            {t('ch1_10.widget.zenerRegulator.rlLabel')}
          </label>
          <span className="text-sm font-mono text-muted-foreground">
            {rlEnabled ? fmtR(Math.pow(10, rlLog)) : t('ch1_10.widget.zenerRegulator.rlDisabledNote')}
          </span>
        </div>
        <Slider id="zrw-rl" min={RL_LOG_MIN} max={RL_LOG_MAX} step={RL_LOG_STEP}
                value={[rlLog]} onValueChange={([v]) => setRlLog(v ?? RL_LOG_DEFAULT)}
                aria-label={t('ch1_10.widget.zenerRegulator.rlLabel')}
                disabled={!rlEnabled} />
        <div className="flex justify-between mt-1 text-[11px] text-muted-foreground font-mono">
          <span>100 {tUnit('ohm')}</span>
          <span>100 {tUnit('kohm')}</span>
        </div>
      </div>

      {/* ── Result + warnings ──────────────────────────────────────
          The readout lead and the three warnings each contain
          bare-subscript variable names (V_in, V_Z, R_s, R_L, r_z,
          I_Z) baked into prose. Each render path goes through
          withSubscripts() so those underscores become real <sub>
          elements at display time. */}
      <ResultBox tone={overPower || droppedOut ? 'warn' : 'success'}>
        <p className="text-sm text-foreground">
          {withSubscripts(t('ch1_10.widget.zenerRegulator.readoutLead', {
            v_in: fmtV(vIn, 1),
            v_z: fmtV(op.v_z, 2),
            i_z: fmtI(op.i_z),
            v_rs: fmtV(op.v_rs, 2),
          }))}
        </p>
        {droppedOut && (
          <p className="text-xs text-callout-key mt-2">
            {withSubscripts(t('ch1_10.widget.zenerRegulator.warningDropout', {
              v_z0: `${formatDecimal(zener.v_z0, 1, locale)} ${tUnit('v')}`,
            }))}
          </p>
        )}
        {overPower && (
          <p className="text-xs text-callout-caution mt-2">
            {withSubscripts(t('ch1_10.widget.zenerRegulator.warningPower', {
              p_z: fmtP(op.p_zener_mw),
              p_max: `${formatDecimal(zener.p_max, 1, locale)} ${tUnit('w')}`,
            }))}
          </p>
        )}
        {underKnee && !overPower && !droppedOut && (
          <p className="text-xs text-callout-note mt-2">
            {withSubscripts(t('ch1_10.widget.zenerRegulator.warningKnee', { i_z: fmtI(op.i_z) }))}
          </p>
        )}
      </ResultBox>
    </Widget>
  )
}
