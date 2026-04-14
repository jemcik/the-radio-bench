import { useTranslation } from 'react-i18next'
import SVGDiagram from './SVGDiagram'
import DiagramFigure from './DiagramFigure'
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
  // Ladder shows the common 8-prefix range (pico…giga) — drop the tera entry.
  const prefixes = SI_PREFIXES.slice(0, 8).map(p => ({
    symbol: p.symbol || '—',  // '—' marker for unity so the axis is visibly centered
    power: p.powerLabel,
    exampleKey: p.exampleKey,
  }))
  // SI_PREFIXES[UNITY_PREFIX_INDEX] is the '10⁰' row; that index also holds here
  // because prefixes[] is a prefix of the same array.
  const centerIndex = UNITY_PREFIX_INDEX

  const W = 720, H = 110
  const axisY = 48
  const axisStartX = 50
  const axisEndX = 670
  const axisLength = axisEndX - axisStartX

  const step = axisLength / (prefixes.length - 1)
  const positions = prefixes.map((_, i) => axisStartX + step * i)

  const segmentColors = [
    'hsl(210 60% 55%)', 'hsl(250 50% 58%)', 'hsl(280 45% 55%)',
    'hsl(320 50% 55%)', 'hsl(38 70% 50%)',  'hsl(25 70% 50%)',
    'hsl(0 60% 55%)',
  ]

  const arrowY = axisY - 24
  const arrowC = 'hsl(var(--muted-foreground))'
  const axisC = 'hsl(var(--border))'
  const labelC = 'hsl(var(--muted-foreground))'

  // Draw a small chevron at (x, y) pointing left or right
  const chevron = (x: number, dir: 'left' | 'right') => {
    const dx = dir === 'left' ? 5 : -5
    return `${x + dx},${arrowY - 3.5} ${x},${arrowY} ${x + dx},${arrowY + 3.5}`
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
                textAnchor="middle" fontSize="7.5" fill={arrowC}>{label}</text>
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
          return (
            <g key={i}>
              <line x1={x} y1={axisY - 7} x2={x} y2={axisY + 7}
                stroke={labelC} strokeWidth="1.2" />
              <text x={x} y={axisY - 12}
                textAnchor="middle" fontSize="14" fontWeight="700"
                fill="hsl(var(--foreground))">{p.symbol}</text>
              <text x={x} y={axisY + 21}
                textAnchor="middle" fontSize="10"
                fill={labelC}>{p.power}</text>
              <text x={x} y={axisY + 34}
                textAnchor="middle" fontSize="8.5"
                fill={labelC} fontStyle="italic" opacity="0.7">{t(`ch0_3.${p.exampleKey}`)}</text>
            </g>
          )
        })}
      </SVGDiagram>
    </DiagramFigure>
  )
}
