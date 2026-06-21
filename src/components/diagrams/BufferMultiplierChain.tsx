/**
 * Chapter 3.2 §3 — oscillator → buffer → frequency multiplier.
 *
 *   [oscillator] —4 MHz→ ▷buffer —4 MHz→ [× 3] —12 MHz→ to driver
 *
 * A small block diagram: the buffer (amplifier triangle) isolates the
 * oscillator; the multiplier lifts a low steady frequency to a higher one.
 * Static snapshot — bare <svg>, fixed px = viewBox, numeric fontSize.
 *
 * hardcoded-fontsize-file-ok: block diagram with hand-tuned label sizes in
 * user-space units. No SVGDiagram wrapper.
 */
import { useTranslation } from 'react-i18next'
import DiagramFigure from './DiagramFigure'
import { svgTokens } from './svgTokens'

const VB_W = 600
const VB_H = 150
const FLOW_Y = 60

const OSC = { x: 24, y: 36, w: 104, h: 48 }
const MULT = { x: 336, y: 36, w: 96, h: 48 }
const BUF = { base: 188, apex: 248, top: 38, bot: 82 }
const OUT_X = 516

const SANS = 'ui-sans-serif, system-ui, sans-serif'

function arrow(toX: number, y: number) {
  return `M ${toX} ${y} l -8 -4 v 8 z`
}

/** A short sine glyph, `periods` cycles from x0 to x1 about baseY. */
function wave(x0: number, x1: number, baseY: number, amp: number, periods: number): string {
  const N = 56
  let d = ''
  for (let i = 0; i <= N; i++) {
    const t = i / N
    const x = x0 + (x1 - x0) * t
    const y = baseY - amp * Math.sin(t * periods * 2 * Math.PI)
    d += `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)} `
  }
  return d.trim()
}

export default function BufferMultiplierChain() {
  const { t } = useTranslation('ui')

  return (
    <DiagramFigure caption={t('ch3_2.stages.caption')}>
      <svg
        width={VB_W}
        height={VB_H}
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        role="img"
        aria-label={t('ch3_2.stages.ariaLabel')}
        style={{ display: 'block', margin: '0 auto', maxWidth: '100%', height: 'auto' }}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* ── Oscillator box (with a carrier wave inside) ──────────── */}
        <rect x={OSC.x} y={OSC.y} width={OSC.w} height={OSC.h} rx={6}
          stroke={svgTokens.fg} strokeWidth={1.6} fill="hsl(var(--muted))" />
        <path d={wave(OSC.x + 12, OSC.x + OSC.w - 12, FLOW_Y, 9, 2)}
          stroke={svgTokens.primary} strokeWidth={1.8} fill="none" strokeLinecap="round" />
        <text x={OSC.x + OSC.w / 2} y={102} fontSize="13" fontWeight={600} textAnchor="middle" fill={svgTokens.fg} fontFamily={SANS}>
          {t('ch3_2.stages.oscLabel')}
        </text>

        {/* osc → buffer */}
        <line x1={OSC.x + OSC.w} y1={FLOW_Y} x2={BUF.base - 6} y2={FLOW_Y} stroke={svgTokens.fg} strokeWidth={1.6} />
        <path d={arrow(BUF.base - 6, FLOW_Y)} fill={svgTokens.fg} />
        <text x={(OSC.x + OSC.w + BUF.base) / 2} y={FLOW_Y - 12} fontSize="13" textAnchor="middle" fill={svgTokens.mutedFg} fontFamily={SANS}>
          {t('ch3_2.stages.freqLow')}
        </text>

        {/* ── Buffer (amplifier triangle) ──────────────────────────── */}
        <path d={`M ${BUF.base} ${BUF.top} V ${BUF.bot} L ${BUF.apex} ${FLOW_Y} Z`}
          stroke={svgTokens.fg} strokeWidth={1.6} fill="hsl(var(--muted))" strokeLinejoin="round" />
        <text x={(BUF.base + BUF.apex) / 2 - 4} y={102} fontSize="13" fontWeight={600} textAnchor="middle" fill={svgTokens.fg} fontFamily={SANS}>
          {t('ch3_2.stages.bufferLabel')}
        </text>
        <text x={(BUF.base + BUF.apex) / 2 - 4} y={118} fontSize="12" textAnchor="middle" fill={svgTokens.mutedFg} fontFamily={SANS}>
          {t('ch3_2.stages.bufferSub')}
        </text>

        {/* buffer → multiplier */}
        <line x1={BUF.apex} y1={FLOW_Y} x2={MULT.x - 6} y2={FLOW_Y} stroke={svgTokens.fg} strokeWidth={1.6} />
        <path d={arrow(MULT.x - 6, FLOW_Y)} fill={svgTokens.fg} />
        <text x={(BUF.apex + MULT.x) / 2} y={FLOW_Y - 12} fontSize="13" textAnchor="middle" fill={svgTokens.mutedFg} fontFamily={SANS}>
          {t('ch3_2.stages.freqLow')}
        </text>

        {/* ── Multiplier box ───────────────────────────────────────── */}
        <rect x={MULT.x} y={MULT.y} width={MULT.w} height={MULT.h} rx={6}
          stroke={svgTokens.fg} strokeWidth={1.6} fill="hsl(var(--muted))" />
        <text x={MULT.x + MULT.w / 2} y={FLOW_Y + 7} fontSize="18" fontWeight={700} textAnchor="middle" fill={svgTokens.primary} fontFamily={SANS}>
          {t('ch3_2.stages.multLabel')}
        </text>
        <text x={MULT.x + MULT.w / 2} y={102} fontSize="13" fontWeight={600} textAnchor="middle" fill={svgTokens.fg} fontFamily={SANS}>
          {t('ch3_2.stages.multSub')}
        </text>

        {/* multiplier → out */}
        <line x1={MULT.x + MULT.w} y1={FLOW_Y} x2={OUT_X} y2={FLOW_Y} stroke={svgTokens.primary} strokeWidth={2.2} />
        <path d={arrow(OUT_X, FLOW_Y)} fill={svgTokens.primary} />
        <text x={(MULT.x + MULT.w + OUT_X) / 2} y={FLOW_Y - 12} fontSize="13" fontWeight={600} textAnchor="middle" fill={svgTokens.fg} fontFamily={SANS}>
          {t('ch3_2.stages.freqHigh')}
        </text>
        <text x={OUT_X + 8} y={FLOW_Y + 4} fontSize="12" textAnchor="start" fill={svgTokens.mutedFg} fontFamily={SANS}>
          {t('ch3_2.stages.toDriver')}
        </text>
      </svg>
    </DiagramFigure>
  )
}
