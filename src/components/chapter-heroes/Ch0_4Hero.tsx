/**
 * Chapter 0.4 hero — a vintage VU meter with its needle deflected slightly
 * above zero. The visual shorthand for "measurement in decibels".
 *
 * Drawn with Rough.js for the hand-sketched aesthetic. Every stroke path
 * renders with `stroke="currentColor"` so the sketch inherits the page's
 * `--sketch-stroke` token and adapts to every theme.
 */
import { useMemo } from 'react'
import {
  RoughPaths,
  roughLine,
  roughPath,
  roughRect,
} from '@/lib/rough'

export default function Ch0_4Hero() {
  const s = useMemo(() => ({
    shelf: roughLine(40, 124, 380, 124, { seed: 1, strokeWidth: 1.1 }),
    hatches: [[60, 85], [100, 125], [140, 165], [180, 205],
              [220, 245], [260, 285], [300, 325], [340, 365]]
      .map(([x1, x2], i) =>
        roughLine(x1, 126, x2, 136, { seed: 10 + i, strokeWidth: 0.6, roughness: 0.5 })),
  }), [])

  // VU meter geometry — origin at centre of inner bezel (210, 68).
  // Local coords (translate applied via <g>).
  const meter = useMemo(() => ({
    chassis: roughRect(-120, -50, 240, 104, { seed: 20 }),
    bezel: roughRect(-110, -42, 220, 80, { seed: 21, strokeWidth: 0.9 }),
    arc: roughPath(
      'M -48 32 A 48 48 0 0 1 48 32',
      { seed: 22, strokeWidth: 0.9 },
    ),
    ticks: [
      [-48, 32, -54, 32], [-41.6, 8, -46.8, 5], [-24, -9.6, -27, -14],
      [0, -16, 0, -22], [24, -9.6, 27, -14], [41.6, 8, 46.8, 5],
      [48, 32, 54, 32],
    ].map(([x1, y1, x2, y2], i) =>
      roughLine(x1, y1, x2, y2, { seed: 30 + i, strokeWidth: 0.9, roughness: 0.5 })),
    needle: roughLine(0, 32, 10, -17, { seed: 40, strokeWidth: 1.3 }),
  }), [])

  return (
    <svg
      width="540" height="180" viewBox="0 0 420 140"
      fill="none"
      aria-hidden
    >
      <RoughPaths paths={s.shelf} />
      <g opacity={0.45}>
        {s.hatches.map((h, i) => <RoughPaths key={i} paths={h} />)}
      </g>

      {/* VU meter */}
      <g transform="translate(210,68)">
        <RoughPaths paths={meter.chassis} />
        <RoughPaths paths={meter.bezel} />
        <RoughPaths paths={meter.arc} />
        {meter.ticks.map((t, i) => <RoughPaths key={i} paths={t} />)}

        {/* Scale labels */}
        <g fontFamily="inherit" fontSize="0.468em" fill="currentColor" textAnchor="middle">
          <text x="-62" y="36">−20</text>
          <text x="-54" y="2">−10</text>
          <text x="-31" y="-22">−3</text>
          <text x="0"   y="-30">0</text>
          <text x="31"  y="-22">+3</text>
          <text x="54"  y="2">+10</text>
        </g>

        {/* "VU" engraving */}
        <text x="0" y="22" fontFamily="inherit" fontStyle="italic" fontSize="0.625em"
              fill="currentColor" textAnchor="middle" opacity={0.75}>VU</text>

        {/* Pivot + needle */}
        <circle cx="0" cy="32" r="2.5" fill="currentColor" />
        <RoughPaths paths={meter.needle} />
      </g>

      {/* Fountain-pen "dB" marking — left as plain text/stroke: a hand
          Rough flourish would fight the italic serif cap. */}
      <text x="340" y="34" fontFamily="inherit" fontStyle="italic" fontSize="1.375em"
            fill="currentColor">dB</text>
      <path d="M 338 42 Q 348 48, 368 42" stroke="currentColor" strokeWidth={0.9}
            fill="none" opacity={0.7} />
    </svg>
  )
}
