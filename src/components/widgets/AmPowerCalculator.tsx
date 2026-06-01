/**
 * Chapter 2.2 §4 — AM power & bandwidth calculator.
 *
 * Full-carrier (DSB-FC) AM power split (cf. ARRL Handbook 2023, §11.2.1):
 *   each sideband  P_sb = P_c · m² / 4
 *   total          P_tot = P_c · (1 + m² / 2)
 * At m = 1: each sideband = P_c/4, total = 1.5·P_c — two-thirds of the power
 * sits uselessly in the carrier. Bandwidth = 2 × highest audio frequency.
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

export default function AmPowerCalculator() {
  const { t } = useTranslation('ui')
  const { num } = useLocaleFormatter()
  const tUnit = useUnitFormatter()

  const [carrierDisp, setCarrierDisp] = useState('100')
  const [mi, setMi] = useState(1)
  const [audioDisp, setAudioDisp] = useState('3')

  const computed = useMemo(() => {
    const pc = parseValue(carrierDisp)
    const audio = parseValue(audioDisp)
    const pSbEach = (pc * mi * mi) / 4
    const total = pc + 2 * pSbEach
    const bwKhz = 2 * audio
    return { pc, pSbEach, total, bwKhz }
  }, [carrierDisp, mi, audioDisp])

  const round1 = (x: number) => Math.round(x * 10) / 10

  return (
    <Widget
      title={t('ch2_2.amPower.title')}
      description={<Trans i18nKey="ch2_2.amPower.description" ns="ui" components={{ ...mathComponents }} />}
    >
      {/* inputs */}
      <div className="grid grid-cols-1 gap-3">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <label htmlFor="amp-carrier" className="text-foreground font-medium shrink-0 w-44">
            {t('ch2_2.amPower.carrierLabel')}
          </label>
          <input
            id="amp-carrier"
            type="number"
            inputMode="decimal"
            step="any"
            min="0"
            value={carrierDisp}
            onChange={e => setCarrierDisp(e.target.value)}
            className="border border-border rounded px-2 py-1 bg-background text-foreground w-24 font-mono"
          />
          <span className="text-muted-foreground">{tUnit('w')}</span>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-sm">
          <label htmlFor="amp-mi" className="text-foreground font-medium shrink-0 w-44">
            {t('ch2_2.amPower.indexLabel')}
          </label>
          <input
            id="amp-mi"
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={mi}
            onChange={e => setMi(Number(e.target.value))}
            className="flex-1 min-w-[140px] accent-primary"
          />
          <span className="font-mono text-foreground w-16 text-right shrink-0">
            {num(Math.round(mi * 100) / 100)}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-sm">
          <label htmlFor="amp-audio" className="text-foreground font-medium shrink-0 w-44">
            {t('ch2_2.amPower.audioLabel')}
          </label>
          <input
            id="amp-audio"
            type="number"
            inputMode="decimal"
            step="any"
            min="0"
            value={audioDisp}
            onChange={e => setAudioDisp(e.target.value)}
            className="border border-border rounded px-2 py-1 bg-background text-foreground w-24 font-mono"
          />
          <span className="text-muted-foreground">{tUnit('khz')}</span>
        </div>
      </div>

      {/* outputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <ResultBox tone="warn" label={t('ch2_2.amPower.carrierReadout')}>
          <p className="text-xl font-mono font-semibold text-foreground">{num(round1(computed.pc))} {tUnit('w')}</p>
        </ResultBox>
        <ResultBox tone="success" label={t('ch2_2.amPower.sidebandReadout')}>
          <p className="text-xl font-mono font-semibold text-foreground">{num(round1(computed.pSbEach))} {tUnit('w')}</p>
        </ResultBox>
        <ResultBox tone="info" label={t('ch2_2.amPower.totalReadout')}>
          <p className="text-xl font-mono font-semibold text-foreground">{num(round1(computed.total))} {tUnit('w')}</p>
        </ResultBox>
        <ResultBox tone="primary" label={t('ch2_2.amPower.bwReadout')}>
          <p className="text-xl font-mono font-semibold text-foreground">{num(round1(computed.bwKhz))} {tUnit('khz')}</p>
        </ResultBox>
      </div>

      <p className="text-[13px] text-muted-foreground">
        <Trans i18nKey="ch2_2.amPower.hint" ns="ui" components={{ ...mathComponents }} />
      </p>
    </Widget>
  )
}
