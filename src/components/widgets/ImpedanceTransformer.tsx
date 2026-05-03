import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Widget from '@/components/ui/widget'
import { ResultBox } from '@/components/ui/result-box'
import { useLocaleFormatter, useUnitFormatter } from '@/lib/hooks/useLocaleFormatter'
import { withSubscripts } from '@/lib/text-with-subscripts'

/**
 * Chapter 1.9 — Impedance transformer.
 *
 *   Z_p = Z_s · (N_p / N_s)²
 *
 * Inputs: secondary load impedance Z_s, turns ratio N_p:N_s.
 * Outputs: primary impedance Z_p, the squared impedance ratio, and
 * the SWR the source would see vs the canonical 50 Ω feedline.
 *
 * The widget framing is deliberate — most chapters reach the impedance
 * transformer in the context of "I want my 50 Ω rig to see X Ω", so
 * the SWR-vs-50Ω readout makes the answer immediately useful instead
 * of leaving the reader to do the SWR calculation themselves.
 */

const RATIO_PRESETS: { label: string; np: number; ns: number }[] = [
  { label: '1:1', np: 1, ns: 1 },
  { label: '1:2', np: 1, ns: 2 },
  { label: '1:3', np: 1, ns: 3 },
  { label: '1:7', np: 1, ns: 7 },
  { label: '2:1', np: 2, ns: 1 },
  { label: '3:1', np: 3, ns: 1 },
]

function parseValue(s: string): number {
  const n = Number.parseFloat(s.replace(',', '.').trim())
  return Number.isFinite(n) && n > 0 ? n : 0
}

function pickOhms(ohms: number): { value: number; unitKey: string } {
  if (ohms >= 1e3) return { value: ohms / 1e3, unitKey: 'kohm' }
  return { value: ohms, unitKey: 'ohm' }
}

function formatOhms(raw: number, num: (n: number) => string): { display: string; unitKey: string } {
  if (!Number.isFinite(raw) || raw <= 0) return { display: num(0), unitKey: 'ohm' }
  const { value, unitKey } = pickOhms(raw)
  const abs = Math.abs(value)
  const places = abs < 1 ? 3 : abs < 10 ? 2 : abs < 100 ? 1 : 0
  const factor = Math.pow(10, places)
  return { display: num(Math.round(value * factor) / factor), unitKey }
}

// SWR for a real-impedance load on a 50 Ω line.
function swrVs50(zp: number): number {
  if (!Number.isFinite(zp) || zp <= 0) return Infinity
  return zp >= 50 ? zp / 50 : 50 / zp
}

export default function ImpedanceTransformer() {
  const { t } = useTranslation('ui')
  const { num } = useLocaleFormatter()
  const tUnit = useUnitFormatter()

  // Default: 1:2 turns ratio with 200 Ω load → 50 Ω primary (the
  // canonical 4:1 balun example from §4).
  const [zsDisp, setZsDisp] = useState('200')
  const [presetIdx, setPresetIdx] = useState(1) // 1:2

  const zs = parseValue(zsDisp)
  const preset = RATIO_PRESETS[presetIdx]

  const computed = useMemo(() => {
    const np = preset.np
    const ns = preset.ns
    const ratioSq = (np / ns) ** 2
    const zp = zs * ratioSq
    return { zp, ratioSq, swr: swrVs50(zp) }
  }, [zs, preset])

  const zpOut = formatOhms(computed.zp, num)
  const ratioSqDisp = num(Math.round(computed.ratioSq * 1000) / 1000)
  const swrDisplay = !Number.isFinite(computed.swr)
    ? '∞'
    : `${num(Math.round(computed.swr * 100) / 100)} : 1`
  const swrIsGood = computed.swr <= 2

  return (
    <Widget
      title={withSubscripts(t('ch1_9.widget.impedance.title'))}
      description={withSubscripts(t('ch1_9.widget.impedance.description'))}
    >
      {/* Load impedance input */}
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <label
          htmlFor="impedance-zs"
          className="text-foreground font-medium shrink-0 w-44"
        >
          {withSubscripts(t('ch1_9.widget.impedance.zsLabel'))}
        </label>
        <input
          id="impedance-zs"
          type="number"
          inputMode="decimal"
          step="any"
          min="0"
          value={zsDisp}
          onChange={e => setZsDisp(e.target.value)}
          className="border border-border rounded px-2 py-1 bg-background text-foreground w-24 font-mono"
        />
        <span className="text-muted-foreground text-sm">{tUnit('ohm')}</span>
      </div>

      {/* Turns ratio preset selector */}
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="text-foreground font-medium shrink-0 w-44">
          {withSubscripts(t('ch1_9.widget.impedance.ratioLabel'))}
        </span>
        {RATIO_PRESETS.map((p, i) => (
          <button
            key={p.label}
            type="button"
            aria-pressed={presetIdx === i}
            onClick={() => setPresetIdx(i)}
            className={`px-3 py-1 rounded border cursor-pointer transition-colors font-mono ${
              presetIdx === i
                ? 'border-primary bg-primary/10 text-foreground'
                : 'border-border text-muted-foreground hover:text-foreground'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Outputs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <ResultBox tone="success" label={withSubscripts(t('ch1_9.widget.impedance.zpReadout'))}>
          <p className="text-xl font-mono font-semibold text-foreground">
            {zpOut.display} {tUnit(zpOut.unitKey)}
          </p>
        </ResultBox>
        <ResultBox tone="info" label={t('ch1_9.widget.impedance.ratioSquaredReadout')}>
          <p className="text-xl font-mono font-semibold text-foreground">
            {ratioSqDisp}
          </p>
        </ResultBox>
        <ResultBox tone={swrIsGood ? 'success' : 'warn'} label={t('ch1_9.widget.impedance.swrReadout')}>
          <p className="text-xl font-mono font-semibold text-foreground">
            {swrDisplay}
          </p>
          <p className="text-[12px] text-muted-foreground">
            {swrIsGood
              ? t('ch1_9.widget.impedance.swrGood')
              : t('ch1_9.widget.impedance.swrPoor')}
          </p>
        </ResultBox>
      </div>

      <p className="text-[13px] text-muted-foreground">
        {t('ch1_9.widget.impedance.hint')}
      </p>
    </Widget>
  )
}
