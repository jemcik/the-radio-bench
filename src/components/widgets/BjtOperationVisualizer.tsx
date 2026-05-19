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
//
// MAX_PARTICLES must comfortably exceed the steady-state population
// (spawn_rate × traverse_time) at peak current, otherwise the cap
// clips spawning early and the visible carriers cluster around the
// emitter (where they spawn) instead of spreading across the body.
// At i_c = 10 mA and SPAWN_TIME_AT_FULL_MA = 50 ms we spawn ~20/sec;
// at vx ≈ 1.5 px/frame × 30 fps ≈ 45 px/sec the traverse time across
// 410 px is ≈ 9 sec. Steady state ≈ 20 × 9 = 180 particles. 200 cap
// gives a small headroom.
const MAX_PARTICLES = 200
const PARTICLE_RADIUS = 2.4

const V_T = 0.026       // thermal voltage at room temp (≈ kT/q)
const I_S = 1e-12       // mA — saturation current scale

// Region thresholds (in mA — derived from V_BE via the diode equation
// i_c = I_S · exp(V_BE / V_T) with I_S = 1e-12 mA, V_T = 0.026 V).
//
// These constants are NOT independent of the chapter prose — both the
// `insideRegions` paragraph AND the widget's `regionDescription` text
// quote specific V_BE boundaries for cutoff / active / saturation. The
// numbers below are picked so the region label flips at exactly those
// quoted V_BE values:
//
//   cutoff → active   at V_BE ≈ 0.60 V (i_c ≈ 0.011 mA)
//   active → saturation at V_BE ≈ 0.75 V (i_c ≈ 3.35 mA)
//
// I_C_CAP_MA caps the readout slightly above the saturation threshold
// so the visualisation models «load can no longer supply more current»
// — a real CE-switch load would clip the current at this level.
//
// Tied to prose by BjtOperationVisualizer.test.tsx — if you change
// either the model constants or the prose V_BE thresholds, that test
// will fail until both sides agree again. The previous version had
// SATURATION_THRESHOLD_MA = 9.5 mA which corresponded to V_BE ≈ 0.78
// while prose said active ends at 0.75; reader-flagged.
//
// SATURATION_THRESHOLD_MA == I_C_CAP_MA on purpose: the «saturation»
// label is meant to communicate «the load is now clipping the
// current», so it must NOT fire before the cap actually kicks in.
// Earlier version had a 3.3/4.0 gap which gave a window where the
// label said «saturation, capped at 4 mA» while the readout showed
// i_c = 3.37 mA (clearly not capped yet) — the description text was
// lying. Reader-flagged.
const CUTOFF_THRESHOLD_MA = 0.01                  // V_BE ≈ 0.60 V boundary
const I_C_CAP_MA = 3.5                            // soft cap = saturation start
const SATURATION_THRESHOLD_MA = I_C_CAP_MA        // label fires when cap engages

/**
 * Particle motion is state-based, not spring-physics-based:
 *   • flowing — drifts rightward at constant vx, vy stays small.
 *     Non-recombining particles stay in this state until they exit at
 *     the collector side; recombining particles switch to «branching»
 *     when they hit the middle of the base.
 *   • branching — only used by recombining carriers. The particle
 *     decelerates horizontally and accelerates downward to curve out
 *     through the base wire (visible as i_b leaving the device).
 *     This is the physically-correct picture: the carrier that
 *     recombined in the base re-emerges through the base contact.
 *   • Previous version used spring-toward-recombineY which gave an
 *     undamped oscillation that read on screen as the particle
 *     «bouncing» up and down. Reader-flagged.
 */
type ParticlePhase = 'flowing' | 'branching'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  /** Does this carrier recombine in the base instead of reaching the collector? */
  recombines: boolean
  phase: ParticlePhase
  alive: boolean
}

const BRANCH_TRIGGER_X = (B_X0 + B_X1) / 2  // veer once past the base midline

// Length of the opacity fade-in at the left wall and fade-out at the
// right wall. Particles spawn inside the body but with opacity ≈ 0;
// they ramp up as they cross this strip, giving the visual impression
// of «being injected at the emitter junction» (and symmetrically
// «being absorbed at the collector junction» on the way out).
// Previously particles materialised at full opacity at a random x and
// despawned mid-stream — reader-flagged as «appearing from nothing».
const FADE_STRIP = 30

function makeParticle(beta: number, rng: () => number): Particle {
  return {
    // Spawn STRICTLY inside the emitter body, just past the left wall.
    // Combined with the fade-in opacity below, the visual reads as
    // «electrons entering from the emitter contact», not appearing in
    // the middle of empty space or — worse — outside the structure.
    x: E_X0 + rng() * 10,
    y: STRUCT_Y0 + 20 + rng() * (STRUCT_Y1 - STRUCT_Y0 - 40),
    // Wide vx spread (1.0 → 1.9, was 1.4 → 1.8) so faster particles
    // overtake slower ones during their traversal — any initial
    // clumping spreads out naturally before they reach the collector.
    vx: 1.0 + rng() * 0.9,
    vy: 0,
    recombines: rng() < 1 / beta,
    phase: 'flowing',
    alive: true,
  }
}

/**
 * Per-particle opacity for fade-in (entering the emitter wall) and
 * fade-out (leaving via the collector wall, or via the base wire for
 * recombining carriers). Returns 0..0.85.
 */
function particleOpacity(p: Particle): number {
  const FULL = 0.85
  if (p.phase === 'branching') {
    // Fade out as the carrier dives below the body into the base wire.
    if (p.y > STRUCT_Y1 - 8) {
      const t = (STRUCT_Y1 + 12 - p.y) / 20
      return Math.max(0, Math.min(FULL, t * FULL))
    }
    return FULL
  }
  // Flowing phase — fade in near left wall, fade out near right wall.
  if (p.x < E_X0 + FADE_STRIP) {
    return Math.max(0, Math.min(FULL, ((p.x - E_X0) / FADE_STRIP) * FULL))
  }
  if (p.x > C_X1 - FADE_STRIP) {
    return Math.max(0, Math.min(FULL, ((C_X1 - p.x) / FADE_STRIP) * FULL))
  }
  return FULL
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
  // Particles drive rendering, so they live in state — not a ref. The
  // previous design used `particlesRef.current` + a `setTick` hack to
  // force re-renders, but reading a ref during render is a React
  // anti-pattern (the new `react-hooks/refs` ESLint rule flags it):
  // refs are for values not needed during render, and stale-ref bugs
  // become invisible until a deferred re-render exposes them. Now
  // every rAF tick produces a fresh array via the functional updater,
  // and React renders the snapshot it was handed — no ref reads in
  // the render body.
  const [particles, setParticles] = useState<Particle[]>([])
  const lastFrameRef = useRef<number>(0)
  const prevFrameTimeRef = useRef<number>(0)

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
    const SPAWN_TIME_AT_FULL_MA = 50  // ms between spawns at i_c = 10 mA

    const tick = (now: number) => {
      // Throttle to ~30 fps so SVG render stays cheap.
      if (now - lastFrameRef.current < FRAME_MS) {
        rafId = requestAnimationFrame(tick)
        return
      }
      const dt = prevFrameTimeRef.current === 0 ? FRAME_MS : (now - prevFrameTimeRef.current)
      prevFrameTimeRef.current = now
      lastFrameRef.current = now

      const rng = rngRef.current

      // One setState per frame: spawn + advance + compact via a
      // PURE updater. React StrictMode double-invokes setState
      // updaters in dev to detect impurity; an earlier version
      // mutated particle objects in place (p.x += p.vx, etc.),
      // which under double-invoke produced inconsistent positions
      // and visually «froze» the flow after a few frames.
      // Allocating fresh particle objects per frame trades a tiny
      // amount of GC churn for StrictMode-safe behaviour.
      setParticles(prev => {
        let next: Particle[] = prev

        // Poisson-like spawning: each frame, expected spawn count
        // is (dt / spawnInterval). Floor + Bernoulli for the
        // fractional part de-syncs spawns from frame-tick
        // boundaries — the previous «if elapsed > interval» logic
        // locked spawns to ~1 per frame at high current and read
        // on screen as discrete waves of particles travelling
        // together. Reader-flagged.
        //
        // spawnInterval uses SQRT scaling instead of linear
        // (i_c_cap/i_c). Active-region currents span three orders
        // of magnitude (10 µA → 10 mA); linear scaling makes the
        // low-current end invisible (one particle every 33
        // seconds at the active threshold). sqrt() compresses the
        // dynamic range so the bottom of the active range still
        // shows perceptible flow (~1 every 1.3 sec at 15 µA)
        // while the top remains a dense stream (~20/sec at
        // 10 mA). The visualisation trades exact-proportionality
        // for pedagogical clarity — what we want the reader to
        // feel is «current grows with V_BE», not «current is
        // exactly proportional to N particles».
        if (i_c_mA > CUTOFF_THRESHOLD_MA) {
          const spawnInterval = SPAWN_TIME_AT_FULL_MA * Math.sqrt(I_C_CAP_MA / Math.max(i_c_mA, 0.001))
          const expected = dt / spawnInterval
          const whole = Math.floor(expected)
          const frac = expected - whole
          const spawnCount = whole + (rng() < frac ? 1 : 0)
          if (spawnCount > 0) {
            const room = MAX_PARTICLES - next.length
            const toSpawn = Math.min(spawnCount, room)
            if (toSpawn > 0) {
              const fresh: Particle[] = new Array(toSpawn)
              for (let i = 0; i < toSpawn; i++) {
                fresh[i] = makeParticle(beta, rng)
              }
              next = next.concat(fresh)
            }
          }
        }

        // Advance positions — pure transform, no mutation. Each
        // particle becomes a fresh object with the next-frame
        // values; React state holds these snapshots.
        next = next
          .map((p): Particle => {
            if (!p.alive) return p

            if (p.phase === 'flowing') {
              // Drift right; vy stays at 0 so the path is a clean
              // horizontal line. The visual story is «electrons
              // get injected at the emitter and drift across the
              // body to the collector». Any wobble used to read
              // as «electrons jumping around» which is the wrong
              // physics intuition.
              const x = p.x + p.vx

              // Recombining carriers veer down once past the base
              // midline.
              const phase: Particle['phase'] =
                p.recombines && x >= BRANCH_TRIGGER_X ? 'branching' : 'flowing'

              // Non-recombining: exit at the collector wall.
              // Despawn AT the wall (x = C_X1), not 20 px before
              // — the opacity fade-out below handles the visual
              // disappearance smoothly.
              const alive = !p.recombines && x >= C_X1 ? false : true

              return { ...p, x, phase, alive }
            }

            // branching: smooth curve down through the base wire
            // — accelerate vy, decelerate vx. Reads as «the
            // carrier veers down out of the device through the
            // base terminal» = visible i_b.
            const vy = Math.min(p.vy + 0.10, 1.6)
            const vx = Math.max(p.vx - 0.06, 0)
            const x = p.x + vx
            const y = p.y + vy

            // Exit at the base contact (just past the bottom of
            // the body, where the base wire connects).
            const alive = y > STRUCT_Y1 + 12 ? false : true

            return { ...p, x, y, vx, vy, alive }
          })
          .filter(p => p.alive)

        return next
      })

      rafId = requestAnimationFrame(tick)
    }

    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [i_c_mA, beta])

  const regionLabel = t(`ch1_11.widget.bjtOp.region.${region}`)
  // Active uses `font-semibold` WITHOUT a colour tint — the project's
  // term-accent / primary orange is reserved for glossary terms and
  // must not appear on plain UI elements (reader-flagged: an orange
  // «Активний (лінійний)» readout reads as a clickable glossary term
  // which would be misleading). Cutoff (muted grey) and saturation
  // (caution amber) use distinctive colours that don't collide with
  // glossary-term accent.
  const regionToneClass =
    region === 'cutoff' ? 'text-muted-foreground' :
    region === 'saturation' ? 'text-[hsl(var(--caution))]' :
    'text-foreground font-semibold'

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

        {/* ── Particles (electrons flowing emitter → collector).
             Recombining carriers that have already entered the branch
             phase get the caution colour to visually identify them as
             «about to leave through the base wire» (visible i_b).
             Opacity fades in/out near the body walls so carriers
             appear to be «injected» / «collected» rather than
             materialising mid-stream. */}
        {particles.map((p, idx) => (
          <circle
            key={idx}
            cx={p.x} cy={p.y}
            r={PARTICLE_RADIUS}
            fill={p.phase === 'branching' ? svgTokens.caution : svgTokens.primary}
            opacity={particleOpacity(p)}
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
                i_b: `${num(Math.round(i_b_uA * 100) / 100)} µA`,
                i_c: `${num(Math.round(i_c_mA * 1000) / 1000)} mA`,
                i_e: `${num(Math.round(i_e_mA * 1000) / 1000)} mA`,
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
