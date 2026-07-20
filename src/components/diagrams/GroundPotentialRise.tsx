/**
 * Chapter 4.3 §5 — why a station with two earth rods destroys itself, and why
 * bonding (not a better earth) is the cure.
 *
 * The instinct every beginner has is "get a really good earth and the lightning
 * drains away". The arithmetic kills that instinct outright, so the diagram
 * leads with it: 30 kA — an ordinary median stroke — into a *typical* 25 Ω rod
 * puts that rod 750 kV above true earth. Into a heroic 1 Ω rod it is still
 * 30 kV. There is no achievable earth resistance that keeps the rod near zero.
 *
 * So the fight is not to hold anything at 0 V — it is to stop a DIFFERENCE
 * appearing. Left panel: mast on its own rod, rig on the mains rod ten metres
 * away. The strike lifts the mast rod to 750 kV; the mains rod, outside the
 * soil-ionisation region, stays near true earth; and the only thing bridging
 * that 750 kV is the coax, through the radio. Right panel: bond both to one
 * point and the whole station rises together — same 750 kV, but across the
 * equipment there is nothing.
 *
 * That is the chapter's line: damage comes from the difference, not the rise.
 *
 * Geometry: every coordinate derives from `panelX` and the shared GROUND_Y /
 * MAST_X / RIG_X constants, so the two panels cannot drift out of alignment
 * with each other (the ch4.1 scene-diagram failure was exactly that class —
 * hand-tuned duplicates that stopped agreeing).
 *
 * Not a Circuit schematic: a mast, a rod and a building are not circuit
 * primitives, and `@/lib/circuit` has no symbol for any of them. This is a
 * scene/annotation figure, which is the genre where bare SVG is correct.
 */
import { Trans, useTranslation } from 'react-i18next'
import { svgTokens } from './svgTokens'
import { useLocaleFormatter, useUnitFormatter } from '@/lib/hooks/useLocaleFormatter'

const VB_W = 760
const VB_H = 310

// Sized off the UKRAINIAN verdict line, not the English one. EN «Everything
// rises together — nothing across it» fits 304 px; UA «Потенціал усього
// зростає одночасно — різниці немає» is ~337 px and overflowed the panel into
// its neighbour. The jsdom label-bounds gate caught it the moment the
// translation landed — which is the argument for sizing to the wider locale up
// front (same reasoning, and same 760 canvas, as MainsColourCode).
const PANEL_W = 364
const PANEL_A_X = 8
const PANEL_B_X = 388 // 8 + 364 + 16 gap → panel B ends at 752, 8 px margin
const PANEL_Y = 30
const PANEL_H = 268

// ── Vertical budget (all clearances checked against 14 px label boxes) ──
//   50  panel title           → box ≈ 43–57
//   64  strike bolt starts    → 7 px clear of the title's underside
//   88  mast top              → the bolt occupies 64–88 only
//  124  coax run
//  150  rig top               → 26 px clear of the coax
//  194  rig bottom
//  216  soil surface
//  242  rod tip
//  256  rod voltage label     → box ≈ 249–263
//  286  panel verdict         → box ≈ 279–293, so 16 px clear of the rod label
// The first draft had the bolt rising to y=52 (through the title) and the rod
// label at 278 against a verdict at 286 — both real collisions, both caught by
// the jsdom label-bounds gate, neither visible without measuring.
const GROUND_Y = 216 // the soil surface
const MAST_X = 48 // from panel left edge
const MAST_TOP_Y = 88
const STRIKE_TOP_Y = 64
const RIG_X = 150 // rig box left edge, from panel left edge
const RIG_W = 72
const RIG_Y = 150
const RIG_H = 44
const COAX_Y = 124 // the feedline run
const ROD_LEN = 26
const ROD_LABEL_Y = GROUND_Y + ROD_LEN + 14
const VERDICT_Y = PANEL_Y + PANEL_H - 12

/** Rod voltage for a 30 kA stroke, V = I·R. Both are round, quotable numbers. */
const STROKE_KA = 30
const ROD_OHMS = 25
const ROD_KV = STROKE_KA * ROD_OHMS // 750 kV

export default function GroundPotentialRise() {
  const { t } = useTranslation('ui')
  const { num } = useLocaleFormatter()
  const tUnit = useUnitFormatter()

  /** One panel. `bonded=false` is the failure case, `true` is the fix. */
  const renderPanel = (x: number, bonded: boolean) => {
    const mastX = x + MAST_X
    const rigX = x + RIG_X
    const rigMidY = RIG_Y + RIG_H / 2
    // In the bonded case both legs run to ONE rod under the mast; in the
    // broken case the rig has its own rod under itself.
    const rigRodX = bonded ? mastX : rigX + RIG_W / 2

    return (
      <g>
        <rect
          x={x} y={PANEL_Y} width={PANEL_W} height={PANEL_H} rx={8}
          fill="none"
          stroke={bonded ? svgTokens.experiment : svgTokens.danger}
          strokeWidth={1.4}
        />
        <text
          x={x + 14} y={PANEL_Y + 20}
          fontSize="0.812em" fontFamily="inherit" fontWeight="700"
          fill={bonded ? svgTokens.experiment : svgTokens.danger}
        >
          {t(bonded ? 'ch4_3.gprBondedTitle' : 'ch4_3.gprBrokenTitle')}
        </text>

        {/* ── Soil surface ─────────────────────────────────────── */}
        <line
          x1={x + 14} y1={GROUND_Y} x2={x + PANEL_W - 14} y2={GROUND_Y}
          stroke={svgTokens.mutedFg} strokeWidth={1.4}
        />

        {/* ── Mast ─────────────────────────────────────────────── */}
        <line x1={mastX} y1={MAST_TOP_Y} x2={mastX} y2={GROUND_Y} stroke={svgTokens.fg} strokeWidth={2} />
        {/* The strike, arriving. Confined to STRIKE_TOP_Y..MAST_TOP_Y so it
            never rises into the panel title above it. */}
        <path
          d={`M ${mastX - 18} ${STRIKE_TOP_Y} L ${mastX - 4} ${STRIKE_TOP_Y + 10} L ${mastX - 12} ${STRIKE_TOP_Y + 12} L ${mastX + 2} ${MAST_TOP_Y}`}
          fill="none" stroke={svgTokens.danger} strokeWidth={2.4} strokeLinejoin="round"
        />

        {/* ── Rig ──────────────────────────────────────────────── */}
        <rect
          x={rigX} y={RIG_Y} width={RIG_W} height={RIG_H} rx={4}
          fill="none" stroke={svgTokens.fg} strokeWidth={1.6}
        />
        <text
          x={rigX + RIG_W / 2} y={rigMidY}
          fontSize="0.812em" textAnchor="middle" dominantBaseline="middle"
          fontFamily="inherit" fill={svgTokens.fg}
        >
          {t('ch4_3.gprRig')}
        </text>

        {/* ── Coax: mast → rig ─────────────────────────────────── */}
        <path
          d={`M ${mastX} ${COAX_Y} L ${rigX} ${COAX_Y} L ${rigX} ${RIG_Y}`}
          fill="none" stroke={svgTokens.fg} strokeWidth={1.4}
        />

        {/* ── Earth legs ───────────────────────────────────────── */}
        {/* Mast rod */}
        <line x1={mastX} y1={GROUND_Y} x2={mastX} y2={GROUND_Y + ROD_LEN} stroke={svgTokens.fg} strokeWidth={2.4} />
        {/* Rig's earth leg — down to its own rod, or across to the shared one */}
        {bonded ? (
          <path
            d={`M ${rigX + RIG_W / 2} ${RIG_Y + RIG_H} L ${rigX + RIG_W / 2} ${GROUND_Y - 14} L ${mastX} ${GROUND_Y - 14}`}
            fill="none" stroke={svgTokens.experiment} strokeWidth={2.4}
          />
        ) : (
          <>
            <line
              x1={rigRodX} y1={RIG_Y + RIG_H} x2={rigRodX} y2={GROUND_Y + ROD_LEN}
              stroke={svgTokens.fg} strokeWidth={2.4}
            />
          </>
        )}

        {/* ── Voltage annotations — the whole argument ─────────── */}
        {/* The rod both panels share: lifted to 750 kV either way. */}
        <text
          x={mastX} y={ROD_LABEL_Y}
          fontSize="0.812em" textAnchor="middle" fontFamily="inherit" fontWeight="700"
          fill={svgTokens.danger}
        >
          {num(ROD_KV)} {tUnit('kv')}
        </text>
        {/* Broken: a SECOND rod, still near true earth — that gap is the bug. */}
        {!bonded && (
          <text
            x={rigRodX} y={ROD_LABEL_Y}
            fontSize="0.812em" textAnchor="middle" fontFamily="inherit" fontWeight="700"
            fill={svgTokens.fg}
          >
            {num(0)} {tUnit('v')}
          </text>
        )}
        {/* Bonded: no second rod to label, so the rig's own potential is
            annotated beside it — the point being that it rose TOO. Placed to
            the right of the box (clear of the coax above and the bond wire
            below, both of which run through the box's centreline). */}
        {bonded && (
          <text
            x={rigX + RIG_W + 8} y={rigMidY}
            fontSize="0.812em" textAnchor="start" dominantBaseline="middle"
            fontFamily="inherit" fontWeight="700"
            fill={svgTokens.danger}
          >
            {num(ROD_KV)} {tUnit('kv')}
          </text>
        )}

        {/* ── The verdict, under the panel's own scene ─────────── */}
        <text
          x={x + PANEL_W / 2} y={VERDICT_Y}
          fontSize="0.812em" textAnchor="middle" fontFamily="inherit" fontWeight="600"
          fill={bonded ? svgTokens.experiment : svgTokens.danger}
        >
          {t(bonded ? 'ch4_3.gprBondedVerdict' : 'ch4_3.gprBrokenVerdict')}
        </text>
      </g>
    )
  }

  return (
    <figure className="my-6 not-prose">
      <svg
        width={VB_W}
        height={VB_H}
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        role="img"
        aria-label={t('ch4_3.gprAria')}
        style={{ display: 'block', maxWidth: '100%', height: 'auto', margin: '0 auto', fontSize: '1rem' }}
      >
        {renderPanel(PANEL_A_X, false)}
        {renderPanel(PANEL_B_X, true)}
      </svg>

      <figcaption className="text-[13px] text-muted-foreground mt-2 px-1">
        <Trans i18nKey="ch4_3.gprCaption" ns="ui" components={{ strong: <strong /> }} />
      </figcaption>
    </figure>
  )
}
