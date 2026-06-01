/**
 * Chapter 2.2 §5 — from full AM to SSB, in the frequency domain.
 *
 * Three small spectra side by side:
 *   1. Full AM — tall carrier spike + lower & upper sidebands.
 *   2. DSB     — carrier removed, both sidebands remain.
 *   3. SSB     — one sideband only.
 *
 * Sidebands are drawn as wedges that are tallest next to the carrier (the
 * speech components closest to the carrier are strongest — cf. ARRL
 * Handbook 2023, Fig 11.3). A faint dashed mark shows where the carrier
 * sat once it has been removed.
 *
 * Static snapshot. Sizing per the diagram-quality skill: bare <svg>, fixed
 * px, no SVGDiagram.
 */
import { useTranslation } from 'react-i18next'
import DiagramFigure from './DiagramFigure'
import { svgTokens } from './svgTokens'

const VB_W = 560
const VB_H = 230

const BY = 160 // baseline (frequency axis) y
const CARH = 104 // carrier spike height
const GAP = 9 // carrier-to-sideband gap
const SBW = 34 // sideband width
const HIN = 74 // sideband height nearest the carrier
const HOUT = 30 // sideband height at the far edge
const HALF = 86 // half-width of each panel's baseline

const CENTERS = [VB_W / 6, VB_W / 2, (5 * VB_W) / 6]

function lsbWedge(cx: number): string {
  return `M${cx - GAP} ${BY} L${cx - GAP} ${BY - HIN} L${cx - GAP - SBW} ${BY - HOUT} L${cx - GAP - SBW} ${BY} Z`
}
function usbWedge(cx: number): string {
  return `M${cx + GAP} ${BY} L${cx + GAP} ${BY - HIN} L${cx + GAP + SBW} ${BY - HOUT} L${cx + GAP + SBW} ${BY} Z`
}

interface PanelProps {
  cx: number
  title: string
  sub: string
  showCarrier: boolean
  carrierGhost: boolean
  sidebands: 'both' | 'usb'
  /** Which sideband micro-labels to draw. Kept separate from `sidebands`
   *  so the AM panel can show both wedges but only the carrier label —
   *  otherwise the wide «carrier» label collides with LSB/USB. */
  sidebandLabels: 'none' | 'both' | 'usb'
  labels: { carrier: string; usb: string; lsb: string }
}

function Panel({ cx, title, sub, showCarrier, carrierGhost, sidebands, sidebandLabels, labels }: PanelProps) {
  return (
    <g>
      {/* title */}
      <text x={cx} y={22} fontSize="14" fontWeight={600} textAnchor="middle"
        fill={svgTokens.fg} fontFamily="ui-sans-serif, system-ui, sans-serif">
        {title}
      </text>

      {/* frequency axis with arrowhead */}
      <line x1={cx - HALF} y1={BY} x2={cx + HALF} y2={BY} stroke={svgTokens.border} strokeWidth={1} />
      <path d={`M ${cx + HALF} ${BY} l -6 -3 v 6 z`} fill={svgTokens.border} />

      {/* ghost carrier position (after removal) */}
      {carrierGhost && (
        <line x1={cx} y1={BY} x2={cx} y2={BY - CARH} stroke={svgTokens.mutedFg}
          strokeWidth={1} strokeDasharray="3 3" opacity={0.4} />
      )}

      {/* sidebands */}
      {sidebands === 'both' && (
        <path d={lsbWedge(cx)} fill={svgTokens.experiment} fillOpacity={0.4} stroke={svgTokens.experiment} strokeWidth={1.4} />
      )}
      <path d={usbWedge(cx)} fill={svgTokens.experiment} fillOpacity={0.4} stroke={svgTokens.experiment} strokeWidth={1.4} />

      {/* carrier spike */}
      {showCarrier && (
        <>
          <line x1={cx} y1={BY} x2={cx} y2={BY - CARH} stroke={svgTokens.primary} strokeWidth={3} strokeLinecap="round" />
          <circle cx={cx} cy={BY - CARH} r={3} fill={svgTokens.primary} />
        </>
      )}

      {/* micro-labels under the baseline */}
      {showCarrier && (
        <text x={cx} y={BY + 16} fontSize="13" textAnchor="middle" fill={svgTokens.primary}
          fontFamily="ui-sans-serif, system-ui, sans-serif">
          {labels.carrier}
        </text>
      )}
      {sidebandLabels === 'both' && (
        <text x={cx - GAP - SBW / 2} y={BY + 16} fontSize="13" textAnchor="middle" fill={svgTokens.experiment}
          fontFamily="ui-sans-serif, system-ui, sans-serif">
          {labels.lsb}
        </text>
      )}
      {(sidebandLabels === 'both' || sidebandLabels === 'usb') && (
        <text x={cx + GAP + SBW / 2} y={BY + 16} fontSize="13" textAnchor="middle" fill={svgTokens.experiment}
          fontFamily="ui-sans-serif, system-ui, sans-serif">
          {labels.usb}
        </text>
      )}

      {/* sub-caption */}
      <text x={cx} y={BY + 40} fontSize="13" textAnchor="middle" fill={svgTokens.mutedFg}
        fontFamily="ui-sans-serif, system-ui, sans-serif">
        {sub}
      </text>
    </g>
  )
}

export default function SsbSpectrum() {
  const { t } = useTranslation('ui')
  const labels = {
    carrier: t('ch2_2.ssbSpectrum.carrierMark'),
    usb: t('ch2_2.ssbSpectrum.usbMark'),
    lsb: t('ch2_2.ssbSpectrum.lsbMark'),
  }

  return (
    <DiagramFigure caption={t('ch2_2.ssbSpectrum.caption')}>
      <svg
        width={VB_W}
        height={VB_H}
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        role="img"
        aria-label={t('ch2_2.ssbSpectrum.ariaLabel')}
        style={{ display: 'block', margin: '0 auto', maxWidth: '100%', height: 'auto' }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <Panel
          cx={CENTERS[0]}
          title={t('ch2_2.ssbSpectrum.amTitle')}
          sub={t('ch2_2.ssbSpectrum.amSub')}
          showCarrier
          carrierGhost={false}
          sidebands="both"
          sidebandLabels="none"
          labels={labels}
        />
        <Panel
          cx={CENTERS[1]}
          title={t('ch2_2.ssbSpectrum.dsbTitle')}
          sub={t('ch2_2.ssbSpectrum.dsbSub')}
          showCarrier={false}
          carrierGhost
          sidebands="both"
          sidebandLabels="both"
          labels={labels}
        />
        <Panel
          cx={CENTERS[2]}
          title={t('ch2_2.ssbSpectrum.ssbTitle')}
          sub={t('ch2_2.ssbSpectrum.ssbSub')}
          showCarrier={false}
          carrierGhost
          sidebands="usb"
          sidebandLabels="usb"
          labels={labels}
        />

        {/* shared frequency-axis caption */}
        <text x={VB_W / 2} y={VB_H - 6} fontSize="13" textAnchor="middle" fill={svgTokens.mutedFg}
          fontFamily="ui-sans-serif, system-ui, sans-serif">
          {t('ch2_2.ssbSpectrum.freqAxis')}
        </text>
      </svg>
    </DiagramFigure>
  )
}
