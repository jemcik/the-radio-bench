/**
 * Chapter 0.2 — Oscilloscope screen
 * Shows a square wave on a labelled grid with time/div and volt/div callouts.
 */
import SVGDiagram from './SVGDiagram'

export default function OscilloscopeDiagram() {
  const W = 480, H = 250
  const scrX = 30, scrY = 20, scrW = 280, scrH = 180
  const cols = 10, rows = 8
  const cellW = scrW / cols, cellH = scrH / rows
  const midX = scrX + scrW / 2, midY = scrY + scrH / 2

  // 1 kHz square wave: period = 4 div at 0.5 ms/div → nice even shape
  // Amplitude = 2.5 div at 2V/div = 5Vpp
  const ampDivs = 2.5
  const periodDivs = 4
  const yHigh = midY - ampDivs * cellH
  const yLow  = midY + ampDivs * cellH
  const xStart = scrX + cellW * 0.5

  // Build square wave path (2.5 cycles)
  const buildWave = () => {
    let d = ''
    let x = xStart
    const cycles = 2.5
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

  return (
    <figure className="my-8 not-prose">
      <div className="rounded-xl border border-border bg-muted/40 p-4 overflow-x-auto">
        <SVGDiagram
          width={W} height={H}
          style={{ maxWidth: W, margin: '0 auto' }}
          fontFamily="inherit"
          aria-label="Oscilloscope screen showing a 1 kHz square wave at 5V peak-to-peak"
        >
          {/* Screen bezel */}
          <rect x={scrX - 8} y={scrY - 8} width={scrW + 16} height={scrH + 16}
            rx="6" fill="hsl(220 13% 10%)" />

          {/* Screen background */}
          <rect x={scrX} y={scrY} width={scrW} height={scrH} fill="hsl(135 30% 6%)" />

          {/* Minor grid lines */}
          {Array.from({ length: cols - 1 }).map((_, i) => (
            <line key={`cv${i}`}
              x1={scrX + (i + 1) * cellW} y1={scrY}
              x2={scrX + (i + 1) * cellW} y2={scrY + scrH}
              stroke="hsl(135 30% 25%)" strokeWidth="0.5" opacity="0.4" />
          ))}
          {Array.from({ length: rows - 1 }).map((_, i) => (
            <line key={`ch${i}`}
              x1={scrX} y1={scrY + (i + 1) * cellH}
              x2={scrX + scrW} y2={scrY + (i + 1) * cellH}
              stroke="hsl(135 30% 25%)" strokeWidth="0.5" opacity="0.4" />
          ))}

          {/* Axis cross-hairs */}
          <line x1={midX} y1={scrY} x2={midX} y2={scrY + scrH}
            stroke="hsl(135 30% 40%)" strokeWidth="0.8" opacity="0.7" />
          <line x1={scrX} y1={midY} x2={scrX + scrW} y2={midY}
            stroke="hsl(135 30% 40%)" strokeWidth="0.8" opacity="0.7" />

          {/* Tick marks on axes */}
          {Array.from({ length: cols + 1 }).map((_, i) => (
            <line key={`tx${i}`}
              x1={scrX + i * cellW} y1={midY - 3}
              x2={scrX + i * cellW} y2={midY + 3}
              stroke="hsl(135 30% 55%)" strokeWidth="1" />
          ))}
          {Array.from({ length: rows + 1 }).map((_, i) => (
            <line key={`ty${i}`}
              x1={midX - 3} y1={scrY + i * cellH}
              x2={midX + 3} y2={scrY + i * cellH}
              stroke="hsl(135 30% 55%)" strokeWidth="1" />
          ))}

          {/* Waveform */}
          <clipPath id="screenClip">
            <rect x={scrX} y={scrY} width={scrW} height={scrH} />
          </clipPath>
          <path d={buildWave()}
            fill="none"
            stroke="hsl(135 70% 55%)"
            strokeWidth="2"
            clipPath="url(#screenClip)" />

          {/* 0V reference label */}
          <text x={scrX + 4} y={midY - 4} fontSize="11"
            fill="hsl(135 30% 55%)">0V</text>

          {/* ── Right-side annotations ──────────────────────────── */}
          {/* volt/div bracket */}
          <line x1={scrX + scrW + 16} y1={yHigh}
                x2={scrX + scrW + 16} y2={midY}
            stroke="hsl(38 92% 55%)" strokeWidth="1.2" />
          <line x1={scrX + scrW + 12} y1={yHigh}
                x2={scrX + scrW + 20} y2={yHigh}
            stroke="hsl(38 92% 55%)" strokeWidth="1.2" />
          <line x1={scrX + scrW + 12} y1={midY}
                x2={scrX + scrW + 20} y2={midY}
            stroke="hsl(38 92% 55%)" strokeWidth="1.2" />
          <text x={scrX + scrW + 24} y={(yHigh + midY) / 2 + 4}
            fontSize="12" fill="hsl(38 92% 55%)" fontWeight="600">
            2.5 div
          </text>
          <text x={scrX + scrW + 24} y={(yHigh + midY) / 2 + 18}
            fontSize="11" fill="hsl(38 92% 55%)" opacity="0.7">
            × 2V/div
          </text>
          <text x={scrX + scrW + 24} y={(yHigh + midY) / 2 + 31}
            fontSize="11" fill="hsl(38 92% 55%)" opacity="0.7">
            = 5V
          </text>

          {/* ── Bottom annotations ──────────────────────────────── */}
          {/* period bracket — sits 14px below bezel edge */}
          <line x1={xStart} y1={scrY + scrH + 20}
                x2={xStart + periodDivs * cellW} y2={scrY + scrH + 20}
            stroke="hsl(250 60% 65%)" strokeWidth="1.2" />
          <line x1={xStart} y1={scrY + scrH + 15}
                x2={xStart} y2={scrY + scrH + 25}
            stroke="hsl(250 60% 65%)" strokeWidth="1.2" />
          <line x1={xStart + periodDivs * cellW} y1={scrY + scrH + 15}
                x2={xStart + periodDivs * cellW} y2={scrY + scrH + 25}
            stroke="hsl(250 60% 65%)" strokeWidth="1.2" />
          <text x={xStart + (periodDivs * cellW) / 2}
                y={scrY + scrH + 38}
            textAnchor="middle" fontSize="10" fill="hsl(250 60% 65%)" fontWeight="600">
            4 div × 0.5 ms/div = 2 ms = 1 kHz
          </text>

          {/* ── Control labels (bottom-right) ── */}
          <text x={scrX + scrW - 4} y={scrY + scrH - 20}
            textAnchor="end" fontSize="10" fill="hsl(38 92% 55%)" opacity="0.8"
            fontWeight="600">
            VOLT/DIV 2V
          </text>
          <text x={scrX + scrW - 4} y={scrY + scrH - 6}
            textAnchor="end" fontSize="10" fill="hsl(250 60% 65%)" opacity="0.8"
            fontWeight="600">
            TIME/DIV 0.5ms
          </text>
        </SVGDiagram>
      </div>
      <figcaption className="mt-2 text-center text-xs text-muted-foreground">
        Oscilloscope screen showing the 1 kHz square wave from the lab activity.
        Amplitude = 2.5 div × 2 V/div = 5 V<sub>pp</sub>.
        Period = 4 div × 0.5 ms/div = 2 ms → <strong>1 kHz</strong>.
      </figcaption>
    </figure>
  )
}
