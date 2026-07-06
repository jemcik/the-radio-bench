/**
 * Chapter 4.1 §1 — the three propagation modes on one curved-earth section.
 *
 * Ground wave hugs the surface, space wave runs line-of-sight to the horizon,
 * sky wave goes up to the ionosphere and refracts back down far away.
 *
 * All antennas are rooted on the parabolic surface via `surfaceY(x)` and every
 * ray starts/ends at an antenna feed point, so nothing floats and every ray
 * meets its mast.
 */
import { useTranslation } from 'react-i18next'
import DiagramFigure from './DiagramFigure'
import { svgTokens as S } from './svgTokens'
import { makeEarth, feed, Antenna } from './scene-earth'

const W = 680
const H = 330
const H_ANT = 24
const E = makeEarth(W, H, 250, 272)

// Station x-positions along the surface.
const TX = 110
const LOCAL = 250
const HORIZON = 430
const FAR = 605

// Ionosphere arc + the sky-wave reflection point sitting on it.
const IONO = 'M 40 66 Q 340 46 640 66'
const REFLECT_X = 357
const REFLECT_Y = 56

function groundWavePath(): string {
  const pts: string[] = []
  for (let x = TX + 8; x <= LOCAL; x += 8) pts.push(`${x} ${(E.surfaceY(x) - 4).toFixed(1)}`)
  return `M ${pts.join(' L ')}`
}

export default function ThreeModesDiagram() {
  const { t } = useTranslation('ui')
  const k = (s: string) => t(`ch4_1.threeModes.${s}`)

  const fTx = feed(TX, E.surfaceY(TX), H_ANT)
  const fHorizon = feed(HORIZON, E.surfaceY(HORIZON), H_ANT)
  const fFar = feed(FAR, E.surfaceY(FAR), H_ANT)

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
        {/* Ionosphere */}
        <path d={IONO} fill="none" stroke={S.note} strokeWidth={2} strokeDasharray="7 5" />
        <text x={54} y={54} fontSize={14} fontWeight={600} fill={S.note}>{k('ionosphere')}</text>

        {/* Earth */}
        <path d={E.fill} fill={S.border} fillOpacity={0.3} />
        <path d={E.stroke} fill="none" stroke={S.fg} strokeWidth={2} />

        {/* Sky wave: TX feed → ionosphere → far feed */}
        <path
          d={`M ${fTx[0]} ${fTx[1]} L ${REFLECT_X} ${REFLECT_Y} L ${fFar[0]} ${fFar[1]}`}
          fill="none"
          stroke={S.primary}
          strokeWidth={2.4}
          strokeLinejoin="round"
        />
        <circle cx={REFLECT_X} cy={REFLECT_Y} r={3.2} fill={S.primary} />
        <text x={512} y={100} fontSize={14} fontWeight={600} fill={S.primary} textAnchor="middle">{k('skyWave')}</text>

        {/* Space wave: TX feed → horizon feed (line of sight) */}
        <path d={`M ${fTx[0]} ${fTx[1]} L ${fHorizon[0]} ${fHorizon[1]}`} fill="none" stroke={S.caution} strokeWidth={2.2} strokeDasharray="2 4" />
        <text x={270} y={206} fontSize={14} fontWeight={600} fill={S.caution} textAnchor="middle">{k('spaceWave')}</text>

        {/* Ground wave: hugs the surface from TX to the local station */}
        <path d={groundWavePath()} fill="none" stroke={S.experiment} strokeWidth={2.4} />
        <text x={150} y={284} fontSize={14} fontWeight={600} fill={S.experiment} textAnchor="middle">{k('groundWave')}</text>

        {/* Stations, each rooted on the surface */}
        <Antenna x={TX} baseY={E.surfaceY(TX)} h={H_ANT} />
        <Antenna x={LOCAL} baseY={E.surfaceY(LOCAL)} h={H_ANT} />
        <Antenna x={HORIZON} baseY={E.surfaceY(HORIZON)} h={H_ANT} />
        <Antenna x={FAR} baseY={E.surfaceY(FAR)} h={H_ANT} />

        <text x={TX} y={304} fontSize={13} fontWeight={600} fill={S.fg} textAnchor="middle">{k('tx')}</text>
        <text x={LOCAL} y={304} fontSize={13} fill={S.mutedFg} textAnchor="middle">{k('nearRx')}</text>
        <text x={HORIZON} y={304} fontSize={13} fill={S.mutedFg} textAnchor="middle">{k('horizonRx')}</text>
        <text x={FAR} y={304} fontSize={13} fill={S.mutedFg} textAnchor="middle">{k('farRx')}</text>
        <text x={340} y={321} fontSize={13} fill={S.mutedFg} textAnchor="middle">{k('earth')}</text>
      </svg>
    </DiagramFigure>
  )
}
