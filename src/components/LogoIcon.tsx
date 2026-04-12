/**
 * The Radio Bench logo — Antenna Pulse.
 * A vertical mast with ground radials and radiating signal arcs.
 * Uses currentColor via the `text-primary` class for theme-aware colouring.
 *
 * Every 6 seconds the signal arcs play a sequential propagation burst
 * (close → mid → far) then fade back to their resting opacity.
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
      className={`rounded-lg bg-primary/20 flex items-center justify-center shrink-0 ${className}`}
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
        <style>{`
          @keyframes arc-pulse {
            0%, 12% { opacity: var(--rest); }
            16%     { opacity: 1; }
            28%, 100% { opacity: var(--rest); }
          }
          @keyframes dot-ping {
            0%, 10% { r: 2.4; opacity: 1; }
            15%     { r: 3;   opacity: 1; }
            25%, 100% { r: 2.4; opacity: 1; }
          }
          .arc-close  { --rest: 1;    animation: arc-pulse 3s ease-in-out infinite; animation-delay: 0s; }
          .arc-mid    { --rest: 0.8;  animation: arc-pulse 3s ease-in-out infinite; animation-delay: 0.15s; }
          .arc-far    { --rest: 0.55; animation: arc-pulse 3s ease-in-out infinite; animation-delay: 0.3s; }
          .feed-dot   { animation: dot-ping 3s ease-in-out infinite; }
        `}</style>

        {/* Antenna mast */}
        <line
          x1="19" y1="7" x2="19" y2="31"
          stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"
        />
        {/* Ground radials */}
        <line
          x1="19" y1="31" x2="12" y2="33"
          stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.7"
        />
        <line
          x1="19" y1="31" x2="26" y2="33"
          stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.7"
        />
        {/* Signal arcs — close */}
        <path
          className="arc-close"
          d="M24 12 Q27 15 24 18"
          stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round"
        />
        {/* Signal arcs — mid */}
        <path
          className="arc-mid"
          d="M27 9 Q31.5 15 27 21"
          stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"
        />
        {/* Signal arcs — far */}
        <path
          className="arc-far"
          d="M30 6 Q36 15 30 24"
          stroke="currentColor" strokeWidth="1.3" fill="none" strokeLinecap="round"
        />
        {/* Feed-point dot */}
        <circle className="feed-dot" cx="19" cy="7" r="2.4" fill="currentColor" />
      </svg>
    </div>
  )
}
