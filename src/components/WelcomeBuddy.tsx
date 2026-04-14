import type { SVGProps } from 'react'

/**
 * Retro cartoon mascot — "Radio Boy" waving hello.
 *
 * Inspired by vintage mascot art: round face with visible nose,
 * eyebrows, toothy grin, voluminous wavy hair, winking eye,
 * proper body with jumpsuit, thick limbs, and boots.
 * Monochrome — uses currentColor for full theme adaptability.
 */
export default function WelcomeBuddy({
  size = 120,
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
      aria-label="Friendly mascot waving hello"
      {...rest}
    >
      <style>{`
        @keyframes rb-wave {
          0%, 100% { transform: rotate(0deg); }
          20%  { transform: rotate(-16deg); }
          40%  { transform: rotate(10deg); }
          60%  { transform: rotate(-10deg); }
          80%  { transform: rotate(6deg); }
        }
        @keyframes rb-bob {
          0%, 100% { transform: translateY(0); }
          50%      { transform: translateY(-1.2px); }
        }
        @keyframes rb-wink {
          0%, 88%, 94%, 100% { transform: scaleY(1); }
          91% { transform: scaleY(0.08); }
        }
        @keyframes rb-glow {
          0%, 100% { opacity: 0.18; }
          50%      { opacity: 0.4; }
        }
        .rb-body     { animation: rb-bob 3.5s ease-in-out infinite; }
        .rb-wave-arm { transform-origin: 50px 30px; animation: rb-wave 2s ease-in-out infinite; }
        .rb-wink     { transform-origin: 33px 18px; animation: rb-wink 3.5s ease-in-out infinite; }
        .rb-glow     { animation: rb-glow 2.5s ease-in-out infinite; }
      `}</style>

      <g
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="rb-body"
      >
        {/* ── Head ─────────────────────────────────────────────── */}
        <circle cx={40} cy={19} r={13} fill="currentColor" fillOpacity={0.07} strokeWidth={2} />

        {/* ── Hair — voluminous wavy top ────────────────────────── */}
        <path
          d="M28,14 Q29,4 36,5 Q40,2 44,5 Q50,4 52,12 Q53,15 51,17"
          fill="currentColor" fillOpacity={0.15} strokeWidth={1.8}
        />
        {/* Hair detail lines */}
        <path d="M34,6 Q37,8 36,11" fill="none" strokeWidth={1.2} opacity={0.3} />
        <path d="M42,5 Q44,8 42,10" fill="none" strokeWidth={1.2} opacity={0.3} />

        {/* ── Eyebrows ─────────────────────────────────────────── */}
        <path d="M33,13 Q35,11 38,12.5" fill="none" strokeWidth={1.8} />
        <path d="M43,12.5 Q46,11 48,13" fill="none" strokeWidth={1.8} />

        {/* ── Eyes ─────────────────────────────────────────────── */}
        {/* Left eye — winks */}
        <g className="rb-wink">
          <ellipse cx={35.5} cy={16.5} rx={2} ry={2.2} fill="currentColor" fillOpacity={0.12} strokeWidth={1.3} />
          <circle cx={35.5} cy={16.5} r={1} fill="currentColor" stroke="none" />
        </g>
        {/* Right eye — open */}
        <ellipse cx={44.5} cy={16.5} rx={2} ry={2.2} fill="currentColor" fillOpacity={0.12} strokeWidth={1.3} />
        <circle cx={44.5} cy={16.5} r={1} fill="currentColor" stroke="none" />

        {/* ── Nose ─────────────────────────────────────────────── */}
        <path d="M40,18 Q41,20.5 39.5,21" fill="none" strokeWidth={1.5} />

        {/* ── Big grin ─────────────────────────────────────────── */}
        <path
          d="M34,24 Q37,28.5 40,28.5 Q43,28.5 46,24"
          fill="currentColor" fillOpacity={0.05} strokeWidth={1.8}
        />
        {/* Teeth line */}
        <line x1={35.5} y1={25.5} x2={44.5} y2={25.5} strokeWidth={1} opacity={0.3} />

        {/* ── Chin ─────────────────────────────────────────────── */}
        <path d="M36,29 Q40,32 44,29" fill="none" strokeWidth={1.2} opacity={0.25} />

        {/* ── Collar / neck ────────────────────────────────────── */}
        <path d="M34,32 L40,35 L46,32" fill="none" strokeWidth={1.6} opacity={0.5} />

        {/* ── Torso (jumpsuit) ─────────────────────────────────── */}
        <path
          d="M29,34 Q28,33 30,32 L50,32 Q52,33 51,34 L52,52 L28,52 Z"
          fill="currentColor" fillOpacity={0.05} strokeWidth={1.8}
        />
        {/* Chest line / zipper */}
        <line x1={40} y1={35} x2={40} y2={48} strokeWidth={1} opacity={0.2} />

        {/* ── Belt ─────────────────────────────────────────────── */}
        <line x1={28} y1={49} x2={52} y2={49} strokeWidth={2} opacity={0.35} />
        <rect x={38} y={47.5} width={4} height={3.5} rx={0.8} fill="none" strokeWidth={1.2} opacity={0.4} />

        {/* ── Left arm (hand on hip) ───────────────────────────── */}
        <path d="M29,36 L20,40 L22,48 L28,46" fill="none" strokeWidth={2.8} />
        {/* Fist */}
        <circle cx={21} cy={40} r={2.5} fill="currentColor" fillOpacity={0.06} strokeWidth={1.5} />

        {/* ── Right arm (waving!) ──────────────────────────────── */}
        <g className="rb-wave-arm">
          <path d="M51,36 L58,24 L60,16" fill="none" strokeWidth={2.8} />
          {/* Open hand — palm + fingers */}
          <ellipse cx={61} cy={13} rx={3.5} ry={4} fill="currentColor" fillOpacity={0.06} strokeWidth={1.5} />
          <line x1={59} y1={10} x2={58} y2={6} strokeWidth={1.6} />
          <line x1={61} y1={9} x2={61} y2={5} strokeWidth={1.6} />
          <line x1={63} y1={10} x2={64} y2={6.5} strokeWidth={1.6} />
          <line x1={64.5} y1={12} x2={66} y2={9.5} strokeWidth={1.3} />
        </g>

        {/* ── Legs ─────────────────────────────────────────────── */}
        <path d="M34,52 L31,65" fill="none" strokeWidth={3} />
        <path d="M46,52 L49,65" fill="none" strokeWidth={3} />

        {/* ── Boots ────────────────────────────────────────────── */}
        <path
          d="M31,65 L27,66.5 Q25.5,67 26,65.5 L27,64"
          fill="currentColor" fillOpacity={0.08} strokeWidth={2.2}
        />
        <path
          d="M49,65 L53,66.5 Q54.5,67 54,65.5 L53,64"
          fill="currentColor" fillOpacity={0.08} strokeWidth={2.2}
        />

        {/* ── Radio waves from hand ────────────────────────────── */}
        <path
          className="rb-glow"
          d="M68,8 Q72,13 68,18"
          fill="none" strokeWidth={1.8} opacity={0.4}
        />
        <path
          className="rb-glow"
          d="M72,4 Q78,13 72,22"
          fill="none" strokeWidth={1.4} opacity={0.25}
        />
      </g>
    </svg>
  )
}
