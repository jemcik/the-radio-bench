---
name: feedback-announce-then-deliver
description: "If prose announces a count or a list, it must render as an actual list — user flagged this four times in one chapter"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: bb06fe00-ee75-4f72-aeb8-d02244c97fb5
  modified: 2026-07-27T15:46:39.728Z
---

Never announce a count or a list and then deliver prose. Ch4.5 shipped four
instances and the user caught every one, angrily:

- «Чотири її положення варто знати напам'ять.» → then four sentences run
  together in one paragraph. He asked: «і що це за 4 положення?»
- «порушити можна лише одне з них» → never said which one.
- «Список заборон варто прочитати повністю» → then seven «Заборонено…»
  sentences in a row. «тобі було важко зробити це списком?»
- «Перелік обов'язкових даних короткий» → three sentence fragments.

**Why:** a reader told «four provisions» has to reverse-engineer where each
one starts and stops. The announcement creates a debt the paragraph never
pays. Naming a thing and then withholding it reads as riddling.

**How to apply:**
- Announce a count → render `<ul className="list-disc pl-6 space-y-1 text-foreground">`
  with one `<li><Trans …/></li>` per item, each item its own i18n key.
  Working example: `ch4_5.ituArt1–4`, `ch4_5.rulesBan1–7`, `ch4_5.logField1–3`.
- Single out one item of several («only one of them…») → name it in the same
  sentence, not two paragraphs later.
- If you don't want a list, delete the announcement — «Список заборон варто
  прочитати повністю хоча б раз» works fine with no promise attached.
- Fixing one instance is not fixing the class: I split Article 25 into a list
  and left the identical prohibitions paragraph untouched three screens below.
  See [[feedback-scan-the-class-fix-what-was-asked]].
