/**
 * Chapter 3.3 §1 — how a dipole radiates (animated, slowed right down).
 *
 * Canvas animation of the classic detaching-field-line picture for an
 * oscillating (Hertzian) dipole. The electric field lines in the meridian
 * plane are the contours of
 *
 *     u(r,θ,t) = sin²θ · [ sin(kr − ωt) + cos(kr − ωt) / (kr) ]
 *
 * which reduces to the static dipole lines r = a·sin²θ near the antenna and to
 * outgoing spherical wavefronts far away — so loops form at the dipole, pinch
 * off and travel outward at the speed of light. Contours are extracted with
 * marching squares each frame and stroked to a <canvas>.
 *
 * Alongside the field it shows the alternating CURRENT that drives it (an arrow
 * on the dipole) and the ± CHARGE piling up at the ends (dots with +/− glyphs,
 * sized ∝ ∫I, so 90° behind the current — biggest when the current is zero),
 * plus a current-vs-time trace, so the link between the AC and the radiated wave
 * is explicit: one wavelength in space = one period of the current (λ = c·T).
 *
 * Respects prefers-reduced-motion (renders one static frame, no loop).
 */
import { useEffect, useRef, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import Widget from '@/components/ui/widget'
import { mathComponents } from '@/lib/trans-defaults'

// Wide and short: the dipole's lobes lie broadside (horizontal), so most of the
// vertical extent is the on-axis null — cropping height loses little.
const W = 600
const H = 308
const CX = 300
const CY = 122 // dipole centre / field origin
const SCALE = 18 // px per physical unit (wavenumber k = 1, so kr = r_px / SCALE)
const RMIN = 0.55 // mask the singular near-field inside this physical radius

// field-sampling grid
const GX0 = 22
const GX1 = W - 22
const GY0 = 14
const GY1 = 230
const STEP = 5
const GW = Math.floor((GX1 - GX0) / STEP) + 1
const GH = Math.floor((GY1 - GY0) / STEP) + 1

// contour levels (mirrored for the opposite polarity)
const LEVELS = [0.08, 0.18, 0.34, 0.6]

// current-vs-time trace strip
const TRACE_Y = 280
const TRACE_AMP = 18
const TRACE_X0 = 50
const TRACE_X1 = W - 24
const TRACE_CYCLES = 3

const FONT = '13px ui-sans-serif, system-ui, sans-serif'

function readVar(styles: CSSStyleDeclaration, name: string): string {
  const v = styles.getPropertyValue(name).trim()
  return v ? `hsl(${v})` : '#7f7f7f'
}

/** u(r,θ,t) sampled at a screen pixel; NaN inside the masked near field. */
function fieldAt(sx: number, sy: number, phase: number): number {
  const x = (sx - CX) / SCALE
  const z = (CY - sy) / SCALE
  const r = Math.hypot(x, z)
  if (r < RMIN) return NaN
  const sin2 = (x * x) / (r * r)
  return sin2 * (Math.sin(r - phase) + Math.cos(r - phase) / r)
}

export default function DipoleRadiation() {
  const { t, i18n } = useTranslation('ui')
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [playing, setPlaying] = useState(true)
  const [speed, setSpeed] = useState(0.18) // cycles per second (slow)
  const phaseRef = useRef(0.6)
  const playingRef = useRef(playing)
  const speedRef = useRef(speed)
  useEffect(() => { playingRef.current = playing }, [playing])
  useEffect(() => { speedRef.current = speed }, [speed])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = W * dpr
    canvas.height = H * dpr
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    const vals = new Float64Array(GW * GH)

    function draw(phase: number) {
      const styles = getComputedStyle(canvas!)
      const pos = readVar(styles, '--primary')
      const neg = readVar(styles, '--callout-note')
      const fg = readVar(styles, '--foreground')
      const dim = readVar(styles, '--muted-foreground')
      const c = ctx!
      c.clearRect(0, 0, W, H)
      c.font = FONT

      // ── field lines (marching squares over u) ───────────────────
      for (let j = 0; j < GH; j++) {
        for (let i = 0; i < GW; i++) {
          vals[j * GW + i] = fieldAt(GX0 + i * STEP, GY0 + j * STEP, phase)
        }
      }
      c.lineWidth = 1.5
      c.lineCap = 'round'
      for (const lvl of LEVELS) {
        for (const level of [lvl, -lvl]) {
          c.strokeStyle = level > 0 ? pos : neg
          c.globalAlpha = 0.85 - 0.4 * (LEVELS.indexOf(lvl) / LEVELS.length)
          c.beginPath()
          marchingSquares(vals, level, c)
          c.stroke()
        }
      }
      c.globalAlpha = 1

      // ── dipole rods ─────────────────────────────────────────────
      c.strokeStyle = fg
      c.lineWidth = 3
      c.beginPath()
      c.moveTo(CX, CY - 18); c.lineTo(CX, CY - 5)
      c.moveTo(CX, CY + 5); c.lineTo(CX, CY + 18)
      c.stroke()

      // ── ± charge at the ends (∝ ∫I ∝ sin phase, 90° behind current) ─
      const q = Math.sin(phase)
      drawCharge(c, CX, CY - 22, q, pos, neg)
      drawCharge(c, CX, CY + 22, -q, pos, neg)

      // ── current arrow (∝ I = cos phase) along the dipole ────────
      drawCurrentArrow(c, Math.cos(phase), pos, neg)

      // ── labels ──────────────────────────────────────────────────
      c.lineWidth = 1
      c.strokeStyle = dim
      c.fillStyle = fg
      // current → leader to the rod, from the left
      c.textAlign = 'right'; c.textBaseline = 'middle'
      c.fillText(t('ch3_3.radiation.currentLabel'), CX - 30, CY)
      c.beginPath(); c.moveTo(CX - 27, CY); c.lineTo(CX - 6, CY); c.stroke()
      // charge → leader up to the top dot (on-axis null, clear of loops)
      c.textAlign = 'center'; c.textBaseline = 'alphabetic'
      c.fillText(t('ch3_3.radiation.chargeLabel'), CX, CY - 46)
      c.beginPath(); c.moveTo(CX, CY - 42); c.lineTo(CX, CY - 31); c.stroke()
      // electric field → upper-right, over the right lobe
      c.textAlign = 'left'
      c.fillText(t('ch3_3.radiation.fieldLabel'), CX + 110, CY - 80)

      // ── λ = c·T bracket (one spatial period, broadside) ─────────
      const lam = 2 * Math.PI * SCALE
      const bx0 = CX + 28
      const by = GY1 + 6
      c.fillStyle = dim; c.strokeStyle = dim
      c.textAlign = 'center'
      c.beginPath()
      c.moveTo(bx0, by - 5); c.lineTo(bx0, by); c.lineTo(bx0 + lam, by); c.lineTo(bx0 + lam, by - 5)
      c.stroke()
      c.fillText('λ = c · T', bx0 + lam / 2, by + 15)

      // ── current-vs-time trace ───────────────────────────────────
      drawTrace(c, phase, fg, readVar(styles, '--border'))
      c.fillStyle = dim; c.textAlign = 'left'
      c.fillText(t('ch3_3.radiation.traceLabel'), TRACE_X0, TRACE_Y - TRACE_AMP - 10)
    }

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      draw(phaseRef.current)
      return
    }
    let raf = 0
    let last = 0
    const loop = (ts: number) => {
      if (!last) last = ts
      const dt = Math.min(0.05, (ts - last) / 1000)
      last = ts
      if (playingRef.current) phaseRef.current += speedRef.current * 2 * Math.PI * dt
      draw(phaseRef.current)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [t, i18n.language])

  return (
    <Widget
      title={t('ch3_3.radiation.title')}
      description={<Trans i18nKey="ch3_3.radiation.description" ns="ui" components={{ ...mathComponents, strong: <strong />, em: <em /> }} />}
    >
      <div className="overflow-x-auto">
        <canvas
          ref={canvasRef}
          role="img"
          aria-label={t('ch3_3.radiation.ariaLabel')}
          style={{ display: 'block', margin: '0 auto', width: W, maxWidth: '100%', height: 'auto' }}
        />
      </div>
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <button
          type="button"
          onClick={() => setPlaying(p => !p)}
          className="border border-border rounded px-3 py-1 bg-background text-foreground hover:bg-muted font-medium"
        >
          {playing ? t('ch3_3.radiation.pauseLabel') : t('ch3_3.radiation.playLabel')}
        </button>
        <label htmlFor="rad-speed" className="text-muted-foreground shrink-0">{t('ch3_3.radiation.speedLabel')}</label>
        <input
          id="rad-speed"
          type="range"
          min={0.05}
          max={0.4}
          step={0.01}
          value={speed}
          onChange={e => setSpeed(Number(e.target.value))}
          className="flex-1 min-w-[140px] accent-[hsl(var(--primary))]"
        />
      </div>
    </Widget>
  )
}

/** A charge blob at the dipole tip: radius ∝ |q|, coloured + / −, with a crisp
 *  white +/− glyph stroked inside so it reads unambiguously as charge. */
function drawCharge(c: CanvasRenderingContext2D, x: number, y: number, q: number, pos: string, neg: string): void {
  const rad = 2.5 + Math.abs(q) * 6
  c.fillStyle = q >= 0 ? pos : neg
  c.beginPath(); c.arc(x, y, rad, 0, 2 * Math.PI); c.fill()
  if (rad > 4) {
    const g = rad * 0.5
    c.strokeStyle = 'rgba(255,255,255,0.95)'
    c.lineWidth = Math.max(1.6, rad * 0.26)
    c.lineCap = 'round'
    c.beginPath()
    c.moveTo(x - g, y); c.lineTo(x + g, y) // horizontal bar (minus, or part of plus)
    if (q >= 0) { c.moveTo(x, y - g); c.lineTo(x, y + g) } // vertical bar → plus
    c.stroke()
  }
}

function drawCurrentArrow(c: CanvasRenderingContext2D, cur: number, pos: string, neg: string): void {
  const len = cur * 18
  if (Math.abs(len) < 1.2) return
  const x = CX
  const y1 = CY - len // positive current → arrow points up
  c.strokeStyle = cur >= 0 ? pos : neg
  c.fillStyle = cur >= 0 ? pos : neg
  c.lineWidth = 2.5
  c.beginPath(); c.moveTo(x, CY); c.lineTo(x, y1); c.stroke()
  const dir = len >= 0 ? -1 : 1
  c.beginPath()
  c.moveTo(x, y1)
  c.lineTo(x - 3.5, y1 - dir * 4.5)
  c.lineTo(x + 3.5, y1 - dir * 4.5)
  c.closePath(); c.fill()
}

function drawTrace(c: CanvasRenderingContext2D, phase: number, fg: string, border: string): void {
  const w = TRACE_X1 - TRACE_X0
  c.strokeStyle = border
  c.lineWidth = 1
  c.beginPath(); c.moveTo(TRACE_X0, TRACE_Y); c.lineTo(TRACE_X1, TRACE_Y); c.stroke()
  c.strokeStyle = fg
  c.lineWidth = 2
  c.beginPath()
  const span = TRACE_CYCLES * 2 * Math.PI
  for (let px = 0; px <= w; px++) {
    const tt = phase - span * (1 - px / w) // oldest at left, "now" at the right
    const y = TRACE_Y - TRACE_AMP * Math.cos(tt)
    if (px === 0) c.moveTo(TRACE_X0 + px, y)
    else c.lineTo(TRACE_X0 + px, y)
  }
  c.stroke()
  c.fillStyle = fg
  c.beginPath(); c.arc(TRACE_X1, TRACE_Y - TRACE_AMP * Math.cos(phase), 3, 0, 2 * Math.PI); c.fill()
}

/** Stroke the contour u = level into the current path (marching squares). */
function marchingSquares(vals: Float64Array, level: number, c: CanvasRenderingContext2D): void {
  for (let j = 0; j < GH - 1; j++) {
    for (let i = 0; i < GW - 1; i++) {
      const a = vals[j * GW + i] // top-left
      const b = vals[j * GW + i + 1] // top-right
      const d2 = vals[(j + 1) * GW + i + 1] // bottom-right
      const e = vals[(j + 1) * GW + i] // bottom-left
      if (Number.isNaN(a) || Number.isNaN(b) || Number.isNaN(d2) || Number.isNaN(e)) continue
      let idx = 0
      if (a > level) idx |= 8
      if (b > level) idx |= 4
      if (d2 > level) idx |= 2
      if (e > level) idx |= 1
      if (idx === 0 || idx === 15) continue
      const xL = GX0 + i * STEP
      const xR = xL + STEP
      const yT = GY0 + j * STEP
      const yB = yT + STEP
      const top = (): [number, number] => [xL + STEP * ((level - a) / (b - a)), yT]
      const right = (): [number, number] => [xR, yT + STEP * ((level - b) / (d2 - b))]
      const bot = (): [number, number] => [xL + STEP * ((level - e) / (d2 - e)), yB]
      const left = (): [number, number] => [xL, yT + STEP * ((level - a) / (e - a))]
      const seg = (p: [number, number], q: [number, number]) => { c.moveTo(p[0], p[1]); c.lineTo(q[0], q[1]) }
      switch (idx) {
        case 1: case 14: seg(left(), bot()); break
        case 2: case 13: seg(bot(), right()); break
        case 3: case 12: seg(left(), right()); break
        case 4: case 11: seg(top(), right()); break
        case 6: case 9: seg(top(), bot()); break
        case 7: case 8: seg(left(), top()); break
        case 5: seg(left(), top()); seg(bot(), right()); break
        case 10: seg(left(), bot()); seg(top(), right()); break
      }
    }
  }
}
