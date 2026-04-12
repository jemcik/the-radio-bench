import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

const defaults = (size = 36): SVGProps<SVGSVGElement> => ({
  width: size,
  height: size,
  viewBox: '0 0 64 64',
  fill: 'none',
  xmlns: 'http://www.w3.org/2000/svg',
});

const g = {
  strokeWidth: 2.5,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

/* ── 1. Danger ─────────────────────────────────────────────────────── */
export function IconDanger({ size, ...rest }: IconProps) {
  return (
    <svg {...defaults(size)} {...rest}>
      <g stroke="currentColor" {...g}>
        <circle cx={26} cy={14} r={7} fill="currentColor" fillOpacity={0.12} />
        <line x1={23} y1={12} x2={25} y2={14} />
        <line x1={25} y1={12} x2={23} y2={14} />
        <line x1={27} y1={12} x2={29} y2={14} />
        <line x1={29} y1={12} x2={27} y2={14} />
        <line x1={26} y1={21} x2={26} y2={38} />
        <line x1={26} y1={26} x2={16} y2={18} />
        <line x1={26} y1={26} x2={36} y2={18} />
        <line x1={26} y1={38} x2={18} y2={52} />
        <line x1={26} y1={38} x2={34} y2={52} />
        <polygon
          points="46,6 40,26 46,26 38,44 44,24 38,24"
          fill="currentColor"
          fillOpacity={0.25}
          stroke="currentColor"
        />
      </g>
    </svg>
  );
}

/* ── 2. Key Concept ────────────────────────────────────────────────── */
export function IconKeyConcept({ size, ...rest }: IconProps) {
  return (
    <svg {...defaults(size)} {...rest}>
      <g stroke="currentColor" {...g}>
        <circle cx={24} cy={16} r={7} fill="currentColor" fillOpacity={0.12} />
        <circle cx={22} cy={15} r={1} fill="currentColor" />
        <circle cx={26} cy={15} r={1} fill="currentColor" />
        <path d="M22,18 Q24,20 26,18" fill="none" />
        <line x1={24} y1={23} x2={24} y2={40} />
        <path d="M24,30 L17,34 L20,40" fill="none" />
        <line x1={24} y1={28} x2={38} y2={16} />
        <line x1={24} y1={40} x2={18} y2={54} />
        <line x1={24} y1={40} x2={30} y2={54} />
        <polygon
          points="46,8 48,14 54,14 49,18 51,24 46,20 41,24 43,18 38,14 44,14"
          fill="currentColor"
          fillOpacity={0.2}
          stroke="currentColor"
        />
      </g>
    </svg>
  );
}

/* ── 3. Pro Tip ────────────────────────────────────────────────────── */
export function IconProTip({ size, ...rest }: IconProps) {
  return (
    <svg {...defaults(size)} {...rest}>
      <g stroke="currentColor" {...g}>
        <circle cx={24} cy={16} r={7} fill="currentColor" fillOpacity={0.12} />
        <circle cx={22} cy={15} r={1} fill="currentColor" />
        <line x1={25} y1={15} x2={28} y2={15} />
        <path d="M21,18 Q24,21 27,18" fill="none" />
        <line x1={24} y1={23} x2={24} y2={40} />
        <line x1={24} y1={28} x2={14} y2={22} />
        <line x1={14} y1={22} x2={14} y2={16} />
        <line x1={24} y1={30} x2={36} y2={26} />
        <circle cx={40} cy={22} r={4} fill="none" />
        <line x1={37} y1={25} x2={32} y2={30} />
        <line x1={24} y1={40} x2={18} y2={54} />
        <line x1={24} y1={40} x2={30} y2={54} />
      </g>
    </svg>
  );
}

/* ── 4. Note / Info ────────────────────────────────────────────────── */
export function IconNote({ size, ...rest }: IconProps) {
  return (
    <svg {...defaults(size)} {...rest}>
      <g stroke="currentColor" {...g}>
        <circle cx={24} cy={16} r={7} fill="currentColor" fillOpacity={0.12} />
        <circle cx={21} cy={15} r={2.5} fill="none" />
        <circle cx={27} cy={15} r={2.5} fill="none" />
        <line x1={23.5} y1={15} x2={24.5} y2={15} />
        <line x1={24} y1={23} x2={24} y2={40} />
        <line x1={24} y1={28} x2={16} y2={32} />
        <rect x={6} y={28} width={12} height={16} rx={1.5} fill="currentColor" fillOpacity={0.08} />
        <line x1={9} y1={33} x2={15} y2={33} />
        <line x1={9} y1={37} x2={15} y2={37} />
        <line x1={9} y1={41} x2={13} y2={41} />
        <line x1={24} y1={30} x2={34} y2={36} />
        <line x1={24} y1={40} x2={18} y2={54} />
        <line x1={24} y1={40} x2={30} y2={54} />
      </g>
    </svg>
  );
}

/* ── 5. Caution ────────────────────────────────────────────────────── */
export function IconCaution({ size, ...rest }: IconProps) {
  return (
    <svg {...defaults(size)} {...rest}>
      <g stroke="currentColor" {...g}>
        <circle cx={28} cy={16} r={7} fill="currentColor" fillOpacity={0.12} />
        <circle cx={26} cy={14} r={1} fill="currentColor" />
        <circle cx={30} cy={14} r={1} fill="currentColor" />
        <path d="M26,19 Q28,17 30,19" fill="none" />
        <line x1={28} y1={23} x2={28} y2={40} />
        <line x1={28} y1={28} x2={14} y2={24} />
        <rect x={6} y={18} width={10} height={12} rx={2} fill="currentColor" fillOpacity={0.08} />
        <line x1={8} y1={18} x2={8} y2={14} />
        <line x1={10.5} y1={18} x2={10.5} y2={13} />
        <line x1={13} y1={18} x2={13} y2={14} />
        <line x1={28} y1={30} x2={38} y2={34} />
        <line x1={28} y1={40} x2={22} y2={54} />
        <line x1={28} y1={40} x2={34} y2={54} />
      </g>
    </svg>
  );
}

/* ── 6. Experiment / Lab ───────────────────────────────────────────── */
export function IconExperiment({ size, ...rest }: IconProps) {
  return (
    <svg {...defaults(size)} {...rest}>
      <g stroke="currentColor" {...g}>
        <circle cx={24} cy={16} r={7} fill="currentColor" fillOpacity={0.12} />
        <path d="M17,14 L31,14" fill="none" />
        <circle cx={21} cy={14} r={3} fill="currentColor" fillOpacity={0.1} />
        <circle cx={27} cy={14} r={3} fill="currentColor" fillOpacity={0.1} />
        <path d="M22,19 Q24,21 26,19" fill="none" />
        <line x1={24} y1={23} x2={24} y2={40} />
        <line x1={24} y1={28} x2={38} y2={24} />
        <path d="M38,18 L38,24 L34,34 L42,34 L38,24" fill="currentColor" fillOpacity={0.08} />
        <circle cx={37} cy={30} r={1.2} fill="none" />
        <circle cx={39.5} cy={28} r={0.8} fill="none" />
        <line x1={24} y1={30} x2={14} y2={34} />
        <line x1={24} y1={40} x2={18} y2={54} />
        <line x1={24} y1={40} x2={30} y2={54} />
      </g>
    </svg>
  );
}

/* ── 7. On Air / Regulation ────────────────────────────────────────── */
export function IconOnAir({ size, ...rest }: IconProps) {
  return (
    <svg {...defaults(size)} {...rest}>
      <g stroke="currentColor" {...g}>
        <circle cx={28} cy={18} r={7} fill="currentColor" fillOpacity={0.12} />
        <path d="M21,16 Q21,8 28,8 Q35,8 35,16" fill="none" strokeWidth={3} />
        <rect x={18} y={14} width={5} height={7} rx={1.5} fill="currentColor" fillOpacity={0.15} />
        <rect x={33} y={14} width={5} height={7} rx={1.5} fill="currentColor" fillOpacity={0.15} />
        <circle cx={26} cy={17} r={1} fill="currentColor" />
        <circle cx={30} cy={17} r={1} fill="currentColor" />
        <line x1={28} y1={25} x2={28} y2={42} />
        <line x1={28} y1={32} x2={18} y2={36} />
        <rect x={10} y={35} width={10} height={4} rx={1} fill="currentColor" fillOpacity={0.12} />
        <line x1={28} y1={34} x2={38} y2={38} />
        <line x1={28} y1={42} x2={22} y2={54} />
        <line x1={28} y1={42} x2={34} y2={54} />
        <path d="M44,10 Q48,14 44,18" fill="none" strokeWidth={2} opacity={0.5} />
        <path d="M48,8 Q54,14 48,20" fill="none" strokeWidth={2} opacity={0.3} />
      </g>
    </svg>
  );
}

/* ── 8. Math / Formula ─────────────────────────────────────────────── */
export function IconMath({ size, ...rest }: IconProps) {
  return (
    <svg {...defaults(size)} {...rest}>
      <g stroke="currentColor" {...g}>
        <circle cx={24} cy={16} r={7} fill="currentColor" fillOpacity={0.12} />
        <circle cx={22} cy={14} r={1} fill="currentColor" />
        <circle cx={26} cy={14} r={1} fill="currentColor" />
        <circle cx={25} cy={19} r={1.5} fill="none" />
        <line x1={24} y1={23} x2={24} y2={40} />
        <path d="M24,28 L18,24 L20,16" fill="none" />
        <line x1={24} y1={30} x2={36} y2={28} />
        <rect x={36} y={18} width={20} height={16} rx={1.5} fill="currentColor" fillOpacity={0.06} />
        <text
          x={46}
          y={27}
          textAnchor="middle"
          fontFamily="serif"
          fontStyle="italic"
          fontSize={7}
          fill="currentColor"
          stroke="none"
        >
          V=IR
        </text>
        <line x1={39} y1={30} x2={53} y2={30} strokeWidth={1} opacity={0.4} />
        <text
          x={46}
          y={32}
          textAnchor="middle"
          fontFamily="serif"
          fontStyle="italic"
          fontSize={5}
          fill="currentColor"
          stroke="none"
          opacity={0.6}
        >
          P=IV
        </text>
        <line x1={24} y1={40} x2={18} y2={54} />
        <line x1={24} y1={40} x2={30} y2={54} />
        <circle cx={18} cy={8} r={1.5} fill="currentColor" fillOpacity={0.25} stroke="none" />
        <circle cx={15} cy={5} r={1} fill="currentColor" fillOpacity={0.15} stroke="none" />
      </g>
    </svg>
  );
}
