/**
 * Chapter 4.5 §3 — what the harmonised document does when you cross a border.
 *
 * Two directions, because the reader will meet both: a Ukrainian operator
 * abroad, and a visitor operating from Ukraine. The figure shows the one thing
 * that visibly changes — the call sign — because that is the part an operator
 * has to get right on air, and it is symmetric in a way prose makes laborious.
 *
 * ── Sources ────────────────────────────────────────────────────────────
 * Регламент аматорського радіозв'язку України, розділ VI п.5 — on short visits
 * (up to three months) to CEPT countries, and to non-members that apply CEPT
 * T/R 61-01 and ECC (05)06, the harmonised document is enough on its own; the
 * operator uses their own call sign with the visited country's prefix in front.
 * Beyond three months they apply to the country they are in, attaching the
 * HAREC or NOVICE certificate.
 * Розділ VI п.6 — the mirror case: a visitor holding a CEPT licence may operate
 * in Ukraine for up to three months on the bands, emission classes and powers
 * this Регламент sets.
 * Розділ IX п.5 — a visiting amateur prefixes «UT» to their own call sign.
 * Додаток 1 — the Ukrainian harmonised document itself states, in four
 * languages, that it complies with the CEPT RADIO AMATEUR LICENCE.
 *
 * ── Text placement ─────────────────────────────────────────────────────
 * Only call signs and a two-word direction label live in the SVG; call signs
 * are Latin and fixed-width in every locale, and the direction labels are ≤11
 * characters in both EN and UA. The three-month rule, and what happens past
 * it, are in the figcaption, where the text wraps.
 */
import { useTranslation } from 'react-i18next'
import { svgTokens } from './svgTokens'

const VB_W = 640
const VB_H = 176

const BOX_W = 150
const BOX_H = 40
const LEFT_X = 90
const RIGHT_X = 400

const ARROW_X0 = LEFT_X + BOX_W + 10 // 250
const ARROW_X1 = RIGHT_X - 10 // 390

/** Each direction: the call sign at home, and the call sign as signed away. */
const DIRECTIONS = [
  { key: 'out', labelY: 20, boxY: 30, from: 'UR5XXX', to: 'DL/UR5XXX' },
  { key: 'in', labelY: 112, boxY: 122, from: 'DL1ABC', to: 'UT/DL1ABC' },
] as const

function CallBox({ x, y, text, accent }: { x: number; y: number; text: string; accent: boolean }) {
  return (
    <>
      <rect
        x={x}
        y={y}
        width={BOX_W}
        height={BOX_H}
        rx={4}
        fill={accent ? svgTokens.primary : svgTokens.note}
        fillOpacity={accent ? 0.2 : 0.14}
        stroke={accent ? svgTokens.primary : svgTokens.note}
      />
      <text
        x={x + BOX_W / 2}
        y={y + BOX_H / 2 + 5}
        textAnchor="middle"
        fontSize="15"
        fontWeight={600}
        fill={svgTokens.fg}
      >
        {text}
      </text>
    </>
  )
}

export default function CeptPortability() {
  const { t } = useTranslation('ui')

  return (
    <svg
      width={VB_W}
      height={VB_H}
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      role="img"
      aria-label={t('ch4_5.ceptAria')}
      style={{ margin: '0 auto', maxWidth: '100%', height: 'auto' }}
    >
      <defs>
        <marker id="cept-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
          <path d="M0 0 L10 5 L0 10 z" fill={svgTokens.mutedFg} />
        </marker>
      </defs>

      {DIRECTIONS.map(d => {
        const midY = d.boxY + BOX_H / 2
        return (
          <g key={d.key}>
            <text x={LEFT_X} y={d.labelY} fontSize="13" fontWeight={600} fill={svgTokens.mutedFg}>
              {t(`ch4_5.cept_${d.key}_label`)}
            </text>
            <CallBox x={LEFT_X} y={d.boxY} text={d.from} accent={false} />
            <line
              x1={ARROW_X0}
              y1={midY}
              x2={ARROW_X1}
              y2={midY}
              stroke={svgTokens.mutedFg}
              strokeWidth={1.5}
              markerEnd="url(#cept-arrow)"
            />
            <CallBox x={RIGHT_X} y={d.boxY} text={d.to} accent />
          </g>
        )
      })}
    </svg>
  )
}
