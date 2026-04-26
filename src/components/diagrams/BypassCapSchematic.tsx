/**
 * Chapter 1.5 §7.2 — bypass / decoupling capacitor.
 *
 * Topology:
 *   V+ supply rail along the top. An IC (drawn as a labelled
 *   rectangular body with two short pin stubs on its left edge for
 *   V_cc and GND). A bypass capacitor shunts the V_cc pin to GND,
 *   drawn visually close to the chip to anchor the «as close to the
 *   chip as possible» placement rule.
 *
 *  Pin-stub convention (IEEE-style): the chip's left edge is at
 *  BODY_X. Pin stubs extend horizontally OUT of the body to the left
 *  by STUB_LEN; the external wires connect at the stub ends. Pin
 *  names (V_cc, GND) sit INSIDE the body, next to each pin.
 *
 *  Uses `@/lib/circuit` primitives for the passive elements and
 *  plain SVG for the IC body (no generic-IC primitive exists and
 *  this diagram is the only use-site, so adding one is overkill).
 */
import {
  Circuit,
  Wire,
  Junction,
  Capacitor,
  TerminalLabel,
  pins2,
  SCHEMATIC_PAD_TOP,
  schematicHeight,
} from '@/lib/circuit'
import { useTranslation } from 'react-i18next'
import { svgTokens } from './svgTokens'
import { renderLabelContent } from '@/lib/circuit/SymbolLabel'
import { MathText } from '@/components/ui/math-text'

const SCHEMATIC_W = 420

const TOP_Y = SCHEMATIC_PAD_TOP
const RAIL_SPAN = 130
const BOT_Y = TOP_Y + RAIL_SPAN
const SCHEMATIC_H = schematicHeight(RAIL_SPAN)

// ── Chip geometry ─────────────────────────────────────────────────
// The external wire comes into the pin-stub tip at x = PIN_TIP_X;
// the stub itself runs from PIN_TIP_X to BODY_X (short horizontal
// line outside the body). BODY_X..BODY_X+BODY_W is the chip outline.
const PIN_TIP_X = 280
const STUB_LEN = 14
const BODY_X = PIN_TIP_X + STUB_LEN
const BODY_W = 80
const BODY_H = 60
const BODY_Y = (TOP_Y + BOT_Y) / 2 - BODY_H / 2
// Pin Y positions: Vcc near the top of the body, GND near the bottom.
const VCC_Y = BODY_Y + 16
const GND_Y = BODY_Y + BODY_H - 16

// Bypass cap between the V+ and GND rails, placed just to the LEFT
// of the chip to anchor the «as close as possible» placement rule.
const BYPASS_X = 200
const bypass = pins2(BYPASS_X, (TOP_Y + BOT_Y) / 2, 'down')

// External V+ supply terminal on the far left.
const VPLUS_X = 60

export default function BypassCapSchematic() {
  const { t } = useTranslation('ui')

  return (
    <Circuit
      width={SCHEMATIC_W}
      height={SCHEMATIC_H}
      maxWidth={500}
      caption={<MathText>{t('ch1_5.bypassCapSchematicCaption')}</MathText>}
    >
      {/* Top V+ rail — straight from the VPLUS terminal across to
          above the chip pin-stub tip. */}
      <Wire points={[{ x: VPLUS_X, y: TOP_Y }, { x: PIN_TIP_X, y: TOP_Y }]} />
      {/* Drop from the top rail into the V_cc pin stub tip. */}
      <Wire points={[{ x: PIN_TIP_X, y: TOP_Y }, { x: PIN_TIP_X, y: VCC_Y }]} />
      {/* V_cc pin stub — short horizontal segment from tip into body. */}
      <Wire points={[{ x: PIN_TIP_X, y: VCC_Y }, { x: BODY_X, y: VCC_Y }]} />

      {/* GND pin stub mirror: from body out to the rail. */}
      <Wire points={[{ x: BODY_X, y: GND_Y }, { x: PIN_TIP_X, y: GND_Y }]} />
      {/* Drop from GND pin stub tip down to the bottom rail. */}
      <Wire points={[{ x: PIN_TIP_X, y: GND_Y }, { x: PIN_TIP_X, y: BOT_Y }]} />
      {/* Bottom GND rail back to the VPLUS return terminal. */}
      <Wire points={[{ x: PIN_TIP_X, y: BOT_Y }, { x: VPLUS_X, y: BOT_Y }]} />

      {/* Bypass cap between the two rails at BYPASS_X. */}
      <Wire points={[{ x: BYPASS_X, y: TOP_Y }, bypass.p1]} />
      <Wire points={[bypass.p2, { x: BYPASS_X, y: BOT_Y }]} />

      <Capacitor
        x={BYPASS_X}
        y={(TOP_Y + BOT_Y) / 2}
        orient="down"
        label="C"
        value="100 nF"
      />

      {/* T-junctions: where the bypass branch taps each rail, and
          where the V+ / GND rails turn down to the pin stubs. */}
      <Junction x={BYPASS_X} y={TOP_Y} />
      <Junction x={BYPASS_X} y={BOT_Y} />
      <Junction x={PIN_TIP_X} y={TOP_Y} />
      <Junction x={PIN_TIP_X} y={BOT_Y} />

      {/* Chip body — rectangle sitting to the RIGHT of the pin stubs. */}
      <rect
        x={BODY_X}
        y={BODY_Y}
        width={BODY_W}
        height={BODY_H}
        fill="none"
        stroke={svgTokens.fg}
        strokeWidth={1.2}
        rx={2}
      />

      {/* Pin names INSIDE the body, next to each pin entry point. */}
      <text
        x={BODY_X + 5}
        y={VCC_Y}
        fontFamily="inherit"
        fontSize="10"
        fontStyle="italic"
        fill={svgTokens.mutedFg}
        textAnchor="start"
        dominantBaseline="central"
      >
        {renderLabelContent('V_cc')}
      </text>
      <text
        x={BODY_X + 5}
        y={GND_Y}
        fontFamily="inherit"
        fontSize="10"
        fontStyle="italic"
        fill={svgTokens.mutedFg}
        textAnchor="start"
        dominantBaseline="central"
      >
        GND
      </text>

      {/* Chip-type label below the body — keeps it out of the
          cramped interior and gives room for UA «Мікросхема» which
          would not fit centred inside the 80-px body at readable
          font size. */}
      <text
        x={BODY_X + BODY_W / 2}
        y={BODY_Y + BODY_H + 14}
        fontFamily="inherit"
        fontSize="12"
        fontStyle="italic"
        textAnchor="middle"
        fill={svgTokens.mutedFg}
      >
        {t('ch1_5.bypassCapChipLabel')}
      </text>

      {/* External supply terminals on the far left. */}
      <TerminalLabel x={VPLUS_X - 6} y={TOP_Y} anchor="end">
        {t('ch1_5.bypassCapVplus')}
      </TerminalLabel>
      <TerminalLabel x={VPLUS_X - 6} y={BOT_Y} anchor="end" tone="mutedFg">
        {t('ch1_5.bypassCapGnd')}
      </TerminalLabel>
    </Circuit>
  )
}
