import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import Widget from '@/components/ui/widget'
import { ResultBox } from '@/components/ui/result-box'
import { useLocaleFormatter } from '@/lib/hooks/useLocaleFormatter'
import { withSubscripts } from '@/lib/text-with-subscripts'
import { svgTokens } from '@/components/diagrams/svgTokens'
import { MathVar } from '@/components/ui/math'

/**
 * Chapter 1.11 §2 — «Inside the transistor»: interactive visualization
 * of how V_BE controls current through an NPN BJT, with animated
 * charge-carrier flow.
 *
 * The widget exists to fill a pedagogical gap the user reported on
 * first read: the chapter previously jumped from «BJT has three pins»
 * straight to «here is a BJT switch / amplifier» without ever showing
 * what's happening INSIDE the transistor. Output-characteristic curves
 * show RESULTS, not the mechanism. The result was that the load-line
 * widget and the CE amplifier formula required ~6 rounds of Q&A in
 * chat to actually understand.
 *
 * What this widget shows
 * ──────────────────────
 *   • A horizontal NPN cross-section: emitter (left, N) → base (centre,
 *     thin P) → collector (right, N).
 *   • Animated electron-dots flowing from emitter to collector. Most
 *     pass through the thin base; a small fraction (1/β) recombine
 *     inside the base (and re-emerge as base current).
 *   • Two sliders: V_BE (the only thing the reader actually controls)
 *     and β (so they can see how the ratio of i_b vs i_c depends on
 *     the transistor type, not on bias).
 *   • Three current readouts: i_b, i_e, i_c, computed from a real
 *     Ebers–Moll-style exponential I_E(V_BE).
 *   • A region indicator: «cutoff» when V_BE is too low for any
 *     appreciable current; «active» when in the linear region; a hint
 *     of «saturation» when the current hits the widget's chosen cap.
 *
 * Why the cap on i_c
 * ──────────────────
 *   In a real circuit the collector current is set by the load (R_C +
 *   V_CC). Without a load context this widget can't show «true»
 *   saturation, so we cap i_c at 10 mA and label values pinned to the
 *   cap as «saturation territory» (a real circuit would clip earlier
 *   if R_C is large or V_CC small). The next sections in the chapter
 *   show the same effect through the output-curves widget with an
 *   explicit load.
 *
 * Animation model
 * ───────────────
 *   • Particles are stored in a ref (no React state per frame).
 *   • requestAnimationFrame loop updates positions; a frame-counter in
 *     state triggers re-render at the animation framerate. The
 *     framerate is capped at ~30 fps to keep the SVG render cheap.
 *   • Spawn rate ∝ i_e — the reader sees a denser stream when V_BE
 *     is higher.
 *   • Each particle has a per-instance recombine flag set at spawn
 *     with probability 1/β. Recombining particles veer toward the
 *     base-bottom and disappear; the others continue to the collector.
 */

const VB_W = 540
const VB_H = 280

// NPN geometry — emitter on the left, base (thin) in the middle,
// collector on the right. Y range is the "thick" body of the device.
const STRUCT_Y0 = 50
const STRUCT_Y1 = 200
const E_X0 = 60
const E_X1 = 220        // emitter spans 60..220
const B_X0 = 220
const B_X1 = 270        // base spans 220..270 (visibly thin)
const C_X0 = 270
const C_X1 = 470        // collector spans 270..470

// Particle simulation
const MAX_PARTICLES = 80
const PARTICLE_RADIUS = 2.4

const V_T = 0.026       // thermal voltage at room temp (≈ kT/q)
const I_S = 1e-12       // mA — saturation current scale
const I_C_CAP_MA = 10   // soft cap; values pinned here = «saturation»

// Region thresholds (in mA — derived from V_BE)
const CUTOFF_THRESHOLD_MA = 0.001  // below 1 µA → cutoff
const SATURATION_THRESHOLD_MA = 9.5 // near the cap → saturation hint

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  /** Does this carrier recombine in the base instead of reaching the collector? */
  recombines: boolean
  /** Once a recombining particle reaches the base region, it veers and disappears. */
  recombineY: number
  /** Lifetime / fade. */
  alive: boolean
}

function makeParticle(beta: number, rng: () => number): Particle {
  return {
    x: E_X0 + rng() * 10,
    y: STRUCT_Y0 + 20 + rng() * (STRUCT_Y1 - STRUCT_Y0 - 40),
    vx: 1.4 + rng() * 0.4,
    vy: (rng() - 0.5) * 0.3,
    recombines: rng() < 1 / beta,
    recombineY: STRUCT_Y1 - 10 - rng() * 8,
    alive: true,
  }
}

interface SliderRowProps {
  labelKey: string
  min: number
  max: number
  step: number
  value: number
  onChange: (v: number) => void
  unit: string
  display: string
  idSuffix: string
  t: (k: string) => string
}

function SliderRow({ labelKey, min, max, step, value, onChange, unit, display, idSuffix, t }: SliderRowProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 text-sm">
      <label
        htmlFor={`bjt-op-${idSuffix}`}
        className="text-foreground font-medium shrink-0 w-44"
      >
        {withSubscripts(t(labelKey))}
      </label>
      <input
        id={`bjt-op-${idSuffix}`}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="flex-1 min-w-[140px] accent-primary"
      />
      <span className="font-mono text-foreground w-24 text-right shrink-0">
        {display} {unit}
      </span>
    </div>
  )
}

export default function BjtOperationVisualizer() {
  const { t } = useTranslation('ui')
  const { num } = useLocaleFormatter()
  const titleId = useId()

  const [vbe, setVbe] = useState(0.7)
  const [beta, setBeta] = useState(100)

  // ── Current model ──────────────────────────────────────────────
  // Diode-like exponential: I_C = I_S · (exp(V_BE/V_T) − 1). For V_BE
  // around 0.6–0.8 V this gives currents from microamps to tens of mA.
  // Soft cap models the maximum delivered by an external supply.
  const { i_c_mA, i_b_uA, i_e_mA, region } = useMemo(() => {
    const i_c_raw = I_S * (Math.exp(vbe / V_T) - 1)  // mA
    const i_c = Math.min(Math.max(i_c_raw, 0), I_C_CAP_MA)
    const i_b = i_c / beta  // mA
    const i_e = i_c + i_b   // mA

    let region: 'cutoff' | 'active' | 'saturation'
    if (i_c < CUTOFF_THRESHOLD_MA) region = 'cutoff'
    else if (i_c >= SATURATION_THRESHOLD_MA) region = 'saturation'
    else region = 'active'

    return {
      i_c_mA: i_c,
      i_b_uA: i_b * 1000,
      i_e_mA: i_e,
      region,
    }
  }, [vbe, beta])

  // ── Animation loop ─────────────────────────────────────────────
  // Particles live in a ref so updating them does not trigger React
  // re-renders; a frame counter in state forces re-render at the
  // animation framerate (capped at ~30 fps).
  const particlesRef = useRef<Particle[]>([])
  const lastSpawnRef = useRef<number>(0)
  const lastFrameRef = useRef<number>(0)
  const [, setTick] = useState(0)
  const tickRef = useRef(0)

  // PRNG seeded per-mount; deterministic for tests / SSR.
  const rngRef = useRef<() => number>(() => 0)
  useEffect(() => {
    let seed = 12345
    rngRef.current = () => {
      seed = (seed * 9301 + 49297) % 233280
      return seed / 233280
    }
  }, [])

  useEffect(() => {
    let rafId = 0
    const FRAME_MS = 1000 / 30
    const SPAWN_TIME_AT_FULL_MA = 30  // ms between spawns at i_c = 10 mA

    const tick = (now: number) => {
      // Throttle to ~30 fps so SVG render stays cheap.
      if (now - lastFrameRef.current < FRAME_MS) {
        rafId = requestAnimationFrame(tick)
        return
      }
      lastFrameRef.current = now

      const rng = rngRef.current
      const particles = particlesRef.current

      // Spawn rate: roughly one particle per SPAWN_TIME_AT_FULL_MA at
      // i_c = 10 mA, linear in i_c, no spawning in cutoff.
      if (i_c_mA > CUTOFF_THRESHOLD_MA) {
        const spawnInterval = SPAWN_TIME_AT_FULL_MA * (I_C_CAP_MA / Math.max(i_c_mA, 0.01))
        if (now - lastSpawnRef.current > spawnInterval && particles.length < MAX_PARTICLES) {
          particles.push(makeParticle(beta, rng))
          lastSpawnRef.current = now
        }
      }

      // Update positions.
      for (const p of particles) {
        if (!p.alive) continue

        p.x += p.vx
        p.y += p.vy
        // Mild vertical drift toward centre to keep particles within
        // the device body.
        const yMid = (STRUCT_Y0 + STRUCT_Y1) / 2
        p.vy += (yMid - p.y) * 0.0005

        // Recombining particles drift toward bottom of base as they
        // cross into the base region.
        if (p.recombines && p.x > B_X0 - 4 && p.x < B_X1 + 4) {
          p.vy += (p.recombineY - p.y) * 0.04
          if (Math.abs(p.y - p.recombineY) < 2) {
            p.alive = false
          }
        }

        // Despawn at far right (reached collector terminal).
        if (p.x > C_X1 - 20) {
          p.alive = false
        }
      }

      // Compact: drop dead particles.
      particlesRef.current = particles.filter(p => p.alive)

      tickRef.current++
      setTick(tickRef.current)
      rafId = requestAnimationFrame(tick)
    }

    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [i_c_mA, beta])

  const regionLabel = t(`ch1_11.widget.bjtOp.region.${region}`)
  const regionToneClass =
    region === 'cutoff' ? 'text-muted-foreground' :
    region === 'saturation' ? 'text-[hsl(var(--caution))]' :
    'text-primary'

  return (
    <Widget
      title={<span id={titleId}>{t('ch1_11.widget.bjtOp.title')}</span>}
      description={
        <Trans
          i18nKey="ch1_11.widget.bjtOp.description"
          ns="ui"
          components={{
            var: <MathVar />,
            nowrap: <span style={{ whiteSpace: 'nowrap' }} />,
          }}
        />
      }
    >
      <div className="grid grid-cols-1 gap-3">
        <SliderRow
          labelKey="ch1_11.widget.bjtOp.vbeLabel"
          min={0.4} max={0.85} step={0.005}
          value={vbe} onChange={setVbe}
          unit="V" display={num(Math.round(vbe * 1000) / 1000)}
          idSuffix="vbe" t={t}
        />
        <SliderRow
          labelKey="ch1_11.widget.bjtOp.betaLabel"
          min={50} max={300} step={10}
          value={beta} onChange={setBeta}
          unit="" display={num(beta)}
          idSuffix="beta" t={t}
        />
      </div>

      <svg
        width={VB_W}
        height={VB_H}
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        role="img"
        aria-labelledby={titleId}
        aria-label={t('ch1_11.widget.bjtOp.ariaLabel')}
        style={{ display: 'block', margin: '0 auto', maxWidth: '100%', height: 'auto' }}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* ── Region backgrounds — N (emitter), P (base), N (collector) */}
        <rect
          x={E_X0} y={STRUCT_Y0}
          width={E_X1 - E_X0} height={STRUCT_Y1 - STRUCT_Y0}
          fill={svgTokens.fg} opacity={0.06}
        />
        <rect
          x={B_X0} y={STRUCT_Y0}
          width={B_X1 - B_X0} height={STRUCT_Y1 - STRUCT_Y0}
          fill={svgTokens.caution} opacity={0.18}
        />
        <rect
          x={C_X0} y={STRUCT_Y0}
          width={C_X1 - C_X0} height={STRUCT_Y1 - STRUCT_Y0}
          fill={svgTokens.fg} opacity={0.06}
        />

        {/* ── Borders */}
        <rect
          x={E_X0} y={STRUCT_Y0}
          width={C_X1 - E_X0} height={STRUCT_Y1 - STRUCT_Y0}
          fill="none" stroke={svgTokens.border} strokeWidth={1}
        />
        <line
          x1={B_X0} y1={STRUCT_Y0} x2={B_X0} y2={STRUCT_Y1}
          stroke={svgTokens.border} strokeWidth={1} strokeDasharray="3 3"
        />
        <line
          x1={B_X1} y1={STRUCT_Y0} x2={B_X1} y2={STRUCT_Y1}
          stroke={svgTokens.border} strokeWidth={1} strokeDasharray="3 3"
        />

        {/* ── Region labels (N, P, N) */}
        <text
          x={(E_X0 + E_X1) / 2} y={STRUCT_Y0 - 20}
          fontSize="13" fontStyle="italic" textAnchor="middle"
          fill={svgTokens.mutedFg} fontFamily="Georgia, serif"
        >
          {t('ch1_11.widget.bjtOp.emitterLabel')}
        </text>
        <text
          x={(E_X0 + E_X1) / 2} y={STRUCT_Y0 - 6}
          fontSize="11" textAnchor="middle"
          fill={svgTokens.mutedFg} fontFamily="ui-sans-serif, system-ui, sans-serif"
        >
          (N)
        </text>
        <text
          x={(B_X0 + B_X1) / 2} y={STRUCT_Y0 - 20}
          fontSize="13" fontStyle="italic" textAnchor="middle"
          fill={svgTokens.mutedFg} fontFamily="Georgia, serif"
        >
          {t('ch1_11.widget.bjtOp.baseLabel')}
        </text>
        <text
          x={(B_X0 + B_X1) / 2} y={STRUCT_Y0 - 6}
          fontSize="11" textAnchor="middle"
          fill={svgTokens.mutedFg} fontFamily="ui-sans-serif, system-ui, sans-serif"
        >
          (P)
        </text>
        <text
          x={(C_X0 + C_X1) / 2} y={STRUCT_Y0 - 20}
          fontSize="13" fontStyle="italic" textAnchor="middle"
          fill={svgTokens.mutedFg} fontFamily="Georgia, serif"
        >
          {t('ch1_11.widget.bjtOp.collectorLabel')}
        </text>
        <text
          x={(C_X0 + C_X1) / 2} y={STRUCT_Y0 - 6}
          fontSize="11" textAnchor="middle"
          fill={svgTokens.mutedFg} fontFamily="ui-sans-serif, system-ui, sans-serif"
        >
          (N)
        </text>

        {/* ── Terminal leads */}
        <line
          x1={E_X0 - 30} y1={(STRUCT_Y0 + STRUCT_Y1) / 2}
          x2={E_X0} y2={(STRUCT_Y0 + STRUCT_Y1) / 2}
          stroke={svgTokens.fg} strokeWidth={1.5}
        />
        <line
          x1={C_X1} y1={(STRUCT_Y0 + STRUCT_Y1) / 2}
          x2={C_X1 + 30} y2={(STRUCT_Y0 + STRUCT_Y1) / 2}
          stroke={svgTokens.fg} strokeWidth={1.5}
        />
        <line
          x1={(B_X0 + B_X1) / 2} y1={STRUCT_Y1}
          x2={(B_X0 + B_X1) / 2} y2={STRUCT_Y1 + 30}
          stroke={svgTokens.fg} strokeWidth={1.5}
        />

        {/* ── Terminal labels (E / B / C) */}
        <text
          x={E_X0 - 36} y={(STRUCT_Y0 + STRUCT_Y1) / 2}
          fontSize="13" textAnchor="end" dominantBaseline="middle"
          fill={svgTokens.fg} fontFamily="Georgia, serif" fontStyle="italic"
        >
          E
        </text>
        <text
          x={C_X1 + 36} y={(STRUCT_Y0 + STRUCT_Y1) / 2}
          fontSize="13" textAnchor="start" dominantBaseline="middle"
          fill={svgTokens.fg} fontFamily="Georgia, serif" fontStyle="italic"
        >
          C
        </text>
        <text
          x={(B_X0 + B_X1) / 2} y={STRUCT_Y1 + 40}
          fontSize="13" textAnchor="middle"
          fill={svgTokens.fg} fontFamily="Georgia, serif" fontStyle="italic"
        >
          B
        </text>

        {/* ── Particles (electrons flowing emitter → collector) */}
        {particlesRef.current.map((p, idx) => (
          <circle
            key={idx}
            cx={p.x} cy={p.y}
            r={PARTICLE_RADIUS}
            fill={p.recombines && p.x > B_X0 ? svgTokens.caution : svgTokens.primary}
            opacity={0.85}
          />
        ))}

      </svg>

      <ResultBox tone="info" label="">
        <div className="space-y-1.5 text-sm leading-6">
          <p>
            <Trans
              i18nKey="ch1_11.widget.bjtOp.readoutCurrents"
              ns="ui"
              values={{
                i_b: `${num(i_b_uA.toFixed(2))} µA`,
                i_c: `${num(i_c_mA.toFixed(3))} mA`,
                i_e: `${num(i_e_mA.toFixed(3))} mA`,
              }}
              components={{ var: <MathVar />, strong: <strong /> }}
            />
          </p>
          <p>
            <strong>{t('ch1_11.widget.bjtOp.regionLabel')}:</strong>{' '}
            <span className={regionToneClass}>{regionLabel}</span>
            {' — '}
            <Trans
              i18nKey={`ch1_11.widget.bjtOp.regionDescription.${region}`}
              ns="ui"
              components={{
                var: <MathVar />,
                strong: <strong />,
                nowrap: <span style={{ whiteSpace: 'nowrap' }} />,
              }}
            />
          </p>
        </div>
      </ResultBox>
    </Widget>
  )
}
