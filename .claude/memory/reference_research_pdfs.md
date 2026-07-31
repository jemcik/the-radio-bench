---
name: Research PDFs for chapter content
description: Pre-authorised reference PDFs for ham-radio and electronics fact-checking; paths are under Google Drive «My Drive» (quote them); ARRL 268 MB needs pdftotext, Art of Electronics 30 MB reads directly
type: reference
originSessionId: 409f0a37-1c33-4d45-a4ba-c864f1a077c8
---
When working on Radiopedia chapter content (new chapter, expanding a section, adding a widget, fact-checking prose), these resources are pre-authorised — use them without asking:

- **Web search / WebFetch** — for current specs, part datasheets, regulator pages (ITU, FCC, УДЦР), Wikipedia reality-checks, modern prices.
- **The ARRL Handbook for Radio Communications 2023** (100th edition):
  `/Users/jemcik/My Drive/radio/books/ARRL Handbook for Radio Communications 100th (2023).pdf`
  (268 MB, 1527 pages) — canonical reference for ham-radio topics, band plans, propagation, antennas, operating practice.
- **The Art of Electronics** (Horowitz & Hill, 3rd ed., Cambridge 2015):
  `/Users/jemcik/My Drive/books/electronics/the art of electronics/Paul Horowitz, Winfield Hill-The Art of Electronics-Cambridge University Press (2015).pdf`
  (30 MB, 1225 pages) — canonical reference for circuit fundamentals, component behaviour, instruments, signals. Use when deriving or double-checking any quantitative claim about electronics.

Both paths contain spaces and live under Google Drive «My Drive» — always quote them (updated July 2026 from the old `~/Downloads/…` locations). Always pass `pages: "N-M"` to `Read` (max 20 pages per call) and prefer targeted section reads over scanning the table of contents cold. The Art of Electronics (30 MB) reads directly via `Read`; the ARRL Handbook (268 MB) exceeds the 100 MB `Read` cap — use `pdftotext` for it (below).

When a claim depends on either book, cite the source in the commit message / PR description so the user can verify.

The ARRL Handbook is 268 MB — Claude's `Read` tool caps at 100 MB, so for that one specifically use `pdftotext "<path>" -f <start> -l <end> -` via Bash if `Read` rejects it. (See `reference_large_pdfs.md`.)
