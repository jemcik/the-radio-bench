/**
 * Chapter 2.2 §7 — bandwidth visualiser.
 *
 * Pick a mode and see how much spectrum it occupies, on a log-scaled
 * comparison chart against the other modes. For the two FM modes a
 * deviation + audio slider drives Carson's rule, BW = 2·(deviation + audio);
 * the non-FM modes have fixed bandwidths.
 *
 * Reference bandwidths (kHz): CW ≈ 0.15, SSB ≈ 2.7, AM ≈ 6, NBFM ≈ 11
 * (Carson, ±2.5 / 3), broadcast FM ≈ 180 (Carson, ±75 / 15). Cf. ARRL
 * Handbook 2023 §11.
 *
 * Slider-driven, no animation.
 */
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import Widget from '@/components/ui/widget'
import { ResultBox } from '@/components/ui/result-box'
import { useLocaleFormatter, useUnitFormatter } from '@/lib/hooks/useLocaleFormatter'
import { svgTokens } from '@/components/diagrams/svgTokens'

type Mode = 'cw' | 'ssb' | 'am' | 'nbfm' | 'wbfm'
const MODES: Mode[] = ['cw', 'ssb', 'am', 'nbfm', 'wbfm']
const FM_MODES: Mode[] = ['nbfm', 'wbfm']

const FIXED_BW: Record<'cw' | 'ssb' | 'am', number> = { cw: 0.15, ssb: 2.7, am: 6 }
const PRESET: Record<'nbfm' | 'wbfm', { dev: number; audio: number }> = {
  nbfm: { dev: 2.5, audio: 3 },
  wbfm: { dev: 75, audio: 15 },
}

const CHANNEL_KHZ = 25

// log-scaled bar chart geometry.
// LABEL_W budget (worst case): Ukrainian mode names run much wider than EN —
//   «FM (радіомовлення)» ≈ 18 chars, «CW (азбука Морзе)» ≈ 16 chars at 13 px
//   (~7 px/char Cyrillic) → ~126 px. Right-anchored labels end at LABEL_W−10,
//   so the gutter must clear that width or the leftmost letters clip off the
//   viewBox (reader-flagged: «CW…»→«W», «FM (радіо…)»→«Л…»). 152 leaves a
//   comfortable margin; W widened to keep bars + value labels on-canvas.
const W = 540
const ROW_H = 30
const TOP = 8
const LABEL_W = 152
const BAR_X0 = LABEL_W
const BAR_MAX_W = 230
const LOG_MIN = Math.log10(0.1)
const LOG_MAX = Math.log10(200)

function barWidth(bwKhz: number): number {
  const v = Math.max(0.1, bwKhz)
  const frac = (Math.log10(v) - LOG_MIN) / (LOG_MAX - LOG_MIN)
  return Math.max(2, frac * BAR_MAX_W)
}

export default function BandwidthVisualiser() {
  const { t } = useTranslation('ui')
  const { num } = useLocaleFormatter()
  const tUnit = useUnitFormatter()

  const [mode, setMode] = useState<Mode>('ssb')
  const [devKhz, setDevKhz] = useState(PRESET.nbfm.dev)
  const [audioKhz, setAudioKhz] = useState(PRESET.nbfm.audio)

  const isFm = FM_MODES.includes(mode)

  function selectMode(m: Mode) {
    setMode(m)
    if (m === 'nbfm' || m === 'wbfm') {
      setDevKhz(PRESET[m].dev)
      setAudioKhz(PRESET[m].audio)
    }
  }

  // Bandwidth for a given mode — live values for the *selected* FM mode,
  // presets for the rest.
  const bwOf = (m: Mode): number => {
    if (m === 'cw' || m === 'ssb' || m === 'am') return FIXED_BW[m]
    if (m === mode) return 2 * (devKhz + audioKhz)
    return 2 * (PRESET[m].dev + PRESET[m].audio)
  }

  const selectedBw = bwOf(mode)
  const fitCount = Math.floor(CHANNEL_KHZ / selectedBw)

  const H = TOP * 2 + MODES.length * ROW_H

  return (
    <Widget title={t('ch2_2.bandwidth.title')} description={t('ch2_2.bandwidth.description')}>
      {/* mode selector */}
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="text-foreground font-medium shrink-0 w-20">{t('ch2_2.bandwidth.modeLabel')}</span>
        {MODES.map(m => (
          <button
            key={m}
            type="button"
            aria-pressed={mode === m}
            onClick={() => selectMode(m)}
            className={`px-3 py-1 rounded border cursor-pointer transition-colors ${
              mode === m
                ? 'border-primary bg-primary/10 text-foreground'
                : 'border-border text-muted-foreground hover:text-foreground'
            }`}
          >
            {t(`ch2_2.bandwidth.mode${m.charAt(0).toUpperCase()}${m.slice(1)}`)}
          </button>
        ))}
      </div>

      {/* FM sliders (only relevant for FM modes) */}
      {isFm ? (
        <div className="grid grid-cols-1 gap-3">
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <label htmlFor="bw-dev" className="text-foreground font-medium shrink-0 w-44">
              {t('ch2_2.bandwidth.deviationLabel')}
            </label>
            <input
              id="bw-dev"
              type="range"
              min={0.5}
              max={80}
              step={0.5}
              value={devKhz}
              onChange={e => setDevKhz(Number(e.target.value))}
              className="flex-1 min-w-[140px] accent-primary"
            />
            <span className="font-mono text-foreground w-24 text-right shrink-0">±{num(devKhz)} {tUnit('khz')}</span>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <label htmlFor="bw-audio" className="text-foreground font-medium shrink-0 w-44">
              {t('ch2_2.bandwidth.audioLabel')}
            </label>
            <input
              id="bw-audio"
              type="range"
              min={1}
              max={15}
              step={0.5}
              value={audioKhz}
              onChange={e => setAudioKhz(Number(e.target.value))}
              className="flex-1 min-w-[140px] accent-primary"
            />
            <span className="font-mono text-foreground w-24 text-right shrink-0">{num(audioKhz)} {tUnit('khz')}</span>
          </div>
        </div>
      ) : (
        <p className="text-[13px] text-muted-foreground">{t('ch2_2.bandwidth.deviationOnly')}</p>
      )}

      {/* comparison chart */}
      <svg
        width={W}
        height={H}
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={t('ch2_2.bandwidth.title')}
        style={{ display: 'block', margin: '0 auto', maxWidth: '100%', height: 'auto' }}
        xmlns="http://www.w3.org/2000/svg"
      >
        {MODES.map((m, i) => {
          const y = TOP + i * ROW_H + ROW_H / 2
          const bw = bwOf(m)
          const bw1 = Math.round(bw * 10) / 10
          const selected = m === mode
          const color = selected ? svgTokens.primary : svgTokens.mutedFg
          const bwLabel = `${num(bw1)} ${tUnit('khz')}`
          return (
            <g key={m}>
              <text x={LABEL_W - 10} y={y + 4} fontSize="13" textAnchor="end"
                fill={selected ? svgTokens.fg : svgTokens.mutedFg}
                fontWeight={selected ? 600 : 400}
                fontFamily="ui-sans-serif, system-ui, sans-serif">
                {t(`ch2_2.bandwidth.mode${m.charAt(0).toUpperCase()}${m.slice(1)}`)}
              </text>
              <rect x={BAR_X0} y={y - 7} width={barWidth(bw)} height={14} rx={3}
                fill={color} fillOpacity={selected ? 0.85 : 0.4} />
              <text x={BAR_X0 + barWidth(bw) + 6} y={y + 4} fontSize="13" textAnchor="start"
                fill={selected ? svgTokens.fg : svgTokens.mutedFg}
                fontFamily="ui-sans-serif, system-ui, sans-serif">
                {bwLabel}
              </text>
            </g>
          )
        })}
      </svg>

      {/* readouts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <ResultBox tone="success" label={t('ch2_2.bandwidth.bwReadout')}>
          <p className="text-xl font-mono font-semibold text-foreground">
            {num(Math.round(selectedBw * 10) / 10)} {tUnit('khz')}
          </p>
        </ResultBox>
        <ResultBox tone="info" label={t('ch2_2.bandwidth.fitReadout')}>
          <p className="text-xl font-mono font-semibold text-foreground">
            {fitCount >= 1 ? `${num(fitCount)}×` : t('ch2_2.bandwidth.fitSwamp')}
          </p>
        </ResultBox>
      </div>

      <p className="text-[13px] text-muted-foreground">{t('ch2_2.bandwidth.hint')}</p>
    </Widget>
  )
}
