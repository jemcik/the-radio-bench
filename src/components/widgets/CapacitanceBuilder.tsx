import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Widget from '@/components/ui/widget'
import { ResultBox } from '@/components/ui/result-box'
import { useLocaleFormatter, useUnitFormatter } from '@/lib/hooks/useLocaleFormatter'

/**
 * Chapter 1.5 — Capacitance Builder.
 *
 * Interactive form of the parallel-plate capacitance equation:
 *
 *     C = ε₀ · εᵣ · A / d
 *
 * where ε₀ = 8.854 × 10⁻¹² F/m.
 *
 * The reader picks:
 *   • Plate area A  (cm²; logged slider spans 0.01 cm² … 10 000 cm²)
 *   • Spacing d     (mm;  logged slider spans 0.01 mm … 10 mm)
 *   • Dielectric    (Air/vacuum, polyester film, C0G ceramic, X7R ceramic, AlO electrolytic)
 *
 * The result autoscales between pF, nF, and µF — anchoring the reader's
 * intuition for why a farad is "enormous" and why real caps come in
 * picofarads to microfarads.
 *
 * Sliders use a logarithmic mapping because the interesting range spans
 * 6 orders of magnitude on A and 4 on d; a linear slider would waste
 * almost all its travel at the small end.
 */

// ε₀ in F/m
const EPS_0 = 8.854e-12

/* Dielectric options. Values are approximate but representative — see
 * the ARRL Handbook Ch 2 Table 2.2 and AoE §1.4.1. */
interface Dielectric {
  id: string
  labelKey: string
  epsR: number
}
const DIELECTRICS: Dielectric[] = [
  { id: 'air',        labelKey: 'ch1_5.widget.builder.dielectricAir',             epsR: 1 },
  { id: 'polyester',  labelKey: 'ch1_5.widget.builder.dielectricPolyester',       epsR: 3 },
  { id: 'c0g',        labelKey: 'ch1_5.widget.builder.dielectricCeramicC0G',      epsR: 45 },
  { id: 'x7r',        labelKey: 'ch1_5.widget.builder.dielectricCeramicX7R',      epsR: 3000 },
  { id: 'alo',        labelKey: 'ch1_5.widget.builder.dielectricAluminiumOxide',  epsR: 8 },
]

/* Slider ranges (logarithmic). Values are picked so the mid of the
 * slider lands on something plausible, AND so the hint's claim —
 * "you can reach 1 µF with dinner-table-sized plates in air" — is
 * actually reachable on the widget:
 *   A : 0.01 cm² …  20000 cm²   (mid ≈ 14 cm²; max ≈ 2 m² = dining table)
 *   d : 0.01 mm  …     10 mm    (mid ≈ 0.3 mm)
 *
 * At A_max = 20000 cm² and D_min = 0.01 mm with air (ε_r = 1), the
 * parallel-plate formula gives C ≈ 1.77 µF — so 1 µF sits mid-slider,
 * reachable by the reader. With A = 10000 cm² (the old max), peak was
 * only 0.88 µF, and the "try 1 µF" hint was factually unreachable.
 */
const A_MIN_CM2 = 0.01
const A_MAX_CM2 = 20000
const D_MIN_MM  = 0.01
const D_MAX_MM  = 10

/** Map a 0 … 1 slider position to a log-spaced value in [lo, hi]. */
function logMap(t: number, lo: number, hi: number): number {
  const l = Math.log(lo)
  const h = Math.log(hi)
  return Math.exp(l + (h - l) * t)
}

/** Autoscale farads to pF/nF/µF/mF/F. */
function formatFarads(C: number, fmt: (n: number, d: number) => string): { value: string; unitKey: string } {
  if (!isFinite(C) || C <= 0) return { value: fmt(0, 2), unitKey: 'pf' }
  const abs = Math.abs(C)
  if (abs < 1e-9)   return { value: fmt(C * 1e12, 2), unitKey: 'pf' }   // pF
  if (abs < 1e-6)   return { value: fmt(C * 1e9,  2), unitKey: 'nf' }   // nF
  if (abs < 1e-3)   return { value: fmt(C * 1e6,  2), unitKey: 'uf' }   // µF
  if (abs < 1)      return { value: fmt(C * 1e3,  2), unitKey: 'mf' }   // mF
  return { value: fmt(C, 2), unitKey: 'f' }                              // F
}

export default function CapacitanceBuilder() {
  const { t } = useTranslation('ui')
  const { fmt, num } = useLocaleFormatter()
  const tUnit = useUnitFormatter()

  // Slider positions (0 … 1, log-mapped to physical value).
  // Defaults: 10 cm² plates at 0.3 mm spacing with air → ≈ 30 pF.
  const [tA, setTA] = useState(0.5)
  const [tD, setTD] = useState(0.35)
  const [dielId, setDielId] = useState(DIELECTRICS[0].id)

  const aCm2 = logMap(tA, A_MIN_CM2, A_MAX_CM2)
  const dMm  = logMap(tD, D_MIN_MM,  D_MAX_MM)
  const diel = DIELECTRICS.find(d => d.id === dielId) ?? DIELECTRICS[0]

  const result = useMemo(() => {
    // Convert to SI: cm² → m², mm → m.
    const A_m2 = aCm2 * 1e-4
    const d_m  = dMm  * 1e-3
    const C = EPS_0 * diel.epsR * A_m2 / d_m
    return formatFarads(C, fmt)
  }, [aCm2, dMm, diel.epsR, fmt])

  return (
    <Widget
      title={t('ch1_5.widget.builder.title')}
      description={t('ch1_5.widget.builder.description')}
    >
      {/* ── Sliders ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-3">
        <label className="flex flex-wrap items-center gap-3 text-sm">
          <span className="text-foreground font-medium shrink-0 w-40">
            {t('ch1_5.widget.builder.areaLabel')}
          </span>
          <input
            type="range"
            min={0} max={1} step={0.001}
            value={tA}
            onChange={e => setTA(Number(e.target.value))}
            className="flex-1 min-w-[140px]"
            aria-label={t('ch1_5.widget.builder.areaLabel')}
          />
          <span className="font-mono text-foreground w-32 text-right">
            {num(Number(aCm2.toPrecision(3)))} cm²
          </span>
        </label>

        <label className="flex flex-wrap items-center gap-3 text-sm">
          <span className="text-foreground font-medium shrink-0 w-40">
            {t('ch1_5.widget.builder.spacingLabel')}
          </span>
          <input
            type="range"
            min={0} max={1} step={0.001}
            value={tD}
            onChange={e => setTD(Number(e.target.value))}
            className="flex-1 min-w-[140px]"
            aria-label={t('ch1_5.widget.builder.spacingLabel')}
          />
          <span className="font-mono text-foreground w-32 text-right">
            {num(Number(dMm.toPrecision(3)))} mm
          </span>
        </label>

        <label className="flex flex-wrap items-center gap-3 text-sm">
          <span className="text-foreground font-medium shrink-0 w-40">
            {t('ch1_5.widget.builder.dielectricLabel')}
          </span>
          <select
            value={dielId}
            onChange={e => setDielId(e.target.value)}
            className="flex-1 min-w-[160px] border border-border rounded px-2 py-1 bg-background text-foreground"
            aria-label={t('ch1_5.widget.builder.dielectricLabel')}
          >
            {DIELECTRICS.map(d => (
              <option key={d.id} value={d.id}>
                {t(d.labelKey)}
              </option>
            ))}
          </select>
          <span className="font-mono text-muted-foreground w-32 text-right">
            {t('ch1_5.widget.builder.epsilonrLabel')} = {num(diel.epsR)}
          </span>
        </label>
      </div>

      {/* ── Result ────────────────────────────────────────────────── */}
      <ResultBox tone="info" label={t('ch1_5.widget.builder.resultLabel')}>
        <p className="text-2xl font-mono font-semibold text-foreground">
          {result.value} {tUnit(result.unitKey)}
        </p>
        <p className="text-xs font-mono text-muted-foreground mt-1">
          C = ε₀ · εᵣ · A / d
        </p>
      </ResultBox>

      <p className="text-[13px] text-muted-foreground">
        {t('ch1_5.widget.builder.hint')}
      </p>
    </Widget>
  )
}
