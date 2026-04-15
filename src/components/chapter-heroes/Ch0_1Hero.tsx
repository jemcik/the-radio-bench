/**
 * Chapter 0.1 hero — an open book with a magnifying glass hovering over a
 * small circuit diagram on the right-hand page. "Reader exploring the text."
 *
 * All strokes use `currentColor` so the sketch inherits the page's
 * `--foreground` and adapts to every theme automatically.
 */
export default function Ch0_1Hero() {
  return (
    <svg
      width="420" height="140" viewBox="0 0 420 140"
      fill="none" stroke="currentColor" strokeWidth={1.3}
      strokeLinecap="round" strokeLinejoin="round"
      aria-hidden
    >
      {/* Table surface */}
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

      {/* Open book, slight front-angle */}
      <path d="M 90 108 L 90 54 Q 90 48, 98 46 L 200 42 Q 212 42, 212 54 L 212 108 Z" />
      <path d="M 212 108 L 212 54 Q 212 42, 224 42 L 326 46 Q 334 48, 334 54 L 334 108 Z" />
      <line x1="212" y1="42" x2="212" y2="108" />

      {/* Page lines on the left page */}
      <g strokeWidth={0.55} opacity={0.65}>
        <line x1="104" y1="60"  x2="200" y2="58" />
        <line x1="104" y1="68"  x2="200" y2="66" />
        <line x1="104" y1="76"  x2="200" y2="74" />
        <line x1="104" y1="84"  x2="170" y2="82" />
        <line x1="104" y1="92"  x2="190" y2="90" />
        <line x1="104" y1="100" x2="150" y2="98" />
      </g>

      {/* Small schematic on the right page: resistor + wave */}
      <g strokeWidth={0.9}>
        <line x1="232" y1="72" x2="248" y2="72" />
        <path d="M 248 72 l 3 -5 l 6 10 l 6 -10 l 6 10 l 6 -10 l 3 5" />
        <line x1="278" y1="72" x2="298" y2="72" />
        <path d="M 232 92 Q 246 78, 260 92 T 288 92 T 316 92" />
      </g>

      {/* Magnifier hovering above the right page */}
      <g strokeWidth={1.4}>
        <circle cx="298" cy="76" r="22" />
        <line x1="314" y1="92" x2="342" y2="118" />
        <line x1="328" y1="104" x2="336" y2="112" strokeWidth={1.6} />
        <line x1="322" y1="98"  x2="330" y2="106" strokeWidth={1.6} />
      </g>
      {/* Glass highlight */}
      <path d="M 282 66 A 16 16 0 0 1 296 58" strokeWidth={0.6} opacity={0.55} />
    </svg>
  )
}
