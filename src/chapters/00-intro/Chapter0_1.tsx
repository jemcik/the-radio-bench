// Chapter 0.1 — How to Use This Site
import ChapterFlowDiagram from '@/components/diagrams/ChapterFlowDiagram'
import { Callout } from '@/components/ui/callout'
import { Section } from '@/components/ui/section-heading'
import { G } from '@/components/ui/glossary-term'

export default function Chapter0_1() {
  return (
    <>
      <p>
        This site is built around one idea: understanding radio means understanding the physics
        underneath it. Not memorising facts, but building a mental model solid enough that you
        can reason about things you've never seen before.
      </p>

      <p>
        Every chapter is designed to be read in order — each one lays a foundation for the next.
        But if you already know a topic well, feel free to skip ahead. The sidebar shows you
        exactly where you are.
      </p>

      <Section id="chapter-structure">How a chapter is structured</Section>

      <p>Each chapter follows the same pattern:</p>

      <ChapterFlowDiagram />

      <ul>
        <li>
          <strong>Concept first, equation second.</strong> Every new idea starts with an analogy
          or a real-world example. The formula comes after, as a way to make the analogy
          precise — never as a replacement for it.
        </li>
        <li>
          <strong>Interactive widgets.</strong> Where there's a formula, there's usually a
          calculator. Where there's a waveform, there's usually a diagram you can drag. Use them
          — they make the abstract concrete.
        </li>
        <li>
          <strong>Lab activities</strong> (optional, marked with a flask icon in the sidebar). If you have
          a multimeter, oscilloscope, VNA, or Arduino, the lab activities let you verify the
          theory on a real bench. They're completely optional — the chapter stands without them
          — but doing them rewires the knowledge from "understood" to "experienced."
        </li>
        <li>
          <strong>Quiz</strong> (coming soon, marked with a question-mark icon in the sidebar).
          Chapters will include a short quiz at the end to help you check what stuck. The act of
          trying to recall something is itself part of learning.
        </li>
      </ul>

      <Section id="sidebar-icons">The icons in the sidebar</Section>

      <p>
        Next to each chapter title in the sidebar you'll see small icons. A{' '}
        <strong>flask</strong> means the chapter has a lab activity. A{' '}
        <strong>question mark</strong> means a quiz is planned for that chapter. Chapters marked
        "soon" are planned but not yet written.
      </p>

      <Section id="callout-boxes">Callout boxes</Section>

      <p>
        Throughout the chapters you'll see coloured callout boxes. Each one has a different
        purpose — here's what they mean:
      </p>

      <Callout variant="danger">
        <strong>Safety-critical information.</strong> High voltage, RF exposure, or
        equipment-damage risks. Never skip these.
      </Callout>

      <Callout variant="key">
        <strong>Core takeaway</strong> — the idea you need to remember. If you skim a chapter,
        read at least these.
      </Callout>

      <Callout variant="tip">
        Practical wisdom from experienced operators. Shortcuts, best practices, and
        tricks of the trade.
      </Callout>

      <Callout variant="note">
        Background context or historical detail that enriches your understanding but isn't
        strictly required.
      </Callout>

      <Callout variant="caution">
        Common pitfalls and mistakes. Things that trip up beginners and veterans alike.
      </Callout>

      <Callout variant="experiment">
        Hands-on activity — build it, measure it, try it on your bench.
      </Callout>

      <Callout variant="onair">
        FCC rules, band plans, and on-air etiquette. Know these before you key up.
      </Callout>

      <Callout variant="math">
        Equations and derivations. Don't panic — they're simpler than they look.
      </Callout>

      <Section id="recommended-path">The recommended path</Section>

      <p>
        Start at <strong>Chapter 0.2 — Lab Bench Setup</strong> if you have any of the physical
        equipment. It walks you through getting comfortable with each instrument before you
        need them in later chapters.
      </p>

      <p>
        Then work through Part 0 (Foundations), Part 1 (Electricity and Circuits), and onwards.
        The Parts build on each other, but within a Part, individual chapters are fairly
        self-contained.
      </p>

      <Section id="note-on-maths">A note on maths</Section>

      <p>
        This site assumes only basic arithmetic: addition, subtraction, multiplication, division,
        fractions, and square roots. No calculus. Where a full derivation would need calculus, we
        skip it honestly — we'll say so, give you the result, and explain intuitively where it
        comes from.
      </p>

      <p>
        Chapter 0.3 covers the specific maths toolkit you'll need. If you're comfortable with
        scientific notation and SI prefixes (kHz, MHz, µF, pF…), you can skim it. If those feel
        uncertain, spend time there — they appear constantly.
      </p>

      <Section id="one-more-thing">One more thing</Section>

      <p>
        The goal is not to prepare you for an exam (though the content covers the full{' '}
        <G k="erc">ERC</G> Report 32 syllabus). The goal is to give you the kind of understanding
        where, when something odd happens on the air, you have a hypothesis — and when you read
        the <G k="arrl">ARRL</G> Handbook, it makes sense rather than feeling impenetrable.
      </p>

      <p>
        Enjoy the bench. Let's start with the instruments.
      </p>
    </>
  )
}
