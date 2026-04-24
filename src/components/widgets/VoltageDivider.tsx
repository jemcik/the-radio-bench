import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Widget from '@/components/ui/widget'
import { ResultBox } from '@/components/ui/result-box'
import { MathText } from '@/components/ui/math-text'
import { Slider } from '@/components/ui/slider'
import { useLocaleFormatter, useUnitFormatter } from '@/lib/hooks/useLocaleFormatter'

/**
 * Chapter 1.4 — Voltage divider explorer.
 *
 * Three log-scale sliders drive the divider equation
 *   V_out = V_in · R₂ / (R₁ + R₂)
 * plus, when the reader toggles a load on, the loaded form
 *   V_out' = V_in · (R₂ ∥ R_L) / (R₁ + (R₂ ∥ R_L))
 * so the "sag under load" rule-of-thumb can be felt with a thumb drag.
 *
 * Readouts grouped into two tiers:
 *   Primary (always visible): V_out (no-load), divide ratio, supply current.
 *   Secondary (load on):      V_out (loaded), output sag (%), power in R₁
 *                             and R₂ (so the reader can see when the ratings
 *                             are being stressed).
 *
 * Log-scale resistor sliders (100 Ω … 1 MΩ) let one slider move through
 * the whole E-series hobby range without feeling like a jump-scare.
 */

/* ── Slider scaling ──────────────────────────────────────────────── */

const R_LOG_MIN = Math.log10(100)      // 100 Ω
const R_LOG_MAX = Math.log10(1_000_000) // 1 MΩ
const R_STEPS = 1000

const RL_LOG_MIN = Math.log10(100)     // 100 Ω
const RL_LOG_MAX = Math.log10(10_000_000) // 10 MΩ

function sliderToR(sliderVal: number, logMin = R_LOG_MIN, logMax = R_LOG_MAX): number {
  const pct = sliderVal / R_STEPS
  return Math.pow(10, logMin + pct * (logMax - logMin))
}

function rToSlider(r: number, logMin = R_LOG_MIN, logMax = R_LOG_MAX): number {
  const clamped = Math.max(Math.pow(10, logMin), Math.min(Math.pow(10, logMax), r))
  return Math.round(((Math.log10(clamped) - logMin) / (logMax - logMin)) * R_STEPS)
}

/* ── Display helpers ─────────────────────────────────────────────── */

function pickResistorUnit(ohms: number): { value: number; unitKey: string } {
  if (ohms >= 1e6) return { value: ohms / 1e6, unitKey: 'mohm' }
  if (ohms >= 1e3) return { value: ohms / 1e3, unitKey: 'kohm' }
  return { value: ohms, unitKey: 'ohm' }
}

function pickCurrentUnit(amps: number): { value: number; unitKey: string } {
  const abs = Math.abs(amps)
  if (abs < 1e-3) return { value: amps * 1e6, unitKey: 'ua' }
  if (abs < 1)    return { value: amps * 1e3, unitKey: 'ma' }
  return { value: amps, unitKey: 'a' }
}

function pickPowerUnit(watts: number): { value: number; unitKey: string } {
  const abs = Math.abs(watts)
  if (abs < 1e-6)  return { value: watts * 1e9, unitKey: 'nw' }
  if (abs < 1e-3)  return { value: watts * 1e6, unitKey: 'uw' }
  if (abs < 1)     return { value: watts * 1e3, unitKey: 'mw' }
  return { value: watts, unitKey: 'w' }
}

function formatScaled(
  valueInSiUnits: number,
  num: (n: number) => string,
): string {
  if (!Number.isFinite(valueInSiUnits)) return '—'
  const abs = Math.abs(valueInSiUnits)
  const places = abs < 1 ? 3 : abs < 10 ? 2 : abs < 100 ? 1 : 0
  const factor = Math.pow(10, places)
  return num(Math.round(valueInSiUnits * factor) / factor)
}

/* ── Main component ──────────────────────────────────────────────── */

export default function VoltageDivider() {
  const { t } = useTranslation('ui')
  const { fmt, num } = useLocaleFormatter()
  const tUnit = useUnitFormatter()

  // Defaults: 12 V supply, 10 kΩ on top, 4.7 kΩ on bottom — picks up
  // the quiz values and gives a clean ~3.83 V output.
  const [vIn, setVIn] = useState(12)
  const [r1, setR1] = useState(10_000)
  const [r2, setR2] = useState(4_700)
  const [loadOn, setLoadOn] = useState(false)
  const [rL, setRL] = useState(100_000)

  // ── Derivations ──
  const ratio = r1 + r2 > 0 ? r2 / (r1 + r2) : 0
  const vOutNoLoad = vIn * ratio
  const iSupplyNoLoad = r1 + r2 > 0 ? vIn / (r1 + r2) : 0

  // Loaded: R_L in parallel with R_2.
  const r2ParRL = loadOn && r2 > 0 && rL > 0 ? (r2 * rL) / (r2 + rL) : r2
  const vOutLoaded = r1 + r2ParRL > 0 ? vIn * r2ParRL / (r1 + r2ParRL) : 0
  const iSupplyLoaded = r1 + r2ParRL > 0 ? vIn / (r1 + r2ParRL) : 0
  const sagPct = vOutNoLoad > 0 ? 100 * (vOutNoLoad - vOutLoaded) / vOutNoLoad : 0

  // Power per resistor. With a load, each resistor sees a different
  // voltage drop than in the no-load case, so the figures shift.
  const iActive = loadOn ? iSupplyLoaded : iSupplyNoLoad
  const powerR1 = iActive * iActive * r1
  const vR2 = loadOn ? vOutLoaded : vOutNoLoad
  const powerR2 = r2 > 0 ? (vR2 * vR2) / r2 : 0

  // ── Memoised labels for readouts (avoid re-calling tUnit in JSX
  //    where its {} render surface gets noisy). ──
  const formatted = useMemo(() => {
    const r1Disp = pickResistorUnit(r1)
    const r2Disp = pickResistorUnit(r2)
    const rLDisp = pickResistorUnit(rL)
    const vOutNoLoadStr = `${formatScaled(vOutNoLoad, num)} ${tUnit('v')}`
    const vOutLoadedStr = `${formatScaled(vOutLoaded, num)} ${tUnit('v')}`
    const iNoLoadDisp = pickCurrentUnit(iSupplyNoLoad)
    const iLoadedDisp = pickCurrentUnit(iSupplyLoaded)
    const iSupplyStr = loadOn
      ? `${formatScaled(iLoadedDisp.value, num)} ${tUnit(iLoadedDisp.unitKey)}`
      : `${formatScaled(iNoLoadDisp.value, num)} ${tUnit(iNoLoadDisp.unitKey)}`
    const pR1Disp = pickPowerUnit(powerR1)
    const pR2Disp = pickPowerUnit(powerR2)
    return {
      r1Str: `${formatScaled(r1Disp.value, num)} ${tUnit(r1Disp.unitKey)}`,
      r2Str: `${formatScaled(r2Disp.value, num)} ${tUnit(r2Disp.unitKey)}`,
      rLStr: `${formatScaled(rLDisp.value, num)} ${tUnit(rLDisp.unitKey)}`,
      vOutNoLoadStr,
      vOutLoadedStr,
      iSupplyStr,
      powerR1Str: `${formatScaled(pR1Disp.value, num)} ${tUnit(pR1Disp.unitKey)}`,
      powerR2Str: `${formatScaled(pR2Disp.value, num)} ${tUnit(pR2Disp.unitKey)}`,
    }
  }, [r1, r2, rL, loadOn, vOutNoLoad, vOutLoaded, iSupplyNoLoad, iSupplyLoaded, powerR1, powerR2, num, tUnit])

  return (
    <Widget
      title={t('ch1_4.widget.divider.title')}
      description={t('ch1_4.widget.divider.description')}
    >
      {/* ── V_in slider ──────────────────────────────────────────── */}
      <div className="space-y-2">
        <div className="flex justify-between items-baseline text-sm">
          <label htmlFor="vd-vin" className="text-foreground font-medium">
            {t('ch1_4.widget.divider.vinLabel')}
          </label>
          <span className="font-mono text-foreground">
            {fmt(vIn, 1)} {tUnit('v')}
          </span>
        </div>
        <Slider
          id="vd-vin"
          min={1}
          max={24}
          step={0.1}
          value={[vIn]}
          onValueChange={([v]) => setVIn(v)}
        />
      </div>

      {/* ── R1 slider (log scale) ────────────────────────────────── */}
      <div className="space-y-2">
        <div className="flex justify-between items-baseline text-sm">
          <label htmlFor="vd-r1" className="text-foreground font-medium">
            {t('ch1_4.widget.divider.r1Label')}
          </label>
          <span className="font-mono text-foreground">{formatted.r1Str}</span>
        </div>
        <Slider
          id="vd-r1"
          min={0}
          max={R_STEPS}
          step={1}
          value={[rToSlider(r1)]}
          onValueChange={([v]) => setR1(sliderToR(v))}
        />
      </div>

      {/* ── R2 slider (log scale) ────────────────────────────────── */}
      <div className="space-y-2">
        <div className="flex justify-between items-baseline text-sm">
          <label htmlFor="vd-r2" className="text-foreground font-medium">
            {t('ch1_4.widget.divider.r2Label')}
          </label>
          <span className="font-mono text-foreground">{formatted.r2Str}</span>
        </div>
        <Slider
          id="vd-r2"
          min={0}
          max={R_STEPS}
          step={1}
          value={[rToSlider(r2)]}
          onValueChange={([v]) => setR2(sliderToR(v))}
        />
      </div>

      {/* ── Primary readouts ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <ResultBox tone="success" label={<MathText>{t('ch1_4.widget.divider.voutNoLoadLabel')}</MathText>}>
          <p className="text-xl font-mono font-semibold text-foreground">
            {formatted.vOutNoLoadStr}
          </p>
        </ResultBox>
        <ResultBox tone="info" label={t('ch1_4.widget.divider.ratioLabel')}>
          <p className="text-xl font-mono font-semibold text-foreground">
            {fmt(ratio, 3)}
          </p>
        </ResultBox>
        <ResultBox tone="muted" label={t('ch1_4.widget.divider.currentLabel')}>
          <p className="text-xl font-mono font-semibold text-foreground">
            {formatted.iSupplyStr}
          </p>
        </ResultBox>
      </div>

      {/* ── Load toggle + R_L slider ─────────────────────────────── */}
      <div className="space-y-2 border-t border-border pt-4">
        <label className="flex items-center gap-2 text-sm text-foreground font-medium cursor-pointer">
          <input
            type="checkbox"
            checked={loadOn}
            onChange={e => setLoadOn(e.target.checked)}
            className="h-4 w-4 rounded border-border accent-primary"
          />
          {t('ch1_4.widget.divider.loadToggleLabel')}
        </label>
        {loadOn && (
          <>
            <div className="flex justify-between items-baseline text-sm">
              <label htmlFor="vd-rl" className="text-muted-foreground">
                {t('ch1_4.widget.divider.rloadLabel')}
              </label>
              <span className="font-mono text-foreground">{formatted.rLStr}</span>
            </div>
            <Slider
              id="vd-rl"
              min={0}
              max={R_STEPS}
              step={1}
              value={[rToSlider(rL, RL_LOG_MIN, RL_LOG_MAX)]}
              onValueChange={([v]) => setRL(sliderToR(v, RL_LOG_MIN, RL_LOG_MAX))}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
              <ResultBox tone="warn" label={<MathText>{t('ch1_4.widget.divider.voutLoadedLabel')}</MathText>}>
                <p className="text-xl font-mono font-semibold text-foreground">
                  {formatted.vOutLoadedStr}
                </p>
              </ResultBox>
              <ResultBox tone="error" label={t('ch1_4.widget.divider.sagLabel')}>
                <p className="text-xl font-mono font-semibold text-foreground">
                  {fmt(sagPct, 1)} %
                </p>
              </ResultBox>
            </div>
          </>
        )}
      </div>

      {/* ── Power readouts — always visible, they motivate the
           derating note in the prose ───────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <ResultBox tone="muted" label={t('ch1_4.widget.divider.powerR1Label')}>
          <p className="text-base font-mono text-foreground">{formatted.powerR1Str}</p>
        </ResultBox>
        <ResultBox tone="muted" label={t('ch1_4.widget.divider.powerR2Label')}>
          <p className="text-base font-mono text-foreground">{formatted.powerR2Str}</p>
        </ResultBox>
      </div>

      <p className="text-[13px] text-muted-foreground">
        <MathText>{t('ch1_4.widget.divider.hint')}</MathText>
      </p>
    </Widget>
  )
}
