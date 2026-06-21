/**
 * Chapter 3.2 §1 — the three jobs of a transmitter, on one signal-path line.
 *
 *   microphone (your message) → [generate] → [modulate] → [amplify] → antenna (≈100 W)
 *                               └────────── power × 100 000 (≈ 50 dB) ──────────┘
 *
 * The power-domain mirror of the 3.1 ReceiverJobsDiagram: a block diagram (not a
 * circuit schematic) with a microphone glyph, three labelled boxes, a radiating
 * antenna glyph and a gain bracket. Static snapshot — bare <svg>, fixed px =
 * viewBox, numeric fontSize, per the diagram-quality skill.
 *
 * hardcoded-fontsize-file-ok: block diagram with hand-tuned label sizes in
 * user-space units. No SVGDiagram wrapper, no sibling-diagram scaling.
 */
import { useTranslation } from 'react-i18next'
import DiagramFigure from './DiagramFigure'
import { svgTokens } from './svgTokens'

const VB_W = 620
const VB_H = 198
const FLOW_Y = 72

const GENERATE = { x: 92, y: 48, w: 104, h: 48 }
const MODULATE = { x: 236, y: 48, w: 104, h: 48 }
const AMPLIFY = { x: 380, y: 48, w: 104, h: 48 }
const MIC_X = 30
const ANT_X = 556

const SANS = 'ui-sans-serif, system-ui, sans-serif'

/** Square measurement bracket spanning x0..x1, dropping `depth` below y. */
function bracket(x0: number, x1: number, y: number, depth: number): string {
  return `M ${x0} ${y} V ${y + depth} H ${x1} V ${y}`
}

function arrow(toX: number, y: number) {
  return `M ${toX} ${y} l -8 -4 v 8 z`
}

/** A circular arc segment between two angles (degrees, screen coords). */
function arc(cx: number, cy: number, r: number, a0: number, a1: number): string {
  const p = (a: number) => [cx + r * Math.cos((a * Math.PI) / 180), cy + r * Math.sin((a * Math.PI) / 180)]
  const [x0, y0] = p(a0)
  const [x1, y1] = p(a1)
  return `M ${x0.toFixed(1)} ${y0.toFixed(1)} A ${r} ${r} 0 0 1 ${x1.toFixed(1)} ${y1.toFixed(1)}`
}

export default function TransmitterJobsDiagram() {
  const { t } = useTranslation('ui')
  const boxes: Array<[typeof GENERATE, string]> = [
    [GENERATE, t('ch3_2.jobs.generate')],
    [MODULATE, t('ch3_2.jobs.modulate')],
    [AMPLIFY, t('ch3_2.jobs.amplify')],
  ]

  return (
    <DiagramFigure caption={t('ch3_2.jobs.caption')}>
      <svg
        width={VB_W}
        height={VB_H}
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        role="img"
        aria-label={t('ch3_2.jobs.ariaLabel')}
        style={{ display: 'block', margin: '0 auto', maxWidth: '100%', height: 'auto' }}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* ── Microphone (the message going in) ────────────────────── */}
        <rect x={MIC_X - 10} y={42} width={20} height={24} rx={10}
          stroke={svgTokens.fg} strokeWidth={1.8} fill="hsl(var(--muted))" />
        {[49, 54, 59].map(y => (
          <line key={y} x1={MIC_X - 5} y1={y} x2={MIC_X + 5} y2={y} stroke={svgTokens.fg} strokeWidth={1} opacity={0.55} />
        ))}
        <line x1={MIC_X} y1={66} x2={MIC_X + 10} y2={FLOW_Y} stroke={svgTokens.fg} strokeWidth={1.8} strokeLinecap="round" />
        {/* The mic caption. UA «ваше повідомлення» (~124 px) is far wider than EN
            «your message», so it is left-anchored — centring it under the 20 px mic
            glyph would clip the left viewBox edge — AND dropped to FLOW_Y+46 so its
            top clears the first box's bottom (y = GENERATE.y + h = 96). At the old
            FLOW_Y+30 the UA label's top (y≈90) poked into the box's lower-left corner;
            EN was short enough to miss the box, which is why it slipped through. */}
        <text x={8} y={FLOW_Y + 46} fontSize="13" textAnchor="start" fill={svgTokens.mutedFg} fontFamily={SANS}>
          {t('ch3_2.jobs.micLabel')}
        </text>

        {/* mic → first box */}
        <line x1={MIC_X + 10} y1={FLOW_Y} x2={GENERATE.x - 6} y2={FLOW_Y} stroke={svgTokens.fg} strokeWidth={1.6} />
        <path d={arrow(GENERATE.x - 6, FLOW_Y)} fill={svgTokens.fg} />

        {/* ── Three job boxes ──────────────────────────────────────── */}
        {boxes.map(([b, label], i) => (
          <g key={label}>
            <rect x={b.x} y={b.y} width={b.w} height={b.h} rx={6}
              stroke={svgTokens.fg} strokeWidth={1.6} fill="hsl(var(--muted))" />
            <text x={b.x + b.w / 2} y={FLOW_Y + 5} fontSize="14" fontWeight={600}
              textAnchor="middle" fill={svgTokens.fg} fontFamily={SANS}>
              {label}
            </text>
            {i < 2 && (
              <>
                <line x1={b.x + b.w} y1={FLOW_Y} x2={[MODULATE, AMPLIFY][i].x - 6} y2={FLOW_Y}
                  stroke={svgTokens.fg} strokeWidth={1.6} />
                <path d={arrow([MODULATE, AMPLIFY][i].x - 6, FLOW_Y)} fill={svgTokens.fg} />
              </>
            )}
          </g>
        ))}

        {/* amplify → antenna (the signal we generated, in the primary accent) */}
        <line x1={AMPLIFY.x + AMPLIFY.w} y1={FLOW_Y} x2={ANT_X} y2={FLOW_Y}
          stroke={svgTokens.primary} strokeWidth={2.2} />
        <path d={arrow(ANT_X - 2, FLOW_Y)} fill={svgTokens.primary} />

        {/* ── Transmitting antenna + radiating arcs ────────────────── */}
        <line x1={ANT_X} y1={FLOW_Y} x2={ANT_X} y2={FLOW_Y - 38} stroke={svgTokens.fg} strokeWidth={2.4} strokeLinecap="round" />
        <circle cx={ANT_X} cy={FLOW_Y - 38} r={2.2} fill={svgTokens.fg} />
        {[12, 22].map((r, i) => (
          <path key={r} d={arc(ANT_X, FLOW_Y - 38, r, -76, 6)} stroke={svgTokens.primary}
            strokeWidth={i === 0 ? 2 : 1.6} opacity={i === 0 ? 0.9 : 0.55} fill="none" strokeLinecap="round" />
        ))}
        <text x={ANT_X} y={FLOW_Y + 30} fontSize="13" textAnchor="middle" fill={svgTokens.mutedFg} fontFamily={SANS}>
          {t('ch3_2.jobs.antenna')}
        </text>
        <text x={ANT_X} y={FLOW_Y + 46} fontSize="13" fontWeight={600} textAnchor="middle" fill={svgTokens.fg} fontFamily={SANS}>
          {t('ch3_2.jobs.antLevel')}
        </text>

        {/* ── Power-gain bracket under the three boxes ─────────────── */}
        <path d={bracket(GENERATE.x, AMPLIFY.x + AMPLIFY.w, 128, 8)} stroke={svgTokens.primary}
          strokeWidth={1.2} fill="none" opacity={0.7} />
        <text x={(GENERATE.x + AMPLIFY.x + AMPLIFY.w) / 2} y={152} fontSize="13.5" fontWeight={600}
          textAnchor="middle" fill={svgTokens.fg} fontFamily={SANS}>
          {t('ch3_2.jobs.gain')}
        </text>
      </svg>
    </DiagramFigure>
  )
}
