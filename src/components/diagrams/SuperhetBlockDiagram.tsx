/**
 * Chapter 3.1 §4 — the analog superheterodyne receiver, stage by stage.
 *
 * Interactive block diagram (NOT a circuit schematic): the signal path runs
 * antenna → RF amp → mixer → IF amp → detector → AF amp → speaker, with the
 * local oscillator feeding the mixer, the BFO feeding the detector, squelch
 * gating the AF amp, and a power supply across the bottom. Tap any block to
 * read what that stage does.
 *
 * Static layout, fixed px = viewBox, numeric fontSize, per the diagram-quality
 * skill. The only state is which block is selected; descriptions render in an
 * HTML panel below the SVG via <Trans> (dynamic i18nKey) so glossary terms and
 * <strong> markup render correctly.
 */
import { useState, type KeyboardEvent } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { G } from '@/features/glossary/glossary-term'
import DiagramFigure from './DiagramFigure'
import { svgTokens } from './svgTokens'

const VB_W = 720
const VB_H = 300
const SANS = 'ui-sans-serif, system-ui, sans-serif'

const ANT_X = 30
const SPK_X = 678
const TOP_CY = 70

interface Stage {
  key: string
  x: number
  y: number
  w: number
  h: number
  name: string
  sub?: string
}

/** Glossary + emphasis map for the description panel. */
const descComponents = {
  strong: <strong />,
  em: <em />,
  sens: <G k="sensitivity" />,
  mixer: <G k="mixer" />,
  lo: <G k="local oscillator" />,
  osc: <G k="oscillator" />,
  vfo: <G k="vfo" />,
  crysosc: <G k="crystal oscillator" />,
  intf: <G k="intermediate frequency" />,
  sel: <G k="selectivity" />,
  det: <G k="detector" />,
  bfo: <G k="bfo" />,
  cw: <G k="cw" />,
  ssb: <G k="ssb" />,
  squelch: <G k="squelch" />,
}

export default function SuperhetBlockDiagram() {
  const { t } = useTranslation('ui')
  const [selected, setSelected] = useState<string | null>(null)

  const stages: Stage[] = [
    { key: 'rf', x: 60, y: 47, w: 92, h: 46, name: t('ch3_1.superhet.rfName'), sub: t('ch3_1.superhet.rfSub') },
    { key: 'mixer', x: 182, y: 47, w: 78, h: 46, name: t('ch3_1.superhet.mixerName') },
    { key: 'if', x: 290, y: 47, w: 92, h: 46, name: t('ch3_1.superhet.ifName'), sub: t('ch3_1.superhet.ifSub') },
    { key: 'det', x: 412, y: 47, w: 92, h: 46, name: t('ch3_1.superhet.detName') },
    { key: 'af', x: 534, y: 47, w: 92, h: 46, name: t('ch3_1.superhet.afName'), sub: t('ch3_1.superhet.afSub') },
    // wider than the others: the UA sub «(налаштування)» needs the room (centre stays at 221)
    { key: 'lo', x: 161, y: 150, w: 120, h: 42, name: t('ch3_1.superhet.loName'), sub: t('ch3_1.superhet.loSub') },
    { key: 'bfo', x: 412, y: 150, w: 92, h: 42, name: t('ch3_1.superhet.bfoName') },
    { key: 'squelch', x: 534, y: 150, w: 92, h: 42, name: t('ch3_1.superhet.squelchName') },
    { key: 'ps', x: 60, y: 234, w: 566, h: 40, name: t('ch3_1.superhet.psName') },
  ]

  const onKey = (e: KeyboardEvent, key: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      setSelected(key)
    }
  }

  function renderStage(s: Stage) {
    const isSel = selected === s.key
    const cy = s.y + s.h / 2
    // outline:none on the <g> removes the browser's square blue focus ring (its corners
    // don't match the rx-6 boxes); the selected-state rect highlight is the indicator.
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
          x={s.x}
          y={s.y}
          width={s.w}
          height={s.h}
          rx={6}
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

  /** Horizontal signal-path arrow ending at toX (arrowhead points right). */
  function hArrow(fromX: number, toX: number, color: string, w = 1.8) {
    return (
      <>
        <line x1={fromX} y1={TOP_CY} x2={toX} y2={TOP_CY} stroke={color} strokeWidth={w} />
        <path d={`M ${toX} ${TOP_CY} l -8 -4 v 8 z`} fill={color} />
      </>
    )
  }

  /** Vertical oscillator/squelch feed, pointing up into the top row at x. */
  function vArrowUp(x: number, fromY: number, toY: number) {
    return (
      <>
        <line x1={x} y1={fromY} x2={x} y2={toY} stroke={svgTokens.fg} strokeWidth={1.6} />
        <path d={`M ${x} ${toY} l -4 8 h 8 z`} fill={svgTokens.fg} />
      </>
    )
  }

  return (
    <DiagramFigure caption={t('ch3_1.superhet.caption')}>
      <svg
        width={VB_W}
        height={VB_H}
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        role="img"
        aria-label={t('ch3_1.superhet.ariaLabel')}
        style={{ display: 'block', margin: '0 auto', maxWidth: '100%', height: 'auto' }}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* ── Power-supply feed: dim dashed links from the supply up to the stages
              directly above it (osc row). Both ends touch a block — no dangling stubs. ── */}
        <g opacity={0.4}>
          {[221, 458, 580].map(x => (
            <line key={x} x1={x} y1={234} x2={x} y2={192} stroke={svgTokens.mutedFg} strokeWidth={1.2} strokeDasharray="4 3" />
          ))}
        </g>

        {/* ── Antenna — aerial: mast + two arms (matches @/lib/circuit Antenna) ── */}
        <path
          d={`M ${ANT_X} ${TOP_CY} V ${TOP_CY - 36} M ${ANT_X} ${TOP_CY - 22} L ${ANT_X - 13} ${TOP_CY - 36} M ${ANT_X} ${TOP_CY - 22} L ${ANT_X + 13} ${TOP_CY - 36}`}
          stroke={svgTokens.fg} strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <text x={ANT_X} y={TOP_CY + 42} fontSize="12.5" textAnchor="middle" fill={svgTokens.mutedFg} fontFamily={SANS}>
          {t('ch3_1.superhet.antenna')}
        </text>

        {/* ── Signal-path arrows ───────────────────────────────────── */}
        {hArrow(ANT_X, 54, svgTokens.fg)}
        {hArrow(152, 176, svgTokens.fg)}
        {hArrow(260, 284, svgTokens.fg)}
        {hArrow(382, 406, svgTokens.fg)}
        {hArrow(504, 528, svgTokens.fg)}
        {hArrow(626, SPK_X - 14, svgTokens.primary, 2.2)}

        {/* ── Oscillator / squelch feeds ───────────────────────────── */}
        {vArrowUp(221, 150, 95)}
        {vArrowUp(458, 150, 95)}
        {vArrowUp(580, 150, 95)}

        {/* ── "front end" label under antenna→mixer ────────────────── */}
        <text x={150} y={116} fontSize="12" fontStyle="italic" textAnchor="middle" fill={svgTokens.mutedFg} fontFamily={SANS}>
          {t('ch3_1.superhet.frontEnd')}
        </text>

        {/* ── Speaker glyph ────────────────────────────────────────── */}
        <path d={`M ${SPK_X - 4} ${TOP_CY - 7} h -10 v 14 h 10 z M ${SPK_X - 4} ${TOP_CY - 7} L ${SPK_X + 10} ${TOP_CY - 16} v 32 L ${SPK_X - 4} ${TOP_CY + 7} z`}
          stroke={svgTokens.fg} strokeWidth={1.6} fill="hsl(var(--muted))" strokeLinejoin="round" />
        {[9, 16].map(r => (
          <path key={r} d={`M ${SPK_X + 16} ${TOP_CY - r * 0.7} A ${r} ${r} 0 0 1 ${SPK_X + 16} ${TOP_CY + r * 0.7}`}
            stroke={svgTokens.primary} strokeWidth={1.3} opacity={0.5} fill="none" />
        ))}
        <text x={SPK_X} y={TOP_CY + 42} fontSize="12.5" textAnchor="middle" fill={svgTokens.mutedFg} fontFamily={SANS}>
          {t('ch3_1.superhet.speaker')}
        </text>

        {/* ── The clickable stage blocks ───────────────────────────── */}
        {stages.map(renderStage)}
      </svg>

      {/* ── Hint + description panel ───────────────────────────────── */}
      <p className="mt-1 text-center text-[13px] text-muted-foreground">
        {t('ch3_1.superhet.clickHint')}
      </p>
      <div className="mt-2 rounded-lg border border-border bg-muted/40 p-3 text-sm text-foreground min-h-[5rem]">
        {selected ? (
          <Trans i18nKey={`ch3_1.superhet.${selected}Desc`} ns="ui" components={descComponents} />
        ) : (
          <span className="text-muted-foreground">{t('ch3_1.superhet.selectPrompt')}</span>
        )}
      </div>
    </DiagramFigure>
  )
}
