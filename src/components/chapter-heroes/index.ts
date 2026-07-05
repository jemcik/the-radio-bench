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
import Ch1_5Hero from './Ch1_5Hero'
import Ch1_6Hero from './Ch1_6Hero'
import Ch1_7Hero from './Ch1_7Hero'
import Ch1_8Hero from './Ch1_8Hero'
import Ch1_9Hero from './Ch1_9Hero'
import Ch1_10Hero from './Ch1_10Hero'
import Ch1_11Hero from './Ch1_11Hero'
import Ch2_1Hero from './Ch2_1Hero'
import Ch2_2Hero from './Ch2_2Hero'
import Ch2_3Hero from './Ch2_3Hero'
import Ch3_1Hero from './Ch3_1Hero'
import Ch3_2Hero from './Ch3_2Hero'
import Ch3_3Hero from './Ch3_3Hero'
import Ch3_4Hero from './Ch3_4Hero'

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
  '1-5': Ch1_5Hero,
  '1-6': Ch1_6Hero,
  '1-7': Ch1_7Hero,
  '1-8': Ch1_8Hero,
  '1-9': Ch1_9Hero,
  '1-10': Ch1_10Hero,
  '1-11': Ch1_11Hero,
  '2-1': Ch2_1Hero,
  '2-2': Ch2_2Hero,
  '2-3': Ch2_3Hero,
  '3-1': Ch3_1Hero,
  '3-2': Ch3_2Hero,
  '3-3': Ch3_3Hero,
  '3-4': Ch3_4Hero,
}
