// Chapter 2.2 — Audio, Digital and Modulated Signals
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
import AudioDigitalWaveforms from '@/components/diagrams/AudioDigitalWaveforms'
import AntennaSizeComparison from '@/components/diagrams/AntennaSizeComparison'
import CarrierKnobs from '@/components/diagrams/CarrierKnobs'
import SsbSpectrum from '@/components/diagrams/SsbSpectrum'
import AmModulationExplorer from '@/components/widgets/AmModulationExplorer'
import BeatFrequencyExplorer from '@/components/widgets/BeatFrequencyExplorer'
import FmModulationExplorer from '@/components/widgets/FmModulationExplorer'
import AmPowerCalculator from '@/components/widgets/AmPowerCalculator'
import BandwidthVisualiser from '@/components/widgets/BandwidthVisualiser'

const CHAPTER_ID = '2-2'
const QUIZ_QUESTION_COUNT = 8

export default function Chapter2_2() {
  const { t } = useTranslation('ui')

  const quizQuestions = useMemo(
    () => buildQuizFromI18n(t, 'ch2_2', QUIZ_QUESTION_COUNT, {
      strong: <strong />,
      em: <em />,
      var: <MathVar />,
    }),
    [t],
  )

  return (
    <>
      {/* ── Intro ──────────────────────────────────────────────── */}
      <p>
        <Trans i18nKey="ch2_2.intro1" ns="ui" components={{ ...mathComponents, em: <em />, strong: <strong />, mod: <G k="modulation" /> }} />
      </p>
      <p>
        <Trans i18nKey="ch2_2.intro2" ns="ui" components={{ ...mathComponents, em: <em />, strong: <strong />, mod: <G k="modulation" />, car: <G k="carrier" />, am: <G k="am" />, ssb: <G k="ssb" />, fm: <G k="fm" /> }} />
      </p>

      {/* ── §1 The message: audio and digital ──────────────────── */}
      <Section id="message" labelKey="ch2_2.sectionMessage" />
      <p>
        <Trans i18nKey="ch2_2.messageP1" ns="ui" components={{ ...mathComponents, em: <em />, strong: <strong /> }} />
      </p>
      <p>
        <Trans i18nKey="ch2_2.messageP2" ns="ui" components={{ ...mathComponents, em: <em />, strong: <strong />, bb: <G k="baseband" /> }} />
      </p>
      <p>
        <Trans i18nKey="ch2_2.messageP3" ns="ui" components={{ ...mathComponents, em: <em />, strong: <strong /> }} />
      </p>
      <AudioDigitalWaveforms />

      {/* ── §2 Why a voice can't fly on its own ─────────────────── */}
      <Section id="why" labelKey="ch2_2.sectionWhy" />
      <p>
        <Trans i18nKey="ch2_2.whyP1" ns="ui" components={{ ...mathComponents, em: <em />, strong: <strong /> }} />
      </p>
      <p>
        <Trans i18nKey="ch2_2.whyP2" ns="ui" components={{ ...mathComponents, em: <em />, strong: <strong /> }} />
      </p>
      <p>
        <Trans i18nKey="ch2_2.whyP3" ns="ui" components={{ ...mathComponents, em: <em />, strong: <strong /> }} />
      </p>
      <AntennaSizeComparison />
      <p>
        <Trans i18nKey="ch2_2.whyP4" ns="ui" components={{ ...mathComponents, em: <em />, strong: <strong />, car: <G k="carrier" />, mod: <G k="modulation" /> }} />
      </p>

      {/* ── §3 The carrier and its three knobs ──────────────────── */}
      <Section id="carrier" labelKey="ch2_2.sectionCarrier" />
      <p>
        <Trans i18nKey="ch2_2.carrierP1" ns="ui" components={{ ...mathComponents, em: <em />, strong: <strong />, car: <G k="carrier" />, cw: <G k="cw" /> }} />
      </p>
      <p>
        <Trans i18nKey="ch2_2.carrierP2" ns="ui" components={{ ...mathComponents, em: <em />, strong: <strong />, amp: <G k="amplitude" />, freq: <G k="frequency" />, am: <G k="am" />, fm: <G k="fm" /> }} />
      </p>
      <CarrierKnobs />

      {/* ── §4 AM ───────────────────────────────────────────────── */}
      <Section id="am" labelKey="ch2_2.sectionAM" />
      <p>
        <Trans i18nKey="ch2_2.amP1" ns="ui" components={{ ...mathComponents, em: <em />, strong: <strong />, env: <G k="envelope" /> }} />
      </p>
      <p>
        <Trans i18nKey="ch2_2.amP2" ns="ui" components={{ ...mathComponents, em: <em />, strong: <strong /> }} />
      </p>
      <AmModulationExplorer />
      <p>
        <Trans i18nKey="ch2_2.amP3" ns="ui" components={{ ...mathComponents, em: <em />, strong: <strong />, sb: <G k="sideband" /> }} />
      </p>
      <p>
        <Trans i18nKey="ch2_2.amWhence" ns="ui" components={{ ...mathComponents, em: <em />, strong: <strong /> }} />
      </p>
      <BeatFrequencyExplorer />
      <p>
        <Trans i18nKey="ch2_2.amWhenceClose" ns="ui" components={{ ...mathComponents, em: <em />, strong: <strong />, sb: <G k="sideband" /> }} />
      </p>
      <p>
        <Trans i18nKey="ch2_2.amP4" ns="ui" components={{ ...mathComponents, em: <em />, strong: <strong />, mi: <G k="modulation index" /> }} />
      </p>
      <Callout variant="caution">
        <Trans i18nKey="ch2_2.calloutOvermod" ns="ui" components={{ ...mathComponents, strong: <strong /> }} />
      </Callout>
      <AmPowerCalculator />

      {/* ── §5 SSB ──────────────────────────────────────────────── */}
      <Section id="ssb" labelKey="ch2_2.sectionSSB" />
      <p>
        <Trans i18nKey="ch2_2.ssbP1" ns="ui" components={{ ...mathComponents, em: <em />, strong: <strong />, sb: <G k="sideband" /> }} />
      </p>
      <p>
        <Trans i18nKey="ch2_2.ssbP2" ns="ui" components={{ ...mathComponents, em: <em />, strong: <strong />, ssb: <G k="ssb" /> }} />
      </p>
      <SsbSpectrum />
      <p>
        <Trans i18nKey="ch2_2.ssbP3" ns="ui" components={{ ...mathComponents, em: <em />, strong: <strong /> }} />
      </p>
      <Callout variant="tip">
        <Trans i18nKey="ch2_2.calloutSsbTip" ns="ui" components={{ ...mathComponents, strong: <strong /> }} />
      </Callout>

      {/* ── §6 FM ───────────────────────────────────────────────── */}
      <Section id="fm" labelKey="ch2_2.sectionFM" />
      <p>
        <Trans i18nKey="ch2_2.fmP1" ns="ui" components={{ ...mathComponents, em: <em />, strong: <strong />, fm: <G k="fm" />, freq: <G k="frequency" /> }} />
      </p>
      <p>
        <Trans i18nKey="ch2_2.fmP2" ns="ui" components={{ ...mathComponents, em: <em />, strong: <strong />, dev: <G k="deviation" /> }} />
      </p>
      <FmModulationExplorer />
      <p>
        <Trans i18nKey="ch2_2.fmP3" ns="ui" components={{ ...mathComponents, em: <em />, strong: <strong /> }} />
      </p>
      <Callout variant="note">
        <Trans i18nKey="ch2_2.calloutArmstrong" ns="ui" components={{ ...mathComponents, strong: <strong /> }} />
      </Callout>

      {/* ── §7 Bandwidth ────────────────────────────────────────── */}
      <Section id="bandwidth" labelKey="ch2_2.sectionBandwidth" />
      <p>
        <Trans i18nKey="ch2_2.bwP1" ns="ui" components={{ ...mathComponents, em: <em />, strong: <strong />, sb: <G k="sideband" />, bw: <G k="bandwidth" />, cw: <G k="cw" /> }} />
      </p>
      <p>
        <Trans i18nKey="ch2_2.bwP2" ns="ui" components={{ ...mathComponents, em: <em />, strong: <strong />, carson: <G k="carson's rule" />, dev: <G k="deviation" /> }} />
      </p>
      <BandwidthVisualiser />

      {/* ── Summary ─────────────────────────────────────────────── */}
      <Section id="summary" labelKey="ch2_2.sectionSummary" />
      <Callout variant="key">
        <ul className="list-disc pl-5 space-y-2">
          <li><Trans i18nKey="ch2_2.keyTakeaway1" ns="ui" components={{ ...mathComponents, strong: <strong /> }} /></li>
          <li><Trans i18nKey="ch2_2.keyTakeaway2" ns="ui" components={{ ...mathComponents, strong: <strong /> }} /></li>
          <li><Trans i18nKey="ch2_2.keyTakeaway3" ns="ui" components={{ ...mathComponents, strong: <strong /> }} /></li>
          <li><Trans i18nKey="ch2_2.keyTakeaway4" ns="ui" components={{ ...mathComponents, strong: <strong /> }} /></li>
          <li><Trans i18nKey="ch2_2.keyTakeaway5" ns="ui" components={{ ...mathComponents, strong: <strong /> }} /></li>
          <li><Trans i18nKey="ch2_2.keyTakeaway6" ns="ui" components={{ ...mathComponents, strong: <strong /> }} /></li>
        </ul>
      </Callout>

      {/* ── Lab ─────────────────────────────────────────────────── */}
      <LabActivity
        label="2.2"
        goal={<Trans i18nKey="ch2_2.labGoal" ns="ui" components={{ ...mathComponents, strong: <strong /> }} />}
        equipment={[t('ch2_2.labEquip1'), t('ch2_2.labEquip2')]}
        components={[t('ch2_2.labComp1'), t('ch2_2.labComp2')]}
        procedure={[
          { text: <Trans i18nKey="ch2_2.labStep1" ns="ui" components={{ em: <em /> }} /> },
          { text: <Trans i18nKey="ch2_2.labStep2" ns="ui" components={{ em: <em />, res: <G k="resistor" /> }} /> },
          { text: t('ch2_2.labStep3') },
          { text: <Trans i18nKey="ch2_2.labStep4" ns="ui" components={{ em: <em /> }} /> },
          { text: t('ch2_2.labStep5') },
        ]}
        expectedResult={<Trans i18nKey="ch2_2.labExpected" ns="ui" components={{ em: <em /> }} />}
        connectionToTheory={t('ch2_2.labConnection')}
        troubleshooting={[
          t('ch2_2.labTrouble1'),
          t('ch2_2.labTrouble2'),
          t('ch2_2.labTrouble3'),
        ]}
      />

      {/* ── Quiz ────────────────────────────────────────────────── */}
      <Quiz
        title={t('ch2_2.quizTitle')}
        storageKey={STORAGE_KEYS.quizProgress(CHAPTER_ID)}
        questions={quizQuestions}
      />
    </>
  )
}
