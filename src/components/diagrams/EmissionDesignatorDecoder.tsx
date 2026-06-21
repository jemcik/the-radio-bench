/**
 * Chapter 3.2 §8 — the ITU emission designator, decoded.
 *
 *   CW  → A 1 A   (AM · keyed · Morse)
 *   SSB → J 3 E   (SSB · analogue · voice)
 *   FM  → F 3 E   (FM · analogue · voice)
 *   AM  → A 3 E   (AM · analogue · voice)
 *
 * Three character boxes per mode, colour-coded by position (1 = modulation,
 * 2 = signal, 3 = information) so the eye links each column to the legend.
 * Static snapshot — bare <svg>, fixed px = viewBox, numeric fontSize.
 *
 * hardcoded-fontsize-file-ok: decoder table with hand-tuned label sizes; the
 * designator letters (A/J/F/1/3/E) are symbolic codes, not translatable prose.
 */
import { useTranslation } from 'react-i18next'
import DiagramFigure from './DiagramFigure'
import { svgTokens } from './svgTokens'

// VB_W is sized so the longest meaning text (UA «CW» row) clears the right edge;
// MEAN_X sits just past the character boxes. Both locales fit without clipping.
const VB_W = 650
const VB_H = 234
const SANS = 'ui-sans-serif, system-ui, sans-serif'

const CHAR_X0 = 112
const CHAR_DX = 40
const BOX_W = 34
const BOX_H = 30
const MEAN_X = 248

// position → token: 1 = modulation, 2 = signal, 3 = information
const POS = [svgTokens.note, svgTokens.experiment, svgTokens.caution]

export default function EmissionDesignatorDecoder() {
  const { t } = useTranslation('ui')

  const rows = [
    { y: 50, mode: t('ch3_2.emDecoder.cwMode'), chars: ['A', '1', 'A'], mean: t('ch3_2.emDecoder.cwMean') },
    { y: 92, mode: t('ch3_2.emDecoder.ssbMode'), chars: ['J', '3', 'E'], mean: t('ch3_2.emDecoder.ssbMean') },
    { y: 134, mode: t('ch3_2.emDecoder.fmMode'), chars: ['F', '3', 'E'], mean: t('ch3_2.emDecoder.fmMean') },
    { y: 176, mode: t('ch3_2.emDecoder.amMode'), chars: ['A', '3', 'E'], mean: t('ch3_2.emDecoder.amMean') },
  ]

  const legend = [
    { x: 120, label: t('ch3_2.emDecoder.legendMod'), tone: POS[0] },
    { x: 280, label: t('ch3_2.emDecoder.legendSig'), tone: POS[1] },
    { x: 430, label: t('ch3_2.emDecoder.legendInfo'), tone: POS[2] },
  ]

  return (
    <DiagramFigure caption={t('ch3_2.emDecoder.caption')}>
      <svg
        width={VB_W}
        height={VB_H}
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        role="img"
        aria-label={t('ch3_2.emDecoder.ariaLabel')}
        style={{ display: 'block', margin: '0 auto', maxWidth: '100%', height: 'auto' }}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* column position numbers */}
        {[0, 1, 2].map(i => (
          <text key={i} x={CHAR_X0 + i * CHAR_DX + BOX_W / 2} y={26} fontSize="11.5" fontWeight={700}
            textAnchor="middle" fill={POS[i]} fontFamily={SANS}>
            {i + 1}
          </text>
        ))}

        {rows.map(r => (
          <g key={r.mode}>
            <text x={44} y={r.y + 5} fontSize="14" fontWeight={700} textAnchor="middle" fill={svgTokens.fg} fontFamily={SANS}>
              {r.mode}
            </text>
            {r.chars.map((ch, i) => (
              <g key={i}>
                <rect x={CHAR_X0 + i * CHAR_DX} y={r.y - BOX_H / 2} width={BOX_W} height={BOX_H} rx={5}
                  stroke={POS[i]} strokeWidth={1.6} fill="hsl(var(--muted))" />
                <text x={CHAR_X0 + i * CHAR_DX + BOX_W / 2} y={r.y + 6} fontSize="16" fontWeight={700}
                  textAnchor="middle" fill={POS[i]} fontFamily={SANS}>
                  {ch}
                </text>
              </g>
            ))}
            <text x={MEAN_X} y={r.y + 5} fontSize="13.5" textAnchor="start" fill={svgTokens.fg} fontFamily={SANS}>
              {r.mean}
            </text>
          </g>
        ))}

        {/* legend: colour → meaning of each position */}
        {legend.map(item => (
          <g key={item.label}>
            <rect x={item.x} y={208} width={12} height={12} rx={3} fill={item.tone} opacity={0.85} />
            <text x={item.x + 18} y={218} fontSize="12.5" textAnchor="start" fill={svgTokens.mutedFg} fontFamily={SANS}>
              {item.label}
            </text>
          </g>
        ))}
      </svg>
    </DiagramFigure>
  )
}
