/**
 * Chapter 0.2 — Oscilloscope screen
 * Shows a square wave on a labelled grid with time/div and volt/div callouts.
 *
 * DECORATIVE COLOUR EXCEPTION (per CLAUDE.md): the `hsl(…)` literals in
 * this file paint a recognisable bench oscilloscope. They are intentionally
 * NOT driven by the theme tokens (`--foreground` etc.) — instead we pick
 * between two hand-tuned palettes based on the theme's light/dark nature,
 * so light themes see a modern LCD scope (Rigol / Siglent aesthetic, pale
 * screen, dark forest-green trace) and dark themes see a vintage CRT scope
 * (near-black phosphor, bright green trace). Using the page tokens would
 * make the scope shapeshift with hue between paper/stone/nordic, which
 * isn't what any physical scope does.
 */
import { useTranslation, Trans } from 'react-i18next'
import SVGDiagram from './SVGDiagram'
import DiagramFigure from './DiagramFigure'
import { useTheme } from '@/context/ThemeContext'
import { THEMES } from '@/lib/themes'

export default function OscilloscopeDiagram() {
  const { t } = useTranslation('ui')
  const { theme } = useTheme()
  const isDark = THEMES.find(th => th.id === theme)?.isDark ?? false

  // Two hand-tuned palettes. Opacity is bundled with each colour because
  // the light/dark contrast budgets differ — e.g. a slightly denser grid
  // is needed on the pale LCD to be visible, while the dark CRT needs a
  // lighter grid colour at lower opacity to keep the faint-trace feel.
  const c = isDark ? {
    bezel:         'hsl(220 10% 20%)',
    bezelStroke:   'hsl(220 10% 32%)',
    screen:        'hsl(135 30% 8%)',
    grid:          'hsl(135 30% 25%)',
    gridOpacity:   0.4,
    axis:          'hsl(135 30% 45%)',
    axisOpacity:   0.7,
    tick:          'hsl(135 30% 55%)',
    trace:         'hsl(135 70% 55%)',   // bright phosphor green
    zero:          'hsl(135 30% 55%)',
    voltdiv:       'hsl(38 92% 55%)',    // bright amber
    timediv:       'hsl(250 60% 65%)',   // periwinkle
  } : {
    bezel:         'hsl(220 8% 82%)',
    bezelStroke:   'hsl(220 6% 72%)',
    screen:        'hsl(135 20% 95%)',   // pale sage LCD tint
    grid:          'hsl(135 15% 72%)',
    gridOpacity:   0.55,
    axis:          'hsl(135 15% 50%)',
    axisOpacity:   0.8,
    tick:          'hsl(135 15% 35%)',
    trace:         'hsl(150 65% 30%)',   // dark forest green
    zero:          'hsl(135 20% 35%)',
    voltdiv:       'hsl(30 85% 35%)',    // darker amber (readable on cream)
    timediv:       'hsl(250 55% 40%)',   // darker periwinkle
  }
  // VIEWBOX WIDTH BUDGET
  //   left bezel edge   : scrX-8          = 22
  //   screen right edge : scrX+scrW+8     = 318
  //   right annotations : scrX+scrW+24..  ≈ 334 → 382 (the "× 2V/div" label)
  //   chosen W=410 leaves ~22 px on the left and ~28 px on the right,
  //   so the content is visually centred when the SVG is stretched to 100 %
  //   of the card width. Previous W=480 left ~100 px of empty space on the
  //   right, which made the scope read as left-biased inside the card.
  const W = 410, H = 250
  const scrX = 30, scrY = 20, scrW = 280, scrH = 180
  const cols = 10, rows = 8
  const cellW = scrW / cols, cellH = scrH / rows
  const midX = scrX + scrW / 2, midY = scrY + scrH / 2

  // 1 kHz square wave at time/div = 0.5 ms:
  //   period T = 1 / 1 kHz = 1 ms = 2 divisions (NOT 4 — a common slip).
  //   Previously this was drawn with periodDivs = 4, which is actually
  //   500 Hz; both the waveform and the "= 1 kHz" labels lied about
  //   each other. Fixed by using periodDivs = 2 and scaling the cycle
  //   count so the wave still fills the full 10-div screen.
  // Amplitude = 2.5 div at 2 V/div = 5 Vpp.
  const ampDivs = 2.5
  const periodDivs = 2
  const yHigh = midY - ampDivs * cellH
  const yLow  = midY + ampDivs * cellH
  const xStart = scrX + cellW * 0.5

  // Build square wave path — 5 full cycles × 2 div each = 10 div = full screen.
  const buildWave = () => {
    let d = ''
    let x = xStart
    const cycles = 5
    const halfPer = (periodDivs / 2) * cellW
    let high = true
    d += `M ${x} ${yHigh}`
    for (let i = 0; i < cycles * 2; i++) {
      d += ` H ${x + halfPer}`
      d += ` V ${high ? yLow : yHigh}`
      x += halfPer
      high = !high
    }
    // clip to screen edge
    d += ` H ${scrX + scrW - 2}`
    return d
  }

  const nowrap = <span style={{ whiteSpace: 'nowrap' }} />
  const caption = (
    <>
      {t('ch0_2.scopeDiagramCaption1')}{' '}
      <Trans i18nKey="ch0_2.scopeDiagramCaption2" ns="ui" components={{ nowrap }} /><sub>pp</sub>.{' '}
      <Trans i18nKey="ch0_2.scopeDiagramCaption3" ns="ui" components={{ strong: <strong />, nowrap }} />
    </>
  )

  return (
    <DiagramFigure caption={caption}>
      <SVGDiagram
        width={W} height={H}
        style={{ maxWidth: 560, margin: '0 auto' }}
        fontFamily="inherit"
        aria-label={t('ch0_2.scopeDiagramAria')}
      >
          {/* Screen bezel */}
          <rect x={scrX - 8} y={scrY - 8} width={scrW + 16} height={scrH + 16}
            rx="6" fill={c.bezel}
            stroke={c.bezelStroke} strokeWidth="0.6" />

          {/* Screen background */}
          <rect x={scrX} y={scrY} width={scrW} height={scrH} fill={c.screen} />

          {/* Minor grid lines */}
          {Array.from({ length: cols - 1 }).map((_, i) => (
            <line key={`cv${i}`}
              x1={scrX + (i + 1) * cellW} y1={scrY}
              x2={scrX + (i + 1) * cellW} y2={scrY + scrH}
              stroke={c.grid} strokeWidth="0.5" opacity={c.gridOpacity} />
          ))}
          {Array.from({ length: rows - 1 }).map((_, i) => (
            <line key={`ch${i}`}
              x1={scrX} y1={scrY + (i + 1) * cellH}
              x2={scrX + scrW} y2={scrY + (i + 1) * cellH}
              stroke={c.grid} strokeWidth="0.5" opacity={c.gridOpacity} />
          ))}

          {/* Axis cross-hairs */}
          <line x1={midX} y1={scrY} x2={midX} y2={scrY + scrH}
            stroke={c.axis} strokeWidth="0.8" opacity={c.axisOpacity} />
          <line x1={scrX} y1={midY} x2={scrX + scrW} y2={midY}
            stroke={c.axis} strokeWidth="0.8" opacity={c.axisOpacity} />

          {/* Tick marks on axes */}
          {Array.from({ length: cols + 1 }).map((_, i) => (
            <line key={`tx${i}`}
              x1={scrX + i * cellW} y1={midY - 3}
              x2={scrX + i * cellW} y2={midY + 3}
              stroke={c.tick} strokeWidth="1" />
          ))}
          {Array.from({ length: rows + 1 }).map((_, i) => (
            <line key={`ty${i}`}
              x1={midX - 3} y1={scrY + i * cellH}
              x2={midX + 3} y2={scrY + i * cellH}
              stroke={c.tick} strokeWidth="1" />
          ))}

          {/* Waveform */}
          <clipPath id="screenClip">
            <rect x={scrX} y={scrY} width={scrW} height={scrH} />
          </clipPath>
          <path d={buildWave()}
            fill="none"
            stroke={c.trace}
            strokeWidth="2"
            clipPath="url(#screenClip)" />

          {/* 0V reference label */}
          <text x={scrX + 4} y={midY - 4} fontSize="11"
            fill={c.zero}>0V</text>

          {/* ── Right-side annotations ──────────────────────────── */}
          {/* volt/div bracket */}
          <line x1={scrX + scrW + 16} y1={yHigh}
                x2={scrX + scrW + 16} y2={midY}
            stroke={c.voltdiv} strokeWidth="1.2" />
          <line x1={scrX + scrW + 12} y1={yHigh}
                x2={scrX + scrW + 20} y2={yHigh}
            stroke={c.voltdiv} strokeWidth="1.2" />
          <line x1={scrX + scrW + 12} y1={midY}
                x2={scrX + scrW + 20} y2={midY}
            stroke={c.voltdiv} strokeWidth="1.2" />
          <text x={scrX + scrW + 24} y={(yHigh + midY) / 2 + 4}
            fontSize="12" fill={c.voltdiv} fontWeight="600">
            2.5 div
          </text>
          <text x={scrX + scrW + 24} y={(yHigh + midY) / 2 + 18}
            fontSize="11" fill={c.voltdiv} opacity="0.7">
            × 2V/div
          </text>
          <text x={scrX + scrW + 24} y={(yHigh + midY) / 2 + 31}
            fontSize="11" fill={c.voltdiv} opacity="0.7">
            = 5V
          </text>

          {/* ── Bottom annotations ──────────────────────────────── */}
          {/* period bracket — sits 14px below bezel edge */}
          <line x1={xStart} y1={scrY + scrH + 20}
                x2={xStart + periodDivs * cellW} y2={scrY + scrH + 20}
            stroke={c.timediv} strokeWidth="1.2" />
          <line x1={xStart} y1={scrY + scrH + 15}
                x2={xStart} y2={scrY + scrH + 25}
            stroke={c.timediv} strokeWidth="1.2" />
          <line x1={xStart + periodDivs * cellW} y1={scrY + scrH + 15}
                x2={xStart + periodDivs * cellW} y2={scrY + scrH + 25}
            stroke={c.timediv} strokeWidth="1.2" />
          {/* Period label — centred on the screen, not on the bracket, so
              Ukrainian (wider) still fits. The bracket itself sits under
              the first period at the left of the screen; proximity to
              this label is enough to associate them. */}
          <text x={scrX + scrW / 2}
                y={scrY + scrH + 38}
            textAnchor="middle" fontSize="10" fill={c.timediv} fontWeight="600">
            {t('ch0_2.scopeDiagramPeriodInline')}
          </text>

          {/* ── Control labels (bottom-right) ── */}
          <text x={scrX + scrW - 4} y={scrY + scrH - 20}
            textAnchor="end" fontSize="10" fill={c.voltdiv} opacity="0.8"
            fontWeight="600">
            VOLT/DIV 2V
          </text>
          <text x={scrX + scrW - 4} y={scrY + scrH - 6}
            textAnchor="end" fontSize="10" fill={c.timediv} opacity="0.8"
            fontWeight="600">
            TIME/DIV 0.5ms
          </text>
      </SVGDiagram>
    </DiagramFigure>
  )
}
