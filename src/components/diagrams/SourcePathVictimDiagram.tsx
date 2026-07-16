/**
 * Chapter 4.2 §1 — the master model of every interference problem.
 *
 * Three labelled boxes — SOURCE → PATH → VICTIM — joined by two arrows, each
 * with a small "cut" (scissors) motif: remove or break any single link and the
 * interference stops. This is the mental map the whole chapter hangs on
 * (ARRL Handbook 2023, Fig 27.4). The hero shows the same idea as a scene; this
 * diagram names the parts.
 *
 * Static block diagram, bare <svg> at fixed px = viewBox (no scaling), numeric
 * fontSize with the 13 px floor, theme tokens throughout.
 *
 * hardcoded-fontsize-file-ok: block diagram with hand-tuned label sizes in
 * user-space units; no sibling diagram shares this file.
 */
import { useTranslation } from 'react-i18next'
import DiagramFigure from './DiagramFigure'
import { svgTokens } from './svgTokens'

const VB_W = 700
const VB_H = 236

const SANS = 'ui-sans-serif, system-ui, sans-serif'

// Three equal columns, 24 px canvas margin each side, symmetric by construction.
// 196 px wide so full UK example phrases («гармоніки, побічні сигнали») clear
// the border with room to spare.
const BOX_W = 196
const BOX_H = 104
const BOX_Y = 52
const COLS = [
  { key: 'source', x: 24 },
  { key: 'path', x: 252 },
  { key: 'victim', x: 480 },
] as const
const MID_Y = BOX_Y + BOX_H / 2 // arrow height

/** Minimal scissors glyph — "this link can be cut". */
function Scissors({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g stroke={svgTokens.caution} strokeWidth={1.4} fill="none" strokeLinecap="round">
      <line x1={cx - 3.5} y1={cy - 6} x2={cx + 4} y2={cy + 5} />
      <line x1={cx + 3.5} y1={cy - 6} x2={cx - 4} y2={cy + 5} />
      <circle cx={cx - 4.6} cy={cy + 6} r={2.2} />
      <circle cx={cx + 4.6} cy={cy + 6} r={2.2} />
    </g>
  )
}

/** Right-pointing arrow between two boxes. */
function Arrow({ x0, x1, y }: { x0: number; x1: number; y: number }) {
  return (
    <g stroke={svgTokens.fg} opacity={0.7}>
      <line x1={x0} y1={y} x2={x1 - 6} y2={y} strokeWidth={2} />
      <path d={`M ${x1} ${y} l -9 -5 l 0 10 Z`} fill={svgTokens.fg} stroke="none" />
    </g>
  )
}

export default function SourcePathVictimDiagram() {
  const { t } = useTranslation('ui')
  const k = (s: string) => t(`ch4_2.triad.${s}`)

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
        {/* arrows + cut motifs */}
        <Arrow x0={COLS[0].x + BOX_W} x1={COLS[1].x} y={MID_Y} />
        <Arrow x0={COLS[1].x + BOX_W} x1={COLS[2].x} y={MID_Y} />
        <Scissors cx={(COLS[0].x + BOX_W + COLS[1].x) / 2} cy={MID_Y - 20} />
        <Scissors cx={(COLS[1].x + BOX_W + COLS[2].x) / 2} cy={MID_Y - 20} />

        {/* boxes */}
        {COLS.map(c => {
          const cx = c.x + BOX_W / 2
          const isVictim = c.key === 'victim'
          const accent = isVictim ? svgTokens.note : c.key === 'source' ? svgTokens.caution : svgTokens.fg
          return (
            <g key={c.key}>
              <rect
                x={c.x}
                y={BOX_Y}
                width={BOX_W}
                height={BOX_H}
                rx={8}
                fill="hsl(var(--muted))"
                fillOpacity={0.4}
                stroke={accent}
                strokeWidth={1.6}
                strokeOpacity={c.key === 'path' ? 0.5 : 0.8}
              />
              <text x={cx} y={BOX_Y + 26} fontSize="15" fontWeight={700} textAnchor="middle" fill={svgTokens.fg} fontFamily={SANS}>
                {k(c.key)}
              </text>
              {[1, 2, 3].map(i => (
                <text
                  key={i}
                  x={cx}
                  y={BOX_Y + 46 + (i - 1) * 19}
                  fontSize="13"
                  textAnchor="middle"
                  fill={svgTokens.mutedFg}
                  fontFamily={SANS}
                >
                  {k(`${c.key}Eg${i}`)}
                </text>
              ))}
            </g>
          )
        })}

        {/* the "cure acts here" advance-organizer band */}
        {COLS.map(c => (
          <text
            key={`cure-${c.key}`}
            x={c.x + BOX_W / 2}
            y={BOX_Y + BOX_H + 30}
            fontSize="13"
            fontWeight={600}
            textAnchor="middle"
            fill={svgTokens.experiment}
            fontFamily={SANS}
          >
            {k(`cure_${c.key}`)}
          </text>
        ))}
      </svg>
    </DiagramFigure>
  )
}
