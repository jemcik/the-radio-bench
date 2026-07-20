/**
 * Chapter 4.3 §3 — how much energy is still sitting in that capacitor, and
 * whether it is enough to matter.
 *
 * ── Why this widget does NOT say "lethal" ──────────────────────────────
 * The folk rule is "about a joule can stop a heart", and it is wrong as
 * usually stated. Fibrillation is not an energy phenomenon: IEC 60479-1
 * §3.2.5 defines the fibrillation threshold as a **current**, and IEC 60479-2
 * §11 handles capacitor discharges as a **charge** (~5 mC for 50 % probability;
 * 3 mC "mostly safe"). The ~1 J figure is real but comes from cardiology — it
 * is the energy used to *deliberately* induce fibrillation during implanted-
 * defibrillator testing, delivered through an electrode inside the heart and
 * timed into the ~10 % of the cardiac cycle when the heart is vulnerable. Only
 * ~4 % of a transthoracic current reaches cardiac tissue at all (Lerman &
 * Deale 1990). A joule in a can on your bench is not that joule.
 *
 * So the verdict here is a **work-control** threshold, not an electrocution
 * one: NFPA 70E Article 360, which is voltage-dependent rather than a single
 * number, and is corroborated verbatim by SLAC's ES&H manual §2.2.3 and
 * Jefferson Lab's capacitor training:
 *     < 100 V  → hazardous above 100 J
 *     ≥ 100 V  → hazardous above 1 J
 *     ≥ 400 V  → hazardous above 0.25 J
 * (The older "10 J" rule hams repeat is SLAC's own *superseded* threshold —
 * real, citable, and no longer current.) SLAC notes the 0.25 J tier is a
 * **startle** threshold: the injury it prevents is mostly non-electrical —
 * your hand jerking into the HT rail, falling off the stool, dropping a tool
 * across the bus.
 *
 * ── The recovery readout ───────────────────────────────────────────────
 * Dielectric absorption ("soakage") is why a discharged capacitor climbs back.
 * Non-solid aluminium electrolytics recover 10–15 % of the soak voltage after
 * a short discharge (manufacturer data; Art of Electronics 3rd ed. §5.6.2B
 * Fig. 5.4 measures ~10 % for Al electrolytic and tantalum). That is the whole
 * pedagogical inversion of this section: at 400 V, recovery is a spark-and-
 * swearing story (~40–60 V); at 4 kV it is a fatality story (~400–600 V). Same
 * phenomenon, same percentage — the danger comes from the voltage it is a
 * percentage OF. Hence ARRL's rule to tie the terminals together with wire.
 */
import { useMemo, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import Widget from '@/components/ui/widget'
import { ResultBox } from '@/components/ui/result-box'
import { mathComponents } from '@/lib/trans-defaults'
import { useLocaleFormatter, useUnitFormatter } from '@/lib/hooks/useLocaleFormatter'

const DEFAULT_UF = 100
const DEFAULT_V = 400

/** Dielectric-absorption recovery band for non-solid aluminium electrolytics. */
const DA_LO = 0.10
const DA_HI = 0.15

/** NFPA 70E Article 360 — stored-energy hazard threshold, in joules, for a
 *  given working voltage. Voltage-dependent by design: the standards moved
 *  away from a single joule number precisely because there isn't one. */
function hazardThresholdJ(volts: number): number {
  if (volts >= 400) return 0.25
  if (volts >= 100) return 1
  return 100
}

export default function CapacitorEnergyCalculator() {
  const { t } = useTranslation('ui')
  const { fmt, num } = useLocaleFormatter()
  const tUnit = useUnitFormatter()

  const [uf, setUf] = useState(DEFAULT_UF)
  const [volts, setVolts] = useState(DEFAULT_V)

  const { joules, millicoulombs, threshold, over } = useMemo(() => {
    const c = uf * 1e-6
    const j = 0.5 * c * volts * volts
    const mc = c * volts * 1000
    const thr = hazardThresholdJ(volts)
    return { joules: j, millicoulombs: mc, threshold: thr, over: j / thr }
  }, [uf, volts])

  const hazardous = joules > threshold

  return (
    <Widget
      title={t('ch4_3.capCalc.title')}
      description={
        <Trans i18nKey="ch4_3.capCalc.description" ns="ui" components={{ ...mathComponents }} />
      }
    >
      {/* ── Capacitance ───────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <label htmlFor="ce-uf" className="text-foreground font-medium shrink-0 w-40">
          {t('ch4_3.capCalc.capLabel')}
        </label>
        <input
          id="ce-uf"
          type="range"
          min={1}
          max={500}
          step={1}
          value={uf}
          onChange={e => setUf(Number(e.target.value))}
          className="flex-1 min-w-[160px] accent-primary"
        />
        <span className="font-mono text-foreground w-24 text-right shrink-0">
          {num(uf)} {tUnit('uf')}
        </span>
      </div>

      {/* ── Voltage ───────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <label htmlFor="ce-v" className="text-foreground font-medium shrink-0 w-40">
          {t('ch4_3.capCalc.voltLabel')}
        </label>
        <input
          id="ce-v"
          type="range"
          min={25}
          max={4000}
          step={25}
          value={volts}
          onChange={e => setVolts(Number(e.target.value))}
          className="flex-1 min-w-[160px] accent-primary"
        />
        <span className="font-mono text-foreground w-24 text-right shrink-0">
          {num(volts)} {tUnit('v')}
        </span>
      </div>

      {/* ── Results ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <ResultBox tone="primary" label={t('ch4_3.capCalc.energyOut')}>
          <span className="font-mono text-lg">
            {fmt(joules, 2)} {tUnit('j')}
          </span>
        </ResultBox>
        <ResultBox tone={hazardous ? 'error' : 'success'} label={t('ch4_3.capCalc.verdictOut')}>
          <span className="text-sm font-medium">
            {hazardous
              ? t('ch4_3.capCalc.verdictOver', {
                  times: fmt(over, over >= 10 ? 0 : 1),
                  threshold: fmt(threshold, 2),
                })
              : t('ch4_3.capCalc.verdictUnder', { threshold: fmt(threshold, 2) })}
          </span>
        </ResultBox>
        <ResultBox tone="warn" label={t('ch4_3.capCalc.recoveryOut')}>
          <span className="font-mono text-lg">
            {fmt(volts * DA_LO, 0)}–{fmt(volts * DA_HI, 0)} {tUnit('v')}
          </span>
        </ResultBox>
      </div>

      <p className="text-[13px] text-muted-foreground">
        <Trans
          i18nKey="ch4_3.capCalc.note"
          ns="ui"
          components={{ ...mathComponents, strong: <strong /> }}
          values={{ charge: fmt(millicoulombs, 1) }}
        />
      </p>
    </Widget>
  )
}
