/**
 * Chapter 3.2 §5 — which amplifier class suits which mode.
 *
 *   constant envelope (CW, FM)      → efficient Class C is fine
 *   envelope carries message (AM, SSB) → must stay linear (Class A/AB)
 *
 * Two panels, each with a little waveform: a flat-envelope carrier on the left,
 * an amplitude-modulated carrier (with its envelope dashed) on the right. The
 * point is visual — the message is the envelope, so you may not clip it.
 * Static snapshot — bare <svg>, fixed px = viewBox, numeric fontSize.
 *
 * hardcoded-fontsize-file-ok: comparison diagram with hand-tuned label sizes in
 * user-space units. No SVGDiagram wrapper.
 */
import { useTranslation } from 'react-i18next'
import DiagramFigure from './DiagramFigure'
import { svgTokens } from './svgTokens'

const VB_W = 640
const VB_H = 208
const WAVE_Y = 76

const SANS = 'ui-sans-serif, system-ui, sans-serif'

/** Constant-amplitude sine across x0..x1. */
function uniformWave(x0: number, x1: number, baseY: number, amp: number, cycles: number): string {
  const N = 96
  let d = ''
  for (let i = 0; i <= N; i++) {
    const t = i / N
    const x = x0 + (x1 - x0) * t
    const y = baseY - amp * Math.sin(t * cycles * 2 * Math.PI)
    d += `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)} `
  }
  return d.trim()
}

/** Amplitude-modulated carrier; returns the wave path plus its envelope curves. */
function amWave(
  x0: number, x1: number, baseY: number,
  ampMin: number, ampMax: number, carrierCycles: number, envCycles: number,
): { wave: string; top: string; bot: string } {
  const N = 160
  const mid = (ampMax + ampMin) / 2
  const half = (ampMax - ampMin) / 2
  const amp = (t: number) => mid + half * Math.sin(t * envCycles * 2 * Math.PI)
  let wave = '', top = '', bot = ''
  for (let i = 0; i <= N; i++) {
    const t = i / N
    const x = x0 + (x1 - x0) * t
    const a = amp(t)
    const y = baseY - a * Math.sin(t * carrierCycles * 2 * Math.PI)
    wave += `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)} `
    top += `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${(baseY - a).toFixed(1)} `
    bot += `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${(baseY + a).toFixed(1)} `
  }
  return { wave: wave.trim(), top: top.trim(), bot: bot.trim() }
}

export default function ClassModeMatch() {
  const { t } = useTranslation('ui')
  const am = amWave(360, 600, WAVE_Y, 5, 22, 15, 2)

  return (
    <DiagramFigure caption={t('ch3_2.classMode.caption')}>
      <svg
        width={VB_W}
        height={VB_H}
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        role="img"
        aria-label={t('ch3_2.classMode.ariaLabel')}
        style={{ display: 'block', margin: '0 auto', maxWidth: '100%', height: 'auto' }}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* divider */}
        <line x1={320} y1={16} x2={320} y2={VB_H - 16} stroke={svgTokens.border} strokeWidth={1.2} strokeDasharray="3 4" />

        {/* ── Left panel: constant envelope → Class C ──────────────── */}
        <text x={160} y={28} fontSize="14" fontWeight={600} textAnchor="middle" fill={svgTokens.fg} fontFamily={SANS}>
          {t('ch3_2.classMode.titleConst')}
        </text>
        {/* flat (constant) envelope guides */}
        <line x1={40} y1={WAVE_Y - 20} x2={280} y2={WAVE_Y - 20} stroke={svgTokens.mutedFg} strokeWidth={1} strokeDasharray="2 4" opacity={0.6} />
        <line x1={40} y1={WAVE_Y + 20} x2={280} y2={WAVE_Y + 20} stroke={svgTokens.mutedFg} strokeWidth={1} strokeDasharray="2 4" opacity={0.6} />
        <path d={uniformWave(40, 280, WAVE_Y, 20, 7)} stroke={svgTokens.primary} strokeWidth={1.8} fill="none" strokeLinecap="round" />
        <text x={160} y={134} fontSize="14" fontWeight={700} textAnchor="middle" fill={svgTokens.experiment} fontFamily={SANS}>
          {t('ch3_2.classMode.modesConst')}
        </text>
        <text x={160} y={164} fontSize="13.5" textAnchor="middle" fill={svgTokens.experiment} fontFamily={SANS}>
          {t('ch3_2.classMode.verdictConst')}
        </text>
        <text x={160} y={190} fontSize="12.5" textAnchor="middle" fill={svgTokens.mutedFg} fontFamily={SANS}>
          {t('ch3_2.classMode.reasonConst')}
        </text>

        {/* ── Right panel: envelope carries message → linear ───────── */}
        <text x={480} y={28} fontSize="14" fontWeight={600} textAnchor="middle" fill={svgTokens.fg} fontFamily={SANS}>
          {t('ch3_2.classMode.titleEnv')}
        </text>
        {/* the envelope IS the message — drawn in caution to flag «do not clip» */}
        <path d={am.top} stroke={svgTokens.caution} strokeWidth={1.3} fill="none" strokeDasharray="3 3" opacity={0.85} />
        <path d={am.bot} stroke={svgTokens.caution} strokeWidth={1.3} fill="none" strokeDasharray="3 3" opacity={0.85} />
        <path d={am.wave} stroke={svgTokens.primary} strokeWidth={1.6} fill="none" strokeLinecap="round" />
        <text x={480} y={134} fontSize="14" fontWeight={700} textAnchor="middle" fill={svgTokens.caution} fontFamily={SANS}>
          {t('ch3_2.classMode.modesEnv')}
        </text>
        <text x={480} y={164} fontSize="13.5" textAnchor="middle" fill={svgTokens.caution} fontFamily={SANS}>
          {t('ch3_2.classMode.verdictEnv')}
        </text>
        <text x={480} y={190} fontSize="12.5" textAnchor="middle" fill={svgTokens.mutedFg} fontFamily={SANS}>
          {t('ch3_2.classMode.reasonEnv')}
        </text>
      </svg>
    </DiagramFigure>
  )
}
