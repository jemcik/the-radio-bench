/**
 * Chapter 4.5 §5 — what your own qualification may actually use.
 *
 * Pick a qualification, read your bands. That is the question a newly licensed
 * reader actually has, and answering it from the Регламент means cross-
 * referencing a forty-row table by hand — the widget does that lookup.
 *
 * ── Source ─────────────────────────────────────────────────────────────
 * Регламент аматорського радіозв'язку України (постанова НКЕК від 10.05.2023
 * № 173), додаток 2, таблиця 12. Every segment below is quoted from it.
 *
 * ── Why the data is SEGMENTS, not bands ────────────────────────────────
 * The first version stored one row per band with the widest span on it, and
 * then flagged «upper part class A only» underneath. That was the wrong shape:
 * a reader who has already chosen qualification B was still shown 7.000–7.200
 * and then told, in a footnote, that part of what they were looking at is not
 * theirs. Choosing a qualification has to change the numbers, not annotate
 * them.
 *
 * So таблиця 12 is transcribed segment by segment, as it is actually written,
 * and the row for a band is DERIVED: the span shown is the union of the
 * segments that qualification may use, and the power is the highest it may run
 * anywhere in that band. Nothing that is not yours appears on your screen.
 *
 * Where a qualification's segments are not contiguous, the span is the outer
 * edge of what it may use, and the footnote says the permitted modes vary
 * inside it — which is true of every qualification, not a caveat about one.
 *
 * `null` power means no access to that segment at all.
 */
import { useMemo, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import Widget from '@/components/ui/widget'
import { mathComponents } from '@/lib/trans-defaults'

type Qual = 'a' | 'b' | 'c'

type Segment = {
  /** Lower and upper edge in MHz, exactly as таблиця 12 prints them. */
  from: number
  to: number
  status: 'primary' | 'secondary'
  /** Highest permitted transmitter output in watts; null = no access. */
  w: Record<Qual, number | null>
}

type Band = { key: string; segments: Segment[] }

/** Transcribed from таблиця 12. Beacon-only (IBP) rows carry no power for
 *  anyone and are omitted — they are not a privilege of any qualification. */
const BANDS: Band[] = [
  { key: 'b160', segments: [
    { from: 1.810, to: 1.840, status: 'primary',   w: { a: 100, b: 50, c: 5 } },
    { from: 1.840, to: 1.850, status: 'primary',   w: { a: 100, b: 50, c: null } },
    { from: 1.850, to: 2.000, status: 'secondary', w: { a: 10,  b: 5,  c: 5 } },
  ] },
  { key: 'b80', segments: [
    { from: 3.500, to: 3.650, status: 'primary', w: { a: 200, b: 100, c: 40 } },
    { from: 3.650, to: 3.700, status: 'primary', w: { a: 200, b: 100, c: null } },
    { from: 3.700, to: 3.800, status: 'primary', w: { a: 200, b: null, c: null } },
  ] },
  { key: 'b40', segments: [
    { from: 7.000, to: 7.100, status: 'primary', w: { a: 200, b: 100, c: 40 } },
    { from: 7.100, to: 7.200, status: 'primary', w: { a: 200, b: null, c: null } },
  ] },
  { key: 'b30', segments: [
    { from: 10.100, to: 10.150, status: 'secondary', w: { a: 200, b: 100, c: 40 } },
  ] },
  { key: 'b20', segments: [
    { from: 14.000, to: 14.250, status: 'primary', w: { a: 200, b: 100, c: null } },
    { from: 14.250, to: 14.350, status: 'primary', w: { a: 200, b: null, c: null } },
  ] },
  { key: 'b17', segments: [
    { from: 18.068, to: 18.168, status: 'primary', w: { a: 200, b: 100, c: 40 } },
  ] },
  { key: 'b15', segments: [
    { from: 21.000, to: 21.450, status: 'primary', w: { a: 200, b: 100, c: 40 } },
  ] },
  { key: 'b12', segments: [
    { from: 24.890, to: 24.990, status: 'primary', w: { a: 200, b: 100, c: 40 } },
  ] },
  { key: 'b10', segments: [
    { from: 28.000, to: 29.700, status: 'primary', w: { a: 200, b: 100, c: 40 } },
  ] },
  { key: 'b6', segments: [
    { from: 50.000, to: 52.000, status: 'secondary', w: { a: 50, b: null, c: null } },
  ] },
  { key: 'b2', segments: [
    { from: 144.000, to: 146.000, status: 'primary', w: { a: 5, b: 5, c: 5 } },
  ] },
  { key: 'b70', segments: [
    { from: 430.000, to: 440.000, status: 'primary', w: { a: 5, b: 5, c: 5 } },
  ] },
]

const QUALS: Qual[] = ['a', 'b', 'c']

/** Print an edge the way таблиця 12 does: three decimals below 100 MHz. */
function edge(mhz: number): string {
  return mhz >= 100 ? mhz.toFixed(3) : mhz.toFixed(3)
}

/** What this qualification actually gets on this band, or null for nothing. */
function entitlement(band: Band, q: Qual) {
  const mine = band.segments.filter(s => s.w[q] !== null)
  if (mine.length === 0) return null
  return {
    span: `${edge(Math.min(...mine.map(s => s.from)))}–${edge(Math.max(...mine.map(s => s.to)))}`,
    watts: Math.max(...mine.map(s => s.w[q] as number)),
    // Secondary only when EVERY segment this qualification may use is secondary;
    // mixed bands are reported as mixed rather than rounded either way.
    status: mine.every(s => s.status === 'secondary')
      ? 'secondary'
      : mine.every(s => s.status === 'primary')
        ? 'primary'
        : 'mixed',
  }
}

export default function BandPrivilegeExplorer() {
  const { t } = useTranslation('ui')
  const [qual, setQual] = useState<Qual>('b')

  const rows = useMemo(
    () => BANDS.map(band => ({ band, mine: entitlement(band, qual) })),
    [qual],
  )
  const open = rows.filter(r => r.mine !== null)
  const highest = Math.max(...open.map(r => r.mine!.watts))

  return (
    <Widget
      title={t('ch4_5.bands.title')}
      description={
        <Trans i18nKey="ch4_5.bands.description" ns="ui" components={{ ...mathComponents }} />
      }
    >
      <fieldset className="flex flex-col gap-1">
        <legend className="text-foreground font-medium text-sm mb-1">
          {t('ch4_5.bands.classLegend')}
        </legend>
        <div className="flex flex-wrap gap-2">
          {QUALS.map(q => (
            <button
              key={q}
              type="button"
              aria-pressed={qual === q}
              onClick={() => setQual(q)}
              className={
                'rounded border px-3 py-1.5 text-sm transition-colors ' +
                (qual === q
                  ? 'border-[hsl(var(--term-accent))] bg-[hsl(var(--term-accent))]/10 text-foreground font-medium'
                  : 'border-border text-muted-foreground hover:text-foreground')
              }
            >
              {t(`ch4_5.bands.class_${q}`)}
            </button>
          ))}
        </div>
      </fieldset>

      <p className="text-sm text-muted-foreground mt-1">
        <Trans
          i18nKey="ch4_5.bands.summary"
          ns="ui"
          values={{ count: open.length, total: BANDS.length, watts: highest }}
          components={{ ...mathComponents, strong: <strong /> }}
        />
      </p>

      <div className="overflow-x-auto not-prose">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-border text-left">
              <th scope="col" className="py-1.5 pr-3 font-medium text-foreground">
                {t('ch4_5.bands.hBand')}
              </th>
              <th scope="col" className="py-1.5 pr-3 font-medium text-foreground">
                {t('ch4_5.bands.hSpan')}
              </th>
              <th scope="col" className="py-1.5 pr-3 font-medium text-foreground">
                {t('ch4_5.bands.hStatus')}
              </th>
              <th scope="col" className="py-1.5 font-medium text-foreground">
                {t('ch4_5.bands.hPower')}
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ band, mine }) => (
              <tr
                key={band.key}
                className={
                  'border-b border-border/50 ' +
                  (mine ? 'text-foreground' : 'text-muted-foreground/60')
                }
              >
                <th scope="row" className="py-1.5 pr-3 font-normal text-left">
                  {t(`ch4_5.bands.${band.key}`)}
                </th>
                <td className="py-1.5 pr-3 tabular-nums">
                  {mine ? mine.span : t('ch4_5.bands.noAccess')}
                </td>
                <td className="py-1.5 pr-3">
                  {mine ? t(`ch4_5.bands.status_${mine.status}`) : t('ch4_5.bands.noAccess')}
                </td>
                <td className="py-1.5 tabular-nums">
                  {mine ? `${mine.watts} ${t('units.w')}` : t('ch4_5.bands.noAccess')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-[13px] text-muted-foreground">
        <Trans i18nKey="ch4_5.bands.footnote" ns="ui" components={{ ...mathComponents }} />
      </p>
    </Widget>
  )
}
