/**
 * Chapter 4.4 hero — two operators, one script.
 *
 * The chapter's thesis is that on-air procedure works because it is SHARED: the
 * words are fixed not because they are the clearest possible words, but because
 * the operator at the other end already knows which ones are coming. So: two
 * operators facing each other, one speaking and one listening, and in front of
 * each of them the same sheet — identical size, identical ruling, identical
 * marks. The accent is spent only on those two sheets, because their sameness
 * is the entire point.
 *
 * ── Why it looks like this ─────────────────────────────────────────────
 * Three earlier attempts drew the idea abstractly (masts and tokens, then
 * ellipses crossing a noise band, then a fan of QSL cards) and all three failed.
 * The first read as a cemetery — a vertical with horizontal crossbars IS a grave
 * cross, and a row of equally sized small rectangles IS headstones. The lessons
 * kept here: draw recognisable people and objects, avoid those two silhouettes,
 * and follow the register the rest of the course's heroes actually use — clean
 * SVG with iconic shapes (Ch4_3Hero draws its operator as a single circle), not
 * rough.js sketching and not detailed figures.
 *
 * ── Geometry: one source of truth ──────────────────────────────────────
 * Each operator is one OPERATORS entry holding an x and a role; the head,
 * shoulders, headset and sheet are ALL derived from that x, so a figure cannot
 * come apart. The two sheets are drawn by the same function with the same
 * arguments — that is what guarantees they are visibly identical rather than
 * merely similar.
 *
 * Deliberately not a duplicate of any in-chapter figure: §5 is a two-lane
 * transcript, §6 a row of lettered boxes. Neither shows the shared-expectation
 * idea, which is the hero's only job.
 *
 * Reads without its caption: two people talking by radio, both working from the
 * same sheet of paper.
 *
 * hardcoded-fontsize-file-ok: hero illustration with no text at all (aria-label
 * only); the geometry is hand-tuned in user-space units.
 */
import { useTranslation } from 'react-i18next'

const VB_W = 580
const VB_H = 210

const HEAD_R = 17
const HEAD_Y = 62

const SHEET_W = 96
const SHEET_H = 58
const SHEET_Y = 128

/** The two ends of the contact. Everything about a figure derives from its x. */
const OPERATORS = [
  { x: 132, role: 'talks' as const, tilt: -5 },
  { x: 448, role: 'listens' as const, tilt: 5 },
]

/**
 * The shared script. Both sheets call this with identical arguments — the line
 * lengths are a fixed pattern, so the two really are the same document rather
 * than two documents that happen to look alike.
 */
const RULE_WIDTHS = [0.78, 0.5, 0.86, 0.34]

function Sheet({ x, tilt }: { x: number; tilt: number }) {
  const left = x - SHEET_W / 2
  return (
    <g transform={`rotate(${tilt} ${x} ${SHEET_Y + SHEET_H / 2})`}>
      <rect
        x={left}
        y={SHEET_Y}
        width={SHEET_W}
        height={SHEET_H}
        rx={3}
        fill="hsl(var(--background))"
        stroke="hsl(var(--primary))"
        strokeWidth={2}
      />
      {RULE_WIDTHS.map((w, i) => (
        <path
          key={i}
          d={`M ${left + 11} ${SHEET_Y + 15 + i * 11} h ${(SHEET_W - 22) * w}`}
          stroke="hsl(var(--primary))"
          strokeWidth={1.6}
          opacity={0.55}
          strokeLinecap="round"
        />
      ))}
    </g>
  )
}

function Operator({ x, role }: { x: number; role: 'talks' | 'listens' }) {
  return (
    <g stroke="hsl(var(--sketch-stroke))" fill="none" strokeLinecap="round">
      {/* head and shoulders — the course's iconic register, not a drawn person */}
      <circle cx={x} cy={HEAD_Y} r={HEAD_R} strokeWidth={2} />
      <path d={`M ${x - 40} 112 C ${x - 34} 86, ${x + 34} 86, ${x + 40} 112`} strokeWidth={2} />

      {role === 'talks' ? (
        /* a hand microphone held up to the mouth, on its cable */
        <>
          <rect
            x={x + HEAD_R + 6}
            y={HEAD_Y - 9}
            width={15}
            height={20}
            rx={4}
            strokeWidth={2}
            fill="hsl(var(--background))"
          />
          <path d={`M ${x + HEAD_R + 9} ${HEAD_Y - 4} h 9 M ${x + HEAD_R + 9} ${HEAD_Y + 1} h 9`} strokeWidth={1.4} />
          <path d={`M ${x + HEAD_R + 13} ${HEAD_Y + 11} C ${x + HEAD_R + 18} 92, ${x + 30} 94, ${x + 33} 102`} strokeWidth={1.6} />
        </>
      ) : (
        /* headphones: a band over the head and a pad on each side */
        <>
          <path d={`M ${x - HEAD_R - 5} ${HEAD_Y - 2} A ${HEAD_R + 5} ${HEAD_R + 5} 0 0 1 ${x + HEAD_R + 5} ${HEAD_Y - 2}`} strokeWidth={2} />
          <rect x={x - HEAD_R - 10} y={HEAD_Y - 5} width={9} height={15} rx={3} strokeWidth={2} fill="hsl(var(--background))" />
          <rect x={x + HEAD_R + 1} y={HEAD_Y - 5} width={9} height={15} rx={3} strokeWidth={2} fill="hsl(var(--background))" />
        </>
      )}
    </g>
  )
}

export default function Ch4_4Hero() {
  const { t } = useTranslation('ui')

  return (
    <svg
      width={VB_W}
      height={VB_H}
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      style={{ margin: '0 auto', maxWidth: '100%', height: 'auto' }}
      role="img"
      aria-label={t('ch4_4.heroAria')}
    >
      {/* the link between them: a plain dashed span, kept quiet so the sheets carry the eye */}
      <path
        d={`M 196 ${HEAD_Y} H 384`}
        stroke="hsl(var(--muted-foreground))"
        strokeWidth={1.6}
        strokeDasharray="2 9"
        strokeLinecap="round"
        opacity={0.5}
        fill="none"
      />

      {OPERATORS.map(op => (
        <g key={op.x}>
          <Operator x={op.x} role={op.role} />
          <Sheet x={op.x} tilt={op.tilt} />
        </g>
      ))}
    </svg>
  )
}
