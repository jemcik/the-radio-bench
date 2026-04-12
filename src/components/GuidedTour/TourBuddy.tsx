import type { SVGProps } from 'react'

/**
 * Compact retro cartoon mascot for tour cards — pointing variant.
 *
 * Same "Radio Boy" style as WelcomeBuddy (round face, nose, eyebrows,
 * grin, wavy hair, jumpsuit) but right arm points forward.
 */
export default function TourBuddy({
  size = 44,
  className = '',
  ...rest
}: SVGProps<SVGSVGElement> & { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...rest}
    >
      <style>{`
        @keyframes tb-point {
          0%, 100% { transform: translateX(0); }
          50%      { transform: translateX(3px); }
        }
        .tb-point { animation: tb-point 1.2s ease-in-out infinite; }
      `}</style>

      <g
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* ── Head ─────────────────────────────────────────────── */}
        <circle cx={36} cy={19} r={13} fill="currentColor" fillOpacity={0.07} strokeWidth={2} />

        {/* ── Hair — voluminous wavy top ────────────────────────── */}
        <path
          d="M24,14 Q25,4 32,5 Q36,2 40,5 Q46,4 48,12 Q49,15 47,17"
          fill="currentColor" fillOpacity={0.15} strokeWidth={1.8}
        />
        <path d="M30,6 Q33,8 32,11" fill="none" strokeWidth={1.2} opacity={0.3} />
        <path d="M38,5 Q40,8 38,10" fill="none" strokeWidth={1.2} opacity={0.3} />

        {/* ── Eyebrows ─────────────────────────────────────────── */}
        <path d="M29,13 Q31,11 34,12.5" fill="none" strokeWidth={1.8} />
        <path d="M39,12.5 Q42,11 44,13" fill="none" strokeWidth={1.8} />

        {/* ── Eyes ─────────────────────────────────────────────── */}
        <ellipse cx={31.5} cy={16.5} rx={2} ry={2.2} fill="currentColor" fillOpacity={0.12} strokeWidth={1.3} />
        <circle cx={31.5} cy={16.5} r={1} fill="currentColor" stroke="none" />
        <ellipse cx={40.5} cy={16.5} rx={2} ry={2.2} fill="currentColor" fillOpacity={0.12} strokeWidth={1.3} />
        <circle cx={40.5} cy={16.5} r={1} fill="currentColor" stroke="none" />

        {/* ── Nose ─────────────────────────────────────────────── */}
        <path d="M36,18 Q37,20.5 35.5,21" fill="none" strokeWidth={1.5} />

        {/* ── Big grin ─────────────────────────────────────────── */}
        <path
          d="M30,24 Q33,28.5 36,28.5 Q39,28.5 42,24"
          fill="currentColor" fillOpacity={0.05} strokeWidth={1.8}
        />
        <line x1={31.5} y1={25.5} x2={40.5} y2={25.5} strokeWidth={1} opacity={0.3} />

        {/* ── Collar ───────────────────────────────────────────── */}
        <path d="M30,32 L36,35 L42,32" fill="none" strokeWidth={1.6} opacity={0.5} />

        {/* ── Torso ────────────────────────────────────────────── */}
        <path
          d="M25,34 Q24,33 26,32 L46,32 Q48,33 47,34 L48,52 L24,52 Z"
          fill="currentColor" fillOpacity={0.05} strokeWidth={1.8}
        />
        <line x1={36} y1={35} x2={36} y2={48} strokeWidth={1} opacity={0.2} />

        {/* ── Belt ─────────────────────────────────────────────── */}
        <line x1={24} y1={49} x2={48} y2={49} strokeWidth={2} opacity={0.35} />

        {/* ── Left arm (hand on hip) ───────────────────────────── */}
        <path d="M25,36 L16,40 L18,48 L24,46" fill="none" strokeWidth={2.8} />
        <circle cx={17} cy={40} r={2.5} fill="currentColor" fillOpacity={0.06} strokeWidth={1.5} />

        {/* ── Right arm (pointing!) ────────────────────────────── */}
        <g className="tb-point">
          <path d="M47,38 L62,34" fill="none" strokeWidth={2.8} />
          {/* Pointing hand */}
          <circle cx={63} cy={34} r={2.5} fill="currentColor" fillOpacity={0.06} strokeWidth={1.5} />
          <line x1={65} y1={33} x2={70} y2={32} strokeWidth={2} />
          {/* Arrow tip */}
          <path d="M67,29 L72,32 L67,35" fill="none" strokeWidth={1.8} />
        </g>

        {/* ── Legs ─────────────────────────────────────────────── */}
        <path d="M30,52 L27,65" fill="none" strokeWidth={3} />
        <path d="M42,52 L45,65" fill="none" strokeWidth={3} />

        {/* ── Boots ────────────────────────────────────────────── */}
        <path
          d="M27,65 L23,66.5 Q21.5,67 22,65.5 L23,64"
          fill="currentColor" fillOpacity={0.08} strokeWidth={2.2}
        />
        <path
          d="M45,65 L49,66.5 Q50.5,67 50,65.5 L49,64"
          fill="currentColor" fillOpacity={0.08} strokeWidth={2.2}
        />
      </g>
    </svg>
  )
}
