import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Widget from '@/components/ui/widget'
import { ResultBox } from '@/components/ui/result-box'
import { useLocaleFormatter, useUnitFormatter } from '@/lib/hooks/useLocaleFormatter'
import { formatDecimal } from '@/lib/format'

/**
 * Chapter 1.2 — Ohm's Law + Power Calculator
 *
 * The reader picks any two of the four quantities {V, I, R, P} as
 * "known inputs" and enters their values; the calculator derives the
 * remaining two from Ohm's law and P = V · I, with the specific
 * formula used shown under each result. That formula display is the
 * whole point of the widget: this is how the three power forms
 * (P = V·I, P = I²·R, P = V²/R) and the three Ohm's-law rearrangements
 * (V = I·R, I = V/R, R = V/I) fit together into a single lookup table
 * the reader can explore.
 *
 * The alternative UX — "all four fields always editable, most-recently-
 * edited two are the inputs" — feels magical at first but confuses: a
 * textbook reader expects the model to be explicit. Two dropdowns +
 * two numeric inputs makes the model legible.
 *
 * No SVG, no scaling — plain HTML form controls inside the Widget
 * shell. All numbers localise to the display locale (`1,5` in UK,
 * `1.5` in EN) via the shared format helpers.
 */

/* ── Types ────────────────────────────────────────────────────────── */

type Quantity = 'V' | 'I' | 'R' | 'P'

const ALL: Quantity[] = ['V', 'I', 'R', 'P']

/** SI-multiplier per unit key. */
const UNITS: Record<Quantity, Record<string, number>> = {
  V: { mv: 1e-3, v: 1, kv: 1e3 },
  I: { ua: 1e-6, ma: 1e-3, a: 1 },
  R: { ohm: 1, kohm: 1e3, mohm: 1e6 },
  P: { mw: 1e-3, w: 1, kw: 1e3 },
}
const UNIT_ORDER: Record<Quantity, string[]> = {
  V: ['mv', 'v', 'kv'],
  I: ['ua', 'ma', 'a'],
  R: ['ohm', 'kohm', 'mohm'],
  P: ['mw', 'w', 'kw'],
}

/* ── Derivation ───────────────────────────────────────────────────── */

type Values = Record<Quantity, number | null>

function deriveAll(
  given: { q: Quantity; siValue: number },
  other: { q: Quantity; siValue: number },
): Values {
  const out: Values = { V: null, I: null, R: null, P: null }
  out[given.q] = given.siValue
  out[other.q] = other.siValue
  const { V, I, R, P } = out

  const safeDiv = (a: number, b: number) => (b > 0 ? a / b : null)
  const safeSqrt = (x: number | null) => (x != null && x >= 0 ? Math.sqrt(x) : null)

  // Each branch fills in the two missing quantities from the two given.
  if (V != null && I != null) {
    out.R = safeDiv(V, I)
    out.P = V * I
  } else if (V != null && R != null) {
    out.I = safeDiv(V, R)
    out.P = R > 0 ? (V * V) / R : null
  } else if (V != null && P != null) {
    out.I = safeDiv(P, V)
    out.R = P > 0 ? (V * V) / P : null
  } else if (I != null && R != null) {
    out.V = I * R
    out.P = I * I * R
  } else if (I != null && P != null) {
    out.V = safeDiv(P, I)
    out.R = I > 0 ? P / (I * I) : null
  } else if (R != null && P != null) {
    out.I = safeSqrt(safeDiv(P, R))
    out.V = safeSqrt(P * R >= 0 ? P * R : null)
  }
  return out
}

/**
 * Given which two quantities are the inputs, return the formula
 * string used to compute `result`. Empty string if `result` IS one
 * of the inputs (caller should have short-circuited).
 */
function formulaFor(result: Quantity, inputs: [Quantity, Quantity]): string {
  const key = [...inputs].sort().join('')
  const table: Record<string, Partial<Record<Quantity, string>>> = {
    IV: { R: 'V / I', P: 'V · I' },
    RV: { I: 'V / R', P: 'V² / R' },
    PV: { I: 'P / V', R: 'V² / P' },
    IR: { V: 'I · R', P: 'I² · R' },
    IP: { V: 'P / I', R: 'P / I²' },
    PR: { I: '√(P / R)', V: '√(P · R)' },
  }
  return table[key]?.[result] ?? ''
}

/* ── Unit auto-scaling for result display ─────────────────────────── */

function pickDisplayUnit(q: Quantity, siValue: number): string {
  const abs = Math.abs(siValue)
  if (q === 'V') return abs < 1 ? 'mv' : abs >= 1000 ? 'kv' : 'v'
  if (q === 'I') return abs < 1e-3 ? 'ua' : abs < 1 ? 'ma' : 'a'
  if (q === 'R') return abs < 1000 ? 'ohm' : abs < 1e6 ? 'kohm' : 'mohm'
  /* P */ return abs < 1 ? 'mw' : abs >= 1000 ? 'kw' : 'w'
}

/** Significant-figures format for result readouts. */
function formatResult(siValue: number, unitKey: string, unitsMap: Record<string, number>, locale: string): string {
  const mult = unitsMap[unitKey] ?? 1
  const displayVal = siValue / mult
  // Choose digit count so readouts are compact but precise enough:
  // |x| < 10 → 3 sig figs ≈ 2 decimals; < 100 → 1 decimal; else → 0.
  const abs = Math.abs(displayVal)
  const digits = abs < 10 ? 2 : abs < 100 ? 1 : 0
  return formatDecimal(displayVal, digits, locale)
}

/* ── Component ────────────────────────────────────────────────────── */

export default function OhmsCalculator() {
  const { t } = useTranslation('ui')
  const { locale } = useLocaleFormatter()
  const tUnit = useUnitFormatter()

  // Default: V = 12 V, R = 470 Ω — hobbyist-typical; produces
  // I = 25.5 mA, P = 306 mW on first render so the reader sees a
  // live calculation immediately.
  const [qA, setQA] = useState<Quantity>('V')
  const [qB, setQB] = useState<Quantity>('R')
  const [dispA, setDispA] = useState<string>('12')
  const [dispB, setDispB] = useState<string>('470')
  const [unitA, setUnitA] = useState<string>('v')
  const [unitB, setUnitB] = useState<string>('ohm')

  // Ensure A and B differ. When user changes one to match the other,
  // auto-flip the sibling to the first non-matching quantity.
  const handleSetQA = (nq: Quantity) => {
    setQA(nq)
    if (nq === qB) {
      const replace = ALL.find(x => x !== nq) as Quantity
      setQB(replace)
      setUnitB(UNIT_ORDER[replace][1] ?? UNIT_ORDER[replace][0])
      setDispB('0')
    }
    // Reset A's unit to its default and leave its displayed number alone.
    setUnitA(UNIT_ORDER[nq][1] ?? UNIT_ORDER[nq][0])
  }
  const handleSetQB = (nq: Quantity) => {
    setQB(nq)
    if (nq === qA) {
      const replace = ALL.find(x => x !== nq) as Quantity
      setQA(replace)
      setUnitA(UNIT_ORDER[replace][1] ?? UNIT_ORDER[replace][0])
      setDispA('0')
    }
    setUnitB(UNIT_ORDER[nq][1] ?? UNIT_ORDER[nq][0])
  }

  // Parse "12.5" / "12,5" both — locale-tolerant.
  const parseDisplay = (s: string): number => {
    const normalised = s.replace(',', '.').trim()
    const v = Number.parseFloat(normalised)
    return Number.isFinite(v) ? v : 0
  }

  const siA = parseDisplay(dispA) * (UNITS[qA][unitA] ?? 1)
  const siB = parseDisplay(dispB) * (UNITS[qB][unitB] ?? 1)

  const results = useMemo(
    () => deriveAll({ q: qA, siValue: siA }, { q: qB, siValue: siB }),
    [qA, qB, siA, siB],
  )

  const resultQuantities = ALL.filter(q => q !== qA && q !== qB) as [Quantity, Quantity]

  return (
    <Widget
      title={t('ch1_2.widget.ohmCalc.title')}
      description={t('ch1_2.widget.ohmCalc.description')}
    >
      {/* ── Inputs ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-3">
        <InputRow
          label={t('ch1_2.widget.ohmCalc.knownLabel')}
          quantity={qA}
          setQuantity={handleSetQA}
          excludeQuantity={qB}
          displayValue={dispA}
          setDisplayValue={setDispA}
          unit={unitA}
          setUnit={setUnitA}
          tUnit={tUnit}
          t={t}
          idSuffix="a"
        />
        <InputRow
          label={t('ch1_2.widget.ohmCalc.alsoLabel')}
          quantity={qB}
          setQuantity={handleSetQB}
          excludeQuantity={qA}
          displayValue={dispB}
          setDisplayValue={setDispB}
          unit={unitB}
          setUnit={setUnitB}
          tUnit={tUnit}
          t={t}
          idSuffix="b"
        />
      </div>

      {/* ── Results ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {resultQuantities.map(rq => {
          const si = results[rq]
          const unitKey = si == null ? UNIT_ORDER[rq][1] : pickDisplayUnit(rq, si)
          const valueStr = si == null ? '—' : formatResult(si, unitKey, UNITS[rq], locale)
          const formula = formulaFor(rq, [qA, qB])
          return (
            <ResultBox key={rq} tone="success">
              <div className="flex flex-col gap-1">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-sm text-foreground">
                    {t(`ch1_2.widget.ohmCalc.quantity.${rq}`)}{' '}
                    <span className="text-muted-foreground">
                      (<span className="font-serif italic">{rq}</span>)
                    </span>
                  </span>
                  <span className="text-xl font-mono font-semibold text-foreground">
                    {valueStr} {tUnit(unitKey)}
                  </span>
                </div>
                {formula && (
                  <p className="text-xs font-mono text-muted-foreground self-end">
                    = {formula}
                  </p>
                )}
              </div>
            </ResultBox>
          )
        })}
      </div>

      {/* ── Circuit flow visualisation ───────────────────────────── *
           A minimal schematic — battery + resistor in a horizontal
           strip — whose animated flow (dot speed ∝ I) and resistor
           glow (intensity ∝ P) turn the four abstract numbers into
           something the reader can *feel* changing as they drag the
           inputs. The visual deliberately doesn't close the loop
           back to the battery — that would crowd the widget for no
           extra teaching. The reader already knows circuits loop;
           the point here is "more V or less R → faster flow and
           hotter resistor". */}
      <CircuitFlow
        siI={results.I}
        siP={results.P}
        voltageLabel={formatQuantityLabel('V', results.V, tUnit, locale)}
        resistanceLabel={formatQuantityLabel('R', results.R, tUnit, locale)}
      />

      <p className="text-xs text-muted-foreground">
        {t('ch1_2.widget.ohmCalc.hint')}
      </p>
    </Widget>
  )
}

/* ── Circuit flow visualisation ──────────────────────────────────── */

/**
 * Compact "value + unit" label used only inside CircuitFlow. Falls
 * back to an em-dash when the value isn't known yet. Uses the same
 * auto-scaling as the result boxes above so e.g. 0.0255 A renders as
 * "25.5 mA", not "0.03 A".
 */
function formatQuantityLabel(
  q: Quantity,
  si: number | null,
  tUnit: (k: string) => string,
  locale: string,
): string {
  if (si == null || !Number.isFinite(si)) return '—'
  const unitKey = pickDisplayUnit(q, si)
  const value = formatResult(si, unitKey, UNITS[q], locale)
  return `${value} ${tUnit(unitKey)}`
}

/** Map current (A) to dot-drift speed (px/s) — same √-law as
 *  CurrentExplorer in ch1.1 for visual consistency across the book. */
function currentToDriftPxPerSec(amps: number | null): number {
  if (amps == null || !Number.isFinite(amps) || amps <= 0) return 0
  return Math.min(650, 140 * Math.sqrt(amps))
}

/** Map power (W) to 0..1 heat intensity on a square-root curve so
 *  small powers still register visually (1 mW ≈ 0.04, 1 W = 0.20,
 *  25 W ≈ 1.0). Clamped to [0, 1]. */
function powerToHeatIntensity(watts: number | null): number {
  if (watts == null || !Number.isFinite(watts) || watts <= 0) return 0
  return Math.min(1, Math.sqrt(watts) / 5)
}

interface CircuitFlowProps {
  siI: number | null
  siP: number | null
  voltageLabel: string
  resistanceLabel: string
}

function CircuitFlow({ siI, siP, voltageLabel, resistanceLabel }: CircuitFlowProps) {
  // Layout constants — viewBox 420 × 84 so everything renders at
  // designed size on screen (no CSS scaling).
  const VB_W = 420
  const VB_H = 84
  const WIRE_Y = 48

  // Horizontal segments carrying electrons. The resistor sits between
  // resistorStartX and resistorEndX — electrons pass through it, they
  // don't stop there.
  const wireStartX = 60
  const wireEndX = 380
  const resistorStartX = 190
  const resistorEndX = 250

  const ELECTRON_COUNT = 14
  const circleRefs = useRef<(SVGCircleElement | null)[]>([])
  const phasesRef = useRef<number[]>(
    Array.from({ length: ELECTRON_COUNT }, (_, i) => i / ELECTRON_COUNT),
  )

  const driftPxPerSec = currentToDriftPxPerSec(siI)
  const heatIntensity = powerToHeatIntensity(siP)

  const speedRef = useRef(driftPxPerSec)
  useEffect(() => {
    speedRef.current = driftPxPerSec
  }, [driftPxPerSec])

  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      // Paint the initial tiled positions once, then stop.
      const span = wireEndX - wireStartX
      for (let i = 0; i < ELECTRON_COUNT; i++) {
        const el = circleRefs.current[i]
        if (el) el.setAttribute('cx', String(wireStartX + phasesRef.current[i] * span))
      }
      return
    }
    let raf = 0
    let lastT = performance.now()
    const span = wireEndX - wireStartX
    const frame = (now: number) => {
      const dt = (now - lastT) / 1000
      lastT = now
      const speed = speedRef.current
      const phases = phasesRef.current
      if (speed > 0.1) {
        const dp = (speed * dt) / span
        for (let i = 0; i < phases.length; i++) {
          let p = phases[i] + dp
          if (p >= 1) p -= 1
          phases[i] = p
        }
      }
      for (let i = 0; i < phases.length; i++) {
        const el = circleRefs.current[i]
        if (el) el.setAttribute('cx', String(wireStartX + phases[i] * span))
      }
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(raf)
  }, [])

  // Resistor zigzag path — 4 triangles inside the resistor band.
  const resistorPath = (() => {
    const segs = 8
    const amp = 8
    const xs = Array.from(
      { length: segs + 1 },
      (_, i) => resistorStartX + (i / segs) * (resistorEndX - resistorStartX),
    )
    let d = `M ${resistorStartX - 10} ${WIRE_Y}`
    d += ` L ${xs[0]} ${WIRE_Y}`
    for (let i = 0; i < segs; i++) {
      const y = WIRE_Y + (i % 2 === 0 ? -amp : amp)
      d += ` L ${(xs[i] + xs[i + 1]) / 2} ${y}`
    }
    d += ` L ${xs[segs]} ${WIRE_Y}`
    d += ` L ${resistorEndX + 10} ${WIRE_Y}`
    return d
  })()

  return (
    <div className="rounded-lg border border-border bg-card/60 p-3 text-[hsl(var(--sketch-stroke))]">
      <svg
        width="100%"
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        role="img"
        aria-label={`Circuit: battery at ${voltageLabel}, resistor at ${resistanceLabel}, current flowing at ${driftPxPerSec.toFixed(0)} pixels per second`}
        style={{ display: 'block' }}
      >
        <defs>
          <clipPath id="ohms-wire-clip">
            <rect x={wireStartX} y={WIRE_Y - 10} width={wireEndX - wireStartX} height={20} />
          </clipPath>
          <radialGradient id="ohms-heat-glow">
            <stop offset="0%" stopColor="hsl(var(--callout-danger))" stopOpacity={0.9} />
            <stop offset="100%" stopColor="hsl(var(--callout-danger))" stopOpacity={0} />
          </radialGradient>
        </defs>

        {/* Wire — left segment up to the resistor, right segment after */}
        <line
          x1={wireStartX} y1={WIRE_Y}
          x2={resistorStartX - 10} y2={WIRE_Y}
          stroke="currentColor" strokeWidth={1.4} strokeLinecap="round"
        />
        <line
          x1={resistorEndX + 10} y1={WIRE_Y}
          x2={wireEndX} y2={WIRE_Y}
          stroke="currentColor" strokeWidth={1.4} strokeLinecap="round"
        />

        {/* Battery symbol — two vertical bars, long (+) and short (−).
            Long bar at x=40 (the + terminal, conventional current exits
            from here), short bar at x=52. */}
        <g stroke="currentColor" strokeLinecap="round">
          <line x1={40} y1={WIRE_Y - 14} x2={40} y2={WIRE_Y + 14} strokeWidth={2} />
          <line x1={52} y1={WIRE_Y - 7}  x2={52} y2={WIRE_Y + 7}  strokeWidth={2} />
          {/* Stub wires connecting battery to the main wire */}
          <line x1={40} y1={WIRE_Y} x2={30} y2={WIRE_Y} strokeWidth={1.4} />
          <line x1={52} y1={WIRE_Y} x2={60} y2={WIRE_Y} strokeWidth={1.4} />
        </g>
        <text
          x={46} y={WIRE_Y - 22}
          textAnchor="middle" fontSize="11"
          fill="hsl(var(--muted-foreground))"
        >
          {voltageLabel}
        </text>

        {/* Resistor heat glow — a soft radial behind the zigzag whose
            opacity scales with P. invisible when P=0, saturates at ~25 W. */}
        {heatIntensity > 0.02 && (
          <circle
            cx={(resistorStartX + resistorEndX) / 2}
            cy={WIRE_Y}
            r={36}
            fill="url(#ohms-heat-glow)"
            opacity={heatIntensity}
          />
        )}

        {/* Resistor zigzag */}
        <path
          d={resistorPath}
          fill="none"
          stroke="currentColor"
          strokeWidth={1.6}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <text
          x={(resistorStartX + resistorEndX) / 2}
          y={WIRE_Y + 28}
          textAnchor="middle" fontSize="11"
          fill="hsl(var(--muted-foreground))"
        >
          {resistanceLabel}
        </text>

        {/* Electrons — drifting along the entire wire, passing through
            the resistor. When I is zero or undefined the electrons stop
            moving but remain visible at their last positions, which
            reads as "no current" rather than "no circuit". */}
        <g clipPath="url(#ohms-wire-clip)">
          {Array.from({ length: ELECTRON_COUNT }).map((_, i) => {
            const p0 = i / ELECTRON_COUNT
            return (
              <circle
                key={i}
                ref={el => { circleRefs.current[i] = el }}
                cx={wireStartX + p0 * (wireEndX - wireStartX)}
                cy={WIRE_Y}
                r={2.6}
                fill="hsl(var(--callout-note))"
                opacity={0.85}
              />
            )
          })}
        </g>

        {/* Small right-arrow hint near the right end — "current flows
            this way". Muted so it reads as a convention note, not a
            primary element. */}
        <g stroke="currentColor" fill="none" strokeWidth={0.9} opacity={0.55}>
          <line x1={wireEndX - 10} y1={WIRE_Y - 6} x2={wireEndX} y2={WIRE_Y} strokeLinecap="round" />
          <line x1={wireEndX - 10} y1={WIRE_Y + 6} x2={wireEndX} y2={WIRE_Y} strokeLinecap="round" />
        </g>
      </svg>
    </div>
  )
}

/* ── Input row sub-component ──────────────────────────────────────── */

interface InputRowProps {
  label: string
  quantity: Quantity
  setQuantity: (q: Quantity) => void
  excludeQuantity: Quantity
  displayValue: string
  setDisplayValue: (s: string) => void
  unit: string
  setUnit: (u: string) => void
  tUnit: (k: string) => string
  t: (k: string) => string
  idSuffix: string
}

function InputRow({
  label, quantity, setQuantity, excludeQuantity,
  displayValue, setDisplayValue, unit, setUnit,
  tUnit, t, idSuffix,
}: InputRowProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      <label
        htmlFor={`olc-val-${idSuffix}`}
        className="text-foreground font-medium shrink-0"
      >
        {label}
      </label>
      <select
        value={quantity}
        onChange={e => setQuantity(e.target.value as Quantity)}
        className="border border-border rounded px-2 py-1 bg-background text-foreground min-w-[10rem]"
        aria-label={label}
      >
        {ALL.filter(q => q !== excludeQuantity).map(q => (
          <option key={q} value={q}>
            {t(`ch1_2.widget.ohmCalc.quantity.${q}`)} ({q})
          </option>
        ))}
      </select>
      <span className="text-muted-foreground">=</span>
      <input
        id={`olc-val-${idSuffix}`}
        type="number"
        inputMode="decimal"
        step="any"
        min="0"
        value={displayValue}
        onChange={e => setDisplayValue(e.target.value)}
        className="border border-border rounded px-2 py-1 bg-background text-foreground w-24 font-mono"
      />
      <select
        value={unit}
        onChange={e => setUnit(e.target.value)}
        className="border border-border rounded px-2 py-1 bg-background text-foreground"
        aria-label={t('ch1_2.widget.ohmCalc.unitPickerLabel')}
      >
        {UNIT_ORDER[quantity].map(u => (
          <option key={u} value={u}>{tUnit(u)}</option>
        ))}
      </select>
    </div>
  )
}
