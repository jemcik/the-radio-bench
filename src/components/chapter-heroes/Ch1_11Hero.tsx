/**
 * Chapter 1.11 hero — physical-transistor-and-symbol pairing.
 *
 * Mirrors the Ch1_10 hero composition (physical part on the left,
 * schematic symbol on the right, paired by a small «↔» bridge between
 * them) so the reader's eye recognises the page-opening illustration as
 * a continuation of the chapter-on-a-chip pattern.
 *
 * Left half:  pen-and-ink TO-92 plastic-package NPN transistor — flat
 *             face toward the reader, three leads splaying down (C/B/E
 *             from left to right when looking at the flat side, the
 *             standard 2N3904 pinout).
 * Right half: chris-pikul `<TransistorNPN>` primitive — the SAME symbol
 *             used in every schematic of this chapter (BjtSwitch,
 *             CommonEmitterAmplifier, …) so the hero «teaches» exactly
 *             the symbol the reader will see later. Previously this
 *             half was hand-drawn with slightly different proportions
 *             (symmetric ±27° diagonals vs chris-pikul's asymmetric
 *             −24°/+31°), which a reader spotted as «hero NPN doesn't
 *             match the one we use in schematics».
 *
 * hardcoded-fontsize-file-ok: hero illustration with hand-tuned label
 * sizes in user-space units. No sibling diagrams in this file.
 */
import { useTranslation } from 'react-i18next'
import { TransistorNPN } from '@/lib/circuit/symbols/semiconductors'

export default function Ch1_11Hero() {
  const { t } = useTranslation('ui')

  return (
    <svg
      viewBox="0 0 540 240"
      width="540"
      height="240"
      fill="none"
      aria-label={t('ch1_11.heroAriaLabel')}
      role="img"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* ── Left half: TO-92 plastic-package transistor ────────────── */}

      {/* Three leads splaying down. Body sits at y=80–140 (flat side
          ~120 px wide), leads emerge from the bottom edge and bend
          slightly outward to mimic real bent leads. */}
      {/* Collector lead (leftmost) */}
      <line
        x1="100" y1="140" x2="92" y2="220"
        stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"
      />
      {/* Base lead (middle) */}
      <line
        x1="140" y1="140" x2="140" y2="220"
        stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"
      />
      {/* Emitter lead (rightmost) */}
      <line
        x1="180" y1="140" x2="188" y2="220"
        stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"
      />

      {/* TO-92 body — half-disc «D» shape: flat face on the front
          (bottom edge of our drawing because the leads come out the
          bottom), curved back. Drawn as a rounded rectangle with the
          top corners rounded to mimic the half-disc silhouette. */}
      <path
        d="M 60 80 Q 60 50 100 50 L 180 50 Q 220 50 220 80 L 220 140 L 60 140 Z"
        fill="hsl(var(--background))"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />

      {/* Subtle highlight across the top curve of the package */}
      <path
        d="M 80 62 Q 130 55 200 62"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        opacity="0.4"
        strokeLinecap="round"
      />

      {/* Part-marking line (looks like printed text on the package) */}
      <text
        x="140" y="105"
        fontSize="14"
        fontFamily="ui-monospace, SFMono-Regular, monospace"
        textAnchor="middle"
        fill="currentColor"
        fillOpacity="0.6"
        letterSpacing="1"
      >
        2N3904
      </text>

      {/* TO-92 package label — small caption above the top of the body */}
      <text
        x="140" y="42"
        fontSize="11"
        fontStyle="italic"
        fontFamily="Georgia, serif"
        textAnchor="middle"
        fill="currentColor"
        fillOpacity="0.6"
      >
        {t('ch1_11.heroPackageLabel')}
      </text>

      {/* Lead labels — C / B / E directly below each lead, italicised */}
      <text
        x="92" y="234"
        fontSize="13"
        fontFamily="Georgia, serif"
        textAnchor="middle"
        fill="currentColor"
        fillOpacity="0.7"
      >
        {t('ch1_11.heroCollectorLabel')}
      </text>
      <text
        x="140" y="234"
        fontSize="13"
        fontFamily="Georgia, serif"
        textAnchor="middle"
        fill="currentColor"
        fillOpacity="0.7"
      >
        {t('ch1_11.heroBaseLabel')}
      </text>
      <text
        x="188" y="234"
        fontSize="13"
        fontFamily="Georgia, serif"
        textAnchor="middle"
        fill="currentColor"
        fillOpacity="0.7"
      >
        {t('ch1_11.heroEmitterLabel')}
      </text>

      {/* ── Bridge between halves ─────────────────────────────────── */}
      {/* Two small arrows top→bottom, conveying «same thing, two ways» */}
      <g stroke="currentColor" strokeWidth="1.2" opacity="0.55" fill="currentColor">
        <line x1="260" y1="100" x2="295" y2="100" strokeLinecap="round" />
        <polygon points="295,97 301,100 295,103" />
        <line x1="295" y1="120" x2="260" y2="120" strokeLinecap="round" />
        <polygon points="260,117 254,120 260,123" />
      </g>

      {/* ── Right half: NPN schematic symbol ──────────────────────── */}
      {/* Uses the SAME `<TransistorNPN>` primitive as every schematic
          in this chapter. Wrapped in scale(1.5) around (430, 110) so
          the body reads at hero scale (effective r≈30) rather than
          the much smaller r=20 the primitive renders at its native
          0.4× wrapper scale. After scale(1.5):
            base pin     = (430 - 30·1.5, 110)         = (385, 110)
            collector pin = (430 + 10·1.5, 110 - 30·1.5) = (445,  65)
            emitter pin   = (430 + 10·1.5, 110 + 30·1.5) = (445, 155)
          The external leads below attach exactly to these endpoints. */}

      <g transform="translate(430,110) scale(1.5) translate(-430,-110)">
        <TransistorNPN x={430} y={110} />
      </g>

      {/* Base lead going off to the LEFT, ending at primitive's base pin */}
      <line
        x1="310" y1="110" x2="385" y2="110"
        stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"
      />

      {/* Collector lead vertical extension going UP from primitive's
          collector pin to the «C» label area. */}
      <line
        x1="445" y1="65" x2="445" y2="30"
        stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"
      />

      {/* Emitter lead vertical extension going DOWN from primitive's
          emitter pin to the «E» label area. */}
      <line
        x1="445" y1="155" x2="445" y2="190"
        stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"
      />

      {/* Symbol terminal labels — B/C/E in italic, floating just
          outside the body circle near each pin entry point. All three
          labels sit at a similar small offset from the circle's edge
          so the symbol reads as a consistent «label-next-to-pin»
          pattern rather than scattering them at the far ends of the
          leads (which is what the original hand-drawn version did and
          a reader called out as visually disconnected). */}
      <text
        x="372" y="103"
        fontSize="13"
        fontStyle="italic"
        fontFamily="Georgia, serif"
        fill="currentColor"
        fillOpacity="0.85"
      >
        B
      </text>
      <text
        x="455" y="60"
        fontSize="13"
        fontStyle="italic"
        fontFamily="Georgia, serif"
        fill="currentColor"
        fillOpacity="0.85"
      >
        C
      </text>
      <text
        x="455" y="170"
        fontSize="13"
        fontStyle="italic"
        fontFamily="Georgia, serif"
        fill="currentColor"
        fillOpacity="0.85"
      >
        E
      </text>

      {/* Symbol caption underneath, italic */}
      <text
        x="430" y="208"
        fontSize="12"
        fontStyle="italic"
        fontFamily="Georgia, serif"
        textAnchor="middle"
        fill="currentColor"
        fillOpacity="0.65"
      >
        {t('ch1_11.heroSymbolLabel')}
      </text>
    </svg>
  )
}
