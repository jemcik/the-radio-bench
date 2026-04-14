/**
 * Canonical SI prefix table.
 *
 * Single source of truth for the SI multiplier prefixes used across
 * Chapter 0.3 widgets, the powers-of-10 table, and the prefix-ladder
 * diagram. If a prefix needs adding (femto, peta, etc.) do it here once.
 *
 * `nameKey` / `exampleKey` are translation keys under the chapter's i18n
 * namespace (e.g. `ch0_3.prefixPico`). Keeping them in the data lets
 * consumers derive translated strings without re-listing prefixes.
 */

export interface SIPrefix {
  /** Machine-friendly name used to build translation keys */
  name: string
  /** Unit symbol (`k`, `M`, `µ`, …). Empty string for 10⁰. */
  symbol: string
  /** Power of 10 */
  exponent: number
  /** Unicode-formatted label (e.g. `10⁻⁶`) for display */
  powerLabel: string
  /** Plain-decimal form (e.g. `0.000001`) for the powers-of-10 table */
  valueLabel: string
  /** i18n key suffix for the prefix name (full key: `ch0_3.prefix<Name>`) */
  nameKey: string
  /** i18n key suffix for the worked example (full key: `ch0_3.prefix<Name>Ex`) */
  exampleKey: string
}

export const SI_PREFIXES: SIPrefix[] = [
  { name: 'pico',  symbol: 'p', exponent: -12, powerLabel: '10⁻¹²', valueLabel: '0.000000000001',     nameKey: 'prefixPico',  exampleKey: 'prefixPicoEx'  },
  { name: 'nano',  symbol: 'n', exponent: -9,  powerLabel: '10⁻⁹',  valueLabel: '0.000000001',        nameKey: 'prefixNano',  exampleKey: 'prefixNanoEx'  },
  { name: 'micro', symbol: 'µ', exponent: -6,  powerLabel: '10⁻⁶',  valueLabel: '0.000001',           nameKey: 'prefixMicro', exampleKey: 'prefixMicroEx' },
  { name: 'milli', symbol: 'm', exponent: -3,  powerLabel: '10⁻³',  valueLabel: '0.001',              nameKey: 'prefixMilli', exampleKey: 'prefixMilliEx' },
  { name: 'none',  symbol: '',  exponent: 0,   powerLabel: '10⁰',   valueLabel: '1',                  nameKey: 'prefixNone',  exampleKey: 'prefixNoneEx'  },
  { name: 'kilo',  symbol: 'k', exponent: 3,   powerLabel: '10³',   valueLabel: '1 000',              nameKey: 'prefixKilo',  exampleKey: 'prefixKiloEx'  },
  { name: 'mega',  symbol: 'M', exponent: 6,   powerLabel: '10⁶',   valueLabel: '1 000 000',          nameKey: 'prefixMega',  exampleKey: 'prefixMegaEx'  },
  { name: 'giga',  symbol: 'G', exponent: 9,   powerLabel: '10⁹',   valueLabel: '1 000 000 000',      nameKey: 'prefixGiga',  exampleKey: 'prefixGigaEx'  },
  { name: 'tera',  symbol: 'T', exponent: 12,  powerLabel: '10¹²',  valueLabel: '1 000 000 000 000',  nameKey: 'prefixTera',  exampleKey: 'prefixTeraEx'  },
]

/** Index of the `none` (10⁰) prefix — useful as a default selection. */
export const UNITY_PREFIX_INDEX = SI_PREFIXES.findIndex(p => p.exponent === 0)
