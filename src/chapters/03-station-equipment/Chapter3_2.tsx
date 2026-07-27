// Chapter 3.2 — Transmitters: How Your Radio Talks
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
import TransmitterJobsDiagram from '@/components/diagrams/TransmitterJobsDiagram'
import MagnitudeLadder from '@/components/diagrams/MagnitudeLadder'
import BufferMultiplierChain from '@/components/diagrams/BufferMultiplierChain'
import ModulatorComparison from '@/components/diagrams/ModulatorComparison'
import ClassModeMatch from '@/components/diagrams/ClassModeMatch'
import PiNetworkSchematic from '@/components/diagrams/PiNetworkSchematic'
import HarmonicSuppression from '@/components/diagrams/HarmonicSuppression'
import HarmonicCalculator from '@/components/widgets/HarmonicCalculator'
import TxBlockDiagram from '@/components/diagrams/TxBlockDiagram'
import EmissionDesignatorDecoder from '@/components/diagrams/EmissionDesignatorDecoder'

const CHAPTER_ID = '3-2'
const QUIZ_QUESTION_COUNT = 10

export default function Chapter3_2() {
  const { t } = useTranslation('ui')

  const quizQuestions = useMemo(
    () => buildQuizFromI18n(t, 'ch3_2', QUIZ_QUESTION_COUNT, {
      strong: <strong />,
      em: <em />,
      var: <MathVar />,
    }),
    [t],
  )

  return (
    <>
      {/* ── Intro ──────────────────────────────────────────────── */}
      <p><Trans i18nKey="ch3_2.intro1" ns="ui" components={{ ...mathComponents, cw: <G k="cw" /> }} /></p>
      <p><Trans i18nKey="ch3_2.intro2" ns="ui" components={{ ...mathComponents, strong: <strong />, carrier: <G k="carrier" />, freq: <G k="frequency" />, cw: <G k="cw" />, ssb: <G k="ssb" />, fm: <G k="fm" /> }} /></p>

      {/* ── §1 The three jobs ──────────────────────────────────── */}
      <Section id="jobs" labelKey="ch3_2.sectionJobs" />
      <p><Trans i18nKey="ch3_2.jobsP1" ns="ui" components={{ ...mathComponents, strong: <strong /> }} /></p>
      <p><Trans i18nKey="ch3_2.jobsP2" ns="ui" components={{ ...mathComponents, strong: <strong />, carrier: <G k="carrier" />, freq: <G k="frequency" />, cw: <G k="cw" /> }} /></p>
      <TransmitterJobsDiagram />
      <p><Trans i18nKey="ch3_2.jobsP3" ns="ui" components={{ ...mathComponents, strong: <strong />, osc: <G k="oscillator" /> }} /></p>

      {/* ── §2 The oscillator ──────────────────────────────────── */}
      <Section id="oscillator" labelKey="ch3_2.sectionOsc" />
      <p><Trans i18nKey="ch3_2.oscP1" ns="ui" components={{ ...mathComponents, osc: <G k="oscillator" />, dc: <G k="dc" />, carrier: <G k="carrier" />, tunedc: <G k="tuned circuit" />, cap: <G k="capacitor" />, tank: <G k="tank" />, tx: <G k="transistor" /> }} /></p>
      <p><Trans i18nKey="ch3_2.oscP2" ns="ui" components={{ ...mathComponents, em: <em />, strong: <strong />, vfo: <G k="vfo" />, crysosc: <G k="crystal oscillator" />, lc: <G k="lc" />, reson: <G k="resonance" /> }} /></p>
      <p><Trans i18nKey="ch3_2.oscP3" ns="ui" components={{ ...mathComponents, em: <em />, strong: <strong /> }} /></p>
      <MagnitudeLadder
        tone="note"
        title={t('ch3_2.osc.ladderTitle')}
        ariaLabel={t('ch3_2.osc.ladderAria')}
        caption={t('ch3_2.osc.ladderCaption')}
        items={[
          { value: 100, label: t('ch3_2.osc.vfoLabel'), description: t('ch3_2.osc.vfoDesc') },
          { value: 10, label: t('ch3_2.osc.xoLabel'), description: t('ch3_2.osc.xoDesc') },
          { value: 1, label: t('ch3_2.osc.tcxoLabel'), description: t('ch3_2.osc.tcxoDesc') },
          { value: 0.01, label: t('ch3_2.osc.ocxoLabel'), description: t('ch3_2.osc.ocxoDesc') },
        ]}
      />
      <Callout variant="caution">
        <p><Trans i18nKey="ch3_2.oscCaution" ns="ui" components={{ ...mathComponents, strong: <strong />, em: <em /> }} /></p>
      </Callout>

      {/* ── §3 Buffer & multiplier ─────────────────────────────── */}
      <Section id="stages" labelKey="ch3_2.sectionStages" />
      <p><Trans i18nKey="ch3_2.stagesP1" ns="ui" components={{ ...mathComponents, em: <em />, strong: <strong /> }} /></p>
      <p><Trans i18nKey="ch3_2.stagesP2" ns="ui" components={{ ...mathComponents, strong: <strong />, vhf: <G k="vhf" />, uhf: <G k="uhf" />, harmonic: <G k="harmonic" />, tunedc: <G k="tuned circuit" /> }} /></p>
      <BufferMultiplierChain />

      {/* ── §4 The modulator stages ────────────────────────────── */}
      <Section id="modulators" labelKey="ch3_2.sectionModulators" />
      <p><Trans i18nKey="ch3_2.modP1" ns="ui" components={{ ...mathComponents, mod: <G k="modulation" />, cw: <G k="cw" />, ssb: <G k="ssb" />, fm: <G k="fm" /> }} /></p>
      <p><Trans i18nKey="ch3_2.modP2" ns="ui" components={{ ...mathComponents, strong: <strong />, em: <em />, cw: <G k="cw" /> }} /></p>
      <p><Trans i18nKey="ch3_2.modP3" ns="ui" components={{ ...mathComponents, strong: <strong />, em: <em />, carrier: <G k="carrier" />, sideband: <G k="sideband" />, mixer: <G k="mixer" />, filt: <G k="filter" /> }} /></p>
      <p><Trans i18nKey="ch3_2.modP4" ns="ui" components={{ ...mathComponents, strong: <strong />, em: <em />, dev: <G k="deviation" />, react: <G k="reactance" />, dio: <G k="diode" /> }} /></p>
      <ModulatorComparison />
      <Callout variant="math">
        <p><Trans i18nKey="ch3_2.modCarson" ns="ui" components={{ ...mathComponents, strong: <strong />, sideband: <G k="sideband" />, dev: <G k="deviation" />, carson: <G k="carson's rule" /> }} /></p>
      </Callout>

      {/* ── §5 Driver & power amplifier ────────────────────────── */}
      <Section id="amplify" labelKey="ch3_2.sectionAmplify" />
      <p><Trans i18nKey="ch3_2.ampP1" ns="ui" components={{ ...mathComponents, strong: <strong />, em: <em />, pa: <G k="power amplifier" /> }} /></p>
      <p><Trans i18nKey="ch3_2.ampP2" ns="ui" components={{ ...mathComponents, em: <em />, strong: <strong />, ssb: <G k="ssb" />, env: <G k="envelope" />, fm: <G k="fm" />, cw: <G k="cw" />, linamp: <G k="linear amplifier" /> }} /></p>
      <ClassModeMatch />
      <p><Trans i18nKey="ch3_2.ampP3" ns="ui" components={{ ...mathComponents, strong: <strong />, em: <em />, pep: <G k="pep" /> }} /></p>
      <Callout variant="onair">
        <p><Trans i18nKey="ch3_2.ampOnair" ns="ui" components={{ ...mathComponents, strong: <strong />, cs: <G k="callsign" /> }} /></p>
      </Callout>

      {/* ── §6 The output filter ───────────────────────────────── */}
      <Section id="filter" labelKey="ch3_2.sectionFilter" />
      <p><Trans i18nKey="ch3_2.filterP1" ns="ui" components={{ ...mathComponents, strong: <strong />, harmonic: <G k="harmonic" />, pa: <G k="power amplifier" /> }} /></p>
      <p><Trans i18nKey="ch3_2.filterP2" ns="ui" components={{ ...mathComponents, strong: <strong />, em: <em />, ind: <G k="inductor" />, imp: <G k="impedance" />, lpf: <G k="low-pass" /> }} /></p>
      <PiNetworkSchematic />
      <p><Trans i18nKey="ch3_2.filterP3" ns="ui" components={{ ...mathComponents, pband: <G k="passband" /> }} /></p>
      <HarmonicSuppression />
      <p><Trans i18nKey="ch3_2.filterCalcIntro" ns="ui" components={{ ...mathComponents }} /></p>
      <HarmonicCalculator />
      <Callout variant="key">
        <p><Trans i18nKey="ch3_2.filterKey" ns="ui" components={{ ...mathComponents, strong: <strong /> }} /></p>
      </Callout>

      {/* ── §7 The whole transmitter ───────────────────────────── */}
      <Section id="chain" labelKey="ch3_2.sectionChain" />
      <p><Trans i18nKey="ch3_2.chainP1" ns="ui" components={{ ...mathComponents, strong: <strong />, osc: <G k="oscillator" />, cw: <G k="cw" />, ssb: <G k="ssb" />, fm: <G k="fm" />, vfo: <G k="vfo" />, mixer: <G k="mixer" />, pa: <G k="power amplifier" />, filt: <G k="filter" /> }} /></p>
      <TxBlockDiagram variant="ssb" />
      <TxBlockDiagram variant="cwfm" />
      <p><Trans i18nKey="ch3_2.chainP2" ns="ui" components={{ ...mathComponents, em: <em /> }} /></p>

      {/* ── §8 What makes a transmitter good ───────────────────── */}
      <Section id="characteristics" labelKey="ch3_2.sectionChar" />
      <p><Trans i18nKey="ch3_2.charP1" ns="ui" components={{ ...mathComponents, strong: <strong />, harmonic: <G k="harmonic" />, bw: <G k="bandwidth" />, spur: <G k="spurious" /> }} /></p>
      <p><Trans i18nKey="ch3_2.charP2" ns="ui" components={{ ...mathComponents, strong: <strong />, em: <em />, cw: <G k="cw" />, ssb: <G k="ssb" />, fm: <G k="fm" />, itu: <G k="itu" /> }} /></p>
      <EmissionDesignatorDecoder />
      <p><Trans i18nKey="ch3_2.charP3" ns="ui" components={{ ...mathComponents }} /></p>
      <MagnitudeLadder
        tone="primary"
        title={t('ch3_2.bwLadder.title')}
        ariaLabel={t('ch3_2.bwLadder.aria')}
        caption={t('ch3_2.bwLadder.caption')}
        items={[
          { value: 16000, label: t('ch3_2.bwLadder.nbfmLabel'), description: t('ch3_2.bwLadder.nbfmDesc') },
          { value: 6000, label: t('ch3_2.bwLadder.amLabel'), description: t('ch3_2.bwLadder.amDesc') },
          { value: 2700, label: t('ch3_2.bwLadder.ssbLabel'), description: t('ch3_2.bwLadder.ssbDesc') },
          { value: 150, label: t('ch3_2.bwLadder.cwLabel'), description: t('ch3_2.bwLadder.cwDesc') },
        ]}
      />
      <p><Trans i18nKey="ch3_2.charP4" ns="ui" components={{ ...mathComponents, strong: <strong /> , rr: <G k="radio regulations" />}} /></p>
      <Callout variant="key">
        <p><Trans i18nKey="ch3_2.charKey" ns="ui" components={{ ...mathComponents, strong: <strong />, harmonic: <G k="harmonic" /> }} /></p>
      </Callout>

      {/* ── Lab ────────────────────────────────────────────────── */}
      <LabActivity
        label="3.2"
        goal={<Trans i18nKey="ch3_2.labGoal" ns="ui" components={{ ...mathComponents, harmonic: <G k="harmonic" /> }} />}
        equipment={[t('ch3_2.labEquip1'), t('ch3_2.labEquip2')]}
        components={[t('ch3_2.labComp1'), t('ch3_2.labComp2'), t('ch3_2.labComp3')]}
        procedure={[
          { text: <Trans i18nKey="ch3_2.labStep1" ns="ui" components={{ ...mathComponents, square: <G k="square wave" /> }} /> },
          { text: <Trans i18nKey="ch3_2.labStep2" ns="ui" components={{ ...mathComponents, strong: <strong /> }} /> },
          { text: <Trans i18nKey="ch3_2.labStep3" ns="ui" components={{ ...mathComponents }} /> },
          { text: <Trans i18nKey="ch3_2.labStep4" ns="ui" components={{ ...mathComponents }} /> },
          { text: <Trans i18nKey="ch3_2.labStep5" ns="ui" components={{ ...mathComponents }} /> },
        ]}
        expectedResult={<Trans i18nKey="ch3_2.labExpected" ns="ui" components={{ ...mathComponents }} />}
        connectionToTheory={<Trans i18nKey="ch3_2.labConnection" ns="ui" components={{ ...mathComponents, dload: <G k="dummy load" /> }} />}
        troubleshooting={[t('ch3_2.labTrouble1'), t('ch3_2.labTrouble2'), t('ch3_2.labTrouble3')]}
      />

      {/* ── Quiz ───────────────────────────────────────────────── */}
      <Quiz
        title={t('ch3_2.quizTitle')}
        storageKey={STORAGE_KEYS.quizProgress(CHAPTER_ID)}
        questions={quizQuestions}
      />
    </>
  )
}
