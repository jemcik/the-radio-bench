// Chapter 1.4 — Resistors in Practice
import { useMemo } from 'react'
import { useTranslation, Trans } from 'react-i18next'
import { Callout } from '@/components/ui/callout'
import { Section } from '@/components/ui/section-heading'
import { MBlock, MathVar, ParallelSym } from '@/components/ui/math'
import { G } from '@/features/glossary/glossary-term'
import LabActivity from '@/components/lab/LabActivity'
import Quiz, { buildQuizFromI18n } from '@/components/quiz/Quiz'
import ColourCodeDecoder from '@/components/widgets/ColourCodeDecoder'
import ESeriesSnap from '@/components/widgets/ESeriesSnap'
import SeriesParallelCalc from '@/components/widgets/SeriesParallelCalc'
import VoltageDivider from '@/components/widgets/VoltageDivider'
import SeriesParallelSchematic from '@/components/diagrams/SeriesParallelSchematic'
import DividerSchematic from '@/components/diagrams/DividerSchematic'
import DividerLoadingDiagram from '@/components/diagrams/DividerLoadingDiagram'
import { STORAGE_KEYS } from '@/lib/storage-keys'
import { mathComponents } from '@/lib/trans-defaults'

const CHAPTER_ID = '1-4'
const QUIZ_QUESTION_COUNT = 8

export default function Chapter1_4() {
  const { t } = useTranslation('ui')
  const nowrap = <span style={{ whiteSpace: 'nowrap' }} />
  const quizQuestions = useMemo(
    () => buildQuizFromI18n(t, 'ch1_4', QUIZ_QUESTION_COUNT, {
      nowrap: <span style={{ whiteSpace: 'nowrap' }} />,
      var: <MathVar />,
      sub: <sub />,
      code: <code />,
      pll: <ParallelSym />,
    }),
    [t],
  )

  return (
    <>
      <p>
        <Trans
          i18nKey="ch1_4.intro"
          ns="ui"
          components={{
            strong: <strong />,
            var: <MathVar />,
            divider: <G k="voltage divider" />, res: <G k="resistor" /> }}
        />
      </p>

      <p>
        <Trans
          i18nKey="ch1_4.introPreview"
          ns="ui"
          components={{
            strong: <strong />,
            var: <MathVar />,
            colour: <G k="colour code" />,
            preferred: <G k="preferred value" />,
            tol: <G k="tolerance" />,
          }}
        />
      </p>

      {/* ── Section 1: Packages ──────────────────────────────────── */}
      <Section id="packages" labelKey="ch1_4.sectionPackages" />

      <p>
        <Trans
          i18nKey="ch1_4.packagesIntro"
          ns="ui"
          components={{ var: <MathVar /> }}
        />
      </p>

      <p>
        <Trans
          i18nKey="ch1_4.packagesThroughHole"
          ns="ui"
          components={{ ...mathComponents, strong: <strong />, colour: <G k="colour code" /> }}
        />
      </p>

      <p>
        <Trans
          i18nKey="ch1_4.packagesSMT"
          ns="ui"
          components={{ ...mathComponents, strong: <strong />, surface: <G k="surface mount" />, code: <code /> }}
        />
      </p>

      <p>
        <Trans
          i18nKey="ch1_4.packagesRange"
          ns="ui"
          components={{ ...mathComponents, strong: <strong />,
            tol: <G k="tolerance" />,
            rating: <G k="power rating" />, }}
        />
      </p>

      <p>
        <Trans
          i18nKey="ch1_4.packagesTypes"
          ns="ui"
          components={{ ...mathComponents, strong: <strong />, ind: <G k="inductor" /> }}
        />
      </p>

      {/* ── Section 2: Colour code ──────────────────────────────── */}
      <Section id="colour-code" labelKey="ch1_4.sectionColourCode" />

      <p>
        <Trans
          i18nKey="ch1_4.colourCodeIntro"
          ns="ui"
          components={{ ...mathComponents, strong: <strong /> }}
        />
      </p>

      <p>
        <Trans
          i18nKey="ch1_4.colourCodeDigits"
          ns="ui"
          components={{ ...mathComponents, strong: <strong /> }}
        />
      </p>

      <Callout variant="note">
        <Trans
          i18nKey="ch1_4.colourCodeWorkedExample"
          ns="ui"
          components={{ ...mathComponents, strong: <strong /> }}
        />
      </Callout>

      <p>{t('ch1_4.colourCodeDecoderIntro')}</p>

      <ColourCodeDecoder />

      <p>
        <Trans
          i18nKey="ch1_4.colourCodeNotation"
          ns="ui"
          components={{ ...mathComponents, strong: <strong />, code: <code /> }}
        />
      </p>

      <p>
        <Trans
          i18nKey="ch1_4.colourCodeSMTNote"
          ns="ui"
          components={{ ...mathComponents, code: <code /> }}
        />
      </p>

      {/* ── Section 3: Preferred values ─────────────────────────── */}
      <Section id="e-series" labelKey="ch1_4.sectionESeries" />

      <p>
        <Trans
          i18nKey="ch1_4.eSeriesIntro"
          ns="ui"
          components={{ ...mathComponents, preferred: <G k="preferred value" />, tol: <G k="tolerance" /> }}
        />
      </p>

      <p>{t('ch1_4.eSeriesWhy')}</p>

      <p>
        <Trans
          i18nKey="ch1_4.eSeriesTable"
          ns="ui"
          components={{ ...mathComponents, strong: <strong /> }}
        />
      </p>

      <p>{t('ch1_4.eSeriesSnapIntro')}</p>

      <ESeriesSnap />

      <Callout variant="key">
        <Trans
          i18nKey="ch1_4.eSeriesCallout"
          ns="ui"
          components={{ ...mathComponents, strong: <strong /> }}
        />
      </Callout>

      {/* ── Section 4: Combinations ─────────────────────────────── */}
      <Section id="combinations" labelKey="ch1_4.sectionCombinations" />

      <p>{t('ch1_4.combinationsIntro')}</p>

      <SeriesParallelSchematic />

      <p>
        <Trans
          i18nKey="ch1_4.seriesFormula"
          ns="ui"
          components={{ ...mathComponents, strong: <strong /> }}
        />
      </p>

      <MBlock tex="R_{\mathrm{series}} = R_1 + R_2" />

      <p>
        <Trans
          i18nKey="ch1_4.seriesIntuition"
          ns="ui"
        />
      </p>

      <p>
        <Trans
          i18nKey="ch1_4.parallelFormula"
          ns="ui"
          components={{ ...mathComponents, strong: <strong /> }}
        />
      </p>

      <MBlock tex="R_{\mathrm{parallel}} = \dfrac{R_1 \cdot R_2}{R_1 + R_2}" />

      <p>
        <Trans
          i18nKey="ch1_4.parallelIntuition"
          ns="ui"
          components={{ strong: <strong />, var: <MathVar /> }}
        />
      </p>

      {/* ── Derivation + conductance ────────────────────────────── */}
      <p>
        <Trans
          i18nKey="ch1_4.parallelDerivationSetup"
          ns="ui"
          components={{ strong: <strong />, var: <MathVar /> }}
        />
      </p>

      <p>
        <Trans
          i18nKey="ch1_4.parallelDerivationMathLead"
          ns="ui"
          components={{ var: <MathVar />, sub: <sub />, nowrap: nowrap }}
        />
      </p>

      <MBlock tex="I = \dfrac{V}{R_1} + \dfrac{V}{R_2} = V \cdot \left(\dfrac{1}{R_1} + \dfrac{1}{R_2}\right)" />

      <p>
        <Trans
          i18nKey="ch1_4.parallelDerivationReciprocalLead"
          ns="ui"
          components={{ strong: <strong />, var: <MathVar /> }}
        />
      </p>

      <MBlock tex="\dfrac{1}{R} = \dfrac{1}{R_1} + \dfrac{1}{R_2} + \cdots + \dfrac{1}{R_n}" />

      <p>
        <Trans
          i18nKey="ch1_4.parallelDerivationShortcutNote"
          ns="ui"
          components={{ var: <MathVar /> }}
        />
      </p>

      <p>
        <Trans
          i18nKey="ch1_4.parallelDerivationConductance"
          ns="ui"
          components={{
            strong: <strong />,
            var: <MathVar />,
            nowrap: nowrap,
            cond: <G k="conductance" />,
          }}
        />
      </p>

      <p>
        <Trans
          i18nKey="ch1_4.parallelDerivationDualityLead"
          ns="ui"
          components={{ ...mathComponents, strong: <strong /> }}
        />
      </p>

      <MBlock tex="\begin{aligned} R_{\mathrm{series}} &= R_1 + R_2 + \cdots + R_n \\ G_{\mathrm{parallel}} &= G_1 + G_2 + \cdots + G_n \end{aligned}" />

      <p>
        <Trans i18nKey="ch1_4.parallelDerivationClose" ns="ui" />
      </p>

      <p>{t('ch1_4.combinationsCalcIntro')}</p>

      <SeriesParallelCalc />

      <Callout variant="key">
        <Trans
          i18nKey="ch1_4.shortcutCallout"
          ns="ui"
          components={{ ...mathComponents, strong: <strong />, pll: <ParallelSym /> }}
        />
      </Callout>

      <p>{t('ch1_4.combinationsTrimming')}</p>

      {/* ── Section 5: Voltage divider ──────────────────────────── */}
      <Section id="divider" labelKey="ch1_4.sectionDivider" />

      <p>
        <Trans
          i18nKey="ch1_4.dividerIntro"
          ns="ui"
          components={{ ...mathComponents, divider: <G k="voltage divider" /> }}
        />
      </p>

      <DividerSchematic />

      <p>
        <Trans
          i18nKey="ch1_4.dividerFormulaPoints"
          ns="ui"
          components={{ strong: <strong />, var: <MathVar />, sub: <sub /> }}
        />
      </p>

      <p>
        <Trans
          i18nKey="ch1_4.dividerFormulaCurrentLead"
          ns="ui"
          components={{ strong: <strong />, var: <MathVar />, sub: <sub />, nowrap: nowrap }}
        />
      </p>

      <MBlock tex="I = \dfrac{V_{\mathrm{in}}}{R_1 + R_2}" />

      <p>
        <Trans
          i18nKey="ch1_4.dividerFormulaOutputLead"
          ns="ui"
          components={{ strong: <strong />, var: <MathVar />, sub: <sub /> }}
        />
      </p>

      <MBlock tex="V_{\mathrm{out}} = I \cdot R_2" />

      <p>
        <Trans
          i18nKey="ch1_4.dividerFormulaSubstLead"
          ns="ui"
          components={{ strong: <strong />, var: <MathVar />, sub: <sub /> }}
        />
      </p>

      <MBlock tex="V_{\mathrm{out}} = V_{\mathrm{in}} \cdot \dfrac{R_2}{R_1 + R_2}" />

      <p>
        <Trans
          i18nKey="ch1_4.dividerFormulaNote"
          ns="ui"
          components={{ var: <MathVar />, sub: <sub />, nowrap: nowrap }}
        />
      </p>

      <p>
        <Trans
          i18nKey="ch1_4.dividerWidgetIntro"
          ns="ui"
          components={{ var: <MathVar />, sub: <sub /> }}
        />
      </p>

      <VoltageDivider />

      {/* ── Section 6: Loading ──────────────────────────────────── */}
      <Section id="loading" labelKey="ch1_4.sectionLoading" />

      <p>
        <Trans
          i18nKey="ch1_4.loadingIntro"
          ns="ui"
          components={{ var: <MathVar />, sub: <sub /> }}
        />
      </p>

      <DividerLoadingDiagram />

      <Callout variant="key">
        <Trans
          i18nKey="ch1_4.loadingRule"
          ns="ui"
          components={{ strong: <strong />, var: <MathVar />, sub: <sub />, nowrap: nowrap, pll: <ParallelSym /> }}
        />
      </Callout>

      <p>
        <Trans
          i18nKey="ch1_4.loadingBridge"
          ns="ui"
          components={{ strong: <strong />, var: <MathVar />, sub: <sub />, nowrap: nowrap }}
        />
      </p>

      {/* ── Section 7: Power rating ─────────────────────────────── */}
      <Section id="power" labelKey="ch1_4.sectionPower" />

      <p>
        <Trans
          i18nKey="ch1_4.powerIntro"
          ns="ui"
          components={{
            var: <MathVar />,
            nowrap: nowrap,
            rating: <G k="power rating" />,
          }}
        />
      </p>

      <p>
        <Trans
          i18nKey="ch1_4.powerDividerExample"
          ns="ui"
          components={{ ...mathComponents, nowrap: nowrap }}
        />
      </p>

      <Callout variant="note">
        <Trans
          i18nKey="ch1_4.powerAoEExercise"
          ns="ui"
          components={{ strong: <strong />, var: <MathVar />, nowrap: nowrap }}
        />
      </Callout>

      <Callout variant="caution">
        <Trans
          i18nKey="ch1_4.powerDeratingCallout"
          ns="ui"
          components={{ ...mathComponents, strong: <strong /> }}
        />
      </Callout>

      {/* ── Summary ─────────────────────────────────────────────── */}
      <Section id="summary" labelKey="ch1_4.sectionSummary" />

      <Callout variant="key">
        <p>{t('ch1_4.keyTakeaway1')}</p>
        <p>{t('ch1_4.keyTakeaway2')}</p>
        <p>{t('ch1_4.keyTakeaway3')}</p>
        <p>
          <Trans
            i18nKey="ch1_4.keyTakeaway4"
            ns="ui"
            components={{ var: <MathVar />, sub: <sub />, nowrap: nowrap }}
          />
        </p>
        <p>
          <Trans
            i18nKey="ch1_4.keyTakeaway5"
            ns="ui"
            components={{ var: <MathVar />, sub: <sub />, nowrap: nowrap }}
          />
        </p>
      </Callout>

      {/* ── Lab ─────────────────────────────────────────────────── */}
      <LabActivity
        label="1.4"
        goal={t('ch1_4.labGoal')}
        equipment={[
          t('ch1_4.labEquip1'),
          <Trans key="e2" i18nKey="ch1_4.labEquip2" ns="ui" components={{ ...mathComponents, multimeter: <G k="multimeter" />, dc: <G k="dc" /> }} />,
          <Trans key="e3" i18nKey="ch1_4.labEquip3" ns="ui" components={{ ...mathComponents, breadboard: <G k="breadboard" /> }} />,
          t('ch1_4.labEquip4'),
        ]}
        components={[
          t('ch1_4.labComp1'),
          t('ch1_4.labComp2'),
          t('ch1_4.labComp3'),
        ]}
        procedure={[
          { text: <Trans i18nKey="ch1_4.labStep1" ns="ui" components={{ ...mathComponents, strong: <strong /> }} /> },
          { text: <Trans i18nKey="ch1_4.labStep2" ns="ui" components={{ ...mathComponents, strong: <strong /> }} /> },
          { text: <Trans i18nKey="ch1_4.labStep3" ns="ui" components={{ ...mathComponents, strong: <strong />, nowrap: nowrap }} /> },
          { text: <Trans i18nKey="ch1_4.labStep4" ns="ui" components={{ strong: <strong />, var: <MathVar />, sub: <sub /> }} /> },
          { text: <Trans i18nKey="ch1_4.labStep5" ns="ui" components={{ strong: <strong />, var: <MathVar />, sub: <sub />, nowrap: nowrap, imp: <G k="impedance" /> }} /> },
          { text: <Trans i18nKey="ch1_4.labStep6" ns="ui" components={{ strong: <strong />, var: <MathVar />, sub: <sub /> }} /> },
        ]}
        expectedResult={t('ch1_4.labExpected')}
        connectionToTheory={t('ch1_4.labConnection')}
        troubleshooting={[
          <Trans key="t1" i18nKey="ch1_4.labTrouble1" ns="ui" components={{ ...mathComponents, strong: <strong /> }} />,
          <Trans key="t2" i18nKey="ch1_4.labTrouble2" ns="ui" components={{ ...mathComponents, strong: <strong /> }} />,
          <Trans key="t3" i18nKey="ch1_4.labTrouble3" ns="ui" components={{ strong: <strong />, var: <MathVar />, sub: <sub /> }} />,
        ]}
      />

      {/* ── Quiz ────────────────────────────────────────────────── */}
      <Quiz
        title={t('ch1_4.quizTitle')}
        storageKey={STORAGE_KEYS.quizProgress(CHAPTER_ID)}
        questions={quizQuestions}
      />
    </>
  )
}
