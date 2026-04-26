import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Widget from '@/components/ui/widget'
import { ResultBox } from '@/components/ui/result-box'
import { useLocaleFormatter, useUnitFormatter } from '@/lib/hooks/useLocaleFormatter'

/**
 * Chapter 1.6 — Inductance Builder.
 *
 * Interactive form of the long-solenoid inductance equation:
 *
 *     L = µ₀ · µᵣ · n² · A / l
 *
 * where µ₀ = 4π × 10⁻⁷ H/m. Holds for a single-layer coil whose length
 * is significantly larger than its diameter (Wheeler's correction is
 * ignored at this pedagogical scale).
 *
 * The reader picks:
 *   • Number of turns n      (linear slider, 1 … 500)
 *   • Cross-sectional area A (cm²; logged slider spans 0.01 … 100 cm²)
 *   • Coil length l          (mm;  logged slider spans 5 … 200 mm)
 *   • Core material          (Air, iron-powder, ferrite low/high, laminated iron)
 *
 * Result autoscales between nH, µH, mH, H — anchoring the reader's
 * intuition that real inductors are mostly µH … mH and a 1 H choke
 * is fist-sized and iron-cored.
 */

// µ₀ in H/m
const MU_0 = 4 * Math.PI * 1e-7

interface Core {
  id: string
  labelKey: string
  muR: number
}
const CORES: Core[] = [
  { id: 'air',         labelKey: 'ch1_6.widget.builder.coreAir',          muR: 1 },
  { id: 'ironPowder',  labelKey: 'ch1_6.widget.builder.coreIronPowder',   muR: 50 },
  { id: 'ferriteLow',  labelKey: 'ch1_6.widget.builder.coreFerriteLow',   muR: 500 },
  { id: 'ferriteHigh', labelKey: 'ch1_6.widget.builder.coreFerriteHigh',  muR: 5000 },
  { id: 'laminated',   labelKey: 'ch1_6.widget.builder.coreLaminated',    muR: 1500 },
]

/* Slider ranges. n is linear because integer-turns are intuitive; A
 * and l span several orders of magnitude so log scale is easier to
 * read. Defaults land on a hobby-realistic 50-turn, 0.5 cm², 25 mm
 * air-core coil ≈ 6 µH (ham-radio VHF tank-coil territory). */
const N_MIN  = 1
const N_MAX  = 500
const A_MIN_CM2 = 0.01
const A_MAX_CM2 = 100
const L_MIN_MM  = 5
const L_MAX_MM  = 200

function logMap(t: number, lo: number, hi: number): number {
  const l = Math.log(lo)
  const h = Math.log(hi)
  return Math.exp(l + (h - l) * t)
}

/** Autoscale henries to nH/µH/mH/H. */
function formatHenries(L: number, fmt: (n: number, d: number) => string): { value: string; unitKey: string } {
  if (!isFinite(L) || L <= 0) return { value: fmt(0, 2), unitKey: 'nh' }
  const abs = Math.abs(L)
  if (abs < 1e-6)   return { value: fmt(L * 1e9,  2), unitKey: 'nh' }
  if (abs < 1e-3)   return { value: fmt(L * 1e6,  2), unitKey: 'uh' }
  if (abs < 1)      return { value: fmt(L * 1e3,  2), unitKey: 'mh' }
  return { value: fmt(L, 2), unitKey: 'henry' }
}

export default function InductanceBuilder() {
  const { t } = useTranslation('ui')
  const { fmt, num } = useLocaleFormatter()
  const tUnit = useUnitFormatter()

  // Defaults: 50 turns, 0.5 cm², 25 mm, air → ≈ 6 µH (VHF tank-coil scale).
  const [n, setN] = useState(50)
  const [tA, setTA] = useState(0.42)
  const [tL, setTL] = useState(0.43)
  const [coreId, setCoreId] = useState(CORES[0].id)

  const aCm2 = logMap(tA, A_MIN_CM2, A_MAX_CM2)
  const lMm  = logMap(tL, L_MIN_MM,  L_MAX_MM)
  const core = CORES.find(c => c.id === coreId) ?? CORES[0]

  const result = useMemo(() => {
    // Convert to SI: cm² → m², mm → m.
    const A_m2 = aCm2 * 1e-4
    const l_m  = lMm  * 1e-3
    const L = (MU_0 * core.muR * n * n * A_m2) / l_m
    return formatHenries(L, fmt)
  }, [n, aCm2, lMm, core.muR, fmt])

  return (
    <Widget
      title={t('ch1_6.widget.builder.title')}
      description={t('ch1_6.widget.builder.description')}
    >
      <div className="grid grid-cols-1 gap-3">
        <label className="flex flex-wrap items-center gap-3 text-sm">
          <span className="text-foreground font-medium shrink-0 w-40">
            {t('ch1_6.widget.builder.turnsLabel')}
          </span>
          <input
            type="range"
            min={N_MIN} max={N_MAX} step={1}
            value={n}
            onChange={e => setN(Number(e.target.value))}
            className="flex-1 min-w-[140px]"
            aria-label={t('ch1_6.widget.builder.turnsLabel')}
          />
          <span className="font-mono text-foreground w-32 text-right">
            {num(n)}
          </span>
        </label>

        <label className="flex flex-wrap items-center gap-3 text-sm">
          <span className="text-foreground font-medium shrink-0 w-40">
            {t('ch1_6.widget.builder.areaLabel')}
          </span>
          <input
            type="range"
            min={0} max={1} step={0.001}
            value={tA}
            onChange={e => setTA(Number(e.target.value))}
            className="flex-1 min-w-[140px]"
            aria-label={t('ch1_6.widget.builder.areaLabel')}
          />
          <span className="font-mono text-foreground w-32 text-right">
            {num(Number(aCm2.toPrecision(3)))} cm²
          </span>
        </label>

        <label className="flex flex-wrap items-center gap-3 text-sm">
          <span className="text-foreground font-medium shrink-0 w-40">
            {t('ch1_6.widget.builder.lengthLabel')}
          </span>
          <input
            type="range"
            min={0} max={1} step={0.001}
            value={tL}
            onChange={e => setTL(Number(e.target.value))}
            className="flex-1 min-w-[140px]"
            aria-label={t('ch1_6.widget.builder.lengthLabel')}
          />
          <span className="font-mono text-foreground w-32 text-right">
            {num(Number(lMm.toPrecision(3)))} mm
          </span>
        </label>

        <label className="flex flex-wrap items-center gap-3 text-sm">
          <span className="text-foreground font-medium shrink-0 w-40">
            {t('ch1_6.widget.builder.coreLabel')}
          </span>
          <select
            value={coreId}
            onChange={e => setCoreId(e.target.value)}
            className="flex-1 min-w-[160px] border border-border rounded px-2 py-1 bg-background text-foreground"
            aria-label={t('ch1_6.widget.builder.coreLabel')}
          >
            {CORES.map(c => (
              <option key={c.id} value={c.id}>
                {t(c.labelKey)}
              </option>
            ))}
          </select>
          <span className="font-mono text-muted-foreground w-32 text-right">
            {t('ch1_6.widget.builder.muRLabel')} = {num(core.muR)}
          </span>
        </label>
      </div>

      <ResultBox tone="info" label={t('ch1_6.widget.builder.resultLabel')}>
        <p className="text-2xl font-mono font-semibold text-foreground">
          {result.value} {tUnit(result.unitKey)}
        </p>
        <p className="text-xs font-mono text-muted-foreground mt-1">
          L = µ₀ · µᵣ · n² · A / l
        </p>
      </ResultBox>

      <p className="text-[13px] text-muted-foreground">
        {t('ch1_6.widget.builder.hint')}
      </p>
    </Widget>
  )
}
