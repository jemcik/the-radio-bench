/**
 * Chapter 4.3 §4 — the ICNIRP reference level for the electric field, across
 * the spectrum an amateur actually uses, and why it sags in the middle.
 *
 * The shape IS the lesson. The limit is not a flat "so many volts per metre";
 * it dips to a plateau across roughly 30–400 MHz and is looser either side.
 * That trough is whole-body resonance: an adult standing up is about half a
 * wavelength long in the VHF range, so the body absorbs incident energy far
 * more efficiently there, and a given field produces a higher whole-body SAR.
 * The limit has to come down to compensate. Two-metre and six-metre operators
 * live at the bottom of that trough.
 *
 * Curves are ICNIRP 2020, general public, from Table 5 (whole-body exposure,
 * E-field, unperturbed rms):
 *     0.1 – 30 MHz   E = 300 / f^0.7      (f in MHz)
 *     30  – 400 MHz  E = 27.7             (flat)
 *     400 – 2000 MHz E = 1.375 · √f
 *
 * ── Two things deliberately NOT drawn ──────────────────────────────────
 * 1. The OCCUPATIONAL curve. A hobbyist is not occupationally exposed under
 *    ICNIRP — the general-public limits apply to the operator too. Drawing the
 *    looser tier next to it would invite exactly the mistake the FCC's rules
 *    encourage and ICNIRP's do not.
 * 2. Any suggestion that the sub-30 MHz curve can be read as a power density.
 *    ICNIRP 2020 defines NO power-density reference level below 30 MHz, and
 *    requires E and H to be checked separately there. This plot is E only, so
 *    it stays honest across the whole span.
 *
 * Static (a limit curve, not a process) → no animation, per the skill's rule.
 * Plotted curve → useId clipPath, boundary truncation, +3 px stroke headroom.
 */
import { useId, useMemo } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { svgTokens } from './svgTokens'
import { useLocaleFormatter, useUnitFormatter } from '@/lib/hooks/useLocaleFormatter'

const VB_W = 640
const VB_H = 340

// ── Plot geometry ───────────────────────────────────────────────────
// PAD_L budget: y-axis ticks are «1000»/«100»/«10» at ~13 px → ≤29 px,
// plus the rotated axis title (~16 px of height). 56 clears both.
// PAD_R: the last x tick is «3000», centred → needs ~15 px of overhang.
const PAD_L = 56
const PAD_R = 24
const PAD_T = 44 // room for the band ribbon + its captions
const PAD_B = 52 // x ticks + axis title

const PLOT_X0 = PAD_L
const PLOT_X1 = VB_W - PAD_R
const PLOT_Y0 = PAD_T
const PLOT_Y1 = VB_H - PAD_B
const PLOT_W = PLOT_X1 - PLOT_X0
const PLOT_H = PLOT_Y1 - PLOT_Y0

// x: log frequency, 1 MHz → 3000 MHz. y: log E-field, 10 → 300 V/m.
const F_MIN = 1
const F_MAX = 3000
const E_MIN = 10
const E_MAX = 300

const LOG_F0 = Math.log10(F_MIN)
const LOG_F1 = Math.log10(F_MAX)
const LOG_E0 = Math.log10(E_MIN)
const LOG_E1 = Math.log10(E_MAX)

const fToX = (mhz: number) => PLOT_X0 + ((Math.log10(mhz) - LOG_F0) / (LOG_F1 - LOG_F0)) * PLOT_W
const eToY = (vm: number) => PLOT_Y1 - ((Math.log10(vm) - LOG_E0) / (LOG_E1 - LOG_E0)) * PLOT_H

/** ICNIRP 2020 Table 5 — general public, E-field reference level (V/m). */
function icnirpE(mhz: number): number {
  if (mhz < 30) return 300 / Math.pow(mhz, 0.7)
  if (mhz <= 400) return 27.7
  return 1.375 * Math.sqrt(mhz)
}

/** Shared baseline for the band captions — above the axis, below the curve. */
const BAND_LABEL_Y = PLOT_Y1 - 10

const F_TICKS = [1, 10, 100, 1000, 3000]
const E_TICKS = [10, 30, 100, 300]

/** Amateur bands worth marking — the ones that bracket the trough. */
const BANDS: { f: number; key: string }[] = [
  { f: 3.6, key: 'mpeBand80' },
  { f: 14.2, key: 'mpeBand20' },
  { f: 70.2, key: 'mpeBand4' },
  { f: 145, key: 'mpeBand2' },
  { f: 435, key: 'mpeBand70' },
]

/** Sample the limit curve densely enough that the 30 MHz corner is sharp. */
function buildPath(): string {
  const pts: string[] = []
  const STEPS = 400
  for (let i = 0; i <= STEPS; i++) {
    const logF = LOG_F0 + ((LOG_F1 - LOG_F0) * i) / STEPS
    const f = Math.pow(10, logF)
    const e = icnirpE(f)
    // Truncate at the plot's top boundary rather than clamping — a clamp
    // would draw a false plateau along the ceiling at low frequency.
    if (e > E_MAX) continue
    pts.push(`${pts.length === 0 ? 'M' : 'L'} ${fToX(f).toFixed(2)} ${eToY(e).toFixed(2)}`)
  }
  return pts.join(' ')
}

export default function MpeFrequencyCurve() {
  const { t } = useTranslation('ui')
  const { fmt, num } = useLocaleFormatter()
  const tUnit = useUnitFormatter()
  const rawId = useId()
  const clipId = `mpe-clip-${rawId.replace(/:/g, '')}`

  const path = useMemo(() => buildPath(), [])

  return (
    <figure className="my-6 not-prose">
      <svg
        width={VB_W}
        height={VB_H}
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        role="img"
        aria-label={t('ch4_3.mpeAria')}
        style={{ display: 'block', maxWidth: '100%', height: 'auto', margin: '0 auto', fontSize: '1rem' }}
      >
        <defs>
          {/* +3 px on every side so the curve's stroke half-width isn't
              shaved at the corners — per the plotted-curve rule. */}
          <clipPath id={clipId}>
            <rect x={PLOT_X0 - 3} y={PLOT_Y0 - 3} width={PLOT_W + 6} height={PLOT_H + 6} />
          </clipPath>
        </defs>

        {/* ── The resonance trough, called out as a band ─────────── */}
        <rect
          x={fToX(30)}
          y={PLOT_Y0}
          width={fToX(400) - fToX(30)}
          height={PLOT_H}
          fill={svgTokens.danger}
          opacity={0.09}
        />
        <text
          x={(fToX(30) + fToX(400)) / 2}
          y={PLOT_Y0 - 24}
          fontSize="0.812em" textAnchor="middle" fontFamily="inherit" fontWeight="700"
          fill={svgTokens.danger}
        >
          {t('ch4_3.mpeTroughLabel')}
        </text>
        <text
          x={(fToX(30) + fToX(400)) / 2}
          y={PLOT_Y0 - 9}
          fontSize="0.812em" textAnchor="middle" fontFamily="inherit"
          fill={svgTokens.mutedFg}
        >
          {t('ch4_3.mpeTroughSub')}
        </text>

        {/* ── Gridlines at the y ticks ───────────────────────────── */}
        {E_TICKS.map(e => (
          <line
            key={`g${e}`}
            x1={PLOT_X0} y1={eToY(e)} x2={PLOT_X1} y2={eToY(e)}
            stroke={svgTokens.border} strokeWidth={0.6} opacity={0.5}
          />
        ))}

        {/* ── Band markers ───────────────────────────────────────── */}
        {/* Captions live on a shared baseline near the x-axis, NOT floating
            beside their dot. Two reasons, both learned from the label-bounds
            gate: at low frequency the curve is steep, so a caption offset a
            few px from its own marker still gets crossed by the curve a few px
            either side; and the 4 m / 2 m markers sit only ~51 px apart on a
            log axis, which a staggered layout could not resolve either. The
            dashed leader stops short of the baseline so it never strikes its
            own caption. Closest pair on this baseline is 4 m / 2 m at ~51 px
            between centres, and neither caption is wider than ~30 px. */}
        {BANDS.map(({ f, key }) => (
          <g key={key}>
            <line
              x1={fToX(f)} y1={eToY(icnirpE(f))} x2={fToX(f)} y2={BAND_LABEL_Y - 10}
              stroke={svgTokens.mutedFg} strokeWidth={0.8} strokeDasharray="3 3" opacity={0.7}
            />
            <circle cx={fToX(f)} cy={eToY(icnirpE(f))} r={3} fill={svgTokens.primary} />
            <text
              x={fToX(f)}
              y={BAND_LABEL_Y}
              fontSize="0.812em" textAnchor="middle" fontFamily="inherit" fontWeight="600"
              fill={svgTokens.fg}
            >
              {t(`ch4_3.${key}`)}
            </text>
          </g>
        ))}

        {/* ── The limit curve ────────────────────────────────────── */}
        <path
          d={path}
          fill="none"
          stroke={svgTokens.primary}
          strokeWidth={2.2}
          clipPath={`url(#${clipId})`}
        />

        {/* ── Axes ───────────────────────────────────────────────── */}
        <line x1={PLOT_X0} y1={PLOT_Y0} x2={PLOT_X0} y2={PLOT_Y1} stroke={svgTokens.border} strokeWidth={1.2} />
        <line x1={PLOT_X0} y1={PLOT_Y1} x2={PLOT_X1} y2={PLOT_Y1} stroke={svgTokens.border} strokeWidth={1.2} />

        {E_TICKS.map(e => (
          <text
            key={`e${e}`}
            x={PLOT_X0 - 8} y={eToY(e)}
            fontSize="0.812em" textAnchor="end" dominantBaseline="middle"
            fontFamily="inherit" fill={svgTokens.mutedFg}
          >
            {num(e)}
          </text>
        ))}
        {F_TICKS.map(f => (
          <text
            key={`f${f}`}
            x={fToX(f)} y={PLOT_Y1 + 16}
            fontSize="0.812em" textAnchor="middle"
            fontFamily="inherit" fill={svgTokens.mutedFg}
          >
            {num(f)}
          </text>
        ))}

        {/* Axis titles */}
        <text
          x={PLOT_X0 - 8} y={PLOT_Y0 - 20}
          fontSize="0.812em" textAnchor="end"
          fontFamily="inherit" fontWeight="600" fill={svgTokens.fg}
        >
          {tUnit('vm')}
        </text>
        <text
          x={(PLOT_X0 + PLOT_X1) / 2} y={VB_H - 12}
          fontSize="0.812em" textAnchor="middle"
          fontFamily="inherit" fontWeight="600" fill={svgTokens.fg}
        >
          {t('ch4_3.mpeAxisF', { unit: tUnit('mhz') })}
        </text>

        {/* The plateau's own value, annotated on the flat. */}
        <text
          x={fToX(200)} y={eToY(27.7) - 16}
          fontSize="0.812em" textAnchor="middle"
          fontFamily="inherit" fill={svgTokens.primary} fontWeight="600"
        >
          {fmt(27.7, 1)} {tUnit('vm')}
        </text>
      </svg>

      <figcaption className="text-[13px] text-muted-foreground mt-2 px-1">
        <Trans i18nKey="ch4_3.mpeCaption" ns="ui" components={{ strong: <strong /> }} />
      </figcaption>
    </figure>
  )
}
