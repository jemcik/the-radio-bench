/**
 * Chapter 2.3 §4 — PEP vs average power.
 *
 * Average power as a fraction of PEP, by signal:
 *   steady carrier (FM, tuning) → 1.0    (always at its peak)
 *   two-tone test              → 0.5    (standard bench signal)
 *   SSB voice                  → ≈ 0.2   (mostly gaps and low levels)
 *
 * Average power — not PEP — is what heats the final amplifier.
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

const MODES = [
  { value: 'carrier', ratio: 1, labelKey: 'modeCarrier' },
  { value: 'twoTone', ratio: 0.5, labelKey: 'modeTwoTone' },
  { value: 'ssb', ratio: 0.2, labelKey: 'modeSsb' },
] as const

export default function PepCalculator() {
  const { t } = useTranslation('ui')
  const { fmt, num } = useLocaleFormatter()
  const tUnit = useUnitFormatter()

  const [pepDisp, setPepDisp] = useState('100')
  const [mode, setMode] = useState<string>('ssb')

  const computed = useMemo(() => {
    const pep = parseValue(pepDisp)
    const ratio = MODES.find(m => m.value === mode)?.ratio ?? 1
    return { avg: pep * ratio, ratio }
  }, [pepDisp, mode])

  return (
    <Widget
      title={t('ch2_3.pep.title')}
      description={<Trans i18nKey="ch2_3.pep.description" ns="ui" components={{ ...mathComponents }} />}
    >
      {/* inputs */}
      <div className="grid grid-cols-1 gap-3">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <label htmlFor="pep-watts" className="text-foreground font-medium shrink-0 w-44">
            {t('ch2_3.pep.pepLabel')}
          </label>
          <input
            id="pep-watts"
            type="number"
            inputMode="decimal"
            step="any"
            min="0"
            value={pepDisp}
            onChange={e => setPepDisp(e.target.value)}
            className="border border-border rounded px-2 py-1 bg-background text-foreground w-24 font-mono"
          />
          <span className="text-muted-foreground">{tUnit('w')}</span>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-sm">
          <label htmlFor="pep-mode" className="text-foreground font-medium shrink-0 w-44">
            {t('ch2_3.pep.modeLabel')}
          </label>
          <select
            id="pep-mode"
            value={mode}
            onChange={e => setMode(e.target.value)}
            className="border border-border rounded px-2 py-1 bg-background text-foreground"
          >
            {MODES.map(m => (
              <option key={m.value} value={m.value}>
                {t(`ch2_3.pep.${m.labelKey}`)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* outputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <ResultBox tone="warn" label={t('ch2_3.pep.avgReadout')}>
          <p className="text-xl font-mono font-semibold text-foreground">
            {num(Math.round(computed.avg * 10) / 10)} {tUnit('w')}
          </p>
        </ResultBox>
        <ResultBox tone="info" label={t('ch2_3.pep.ratioReadout')}>
          <p className="text-xl font-mono font-semibold text-foreground">{fmt(computed.ratio, 2)}</p>
        </ResultBox>
      </div>

      <p className="text-[13px] text-muted-foreground">
        <Trans i18nKey="ch2_3.pep.hint" ns="ui" components={{ ...mathComponents }} />
      </p>
    </Widget>
  )
}
