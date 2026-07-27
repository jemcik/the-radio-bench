/**
 * Chapter 4.5 §2 — the three ITU Radio Regions, and what the boundary costs.
 *
 * ── Why this is not a map ──────────────────────────────────────────────
 * The first version drew three empty schematic rectangles standing in for the
 * regions. They were indefensible, and they are gone. A map earns its space by
 * being RECOGNISED — and once every translatable label had to move out to HTML
 * (SVG text cannot wrap, and Ukrainian runs 30–60 % wider), the boxes held
 * nothing but a numeral and a pin, neither of which needs a box. A fake map is
 * strictly worse than either a real one or none: it spends the reader's
 * attention and returns no geography.
 *
 * So the figure answers the question the reader actually has — «what does being
 * in Region 1 cost me?» — by putting the three regions' 40-metre allocations on
 * ONE shared frequency axis. On a shared axis the comparison is read off the
 * bar ENDS; in three separate boxes it would depend on remembering three
 * separate implicit scales. The geography, which is prose and wraps happily,
 * lives in the figcaption instead.
 *
 * This is deliberately the same visual grammar as AllocationVsPlanVsLicence in
 * §4 (bars of differing length on a shared 7.000–7.300 axis). Same band, same
 * axis, same reading gesture — one worked example carried through the chapter,
 * rather than a fresh set of numbers per section.
 *
 * ── Facts, and where each comes from ──────────────────────────────────
 * ITU Radio Regulations, Article 5: 7000–7100 kHz is amateur in all three
 * regions; 7100–7200 kHz is amateur (primary) in Regions 1 AND 3; 7200–7300
 * kHz is amateur in Region 2 only, and carries broadcasting in Region 1.
 * Upper edge of 40 m: Region 1 → 7.200, Region 2 → 7.300, Region 3 → 7.200.
 * Consistent with the Region 1 / Region 2 columns in ch4_1.bandTable.
 *
 * ── Text kept inside the SVG ──────────────────────────────────────────
 * Only the region name («Region 2» / «Регіон 2», ~9 chars). It does not wrap
 * in any locale and must sit on its own bar. The band edge is NOT repeated
 * inside the bar: the axis already carries those numbers, and printing them
 * twice put identical text on screen with two different fills, which the
 * label-attribute-uniform gate rightly rejects.
 * Everything discursive is in the caption.
 *
 * ── Row order: 2, 1, 3 ────────────────────────────────────────────────
 * Kept from the map version, and still worth keeping: it is the order a world
 * map puts them in (Americas, then Europe/Africa, then Asia/Pacific), so the
 * figure does not quietly teach that the numbering runs west to east. The
 * caption says as much.
 */
import { useTranslation } from 'react-i18next'
import { svgTokens } from './svgTokens'

// ── Geometry ────────────────────────────────────────────────────────────
const VB_W = 740
const VB_H = 172

const PAD_L = 30
const PAD_R = 46

const F_MIN = 7000
const F_MAX = 7300
const PLOT_W = VB_W - PAD_L - PAD_R

/** The single source of truth for every horizontal position. */
function x(kHz: number): number {
  return PAD_L + ((kHz - F_MIN) / (F_MAX - F_MIN)) * PLOT_W
}

const BAR_H = 26
const PITCH = 34
const ROW_TOP = 14

const AXIS_Y = ROW_TOP + 3 * PITCH + 6 // 122
const TICK_LEN = 6
const TICK_LABEL_Y = AXIS_Y + 20
const AXIS_LABEL_Y = AXIS_Y + 40

/**
 * Regions in world-map order. `edge` is the upper limit of the 40 m amateur
 * allocation in that region; `pin` marks the one the reader is in.
 */
const REGIONS: { key: string; edge: number; pin?: boolean }[] = [
  { key: 'r2', edge: 7300 },
  { key: 'r1', edge: 7200, pin: true },
  { key: 'r3', edge: 7200 },
]

const TICKS = [7000, 7100, 7200, 7300] as const

/** 7000 → «7.000», matching the band-edge style in ch4_1's band table. */
function tickLabel(kHz: number): string {
  return (kHz / 1000).toFixed(3)
}

export default function ItuRegionsMap() {
  const { t } = useTranslation('ui')

  return (
    <svg
      width={VB_W}
      height={VB_H}
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      role="img"
      aria-label={t('ch4_5.regionsAria')}
      style={{ margin: '0 auto', maxWidth: '100%', height: 'auto' }}
    >
      {REGIONS.map((r, i) => {
        const y = ROW_TOP + i * PITCH
        const right = x(r.edge)
        return (
          <g key={r.key}>
            <rect
              x={x(F_MIN)}
              y={y}
              width={right - x(F_MIN)}
              height={BAR_H}
              rx={3}
              fill={r.pin ? svgTokens.primary : svgTokens.note}
              fillOpacity={r.pin ? 0.2 : 0.16}
              stroke={r.pin ? svgTokens.primary : svgTokens.note}
            />
            <text
              x={x(F_MIN) + 10}
              y={y + BAR_H / 2 + 4}
              fontSize="13"
              fontWeight={r.pin ? 600 : 400}
              fill={svgTokens.fg}
            >
              {t(`ch4_5.regions_${r.key}_name`)}
            </text>
          </g>
        )
      })}

      {/* «You are here» — the one element in the accent colour, so the row
          the reader belongs to is findable before any label is read. */}
      <text
        x={x(7200) + 12}
        y={ROW_TOP + PITCH + BAR_H / 2 + 4}
        fontSize="13"
        fontWeight={600}
        fill={svgTokens.primary}
      >
        {t('ch4_5.regionsYouAreHere')}
      </text>

      {/* Where Region 1 stops and Region 2 carries on. */}
      <line
        x1={x(7200)}
        y1={ROW_TOP}
        x2={x(7200)}
        y2={AXIS_Y}
        stroke={svgTokens.border}
        strokeDasharray="3 3"
      />

      {/* ── Axis ───────────────────────────────────────────────────── */}
      <line x1={PAD_L} y1={AXIS_Y} x2={x(F_MAX)} y2={AXIS_Y} stroke={svgTokens.border} />
      {TICKS.map(kHz => (
        <g key={kHz}>
          <line
            x1={x(kHz)}
            y1={AXIS_Y}
            x2={x(kHz)}
            y2={AXIS_Y + TICK_LEN}
            stroke={svgTokens.border}
          />
          <text
            x={x(kHz)}
            y={TICK_LABEL_Y}
            textAnchor="middle"
            fontSize="13"
            fill={svgTokens.mutedFg}
          >
            {tickLabel(kHz)}
          </text>
        </g>
      ))}
      <text x={PAD_L} y={AXIS_LABEL_Y} fontSize="13" fill={svgTokens.mutedFg}>
        {t('ch4_5.allocAxis')} ({t('units.mhz')})
      </text>
    </svg>
  )
}
