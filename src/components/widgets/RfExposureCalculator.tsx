/**
 * Chapter 4.3 §4 — what your station actually exposes people to, once you stop
 * quoting the number on the front panel.
 *
 * ── Why this computes POWER and not a distance ─────────────────────────
 * The obvious widget here is "power + frequency → safe distance", and it would
 * be wrong in the band most readers care about. The plane-wave formula
 * d = √(30·EIRP)/E only holds in the far field. At 14 MHz the ICNIRP 2020
 * compliance distance works out to ~1.5 m — but the reactive near field
 * (λ/2π) extends to 3.36 m, so the formula is being evaluated somewhere it
 * does not apply. That is not a rounding problem; it is why ICNIRP 2020
 * Table 5 defines **no power-density limit at all below 30 MHz** and requires
 * E and H to be checked separately. A widget printing "1.5 m" would be
 * confidently, authoritatively wrong.
 *
 * So this does the calculation that IS valid everywhere and that hams
 * consistently get wrong: time-averaged power. Exposure limits are averaged
 * over time (ICNIRP 2020: 30 min whole-body, 6 min local; ICNIRP 1998 and the
 * EU: 6 min for everything), so what matters is not peak envelope power but
 * PEP × mode duty cycle × the fraction of time you actually transmit. Two
 * independent factors, and people forget both.
 *
 * The punchline the widget exists to deliver: **the mode matters more than the
 * amplifier.** 100 W PEP on SSB with half-and-half over is 10 W averaged; the
 * same 100 W on FM or FT8 is 100 W averaged. Ten times the exposure from the
 * same radio and the same meter reading.
 *
 * Duty-cycle figures are mode-intrinsic physics (ARRL's RF Exposure Calculator;
 * RSGB and ITU-T K.52 use the same values). NOTE the deliberate boundary: the
 * duty-cycle NUMBERS are safe to reuse from US sources, but US exposure
 * CONCLUSIONS are not — the FCC lets amateurs apply the occupational limits to
 * themselves and their household, while under ICNIRP a hobbyist is not
 * occupationally exposed and the general-public limits (5× stricter in SAR)
 * apply to the operator too.
 *
 * The 100 W / 2.4 m benchmark is RSGB's, validated across a range of
 * assessments and measurements for time-averaged powers up to 100 W.
 */
import { useMemo, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import Widget from '@/components/ui/widget'
import { ResultBox } from '@/components/ui/result-box'
import { mathComponents } from '@/lib/trans-defaults'
import { useLocaleFormatter, useUnitFormatter } from '@/lib/hooks/useLocaleFormatter'

type ModeKey = 'ssb' | 'ssbProc' | 'cw' | 'fm'

/** Mode-intrinsic duty cycles. */
const MODE_DUTY: Record<ModeKey, number> = {
  ssb: 0.2,
  ssbProc: 0.5,
  cw: 0.4,
  fm: 1.0,
}

const DEFAULT_PEP = 100
const DEFAULT_MODE: ModeKey = 'ssb'
const DEFAULT_TX_PCT = 50

/** RSGB's validated rule-of-thumb ceiling for the 2.4 m separation. */
const RSGB_LIMIT_W = 100

export default function RfExposureCalculator() {
  const { t } = useTranslation('ui')
  const { fmt, num } = useLocaleFormatter()
  const tUnit = useUnitFormatter()

  const [pep, setPep] = useState(DEFAULT_PEP)
  const [mode, setMode] = useState<ModeKey>(DEFAULT_MODE)
  const [txPct, setTxPct] = useState(DEFAULT_TX_PCT)

  const { averaged, duty } = useMemo(() => {
    const d = MODE_DUTY[mode]
    return { duty: d, averaged: pep * d * (txPct / 100) }
  }, [pep, mode, txPct])

  return (
    <Widget
      title={t('ch4_3.rfCalc.title')}
      description={
        <Trans i18nKey="ch4_3.rfCalc.description" ns="ui" components={{ ...mathComponents }} />
      }
    >
      {/* ── PEP ───────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <label htmlFor="rf-pep" className="text-foreground font-medium shrink-0 w-44">
          {t('ch4_3.rfCalc.pepLabel')}
        </label>
        <input
          id="rf-pep"
          type="range"
          min={5}
          max={400}
          step={5}
          value={pep}
          onChange={e => setPep(Number(e.target.value))}
          className="flex-1 min-w-[160px] accent-primary"
        />
        <span className="font-mono text-foreground w-20 text-right shrink-0">
          {num(pep)} {tUnit('w')}
        </span>
      </div>

      {/* ── Mode ──────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <label htmlFor="rf-mode" className="text-foreground font-medium shrink-0 w-44">
          {t('ch4_3.rfCalc.modeLabel')}
        </label>
        <select
          id="rf-mode"
          value={mode}
          onChange={e => setMode(e.target.value as ModeKey)}
          className="flex-1 min-w-[160px] rounded-md border border-border bg-background px-2 py-1 text-foreground"
        >
          <option value="ssb">{t('ch4_3.rfCalc.modeSsb')}</option>
          <option value="ssbProc">{t('ch4_3.rfCalc.modeSsbProc')}</option>
          <option value="cw">{t('ch4_3.rfCalc.modeCw')}</option>
          <option value="fm">{t('ch4_3.rfCalc.modeFm')}</option>
        </select>
      </div>

      {/* ── Transmit fraction ─────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <label htmlFor="rf-tx" className="text-foreground font-medium shrink-0 w-44">
          {t('ch4_3.rfCalc.txLabel')}
        </label>
        <input
          id="rf-tx"
          type="range"
          min={5}
          max={100}
          step={5}
          value={txPct}
          onChange={e => setTxPct(Number(e.target.value))}
          className="flex-1 min-w-[160px] accent-primary"
        />
        <span className="font-mono text-foreground w-20 text-right shrink-0">{num(txPct)} %</span>
      </div>

      {/* ── Results ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <ResultBox tone="info" label={t('ch4_3.rfCalc.dutyOut')}>
          <span className="font-mono text-lg">{fmt(duty * 100, 0)} %</span>
        </ResultBox>
        <ResultBox tone="primary" label={t('ch4_3.rfCalc.avgOut')}>
          <span className="font-mono text-lg">
            {fmt(averaged, 1)} {tUnit('w')}
          </span>
        </ResultBox>
        <ResultBox tone={averaged <= RSGB_LIMIT_W ? 'success' : 'warn'} label={t('ch4_3.rfCalc.ruleOut')}>
          <span className="text-sm font-medium">
            {t(averaged <= RSGB_LIMIT_W ? 'ch4_3.rfCalc.ruleWithin' : 'ch4_3.rfCalc.ruleOver')}
          </span>
        </ResultBox>
      </div>

      <p className="text-[13px] text-muted-foreground">
        <Trans
          i18nKey="ch4_3.rfCalc.note"
          ns="ui"
          components={{ ...mathComponents, strong: <strong /> }}
        />
      </p>
    </Widget>
  )
}
