// Chapter 4.5 — Regulations
//
// The last chapter of the course. It runs treaty → regional agreement →
// national law, in that order, because that is the order the rules are
// actually made in and most confusion about them comes from mistaking one
// layer for another.
//
// Every figure is promised by the paragraph immediately above it, and every
// Ukrainian fact traces to постанова НКЕК від 10.05.2023 № 173 and its
// appendices — see the header comment in each diagram for the exact clause.
import { useMemo } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { Section } from '@/components/ui/section-heading'
import { Callout } from '@/components/ui/callout'
import { G } from '@/features/glossary/glossary-term'
import { MathVar } from '@/components/ui/math'
import { mathComponents } from '@/lib/trans-defaults'
import Quiz, { buildQuizFromI18n } from '@/components/quiz/Quiz'
import { STORAGE_KEYS } from '@/lib/storage-keys'
import DiagramFigure from '@/components/diagrams/DiagramFigure'
import ItuRegionsMap from '@/components/diagrams/ItuRegionsMap'
import LicenceLadder from '@/components/diagrams/LicenceLadder'
import CeptPortability from '@/components/diagrams/CeptPortability'
import AllocationVsPlanVsLicence from '@/components/diagrams/AllocationVsPlanVsLicence'
import BandPrivilegeExplorer from '@/components/widgets/BandPrivilegeExplorer'
import LogEntryBuilder from '@/components/widgets/LogEntryBuilder'

const CHAPTER_ID = '4-5'
const QUIZ_QUESTION_COUNT = 15

export default function Chapter4_5() {
  const { t } = useTranslation('ui')

  const quizQuestions = useMemo(
    () =>
      buildQuizFromI18n(t, 'ch4_5', QUIZ_QUESTION_COUNT, {
        strong: <strong />,
        em: <em />,
        var: <MathVar />,
      }),
    [t],
  )

  return (
    <>
      {/* ── Intro ──────────────────────────────────────────────── */}
      <p><Trans i18nKey="ch4_5.intro1" ns="ui" components={{ ...mathComponents }} /></p>
      <p><Trans i18nKey="ch4_5.intro2" ns="ui" components={{ ...mathComponents }} /></p>
      <p><Trans i18nKey="ch4_5.intro3" ns="ui" components={{ ...mathComponents, em: <em /> }} /></p>

      {/* ── §1 Why radio has a rule book ───────────────────────── */}
      <Section id="why" labelKey="ch4_5.sectionWhy" />
      <p><Trans i18nKey="ch4_5.whyP1" ns="ui" components={{ ...mathComponents }} /></p>
      <p><Trans i18nKey="ch4_5.whyP2" ns="ui" components={{ ...mathComponents }} /></p>
      <p><Trans i18nKey="ch4_5.whyP3" ns="ui" components={{ ...mathComponents }} /></p>
      <Callout variant="key">
        <p><Trans i18nKey="ch4_5.whyKey" ns="ui" components={{ ...mathComponents }} /></p>
      </Callout>

      {/* ── §2 The ITU and the Radio Regulations ───────────────── */}
      <Section id="itu" labelKey="ch4_5.sectionItu" />
      <p><Trans i18nKey="ch4_5.ituP1" ns="ui" components={{ ...mathComponents, itu: <G k="itu" />, rr: <G k="radio regulations" /> }} /></p>
      <p><Trans i18nKey="ch4_5.ituP2" ns="ui" components={{ ...mathComponents, ams: <G k="amateur-satellite service" /> , rp: <G k="repeater" />}} /></p>
      <p><Trans i18nKey="ch4_5.ituP3" ns="ui" components={{ ...mathComponents , strong: <strong />}} /></p>
      {/* The four provisions are a LIST, not four sentences in a paragraph.
          They used to run on, and a reader told «four of its provisions» then
          handed a continuous paragraph has to work out where each one starts
          and stops — announcing a count and not making it countable. */}
      <ul className="list-disc pl-6 space-y-1 text-foreground">
        <li><Trans i18nKey="ch4_5.ituArt1" ns="ui" components={{ ...mathComponents }} /></li>
        <li><Trans i18nKey="ch4_5.ituArt2" ns="ui" components={{ ...mathComponents }} /></li>
        <li><Trans i18nKey="ch4_5.ituArt3" ns="ui" components={{ ...mathComponents }} /></li>
        <li><Trans i18nKey="ch4_5.ituArt4" ns="ui" components={{ ...mathComponents }} /></li>
      </ul>
      <p><Trans i18nKey="ch4_5.ituP4" ns="ui" components={{ ...mathComponents, em: <em /> }} /></p>
      <p><Trans i18nKey="ch4_5.ituP5" ns="ui" components={{ ...mathComponents }} /></p>
      <DiagramFigure caption={t('ch4_5.regionsCaption')}>
        <ItuRegionsMap />
      </DiagramFigure>
      <Callout variant="key">
        <p><Trans i18nKey="ch4_5.ituKey" ns="ui" components={{ ...mathComponents }} /></p>
      </Callout>

      {/* ── §3 CEPT ────────────────────────────────────────────── */}
      <Section id="cept" labelKey="ch4_5.sectionCept" />
      <p><Trans i18nKey="ch4_5.ceptP1" ns="ui" components={{ ...mathComponents, cept: <G k="cept" /> }} /></p>
      <p><Trans i18nKey="ch4_5.ceptP2" ns="ui" components={{ ...mathComponents, em: <em /> }} /></p>
      <p><Trans i18nKey="ch4_5.ceptP3" ns="ui" components={{ ...mathComponents, harec: <G k="harec" /> , strong: <strong />}} /></p>
      <p><Trans i18nKey="ch4_5.ceptP4" ns="ui" components={{ ...mathComponents , cs: <G k="callsign" />}} /></p>
      <DiagramFigure caption={t('ch4_5.ceptCaption')}>
        <CeptPortability />
      </DiagramFigure>
      <p><Trans i18nKey="ch4_5.ceptP5" ns="ui" components={{ ...mathComponents , strong: <strong />}} /></p>
      <Callout variant="key">
        <p><Trans i18nKey="ch4_5.ceptKey" ns="ui" components={{ ...mathComponents }} /></p>
      </Callout>

      {/* ── §4 Allocation, band plan, licence conditions ───────── */}
      <Section id="layers" labelKey="ch4_5.sectionLayers" />
      <p><Trans i18nKey="ch4_5.layersP1" ns="ui" components={{ ...mathComponents }} /></p>
      <p><Trans i18nKey="ch4_5.layersP2" ns="ui" components={{ ...mathComponents, prim: <G k="primary allocation" />, sec: <G k="secondary allocation" /> }} /></p>
      <p><Trans i18nKey="ch4_5.layersP3" ns="ui" components={{ ...mathComponents, bp: <G k="band plan" />, cw: <G k="cw" /> , iaru: <G k="iaru" />}} /></p>
      <p><Trans i18nKey="ch4_5.layersP4" ns="ui" components={{ ...mathComponents , strong: <strong />}} /></p>
      <DiagramFigure caption={t('ch4_5.allocCaption')}>
        <AllocationVsPlanVsLicence />
      </DiagramFigure>
      <p><Trans i18nKey="ch4_5.layersP5" ns="ui" components={{ ...mathComponents , strong: <strong />}} /></p>
      <Callout variant="key">
        <p><Trans i18nKey="ch4_5.layersKey" ns="ui" components={{ ...mathComponents, em: <em /> }} /></p>
      </Callout>

      {/* ── §5 How it works in Ukraine ─────────────────────────── */}
      <Section id="ukraine" labelKey="ch4_5.sectionUkraine" />
      <p><Trans i18nKey="ch4_5.uaP1" ns="ui" components={{ ...mathComponents , strong: <strong />}} /></p>
      <p><Trans i18nKey="ch4_5.uaP2" ns="ui" components={{ ...mathComponents , strong: <strong />}} /></p>
      <p><Trans i18nKey="ch4_5.uaP3" ns="ui" components={{ ...mathComponents }} /></p>
      <DiagramFigure caption={t('ch4_5.ladderCaption')}>
        <LicenceLadder />
      </DiagramFigure>
      <p><Trans i18nKey="ch4_5.uaP4" ns="ui" components={{ ...mathComponents , strong: <strong />}} /></p>
      <p><Trans i18nKey="ch4_5.uaP5" ns="ui" components={{ ...mathComponents }} /></p>
      <p><Trans i18nKey="ch4_5.uaP6" ns="ui" components={{ ...mathComponents , strong: <strong />}} /></p>
      <p><Trans i18nKey="ch4_5.uaP7" ns="ui" components={{ ...mathComponents , strong: <strong />}} /></p>
      <BandPrivilegeExplorer />
      <Callout variant="onair">
        <p><Trans i18nKey="ch4_5.uaOnair" ns="ui" components={{ ...mathComponents }} /></p>
      </Callout>
      <Callout variant="key">
        <p><Trans i18nKey="ch4_5.uaKey" ns="ui" components={{ ...mathComponents , strong: <strong />}} /></p>
      </Callout>

      {/* ── §6 The station log ─────────────────────────────────── */}
      <Section id="log" labelKey="ch4_5.sectionLog" />
      <p><Trans i18nKey="ch4_5.logP1" ns="ui" components={{ ...mathComponents, em: <em /> }} /></p>
      <p><Trans i18nKey="ch4_5.logP2" ns="ui" components={{ ...mathComponents }} /></p>
      <ul className="list-disc pl-6 space-y-1 text-foreground">
        <li><Trans i18nKey="ch4_5.logField1" ns="ui" components={{ ...mathComponents }} /></li>
        <li><Trans i18nKey="ch4_5.logField2" ns="ui" components={{ ...mathComponents }} /></li>
        <li><Trans i18nKey="ch4_5.logField3" ns="ui" components={{ ...mathComponents }} /></li>
      </ul>
      <p><Trans i18nKey="ch4_5.logP3" ns="ui" components={{ ...mathComponents}} /></p>
      <p><Trans i18nKey="ch4_5.logP4" ns="ui" components={{ ...mathComponents, qsl: <G k="qsl" /> }} /></p>
      <LogEntryBuilder />
      <Callout variant="key">
        <p><Trans i18nKey="ch4_5.logKey" ns="ui" components={{ ...mathComponents }} /></p>
      </Callout>

      {/* ── §7 Where the rules actually bite ───────────────────── */}
      <Section id="rules" labelKey="ch4_5.sectionRules" />
      <p><Trans i18nKey="ch4_5.rulesP1" ns="ui" components={{ ...mathComponents }} /></p>
      <p><Trans i18nKey="ch4_5.rulesP2" ns="ui" components={{ ...mathComponents }} /></p>
      <p><Trans i18nKey="ch4_5.rulesP3" ns="ui" components={{ ...mathComponents }} /></p>
      {/* A list the prose calls a list. It used to be seven «No …» sentences
          run together in one paragraph — the same defect as Article 25 in §2,
          and fixing only that one left this one standing. */}
      <ul className="list-disc pl-6 space-y-1 text-foreground">
        <li><Trans i18nKey="ch4_5.rulesBan1" ns="ui" components={{ ...mathComponents }} /></li>
        <li><Trans i18nKey="ch4_5.rulesBan2" ns="ui" components={{ ...mathComponents }} /></li>
        <li><Trans i18nKey="ch4_5.rulesBan3" ns="ui" components={{ ...mathComponents }} /></li>
        <li><Trans i18nKey="ch4_5.rulesBan4" ns="ui" components={{ ...mathComponents }} /></li>
        <li><Trans i18nKey="ch4_5.rulesBan5" ns="ui" components={{ ...mathComponents }} /></li>
        <li><Trans i18nKey="ch4_5.rulesBan6" ns="ui" components={{ ...mathComponents }} /></li>
        <li><Trans i18nKey="ch4_5.rulesBan7" ns="ui" components={{ ...mathComponents, spur: <G k="spurious" /> }} /></li>
      </ul>
      <p><Trans i18nKey="ch4_5.rulesP4" ns="ui" components={{ ...mathComponents }} /></p>
      <p><Trans i18nKey="ch4_5.rulesP5" ns="ui" components={{ ...mathComponents , tp: <G k="third-party traffic" />}} /></p>
      <Callout variant="onair">
        <p><Trans i18nKey="ch4_5.rulesOnair" ns="ui" components={{ ...mathComponents, iaru: <G k="iaru" /> , qrp: <G k="qrp" />}} /></p>
      </Callout>
      <Callout variant="key">
        <p><Trans i18nKey="ch4_5.rulesKey" ns="ui" components={{ ...mathComponents }} /></p>
      </Callout>

      {/* ── §8 What comes next ─────────────────────────────────── */}
      <Section id="next" labelKey="ch4_5.sectionNext" />
      <p><Trans i18nKey="ch4_5.nextP1" ns="ui" components={{ ...mathComponents , bw: <G k="bandwidth" />, flt: <G k="filter" />}} /></p>
      <p><Trans i18nKey="ch4_5.nextP2" ns="ui" components={{ ...mathComponents , strong: <strong />}} /></p>
      <p><Trans i18nKey="ch4_5.nextP3" ns="ui" components={{ ...mathComponents , strong: <strong />}} /></p>

      {/* ── Quiz ───────────────────────────────────────────────── */}
      <Quiz
        title={t('ch4_5.quizTitle')}
        questions={quizQuestions}
        storageKey={STORAGE_KEYS.quizProgress(CHAPTER_ID)}
      />
    </>
  )
}
