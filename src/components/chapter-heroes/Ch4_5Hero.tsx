/**
 * Chapter 4.5 hero — the signal crosses; the rule book does not.
 *
 * The chapter's opening thesis is why radio is regulated internationally at
 * all: a transmission does not stop at a border, so the rules governing it
 * cannot be written one country at a time. So: one continuous wave running the
 * full width of the frame, a border drawn straight through it, and a different
 * document standing on each side. The wave is unbroken and is the only thing in
 * the accent colour, because its indifference to the border is the whole idea.
 *
 * ── Why it looks like this ─────────────────────────────────────────────
 * No antenna, deliberately. Ch4_4Hero's post-mortem records that a vertical
 * with horizontal crossbars reads as a grave cross, and a mast is exactly that
 * silhouette; the wave alone carries «radio» without the risk. Clean SVG with
 * iconic shapes, which is the register the other heroes use (Ch4_3Hero draws an
 * operator as a single circle) — not rough.js sketching.
 *
 * The two documents differ in their ruling (four lines against three, and
 * different lengths) rather than by any label, so «different rules» reads
 * without a word of text and without needing either side to be a real country.
 *
 * Not a duplicate of any in-chapter figure: §2 and §4 are both frequency-axis
 * bar charts, §3 is a staircase, §5 a table. None of them shows the crossing.
 *
 * Reads without its caption: a radio wave passing over a border, with a
 * different rule book on each side.
 *
 * hardcoded-fontsize-file-ok: hero illustration with no text at all (aria-label
 * only); the geometry is hand-tuned in user-space units.
 */
import { useTranslation } from 'react-i18next'

const VB_W = 580
const VB_H = 200

/** The wave: one source of truth for its shape. */
const WAVE_Y = 130
const WAVE_AMP = 30
const WAVE_X0 = 26
const WAVE_X1 = 554
const WAVE_CYCLES = 3.5

const BORDER_X = 290

const DOC_W = 92
const DOC_H = 58
const DOC_Y = 20

/** Sampled sine — cheaper to read than a hand-written cubic path. */
function wavePath(): string {
  const steps = 120
  const pts: string[] = []
  for (let i = 0; i <= steps; i++) {
    const f = i / steps
    const x = WAVE_X0 + f * (WAVE_X1 - WAVE_X0)
    const y = WAVE_Y - Math.sin(f * WAVE_CYCLES * 2 * Math.PI) * WAVE_AMP
    pts.push(`${i === 0 ? 'M' : 'L'}${x.toFixed(2)} ${y.toFixed(2)}`)
  }
  return pts.join(' ')
}

/** A rule book: a sheet with ruled lines. `rules` sets how many, and how long. */
function renderDoc(x: number, rules: number[]) {
  return (
    <g>
      <rect
        x={x}
        y={DOC_Y}
        width={DOC_W}
        height={DOC_H}
        rx={4}
        fill="hsl(var(--background))"
        stroke="currentColor"
        strokeWidth={2}
      />
      {rules.map((len, i) => (
        <line
          key={i}
          x1={x + 12}
          y1={DOC_Y + 15 + i * 11}
          x2={x + 12 + len}
          y2={DOC_Y + 15 + i * 11}
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          opacity={0.55}
        />
      ))}
    </g>
  )
}

export default function Ch4_5Hero() {
  const { t } = useTranslation('ui')

  return (
    <svg
      width={VB_W}
      height={VB_H}
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      role="img"
      aria-label={t('ch4_5.heroAria')}
      style={{ margin: '0 auto', maxWidth: '100%', height: 'auto' }}
      className="text-[hsl(var(--sketch-stroke))]"
    >
      {/* The border: the only straight vertical, and it stops nothing. */}
      <line
        x1={BORDER_X}
        y1={12}
        x2={BORDER_X}
        y2={VB_H - 14}
        stroke="currentColor"
        strokeWidth={2}
        strokeDasharray="7 6"
        opacity={0.6}
      />

      {/* Two rule books, differing in their ruling rather than by any label. */}
      {renderDoc(BORDER_X - 60 - DOC_W, [62, 48, 66, 34])}
      {renderDoc(BORDER_X + 60, [54, 68, 40])}

      {/* The wave: unbroken, and the only thing in the accent colour. */}
      <path
        d={wavePath()}
        fill="none"
        stroke="hsl(var(--primary))"
        strokeWidth={2.5}
        strokeLinecap="round"
      />
    </svg>
  )
}
