/**
 * Chapter 4.5 §5 — the three Ukrainian qualifications, and what each opens.
 *
 * Three columns whose HEIGHT is the shortwave power ceiling of that class, so
 * the staircase is a quantity and not an ornament: 40 W, 100 W, 200 W really
 * are in that proportion, and the reader sees the step up before reading a
 * word. (An earlier figure in this chapter was three empty boxes; the lesson
 * taken from deleting it is that a shape has to encode something.)
 *
 * ── Sources ────────────────────────────────────────────────────────────
 * Регламент аматорського радіозв'язку України, розділ V п.1 — the three
 * qualifications: A (вища, HAREC), B (радіоаматор-початківець, NOVICE),
 * C (радіоаматор-учень, Entry-Level).
 * Розділ V п.10 — the examination programme for each, and which CEPT document
 * it follows: C → ECC REP 089 (додаток 3), B → ITU-R M.1544-1 and ERC REPORT 32
 * (додаток 4), A → CEPT T/R 61-02 (додаток 5).
 * Додаток 2 таблиця 12 — the shortwave ceilings drawn here: 40 / 100 / 200 W.
 *
 * The bars are the HF figure on purpose. Every class is held to 5 W at 144 and
 * 430 MHz, so a VHF bar chart would be three identical columns and would teach
 * the opposite of the truth; the caption says the ceiling shown is the
 * shortwave one.
 *
 * ── Text placement ─────────────────────────────────────────────────────
 * Only the class letter and the wattage sit in the SVG — neither wraps in any
 * locale. The qualification name and the examination document go in the HTML
 * grid below, filled ROW BY ROW so the two label rows keep a shared baseline
 * however wide a locale makes any one cell. (Filling by column let the middle
 * cell wrap and knocked its neighbour's row 18 px out of line in ItuRegionsMap;
 * measured, not guessed.)
 */
import { useTranslation } from 'react-i18next'
import { svgTokens } from './svgTokens'

const VB_W = 640
const VB_H = 190

const COL_W = 150
const GUTTER = 40
const START_X = (VB_W - (COL_W * 3 + GUTTER * 2)) / 2 // 35

const BASE_Y = 168
/** 200 W maps to this height; the others scale linearly from it. */
const MAX_H = 128
const MAX_W = 200

const PADDING_PCT = `${(START_X / VB_W) * 100}%`
const GAP_PCT = `${(GUTTER / VB_W) * 100}%`

/** Lowest qualification first, so the staircase rises left to right. */
const STEPS = [
  { key: 'c', letter: 'C', watts: 40 },
  { key: 'b', letter: 'B', watts: 100 },
  { key: 'a', letter: 'A', watts: 200 },
] as const

function colX(i: number): number {
  return START_X + i * (COL_W + GUTTER)
}

export default function LicenceLadder() {
  const { t } = useTranslation('ui')

  return (
    <div style={{ maxWidth: VB_W, margin: '0 auto' }}>
      <svg
        width={VB_W}
        height={VB_H}
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        role="img"
        aria-label={t('ch4_5.ladderAria')}
        style={{ display: 'block', maxWidth: '100%', height: 'auto' }}
      >
        {STEPS.map((s, i) => {
          const h = (s.watts / MAX_W) * MAX_H
          const y = BASE_Y - h
          const isTop = s.key === 'a'
          return (
            <g key={s.key}>
              <rect
                x={colX(i)}
                y={y}
                width={COL_W}
                height={h}
                rx={4}
                fill={isTop ? svgTokens.primary : svgTokens.note}
                fillOpacity={isTop ? 0.2 : 0.16}
                stroke={isTop ? svgTokens.primary : svgTokens.note}
              />
              {/* Class letter, sitting just above its column. */}
              <text
                x={colX(i) + COL_W / 2}
                y={y - 12}
                textAnchor="middle"
                fontSize="22"
                fontWeight={700}
                fill={svgTokens.fg}
              >
                {s.letter}
              </text>
              {/* Wattage inside the column, near its foot so the short
                  40 W column has room for it too. */}
              <text
                x={colX(i) + COL_W / 2}
                y={BASE_Y - 9}
                textAnchor="middle"
                fontSize="13"
                fill={svgTokens.fg}
              >
                {s.watts} {t('units.w')}
              </text>
            </g>
          )
        })}
        <line x1={START_X - 8} y1={BASE_Y} x2={colX(2) + COL_W + 8} y2={BASE_Y} stroke={svgTokens.border} />
      </svg>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          columnGap: GAP_PCT,
          paddingLeft: PADDING_PCT,
          paddingRight: PADDING_PCT,
          marginTop: '0.5rem',
        }}
        className="text-[13px] leading-snug"
      >
        {STEPS.map(s => (
          <div key={`name-${s.key}`} className="font-semibold text-foreground">
            {t(`ch4_5.ladder_${s.key}_name`)}
          </div>
        ))}
        {STEPS.map(s => (
          <div key={`exam-${s.key}`} className="mt-0.5 text-muted-foreground">
            {t(`ch4_5.ladder_${s.key}_exam`)}
          </div>
        ))}
      </div>
    </div>
  )
}
