/**
 * Chapter 4.2 §5 — why a ferrite choke blocks the interference but not the
 * wanted signal.
 *
 * Two rows, same cable + core. Top: the wanted DIFFERENTIAL signal — out on
 * one wire, back on the other. Its equal-and-opposite fields cancel in the
 * core, so it passes untouched. Bottom: the COMMON-MODE interference — the
 * same current on every wire. Its fields add, the core presents a high
 * impedance, and it is blocked. (ARRL Handbook 2023 ch27 §27.3.4.)
 *
 * Conceptual illustration, bare <svg> at fixed px = viewBox, 13 px label
 * floor, theme tokens.
 *
 * hardcoded-fontsize-file-ok: conceptual illustration with hand-tuned
 * user-space label sizes; no sibling diagram shares this file.
 */
import { useTranslation } from 'react-i18next'
import DiagramFigure from './DiagramFigure'
import { svgTokens } from './svgTokens'

const VB_W = 560
const VB_H = 250
const SANS = 'ui-sans-serif, system-ui, sans-serif'

const CABLE_X0 = 176
const CABLE_X1 = 452
const CORE_X = 300
const GAP = 9 // half-spacing between the two conductors

/** Current-direction arrow: tip at (x,y), pointing right (dir +1) or left (−1). */
function Arrow({ x, y, dir, color }: { x: number; y: number; dir: 1 | -1; color: string }) {
  return (
    <g stroke={color} fill={color}>
      <line x1={x - dir * 22} y1={y} x2={x - dir * 6} y2={y} strokeWidth={2.2} />
      <path d={`M ${x} ${y} l ${-dir * 8} -4.5 l 0 9 Z`} stroke="none" />
    </g>
  )
}

/** One row: cable through the core, with the two conductor arrows. */
function ChokeRow({
  cy,
  topDir,
  botDir,
  flux,
}: {
  cy: number
  topDir: 1 | -1
  botDir: 1 | -1
  flux: boolean
}) {
  const yTop = cy - GAP
  const yBot = cy + GAP
  return (
    <g>
      {/* magnetic flux around the core — only when the fields add (common-mode) */}
      {flux && (
        <g stroke={svgTokens.caution} fill="none" opacity={0.55} strokeWidth={1.4}>
          <ellipse cx={CORE_X} cy={cy} rx={30} ry={26} />
          <ellipse cx={CORE_X} cy={cy} rx={40} ry={34} opacity={0.6} />
          <path d={`M ${CORE_X + 40} ${cy - 4} l -5 -5 m 5 5 l 5 -5`} />
        </g>
      )}
      {/* ferrite core (drawn behind the conductors) */}
      <rect x={CORE_X - 22} y={cy - 30} width={44} height={60} rx={6} fill="hsl(var(--muted))" fillOpacity={0.65} stroke={svgTokens.fg} strokeWidth={1.6} />
      <line x1={CORE_X} y1={cy - 30} x2={CORE_X} y2={cy + 30} stroke={svgTokens.fg} strokeWidth={1} opacity={0.4} />
      {/* the two conductors, passing through the core */}
      <line x1={CABLE_X0} y1={yTop} x2={CABLE_X1} y2={yTop} stroke={svgTokens.fg} strokeWidth={2} />
      <line x1={CABLE_X0} y1={yBot} x2={CABLE_X1} y2={yBot} stroke={svgTokens.fg} strokeWidth={2} />
      {/* current-direction arrows on each conductor, left and right of the core */}
      <Arrow x={238} y={yTop} dir={topDir} color={svgTokens.primary} />
      <Arrow x={238} y={yBot} dir={botDir} color={svgTokens.primary} />
      <Arrow x={410} y={yTop} dir={topDir} color={svgTokens.primary} />
      <Arrow x={410} y={yBot} dir={botDir} color={svgTokens.primary} />
    </g>
  )
}

export default function FerriteChokeDiagram() {
  const { t } = useTranslation('ui')
  const k = (s: string) => t(`ch4_2.ferriteChoke.${s}`)
  const yA = 74
  const yB = 182

  return (
    <DiagramFigure title={k('title')} caption={k('caption')}>
      <svg
        width={VB_W}
        height={VB_H}
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        role="img"
        aria-label={k('ariaLabel')}
        style={{ display: 'block', margin: '0 auto', maxWidth: '100%', height: 'auto' }}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* core caption */}
        <text x={CORE_X} y={26} fontSize="13" textAnchor="middle" fill={svgTokens.mutedFg} fontFamily={SANS}>{k('core')}</text>

        {/* Row A — differential (wanted): top →, bottom ← (equal & opposite) */}
        <ChokeRow cy={yA} topDir={1} botDir={-1} flux={false} />
        <text x={16} y={yA - 4} fontSize="13" fontWeight={600} fill={svgTokens.fg} fontFamily={SANS}>{k('diffL1')}</text>
        <text x={16} y={yA + 13} fontSize="12.5" fill={svgTokens.mutedFg} fontFamily={SANS}>{k('diffL2')}</text>
        <text x={CABLE_X1 + 8} y={yA + 4} fontSize="13" fontWeight={700} fill={svgTokens.experiment} fontFamily={SANS}>{k('passes')}</text>

        {/* Row B — common-mode (RFI): both → (add up) */}
        <ChokeRow cy={yB} topDir={1} botDir={1} flux />
        <text x={16} y={yB - 4} fontSize="13" fontWeight={600} fill={svgTokens.fg} fontFamily={SANS}>{k('cmL1')}</text>
        <text x={16} y={yB + 13} fontSize="12.5" fill={svgTokens.mutedFg} fontFamily={SANS}>{k('cmL2')}</text>
        <text x={CABLE_X1 + 8} y={yB + 4} fontSize="13" fontWeight={700} fill={svgTokens.caution} fontFamily={SANS}>{k('blocked')}</text>
      </svg>
    </DiagramFigure>
  )
}
