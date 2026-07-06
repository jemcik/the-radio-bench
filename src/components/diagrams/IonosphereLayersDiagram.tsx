/**
 * Chapter 4.1 §2 — the ionospheric layers, day vs night.
 *
 * Day: D, E, F1, F2 present. Night: D and F1 vanish, F1+F2 merge into F.
 * Heights are illustrative, not to scale. Bare <svg>, fixed px, svgTokens.
 */
import { useTranslation } from 'react-i18next'
import DiagramFigure from './DiagramFigure'
import { svgTokens as S } from './svgTokens'

const W = 680
const H = 366
const GROUND_Y = 318

function Band({
  x,
  w,
  y,
  h,
  fill,
  dashed = false,
}: {
  x: number
  w: number
  y: number
  h: number
  fill: string
  dashed?: boolean
}) {
  return (
    <rect
      x={x}
      y={y}
      width={w}
      height={h}
      rx={5}
      fill={dashed ? 'none' : fill}
      fillOpacity={dashed ? 0 : 0.18}
      stroke={fill}
      strokeWidth={1.6}
      strokeDasharray={dashed ? '6 5' : undefined}
      strokeOpacity={dashed ? 0.7 : 1}
    />
  )
}

export default function IonosphereLayersDiagram() {
  const { t } = useTranslation('ui')
  const k = (s: string) => t(`ch4_1.ionoLayers.${s}`)

  const DAY_X = 52
  const NIGHT_X = 388
  const PW = 250

  const nameStyle = { fontSize: 13, fontWeight: 600 as const, fill: S.fg }
  const altStyle = { fontSize: 12, fill: S.mutedFg }

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
        {/* Altitude axis */}
        <line x1={30} y1={GROUND_Y} x2={30} y2={64} stroke={S.mutedFg} strokeWidth={1.5} />
        <path d="M 30 60 l -4 8 l 8 0 Z" fill={S.mutedFg} />
        <text x={26} y={54} fontSize={12} fill={S.mutedFg} transform="rotate(-90 26 54)" textAnchor="start">
          {k('altitude')}
        </text>

        {/* Panel headers */}
        <text x={DAY_X + PW / 2} y={30} fontSize={15} fontWeight={700} fill={S.fg} textAnchor="middle">
          {k('day')}
        </text>
        <text x={NIGHT_X + PW / 2} y={30} fontSize={15} fontWeight={700} fill={S.fg} textAnchor="middle">
          {k('night')}
        </text>

        {/* Sun over the day panel (decorative amber — real-world colour) */}
        <g stroke="#e0a83a" strokeWidth={1.6}>
          <circle cx={DAY_X + PW - 14} cy={52} r={9} fill="#e0a83a" fillOpacity={0.25} />
          {[0, 45, 90, 135, 180, 225, 270, 315].map(a => {
            const r = (a * Math.PI) / 180
            const cx = DAY_X + PW - 14
            return (
              <line
                key={a}
                x1={cx + 12 * Math.cos(r)}
                y1={52 + 12 * Math.sin(r)}
                x2={cx + 16 * Math.cos(r)}
                y2={52 + 16 * Math.sin(r)}
              />
            )
          })}
        </g>
        {/* Moon over the night panel */}
        <circle cx={NIGHT_X + PW - 14} cy={52} r={9} fill={S.mutedFg} fillOpacity={0.35} stroke={S.mutedFg} strokeWidth={1.4} />

        {/* ── DAY panel ─────────────────────────────────────────── */}
        <Band x={DAY_X} w={PW} y={116} h={48} fill={S.primary} />
        <text x={DAY_X + 10} y={136} {...nameStyle}>{k('f2Name')}</text>
        <text x={DAY_X + PW - 10} y={136} {...altStyle} textAnchor="end">{k('f2Alt')}</text>
        <text x={DAY_X + 10} y={154} fontSize={12} fill={S.primary} fontWeight={600}>{k('f2Role')}</text>

        <Band x={DAY_X} w={PW} y={188} h={22} fill={S.mutedFg} />
        <text x={DAY_X + 10} y={203} {...nameStyle}>{k('f1Name')}</text>
        <text x={DAY_X + PW - 10} y={203} {...altStyle} textAnchor="end">{k('f1Alt')}</text>

        <Band x={DAY_X} w={PW} y={228} h={20} fill={S.mutedFg} />
        <text x={DAY_X + 10} y={242} {...nameStyle}>{k('eName')}</text>
        <text x={DAY_X + PW - 10} y={242} {...altStyle} textAnchor="end">{k('eAlt')}</text>

        <Band x={DAY_X} w={PW} y={264} h={30} fill={S.caution} />
        <text x={DAY_X + 10} y={278} {...nameStyle}>{k('dName')}</text>
        <text x={DAY_X + PW - 10} y={278} {...altStyle} textAnchor="end">{k('dAlt')}</text>
        <text x={DAY_X + 10} y={291} fontSize={11} fill={S.caution} fontWeight={600}>{k('dRole')}</text>

        {/* ── NIGHT panel ───────────────────────────────────────── */}
        <Band x={NIGHT_X} w={PW} y={140} h={70} fill={S.primary} />
        <text x={NIGHT_X + 10} y={162} {...nameStyle}>{k('fName')}</text>
        <text x={NIGHT_X + PW - 10} y={162} {...altStyle} textAnchor="end">{k('fAlt')}</text>

        <Band x={NIGHT_X} w={PW} y={228} h={20} fill={S.mutedFg} />
        <text x={NIGHT_X + 10} y={242} {...nameStyle}>{k('eName')}</text>
        <text x={NIGHT_X + PW - 10} y={242} {...altStyle} textAnchor="end">{k('eAlt')}</text>

        <Band x={NIGHT_X} w={PW} y={264} h={30} fill={S.mutedFg} dashed />
        <text x={NIGHT_X + 10} y={283} fontSize={13} fill={S.mutedFg} fontStyle="italic">{k('gone')}</text>

        {/* Ground line + Earth label, both panels */}
        <line x1={40} y1={GROUND_Y} x2={W - 22} y2={GROUND_Y} stroke={S.fg} strokeWidth={2} />
        <rect x={40} y={GROUND_Y} width={W - 62} height={30} fill={S.border} fillOpacity={0.35} />
        <text x={W / 2} y={GROUND_Y + 20} fontSize={13} fill={S.mutedFg} textAnchor="middle">{k('earth')}</text>
      </svg>
    </DiagramFigure>
  )
}
