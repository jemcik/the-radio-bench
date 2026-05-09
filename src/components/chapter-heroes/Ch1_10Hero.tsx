/**
 * Chapter 1.10 hero — physical-diode-and-symbol pairing.
 *
 * Left half:  pen-and-ink sketch of a glass-bodied through-hole diode
 *             (1N4148-style) with leads and a cathode band near the
 *             cathode end.
 * Right half: the schematic symbol in standard form with anode (A) and
 *             cathode (K) annotated, sitting on a single horizontal lead.
 * Between them: a small «↔» style relationship arrow, so the reader sees
 *             at a glance that the part on the workbench and the
 *             triangle-and-bar in a schematic are the same object viewed
 *             two ways.
 *
 * Convention: cathode is on the RIGHT in both halves so the «direction
 * of conventional current flow» (anode → cathode) reads left-to-right
 * everywhere, including the schematic symbol whose triangle-arrow
 * already points right.
 *
 * hardcoded-fontsize-file-ok: hero illustration with hand-tuned label
 * sizes in user-space units. No sibling diagrams in this file.
 */
import { useTranslation } from 'react-i18next'

export default function Ch1_10Hero() {
  const { t } = useTranslation('ui')

  return (
    <svg
      viewBox="0 0 540 220"
      width="540"
      height="220"
      fill="none"
      aria-label={t('ch1_10.heroAriaLabel')}
      role="img"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* ── Left half: physical diode ─────────────────────────────── */}
      {/* Lead — anode side (left) */}
      <line
        x1="20" y1="100" x2="100" y2="100"
        stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
      />
      {/* Lead — cathode side (right) */}
      <line
        x1="220" y1="100" x2="300" y2="100"
        stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
      />

      {/* Glass body — rounded rectangle with gentle highlights */}
      <rect
        x="100" y="78" width="120" height="44" rx="22"
        fill="hsl(var(--background))"
        stroke="currentColor"
        strokeWidth="2"
      />
      {/* Inner highlight (top reflection) */}
      <path
        d="M 112 86 q 30 -8 96 0"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        opacity="0.45"
        strokeLinecap="round"
      />
      {/* Bottom shadow */}
      <path
        d="M 112 114 q 30 8 96 0"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        opacity="0.25"
        strokeLinecap="round"
      />

      {/* Cathode band — opaque stripe on the cathode end of the body */}
      <rect
        x="195" y="78" width="14" height="44" rx="2"
        fill="currentColor"
        opacity="0.85"
      />

      {/* P–N junction line inside the body — subtle vertical hint that
          there's an internal boundary between two materials. Drawn at
          ~40 % from the anode end (to the LEFT of the cathode band) so
          it reads as «the actual junction is somewhere in the middle,
          the cathode band is just paint». */}
      <line
        x1="148" y1="84" x2="148" y2="116"
        stroke="currentColor"
        strokeWidth="0.8"
        opacity="0.4"
        strokeDasharray="2 3"
      />

      {/* Anode label, low-key under the lead */}
      <text
        x="60" y="124"
        fontSize="13"
        fill="currentColor"
        fillOpacity="0.7"
        textAnchor="middle"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        {t('ch1_10.heroAnodeLabel')}
      </text>
      {/* Cathode label */}
      <text
        x="260" y="124"
        fontSize="13"
        fill="currentColor"
        fillOpacity="0.7"
        textAnchor="middle"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        {t('ch1_10.heroCathodeLabel')}
      </text>

      {/* «Cathode band» pointer — small bracket above the band */}
      <path
        d="M 196 70 L 196 65 L 208 65 L 208 70"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        opacity="0.55"
      />
      <text
        x="202" y="55"
        fontSize="11"
        fill="currentColor"
        fillOpacity="0.7"
        textAnchor="middle"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        {t('ch1_10.heroBandLabel')}
      </text>

      {/* ── Bridge between halves ─────────────────────────────────── */}
      {/* Two small arrows top→bottom, conveying «same thing, two ways» */}
      <g stroke="currentColor" strokeWidth="1.2" opacity="0.55" fill="currentColor">
        <line x1="320" y1="92" x2="335" y2="92" strokeLinecap="round" />
        <polygon points="335,89 341,92 335,95" />
        <line x1="335" y1="108" x2="320" y2="108" strokeLinecap="round" />
        <polygon points="320,105 314,108 320,111" />
      </g>

      {/* ── Right half: schematic symbol ───────────────────────────── */}
      {/* Anode lead */}
      <line
        x1="355" y1="100" x2="430" y2="100"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round"
      />
      {/* Triangle (anode→cathode) */}
      <path
        d="M 430 80 L 460 100 L 430 120 Z"
        fill="hsl(var(--background))"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* Cathode bar */}
      <line
        x1="460" y1="80" x2="460" y2="120"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round"
      />
      {/* Cathode lead */}
      <line
        x1="460" y1="100" x2="520" y2="100"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round"
      />

      {/* Conventional-current arrow flowing through the symbol */}
      <g stroke="currentColor" strokeWidth="1.2" opacity="0.7" fill="currentColor">
        <line x1="365" y1="148" x2="500" y2="148" strokeLinecap="round" />
        <polygon points="500,144 510,148 500,152" />
      </g>
      <text
        x="437" y="170"
        fontSize="13"
        fontStyle="italic"
        fill="currentColor"
        fillOpacity="0.75"
        textAnchor="middle"
        fontFamily="Georgia, serif"
      >
        {t('ch1_10.heroFlowLabel')}
      </text>

      {/* «A» and «K» labels at each end of the symbol */}
      <text
        x="392" y="93"
        fontSize="14"
        fontStyle="italic"
        fontWeight="700"
        fill="currentColor"
        fillOpacity="0.85"
        textAnchor="middle"
        fontFamily="Georgia, serif"
      >
        A
      </text>
      <text
        x="490" y="93"
        fontSize="14"
        fontStyle="italic"
        fontWeight="700"
        fill="currentColor"
        fillOpacity="0.85"
        textAnchor="middle"
        fontFamily="Georgia, serif"
      >
        K
      </text>
    </svg>
  )
}
