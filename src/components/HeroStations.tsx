/* ────────────────────────────────────────────────────────────────────────────
 * STATION HELPERS for the Welcome page hero illustration.
 *
 * Both schematics are drawn at fixed coordinates inside a single
 * `<g transform="translate scale translate">` wrapper that re-anchors the
 * origin on the antenna mast. Coordinates inside each helper are in the
 * untransformed schematic frame, NOT the parent SVG's page pixels —
 * that's why the absolute numbers (148, 672, …) look "wrong" relative
 * to the 820×500 viewBox.
 *
 * They are plain functions returning JSX (per CLAUDE.md "Helper functions,
 * not inner components") so they don't get fresh component identity each
 * render and trip the `react-hooks/static-components` rule.
 * ──────────────────────────────────────────────────────────────────────────── */

export interface StationProps {
  c: {
    antenna: string; boxFill: string; mic: string; micText: string
    wire: string; speaker: string
  }
  /** Accent for transmitter parts (antenna pulse, schematic outline, MIX/AF/PA). */
  tx?: string
  /** Accent for receiver parts. */
  rx?: string
  /** VFO sine wave colour (one for TX, one for RX). */
  vfoTx?: string
  vfoRx?: string
  /** LC (filter) colour — shared across both stations. */
  lc: string
  /** Light/dark mode flips the TX/RX label pill background. */
  isDark: boolean
}

export function renderTxStation({ c, tx, vfoTx, lc, isDark }: StationProps) {
  return (
    /* Scaled 1.25× around the antenna, shifted left of centre. */
    <g transform="translate(110,240) scale(1.25) translate(-148,-240)">
      {/* Antenna */}
      <g stroke={c.antenna} strokeWidth={1.5} strokeLinecap="round">
        <line x1={148} y1={216} x2={148} y2={188} />
        <line x1={148} y1={188} x2={131} y2={170} />
        <line x1={148} y1={188} x2={165} y2={170} />
      </g>
      <circle cx={148} cy={188} r={4.5} fill={tx}>
        <animate attributeName="opacity" values=".4;1;.4" dur="1.4s" repeatCount="indefinite" />
      </circle>

      {/* TX schematic box */}
      <rect x={71} y={220} width={154} height={64} rx={8} fill={c.boxFill} stroke={tx} strokeWidth={1.3} />

      {/* MIC */}
      <circle cx={93} cy={256} r={5.5} fill="none" stroke={c.mic} strokeWidth={0.9} opacity={0.5} />
      <text x={93} y={270} textAnchor="middle" fontSize={5.5} fill={c.micText} opacity={0.5}>MIC</text>

      {/* AF amp */}
      <line x1={99} y1={256} x2={115} y2={256} stroke={c.wire} strokeWidth={0.8} />
      <polygon points="115,250 115,262 127,256" fill="none" stroke={tx} strokeWidth={1.2} />
      <text x={121} y={272} textAnchor="middle" fontSize={5.5} fill={tx} opacity={0.6}>AF</text>

      {/* Mixer */}
      <line x1={127} y1={256} x2={141} y2={256} stroke={c.wire} strokeWidth={0.8} />
      <circle cx={149} cy={256} r={7.5} fill="none" stroke={tx} strokeWidth={1.2} />
      <line x1={144} y1={251} x2={154} y2={261} stroke={tx} strokeWidth={1} />
      <line x1={154} y1={251} x2={144} y2={261} stroke={tx} strokeWidth={1} />
      <text x={149} y={274} textAnchor="middle" fontSize={5.5} fill={tx} opacity={0.6}>MIX</text>

      {/* VFO */}
      <line x1={149} y1={264} x2={149} y2={276} stroke={c.wire} strokeWidth={0.6} strokeDasharray="2 1.5" />
      <path
        d="M 141 277 C 144 272 148 272 151 277 C 154 282 158 282 161 277"
        fill="none" stroke={vfoTx} strokeWidth={1} strokeLinecap="round" opacity={0.6}
      />

      {/* LC filter: inductor then capacitor */}
      <line x1={157} y1={256} x2={167} y2={256} stroke={c.wire} strokeWidth={0.8} />
      <path
        d="M 167 256 a 2.8 3.8 0 0 0 5.5 0 a 2.8 3.8 0 0 0 5.5 0"
        fill="none" stroke={lc} strokeWidth={1.2} strokeLinecap="round"
      />
      <line x1={178} y1={256} x2={183} y2={256} stroke={c.wire} strokeWidth={0.8} />
      <line x1={183} y1={249} x2={183} y2={263} stroke={lc} strokeWidth={1} />
      <line x1={187} y1={249} x2={187} y2={263} stroke={lc} strokeWidth={1} />
      <line x1={187} y1={256} x2={193} y2={256} stroke={c.wire} strokeWidth={0.8} />

      {/* PA */}
      <polygon points="193,250 193,262 207,256" fill="none" stroke={tx} strokeWidth={1.3} />
      <text x={200} y={272} textAnchor="middle" fontSize={5.5} fill={tx} opacity={0.7}>PA</text>

      {/* Wire from PA up to antenna mast */}
      <line x1={207} y1={256} x2={213} y2={256} stroke={c.wire} strokeWidth={0.7} />
      <line x1={213} y1={256} x2={213} y2={226} stroke={c.wire} strokeWidth={0.7} />
      <line x1={213} y1={226} x2={148} y2={226} stroke={c.wire} strokeWidth={0.7} />
      <line x1={148} y1={226} x2={148} y2={220} stroke={c.wire} strokeWidth={0.7} />

      {/* TX label with pill background */}
      <rect x={128} y={290} width={40} height={20} rx={10} fill={c.boxFill} opacity={isDark ? 0 : 0.7} />
      <text
        x={148} y={304}
        textAnchor="middle" fontSize={14} fontWeight={700}
        fill={tx} letterSpacing={2}
      >
        TX
      </text>
    </g>
  )
}

export function renderRxStation({ c, rx, vfoRx, lc, isDark }: StationProps) {
  return (
    /* Scaled 1.25× around the antenna, shifted right of centre. */
    <g transform="translate(710,240) scale(1.25) translate(-672,-240)">
      {/* Antenna */}
      <g stroke={c.antenna} strokeWidth={1.5} strokeLinecap="round">
        <line x1={672} y1={216} x2={672} y2={188} />
        <line x1={672} y1={188} x2={655} y2={170} />
        <line x1={672} y1={188} x2={689} y2={170} />
      </g>
      <circle cx={672} cy={188} r={4.5} fill={rx}>
        <animate attributeName="opacity" values=".4;1;.4" dur="1.4s" begin=".7s" repeatCount="indefinite" />
      </circle>

      <rect x={595} y={220} width={154} height={64} rx={8} fill={c.boxFill} stroke={rx} strokeWidth={1.3} />

      {/* Wire from antenna down to RF amp */}
      <line x1={672} y1={220} x2={672} y2={226} stroke={c.wire} strokeWidth={0.7} />
      <line x1={672} y1={226} x2={607} y2={226} stroke={c.wire} strokeWidth={0.7} />
      <line x1={607} y1={226} x2={607} y2={256} stroke={c.wire} strokeWidth={0.7} />
      <line x1={607} y1={256} x2={611} y2={256} stroke={c.wire} strokeWidth={0.7} />
      {/* RF amp */}
      <polygon points="611,250 611,262 625,256" fill="none" stroke={rx} strokeWidth={1.2} />
      <text x={617} y={272} textAnchor="middle" fontSize={5.5} fill={rx} opacity={0.6}>RF</text>

      {/* Mixer */}
      <line x1={625} y1={256} x2={637} y2={256} stroke={c.wire} strokeWidth={0.8} />
      <circle cx={645} cy={256} r={7.5} fill="none" stroke={rx} strokeWidth={1.2} />
      <line x1={640} y1={251} x2={650} y2={261} stroke={rx} strokeWidth={1} />
      <line x1={650} y1={251} x2={640} y2={261} stroke={rx} strokeWidth={1} />
      <text x={645} y={274} textAnchor="middle" fontSize={5.5} fill={rx} opacity={0.6}>MIX</text>

      {/* VFO */}
      <line x1={645} y1={264} x2={645} y2={276} stroke={c.wire} strokeWidth={0.6} strokeDasharray="2 1.5" />
      <path
        d="M 637 277 C 640 272 644 272 647 277 C 650 282 654 282 657 277"
        fill="none" stroke={vfoRx} strokeWidth={1} strokeLinecap="round" opacity={0.6}
      />

      {/* IF filter: inductor then capacitor */}
      <line x1={653} y1={256} x2={663} y2={256} stroke={c.wire} strokeWidth={0.8} />
      <path
        d="M 663 256 a 2.8 3.8 0 0 0 5.5 0 a 2.8 3.8 0 0 0 5.5 0"
        fill="none" stroke={lc} strokeWidth={1.2} strokeLinecap="round"
      />
      <line x1={674} y1={256} x2={679} y2={256} stroke={c.wire} strokeWidth={0.8} />
      <line x1={679} y1={249} x2={679} y2={263} stroke={lc} strokeWidth={1} />
      <line x1={683} y1={249} x2={683} y2={263} stroke={lc} strokeWidth={1} />
      <line x1={683} y1={256} x2={695} y2={256} stroke={c.wire} strokeWidth={0.8} />

      {/* AF amp */}
      <polygon points="695,250 695,262 709,256" fill="none" stroke={rx} strokeWidth={1.2} />
      <text x={702} y={272} textAnchor="middle" fontSize={5.5} fill={rx} opacity={0.6}>AF</text>

      {/* Speaker */}
      <line x1={709} y1={256} x2={724} y2={256} stroke={c.wire} strokeWidth={0.8} />
      <polygon points="726,251 726,261 732,264 732,248" fill="none" stroke={c.speaker} strokeWidth={0.8} opacity={0.5} />
      <line x1={732} y1={248} x2={738} y2={244} stroke={c.speaker} strokeWidth={0.6} opacity={0.3} />
      <line x1={732} y1={264} x2={738} y2={268} stroke={c.speaker} strokeWidth={0.6} opacity={0.3} />

      {/* RX label with pill background */}
      <rect x={652} y={290} width={40} height={20} rx={10} fill={c.boxFill} opacity={isDark ? 0 : 0.7} />
      <text
        x={672} y={304}
        textAnchor="middle" fontSize={14} fontWeight={700}
        fill={rx} letterSpacing={2}
      >
        RX
      </text>
    </g>
  )
}
