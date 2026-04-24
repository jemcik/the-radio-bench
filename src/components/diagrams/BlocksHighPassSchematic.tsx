/**
 * Chapter 1.5 §7 — compact schematic of the high-pass RC filter
 * (a.k.a. «coupling capacitor» topology) that the accompanying
 * BlocksDcPassesAcDiagram waveforms are drawn FOR.
 *
 * Topology (left → right):
 *   V_in terminal → C in series → node labelled V_out → R down to
 *   ground rail → back to the V_in reference terminal.
 *
 * Without this schematic the waveform diagram is abstract: the reader
 * sees V_in and V_out curves but has no idea what circuit those are
 * being measured across. This visual anchors both variables to
 * physical pins in a concrete topology.
 */
import {
  Circuit,
  Wire,
  Junction,
  Resistor,
  Capacitor,
  TerminalLabel,
  pins2,
  SCHEMATIC_PAD_TOP,
  schematicHeight,
} from '@/lib/circuit'
import { useTranslation } from 'react-i18next'
import { MathText } from '@/components/ui/math-text'

// Content extends from ~x=19 (left of V_in label) to ~x=320 (right of
// V_out label). Previously SCHEMATIC_W was 440 — that left a ~120 px
// empty stripe on the right, caught by schematic-layout.test.tsx.
const SCHEMATIC_W = 340

const TOP_Y = SCHEMATIC_PAD_TOP
const RAIL_SPAN = 90
const BOT_Y = TOP_Y + RAIL_SPAN
const SCHEMATIC_H = schematicHeight(RAIL_SPAN)

const VIN_X = 50 // V_in terminal column
const C_X = 150 // coupling capacitor (horizontal, on top rail)
const NODE_X = 260 // V_out tap-off junction
const R_X = NODE_X // resistor drops from the junction to ground
const VOUT_LABEL_X = 290 // V_out text sits just right of the junction

const c = pins2(C_X, TOP_Y)
const r = pins2(R_X, (TOP_Y + BOT_Y) / 2, 'down')

export default function BlocksHighPassSchematic() {
  const { t } = useTranslation('ui')

  return (
    <Circuit
      width={SCHEMATIC_W}
      height={SCHEMATIC_H}
      maxWidth={460}
      caption={<MathText>{t('ch1_5.blocksHighPassSchematicCaption')}</MathText>}
    >
      {/* Top rail: V_in → C → node */}
      <Wire points={[{ x: VIN_X, y: TOP_Y }, c.p1]} />
      <Wire points={[c.p2, { x: NODE_X, y: TOP_Y }]} />

      {/* Drop from node through R to the bottom rail */}
      <Wire points={[{ x: NODE_X, y: TOP_Y }, r.p1]} />
      <Wire points={[r.p2, { x: NODE_X, y: BOT_Y }]} />

      {/* Bottom return rail back to the V_in reference terminal */}
      <Wire points={[{ x: NODE_X, y: BOT_Y }, { x: VIN_X, y: BOT_Y }]} />

      {/* Components */}
      <Capacitor x={C_X} y={TOP_Y} label="C" />
      <Resistor x={R_X} y={(TOP_Y + BOT_Y) / 2} orient="down" label="R" />

      {/* The V_out tap-off is a real T-junction (three wires meet there:
          from C, down to R, and — conceptually — out to «the next stage»
          / where we measure V_out). Draw the junction dot so it reads
          as a three-way connection. */}
      <Junction x={NODE_X} y={TOP_Y} />

      {/* Terminal labels */}
      <TerminalLabel x={VIN_X - 6} y={TOP_Y} anchor="end">V_in</TerminalLabel>
      <TerminalLabel x={VOUT_LABEL_X} y={TOP_Y} anchor="start">V_out</TerminalLabel>
    </Circuit>
  )
}
