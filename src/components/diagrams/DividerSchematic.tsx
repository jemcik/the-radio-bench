/**
 * Chapter 1.4 — Standalone voltage-divider schematic used in section 5.
 *
 * Composed entirely from `@/lib/circuit` primitives:
 * `Circuit` / `Wire` / `Junction` / `Resistor` / `Meter` for the circuit,
 * `NodePoint` / `TerminalLabel` for the pedagogical annotations.
 * **No hand-drawn SVG.** Every visual element is a reusable primitive
 * from the shared library, so this schematic matches the symbol
 * conventions established in ch0.2 / ch0.5 (junction dots at T-joints,
 * same Meter symbol, same stroke weights, same theme tokens).
 *
 * Topology: V_in rail at top, R₁–R₂ column down the middle to the 0 V
 * rail, voltmeter in parallel with R₂ (whose reading IS V_out, shown
 * visibly as a Meter symbol between nodes B and C). Three named nodes
 * A / B / C let the derivation prose refer to specific points.
 */
import { useTranslation } from 'react-i18next'
import { MathText } from '@/components/ui/math-text'
import {
  Circuit, Wire, Junction,
  Resistor, Meter, meterPins, METER_ACCENT_V,
  NodePoint, TerminalLabel,
  pins2,
  SCHEMATIC_PAD_TOP,
  schematicHeight,
} from '@/lib/circuit'

// ── Geometry ─────────────────────────────────────────────────────────
const SCHEMATIC_W = 420
const RAIL_SPAN = 200
const TOP_Y = SCHEMATIC_PAD_TOP
const BOT_Y = TOP_Y + RAIL_SPAN
const SCHEMATIC_H = schematicHeight(RAIL_SPAN)
const JUNCTION_Y = (TOP_Y + BOT_Y) / 2
const COL_X = 150                          // R₁–R₂ column
const RAIL_L = 70                          // left end of rails (V_in terminal)
const RAIL_R = 360                         // right end of rails (runs under voltmeter)
const METER_X = 300                        // voltmeter column
const METER_Y = (JUNCTION_Y + BOT_Y) / 2   // voltmeter centred between B and C

// Pin helpers — standard pins2 for vertical components.
// For orient 'down': p1 is ABOVE, p2 is BELOW.
const R1_CY = (TOP_Y + JUNCTION_Y) / 2
const R2_CY = (JUNCTION_Y + BOT_Y) / 2
const r1 = pins2(COL_X, R1_CY, 'down')
const r2 = pins2(COL_X, R2_CY, 'down')
// Meter uses the specialised `meterPins` helper (span matches the
// circle radius exactly — no gap between wire endpoint and circle edge).
const meter = meterPins(METER_X, METER_Y, 'down')

// Node-label offset — to the LEFT of the column, with enough room for
// the R₁ / R₂ labels to the right.
const NODE_LABEL_X = COL_X - 22

export default function DividerSchematic() {
  const { t } = useTranslation('ui')
  return (
    <Circuit
      width={SCHEMATIC_W}
      height={SCHEMATIC_H}
      maxWidth={480}
      caption={<MathText>{t('ch1_4.dividerSchematicCaption')}</MathText>}
    >
      {/* ── Rails ────────────────────────────────────────────────── */}
      <Wire points={[{ x: RAIL_L, y: TOP_Y }, { x: RAIL_R, y: TOP_Y }]} />
      <Wire points={[{ x: RAIL_L, y: BOT_Y }, { x: RAIL_R, y: BOT_Y }]} />

      {/* ── R₁ between top rail and junction B ──────────────────── */}
      <Wire points={[{ x: COL_X, y: TOP_Y }, r1.p1]} />
      <Resistor x={COL_X} y={R1_CY} orient="down" label="R₁" />
      <Wire points={[r1.p2, { x: COL_X, y: JUNCTION_Y }]} />

      {/* ── R₂ between junction B and bottom rail ──────────────── */}
      <Wire points={[{ x: COL_X, y: JUNCTION_Y }, r2.p1]} />
      <Resistor x={COL_X} y={R2_CY} orient="down" label="R₂" />
      <Wire points={[r2.p2, { x: COL_X, y: BOT_Y }]} />

      {/* ── Voltmeter parallel to R₂ ────────────────────────────── */}
      {/* Probe wires coloured to match the voltmeter — same pattern as
          ch0.2 MultimeterDiagram. The colour coding signals "this wire
          is the meter's probe", visually distinct from the circuit
          wiring proper. */}
      <Wire
        color={METER_ACCENT_V}
        points={[
          { x: COL_X, y: JUNCTION_Y },
          { x: METER_X, y: JUNCTION_Y },
          meter.p1,
        ]}
      />
      <Meter x={METER_X} y={METER_Y} orient="down" letter="V" accent={METER_ACCENT_V} />
      <Wire
        color={METER_ACCENT_V}
        points={[meter.p2, { x: METER_X, y: BOT_Y }]}
      />

      {/* ── Junction dots — one per T-joint (3+ wires meeting) ──── */}
      <Junction x={COL_X} y={TOP_Y} />
      <Junction x={COL_X} y={JUNCTION_Y} />
      <Junction x={COL_X} y={BOT_Y} />
      <Junction x={METER_X} y={BOT_Y} />

      {/* ── Node labels A / B / C ──────────────────────────────── */}
      <NodePoint x={NODE_LABEL_X} y={TOP_Y} letter="A" />
      <NodePoint x={NODE_LABEL_X} y={JUNCTION_Y} letter="B" />
      <NodePoint x={NODE_LABEL_X} y={BOT_Y} letter="C" />

      {/* ── Rail / meter terminal labels ───────────────────────── */}
      <TerminalLabel x={RAIL_L - 8} y={TOP_Y}>
        {t('ch1_4.loadingVinLabel')}
      </TerminalLabel>
      <TerminalLabel x={RAIL_L - 8} y={BOT_Y} tone="mutedFg">
        {t('ch1_4.loadingGroundLabel')}
      </TerminalLabel>
      <TerminalLabel
        x={METER_X + 28} y={METER_Y}
        anchor="start"
        color={METER_ACCENT_V}
        weight={700}
      >
        {t('ch1_4.loadingVoutLabel')}
      </TerminalLabel>
    </Circuit>
  )
}
