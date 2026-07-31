---
name: reference-ua-amateur-regulation-pdfs
description: "Official Ukrainian amateur-radio regulation PDFs supplied by the user — authoritative source for classes, bands, power, log, callsigns"
metadata: 
  node_type: memory
  type: reference
  originSessionId: bb06fe00-ee75-4f72-aeb8-d02244c97fb5
  modified: 2026-07-27T09:22:14.069Z
---

The authoritative source for every Ukrainian licensing/regulatory fact in the course.
User supplied these on 2026-07-27 for ch4.5; treat as pre-authorised reading.

- Body: `/Users/jemcik/My Drive/radio/ліцензія/В, 2026/Про затвердження Регламенту аматорського радіозв'язку Укра… - Постанова № 173 від 10.05.2023 - d527874-20230510.pdf` (25 pp)
- Appendices 1–33: `/Users/jemcik/My Drive/radio/ліцензія/В, 2026/f527874n331.pdf` (72 pp)

Read them with `pdftotext -layout` (the Read tool caps at 20 pages/request; layout mode
is required or Table 12's per-class power columns collapse).

Citation: постанова НКЕК від 10.05.2023 № 173, зареєстр. в Мін'юсті 29.06.2023
за № 1106/40162, Офіційний вісник України 21.07.2023 № 63 ст. 3627. Supersedes
рішення НКРЗ від 21.10.2010 № 475.

Landmine: most Ukrainian web sources still describe the superseded 2010 scheme
(перша/друга/третя категорія). The current scheme is **A (HAREC) / B (NOVICE) /
C (Entry-Level)** — розділ V п.1 — and розділ XII п.4 gives the official
equivalence (A ≡ 1 та 2, B ≡ 3, C is new). Two of three web sources I checked
served the dead scheme. Always verify against these PDFs, never a mirror.

Key locations: розділ V = qualifications + exams; розділ VII = on-air rules, log,
identification; розділ IX + додаток 31 = callsign construction; додаток 2 таблиця 12
= bands/power per class; додатки 3/4/5 = the C/B/A exam syllabi (ECC REP 089 /
ERC REPORT 32 / T/R 61-02).

See [[reference-research-pdfs]] for the ARRL Handbook and Art of Electronics.
