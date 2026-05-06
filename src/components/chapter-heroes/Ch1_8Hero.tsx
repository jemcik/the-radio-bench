/**
 * Chapter 1.8 hero — pen-and-ink Bode plot.
 *
 * Layout: a horizontal frame on log-frequency / dB axes. The trace is
 * the textbook first-order low-pass: a flat passband on the left, a
 * smooth corner centred on f_c, and a straight −20 dB/decade skirt
 * sloping down to the right. A vertical hairline at the corner marks
 * f_c; a horizontal dashed line marks the −3 dB level. Two zone
 * labels — passband on the left, stopband on the right — anchor the
 * reader's vocabulary.
 *
 * Theme-adaptive: every stroke uses `currentColor`; the −3 dB and f_c
 * hairlines drop opacity so they read as guides rather than primary
 * data.
 *
 * hardcoded-fontsize-file-ok: hero illustration — hand-tuned label
 * sizes in user-space units. Converting to em would change visual
 * proportions; no sibling diagrams in this file to be inconsistent with.
 */
import { useTranslation } from 'react-i18next'

const VB_W = 540
const VB_H = 220

// Frame insets — leave room for axis labels on the left and bottom and
// the «−3 dB» annotation on the right.
const PAD_L = 70
const PAD_R = 30
const PAD_T = 26
const PAD_B = 46

const PLOT_L = PAD_L
const PLOT_R = VB_W - PAD_R
const PLOT_T = PAD_T
const PLOT_B = VB_H - PAD_B
const PLOT_W = PLOT_R - PLOT_L
const PLOT_H = PLOT_B - PLOT_T

// First-order low-pass magnitude (in dB) at frequency ratio u = f / f_c:
//   |H| = 1 / sqrt(1 + u^2)   →   dB(u) = -10 · log10(1 + u^2)
// We map u on a log scale across the plot: the corner f_c sits at the
// horizontal centre, with 1.5 decades on each side. Y maps the dB
// range [-30, +10] onto the plot height (top = +10 dB, bottom = -30 dB).
// The 10 dB headroom above 0 is what gives the «passband» zone label
// vertical room without colliding with the curve at low frequencies
// (the curve hugs 0 dB throughout the passband; without headroom the
// label sits right on the curve).
const Y_MAX_DB = 10
const Y_MIN_DB = -30
const X_HALF_DECADES = 1.5

function uToX(u: number): number {
  // u ∈ (0, ∞); plot the log of u from -X_HALF_DECADES to +X_HALF_DECADES
  const logU = Math.log10(Math.max(u, 1e-6))
  const t = (logU + X_HALF_DECADES) / (2 * X_HALF_DECADES)
  return PLOT_L + t * PLOT_W
}

function dbToY(db: number): number {
  const t = (Y_MAX_DB - db) / (Y_MAX_DB - Y_MIN_DB)
  return PLOT_T + t * PLOT_H
}

function buildLpfPath(): string {
  const parts: string[] = []
  const STEPS = 240
  for (let i = 0; i <= STEPS; i++) {
    const t = i / STEPS
    const logU = -X_HALF_DECADES + t * (2 * X_HALF_DECADES)
    const u = Math.pow(10, logU)
    const db = -10 * Math.log10(1 + u * u)
    const x = uToX(u)
    const y = dbToY(db)
    parts.push(`${i === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`)
  }
  return parts.join(' ')
}

export default function Ch1_8Hero() {
  const { t } = useTranslation('ui')

  const xFc = uToX(1)
  const yMinus3 = dbToY(-3)
  const y0db = dbToY(0)

  return (
    <svg
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      width={VB_W}
      height={VB_H}
      fill="none"
      aria-label={t('ch1_8.heroAriaLabel')}
      role="img"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Plot frame — open box on left + bottom only (axes), no top/right edges */}
      <g stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
        <path d={`M ${PLOT_L},${PLOT_T} L ${PLOT_L},${PLOT_B} L ${PLOT_R},${PLOT_B}`} />
      </g>

      {/* Y-axis tick labels (0 dB, −3 dB) */}
      <g fontFamily="inherit" fill="currentColor" fontSize="11" opacity="0.85">
        <text x={PLOT_L - 6} y={y0db + 4} textAnchor="end">{t('ch1_8.hero0dbLabel')}</text>
        <text x={PLOT_L - 6} y={yMinus3 + 4} textAnchor="end" opacity="0.7">{t('ch1_8.heroMinus3dbLabel')}</text>
      </g>

      {/* −3 dB horizontal guide line — dashed across the plot */}
      <path
        d={`M ${PLOT_L},${yMinus3} L ${PLOT_R},${yMinus3}`}
        stroke="currentColor"
        strokeWidth="1"
        strokeDasharray="4 4"
        opacity="0.35"
      />

      {/* f_c vertical hairline */}
      <path
        d={`M ${xFc},${PLOT_T} L ${xFc},${PLOT_B}`}
        stroke="currentColor"
        strokeWidth="1"
        strokeDasharray="3 3"
        opacity="0.45"
      />

      {/* Frequency-axis label at the corner */}
      <text
        x={xFc}
        y={PLOT_B + 18}
        fontSize="13"
        textAnchor="middle"
        fill="currentColor"
        fontStyle="italic"
        fontWeight="700"
      >
        {/* f_c with proper subscript rendering */}
        <tspan>f</tspan>
        <tspan baselineShift="sub" fontSize="9">c</tspan>
      </text>

      {/* Frequency arrow / axis label */}
      <text
        x={(PLOT_L + PLOT_R) / 2}
        y={PLOT_B + 36}
        fontSize="11"
        textAnchor="middle"
        fill="currentColor"
        opacity="0.7"
      >
        {t('ch1_8.heroXAxisLabel')}
      </text>

      {/* The trace itself — first-order LPF magnitude */}
      <path
        d={buildLpfPath()}
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {/* Zone labels — both placed in the HEADROOM strip above the
          0 dB line (Y_MAX_DB=10 gives ~37 px of clear sky between the
          plot frame top and the curve at low frequencies). Trying to
          put the stopband label below the curve in the bottom-right
          wedge fails because the curve descends through the entire
          width of the label text — the text inevitably crosses it.
          Putting both labels in the top headroom is unambiguous: the
          f_c hairline visually separates passband (left of f_c) from
          stopband (right of f_c) without needing the labels to sit
          inside their respective regions. */}
      <g fontFamily="inherit" fill="currentColor" fontSize="12" fontStyle="italic" opacity="0.75">
        <text x={PLOT_L + PLOT_W * 0.22} y={PLOT_T + 14} textAnchor="middle">
          {t('ch1_8.heroPassbandLabel')}
        </text>
        <text x={PLOT_L + PLOT_W * 0.78} y={PLOT_T + 14} textAnchor="middle">
          {t('ch1_8.heroStopbandLabel')}
        </text>
      </g>

      {/* Y-axis label rotated on the left */}
      <text
        x={PLOT_L - 46}
        y={(PLOT_T + PLOT_B) / 2}
        fontSize="12"
        textAnchor="middle"
        fill="currentColor"
        opacity="0.85"
        transform={`rotate(-90 ${PLOT_L - 46} ${(PLOT_T + PLOT_B) / 2})`}
      >
        {t('ch1_8.heroYAxisLabel')}
      </text>
    </svg>
  )
}
