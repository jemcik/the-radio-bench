/**
 * Chapter 4.1 §5 — tropospheric ducting.
 *
 * A temperature inversion (warm air over cool) traps VHF/UHF signals in a duct
 * near the surface; the signal bounces between the warm lid and the sea, both
 * touched exactly, reaching far past the normal line-of-sight horizon.
 */
import { useTranslation } from 'react-i18next'
import DiagramFigure from './DiagramFigure'
import { svgTokens as S } from './svgTokens'
import { makeEarth, feed, Antenna } from './scene-earth'

const W = 680
const H = 300
const H_ANT = 22
const SEA = makeEarth(W, H, 238, 242) // nearly flat sea
const DUCT_TOP = 122

const TX = 60
const RX = 620

export default function TroposphericDuctDiagram() {
  const { t } = useTranslation('ui')
  const k = (s: string) => t(`ch4_1.tropoDuct.${s}`)

  const fTx = feed(TX, SEA.surfaceY(TX), H_ANT)
  const fRx = feed(RX, SEA.surfaceY(RX), H_ANT)

  // Ducted ray: TX feed → lid → sea → lid → sea → lid → RX feed.
  const path =
    `M ${fTx[0]} ${fTx[1]} ` +
    `L 150 ${DUCT_TOP} L 240 ${SEA.surfaceY(240).toFixed(1)} ` +
    `L 330 ${DUCT_TOP} L 420 ${SEA.surfaceY(420).toFixed(1)} ` +
    `L 510 ${DUCT_TOP} L ${fRx[0]} ${fRx[1]}`

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
        {/* Warm-air inversion lid */}
        <rect x={36} y={90} width={608} height={22} rx={4} fill={S.caution} fillOpacity={0.16} stroke={S.caution} strokeWidth={1.4} strokeDasharray="7 5" />
        <text x={340} y={105} fontSize={13} fontWeight={600} fill={S.caution} textAnchor="middle">{k('warmAir')}</text>

        {/* Cool air label — upper-left of the duct, above the climbing first ray */}
        <text x={24} y={128} fontSize={13} fill={S.mutedFg}>{k('coolAir')}</text>

        {/* Duct height brace on the right */}
        <line x1={650} y1={DUCT_TOP} x2={650} y2={SEA.surfaceY(650)} stroke={S.mutedFg} strokeWidth={1} />
        <line x1={646} y1={DUCT_TOP} x2={654} y2={DUCT_TOP} stroke={S.mutedFg} strokeWidth={1} />
        <line x1={646} y1={SEA.surfaceY(650)} x2={654} y2={SEA.surfaceY(650)} stroke={S.mutedFg} strokeWidth={1} />
        <text x={666} y={(DUCT_TOP + SEA.surfaceY(650)) / 2} fontSize={12} fill={S.mutedFg} transform={`rotate(-90 666 ${(DUCT_TOP + SEA.surfaceY(650)) / 2})`} textAnchor="middle">
          {k('duct')}
        </text>

        {/* Trapped signal bouncing along the duct */}
        <path d={path} fill="none" stroke={S.primary} strokeWidth={2.4} strokeLinejoin="round" />

        {/* Sea */}
        <path d={SEA.fill} fill={S.note} fillOpacity={0.12} />
        <path d={SEA.stroke} fill="none" stroke={S.fg} strokeWidth={2} />

        {/* Normal line-of-sight horizon marker */}
        <line x1={300} y1={SEA.surfaceY(300)} x2={300} y2={SEA.surfaceY(300) + 30} stroke={S.mutedFg} strokeWidth={1} strokeDasharray="4 3" />
        <text x={300} y={SEA.surfaceY(300) + 46} fontSize={12} fill={S.mutedFg} textAnchor="middle">{k('normalHorizon')}</text>

        {/* Stations on the sea — labels beside the masts, clear of the ray */}
        <Antenna x={TX} baseY={SEA.surfaceY(TX)} h={H_ANT} />
        <text x={TX - 14} y={SEA.surfaceY(TX) - 11} fontSize={13} fontWeight={600} fill={S.fg} textAnchor="end">{k('tx')}</text>
        <Antenna x={RX} baseY={SEA.surfaceY(RX)} h={H_ANT} />
        <text x={RX - 14} y={SEA.surfaceY(RX) - 11} fontSize={13} fontWeight={600} fill={S.fg} textAnchor="end">{k('rx')}</text>
      </svg>
    </DiagramFigure>
  )
}
