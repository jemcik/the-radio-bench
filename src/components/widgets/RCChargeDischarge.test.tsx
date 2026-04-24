import { describe, expect, it, vi } from 'vitest'
import { act, fireEvent, screen } from '@testing-library/react'
import { renderWithProviders } from '@/test/render'
import RCChargeDischarge from './RCChargeDischarge'

/* RCChargeDischarge smoke tests.
 *
 * Default state: R = 10 kΩ, C = 100 µF  →  τ = 10e3 · 100e-6 = 1 s.
 * V_in = 5 V, initial V_C = 0 V (idle).
 */

function setup(language: 'en' | 'uk' = 'en') {
  return renderWithProviders(<RCChargeDischarge />, { language })
}

describe('RCChargeDischarge', () => {
  it('computes the default τ as 1 s', () => {
    const { container } = setup()
    // τ = 10 kΩ × 100 µF = 1.0 s, but floating-point gives 0.9999…9.
    // formatTau's epsilon pushes that into the "s" branch and num()
    // trims trailing zeros → "1 s".
    expect(container.textContent).toMatch(/1\s*s/)
    // And NOT "1000 ms" — which it was before the epsilon fix.
    expect(container.textContent).not.toMatch(/1000\s*ms/)
  })

  it('shows V_C = 0 V on initial render (idle, uncharged)', () => {
    const { container } = setup()
    // fmt(0, 2) → "0.00"
    expect(container.textContent).toMatch(/0\.00\s*V/)
  })

  it('both Charge and Discharge are always enabled in the idle state', () => {
    // UX rule: we never disable the action buttons based on the cap's
    // current state. Pressing the same action twice is a natural
    // «play it again» gesture — the button handlers auto-snap to the
    // opposite extreme before animating.
    setup()
    expect(screen.getByRole('button', { name: /^Charge$/ })).not.toBeDisabled()
    expect(screen.getByRole('button', { name: /^Discharge$/ })).not.toBeDisabled()
  })

  it('animation wall-clock duration tracks τ across a wide range', async () => {
    // Regression bundle:
    //   1. Originally durationMs was a hardcoded 4 s regardless of τ —
    //      doubling C didn't change the animation pace.
    //   2. Early fix clamped into a narrow [1.5 s, 10 s] band which
    //      made the change barely perceivable.
    //   3. Current behaviour tracks 5τ of wall-clock time literally
    //      across [300 ms, 30 s], so the user-visible pace reflects
    //      the circuit τ 1:1 in the middle of that range.
    //
    // We test the upper edge: τ = 4 s (R = 40 kΩ × C = 100 µF), so
    // target 5τ = 20 s, which falls inside the band and should
    // produce a 20-s animation (not the old 4-s flat value).
    const rafCallbacks: FrameRequestCallback[] = []
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
      rafCallbacks.push(cb)
      return rafCallbacks.length
    })
    vi.stubGlobal('cancelAnimationFrame', () => {})

    try {
      const { container } = setup()
      const rInput = document.getElementById('rc-r') as HTMLInputElement
      fireEvent.change(rInput, { target: { value: '40' } })
      // R unit already kΩ, C already 100 µF → τ = 40e3 · 100e-6 = 4 s

      await act(async () => { fireEvent.click(screen.getByRole('button', { name: /^Charge$/ })) })
      await act(async () => { rafCallbacks.shift()?.(0) })

      // At 18 000 ms wall-clock: animation should still be running
      // (target duration ≈ 20 000 ms). Old hardcoded 4 s would have
      // finished by now, and the [1.5 s, 10 s] clamp would also
      // have finished.
      await act(async () => { rafCallbacks.shift()?.(18000) })
      expect(screen.getByRole('button', { name: /^Discharge$/ })).toBeDisabled()

      // Step past target — animation should finish.
      await act(async () => { rafCallbacks.shift()?.(21000) })
      expect(screen.getByRole('button', { name: /^Discharge$/ })).not.toBeDisabled()
      expect(container.textContent).toMatch(/4\.97\s*V/)
    } finally {
      vi.unstubAllGlobals()
    }
  })

  it('pressing Charge on a fully-charged cap snaps to 0 V and replays', async () => {
    // UX regression: a second Charge press on an already-charged cap
    // should NOT be blocked and should NOT draw a flat line at V_in.
    // Instead, the handler snaps vCurrent back to 0 V so the full
    // 0 → V_in arc plays again.
    const rafCallbacks: FrameRequestCallback[] = []
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
      rafCallbacks.push(cb)
      return rafCallbacks.length
    })
    vi.stubGlobal('cancelAnimationFrame', () => {})

    const pumpEnd = async () => {
      await act(async () => { rafCallbacks.shift()?.(0) })
      await act(async () => { rafCallbacks.shift()?.(6000) })
    }

    try {
      const { container } = setup()
      // First charge
      await act(async () => { fireEvent.click(screen.getByRole('button', { name: /^Charge$/ })) })
      await pumpEnd()
      // ≈ 4.97 V; Charge button STILL enabled (never disabled by state)
      expect(screen.getByRole('button', { name: /^Charge$/ })).not.toBeDisabled()

      // Second Charge press — should snap vCurrent to 0 before the
      // animation starts.
      await act(async () => { fireEvent.click(screen.getByRole('button', { name: /^Charge$/ })) })
      expect(container.textContent).toMatch(/0\.00\s*V/)

      // Then animation plays to completion.
      await pumpEnd()
      expect(container.textContent).toMatch(/4\.97\s*V/)
    } finally {
      vi.unstubAllGlobals()
    }
  })

  it('pressing Discharge from the fresh (0 V) state snaps to V_in and replays', async () => {
    // Symmetric UX: on a freshly-loaded widget (vCurrent = 0) the
    // user can press Discharge directly and see the full V_in → 0
    // decay without having to press Charge first.
    const rafCallbacks: FrameRequestCallback[] = []
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
      rafCallbacks.push(cb)
      return rafCallbacks.length
    })
    vi.stubGlobal('cancelAnimationFrame', () => {})

    try {
      const { container } = setup()
      await act(async () => { fireEvent.click(screen.getByRole('button', { name: /^Discharge$/ })) })
      // Snapped to V_in = 5 V before animation starts.
      expect(container.textContent).toMatch(/5\.00\s*V/)

      // Let the animation finish → ≈ 0 V.
      await act(async () => { rafCallbacks.shift()?.(0) })
      await act(async () => { rafCallbacks.shift()?.(6000) })
      expect(container.textContent).toMatch(/0\.03\s*V/)
    } finally {
      vi.unstubAllGlobals()
    }
  })

  it('τ autoscales to milliseconds when R·C is in the millisecond range', () => {
    setup()
    // Default R = 10 kΩ. Change C to 100 nF → τ = 10e3 · 100e-9 = 1e-3 s = 1 ms.
    const cInput = document.getElementById('rc-c') as HTMLInputElement
    fireEvent.change(cInput, { target: { value: '100' } })
    const unitSelects = screen.getAllByRole('combobox')
    // R unit is the first combobox, C unit is the second.
    fireEvent.change(unitSelects[1], { target: { value: 'nf' } })
    expect(document.body.textContent).toMatch(/1\s*ms|1,00\s*ms|1\.00\s*ms/)
  })

  it('uses a comma separator in UK locale', () => {
    const { container } = setup('uk')
    // V_C = 0.00 → in UK becomes "0,00 В"
    expect(container.textContent).toMatch(/0,00\s*В/)
  })

  it('restores R, C, and V_in inputs to defaults when Reset is pressed', () => {
    setup()
    const rInput = document.getElementById('rc-r') as HTMLInputElement
    const cInput = document.getElementById('rc-c') as HTMLInputElement
    const vinInput = document.getElementById('rc-vin') as HTMLInputElement

    // Edit all three fields away from their defaults.
    fireEvent.change(rInput, { target: { value: '47' } })
    fireEvent.change(cInput, { target: { value: '22' } })
    fireEvent.change(vinInput, { target: { value: '9' } })
    expect(rInput.value).toBe('47')
    expect(cInput.value).toBe('22')
    expect(vinInput.value).toBe('9')

    fireEvent.click(screen.getByRole('button', { name: /^Reset$/ }))

    // Regression: «Reset» used to only rewind the animation state;
    // the input fields kept the user's edits. Per the user's UX
    // expectation, Reset should now also restore the inputs to the
    // initial 10 kΩ / 100 µF / 5 V.
    expect(rInput.value).toBe('10')
    expect(cInput.value).toBe('100')
    expect(vinInput.value).toBe('5')
  })

  it('freezes the final voltage after a charge animation completes', async () => {
    // Regression: clicking «Charge» and waiting for the animation to end
    // must leave V_C at ≈ V_in (not 0). Before the tick-end fix, vStart
    // was never updated when the animation finished — so the readout
    // reported 0 V after charging, AND a subsequent «Discharge» started
    // from vStart=0 and drew a flat line at 0.
    //
    // We fake RAF so the whole 5τ animation collapses into a
    // deterministic sequence of synchronous ticks.
    const rafCallbacks: FrameRequestCallback[] = []
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
      rafCallbacks.push(cb)
      return rafCallbacks.length
    })
    vi.stubGlobal('cancelAnimationFrame', () => {})

    try {
      const { container } = setup()
      const chargeBtn = screen.getByRole('button', { name: /^Charge$/ })
      await act(async () => { fireEvent.click(chargeBtn) })

      // Drive the animation past 5τ of wall-clock time. The widget
      // maps 5τ onto 4000 ms of wall clock, so a single tick at
      // t = 4000 ms is enough to hit the end branch.
      await act(async () => {
        const cb = rafCallbacks.shift()
        cb?.(0)
      })
      await act(async () => {
        const cb = rafCallbacks.shift()
        cb?.(5000)
      })

      // V_in = 5 V, charged for 5τ → V_C ≈ 5 · (1 − e^-5) ≈ 4.97 V.
      // Was 0.00 before the fix.
      expect(container.textContent).toMatch(/4\.97\s*V/)
      expect(container.textContent).not.toMatch(/0\.00\s*V/)
    } finally {
      vi.unstubAllGlobals()
    }
  })

  it('idle ghost curve after a completed charge is a rising arc, not a flat line', async () => {
    // Regression: the widget used to overwrite vStart with the
    // finalV when the charge animation completed. With the anchor
    // coinciding with the endpoint, the idle formula
    // `vStart + (Vin - vStart)·(1 − e^-t)` degenerated into a flat
    // line near V_in — so the graph «disappeared» once charging
    // finished. Splitting into vAnchor (sticky start point) + vCurrent
    // (endpoint, for the readout) restores the full 0 → V_in arc.
    const rafCallbacks: FrameRequestCallback[] = []
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
      rafCallbacks.push(cb)
      return rafCallbacks.length
    })
    vi.stubGlobal('cancelAnimationFrame', () => {})

    try {
      const { container } = setup()
      await act(async () => { fireEvent.click(screen.getByRole('button', { name: /^Charge$/ })) })
      await act(async () => { rafCallbacks.shift()?.(0) })
      await act(async () => { rafCallbacks.shift()?.(5000) })

      const path = container.querySelector('path')
      const d = path?.getAttribute('d') ?? ''
      const ys = [...d.matchAll(/[ML]\s*[\d.]+\s+([\d.]+)/g)].map(m => parseFloat(m[1]))
      expect(ys.length).toBeGreaterThan(10)

      // After full charge from 0 to ≈V_in:
      //   - first point V = 0     → y ≈ 192 (bottom)
      //   - last point  V ≈ 4.97  → y ≈ 15  (top)
      // Curve RISES on screen (y decreases from start to end).
      const firstY = ys[0]
      const lastY = ys[ys.length - 1]
      expect(firstY).toBeGreaterThan(170)   // starts near bottom
      expect(lastY).toBeLessThan(25)        // ends near top
      expect(firstY).toBeGreaterThan(lastY) // rises on screen
    } finally {
      vi.unstubAllGlobals()
    }
  })

  it('idle ghost curve after charge then discharge is a falling (discharge) curve', async () => {
    // Regression bundle covering several failure modes:
    //   1. Before the lastAction fix, idle always used the CHARGE
    //      formula — the plot «flipped» into a rising curve after
    //      discharge completed.
    //   2. Before the vAnchor/vCurrent split, idle collapsed to a
    //      flat line at V_in after charging (vStart had been snapped
    //      to the endpoint), hiding the curve entirely.
    // This test locks in the correct behaviour: after Charge→Discharge,
    // the idle ghost curve is the full 4.97 → 0.03 arc — starts
    // high on the plot (low y), ends low (high y).
    const rafCallbacks: FrameRequestCallback[] = []
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
      rafCallbacks.push(cb)
      return rafCallbacks.length
    })
    vi.stubGlobal('cancelAnimationFrame', () => {})

    const pumpAnimationToEnd = async () => {
      await act(async () => { rafCallbacks.shift()?.(0) })
      await act(async () => { rafCallbacks.shift()?.(5000) })
    }

    try {
      const { container } = setup()
      await act(async () => { fireEvent.click(screen.getByRole('button', { name: /^Charge$/ })) })
      await pumpAnimationToEnd()
      await act(async () => { fireEvent.click(screen.getByRole('button', { name: /^Discharge$/ })) })
      await pumpAnimationToEnd()

      const path = container.querySelector('path')
      const d = path?.getAttribute('d') ?? ''
      const ys = [...d.matchAll(/[ML]\s*[\d.]+\s+([\d.]+)/g)].map(m => parseFloat(m[1]))
      expect(ys.length).toBeGreaterThan(10)

      // Plot: PAD_T=14, PLOT_H=178, so top y≈14, bottom y≈192.
      // After full discharge from ≈V_in down to ≈0:
      //   - first point V ≈ 4.97 → y ≈ 15   (near top)
      //   - last point  V ≈ 0.03 → y ≈ 191  (near bottom)
      // Curve is FALLING on the screen (y increases from start to end).
      const firstY = ys[0]
      const lastY = ys[ys.length - 1]
      expect(firstY).toBeLessThan(25)   // starts near top
      expect(lastY).toBeGreaterThan(170) // ends near bottom
      expect(lastY).toBeGreaterThan(firstY) // falls on screen (V decreases)
    } finally {
      vi.unstubAllGlobals()
    }
  })
})
