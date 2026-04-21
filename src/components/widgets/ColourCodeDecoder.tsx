import { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Widget from '@/components/ui/widget'
import { ResultBox } from '@/components/ui/result-box'
import { useLocaleFormatter, useUnitFormatter } from '@/lib/hooks/useLocaleFormatter'
import { cn } from '@/lib/utils'

/**
 * Chapter 1.4 — Interactive resistor colour-code decoder.
 *
 * Rows of coloured chips, one per band position. Tap a chip to set that
 * band's colour; the live resistor illustration and the computed value
 * (+ tolerance + text-notation equivalent) update immediately. Works for
 * both 4-band (hobby) and 5-band (precision) standards.
 *
 * Design choices:
 * - Chip rows beat dropdowns for tactility. The whole valid palette for
 *   each band is visible and fingerable in one glance, and the colour
 *   mapping becomes obvious through repetition (after using this for ten
 *   seconds the reader has the digit colours memorised).
 * - Each band position has its OWN valid palette: digit bands skip
 *   gold/silver, multiplier bands include them, tolerance uses a short
 *   separate list. We don't try to share a master palette with
 *   disabled chips — that hides the structure.
 * - The resistor illustration is a schematic sketch (SVG), not a
 *   photoreal render: a beige body with 4 or 5 vertical coloured bands
 *   and two wire leads. The tolerance band sits slightly separated from
 *   the digit group, matching how you read a real part.
 * - Value display chooses the best SI unit automatically — 470 → "470 Ω",
 *   4700 → "4.7 kΩ", 1 000 000 → "1 MΩ".
 */

/* ── Palette — physical colour chip values ────────────────────────── */

// These are the colours printed on an actual resistor, not theme-linked.
// They must read correctly against both light and dark backgrounds, so
// every chip gets a subtle outline (border-border) in the row render.
const COLOUR_HEX: Record<string, string> = {
  black:  '#000000',
  brown:  '#6b3410',
  red:    '#c41e3a',
  orange: '#e87722',
  yellow: '#f5c518',
  green:  '#0c7734',
  blue:   '#1e4fa8',
  violet: '#6a3d9a',
  grey:   '#6f6f6f',
  white:  '#f5f5f5',
  gold:   '#c9a833',
  silver: '#a8a8a8',
  none:   'transparent',
}

/* ── Per-band-position palettes ───────────────────────────────────── */

const DIGIT_COLOURS = [
  'black', 'brown', 'red', 'orange', 'yellow',
  'green', 'blue', 'violet', 'grey', 'white',
] as const

const MULTIPLIER_COLOURS = [
  'silver', 'gold',
  'black', 'brown', 'red', 'orange', 'yellow',
  'green', 'blue', 'violet', 'grey', 'white',
] as const

const TOLERANCE_COLOURS = [
  'brown', 'red', 'green', 'blue', 'violet', 'grey',
  'gold', 'silver', 'none',
] as const

type DigitColour = typeof DIGIT_COLOURS[number]
type MultColour = typeof MULTIPLIER_COLOURS[number]
type TolColour = typeof TOLERANCE_COLOURS[number]

/* ── Mappings ─────────────────────────────────────────────────────── */

const DIGIT_VALUE: Record<DigitColour, number> = {
  black: 0, brown: 1, red: 2, orange: 3, yellow: 4,
  green: 5, blue: 6, violet: 7, grey: 8, white: 9,
}

const MULT_EXP: Record<MultColour, number> = {
  black: 0, brown: 1, red: 2, orange: 3, yellow: 4,
  green: 5, blue: 6, violet: 7, grey: 8, white: 9,
  gold: -1, silver: -2,
}

const TOL_PCT: Record<TolColour, number> = {
  brown: 1, red: 2, green: 0.5, blue: 0.25,
  violet: 0.1, grey: 0.05, gold: 5, silver: 10, none: 20,
}

/* ── Value + formatting helpers ───────────────────────────────────── */

interface Decoded {
  value: number  // resistance in ohms
  tol: number    // tolerance percentage
}

function decode4Band(d1: DigitColour, d2: DigitColour, m: MultColour, tol: TolColour): Decoded {
  const digits = DIGIT_VALUE[d1] * 10 + DIGIT_VALUE[d2]
  return { value: digits * Math.pow(10, MULT_EXP[m]), tol: TOL_PCT[tol] }
}

function decode5Band(
  d1: DigitColour, d2: DigitColour, d3: DigitColour, m: MultColour, tol: TolColour,
): Decoded {
  const digits = DIGIT_VALUE[d1] * 100 + DIGIT_VALUE[d2] * 10 + DIGIT_VALUE[d3]
  return { value: digits * Math.pow(10, MULT_EXP[m]), tol: TOL_PCT[tol] }
}

/** Auto-scale a resistance in Ω to {value, unit-key}. */
function pickResistorUnit(ohms: number): { value: number; unitKey: string } {
  if (ohms >= 1e6) return { value: ohms / 1e6, unitKey: 'mohm' }
  if (ohms >= 1e3) return { value: ohms / 1e3, unitKey: 'kohm' }
  return { value: ohms, unitKey: 'ohm' }
}

/** Compact resistor display in the active locale. Rounds to a sensible
 *  place (2 decimals for sub-1, 1 decimal for 1–100, integer for ≥100)
 *  then uses `formatNumber` to trim trailing zeros — so an exact 27 kΩ
 *  reads "27 kΩ" rather than "27.0 kΩ", while 25.65 kΩ reads "25.7 kΩ". */
function formatSigFigs(n: number, num: (v: number) => string): string {
  if (n === 0) return num(0)
  const abs = Math.abs(n)
  const places = abs < 1 ? 2 : abs < 100 ? 1 : 0
  const factor = Math.pow(10, places)
  return num(Math.round(n * factor) / factor)
}

/** Build the compact text notation used on schematics: 4700 → "4k7",
 *  2.2 → "2R2", 27000 → "27k", 0.47 → "R47". The letter serves as both
 *  the decimal point and the magnitude multiplier. */
function textNotation(ohms: number): string {
  if (ohms === 0) return '0R'
  let scale = 1
  let letter = 'R'
  if (ohms >= 1e6) { scale = 1e6; letter = 'M' }
  else if (ohms >= 1e3) { scale = 1e3; letter = 'k' }
  const v = ohms / scale
  // Integer in its scale: "10k", "27k", "470R".
  if (Math.abs(v - Math.round(v)) < 1e-9) {
    return `${Math.round(v)}${letter}`
  }
  // Sub-unit in its scale: "R47" for 0.47 Ω.
  if (v < 1) {
    const hundredths = Math.round(v * 100)
    return `${letter}${hundredths}`
  }
  // Normal fractional: one digit after the letter. 4k7, 2R2, 1M2.
  const whole = Math.floor(v)
  const frac = Math.round((v - whole) * 10)
  return `${whole}${letter}${frac}`
}

/* ── Colour-chip row ──────────────────────────────────────────────── */

interface ChipRowProps {
  label: string
  palette: readonly string[]
  selected: string
  onSelect: (c: string) => void
  colourName: (k: string) => string
}

function ChipRow({ label, palette, selected, onSelect, colourName }: ChipRowProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      <span className="text-muted-foreground shrink-0 w-24">{label}</span>
      <div className="flex flex-wrap gap-1.5">
        {palette.map(c => {
          const isSel = c === selected
          return (
            <button
              key={c}
              type="button"
              aria-label={colourName(c)}
              aria-pressed={isSel}
              onClick={() => onSelect(c)}
              title={colourName(c)}
              className={cn(
                'w-7 h-7 rounded border transition-shadow',
                isSel
                  ? 'border-primary ring-2 ring-primary ring-offset-1 ring-offset-background'
                  : 'border-border hover:border-foreground/40',
                c === 'none' && 'bg-[repeating-linear-gradient(45deg,hsl(var(--muted))_0px,hsl(var(--muted))_3px,transparent_3px,transparent_6px)]',
              )}
              style={{
                backgroundColor: c === 'none' ? undefined : COLOUR_HEX[c],
              }}
            />
          )
        })}
      </div>
    </div>
  )
}

/* ── Resistor illustration ────────────────────────────────────────── */

interface ResistorDrawingProps {
  mode: 4 | 5
  d1: string
  d2: string
  d3: string
  mult: string
  tol: string
  ariaLabel: string
}

function ResistorDrawing({ mode, d1, d2, d3, mult, tol, ariaLabel }: ResistorDrawingProps) {
  const VB_W = 320
  const VB_H = 100
  const BODY_X = 70
  const BODY_Y = 28
  const BODY_W = 180
  const BODY_H = 44
  const LEAD_Y = BODY_Y + BODY_H / 2

  // Digit-group bands sit in the left two-thirds of the body; tolerance
  // band is pushed to the right, with visible breathing room from the
  // last digit band — that's how you read a real part.
  const DIGIT_GROUP_X = BODY_X + 16
  const DIGIT_GROUP_W = 96   // space for up to 4 bands (3 digits + mult)
  const BAND_W = 12
  const TOL_BAND_X = BODY_X + BODY_W - 24

  const digitBandCount = mode === 4 ? 3 : 4  // digits + multiplier
  const digitGap = (DIGIT_GROUP_W - digitBandCount * BAND_W) / (digitBandCount - 1)
  const digitBands: { x: number; colour: string }[] = []
  if (mode === 4) {
    digitBands.push({ x: DIGIT_GROUP_X + 0 * (BAND_W + digitGap), colour: d1 })
    digitBands.push({ x: DIGIT_GROUP_X + 1 * (BAND_W + digitGap), colour: d2 })
    digitBands.push({ x: DIGIT_GROUP_X + 2 * (BAND_W + digitGap), colour: mult })
  } else {
    digitBands.push({ x: DIGIT_GROUP_X + 0 * (BAND_W + digitGap), colour: d1 })
    digitBands.push({ x: DIGIT_GROUP_X + 1 * (BAND_W + digitGap), colour: d2 })
    digitBands.push({ x: DIGIT_GROUP_X + 2 * (BAND_W + digitGap), colour: d3 })
    digitBands.push({ x: DIGIT_GROUP_X + 3 * (BAND_W + digitGap), colour: mult })
  }

  return (
    <div className="rounded-lg border border-border bg-card/60 p-3">
      <svg
        width="100%"
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        role="img"
        aria-label={ariaLabel}
        style={{ display: 'block', maxWidth: 420 }}
      >
        {/* Wire leads */}
        <line
          x1={10} y1={LEAD_Y} x2={BODY_X} y2={LEAD_Y}
          stroke="hsl(var(--muted-foreground))"
          strokeWidth={2} strokeLinecap="round"
        />
        <line
          x1={BODY_X + BODY_W} y1={LEAD_Y} x2={VB_W - 10} y2={LEAD_Y}
          stroke="hsl(var(--muted-foreground))"
          strokeWidth={2} strokeLinecap="round"
        />

        {/* Body — rounded beige cylinder (schematic style). Fill is a
            warm off-white that works in both themes; a thin outline
            gives it an edge in dark mode. */}
        <rect
          x={BODY_X} y={BODY_Y} width={BODY_W} height={BODY_H}
          rx={12}
          fill="#e8d9b8"
          stroke="hsl(var(--border))"
          strokeWidth={1}
        />

        {/* Bands — digit group */}
        {digitBands.map((b, i) => (
          <rect
            key={`d${i}`}
            x={b.x} y={BODY_Y} width={BAND_W} height={BODY_H}
            fill={COLOUR_HEX[b.colour] ?? '#999'}
            stroke={b.colour === 'white' || b.colour === 'yellow' ? 'rgba(0,0,0,0.25)' : 'none'}
            strokeWidth={0.5}
          />
        ))}

        {/* Tolerance band — shifted right with breathing room */}
        {tol !== 'none' && (
          <rect
            x={TOL_BAND_X} y={BODY_Y} width={BAND_W} height={BODY_H}
            fill={COLOUR_HEX[tol] ?? '#999'}
            stroke={tol === 'white' || tol === 'yellow' ? 'rgba(0,0,0,0.25)' : 'none'}
            strokeWidth={0.5}
          />
        )}
      </svg>
    </div>
  )
}

/* ── Main component ──────────────────────────────────────────────── */

export default function ColourCodeDecoder() {
  const { t } = useTranslation('ui')
  const { num } = useLocaleFormatter()
  const tUnit = useUnitFormatter()

  const colourName = useCallback(
    (k: string) => t(`ch1_4.widget.colour.colour${k.charAt(0).toUpperCase() + k.slice(1)}`),
    [t],
  )

  // Default: the worked-example value from the chapter prose — 27 kΩ ±5 %.
  const [mode, setMode] = useState<4 | 5>(4)
  const [d1, setD1] = useState<DigitColour>('red')
  const [d2, setD2] = useState<DigitColour>('violet')
  const [d3, setD3] = useState<DigitColour>('black')
  const [mult, setMult] = useState<MultColour>('orange')
  const [tol, setTol] = useState<TolColour>('gold')

  const decoded = useMemo<Decoded>(() => {
    return mode === 4
      ? decode4Band(d1, d2, mult, tol)
      : decode5Band(d1, d2, d3, mult, tol)
  }, [mode, d1, d2, d3, mult, tol])

  const { value: displayVal, unitKey } = pickResistorUnit(decoded.value)
  const valueStr = `${formatSigFigs(displayVal, num)} ${tUnit(unitKey)}`
  // num() trims trailing zeros so 5 → "5 %", 0.5 → "0.5 %", 0.25 → "0.25 %".
  const tolStr = `±${num(decoded.tol)} %`
  const notation = textNotation(decoded.value)

  const lo = decoded.value * (1 - decoded.tol / 100)
  const hi = decoded.value * (1 + decoded.tol / 100)
  const loDisp = pickResistorUnit(lo)
  const hiDisp = pickResistorUnit(hi)
  const rangeStr = `${formatSigFigs(loDisp.value, num)} ${tUnit(loDisp.unitKey)} … ${formatSigFigs(hiDisp.value, num)} ${tUnit(hiDisp.unitKey)}`

  const ariaLabel = t('ch1_4.widget.colour.description') + ' ' + valueStr + ' ' + tolStr

  return (
    <Widget
      title={t('ch1_4.widget.colour.title')}
      description={t('ch1_4.widget.colour.description')}
    >
      {/* ── Band count toggle ─────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <span className="text-muted-foreground w-24">
          {t('ch1_4.widget.colour.bandCountLabel')}
        </span>
        <div className="flex gap-1 rounded-md border border-border bg-background p-0.5">
          {([4, 5] as const).map(m => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={cn(
                'px-3 py-1 rounded text-sm transition-colors',
                mode === m
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {m === 4 ? t('ch1_4.widget.colour.fourBand') : t('ch1_4.widget.colour.fiveBand')}
            </button>
          ))}
        </div>
      </div>

      {/* ── Resistor visual ──────────────────────────────────────── */}
      <ResistorDrawing
        mode={mode}
        d1={d1} d2={d2} d3={d3} mult={mult} tol={tol}
        ariaLabel={ariaLabel}
      />

      {/* ── Band pickers ─────────────────────────────────────────── */}
      <div className="space-y-2">
        <ChipRow
          label={t('ch1_4.widget.colour.bandLabelDigit1')}
          palette={DIGIT_COLOURS}
          selected={d1}
          onSelect={c => setD1(c as DigitColour)}
          colourName={colourName}
        />
        <ChipRow
          label={t('ch1_4.widget.colour.bandLabelDigit2')}
          palette={DIGIT_COLOURS}
          selected={d2}
          onSelect={c => setD2(c as DigitColour)}
          colourName={colourName}
        />
        {mode === 5 && (
          <ChipRow
            label={t('ch1_4.widget.colour.bandLabelDigit3')}
            palette={DIGIT_COLOURS}
            selected={d3}
            onSelect={c => setD3(c as DigitColour)}
            colourName={colourName}
          />
        )}
        <ChipRow
          label={t('ch1_4.widget.colour.bandLabelMultiplier')}
          palette={MULTIPLIER_COLOURS}
          selected={mult}
          onSelect={c => setMult(c as MultColour)}
          colourName={colourName}
        />
        <ChipRow
          label={t('ch1_4.widget.colour.bandLabelTolerance')}
          palette={TOLERANCE_COLOURS}
          selected={tol}
          onSelect={c => setTol(c as TolColour)}
          colourName={colourName}
        />
      </div>

      {/* ── Readouts ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <ResultBox tone="success" label={t('ch1_4.widget.colour.valueLabel')}>
          <p className="text-xl font-mono font-semibold text-foreground">{valueStr}</p>
        </ResultBox>
        <ResultBox tone="info" label={t('ch1_4.widget.colour.toleranceLabel')}>
          <p className="text-xl font-mono font-semibold text-foreground">{tolStr}</p>
        </ResultBox>
        <ResultBox tone="muted" label={t('ch1_4.widget.colour.notationLabel')}>
          <p className="text-xl font-mono font-semibold text-foreground">{notation}</p>
        </ResultBox>
      </div>

      <ResultBox tone="muted" label={t('ch1_4.widget.colour.rangeLabel')}>
        <p className="text-sm font-mono text-foreground">{rangeStr}</p>
      </ResultBox>

      <p className="text-[13px] text-muted-foreground">
        {t('ch1_4.widget.colour.hint')}
      </p>
    </Widget>
  )
}
