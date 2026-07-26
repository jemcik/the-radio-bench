/**
 * Chapter 4.4 §5 — the anatomy of a contact.
 *
 * A complete QSO read top to bottom, with each transmission in its own block
 * and the reason for it directly underneath. The point of drawing it rather
 * than listing it in prose is that a contact is a *turn-taking* structure: the
 * two lanes make it visible that nobody talks twice in a row, and that each
 * turn answers the one above it.
 *
 * ── Geometry: one source of truth ──────────────────────────────────────
 * Every block's y is `TOP + i * PITCH`; its x is decided solely by which lane
 * the step belongs to. Nothing is hand-placed, so adding or removing a step
 * cannot desynchronise the blocks from the spine that connects them.
 *
 * Width budget for the block text (BLOCK_W = 330, 12 px inner padding each
 * side → 306 px usable):
 *   spoken line, EN «UR5HAA, this is W1AW»        20 ch × 6.5 ≈ 130 px
 *   spoken line, UA «UR5HAA, тут W1AW»            17 ch × 7.0 ≈ 119 px
 *   purpose line, EN «who you are calling, and who you are»
 *                                                 38 ch × 6.0 ≈ 228 px
 *   purpose line, UA (~60 % wider than EN)        ≈ 300 px  ← the binding case
 * → 306 px usable clears the worst case with ~6 px to spare. Purpose strings
 *   must stay under ~40 EN characters; longer belongs in the prose, not here.
 */
import { useTranslation } from 'react-i18next'
import { svgTokens } from './svgTokens'

const VB_W = 760
const VB_H = 556

const BLOCK_W = 330
const BLOCK_H = 66
const PITCH = 84
const TOP = 44

/** The spine runs down the middle; lanes hang either side of it. */
const SPINE_X = VB_W / 2
const LANE_L = SPINE_X - 24 - BLOCK_W
const LANE_R = SPINE_X + 24

/**
 * Six steps in three MIRRORED PAIRS, alternating stations. `a` is the station
 * that called CQ, `b` the one that answered.
 *
 * The mirroring is the correction that matters. An earlier version had one side
 * give its name and location and the other reply with only «73, thanks» — which
 * a reader flagged as not merely incomplete but rude, and they were right. The
 * IARU operating guide's own worked example (Ethics and Operating Procedures for
 * the Radio Amateur, §II.8.4) shows both stations exchanging report, name and
 * location, and both thanking each other before signing. If one side offers
 * something, the other returns it; that reciprocity IS the shape of a contact.
 */
const STEPS = [
  { key: 'cq', lane: 'a' },
  { key: 'reply', lane: 'b' },
  { key: 'exchange', lane: 'a' },
  { key: 'exchangeBack', lane: 'b' },
  { key: 'close', lane: 'a' },
  { key: 'closeBack', lane: 'b' },
] as const

export default function QsoTimeline() {
  const { t } = useTranslation('ui')

  return (
    <svg
      width={VB_W}
      height={VB_H}
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      style={{ margin: '0 auto', maxWidth: '100%', height: 'auto' }}
      role="img"
      aria-label={t('ch4_4.qsoTimeline.aria')}
    >
      {/* Lane headings — which station is which */}
      <text
        x={LANE_L + BLOCK_W}
        y={26}
        textAnchor="end"
        fontSize="14"
        fontWeight={600}
        fill={svgTokens.fg}
      >
        {t('ch4_4.qsoTimeline.stationA')}
      </text>
      <text x={LANE_R} y={26} textAnchor="start" fontSize="14" fontWeight={600} fill={svgTokens.fg}>
        {t('ch4_4.qsoTimeline.stationB')}
      </text>

      {/* The spine: time running downward */}
      <line
        x1={SPINE_X}
        y1={TOP - 8}
        x2={SPINE_X}
        y2={TOP + (STEPS.length - 1) * PITCH + BLOCK_H + 8}
        stroke={svgTokens.border}
        strokeWidth={2}
      />

      {STEPS.map((step, i) => {
        const y = TOP + i * PITCH
        const x = step.lane === 'a' ? LANE_L : LANE_R
        const midY = y + BLOCK_H / 2
        // The connector always runs from the spine to the near edge of the block.
        const connectorX2 = step.lane === 'a' ? x + BLOCK_W : x

        return (
          <g key={step.key}>
            <line
              x1={SPINE_X}
              y1={midY}
              x2={connectorX2}
              y2={midY}
              stroke={svgTokens.border}
              strokeWidth={1.5}
            />
            <circle cx={SPINE_X} cy={midY} r={4} fill={svgTokens.primary} />

            <rect
              x={x}
              y={y}
              width={BLOCK_W}
              height={BLOCK_H}
              rx={8}
              fill={svgTokens.note}
              fillOpacity={0.08}
              stroke={svgTokens.border}
              strokeWidth={1}
            />
            <text x={x + 12} y={y + 26} fontSize="14" fontWeight={600} fill={svgTokens.fg}>
              {t(`ch4_4.qsoTimeline.${step.key}Said`)}
            </text>
            <text x={x + 12} y={y + 48} fontSize="13" fill={svgTokens.mutedFg}>
              {t(`ch4_4.qsoTimeline.${step.key}Why`)}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
