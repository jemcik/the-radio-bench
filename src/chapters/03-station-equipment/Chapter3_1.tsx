// Chapter 3.1 — Receivers: How Your Radio Hears
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
import ReceiverJobsDiagram from '@/components/diagrams/ReceiverJobsDiagram'
import TrfReceiverBlocks from '@/components/diagrams/TrfReceiverBlocks'
import HeterodyneMixingDiagram from '@/components/diagrams/HeterodyneMixingDiagram'
import SuperhetBlockDiagram from '@/components/diagrams/SuperhetBlockDiagram'
import ImageFrequencyDiagram from '@/components/diagrams/ImageFrequencyDiagram'
import ModeDetectorComparison from '@/components/diagrams/ModeDetectorComparison'
import CrystalRadioSchematic from '@/components/diagrams/CrystalRadioSchematic'
import MixerImageCalculator from '@/components/widgets/MixerImageCalculator'

const CHAPTER_ID = '3-1'
const QUIZ_QUESTION_COUNT = 10

export default function Chapter3_1() {
  const { t } = useTranslation('ui')

  const quizQuestions = useMemo(
    () => buildQuizFromI18n(t, 'ch3_1', QUIZ_QUESTION_COUNT, {
      strong: <strong />,
      em: <em />,
      var: <MathVar />,
    }),
    [t],
  )

  return (
    <>
      {/* ── Intro ──────────────────────────────────────────────── */}
      <p><Trans i18nKey="ch3_1.intro1" ns="ui" components={{ ...mathComponents, freq: <G k="frequency" />, ssb: <G k="ssb" /> }} /></p>
      <p><Trans i18nKey="ch3_1.intro2" ns="ui" components={{ ...mathComponents, em: <em />, superhet: <G k="superheterodyne" />, imgf: <G k="image frequency" />, filt: <G k="filter" />, am: <G k="am" />, ssb: <G k="ssb" />, cw: <G k="cw" />, fm: <G k="fm" /> }} /></p>

      {/* ── §1 The three jobs ──────────────────────────────────── */}
      <Section id="jobs" labelKey="ch3_1.sectionJobs" />
      <p><Trans i18nKey="ch3_1.jobsP1" ns="ui" components={{ ...mathComponents }} /></p>
      <p><Trans i18nKey="ch3_1.jobsP2" ns="ui" components={{ ...mathComponents, strong: <strong />, sel: <G k="selectivity" />, sens: <G k="sensitivity" /> }} /></p>
      <ReceiverJobsDiagram />
      <p><Trans i18nKey="ch3_1.jobsP3" ns="ui" components={{ ...mathComponents, em: <em />, strong: <strong /> }} /></p>

      {/* ── §2 The straight (TRF) receiver ─────────────────────── */}
      <Section id="trf" labelKey="ch3_1.sectionTrf" />
      <p><Trans i18nKey="ch3_1.trfP1" ns="ui" components={{ ...mathComponents, em: <em />, sel: <G k="selectivity" />, trf: <G k="trf" /> }} /></p>
      <TrfReceiverBlocks />
      <p><Trans i18nKey="ch3_1.trfP2" ns="ui" components={{ ...mathComponents, em: <em />, bw: <G k="bandwidth" /> }} /></p>

      {/* ── §3 The heterodyne trick ────────────────────────────── */}
      <Section id="heterodyne" labelKey="ch3_1.sectionHeterodyne" />
      <p><Trans i18nKey="ch3_1.hetP1" ns="ui" components={{ ...mathComponents, em: <em />, strong: <strong /> }} /></p>
      <p><Trans i18nKey="ch3_1.hetP2" ns="ui" components={{ ...mathComponents, em: <em />, mixer: <G k="mixer" />, lo: <G k="local oscillator" />, intf: <G k="intermediate frequency" /> }} /></p>
      <Callout variant="math">
        <p className="text-center text-base"><Trans i18nKey="ch3_1.hetFormula" ns="ui" components={{ ...mathComponents }} /></p>
      </Callout>
      <p><Trans i18nKey="ch3_1.hetP3" ns="ui" components={{ ...mathComponents, em: <em /> }} /></p>
      <HeterodyneMixingDiagram />
      <p><Trans i18nKey="ch3_1.hetP4" ns="ui" components={{ ...mathComponents, em: <em /> }} /></p>

      {/* ── §4 The superheterodyne, stage by stage ─────────────── */}
      <Section id="blocks" labelKey="ch3_1.sectionBlocks" />
      <p><Trans i18nKey="ch3_1.blocksP1" ns="ui" components={{ ...mathComponents, superhet: <G k="superheterodyne" /> }} /></p>
      <p><Trans i18nKey="ch3_1.blocksP2" ns="ui" components={{ ...mathComponents }} /></p>
      <SuperhetBlockDiagram />

      {/* ── §5 The image frequency ─────────────────────────────── */}
      <Section id="image" labelKey="ch3_1.sectionImage" />
      <p><Trans i18nKey="ch3_1.imgP1" ns="ui" components={{ ...mathComponents, em: <em />, imgf: <G k="image frequency" /> }} /></p>
      <p><Trans i18nKey="ch3_1.imgP2" ns="ui" components={{ ...mathComponents }} /></p>
      <Callout variant="math">
        <p className="text-center text-base"><Trans i18nKey="ch3_1.imgFormula" ns="ui" components={{ ...mathComponents }} /></p>
      </Callout>
      <p><Trans i18nKey="ch3_1.imgP3" ns="ui" components={{ ...mathComponents, em: <em /> }} /></p>
      <ImageFrequencyDiagram />
      <p><Trans i18nKey="ch3_1.imgP4" ns="ui" components={{ ...mathComponents, em: <em /> }} /></p>
      <MixerImageCalculator />

      {/* ── §6 One front end, four detectors ───────────────────── */}
      <Section id="modes" labelKey="ch3_1.sectionModes" />
      <p><Trans i18nKey="ch3_1.modesP1" ns="ui" components={{ ...mathComponents, em: <em />, det: <G k="detector" />, mod: <G k="modulation" /> }} /></p>
      <ModeDetectorComparison />
      <p><Trans i18nKey="ch3_1.modesP2" ns="ui" components={{ ...mathComponents, strong: <strong />, am: <G k="am" />, env: <G k="envelope" />, diode: <G k="diode" />, cap: <G k="capacitor" /> }} /></p>
      <p><Trans i18nKey="ch3_1.modesP3" ns="ui" components={{ ...mathComponents, strong: <strong />, ssb: <G k="ssb" />, sideband: <G k="sideband" />, carrier: <G k="carrier" />, bfo: <G k="bfo" /> }} /></p>
      <p><Trans i18nKey="ch3_1.modesP4" ns="ui" components={{ ...mathComponents, strong: <strong />, cw: <G k="cw" /> }} /></p>
      <p><Trans i18nKey="ch3_1.modesP5" ns="ui" components={{ ...mathComponents, strong: <strong />, fm: <G k="fm" />, lim: <G k="limiter" />, disc: <G k="discriminator" />, squelch: <G k="squelch" /> }} /></p>

      {/* ── Summary ────────────────────────────────────────────── */}
      <Section id="summary" labelKey="ch3_1.sectionSummary" />
      <Callout variant="key">
        <ul className="list-disc pl-5 space-y-2">
          <li><Trans i18nKey="ch3_1.keyTakeaway1" ns="ui" components={{ ...mathComponents, strong: <strong />, sel: <G k="selectivity" />, sens: <G k="sensitivity" /> }} /></li>
          <li><Trans i18nKey="ch3_1.keyTakeaway2" ns="ui" components={{ ...mathComponents, trf: <G k="trf" /> }} /></li>
          <li><Trans i18nKey="ch3_1.keyTakeaway3" ns="ui" components={{ ...mathComponents, strong: <strong />, lo: <G k="local oscillator" />, intf: <G k="intermediate frequency" /> }} /></li>
          <li><Trans i18nKey="ch3_1.keyTakeaway4" ns="ui" components={{ ...mathComponents, superhet: <G k="superheterodyne" /> }} /></li>
          <li><Trans i18nKey="ch3_1.keyTakeaway5" ns="ui" components={{ ...mathComponents, em: <em />, imgf: <G k="image frequency" /> }} /></li>
          <li><Trans i18nKey="ch3_1.keyTakeaway6" ns="ui" components={{ ...mathComponents, am: <G k="am" />, fm: <G k="fm" />, ssb: <G k="ssb" />, cw: <G k="cw" />, det: <G k="detector" />, env: <G k="envelope" />, bfo: <G k="bfo" />, lim: <G k="limiter" />, disc: <G k="discriminator" />, squelch: <G k="squelch" /> }} /></li>
        </ul>
      </Callout>

      {/* ── Lab ────────────────────────────────────────────────── */}
      <LabActivity
        label="3.1"
        goal={<Trans i18nKey="ch3_1.labGoal" ns="ui" components={{ ...mathComponents, strong: <strong />, trf: <G k="trf" /> }} />}
        equipment={[t('ch3_1.labEquip1'), t('ch3_1.labEquip2')]}
        components={[
          t('ch3_1.labComp1'),
          t('ch3_1.labComp2'),
          t('ch3_1.labComp3'),
          <Trans key="lc4" i18nKey="ch3_1.labComp4" ns="ui" components={{ hze: <G k="high-impedance earpiece" /> }} />,
        ]}
        procedure={[
          { text: <Trans i18nKey="ch3_1.labStep1" ns="ui" components={{ sel: <G k="selectivity" />, ferr: <G k="ferrite" />, tunedc: <G k="tuned circuit" /> }} />, diagram: <CrystalRadioSchematic /> },
          { text: <Trans i18nKey="ch3_1.labStep2" ns="ui" components={{ em: <em /> }} /> },
          { text: <Trans i18nKey="ch3_1.labStep3" ns="ui" components={{ det: <G k="detector" />, env: <G k="envelope" />, am: <G k="am" /> }} /> },
          { text: <Trans i18nKey="ch3_1.labStep4" ns="ui" components={{ resf: <G k="resonant frequency" /> }} /> },
        ]}
        expectedResult={<Trans i18nKey="ch3_1.labExpected" ns="ui" components={{ em: <em /> }} />}
        connectionToTheory={<Trans i18nKey="ch3_1.labConnection" ns="ui" components={{ ...mathComponents }} />}
        troubleshooting={[
          t('ch3_1.labTrouble1'),
          t('ch3_1.labTrouble2'),
          <Trans key="tr3" i18nKey="ch3_1.labTrouble3" ns="ui" components={{ schottky: <G k="schottky diode" /> }} />,
        ]}
      />

      {/* ── Quiz ───────────────────────────────────────────────── */}
      <Quiz
        title={t('ch3_1.quizTitle')}
        storageKey={STORAGE_KEYS.quizProgress(CHAPTER_ID)}
        questions={quizQuestions}
      />
    </>
  )
}
