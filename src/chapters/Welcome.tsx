import { Link } from 'react-router-dom'
import { PARTS } from '@/data/chapters'
import LogoIcon from '@/components/LogoIcon'
import HeroIllustration from '@/components/HeroIllustration'
import WelcomeBuddy from '@/components/WelcomeBuddy'

const stats = {
  chapters: PARTS.flatMap(p => p.chapters).length,
  labs: PARTS.flatMap(p => p.chapters).filter(c => c.hasLab).length,
  parts: PARTS.length,
}

export default function Welcome() {
  const firstChapter = PARTS[0].chapters[0]

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 space-y-12">
      {/* Hero */}
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <LogoIcon size={48} />
          <h1 className="text-3xl font-bold text-foreground">The Radio Bench</h1>
        </div>

        <div className="flex gap-5 items-start">
          <div className="space-y-4 flex-1">
            <p className="text-lg text-foreground/80 leading-relaxed">
              Welcome! Whether you just got your first licence, are studying for one, or simply want
              to understand how radio actually works — you're in the right place. This is a free,
              open learning course that takes you from zero to confident, one concept at a time.
            </p>

            <p className="text-muted-foreground leading-relaxed">
              No engineering degree required — not even close. Every idea starts with a plain-language
              explanation and a real-world analogy. Formulas appear only after the concept clicks, and
              they always come with a worked example and an interactive calculator so you can play with
              the numbers yourself. If a chapter touches something physical, there's an optional
              hands-on lab activity you can try on a real bench.
            </p>
          </div>

          <WelcomeBuddy size={110} className="text-primary shrink-0 hidden sm:block mt-1" />
        </div>

        <p className="text-muted-foreground leading-relaxed">
          Think of this as the course we wished existed when we were starting out: friendly,
          thorough, and honest about what matters and what you can safely skip.
        </p>

        <Link
          to={`/chapter/${firstChapter.id}`}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity"
        >
          Start from the beginning
          <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
            <path d="M6.22 3.22a.75.75 0 011.06 0l4.25 4.25a.75.75 0 010 1.06L7.28 12.78a.75.75 0 01-1.06-1.06L9.94 8 6.22 4.28a.75.75 0 010-1.06z"/>
          </svg>
        </Link>
      </div>

      {/* Hero illustration */}
      <HeroIllustration />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { value: stats.parts, label: 'Parts' },
          { value: stats.chapters, label: 'Chapters' },
          { value: stats.labs, label: 'Lab activities' },
        ].map(s => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-4 text-center">
            <div className="text-2xl font-bold text-primary font-mono">{s.value}</div>
            <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* What you'll need */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">What you'll need</h2>
        <p className="text-muted-foreground text-sm leading-relaxed">
          <strong className="text-foreground">Just a browser.</strong> Every chapter's text,
          diagrams, and interactive widgets work right here — nothing to install or buy. You can
          learn all the theory without touching a single piece of equipment.
        </p>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Some chapters include optional <strong className="text-foreground">hands-on lab
          activities</strong> (marked with a flask icon). These are for anyone who wants to go
          further and verify the theory on a real bench. You can skip every one of them and still
          get the full learning experience — or come back to them later when you have the gear.
          Here's what the labs use, roughly in order of how soon you'd want each one:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            ['Multimeter', 'Affordable starting point — measures voltage, current, and resistance'],
            ['Breadboard + components', 'Resistors, capacitors, jumper wires — a few dollars gets you started'],
            ['Arduino', 'A handy signal source for experiments — any Uno-compatible clone works'],
            ['Oscilloscope', 'See waveforms on screen — useful from Part I onwards'],
            ['VNA', 'Measures impedance and SWR — needed mainly in the antenna and filter chapters'],
          ].map(([tool, desc]) => (
            <div key={tool} className="flex gap-3 rounded-lg border border-border bg-card px-4 py-3">
              <span className="text-teal-500 mt-0.5 shrink-0">▸</span>
              <div>
                <div className="text-sm font-medium text-card-foreground">{tool}</div>
                <div className="text-xs text-muted-foreground">{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chapter overview */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">What's covered</h2>
        <div className="space-y-3">
          {PARTS.map(part => (
            <div key={part.number} className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="px-4 py-3 border-b border-border flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-primary">
                  {['0', 'I', 'II', 'III', 'IV'][part.number]}
                </span>
                <span className="text-sm font-semibold text-card-foreground">{part.title}</span>
                <span className="ml-auto text-xs text-muted-foreground">{part.chapters.length} chapters</span>
              </div>
              <div className="px-4 py-2 flex flex-wrap gap-1.5">
                {part.chapters.map(ch => (
                  <span key={ch.id} className="text-xs text-muted-foreground bg-muted rounded px-2 py-1">
                    {ch.number} {ch.title}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ERC 32 note */}
      <div className="rounded-xl border border-primary/30 bg-primary/5 p-5">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-primary shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
          </svg>
          <div>
            <p className="text-sm font-semibold text-primary mb-1">ERC Report 32 aligned</p>
            <p className="text-sm text-muted-foreground">
              Every topic in the CEPT Amateur Radio Novice Examination Syllabus (ERC Report 32) is
              covered somewhere in this course. The chapters go well beyond the exam requirements —
              the goal is real understanding, not just passing a test.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
