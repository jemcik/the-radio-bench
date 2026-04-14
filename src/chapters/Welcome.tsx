import { Link } from 'react-router-dom'
import { useTranslation, Trans } from 'react-i18next'
import { ChevronRight, Info } from 'lucide-react'
import { PARTS } from '@/data/chapters'
import { useTranslatedParts } from '@/data/useTranslatedChapters'
import LogoIcon from '@/components/LogoIcon'
import HeroIllustration from '@/components/HeroIllustration'
import WelcomeBuddy from '@/components/WelcomeBuddy'
import { G } from '@/features/glossary/glossary-term'
import { BookmarkButton } from '@/features/bookmarks/bookmark-button'
import { Card } from '@/components/ui/card'
import LanguageBanner from '@/components/LanguageBanner'

const stats = {
  chapters: PARTS.flatMap(p => p.chapters).length,
  labs: PARTS.flatMap(p => p.chapters).filter(c => c.hasLab).length,
  parts: PARTS.length,
}

export default function Welcome() {
  const { t } = useTranslation('ui')
  const translatedParts = useTranslatedParts()
  const firstChapter = translatedParts[0].chapters[0]

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 space-y-12">
      <LanguageBanner />

      {/* Hero */}
      <div className="relative rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/[0.04] via-transparent to-primary/[0.06] p-6 sm:p-8 overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-primary/[0.06] blur-3xl pointer-events-none" />

        <div className="relative space-y-5">
          <div className="flex items-center gap-3">
            <LogoIcon size={48} />
            <h1 className="text-3xl font-bold text-foreground">{t('welcome.heading')}</h1>
            <WelcomeBuddy size={52} className="text-primary shrink-0 hidden sm:block" />
          </div>

          <p className="text-lg text-foreground/80 leading-relaxed text-justify">
            {t('welcome.introParagraph')}
          </p>

          <p className="text-muted-foreground leading-relaxed text-justify">
            <Trans
              i18nKey="welcome.detailParagraph"
              ns="ui"
              components={{
                glossaryWrap: <span data-tour="glossary-term" />,
                glossary: <G k="voltage" />,
              }}
            />
          </p>

          <p className="text-muted-foreground leading-relaxed text-justify">
            {t('welcome.closingParagraph')}
          </p>

          <div className="flex flex-wrap gap-3 pt-1">
            <Link
              to={`/chapter/${firstChapter.id}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity"
            >
              {t('welcome.startBasics')}
              <ChevronRight className="w-4 h-4" aria-hidden />
            </Link>
            <button
              onClick={() => document.getElementById('whats-covered')?.scrollIntoView({ behavior: 'smooth' })}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              {t('welcome.browseChapters')}
            </button>
          </div>
        </div>
      </div>

      {/* Hero illustration */}
      <HeroIllustration />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { value: stats.parts, label: t('welcome.statParts') },
          { value: stats.chapters, label: t('welcome.statChapters') },
          { value: stats.labs, label: t('welcome.statLabs') },
        ].map(s => (
          <Card key={s.label} className="p-4 text-center">
            <div className="text-2xl font-bold text-primary font-mono">{s.value}</div>
            <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
          </Card>
        ))}
      </div>

      {/* What you'll need */}
      <div className="space-y-4">
        <div className="flex items-center gap-1">
          <h2 id="what-youll-need" className="text-lg font-semibold text-foreground scroll-mt-20">{t('welcome.whatYouNeed')}</h2>
          <span data-tour="bookmark-demo">
            <BookmarkButton
              chapterId="welcome"
              sectionId="what-youll-need"
              label={t('welcome.whatYouNeed')}
              labelKey="welcome.whatYouNeed"
              size="sm"
            />
          </span>
        </div>
        <p className="text-muted-foreground text-sm leading-relaxed">
          <Trans
            i18nKey="welcome.justBrowserDetail"
            ns="ui"
            components={{ strong: <strong className="text-foreground" /> }}
          />
        </p>
        <p className="text-muted-foreground text-sm leading-relaxed">
          {t('welcome.handsOnLabsDetail')}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {([
            [t('welcome.multimeter'), t('welcome.multimeterDesc')],
            [t('welcome.breadboard'), t('welcome.breadboardDesc')],
            [t('welcome.arduino'), t('welcome.arduinoDesc')],
            [t('welcome.oscilloscope'), t('welcome.oscilloscopeDesc')],
            [t('welcome.vna'), t('welcome.vnaDesc')],
          ] as const).map(([tool, desc]) => (
            <Card key={tool} radius="lg" className="flex gap-3 px-4 py-3">
              <span className="text-teal-500 mt-0.5 shrink-0">▸</span>
              <div>
                <div className="text-sm font-medium text-card-foreground">{tool}</div>
                <div className="text-xs text-muted-foreground">{desc}</div>
              </div>
            </Card>
          ))}
        </div>
        <p className="text-muted-foreground text-sm leading-relaxed">
          <Trans
            i18nKey="welcome.termsHighlighted"
            ns="ui"
            components={{ term: <G k="impedance" /> }}
          />
        </p>
      </div>

      {/* Chapter overview */}
      <div id="whats-covered" className="space-y-4 scroll-mt-20">
        <h2 className="text-lg font-semibold text-foreground">{t('welcome.whatsCovered')}</h2>
        <div className="space-y-3">
          {translatedParts.map(part => (
            <Card key={part.number} className="overflow-hidden">
              <div className="px-4 py-3 border-b border-border flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-primary">
                  {['0', 'I', 'II', 'III', 'IV'][part.number]}
                </span>
                <span className="text-sm font-semibold text-card-foreground">{part.title}</span>
                <span className="ml-auto text-xs text-muted-foreground">{part.chapters.length} {t('welcome.chapters')}</span>
              </div>
              <div className="px-4 py-2 flex flex-wrap gap-1.5">
                {part.chapters.map(ch => {
                  const isClickable = ch.status !== 'coming-soon'
                  return isClickable ? (
                    <Link
                      key={ch.id}
                      to={`/chapter/${ch.id}`}
                      className="text-xs bg-muted rounded px-2 py-1 text-primary hover:bg-primary/10 transition-colors"
                    >
                      {ch.number} {ch.title}
                    </Link>
                  ) : (
                    <span key={ch.id} className="text-xs text-muted-foreground/60 bg-muted rounded px-2 py-1">
                      {ch.number} {ch.title}
                    </span>
                  )
                })}
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* ERC 32 note */}
      <Card surface="accent" className="p-5">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" aria-hidden />
          <div>
            <p className="text-sm font-semibold text-primary mb-1">{t('welcome.ercAligned')}</p>
            <p className="text-sm text-muted-foreground">
              {t('welcome.ercDetail')}
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
