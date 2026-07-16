/**
 * Chapter 1.8 §2 — comparison gallery of the four canonical filter
 * shapes. Each panel pairs a tiny schematic (left) with the matching
 * magnitude response (right) on the same log-log Bode-plot axes used
 * later in the chapter.
 *
 * Layout: a CSS grid of four independent SVGs (panels). One column on
 * mobile (panels stacked vertically — readable on narrow screens),
 * two columns on md+ (the canonical 2×2 grid). Each panel SVG owns
 * its own viewBox so it can be designed for a wide-enough aspect
 * ratio that the «вхід» / «вихід» labels fit even in Ukrainian.
 *
 * The schematic glyphs are deliberately stylised — they are a visual
 * cue for the reader, not a buildable circuit. Real schematics for
 * each topology appear later in the chapter via the Circuit-primitive
 * components (RcLowPassSchematic, BlocksHighPassSchematic,
 * LcBandPassSchematic, LcNotchSchematic).
 *
 * hardcoded-fontsize-file-ok: 4-panel gallery with hand-tuned label
 * sizes (8/10/11 px) that all four panels share for visual consistency.
 * Converting to em would either bloat the small annotations or shrink
 * them below readable size at this panel scale.
 */
import { useTranslation } from 'react-i18next'
import { svgTokens } from './svgTokens'

type FilterShape = 'lpf' | 'hpf' | 'bpf' | 'bsf'

const PANELS: FilterShape[] = ['lpf', 'hpf', 'bpf', 'bsf']

// Per-panel viewBox. Width fits the schematic (left half) + plot
// (right half) + axis labels with comfortable margins for a 4-letter
// Cyrillic label («вхід» / «вихід»). Height includes a title strip at
// the top with a clear gap before the schematic / plot starts — the
// gap is non-negotiable because cramming the «dB» axis label right
// under the title reads as if the two are stacked rather than two
// separate UI elements.
const VB_W = 360
const VB_H = 184

const TITLE_Y = 20
const TITLE_BOTTOM_GAP = 24    // clear vertical gap between title baseline and content
const LABEL_FONT = 11
const TITLE_FONT = 13

// Schematic block — left half of the panel.
const SCH_X = 14
const SCH_W = 130
const SCH_TOP_Y = TITLE_Y + TITLE_BOTTOM_GAP + 6   // 50
const SCH_BOT_Y = 138
const SCH_RAIL_Y = SCH_TOP_Y + 16   // top signal rail (= 66)
const SCH_GND_Y = SCH_BOT_Y         // bottom ground rail

// Plot block — right half. Plot top sits at the same vertical level
// as «гap», so the dB axis label that hangs above it has clear space
// below the title.
const PLOT_X = SCH_X + SCH_W + 28
const PLOT_W = VB_W - PLOT_X - 18
const PLOT_TOP_Y = TITLE_Y + TITLE_BOTTOM_GAP   // 44
const PLOT_BOT_Y = SCH_BOT_Y
const PLOT_H = PLOT_BOT_Y - PLOT_TOP_Y

// Magnitude in dB at frequency ratio u = f / f_corner for each shape.
function magDb(shape: FilterShape, u: number, q: number): number {
  const safeU = Math.max(u, 1e-6)
  switch (shape) {
    case 'lpf':
      return -10 * Math.log10(1 + safeU * safeU)
    case 'hpf':
      return -10 * Math.log10(1 + 1 / (safeU * safeU))
    case 'bpf': {
      const denom = 1 + q * q * Math.pow(safeU - 1 / safeU, 2)
      return -10 * Math.log10(denom)
    }
    case 'bsf': {
      const v = safeU - 1 / safeU
      const num = v * v
      const denom = num + 1 / (q * q)
      return 10 * Math.log10(num / denom)
    }
  }
}

const Y_MAX_DB = 5
const Y_MIN_DB = -30
const X_HALF_DECADES = 1.4
const Q_BAND = 4

// Soft cap on dB before mapping to y. The visible plot window is
// Y_MIN_DB..Y_MAX_DB; the curve is clipped to the plot rectangle via
// SVG `<clipPath>` (see the response-plot block in the JSX). Sample-
// time clamping was the long-standing bug that pinned y to the chart
// edge so the curve LITERALLY rode the top/bottom border, looking like
// a false plateau — caught by `diagram-curve-edge-rail.test.tsx`. The
// soft cap below keeps y inside ~3× plot height (so the path string
// stays sane) without producing the false plateau; clipPath then hides
// anything past the actual chart bounds.
const Y_SOFT_CAP_DB = 80

function buildPath(shape: FilterShape): string {
  const STEPS = 180
  const parts: string[] = []
  for (let i = 0; i <= STEPS; i++) {
    const t = i / STEPS
    const logU = -X_HALF_DECADES + t * (2 * X_HALF_DECADES)
    const u = Math.pow(10, logU)
    const dbRaw = magDb(shape, u, Q_BAND)
    const db = Math.max(-Y_SOFT_CAP_DB, Math.min(Y_SOFT_CAP_DB, dbRaw))
    const x = PLOT_X + t * PLOT_W
    const y = PLOT_TOP_Y + ((Y_MAX_DB - db) / (Y_MAX_DB - Y_MIN_DB)) * PLOT_H
    parts.push(`${i === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`)
  }
  return parts.join(' ')
}

// ── Mini-schematic glyphs ────────────────────────────────────────────
//
// Drawn directly with paths (no Circuit primitives) so the gallery is
// self-contained at small scale. Stroke colour matches the response
// curve so the schematic and the chart read as a single unit.

interface SchematicProps {
  shape: FilterShape
  inLabel: string
  outLabel: string
}

function Schematic({ shape, inLabel, outLabel }: SchematicProps) {
  // Wire-stroke parameters. Schematics use the canonical
  // `--sketch-stroke` colour — every Circuit-primitive schematic
  // elsewhere in the project (RcLowPassSchematic, LcSeriesSchematic
  // etc.) inherits this via `currentColor` from the Circuit wrapper's
  // `text-[hsl(var(--sketch-stroke))]` class. We're not inside a
  // Circuit wrapper here (gallery uses bespoke mini-glyphs), so we
  // reach for the token directly to keep visual parity. The brand-
  // coloured `primary` is reserved for the response curve on the
  // right — schematic = structure (sketch tone), curve = data (brand).
  const wireProps = {
    fill: 'none' as const,
    stroke: svgTokens.sketchStroke,
    strokeWidth: 1.9,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  }
  const heavyWire = { ...wireProps, strokeWidth: 2.4 }

  // Reference x positions inside the schematic block. inX is the wire
  // entry x; outX is the wire exit x. Components sit between them.
  const inX = SCH_X + 16
  const outX = SCH_X + SCH_W - 16

  function resistor(x1: number, x2: number, y: number) {
    const dx = (x2 - x1) / 6
    return `M ${x1} ${y} L ${x1 + dx} ${y - 5} L ${x1 + 2 * dx} ${y + 5} L ${x1 + 3 * dx} ${y - 5} L ${x1 + 4 * dx} ${y + 5} L ${x1 + 5 * dx} ${y - 5} L ${x2} ${y}`
  }
  function capPlatesH(cx: number, cy: number) {
    // Plates oriented for a horizontal wire (vertical plates).
    return `M ${cx - 3} ${cy - 8} L ${cx - 3} ${cy + 8} M ${cx + 3} ${cy - 8} L ${cx + 3} ${cy + 8}`
  }
  function capPlatesV(cx: number, cy: number) {
    // Plates oriented for a vertical wire (horizontal plates).
    return `M ${cx - 8} ${cy - 3} L ${cx + 8} ${cy - 3} M ${cx - 8} ${cy + 3} L ${cx + 8} ${cy + 3}`
  }
  function inductorBumps(x1: number, x2: number, y: number) {
    const N = 4
    const dx = (x2 - x1) / N
    let path = `M ${x1} ${y} `
    for (let i = 0; i < N; i++) {
      const sx = x1 + i * dx
      path += `A ${dx / 2} 5.5 0 0 1 ${sx + dx} ${y} `
    }
    return path
  }
  function gndSymbol(cx: number, y: number) {
    return `M ${cx - 8} ${y} L ${cx + 8} ${y} M ${cx - 5} ${y + 3} L ${cx + 5} ${y + 3} M ${cx - 2} ${y + 6} L ${cx + 2} ${y + 6}`
  }

  // Terminal labels — anchored ABOVE the wire entry/exit points so a
  // wider Cyrillic label («вхід» / «вихід») has horizontal space without
  // colliding with the schematic body. textAnchor="start"/"end" keeps
  // the label tucked against the entry/exit point.
  const labels = (
    <g fontFamily="inherit" fill={svgTokens.fg} fontSize={LABEL_FONT}>
      <text x={inX} y={SCH_RAIL_Y - 8} textAnchor="start">{inLabel}</text>
      <text x={outX} y={SCH_RAIL_Y - 8} textAnchor="end">{outLabel}</text>
    </g>
  )

  switch (shape) {
    case 'lpf': {
      // R series in rail, C shunt to ground
      const rL = inX + 4
      const rR = inX + 50
      const node = inX + 76
      const capX = node
      const capY = (SCH_RAIL_Y + SCH_GND_Y) / 2
      return (
        <g>
          {/* Top rail: in → R → node → out */}
          <path d={`M ${inX} ${SCH_RAIL_Y} L ${rL} ${SCH_RAIL_Y}`} {...wireProps} />
          <path d={resistor(rL, rR, SCH_RAIL_Y)} {...wireProps} />
          <path d={`M ${rR} ${SCH_RAIL_Y} L ${outX} ${SCH_RAIL_Y}`} {...wireProps} />
          {/* Shunt cap from node down */}
          <path d={`M ${node} ${SCH_RAIL_Y} L ${capX} ${capY - 8}`} {...wireProps} />
          <path d={capPlatesV(capX, capY)} {...heavyWire} />
          <path d={`M ${capX} ${capY + 3} L ${capX} ${SCH_GND_Y - 6}`} {...wireProps} />
          <path d={gndSymbol(capX, SCH_GND_Y - 6)} {...wireProps} />
          {labels}
        </g>
      )
    }
    case 'hpf': {
      // C series in rail, R shunt to ground
      const cX = inX + 26
      const node = inX + 56
      const rTopY = SCH_RAIL_Y + 8
      const rBotY = SCH_GND_Y - 14
      return (
        <g>
          <path d={`M ${inX} ${SCH_RAIL_Y} L ${cX - 7} ${SCH_RAIL_Y}`} {...wireProps} />
          <path d={capPlatesH(cX, SCH_RAIL_Y)} {...heavyWire} />
          <path d={`M ${cX + 3} ${SCH_RAIL_Y} L ${node} ${SCH_RAIL_Y} L ${outX} ${SCH_RAIL_Y}`} {...wireProps} />
          {/* Shunt R from node down — vertical zigzag */}
          <path d={`M ${node} ${SCH_RAIL_Y} L ${node} ${rTopY}`} {...wireProps} />
          <path
            d={`M ${node} ${rTopY}
                L ${node - 5} ${rTopY + 5}
                L ${node + 5} ${rTopY + 11}
                L ${node - 5} ${rTopY + 17}
                L ${node + 5} ${rTopY + 23}
                L ${node - 5} ${rTopY + 29}
                L ${node} ${rBotY}`}
            {...wireProps}
          />
          <path d={`M ${node} ${rBotY} L ${node} ${SCH_GND_Y - 6}`} {...wireProps} />
          <path d={gndSymbol(node, SCH_GND_Y - 6)} {...wireProps} />
          {labels}
        </g>
      )
    }
    case 'bpf': {
      // L and C in series in the signal path
      const lL = inX + 6
      const lR = inX + 46
      const cX = inX + 64
      return (
        <g>
          <path d={`M ${inX} ${SCH_RAIL_Y} L ${lL} ${SCH_RAIL_Y}`} {...wireProps} />
          <path d={inductorBumps(lL, lR, SCH_RAIL_Y)} {...wireProps} />
          <path d={`M ${lR} ${SCH_RAIL_Y} L ${cX - 7} ${SCH_RAIL_Y}`} {...wireProps} />
          <path d={capPlatesH(cX, SCH_RAIL_Y)} {...heavyWire} />
          <path d={`M ${cX + 3} ${SCH_RAIL_Y} L ${outX} ${SCH_RAIL_Y}`} {...wireProps} />
          {labels}
        </g>
      )
    }
    case 'bsf': {
      // Series L–C in shunt to ground: the trap. At f_0 the series pair is a
      // near-short, dumping f_0 to ground → notch. (A parallel tank in shunt
      // would be a band-PASS — that was the earlier bug here.)
      const legX = inX + 50
      const lTopY = SCH_RAIL_Y + 8
      const cCenterY = SCH_RAIL_Y + 44
      return (
        <g>
          <path d={`M ${inX} ${SCH_RAIL_Y} L ${outX} ${SCH_RAIL_Y}`} {...wireProps} />
          {/* drop from the signal rail to the top of L */}
          <path d={`M ${legX} ${SCH_RAIL_Y} L ${legX} ${lTopY}`} {...wireProps} />
          {/* L — vertical solenoid bumps */}
          {Array.from({ length: 4 }).map((_, i) => {
            const yc = lTopY + i * 6
            return <path key={i} d={`M ${legX} ${yc} A 3 3 0 0 1 ${legX} ${yc + 6}`} {...wireProps} />
          })}
          {/* wire from L bottom to C top */}
          <path d={`M ${legX} ${lTopY + 24} L ${legX} ${cCenterY - 3}`} {...wireProps} />
          {/* C — two horizontal plates */}
          <path d={capPlatesV(legX, cCenterY)} {...heavyWire} />
          {/* wire from C bottom to GND */}
          <path d={`M ${legX} ${cCenterY + 3} L ${legX} ${SCH_GND_Y - 6}`} {...wireProps} />
          <path d={gndSymbol(legX, SCH_GND_Y - 6)} {...wireProps} />
          {labels}
        </g>
      )
    }
  }
}

interface PanelProps {
  shape: FilterShape
  title: string
  inLabel: string
  outLabel: string
  freqAxisLabel: string
}

function Panel({ shape, title, inLabel, outLabel, freqAxisLabel }: PanelProps) {
  const path = buildPath(shape)
  const xCorner = PLOT_X + PLOT_W / 2
  const yMinus3 = PLOT_TOP_Y + ((Y_MAX_DB - -3) / (Y_MAX_DB - Y_MIN_DB)) * PLOT_H
  const cornerSubscript = shape === 'bpf' || shape === 'bsf' ? '0' : 'c'
  // Per-shape clipPath id — multiple Panel instances render on the same
  // page (one per filter type), each needs its own id so SVG fragment
  // identifiers don't cross-pollinate.
  const clipId = `ftg-clip-${shape}`

  return (
    <svg
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      role="img"
      aria-label={title}
      style={{ display: 'block', width: '100%', height: 'auto' }}
    >
      <defs>
        <clipPath id={clipId}>
          <rect x={PLOT_X} y={PLOT_TOP_Y} width={PLOT_W} height={PLOT_H} />
        </clipPath>
      </defs>
      {/* Panel background — subtle border for visual grouping */}
      <rect
        x={1} y={1}
        width={VB_W - 2} height={VB_H - 2}
        fill="none"
        stroke={svgTokens.border}
        strokeWidth={1}
        rx={6}
      />

      {/* Type label — top centre */}
      <text
        x={VB_W / 2} y={TITLE_Y}
        fontSize={TITLE_FONT}
        textAnchor="middle"
        fill={svgTokens.fg}
        fontWeight="700"
      >
        {title}
      </text>

      {/* Schematic */}
      <Schematic shape={shape} inLabel={inLabel} outLabel={outLabel} />

      {/* Plot frame: bottom + left axis lines */}
      <path
        d={`M ${PLOT_X} ${PLOT_TOP_Y} L ${PLOT_X} ${PLOT_BOT_Y} L ${PLOT_X + PLOT_W} ${PLOT_BOT_Y}`}
        stroke={svgTokens.border}
        strokeWidth={1}
        fill="none"
      />

      {/* −3 dB horizontal guide */}
      <path
        d={`M ${PLOT_X} ${yMinus3} L ${PLOT_X + PLOT_W} ${yMinus3}`}
        stroke={svgTokens.mutedFg}
        strokeWidth={1}
        strokeDasharray="3 3"
        opacity={0.45}
      />

      {/* Corner / centre vertical hairline */}
      <path
        d={`M ${xCorner} ${PLOT_TOP_Y} L ${xCorner} ${PLOT_BOT_Y}`}
        stroke={svgTokens.mutedFg}
        strokeWidth={1}
        strokeDasharray="3 3"
        opacity={0.45}
      />

      {/* Magnitude trace — clipped to the plot rectangle so values past
          ±Y_MAX_DB / Y_MIN_DB exit the chart with their real slope rather
          than riding the chart boundary as a false plateau. */}
      <path
        d={path}
        stroke={svgTokens.primary}
        strokeWidth={2}
        fill="none"
        strokeLinejoin="round"
        strokeLinecap="round"
        clipPath={`url(#${clipId})`}
      />

      {/* dB axis label — top of plot, anchored above the frame */}
      <text
        x={PLOT_X - 4} y={PLOT_TOP_Y - 6}
        fontSize="10"
        textAnchor="end"
        fill={svgTokens.mutedFg}
      >
        dB
      </text>

      {/* Corner label below plot */}
      <text
        x={xCorner} y={PLOT_BOT_Y + 14}
        fontSize="11"
        textAnchor="middle"
        fill={svgTokens.mutedFg}
        fontStyle="italic"
      >
        <tspan>f</tspan>
        <tspan baselineShift="sub" fontSize="8">{cornerSubscript}</tspan>
      </text>

      {/* Frequency axis hint */}
      <text
        x={PLOT_X + PLOT_W / 2} y={PLOT_BOT_Y + 28}
        fontSize="10"
        textAnchor="middle"
        fill={svgTokens.mutedFg}
      >
        {freqAxisLabel}
      </text>
    </svg>
  )
}

export default function FilterTypeGallery() {
  const { t } = useTranslation('ui')
  const inLabel = t('ch1_8.filterTypeGalleryInLabel')
  const outLabel = t('ch1_8.filterTypeGalleryOutLabel')
  const freqAxisLabel = t('ch1_8.filterTypeGalleryFreqAxis')

  return (
    <figure
      className="my-6"
      role="group"
      aria-label={t('ch1_8.filterTypeGalleryAria')}
    >
      <h3 className="text-center text-base font-semibold text-foreground mb-4">
        {t('ch1_8.filterTypeGalleryTitle')}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {PANELS.map(shape => {
          const titleKey = `ch1_8.filterTypeGallery${shape.charAt(0).toUpperCase()}${shape.slice(1)}`
          return (
            <Panel
              key={shape}
              shape={shape}
              title={t(titleKey)}
              inLabel={inLabel}
              outLabel={outLabel}
              freqAxisLabel={freqAxisLabel}
            />
          )
        })}
      </div>
    </figure>
  )
}
