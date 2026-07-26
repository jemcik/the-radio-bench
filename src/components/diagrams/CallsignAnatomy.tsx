/**
 * Chapter 4.4 §6 — where a call sign keeps its geography.
 *
 * Two call signs, same three-part shape, and the highlight lands in a
 * different column in each row. That displacement IS the figure: a reader who
 * only ever sees one national system assumes the digit is always the region,
 * because in their own country it is.
 *
 * ── Geometry: one source of truth ──────────────────────────────────────
 * A row is described by its groups (`[chars, groupLabelKey]`) and the index of
 * the character that carries the geography. Box positions are accumulated from
 * that description, and the highlight is drawn from the same accumulator, so
 * the marker cannot drift away from the character it marks — the failure mode
 * this repo has hit before with hand-placed annotations.
 *
 * The notes sit BELOW each row rather than to its right. An earlier version
 * ran them to the right of the boxes and they left the canvas in Ukrainian,
 * which runs ~60 % wider than English — caught by the label-bounds test, not
 * by eye. Below the row there are 610 px of usable width instead of 286, and
 * the worst UA case clears it comfortably.
 *
 * Width budget: 6 boxes + 2 group gaps = 6·40 + 4·6 + 2·22 = 308 px of glyphs,
 * left origin 150 → right edge 458. Group labels sit under their own group and
 * are centred on it; the binding case is UA «суфікс» (6 ch ≈ 42 px) against a
 * one-box group (40 px), which overhangs by 1 px each side — acceptable
 * because neighbouring group labels are ≥ 22 px apart.
 */
import { useTranslation } from 'react-i18next'
import { svgTokens } from './svgTokens'

const VB_W = 760
const VB_H = 366

const BOX_W = 40
const BOX_H = 48
const CHAR_GAP = 6
const GROUP_GAP = 22
const ORIGIN_X = 150

type Group = { chars: string[]; labelKey: 'prefix' | 'digit' | 'suffix' }

interface Row {
  key: 'ua' | 'us'
  groups: Group[]
  /** Index into the flattened character list — the box the geography lives in. */
  geoIndex: number
  y: number
}

const ROWS: Row[] = [
  {
    key: 'ua',
    groups: [
      { chars: ['U', 'R'], labelKey: 'prefix' },
      { chars: ['5'], labelKey: 'digit' },
      { chars: ['H', 'A', 'A'], labelKey: 'suffix' },
    ],
    geoIndex: 3, // the H — first letter of the suffix
    y: 64,
  },
  {
    key: 'us',
    groups: [
      { chars: ['W'], labelKey: 'prefix' },
      { chars: ['1'], labelKey: 'digit' },
      { chars: ['A', 'W'], labelKey: 'suffix' },
    ],
    geoIndex: 1, // the 1 — the call area
    y: 224,
  },
]

/** Accumulate box x-positions and group spans from the row description alone. */
function layout(groups: Group[]) {
  const boxes: { ch: string; x: number }[] = []
  const spans: { labelKey: Group['labelKey']; x0: number; x1: number }[] = []
  let x = ORIGIN_X
  groups.forEach((g, gi) => {
    const start = x
    g.chars.forEach((ch, ci) => {
      boxes.push({ ch, x })
      x += BOX_W
      if (ci !== g.chars.length - 1) x += CHAR_GAP
    })
    // x is now the RIGHT edge of the group's last box — not one box beyond it.
    spans.push({ labelKey: g.labelKey, x0: start, x1: x })
    if (gi !== groups.length - 1) x += GROUP_GAP
  })
  return { boxes, spans, rightEdge: x }
}

export default function CallsignAnatomy() {
  const { t } = useTranslation('ui')

  return (
    <svg
      width={VB_W}
      height={VB_H}
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      style={{ margin: '0 auto', maxWidth: '100%', height: 'auto' }}
      role="img"
      aria-label={t('ch4_4.callsignAnatomy.aria')}
    >
      {ROWS.map(row => {
        const { boxes, spans } = layout(row.groups)
        const geo = boxes[row.geoIndex]

        return (
          <g key={row.key}>
            {/* Country label, left of the boxes */}
            <text x={12} y={row.y + BOX_H / 2 + 5} fontSize="14" fontWeight={600} fill={svgTokens.fg}>
              {t(`ch4_4.callsignAnatomy.${row.key}Title`)}
            </text>

            {boxes.map((b, i) => {
              const isGeo = i === row.geoIndex
              return (
                <g key={`${row.key}-${i}`}>
                  <rect
                    x={b.x}
                    y={row.y}
                    width={BOX_W}
                    height={BOX_H}
                    rx={6}
                    fill={isGeo ? svgTokens.primary : svgTokens.note}
                    fillOpacity={isGeo ? 0.18 : 0.07}
                    stroke={isGeo ? svgTokens.primary : svgTokens.border}
                    strokeWidth={isGeo ? 2 : 1}
                  />
                  <text
                    x={b.x + BOX_W / 2}
                    y={row.y + BOX_H / 2 + 7}
                    textAnchor="middle"
                    fontSize="21"
                    fontWeight={600}
                    fontFamily="ui-monospace, monospace"
                    fill={svgTokens.fg}
                  >
                    {b.ch}
                  </text>
                </g>
              )
            })}

            {/* Group labels, centred under their own span */}
            {spans.map(sp => (
              <text
                key={`${row.key}-${sp.labelKey}`}
                x={(sp.x0 + sp.x1) / 2}
                y={row.y + BOX_H + 20}
                textAnchor="middle"
                fontSize="13"
                fill={svgTokens.mutedFg}
              >
                {t(`ch4_4.callsignAnatomy.group.${sp.labelKey}`)}
              </text>
            ))}

            {/* The marker, drawn from the same accumulator as the box it marks */}
            <line
              x1={geo.x + BOX_W / 2}
              y1={row.y - 8}
              x2={geo.x + BOX_W / 2}
              y2={row.y - 26}
              stroke={svgTokens.primary}
              strokeWidth={2}
            />
            <text
              x={geo.x + BOX_W / 2}
              y={row.y - 32}
              textAnchor="middle"
              fontSize="13"
              fontWeight={600}
              fill={svgTokens.primary}
            >
              {t(`ch4_4.callsignAnatomy.${row.key}Geo`)}
            </text>

            {/* The counterpart note, below the row: what the OTHER part does not carry */}
            <text x={ORIGIN_X} y={row.y + BOX_H + 42} fontSize="13" fill={svgTokens.mutedFg}>
              {t(`ch4_4.callsignAnatomy.${row.key}Note1`)}
            </text>
            <text x={ORIGIN_X} y={row.y + BOX_H + 60} fontSize="13" fill={svgTokens.mutedFg}>
              {t(`ch4_4.callsignAnatomy.${row.key}Note2`)}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
