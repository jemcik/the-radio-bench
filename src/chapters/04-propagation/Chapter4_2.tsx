// Chapter 4.2 — Interference and EMC
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
import SourcePathVictimDiagram from '@/components/diagrams/SourcePathVictimDiagram'
import HarmonicSuppression from '@/components/diagrams/HarmonicSuppression'
import HarmonicReachCalculator from '@/components/widgets/HarmonicReachCalculator'
import CouplingPathsExplorer from '@/components/widgets/CouplingPathsExplorer'
import FilterTypeGallery from '@/components/diagrams/FilterTypeGallery'
import FilterPlacementDiagram from '@/components/diagrams/FilterPlacementDiagram'
import LcNotchSchematic from '@/components/diagrams/LcNotchSchematic'
import FerriteChokeDiagram from '@/components/diagrams/FerriteChokeDiagram'
import FerriteChokeCalculator from '@/components/widgets/FerriteChokeCalculator'
import RemedyMatrix from '@/components/widgets/RemedyMatrix'
import DiagnosticFlow from '@/components/diagrams/DiagnosticFlow'

const CHAPTER_ID = '4-2'
const QUIZ_QUESTION_COUNT = 10

export default function Chapter4_2() {
  const { t } = useTranslation('ui')

  const quizQuestions = useMemo(
    () => buildQuizFromI18n(t, 'ch4_2', QUIZ_QUESTION_COUNT, {
      strong: <strong />,
      em: <em />,
      var: <MathVar />,
    }),
    [t],
  )

  return (
    <>
      {/* ── Intro ──────────────────────────────────────────────── */}
      <p><Trans i18nKey="ch4_2.intro1" ns="ui" components={{ ...mathComponents, strong: <strong />, rfi: <G k="rfi" />, emc: <G k="emc" /> }} /></p>
      <p><Trans i18nKey="ch4_2.intro2" ns="ui" components={{ ...mathComponents, em: <em />, tvi: <G k="tvi" />, bci: <G k="bci" /> }} /></p>

      {/* ── §1 What interference is ─────────────────────────────── */}
      <Section id="what" labelKey="ch4_2.sectionWhat" />
      <p><Trans i18nKey="ch4_2.whatP1" ns="ui" components={{ ...mathComponents, strong: <strong />, emc: <G k="emc" /> }} /></p>
      <p><Trans i18nKey="ch4_2.whatP2" ns="ui" components={{ ...mathComponents, strong: <strong /> }} /></p>
      <SourcePathVictimDiagram />
      <p><Trans i18nKey="ch4_2.whatP3" ns="ui" components={{ ...mathComponents, em: <em /> }} /></p>
      <Callout variant="key">
        <p><Trans i18nKey="ch4_2.whatKey" ns="ui" components={{ ...mathComponents, strong: <strong /> }} /></p>
      </Callout>

      {/* ── §2 The source ──────────────────────────────────────── */}
      <Section id="source" labelKey="ch4_2.sectionSource" />
      <p><Trans i18nKey="ch4_2.sourceP1" ns="ui" components={{ ...mathComponents, strong: <strong />, spur: <G k="spurious" />, harm: <G k="harmonic" /> }} /></p>
      <HarmonicSuppression />
      <p><Trans i18nKey="ch4_2.sourceP2" ns="ui" components={{ ...mathComponents, strong: <strong />, par: <G k="parasitic oscillation" /> }} /></p>
      <p><Trans i18nKey="ch4_2.sourceP3" ns="ui" components={{ ...mathComponents, em: <em />, hf: <G k="hf" />, fm: <G k="fm" /> }} /></p>
      <HarmonicReachCalculator />
      <Callout variant="key">
        <p><Trans i18nKey="ch4_2.sourceKey" ns="ui" components={{ ...mathComponents, strong: <strong /> }} /></p>
      </Callout>

      {/* ── §3 Coupling paths ──────────────────────────────────── */}
      <Section id="paths" labelKey="ch4_2.sectionPaths" />
      <p><Trans i18nKey="ch4_2.pathsP1" ns="ui" components={{ ...mathComponents, strong: <strong />, cm: <G k="common-mode current" /> }} /></p>
      <p><Trans i18nKey="ch4_2.pathsP2" ns="ui" components={{ ...mathComponents, strong: <strong />, ovl: <G k="front-end overload" /> }} /></p>
      <CouplingPathsExplorer />
      <Callout variant="tip">
        <p><Trans i18nKey="ch4_2.pathsTip" ns="ui" components={{ ...mathComponents, strong: <strong />, cm: <G k="common-mode current" /> }} /></p>
      </Callout>
      <Callout variant="key">
        <p><Trans i18nKey="ch4_2.pathsKey" ns="ui" components={{ ...mathComponents }} /></p>
      </Callout>

      {/* ── §4 Filters ─────────────────────────────────────────── */}
      <Section id="filters" labelKey="ch4_2.sectionFilters" />
      <p><Trans i18nKey="ch4_2.filtersP1" ns="ui" components={{ ...mathComponents, strong: <strong />, filt: <G k="filter" /> }} /></p>
      <FilterTypeGallery />
      <p><Trans i18nKey="ch4_2.filtersP2" ns="ui" components={{ ...mathComponents, strong: <strong />, lp: <G k="low-pass" />, hp: <G k="high-pass" /> }} /></p>
      <FilterPlacementDiagram />
      <p><Trans i18nKey="ch4_2.filtersP3" ns="ui" components={{ ...mathComponents, strong: <strong />, notch: <G k="notch" />, tc: <G k="tuned circuit" /> }} /></p>
      <LcNotchSchematic />
      <Callout variant="caution">
        <p><Trans i18nKey="ch4_2.filtersCaution" ns="ui" components={{ ...mathComponents, strong: <strong /> }} /></p>
      </Callout>
      <Callout variant="key">
        <p><Trans i18nKey="ch4_2.filtersKey" ns="ui" components={{ ...mathComponents }} /></p>
      </Callout>

      {/* ── §5 Ferrites ────────────────────────────────────────── */}
      <Section id="ferrites" labelKey="ch4_2.sectionFerrites" />
      <p><Trans i18nKey="ch4_2.ferritesP1" ns="ui" components={{ ...mathComponents, strong: <strong />, fer: <G k="ferrite" />, cmc: <G k="common-mode choke" />, imp: <G k="impedance" /> }} /></p>
      <FerriteChokeDiagram />
      <p><Trans i18nKey="ch4_2.ferritesP2" ns="ui" components={{ ...mathComponents, strong: <strong />, ind: <G k="inductance" /> }} /></p>
      <FerriteChokeCalculator />
      <Callout variant="note">
        <p><Trans i18nKey="ch4_2.ferritesCoaxNote" ns="ui" components={{ ...mathComponents, strong: <strong />, bal: <G k="balun" /> }} /></p>
      </Callout>
      <p><Trans i18nKey="ch4_2.ferritesP3" ns="ui" components={{ ...mathComponents, strong: <strong />, db: <G k="decibel" /> }} /></p>
      <Callout variant="key">
        <p><Trans i18nKey="ch4_2.ferritesKey" ns="ui" components={{ ...mathComponents, strong: <strong />, chk: <G k="choke" /> }} /></p>
      </Callout>

      {/* ── §6 The rest of the toolkit ─────────────────────────── */}
      <Section id="toolkit" labelKey="ch4_2.sectionToolkit" />
      <p><Trans i18nKey="ch4_2.toolkitP1" ns="ui" components={{ ...mathComponents, strong: <strong />, shield: <G k="shielding" /> }} /></p>
      <p><Trans i18nKey="ch4_2.toolkitP2" ns="ui" components={{ ...mathComponents, em: <em />, strong: <strong />, earth: <G k="rf earth" /> }} /></p>
      <p><Trans i18nKey="ch4_2.toolkitP3" ns="ui" components={{ ...mathComponents, strong: <strong />, endfed: <G k="end-fed" /> }} /></p>
      <RemedyMatrix />
      <Callout variant="note">
        <p><Trans i18nKey="ch4_2.toolkitNote" ns="ui" components={{ ...mathComponents, strong: <strong />, endfed: <G k="end-fed" /> }} /></p>
      </Callout>
      <Callout variant="key">
        <p><Trans i18nKey="ch4_2.toolkitKey" ns="ui" components={{ ...mathComponents }} /></p>
      </Callout>

      {/* ── §7 Diagnosis & the social side ─────────────────────── */}
      <Section id="social" labelKey="ch4_2.sectionSocial" />
      <p><Trans i18nKey="ch4_2.socialP1" ns="ui" components={{ ...mathComponents, strong: <strong /> }} /></p>
      <DiagnosticFlow />
      <p><Trans i18nKey="ch4_2.socialP2" ns="ui" components={{ ...mathComponents, strong: <strong /> }} /></p>
      <Callout variant="key">
        <p><Trans i18nKey="ch4_2.socialKey" ns="ui" components={{ ...mathComponents, strong: <strong /> }} /></p>
      </Callout>

      {/* ── Lab ────────────────────────────────────────────────── */}
      <LabActivity
        label="4.2"
        goal={<Trans i18nKey="ch4_2.labGoal" ns="ui" components={{ ...mathComponents }} />}
        equipment={[t('ch4_2.labEquip1'), t('ch4_2.labEquip2'), t('ch4_2.labEquip3')]}
        components={[t('ch4_2.labComp1'), t('ch4_2.labComp2'), t('ch4_2.labComp3')]}
        procedure={[
          { text: <Trans i18nKey="ch4_2.labStep1" ns="ui" components={{ ...mathComponents, strong: <strong /> }} /> },
          { text: <Trans i18nKey="ch4_2.labStep2" ns="ui" components={{ ...mathComponents, strong: <strong /> }} /> },
          { text: <Trans i18nKey="ch4_2.labStep3" ns="ui" components={{ ...mathComponents, strong: <strong /> }} /> },
          { text: <Trans i18nKey="ch4_2.labStep4" ns="ui" components={{ ...mathComponents, strong: <strong /> }} /> },
          { text: <Trans i18nKey="ch4_2.labStep5" ns="ui" components={{ ...mathComponents, strong: <strong /> }} /> },
        ]}
        expectedResult={<Trans i18nKey="ch4_2.labExpected" ns="ui" components={{ ...mathComponents }} />}
        connectionToTheory={<Trans i18nKey="ch4_2.labConnection" ns="ui" components={{ ...mathComponents, strong: <strong /> }} />}
        troubleshooting={[
          <Trans key="t1" i18nKey="ch4_2.labTrouble1" ns="ui" components={{ ...mathComponents }} />,
          <Trans key="t2" i18nKey="ch4_2.labTrouble2" ns="ui" components={{ ...mathComponents }} />,
          <Trans key="t3" i18nKey="ch4_2.labTrouble3" ns="ui" components={{ ...mathComponents }} />,
        ]}
      />

      {/* ── Quiz ───────────────────────────────────────────────── */}
      <Quiz
        title={t('ch4_2.quizTitle')}
        storageKey={STORAGE_KEYS.quizProgress(CHAPTER_ID)}
        questions={quizQuestions}
      />
    </>
  )
}
