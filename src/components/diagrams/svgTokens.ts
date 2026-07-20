/**
 * Theme-token shortcuts for SVG diagrams.
 *
 * Diagrams render a lot of `stroke="hsl(var(--foreground))"` and
 * `fill="hsl(var(--muted-foreground))"`. Repeating the wrapper is
 * verbose and error-prone (one typo = wrong colour); centralizing
 * the strings here keeps every diagram visually consistent and
 * makes it cheap to retune the palette.
 *
 * Use these for **structural** strokes/fills only — axes, ticks,
 * gridlines, labels, background tints. Decorative colours that
 * represent a real-world object (breadboard green, oscilloscope
 * bezel grey, prefix-segment rainbow) stay inline with a short
 * comment explaining the exemption (per CLAUDE.md).
 */

export const svgTokens = {
  /** Primary foreground — body-text equivalent inside the diagram. */
  fg: 'hsl(var(--foreground))',
  /** De-emphasized text or secondary marks. */
  mutedFg: 'hsl(var(--muted-foreground))',
  /** Hairlines, axis lines, gridlines, card outlines. */
  border: 'hsl(var(--border))',
  /** Brand accent — sparingly, for the one element that must catch the eye. */
  primary: 'hsl(var(--primary))',
  /** Schematic stroke — the canonical colour every Circuit-primitive
   *  schematic uses (set on the parent container as `text-[hsl(var(--sketch-stroke))]`,
   *  inherited by `currentColor` inside child SVGs). Slightly muted
   *  vs `fg` so dense schematic diagrams don't look like solid ink
   *  blocks. Use this in any standalone diagram that mocks a
   *  schematic without going through the `Circuit` wrapper. */
  sketchStroke: 'hsl(var(--sketch-stroke))',

  /** Font-size tokens for SVG `<text>` elements.
   *
   *  All tokens are em-based — when the SVG anchors `style={{fontSize:'1rem'}}`
   *  on the outermost `<svg>`, em units inside the SVG resolve against the
   *  document root (16 px), giving CONSTANT display-pixel size regardless
   *  of how the SVG is scaled. Without that anchor, em resolves against
   *  the SVG's own font-size (default 16, but scales with the SVG), and
   *  text grows on wider screens.
   *
   *  Established by LcResponseCurve / VnaResonanceMock / BodePlotter /
   *  VnaFilterSweepMock; the tokens here just give the convention a
   *  single source of truth so future diagrams stop hardcoding numeric
   *  fontSize values (which scale with the SVG and produce inconsistent
   *  label sizes between sibling diagrams). */
  // hardcoded-fontsize-ok: documentation example below uses literal numbers
  font: {
    /** Smallest text — axis tick labels, decade markers (~12 px). */
    tickLabel:     '0.75em',
    /** Axis labels («frequency», «magnitude (dB)») and zone labels
     *  («passband», «stopband») (~13 px). */
    axisLabel:     '0.812em',
    /** Component value labels and refdesignators inside the plot
     *  («R = 1 kΩ», «100 nF») (~13 px). */
    componentLabel: '0.812em',
    /** Schematic terminal labels (V_in / V_out / GND) — rendered by
     *  the Circuit `<TerminalLabel>` primitive at fixed pixel size 14.
     *  Listed here for completeness; Circuit primitives do not consume
     *  this token (they bake 14 px into the SVG directly), but custom
     *  schematic-style SVGs SHOULD match it. */
    terminalLabel: '0.875em',
  },
  /** Glossary term colour, useful for in-diagram labels that link to a term. */
  termAccent: 'hsl(var(--term-accent))',

  // Callout family — match the semantic tones used by <Callout> and <ResultBox>.
  /** Red — "danger" tone. Safety-critical only (ch 4.3): shock zones, live
   *  conductors, lethal stored charge. Red carries real meaning in this course
   *  — don't spend it on ordinary emphasis, or it stops meaning anything. */
  danger: 'hsl(var(--callout-danger))',
  /** Teal — used for "experiment / result" tone. */
  experiment: 'hsl(var(--callout-experiment))',
  /** Amber — "key takeaway" tone. */
  key: 'hsl(var(--callout-key))',
  /** Blue — "note / info" tone. */
  note: 'hsl(var(--callout-note))',
  /** Orange — "caution" tone. */
  caution: 'hsl(var(--callout-caution))',
  /** Purple — "on-air" tone. */
  onair: 'hsl(var(--callout-onair))',
} as const

