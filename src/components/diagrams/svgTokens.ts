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
  /** Glossary term colour, useful for in-diagram labels that link to a term. */
  termAccent: 'hsl(var(--term-accent))',

  // Callout family — match the semantic tones used by <Callout> and <ResultBox>.
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

