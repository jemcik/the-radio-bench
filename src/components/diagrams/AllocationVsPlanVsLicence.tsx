/**
 * Chapter 4.5 §4 — three different things stacked on one band.
 *
 * The 40-metre band read three times over, because «where you may transmit» is
 * the answer to three separate questions that the one phrasing runs together:
 *
 *   1. ITU allocation      — what the treaty gives the amateur service at all
 *   2. IARU band plan      — how amateurs agree to divide that space by mode
 *   3. Licence conditions  — what YOUR class may actually use, in law
 *
 * Drawing them as three bars on a shared frequency axis is the whole argument:
 * they cover different spans, they come from different authorities, and only
 * the third one can be broken. A table of numbers cannot show that the third
 * bar STOPS short of the first — the visual can, and that stop is the lesson.
 *
 * ── Sources (every boundary below is quoted, not estimated) ─────────────
 * Row 1: ITU Radio Regulations, Article 5 — 7000–7200 kHz to the amateur
 *        service in Region 1; Region 2 runs on to 7300 kHz. Consistent with
 *        the band table already shipped in ch4_1.bandTable.
 * Row 2: IARU Region 1 HF Band Plan, effective 16 OCT 2020 —
 *        7000–7040 CW (200 Hz) · 7040–7050 narrow band modes (500 Hz) ·
 *        7050–7200 all modes (2700 Hz). The plan subdivides the top part
 *        further (contest-preferred segments, centres of activity); those are
 *        deliberately not drawn — see the figcaption, which says so.
 * Row 3: Регламент аматорського радіозв'язку України, додаток 2 таблиця 12 —
 *        7,000–7,100: A 200 W / B 100 W / C 40 W;
 *        7,100–7,200: A 200 W only. So B and C stop at 7,100.
 *
 * ── Geometry: one source of truth ──────────────────────────────────────
 * Every horizontal position comes from `x(kHz)`. No bar edge is hand-placed,
 * so a boundary can be corrected in one number and everything follows.
 *
 * ── Width budget (worst case, and measure it on CI, not macOS — Linux
 * Chromium renders the same string wider; that is what caught ch4_4's
 * QsoTimeline) ─────────────────────────────────────────────────────────
 *   Row-1 bar 7000–7200 = 496 px wide.
 *     EN «amateur service, primary»   24 ch × ~6.5 @13 ≈ 156 px
 *     UA «аматорська служба, первинна» 27 ch × ~7.0    ≈ 189 px  ✓
 *   Ghost 7200–7300 = 248 px wide.
 *     EN «Region 2 only»  13 ch ≈  85 px
 *     UA «лише Регіон 2»  13 ch ≈  98 px                        ✓
 *   Narrow-band segment is only 7040–7050 = 25 px, far too tight for its
 *   own label, so that one label drops to a second line under the bar with
 *   a leader. Its neighbours stay on the first line, which is why the two
 *   lines exist at all.
 *     EN «narrow-band modes»    17 ch ≈ 110 px, centred at x=142 → 87…197
 *     UA «вузькосмугові види»   18 ch ≈ 135 px, centred at x=142 → 75…210  ✓
 *     (left edge 75 still clears PAD_L = 30)
 *   Class bars: shortest is 7000–7100 = 248 px, carrying a name at the left
 *   and a power at the right.
 *     UA «клас B» ≈ 48 px (40…88) + «100 Вт» ≈ 45 px (223…268)   ✓
 */
import { useTranslation } from 'react-i18next'
import { svgTokens } from './svgTokens'

const VB_W = 820
const VB_H = 314

const PAD_L = 30
const PAD_R = 46

/** Frequency window drawn, in kHz. 7300 is included so the reader can SEE
 *  that the band does not simply end — it ends *here*, in this region. */
const F_MIN = 7000
const F_MAX = 7300

const PLOT_W = VB_W - PAD_L - PAD_R

/** The single source of truth for every horizontal position. */
function x(kHz: number): number {
  return PAD_L + ((kHz - F_MIN) / (F_MAX - F_MIN)) * PLOT_W
}

const BAR_H = 26

const ROW1_LABEL_Y = 22
const ROW1_BAR_Y = 30

const ROW2_LABEL_Y = 82
const ROW2_BAR_Y = 90
const ROW2_SEG_LINE1_Y = 134
const ROW2_SEG_LINE2_Y = 152

const ROW3_LABEL_Y = 178
const ROW3_BAR_Y = 186
const CLASS_BAR_H = 20
const CLASS_PITCH = 24

const AXIS_Y = 268
const TICK_LEN = 6
const TICK_LABEL_Y = 288
const AXIS_LABEL_Y = 306

/** IARU Region 1 mode segments actually drawn. Upper edge of the last one is
 *  the Region 1 allocation edge, not a band-plan boundary. */
const IARU_SEGMENTS = [
  { from: 7000, to: 7040, labelKey: 'allocSegCw', line: 1 },
  { from: 7040, to: 7050, labelKey: 'allocSegNarrow', line: 2 },
  { from: 7050, to: 7200, labelKey: 'allocSegAll', line: 1 },
] as const

/** Ukrainian licence classes on this band, top edge and power from таблиця 12. */
const CLASSES = [
  { labelKey: 'allocClassA', to: 7200, watts: 200 },
  { labelKey: 'allocClassB', to: 7100, watts: 100 },
  { labelKey: 'allocClassC', to: 7100, watts: 40 },
] as const

const TICKS = [7000, 7100, 7200, 7300] as const

/** 7000 → «7.000», matching the band-edge style used in ch4_1's band table. */
function tickLabel(kHz: number): string {
  return (kHz / 1000).toFixed(3)
}

export default function AllocationVsPlanVsLicence() {
  const { t } = useTranslation('ui')

  return (
    <svg
      width={VB_W}
      height={VB_H}
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      role="img"
      aria-label={t('ch4_5.allocAria')}
      style={{ margin: '0 auto', maxWidth: '100%', height: 'auto' }}
    >
      {/* ── Row 1 — what the treaty allocates ─────────────────────── */}
      <text x={PAD_L} y={ROW1_LABEL_Y} fontSize="14" fontWeight={600} fill={svgTokens.fg}>
        {t('ch4_5.allocLayerItu')}
        <tspan fontWeight={400} fill={svgTokens.mutedFg}>
          {'  · '}
          {t('ch4_5.allocLayerItuKind')}
        </tspan>
      </text>

      <rect
        x={x(7000)}
        y={ROW1_BAR_Y}
        width={x(7200) - x(7000)}
        height={BAR_H}
        rx={3}
        fill={svgTokens.key}
        fillOpacity={0.18}
        stroke={svgTokens.key}
      />
      <text
        x={(x(7000) + x(7200)) / 2}
        y={ROW1_BAR_Y + BAR_H / 2 + 4}
        textAnchor="middle"
        fontSize="13"
        fill={svgTokens.fg}
      >
        {t('ch4_5.allocAmateurPrimary')}
      </text>

      {/* Beyond the Region 1 edge: allocated to the amateur service only in
          Region 2. Dashed and unfilled so it reads as «not yours». */}
      <rect
        x={x(7200)}
        y={ROW1_BAR_Y}
        width={x(7300) - x(7200)}
        height={BAR_H}
        rx={3}
        fill={svgTokens.mutedFg}
        fillOpacity={0.07}
        stroke={svgTokens.border}
        strokeDasharray="4 3"
      />
      <text
        x={(x(7200) + x(7300)) / 2}
        y={ROW1_BAR_Y + BAR_H / 2 + 4}
        textAnchor="middle"
        fontSize="13"
        fill={svgTokens.mutedFg}
      >
        {t('ch4_5.allocRegion2')}
      </text>

      {/* ── Row 2 — how amateurs agree to divide it ────────────────── */}
      <text x={PAD_L} y={ROW2_LABEL_Y} fontSize="14" fontWeight={600} fill={svgTokens.fg}>
        {t('ch4_5.allocLayerIaru')}
        <tspan fontWeight={400} fill={svgTokens.mutedFg}>
          {'  · '}
          {t('ch4_5.allocLayerIaruKind')}
        </tspan>
      </text>

      {IARU_SEGMENTS.map(seg => (
        <rect
          key={seg.labelKey}
          x={x(seg.from)}
          y={ROW2_BAR_Y}
          width={x(seg.to) - x(seg.from)}
          height={BAR_H}
          rx={3}
          fill={svgTokens.note}
          fillOpacity={0.16}
          stroke={svgTokens.note}
        />
      ))}

      {IARU_SEGMENTS.map(seg => {
        const cx = (x(seg.from) + x(seg.to)) / 2
        const y = seg.line === 1 ? ROW2_SEG_LINE1_Y : ROW2_SEG_LINE2_Y
        return (
          <g key={`lbl-${seg.labelKey}`}>
            {seg.line === 2 && (
              // Leader: this segment is 25 px wide, so its label had to move
              // down a line and needs a line back to the segment it names.
              <line
                x1={cx}
                y1={ROW2_BAR_Y + BAR_H}
                x2={cx}
                y2={y - 14}
                stroke={svgTokens.border}
              />
            )}
            <text x={cx} y={y} textAnchor="middle" fontSize="13" fill={svgTokens.mutedFg}>
              {t(`ch4_5.${seg.labelKey}`)}
            </text>
          </g>
        )
      })}

      {/* ── Row 3 — what your own licence permits ──────────────────── */}
      <text x={PAD_L} y={ROW3_LABEL_Y} fontSize="14" fontWeight={600} fill={svgTokens.fg}>
        {t('ch4_5.allocLayerLicence')}
        <tspan fontWeight={400} fill={svgTokens.mutedFg}>
          {'  · '}
          {t('ch4_5.allocLayerLicenceKind')}
        </tspan>
      </text>

      {CLASSES.map((cls, i) => {
        const y = ROW3_BAR_Y + i * CLASS_PITCH
        const right = x(cls.to)
        return (
          <g key={cls.labelKey}>
            <rect
              x={x(7000)}
              y={y}
              width={right - x(7000)}
              height={CLASS_BAR_H}
              rx={3}
              fill={svgTokens.onair}
              fillOpacity={0.16}
              stroke={svgTokens.onair}
            />
            <text
              x={x(7000) + 10}
              y={y + CLASS_BAR_H / 2 + 4}
              fontSize="13"
              fill={svgTokens.fg}
            >
              {t(`ch4_5.${cls.labelKey}`)}
            </text>
            <text
              x={right - 10}
              y={y + CLASS_BAR_H / 2 + 4}
              textAnchor="end"
              fontSize="13"
              fill={svgTokens.fg}
            >
              {cls.watts} {t('units.w')}
            </text>
          </g>
        )
      })}

      {/* Where classes B and C stop. The dropped guide is the point of the
          whole figure: the treaty and the plan both continue past it.

          Drawn as one segment PER BAR ROW rather than as a single line down
          the figure. A continuous line crossed the layer captions, which start
          at PAD_L and run as wide as the locale makes them — in Ukrainian
          «План діапазонів IARU · добровільний» is 277 px and reaches x=307,
          well past this guide at x=278, so the line struck straight through
          the text. English is short enough to clear it, which is exactly why
          this had to be measured rather than eyeballed in one locale.

          The guide is drawn over the BARS only, never in the gaps between
          rows, for the same reason — the captions live in those gaps. Row 1
          is skipped entirely: its own label is centred in 7000–7200, whose
          midpoint is exactly the 7100 the guide marks. The bars it does cross
          are enough for the eye to carry the line down the figure. */}
      {[
        { y: ROW2_BAR_Y, h: BAR_H },
        { y: ROW3_BAR_Y, h: 3 * CLASS_PITCH - 4 },
      ].map((seg, i) => (
        <line
          key={i}
          x1={x(7100)}
          y1={seg.y}
          x2={x(7100)}
          y2={seg.y + seg.h}
          stroke={svgTokens.onair}
          strokeDasharray="3 3"
          strokeOpacity={0.7}
        />
      ))}

      {/* ── Axis ───────────────────────────────────────────────────── */}
      <line x1={PAD_L} y1={AXIS_Y} x2={x(F_MAX)} y2={AXIS_Y} stroke={svgTokens.border} />
      {TICKS.map(kHz => (
        <g key={kHz}>
          <line x1={x(kHz)} y1={AXIS_Y} x2={x(kHz)} y2={AXIS_Y + TICK_LEN} stroke={svgTokens.border} />
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
