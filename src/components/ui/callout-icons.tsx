import type { SVGProps } from 'react';

/**
 * Callout icons — retro "Radio Boy" style.
 *
 * Each icon shares the same Vault-Boy proportioned body (round head with
 * hair, eyebrows, torso, thick limbs, boots) and differs only in facial
 * expression and the prop held/shown beside the figure.
 */

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

const defaults = (size = 36): SVGProps<SVGSVGElement> => ({
  width: size,
  height: size,
  viewBox: '0 0 80 80',
  fill: 'none',
  xmlns: 'http://www.w3.org/2000/svg',
});

/* Shared body from neck down — offset from center to leave room for props */
function Body({ x = 0 }: { x?: number }) {
  return (
    <g>
      {/* Collar */}
      <path d={`M${x + 28},33 L${x + 33},36 L${x + 38},33`} fill="none" strokeWidth={1.4} opacity={0.5} />
      {/* Torso */}
      <path
        d={`M${x + 22},35 L${x + 21},52 L${x + 45},52 L${x + 44},35 Z`}
        fill="currentColor" fillOpacity={0.05} strokeWidth={1.5}
      />
      {/* Belt */}
      <line x1={x + 21} y1={50} x2={x + 45} y2={50} strokeWidth={1.8} opacity={0.35} />
      {/* Legs */}
      <path d={`M${x + 28},52 L${x + 25},65`} fill="none" strokeWidth={2.8} />
      <path d={`M${x + 38},52 L${x + 41},65`} fill="none" strokeWidth={2.8} />
      {/* Boots */}
      <path d={`M${x + 25},65 L${x + 21},66.5 Q${x + 20},67 ${x + 20.5},65.5`} fill="currentColor" fillOpacity={0.08} strokeWidth={2} />
      <path d={`M${x + 41},65 L${x + 45},66.5 Q${x + 46},67 ${x + 45.5},65.5`} fill="currentColor" fillOpacity={0.08} strokeWidth={2} />
    </g>
  );
}

/* Shared head — round with hair, eyebrows, nose */
function Head({ x = 0, eyeStyle = 'normal' }: { x?: number; eyeStyle?: 'normal' | 'x' | 'wide' | 'wink' | 'thinking' }) {
  return (
    <g>
      <circle cx={x + 33} cy={17} r={11} fill="currentColor" fillOpacity={0.07} strokeWidth={1.8} />
      {/* Hair */}
      <path
        d={`M${x + 23},12 Q${x + 25},3 ${x + 31},4 Q${x + 35},1.5 ${x + 39},4 Q${x + 44},3 ${x + 45},11`}
        fill="currentColor" fillOpacity={0.13} strokeWidth={1.6}
      />
      {/* Eyebrows */}
      <path d={`M${x + 27},11.5 Q${x + 29},9.5 ${x + 32},11`} fill="none" strokeWidth={1.6} />
      <path d={`M${x + 35},11 Q${x + 38},9.5 ${x + 40},11.5`} fill="none" strokeWidth={1.6} />
      {/* Eyes */}
      {eyeStyle === 'normal' && (
        <>
          <ellipse cx={x + 29.5} cy={15} rx={1.5} ry={1.8} fill="currentColor" stroke="none" />
          <ellipse cx={x + 36.5} cy={15} rx={1.5} ry={1.8} fill="currentColor" stroke="none" />
        </>
      )}
      {eyeStyle === 'x' && (
        <>
          <line x1={x + 28} y1={13.5} x2={x + 31} y2={16.5} strokeWidth={1.5} />
          <line x1={x + 31} y1={13.5} x2={x + 28} y2={16.5} strokeWidth={1.5} />
          <line x1={x + 35} y1={13.5} x2={x + 38} y2={16.5} strokeWidth={1.5} />
          <line x1={x + 38} y1={13.5} x2={x + 35} y2={16.5} strokeWidth={1.5} />
        </>
      )}
      {eyeStyle === 'wide' && (
        <>
          <ellipse cx={x + 29.5} cy={15} rx={2.2} ry={2.5} fill="currentColor" fillOpacity={0.1} strokeWidth={1.3} />
          <circle cx={x + 29.5} cy={15} r={1} fill="currentColor" stroke="none" />
          <ellipse cx={x + 36.5} cy={15} rx={2.2} ry={2.5} fill="currentColor" fillOpacity={0.1} strokeWidth={1.3} />
          <circle cx={x + 36.5} cy={15} r={1} fill="currentColor" stroke="none" />
        </>
      )}
      {eyeStyle === 'wink' && (
        <>
          <ellipse cx={x + 29.5} cy={15} rx={1.5} ry={1.8} fill="currentColor" stroke="none" />
          <line x1={x + 35} y1={15} x2={x + 38} y2={15} strokeWidth={1.8} />
        </>
      )}
      {eyeStyle === 'thinking' && (
        <>
          <ellipse cx={x + 29.5} cy={14} rx={1.5} ry={1.8} fill="currentColor" stroke="none" />
          <ellipse cx={x + 36.5} cy={14} rx={1.5} ry={1.8} fill="currentColor" stroke="none" />
        </>
      )}
      {/* Nose */}
      <path d={`M${x + 33},18 Q${x + 34},20 ${x + 32.5},20.5`} fill="none" strokeWidth={1.3} />
    </g>
  );
}

/* ── 1. Danger ─────────────────────────────────────────────────────── */
export function IconDanger({ size, ...rest }: IconProps) {
  return (
    <svg {...defaults(size)} {...rest}>
      <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
        <Head eyeStyle="x" />
        {/* Worried mouth */}
        <path d="M29,24 Q33,21 37,24" fill="none" strokeWidth={1.6} />
        <Body />
        {/* Arms up in alarm */}
        <path d="M22,37 L12,26 L10,20" fill="none" strokeWidth={2.5} />
        <path d="M44,37 L54,26 L56,20" fill="none" strokeWidth={2.5} />
        {/* Lightning bolt */}
        <polygon
          points="62,6 56,22 61,22 54,38 59,20 54,20"
          fill="currentColor" fillOpacity={0.2} stroke="currentColor" strokeWidth={1.5}
        />
      </g>
    </svg>
  );
}

/* ── 2. Key Concept ────────────────────────────────────────────────── */
export function IconKeyConcept({ size, ...rest }: IconProps) {
  return (
    <svg {...defaults(size)} {...rest}>
      <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
        <Head eyeStyle="normal" />
        {/* Confident grin */}
        <path d="M29,23 Q33,27 37,23" fill="currentColor" fillOpacity={0.04} strokeWidth={1.6} />
        <Body />
        {/* Left arm — hand on hip */}
        <path d="M22,37 L13,41 L15,49 L21,47" fill="none" strokeWidth={2.5} />
        {/* Right arm — pointing up at star */}
        <path d="M44,37 L54,24 L56,18" fill="none" strokeWidth={2.5} />
        {/* Star */}
        <polygon
          points="64,10 65.5,15 71,15 66.5,18.5 68,24 64,21 60,24 61.5,18.5 57,15 62.5,15"
          fill="currentColor" fillOpacity={0.18} stroke="currentColor" strokeWidth={1.3}
        />
      </g>
    </svg>
  );
}

/* ── 3. Pro Tip ────────────────────────────────────────────────────── */
export function IconProTip({ size, ...rest }: IconProps) {
  return (
    <svg {...defaults(size)} {...rest}>
      <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
        <Head eyeStyle="wink" />
        {/* Smirk */}
        <path d="M30,23 Q34,27 37,23" fill="none" strokeWidth={1.6} />
        <Body />
        {/* Left arm — relaxed */}
        <path d="M22,37 L13,41 L15,49 L21,47" fill="none" strokeWidth={2.5} />
        {/* Right arm — pointing at lightbulb */}
        <path d="M44,38 L56,32" fill="none" strokeWidth={2.5} />
        {/* Lightbulb */}
        <circle cx={62} cy={24} r={7} fill="currentColor" fillOpacity={0.1} strokeWidth={1.5} />
        <path d="M59,30 L59,34 L65,34 L65,30" fill="none" strokeWidth={1.3} />
        <line x1={62} y1={34} x2={62} y2={36} strokeWidth={1.3} />
        {/* Filament */}
        <path d="M60,22 Q62,26 64,22" fill="none" strokeWidth={1.2} opacity={0.5} />
        {/* Rays */}
        <line x1={62} y1={14} x2={62} y2={11} strokeWidth={1.2} opacity={0.3} />
        <line x1={54} y1={20} x2={52} y2={18} strokeWidth={1.2} opacity={0.3} />
        <line x1={70} y1={20} x2={72} y2={18} strokeWidth={1.2} opacity={0.3} />
      </g>
    </svg>
  );
}

/* ── 4. Note / Info ────────────────────────────────────────────────── */
export function IconNote({ size, ...rest }: IconProps) {
  return (
    <svg {...defaults(size)} {...rest}>
      <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
        <Head eyeStyle="wide" />
        {/* Mild smile */}
        <path d="M30,23 Q33,25.5 36,23" fill="none" strokeWidth={1.5} />
        <Body />
        {/* Left arm — holding notepad */}
        <path d="M22,37 L14,42" fill="none" strokeWidth={2.5} />
        {/* Notepad */}
        <rect x={3} y={36} width={14} height={18} rx={1.5} fill="currentColor" fillOpacity={0.07} strokeWidth={1.5} />
        <line x1={6} y1={41} x2={14} y2={41} strokeWidth={1} opacity={0.4} />
        <line x1={6} y1={45} x2={14} y2={45} strokeWidth={1} opacity={0.4} />
        <line x1={6} y1={49} x2={11} y2={49} strokeWidth={1} opacity={0.4} />
        {/* Right arm — relaxed */}
        <path d="M44,37 L53,42 L51,49 L45,47" fill="none" strokeWidth={2.5} />
      </g>
    </svg>
  );
}

/* ── 5. Caution ────────────────────────────────────────────────────── */
export function IconCaution({ size, ...rest }: IconProps) {
  return (
    <svg {...defaults(size)} {...rest}>
      <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
        <Head eyeStyle="normal" />
        {/* Uncertain squiggle mouth */}
        <path d="M29,24 Q31,22 33,24 Q35,26 37,24" fill="none" strokeWidth={1.5} />
        <Body />
        {/* Left arm — scratching head */}
        <path d="M22,37 L16,30 L20,20" fill="none" strokeWidth={2.5} />
        {/* Right arm — raised palm-out (stop) */}
        <path d="M44,37 L54,28 L56,22" fill="none" strokeWidth={2.5} />
        {/* Palm */}
        <ellipse cx={57} cy={19} rx={3.5} ry={4.5} fill="currentColor" fillOpacity={0.06} strokeWidth={1.5} />
        {/* Warning triangle */}
        <polygon
          points="67,12 60,26 74,26"
          fill="currentColor" fillOpacity={0.08} stroke="currentColor" strokeWidth={1.5}
        />
        <line x1={67} y1={17} x2={67} y2={22} strokeWidth={1.5} />
        <circle cx={67} cy={24} r={0.8} fill="currentColor" stroke="none" />
      </g>
    </svg>
  );
}

/* ── 6. Experiment / Lab ───────────────────────────────────────────── */
export function IconExperiment({ size, ...rest }: IconProps) {
  return (
    <svg {...defaults(size)} {...rest}>
      <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
        <Head eyeStyle="normal" />
        {/* Excited grin */}
        <path d="M29,23 Q33,27.5 37,23" fill="currentColor" fillOpacity={0.04} strokeWidth={1.6} />
        {/* Goggles on forehead */}
        <ellipse cx={29} cy={8} rx={3.5} ry={2.5} fill="currentColor" fillOpacity={0.06} strokeWidth={1.2} />
        <ellipse cx={37} cy={8} rx={3.5} ry={2.5} fill="currentColor" fillOpacity={0.06} strokeWidth={1.2} />
        <line x1={32.5} y1={8} x2={33.5} y2={8} strokeWidth={1.5} />
        <Body />
        {/* Left arm — hand on hip */}
        <path d="M22,37 L13,41 L15,49 L21,47" fill="none" strokeWidth={2.5} />
        {/* Right arm — holding flask */}
        <path d="M44,37 L54,32" fill="none" strokeWidth={2.5} />
        {/* Flask */}
        <path d="M56,22 L56,30 L52,40 L62,40 L58,30 L58,22" fill="currentColor" fillOpacity={0.06} strokeWidth={1.5} />
        <line x1={55} y1={22} x2={59} y2={22} strokeWidth={1.5} />
        {/* Bubbles */}
        <circle cx={56} cy={34} r={1.2} fill="none" strokeWidth={1} opacity={0.4} />
        <circle cx={58.5} cy={31} r={0.8} fill="none" strokeWidth={1} opacity={0.3} />
      </g>
    </svg>
  );
}

/* ── 7. On Air / Regulation ────────────────────────────────────────── */
export function IconOnAir({ size, ...rest }: IconProps) {
  return (
    <svg {...defaults(size)} {...rest}>
      <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
        <Head eyeStyle="normal" />
        {/* Happy smile */}
        <path d="M29,23 Q33,26 37,23" fill="none" strokeWidth={1.6} />
        {/* Headphones */}
        <path d="M22,14 Q22,4 33,4 Q44,4 44,14" fill="none" strokeWidth={2.5} />
        <rect x={19} y={12} width={5} height={7} rx={2} fill="currentColor" fillOpacity={0.12} strokeWidth={1.3} />
        <rect x={42} y={12} width={5} height={7} rx={2} fill="currentColor" fillOpacity={0.12} strokeWidth={1.3} />
        <Body />
        {/* Left arm — holding mic */}
        <path d="M22,37 L14,42" fill="none" strokeWidth={2.5} />
        {/* Microphone */}
        <rect x={7} y={40} width={9} height={4} rx={1} fill="currentColor" fillOpacity={0.1} strokeWidth={1.3} />
        <line x1={11.5} y1={44} x2={11.5} y2={50} strokeWidth={1.5} />
        <line x1={8.5} y1={50} x2={14.5} y2={50} strokeWidth={1.3} />
        {/* Right arm — relaxed */}
        <path d="M44,37 L53,42 L51,49 L45,47" fill="none" strokeWidth={2.5} />
        {/* Broadcast waves */}
        <path d="M56,14 Q60,19 56,24" fill="none" strokeWidth={1.8} opacity={0.4} />
        <path d="M60,10 Q66,19 60,28" fill="none" strokeWidth={1.5} opacity={0.25} />
      </g>
    </svg>
  );
}

/* ── 8. Math / Formula ─────────────────────────────────────────────── */
export function IconMath({ size, ...rest }: IconProps) {
  return (
    <svg {...defaults(size)} {...rest}>
      <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
        <Head eyeStyle="thinking" />
        {/* Thinking mouth — small circle */}
        <circle cx={33} cy={24} r={2} fill="none" strokeWidth={1.4} />
        <Body />
        {/* Left arm — chin scratch / thinking pose */}
        <path d="M22,37 L18,30 L24,22" fill="none" strokeWidth={2.5} />
        {/* Right arm — pointing at formula */}
        <path d="M44,38 L54,34" fill="none" strokeWidth={2.5} />
        {/* Formula board */}
        <rect x={54} y={22} width={22} height={18} rx={2} fill="currentColor" fillOpacity={0.06} strokeWidth={1.5} />
        <text
          x={65}
          y={32}
          textAnchor="middle"
          fontFamily="serif"
          fontStyle="italic"
          fontSize={8}
          fill="currentColor"
          stroke="none"
        >
          V=IR
        </text>
        <line x1={56} y1={35} x2={74} y2={35} strokeWidth={0.8} opacity={0.3} />
        <text
          x={65}
          y={38}
          textAnchor="middle"
          fontFamily="serif"
          fontStyle="italic"
          fontSize={5.5}
          fill="currentColor"
          stroke="none"
          opacity={0.5}
        >
          P=IV
        </text>
        {/* Thought bubbles */}
        <circle cx={20} cy={14} r={2} fill="currentColor" fillOpacity={0.15} stroke="none" />
        <circle cx={16} cy={10} r={1.2} fill="currentColor" fillOpacity={0.1} stroke="none" />
      </g>
    </svg>
  );
}
