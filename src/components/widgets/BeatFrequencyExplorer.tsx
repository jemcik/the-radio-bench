/**
 * Chapter 2.2 §4 — where sidebands come from: the beat between two tones.
 *
 * The reader's stumbling block (reader-flagged): «we changed the carrier's
 * amplitude, not its frequency — so how can new frequencies appear?» This
 * widget answers it physically. Two PURE tones, each with a perfectly steady
 * amplitude, sum to a single wave whose amplitude throbs (beats). Read
 * backwards: a throbbing amplitude can only be built from more than one
 * frequency — a single pure tone cannot throb. That is exactly why an
 * amplitude-modulated carrier carries sidebands.
 *
 * The slider sets the separation (in cycles across the window) between the two
 * tones around a centre frequency NC. Three stacked plots: Tone 1 (steady),
 * Tone 2 (steady), and their Sum (which beats, its envelope drawn dashed).
 * Slider-driven, no animation (per the chapter's interactive-not-animated
 * choice), so prefers-reduced-motion needs no special handling.
 *
 * Maths: cos(2π·f1·t) + cos(2π·f2·t) = 2·cos(2π·(f2−f1)/2·t)·cos(2π·(f1+f2)/2·t)
 * — the product of a slow envelope (the beat) and the fast centre oscillation.
 */
import { useId, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import Widget from '@/components/ui/widget'
import { ResultBox } from '@/components/ui/result-box'
import { mathComponents } from '@/lib/trans-defaults'
import { svgTokens } from '@/components/diagrams/svgTokens'

const W = 500
const H = 240
const PAD_L = 12
const PAD_R = 12
const PAD_T = 6
const PAD_B = 22
const PLOT_W = W - PAD_L - PAD_R
const PLOT_X0 = PAD_L
const PLOT_X1 = W - PAD_R

const ROWS = 3
const TITLE_H = 15
const ROW_H = (H - PAD_T - PAD_B) / ROWS
const ROW_AMP = (ROW_H - TITLE_H) / 2 - 4
// One tone has amplitude 1; the sum reaches 2. Scale so the sum (±2) fits
// the row with a little headroom, and a single tone shows at ~half height.
const UNIT = ROW_AMP / 2.2

const NC = 24 // centre cycles across the window (the "fast" oscillation)
const SAMPLES = 480

function rowMid(r: number): number {
  return PAD_T + r * ROW_H + TITLE_H + (ROW_H - TITLE_H) / 2
}

function tonePath(cyclesPerWindow: number, mid: number): string {
  let d = ''
  for (let i = 0; i <= SAMPLES; i++) {
    const t = i / SAMPLES
    const x = PLOT_X0 + t * PLOT_W
    const y = mid - UNIT * Math.cos(2 * Math.PI * cyclesPerWindow * t)
    d += i === 0 ? `M${x.toFixed(2)} ${y.toFixed(2)}` : ` L${x.toFixed(2)} ${y.toFixed(2)}`
  }
  return d
}

function sumPath(f1: number, f2: number, mid: number): string {
  let d = ''
  for (let i = 0; i <= SAMPLES; i++) {
    const t = i / SAMPLES
    const x = PLOT_X0 + t * PLOT_W
    const v = Math.cos(2 * Math.PI * f1 * t) + Math.cos(2 * Math.PI * f2 * t)
    const y = mid - UNIT * v
    d += i === 0 ? `M${x.toFixed(2)} ${y.toFixed(2)}` : ` L${x.toFixed(2)} ${y.toFixed(2)}`
  }
  return d
}

/**
 * Beat envelope ±2·cos(2π·sep·t). Since f1 = NC − sep and f2 = NC + sep,
 * sum = 2·cos(2π·sep·t)·cos(2π·NC·t) — each tone sits `sep` away from the
 * centre, so the envelope (the half-difference frequency) is exactly `sep`,
 * NOT sep/2. Its zeros land where the sum pinches to nothing, so the dashed
 * curve hugs the real beats.
 */
function envPath(sep: number, mid: number, sign: 1 | -1): string {
  let d = ''
  for (let i = 0; i <= SAMPLES; i++) {
    const t = i / SAMPLES
    const x = PLOT_X0 + t * PLOT_W
    const y = mid - sign * UNIT * 2 * Math.cos(2 * Math.PI * sep * t)
    d += i === 0 ? `M${x.toFixed(2)} ${y.toFixed(2)}` : ` L${x.toFixed(2)} ${y.toFixed(2)}`
  }
  return d
}

export default function BeatFrequencyExplorer() {
  const { t } = useTranslation('ui')
  const [sep, setSep] = useState(3)
  const clipId = useId()

  const f1 = NC - sep
  const f2 = NC + sep

  // Qualitative readout (all three values are markup-free → safe via plain t()).
  // Keys checked: ch2_2.beat.stateNone / stateSlow / stateFast.
  const stateKey =
    sep === 0 ? 'ch2_2.beat.stateNone' : sep <= 3 ? 'ch2_2.beat.stateSlow' : 'ch2_2.beat.stateFast'

  const rows = [
    { title: t('ch2_2.beat.tone1Label'), path: tonePath(f1, rowMid(0)), color: svgTokens.mutedFg, env: false },
    { title: t('ch2_2.beat.tone2Label'), path: tonePath(f2, rowMid(1)), color: svgTokens.mutedFg, env: false },
    { title: t('ch2_2.beat.sumLabel'), path: sumPath(f1, f2, rowMid(2)), color: svgTokens.primary, env: true },
  ]

  return (
    <Widget
      title={t('ch2_2.beat.title')}
      description={<Trans i18nKey="ch2_2.beat.description" ns="ui" components={{ ...mathComponents, strong: <strong />, em: <em /> }} />}
    >
      {/* slider */}
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <label htmlFor="beat-sep" className="text-foreground font-medium shrink-0 w-44">
          {t('ch2_2.beat.separationLabel')}
        </label>
        <input
          id="beat-sep"
          type="range"
          min={0}
          max={6}
          step={1}
          value={sep}
          onChange={e => setSep(Number(e.target.value))}
          className="flex-1 min-w-[140px] accent-primary"
        />
      </div>

      <svg
        width={W}
        height={H}
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={t('ch2_2.beat.title')}
        style={{ display: 'block', margin: '0 auto', maxWidth: '100%', height: 'auto' }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <clipPath id={clipId}>
            <rect x={PLOT_X0 - 3} y={PAD_T - 3} width={PLOT_W + 6} height={H - PAD_T - PAD_B + 6} />
          </clipPath>
        </defs>

        {rows.map((row, r) => (
          <g key={r}>
            <text
              x={PLOT_X0}
              y={PAD_T + r * ROW_H + 12}
              fontSize="13"
              fontWeight={600}
              fill={svgTokens.fg}
              fontFamily="ui-sans-serif, system-ui, sans-serif"
            >
              {row.title}
            </text>
            {/* zero line */}
            <line x1={PLOT_X0} y1={rowMid(r)} x2={PLOT_X1} y2={rowMid(r)}
              stroke={svgTokens.border} strokeWidth={0.6} opacity={0.5} />
            {row.env && (
              <g clipPath={`url(#${clipId})`}>
                <path d={envPath(sep, rowMid(2), 1)} fill="none" stroke={svgTokens.mutedFg} strokeWidth={1.2} strokeDasharray="4 3" opacity={0.7} />
                <path d={envPath(sep, rowMid(2), -1)} fill="none" stroke={svgTokens.mutedFg} strokeWidth={1.2} strokeDasharray="4 3" opacity={0.7} />
              </g>
            )}
            <g clipPath={`url(#${clipId})`}>
              <path d={row.path} fill="none" stroke={row.color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
            </g>
          </g>
        ))}

        <text x={PLOT_X0 + PLOT_W / 2} y={H - 6} fontSize="13" textAnchor="middle"
          fill={svgTokens.mutedFg} fontFamily="ui-sans-serif, system-ui, sans-serif">
          {t('ch2_2.beat.timeAxis')}
        </text>
      </svg>

      <ResultBox tone="info" label={t('ch2_2.beat.stateLabel')}>
        <p className="text-foreground">{t(stateKey)}</p>
      </ResultBox>
    </Widget>
  )
}
