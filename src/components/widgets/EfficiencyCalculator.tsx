/**
 * Chapter 2.3 §2 — efficiency calculator.
 *
 *   P_DC = V × I            (what the supply delivers)
 *   η     = P_RF / P_DC     (the fraction that becomes signal)
 *   P_heat = P_DC − P_RF    (the rest, dissipated in the final amplifier)
 *
 * Enter supply voltage, transmit current and RF output; read efficiency and
 * the heat the amplifier must shed.
 */
import { useMemo, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import Widget from '@/components/ui/widget'
import { ResultBox } from '@/components/ui/result-box'
import { mathComponents } from '@/lib/trans-defaults'
import { useLocaleFormatter, useUnitFormatter } from '@/lib/hooks/useLocaleFormatter'

function parseValue(s: string): number {
  const n = Number.parseFloat(s.replace(',', '.').trim())
  return Number.isFinite(n) && n >= 0 ? n : 0
}

export default function EfficiencyCalculator() {
  const { t } = useTranslation('ui')
  const { num, fmt } = useLocaleFormatter()
  const tUnit = useUnitFormatter()

  const [voltDisp, setVoltDisp] = useState('13.8')
  const [currentDisp, setCurrentDisp] = useState('21')
  const [rfDisp, setRfDisp] = useState('100')

  const computed = useMemo(() => {
    const v = parseValue(voltDisp)
    const i = parseValue(currentDisp)
    const rf = parseValue(rfDisp)
    const dc = v * i
    const eff = dc > 0 ? (rf / dc) * 100 : 0
    const heat = Math.max(0, dc - rf)
    return { dc, eff, heat, impossible: rf > dc && dc > 0 }
  }, [voltDisp, currentDisp, rfDisp])

  return (
    <Widget
      title={t('ch2_3.efficiency.title')}
      description={<Trans i18nKey="ch2_3.efficiency.description" ns="ui" components={{ ...mathComponents }} />}
    >
      {/* inputs */}
      <div className="grid grid-cols-1 gap-3">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <label htmlFor="eff-volt" className="text-foreground font-medium shrink-0 w-44">
            {t('ch2_3.efficiency.voltLabel')}
          </label>
          <input
            id="eff-volt"
            type="number"
            inputMode="decimal"
            step="any"
            min="0"
            value={voltDisp}
            onChange={e => setVoltDisp(e.target.value)}
            className="border border-border rounded px-2 py-1 bg-background text-foreground w-24 font-mono"
          />
          <span className="text-muted-foreground">{tUnit('v')}</span>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-sm">
          <label htmlFor="eff-current" className="text-foreground font-medium shrink-0 w-44">
            {t('ch2_3.efficiency.currentLabel')}
          </label>
          <input
            id="eff-current"
            type="number"
            inputMode="decimal"
            step="any"
            min="0"
            value={currentDisp}
            onChange={e => setCurrentDisp(e.target.value)}
            className="border border-border rounded px-2 py-1 bg-background text-foreground w-24 font-mono"
          />
          <span className="text-muted-foreground">{tUnit('a')}</span>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-sm">
          <label htmlFor="eff-rf" className="text-foreground font-medium shrink-0 w-44">
            {t('ch2_3.efficiency.rfLabel')}
          </label>
          <input
            id="eff-rf"
            type="number"
            inputMode="decimal"
            step="any"
            min="0"
            value={rfDisp}
            onChange={e => setRfDisp(e.target.value)}
            className="border border-border rounded px-2 py-1 bg-background text-foreground w-24 font-mono"
          />
          <span className="text-muted-foreground">{tUnit('w')}</span>
        </div>
      </div>

      {/* outputs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <ResultBox tone="info" label={t('ch2_3.efficiency.dcReadout')}>
          <p className="text-xl font-mono font-semibold text-foreground">
            {num(Math.round(computed.dc))} {tUnit('w')}
          </p>
        </ResultBox>
        <ResultBox tone={computed.impossible ? 'error' : 'primary'} label={t('ch2_3.efficiency.effReadout')}>
          <p className="text-xl font-mono font-semibold text-foreground">
            {fmt(computed.eff, 1)} %
          </p>
        </ResultBox>
        <ResultBox tone="warn" label={t('ch2_3.efficiency.heatReadout')}>
          <p className="text-xl font-mono font-semibold text-foreground">
            {num(Math.round(computed.heat))} {tUnit('w')}
          </p>
        </ResultBox>
      </div>

      <p className="text-[13px] text-muted-foreground">
        <Trans i18nKey="ch2_3.efficiency.hint" ns="ui" components={{ ...mathComponents }} />
      </p>
    </Widget>
  )
}
