/**
 * Chapter 1.9 §7 — 4:1 voltage balun. A 1:2 turns-ratio transformer
 * connected so the unbalanced (coax) side has its bottom terminal
 * grounded, while the balanced (dipole) side has neither terminal
 * grounded — the two leads carry equal-and-opposite voltages relative
 * to the centre.
 *
 * Topology:
 *
 *   coax inner ──[primary ●●]──┤ ┤──[secondary ●●●●]── + dipole leg 1
 *
 *   coax shield ─[primary ●●]──┤ ┤──[secondary ●●●●]── − dipole leg 2
 *           │
 *          GND
 *
 * The transformer drawing is the standard library primitive; the
 * unbalanced/balanced distinction is shown by adding a ground symbol
 * on one of the primary leads only.
 *
 * Uses `@/lib/circuit` primitives only.
 */
import {
  Circuit,
  Wire,
  Transformer,
  Ground,
  TerminalLabel,
  SCHEMATIC_PAD_TOP,
  schematicHeight,
} from '@/lib/circuit'
import { useTranslation, Trans } from 'react-i18next'

const SCHEMATIC_W = 580

const TOP_Y = SCHEMATIC_PAD_TOP + 25
const RAIL_SPAN = 100
const BOT_Y = TOP_Y + RAIL_SPAN
const MID_Y = (TOP_Y + BOT_Y) / 2
// Extra +25 below the bottom rail to accommodate the compact Ground
// symbol hanging beneath the shield wire. Layout below BOT_Y (pin
// 10 local px, stripes halved & tightened — see Ground docstring):
//   +0    bottom rail / Ground pin tip
//   +10   pin base = top stripe (20-px wide)
//   +15   middle stripe (10-px wide)
//   +20   smallest stripe (2.5-px wide)
//   +25   bottom edge with breathing room
// The default `schematicHeight` only allots ~20 px below BOT_Y (PAD_BOT),
// which would just barely clip the smallest stripe — hence +25.
const SCHEMATIC_H = schematicHeight(RAIL_SPAN) + 25

// Rails moved inward (was 60 / 525) so the «Коаксіал 50 Ом» and
// «Диполь 200 Ом» labels — anchored OUTSIDE the rail ends — fit inside
// the SVG viewBox. With LEFT_EDGE_X=110 a 95-px label at x=104 stops
// at x≈19; with RIGHT_EDGE_X=470 a 95-px label at x=476 ends at x≈561,
// well inside SCHEMATIC_W=580.
const LEFT_EDGE_X = 110
const X_TX = 290
const RIGHT_EDGE_X = 470

// Transformer in native orient='right' — primary winding vertical on
// the LEFT, secondary vertical on the RIGHT (matches the horizontal
// coax→balun→dipole signal flow). chris-pikul pin positions after
// the wrapper's 0.4 down-scale:
//   primary p1 (top-left)     = (X_TX-30, MID_Y-25)
//   primary p2 (bottom-left)  = (X_TX-30, MID_Y+25)
//   secondary p1 (top-right)  = (X_TX+30, MID_Y-25)
//   secondary p2 (bot-right)  = (X_TX+30, MID_Y+25)
const TX_PRI_X = X_TX - 30
const TX_SEC_X = X_TX + 30
const TX_TOP_Y = MID_Y - 25
const TX_BOT_Y = MID_Y + 25

// Ground symbol on the primary's bottom terminal — placed exactly at
// the left edge of the bottom rail (X = LEFT_EDGE_X). Earlier this
// sat at x=170 with a 60-px wire stub running from LEFT_EDGE_X up to
// it; once the «Земля» text label was removed, that stub had nothing
// terminating its left end and read as a wire to nowhere. Anchoring
// ⏚ at the rail's left endpoint makes it the visual «entry point»
// for the coax shield — no orphan wire, and the symbol sits directly
// under where «Коаксіал 50 Ом» reads, reinforcing «coax shield = ground».
const X_GND = LEFT_EDGE_X

export default function BalunSchematic() {
  const { t } = useTranslation('ui')

  return (
    <Circuit
      width={SCHEMATIC_W}
      height={SCHEMATIC_H}
      maxWidth={620}
      caption={
        <Trans
          i18nKey="ch1_9.schematicBalunCaption"
          ns="ui"
          components={{ strong: <strong /> }}
        />
      }
    >
      <title>{t('ch1_9.schematicBalunAria')}</title>

      {/* ── UNBALANCED (coax) SIDE ──────────────────────────────────── */}
      {/* Inner conductor: left edge → primary top */}
      <Wire points={[{ x: LEFT_EDGE_X, y: TOP_Y }, { x: TX_PRI_X, y: TOP_Y }, { x: TX_PRI_X, y: TX_TOP_Y }]} />

      {/* Shield: ground tap (= left edge) → primary bottom. The ⏚
          symbol IS the left endpoint of the bottom rail; no separate
          stub from the rail's left edge to the ground tap. */}
      <Wire points={[{ x: X_GND, y: BOT_Y }, { x: TX_PRI_X, y: BOT_Y }, { x: TX_PRI_X, y: TX_BOT_Y }]} />

      {/* ── BALANCED (dipole) SIDE ──────────────────────────────────── */}
      {/* Top dipole leg: secondary top → right edge */}
      <Wire points={[{ x: TX_SEC_X, y: TX_TOP_Y }, { x: TX_SEC_X, y: TOP_Y }, { x: RIGHT_EDGE_X, y: TOP_Y }]} />

      {/* Bottom dipole leg: secondary bottom → right edge (NO ground) */}
      <Wire points={[{ x: TX_SEC_X, y: TX_BOT_Y }, { x: TX_SEC_X, y: BOT_Y }, { x: RIGHT_EDGE_X, y: BOT_Y }]} />

      {/* ── COMPONENTS ──────────────────────────────────────────────── */}
      <Transformer x={X_TX} y={MID_Y} ratio="1 : 2" />
      {/* Ground symbol — `orient='right'` is the unrotated chris-pikul
          path with the shortened pin (10 local px, see Ground docstring).
          Pin tip at local (0, -10), so for the tip to land on the rail
          at y=BOT_Y we set the component origin to y=BOT_Y+10. Stripes
          sit at y=BOT_Y+10 (top, 40px wide), +20 (middle, 20px), +30
          (smallest, 5px). */}
      <Ground x={X_GND} y={BOT_Y + 10} orient="right" />

      {/* ── LABELS ──────────────────────────────────────────────────── */}
      {/* «Коаксіал 50 Ом» / «Диполь 200 Ом» are positioned vertically
          between the two rails (y=MID_Y) rather than only on the top
          wire. This communicates that the impedance is the property
          of the WIRE PAIR (across the two conductors), and reads as
          labelling BOTH legs — important for the dipole side, where
          the bottom wire is also a signal-carrying leg of the
          balanced output, not a return. The «Земля» text label is
          intentionally absent: the ⏚ ground symbol on the shield is
          self-explanatory, a redundant text label only adds noise. */}
      <TerminalLabel x={LEFT_EDGE_X - 6} y={MID_Y} anchor="end">
        {t('ch1_9.schematicBalunCoax')}
      </TerminalLabel>
      <TerminalLabel x={RIGHT_EDGE_X + 6} y={MID_Y} anchor="start">
        {t('ch1_9.schematicBalunDipole')}
      </TerminalLabel>
    </Circuit>
  )
}
