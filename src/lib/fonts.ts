interface FontOption {
  id: string
  label: string
  /** CSS font-family value for body text */
  sans: string
  /** CSS font-family value for code / mono */
  mono: string
  /** Short category hint shown in the picker */
  category: 'sans-serif' | 'serif' | 'monospace' | 'system'
}

export const FONTS: FontOption[] = [
  {
    id: 'ibm-plex-mono',
    label: 'IBM Plex Mono',
    sans: "'IBM Plex Mono', monospace",
    mono: "'IBM Plex Mono', monospace",
    category: 'monospace',
  },
  {
    id: 'ibm-plex-sans',
    label: 'IBM Plex Sans',
    sans: "'IBM Plex Sans', system-ui, sans-serif",
    mono: "'IBM Plex Mono', monospace",
    category: 'sans-serif',
  },
  {
    id: 'helvetica',
    label: 'Helvetica',
    sans: "'Helvetica Neue', Helvetica, Arial, sans-serif",
    mono: "'IBM Plex Mono', monospace",
    category: 'sans-serif',
  },
  {
    id: 'inter',
    label: 'Inter',
    sans: "'Inter', system-ui, sans-serif",
    mono: "'Source Code Pro', monospace",
    category: 'sans-serif',
  },
  {
    id: 'lora',
    label: 'Lora',
    sans: "'Lora', Georgia, serif",
    mono: "'IBM Plex Mono', monospace",
    category: 'serif',
  },
  {
    id: 'source-code-pro',
    label: 'Source Code Pro',
    sans: "'Source Code Pro', monospace",
    mono: "'Source Code Pro', monospace",
    category: 'monospace',
  },
  {
    id: 'system',
    label: 'System Default',
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    mono: "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace",
    category: 'system',
  },
]

export const DEFAULT_FONT = 'system'

export function getFontById(id: string): FontOption {
  return FONTS.find(f => f.id === id) ?? FONTS[0]
}
