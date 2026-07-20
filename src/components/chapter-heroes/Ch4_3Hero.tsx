/**
 * Chapter 4.3 hero — the four energies, and the one thing between each of them
 * and you.
 *
 * The chapter's thesis is that safety is not a list of rules but four kinds of
 * energy, each with a mechanism and each with a guard. So: an operator at the
 * bench, with four hazards converging from four directions — mains, stored
 * charge, RF, lightning — and each one stopped short by a barrier. The accent
 * is spent ONLY on the guards, because the guards are what the chapter is
 * about; the hazards themselves are plain ink.
 *
 * ── Geometry: one source of truth ──────────────────────────────────────
 * Every arm owns an angle, and the bolt, the guard bar and the hazard glyph
 * are ALL positioned from that one angle by `polar()`. The first version of
 * this file hand-placed the glyph coordinates separately from the arm angles,
 * and the result was exactly the failure this repo has hit before: the four
 * bolts bunched into the upper half while the RF whip and the lightning cloud
 * floated below the bench, attached to nothing. Nothing in tsc, eslint or the
 * overlap gate noticed — only looking at it did. If you add an arm, add an
 * angle; never place a glyph by eye.
 *
 * Angles are SVG-convention (y grows downward), so 180° is left, 0° is right,
 * 225° is upper-left and 315° is upper-right — hazards arrive from the sides
 * and from above, never from under the desk.
 *
 * Deliberately NOT a duplicate of any in-chapter figure (per the hero rule):
 * §1 is a magnitude ladder, §2 a colour table, §3 a schematic, §4 a plot, §5 a
 * two-panel scene. None of them is «the whole chapter at once» — that job is
 * the hero's, and it is the only thing here that no section already does.
 *
 * Reads without its caption: four things pointing at a person, four barriers.
 *
 * hardcoded-fontsize-file-ok: hero illustration, no readable text labels
 * (aria-label only); the geometry is hand-tuned in user-space units.
 */
import { useTranslation } from 'react-i18next'

const VB_W = 580
const VB_H = 206

// The operator sits at the centre; every arm is measured from here.
const CX = 290
// CY is NOT free: the two upper glyphs (deg 225/315) reach up to
// CY − GLYPH_R·sin45° − ~20 (the cloud/RF extent above their own origin).
// With CY=112 the cloud's top landed at y≈−1.4 and was clipped by the frame —
// invisible to the text-only overlap detector because this illustration has no
// <text> at all. CY=128 puts the cloud top at ≈14, a real margin, and the
// bench legs (CY+64) still land at 192, inside VB_H=206. If you change CY,
// GLYPH_R, or the glyph paths, re-run the frame-spill check in the browser
// (npm run test:visual now covers non-text spill too — see e2e detector).
const CY = 128

const BENCH_Y = CY + 46
const GUARD_R = 68 // where the barrier sits on each arm
const GLYPH_R = 132 // where the hazard glyph sits, further out on the same arm

const rad = (d: number) => (d * Math.PI) / 180
/** The single positioning primitive — everything on an arm goes through it. */
const polar = (deg: number, r: number) => ({
  x: CX + Math.cos(rad(deg)) * r,
  y: CY + Math.sin(rad(deg)) * r,
})

/** The four energies of the chapter, in the chapter's own order. */
const ARMS = [
  { deg: 180, glyph: 'plug' as const }, // mains, from the left
  { deg: 0, glyph: 'cap' as const }, // stored charge, from the right
  { deg: 225, glyph: 'rf' as const }, // RF, from upper-left
  { deg: 315, glyph: 'bolt' as const }, // lightning, from upper-right
]

/** A short zig-zag along an arm — reads as «energy», not as a wire. */
function boltPath(deg: number, r0: number, r1: number): string {
  const a = rad(deg)
  const ux = Math.cos(a)
  const uy = Math.sin(a)
  const px = -uy // perpendicular, for the zig
  const py = ux
  const pts: string[] = []
  const STEPS = 4
  for (let i = 0; i <= STEPS; i++) {
    const r = r1 - ((r1 - r0) * i) / STEPS
    const off = i % 2 === 0 ? 0 : i === 1 ? 5 : -5
    pts.push(`${(CX + ux * r + px * off).toFixed(1)} ${(CY + uy * r + py * off).toFixed(1)}`)
  }
  return `M ${pts.join(' L ')}`
}

/** The guard: a bar across the arm, perpendicular to it. */
function guardPath(deg: number, r: number, half: number): string {
  const a = rad(deg)
  const px = -Math.sin(a)
  const py = Math.cos(a)
  const { x, y } = polar(deg, r)
  return `M ${(x - px * half).toFixed(1)} ${(y - py * half).toFixed(1)} L ${(x + px * half).toFixed(1)} ${(y + py * half).toFixed(1)}`
}

export default function Ch4_3Hero() {
  const { t } = useTranslation('ui')

  return (
    <svg
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      width={VB_W}
      height={VB_H}
      role="img"
      aria-label={t('ch4_3.heroAria')}
      style={{ display: 'block', maxWidth: '100%', height: 'auto', margin: '0 auto' }}
      fill="none"
      stroke="currentColor"
    >
      {/* ── The bench ──────────────────────────────────────────── */}
      <path d={`M 168 ${BENCH_Y} L 412 ${BENCH_Y}`} strokeWidth={2} opacity={0.85} />
      <path
        d={`M 192 ${BENCH_Y} L 192 ${BENCH_Y + 18} M 388 ${BENCH_Y} L 388 ${BENCH_Y + 18}`}
        strokeWidth={1.6}
        opacity={0.6}
      />

      {/* ── The operator — head and shoulders, no face ─────────── */}
      <circle cx={CX} cy={CY - 4} r={14} strokeWidth={2} opacity={0.9} />
      <path
        d={`M ${CX - 30} ${BENCH_Y} q 0 -30 30 -30 q 30 0 30 30`}
        strokeWidth={2}
        opacity={0.9}
      />

      {/* ── Four arms: bolt in, guard across, glyph at the end ─── */}
      {ARMS.map(({ deg, glyph }) => {
        const g = polar(deg, GLYPH_R)
        return (
          <g key={deg}>
            <path
              d={boltPath(deg, GUARD_R + 10, GLYPH_R - 24)}
              strokeWidth={2}
              opacity={0.5}
              strokeLinejoin="round"
            />
            <path
              d={guardPath(deg, GUARD_R, 15)}
              strokeWidth={3.6}
              stroke="hsl(var(--primary))"
              strokeLinecap="round"
            />
            <g transform={`translate(${g.x.toFixed(1)} ${g.y.toFixed(1)})`} opacity={0.85}>
              {glyph === 'plug' && (
                <>
                  <rect x={-12} y={-9} width={24} height={18} rx={3} strokeWidth={1.8} />
                  <path d="M 12 -4 h 9 M 12 4 h 9" strokeWidth={1.8} />
                </>
              )}
              {glyph === 'cap' && (
                <>
                  <path d="M -4 -11 v 22 M 4 -11 v 22" strokeWidth={1.8} />
                  <path d="M -4 0 h -11 M 4 0 h 11" strokeWidth={1.8} />
                </>
              )}
              {glyph === 'rf' && (
                <>
                  <path d="M 0 12 v -20" strokeWidth={1.8} />
                  <path d="M -8 4 a 9 9 0 0 1 0 -13 M -14 8 a 16 16 0 0 1 0 -21" strokeWidth={1.5} />
                  <path d="M 8 4 a 9 9 0 0 0 0 -13 M 14 8 a 16 16 0 0 0 0 -21" strokeWidth={1.5} />
                </>
              )}
              {glyph === 'bolt' && (
                <>
                  <path
                    d="M -15 1 a 7 7 0 0 1 2 -13 a 10 10 0 0 1 19 -2 a 7 7 0 0 1 -1 15 z"
                    strokeWidth={1.6}
                  />
                  <path d="M 0 3 l -5 8 h 6 l -4 9" strokeWidth={1.8} strokeLinejoin="round" />
                </>
              )}
            </g>
          </g>
        )
      })}
    </svg>
  )
}
