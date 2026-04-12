/**
 * The Radio Bench logo — Antenna Pulse.
 * A vertical mast with ground radials and radiating signal arcs.
 * Uses currentColor via the `text-primary` class for theme-aware colouring.
 * Also replicated in public/favicon.svg.
 */

interface LogoIconProps {
  /** Overall size of the rounded square in pixels. Default: 32 */
  size?: number
  /** Extra Tailwind classes on the outer wrapper */
  className?: string
}

export default function LogoIcon({ size = 32, className = '' }: LogoIconProps) {
  return (
    <div
      className={`rounded-lg bg-primary/10 flex items-center justify-center shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 38 38"
        fill="none"
        className="text-primary"
      >
        {/* Antenna mast */}
        <line
          x1="19" y1="7" x2="19" y2="31"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round"
        />
        {/* Ground radials */}
        <line
          x1="19" y1="31" x2="12" y2="33"
          stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" opacity="0.5"
        />
        <line
          x1="19" y1="31" x2="26" y2="33"
          stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" opacity="0.5"
        />
        {/* Signal arcs — close */}
        <path
          d="M24 12 Q27 15 24 18"
          stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.9"
        />
        {/* Signal arcs — mid */}
        <path
          d="M27 9 Q31.5 15 27 21"
          stroke="currentColor" strokeWidth="1.3" fill="none" strokeLinecap="round" opacity="0.6"
        />
        {/* Signal arcs — far */}
        <path
          d="M30 6 Q36 15 30 24"
          stroke="currentColor" strokeWidth="1.1" fill="none" strokeLinecap="round" opacity="0.35"
        />
        {/* Feed-point dot */}
        <circle cx="19" cy="7" r="2.2" fill="currentColor" opacity="0.8" />
      </svg>
    </div>
  )
}
