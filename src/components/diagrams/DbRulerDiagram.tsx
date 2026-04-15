import { useTranslation } from 'react-i18next'
import SVGDiagram from './SVGDiagram'
import DiagramFigure from './DiagramFigure'
import { svgTokens } from './svgTokens'

/**
 * Chapter 0.4 — A single horizontal ruler that aligns four ways of
 * saying the same thing about a power level:
 *
 *      dB  (relative)    | -30  -20  -10   0   +10  +20  +30  +40  +50
 *      ratio  (×)        | /1k  /100 /10  ×1   ×10  ×100 ×1k  ×10k ×100k
 *      dBm (abs to 1mW)  | -30  -20  -10   0   +10  +20  +30  +40  +50
 *      watts             | 1µW  10µW 100µW 1mW  10mW 100mW 1W   10W  100W
 *
 * Reading top→bottom at any tick gives the same physical power level
 * stated in four vocabularies. The point is purely vocabulary fluency:
 * once the four rows feel like one row, dB stops being intimidating.
 */
export default function DbRulerDiagram() {
  const { t } = useTranslation('ui')

  // ── Geometry ───────────────────────────────────────────────────────
  // Both sides budgeted for ≈ 12 px of clearance inside the figure box.
  // The left gutter has to fit the *widest translation* of every row's
  // main label and parenthetical sub-label:
  //   EN main: "ratio" / "watts" — 5 chars × ~7.5 px @ 14 sans  ≈ 37 px
  //   UK main: "відношення"      — 10 chars × ~7.5 px           ≈ 75 px
  //   EN sub:  "(vs 1 mW)"       — 9 chars × ~5.5 px @ 11 sans  ≈ 50 px
  //   UK sub:  "(відносно 1 мВт)" — 16 chars × ~5.5 px           ≈ 88 px
  // Worst case is the UK sub-label at 88 px. Plus the 28 px gap to the
  // first tick column → PAD_L needs ≥ 88 + 28 = 116. Use 130 for ~12 px
  // clearance from canvas edge.
  // Right: PAD_R (32) − half of widest tick text "×100k"
  //        (~39 px @ fontSize 13 mono → 19.5 px) ≈ 12.5 px clear.
  // Canvas widened from 720 → 760 to keep the central track wide after
  // the gutter grew.
  const W = 760, H = 188
  const PAD_L = 130, PAD_R = 32
  const trackW = W - PAD_L - PAD_R
  const axisY = 96      // baseline of the ruler
  const N_TICKS = 9     // -30, -20, -10, 0, +10, +20, +30, +40, +50 (dBm)

  // dB / dBm row entries (these are the same number — dB column is "relative",
  // dBm column is "absolute referenced to 1 mW"; we draw them in two rows so
  // the reader sees they share a scale by construction, not coincidence).
  const ticks = Array.from({ length: N_TICKS }, (_, i) => -30 + i * 10)

  const ratioLabels = [
    '÷1000', '÷100', '÷10', '×1', '×10', '×100', '×1k', '×10k', '×100k',
  ]
  // Watt labels are translated — unit symbols differ across locales
  // (µW/mW/W in EN, мкВт/мВт/Вт in UK). Numbers stay numeric.
  const wattLabels = [
    t('ch0_4.dbRulerWatt1'), t('ch0_4.dbRulerWatt2'), t('ch0_4.dbRulerWatt3'),
    t('ch0_4.dbRulerWatt4'), t('ch0_4.dbRulerWatt5'), t('ch0_4.dbRulerWatt6'),
    t('ch0_4.dbRulerWatt7'), t('ch0_4.dbRulerWatt8'), t('ch0_4.dbRulerWatt9'),
  ]

  const xFor = (i: number) =>
    PAD_L + (i / (N_TICKS - 1)) * trackW

  const { fg, mutedFg: muted, border, primary: accent, experiment: zeroAccent } = svgTokens

  // Row layout (Y coords). Two rows above the axis line, two below.
  // Spacing tuned so each row's main label (fontSize 14) and sub label
  // (fontSize 11, drawn 16 px below) don't crowd the next row.
  const ROW_DB     = axisY - 68
  const ROW_RATIO  = axisY - 36
  const ROW_DBM    = axisY + 36
  const ROW_WATTS  = axisY + 68

  // Row labels (left gutter) — translated; abbreviations and parenthetical
  // sub-labels both differ across locales (e.g. "dB" vs "дБ").
  const ROWS: Array<{ y: number; label: string; sub?: string }> = [
    { y: ROW_DB,    label: t('ch0_4.dbRulerRowDb'),    sub: t('ch0_4.dbRulerRowDbSub') },
    { y: ROW_RATIO, label: t('ch0_4.dbRulerRowRatio'), sub: t('ch0_4.dbRulerRowRatioSub') },
    { y: ROW_DBM,   label: t('ch0_4.dbRulerRowDbm'),   sub: t('ch0_4.dbRulerRowDbmSub') },
    { y: ROW_WATTS, label: t('ch0_4.dbRulerRowWatts'), sub: '' },
  ]

  return (
    <DiagramFigure caption={t('ch0_4.dbRulerCaption')}>
      <SVGDiagram
        width={W} height={H}
        style={{ maxWidth: W, margin: '0 auto' }}
        fontFamily="inherit"
        aria-label={t('ch0_4.dbRulerAria')}
      >
        {/*
          ── Row gutter labels ──
          Right-aligned at x = PAD_L − 28. The 28-px offset clears the
          widest first-column tick text:
            "÷1000"  → 5 mono chars × ~7.8 px ≈ 39 px → reaches PAD_L − 19.5
            "1 µW"   → ~31 px wide                     → reaches PAD_L − 15.5
          Leaving ≥ 8 px between the gutter label's right edge and the
          tick text's left edge. If you raise the tick fontSize or add a
          longer leftmost label, recompute and bump this gap.
        */}
        {ROWS.map((r) => (
          <g key={r.label}>
            <text
              x={PAD_L - 28} y={r.y + 4}
              textAnchor="end" fontSize="14" fontWeight="600" fill={fg}
            >
              {r.label}
            </text>
            {r.sub && (
              <text
                x={PAD_L - 28} y={r.y + 18}
                textAnchor="end" fontSize="11" fill={muted}
              >
                {r.sub}
              </text>
            )}
          </g>
        ))}

        {/* ── 0 dB / 1 mW vertical highlight band ──────────────── */}
        {(() => {
          const i = ticks.indexOf(0)
          if (i < 0) return null
          const x = xFor(i)
          return (
            <rect
              x={x - 26} y={ROW_DB - 16}
              width={52} height={ROW_WATTS - ROW_DB + 32}
              fill={zeroAccent} fillOpacity="0.08"
              stroke={zeroAccent} strokeOpacity="0.35" strokeWidth="0.8"
              rx={6}
            />
          )
        })()}

        {/* ── Tick marks on the central axis ─────────────────── */}
        <line
          x1={PAD_L} y1={axisY} x2={PAD_L + trackW} y2={axisY}
          stroke={border} strokeWidth="1.5"
        />
        {ticks.map((db, i) => {
          const x = xFor(i)
          const isZero = db === 0
          return (
            <g key={`tick-${db}`}>
              <line
                x1={x} y1={axisY - 8} x2={x} y2={axisY + 8}
                stroke={isZero ? zeroAccent : accent}
                strokeWidth={isZero ? 2 : 1.4}
              />
              <circle
                cx={x} cy={axisY} r={isZero ? 3.5 : 2.5}
                fill={isZero ? zeroAccent : accent}
              />
            </g>
          )
        })}

        {/* ── Row entries ───────────────────────────────────────── */}
        {ticks.map((db, i) => {
          const x = xFor(i)
          const isZero = db === 0
          const colour = isZero ? zeroAccent : fg
          const fw = isZero ? '700' : '600'
          const sign = db > 0 ? `+${db}` : `${db}`

          return (
            <g key={`col-${db}`}>
              {/* dB row */}
              <text x={x} y={ROW_DB + 4}
                textAnchor="middle" fontSize="14" fontWeight={fw}
                fontFamily="monospace" fill={colour}>
                {sign}
              </text>
              {/* ratio row */}
              <text x={x} y={ROW_RATIO + 4}
                textAnchor="middle" fontSize="13" fontWeight="500"
                fontFamily="monospace" fill={muted}>
                {ratioLabels[i]}
              </text>
              {/* dBm row */}
              <text x={x} y={ROW_DBM + 4}
                textAnchor="middle" fontSize="14" fontWeight={fw}
                fontFamily="monospace" fill={colour}>
                {sign}
              </text>
              {/* watts row */}
              <text x={x} y={ROW_WATTS + 4}
                textAnchor="middle" fontSize="13" fontWeight="500"
                fontFamily="monospace" fill={muted}>
                {wattLabels[i]}
              </text>
            </g>
          )
        })}
      </SVGDiagram>
    </DiagramFigure>
  )
}
