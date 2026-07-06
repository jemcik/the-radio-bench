/**
 * Chapter 4.1 §3 — MUF & skip explorer.
 *
 * Two linked ideas, kept deliberately simple for a novice audience:
 *
 *  A) Skip distance from take-off angle and virtual layer height, flat-earth
 *     single-hop geometry:   D = 2·h / tan(α)   (capped near one-hop max, ~4000 km)
 *
 *  B) The MUF window from the critical frequency and the path length:
 *     MUF = foF2 · M   where the M-factor grows as the path lengthens
 *     (take-off angle lowers). Typical F2 M-factors: ~1.3 short, ~2.2 medium,
 *     ~3.3 for a low-angle DX path.
 *
 * cf. ARRL Handbook 2023, propagation chapter; ITU-R P.1240 (MUF/secant law).
 */
import { useMemo, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import Widget from '@/components/ui/widget'
import { ResultBox } from '@/components/ui/result-box'
import { mathComponents } from '@/lib/trans-defaults'
import { useLocaleFormatter, useUnitFormatter } from '@/lib/hooks/useLocaleFormatter'

const ONE_HOP_CAP_KM = 4000

// Amateur band centres used for the "which bands are open" chips (MHz).
const BANDS: Array<{ name: string; f: number }> = [
  { name: '80 m', f: 3.65 },
  { name: '40 m', f: 7.1 },
  { name: '20 m', f: 14.2 },
  { name: '15 m', f: 21.2 },
  { name: '10 m', f: 28.5 },
]

const PATHS: Array<{ key: 'pathShort' | 'pathMedium' | 'pathDx'; m: number }> = [
  { key: 'pathShort', m: 1.3 },
  { key: 'pathMedium', m: 2.2 },
  { key: 'pathDx', m: 3.3 },
]

function parseValue(s: string): number {
  const n = Number.parseFloat(s.replace(',', '.').trim())
  return Number.isFinite(n) && n > 0 ? n : 0
}

function skipDistanceKm(angleDeg: number, heightKm: number): { dist: number; capped: boolean } {
  const raw = (2 * heightKm) / Math.tan((angleDeg * Math.PI) / 180)
  return raw >= ONE_HOP_CAP_KM ? { dist: ONE_HOP_CAP_KM, capped: true } : { dist: raw, capped: false }
}

export default function MufSkipExplorer() {
  const { t } = useTranslation('ui')
  const { num, fmt } = useLocaleFormatter()
  const tUnit = useUnitFormatter()

  const [angle, setAngle] = useState(15)
  const [height, setHeight] = useState(300)
  const [cfDisp, setCfDisp] = useState('6')
  const [pathIdx, setPathIdx] = useState(2) // default: DX (low angle)

  const { dist, capped } = useMemo(() => skipDistanceKm(angle, height), [angle, height])
  const muf = useMemo(() => parseValue(cfDisp) * PATHS[pathIdx].m, [cfDisp, pathIdx])

  return (
    <Widget
      title={t('ch4_1.mufSkip.title')}
      description={<Trans i18nKey="ch4_1.mufSkip.description" ns="ui" components={{ ...mathComponents }} />}
    >
      {/* ── Panel A — skip distance ─────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <label htmlFor="muf-angle" className="text-foreground font-medium shrink-0 w-40">
          {t('ch4_1.mufSkip.angleLabel')}
        </label>
        <input
          id="muf-angle"
          type="range"
          min={3}
          max={45}
          step={1}
          value={angle}
          onChange={e => setAngle(Number(e.target.value))}
          className="flex-1 min-w-[160px] accent-primary"
        />
        <span className="font-mono text-foreground w-12 text-right shrink-0">{num(angle)}°</span>
      </div>

      <div className="flex flex-wrap items-center gap-3 text-sm">
        <label htmlFor="muf-height" className="text-foreground font-medium shrink-0 w-40">
          {t('ch4_1.mufSkip.heightLabel')}
        </label>
        <input
          id="muf-height"
          type="range"
          min={100}
          max={400}
          step={10}
          value={height}
          onChange={e => setHeight(Number(e.target.value))}
          className="flex-1 min-w-[160px] accent-primary"
        />
        <span className="font-mono text-foreground w-20 text-right shrink-0">
          {num(height)} {tUnit('km')}
        </span>
      </div>

      <ResultBox tone="primary" label={t('ch4_1.mufSkip.skipOut')}>
        <p className="text-2xl font-mono font-semibold text-foreground">
          {num(Math.round(dist))} {tUnit('km')}
        </p>
        {capped && <p className="text-[13px] text-muted-foreground mt-1">{t('ch4_1.mufSkip.skipCapNote')}</p>}
      </ResultBox>

      {/* ── Panel B — MUF window ────────────────────────────────── */}
      <div className="flex flex-wrap items-end gap-4 text-sm pt-2 border-t border-border/50">
        <div className="flex flex-col gap-1">
          <label htmlFor="muf-cf" className="text-foreground font-medium">
            {t('ch4_1.mufSkip.cfLabel')}
          </label>
          <div className="flex items-center gap-2">
            <input
              id="muf-cf"
              type="number"
              inputMode="decimal"
              step="any"
              min="0"
              value={cfDisp}
              onChange={e => setCfDisp(e.target.value)}
              className="border border-border rounded px-2 py-1 bg-background text-foreground w-24 font-mono"
            />
            <span className="text-muted-foreground">{tUnit('mhz')}</span>
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-foreground font-medium">{t('ch4_1.mufSkip.pathLabel')}</span>
          <div className="flex gap-1">
            {PATHS.map((p, i) => (
              <button
                key={p.key}
                type="button"
                onClick={() => setPathIdx(i)}
                aria-pressed={pathIdx === i}
                className={`border rounded px-2 py-1 text-[13px] ${
                  pathIdx === i
                    ? 'border-primary bg-primary/10 text-foreground font-medium'
                    : 'border-border bg-background text-muted-foreground hover:bg-muted'
                }`}
              >
                {t(`ch4_1.mufSkip.${p.key}`)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <ResultBox tone="info" label={t('ch4_1.mufSkip.mufOut')}>
        <p className="text-2xl font-mono font-semibold text-foreground">
          {fmt(muf, 2)} {tUnit('mhz')}
        </p>
      </ResultBox>

      <div className="text-sm">
        <p className="text-muted-foreground mb-2">{t('ch4_1.mufSkip.bandsLabel')}</p>
        <div className="flex flex-wrap gap-2">
          {BANDS.map(b => {
            const open = b.f <= muf
            return (
              <span
                key={b.name}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[13px] font-mono border ${
                  open
                    ? 'border-callout-experiment/40 bg-callout-experiment/[0.08] text-foreground'
                    : 'border-border bg-muted/50 text-muted-foreground line-through'
                }`}
                title={open ? t('ch4_1.mufSkip.bandOpen') : t('ch4_1.mufSkip.bandClosed')}
              >
                {b.name}
              </span>
            )
          })}
        </div>
      </div>

      <p className="text-[13px] text-muted-foreground">{t('ch4_1.mufSkip.note')}</p>
    </Widget>
  )
}
