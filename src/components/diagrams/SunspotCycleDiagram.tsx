/**
 * Chapter 4.1 §6 — the sunspot cycle over the last three solar cycles.
 *
 * Smoothed yearly sunspot number, cycles 23–25, with a "you are here (2026)"
 * marker on the declining side of Cycle 25. Values are approximate, rounded
 * from SILSO/SIDC monthly-smoothed sunspot numbers (cf. sidc.be, NOAA SWPC).
 *
 * Plotted-curve rules: useId clipPath, extended 3 px so the stroke is not
 * clipped at peaks; axes/ticks drawn at true boundaries.
 */
import { useId } from 'react'
import { useTranslation } from 'react-i18next'
import DiagramFigure from './DiagramFigure'
import { svgTokens as S } from './svgTokens'

const W = 680
const H = 316

const X0 = 54
const XW = 600
const Y_BASE = 268
const Y_TOP = 40
const HP = Y_BASE - Y_TOP // plot height for ssn 0..300

const YEAR_MIN = 1996
const YEAR_SPAN = 36 // 1996..2032
const SSN_MAX = 300

const xOf = (year: number) => X0 + ((year - YEAR_MIN) / YEAR_SPAN) * XW
const yOf = (ssn: number) => Y_BASE - (ssn / SSN_MAX) * HP

// [year, smoothed sunspot number]
const SERIES: Array<[number, number]> = [
  [1996, 8], [1998, 60], [2000, 118], [2001, 172], [2003, 112], [2005, 45],
  [2007, 12], [2008.5, 3], [2010, 16], [2012, 68], [2014, 114], [2016, 52],
  [2018, 12], [2019.5, 4], [2021, 30], [2022.5, 95], [2024, 160], [2025, 150],
  [2026, 118], [2028, 60], [2030, 14], [2031.5, 6],
]

const YEAR_TICKS = [2000, 2005, 2010, 2015, 2020, 2025, 2030]
const SSN_TICKS = [0, 100, 200, 300]
const HERE_YEAR = 2026
const HERE_SSN = 118

export default function SunspotCycleDiagram() {
  const { t } = useTranslation('ui')
  const k = (s: string) => t(`ch4_1.sunspot.${s}`)
  const clipId = useId()

  const curve = `M ${SERIES.map(([yr, ssn]) => `${xOf(yr).toFixed(1)} ${yOf(ssn).toFixed(1)}`).join(' L ')}`

  return (
    <DiagramFigure caption={k('caption')}>
      <svg
        width={W}
        height={H}
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={k('aria')}
        style={{ display: 'block', margin: '0 auto', maxWidth: '100%', height: 'auto' }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <clipPath id={clipId}>
            <rect x={X0 - 3} y={Y_TOP - 3} width={XW + 6} height={HP + 6} />
          </clipPath>
        </defs>

        {/* Gridlines (background: opacity < 0.7 keeps them out of the overlap sampler) + y ticks */}
        {SSN_TICKS.map(s => (
          <g key={s}>
            <line x1={X0} y1={yOf(s)} x2={X0 + XW} y2={yOf(s)} stroke={S.border} strokeWidth={1} opacity={0.5} />
            <text x={X0 - 8} y={yOf(s) + 4} fontSize={12} fill={S.mutedFg} textAnchor="end">{s}</text>
          </g>
        ))}
        <text x={16} y={(Y_TOP + Y_BASE) / 2} fontSize={13} fontWeight={600} fill={S.fg} transform={`rotate(-90 16 ${(Y_TOP + Y_BASE) / 2})`} textAnchor="middle">
          {k('yAxis')}
        </text>

        {/* x ticks */}
        {YEAR_TICKS.map(y => (
          <g key={y}>
            <line x1={xOf(y)} y1={Y_BASE} x2={xOf(y)} y2={Y_BASE + 5} stroke={S.mutedFg} strokeWidth={1} />
            <text x={xOf(y)} y={Y_BASE + 19} fontSize={12} fill={S.mutedFg} textAnchor="middle">{y}</text>
          </g>
        ))}
        <text x={X0 + XW / 2} y={H - 6} fontSize={13} fontWeight={600} fill={S.fg} textAnchor="middle">{k('xAxis')}</text>

        {/* Axes */}
        <line x1={X0} y1={Y_BASE} x2={X0 + XW} y2={Y_BASE} stroke={S.fg} strokeWidth={1.5} />

        {/* The sunspot curve */}
        <path d={curve} fill="none" stroke={S.primary} strokeWidth={2.4} clipPath={`url(#${clipId})`} />

        {/* Cycle labels above each peak (clear of the curve) */}
        <text x={xOf(2001)} y={yOf(172) - 10} fontSize={13} fontWeight={600} fill={S.mutedFg} textAnchor="middle">{k('cycle23')}</text>
        <text x={xOf(2014)} y={yOf(114) - 10} fontSize={13} fontWeight={600} fill={S.mutedFg} textAnchor="middle">{k('cycle24')}</text>
        <text x={xOf(2024) - 8} y={yOf(160) - 10} fontSize={13} fontWeight={600} fill={S.mutedFg} textAnchor="middle">{k('cycle25')}</text>

        {/* You are here (2026) — marker on the curve, label in the clear upper-right */}
        <line x1={xOf(HERE_YEAR)} y1={yOf(HERE_SSN)} x2={xOf(HERE_YEAR)} y2={Y_BASE} stroke={S.caution} strokeWidth={1.3} strokeDasharray="4 3" />
        <circle cx={xOf(HERE_YEAR)} cy={yOf(HERE_SSN)} r={4} fill={S.caution} />
        <text x={X0 + XW} y={72} fontSize={13} fontWeight={700} fill={S.caution} textAnchor="end">{k('youAreHere')}</text>
      </svg>
    </DiagramFigure>
  )
}
