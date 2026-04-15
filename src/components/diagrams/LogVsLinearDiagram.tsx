import { useTranslation } from 'react-i18next'
import SVGDiagram from './SVGDiagram'
import DiagramFigure from './DiagramFigure'

/**
 * Chapter 0.4 — Linear vs Logarithmic frequency axis, side by side.
 *
 * Two horizontal scales drawn one above the other, each ticked at the
 * same frequencies (1, 10, 100, 1000). The point is purely visual:
 *   • on the linear scale, three of the four ticks bunch up at the left
 *   • on the log scale, the four ticks are evenly spaced (one decade each)
 *
 * No interactivity, no formulas — just the geometric truth that makes
 * the log axis the right default for filter and antenna plots.
 */
export default function LogVsLinearDiagram() {
  const { t } = useTranslation('ui')
  const tUnit = (k: string) => t(`units.${k}`)

  // ── Geometry ────────────────────────────────────────────────────────
  // Symmetric horizontal padding (PAD_L = PAD_R) so the diagram doesn't
  // look skewed. Half-width budgets for the outer tick labels:
  //   "1 Hz"  @ fontSize 13 sans   ≈ 28 px wide → 14 px half
  //   "1 kHz" @ fontSize 13 sans   ≈ 38 px wide → 19 px half
  // PAD = 44 leaves ≥ 25 px clearance from canvas edge on both sides.
  // Canvas is wider than the bare minimum so the staggered "10 Hz"
  // label (sitting just right of "1 Hz" on the linear scale) has visual
  // breathing room instead of crowding the left margin.
  const W = 760, H = 230
  const PAD = 44
  const trackW = W - 2 * PAD

  // Vertical layout (top → bottom):
  //   y =  18  axis title   (fontSize 14)
  //   y =  56  linear axis line
  //   y =  82  linear tick labels — row A  (1 Hz, 100 Hz, 1 kHz)
  //   y = 100  linear tick labels — row B  (10 Hz, staggered to clear 1 Hz)
  //   y = 138  log axis title
  //   y = 168  log axis line
  //   y = 192  log tick labels (all on one row — they're evenly spaced)
  //   y = 220  footnote      (fontSize 11 italic)
  const linY = 56
  const logY = 168
  const TITLE_DY = -22  // title sits this far above its axis
  const LABEL_ROW_A = 26  // first row of tick labels below the axis
  const LABEL_ROW_B = 44  // second row, used only for the colliding "10 Hz"

  const ticks = [1, 10, 100, 1000]
  const F_MAX = 1000

  // Tick X coords on each scale
  const linX = (f: number) => PAD + (f / F_MAX) * trackW
  const logX = (f: number) =>
    PAD + (Math.log10(f) / Math.log10(F_MAX)) * trackW

  const fg = 'hsl(var(--foreground))'
  const muted = 'hsl(var(--muted-foreground))'
  const border = 'hsl(var(--border))'
  // Pull a mild accent from the theme so the two scales read as related.
  const accent = 'hsl(var(--primary))'

  const fmtTick = (f: number) =>
    f >= 1000 ? `${f / 1000} ${tUnit('khz')}` : `${f} ${tUnit('hz')}`

  /**
   * Plain render helper (NOT a React component) — returns SVG elements
   * for one labelled scale. Inlining as a function keeps ticks/connectors
   * sharing the same closure without tripping the
   * `react-hooks/static-components` rule.
   *
   * `staggerIndex` is the index whose label should drop to the second row
   * (with a short leader line) to clear an overlapping neighbour. Pass −1
   * to label every tick on the same row.
   */
  const renderScale = (
    y: number,
    title: string,
    xFor: (f: number) => number,
    staggerIndex: number,
  ) => (
    <g>
      {/* Title above the axis */}
      <text
        x={PAD} y={y + TITLE_DY}
        fontSize="14" fontWeight="600" fill={fg}
      >
        {title}
      </text>

      {/* Axis line */}
      <line
        x1={PAD} y1={y} x2={PAD + trackW} y2={y}
        stroke={border} strokeWidth="1.5"
      />

      {/* Ticks + labels */}
      {ticks.map((f, i) => {
        const x = xFor(f)
        const labelY = i === staggerIndex ? y + LABEL_ROW_B : y + LABEL_ROW_A
        return (
          <g key={f}>
            <line
              x1={x} y1={y - 7} x2={x} y2={y + 7}
              stroke={accent} strokeWidth="1.6"
            />
            <circle cx={x} cy={y} r={3.2} fill={accent} />
            {/* Leader line from tick down to the staggered label so the
                eye still associates label with tick. */}
            {i === staggerIndex && (
              <line
                x1={x} y1={y + 8}
                x2={x} y2={y + LABEL_ROW_B - 10}
                stroke={muted} strokeWidth="0.8"
                strokeDasharray="2 2"
              />
            )}
            <text
              x={x} y={labelY}
              textAnchor="middle" fontSize="13" fontWeight="600" fill={fg}
            >
              {fmtTick(f)}
            </text>
          </g>
        )
      })}
    </g>
  )

  // ── Connectors between matching ticks ──────────────────────────────
  // Help the eye see *the same four frequencies* are at very different
  // positions on the two scales.
  return (
    <DiagramFigure caption={t('ch0_4.logVsLinearCaption')}>
      <SVGDiagram
        width={W} height={H}
        style={{ maxWidth: W, margin: '0 auto' }}
        fontFamily="inherit"
        aria-label={t('ch0_4.logVsLinearAria')}
      >
        {/* Connectors first so they sit behind the ticks */}
        {ticks.map((f) => (
          <line
            key={`c-${f}`}
            x1={linX(f)} y1={linY + 7}
            x2={logX(f)} y2={logY - 7}
            stroke={muted} strokeWidth="0.7"
            strokeDasharray="2 3" opacity={0.55}
          />
        ))}

        {/* Linear axis: stagger "10 Hz" (index 1) — it's only ~5 px from
            "1 Hz" and would otherwise collide. The stagger IS the lesson
            of the diagram: even the labels don't fit. */}
        {renderScale(linY, t('ch0_4.logVsLinearTitleLinear'), linX, 1)}
        {/* Log axis: every tick fits on one row by construction. */}
        {renderScale(logY, t('ch0_4.logVsLinearTitleLog'), logX, -1)}

        {/* Footnote */}
        <text
          x={PAD} y={H - 8}
          fontSize="11" fill={muted} fontStyle="italic"
        >
          {t('ch0_4.logVsLinearFootnote')}
        </text>
      </SVGDiagram>
    </DiagramFigure>
  )
}
