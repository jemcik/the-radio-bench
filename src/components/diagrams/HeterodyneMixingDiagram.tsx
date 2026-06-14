/**
 * Chapter 3.1 §3 — the mixer and the heterodyne (sum/difference) outputs.
 *
 *   [incoming station] ┐
 *                      ├─(×)─┬─→ [IF filter] → difference = IF
 *   [local oscillator] ┘     └ ⇢ sum (filtered out)
 *
 * Block diagram (not a circuit schematic). Static snapshot — bare <svg>,
 * fixed px = viewBox, numeric fontSize, per the diagram-quality skill.
 */
import { useTranslation } from 'react-i18next'
import DiagramFigure from './DiagramFigure'
import { svgTokens } from './svgTokens'

const VB_W = 620
const VB_H = 168

const IN1 = { x: 16, y: 40, w: 132, h: 30 }
const IN2 = { x: 16, y: 102, w: 132, h: 30 }
const MX = { cx: 206, cy: 86, r: 22 }
const IFBOX = { x: 300, y: 44, w: 88, h: 30 }

const SANS = 'ui-sans-serif, system-ui, sans-serif'

export default function HeterodyneMixingDiagram() {
  const { t } = useTranslation('ui')

  return (
    <DiagramFigure caption={t('ch3_1.mixing.caption')}>
      <svg
        width={VB_W}
        height={VB_H}
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        role="img"
        aria-label={t('ch3_1.mixing.ariaLabel')}
        style={{ display: 'block', margin: '0 auto', maxWidth: '100%', height: 'auto' }}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* ── Input boxes ──────────────────────────────────────────── */}
        {[[IN1, t('ch3_1.mixing.rfIn')], [IN2, t('ch3_1.mixing.loIn')]].map(([b, label]) => {
          const box = b as typeof IN1
          return (
            <g key={label as string}>
              <rect x={box.x} y={box.y} width={box.w} height={box.h} rx={5}
                stroke={svgTokens.fg} strokeWidth={1.5} fill="hsl(var(--muted))" />
              <text x={box.x + box.w / 2} y={box.y + box.h / 2 + 4} fontSize="13"
                textAnchor="middle" fill={svgTokens.fg} fontFamily={SANS}>
                {label as string}
              </text>
            </g>
          )
        })}

        {/* inputs → mixer */}
        <line x1={IN1.x + IN1.w} y1={IN1.y + IN1.h / 2} x2={MX.cx - MX.r * 0.8} y2={MX.cy - 8}
          stroke={svgTokens.fg} strokeWidth={1.5} />
        <line x1={IN2.x + IN2.w} y1={IN2.y + IN2.h / 2} x2={MX.cx - MX.r * 0.8} y2={MX.cy + 8}
          stroke={svgTokens.fg} strokeWidth={1.5} />

        {/* ── Mixer (circle with ×) ────────────────────────────────── */}
        <circle cx={MX.cx} cy={MX.cy} r={MX.r} stroke={svgTokens.fg} strokeWidth={1.7} fill="hsl(var(--muted))" />
        <line x1={MX.cx - 11} y1={MX.cy - 11} x2={MX.cx + 11} y2={MX.cy + 11} stroke={svgTokens.fg} strokeWidth={1.7} />
        <line x1={MX.cx - 11} y1={MX.cy + 11} x2={MX.cx + 11} y2={MX.cy - 11} stroke={svgTokens.fg} strokeWidth={1.7} />
        <text x={MX.cx} y={MX.cy + MX.r + 18} fontSize="13" textAnchor="middle" fill={svgTokens.mutedFg} fontFamily={SANS}>
          {t('ch3_1.mixing.mixer')}
        </text>

        {/* ── Kept branch: difference → IF filter ──────────────────── */}
        <line x1={MX.cx + MX.r} y1={MX.cy - 6} x2={IFBOX.x - 2} y2={IFBOX.y + IFBOX.h / 2}
          stroke={svgTokens.primary} strokeWidth={2} />
        <rect x={IFBOX.x} y={IFBOX.y} width={IFBOX.w} height={IFBOX.h} rx={5}
          stroke={svgTokens.primary} strokeWidth={1.6} fill="hsl(var(--muted))" />
        <text x={IFBOX.x + IFBOX.w / 2} y={IFBOX.y + IFBOX.h / 2 + 4} fontSize="13"
          textAnchor="middle" fill={svgTokens.fg} fontFamily={SANS}>
          {t('ch3_1.mixing.ifFilter')}
        </text>
        <line x1={IFBOX.x + IFBOX.w} y1={IFBOX.y + IFBOX.h / 2} x2={IFBOX.x + IFBOX.w + 36} y2={IFBOX.y + IFBOX.h / 2}
          stroke={svgTokens.primary} strokeWidth={2} />
        <path d={`M ${IFBOX.x + IFBOX.w + 36} ${IFBOX.y + IFBOX.h / 2} l -8 -4 v 8 z`} fill={svgTokens.primary} />
        <text x={IFBOX.x + IFBOX.w + 44} y={IFBOX.y + IFBOX.h / 2 + 4} fontSize="13.5" fontWeight={600}
          textAnchor="start" fill={svgTokens.primary} fontFamily={SANS}>
          {t('ch3_1.mixing.diff')}
        </text>

        {/* ── Rejected branch: sum (dim, dashed) ───────────────────── */}
        <line x1={MX.cx + MX.r} y1={MX.cy + 6} x2={295} y2={124}
          stroke={svgTokens.mutedFg} strokeWidth={1.4} strokeDasharray="4 3" opacity={0.55} />
        <text x={302} y={128} fontSize="13" textAnchor="start" fill={svgTokens.mutedFg} fontFamily={SANS} opacity={0.85}>
          {t('ch3_1.mixing.sum')}
        </text>
      </svg>
    </DiagramFigure>
  )
}
