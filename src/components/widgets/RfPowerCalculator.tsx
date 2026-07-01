/**
 * Chapter 3.4 §5 — RF power from a scope reading.
 *
 * You measure a voltage across a 50 Ω dummy load; this turns it into watts.
 * RF power is always based on the RMS value, so the widget converts whatever
 * you measured (peak-to-peak, peak, or RMS) to V_rms first, then:
 *
 *   V_rms = V_pp / (2√2) = V_peak / √2
 *   P     = V_rms² / R
 *   dBm   = 10·log₁₀(P / 1 mW)
 *
 * Landmark check (ARRL Hbk 2023 Ch.25, p.1752): 100 V peak into 50 Ω = 100 W
 * (= +50 dBm). Here 200 V_pp → 100 V_peak → 70.7 V_rms → 100 W.
 */
import { useMemo, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import Widget from '@/components/ui/widget'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { ResultBox } from '@/components/ui/result-box'
import { mathComponents } from '@/lib/trans-defaults'
import { useLocaleFormatter, useUnitFormatter } from '@/lib/hooks/useLocaleFormatter'

type Mode = 'vpp' | 'vpeak' | 'vrms'

const SQRT2 = Math.SQRT2

/** Parse a string to a positive finite number, returning NaN otherwise. */
function parsePositive(raw: string): number {
  const trimmed = raw.trim().replace(',', '.')
  if (!trimmed) return NaN
  const n = parseFloat(trimmed)
  if (!isFinite(n) || n <= 0) return NaN
  return n
}

/** Keep only digits and a decimal separator. */
function stripNonNumeric(raw: string): string {
  return raw.replace(/[^0-9.,]/g, '')
}

export default function RfPowerCalculator() {
  const { t } = useTranslation('ui')
  const { fmt } = useLocaleFormatter()
  const tUnit = useUnitFormatter()

  const [mode, setMode] = useState<Mode>('vpp')
  const [vText, setVText] = useState('200')
  const [rText, setRText] = useState('50')

  const result = useMemo(() => {
    const v = parsePositive(vText)
    const r = parsePositive(rText)
    if (isNaN(v) || isNaN(r)) return { ok: false as const }
    const vrms = mode === 'vpp' ? v / (2 * SQRT2) : mode === 'vpeak' ? v / SQRT2 : v
    const vpeak = vrms * SQRT2
    const p = (vrms * vrms) / r
    const dbm = 10 * Math.log10(p * 1000) // P in W → mW → dBm
    return { ok: true as const, vrms, vpeak, p, dbm }
  }, [mode, vText, rText])

  return (
    <Widget
      title={t('ch3_4.rfPower.title')}
      description={<Trans i18nKey="ch3_4.rfPower.description" ns="ui" components={{ ...mathComponents }} />}
    >
      {/* measurement type */}
      <div className="space-y-2">
        <label htmlFor="rfp-mode" className="text-sm font-medium text-foreground">
          {t('ch3_4.rfPower.modeLabel')}
        </label>
        <Select id="rfp-mode" value={mode} onChange={e => setMode(e.target.value as Mode)}>
          <option value="vpp">{t('ch3_4.rfPower.modeVpp')}</option>
          <option value="vpeak">{t('ch3_4.rfPower.modeVpeak')}</option>
          <option value="vrms">{t('ch3_4.rfPower.modeVrms')}</option>
        </Select>
      </div>

      {/* voltage + load inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-2">
          <label htmlFor="rfp-v" className="text-sm font-medium text-foreground">
            {t('ch3_4.rfPower.voltageLabel')}{' '}
            <span className="text-xs text-muted-foreground">({tUnit('v')})</span>
          </label>
          <Input
            id="rfp-v"
            type="text"
            inputMode="decimal"
            value={vText}
            onChange={e => setVText(stripNonNumeric(e.target.value))}
            placeholder={t('ch3_4.rfPower.placeholder')}
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="rfp-r" className="text-sm font-medium text-foreground">
            {t('ch3_4.rfPower.loadLabel')}{' '}
            <span className="text-xs text-muted-foreground">({tUnit('ohm')})</span>
          </label>
          <Input
            id="rfp-r"
            type="text"
            inputMode="decimal"
            value={rText}
            onChange={e => setRText(stripNonNumeric(e.target.value))}
            placeholder={t('ch3_4.rfPower.placeholder')}
          />
        </div>
      </div>

      {result.ok ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <ResultBox tone="info" label={t('ch3_4.rfPower.vrmsOut')}>
            <p className="text-xl font-mono font-semibold text-foreground">{fmt(result.vrms, 1)} {tUnit('v')}</p>
          </ResultBox>
          <ResultBox tone="muted" label={t('ch3_4.rfPower.vpeakOut')}>
            <p className="text-xl font-mono font-semibold text-foreground">{fmt(result.vpeak, 1)} {tUnit('v')}</p>
          </ResultBox>
          <ResultBox tone="success" label={t('ch3_4.rfPower.powerOut')}>
            <p className="text-xl font-mono font-semibold text-foreground">{fmt(result.p, 1)} {tUnit('w')}</p>
          </ResultBox>
          <ResultBox tone="primary" label={t('ch3_4.rfPower.dbmOut')}>
            <p className="text-xl font-mono font-semibold text-foreground">{fmt(result.dbm, 1)} {tUnit('dbm')}</p>
          </ResultBox>
        </div>
      ) : (
        <ResultBox tone="muted" className="text-center">
          <p className="text-sm text-muted-foreground">{t('ch3_4.rfPower.invalid')}</p>
        </ResultBox>
      )}
    </Widget>
  )
}
