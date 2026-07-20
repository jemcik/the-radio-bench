/**
 * Chapter 4.3 §1 — what a given current through the body actually does.
 *
 * The chapter's signature visual. Everything a beginner half-knows about shock
 * ("it's the current not the voltage", "milliamps can kill") is vague until the
 * thresholds sit on one scale — and until they can see that the current a real
 * 230 V mains contact drives is not near the danger zone, it is several times
 * past it.
 *
 * Numbers are IEC 60479-1 (the European standard, which is what governs a
 * Ukrainian reader), NOT the US figures most English ham material quotes:
 *   • perception     0.5 mA   (IEC 60479-1; also ПУЕ 1.7.75, Ukrainian law)
 *   • let-go         5–10 mA  (drawn as a BAND, not a line — see below)
 *   • fibrillation   ~40 mA   (curve c1, durations > 1–2 s)
 * The «you» band is IEC 60479-1 Table 1: total body impedance hand-to-hand,
 * DRY skin, 50 Hz, at 220 V = 1000 Ω (5 % of people) … 2125 Ω (95 %), giving
 * 230 mA … 108 mA at 230 V. Even the most resistant person, dry, lands ~2.7×
 * above the fibrillation threshold. That overlap IS the diagram's argument.
 *
 * Why let-go is a band and not a line: IEC ed. ≤4.0 puts curve b at 10 mA,
 * ed. 4.1:2016+ moved it to 5 mA, and Dalziel's underlying data spread by sex
 * (threshold ≈ 9 mA men / 6 mA women). A single line would be a lie about the
 * precision. The band says "people differ" — which is the honest teaching.
 *
 * Deliberately NOT here: the 30 mA RCD trip point (that is §2's story, and its
 * label would collide with the «cannot let go» zone), and any ranking of
 * current PATHS (IEC's zones are defined for left-hand-to-feet and the
 * hand-to-hand conversion factor is unverified — the prose stays unranked).
 *
 * Vertical ladder, not horizontal: the zone labels are long sentences and
 * Ukrainian runs ~30–60 % wider than English. A horizontal log axis would put
 * «Відпустити неможливо» inside an 84 px-wide band. Vertical gives every label
 * the full width of the canvas to the right of the column.
 *
 * Static (a snapshot of thresholds, not a process in time) → no animation.
 */
import { Trans, useTranslation } from 'react-i18next'
import { svgTokens } from './svgTokens'
import { useLocaleFormatter, useUnitFormatter } from '@/lib/hooks/useLocaleFormatter'

// Canvas sized SNUG to the content, not padded. Measured in-browser (both
// locales): content runs x=14…469 and y=13…346. A 620-wide viewBox left 151 px
// of dead space on the RIGHT, and because the svg is centred in the prose
// column that pushed the whole scale visibly left (192 px gap left vs 329 px
// right) — user-flagged as a lopsided indent. Fitting the box to the content
// (14 px margin each side) makes the centred svg sit symmetrically. If a label
// ever grows past x≈470, widen VB_W to match — do NOT re-inflate it "for room".
const VB_W = 486
const VB_H = 362

// ── Geometry ────────────────────────────────────────────────────────
// Log axis: 0.1 mA (bottom) → 1000 mA (top), 4 decades over 300 px.
const I_MIN = 0.1
const DECADES = 4
const TOP_Y = 40
const BOT_Y = 340
const PLOT_H = BOT_Y - TOP_Y

// The label column is the scarce resource here, so the axis + band column are
// packed hard left: the widest tick («1000») is only ~29 px, so AXIS_X=52
// leaves it room to spare while freeing ~390 px for the zone labels.
const AXIS_X = 52
const TICK_LABEL_X = AXIS_X - 8 // end-anchored
const BAND_X0 = 64
// The band column is deliberately narrower than the labels need: every pixel
// taken from it is a pixel of headroom for the label column, and the labels are
// what actually runs out of room. Narrowing this (210 → 180) was the fix for a
// CI-only spill — see the label budget note below.
const BAND_X1 = 180
const LABEL_X = 192 // start-anchored zone labels

/** Log position of a current in mA. */
function yFor(ma: number): number {
  const u = (Math.log10(ma) - Math.log10(I_MIN)) / DECADES
  return BOT_Y - u * PLOT_H
}

// ── Label budget (MEASURED in-browser, both locales) ───────────────
//   LEFT  tick «1000» / «мА» — left edge at x≈14. That sets VB_W's left
//         margin; the axis sits at AXIS_X=52.
//   RIGHT the binding constraint. Zone labels are START-anchored at
//         x=192; the widest (UA «Відчувається — ще можна відпустити»)
//         renders ≈247 px on macOS, ending at ≈439 — 47 px clear of 486.
//   That clearance is NOT slack to reclaim. An earlier version anchored the
//   labels at x=222, which cleared the edge by 17 px on macOS and PASSED
//   `npm run test:visual` locally — then failed the same gate in CI, where
//   Linux Chromium falls back to a different face and renders the same
//   string wider. Local measurement only bounds one platform; keep ≥10 %
//   headroom on the widest label so the other one fits too.
//   Keep zone labels terse: SVG text does not wrap and clips SILENTLY at
//   the canvas edge (the first draft shipped «…from person to per»). A
//   label that outgrows the budget gets shortened, or buys room from
//   BAND_X1 — widening VB_W re-opens the dead space on the right that made
//   this figure look left-indented. The nuance belongs in the figcaption,
//   which is HTML and wraps.

interface Zone {
  lo: number
  hi: number
  key: string
  tone: keyof typeof svgTokens
  opacity: number
  /** Tall zones anchor their label near the top so it clears the «you»
   *  band's caption, which sits at the vertical centre of the canvas. */
  labelAt?: 'centre' | 'top'
}

/** Severity gradient: neutral → blue → amber → orange → red. */
const ZONES: Zone[] = [
  { lo: 0.1, hi: 0.5,  key: 'shockZoneNone',  tone: 'mutedFg',  opacity: 0.10 },
  { lo: 0.5, hi: 5,    key: 'shockZoneFelt',  tone: 'note',     opacity: 0.16 },
  { lo: 5,   hi: 10,   key: 'shockZoneLetGo', tone: 'key',      opacity: 0.26 },
  { lo: 10,  hi: 40,   key: 'shockZoneClamp', tone: 'caution',  opacity: 0.28 },
  { lo: 40,  hi: 1000, key: 'shockZoneFib',   tone: 'danger',   opacity: 0.18, labelAt: 'top' },
]

/** Axis ticks — the thresholds themselves, plus the two endpoints. The
 *  closest pair (5 and 10 mA) sits 22.6 px apart, so 13 px labels clear. */
const TICKS: { v: number; digits: number }[] = [
  { v: 0.1,  digits: 1 },
  { v: 0.5,  digits: 1 },
  { v: 5,    digits: 0 },
  { v: 10,   digits: 0 },
  { v: 40,   digits: 0 },
  { v: 1000, digits: 0 },
]

// The «you» band — IEC 60479-1 Table 1 at 230 V, dry, hand-to-hand.
const BODY_LO = 108
const BODY_HI = 230
const BODY_Y0 = yFor(BODY_HI) // 87.8 — higher current is higher up
const BODY_Y1 = yFor(BODY_LO) // 112.5
const BODY_MID = (BODY_Y0 + BODY_Y1) / 2

export default function ShockCurrentScale() {
  const { t } = useTranslation('ui')
  const { fmt } = useLocaleFormatter()
  const tUnit = useUnitFormatter()

  return (
    <figure className="my-6 not-prose">
      <svg
        width={VB_W}
        height={VB_H}
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        role="img"
        aria-label={t('ch4_3.shockScaleAria')}
        style={{ display: 'block', maxWidth: '100%', height: 'auto', margin: '0 auto', fontSize: '1rem' }}
      >
        {/* ── Zone bands ───────────────────────────────────────── */}
        {ZONES.map(z => {
          const y0 = yFor(z.hi)
          const y1 = yFor(z.lo)
          const colour = svgTokens[z.tone] as string
          const labelY = z.labelAt === 'top' ? y0 + 18 : (y0 + y1) / 2
          return (
            <g key={z.key}>
              <rect
                x={BAND_X0} y={y0} width={BAND_X1 - BAND_X0} height={y1 - y0}
                fill={colour} opacity={z.opacity}
              />
              <rect
                x={BAND_X0} y={y0} width={BAND_X1 - BAND_X0} height={y1 - y0}
                fill="none" stroke={colour} strokeWidth={0.8} opacity={0.5}
              />
              <text
                x={LABEL_X} y={labelY}
                fontSize="0.812em" textAnchor="start" dominantBaseline="middle"
                fontFamily="inherit" fontWeight="600"
                fill={svgTokens.fg}
              >
                {t(`ch4_3.${z.key}`)}
              </text>
            </g>
          )
        })}

        {/* ── The «you» band — 230 V, dry hands, hand to hand ───── */}
        <rect
          x={BAND_X0} y={BODY_Y0} width={BAND_X1 - BAND_X0} height={BODY_Y1 - BODY_Y0}
          fill={svgTokens.danger} opacity={0.5}
        />
        <rect
          x={BAND_X0} y={BODY_Y0} width={BAND_X1 - BAND_X0} height={BODY_Y1 - BODY_Y0}
          fill="none" stroke={svgTokens.danger} strokeWidth={1.6}
        />
        {/* Leader from the band's right edge out to its caption. */}
        <line
          x1={BAND_X1} y1={BODY_MID} x2={LABEL_X - 6} y2={BODY_MID}
          stroke={svgTokens.danger} strokeWidth={1.2}
        />
        <text
          x={LABEL_X} y={BODY_MID - 8}
          fontSize="0.812em" textAnchor="start" dominantBaseline="middle"
          fontFamily="inherit" fontWeight="700"
          fill={svgTokens.danger}
        >
          {t('ch4_3.shockBandLine1')}
        </text>
        <text
          x={LABEL_X} y={BODY_MID + 8}
          fontSize="0.812em" textAnchor="start" dominantBaseline="middle"
          fontFamily="inherit"
          fill={svgTokens.danger}
        >
          {fmt(BODY_LO, 0)}–{fmt(BODY_HI, 0)} {tUnit('ma')}
        </text>

        {/* ── Axis, ticks, unit ────────────────────────────────── */}
        <line
          x1={AXIS_X} y1={TOP_Y} x2={AXIS_X} y2={BOT_Y}
          stroke={svgTokens.border} strokeWidth={1.2}
        />
        <text
          x={TICK_LABEL_X} y={22}
          fontSize="0.812em" textAnchor="end" dominantBaseline="middle"
          fontFamily="inherit" fontWeight="600"
          fill={svgTokens.mutedFg}
        >
          {tUnit('ma')}
        </text>
        {TICKS.map(({ v, digits }) => {
          const y = yFor(v)
          return (
            <g key={v}>
              <line
                x1={AXIS_X - 4} y1={y} x2={AXIS_X} y2={y}
                stroke={svgTokens.border} strokeWidth={1.2}
              />
              <text
                x={TICK_LABEL_X} y={y}
                fontSize="0.812em" textAnchor="end" dominantBaseline="middle"
                fontFamily="inherit"
                fill={svgTokens.mutedFg}
              >
                {fmt(v, digits)}
              </text>
            </g>
          )
        })}
      </svg>

      <figcaption className="text-[13px] text-muted-foreground mt-2 px-1">
        <Trans i18nKey="ch4_3.shockScaleCaption" ns="ui" components={{ strong: <strong /> }} />
      </figcaption>
    </figure>
  )
}
