/**
 * Chapter 0.5 — the three wire cases, drawn.
 *
 * Why it exists: the «Wires, junctions and three rules» section is the core of
 * the chapter — three rules about dots, a key callout about dots, and two of the
 * six quiz questions about dots — and it shipped without a single picture. The
 * reader was told «think of them as pipes at different heights» and never shown
 * a crossing, a dot, or a bend. Reader-review finding, 2026-08-01.
 *
 * Layout: three panels side by side, each a small fixed-size SVG with an HTML
 * caption underneath. The captions are HTML rather than `<text>` on purpose —
 * they translate, they wrap, and they stay at body-text size without the
 * `SVGDiagram` scaling that inflates in-SVG fonts (diagram-quality §1/§2).
 *
 * Every conductor is a `@/lib/circuit` primitive (`Wire`, `Junction`) — no
 * hand-drawn SVG, so stroke weight and dot radius match every schematic in the
 * course. The panels differ ONLY in what the chapter is teaching:
 *
 *   crossing  4 conductor ends meet, no dot   → two wires passing, not joined
 *   junction  3 conductor ends meet, dot      → joined
 *   corner    2 conductor ends meet, no dot   → one wire changing direction
 */
import { useTranslation } from 'react-i18next'
import DiagramFigure from './DiagramFigure'
import { Wire, Junction } from '@/lib/circuit'

// ── Geometry ─────────────────────────────────────────────────────────────
// Fixed px, no scaling: every viewBox unit is one screen pixel.
const W = 150
const H = 90
const MID_X = W / 2      // 75 — where the vertical meets the horizontal
const MID_Y = H / 2      // 45
const RUN_L = 20         // left end of the horizontal run
const RUN_R = W - 20     // right end
const RISE_T = 14        // top of the vertical run
const RISE_B = H - 14    // bottom

interface PanelProps {
  title: string
  children: React.ReactNode
}

function Panel({ title, children }: PanelProps) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="rounded border border-border bg-card/60 p-2 text-[hsl(var(--sketch-stroke))]">
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="presentation">
          {children}
        </svg>
      </div>
      <p className="text-[13px] leading-snug text-center text-foreground m-0">{title}</p>
    </div>
  )
}

export default function WireRulesDiagram() {
  const { t } = useTranslation('ui')
  return (
    <DiagramFigure caption={t('ch0_5.wiresFigCaption')}>
      {/* Equal-width columns (`1fr`), not `max-content`: with max-content each
          column was as wide as its own caption, so the three framed panels sat
          at irregular intervals — the long third caption pushed its panel far
          right. `1fr` gives every column the same width, the panel centres in
          it, and the captions wrap inside. */}
      <div
        className="not-prose grid gap-4"
        style={{ gridTemplateColumns: `repeat(auto-fit, minmax(${W + 24}px, 1fr))` }}
        aria-label={t('ch0_5.wiresFigAria')}
      >
        {/* Panels run in the order of the three rules: rule 1 (a line is a wire,
            corners included), rule 2 (crossing, no dot), rule 3 (one line ends on
            another — the junction the dot marks). The caption invites a
            one-to-one read, so the orders have to agree. */}

        {/* ── Corner: one run that turns — still a single wire ── */}
        <Panel title={t('ch0_5.wiresFigCorner')}>
          <Wire points={[
            { x: RUN_L, y: MID_Y },
            { x: MID_X, y: MID_Y },
            { x: MID_X, y: RISE_B },
          ]} />
        </Panel>

        {/* ── Crossing: both runs carry straight on, no dot ── */}
        <Panel title={t('ch0_5.wiresFigCrossing')}>
          <Wire points={[{ x: RUN_L, y: MID_Y }, { x: RUN_R, y: MID_Y }]} />
          <Wire points={[{ x: MID_X, y: RISE_T }, { x: MID_X, y: RISE_B }]} />
        </Panel>

        {/* ── Junction: the vertical ENDS on the horizontal; dot marks it ── */}
        <Panel title={t('ch0_5.wiresFigJunction')}>
          <Wire points={[{ x: RUN_L, y: MID_Y }, { x: RUN_R, y: MID_Y }]} />
          <Wire points={[{ x: MID_X, y: MID_Y }, { x: MID_X, y: RISE_B }]} />
          <Junction x={MID_X} y={MID_Y} />
        </Panel>
      </div>
    </DiagramFigure>
  )
}
