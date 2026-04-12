import type { SVGProps } from 'react'

/**
 * Animated pip-boy style mascot waving hello.
 *
 * Same aesthetic as the callout icons (circle head, stick limbs,
 * accent shapes) but larger, with a CSS-animated waving right arm
 * and gentle floating motion on the whole figure.
 */
export default function WelcomeBuddy({
  size = 120,
  className = '',
  ...rest
}: SVGProps<SVGSVGElement> & { size?: number }) {
  const g = {
    strokeWidth: 2.5,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Friendly mascot waving hello"
      {...rest}
    >
      <style>{`
        @keyframes wave {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-20deg); }
          50% { transform: rotate(12deg); }
          75% { transform: rotate(-14deg); }
        }
        @keyframes bob {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-1.5px); }
        }
        .buddy-body { animation: bob 3s ease-in-out infinite; }
        .buddy-wave-arm {
          transform-origin: 28px 28px;
          animation: wave 1.8s ease-in-out infinite;
        }
        @keyframes blink-eyes {
          0%, 42%, 48%, 100% { transform: scaleY(1); }
          45% { transform: scaleY(0.1); }
        }
        .buddy-eyes {
          transform-origin: 26px 14px;
          animation: blink-eyes 4s ease-in-out infinite;
        }
        @keyframes glow-pulse {
          0%, 100% { opacity: 0.15; }
          50% { opacity: 0.3; }
        }
        .buddy-glow { animation: glow-pulse 2.5s ease-in-out infinite; }
      `}</style>

      <g stroke="currentColor" {...g} className="buddy-body">
        {/* ── Head ──────────────────────────────────────────────── */}
        <circle cx={26} cy={14} r={8} fill="currentColor" fillOpacity={0.1} />

        {/* ── Eyes (blink together) ─────────────────────────────── */}
        <g className="buddy-eyes">
          <circle cx={23} cy={13} r={1.2} fill="currentColor" stroke="none" />
          <circle cx={29} cy={13} r={1.2} fill="currentColor" stroke="none" />
        </g>

        {/* ── Happy smile ──────────────────────────────────────── */}
        <path d="M22.5,17 Q26,21 29.5,17" fill="none" />

        {/* ── Body ─────────────────────────────────────────────── */}
        <line x1={26} y1={22} x2={26} y2={40} />

        {/* ── Left arm (relaxed, slight bend) ──────────────────── */}
        <path d="M26,28 L16,34 L14,40" fill="none" />

        {/* ── Right arm (waving!) ──────────────────────────────── */}
        <g className="buddy-wave-arm">
          <path d="M26,28 L38,20 L42,12" fill="none" />
          {/* Hand (open palm) */}
          <line x1={42} y1={12} x2={40} y2={8} />
          <line x1={42} y1={12} x2={44} y2={8} />
          <line x1={42} y1={12} x2={46} y2={10} />
        </g>

        {/* ── Legs ─────────────────────────────────────────────── */}
        <line x1={26} y1={40} x2={18} y2={54} />
        <line x1={26} y1={40} x2={34} y2={54} />
        {/* Feet */}
        <line x1={18} y1={54} x2={14} y2={54} />
        <line x1={34} y1={54} x2={38} y2={54} />

        {/* ── Radio wave arcs from waving hand ─────────────────── */}
        <path className="buddy-glow" d="M48,8 Q52,12 48,16" fill="none" strokeWidth={2} opacity={0.4} />
        <path className="buddy-glow" d="M52,5 Q58,12 52,19" fill="none" strokeWidth={1.5} opacity={0.25} />
      </g>
    </svg>
  )
}
