/**
 * Chapter 4.1 §3 — skip geometry: skip distance, skip zone, multi-hop.
 *
 * The sky wave leaves the TX at an angle, refracts off the ionosphere and
 * lands a skip distance away; the ground between the ground-wave range and
 * that landing point is the silent skip zone; a second hop reaches the RX.
 *
 * Antennas are rooted on the parabolic surface and the ground bounce sits on
 * it too, so every ray endpoint meets the ground exactly.
 */
import { useTranslation } from 'react-i18next'
import DiagramFigure from './DiagramFigure'
import { svgTokens as S } from './svgTokens'
import { makeEarth, feed, Antenna, surfaceArc } from './scene-earth'

const W = 680
const H = 322
const H_ANT = 24
const E = makeEarth(W, H, 248, 262)

const TX = 90
const RX = 620
const IONO1 = 222
const BOUNCE = 355
const IONO2 = 487
const IONO_Y = 58

const SZ_FROM = 150 // end of ground-wave range
const SZ_TO = BOUNCE // first sky-wave landing

export default function SkipGeometryDiagram() {
  const { t } = useTranslation('ui')
  const k = (s: string) => t(`ch4_1.skipGeom.${s}`)

  const fTx = feed(TX, E.surfaceY(TX), H_ANT)
  const fRx = feed(RX, E.surfaceY(RX), H_ANT)
  const bounceY = E.surfaceY(BOUNCE)
  const SZ_MID = (SZ_FROM + SZ_TO) / 2
  const DIM_Y = 300

  return (
    <DiagramFigure caption={k('caption')}>
      <svg
        width={W}
        height={H}
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={k('aria')}
        style={{ display: 'block', margin: '0 auto', maxWidth: '100%', height: 'auto' }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <marker id="skipArrowL" markerWidth={9} markerHeight={9} refX={4.5} refY={4.5} orient="auto">
            <path d="M 8 1.5 L 2 4.5 L 8 7.5" fill="none" stroke={S.mutedFg} strokeWidth={1.3} />
          </marker>
          <marker id="skipArrowR" markerWidth={9} markerHeight={9} refX={4.5} refY={4.5} orient="auto">
            <path d="M 1 1.5 L 7 4.5 L 1 7.5" fill="none" stroke={S.mutedFg} strokeWidth={1.3} />
          </marker>
        </defs>

        {/* Ionosphere */}
        <path d="M 40 64 Q 340 46 640 64" fill="none" stroke={S.note} strokeWidth={2} strokeDasharray="7 5" />
        <text x={54} y={52} fontSize={14} fontWeight={600} fill={S.note}>{k('ionosphere')}</text>

        {/* Earth */}
        <path d={E.fill} fill={S.border} fillOpacity={0.3} />
        <path d={E.stroke} fill="none" stroke={S.fg} strokeWidth={2} />

        {/* Ground-wave coverage near the TX — this is why the skip zone starts
            out here, not at the transmitter: close in, the ground wave is heard. */}
        <path d={surfaceArc(E, TX, SZ_FROM, -3)} fill="none" stroke={S.experiment} strokeWidth={7} strokeOpacity={0.3} strokeLinecap="round" />
        <text x={96} y={E.surfaceY(136) + 20} fontSize={12} fontWeight={600} fill={S.experiment} textAnchor="start">
          {k('groundWave')}
        </text>

        {/* Skip zone — translucent band hugging the surface curve */}
        <path d={surfaceArc(E, SZ_FROM, SZ_TO, -3)} fill="none" stroke={S.caution} strokeWidth={9} strokeOpacity={0.25} strokeLinecap="round" />
        <text x={SZ_MID} y={E.surfaceY(SZ_MID) - 18} fontSize={13} fontWeight={600} fill={S.caution} textAnchor="middle">
          {k('skipZone')}
        </text>

        {/* Multi-hop sky wave: TX feed → iono → ground bounce → iono → RX feed */}
        <path
          d={`M ${fTx[0]} ${fTx[1]} L ${IONO1} ${IONO_Y} L ${BOUNCE} ${bounceY.toFixed(1)} L ${IONO2} ${IONO_Y} L ${fRx[0]} ${fRx[1]}`}
          fill="none"
          stroke={S.primary}
          strokeWidth={2.4}
          strokeLinejoin="round"
        />
        <circle cx={IONO1} cy={IONO_Y} r={3.2} fill={S.primary} />
        <circle cx={IONO2} cy={IONO_Y} r={3.2} fill={S.primary} />
        <circle cx={BOUNCE} cy={bounceY} r={3.2} fill={S.primary} />

        {/* Skip-distance dimension (TX → first landing) in the earth band */}
        <line x1={TX} y1={E.surfaceY(TX) + 3} x2={TX} y2={DIM_Y} stroke={S.mutedFg} strokeWidth={1} />
        <line x1={BOUNCE} y1={bounceY + 3} x2={BOUNCE} y2={DIM_Y} stroke={S.mutedFg} strokeWidth={1} />
        <line x1={TX} y1={DIM_Y} x2={BOUNCE} y2={DIM_Y} stroke={S.mutedFg} strokeWidth={1.4} markerStart="url(#skipArrowL)" markerEnd="url(#skipArrowR)" />
        <text x={(TX + BOUNCE) / 2} y={DIM_Y + 15} fontSize={13} fill={S.fg} textAnchor="middle">{k('skipDistance')}</text>

        {/* Stations rooted on the surface */}
        <Antenna x={TX} baseY={E.surfaceY(TX)} h={H_ANT} />
        <Antenna x={RX} baseY={E.surfaceY(RX)} h={H_ANT} />
        <text x={TX - 16} y={E.surfaceY(TX) - 10} fontSize={13} fontWeight={600} fill={S.fg} textAnchor="end">{k('tx')}</text>
        <text x={RX + 16} y={E.surfaceY(RX) - 10} fontSize={13} fontWeight={600} fill={S.fg} textAnchor="start">{k('rx')}</text>
      </svg>
    </DiagramFigure>
  )
}
