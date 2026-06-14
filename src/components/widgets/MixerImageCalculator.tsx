/**
 * Chapter 3.1 §5 — local-oscillator and image-frequency calculator.
 *
 *   f_LO    = f_RF ± f_IF        (oscillator one IF above or below the station)
 *   f_image = f_RF ± 2·f_IF      (image one IF beyond the oscillator)
 *   offset  = 2·f_IF             (image-to-station spacing)
 *
 * Enter the wanted station (MHz), the intermediate frequency (kHz) and which
 * side the local oscillator sits; read where the oscillator must go and where
 * the unwanted image lands. Raising the IF pushes the image further away.
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

type LoSide = 'high' | 'low'

export default function MixerImageCalculator() {
  const { t } = useTranslation('ui')
  const { fmt, num } = useLocaleFormatter()
  const tUnit = useUnitFormatter()

  const [rfDisp, setRfDisp] = useState('7.0')
  const [ifDisp, setIfDisp] = useState('455')
  const [side, setSide] = useState<LoSide>('high')

  const computed = useMemo(() => {
    const rf = parseValue(rfDisp) // MHz
    const ifKhz = parseValue(ifDisp) // kHz
    const ifMhz = ifKhz / 1000
    const lo = side === 'high' ? rf + ifMhz : Math.max(0, rf - ifMhz)
    const image = side === 'high' ? rf + 2 * ifMhz : rf - 2 * ifMhz
    const offsetKhz = 2 * ifKhz
    return { lo, image: Math.max(0, image), offsetKhz }
  }, [rfDisp, ifDisp, side])

  return (
    <Widget
      title={t('ch3_1.mixerCalc.title')}
      description={<Trans i18nKey="ch3_1.mixerCalc.description" ns="ui" components={{ ...mathComponents }} />}
    >
      {/* inputs */}
      <div className="grid grid-cols-1 gap-3">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <label htmlFor="mix-rf" className="text-foreground font-medium shrink-0 w-52">
            {t('ch3_1.mixerCalc.rfLabel')}
          </label>
          <input
            id="mix-rf"
            type="number"
            inputMode="decimal"
            step="any"
            min="0"
            value={rfDisp}
            onChange={e => setRfDisp(e.target.value)}
            className="border border-border rounded px-2 py-1 bg-background text-foreground w-24 font-mono"
          />
          <span className="text-muted-foreground">{tUnit('mhz')}</span>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-sm">
          <label htmlFor="mix-if" className="text-foreground font-medium shrink-0 w-52">
            {t('ch3_1.mixerCalc.ifLabel')}
          </label>
          <input
            id="mix-if"
            type="number"
            inputMode="decimal"
            step="any"
            min="0"
            value={ifDisp}
            onChange={e => setIfDisp(e.target.value)}
            className="border border-border rounded px-2 py-1 bg-background text-foreground w-24 font-mono"
          />
          <span className="text-muted-foreground">{tUnit('khz')}</span>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-sm">
          <label htmlFor="mix-side" className="text-foreground font-medium shrink-0 w-52">
            {t('ch3_1.mixerCalc.sideLabel')}
          </label>
          <select
            id="mix-side"
            value={side}
            onChange={e => setSide(e.target.value as LoSide)}
            className="border border-border rounded px-2 py-1 bg-background text-foreground font-mono"
          >
            <option value="high">{t('ch3_1.mixerCalc.sideHigh')}</option>
            <option value="low">{t('ch3_1.mixerCalc.sideLow')}</option>
          </select>
        </div>
      </div>

      {/* outputs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <ResultBox tone="primary" label={t('ch3_1.mixerCalc.loReadout')}>
          <p className="text-xl font-mono font-semibold text-foreground">
            {fmt(computed.lo, 3)} {tUnit('mhz')}
          </p>
        </ResultBox>
        <ResultBox tone="warn" label={t('ch3_1.mixerCalc.imageReadout')}>
          <p className="text-xl font-mono font-semibold text-foreground">
            {fmt(computed.image, 3)} {tUnit('mhz')}
          </p>
        </ResultBox>
        <ResultBox tone="info" label={t('ch3_1.mixerCalc.offsetReadout')}>
          <p className="text-xl font-mono font-semibold text-foreground">
            {num(computed.offsetKhz)} {tUnit('khz')}
          </p>
        </ResultBox>
      </div>

      <p className="text-[13px] text-muted-foreground">
        <Trans i18nKey="ch3_1.mixerCalc.hint" ns="ui" components={{ ...mathComponents, em: <em /> }} />
      </p>
    </Widget>
  )
}
