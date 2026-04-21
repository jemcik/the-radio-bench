import { type ComponentType } from 'react'
import Ch0_1Hero from './Ch0_1Hero'
import Ch0_2Hero from './Ch0_2Hero'
import Ch0_3Hero from './Ch0_3Hero'
import Ch0_4Hero from './Ch0_4Hero'
import Ch0_5Hero from './Ch0_5Hero'
import Ch1_1Hero from './Ch1_1Hero'
import Ch1_2Hero from './Ch1_2Hero'
import Ch1_3Hero from './Ch1_3Hero'
import Ch1_4Hero from './Ch1_4Hero'

/**
 * Chapter-id → hero illustration map.
 *
 * ChapterPage looks up the hero by the chapter's `id` from `chapters.ts`
 * (e.g. `'0-2'`). Chapters without an entry here simply render no hero —
 * adding a new chapter is ergonomic: drop a new `ChX_YHero.tsx` next to the
 * others and register it here.
 *
 * Every hero is a plain component that renders an SVG using
 * `stroke="currentColor"` so it adapts to the active theme automatically.
 */
export const CHAPTER_HEROES: Record<string, ComponentType> = {
  '0-1': Ch0_1Hero,
  '0-2': Ch0_2Hero,
  '0-3': Ch0_3Hero,
  '0-4': Ch0_4Hero,
  '0-5': Ch0_5Hero,
  '1-1': Ch1_1Hero,
  '1-2': Ch1_2Hero,
  '1-3': Ch1_3Hero,
  '1-4': Ch1_4Hero,
}
