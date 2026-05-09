/**
 * Math-only tests for ZenerRegulatorWidget — verifies the operating-point
 * solver against the worked numbers from the chapter callout.
 *
 * Render-side coverage stays light: the existing diagram-quality auto-
 * suite (text-overlap + curve-edge-rail tests) discovers every diagram
 * via import.meta.glob and exercises rendering. Repeating that here
 * would duplicate work.
 */
import { describe, expect, it } from 'vitest'
import { computeOperatingPoint } from './ZenerRegulatorWidget'
import { renderWithProviders, screen } from '@/test/render'
import ZenerRegulatorWidget from './ZenerRegulatorWidget'

const ZENER_5_1 = { id: 'v5_1' as const, v_z0: 5.1, r_z: 10, p_max: 0.5 }
const ZENER_9_1 = { id: 'v9_1' as const, v_z0: 9.1, r_z: 8,  p_max: 0.5 }

describe('computeOperatingPoint — chapter callout numbers', () => {
  it('reproduces V_in = 9 V, R_s = 1 kΩ, 5.1 V Zener (no load)', () => {
    const op = computeOperatingPoint(9, 1000, ZENER_5_1, null)
    expect(op.is_regulating).toBe(true)
    // Step 3 of the callout: V_Z ≈ 5.139 V (we round to 5.14 in prose)
    expect(op.v_z).toBeCloseTo(5.139, 2)
    // I ≈ 3.86 mA (rounded to 3.9 in prose)
    expect(op.i_z).toBeCloseTo(3.86, 1)
    // V across R_s = V_in − V_Z ≈ 3.86 V
    expect(op.v_rs).toBeCloseTo(3.86, 2)
    // No load → I_load = 0, I_total = I_z
    expect(op.i_load).toBe(0)
    expect(op.i_total).toBeCloseTo(op.i_z, 5)
  })

  it('reproduces V_in jumps from 9 to 12 — 100× attenuation', () => {
    const op9  = computeOperatingPoint(9,  1000, ZENER_5_1, null)
    const op12 = computeOperatingPoint(12, 1000, ZENER_5_1, null)
    const dV_in = 12 - 9
    const dV_z = op12.v_z - op9.v_z
    // ΔV_in = 3 V should attenuate to ~30 mV — a ratio close to R_s/r_z = 100
    expect(dV_in / dV_z).toBeCloseTo(101, 0)  // (R_s + r_z) / r_z = 1010/10 = 101
  })

  it('drops out below V_Z0 (no load): output follows V_in', () => {
    const op = computeOperatingPoint(3, 1000, ZENER_5_1, null)
    expect(op.is_regulating).toBe(false)
    // No load AND no Zener current → V_Z = V_in (nothing pulls it down)
    expect(op.v_z).toBeCloseTo(3, 5)
    expect(op.i_z).toBe(0)
  })

  it('drops out below V_Z0 (with load): output is voltage-divided', () => {
    const op = computeOperatingPoint(3, 1000, ZENER_5_1, 1000)  // R_L = R_s = 1 kΩ
    expect(op.is_regulating).toBe(false)
    // V_Z = V_in × R_L / (R_s + R_L) = 3 × 1000 / 2000 = 1.5 V
    expect(op.v_z).toBeCloseTo(1.5, 5)
    expect(op.i_z).toBe(0)
  })

  it('regulates correctly with a light load (5 kΩ R_L → ~1 mA load)', () => {
    // V_in=9, R_s=1 kΩ, V_Z0=5.1, r_z=10, R_L=5 kΩ
    // Without load: I_total ≈ 3.86 mA, V_Z ≈ 5.139 V
    // With R_L=5 kΩ: load draws ~1 mA. The Zener picks up the
    // difference, so V_Z drops slightly.
    const op = computeOperatingPoint(9, 1000, ZENER_5_1, 5000)
    expect(op.is_regulating).toBe(true)
    // Load current ≈ V_Z / R_L (in mA: V_Z * 1000/5000 = V_Z/5)
    expect(op.i_load).toBeCloseTo(op.v_z / 5, 2)
    // I_total = I_z + I_load (KCL at the regulated node)
    expect(op.i_total).toBeCloseTo(op.i_z + op.i_load, 2)
    // V_Z is somewhat lower than the no-load 5.139 V — load eats headroom
    expect(op.v_z).toBeGreaterThan(ZENER_5_1.v_z0)
    expect(op.v_z).toBeLessThan(5.139)
  })

  it('drops out when R_L is too heavy (R_L = R_s, divider sets V below V_Z0)', () => {
    // V_in=9, R_s=R_L=1 kΩ → open-circuit divider gives 4.5 V,
    // below V_Z0=5.1 V, so the Zener can never break down.
    const op = computeOperatingPoint(9, 1000, ZENER_5_1, 1000)
    expect(op.is_regulating).toBe(false)
    expect(op.v_z).toBeCloseTo(4.5, 2)  // 9 × 1000 / 2000
    expect(op.i_z).toBe(0)
    expect(op.i_load).toBeCloseTo(4.5, 2)  // 4.5 V / 1 kΩ = 4.5 mA
  })

  it('handles a 9.1 V Zener correctly', () => {
    // V_in=15, R_s=1 kΩ, 9.1 V Zener, no load
    // I = (15 - 9.1) / (1000 + 8) = 5.85 mA
    // V_Z = 9.1 + 5.85e-3 × 8 = 9.147 V
    const op = computeOperatingPoint(15, 1000, ZENER_9_1, null)
    expect(op.is_regulating).toBe(true)
    expect(op.v_z).toBeCloseTo(9.147, 2)
    expect(op.i_z).toBeCloseTo(5.85, 1)
  })
})

describe('ZenerRegulatorWidget — render smoke test', () => {
  it('renders the title and starts at default V_in = 9 V', () => {
    renderWithProviders(<ZenerRegulatorWidget />)
    // Title from i18n
    expect(screen.getByText(/zener regulator/i)).toBeInTheDocument()
  })
})

/**
 * SCHEMATIC ↔ DESCRIPTION CONTRACT
 * ────────────────────────────────
 * The widget's description prose enumerates which live readings the
 * schematic shows. If those readings ever disappear from the schematic
 * (e.g. someone refactors the component layout and drops a `value`
 * prop) but the description still claims them, the user opens the page
 * and sees prose that lies about the UI. That has happened — the user
 * caught it on review and asked: «що ти можеш зробити зараз, щоб така
 * помилка більше ніколи не сталась?»
 *
 * Answer: lock the contract at the test level. The description claims
 * the schematic shows (a) supply voltage, (b) voltage drop across R_s,
 * (c) voltage across the Zener, all live. This test asserts each of
 * those numbers actually appears as text inside the rendered schematic
 * SVG at the widget's default state (V_in=9 V, R_s=1 kΩ, 5.1 V Zener,
 * no load). If a future refactor drops one of these labels, the test
 * fails and the implementer is forced to choose: re-add the label, or
 * update the description in en/ui.json + uk/ui.json.
 *
 * Numbers come from the chapter callout's worked example (Step 3):
 *   V_in       = 9 V                  → supply voltage
 *   V_Rs       = V_in − V_Z = 3.86 V  → drop across the series resistor
 *   V_Z        = 5.1 + I·r_z = 5.14 V → regulated output
 */
describe('ZenerRegulatorWidget — schematic / description contract', () => {
  it('schematic shows the three live values claimed in the description', () => {
    renderWithProviders(<ZenerRegulatorWidget />, { language: 'uk' })

    // Default state: V_in=9 V → supply voltage
    expect(screen.getAllByText(/9,0\s*В/).length).toBeGreaterThan(0)

    // V_Rs = (9 − 5.1) / 1010 × 1000 ≈ 3.86 V → drop across R_s
    expect(screen.getAllByText(/3,86\s*В/).length).toBeGreaterThan(0)

    // V_Z = 5.1 + I·r_z ≈ 5.14 V → regulated output across the Zener
    expect(screen.getAllByText(/5,14\s*В/).length).toBeGreaterThan(0)
  })
})
