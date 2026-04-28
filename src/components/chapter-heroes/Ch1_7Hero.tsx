/**
 * Chapter 1.7 hero — pen-and-ink sketch of a parallel LC tank.
 *
 * Layout: a four-sided loop. The top branch carries the capacitor
 * (drawn pictorially as two parallel plates with E-field hairlines
 * between them). The bottom branch carries the inductor (drawn as a
 * 3D solenoid in side view — same back-pass / cylinder-occluder /
 * front-pass layering as the ch 1.6 hero, scaled down). Two vertical
 * terminal wires close the loop on the left and right.
 *
 * Caption underneath: f₀ = 1 / (2π√LC).
 *
 * Theme-adaptive: every stroke uses `currentColor`; the cylinder
 * occluder fills with `hsl(var(--background))` so the back passes
 * are hidden behind it in both light and dark themes.
 */
import { useTranslation } from 'react-i18next'

export default function Ch1_7Hero() {
  const { t } = useTranslation('ui')

  return (
    <svg
      viewBox="0 0 540 220"
      width="540"
      height="220"
      fill="none"
      aria-label={t('ch1_7.heroAriaLabel')}
      role="img"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* ── Loop wires (top + bottom branches split around C / L, plus vertical terminals) ── */}
      <g stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        {/* Top branch — split around the capacitor plates */}
        <path d="M 80,80 L 242,80" />
        <path d="M 298,80 L 460,80" />
        {/* Bottom branch — split around the inductor coil */}
        <path d="M 80,170 L 225,170" />
        <path d="M 315,170 L 460,170" />
        {/* Vertical terminals */}
        <path d="M 80,80 L 80,170" />
        <path d="M 460,80 L 460,170" />
      </g>

      {/* ── CAPACITOR (top branch) — two parallel plates ── */}
      <g stroke="currentColor" strokeWidth="3.5" strokeLinecap="round">
        <path d="M 245,60 L 245,100" />
        <path d="M 295,60 L 295,100" />
      </g>
      {/* E-field — three horizontal hairlines between plates */}
      <g stroke="currentColor" strokeWidth="1" strokeDasharray="2 3" opacity="0.5">
        <path d="M 251,68 L 289,68" />
        <path d="M 251,80 L 289,80" />
        <path d="M 251,92 L 289,92" />
      </g>
      {/* + / − polarity, just outside the plates at top-rail height */}
      <g fontFamily="inherit" fill="currentColor" fontSize="12" fontWeight="700" opacity="0.7">
        <text x="241" y="55" textAnchor="end">+</text>
        <text x="299" y="55" textAnchor="start">−</text>
      </g>
      {/* C designator */}
      <text x="270" y="42" fontSize="17" textAnchor="middle" fontStyle="italic" fontWeight="700" fill="currentColor">
        C
      </text>

      {/* ── INDUCTOR (bottom branch) — side-view solenoid ── */}
      {/* Layer 1: BACK passes (drawn first, sit behind the cylinder) */}
      <g stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" opacity="0.65">
        <path d="M 240,130 C 250,130 245,170 255,170" />
        <path d="M 270,130 C 280,130 275,170 285,170" />
        <path d="M 300,130 C 310,130 305,170 315,170" />
      </g>
      {/* Layer 2: Cylinder body — solid occluder so back passes are hidden behind */}
      <g>
        <path
          d="M 215,140 L 325,140 A 5 10 0 0 1 325,160 L 215,160 Z"
          fill="hsl(var(--background))"
        />
        <path
          d="M 215,140 L 325,140 A 5 10 0 0 1 325,160 L 215,160 Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        {/* Left end-cap ellipse (the visible "near" face of the cylinder) */}
        <ellipse cx="215" cy="150" rx="5" ry="10" fill="hsl(var(--background))" stroke="currentColor" strokeWidth="1.5" />
      </g>
      {/* Layer 3: FRONT passes (drawn after cylinder, in front of it) */}
      <g stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M 225,170 C 235,170 230,130 240,130" />
        <path d="M 255,170 C 265,170 260,130 270,130" />
        <path d="M 285,170 C 295,170 290,130 300,130" />
      </g>
      {/* L designator */}
      <text x="270" y="200" fontSize="17" textAnchor="middle" fontStyle="italic" fontWeight="700" fill="currentColor">
        L
      </text>

      {/* ── Caption: resonance formula ── */}
      <text x="270" y="217" fontSize="14" textAnchor="middle" fill="currentColor">
        <tspan fontStyle="italic" fontWeight="700">f</tspan>
        <tspan baselineShift="sub" fontSize="10">0</tspan>
        {' = 1 / (2π√'}
        <tspan fontStyle="italic" fontWeight="700">L</tspan>
        <tspan fontStyle="italic" fontWeight="700">C</tspan>
        {')'}
      </text>
    </svg>
  )
}
