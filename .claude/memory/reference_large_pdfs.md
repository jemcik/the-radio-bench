---
name: Reading large research PDFs (ARRL 268MB)
description: How to extract text from the 268MB ARRL Handbook PDF that exceeds the Read tool's 100MB limit
type: reference
originSessionId: 09b039fe-0104-41fd-b15c-042a6df05d9e
---
The ARRL Handbook for Radio Communications (100th ed., 2023) lives at
`/Users/jemcik/My Drive/radio/books/ARRL Handbook for Radio Communications 100th (2023).pdf`
(268 MB / 256 MiB, 1527 pages — path has spaces AND is under Google Drive «My Drive», so always quote it; `pdftotext` reads it fine). The `Read` tool's 100 MB PDF limit blocks it directly. (Updated July 2026 — moved from the old `~/Downloads/ham_26/…` location.)

**Workaround — `pdftotext` (poppler)** is installed at `/opt/homebrew/bin/pdftotext`.
Use `-layout` to preserve columns and `-f N -l M` to bound the page range:

```bash
mkdir -p /tmp/arrl
pdftotext -layout -f 37 -l 75 "<path>" /tmp/arrl/ch2.txt
```

Then `Read` the extracted txt file (which is small). `pdfinfo` reports
metadata (total pages etc.). `pdfseparate` also available if per-page
splitting is needed.

Canonical chapters for ham-radio reference work:
- **Ch 2 "Electrical Fundamentals"** (~PDF pages 37–75): resistance, conductance,
  Kirchhoff's laws, Thevenin/Norton, sources, basic circuit analysis.
- **Ch 4 "Circuits and Components"** (~PDF pages 121+): practical resistors
  (§4.2 — colour codes Table 4.2, E-series Table 4.3, mil-spec Table 4.4,
  temperature coefficients Table 4.5), capacitors, inductors, transformers,
  semiconductors, amplifiers.

The PDF pages don't match the book's internal chapter-numbered pages — use
`pdftotext` to grep for section headings ("2.2 Resistance", "4.2 Practical
Resistors") to locate the right PDF-page range.

**Why this matters:** don't tell the user "the PDF is too big" — chunk it
with `pdftotext` instead. The 100 MB limit is on `Read`, not on the
machine.
