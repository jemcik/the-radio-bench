// Chapter 4.4 — Operating Procedures
import { useMemo } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { Section } from '@/components/ui/section-heading'
import { Callout } from '@/components/ui/callout'
import { G } from '@/features/glossary/glossary-term'
import { MathVar } from '@/components/ui/math'
import { mathComponents } from '@/lib/trans-defaults'
import LabActivity from '@/components/lab/LabActivity'
import Quiz, { buildQuizFromI18n } from '@/components/quiz/Quiz'
import { STORAGE_KEYS } from '@/lib/storage-keys'
import DiagramFigure from '@/components/diagrams/DiagramFigure'
import PhoneticAlphabetTable from '@/components/diagrams/PhoneticAlphabetTable'
import PhoneticSpeller from '@/components/widgets/PhoneticSpeller'
import QCodeFlashcards from '@/components/widgets/QCodeFlashcards'
import RstReportBuilder from '@/components/widgets/RstReportBuilder'
import CallsignDecoder from '@/components/widgets/CallsignDecoder'
import QsoTimeline from '@/components/diagrams/QsoTimeline'
import CallsignAnatomy from '@/components/diagrams/CallsignAnatomy'

const CHAPTER_ID = '4-4'
const QUIZ_QUESTION_COUNT = 15

export default function Chapter4_4() {
  const { t } = useTranslation('ui')

  const quizQuestions = useMemo(
    () => buildQuizFromI18n(t, 'ch4_4', QUIZ_QUESTION_COUNT, {
      strong: <strong />,
      em: <em />,
      var: <MathVar />,
    }),
    [t],
  )

  return (
    <>
      {/* ── Intro ──────────────────────────────────────────────── */}
      <p><Trans i18nKey="ch4_4.intro1" ns="ui" components={{ ...mathComponents, db: <G k="decibel" /> }} /></p>
      <p><Trans i18nKey="ch4_4.intro2" ns="ui" components={{ ...mathComponents }} /></p>
      <p><Trans i18nKey="ch4_4.intro3" ns="ui" components={{ ...mathComponents, em: <em /> }} /></p>

      {/* ── §1 Why the words are fixed ─────────────────────────── */}
      <Section id="why" labelKey="ch4_4.sectionWhy" />
      <p><Trans i18nKey="ch4_4.whyP1" ns="ui" components={{ ...mathComponents }} /></p>
      <p><Trans i18nKey="ch4_4.whyP2" ns="ui" components={{ ...mathComponents, em: <em /> }} /></p>
      <p><Trans i18nKey="ch4_4.whyP3" ns="ui" components={{ ...mathComponents }} /></p>
      <Callout variant="key">
        <p><Trans i18nKey="ch4_4.whyKey" ns="ui" components={{ ...mathComponents }} /></p>
      </Callout>
      <p><Trans i18nKey="ch4_4.whyP4" ns="ui" components={{ ...mathComponents, em: <em /> }} /></p>

      {/* ── §2 The phonetic alphabet ───────────────────────────── */}
      <Section id="phonetics" labelKey="ch4_4.sectionPhonetics" />
      <p><Trans i18nKey="ch4_4.phonP1" ns="ui" components={{ ...mathComponents, flt: <G k="filter" /> }} /></p>
      <p><Trans i18nKey="ch4_4.phonP2" ns="ui" components={{ ...mathComponents, ph: <G k="phonetic alphabet" />, itu: <G k="itu" /> }} /></p>
      <DiagramFigure caption={t('ch4_4.alphabetTableCaption')}>
        <PhoneticAlphabetTable />
      </DiagramFigure>
      <p><Trans i18nKey="ch4_4.phonP3" ns="ui" components={{ ...mathComponents, strong: <strong /> }} /></p>
      <p><Trans i18nKey="ch4_4.phonP4" ns="ui" components={{ ...mathComponents }} /></p>
      <PhoneticSpeller />
      <p><Trans i18nKey="ch4_4.phonP5" ns="ui" components={{ ...mathComponents }} /></p>
      <Callout variant="key">
        <p><Trans i18nKey="ch4_4.phonKey" ns="ui" components={{ ...mathComponents }} /></p>
      </Callout>
      <p><Trans i18nKey="ch4_4.phonP6" ns="ui" components={{ ...mathComponents }} /></p>
      <p><Trans i18nKey="ch4_4.phonP7" ns="ui" components={{ ...mathComponents }} /></p>
      <Callout variant="onair">
        <p><Trans i18nKey="ch4_4.phonOnair" ns="ui" components={{ ...mathComponents, em: <em /> }} /></p>
      </Callout>
      <Callout variant="note" title={t('ch4_4.phonUaTitle')}>
        <p><Trans i18nKey="ch4_4.phonUa" ns="ui" components={{ ...mathComponents, em: <em /> }} /></p>
      </Callout>

      {/* ── §3 Q-codes and abbreviations ───────────────────────── */}
      <Section id="qcodes" labelKey="ch4_4.sectionQcodes" />
      <p><Trans i18nKey="ch4_4.qcodeP1" ns="ui" components={{ ...mathComponents, qc: <G k="q-code" /> }} /></p>
      <p><Trans i18nKey="ch4_4.qcodeP2" ns="ui" components={{ ...mathComponents, strong: <strong />, qth: <G k="qth" /> }} /></p>
      <p><Trans i18nKey="ch4_4.qcodeP3" ns="ui" components={{ ...mathComponents, qrm: <G k="qrm" />, qrn: <G k="qrn" /> }} /></p>
      <QCodeFlashcards />
      <p><Trans i18nKey="ch4_4.qcodeP4" ns="ui" components={{ ...mathComponents, strong: <strong /> }} /></p>
      <Callout variant="caution">
        <p><Trans i18nKey="ch4_4.qcodeCaution" ns="ui" components={{ ...mathComponents, qso: <G k="qso" />, qsl: <G k="qsl" />, qrp: <G k="qrp" />, lb: <G k="logbook" /> }} /></p>
      </Callout>

      {/* ── §4 Signal reports ──────────────────────────────────── */}
      <Section id="rst" labelKey="ch4_4.sectionRst" />
      <p><Trans i18nKey="ch4_4.rstP1" ns="ui" components={{ ...mathComponents, rst: <G k="rst" /> }} /></p>
      <p><Trans i18nKey="ch4_4.rstP2" ns="ui" components={{ ...mathComponents, strong: <strong /> }} /></p>
      <p><Trans i18nKey="ch4_4.rstP3" ns="ui" components={{ ...mathComponents, strong: <strong /> }} /></p>
      <RstReportBuilder />
      <Callout variant="note">
        <p><Trans i18nKey="ch4_4.rstNote" ns="ui" components={{ ...mathComponents }} /></p>
      </Callout>
      <Callout variant="key">
        <p><Trans i18nKey="ch4_4.rstKey" ns="ui" components={{ ...mathComponents }} /></p>
      </Callout>

      {/* ── §5 The shape of a contact ──────────────────────────── */}
      <Section id="qso" labelKey="ch4_4.sectionQso" />
      <p><Trans i18nKey="ch4_4.qsoP1" ns="ui" components={{ ...mathComponents }} /></p>
      <p><Trans i18nKey="ch4_4.qsoP2" ns="ui" components={{ ...mathComponents, strong: <strong /> }} /></p>
      <p><Trans i18nKey="ch4_4.qsoP3" ns="ui" components={{ ...mathComponents, strong: <strong />, cq: <G k="cq" /> }} /></p>
      <p><Trans i18nKey="ch4_4.qsoP4" ns="ui" components={{ ...mathComponents }} /></p>
      <DiagramFigure caption={t('ch4_4.qsoTimelineCaption')}>
        <QsoTimeline />
      </DiagramFigure>
      <p><Trans i18nKey="ch4_4.qsoP5" ns="ui" components={{ ...mathComponents, strong: <strong />, em: <em /> }} /></p>
      <p><Trans i18nKey="ch4_4.qsoP6" ns="ui" components={{ ...mathComponents, rp: <G k="repeater" />, sx: <G k="simplex" />, dx2: <G k="duplex" /> }} /></p>
      <Callout variant="key">
        <p><Trans i18nKey="ch4_4.qsoKey" ns="ui" components={{ ...mathComponents }} /></p>
      </Callout>

      {/* ── §6 Call signs ──────────────────────────────────────── */}
      <Section id="callsigns" labelKey="ch4_4.sectionCallsigns" />
      <p><Trans i18nKey="ch4_4.csP1" ns="ui" components={{ ...mathComponents, cs: <G k="callsign" />, itu: <G k="itu" /> }} /></p>
      <p><Trans i18nKey="ch4_4.csP2" ns="ui" components={{ ...mathComponents, cp: <G k="call sign prefix" /> }} /></p>
      <p><Trans i18nKey="ch4_4.csP3" ns="ui" components={{ ...mathComponents }} /></p>
      <DiagramFigure caption={t('ch4_4.callsignAnatomyCaption')}>
        <CallsignAnatomy />
      </DiagramFigure>
      <p><Trans i18nKey="ch4_4.csP4" ns="ui" components={{ ...mathComponents }} /></p>
      <Callout variant="note" title={t('ch4_4.csUaTitle')}>
        <p><Trans i18nKey="ch4_4.csP5" ns="ui" components={{ ...mathComponents, em: <em />, bc: <G k="beacon" />, rp: <G k="repeater" /> }} /></p>
        <p><Trans i18nKey="ch4_4.csP6" ns="ui" components={{ ...mathComponents, strong: <strong /> }} /></p>
      </Callout>
      <p><Trans i18nKey="ch4_4.csP7" ns="ui" components={{ ...mathComponents }} /></p>
      <CallsignDecoder />
      <p><Trans i18nKey="ch4_4.csP8" ns="ui" components={{ ...mathComponents, strong: <strong />, em: <em /> }} /></p>
      <Callout variant="onair">
        <p><Trans i18nKey="ch4_4.csIdent" ns="ui" components={{ ...mathComponents }} /></p>
      </Callout>
      <Callout variant="key">
        <p><Trans i18nKey="ch4_4.csKey" ns="ui" components={{ ...mathComponents }} /></p>
      </Callout>

      {/* ── §7 What you may send ───────────────────────────────── */}
      <Section id="content" labelKey="ch4_4.sectionContent" />
      <p><Trans i18nKey="ch4_4.conP1" ns="ui" components={{ ...mathComponents }} /></p>
      <p><Trans i18nKey="ch4_4.conP2" ns="ui" components={{ ...mathComponents, strong: <strong /> }} /></p>
      <p><Trans i18nKey="ch4_4.conP3" ns="ui" components={{ ...mathComponents, strong: <strong /> }} /></p>
      <p><Trans i18nKey="ch4_4.conP4" ns="ui" components={{ ...mathComponents, strong: <strong />, em: <em /> }} /></p>
      <p><Trans i18nKey="ch4_4.conP5" ns="ui" components={{ ...mathComponents, strong: <strong />, tp: <G k="third-party traffic" /> }} /></p>
      <p><Trans i18nKey="ch4_4.conP6" ns="ui" components={{ ...mathComponents, bp: <G k="band plan" /> }} /></p>
      <Callout variant="onair">
        <p><Trans i18nKey="ch4_4.conOnair" ns="ui" components={{ ...mathComponents }} /></p>
      </Callout>
      <Callout variant="key">
        <p><Trans i18nKey="ch4_4.conKey" ns="ui" components={{ ...mathComponents }} /></p>
      </Callout>

      {/* ── Lab ────────────────────────────────────────────────── */}
      <LabActivity
        label="4.4"
        goal={<Trans i18nKey="ch4_4.labGoal" ns="ui" components={{ ...mathComponents }} />}
        equipment={[t('ch4_4.labEquip1'), t('ch4_4.labEquip2')]}
        components={[t('ch4_4.labComp1'), t('ch4_4.labComp2'), t('ch4_4.labComp3')]}
        procedure={[
          { text: <Trans i18nKey="ch4_4.labStep1" ns="ui" components={{ ...mathComponents, strong: <strong /> }} /> },
          { text: <Trans i18nKey="ch4_4.labStep2" ns="ui" components={{ ...mathComponents, strong: <strong /> }} /> },
          { text: <Trans i18nKey="ch4_4.labStep3" ns="ui" components={{ ...mathComponents, strong: <strong /> }} /> },
          { text: <Trans i18nKey="ch4_4.labStep4" ns="ui" components={{ ...mathComponents, strong: <strong /> }} /> },
          { text: <Trans i18nKey="ch4_4.labStep5" ns="ui" components={{ ...mathComponents, strong: <strong /> }} /> },
        ]}
        expectedResult={<Trans i18nKey="ch4_4.labExpected" ns="ui" components={{ ...mathComponents }} />}
        connectionToTheory={<Trans i18nKey="ch4_4.labConnection" ns="ui" components={{ ...mathComponents }} />}
        troubleshooting={[
          <Trans key="t1" i18nKey="ch4_4.labTrouble1" ns="ui" components={{ ...mathComponents }} />,
          <Trans key="t2" i18nKey="ch4_4.labTrouble2" ns="ui" components={{ ...mathComponents }} />,
          <Trans key="t3" i18nKey="ch4_4.labTrouble3" ns="ui" components={{ ...mathComponents }} />,
        ]}
      />
      <Callout variant="note">
        <p><Trans i18nKey="ch4_4.labNote" ns="ui" components={{ ...mathComponents }} /></p>
      </Callout>

      {/* ── Quiz ───────────────────────────────────────────────── */}
      <Quiz
        title={t('ch4_4.quizTitle')}
        questions={quizQuestions}
        storageKey={STORAGE_KEYS.quizProgress(CHAPTER_ID)}
      />
    </>
  )
}
