/**
 * Chapter 3.3 §4 — ERP / EIRP calculator.
 *
 *   system gain (dB) = antenna gain (dBd) − feedline loss (dB)
 *   ERP  = P × 10^(systemGain / 10)            referenced to a dipole
 *   EIRP = ERP × 10^(2.15 / 10) ≈ ERP × 1.64   referenced to isotropic
 *
 * Enter transmitter power, feedline loss and antenna gain; read ERP and EIRP.
 */
import { useMemo, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import Widget from '@/components/ui/widget'
import { ResultBox } from '@/components/ui/result-box'
import { mathComponents } from '@/lib/trans-defaults'
import { useLocaleFormatter, useUnitFormatter } from '@/lib/hooks/useLocaleFormatter'

// dipole → isotropic offset, in dB
const DBI_OFFSET = 2.15

function parseValue(s: string): number {
  const n = Number.parseFloat(s.replace(',', '.').trim())
  return Number.isFinite(n) ? n : 0
}

function fmtWatts(w: number, fmt: (n: number, d: number) => string): string {
  // Compact: whole watts once we are past a few, one decimal below that.
  return w >= 10 ? fmt(Math.round(w), 0) : fmt(w, 1)
}

export default function ErpCalculator() {
  const { t } = useTranslation('ui')
  const { fmt } = useLocaleFormatter()
  const tUnit = useUnitFormatter()

  const [powerDisp, setPowerDisp] = useState('100')
  const [lossDisp, setLossDisp] = useState('1')
  const [gainDisp, setGainDisp] = useState('6')

  const computed = useMemo(() => {
    const p = Math.max(0, parseValue(powerDisp))
    const loss = parseValue(lossDisp)
    const gain = parseValue(gainDisp)
    const sysGain = gain - loss
    const erp = p * 10 ** (sysGain / 10)
    const eirp = erp * 10 ** (DBI_OFFSET / 10)
    return { sysGain, erp, eirp }
  }, [powerDisp, lossDisp, gainDisp])

  const fields: Array<{ id: string; label: string; unit: string; value: string; set: (s: string) => void }> = [
    { id: 'erp-p', label: t('ch3_3.erpCalc.powerLabel'), unit: tUnit('w'), value: powerDisp, set: setPowerDisp },
    { id: 'erp-l', label: t('ch3_3.erpCalc.lossLabel'), unit: tUnit('db'), value: lossDisp, set: setLossDisp },
    { id: 'erp-g', label: t('ch3_3.erpCalc.gainLabel'), unit: tUnit('dbd'), value: gainDisp, set: setGainDisp },
  ]

  return (
    <Widget
      title={t('ch3_3.erpCalc.title')}
      description={<Trans i18nKey="ch3_3.erpCalc.description" ns="ui" components={{ ...mathComponents }} />}
    >
      <div className="grid grid-cols-1 gap-3">
        {fields.map(f => (
          <div key={f.id} className="flex flex-wrap items-center gap-2 text-sm">
            <label htmlFor={f.id} className="text-foreground font-medium shrink-0 w-44">
              {f.label}
            </label>
            <input
              id={f.id}
              type="number"
              inputMode="decimal"
              step="any"
              value={f.value}
              onChange={e => f.set(e.target.value)}
              className="border border-border rounded px-2 py-1 bg-background text-foreground w-24 font-mono"
            />
            <span className="text-muted-foreground">{f.unit}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <ResultBox tone="info" label={t('ch3_3.erpCalc.sysGainLabel')}>
          <p className="text-xl font-mono font-semibold text-foreground">
            {computed.sysGain >= 0 ? '+' : ''}{fmt(computed.sysGain, 1)} {tUnit('db')}
          </p>
        </ResultBox>
        <ResultBox tone="primary" label={t('ch3_3.erpCalc.erpLabel')}>
          <p className="text-xl font-mono font-semibold text-foreground">
            {fmtWatts(computed.erp, fmt)} {tUnit('w')}
          </p>
        </ResultBox>
        <ResultBox tone="muted" label={t('ch3_3.erpCalc.eirpLabel')}>
          <p className="text-xl font-mono font-semibold text-foreground">
            {fmtWatts(computed.eirp, fmt)} {tUnit('w')}
          </p>
        </ResultBox>
      </div>

      <p className="text-[13px] text-muted-foreground">
        {t('ch3_3.erpCalc.note')}
      </p>
    </Widget>
  )
}
