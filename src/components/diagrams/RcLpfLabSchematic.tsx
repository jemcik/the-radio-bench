/**
 * Chapter 1.8 — RC LPF lab-bench wiring (companion to lab procedure
 * step 2).
 *
 * Topology — what the reader actually solders / clips together:
 *
 *   P1 hot ───[R]───●───────────── P2 hot
 *                    │ OUT
 *                   [C]
 *                    │
 *   P1 gnd ──────────●───────────── P2 gnd
 *                    GND rail
 *
 * VNA port 1 drives the input via R; OUT is read by VNA port 2 (so
 * port 2 measures whatever V_out develops across C). Both ports'
 * ground returns share one GND rail on the breadboard — without that
 * common ground the S21 measurement is meaningless because the two
 * ports have no shared voltage reference.
 *
 * This is the same RC voltage divider as `RcLowPassSchematic.tsx`,
 * but redrawn with the breadboard's actual two-port instrumentation
 * spelled out. The reader can match each lead in the prose («port 1
 * hot», «port 2 hot», «ground returns to the VNA») to the symbol on
 * this schematic.
 *
 * Uses `@/lib/circuit` primitives only.
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
import { useTranslation, Trans } from 'react-i18next'
import { MathVar } from '@/components/ui/math'

// SVGDiagram's clipPath crops at width × height — anything outside is
// silently hidden. The right-side terminal label «P2 сигнал» needs
// ≈ 130 px of headroom past P2_X, so total width must accommodate
// that without bunching the circuit body. 660 px → 130 px right gutter.
const SCHEMATIC_W = 660

const TOP_Y = SCHEMATIC_PAD_TOP + 18
const RAIL_SPAN = 110
const BOT_Y = TOP_Y + RAIL_SPAN
const SCHEMATIC_H = schematicHeight(RAIL_SPAN) + 24

// Layout columns (left to right):
//   P1 (left port label) … R … OUT/C node … P2 (right port label)
const P1_X = 70
const R_X = 200
const NODE_X = 340
const C_X = NODE_X
const P2_X = 530

const r = pins2(R_X, TOP_Y)
const c = pins2(C_X, (TOP_Y + BOT_Y) / 2, 'down')

export default function RcLpfLabSchematic() {
  const { t } = useTranslation('ui')

  return (
    <Circuit
      width={SCHEMATIC_W}
      height={SCHEMATIC_H}
      maxWidth={680}
      caption={
        <Trans
          i18nKey="ch1_8.schematicRcLpfLabCaption"
          ns="ui"
          components={{
            strong: <strong />,
            var: <MathVar />,
          }}
        />
      }
    >
      <title>{t('ch1_8.schematicRcLpfLabAria')}</title>

      {/* Signal rail: P1 hot → R → OUT (junction) → P2 hot */}
      <Wire points={[{ x: P1_X, y: TOP_Y }, r.p1]} />
      <Wire points={[r.p2, { x: NODE_X, y: TOP_Y }, { x: P2_X, y: TOP_Y }]} />

      {/* Shunt C from OUT node down to GND rail */}
      <Wire points={[{ x: NODE_X, y: TOP_Y }, c.p1]} />
      <Wire points={[c.p2, { x: C_X, y: BOT_Y }]} />

      {/* GND rail under the bench: P1 gnd → C tap → P2 gnd */}
      <Wire points={[{ x: P1_X, y: BOT_Y }, { x: C_X, y: BOT_Y }, { x: P2_X, y: BOT_Y }]} />

      {/* Components */}
      <Resistor x={R_X} y={TOP_Y} label="R" />
      <Capacitor x={C_X} y={(TOP_Y + BOT_Y) / 2} orient="down" label="C" />

      {/* T-junctions — OUT (signal rail) and the GND tap below it */}
      <Junction x={NODE_X} y={TOP_Y} />
      <Junction x={C_X} y={BOT_Y} />

      {/* OUT label sits above the take-off node */}
      <TerminalLabel x={NODE_X} y={TOP_Y - 18} anchor="middle">
        {t('ch1_8.schematicRcLpfLabOutLabel')}
      </TerminalLabel>

      {/* Port 1 (left) terminal labels */}
      <TerminalLabel x={P1_X - 6} y={TOP_Y} anchor="end">
        {t('ch1_8.schematicRcLpfLabP1Hot')}
      </TerminalLabel>
      <TerminalLabel x={P1_X - 6} y={BOT_Y} anchor="end" tone="mutedFg">
        {t('ch1_8.schematicRcLpfLabP1Gnd')}
      </TerminalLabel>

      {/* Port 2 (right) terminal labels */}
      <TerminalLabel x={P2_X + 6} y={TOP_Y} anchor="start">
        {t('ch1_8.schematicRcLpfLabP2Hot')}
      </TerminalLabel>
      <TerminalLabel x={P2_X + 6} y={BOT_Y} anchor="start" tone="mutedFg">
        {t('ch1_8.schematicRcLpfLabP2Gnd')}
      </TerminalLabel>
    </Circuit>
  )
}
