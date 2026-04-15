/**
 * Decibel conversion helpers — three modes:
 *
 *   - 'power':   power ratio  ↔ dB     via 10·log₁₀(r)
 *   - 'voltage': voltage ratio ↔ dB    via 20·log₁₀(r)
 *   - 'dbm':     watts        ↔ dBm   via 10·log₁₀(P / 1 mW)
 *
 * The "ratio trap": a 2× change in voltage is +6 dB, but a 2× change in
 * *power* is +3 dB. They sound contradictory; the reason is that power
 * scales with voltage **squared** (P ∝ V²), so doubling V quadruples P.
 * The 20·log vs 10·log split bakes that squared relationship into the
 * formula so the dB number always corresponds to the same physical change.
 *
 * These helpers are pure — no React, no i18n, no rounding. Callers
 * decide on display precision via `formatDecimal` / `roundTo`.
 */

export type DbMode = 'power' | 'voltage' | 'dbm'

/** Convert a "natural" value (ratio for ratio modes, watts for dBm) to dB. */
export function naturalToDb(value: number, mode: DbMode): number {
  if (mode === 'voltage') return 20 * Math.log10(value)
  if (mode === 'power')   return 10 * Math.log10(value)
  // dBm: convert watts → milliwatts, then 10·log₁₀.
  return 10 * Math.log10(value / 0.001)
}

/** Convert a dB value back to its natural form (ratio or watts). */
export function dbToNatural(db: number, mode: DbMode): number {
  if (mode === 'voltage') return Math.pow(10, db / 20)
  if (mode === 'power')   return Math.pow(10, db / 10)
  // dBm → watts: 10^(dBm/10) is in milliwatts, so multiply by 1 mW.
  return 0.001 * Math.pow(10, db / 10)
}
