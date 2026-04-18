import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { scaleLinear, scaleLog } from '@visx/scale'
import { AxisBottom, AxisLeft } from '@visx/axis'
import { GridColumns, GridRows } from '@visx/grid'
import { LinePath } from '@visx/shape'
import { Group } from '@visx/group'
import Widget from '@/components/ui/widget'
import { Slider } from '@/components/ui/slider'
import { ResultBox } from '@/components/ui/result-box'
import SVGDiagram from '@/components/diagrams/SVGDiagram'
import { M } from '@/components/ui/math'
import { cn } from '@/lib/utils'
import { formatHz } from '@/lib/format'
import { useLocaleFormatter, useUnitFormatter } from '@/lib/hooks/useLocaleFormatter'
import { useClipPathId } from '@/lib/hooks/useClipPathId'

/**
 * Chapter 0.4 — Log axis vs Linear axis demo
 *
 * Plots the magnitude response of a first-order RC low-pass filter:
 *   |H(f)| = 1 / √(1 + (f/fc)²)
 *   Gain(dB) = 20·log₁₀|H| = −10·log₁₀(1 + (f/fc)²)
 *
 * The user toggles between a linear and a logarithmic frequency axis.
 * On the linear axis the entire interesting roll-off is squashed against
 * the left edge; on the log axis it spreads out into the textbook
 * "−20 dB per decade" straight line. A draggable cutoff slider drives
 * home that the *shape* is invariant — only its position shifts.
 *
 * Plotting uses visx for scales / axes / grid / line primitives so the
 * shared machinery (log<->linear scales, tick generators, dashed grids,
 * i18n-aware tick labels) is battle-tested instead of hand-rolled.
 */

type Axis = 'linear' | 'log'

const F_MIN = 1            // Hz — leftmost tick
const F_MAX = 1_000_000    // Hz — rightmost tick (six decades)
const DB_MIN = -60          // bottom of plot
const DB_MAX = 5           // a hair above 0 so the flat passband shows

// Cutoff slider lives on a log scale: log10(fc) from 2 (100 Hz) to 5 (100 kHz).
const FC_LOG_MIN = 2
const FC_LOG_MAX = 5
const FC_LOG_STEP = 0.05

/** RC low-pass gain at frequency f, with cutoff fc, in dB. */
function gainDb(f: number, fc: number): number {
  if (f <= 0) return 0
  return -10 * Math.log10(1 + (f / fc) ** 2)
}

type Sample = { f: number; db: number }

export default function LogAxisToggle() {
  const { t } = useTranslation('ui')
  const { locale } = useLocaleFormatter()
  const tUnit = useUnitFormatter()
  const [axis, setAxis] = useState<Axis>('log')
  // Slider value is log10(fc). Default 1 kHz → 3.0
  const [fcLog, setFcLog] = useState<number>(3)
  const fc = useMemo(() => Math.pow(10, fcLog), [fcLog])

  // Unique id per widget instance so the <clipPath> doesn't collide if
  // the page mounts multiple LogAxisToggle widgets.
  const clipId = useClipPathId('logaxis-plot')

  // ── Plot geometry ──────────────────────────────────────────────────
  // PAD_R must clear the half-width of the rightmost tick label, which
  // is "1.00 MHz" centred on x = PAD_L + plotW. At fontSize 10 sans
  // that text is ≈ 38 px wide → 19 px half-width. PAD_R = 32 leaves
  // ~13 px between the label's right edge and the canvas edge.
  // PAD_L must clear the Y-tick labels ("−60" ≈ 18 px @ fontSize 10,
  // anchored at PAD_L − 6) plus the rotated "Gain (dB)" axis title at
  // x ≈ 14. PAD_L = 50 covers both with room to spare.
  const W = 560, H = 280
  const PAD_L = 50, PAD_R = 32, PAD_T = 18, PAD_B = 42
  const plotW = W - PAD_L - PAD_R
  const plotH = H - PAD_T - PAD_B

  // ── Scales (visx) ──────────────────────────────────────────────────
  // scaleLog's domain must be strictly positive; scaleLinear starts at 0.
  // Both map into the plot-local coordinate space (0..plotW), then we
  // shift into canvas space with <Group left={PAD_L} top={PAD_T}>.
  const xScale = useMemo(() => {
    if (axis === 'log') {
      return scaleLog<number>({
        domain: [F_MIN, F_MAX],
        range: [0, plotW],
        base: 10,
      })
    }
    return scaleLinear<number>({
      domain: [0, F_MAX],
      range: [0, plotW],
    })
  }, [axis, plotW])

  const yScale = useMemo(() =>
    scaleLinear<number>({
      domain: [DB_MIN, DB_MAX],
      range: [plotH, 0], // inverted — top of plot is DB_MAX
    }),
  [plotH])

  // ── Curve sampling ─────────────────────────────────────────────────
  // For log axis: uniform in log10(f). For linear axis: uniform in f.
  // The linear axis needs many samples near zero where the curve bends
  // sharply, hence the higher count.
  //
  // OUT-OF-RANGE HANDLING: the RC roll-off can dive far below DB_MIN at
  // high frequencies (e.g. −80 dB at 1 MHz with fc = 316 Hz). We do NOT
  // clamp db to the floor — that produces a fake horizontal plateau that
  // reads as "the filter has a flat −60 dB response here" when really the
  // response is continuing to drop. Instead we TRUNCATE: the moment a
  // sample falls below the floor, we linearly interpolate the exact
  // crossing point on the boundary, emit one final sample at DB_MIN, and
  // stop. Visually the curve exits through the bottom edge — the honest
  // "off the chart" indicator. Because the response is monotonic we can
  // safely break out of the loop after the first crossing.
  //
  // visx's <LinePath> draws whatever samples we feed it; it does not
  // know about plot boundaries. So the truncation logic stays here and
  // is exactly the same as the pre-visx version — just operating on
  // {f, db} data-space pairs instead of pre-transformed {x, y} pixels.
  const points = useMemo<Sample[]>(() => {
    const N = axis === 'log' ? 240 : 1200
    const out: Sample[] = []
    let prevDb: number | null = null
    let prevF: number | null = null
    for (let i = 0; i <= N; i++) {
      const f = axis === 'log'
        ? Math.pow(10, Math.log10(F_MIN) + (i / N) * (Math.log10(F_MAX) - Math.log10(F_MIN)))
        : (i / N) * F_MAX
      const db = gainDb(Math.max(f, F_MIN), fc)
      if (db < DB_MIN) {
        if (prevDb !== null && prevF !== null) {
          const tCross = (DB_MIN - prevDb) / (db - prevDb)
          const fCross = prevF + tCross * (f - prevF)
          out.push({ f: fCross, db: DB_MIN })
        }
        break
      }
      out.push({ f, db })
      prevDb = db
      prevF = f
    }
    return out
  }, [axis, fc])

  // ── Tick definitions ──────────────────────────────────────────────
  const logTicks = [1, 10, 100, 1_000, 10_000, 100_000, 1_000_000]
  const linearTicks = [0, 200_000, 400_000, 600_000, 800_000, 1_000_000]
  const xTicks = axis === 'log' ? logTicks : linearTicks
  const yTicks = [0, -10, -20, -30, -40, -50, -60]

  // Cutoff marker position — in plot-local coordinates, so we can render
  // it inside the same <Group left={PAD_L} top={PAD_T}> as the plot.
  const cutoffX = xScale(fc)
  const cutoffY = yScale(-3)
  const cutoffVisible = cutoffX >= 0 && cutoffX <= plotW

  return (
    <Widget
      title={t('ch0_4.logAxisToggleTitle')}
      description={t('ch0_4.logAxisToggleDescription')}
    >
      {/* ── Plain-language explainer ───────────────────────────────── */}
      <div className="rounded-lg border border-callout-note/30 bg-callout-note/5 p-3 space-y-2 text-sm text-foreground">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {t('ch0_4.logAxisToggleAboutTitle')}
        </p>
        <p>
          <strong>{t('ch0_4.logAxisToggleAboutFilterTitle')}</strong>
          {' — '}
          {t('ch0_4.logAxisToggleAboutFilterBody')}
        </p>
        <p>
          <strong>{t('ch0_4.logAxisToggleAboutCutoffTitle')}</strong>
          {' ('}<M tex="f_c" />{') — '}
          {t('ch0_4.logAxisToggleAboutCutoffBody')}
        </p>
        <p>
          <strong>{t('ch0_4.logAxisToggleAboutReadingTitle')}</strong>
          {' — '}
          {t('ch0_4.logAxisToggleAboutReadingBody')}
        </p>
      </div>

      {/* ── Axis toggle ───────────────────────────────────────────── */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-foreground">
          {t('ch0_4.logAxisToggleAxisLabel')}
        </p>
        <div
          role="tablist"
          aria-label={t('ch0_4.logAxisToggleAxisLabel')}
          className="inline-flex rounded-lg border border-border bg-muted/40 p-0.5"
        >
          {(['linear', 'log'] as const).map((mode) => (
            <button
              key={mode}
              role="tab"
              aria-selected={axis === mode}
              onClick={() => setAxis(mode)}
              className={cn(
                'px-4 py-1.5 text-sm rounded-md transition-colors',
                axis === mode
                  ? 'bg-background text-foreground shadow-sm font-medium'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {mode === 'linear'
                ? t('ch0_4.logAxisToggleLinear')
                : t('ch0_4.logAxisToggleLog')}
            </button>
          ))}
        </div>
      </div>

      {/* ── Cutoff slider ─────────────────────────────────────────── */}
      <div className="space-y-2">
        <div className="flex items-baseline justify-between">
          <label
            htmlFor="logaxis-fc"
            className="text-sm font-medium text-foreground inline-flex items-baseline gap-1.5"
          >
            {t('ch0_4.logAxisToggleCutoffLabel')}
            <M tex="f_c" />
          </label>
          <span className="font-mono text-sm text-foreground">
            {formatHz(fc, tUnit, locale)}
            <span className="ml-2 text-xs text-muted-foreground">
              {t('ch0_4.logAxisToggleCutoffHint')}
            </span>
          </span>
        </div>
        <Slider
          id="logaxis-fc"
          min={FC_LOG_MIN}
          max={FC_LOG_MAX}
          step={FC_LOG_STEP}
          value={[fcLog]}
          onValueChange={(v) => setFcLog(v[0])}
          aria-label={t('ch0_4.logAxisToggleCutoffLabel')}
        />
      </div>

      {/* ── Plot ──────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-border bg-muted/30 p-2">
        <SVGDiagram
          width={W}
          height={H}
          aria-label={t('ch0_4.logAxisToggleAria')}
          fontFamily="inherit"
          style={{ maxWidth: W, margin: '0 auto' }}
        >
          {/* Clip path so the response curve can never escape the plot
              rectangle even if a sample lands just past DB_MIN. */}
          <defs>
            <clipPath id={clipId}>
              <rect x={0} y={0} width={plotW} height={plotH} />
            </clipPath>
          </defs>

          <Group left={PAD_L} top={PAD_T}>
            {/* Plot background */}
            <rect
              x={0} y={0} width={plotW} height={plotH}
              fill="hsl(var(--background))"
              stroke="hsl(var(--border))"
              strokeWidth={1}
            />

            {/* Dashed grid */}
            <GridRows
              scale={yScale}
              width={plotW}
              tickValues={yTicks.filter((db) => db !== 0)}
              stroke="hsl(var(--border))"
              strokeDasharray="2 3"
              strokeOpacity={0.4}
            />
            <GridColumns
              scale={xScale}
              height={plotH}
              tickValues={xTicks}
              stroke="hsl(var(--border))"
              strokeDasharray="2 3"
              strokeOpacity={0.4}
            />

            {/* Solid 0 dB reference line (emphasised separately) */}
            <line
              x1={0} x2={plotW}
              y1={yScale(0)} y2={yScale(0)}
              stroke="hsl(var(--border))"
              strokeWidth={0.6}
              opacity={0.7}
            />

            {/* Axes */}
            <AxisBottom
              top={plotH}
              scale={xScale}
              tickValues={xTicks}
              tickFormat={(v) => formatHz(Number(v), tUnit, locale)}
              hideAxisLine
              tickStroke="hsl(var(--border))"
              tickLength={3}
              tickLabelProps={{
                fill: 'hsl(var(--muted-foreground))',
                fontSize: 10,
                textAnchor: 'middle',
                dy: '0.25em',
              }}
            />
            <AxisLeft
              scale={yScale}
              tickValues={yTicks}
              tickFormat={(v) => String(Number(v))}
              hideAxisLine
              tickStroke="hsl(var(--border))"
              tickLength={3}
              tickLabelProps={{
                fill: 'hsl(var(--muted-foreground))',
                fontSize: 10,
                textAnchor: 'end',
                dx: '-0.25em',
                dy: '0.33em',
              }}
            />

            {/* Cutoff marker (vertical line + −3 dB dot) */}
            {cutoffVisible && (
              <g>
                <line
                  x1={cutoffX} y1={0} x2={cutoffX} y2={plotH}
                  stroke="hsl(var(--callout-key))"
                  strokeWidth={1.2}
                  strokeDasharray="4 3"
                  opacity={0.85}
                />
                <circle
                  cx={cutoffX} cy={cutoffY} r={3.5}
                  fill="hsl(var(--callout-key))"
                />
                {/* KaTeX can't render inside SVG, so we fake the `f_c`
                    subscript with <tspan>. */}
                <text
                  x={cutoffX + 6} y={cutoffY - 6}
                  fontSize={11}
                  fill="hsl(var(--callout-key))"
                  fontWeight={600}
                >
                  <tspan fontStyle="italic">f</tspan>
                  <tspan dy="3" fontSize={8}>c</tspan>
                  <tspan dy="-3" fontStyle="normal"> · −3 {tUnit('db')}</tspan>
                </text>
              </g>
            )}

            {/* The response curve — clipped to the plot rect. */}
            <LinePath<Sample>
              data={points}
              x={(d) => xScale(d.f)}
              y={(d) => yScale(d.db)}
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
              clipPath={`url(#${clipId})`}
            />
          </Group>

          {/* Axis titles — in canvas space (outside the Group) */}
          <text
            x={PAD_L + plotW / 2} y={H - 6}
            textAnchor="middle" fontSize={10.5}
            fill="hsl(var(--foreground))"
          >
            {t('ch0_4.logAxisToggleAxisXLabel')}
          </text>
          <text
            transform={`translate(14 ${PAD_T + plotH / 2}) rotate(-90)`}
            textAnchor="middle" fontSize={10.5}
            fill="hsl(var(--foreground))"
          >
            {t('ch0_4.logAxisToggleAxisYLabel')}
          </text>
        </SVGDiagram>
      </div>

      {/* ── Hint / takeaway ───────────────────────────────────────── */}
      <ResultBox tone="info" className="p-3">
        <p className="text-sm text-foreground">
          {t('ch0_4.logAxisToggleHint')}
        </p>
      </ResultBox>
    </Widget>
  )
}
