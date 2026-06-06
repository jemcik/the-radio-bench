// Chapter 2.3 — Power: DC Input vs RF Output
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
import PowerFlowBlocks from '@/components/diagrams/PowerFlowBlocks'
import PowerSplitDiagram from '@/components/diagrams/PowerSplitDiagram'
import AmplifierClassChart from '@/components/diagrams/AmplifierClassChart'
import SsbEnvelopePep from '@/components/diagrams/SsbEnvelopePep'
import EfficiencyCalculator from '@/components/widgets/EfficiencyCalculator'
import ConductionAngleExplorer from '@/components/widgets/ConductionAngleExplorer'
import PepCalculator from '@/components/widgets/PepCalculator'

const CHAPTER_ID = '2-3'
const QUIZ_QUESTION_COUNT = 8

export default function Chapter2_3() {
  const { t } = useTranslation('ui')

  const quizQuestions = useMemo(
    () => buildQuizFromI18n(t, 'ch2_3', QUIZ_QUESTION_COUNT, {
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
        <Trans i18nKey="ch2_3.intro1" ns="ui" components={{ ...mathComponents, em: <em />, strong: <strong />, dc: <G k="dc" /> }} />
      </p>
      <p>
        <Trans i18nKey="ch2_3.intro2" ns="ui" components={{ ...mathComponents, em: <em />, strong: <strong />, ssb: <G k="ssb" />, eff: <G k="efficiency" />, pep: <G k="pep" /> }} />
      </p>

      {/* ── §1 Two powers ──────────────────────────────────────── */}
      <Section id="two-powers" labelKey="ch2_3.sectionTwoPowers" />
      <p>
        <Trans i18nKey="ch2_3.twoP1" ns="ui" components={{ ...mathComponents, em: <em />, strong: <strong /> }} />
      </p>
      <p>
        <Trans i18nKey="ch2_3.twoP2" ns="ui" components={{ ...mathComponents, em: <em />, strong: <strong /> }} />
      </p>
      <p>
        <Trans i18nKey="ch2_3.twoP3" ns="ui" components={{ ...mathComponents, em: <em />, strong: <strong />, dummy: <G k="dummy load" /> }} />
      </p>
      <PowerFlowBlocks />
      <p>
        <Trans i18nKey="ch2_3.twoP4" ns="ui" components={{ ...mathComponents, em: <em />, strong: <strong /> }} />
      </p>

      {/* ── §2 Efficiency ──────────────────────────────────────── */}
      <Section id="efficiency" labelKey="ch2_3.sectionEfficiency" />
      <p>
        <Trans i18nKey="ch2_3.effP1" ns="ui" components={{ ...mathComponents, em: <em />, strong: <strong />, eff: <G k="efficiency" /> }} />
      </p>
      <p>
        <Trans i18nKey="ch2_3.effP2" ns="ui" components={{ ...mathComponents, em: <em />, strong: <strong /> }} />
      </p>
      <p>
        <Trans i18nKey="ch2_3.effP3" ns="ui" components={{ ...mathComponents, em: <em />, strong: <strong /> }} />
      </p>
      <PowerSplitDiagram />
      <Callout variant="key">
        <Trans i18nKey="ch2_3.calloutEnergy" ns="ui" components={{ ...mathComponents, strong: <strong /> }} />
      </Callout>
      <EfficiencyCalculator />
      <p>
        <Trans i18nKey="ch2_3.effP4" ns="ui" components={{ ...mathComponents, em: <em />, strong: <strong /> }} />
      </p>

      {/* ── §3 Amplifier classes ───────────────────────────────── */}
      <Section id="classes" labelKey="ch2_3.sectionClasses" />
      <p>
        <Trans i18nKey="ch2_3.classP1" ns="ui" components={{ ...mathComponents, em: <em />, strong: <strong />, tr: <G k="transistor" /> }} />
      </p>
      <p>
        <Trans i18nKey="ch2_3.classP2" ns="ui" components={{ ...mathComponents, em: <em />, strong: <strong /> }} />
      </p>
      <AmplifierClassChart />
      <p>
        <Trans i18nKey="ch2_3.classP3" ns="ui" components={{ ...mathComponents, em: <em />, strong: <strong />, linamp: <G k="linear amplifier" /> }} />
      </p>
      <p>
        <Trans i18nKey="ch2_3.classP4" ns="ui" components={{ ...mathComponents, em: <em />, strong: <strong />, linamp: <G k="linear amplifier" />, ssb: <G k="ssb" />, am: <G k="am" />, fm: <G k="fm" />, cw: <G k="cw" /> }} />
      </p>
      <Callout variant="tip">
        <Trans i18nKey="ch2_3.calloutClassC" ns="ui" components={{ ...mathComponents, strong: <strong /> }} />
      </Callout>
      <ConductionAngleExplorer />

      {/* ── §4 PEP and duty cycle ──────────────────────────────── */}
      <Section id="pep" labelKey="ch2_3.sectionPep" />
      <p>
        <Trans i18nKey="ch2_3.pepP1" ns="ui" components={{ ...mathComponents, em: <em />, strong: <strong />, cw: <G k="cw" />, fm: <G k="fm" />, ssb: <G k="ssb" /> }} />
      </p>
      <p>
        <Trans i18nKey="ch2_3.pepP2" ns="ui" components={{ ...mathComponents, em: <em />, strong: <strong />, pep: <G k="pep" />, env: <G k="envelope" />, mod: <G k="modulation" /> }} />
      </p>
      <p>
        <Trans i18nKey="ch2_3.pepP3" ns="ui" components={{ ...mathComponents, em: <em />, strong: <strong /> }} />
      </p>
      <SsbEnvelopePep />
      <PepCalculator />
      <p>
        <Trans i18nKey="ch2_3.pepP4" ns="ui" components={{ ...mathComponents, em: <em />, strong: <strong /> }} />
      </p>
      <Callout variant="note">
        <Trans i18nKey="ch2_3.calloutHistory" ns="ui" components={{ ...mathComponents, strong: <strong /> }} />
      </Callout>
      <Callout variant="caution">
        <Trans i18nKey="ch2_3.calloutDuty" ns="ui" components={{ ...mathComponents, strong: <strong /> }} />
      </Callout>

      {/* ── Summary ────────────────────────────────────────────── */}
      <Section id="summary" labelKey="ch2_3.sectionSummary" />
      <Callout variant="key">
        <ul className="list-disc pl-5 space-y-2">
          <li><Trans i18nKey="ch2_3.keyTakeaway1" ns="ui" components={{ ...mathComponents, strong: <strong /> }} /></li>
          <li><Trans i18nKey="ch2_3.keyTakeaway2" ns="ui" components={{ ...mathComponents, strong: <strong /> }} /></li>
          <li><Trans i18nKey="ch2_3.keyTakeaway3" ns="ui" components={{ ...mathComponents, strong: <strong /> }} /></li>
          <li><Trans i18nKey="ch2_3.keyTakeaway4" ns="ui" components={{ ...mathComponents, strong: <strong /> }} /></li>
          <li><Trans i18nKey="ch2_3.keyTakeaway5" ns="ui" components={{ ...mathComponents, strong: <strong /> }} /></li>
          <li><Trans i18nKey="ch2_3.keyTakeaway6" ns="ui" components={{ ...mathComponents, strong: <strong /> }} /></li>
        </ul>
      </Callout>

      {/* ── Lab ────────────────────────────────────────────────── */}
      <LabActivity
        label="2.3"
        goal={<Trans i18nKey="ch2_3.labGoal" ns="ui" components={{ ...mathComponents, strong: <strong /> }} />}
        equipment={[t('ch2_3.labEquip1'), t('ch2_3.labEquip2'), t('ch2_3.labEquip3')]}
        components={[t('ch2_3.labComp1'), t('ch2_3.labComp2')]}
        procedure={[
          { text: <Trans i18nKey="ch2_3.labStep1" ns="ui" components={{ em: <em /> }} /> },
          { text: <Trans i18nKey="ch2_3.labStep2" ns="ui" components={{ ...mathComponents }} /> },
          { text: <Trans i18nKey="ch2_3.labStep3" ns="ui" components={{ ...mathComponents, em: <em /> }} /> },
          { text: <Trans i18nKey="ch2_3.labStep4" ns="ui" components={{ ...mathComponents }} /> },
          { text: <Trans i18nKey="ch2_3.labStep5" ns="ui" components={{ ...mathComponents }} /> },
        ]}
        expectedResult={<Trans i18nKey="ch2_3.labExpected" ns="ui" components={{ em: <em /> }} />}
        connectionToTheory={<Trans i18nKey="ch2_3.labConnection" ns="ui" components={{ ...mathComponents }} />}
        troubleshooting={[
          <Trans key="tr1" i18nKey="ch2_3.labTrouble1" ns="ui" components={{ rsc: <G k="resistance" />, res: <G k="resistor" /> }} />,
          t('ch2_3.labTrouble2'),
          <Trans key="tr3" i18nKey="ch2_3.labTrouble3" ns="ui" components={{ ...mathComponents }} />,
        ]}
      />

      {/* ── Quiz ───────────────────────────────────────────────── */}
      <Quiz
        title={t('ch2_3.quizTitle')}
        storageKey={STORAGE_KEYS.quizProgress(CHAPTER_ID)}
        questions={quizQuestions}
      />
    </>
  )
}
