import { useTranslation } from 'react-i18next'
import type { SIPrefix } from './prefixes'

/**
 * Locale-aware SI labelling — the single place that decides how a prefix symbol
 * and a base unit are spelled on screen.
 *
 * WHY THIS EXISTS
 *
 * Chapter 0.3 renders SI prefixes in five places: the powers-of-10 table, the
 * prefix ladder, the prefix converter, the scientific-notation explorer, and the
 * prose. Ukrainian writes the prefix symbols in Cyrillic («4,7 кОм») while the
 * international SI symbols are Latin («4.7 kΩ»), and the chapter's own lab tells
 * the reader to check a value they will write as «4,7 кОм» against the converter.
 *
 * Fixing that per-widget is how the bug regrows. A previous pass localised the
 * prefix in `PrefixConverter` but left its `baseUnit` hardcoded to `Ω`, which
 * produced «4,7 кΩ» — a Cyrillic prefix welded to a Greek unit, in the one widget
 * the lab step points at. The same pass localised the ladder and missed
 * `SciNotationExplorer` entirely.
 *
 * So both halves live here, together, and every call site takes both from one
 * hook. Adding a locale, or a prefix, is then one edit rather than five.
 */
export function useSiLabels() {
  const { t, i18n } = useTranslation('ui')
  const isUk = i18n.language.startsWith('uk')

  return {
    /** Prefix symbol in the reader's alphabet: `k` in en, «к» in uk. */
    sym: (p: Pick<SIPrefix, 'symbol' | 'symbolUk'>) =>
      isUk && p.symbolUk ? p.symbolUk : p.symbol,

    /**
     * Both spellings when they differ — «p (п)», «µ (мк)» — and the plain
     * symbol when they do not. Use wherever the reader needs the datasheet
     * symbol AND their own: the prefix ladder and the converter's reference
     * grid both promise «both forms», and they must not drift apart.
     */
    symBoth: (p: Pick<SIPrefix, 'symbol' | 'symbolUk'>) =>
      p.symbol && p.symbolUk ? `${p.symbol} (${p.symbolUk})` : p.symbol,

    /**
     * The prefix's name on its own — «кіло», «kilo» — with the symbol stripped
     * from the `prefixName_*` value, which is «кіло (к)». The dropdowns and the
     * powers-of-ten table want the symbol spelled out there; the prefix ladder
     * and the converter's reference card already print the symbol beside the
     * name, so repeating it reads as «к / кіло (к)».
     */
    nameOnly: (p: Pick<SIPrefix, 'nameKey'>) =>
      t(`ch0_3.${p.nameKey}`).replace(/\s*\([^)]*\)\s*$/, ''),

    /**
     * Base unit in the reader's alphabet, resolved through the `units.*`
     * namespace. Pass the unit key (`ohm`, `hz`, …); the fallback is only for a
     * caller that passes a literal symbol it owns.
     */
    unit: (unitKey: string, fallback?: string) => {
      const label = t(`units.${unitKey}`, { defaultValue: '' })
      return label || fallback || unitKey
    },

    isUk,
  }
}
