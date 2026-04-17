// ─── Chapter registry ────────────────────────────────────────────────────────
// Add a new entry here when you start a chapter.
// The `status` field controls what the sidebar shows:
//   published   → clickable, full content
//   draft       → visible but marked "in progress"
//   coming-soon → visible but not clickable
// ─────────────────────────────────────────────────────────────────────────────

export type ChapterStatus = 'published' | 'draft' | 'coming-soon'

export interface ChapterMeta {
  /** Unique route id — used in the URL: /chapter/<id> */
  id: string
  /** Display number shown in the sidebar and chapter header */
  number: string
  /** Part grouping (0 = Foundations, 1 = Electricity, etc.) */
  part: number
  title: string
  /** One-line description shown in the sidebar tooltip */
  subtitle: string
  status: ChapterStatus
  hasLab: boolean
  hasQuiz: boolean
  /** ERC Report 32 sections covered, e.g. ["1.1", "1.2"] */
  erc32?: string[]
}

export interface Part {
  number: number
  title: string
  chapters: ChapterMeta[]
}

// ─── Data ─────────────────────────────────────────────────────────────────────

export const PARTS: Part[] = [
  {
    number: 0,
    title: 'Foundations',
    chapters: [
      {
        id: '0-1',
        number: '0.1',
        part: 0,
        title: 'How to Use This Site',
        subtitle: 'Reading path, widgets, quizzes, and lab activities explained',
        status: 'published',
        hasLab: false,
        hasQuiz: false,
      },
      {
        id: '0-2',
        number: '0.2',
        part: 0,
        title: 'Lab Bench Setup',
        subtitle: 'Getting to know your multimeter, oscilloscope, VNA, and Arduino',
        status: 'published',
        hasLab: true,
        hasQuiz: false,
      },
      {
        id: '0-3',
        number: '0.3',
        part: 0,
        title: 'Math Toolkit for Radio',
        subtitle: 'Fractions, powers of 10, SI prefixes, square roots, transposing formulae',
        status: 'published',
        hasLab: true,
        hasQuiz: true,
      },
      {
        id: '0-4',
        number: '0.4',
        part: 0,
        title: 'The Decibel',
        subtitle: 'dB, dBm, dBd, dBi — the language of radio levels',
        status: 'published',
        hasLab: true,
        hasQuiz: true,
      },
      {
        id: '0-5',
        number: '0.5',
        part: 0,
        title: 'How to Read a Schematic',
        subtitle: 'Wires, junctions, components — the visual grammar of every circuit diagram',
        status: 'published',
        hasLab: true,
        hasQuiz: true,
      },
    ],
  },
  {
    number: 1,
    title: 'Electricity & Circuits',
    chapters: [
      {
        id: '1-1',
        number: '1.1',
        part: 1,
        title: 'What Is Electricity?',
        subtitle: 'Conductors, insulators, current, voltage, resistance',
        status: 'published',
        hasLab: true,
        hasQuiz: true,
        erc32: ['1.1'],
      },
      {
        id: '1-2',
        number: '1.2',
        part: 1,
        title: "Ohm's Law and Power",
        subtitle: 'E = I·R, P = E·I — the two equations that explain everything',
        status: 'coming-soon',
        hasLab: true,
        hasQuiz: true,
        erc32: ['1.1'],
      },
      {
        id: '1-3',
        number: '1.3',
        part: 1,
        title: 'DC and AC',
        subtitle: 'Two kinds of electricity, RMS (Root Mean Square) voltage, sine waves',
        status: 'coming-soon',
        hasLab: true,
        hasQuiz: true,
        erc32: ['1.1', '1.2'],
      },
      {
        id: '1-4',
        number: '1.4',
        part: 1,
        title: 'Resistors in Practice',
        subtitle: 'Colour code, series/parallel, voltage divider',
        status: 'coming-soon',
        hasLab: true,
        hasQuiz: true,
        erc32: ['2.1'],
      },
      {
        id: '1-5',
        number: '1.5',
        part: 1,
        title: 'Capacitors',
        subtitle: 'Capacitance, types, RC time constant, blocks DC passes AC',
        status: 'coming-soon',
        hasLab: true,
        hasQuiz: true,
        erc32: ['2.2'],
      },
      {
        id: '1-6',
        number: '1.6',
        part: 1,
        title: 'Coils (Inductors)',
        subtitle: 'Inductance, reactance, RF chokes — wind and measure your own',
        status: 'coming-soon',
        hasLab: true,
        hasQuiz: true,
        erc32: ['2.3'],
      },
      {
        id: '1-7',
        number: '1.7',
        part: 1,
        title: 'Tuned Circuits and Resonance',
        subtitle: 'LC resonance, Q factor, series vs parallel — measured with the VNA',
        status: 'coming-soon',
        hasLab: true,
        hasQuiz: true,
        erc32: ['2.7'],
      },
      {
        id: '1-8',
        number: '1.8',
        part: 1,
        title: 'Filters',
        subtitle: 'Low-pass, high-pass, band-pass, band-stop — plot the response on the VNA',
        status: 'coming-soon',
        hasLab: true,
        hasQuiz: true,
        erc32: ['3.1'],
      },
      {
        id: '1-9',
        number: '1.9',
        part: 1,
        title: 'Transformers',
        subtitle: 'Turns ratio, impedance transformation, coupling',
        status: 'coming-soon',
        hasLab: true,
        hasQuiz: true,
        erc32: ['2.4'],
      },
      {
        id: '1-10',
        number: '1.10',
        part: 1,
        title: 'Diodes and Transistors',
        subtitle: 'P-N junction, rectifier, Zener, transistor as switch and amplifier',
        status: 'coming-soon',
        hasLab: true,
        hasQuiz: true,
        erc32: ['2.5', '2.6'],
      },
    ],
  },
  {
    number: 2,
    title: 'Radio Theory',
    chapters: [
      {
        id: '2-1',
        number: '2.1',
        part: 2,
        title: 'What Are Radio Waves?',
        subtitle: 'EM waves, wavelength, frequency, polarisation, the spectrum',
        status: 'coming-soon',
        hasLab: true,
        hasQuiz: true,
        erc32: ['1.3'],
      },
      {
        id: '2-2',
        number: '2.2',
        part: 2,
        title: 'Audio, Digital and Modulated Signals',
        subtitle: 'AM, SSB, FM — how your voice rides a radio wave',
        status: 'coming-soon',
        hasLab: true,
        hasQuiz: true,
        erc32: ['1.4', '1.5'],
      },
      {
        id: '2-3',
        number: '2.3',
        part: 2,
        title: 'Power: DC Input vs RF Output',
        subtitle: 'Efficiency, PEP, what the missing watts become',
        status: 'coming-soon',
        hasLab: true,
        hasQuiz: true,
        erc32: ['1.6'],
      },
    ],
  },
  {
    number: 3,
    title: 'Station Equipment',
    chapters: [
      {
        id: '3-1',
        number: '3.1',
        part: 3,
        title: 'Receivers',
        subtitle: 'TRF, superheterodyne, block diagram stage by stage',
        status: 'coming-soon',
        hasLab: true,
        hasQuiz: true,
        erc32: ['4.1', '4.2', '4.3'],
      },
      {
        id: '3-2',
        number: '3.2',
        part: 3,
        title: 'Transmitters',
        subtitle: 'CW, SSB, FM block diagrams; harmonics and why filters matter',
        status: 'coming-soon',
        hasLab: true,
        hasQuiz: true,
        erc32: ['5.1', '5.2', '5.3'],
      },
      {
        id: '3-3',
        number: '3.3',
        part: 3,
        title: 'Antennas and Transmission Lines',
        subtitle: 'Dipole, vertical, Yagi, coax, SWR — build and measure with the VNA',
        status: 'coming-soon',
        hasLab: true,
        hasQuiz: true,
        erc32: ['6.1', '6.2', '6.3'],
      },
      {
        id: '3-4',
        number: '3.4',
        part: 3,
        title: 'Measurements',
        subtitle: 'Multimeter, SWR meter, dummy load, oscilloscope, VNA — a full session',
        status: 'coming-soon',
        hasLab: true,
        hasQuiz: true,
        erc32: ['8.1', '8.2'],
      },
    ],
  },
  {
    number: 4,
    title: 'Propagation, Operations & Regulations',
    chapters: [
      {
        id: '4-1',
        number: '4.1',
        part: 4,
        title: 'Frequency Spectrum and Propagation',
        subtitle: 'Ionosphere, HF skip, VHF/UHF, sunspot cycle',
        status: 'coming-soon',
        hasLab: true,
        hasQuiz: true,
        erc32: ['7'],
      },
      {
        id: '4-2',
        number: '4.2',
        part: 4,
        title: 'Interference and EMC',
        subtitle: 'Harmonics, coupling paths, ferrites, filters — demonstrate and cure RFI',
        status: 'coming-soon',
        hasLab: true,
        hasQuiz: true,
        erc32: ['9.1', '9.2', '9.3'],
      },
      {
        id: '4-3',
        number: '4.3',
        part: 4,
        title: 'Safety',
        subtitle: 'Shock, mains, high voltage, RF, lightning — station grounding inspection',
        status: 'coming-soon',
        hasLab: true,
        hasQuiz: true,
        erc32: ['10.1', '10.2', '10.3', '10.4'],
      },
      {
        id: '4-4',
        number: '4.4',
        part: 4,
        title: 'Operating Procedures',
        subtitle: 'Phonetic alphabet, Q-codes, QSO structure, call signs',
        status: 'coming-soon',
        hasLab: true,
        hasQuiz: true,
        erc32: ['b1', 'b2', 'b3', 'b4', 'b5'],
      },
      {
        id: '4-5',
        number: '4.5',
        part: 4,
        title: 'Regulations',
        subtitle: 'ITU, CEPT, HAREC, national licence conditions',
        status: 'coming-soon',
        hasLab: false,
        hasQuiz: true,
        erc32: ['c1', 'c2', 'c3'],
      },
    ],
  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getAllChapters(): ChapterMeta[] {
  return PARTS.flatMap(p => p.chapters)
}

export function getChapterById(id: string): ChapterMeta | undefined {
  return getAllChapters().find(c => c.id === id)
}

export function getAdjacentChapters(id: string): {
  prev: ChapterMeta | undefined
  next: ChapterMeta | undefined
} {
  const all = getAllChapters()
  const idx = all.findIndex(c => c.id === id)
  if (idx === -1) return { prev: undefined, next: undefined }
  return {
    prev: idx > 0 ? all[idx - 1] : undefined,
    next: idx < all.length - 1 ? all[idx + 1] : undefined,
  }
}
