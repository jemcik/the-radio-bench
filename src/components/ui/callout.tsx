import type { ReactNode } from 'react';
import {
  IconDanger,
  IconKeyConcept,
  IconProTip,
  IconNote,
  IconCaution,
  IconExperiment,
  IconOnAir,
  IconMath,
} from './callout-icons';

/* ── Variant config ────────────────────────────────────────────────── */

export type CalloutVariant =
  | 'danger'
  | 'key'
  | 'tip'
  | 'note'
  | 'caution'
  | 'experiment'
  | 'onair'
  | 'math';

interface VariantConfig {
  label: string;
  Icon: typeof IconDanger;
  /** Tailwind text color for the icon + label */
  text: string;
  /** Tailwind border-l color */
  border: string;
  /** Tailwind bg tint */
  bg: string;
}

const variants: Record<CalloutVariant, VariantConfig> = {
  danger: {
    label: 'Danger',
    Icon: IconDanger,
    text: 'text-red-400',
    border: 'border-l-red-400',
    bg: 'bg-red-500/[0.06]',
  },
  key: {
    label: 'Key Concept',
    Icon: IconKeyConcept,
    text: 'text-amber-400',
    border: 'border-l-amber-400',
    bg: 'bg-amber-500/[0.06]',
  },
  tip: {
    label: 'Pro Tip',
    Icon: IconProTip,
    text: 'text-green-400',
    border: 'border-l-green-400',
    bg: 'bg-green-500/[0.06]',
  },
  note: {
    label: 'Note',
    Icon: IconNote,
    text: 'text-blue-400',
    border: 'border-l-blue-400',
    bg: 'bg-blue-500/[0.06]',
  },
  caution: {
    label: 'Caution',
    Icon: IconCaution,
    text: 'text-orange-400',
    border: 'border-l-orange-400',
    bg: 'bg-orange-500/[0.06]',
  },
  experiment: {
    label: 'Experiment',
    Icon: IconExperiment,
    text: 'text-teal-400',
    border: 'border-l-teal-400',
    bg: 'bg-teal-500/[0.06]',
  },
  onair: {
    label: 'On Air',
    Icon: IconOnAir,
    text: 'text-purple-400',
    border: 'border-l-purple-400',
    bg: 'bg-purple-500/[0.06]',
  },
  math: {
    label: 'Math',
    Icon: IconMath,
    text: 'text-pink-400',
    border: 'border-l-pink-400',
    bg: 'bg-pink-500/[0.06]',
  },
};

/* ── Component ─────────────────────────────────────────────────────── */

interface CalloutProps {
  variant: CalloutVariant;
  /** Override the default label text */
  title?: string;
  children: ReactNode;
  className?: string;
}

export function Callout({ variant, title, children, className = '' }: CalloutProps) {
  const v = variants[variant];

  return (
    <div
      className={`flex gap-3 items-start rounded-lg border-l-[3px] px-4 py-3 my-4 ${v.border} ${v.bg} ${className}`}
    >
      <v.Icon size={36} className={`${v.text} shrink-0 mt-0.5`} />
      <div className="min-w-0 flex-1">
        <p
          className={`text-[10px] font-bold uppercase tracking-[0.15em] mb-1 ${v.text}`}
        >
          {title ?? v.label}
        </p>
        <div className="text-sm leading-relaxed text-foreground/90">
          {children}
        </div>
      </div>
    </div>
  );
}
