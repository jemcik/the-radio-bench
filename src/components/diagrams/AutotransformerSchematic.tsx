/**
 * Chapter 1.9 §7 — autotransformer (single-winding transformer with
 * a tap part-way along the winding).
 *
 * Topology — one vertical winding shared by source and load:
 *
 *   ┌───[AcSource]───╮
 *   │                ●  pin1 (winding top)
 *   │                ●  ↑ full
 *   │                ●  │ winding
 *   │                ●  │
 *   │            tap ●──── [R_load] ──╮
 *   │                ●  ↓ tapped       │
 *   │                ●  portion        │
 *   └───────────●────╯──────●──────────╯
 *
 * The same winding is used as both primary (full length) and secondary
 * (tap to bottom). No isolation — the load and source share the bottom
 * terminal. Drawn as an InductorCore (vertical) with a horizontal tap
 * wire branching off two-thirds of the way down.
 *
 * Uses `@/lib/circuit` primitives only.
 */
import {
  Circuit,
  Wire,
  Junction,
  AcSource,
  Resistor,
  InductorCore,
  TerminalLabel,
  Tap,
  pins2,
  SCHEMATIC_PAD_TOP,
  schematicHeight,
} from '@/lib/circuit'
import { useTranslation, Trans } from 'react-i18next'
import { MathVar } from '@/components/ui/math'

const SCHEMATIC_W = 540

const TOP_Y = SCHEMATIC_PAD_TOP + 15
const RAIL_SPAN = 130
const BOT_Y = TOP_Y + RAIL_SPAN
const MID_Y = (TOP_Y + BOT_Y) / 2
const SCHEMATIC_H = schematicHeight(RAIL_SPAN) + 12

const LEFT_EDGE_X = 60
const X_AC = 150
const X_WINDING = 290
// Tap at MID_Y+5 — sits on the winding body and gives a 60 px gap
// down to the bottom rail, which is exactly the resistor SPAN so
// R_load fits horizontally on a tap-height rail with no stretching.
const TAP_Y = MID_Y + 5
const X_LOAD = 410

// Vertical inductor pins at MID_Y ± 30
const W_TOP_Y = MID_Y - 30
const W_BOT_Y = MID_Y + 30

// InductorCore (orient='down') has its bump peaks at +6 from the axis.
// We plant the Tap arrow tip a couple of pixels INSIDE the bump's
// outer stroke (which sits at +7 due to strokeWidth=2) so the
// arrowhead visibly «pokes into» the winding rather than just
// touching its outline.
const BUMP_OFFSET = 4
// Tap arrow length (must match the Tap primitive default).
const TAP_SHAFT = 10
// Where the external tap wire starts: arrow tail = tip + shaft.
const TAP_WIRE_X0 = X_WINDING + BUMP_OFFSET + TAP_SHAFT

// Horizontal load resistor on the tap-height rail
const r = pins2(X_LOAD, TAP_Y)

export default function AutotransformerSchematic() {
  const { t } = useTranslation('ui')

  return (
    <Circuit
      width={SCHEMATIC_W}
      height={SCHEMATIC_H}
      maxWidth={580}
      caption={
        <Trans
          i18nKey="ch1_9.schematicAutoCaption"
          ns="ui"
          components={{ strong: <strong />, var: <MathVar /> }}
        />
      }
    >
      <title>{t('ch1_9.schematicAutoAria')}</title>

      {/* ── PRIMARY LOOP (full winding) ─────────────────────────────── */}
      {/* Top rail: left edge → AcSource → winding top pin */}
      <Wire points={[{ x: LEFT_EDGE_X, y: TOP_Y }, { x: X_AC - 30, y: TOP_Y }]} />
      <Wire points={[{ x: X_AC + 30, y: TOP_Y }, { x: X_WINDING, y: TOP_Y }, { x: X_WINDING, y: W_TOP_Y }]} />

      {/* Left edge wire down to bottom rail */}
      <Wire points={[{ x: LEFT_EDGE_X, y: TOP_Y }, { x: LEFT_EDGE_X, y: BOT_Y }]} />

      {/* Bottom rail: left edge → winding bottom pin */}
      <Wire points={[{ x: LEFT_EDGE_X, y: BOT_Y }, { x: X_WINDING, y: BOT_Y }, { x: X_WINDING, y: W_BOT_Y }]} />

      {/* ── SECONDARY LOOP (tap → R_load → bottom rail) ─────────────── */}
      {/* Tap wire: from arrow shaft end (TAP_TIP_X + tap shaft length)
          horizontally to R_load left pin. The Tap arrow itself is
          rendered as part of COMPONENTS below. */}
      <Wire points={[{ x: TAP_WIRE_X0, y: TAP_Y }, r.p1]} />

      {/* R_load right pin down to bottom rail */}
      <Wire points={[r.p2, { x: r.p2.x, y: BOT_Y }]} />

      {/* Bottom rail extends from winding bottom over to R_load return */}
      <Wire points={[{ x: X_WINDING, y: BOT_Y }, { x: r.p2.x, y: BOT_Y }]} />

      {/* ── COMPONENTS ──────────────────────────────────────────────── */}
      <AcSource x={X_AC} y={TOP_Y} />
      <InductorCore x={X_WINDING} y={MID_Y} orient="down" />
      <Resistor x={X_LOAD} y={TAP_Y} />

      {/* Tap arrow — ARRL-Handbook convention for «wire enters the
          winding HERE». Tip touches the bump peak; shaft extends
          rightward and the tap wire (above) continues from the shaft
          end out to R_load. Replaces a plain junction dot, which
          visually disappeared on the inductor's centreline. */}
      <Tap x={X_WINDING + BUMP_OFFSET} y={TAP_Y} from="right" />

      {/* Junctions: T-joints on rails (tap point itself is now
          marked by the Tap arrow above, not a junction dot). */}
      <Junction x={X_WINDING} y={TOP_Y} />
      <Junction x={X_WINDING} y={BOT_Y} />
      <Junction x={r.p2.x} y={BOT_Y} />

      {/* ── LABELS ──────────────────────────────────────────────────── */}
      <TerminalLabel x={X_AC} y={TOP_Y - 22} anchor="middle">
        {t('ch1_9.schematicAutoSrc')}
      </TerminalLabel>
      <TerminalLabel
        x={(TAP_WIRE_X0 + r.p1.x) / 2}
        y={TAP_Y - 14}
        anchor="middle"
        tone="mutedFg"
      >
        {t('ch1_9.schematicAutoTap')}
      </TerminalLabel>
      <TerminalLabel x={X_LOAD} y={TAP_Y - 22} anchor="middle">
        {t('ch1_9.schematicAutoLoad')}
      </TerminalLabel>
    </Circuit>
  )
}
