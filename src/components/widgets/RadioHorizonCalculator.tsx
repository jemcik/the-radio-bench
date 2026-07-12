/**
 * Chapter 4.1 §1 — radio horizon (line-of-sight) distance calculator.
 *
 *   d(km) ≈ 4.12 · (√h_tx + √h_rx)     radio horizon (heights in metres)
 *   d(km) ≈ 3.57 · (√h_tx + √h_rx)     purely geometric / visual horizon
 *
 * The 4.12 constant folds in the standard 4/3-earth atmospheric
 * refraction, so the radio horizon sits ~15 % beyond the visual one.
 * cf. ARRL Handbook 2023, propagation chapter; ITU-R P.834.
 *
 * Enter each antenna height (or pick a preset); read how far two
 * VHF/UHF stations can reach each other.
 */
import { useMemo, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import Widget from '@/components/ui/widget'
import { ResultBox } from '@/components/ui/result-box'
import { mathComponents } from '@/lib/trans-defaults'
import { useLocaleFormatter, useUnitFormatter } from '@/lib/hooks/useLocaleFormatter'

const RADIO_K = 4.12
const OPTICAL_K = 3.57

function parseValue(s: string): number {
  const n = Number.parseFloat(s.replace(',', '.').trim())
  return Number.isFinite(n) && n >= 0 ? n : 0
}

// Preset "your antenna" heights (metres). Names are symbolic, not prose.
const PRESETS: Array<{ key: 'presetHandheld' | 'presetRoof' | 'presetHill' | 'presetTower'; h: number }> = [
  { key: 'presetHandheld', h: 1.5 },
  { key: 'presetRoof', h: 10 },
  { key: 'presetHill', h: 100 },
  { key: 'presetTower', h: 300 },
]

export default function RadioHorizonCalculator() {
  const { t } = useTranslation('ui')
  const { fmt } = useLocaleFormatter()
  const tUnit = useUnitFormatter()

  const [txDisp, setTxDisp] = useState('10')
  const [rxDisp, setRxDisp] = useState('10')

  const { radio, optical } = useMemo(() => {
    const roots = Math.sqrt(parseValue(txDisp)) + Math.sqrt(parseValue(rxDisp))
    return { radio: RADIO_K * roots, optical: OPTICAL_K * roots }
  }, [txDisp, rxDisp])

  return (
    <Widget
      title={t('ch4_1.horizonCalc.title')}
      description={<Trans i18nKey="ch4_1.horizonCalc.description" ns="ui" components={{ ...mathComponents }} />}
    >
      <div className="flex flex-wrap items-end gap-4 text-sm">
        <div className="flex flex-col gap-1">
          <label htmlFor="horizon-tx" className="text-foreground font-medium">
            {t('ch4_1.horizonCalc.txLabel')}
          </label>
          <div className="flex items-center gap-2">
            <input
              id="horizon-tx"
              type="number"
              inputMode="decimal"
              step="any"
              min="0"
              value={txDisp}
              onChange={e => setTxDisp(e.target.value)}
              className="border border-border rounded px-2 py-1 bg-background text-foreground w-24 font-mono"
            />
            <span className="text-muted-foreground">{tUnit('m')}</span>
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="horizon-rx" className="text-foreground font-medium">
            {t('ch4_1.horizonCalc.rxLabel')}
          </label>
          <div className="flex items-center gap-2">
            <input
              id="horizon-rx"
              type="number"
              inputMode="decimal"
              step="any"
              min="0"
              value={rxDisp}
              onChange={e => setRxDisp(e.target.value)}
              className="border border-border rounded px-2 py-1 bg-background text-foreground w-24 font-mono"
            />
            <span className="text-muted-foreground">{tUnit('m')}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="text-muted-foreground shrink-0">{t('ch4_1.horizonCalc.presetLabel')}</span>
        {PRESETS.map(p => (
          <button
            key={p.key}
            type="button"
            onClick={() => setTxDisp(String(p.h))}
            className="border border-border rounded px-2 py-1 bg-background text-foreground hover:bg-muted text-[13px]"
          >
            {t(`ch4_1.horizonCalc.${p.key}`)}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <ResultBox tone="primary" label={t('ch4_1.horizonCalc.radioOut')}>
          <p className="text-2xl font-mono font-semibold text-foreground">
            {fmt(radio, 2)} {tUnit('km')}
          </p>
        </ResultBox>
        <ResultBox tone="muted" label={t('ch4_1.horizonCalc.opticalOut')}>
          <p className="text-2xl font-mono font-semibold text-foreground">
            {fmt(optical, 2)} {tUnit('km')}
          </p>
        </ResultBox>
      </div>

      <p className="text-[13px] text-muted-foreground">{t('ch4_1.horizonCalc.note')}</p>
    </Widget>
  )
}
