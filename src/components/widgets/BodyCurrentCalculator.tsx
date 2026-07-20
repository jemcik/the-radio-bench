/**
 * Chapter 4.3 §1 — how much current a given touch voltage actually drives
 * through you, and what that current does.
 *
 * The point this widget exists to make: **your body's resistance is not a
 * constant.** The beginner's instinct is to look up "dry skin ≈ 100 kΩ", divide
 * 230 V by it, get 2.3 mA, and conclude that mains is a tingle. That reasoning
 * has killed people. IEC 60479-1:2018 §4.3: "For higher touch voltages the skin
 * impedance decreases considerably and becomes negligible when the skin breaks
 * down." Drag the voltage slider and watch Z fall as V rises — which is why the
 * current climbs FASTER than proportionally. That is the whole lesson.
 *
 * Data: IEC 60479-1 Table 1 — TOTAL body impedance, hand-to-hand, DRY skin,
 * large contact area, 50 Hz. Only the four touch-voltage rows I could verify
 * against the standard are encoded; values between them are linearly
 * interpolated (and the widget never extrapolates past the table's ends).
 *
 * The three percentile columns are the "how resistant are you?" control. They
 * matter because the reassuring answer is the 95th percentile — and even that
 * person, dry, lands at ~108 mA on 230 V, well past the ~40 mA fibrillation
 * threshold. There is no setting of this widget at 230 V that is safe. That is
 * deliberate, and it is the honest reading of the standard.
 *
 * Wet/immersed contact is a separate (much lower) impedance table in the
 * standard which I did not verify, so it is not offered here — the dry case is
 * already damning, and inventing a wet curve would be worse than omitting it.
 */
import { useMemo, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import Widget from '@/components/ui/widget'
import { ResultBox } from '@/components/ui/result-box'
import { mathComponents } from '@/lib/trans-defaults'
import { useLocaleFormatter, useUnitFormatter } from '@/lib/hooks/useLocaleFormatter'

/* ── Data — IEC 60479-1 Table 1 ────────────────────────────────────── */

type Percentile = 'p5' | 'p50' | 'p95'

/** Touch voltage (V) → total body impedance (Ω), hand-to-hand, dry skin. */
const IMPEDANCE: { v: number; p5: number; p50: number; p95: number }[] = [
  { v: 25,   p5: 1750, p50: 3250, p95: 6100 },
  { v: 100,  p5: 1200, p50: 1875, p95: 3200 },
  { v: 220,  p5: 1000, p50: 1350, p95: 2125 },
  { v: 1000, p5: 700,  p50: 1050, p95: 1500 },
]

const V_MIN = IMPEDANCE[0].v // 25 — the table's floor; do not extrapolate below
const V_MAX = 400 // slider ceiling: covers 230 V mains and a valve HT rail
const DEFAULT_V = 230
const DEFAULT_P: Percentile = 'p50'

/** Effect thresholds in mA — the same IEC boundaries the scale diagram draws,
 *  so the widget and the figure can never disagree with each other. */
const LET_GO_LO = 5
const LET_GO_HI = 10
const CLAMP_HI = 40

/** Linear interpolation of body impedance between the table's voltage rows. */
function impedanceAt(v: number, p: Percentile): number {
  const rows = IMPEDANCE
  if (v <= rows[0].v) return rows[0][p]
  if (v >= rows[rows.length - 1].v) return rows[rows.length - 1][p]
  for (let i = 0; i < rows.length - 1; i++) {
    const a = rows[i]
    const b = rows[i + 1]
    if (v >= a.v && v <= b.v) {
      const u = (v - a.v) / (b.v - a.v)
      return a[p] + u * (b[p] - a[p])
    }
  }
  return rows[rows.length - 1][p]
}

/** Which effect band a current in mA falls into. Keys are shared with
 *  ShockCurrentScale so both surfaces name the zones identically. */
function zoneKey(ma: number): string {
  if (ma < 0.5) return 'shockZoneNone'
  if (ma < LET_GO_LO) return 'shockZoneFelt'
  if (ma < LET_GO_HI) return 'shockZoneLetGo'
  if (ma < CLAMP_HI) return 'shockZoneClamp'
  return 'shockZoneFib'
}

/** ResultBox tone tracking severity. Never `success` — on this widget's
 *  range there is no genuinely safe answer worth colouring green. */
function zoneTone(ma: number): 'info' | 'warn' | 'error' {
  if (ma < LET_GO_LO) return 'info'
  if (ma < CLAMP_HI) return 'warn'
  return 'error'
}

export default function BodyCurrentCalculator() {
  const { t } = useTranslation('ui')
  const { fmt, num } = useLocaleFormatter()
  const tUnit = useUnitFormatter()

  const [volts, setVolts] = useState(DEFAULT_V)
  const [pct, setPct] = useState<Percentile>(DEFAULT_P)

  const { z, ma } = useMemo(() => {
    const zz = impedanceAt(volts, pct)
    return { z: zz, ma: (volts / zz) * 1000 }
  }, [volts, pct])

  return (
    <Widget
      title={t('ch4_3.bodyCalc.title')}
      description={
        <Trans i18nKey="ch4_3.bodyCalc.description" ns="ui" components={{ ...mathComponents, strong: <strong /> }} />
      }
    >
      {/* ── Touch voltage ─────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <label htmlFor="bc-volts" className="text-foreground font-medium shrink-0 w-40">
          {t('ch4_3.bodyCalc.voltageLabel')}
        </label>
        <input
          id="bc-volts"
          type="range"
          min={V_MIN}
          max={V_MAX}
          step={5}
          value={volts}
          onChange={e => setVolts(Number(e.target.value))}
          className="flex-1 min-w-[160px] accent-primary"
        />
        <span className="font-mono text-foreground w-20 text-right shrink-0">
          {num(volts)} {tUnit('v')}
        </span>
      </div>

      {/* ── Which body? ───────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <label htmlFor="bc-pct" className="text-foreground font-medium shrink-0 w-40">
          {t('ch4_3.bodyCalc.percentileLabel')}
        </label>
        <select
          id="bc-pct"
          value={pct}
          onChange={e => setPct(e.target.value as Percentile)}
          className="flex-1 min-w-[160px] rounded-md border border-border bg-background px-2 py-1 text-foreground"
        >
          <option value="p5">{t('ch4_3.bodyCalc.p5')}</option>
          <option value="p50">{t('ch4_3.bodyCalc.p50')}</option>
          <option value="p95">{t('ch4_3.bodyCalc.p95')}</option>
        </select>
      </div>

      {/* ── Results ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <ResultBox tone="info" label={t('ch4_3.bodyCalc.zOut')}>
          <span className="font-mono text-lg">
            {fmt(z, 0)} {tUnit('ohm')}
          </span>
        </ResultBox>
        <ResultBox tone={zoneTone(ma)} label={t('ch4_3.bodyCalc.iOut')}>
          <span className="font-mono text-lg">
            {fmt(ma, 1)} {tUnit('ma')}
          </span>
        </ResultBox>
        <ResultBox tone={zoneTone(ma)} label={t('ch4_3.bodyCalc.effectOut')}>
          <span className="text-sm font-medium">{t(`ch4_3.${zoneKey(ma)}`)}</span>
        </ResultBox>
      </div>

      <p className="text-[13px] text-muted-foreground">
        <Trans i18nKey="ch4_3.bodyCalc.note" ns="ui" components={{ ...mathComponents, strong: <strong /> }} />
      </p>
    </Widget>
  )
}
