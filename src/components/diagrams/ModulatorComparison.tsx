/**
 * Chapter 3.2 §4 — one carrier, three mode-specific modulators.
 *
 *   [carrier + message] ─┬─→ CW   carrier keyed on and off
 *                        ├─→ SSB  balanced modulator + filter
 *                        └─→ FM   reactance modulator on the oscillator
 *
 * The generation-side mirror of the 3.1 ModeDetectorComparison. Block diagram
 * (not a circuit schematic). Static snapshot — bare <svg>, fixed px = viewBox,
 * numeric fontSize, per the diagram-quality skill.
 *
 * hardcoded-fontsize-file-ok: block diagram with hand-tuned label sizes in
 * user-space units. No SVGDiagram wrapper.
 */
import { useTranslation } from 'react-i18next'
import DiagramFigure from './DiagramFigure'
import { svgTokens } from './svgTokens'

const VB_W = 680
const VB_H = 200

const SRC = { x: 16, y: 72, w: 168, h: 56 }
const BADGE_X = 304
const BADGE_W = 56
const BADGE_H = 34
const TEXT_X = 376

const TRUNK_X = 240
const ARROW_TIP_X = BADGE_X - 4

const SANS = 'ui-sans-serif, system-ui, sans-serif'

export default function ModulatorComparison() {
  const { t } = useTranslation('ui')

  const rows: Array<{ y: number; name: string; gen: string; tone: string }> = [
    { y: 44, name: t('ch3_2.modulators.cwName'), gen: t('ch3_2.modulators.cwGen'), tone: svgTokens.onair },
    { y: 100, name: t('ch3_2.modulators.ssbName'), gen: t('ch3_2.modulators.ssbGen'), tone: svgTokens.note },
    { y: 156, name: t('ch3_2.modulators.fmName'), gen: t('ch3_2.modulators.fmGen'), tone: svgTokens.experiment },
  ]

  return (
    <DiagramFigure caption={t('ch3_2.modulators.caption')}>
      <svg
        width={VB_W}
        height={VB_H}
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        role="img"
        aria-label={t('ch3_2.modulators.ariaLabel')}
        style={{ display: 'block', margin: '0 auto', maxWidth: '100%', height: 'auto' }}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* ── Shared source: carrier + message ─────────────────────── */}
        <rect x={SRC.x} y={SRC.y} width={SRC.w} height={SRC.h} rx={7}
          stroke={svgTokens.fg} strokeWidth={1.7} fill="hsl(var(--muted))" />
        <text x={SRC.x + SRC.w / 2} y={SRC.y + SRC.h / 2 + 5} fontSize="14" fontWeight={600}
          textAnchor="middle" fill={svgTokens.fg} fontFamily={SANS}>
          {t('ch3_2.modulators.source')}
        </text>

        {/* ── Fan-out bus: source stub → vertical trunk → branches ─── */}
        <line x1={SRC.x + SRC.w} y1={SRC.y + SRC.h / 2} x2={TRUNK_X} y2={SRC.y + SRC.h / 2}
          stroke={svgTokens.mutedFg} strokeWidth={1.5} />
        <line x1={TRUNK_X} y1={rows[0].y} x2={TRUNK_X} y2={rows[rows.length - 1].y}
          stroke={svgTokens.mutedFg} strokeWidth={1.5} />
        <circle cx={TRUNK_X} cy={SRC.y + SRC.h / 2} r={2.6} fill={svgTokens.mutedFg} />

        {rows.map(r => (
          <g key={r.name}>
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
            {/* generation method */}
            <text x={TEXT_X} y={r.y + 5} fontSize="13.5" textAnchor="start" fill={svgTokens.fg} fontFamily={SANS}>
              {r.gen}
            </text>
          </g>
        ))}
      </svg>
    </DiagramFigure>
  )
}
