/**
 * The ITU spelling alphabet — Radio Regulations, Appendix 14.
 *
 * ONE source of truth, shared by the reference table the reader learns from
 * (`PhoneticAlphabetTable`) and the trainer they practise with
 * (`PhoneticSpeller`). Keeping two copies would let the two artefacts drift
 * apart, and a course whose trainer disagrees with its own reference table is
 * worse than one with neither.
 *
 * The words are DATA, not translatable copy: they are proper names of an
 * international standard and are identical in every language, which is the
 * entire reason the standard exists. They stay Latin in the Ukrainian locale.
 *
 * Two spellings look wrong and are not — «Alfa» with an f and «Juliett» with a
 * double t. Both exist so that speakers whose languages do not read «ph» as /f/,
 * or who would leave a final t silent, still land on the intended sound. The
 * CEPT novice syllabus (ERC Report 32 §b ch.1) prints the anglicised «Alpha» and
 * «Juliet»; Appendix 14 is the standard itself, so its spellings are the ones
 * used here. §2 of chapter 4.4 explains the difference to the reader.
 */

/** Latin letter → its ITU spelling word. */
export const ITU_ALPHABET: Record<string, string> = {
  A: 'Alfa', B: 'Bravo', C: 'Charlie', D: 'Delta', E: 'Echo', F: 'Foxtrot',
  G: 'Golf', H: 'Hotel', I: 'India', J: 'Juliett', K: 'Kilo', L: 'Lima',
  M: 'Mike', N: 'November', O: 'Oscar', P: 'Papa', Q: 'Quebec', R: 'Romeo',
  S: 'Sierra', T: 'Tango', U: 'Uniform', V: 'Victor', W: 'Whiskey',
  X: 'X-ray', Y: 'Yankee', Z: 'Zulu',
}

/** A–Z in order, for anything that needs to walk the whole set. */
export const ITU_LETTERS = Object.keys(ITU_ALPHABET)
