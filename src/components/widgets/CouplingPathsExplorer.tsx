/**
 * Chapter 4.2 §3 — the four coupling paths, interactive.
 *
 * A scene: your station (left) and a neighbour's gear (right). Interference
 * can travel between them by four routes — into the victim's antenna input,
 * along the mains, along audio / connecting leads (common-mode current on the
 * cable), or by direct radiation into the case. Pick a route; it lights up and
 * flows, the others dim, and the panel names how the energy gets in and the
 * cure that breaks THAT link.
 *
 * ERC 32 §9.2 coupling routes; mechanisms per ARRL Handbook 2023 ch27 (§27.2.3,
 * §27.4.1). The animated flow respects prefers-reduced-motion.
 */
import { useEffect, useRef, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import Widget from '@/components/ui/widget'
import { ResultBox } from '@/components/ui/result-box'
import { mathComponents } from '@/lib/trans-defaults'
import { svgTokens } from '@/components/diagrams/svgTokens'

const VB_W = 580
const VB_H = 270
const SANS = 'ui-sans-serif, system-ui, sans-serif'

// The four coupling routes, each a path from source-side to the victim.
const PATHS = [
  // All three radiated routes leave YOUR antenna (the whip at x≈56) and couple
  // differently at the victim — aerial, case, speaker lead; the mains route
  // leaves the station's power side. None starts «from thin air».
  // `badge` is only a static fallback (jsdom has no path geometry); in the
  // browser the badge is placed ON the line at its length-midpoint — see the
  // getPointAtLength effect — so every badge sits exactly on its own path.
  { key: 'antenna', d: 'M 56 48 C 190 8, 380 24, 508 70', badge: [284, 27] },
  { key: 'direct', d: 'M 56 98 C 220 120, 340 128, 438 134', badge: [272, 122] },
  { key: 'leads', d: 'M 58 128 C 160 165, 320 200, 392 202', badge: [236, 178] },
  { key: 'mains', d: 'M 56 182 L 56 244 L 500 244 L 500 168', badge: [285, 244] },
] as const

type PathKey = (typeof PATHS)[number]['key']

export default function CouplingPathsExplorer() {
  const { t } = useTranslation('ui')
  const [selected, setSelected] = useState<PathKey>('antenna')
  const [dash, setDash] = useState(0)
  const pathEls = useRef<(SVGPathElement | null)[]>([])
  const [badgePos, setBadgePos] = useState<ReadonlyArray<readonly [number, number]>>(
    () => PATHS.map(p => p.badge),
  )

  // Place each numbered badge exactly on its own line, at the path's
  // length-midpoint — never hand-place, so a badge can't drift off the wire
  // when a path's `d` is later tweaked. jsdom has no SVG geometry engine, so
  // the effect is a no-op there and the static `badge` fallback stands.
  useEffect(() => {
    try {
      const next = pathEls.current.map((el, i) => {
        if (!el || typeof el.getTotalLength !== 'function') return PATHS[i].badge
        const L = el.getTotalLength()
        if (!L || !Number.isFinite(L)) return PATHS[i].badge
        const pt = el.getPointAtLength(L / 2)
        return [Math.round(pt.x), Math.round(pt.y)] as [number, number]
      })
      setBadgePos(next)
    } catch {
      /* no SVG geometry (jsdom) — keep the static fallback badges */
    }
  }, [])

  // Flowing dash on the selected path — energy travelling source → victim.
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (mq.matches) return
    let raf = 0
    let t0: number | null = null
    const loop = (ts: number) => {
      if (t0 === null) t0 = ts
      setDash(-((ts - t0) / 1000) * 22)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <Widget
      title={t('ch4_2.coupling.title')}
      description={<Trans i18nKey="ch4_2.coupling.description" ns="ui" components={{ ...mathComponents }} />}
    >
      <div className="overflow-x-auto">
        <svg
          width={VB_W}
          height={VB_H}
          viewBox={`0 0 ${VB_W} ${VB_H}`}
          role="img"
          aria-label={t('ch4_2.coupling.ariaLabel')}
          style={{ display: 'block', margin: '0 auto', maxWidth: '100%', height: 'auto' }}
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* ── Your station (left) ── */}
          <g stroke={svgTokens.fg} fill="none" opacity={0.75}>
            <line x1={34} y1={48} x2={78} y2={48} strokeWidth={1.8} />
            <line x1={56} y1={48} x2={56} y2={150} strokeWidth={1.8} />
            <rect x={30} y={150} width={52} height={32} rx={3} strokeWidth={1.6} />
            <circle cx={44} cy={166} r={5} strokeWidth={1.3} />
          </g>

          {/* ── Neighbour's gear (right): TV + audio box ── */}
          <g stroke={svgTokens.fg} fill="none" opacity={0.75}>
            {/* rabbit ears */}
            <line x1={488} y1={98} x2={472} y2={72} strokeWidth={1.5} />
            <line x1={488} y1={98} x2={508} y2={70} strokeWidth={1.5} />
            {/* TV */}
            <rect x={436} y={98} width={104} height={70} rx={6} strokeWidth={1.7} />
            <rect x={446} y={108} width={84} height={46} rx={2} strokeWidth={1.1} opacity={0.7} />
            {/* audio device (below the TV) with a speaker driver and a lead
                cable running left — the «leads» path lands ON that cable. */}
            <rect x={430} y={188} width={54} height={28} rx={3} strokeWidth={1.5} />
            <circle cx={470} cy={202} r={5.5} strokeWidth={1.2} opacity={0.7} />
            <line x1={430} y1={202} x2={372} y2={202} strokeWidth={1.4} />
          </g>

          {/* mains rail (context for the mains route) */}
          <line x1={40} y1={244} x2={520} y2={244} stroke={svgTokens.border} strokeWidth={1.4} strokeDasharray="1 4" />

          {/* ── The four coupling paths ── */}
          {PATHS.map((p, i) => {
            const on = p.key === selected
            return (
              <path
                key={p.key}
                ref={el => { pathEls.current[i] = el }}
                d={p.d}
                fill="none"
                stroke={on ? svgTokens.primary : svgTokens.fg}
                strokeWidth={on ? 3 : 1.6}
                strokeOpacity={on ? 1 : 0.22}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray={on ? '8 8' : undefined}
                strokeDashoffset={on ? dash : undefined}
              />
            )
          })}

          {/* numbered badges mapping paths ↔ buttons — placed ON each line */}
          {PATHS.map((p, i) => {
            const on = p.key === selected
            const [bx, by] = badgePos[i]
            return (
              <g key={`b-${p.key}`}>
                <circle
                  cx={bx}
                  cy={by}
                  r={9.5}
                  fill="hsl(var(--background))"
                  stroke={on ? svgTokens.primary : svgTokens.mutedFg}
                  strokeWidth={on ? 2 : 1.3}
                />
                <text
                  x={bx}
                  y={by + 4}
                  fontSize="12.5"
                  fontWeight={700}
                  textAnchor="middle"
                  fill={on ? svgTokens.primary : svgTokens.mutedFg}
                  fontFamily={SANS}
                >
                  {i + 1}
                </text>
              </g>
            )
          })}

          {/* side labels */}
          <text x={56} y={264} fontSize="13" fontWeight={600} textAnchor="middle" fill={svgTokens.fg} fontFamily={SANS}>
            {t('ch4_2.coupling.yourStation')}
          </text>
          <text x={486} y={264} fontSize="13" fontWeight={600} textAnchor="middle" fill={svgTokens.fg} fontFamily={SANS}>
            {t('ch4_2.coupling.neighbour')}
          </text>
        </svg>
      </div>

      {/* route selector */}
      <div className="flex flex-wrap gap-2">
        {PATHS.map((p, i) => {
          const on = p.key === selected
          return (
            <button
              key={p.key}
              type="button"
              onClick={() => setSelected(p.key)}
              aria-pressed={on}
              className={`inline-flex items-center gap-2 border rounded px-3 py-1.5 text-[13px] ${
                on
                  ? 'border-primary bg-primary/10 text-foreground font-medium'
                  : 'border-border bg-background text-muted-foreground hover:bg-muted'
              }`}
            >
              <span
                className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[11px] font-bold ${
                  on ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                }`}
              >
                {i + 1}
              </span>
              {t(`ch4_2.coupling.${p.key}.name`)}
            </button>
          )
        })}
      </div>

      {/* detail: how it gets in + the cure */}
      <ResultBox tone="primary" label={t(`ch4_2.coupling.${selected}.name`)}>
        <p className="text-sm text-foreground">
          <span className="font-semibold">{t('ch4_2.coupling.howLabel')} </span>
          <Trans i18nKey={`ch4_2.coupling.${selected}.how`} ns="ui" components={{ ...mathComponents }} />
        </p>
        <p className="text-sm text-foreground mt-2">
          <span className="font-semibold text-callout-experiment">{t('ch4_2.coupling.cureLabel')} </span>
          <Trans i18nKey={`ch4_2.coupling.${selected}.cure`} ns="ui" components={{ ...mathComponents }} />
        </p>
      </ResultBox>
    </Widget>
  )
}
