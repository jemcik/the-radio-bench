export interface Theme {
  id: string
  label: string
  description: string
  isDark: boolean
  /** CSS class or emoji for the swatch */
  swatch: string
}

export const THEMES: Theme[] = [
  {
    id: 'paper',
    label: 'Paper',
    description: 'Clean white — best for daytime reading sessions',
    isDark: false,
    swatch: '#ffffff',
  },
  {
    id: 'stone',
    label: 'Stone',
    description: 'Warm cream light — gentle on the eyes',
    isDark: false,
    swatch: '#f7f4ef',
  },
  {
    id: 'nordic',
    label: 'Nordic',
    description: 'Cool light slate — clean technical feel',
    isDark: false,
    swatch: '#f4f6fa',
  },
  {
    id: 'dusk',
    label: 'Dusk',
    description: 'Warm medium dark — like working by lamp light',
    isDark: true,
    swatch: '#22201a',
  },
  {
    id: 'moonlight',
    label: 'Moonlight',
    description: 'Soft cool dark — low contrast, easy on night eyes',
    isDark: true,
    swatch: '#1e2130',
  },
  {
    id: 'graphite',
    label: 'Graphite',
    description: 'Neutral medium dark — inspired by GitHub Dark Dimmed',
    isDark: true,
    swatch: '#22272e',
  },
]

export const DEFAULT_THEME = 'paper'
