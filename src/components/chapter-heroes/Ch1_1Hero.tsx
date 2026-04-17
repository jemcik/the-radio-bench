/**
 * Chapter 1.1 hero — a length of copper wire with a few electrons
 * drifting along it, driven by a battery on the left. The battery's
 * + terminal connects to the wire directly via a short horizontal
 * lead (no U-bend); the − terminal has a short lead that trails off
 * toward the implied return path. The wire's right end shows a
 * dangling lead to signal the cut-away (we're viewing one section of
 * a longer conductor). Electrons are small filled circles labelled
 * "e⁻" to make the "electrons = current carriers" connection concrete.
 *
 * Drawn with Rough.js for the hand-sketched aesthetic. Every stroke
 * path renders with `stroke="currentColor"` so the sketch inherits the
 * page's `--sketch-stroke` token and adapts to every theme.
 */
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  RoughPaths,
  roughLine,
  roughLinearPath,
} from '@/lib/rough'

export default function Ch1_1Hero() {
  const { t } = useTranslation('ui')
  const s = useMemo(() => ({
    desk: roughLine(20, 118, 400, 118, { seed: 1, strokeWidth: 1.1 }),
    hatches: [30, 70, 110, 150, 190, 230, 270, 310, 350].map((x, i) =>
      roughLine(x, 122, x + 30, 135, { seed: 10 + i, strokeWidth: 0.6, roughness: 0.5 })),

    // Battery (vertical, long plate up = +) centered at x=70.
    // No upper lead above the + plate — it would dangle orphan now that
    // + connects sideways to the wire, not up-and-over.
    batteryPlate: roughLine(58, 60, 82, 60, { seed: 21, strokeWidth: 1.6 }),
    batteryShort: roughLine(63, 68, 77, 68, { seed: 22 }),
    // − terminal lead trails off downward — implies the return path of
    // the full circuit continues somewhere off-frame (toward the other
    // cut end of the copper wire, not drawn).
    batteryBotLead: roughLine(70, 68, 70, 95, { seed: 23 }),

    // Copper wire cut-away
    wireTop: roughLine(110, 58, 370, 58, { seed: 30, strokeWidth: 1.4 }),
    wireBot: roughLine(110, 82, 370, 82, { seed: 31, strokeWidth: 1.4 }),
    wireLeftCap: roughLine(110, 58, 110, 82, { seed: 32 }),
    wireRightCap: roughLine(370, 58, 370, 82, { seed: 33 }),

    // Battery + plate → wire left edge — clean near-horizontal lead.
    // Replaces the earlier U-shaped path that detoured up-and-over the
    // wire, which read as a schematic oddity for no reason.
    leadPlus: roughLine(82, 60, 110, 59, { seed: 40 }),
    // Wire's right-end dangle keeps the "cut-away section" semantics.
    leadRightOut: roughLine(370, 70, 395, 70, { seed: 42, roughness: 0.4 }),

    sheen: ([
      [118, 62, 130, 62], [160, 62, 172, 62], [220, 62, 232, 62],
      [280, 62, 292, 62], [340, 62, 352, 62],
      [140, 78, 152, 78], [200, 78, 212, 78], [260, 78, 272, 78],
      [320, 78, 332, 78],
    ] as [number, number, number, number][]).map(([x1, y1, x2, y2], i) =>
      roughLine(x1, y1, x2, y2, { seed: 50 + i, strokeWidth: 0.5, roughness: 0.4 })),

    driftShaft: roughLine(220, 95, 260, 95, { seed: 70, strokeWidth: 0.9, roughness: 0.3 }),
    driftHead: roughLinearPath(
      [[254, 92], [260, 95], [254, 98]],
      { seed: 71, strokeWidth: 0.9, roughness: 0.3 },
    ),
  }), [])

  return (
    <svg
      width="540" height="180" viewBox="0 0 420 140"
      fill="none"
      aria-hidden
    >
      {/* Desk */}
      <RoughPaths paths={s.desk} />
      <g opacity={0.4}>
        {s.hatches.map((h, i) => <RoughPaths key={i} paths={h} />)}
      </g>

      {/* Battery */}
      <RoughPaths paths={s.batteryPlate} />
      <RoughPaths paths={s.batteryShort} />
      <RoughPaths paths={s.batteryBotLead} />
      <text x="88" y="62" fontFamily="Georgia, serif" fontStyle="italic"
            fontSize="10" fill="currentColor">+</text>
      <text x="88" y="74" fontFamily="Georgia, serif" fontStyle="italic"
            fontSize="10" fill="currentColor">−</text>

      {/* Copper wire cut-away */}
      <RoughPaths paths={s.wireTop} />
      <RoughPaths paths={s.wireBot} />
      <RoughPaths paths={s.wireLeftCap} />
      <RoughPaths paths={s.wireRightCap} />

      {/* Leads */}
      <RoughPaths paths={s.leadPlus} />
      <RoughPaths paths={s.leadRightOut} opacity={0.55} />

      {/* Metallic sheen */}
      <g opacity={0.35}>
        {s.sheen.map((ss, i) => <RoughPaths key={i} paths={ss} />)}
      </g>

      {/* Electrons — plain filled circles for clean look at small scale */}
      <circle cx="140" cy="68" r="3.5" fill="currentColor" opacity={0.85} />
      <text x="140" y="55" fontFamily="Georgia, serif" fontStyle="italic"
            fontSize="7.5" fill="currentColor" textAnchor="middle"
            opacity={0.75}>e⁻</text>

      <circle cx="205" cy="74" r="3.5" fill="currentColor" opacity={0.85} />
      <circle cx="268" cy="66" r="3.5" fill="currentColor" opacity={0.85} />

      <circle cx="335" cy="75" r="3.5" fill="currentColor" opacity={0.85} />
      <text x="335" y="92" fontFamily="Georgia, serif" fontStyle="italic"
            fontSize="7.5" fill="currentColor" textAnchor="middle"
            opacity={0.75}>e⁻</text>

      {/* Drift arrow */}
      <g opacity={0.55}>
        <RoughPaths paths={s.driftShaft} />
        <RoughPaths paths={s.driftHead} />
      </g>
      <text x="240" y="108" fontFamily="Georgia, serif" fontStyle="italic"
            fontSize="8" fill="currentColor" textAnchor="middle"
            opacity={0.65}>{t('ch1_1.heroDriftLabel')}</text>

      {/* Material callout above the wire. Wide letterSpacing gives the
          airy "textbook callout" look regardless of language (English
          COPPER, Ukrainian МІДЬ, …) without forcing the translator to
          pre-space the string with space characters. */}
      <text x="240" y="46" fontFamily="Georgia, serif"
            fontSize="8.5" fill="currentColor" textAnchor="middle"
            letterSpacing="4" opacity={0.7}>{t('ch1_1.heroCopperLabel')}</text>
    </svg>
  )
}
