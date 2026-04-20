/**
 * Chapter 1.3 — Sine-origin diagram (animated).
 *
 * A live side-by-side illustration of the link between uniform
 * circular motion and the sine wave:
 *
 *   Left:  a circle of radius A with a point P that rotates
 *          continuously (one revolution per PERIOD_MS). A radius
 *          line from the centre tracks P. A dashed vertical line
 *          from P down to the horizontal diameter (the zero line)
 *          calls out the "vertical position" we're tracking.
 *
 *   Right: the sine wave is DRAWN IN REAL TIME by the motion — the
 *          curve grows from left to right as the angle sweeps from
 *          0 to 2π. The leading marker dot rides the growing curve
 *          and always sits at the same vertical level as P. At the
 *          end of a full rotation, the curve resets to empty and
 *          the point is back at angle 0 — the loop repeats.
 *
 * Respects `prefers-reduced-motion`: if the user has that setting
 * enabled, the diagram freezes at a single illustrative snapshot
 * (angle ≈ 40°) instead of animating.
 */
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { svgTokens } from './svgTokens'

// ── Geometry ──────────────────────────────────────────────────────
// viewBox 560 × 220. No scaling: on-screen pixels = viewBox units,
// so every fontSize renders at the value written.
const VB_W = 560
const VB_H = 220

// Circle (left side)
const CIRCLE_CX = 88
const CIRCLE_CY = 110
const CIRCLE_R = 70

// Sine plot (right side): aligned vertically with the circle so the
// rotating point's height and the sine's value share a reading line.
const SINE_X0 = 200
const SINE_X1 = 536
const SINE_CY = CIRCLE_CY
const SINE_AMP = CIRCLE_R
const PERIOD_PX = SINE_X1 - SINE_X0  // one full cycle across the plot

// ── Animation ─────────────────────────────────────────────────────
const PERIOD_MS = 4000    // one full rotation in ≈ 4 s — readable pace
const STATIC_ANGLE_RAD = (40 * Math.PI) / 180  // snapshot used when
                                               // reduced-motion is on

// ── Sine-path generator — growing curve from 0 up to currentAngle ─
function buildSinePath(currentAngle: number): string {
  if (currentAngle <= 0) return ''
  const step = 0.035  // radians per sample (~180 samples per cycle)
  let d = ''
  let first = true
  for (let a = 0; a < currentAngle; a += step) {
    const x = SINE_X0 + (a / (2 * Math.PI)) * PERIOD_PX
    const y = SINE_CY - SINE_AMP * Math.sin(a)
    d += first ? `M ${x.toFixed(2)} ${y.toFixed(2)}` : ` L ${x.toFixed(2)} ${y.toFixed(2)}`
    first = false
  }
  // Clean end point at exactly currentAngle (avoids jitter at the tip)
  const endX = SINE_X0 + (currentAngle / (2 * Math.PI)) * PERIOD_PX
  const endY = SINE_CY - SINE_AMP * Math.sin(currentAngle)
  d += ` L ${endX.toFixed(2)} ${endY.toFixed(2)}`
  return d
}

// ── Angle-arc as a polyline — works for any angle without
// wrestling with SVG large-arc / sweep flags ──────────────────────
function buildAngleArc(currentAngle: number): string {
  if (currentAngle <= 0) return ''
  const arcR = 20
  const steps = Math.max(2, Math.ceil(32 * currentAngle / (2 * Math.PI)))
  const parts: string[] = []
  for (let i = 0; i <= steps; i++) {
    const a = (i / steps) * currentAngle
    const x = CIRCLE_CX + arcR * Math.cos(a)
    const y = CIRCLE_CY - arcR * Math.sin(a)
    parts.push(`${x.toFixed(2)},${y.toFixed(2)}`)
  }
  return `M ${parts[0]} ` + parts.slice(1).map((p) => `L ${p}`).join(' ')
}

export default function SineOriginDiagram() {
  const { t } = useTranslation('ui')
  const [angle, setAngle] = useState<number>(STATIC_ANGLE_RAD)

  useEffect(() => {
    // Respect prefers-reduced-motion — the state already initialises
    // to STATIC_ANGLE_RAD, so just skip the rAF loop entirely.
    if (
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return
    }

    let rafId = 0
    let startTime: number | null = null
    const tick = (now: number) => {
      if (startTime === null) startTime = now
      const elapsed = (now - startTime) % PERIOD_MS
      const a = (elapsed / PERIOD_MS) * 2 * Math.PI
      setAngle(a)
      rafId = requestAnimationFrame(tick)
    }
    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [])

  // Derived positions — update every frame.
  const Px = CIRCLE_CX + CIRCLE_R * Math.cos(angle)
  const Py = CIRCLE_CY - CIRCLE_R * Math.sin(angle)
  const markerX = SINE_X0 + (angle / (2 * Math.PI)) * PERIOD_PX
  const markerY = SINE_CY - SINE_AMP * Math.sin(angle)

  const sinePathD = buildSinePath(angle)
  const arcPathD = buildAngleArc(angle)

  return (
    <figure className="my-6 not-prose">
      <svg
        width={VB_W}
        height={VB_H}
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        role="img"
        aria-label={t('ch1_3.sineOrigin.ariaLabel')}
        style={{ display: 'block', margin: '0 auto', maxWidth: '100%', height: 'auto' }}
      >
        {/* ─── LEFT: CIRCLE ─────────────────────────────────────── */}
        <circle
          cx={CIRCLE_CX}
          cy={CIRCLE_CY}
          r={CIRCLE_R}
          fill="none"
          stroke={svgTokens.fg}
          strokeWidth={1.4}
          opacity={0.75}
        />
        {/* Horizontal diameter — zero reference for vertical position */}
        <line
          x1={CIRCLE_CX - CIRCLE_R}
          y1={CIRCLE_CY}
          x2={CIRCLE_CX + CIRCLE_R}
          y2={CIRCLE_CY}
          stroke={svgTokens.border}
          strokeWidth={0.8}
          strokeDasharray="3 3"
          opacity={0.6}
        />
        {/* Vertical diameter — top/bottom reference */}
        <line
          x1={CIRCLE_CX}
          y1={CIRCLE_CY - CIRCLE_R}
          x2={CIRCLE_CX}
          y2={CIRCLE_CY + CIRCLE_R}
          stroke={svgTokens.border}
          strokeWidth={0.8}
          strokeDasharray="3 3"
          opacity={0.4}
        />
        {/* Rotating radius line */}
        <line
          x1={CIRCLE_CX}
          y1={CIRCLE_CY}
          x2={Px}
          y2={Py}
          stroke={svgTokens.key}
          strokeWidth={1.8}
        />
        {/* Sweeping angle arc */}
        {arcPathD && (
          <path
            d={arcPathD}
            fill="none"
            stroke={svgTokens.key}
            strokeWidth={1}
            opacity={0.75}
          />
        )}
        {/* Vertical projection: dashed line from P to the zero line.
            Drawn even when the point crosses the zero line (angle = 0 or π)
            where the line collapses to a dot — it still shows "projected
            height" concept. */}
        <line
          x1={Px}
          y1={Py}
          x2={Px}
          y2={CIRCLE_CY}
          stroke={svgTokens.note}
          strokeWidth={1.5}
          strokeDasharray="4 3"
        />
        {/* Centre dot */}
        <circle cx={CIRCLE_CX} cy={CIRCLE_CY} r={2.2} fill={svgTokens.fg} />
        {/* Rotating point P */}
        <circle cx={Px} cy={Py} r={4.5} fill={svgTokens.key} />

        {/* Labels on the circle side */}
        {/* "rotating point" atmospheric label above the circle */}
        <text
          x={CIRCLE_CX}
          y={CIRCLE_CY - CIRCLE_R - 10}
          fontSize="13"
          fontFamily="Georgia, serif"
          fontStyle="italic"
          fill={svgTokens.mutedFg}
          textAnchor="middle"
        >
          {t('ch1_3.sineOrigin.circleLabel')}
        </text>
        {/* A — radius label placed INSIDE the circle, just right of the
            leftmost rim, on the horizontal diameter. Static position so
            it never clips the SVG viewBox (the earlier outside-left
            placement put the glyph's left edge at x<0, user-flagged).
            The rotating radius only overlaps this label briefly when
            the point sweeps through ≈180° — acceptable trade-off. */}
        <text
          x={CIRCLE_CX - CIRCLE_R + 12}
          y={CIRCLE_CY - 6}
          fontSize="15"
          fontFamily="Georgia, serif"
          fontStyle="italic"
          fontWeight="700"
          fill={svgTokens.key}
          textAnchor="middle"
        >
          {t('ch1_3.sineOrigin.radiusLabel')}
        </text>
        {/* θ — angle label, placed just outside the inner arc */}
        <text
          x={CIRCLE_CX + 32}
          y={CIRCLE_CY - 10}
          fontSize="14"
          fontFamily="Georgia, serif"
          fontStyle="italic"
          fill={svgTokens.key}
        >
          {t('ch1_3.sineOrigin.angleLabel')}
        </text>

        {/* No connector line between the circle and the sine: the
            matching-colour dots (rotating P on the circle, leading
            marker on the sine) already communicate «same quantity,
            same moment». An explicit arrow here was clipped by the
            sine's own leading-edge stroke and created visual noise. */}

        {/* ─── RIGHT: SINE TRACE ───────────────────────────────── */}
        {/* Zero line for the sine */}
        <line
          x1={SINE_X0 - 2}
          y1={SINE_CY}
          x2={SINE_X1 + 8}
          y2={SINE_CY}
          stroke={svgTokens.fg}
          strokeWidth={1}
          opacity={0.4}
        />
        {/* Time-axis arrow tip */}
        <polygon
          points={`${SINE_X1 + 8},${SINE_CY - 3} ${SINE_X1 + 8},${SINE_CY + 3} ${SINE_X1 + 13},${SINE_CY}`}
          fill={svgTokens.fg}
          opacity={0.55}
        />
        {/* Animated sine trace — grows with the angle */}
        {sinePathD && (
          <path
            d={sinePathD}
            fill="none"
            stroke={svgTokens.primary}
            strokeWidth={2.2}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        )}
        {/* Leading marker dot riding the growing curve */}
        {angle > 0 && (
          <>
            <line
              x1={markerX}
              y1={SINE_CY}
              x2={markerX}
              y2={markerY}
              stroke={svgTokens.note}
              strokeWidth={1.5}
              strokeDasharray="4 3"
            />
            <circle cx={markerX} cy={markerY} r={4.5} fill={svgTokens.key} />
          </>
        )}

        {/* t label at the end of the time axis */}
        <text
          x={SINE_X1 + 17}
          y={SINE_CY + 4}
          fontSize="14"
          fontFamily="Georgia, serif"
          fontStyle="italic"
          fill={svgTokens.fg}
        >
          {t('ch1_3.sineOrigin.timeLabel')}
        </text>
        {/* Atmospheric label above the sine trace */}
        <text
          x={(SINE_X0 + SINE_X1) / 2}
          y={SINE_CY - SINE_AMP - 10}
          fontSize="13"
          fontFamily="Georgia, serif"
          fontStyle="italic"
          fill={svgTokens.mutedFg}
          textAnchor="middle"
        >
          {t('ch1_3.sineOrigin.sineLabel')}
        </text>
      </svg>
      <figcaption className="mt-3 px-4 text-center text-[13px] text-muted-foreground">
        {t('ch1_3.sineOrigin.caption')}
      </figcaption>
    </figure>
  )
}
