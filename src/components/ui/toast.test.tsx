import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { act, render, renderHook, screen } from '@testing-library/react'
import { type ReactNode } from 'react'
import { ToastProvider, useToast } from './toast'

const wrapper = ({ children }: { children: ReactNode }) => (
  <ToastProvider>{children}</ToastProvider>
)

describe('Toast', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('useToast throws if used outside the provider', () => {
    // Suppress the React error log for this expected throw.
    const err = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => renderHook(() => useToast())).toThrow(/ToastProvider/)
    err.mockRestore()
  })

  it('renders nothing when no toasts have been shown', () => {
    render(<ToastProvider>{null}</ToastProvider>)
    expect(screen.queryByRole('region', { name: /notifications/i })).not.toBeInTheDocument()
  })

  it('renders a toast when show() is called and removes it after the lifetime', () => {
    const { result } = renderHook(() => useToast(), { wrapper })

    act(() => result.current.show('Saved'))
    expect(screen.getByText('Saved')).toBeInTheDocument()

    // 2500ms display + 350ms exit animation
    act(() => vi.advanceTimersByTime(2500))
    // Now in exit-animating state — still in DOM
    expect(screen.getByText('Saved')).toBeInTheDocument()
    act(() => vi.advanceTimersByTime(350))
    // Removed from the DOM
    expect(screen.queryByText('Saved')).not.toBeInTheDocument()
  })

  it('stacks multiple toasts in the order they were shown', () => {
    const { result } = renderHook(() => useToast(), { wrapper })

    act(() => result.current.show('first'))
    act(() => result.current.show('second'))
    act(() => result.current.show('third'))

    const region = screen.getByRole('region', { name: /notifications/i })
    const messages = Array.from(region.querySelectorAll('span')).map(el => el.textContent)
    expect(messages).toEqual(['first', 'second', 'third'])
  })

  it('exposes a polite live region for assistive tech', () => {
    const { result } = renderHook(() => useToast(), { wrapper })
    act(() => result.current.show('hello'))

    const region = screen.getByRole('region', { name: /notifications/i })
    expect(region).toHaveAttribute('aria-live', 'polite')
  })
})
