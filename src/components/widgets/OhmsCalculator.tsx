import { useMemo, useState } from 'react'
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

      <p className="text-xs text-muted-foreground">
        {t('ch1_2.widget.ohmCalc.hint')}
      </p>
    </Widget>
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
