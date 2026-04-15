/**
 * Chapter 0.2 hero — a workbench holding a multimeter, an oscilloscope
 * (with sine-wave trace), and a breadboard with a jumper wire arching over.
 */
export default function Ch0_2Hero() {
  return (
    <svg
      width="420" height="140" viewBox="0 0 420 140"
      fill="none" stroke="currentColor" strokeWidth={1.3}
      strokeLinecap="round" strokeLinejoin="round"
      aria-hidden
    >
      {/* Bench surface */}
      <line x1="20" y1="110" x2="400" y2="110" />
      <line x1="40" y1="116" x2="380" y2="116" strokeWidth={0.8} opacity={0.6} />
      {/* Shadow cross-hatch */}
      <g strokeWidth={0.6} opacity={0.45}>
        <line x1="30"  y1="118" x2="60"  y2="132" />
        <line x1="70"  y1="118" x2="100" y2="132" />
        <line x1="110" y1="118" x2="140" y2="132" />
        <line x1="150" y1="118" x2="180" y2="132" />
        <line x1="190" y1="118" x2="220" y2="132" />
        <line x1="230" y1="118" x2="260" y2="132" />
        <line x1="270" y1="118" x2="300" y2="132" />
        <line x1="310" y1="118" x2="340" y2="132" />
        <line x1="350" y1="118" x2="380" y2="132" />
      </g>

      {/* Multimeter (left) */}
      <rect x="50" y="58" width="90" height="52" rx="4" />
      <circle cx="95" cy="82" r="12" strokeWidth={1} />
      <line x1="95" y1="82" x2="104" y2="74" strokeWidth={0.9} />
      <rect x="62" y="66" width="66" height="8" rx="1" strokeWidth={0.9} />
      <circle cx="72"  cy="102" r="2.5" strokeWidth={0.9} />
      <circle cx="118" cy="102" r="2.5" strokeWidth={0.9} />

      {/* Oscilloscope (centre) */}
      <rect x="160" y="42" width="130" height="68" rx="4" />
      <rect x="168" y="52" width="86" height="48" rx="2" strokeWidth={0.9} />
      <path d="M 172 76 Q 183 58, 193 76 T 213 76 T 233 76 T 253 76" strokeWidth={1} />
      {/* Graticule */}
      <g strokeWidth={0.5} opacity={0.5}>
        <line x1="189" y1="56" x2="189" y2="96" />
        <line x1="211" y1="56" x2="211" y2="96" />
        <line x1="233" y1="56" x2="233" y2="96" />
        <line x1="168" y1="76" x2="254" y2="76" />
      </g>
      {/* Knobs */}
      <circle cx="267" cy="62" r="4" strokeWidth={0.9} />
      <circle cx="279" cy="62" r="4" strokeWidth={0.9} />
      <circle cx="267" cy="78" r="4" strokeWidth={0.9} />
      <circle cx="279" cy="78" r="4" strokeWidth={0.9} />

      {/* Breadboard (right) */}
      <rect x="305" y="78" width="80" height="32" rx="3" />
      <g strokeWidth={0.4} opacity={0.55}>
        <line x1="310" y1="86"  x2="380" y2="86" />
        <line x1="310" y1="92"  x2="380" y2="92" />
        <line x1="310" y1="98"  x2="380" y2="98" />
        <line x1="310" y1="104" x2="380" y2="104" />
      </g>
      {/* Jumper wire arcing above */}
      <path d="M 318 78 C 330 50, 360 50, 372 78" strokeWidth={0.9} />
    </svg>
  )
}
