/**
 * Chapter 3.2 §7 — the transmitter, stage by stage, in TWO clean architectures.
 *
 * variant="ssb"  (heterodyne up-conversion):
 *   carrier osc → buffer → modulator(← mic) → mixer(← VFO) → driver → PA → LPF → antenna
 *   The carrier oscillator hands the MODULATOR a fixed carrier; the modulator folds
 *   the message onto it; the MIXER heterodynes the result up to the operating
 *   frequency using a separate VFO.
 *
 * variant="cwfm"  (direct, with a frequency multiplier):
 *   [mic/key →] oscillator → buffer → multiplier → driver → PA → LPF → antenna
 *   No modulator block and no mixer: CW just keys the carrier on/off and FM nudges
 *   the OSCILLATOR's frequency, so the message acts at the oscillator (mic/key → osc).
 *   The multiplier raises a low, steady crystal up to VHF — an SSB signal could not
 *   survive that, which is exactly why SSB uses the up-converter above instead.
 *
 * Interactive: tap any block to read what it does (per-instance description panel).
 *
 * hardcoded-fontsize-file-ok: block diagram with hand-tuned label sizes in
 * user-space units. No SVGDiagram wrapper.
 */
import { useState, type KeyboardEvent } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { G } from '@/features/glossary/glossary-term'
import DiagramFigure from './DiagramFigure'
import { svgTokens } from './svgTokens'

const VB_W = 800
const VB_H = 180
const SANS = 'ui-sans-serif, system-ui, sans-serif'
const CY = 62           // centre-line of the main signal row
const MAIN_TOP = 40
const MAIN_BOT = 84
const FEED_TOP = 124    // top of the input row (mic / VFO)
const ANT_X = 768

interface Stage {
  key: string
  x: number
  y: number
  w: number
  h: number
  name: string
  sub?: string
}

const descComponents = {
  strong: <strong />,
  em: <em />,
  osc: <G k="oscillator" />,
  carrier: <G k="carrier" />,
  crysosc: <G k="crystal oscillator" />,
  vfo: <G k="vfo" />,
  mixer: <G k="mixer" />,
  pa: <G k="power amplifier" />,
  filt: <G k="filter" />,
  cw: <G k="cw" />,
  ssb: <G k="ssb" />,
  fm: <G k="fm" />,
  vhf: <G k="vhf" />,
  uhf: <G k="uhf" />,
  intf: <G k="intermediate frequency" />,
}

export default function TxBlockDiagram({ variant = 'ssb' }: { variant?: 'ssb' | 'cwfm' }) {
  const { t } = useTranslation('ui')
  const [selected, setSelected] = useState<string | null>(null)

  const B = (key: string, x: number, w: number, name: string, sub?: string): Stage =>
    ({ key, x, y: MAIN_TOP, w, h: 44, name, sub })

  const ssbStages: Stage[] = [
    B('osc', 22, 92, t('ch3_2.txBlocks.oscName'), t('ch3_2.txBlocks.oscSub')),
    B('buffer', 134, 66, t('ch3_2.txBlocks.bufferName')),
    B('mod', 220, 98, t('ch3_2.txBlocks.modName'), t('ch3_2.txBlocks.modSub')),
    B('mixer', 338, 84, t('ch3_2.txBlocks.mixerName')),
    B('driver', 442, 80, t('ch3_2.txBlocks.driverName')),
    B('pa', 542, 80, t('ch3_2.txBlocks.paName'), t('ch3_2.txBlocks.paSub')),
    B('filter', 642, 92, t('ch3_2.txBlocks.filterName'), t('ch3_2.txBlocks.filterSub')),
    { key: 'mic', x: 209, y: FEED_TOP, w: 120, h: 42, name: t('ch3_2.txBlocks.micName') },
    { key: 'vfo', x: 338, y: FEED_TOP, w: 84, h: 42, name: t('ch3_2.txBlocks.vfoName') },
  ]

  const cwfmStages: Stage[] = [
    B('osc', 52, 92, t('ch3_2.txBlocks.oscName'), t('ch3_2.txBlocks.oscSub')),
    B('buffer', 174, 66, t('ch3_2.txBlocks.bufferName')),
    B('mult', 270, 96, t('ch3_2.txBlocks.multName'), t('ch3_2.txBlocks.multSub')),
    B('driver', 396, 80, t('ch3_2.txBlocks.driverName')),
    B('pa', 506, 80, t('ch3_2.txBlocks.paName'), t('ch3_2.txBlocks.paSub')),
    B('filter', 616, 92, t('ch3_2.txBlocks.filterName'), t('ch3_2.txBlocks.filterSub')),
    { key: 'mic', x: 38, y: FEED_TOP, w: 120, h: 42, name: t('ch3_2.txBlocks.micName') },
  ]

  const isSsb = variant === 'ssb'
  const stages = isSsb ? ssbStages : cwfmStages
  const caption = t(isSsb ? 'ch3_2.txBlocks.ssbCaption' : 'ch3_2.txBlocks.cwfmCaption')
  const ariaLabel = t(isSsb ? 'ch3_2.txBlocks.ssbAria' : 'ch3_2.txBlocks.cwfmAria')

  const onKey = (e: KeyboardEvent, key: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      setSelected(key)
    }
  }

  function renderStage(s: Stage) {
    const isSel = selected === s.key
    const cy = s.y + s.h / 2
    return (
      <g
        key={s.key}
        role="button"
        tabIndex={0}
        aria-pressed={isSel}
        aria-label={s.name}
        style={{ cursor: 'pointer', outline: 'none' }}
        onClick={() => setSelected(s.key)}
        onKeyDown={e => onKey(e, s.key)}
      >
        <rect
          x={s.x} y={s.y} width={s.w} height={s.h} rx={6}
          stroke={isSel ? svgTokens.primary : svgTokens.fg}
          strokeWidth={isSel ? 2.6 : 1.6}
          fill={isSel ? 'hsl(var(--primary) / 0.10)' : 'hsl(var(--muted))'}
        />
        {s.sub ? (
          <>
            <text x={s.x + s.w / 2} y={cy - 1} fontSize="13.5" fontWeight={600} textAnchor="middle" fill={svgTokens.fg} fontFamily={SANS}>
              {s.name}
            </text>
            <text x={s.x + s.w / 2} y={cy + 13} fontSize="11.5" textAnchor="middle" fill={svgTokens.mutedFg} fontFamily={SANS}>
              {s.sub}
            </text>
          </>
        ) : (
          <text x={s.x + s.w / 2} y={cy + 5} fontSize="13.5" fontWeight={600} textAnchor="middle" fill={svgTokens.fg} fontFamily={SANS}>
            {s.name}
          </text>
        )}
      </g>
    )
  }

  /** Horizontal arrow to toX; line stops at the arrowhead base so a thick stroke
   *  can't poke through the triangle's point. */
  function hArrow(fromX: number, toX: number, color: string, w = 1.8) {
    return (
      <>
        <line x1={fromX} y1={CY} x2={toX - 7} y2={CY} stroke={color} strokeWidth={w} />
        <path d={`M ${toX} ${CY} l -8 -4 v 8 z`} fill={color} />
      </>
    )
  }

  /** Vertical arrow pointing UP into a block bottom at (x, MAIN_BOT). */
  function vArrowUp(x: number) {
    return (
      <>
        <line x1={x} y1={FEED_TOP} x2={x} y2={MAIN_BOT + 7} stroke={svgTokens.fg} strokeWidth={1.8} />
        <path d={`M ${x} ${MAIN_BOT} l -4 8 h 8 z`} fill={svgTokens.fg} />
      </>
    )
  }

  return (
    <DiagramFigure caption={caption}>
      <svg
        width={VB_W}
        height={VB_H}
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        role="img"
        aria-label={ariaLabel}
        style={{ display: 'block', margin: '0 auto', maxWidth: '100%', height: 'auto' }}
        xmlns="http://www.w3.org/2000/svg"
      >
        {isSsb ? (
          <>
            {hArrow(114, 134, svgTokens.fg)}
            {hArrow(200, 220, svgTokens.fg)}
            {hArrow(318, 338, svgTokens.fg)}
            {hArrow(422, 442, svgTokens.fg)}
            {hArrow(522, 542, svgTokens.fg)}
            {hArrow(622, 642, svgTokens.fg)}
            {hArrow(734, ANT_X - 14, svgTokens.primary, 2.2)}
            {vArrowUp(269)}
            {vArrowUp(380)}
          </>
        ) : (
          <>
            {hArrow(144, 174, svgTokens.fg)}
            {hArrow(240, 270, svgTokens.fg)}
            {hArrow(366, 396, svgTokens.fg)}
            {hArrow(476, 506, svgTokens.fg)}
            {hArrow(586, 616, svgTokens.fg)}
            {hArrow(708, ANT_X - 14, svgTokens.primary, 2.2)}
            {vArrowUp(98)}
          </>
        )}

        {/* ── Transmitting antenna: mast + radiating arcs ── */}
        <line x1={ANT_X} y1={CY} x2={ANT_X} y2={CY - 36} stroke={svgTokens.fg} strokeWidth={2.4} strokeLinecap="round" />
        <circle cx={ANT_X} cy={CY - 36} r={2.2} fill={svgTokens.fg} />
        {[10, 19].map((r, i) => {
          const a0 = -78 * Math.PI / 180, a1 = 8 * Math.PI / 180
          const cx = ANT_X, cy = CY - 36
          const x0 = cx + r * Math.cos(a0), y0 = cy + r * Math.sin(a0)
          const x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1)
          return <path key={r} d={`M ${x0.toFixed(1)} ${y0.toFixed(1)} A ${r} ${r} 0 0 1 ${x1.toFixed(1)} ${y1.toFixed(1)}`}
            stroke={svgTokens.primary} strokeWidth={i === 0 ? 2 : 1.6} opacity={i === 0 ? 0.9 : 0.55} fill="none" strokeLinecap="round" />
        })}
        <text x={ANT_X} y={CY + 34} fontSize="12.5" textAnchor="middle" fill={svgTokens.mutedFg} fontFamily={SANS}>
          {t('ch3_2.txBlocks.antenna')}
        </text>

        {/* ── The clickable stage blocks ── */}
        {stages.map(renderStage)}
      </svg>

      {/* ── Hint + description panel ── */}
      <p className="mt-1 text-center text-[13px] text-muted-foreground">
        {t('ch3_2.txBlocks.clickHint')}
      </p>
      <div className="mt-2 rounded-lg border border-border bg-muted/40 p-3 text-sm text-foreground min-h-[5rem]">
        {selected ? (
          <Trans i18nKey={`ch3_2.txBlocks.${selected}Desc`} ns="ui" components={descComponents} />
        ) : (
          <span className="text-muted-foreground">{t('ch3_2.txBlocks.selectPrompt')}</span>
        )}
      </div>
    </DiagramFigure>
  )
}
