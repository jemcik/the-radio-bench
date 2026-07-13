/**
 * Chapter 4.2 §4 — the right filter in the right place.
 *
 * One signal chain, three insertion points: a LOW-PASS at your transmitter
 * blocks harmonics on the way out; a HIGH-PASS (or notch) at the neighbour's
 * set blocks your HF on the way in; a MAINS filter strips RF off the power
 * lead. Each filter block carries a mini response glyph so the shape names
 * itself. (ARRL Handbook 2023 ch27 §27.3.3.)
 *
 * Static block diagram, bare <svg> at fixed px = viewBox, 13 px label floor,
 * theme tokens throughout.
 *
 * hardcoded-fontsize-file-ok: block diagram with hand-tuned user-space label
 * sizes; no sibling diagram shares this file.
 */
import { useTranslation } from 'react-i18next'
import DiagramFigure from './DiagramFigure'
import { svgTokens } from './svgTokens'

const VB_W = 600
const VB_H = 232
const SANS = 'ui-sans-serif, system-ui, sans-serif'

const MID = 58 // top-chain wire height
const MAINS = 152 // mains-branch wire height

/** Mini low-pass response glyph inside a filter block at (x,y). */
function lpGlyph(x: number, y: number) {
  return `M ${x + 8} ${y + 11} L ${x + 30} ${y + 11} Q ${x + 40} ${y + 11} ${x + 46} ${y + 24}`
}
/** Mini high-pass response glyph. */
function hpGlyph(x: number, y: number) {
  return `M ${x + 8} ${y + 24} Q ${x + 16} ${y + 11} ${x + 26} ${y + 11} L ${x + 46} ${y + 11}`
}

/** A few radiated arcs travelling from TX antenna toward the TV aerial. */
function travelArcs() {
  return [268, 292, 316].map(cx => `M ${cx} 16 A 20 20 0 0 1 ${cx} 52`)
}

export default function FilterPlacementDiagram() {
  const { t } = useTranslation('ui')
  const k = (s: string) => t(`ch4_2.filterPlace.${s}`)

  const box = (x: number, y: number, w: number, h: number, extraOpacity = 0.75) => (
    <rect x={x} y={y} width={w} height={h} rx={4} fill="hsl(var(--muted))" fillOpacity={0.4} stroke={svgTokens.fg} strokeWidth={1.6} strokeOpacity={extraOpacity} />
  )

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
        {/* ── top chain: TX — LP — ((•)) — HP — TV ── */}
        <g stroke={svgTokens.fg} strokeWidth={1.8} opacity={0.75}>
          <line x1={76} y1={MID} x2={100} y2={MID} />
          <line x1={156} y1={MID} x2={192} y2={MID} />
          <line x1={408} y1={MID} x2={444} y2={MID} />
          <line x1={500} y1={MID} x2={524} y2={MID} />
        </g>

        {/* TX box */}
        {box(20, 40, 56, 36)}
        <text x={48} y={62} fontSize="14" fontWeight={700} textAnchor="middle" fill={svgTokens.fg} fontFamily={SANS}>{k('tx')}</text>

        {/* LP filter block */}
        {box(100, 42, 56, 32, 0.9)}
        <path d={lpGlyph(100, 42)} stroke={svgTokens.primary} strokeWidth={2} fill="none" strokeLinecap="round" />
        <text x={128} y={94} fontSize="13" fontWeight={600} textAnchor="middle" fill={svgTokens.fg} fontFamily={SANS}>{k('lp')}</text>

        {/* TX antenna */}
        <g stroke={svgTokens.fg} strokeWidth={1.8} opacity={0.75}>
          <line x1={192} y1={MID} x2={192} y2={18} />
          <line x1={174} y1={20} x2={210} y2={20} />
        </g>
        {/* radiated travel */}
        {travelArcs().map((d, i) => (
          <path key={i} d={d} stroke={svgTokens.primary} strokeWidth={1.6} fill="none" opacity={0.45 - i * 0.1} strokeLinecap="round" />
        ))}
        {/* TV aerial */}
        <g stroke={svgTokens.fg} strokeWidth={1.6} opacity={0.75}>
          <line x1={408} y1={MID} x2={408} y2={18} />
          <line x1={408} y1={18} x2={392} y2={4} />
          <line x1={408} y1={18} x2={426} y2={2} />
        </g>

        {/* HP filter block */}
        {box(444, 42, 56, 32, 0.9)}
        <path d={hpGlyph(444, 42)} stroke={svgTokens.primary} strokeWidth={2} fill="none" strokeLinecap="round" />
        <text x={472} y={94} fontSize="13" fontWeight={600} textAnchor="middle" fill={svgTokens.fg} fontFamily={SANS}>{k('hp')}</text>

        {/* TV box */}
        {box(524, 40, 56, 36)}
        <text x={552} y={62} fontSize="14" fontWeight={700} textAnchor="middle" fill={svgTokens.fg} fontFamily={SANS}>{k('tv')}</text>

        {/* ── mains branch: wall — mains filter — TV power ──
             Wires touch the boxes exactly: the wall box now ends at x=76, and
             the riser reaches the TV box bottom edge (y = 40 + 36 = 76). */}
        <g stroke={svgTokens.fg} strokeWidth={1.8} opacity={0.7}>
          <line x1={76} y1={MAINS} x2={104} y2={MAINS} />
          <line x1={166} y1={MAINS} x2={552} y2={MAINS} />
          <line x1={552} y1={MAINS} x2={552} y2={76} />
        </g>
        {/* wall / mains source — 56 px wide so the UK «мережа» clears the border */}
        {box(20, 134, 56, 34)}
        <text x={48} y={155} fontSize="13" fontWeight={600} textAnchor="middle" fill={svgTokens.fg} fontFamily={SANS}>{k('mains')}</text>
        {/* mains filter block with a π glyph */}
        {box(104, 137, 62, 30, 0.9)}
        <g stroke={svgTokens.primary} strokeWidth={1.8} fill="none" strokeLinecap="round">
          <line x1={112} y1={152} x2={158} y2={152} />
          <path d="M 128 152 q 7 -9 14 0" />
          <line x1={120} y1={152} x2={120} y2={160} />
          <line x1={150} y1={152} x2={150} y2={160} />
        </g>
        <text x={135} y={185} fontSize="13" fontWeight={600} textAnchor="middle" fill={svgTokens.fg} fontFamily={SANS}>{k('mainsFilter')}</text>

        {/* zone hints */}
        <text x={120} y={214} fontSize="13" textAnchor="middle" fill={svgTokens.experiment} fontFamily={SANS} fontWeight={600}>{k('yourEnd')}</text>
        <text x={492} y={214} fontSize="13" textAnchor="middle" fill={svgTokens.note} fontFamily={SANS} fontWeight={600}>{k('theirEnd')}</text>
      </svg>
    </DiagramFigure>
  )
}
