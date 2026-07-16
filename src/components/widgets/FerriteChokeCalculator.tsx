/**
 * Chapter 4.2 §5 — the N² rule for a ferrite common-mode choke.
 *
 * Threading a cable through a ferrite core once makes a 1-turn choke. Wind it
 * N times and the choking impedance rises with N² (inductance ∝ turns²,
 * spiral back to Ch 1.6). A single clamp-on type-31 core gives a modest
 * impedance at HF; a few turns turns it into a real RF stop.
 *
 * Model: Z ≈ Z₁·N², with Z₁ a representative single-pass impedance for a
 * type-31 clamp core in the HF range. Real cores self-resonate once stray
 * capacitance dominates (≈5–8 turns), so the note flags where N² tops out.
 * "Effective choke" threshold ≈ 1 kΩ (ARRL Handbook 2023 ch27 §27.3.4).
 */
import { useMemo, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import Widget from '@/components/ui/widget'
import { ResultBox } from '@/components/ui/result-box'
import { mathComponents } from '@/lib/trans-defaults'
import { useLocaleFormatter, useUnitFormatter } from '@/lib/hooks/useLocaleFormatter'

const Z1 = 100 // Ω, representative single-pass type-31 impedance at HF
const EFFECTIVE = 1000 // Ω, a "real" common-mode choke
const MAX_TURNS = 7

export default function FerriteChokeCalculator() {
  const { t } = useTranslation('ui')
  const { num } = useLocaleFormatter()
  const tUnit = useUnitFormatter()

  const [turns, setTurns] = useState(3)

  const z = useMemo(() => Z1 * turns * turns, [turns])
  const effective = z >= EFFECTIVE

  return (
    <Widget
      title={t('ch4_2.ferriteCalc.title')}
      description={<Trans i18nKey="ch4_2.ferriteCalc.description" ns="ui" components={{ ...mathComponents }} />}
    >
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <label htmlFor="fc-turns" className="text-foreground font-medium shrink-0 w-32">
          {t('ch4_2.ferriteCalc.turnsLabel')}
        </label>
        <input
          id="fc-turns"
          type="range"
          min={1}
          max={MAX_TURNS}
          step={1}
          value={turns}
          onChange={e => setTurns(Number(e.target.value))}
          className="flex-1 min-w-[160px] accent-primary"
        />
        <span className="font-mono text-foreground w-8 text-right shrink-0">{num(turns)}</span>
      </div>

      {/* growth bars — each turn's impedance, height ∝ n² */}
      <div className="flex items-end gap-1.5 h-24" aria-hidden>
        {Array.from({ length: MAX_TURNS }, (_, i) => i + 1).map(n => {
          const h = (n * n) / (MAX_TURNS * MAX_TURNS)
          const active = n <= turns
          return (
            <div key={n} className="flex-1 flex flex-col items-center justify-end h-full">
              <div
                className={`w-full rounded-t ${active ? 'bg-primary/70' : 'bg-muted'}`}
                style={{ height: `${Math.max(4, h * 100)}%` }}
              />
              <span className="text-[11px] text-muted-foreground mt-1 font-mono">{n}</span>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <ResultBox tone="primary" label={t('ch4_2.ferriteCalc.zOut')}>
          <p className="text-2xl font-mono font-semibold text-foreground">
            ≈ {num(z)} {tUnit('ohm')}
          </p>
          <p className="text-[13px] text-muted-foreground mt-1">
            <Trans i18nKey="ch4_2.ferriteCalc.multiplier" ns="ui" values={{ count: turns, sq: turns * turns }} components={{ ...mathComponents }} />
          </p>
        </ResultBox>
        <ResultBox tone={effective ? 'success' : 'warn'} label={t('ch4_2.ferriteCalc.verdictLabel')}>
          <p className="text-sm text-foreground">
            {effective ? t('ch4_2.ferriteCalc.effective') : t('ch4_2.ferriteCalc.weak')}
          </p>
        </ResultBox>
      </div>

      <p className="text-[13px] text-muted-foreground">
        <Trans i18nKey="ch4_2.ferriteCalc.note" ns="ui" components={{ ...mathComponents }} />
      </p>
    </Widget>
  )
}
