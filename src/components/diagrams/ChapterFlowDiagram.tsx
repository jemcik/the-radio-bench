/**
 * Chapter 0.1 — How a chapter is structured
 * Shows the Concept → Formula → Widget → Lab → Quiz flow.
 * Box widths are computed dynamically from translated text.
 *
 * Measurement uses the *active* user font (read from FontContext) — generic
 * `sans-serif` would underestimate width for wider faces like Plex Sans
 * or Lora, leading to cramped boxes after the user changes typeface.
 */
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useFont } from '@/context/FontContext'
import { getFontById } from '@/lib/fonts'
import SVGDiagram from './SVGDiagram'
import DiagramFigure from './DiagramFigure'

/** Estimate text width using an off-screen canvas (accurate to ±2 px). */
function measureText(text: string, font: string): number {
  if (typeof document === 'undefined') return text.length * 8
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) return text.length * 8
  ctx.font = font
  return Math.ceil(ctx.measureText(text).width)
}

export default function ChapterFlowDiagram() {
  const { t } = useTranslation('ui')
  const { font: fontId } = useFont()
  // The SVG <text> uses font-family: inherit, which resolves to --font-sans
  // (set by FontContext). Mirror that here so the canvas measures glyphs
  // in the same face that will be painted.
  const sans = getFontById(fontId).sans

  const stepDefs = useMemo(() => [
    { label: t('chapterFlow.analogy'), sub: t('chapterFlow.analogySub'), color: 'hsl(38 92% 50%)' },
    { label: t('chapterFlow.formula'), sub: t('chapterFlow.formulaSub'), color: 'hsl(38 92% 50%)' },
    { label: t('chapterFlow.widget'),  sub: t('chapterFlow.widgetSub'),  color: 'hsl(221 83% 53%)' },
    { label: t('chapterFlow.lab'),     sub: t('chapterFlow.labSub'),     color: 'hsl(172 66% 40%)' },
    { label: t('chapterFlow.quiz'),    sub: t('chapterFlow.quizSub'),    color: 'hsl(250 60% 60%)' },
  ], [t])

  const BOX_H = 56
  const GAP = 32
  const PAD_X = 20
  const PAD_Y = 20
  // Total horizontal padding inside each box. Generous so wider fonts
  // (Plex Sans, Lora) and longer translations (Ukrainian) still breathe.
  const H_PAD = 36
  const MIN_W = 80

  // Compute dynamic widths — re-runs when the user changes font.
  const steps = useMemo(() => stepDefs.map(s => {
    const labelW = measureText(s.label, `600 15px ${sans}`)
    const subW = measureText(s.sub, `400 12px ${sans}`)
    const w = Math.max(MIN_W, Math.max(labelW, subW) + H_PAD)
    return { ...s, w }
  }), [stepDefs, sans])

  const TOTAL_W = PAD_X * 2 + steps.reduce((s, st) => s + st.w, 0) + (steps.length - 1) * GAP
  const TOTAL_H = BOX_H + PAD_Y * 2
  const CY = PAD_Y + BOX_H / 2

  // Pre-compute X positions
  const boxXs: number[] = []
  let cursor = PAD_X
  for (const step of steps) {
    boxXs.push(cursor)
    cursor += step.w + GAP
  }

  return (
    <DiagramFigure caption={t('chapterFlow.caption')}>
      <SVGDiagram
        width={TOTAL_W} height={TOTAL_H}
        style={{ maxWidth: TOTAL_W, margin: '0 auto' }}
        aria-label={t('chapterFlow.ariaLabel')}
        >
          {steps.map((step, i) => {
            const boxX = boxXs[i]
            const boxW = step.w
            const ax1 = boxX - GAP + 2
            const ax2 = boxX - 5
            const headLen = 7
            const headW = 5

            return (
              <g key={i}>
                {i > 0 && (
                  <path
                    d={[
                      `M ${ax1} ${CY}`,
                      `L ${ax2} ${CY}`,
                      `M ${ax2 - headLen} ${CY - headW}`,
                      `L ${ax2} ${CY}`,
                      `L ${ax2 - headLen} ${CY + headW}`,
                    ].join(' ')}
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                    opacity="0.3"
                  />
                )}

                <rect
                  x={boxX} y={PAD_Y}
                  width={boxW} height={BOX_H}
                  rx="10"
                  fill={step.color}
                  fillOpacity="0.12"
                  stroke={step.color}
                  strokeWidth="1.5"
                  strokeOpacity="0.5"
                />

                <text
                  x={boxX + boxW / 2}
                  y={CY - 7}
                  textAnchor="middle"
                  fontSize="15"
                  fontWeight="600"
                  fontFamily="inherit"
                  fill={step.color}
                >
                  {step.label}
                </text>

                <text
                  x={boxX + boxW / 2}
                  y={CY + 10}
                  textAnchor="middle"
                  fontSize="12"
                  fontFamily="inherit"
                  fill="currentColor"
                  opacity="0.45"
                >
                  {step.sub}
                </text>
              </g>
            )
          })}
      </SVGDiagram>
    </DiagramFigure>
  )
}
