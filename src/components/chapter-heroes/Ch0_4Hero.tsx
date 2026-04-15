/**
 * Chapter 0.4 hero — a vintage VU meter with its needle deflected slightly
 * above zero. The visual shorthand for "measurement in decibels".
 *
 * Geometry:
 *   • Outer chassis: rect(-120, -50, 240, 104)
 *   • Inner bezel:   rect(-110, -42, 220, 80)
 *   • Scale arc:     radius 48 centred on the pivot at (0, 32); spans
 *                    from (-48, 32) through (0, -16) to (48, 32), i.e.
 *                    sits wholly inside the inner bezel (top of arc at
 *                    y = -16, well below the bezel's y = -42 ceiling).
 *   • Ticks:         7 at 30° steps, each 6 units long pointing radially
 *                    outward (from r=48 to r=54).
 *   • Labels:        centred at r=62, using the i-th tick's angle.
 *   • Needle:        from pivot to r=50 at θ≈78° (a few dB above zero).
 */
export default function Ch0_4Hero() {
  return (
    <svg
      width="420" height="140" viewBox="0 0 420 140"
      fill="none" stroke="currentColor" strokeWidth={1.3}
      strokeLinecap="round" strokeLinejoin="round"
      aria-hidden
    >
      {/* Shelf */}
      <line x1="40" y1="124" x2="380" y2="124" />
      <g strokeWidth={0.6} opacity={0.45}>
        <line x1="60"  y1="126" x2="85"  y2="136" />
        <line x1="100" y1="126" x2="125" y2="136" />
        <line x1="140" y1="126" x2="165" y2="136" />
        <line x1="180" y1="126" x2="205" y2="136" />
        <line x1="220" y1="126" x2="245" y2="136" />
        <line x1="260" y1="126" x2="285" y2="136" />
        <line x1="300" y1="126" x2="325" y2="136" />
        <line x1="340" y1="126" x2="365" y2="136" />
      </g>

      {/* VU meter body — origin at centre of inner bezel */}
      <g transform="translate(210,68)">
        {/* Outer chassis */}
        <rect x="-120" y="-50" width="240" height="104" rx="6" />
        {/* Inner bezel */}
        <rect x="-110" y="-42" width="220" height="80"  rx="3" strokeWidth={0.9} />

        {/* Scale arc (radius 48, pivot at 0,32) */}
        <path d="M -48 32 A 48 48 0 0 1 48 32" strokeWidth={0.9} />

        {/* Tick marks — 7 at 30° steps, each r=48→54 radially */}
        <g strokeWidth={0.9}>
          {/* 180°: left-most */}
          <line x1="-48" y1="32" x2="-54" y2="32" />
          {/* 150° */}
          <line x1="-41.6" y1="8" x2="-46.8" y2="5" />
          {/* 120° */}
          <line x1="-24" y1="-9.6" x2="-27" y2="-14" />
          {/* 90°: top */}
          <line x1="0" y1="-16" x2="0" y2="-22" />
          {/* 60° */}
          <line x1="24" y1="-9.6" x2="27" y2="-14" />
          {/* 30° */}
          <line x1="41.6" y1="8" x2="46.8" y2="5" />
          {/* 0°: right-most */}
          <line x1="48" y1="32" x2="54" y2="32" />
        </g>

        {/* Scale labels at r≈62, centred at each tick's angle */}
        <g fontFamily="Georgia, serif" fontSize={7.5} stroke="none" fill="currentColor" textAnchor="middle">
          <text x="-62" y="36">−20</text>
          <text x="-54" y="2">−10</text>
          <text x="-31" y="-22">−3</text>
          <text x="0"   y="-30">0</text>
          <text x="31"  y="-22">+3</text>
          <text x="54"  y="2">+10</text>
        </g>

        {/* "VU" engraving just below the scale, above the pivot */}
        <text x="0" y="22" fontFamily="Georgia, serif" fontStyle="italic" fontSize={10}
              stroke="none" fill="currentColor" textAnchor="middle" opacity={0.75}>VU</text>

        {/* Pivot + needle (deflected to θ≈78°, i.e. just past 0) */}
        <circle cx="0" cy="32" r="2.5" fill="currentColor" stroke="none" />
        <line x1="0" y1="32" x2="10" y2="-17" strokeWidth={1.3} />
      </g>

      {/* Fountain-pen "dB" marking (top right) */}
      <text x="340" y="34" fontFamily="Georgia, serif" fontStyle="italic" fontSize={22}
            stroke="none" fill="currentColor">dB</text>
      <path d="M 338 42 Q 348 48, 368 42" strokeWidth={0.9} opacity={0.7} />
    </svg>
  )
}
