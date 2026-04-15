/**
 * Chapter 0.3 hero — an open notebook with hand-written equations beside a
 * slide rule and a sharpened pencil. The toolkit of pre-calculator maths.
 *
 * Note: a couple of `<text>` elements use `fill="currentColor"` + `stroke="none"`
 * so the equations read as ink glyphs rather than stroked outlines.
 */
export default function Ch0_3Hero() {
  return (
    <svg
      width="420" height="140" viewBox="0 0 420 140"
      fill="none" stroke="currentColor" strokeWidth={1.3}
      strokeLinecap="round" strokeLinejoin="round"
      aria-hidden
    >
      {/* Desk */}
      <line x1="20" y1="118" x2="400" y2="118" />
      <g strokeWidth={0.6} opacity={0.45}>
        <line x1="30"  y1="122" x2="60"  y2="135" />
        <line x1="70"  y1="122" x2="100" y2="135" />
        <line x1="110" y1="122" x2="140" y2="135" />
        <line x1="150" y1="122" x2="180" y2="135" />
        <line x1="190" y1="122" x2="220" y2="135" />
        <line x1="230" y1="122" x2="260" y2="135" />
        <line x1="270" y1="122" x2="300" y2="135" />
        <line x1="310" y1="122" x2="340" y2="135" />
        <line x1="350" y1="122" x2="380" y2="135" />
      </g>

      {/* Open notebook (left) */}
      <rect x="30" y="48" width="140" height="62" rx="2" />
      <line x1="100" y1="48" x2="100" y2="110" strokeWidth={0.7} opacity={0.55} />
      <g strokeWidth={0.55} opacity={0.65}>
        <line x1="40" y1="58" x2="92" y2="58" />
        <line x1="40" y1="66" x2="92" y2="66" />
        <line x1="40" y1="74" x2="88" y2="74" />
        <line x1="40" y1="82" x2="92" y2="82" />
        <line x1="40" y1="90" x2="80" y2="90" />
        <line x1="40" y1="98" x2="90" y2="98" />
      </g>
      {/* Hand-written equations on the right-hand page */}
      <g strokeWidth={0.9}>
        <path d="M 108 62 l 6 -4 l 6 8 l 6 -8 l 6 8" />
        <text x="128" y="66" fontFamily="Georgia, serif" fontStyle="italic" fontSize={9}
              fill="currentColor" stroke="none">= 10³</text>
        <path d="M 108 78 l 4 -4 l 4 8 l 4 -8 l 4 8 l 4 -8" />
        <text x="130" y="82" fontFamily="Georgia, serif" fontStyle="italic" fontSize={9}
              fill="currentColor" stroke="none">µ = 10⁻⁶</text>
        <line x1="108" y1="94" x2="160" y2="94" />
      </g>

      {/* Slide rule (centre, slightly tilted) */}
      <g transform="translate(220, 62) rotate(-8)">
        <rect x="-50" y="-10" width="160" height="20" rx="2" />
        <rect x="-50" y="-4"  width="160" height="8"  strokeWidth={0.9} />
        {/* Major ticks on outer scales */}
        <g strokeWidth={0.6}>
          <line x1="-40" y1="-10" x2="-40" y2="-6" />
          <line x1="-20" y1="-10" x2="-20" y2="-6" />
          <line x1="0"   y1="-10" x2="0"   y2="-6" />
          <line x1="20"  y1="-10" x2="20"  y2="-6" />
          <line x1="40"  y1="-10" x2="40"  y2="-6" />
          <line x1="60"  y1="-10" x2="60"  y2="-6" />
          <line x1="80"  y1="-10" x2="80"  y2="-6" />
          <line x1="100" y1="-10" x2="100" y2="-6" />
          <line x1="-40" y1="10"  x2="-40" y2="6" />
          <line x1="-20" y1="10"  x2="-20" y2="6" />
          <line x1="0"   y1="10"  x2="0"   y2="6" />
          <line x1="20"  y1="10"  x2="20"  y2="6" />
          <line x1="40"  y1="10"  x2="40"  y2="6" />
          <line x1="60"  y1="10"  x2="60"  y2="6" />
          <line x1="80"  y1="10"  x2="80"  y2="6" />
          <line x1="100" y1="10"  x2="100" y2="6" />
        </g>
        {/* Cursor (glass slider) */}
        <rect x="28" y="-14" width="12" height="28" strokeWidth={1.2} />
        <line x1="34" y1="-14" x2="34" y2="14" strokeWidth={0.6} opacity={0.7} />
      </g>

      {/* Pencil (right, angled) */}
      <g transform="translate(350, 96) rotate(-38)">
        <rect x="-40" y="-4" width="70" height="8" />
        <polygon points="30,-4 40,0 30,4" strokeWidth={1.1} />
        <line x1="36" y1="-1" x2="40" y2="0" strokeWidth={0.7} />
        <line x1="36" y1="1"  x2="40" y2="0" strokeWidth={0.7} />
        {/* Eraser end */}
        <rect x="-40" y="-4" width="8" height="8" strokeWidth={0.9} />
        {/* Ferrule rings */}
        <line x1="-32" y1="-4" x2="-32" y2="4" strokeWidth={0.6} />
        <line x1="-30" y1="-4" x2="-30" y2="4" strokeWidth={0.6} />
      </g>
    </svg>
  )
}
