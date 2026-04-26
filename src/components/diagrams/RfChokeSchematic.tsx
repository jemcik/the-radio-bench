/**
 * Chapter 1.6 §7.1 — RF choke in an amplifier supply line.
 *
 * Topology:
 *   - V+ at top, GND at bottom.
 *   - RF choke (RFC, vertical) hanging down from V+ rail to the
 *     transistor's collector node.
 *   - Bypass capacitor C (vertical) from V+ rail directly to GND,
 *     drawn just to the left of RFC. Together they form the classic
 *     RF-amp supply decoupling: choke blocks RF from leaking into the
 *     supply, bypass cap shorts any RF residue to ground.
 *   - RF in (signal input on the left), RF out (load on the right),
 *     both meeting at the collector node where the RFC bottom sits.
 *
 * Uses `@/lib/circuit` primitives only.
 */
import {
  Circuit,
  Wire,
  Junction,
  Capacitor,
  Inductor,
  TerminalLabel,
  pins2,
  SCHEMATIC_PAD_TOP,
  schematicHeight,
} from '@/lib/circuit'
import { useTranslation } from 'react-i18next'
import { MathText } from '@/components/ui/math-text'

// Width budgeted for worst-case UA labels: «ВЧ вхід» / «ВЧ вихід»
// (~50 px each at TerminalLabel size). Earlier 480-px viewBox left only
// ~4 px of right margin after the «ВЧ вихід» glyphs — the rounded card
// wrapping the SVG has `overflow-hidden`, so anything past the SVG
// bounds gets clipped. With 540 px the label gets ~25 px margin on
// each side. Per CLAUDE.md «Per-locale geometry budget»: budget for
// the WIDEST translation, not the English original.
const SCHEMATIC_W = 540

const TOP_Y = SCHEMATIC_PAD_TOP
const RAIL_SPAN = 130
const BOT_Y = TOP_Y + RAIL_SPAN
const SCHEMATIC_H = schematicHeight(RAIL_SPAN)

const SIG_Y = TOP_Y + 90 // signal rail (collector node)

// Column positions — shifted right by 20 from the original to centre the
// schematic body in the wider viewBox.
const RF_IN_X = 80
const C_X = 220      // bypass capacitor column
const RFC_X = 300    // RF choke column
const RF_OUT_X = 460
const NODE_X = RFC_X // collector node = bottom of RFC

const c = pins2(C_X, (TOP_Y + BOT_Y) / 2, 'down')
const rfc = pins2(RFC_X, (TOP_Y + SIG_Y) / 2, 'down')

export default function RfChokeSchematic() {
  const { t } = useTranslation('ui')

  return (
    <Circuit
      width={SCHEMATIC_W}
      height={SCHEMATIC_H}
      maxWidth={520}
      caption={<MathText>{t('ch1_6.rfChokeSchematicCaption')}</MathText>}
    >
      {/* V+ rail at top, spanning from C column to RFC column */}
      <Wire points={[{ x: C_X, y: TOP_Y }, { x: RFC_X, y: TOP_Y }]} />
      {/* C from V+ rail down to GND */}
      <Wire points={[{ x: C_X, y: TOP_Y }, c.p1]} />
      <Wire points={[c.p2, { x: C_X, y: BOT_Y }]} />
      {/* RFC from V+ down to collector node */}
      <Wire points={[{ x: RFC_X, y: TOP_Y }, rfc.p1]} />
      <Wire points={[rfc.p2, { x: RFC_X, y: SIG_Y }]} />

      {/* Signal path: RF in → collector node → RF out */}
      <Wire points={[{ x: RF_IN_X, y: SIG_Y }, { x: NODE_X, y: SIG_Y }, { x: RF_OUT_X, y: SIG_Y }]} />

      {/* GND stub from C bottom (extending the bottom rail just below C) */}
      {/* (No separate ground rail needed — bypass cap returns to GND
          directly at the BOT_Y line under C_X.) */}

      {/* Components */}
      <Capacitor x={C_X} y={(TOP_Y + BOT_Y) / 2} orient="down" label="C" />
      <Inductor x={RFC_X} y={(TOP_Y + SIG_Y) / 2} orient="down" label="RFC" />

      {/* Junction at collector node where signal path meets RFC drop */}
      <Junction x={NODE_X} y={SIG_Y} />
      {/* Junction at top where C and RFC both connect to V+ rail */}
      <Junction x={C_X} y={TOP_Y} />
      <Junction x={RFC_X} y={TOP_Y} />

      {/* Terminal labels */}
      <TerminalLabel x={RF_IN_X - 6} y={SIG_Y} anchor="end">
        {t('ch1_6.rfChokeIn')}
      </TerminalLabel>
      <TerminalLabel x={RF_OUT_X + 6} y={SIG_Y} anchor="start">
        {t('ch1_6.rfChokeOutput')}
      </TerminalLabel>
      <TerminalLabel x={(C_X + RFC_X) / 2} y={TOP_Y - 12} anchor="middle">
        {t('ch1_6.rfChokeVplus')}
      </TerminalLabel>
      <TerminalLabel x={C_X} y={BOT_Y + 14} anchor="middle" tone="mutedFg">
        {t('ch1_6.rfChokeGnd')}
      </TerminalLabel>
    </Circuit>
  )
}
