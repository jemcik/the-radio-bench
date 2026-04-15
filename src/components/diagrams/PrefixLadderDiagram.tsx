import { useTranslation } from 'react-i18next'
import SVGDiagram from './SVGDiagram'
import DiagramFigure from './DiagramFigure'
import { svgTokens } from './svgTokens'
import { SI_PREFIXES, UNITY_PREFIX_INDEX } from '@/features/si/prefixes'

/**
 * Chapter 0.3 — SI Prefixes logarithmic scale
 *
 * Each segment between ticks has its own arrow:
 *   ← ÷1000 for segments left of 10⁰
 *   ×1000 → for segments right of 10⁰
 */
export default function PrefixLadderDiagram() {
  const { t } = useTranslation('ui')
  // Ladder shows the full 9-prefix range that radio actually uses: pico → tera.
  // (Picofarads for capacitance up to terahertz for thermal radiation.)
  const prefixes = SI_PREFIXES.map(p => ({
    symbol: p.symbol || '—',  // '—' marker for unity so the axis is visibly centered
    power: p.powerLabel,
    exampleKey: p.exampleKey,
  }))
  // SI_PREFIXES[UNITY_PREFIX_INDEX] is the '10⁰' row; that index also holds here
  // because prefixes[] is the same array.
  const centerIndex = UNITY_PREFIX_INDEX

  // Sized to fit 9 ticks comfortably AND keep the labels at a readable
  // font size (17/12.5/11 px). The SVG itself is responsive (width="100%").
  // Vertical budget (top → bottom):
  //   arrowY−6   = 24   arrow labels (×1000 / ÷1000)
  //   axisY−14   = 40   prefix symbol (fontSize 17)
  //   axisY      = 54   axis line
  //   axisY+24   = 78   power label (10ⁿ)
  //   axisY+40   = 94   example line 1
  //   axisY+53   = 107  example line 2 (when wrapped)
  // ≈ 3 px descender → content reaches y ≈ 110, leave a small margin.
  const W = 820, H = 116
  const axisY = 54
  const axisStartX = 50
  const axisEndX = 770
  const axisLength = axisEndX - axisStartX

  const step = axisLength / (prefixes.length - 1)
  const positions = prefixes.map((_, i) => axisStartX + step * i)

  // 8 colours — one per segment between the 9 ticks.
  // DECORATIVE EXCEPTION (per CLAUDE.md): this is the prefix-segment
  // rainbow — a deliberate visual identity that lets the reader see
  // each magnitude band (kilo / mega / giga …) as a distinct hue.
  // It is intentionally NOT theme-driven; the rainbow stays the same
  // across every theme so the chapter prose can refer to "the blue
  // band" without worrying about light/dark mode.
  const segmentColors = [
    'hsl(210 60% 55%)', 'hsl(250 50% 58%)', 'hsl(280 45% 55%)',
    'hsl(320 50% 55%)', 'hsl(38 70% 50%)',  'hsl(25 70% 50%)',
    'hsl(0 60% 55%)',   'hsl(340 55% 55%)',
  ]

  const arrowY = axisY - 24
  const arrowC = svgTokens.mutedFg
  const axisC = svgTokens.border
  const labelC = svgTokens.mutedFg

  // Draw a small chevron at (x, y) pointing left or right
  const chevron = (x: number, dir: 'left' | 'right') => {
    const dx = dir === 'left' ? 5 : -5
    return `${x + dx},${arrowY - 3.5} ${x},${arrowY} ${x + dx},${arrowY + 3.5}`
  }

  /**
   * Split a short label into one or two roughly balanced lines so each line
   * fits inside the per-tick budget (~85 px at 11 px font). Single-word or
   * very short labels stay on one line.
   */
  const wrapLabel = (text: string): string[] => {
    if (text.length <= 12) return [text]
    const words = text.split(' ')
    if (words.length < 2) return [text]
    // Pick the split point that minimises the longer line.
    let best = { i: 1, diff: Infinity }
    for (let i = 1; i < words.length; i++) {
      const a = words.slice(0, i).join(' ').length
      const b = words.slice(i).join(' ').length
      const diff = Math.abs(a - b)
      if (diff < best.diff) best = { i, diff }
    }
    return [words.slice(0, best.i).join(' '), words.slice(best.i).join(' ')]
  }

  return (
    <DiagramFigure caption={t('ch0_3.prefixesDiagramCaption')}>
      <SVGDiagram
        width={W} height={H}
        style={{ maxWidth: W, margin: '0 auto' }}
        fontFamily="inherit"
        aria-label={t('ch0_3.prefixLadderAria')}
      >
        {/* ── Per-segment arrows ── */}
        {positions.slice(0, -1).map((x, i) => {
          const nextX = positions[i + 1]
          const midX = (x + nextX) / 2
          const isLeftOfCenter = i < centerIndex

          // Left of center: ← ÷1000 ; right of center: ×1000 →
          const arrowTipX  = isLeftOfCenter ? x + 10     : nextX - 10
          const arrowTailX = isLeftOfCenter ? nextX - 6  : x + 6
          const label      = isLeftOfCenter ? '÷1000'    : '×1000'
          const dir        = isLeftOfCenter ? 'left'     : 'right'

          return (
            <g key={`arr-${i}`}>
              <line x1={arrowTailX} y1={arrowY} x2={arrowTipX} y2={arrowY}
                stroke={arrowC} strokeWidth="0.8" />
              <polyline points={chevron(arrowTipX, dir)}
                fill="none" stroke={arrowC} strokeWidth="0.8" />
              <text x={midX} y={arrowY - 6}
                textAnchor="middle" fontSize="10" fill={arrowC}>{label}</text>
            </g>
          )
        })}

        {/* ── Axis line ── */}
        <line x1={axisStartX} y1={axisY} x2={axisEndX} y2={axisY}
          stroke={axisC} strokeWidth="1.5" />

        {/* ── Colored segments ── */}
        {positions.slice(0, -1).map((x, i) => (
          <rect key={`seg-${i}`}
            x={x} y={axisY - 2.5}
            width={positions[i + 1] - x} height={5} rx={2}
            fill={segmentColors[i]} opacity={0.3} />
        ))}

        {/* ── Ticks + labels ── */}
        {prefixes.map((p, i) => {
          const x = positions[i]
          const exampleLines = wrapLabel(t(`ch0_3.${p.exampleKey}`))
          return (
            <g key={i}>
              <line x1={x} y1={axisY - 7} x2={x} y2={axisY + 7}
                stroke={labelC} strokeWidth="1.2" />
              <text x={x} y={axisY - 14}
                textAnchor="middle" fontSize="17" fontWeight="700"
                fill="hsl(var(--foreground))">{p.symbol}</text>
              <text x={x} y={axisY + 24}
                textAnchor="middle" fontSize="12.5"
                fill={labelC}>{p.power}</text>
              <text x={x} y={axisY + 40}
                textAnchor="middle" fontSize="11"
                fill={labelC} fontStyle="italic" opacity="0.85">
                {exampleLines.map((line, li) => (
                  <tspan key={li} x={x} dy={li === 0 ? 0 : 13}>{line}</tspan>
                ))}
              </text>
            </g>
          )
        })}
      </SVGDiagram>
    </DiagramFigure>
  )
}
