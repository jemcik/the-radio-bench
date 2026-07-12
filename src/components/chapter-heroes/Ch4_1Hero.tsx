/**
 * Chapter 4.1 hero — the frequency spectrum decides how a signal travels.
 *
 * A band strip (LF · MF · HF · VHF · UHF); above each range, a glyph of its
 * dominant propagation: a wave hugging the curved earth (ground wave, low
 * bands), a wave bouncing off the ionosphere (sky wave, HF), and a straight
 * line-of-sight arrow (VHF/UHF). Distinct from the detailed §1 scene diagram —
 * this frames the whole chapter: frequency → propagation.
 *
 * Static line illustration, `currentColor` so it follows the theme; one
 * primary accent on the HF / sky-wave band.
 *
 * hardcoded-fontsize-file-ok: hero illustration with hand-tuned label sizes
 * in user-space units. No sibling diagrams in this file.
 */
import { useTranslation } from 'react-i18next'

const VB_W = 580
const VB_H = 214

// Band segments (x ranges).
const BANDS = [
  { key: 'lf', x0: 40, x1: 140 },
  { key: 'mf', x0: 140, x1: 240 },
  { key: 'hf', x0: 240, x1: 340 },
  { key: 'vhf', x0: 340, x1: 440 },
  { key: 'uhf', x0: 440, x1: 540 },
]
const BAR_Y = 138
const BAR_H = 22

/** A few small humps hugging the ground arc — the ground-wave glyph. */
function groundWaveGlyph(): string {
  const pts: string[] = []
  for (let x = 60; x <= 222; x += 4) {
    const y = 110 + 6 * Math.sin(((x - 60) / 27) * Math.PI)
    pts.push(`${x} ${y.toFixed(1)}`)
  }
  return `M ${pts.join(' L ')}`
}

export default function Ch4_1Hero() {
  const { t } = useTranslation('ui')
  const k = (s: string) => t(`ch4_1.hero.${s}`)

  return (
    <svg
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      width={VB_W}
      height={VB_H}
      fill="none"
      aria-label={t('ch4_1.heroAriaLabel')}
      role="img"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* ── Mode captions ── */}
      <text x={140} y={58} fontSize="13" fontWeight={600} fill="currentColor" textAnchor="middle" opacity={0.85}>{k('groundWave')}</text>
      <text x={290} y={58} fontSize="13" fontWeight={600} fill="hsl(var(--primary))" textAnchor="middle">{k('skyWave')}</text>
      <text x={440} y={58} fontSize="13" fontWeight={600} fill="currentColor" textAnchor="middle" opacity={0.85}>{k('lineOfSight')}</text>

      {/* ── Ground-wave glyph: wave hugging a small earth arc ── */}
      <path d="M 52 124 Q 140 116 228 124" stroke="currentColor" strokeWidth="1.6" opacity={0.55} />
      <path d={groundWaveGlyph()} stroke="currentColor" strokeWidth="2" opacity={0.85} strokeLinecap="round" />

      {/* ── Sky-wave glyph: bounce off the ionosphere ── */}
      <line x1={250} y1={74} x2={330} y2={74} stroke="hsl(var(--primary))" strokeWidth="1.5" strokeDasharray="6 4" opacity={0.7} />
      <path d="M 258 122 L 290 80 L 322 122" stroke="hsl(var(--primary))" strokeWidth="2.2" strokeLinejoin="round" />
      <circle cx={290} cy={80} r={2.8} fill="hsl(var(--primary))" />

      {/* ── Line-of-sight glyph: straight arrow ── */}
      <line x1={360} y1={116} x2={516} y2={116} stroke="currentColor" strokeWidth="2" opacity={0.85} />
      <path d="M 516 111 l 9 5 l -9 5 Z" fill="currentColor" opacity={0.85} />

      {/* ── Band strip ── */}
      {BANDS.map(b => {
        const isHf = b.key === 'hf'
        return (
          <g key={b.key}>
            <rect
              x={b.x0}
              y={BAR_Y}
              width={b.x1 - b.x0}
              height={BAR_H}
              fill={isHf ? 'hsl(var(--primary))' : 'currentColor'}
              fillOpacity={isHf ? 0.18 : 0.07}
              stroke={isHf ? 'hsl(var(--primary))' : 'currentColor'}
              strokeWidth={isHf ? 1.5 : 1}
              strokeOpacity={isHf ? 0.8 : 0.35}
            />
            <text
              x={(b.x0 + b.x1) / 2}
              y={BAR_Y + 15}
              fontSize="13"
              fontWeight={600}
              fill={isHf ? 'hsl(var(--primary))' : 'currentColor'}
              textAnchor="middle"
              opacity={isHf ? 1 : 0.8}
            >
              {k(b.key)}
            </text>
          </g>
        )
      })}

      {/* ── Frequency axis ── */}
      <line x1={40} y1={182} x2={545} y2={182} stroke="currentColor" strokeWidth="1.2" opacity={0.5} />
      <path d="M 545 178 l 8 4 l -8 4 Z" fill="currentColor" opacity={0.5} />
      <text x={40} y={200} fontSize="12" fill="currentColor" textAnchor="start" opacity={0.6}>{k('lowFreq')}</text>
      <text x={540} y={200} fontSize="12" fill="currentColor" textAnchor="end" opacity={0.6}>{k('highFreq')}</text>
    </svg>
  )
}
