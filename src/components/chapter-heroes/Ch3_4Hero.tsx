/**
 * Chapter 3.4 hero — one signal, many windows.
 *
 * A single sine wave runs across the top (the underlying physical reality);
 * three instrument faces below each tap that same signal and show it a
 * different way: an oscilloscope (waveform), an analog moving-coil gauge
 * (a needle), and a digital multimeter (a number). The chapter's thesis in
 * one picture — every instrument is a different window onto the same reality.
 *
 * Static pen-and-ink illustration (currentColor so it tracks the theme); the
 * interactive widgets do the moving parts.
 *
 * hardcoded-fontsize-file-ok: hero illustration with hand-tuned label sizes in
 * user-space units. No sibling diagrams in this file.
 */
import { useTranslation } from 'react-i18next'

const VB_W = 560
const VB_H = 212
const SANS = 'ui-sans-serif, system-ui, sans-serif'
const MONO = 'ui-monospace, SFMono-Regular, Menlo, monospace'

// Top "reality" wave
const WAVE_Y = 30
const WAVE_X0 = 24
const WAVE_X1 = 536
const WAVE_AMP = 9

// Panels
const PANEL_TOP = 58
const PANEL_H = 96
const PANEL_W = 148
const P1_X = 24
const P2_X = 206
const P3_X = 388
const P1_CX = P1_X + PANEL_W / 2
const P2_CX = P2_X + PANEL_W / 2
const P3_CX = P3_X + PANEL_W / 2
const CAP_Y = 174

/** A horizontal sine path sampled across [x0, x1] at baseline y, amplitude a. */
function sinePath(x0: number, x1: number, y: number, a: number, cycles: number): string {
  const N = 60
  const pts: string[] = []
  for (let i = 0; i <= N; i++) {
    const x = x0 + ((x1 - x0) * i) / N
    const yy = y - a * Math.sin((2 * Math.PI * cycles * i) / N)
    pts.push(`${x.toFixed(1)},${yy.toFixed(1)}`)
  }
  return `M ${pts.join(' L ')}`
}

/** A circular arc segment between two angles (degrees, screen coords). */
function arcPath(cx: number, cy: number, r: number, a0deg: number, a1deg: number): string {
  const a0 = (a0deg * Math.PI) / 180
  const a1 = (a1deg * Math.PI) / 180
  const x0 = cx + r * Math.cos(a0)
  const y0 = cy + r * Math.sin(a0)
  const x1 = cx + r * Math.cos(a1)
  const y1 = cy + r * Math.sin(a1)
  const large = Math.abs(a1deg - a0deg) > 180 ? 1 : 0
  const sweep = a1deg > a0deg ? 1 : 0
  return `M ${x0.toFixed(1)} ${y0.toFixed(1)} A ${r} ${r} 0 ${large} ${sweep} ${x1.toFixed(1)} ${y1.toFixed(1)}`
}

export default function Ch3_4Hero() {
  const { t } = useTranslation('ui')

  // gauge geometry (panel 2)
  const gx = P2_CX
  const gy = PANEL_TOP + PANEL_H - 18 // pivot near the bottom of the panel
  const gr = 56
  const needleDeg = 305 // needle pointing up-and-right
  const nx = gx + (gr - 8) * Math.cos((needleDeg * Math.PI) / 180)
  const ny = gy + (gr - 8) * Math.sin((needleDeg * Math.PI) / 180)

  return (
    <svg
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      width={VB_W}
      height={VB_H}
      fill="none"
      aria-label={t('ch3_4.heroAriaLabel')}
      role="img"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* ── the one signal: a sine across the top ─────────────────────── */}
      <path d={sinePath(WAVE_X0, WAVE_X1, WAVE_Y, WAVE_AMP, 9)} stroke="hsl(var(--primary))" strokeWidth={2.4} strokeLinecap="round" />
      <text x={WAVE_X0} y={14} fontSize="13" textAnchor="start" fill="hsl(var(--primary))" fontFamily={SANS}>
        {t('ch3_4.hero.signal')}
      </text>

      {/* ── feed lines tapping the wave into each instrument ──────────── */}
      {[P1_CX, P2_CX, P3_CX].map((cx, i) => (
        <line key={i} x1={cx} y1={WAVE_Y + 6} x2={cx} y2={PANEL_TOP} stroke="currentColor" strokeWidth={1.4} opacity={0.5} strokeDasharray="3 3" />
      ))}

      {/* ── Panel 1 — oscilloscope ────────────────────────────────────── */}
      <rect x={P1_X} y={PANEL_TOP} width={PANEL_W} height={PANEL_H} rx={6} stroke="currentColor" strokeWidth={2} fill="hsl(var(--muted))" />
      {/* screen grid */}
      {[0.33, 0.66].map((f, i) => (
        <line key={`v${i}`} x1={P1_X + PANEL_W * f} y1={PANEL_TOP + 8} x2={P1_X + PANEL_W * f} y2={PANEL_TOP + PANEL_H - 8} stroke="currentColor" strokeWidth={1} opacity={0.2} />
      ))}
      <line x1={P1_X + 10} y1={PANEL_TOP + PANEL_H / 2} x2={P1_X + PANEL_W - 10} y2={PANEL_TOP + PANEL_H / 2} stroke="currentColor" strokeWidth={1} opacity={0.2} />
      {/* trace */}
      <path d={sinePath(P1_X + 12, P1_X + PANEL_W - 12, PANEL_TOP + PANEL_H / 2, 24, 1.8)} stroke="hsl(var(--primary))" strokeWidth={2.4} strokeLinecap="round" />

      {/* ── Panel 2 — analog moving-coil gauge ────────────────────────── */}
      <rect x={P2_X} y={PANEL_TOP} width={PANEL_W} height={PANEL_H} rx={6} stroke="currentColor" strokeWidth={2} fill="hsl(var(--muted))" />
      <path d={arcPath(gx, gy, gr, 200, 340)} stroke="currentColor" strokeWidth={2} opacity={0.8} />
      {/* ticks */}
      {[200, 235, 270, 305, 340].map((deg, i) => {
        const a = (deg * Math.PI) / 180
        const r0 = gr - 7
        return (
          <line
            key={i}
            x1={gx + r0 * Math.cos(a)}
            y1={gy + r0 * Math.sin(a)}
            x2={gx + gr * Math.cos(a)}
            y2={gy + gr * Math.sin(a)}
            stroke="currentColor"
            strokeWidth={1.6}
            opacity={0.7}
          />
        )
      })}
      {/* needle + pivot */}
      <line x1={gx} y1={gy} x2={nx} y2={ny} stroke="hsl(var(--primary))" strokeWidth={2.6} strokeLinecap="round" />
      <circle cx={gx} cy={gy} r={4} fill="currentColor" />

      {/* ── Panel 3 — digital multimeter ──────────────────────────────── */}
      <rect x={P3_X} y={PANEL_TOP} width={PANEL_W} height={PANEL_H} rx={6} stroke="currentColor" strokeWidth={2} fill="hsl(var(--muted))" />
      {/* display */}
      <rect x={P3_X + 14} y={PANEL_TOP + 16} width={PANEL_W - 28} height={40} rx={4} stroke="hsl(var(--border))" strokeWidth={1.5} fill="hsl(var(--background))" />
      <text x={P3_CX} y={PANEL_TOP + 44} fontSize="24" fontWeight={700} textAnchor="middle" fill="hsl(var(--primary))" fontFamily={MONO}>
        {t('ch3_4.hero.reading')}
      </text>
      {/* dial + two probe jacks */}
      <circle cx={P3_CX} cy={PANEL_TOP + 76} r={8} stroke="currentColor" strokeWidth={1.6} fill="none" />
      <line x1={P3_CX} y1={PANEL_TOP + 76} x2={P3_CX + 5} y2={PANEL_TOP + 71} stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" />
      <circle cx={P3_X + 26} cy={PANEL_TOP + 78} r={3} fill="currentColor" opacity={0.7} />
      <circle cx={P3_X + PANEL_W - 26} cy={PANEL_TOP + 78} r={3} fill="currentColor" opacity={0.7} />

      {/* ── captions ──────────────────────────────────────────────────── */}
      <text x={P1_CX} y={CAP_Y} fontSize="13" textAnchor="middle" fill="currentColor" opacity={0.75} fontFamily={SANS}>
        {t('ch3_4.hero.scope')}
      </text>
      <text x={P2_CX} y={CAP_Y} fontSize="13" textAnchor="middle" fill="currentColor" opacity={0.75} fontFamily={SANS}>
        {t('ch3_4.hero.analog')}
      </text>
      <text x={P3_CX} y={CAP_Y} fontSize="13" textAnchor="middle" fill="currentColor" opacity={0.75} fontFamily={SANS}>
        {t('ch3_4.hero.digital')}
      </text>
    </svg>
  )
}
