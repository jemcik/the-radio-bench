/**
 * Chapter 1.7 hero — pen-and-ink sketch of an LC tank as a pendulum.
 *
 * Left:   capacitor (two plates with field lines between).
 * Right:  inductor (coil with field lines along its axis).
 * Joined by a top wire and a bottom wire (the loop).
 * Above: a curved double-headed arrow showing energy sloshing
 *         between the electric and magnetic stores.
 * Below: the resonance formula f₀ = 1 / (2π√LC) as a caption.
 *
 * All structural strokes use `currentColor` so the sketch adapts to
 * the active theme. No animation — the arrow makes the dynamic
 * narrative obvious without it.
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
      {/* ── Top wire of the loop ─────────────────────────────── */}
      <g stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M 130,90 L 410,90" />
        {/* ── Bottom wire of the loop ──────────────────────── */}
        <path d="M 130,150 L 410,150" />
      </g>

      {/* ── Left side: capacitor (vertical parallel plates) ─ */}
      <g stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        {/* Down-leads from the top wire and up-leads from the bottom wire */}
        <path d="M 130,90 L 130,112" />
        <path d="M 130,128 L 130,150" />
        {/* Two horizontal plates */}
        <path d="M 110,112 L 150,112" />
        <path d="M 110,128 L 150,128" />
      </g>
      {/* Electric-field hairlines between the plates (dashed) */}
      <g stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" opacity="0.45">
        <path d="M 118,112 L 118,128" />
        <path d="M 130,112 L 130,128" />
        <path d="M 142,112 L 142,128" />
      </g>
      {/* Capacitor label «C» — italic, just below the plates */}
      <text x="130" y="172" fontSize="16" textAnchor="middle" fontStyle="italic" fontWeight="700" fill="currentColor">
        C
      </text>

      {/* ── Right side: inductor (horizontal coil with bumps) */}
      <g stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {/* Lead from top wire down to coil top, lead from coil bottom to bottom wire */}
        <path d="M 410,90 L 410,108" />
        <path d="M 410,132 L 410,150" />
        {/* Vertical coil drawn as a column of arcs (5 bumps) on the right side */}
        <path d="M 410,108 a 5 4.8 0 0 1 0 9.6" />
        <path d="M 410,117.6 a 5 4.8 0 0 1 0 9.6" />
        <path d="M 410,127.2 a 5 4.8 0 0 1 0 4.8" />
        {/* Filling out the coil with a smoother stylised shape — three larger bumps */}
        <path d="M 380,108 q 12,0 12,12 t 12,12" />
        <path d="M 380,116 q 12,0 12,8 t 12,8" />
      </g>
      {/* Magnetic-field axial line (dashed) inside the coil */}
      <g stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" opacity="0.45">
        <path d="M 395,98 L 395,142" />
      </g>
      {/* Inductor label «L» — italic, just below the coil */}
      <text x="395" y="172" fontSize="16" textAnchor="middle" fontStyle="italic" fontWeight="700" fill="currentColor">
        L
      </text>

      {/* ── Energy-sloshing arrow above the loop ─────────────── */}
      <g stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none">
        {/* Curved arc spanning from the cap side to the inductor side */}
        <path d="M 145,55 C 220,15 320,15 395,55" opacity="0.7" />
        {/* Right-pointing arrowhead at the inductor end */}
        <path d="M 387,49 L 397,55 L 388,62" opacity="0.8" />
        {/* Left-pointing arrowhead at the capacitor end */}
        <path d="M 153,49 L 143,55 L 152,62" opacity="0.8" />
      </g>

      {/* ── Caption: the resonance formula ─────────────────── */}
      <text x="270" y="205" fontSize="16" textAnchor="middle" fill="currentColor">
        <tspan fontStyle="italic" fontWeight="700">f</tspan>
        <tspan baselineShift="sub" fontSize="11">0</tspan>
        {' = 1 / (2π√'}
        <tspan fontStyle="italic" fontWeight="700">L</tspan>
        <tspan fontStyle="italic" fontWeight="700">C</tspan>
        {')'}
      </text>
    </svg>
  )
}
