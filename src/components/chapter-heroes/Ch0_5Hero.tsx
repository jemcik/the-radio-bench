/**
 * Chapter 0.5 hero — a schematic sheet and pencil. The circuit on the
 * sheet is a deliberate miniature of the chapter's walkthrough example:
 * battery → current-limiting resistor → LED → back. The pencil evokes
 * "you'll be reading these by hand very soon".
 *
 * All strokes use `currentColor` so the sketch inherits the page's
 * `--sketch-stroke` token and adapts to every theme.
 */
export default function Ch0_5Hero() {
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

      {/* Schematic sheet of paper — slightly tilted */}
      <g transform="translate(60, 34) rotate(-3)">
        {/* Sheet outline */}
        <rect x="0" y="0" width="240" height="78" strokeWidth={1.1} />

        {/* Faint horizontal ruling lines (like notebook paper) */}
        <g strokeWidth={0.4} opacity={0.4}>
          <line x1="0" y1="14" x2="240" y2="14" />
          <line x1="0" y1="28" x2="240" y2="28" />
          <line x1="0" y1="42" x2="240" y2="42" />
          <line x1="0" y1="56" x2="240" y2="56" />
          <line x1="0" y1="70" x2="240" y2="70" />
        </g>

        {/* — Circuit drawn on the sheet: battery → resistor → LED loop */}
        {/* Top wire */}
        <line x1="42"  y1="28" x2="70"  y2="28" strokeWidth={1.1} />
        {/* Resistor zigzag */}
        <path d="M 70 28 l 3 -5 l 6 10 l 6 -10 l 6 10 l 6 -10 l 3 5" strokeWidth={1.1} />
        <line x1="100" y1="28" x2="130" y2="28" strokeWidth={1.1} />

        {/* LED triangle + bar + arrows (standard LED symbol) */}
        <polygon points="130,22 130,34 142,28" strokeWidth={1.1} />
        <line x1="142" y1="22" x2="142" y2="34" strokeWidth={1.1} />
        {/* Two outward arrows (photons) */}
        <g strokeWidth={0.8}>
          <line x1="136" y1="18" x2="146" y2="12" />
          <polyline points="143,12 146,12 146,15" />
          <line x1="140" y1="16" x2="150" y2="10" />
          <polyline points="147,10 150,10 150,13" />
        </g>

        {/* Right wire down, then back across the bottom to battery */}
        <line x1="142" y1="28" x2="160" y2="28" strokeWidth={1.1} />
        <line x1="160" y1="28" x2="160" y2="58" strokeWidth={1.1} />
        <line x1="160" y1="58" x2="42"  y2="58" strokeWidth={1.1} />
        <line x1="42"  y1="28" x2="42"  y2="48" strokeWidth={1.1} />

        {/* Battery symbol (long plate + short plate) */}
        <line x1="42"  y1="48" x2="42"  y2="58" strokeWidth={1.1} />
        <line x1="36"  y1="48" x2="48"  y2="48" strokeWidth={1.4} />
        <line x1="38"  y1="53" x2="46"  y2="53" strokeWidth={1.1} />

        {/* Reference designators */}
        <text x="85"  y="18" fontFamily="Georgia, serif" fontStyle="italic" fontSize={8}
              fill="currentColor" stroke="none" textAnchor="middle">R₁</text>
        <text x="136" y="45" fontFamily="Georgia, serif" fontStyle="italic" fontSize={8}
              fill="currentColor" stroke="none" textAnchor="middle">D₁</text>
        <text x="28"  y="55" fontFamily="Georgia, serif" fontStyle="italic" fontSize={8}
              fill="currentColor" stroke="none" textAnchor="middle">B₁</text>

        {/* Sheet title in the top-right corner */}
        <text x="220" y="10" fontFamily="Georgia, serif" fontStyle="italic" fontSize={7.5}
              fill="currentColor" stroke="none" textAnchor="end" opacity={0.75}>
          Fig. 0.5
        </text>
      </g>

      {/* Pencil resting across the lower right of the sheet, pointing NW */}
      <g transform="translate(340, 96) rotate(-38)">
        <rect x="-40" y="-4" width="70" height="8" />
        <polygon points="30,-4 40,0 30,4" strokeWidth={1.1} />
        <line x1="36" y1="-1" x2="40" y2="0" strokeWidth={0.7} />
        <line x1="36" y1="1"  x2="40" y2="0" strokeWidth={0.7} />
        {/* Eraser ferrule */}
        <rect x="-40" y="-4" width="8" height="8" strokeWidth={0.9} />
        <line x1="-32" y1="-4" x2="-32" y2="4" strokeWidth={0.6} />
        <line x1="-30" y1="-4" x2="-30" y2="4" strokeWidth={0.6} />
      </g>
    </svg>
  )
}
