/**
 * Chapter 3.1 §6 — one shared front end, four mode-specific detectors.
 *
 *   [shared front end] ─┬─→ AM   diode envelope detector
 *                       ├─→ SSB  product detector + BFO
 *                       ├─→ CW   BFO → audible tone
 *                       └─→ FM   limiter + discriminator
 *
 * Block diagram (not a circuit schematic). Static snapshot — bare <svg>,
 * fixed px = viewBox, numeric fontSize, per the diagram-quality skill.
 */
import { useTranslation } from 'react-i18next'
import DiagramFigure from './DiagramFigure'
import { svgTokens } from './svgTokens'

const VB_W = 640
const VB_H = 240

// FE box widened from the EN-sized 150 → 186: the UA label «спільний вхідний тракт»
// is ~70 % wider than «shared front end» and overflowed the narrower box.
const FE = { x: 20, y: 91, w: 186, h: 58 }
const BADGE_X = 300
const BADGE_W = 56
const BADGE_H = 34
const TEXT_X = 368

// Orthogonal fan-out bus (matches the header sketch): a horizontal stub leaves
// the front-end box, meets a vertical trunk, and each row branches off
// horizontally so every arrowhead points straight into its badge. TRUNK_X sits
// between the FE right edge (206) and the badges (300); the arrow tip stops 4 px
// short of the badge.
const TRUNK_X = 254
const ARROW_TIP_X = BADGE_X - 4

const SANS = 'ui-sans-serif, system-ui, sans-serif'

export default function ModeDetectorComparison() {
  const { t } = useTranslation('ui')

  const rows: Array<{ y: number; name: string; det: string; tone: string }> = [
    { y: 36, name: t('ch3_1.modeDetectors.amName'), det: t('ch3_1.modeDetectors.amDet'), tone: svgTokens.key },
    { y: 92, name: t('ch3_1.modeDetectors.ssbName'), det: t('ch3_1.modeDetectors.ssbDet'), tone: svgTokens.note },
    { y: 148, name: t('ch3_1.modeDetectors.cwName'), det: t('ch3_1.modeDetectors.cwDet'), tone: svgTokens.onair },
    { y: 204, name: t('ch3_1.modeDetectors.fmName'), det: t('ch3_1.modeDetectors.fmDet'), tone: svgTokens.experiment },
  ]

  return (
    <DiagramFigure caption={t('ch3_1.modeDetectors.caption')}>
      <svg
        width={VB_W}
        height={VB_H}
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        role="img"
        aria-label={t('ch3_1.modeDetectors.ariaLabel')}
        style={{ display: 'block', margin: '0 auto', maxWidth: '100%', height: 'auto' }}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* ── Shared front end ─────────────────────────────────────── */}
        <rect x={FE.x} y={FE.y} width={FE.w} height={FE.h} rx={7}
          stroke={svgTokens.fg} strokeWidth={1.7} fill="hsl(var(--muted))" />
        <text x={FE.x + FE.w / 2} y={FE.y + FE.h / 2 + 5} fontSize="14" fontWeight={600}
          textAnchor="middle" fill={svgTokens.fg} fontFamily={SANS}>
          {t('ch3_1.modeDetectors.frontEnd')}
        </text>

        {/* ── Fan-out bus: FE stub → vertical trunk → per-row branches ─ */}
        <line x1={FE.x + FE.w} y1={FE.y + FE.h / 2} x2={TRUNK_X} y2={FE.y + FE.h / 2}
          stroke={svgTokens.mutedFg} strokeWidth={1.5} />
        <line x1={TRUNK_X} y1={rows[0].y} x2={TRUNK_X} y2={rows[rows.length - 1].y}
          stroke={svgTokens.mutedFg} strokeWidth={1.5} />
        <circle cx={TRUNK_X} cy={FE.y + FE.h / 2} r={2.6} fill={svgTokens.mutedFg} />

        {rows.map(r => (
          <g key={r.name}>
            {/* horizontal branch + arrowhead pointing straight into the badge */}
            <line x1={TRUNK_X} y1={r.y} x2={ARROW_TIP_X} y2={r.y}
              stroke={svgTokens.mutedFg} strokeWidth={1.5} />
            <path d={`M ${ARROW_TIP_X} ${r.y} l -7 -3.5 v 7 z`} fill={svgTokens.mutedFg} />
            {/* mode badge */}
            <rect x={BADGE_X} y={r.y - BADGE_H / 2} width={BADGE_W} height={BADGE_H} rx={6}
              stroke={r.tone} strokeWidth={1.7} fill="hsl(var(--muted))" />
            <text x={BADGE_X + BADGE_W / 2} y={r.y + 5} fontSize="14" fontWeight={700}
              textAnchor="middle" fill={r.tone} fontFamily={SANS}>
              {r.name}
            </text>
            {/* detector description */}
            <text x={TEXT_X} y={r.y + 5} fontSize="13.5" textAnchor="start" fill={svgTokens.fg} fontFamily={SANS}>
              {r.det}
            </text>
          </g>
        ))}
      </svg>
    </DiagramFigure>
  )
}
