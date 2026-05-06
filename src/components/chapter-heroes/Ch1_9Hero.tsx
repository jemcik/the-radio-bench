/**
 * Chapter 1.9 hero — Gemini 3.1 Pro winding geometry, with the
 * helical wrap split into BACK and FRONT paths so the back-passes
 * are correctly occluded by the iron core.
 *
 * Each winding is one continuous helical sine wave (8 half-periods
 * for primary, 12 for secondary). Odd half-periods are FRONT passes
 * (visible across the leg face); even half-periods are BACK passes
 * (drawn BEFORE the core fill, so their middles get hidden by the
 * iron — only small tabs at the leg edges peek out).
 *
 * The smooth-tangent (vertical-at-extremes) Bezier control points
 * mean adjacent half-periods join with no kinks at every leg-edge
 * contact point.
 *
 * hardcoded-fontsize-file-ok: hero illustration — hand-tuned label
 * sizes in user-space units. Converting to em would change visual
 * proportions; no sibling diagrams in this file to be inconsistent with.
 */
import { useTranslation } from 'react-i18next'

export default function Ch1_9Hero() {
  const { t } = useTranslation('ui')

  return (
    <svg
      viewBox="0 0 540 220"
      width="540"
      height="220"
      fill="none"
      aria-label={t('ch1_9.heroAriaLabel')}
      role="img"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Layer 1: BACK passes — drawn FIRST so the core fill below
          will occlude their middles. Only the small tabs outside the
          leg edges (in the window and to the left of the core) remain
          visible. */}
      <g stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none">
        {/* Primary back: even half-periods 2, 4, 6, 8 */}
        <path d="
          M 208 68.5  C 208 73.9, 142 76.6, 142 82
          M 208 95.5  C 208 100.9, 142 103.6, 142 109
          M 208 122.5 C 208 127.9, 142 130.6, 142 136
          M 208 149.5 C 208 154.9, 142 157.6, 142 163
        " />
        {/* Secondary back: even half-periods (going L→R: 332→398) */}
        <path d="
          M 332 64  C 332 67.6, 398 69.4, 398 73
          M 332 82  C 332 85.6, 398 87.4, 398 91
          M 332 100 C 332 103.6, 398 105.4, 398 109
          M 332 118 C 332 121.6, 398 123.4, 398 127
          M 332 136 C 332 139.6, 398 141.4, 398 145
          M 332 154 C 332 157.6, 398 159.4, 398 163
        " />
      </g>

      {/* Layer 2: Core occluder — opaque background fills the iron
          (everywhere except the window cutout). This hides the
          middle of each back-pass, leaving only the visible tabs. */}
      <path
        d="M 150 20 h 240 v 180 h -240 Z M 200 50 v 120 h 140 v -120 Z"
        fill="hsl(var(--background))"
        fillRule="evenodd"
      />

      {/* Layer 3: Lamination outlines — three nested rectangles with
          decreasing opacity. */}
      <path d="M 146 16 h 248 v 188 h -248 Z M 204 54 v 112 h 132 v -112 Z" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.3" />
      <path d="M 148 18 h 244 v 184 h -244 Z M 202 52 v 116 h 136 v -116 Z" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.6" />
      <path d="M 150 20 h 240 v 180 h -240 Z M 200 50 v 120 h 140 v -120 Z" fill="none" stroke="currentColor" strokeWidth="1.2" />

      {/* Layer 4: Flux loop and 4 directional arrowheads */}
      <rect x="175" y="35" width="190" height="150" rx="10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="6 6" />
      <g fill="currentColor">
        <polygon points="274,31 266,35 274,39" />
        <polygon points="361,114 365,106 369,114" />
        <polygon points="266,181 274,185 266,189" />
        <polygon points="171,106 175,114 179,106" />
      </g>

      {/* Layer 5: FRONT passes + terminal entry/exit leads.
          Drawn AFTER the core fill, so the entire path is visible
          across the leg face — these are the wire's «front» helical
          passes that the reader sees. */}
      <g stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none">
        {/* Primary front: terminal in + odd half-periods 1, 3, 5, 7 + terminal out */}
        <path d="
          M 90 45  C 120 45, 142 45, 142 55
          C 142 60.4, 208 63.1, 208 68.5
          M 142 82  C 142 87.4, 208 90.1, 208 95.5
          M 142 109 C 142 114.4, 208 117.1, 208 122.5
          M 142 136 C 142 141.4, 208 144.1, 208 149.5
          M 142 163 C 142 173, 120 173, 90 173
        " />
        {/* Secondary front: terminal in + odd half-periods + terminal out */}
        <path d="
          M 450 45 C 420 45, 398 45, 398 55
          C 398 58.6, 332 60.4, 332 64
          M 398 73  C 398 76.6, 332 78.4, 332 82
          M 398 91  C 398 94.6, 332 96.4, 332 100
          M 398 109 C 398 112.6, 332 114.4, 332 118
          M 398 127 C 398 130.6, 332 132.4, 332 136
          M 398 145 C 398 148.6, 332 150.4, 332 154
          M 398 163 C 398 173, 420 173, 450 173
        " />
      </g>

      {/* Terminal dots */}
      <circle cx="90" cy="45" r="3" fill="currentColor" />
      <circle cx="90" cy="173" r="3" fill="currentColor" />
      <circle cx="450" cy="45" r="3" fill="currentColor" />
      <circle cx="450" cy="173" r="3" fill="currentColor" />

      {/* V_p bracket */}
      <path d="M 80 45 L 70 45 L 70 173 L 80 173" fill="none" stroke="currentColor" strokeWidth="1" />
      <polygon points="67,50 70,45 73,50" fill="currentColor" />
      <polygon points="67,168 70,173 73,168" fill="currentColor" />
      <text x="55" y="113" fontFamily="Georgia, serif" fontSize="16" fontStyle="italic" fontWeight="700" fill="currentColor" textAnchor="middle">
        V<tspan dy="4" fontSize="0.75em" fontStyle="normal">p</tspan>
      </text>

      {/* V_s bracket */}
      <path d="M 460 45 L 470 45 L 470 173 L 460 173" fill="none" stroke="currentColor" strokeWidth="1" />
      <polygon points="467,50 470,45 473,50" fill="currentColor" />
      <polygon points="467,168 470,173 473,168" fill="currentColor" />
      <text x="485" y="113" fontFamily="Georgia, serif" fontSize="16" fontStyle="italic" fontWeight="700" fill="currentColor" textAnchor="middle">
        V<tspan dy="4" fontSize="0.75em" fontStyle="normal">s</tspan>
      </text>

      {/* I_p arrow */}
      <line x1="95" y1="35" x2="115" y2="35" stroke="currentColor" strokeWidth="1.5" />
      <polygon points="112,31 118,35 112,39" fill="currentColor" />
      <text x="105" y="28" fontFamily="Georgia, serif" fontSize="16" fontStyle="italic" fontWeight="700" fill="currentColor" textAnchor="middle">
        I<tspan dy="4" fontSize="0.75em" fontStyle="normal">p</tspan>
      </text>

      {/* I_s arrow */}
      <line x1="425" y1="35" x2="445" y2="35" stroke="currentColor" strokeWidth="1.5" />
      <polygon points="442,31 448,35 442,39" fill="currentColor" />
      <text x="435" y="28" fontFamily="Georgia, serif" fontSize="16" fontStyle="italic" fontWeight="700" fill="currentColor" textAnchor="middle">
        I<tspan dy="4" fontSize="0.75em" fontStyle="normal">s</tspan>
      </text>

      {/* N_p, N_s, Φ */}
      <text x="125" y="115" fontFamily="Georgia, serif" fontSize="16" fontStyle="italic" fontWeight="700" fill="currentColor" textAnchor="middle">
        N<tspan dy="4" fontSize="0.75em" fontStyle="normal">p</tspan>
      </text>
      <text x="415" y="115" fontFamily="Georgia, serif" fontSize="16" fontStyle="italic" fontWeight="700" fill="currentColor" textAnchor="middle">
        N<tspan dy="4" fontSize="0.75em" fontStyle="normal">s</tspan>
      </text>
      <text x="270" y="115" fontFamily="Georgia, serif" fontSize="20" fontStyle="italic" fontWeight="700" fill="currentColor" textAnchor="middle">
        Φ
      </text>
    </svg>
  )
}
