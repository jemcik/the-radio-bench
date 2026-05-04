import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Widget from '@/components/ui/widget'
import { ResultBox } from '@/components/ui/result-box'
import { useLocaleFormatter, useUnitFormatter } from '@/lib/hooks/useLocaleFormatter'
import { MathText } from '@/components/ui/math-text'

/**
 * Chapter 1.9 — Turns ratio calculator.
 *
 *   V_s = V_p · (N_s / N_p)
 *   I_p = I_s · (N_s / N_p)        (= I_s · ratio, since voltage ratio = N_s/N_p)
 *   I_s = I_p · (N_p / N_s)
 *
 * Inputs: N_p, N_s, V_p, I_p (the primary side is fully specified).
 * Outputs: V_s, I_s, plus a "step-up / step-down / isolation" badge
 * and the numeric N_s/N_p ratio.
 *
 * The widget treats the transformer as ideal — power in equals power
 * out — which is what the worked examples in §2 and §3 of the chapter
 * use. Real-world losses (5–20%) are handled in §5 of the prose, not
 * here.
 */

function parseValue(s: string): number {
  const n = Number.parseFloat(s.replace(',', '.').trim())
  return Number.isFinite(n) && n >= 0 ? n : 0
}

function pickVoltage(volts: number): { value: number; unitKey: string } {
  if (volts >= 1e3) return { value: volts / 1e3, unitKey: 'kv' }
  if (volts >= 1) return { value: volts, unitKey: 'v' }
  return { value: volts * 1e3, unitKey: 'mv' }
}

function pickAmps(amps: number): { value: number; unitKey: string } {
  if (amps >= 1) return { value: amps, unitKey: 'a' }
  if (amps >= 1e-3) return { value: amps * 1e3, unitKey: 'ma' }
  return { value: amps * 1e6, unitKey: 'ua' }
}

function formatScaled(
  raw: number,
  pick: (n: number) => { value: number; unitKey: string },
  num: (n: number) => string,
  fallbackUnit: string,
): { display: string; unitKey: string } {
  if (!Number.isFinite(raw) || raw <= 0) return { display: num(0), unitKey: fallbackUnit }
  const { value, unitKey } = pick(raw)
  const abs = Math.abs(value)
  const places = abs < 1 ? 3 : abs < 10 ? 2 : abs < 100 ? 1 : 0
  const factor = Math.pow(10, places)
  return { display: num(Math.round(value * factor) / factor), unitKey }
}

function formatRatio(np: number, ns: number, num: (n: number) => string): string {
  if (np <= 0 || ns <= 0) return '—'
  // Reduce by GCD when both are integer-ish so 100:25 → 4:1
  if (Number.isInteger(np) && Number.isInteger(ns)) {
    const g = gcd(np, ns)
    return `${np / g} : ${ns / g}`
  }
  return `1 : ${num(Math.round((ns / np) * 100) / 100)}`
}

function gcd(a: number, b: number): number {
  let x = Math.abs(a)
  let y = Math.abs(b)
  while (y) {
    const t = y
    y = x % y
    x = t
  }
  return x || 1
}

interface InputRowProps {
  labelKey: string
  disp: string
  setDisp: (s: string) => void
  idSuffix: string
  unit?: string
  t: (k: string) => string
}

function InputRow({ labelKey, disp, setDisp, idSuffix, unit, t }: InputRowProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      <label
        htmlFor={`turns-val-${idSuffix}`}
        className="text-foreground font-medium shrink-0 w-44"
      >
        <MathText>{t(labelKey)}</MathText>
      </label>
      <input
        id={`turns-val-${idSuffix}`}
        type="number"
        inputMode="decimal"
        step="any"
        min="0"
        value={disp}
        onChange={e => setDisp(e.target.value)}
        className="border border-border rounded px-2 py-1 bg-background text-foreground w-24 font-mono"
      />
      {unit && (
        <span className="text-muted-foreground text-sm">{unit}</span>
      )}
    </div>
  )
}

export default function TurnsRatioCalculator() {
  const { t } = useTranslation('ui')
  const { num } = useLocaleFormatter()
  const tUnit = useUnitFormatter()

  // Defaults track the worked example in §2: 920 turns primary, 48 turns
  // secondary, 230 V primary, 0.26 A primary current → 12 V / 5 A on
  // the secondary.
  const [npDisp, setNpDisp] = useState('920')
  const [nsDisp, setNsDisp] = useState('48')
  const [vpDisp, setVpDisp] = useState('230')
  const [ipDisp, setIpDisp] = useState('0.26')

  const np = parseValue(npDisp)
  const ns = parseValue(nsDisp)
  const vp = parseValue(vpDisp)
  const ip = parseValue(ipDisp)

  const computed = useMemo(() => {
    if (np <= 0 || ns <= 0) return { vs: 0, is: 0, kind: 'isolation' as const }
    const vs = vp * (ns / np)
    const is = ip * (np / ns)
    const kind = ns > np ? 'stepUp' : ns < np ? 'stepDown' : 'isolation'
    return { vs, is, kind }
  }, [np, ns, vp, ip])

  const vsOut = formatScaled(computed.vs, pickVoltage, num, 'v')
  const isOut = formatScaled(computed.is, pickAmps, num, 'a')
  const ratioOut = formatRatio(np, ns, num)

  const kindLabel = computed.kind === 'stepUp'
    ? t('ch1_9.widget.turnsRatio.kindStepUp')
    : computed.kind === 'stepDown'
      ? t('ch1_9.widget.turnsRatio.kindStepDown')
      : t('ch1_9.widget.turnsRatio.kindIsolation')

  return (
    <Widget
      title={t('ch1_9.widget.turnsRatio.title')}
      description={t('ch1_9.widget.turnsRatio.description')}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <InputRow
          labelKey="ch1_9.widget.turnsRatio.npLabel"
          disp={npDisp}
          setDisp={setNpDisp}
          idSuffix="np"
          t={t}
        />
        <InputRow
          labelKey="ch1_9.widget.turnsRatio.nsLabel"
          disp={nsDisp}
          setDisp={setNsDisp}
          idSuffix="ns"
          t={t}
        />
        <InputRow
          labelKey="ch1_9.widget.turnsRatio.vpLabel"
          disp={vpDisp}
          setDisp={setVpDisp}
          idSuffix="vp"
          unit={tUnit('v')}
          t={t}
        />
        <InputRow
          labelKey="ch1_9.widget.turnsRatio.ipLabel"
          disp={ipDisp}
          setDisp={setIpDisp}
          idSuffix="ip"
          unit={tUnit('a')}
          t={t}
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <ResultBox tone="success" label={<MathText>{t('ch1_9.widget.turnsRatio.vsReadout')}</MathText>}>
          <p className="text-xl font-mono font-semibold text-foreground">
            {vsOut.display} {tUnit(vsOut.unitKey)}
          </p>
        </ResultBox>
        <ResultBox tone="success" label={<MathText>{t('ch1_9.widget.turnsRatio.isReadout')}</MathText>}>
          <p className="text-xl font-mono font-semibold text-foreground">
            {isOut.display} {tUnit(isOut.unitKey)}
          </p>
        </ResultBox>
        <ResultBox tone="info" label={t('ch1_9.widget.turnsRatio.ratioReadout')}>
          <p className="text-xl font-mono font-semibold text-foreground">
            {ratioOut}
          </p>
        </ResultBox>
        <ResultBox tone="warn" label={t('ch1_9.widget.turnsRatio.kindReadout')}>
          <p className="text-base font-semibold text-foreground">
            {kindLabel}
          </p>
        </ResultBox>
      </div>

      <p className="text-[13px] text-muted-foreground">
        {t('ch1_9.widget.turnsRatio.hint')}
      </p>
    </Widget>
  )
}
