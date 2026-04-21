import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Widget from '@/components/ui/widget'
import { Slider } from '@/components/ui/slider'
import { ResultBox } from '@/components/ui/result-box'
import { useLocaleFormatter, useUnitFormatter } from '@/lib/hooks/useLocaleFormatter'
import { formatDecimal, formatNumber } from '@/lib/format'

/**
 * Chapter 1.1 — Current Explorer
 *
 * The reader's first hands-on encounter with the three quantities that
 * structure every circuit: voltage, resistance, and current. Two sliders
 * drive voltage (0–12 V) and resistance (1 Ω–10 kΩ, log-scaled). The
 * widget computes I = V/R live and shows it two ways:
 *
 *   1. A numeric readout with automatic prefix selection (µA / mA / A)
 *   2. A small animated wire with electrons drifting at a speed
 *      proportional to the current — so the abstract number has a
 *      concrete visual consequence.
 *
 * This widget intentionally APPEARS BEFORE Ohm's Law is formally
 * derived (that happens in Ch 1.2). The formula I = V/R is stated as a
 * preview, not proved; the point is to build intuition by feel so when
 * the formula lands in the next chapter it feels inevitable rather
 * than arbitrary.
 *
 * Danger-zone feedback: at high voltage + low resistance the computed
 * current becomes impractically large. We render the readout in a
 * warning tone and show a "burn-out" note once I exceeds 1 A, which
 * corresponds to typical hobby-component limits. This hints at why
 * current-limiting resistors exist (preview of Ch 1.2/1.4 material).
 */

/* ── Slider ranges ───────────────────────────────────────────────── */

const V_MIN = 0
const V_MAX = 12
const V_STEP = 0.1
const V_DEFAULT = 3

// Resistance is log-scaled so 1 Ω and 10 kΩ are equally easy to reach.
// Slider stores a log10 value; we convert to actual ohms for display.
const R_LOG_MIN = 0    // 10^0 = 1 Ω
const R_LOG_MAX = 4    // 10^4 = 10 kΩ
const R_LOG_STEP = 0.01
const R_LOG_DEFAULT = 3 // 10^3 = 1 kΩ

/** Threshold (A) above which we show a burn-out warning. */
const DANGER_CURRENT_A = 1.0

/* ── Formatting helpers ──────────────────────────────────────────── */

/**
 * Pick a sensible SI prefix for a current value and format the number
 * with a comma/period decimal per the caller's locale.
 *
 * < 1 µA  → "0.5 µA"
 * < 1 mA  → "123 µA"
 * < 1 A   → "12.3 mA"
 * otherwise → "1.50 A"
 */
function formatCurrent(
  amps: number,
  tUnit: (k: string) => string,
  locale: string,
): string {
  if (!isFinite(amps) || amps < 0) return '—'

  const absA = Math.abs(amps)
  if (absA < 1e-6) return `< 1 ${tUnit('ua')}`
  if (absA < 1e-3) {
    // Show as µA with no more than 1 decimal place
    const uA = amps * 1e6
    return `${formatNumber(Math.round(uA * 10) / 10, locale)} ${tUnit('ua')}`
  }
  if (absA < 1) {
    // Show as mA with 1–2 decimal places depending on magnitude
    const mA = amps * 1e3
    const digits = mA < 10 ? 2 : 1
    return `${formatDecimal(mA, digits, locale)} ${tUnit('ma')}`
  }
  // A with 2 decimal places
  return `${formatDecimal(amps, 2, locale)} ${tUnit('a')}`
}

/**
 * Pick a compact human-readable form of a resistance value.
 *   < 1000 Ω → "220 Ω"
 *   < 1 MΩ  → "10 kΩ"
 *   otherwise → "1.5 MΩ"
 *
 * Unit symbols (Ω, kΩ, MΩ) are project-wide constants living in the
 * i18n `units` namespace so Ukrainian can render "Ом / кОм / МОм".
 */
function formatResistance(
  ohms: number,
  tUnit: (k: string) => string,
  locale: string,
): string {
  if (ohms < 1000) {
    return `${formatNumber(Math.round(ohms), locale)} ${tUnit('ohm')}`
  }
  if (ohms < 1e6) {
    const k = ohms / 1000
    const digits = k < 10 ? 2 : k < 100 ? 1 : 0
    return `${formatDecimal(k, digits, locale)} ${tUnit('kohm')}`
  }
  const m = ohms / 1e6
  return `${formatDecimal(m, 2, locale)} ${tUnit('mohm')}`
}

/* ── Component ───────────────────────────────────────────────────── */

export default function CurrentExplorer() {
  const { t } = useTranslation('ui')
  const { locale } = useLocaleFormatter()
  const tUnit = useUnitFormatter()

  const [voltage, setVoltage] = useState<number>(V_DEFAULT)
  const [rLog, setRLog] = useState<number>(R_LOG_DEFAULT)

  const resistance = Math.pow(10, rLog) // ohms

  // I = V / R (Ohm's Law preview)
  const currentA = useMemo(() => {
    if (resistance <= 0) return Infinity
    return voltage / resistance
  }, [voltage, resistance])

  const isDanger = currentA >= DANGER_CURRENT_A

  // Electron-drift animation speed (pixels/second). The slider ranges
  // cover about 4 orders of magnitude in current (≈ 1 mA at 12 V /
  // 10 kΩ, up to 12 A at 12 V / 1 Ω). We need a mapping that keeps
  // the speed difference between two settings VISIBLE across the
  // whole range — not just in a narrow sweet spot — so the reader
  // can feel Ohm's Law in their fingers.
  //
  // Square-root curve: speed = COEF · √I. The √ naturally compresses
  // a wide range into a usable speed band without a hard cap cutting
  // off the upper half. Over the full slider range:
  //
  //    √I min ≈ √0.0012 ≈ 0.035   (12 V / 10 kΩ = 1.2 mA)
  //    √I max ≈ √12     ≈ 3.46    (12 V / 1 Ω   = 12 A)
  //
  // With COEF = 170 that maps 0.035 → 6 px/s (slow crawl) and 3.46 →
  // 589 px/s (fast but still trackable). Every doubling of current
  // multiplies speed by √2 ≈ 1.41×, which is perceptually visible
  // at every point in the range — including R = 4 Ω, where 3 V vs
  // 12 V goes from 220 to 440 px/s (a clear 2× in visible motion).
  // A soft cap at 650 px/s catches the extreme corner without
  // eating into the useful range.
  const driftPxPerSec = useMemo(() => {
    if (!isFinite(currentA) || currentA <= 0) return 0
    const MAX = 650
    const raw = 170 * Math.sqrt(currentA)
    return Math.min(MAX, raw)
  }, [currentA])

  return (
    <Widget
      title={t('ch1_1.widget.title')}
      description={t('ch1_1.widget.description')}
    >
      {/* ── Sliders ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Voltage */}
        <div>
          <div className="flex items-baseline justify-between mb-2">
            <label htmlFor="ce-voltage" className="text-sm font-medium text-foreground">
              {t('ch1_1.widget.voltageLabel')}
            </label>
            <span className="text-sm font-mono text-muted-foreground">
              {formatDecimal(voltage, 1, locale)} {tUnit('v')}
            </span>
          </div>
          <Slider
            id="ce-voltage"
            min={V_MIN}
            max={V_MAX}
            step={V_STEP}
            value={[voltage]}
            onValueChange={([v]) => setVoltage(v ?? V_DEFAULT)}
            aria-label={t('ch1_1.widget.voltageLabel')}
          />
          <div className="flex justify-between mt-1 text-[11px] text-muted-foreground">
            <span>0 {tUnit('v')}</span>
            <span>12 {tUnit('v')}</span>
          </div>
        </div>

        {/* Resistance */}
        <div>
          <div className="flex items-baseline justify-between mb-2">
            <label htmlFor="ce-resistance" className="text-sm font-medium text-foreground">
              {t('ch1_1.widget.resistanceLabel')}
            </label>
            <span className="text-sm font-mono text-muted-foreground">
              {formatResistance(resistance, tUnit, locale)}
            </span>
          </div>
          <Slider
            id="ce-resistance"
            min={R_LOG_MIN}
            max={R_LOG_MAX}
            step={R_LOG_STEP}
            value={[rLog]}
            onValueChange={([v]) => setRLog(v ?? R_LOG_DEFAULT)}
            aria-label={t('ch1_1.widget.resistanceLabel')}
          />
          <div className="flex justify-between mt-1 text-[11px] text-muted-foreground">
            <span>1 {tUnit('ohm')}</span>
            <span>10 {tUnit('kohm')}</span>
          </div>
        </div>
      </div>

      {/* ── Result ───────────────────────────────────────────────── *
          The ResultBox has two rows:
            1. "Current (I):" label on the left, headline current on the right
            2. Formula on the left, and (when the current exceeds the
               danger threshold) a short safety note filling the empty
               horizontal strip on the right of the formula.
          Tucking the note into that otherwise-empty space keeps the
          widget vertically compact — no reserved slot above the wire
          and no banner pushing the box down. */}
      <ResultBox tone={isDanger ? 'error' : 'success'}>
        <div className="flex flex-col gap-2">
          <div className="flex items-baseline justify-between gap-4">
            <span className="text-sm text-foreground">
              {t('ch1_1.widget.currentLabel')}
            </span>
            <span className={`text-2xl font-mono font-semibold ${isDanger ? 'text-callout-danger' : 'text-foreground'}`}>
              {formatCurrent(currentA, tUnit, locale)}
            </span>
          </div>
          <div className="flex items-baseline justify-between gap-6">
            <p className="text-xs font-mono text-muted-foreground shrink-0">
              I = V / R = {formatDecimal(voltage, 1, locale)} {tUnit('v')} /{' '}
              {formatResistance(resistance, tUnit, locale)}
            </p>
            {isDanger && (
              <p className="text-xs text-callout-danger text-right" role="status">
                {t('ch1_1.widget.dangerNote')}
              </p>
            )}
          </div>
        </div>
      </ResultBox>

      {/* ── Visualisation: wire with drifting electrons ─────────── */}
      <DriftVisualisation driftPxPerSec={driftPxPerSec} />

      <p className="text-[13px] text-muted-foreground">
        {t('ch1_1.widget.hint')}
      </p>
    </Widget>
  )
}

/* ── Wire visualisation ──────────────────────────────────────────── */

/**
 * Small decorative SVG: a horizontal wire with 18 electrons, each
 * entering from the left and exiting at the right, drifting at a
 * speed proportional to the current.
 *
 * Implementation note: the animation is driven by a single JS
 * requestAnimationFrame loop that writes directly to each circle's
 * `cx` DOM attribute — React never re-renders per frame. The reason
 * is that CSS `animation-duration` cannot be changed mid-flight
 * without teleporting the animated element: when the user slides the
 * voltage or resistance slider, the new duration reinterprets each
 * electron's negative animation-delay, snapping every electron
 * forward or backward. A JS loop with imperative DOM writes avoids
 * that entirely — each electron has a mutable phase p ∈ [0, 1), and
 * we advance every p by (speed * dt / WIRE_W) each frame. Slider
 * changes only affect speed; electrons in flight keep their position.
 */
function DriftVisualisation({ driftPxPerSec }: { driftPxPerSec: number }) {
  const WIRE_W = 400
  const WIRE_H = 60
  const PAD = 20
  const CLIP_ID = 'ch1_1-electron-wire-clip'
  const ELECTRON_COUNT = 18

  // Deterministic y-jitter so electrons don't line up in a single row.
  const jitterY = useMemo(
    () => [32, 38, 26, 34, 28, 36, 24, 32, 38, 26, 34, 28, 36, 24, 32, 38, 26, 34],
    [],
  )

  // One DOM ref per electron circle — the rAF loop writes cx directly.
  const circleRefs = useRef<(SVGCircleElement | null)[]>([])
  const phasesRef = useRef<number[]>(
    Array.from({ length: ELECTRON_COUNT }, (_, i) => i / ELECTRON_COUNT),
  )
  const speedRef = useRef(driftPxPerSec)
  useEffect(() => {
    speedRef.current = driftPxPerSec
  }, [driftPxPerSec])

  useEffect(() => {
    let raf = 0
    let lastT = performance.now()

    const frame = (now: number) => {
      const dt = (now - lastT) / 1000
      lastT = now
      const speed = speedRef.current
      const phases = phasesRef.current
      if (speed > 0.1) {
        const dp = (speed * dt) / WIRE_W
        for (let i = 0; i < phases.length; i++) {
          let p = phases[i] + dp
          if (p >= 1) p -= 1 // wrap: re-enter at the left
          phases[i] = p
        }
      }
      // Write every frame (even when stationary, harmless); this keeps
      // DOM in sync if the initial mount caught mid-frame.
      for (let i = 0; i < phases.length; i++) {
        const el = circleRefs.current[i]
        if (el) el.setAttribute('cx', String(PAD + phases[i] * WIRE_W))
      }
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <div className="rounded-lg border border-border bg-card/60 p-3 text-[hsl(var(--sketch-stroke))]">
      <svg
        width="100%" viewBox={`0 0 ${WIRE_W + PAD * 2} ${WIRE_H}`}
        role="img"
        aria-label={`Wire with electrons drifting at ${Math.round(driftPxPerSec)} pixels per second`}
        style={{ display: 'block' }}
      >
        {/* Clip rect — cheap protection against any sub-pixel slop at
            the wire edges. */}
        <defs>
          <clipPath id={CLIP_ID}>
            <rect x={PAD} y="16" width={WIRE_W} height="28" />
          </clipPath>
        </defs>

        {/* Wire body — two horizontal lines + cut-away caps */}
        <line x1={PAD} y1="18" x2={PAD + WIRE_W} y2="18"
              stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" />
        <line x1={PAD} y1="42" x2={PAD + WIRE_W} y2="42"
              stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" />
        <line x1={PAD} y1="18" x2={PAD} y2="42"
              stroke="currentColor" strokeWidth={1.1} strokeLinecap="round" />
        <line x1={PAD + WIRE_W} y1="18" x2={PAD + WIRE_W} y2="42"
              stroke="currentColor" strokeWidth={1.1} strokeLinecap="round" />

        {/* Direction arrow under the wire */}
        <g opacity={0.55} strokeWidth={0.9} stroke="currentColor" fill="none">
          <line x1={PAD + WIRE_W / 2 - 30} y1="54" x2={PAD + WIRE_W / 2 + 30} y2="54" strokeLinecap="round" />
          <polyline points={`${PAD + WIRE_W / 2 + 24},51 ${PAD + WIRE_W / 2 + 30},54 ${PAD + WIRE_W / 2 + 24},57`} />
        </g>

        {/* Electrons — initial cx set from the tiled phases at mount;
            the rAF loop updates cx imperatively every frame. */}
        <g clipPath={`url(#${CLIP_ID})`}>
          {Array.from({ length: ELECTRON_COUNT }).map((_, i) => {
            const p0 = i / ELECTRON_COUNT
            return (
              <circle
                key={i}
                ref={el => { circleRefs.current[i] = el }}
                cx={PAD + p0 * WIRE_W}
                cy={jitterY[i] ?? 32}
                r={3}
                fill="currentColor"
                opacity={0.85}
              />
            )
          })}
        </g>
      </svg>
    </div>
  )
}
