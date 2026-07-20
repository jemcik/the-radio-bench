/**
 * Chapter 4.3 §2 — mains conductor colours, side by side for the two codes a
 * reader of this bilingual course is most likely to meet.
 *
 * Left panel: the harmonised IEC code used across Europe and Ukraine
 * (ДСТУ EN 60445:2022) — brown line, light-blue neutral, yellow-green striped
 * protective earth.
 *
 * Right panel: the US code (NEC) — black hot, white neutral, green ground.
 *
 * The teaching point is the contrast: the same three jobs (line/hot,
 * neutral, earth/ground) wear different colours depending on where the
 * wiring was installed, so a colour that means «neutral» under one code does
 * not under the other. The one thing both codes share is that the earth/ground
 * conductor has its own reserved colour and is never used for anything else.
 *
 * Colour exemption (per CLAUDE.md): every swatch here is a REAL-WORLD colour —
 * the whole subject of the diagram is which physical colour means what. Theme
 * tokens would defeat the point. Structural ink (titles, labels, rules) still
 * uses svgTokens so the diagram tracks light/dark theme.
 *
 * Static reference chart → no animation, no rough.js.
 */
import { useId } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { svgTokens } from './svgTokens'

const VB_W = 660
const VB_H = 250

// Two panels, side by side — the comparison is only visible when they are.
// Sized off the UKRAINIAN labels (widest), confirmed by measuring rendered
// text rather than estimating. The prose column is 976 px wide, so 660 renders
// at scale 1 (no font distortion).
const PANEL_W = 314
const PANEL_A_X = 8
const PANEL_B_X = 338 // 8 + 314 + 16 gap → panel B ends at 652, 8 px margin
const PANEL_Y = 34
const PANEL_H = 196

const SWATCH_X_OFF = 14 // from panel left edge
const SWATCH_W = 56
const SWATCH_H = 24
const LABEL_X_OFF = SWATCH_X_OFF + SWATCH_W + 12 // 82
const ROW_Y0 = PANEL_Y + 52
const ROW_DY = 44

// ── Label budget (MEASURED in-browser, both locales) ────────────────
//   TITLES  start at panel_x + 14 → 314 − 14 − 8 = 292 px available.
//     Widest is UA «У Європі та Україні» ≈ 160 px — comfortable.
//   ROWS    start at panel_x + 82 → 314 − 82 − 8 = 224 px available.
//     Widest is UA «PE — захисне заземлення» ≈ 164 px. 60 px spare.
//   SVG text does not wrap; it clips silently. Any label past its budget must
//   be shortened, not left to run (learned the hard way on ShockCurrentScale).

/** Real-world conductor colours. Not theme tokens — see the header note. */
const BROWN = '#6f4a2f' // EU line
const LIGHT_BLUE = '#4a9fd8' // EU neutral («блакитний» — light blue, not navy)
const PE_GREEN = '#2f9e44' // EU earth (with yellow, striped)
const PE_YELLOW = '#f0c419'
const US_BLACK = '#2b2b2b' // US hot (near-black insulation, not pure #000)
const US_WHITE = '#f5f5f5' // US neutral (needs a border to read on the card)
const US_GREEN = '#2f9e44' // US ground (solid green)

interface Row {
  key: string
  fill: string
  /** Yellow-green striped fill, for the EU protective earth only. */
  striped?: boolean
}

const EU_ROWS: Row[] = [
  { key: 'mainsCableL', fill: BROWN },
  { key: 'mainsCableN', fill: LIGHT_BLUE },
  { key: 'mainsCablePe', fill: PE_GREEN, striped: true },
]

const US_ROWS: Row[] = [
  { key: 'mainsUsHot', fill: US_BLACK },
  { key: 'mainsUsNeutral', fill: US_WHITE },
  { key: 'mainsUsGround', fill: US_GREEN },
]

export default function MainsColourCode() {
  const { t } = useTranslation('ui')
  const rawId = useId()
  // useId() emits colons, which are illegal in a url(#…) reference.
  const stripeId = `pe-stripe-${rawId.replace(/:/g, '')}`

  const renderPanel = (x: number, titleKey: string, rows: Row[]) => (
    <g>
      <rect
        x={x} y={PANEL_Y} width={PANEL_W} height={PANEL_H} rx={8}
        fill="none" stroke={svgTokens.border} strokeWidth={1}
      />
      <text
        x={x + SWATCH_X_OFF} y={PANEL_Y + 22}
        fontSize="0.812em" fontFamily="inherit" fontWeight="700"
        fill={svgTokens.fg}
      >
        {t(`ch4_3.${titleKey}`)}
      </text>
      {rows.map((r, i) => {
        const y = ROW_Y0 + i * ROW_DY
        return (
          <g key={r.key}>
            <rect
              x={x + SWATCH_X_OFF} y={y} width={SWATCH_W} height={SWATCH_H} rx={3}
              fill={r.striped ? `url(#${stripeId})` : r.fill}
              stroke={svgTokens.border} strokeWidth={0.8}
            />
            <text
              x={x + LABEL_X_OFF} y={y + SWATCH_H / 2}
              fontSize="0.812em" dominantBaseline="middle"
              fontFamily="inherit" fill={svgTokens.fg}
            >
              {t(`ch4_3.${r.key}`)}
            </text>
          </g>
        )
      })}
    </g>
  )

  return (
    <figure className="my-6 not-prose">
      <svg
        width={VB_W}
        height={VB_H}
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        role="img"
        aria-label={t('ch4_3.mainsColourAria')}
        style={{ display: 'block', maxWidth: '100%', height: 'auto', margin: '0 auto', fontSize: '1rem' }}
      >
        <defs>
          {/* Yellow-green PE stripes — diagonal, as they appear on real cable. */}
          <pattern
            id={stripeId}
            patternUnits="userSpaceOnUse"
            width={10}
            height={10}
            patternTransform="rotate(55)"
          >
            <rect width={10} height={10} fill={PE_YELLOW} />
            <rect width={5} height={10} fill={PE_GREEN} />
          </pattern>
        </defs>

        {renderPanel(PANEL_A_X, 'mainsCableTitle', EU_ROWS)}
        {renderPanel(PANEL_B_X, 'mainsUsTitle', US_ROWS)}
      </svg>

      <figcaption className="text-[13px] text-muted-foreground mt-2 px-1">
        <Trans i18nKey="ch4_3.mainsColourCaption" ns="ui" components={{ strong: <strong /> }} />
      </figcaption>
    </figure>
  )
}
