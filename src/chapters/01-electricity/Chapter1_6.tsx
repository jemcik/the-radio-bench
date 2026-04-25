// Chapter 1.6 — Coils (Inductors)
import { useMemo } from 'react'
import { useTranslation, Trans } from 'react-i18next'
import { Callout } from '@/components/ui/callout'
import { Section } from '@/components/ui/section-heading'
import { MBlock, MathVar } from '@/components/ui/math'
import { G } from '@/features/glossary/glossary-term'
import LabActivity from '@/components/lab/LabActivity'
import Quiz, { buildQuizFromI18n } from '@/components/quiz/Quiz'
import Ch1_6Placeholder from '@/components/widgets/Ch1_6Placeholder'
import { STORAGE_KEYS } from '@/lib/storage-keys'
import { mathComponents } from '@/lib/trans-defaults'

const CHAPTER_ID = '1-6'
const QUIZ_QUESTION_COUNT = 8

function nowrapSpan() {
  return <span style={{ whiteSpace: 'nowrap' }} />
}

export default function Chapter1_6() {
  const { t } = useTranslation('ui')
  const nowrap = nowrapSpan()

  const quizQuestions = useMemo(
    () => buildQuizFromI18n(t, 'ch1_6', QUIZ_QUESTION_COUNT, {
      nowrap: nowrapSpan(),
      var: <MathVar />,
      sub: <sub />,
      strong: <strong />,
    }),
    [t],
  )

  return (
    <>
      {/* ── Intro ──────────────────────────────────────────────── */}
      <p>
        <Trans
          i18nKey="ch1_6.intro"
          ns="ui"
          components={{
            strong: <strong />,
            var: <MathVar />,
          }}
        />
      </p>

      <p>
        <Trans
          i18nKey="ch1_6.introPreview"
          ns="ui"
          components={{
            strong: <strong />,
            var: <MathVar />,
            nowrap: nowrap,
          }}
        />
      </p>

      {/* ── Section 1: What inductance is ──────────────────────── */}
      <Section id="what-it-is" labelKey="ch1_6.sectionWhatItIs" />

      <p>
        <Trans
          i18nKey="ch1_6.whatItIsIntro"
          ns="ui"
          components={{
            strong: <strong />,
            var: <MathVar />,
          }}
        />
      </p>

      <p>{t('ch1_6.whatItIsVdIdt')}</p>

      <MBlock tex="V = L \cdot \dfrac{dI}{dt}" />

      <p>
        <Trans
          i18nKey="ch1_6.whatItIsDefinitions"
          ns="ui"
          components={{
            strong: <strong />,
            var: <MathVar />,
          }}
        />
      </p>

      <p>
        <Trans
          i18nKey="ch1_6.whatItIsCompare"
          ns="ui"
          components={{
            var: <MathVar />,
            em: <em />,
            nowrap: nowrap,
          }}
        />
      </p>

      <p>
        <Trans
          i18nKey="ch1_6.whatItIsRateNote"
          ns="ui"
          components={{
            strong: <strong />,
            var: <MathVar />,
            nowrap: nowrap,
          }}
        />
      </p>

      {/* ── Section 2: Geometry ─────────────────────────────────── */}
      <Section id="geometry" labelKey="ch1_6.sectionGeometry" />

      <p>{t('ch1_6.geometryIntro')}</p>

      <MBlock tex="L = \mu_0 \cdot \mu_r \cdot \dfrac{n^2 \cdot A}{l}" />

      <p>
        <Trans
          i18nKey="ch1_6.geometryVars"
          ns="ui"
          components={{
            var: <MathVar />,
            sub: <sub />,
            strong: <strong />,
          }}
        />
      </p>

      <p>
        <Trans
          i18nKey="ch1_6.geometryCores"
          ns="ui"
          components={{
            strong: <strong />,
            var: <MathVar />,
            sub: <sub />,
          }}
        />
      </p>

      <p>
        <Trans
          i18nKey="ch1_6.geometryBuilderIntro"
          ns="ui"
          components={{ var: <MathVar /> }}
        />
      </p>

      <Ch1_6Placeholder label="InductanceBuilder widget" />

      {/* ── Section 3: Types ──────────────────────────────────── */}
      <Section id="types" labelKey="ch1_6.sectionTypes" />

      <p>{t('ch1_6.typesIntro')}</p>

      <Ch1_6Placeholder label="InductorTypeGallery diagram" />

      <p>
        <Trans
          i18nKey="ch1_6.typesAirCoreIntro"
          ns="ui"
          components={{ ...mathComponents, strong: <strong /> }}
        />
      </p>

      <Callout variant="tip">
        <Trans
          i18nKey="ch1_6.typesAirCoreCallout"
          ns="ui"
          components={{ ...mathComponents, strong: <strong /> }}
        />
      </Callout>

      <p>
        <Trans
          i18nKey="ch1_6.typesFerriteIntro"
          ns="ui"
          components={{ ...mathComponents, strong: <strong /> }}
        />
      </p>

      <p>
        <Trans
          i18nKey="ch1_6.typesIronPowderIntro"
          ns="ui"
          components={{ ...mathComponents, strong: <strong /> }}
        />
      </p>

      <p>
        <Trans
          i18nKey="ch1_6.typesChokesIntro"
          ns="ui"
          components={{ ...mathComponents, strong: <strong />, em: <em /> }}
        />
      </p>

      {/* ── Section 4: Energy ────────────────────────────────── */}
      <Section id="energy" labelKey="ch1_6.sectionEnergy" />

      <p>
        <Trans
          i18nKey="ch1_6.energyIntro"
          ns="ui"
          components={{
            strong: <strong />,
            var: <MathVar />,
            nowrap: nowrap,
          }}
        />
      </p>

      <MBlock tex="U = \tfrac{1}{2} L I^{2}" />

      <p>
        <Trans
          i18nKey="ch1_6.energyWorkedExample"
          ns="ui"
          components={{
            var: <MathVar />,
            nowrap: nowrap,
          }}
        />
      </p>

      <Callout variant="danger">
        <Trans
          i18nKey="ch1_6.energySparkCallout"
          ns="ui"
          components={{ ...mathComponents, strong: <strong /> }}
        />
      </Callout>

      {/* ── Section 5: RL time constant ──────────────────────── */}
      <Section id="rl-time-constant" labelKey="ch1_6.sectionRL" />

      <Ch1_6Placeholder label="RLChargingSchematic diagram" />

      <p>
        <Trans
          i18nKey="ch1_6.rlIntro"
          ns="ui"
          components={{
            strong: <strong />,
            var: <MathVar />,
            sub: <sub />,
            em: <em />,
            nowrap: nowrap,
          }}
        />
      </p>

      <MBlock tex="I(t) = \dfrac{V_{\mathrm{in}}}{R} \left(1 - e^{-t/\tau}\right), \quad \tau = \dfrac{L}{R}" />

      <p>
        <Trans
          i18nKey="ch1_6.rlTauDefn"
          ns="ui"
          components={{
            strong: <strong />,
            var: <MathVar />,
            nowrap: nowrap,
          }}
        />
      </p>

      <p>
        <Trans
          i18nKey="ch1_6.rlShortcuts"
          ns="ui"
          components={{ ...mathComponents, strong: <strong />, nowrap: nowrap }}
        />
      </p>

      <p>
        <Trans
          i18nKey="ch1_6.rlCurvePoints"
          ns="ui"
          components={{
            strong: <strong />,
          }}
        />
      </p>

      <p>
        <Trans
          i18nKey="ch1_6.rlDischargeDerivation"
          ns="ui"
          components={{
            strong: <strong />,
            var: <MathVar />,
            nowrap: nowrap,
          }}
        />
      </p>

      <MBlock tex="I(t) = I_0 \, e^{-t/\tau}" />

      <p>
        <Trans
          i18nKey="ch1_6.rlWidgetIntro"
          ns="ui"
          components={{ var: <MathVar />, em: <em /> }}
        />
      </p>

      <Ch1_6Placeholder label="RLChargeDischarge widget" />

      <Callout variant="note">
        <Trans
          i18nKey="ch1_6.rlVoltageNote"
          ns="ui"
          components={{ ...mathComponents, strong: <strong />, em: <em /> }}
        />
      </Callout>

      {/* ── Section 6: Series and parallel ──────────────────── */}
      <Section id="combinations" labelKey="ch1_6.sectionCombinations" />

      <p>
        <Trans
          i18nKey="ch1_6.combinationsIntro"
          ns="ui"
          components={{ ...mathComponents, strong: <strong /> }}
        />
      </p>

      <Ch1_6Placeholder label="IndSeriesParallelSchematic diagram" />

      <p>
        <Trans
          i18nKey="ch1_6.seriesFormulaLead"
          ns="ui"
          components={{
            strong: <strong />,
            var: <MathVar />,
            sub: <sub />,
            nowrap: nowrap,
          }}
        />
      </p>

      <MBlock tex="L_{\mathrm{series}} = L_1 + L_2" />

      <p>
        <Trans
          i18nKey="ch1_6.seriesIntuition"
          ns="ui"
          components={{ ...mathComponents, strong: <strong /> }}
        />
      </p>

      <p>
        <Trans
          i18nKey="ch1_6.parallelFormulaLead"
          ns="ui"
          components={{
            strong: <strong />,
            var: <MathVar />,
            sub: <sub />,
            nowrap: nowrap,
          }}
        />
      </p>

      <MBlock tex="\dfrac{1}{L_{\mathrm{parallel}}} = \dfrac{1}{L_1} + \dfrac{1}{L_2} + \cdots + \dfrac{1}{L_n}" />

      <p>{t('ch1_6.parallelShortcut')}</p>

      <MBlock tex="L_{\mathrm{parallel}} = \dfrac{L_1 \cdot L_2}{L_1 + L_2}" />

      <p>
        <Trans
          i18nKey="ch1_6.parallelIntuition"
          ns="ui"
          components={{ ...mathComponents, strong: <strong /> }}
        />
      </p>

      <Callout variant="caution">
        <Trans
          i18nKey="ch1_6.combinationsCouplingNote"
          ns="ui"
          components={{
            strong: <strong />,
            em: <em />,
            var: <MathVar />,
          }}
        />
      </Callout>

      <p>
        <Trans
          i18nKey="ch1_6.combinationsCalcIntro"
          ns="ui"
          components={{ ...mathComponents, em: <em /> }}
        />
      </p>

      <Ch1_6Placeholder label="SeriesParallelInductorCalc widget" />

      {/* ── Section 7: Opposes AC, passes DC ────────────────── */}
      <Section id="blocks-ac-passes-dc" labelKey="ch1_6.sectionBlocksAcPassesDc" />

      <p>
        <Trans
          i18nKey="ch1_6.blocksIntro"
          ns="ui"
          components={{
            var: <MathVar />,
            em: <em />,
            nowrap: nowrap,
          }}
        />
      </p>

      <p>
        <Trans
          i18nKey="ch1_6.blocksOpposesAc"
          ns="ui"
          components={{
            strong: <strong />,
            var: <MathVar />,
            sub: <sub />,
            em: <em />,
            nowrap: nowrap,
          }}
        />
      </p>

      <Ch1_6Placeholder label="BlocksAcPassesDcDiagram" />

      <p>{t('ch1_6.blocksApplications')}</p>

      <p>
        <Trans
          i18nKey="ch1_6.blocksRfChoke"
          ns="ui"
          components={{ ...mathComponents, strong: <strong /> }}
        />
      </p>

      <Ch1_6Placeholder label="RfChokeSchematic" />

      <p>
        <Trans
          i18nKey="ch1_6.blocksFilterChoke"
          ns="ui"
          components={{ ...mathComponents, strong: <strong /> }}
        />
      </p>

      <Ch1_6Placeholder label="LcFilterSchematic" />

      {/* ── Summary ─────────────────────────────────────────── */}
      <Section id="summary" labelKey="ch1_6.sectionSummary" />

      <Callout variant="key">
        <p>
          <Trans
            i18nKey="ch1_6.keyTakeaway1"
            ns="ui"
            components={{
              var: <MathVar />,
              nowrap: nowrap,
            }}
          />
        </p>
        <p>{t('ch1_6.keyTakeaway2')}</p>
        <p>
          <Trans
            i18nKey="ch1_6.keyTakeaway3"
            ns="ui"
            components={{
              var: <MathVar />,
              sub: <sub />,
              nowrap: nowrap,
            }}
          />
        </p>
        <p>
          <Trans
            i18nKey="ch1_6.keyTakeaway4"
            ns="ui"
            components={{
              var: <MathVar />,
              nowrap: nowrap,
            }}
          />
        </p>
        <p>
          <Trans
            i18nKey="ch1_6.keyTakeaway5"
            ns="ui"
            components={{ ...mathComponents }}
          />
        </p>
      </Callout>

      {/* ── Lab ─────────────────────────────────────────────── */}
      <LabActivity
        label="1.6"
        goal={
          <Trans
            i18nKey="ch1_6.labGoal"
            ns="ui"
            components={{
              var: <MathVar />,
              nowrap: nowrap,
            }}
          />
        }
        equipment={[
          <Trans key="e1" i18nKey="ch1_6.labEquip1" ns="ui" components={{ ...mathComponents, arduino: <G k="arduino" /> }} />,
          <Trans key="e2" i18nKey="ch1_6.labEquip2" ns="ui" components={{ ...mathComponents, oscilloscope: <G k="oscilloscope" /> }} />,
          <Trans key="e3" i18nKey="ch1_6.labEquip3" ns="ui" components={{ ...mathComponents, breadboard: <G k="breadboard" /> }} />,
          t('ch1_6.labEquip4'),
        ]}
        components={[
          <Trans key="c1" i18nKey="ch1_6.labComp1" ns="ui" components={{ ...mathComponents, strong: <strong /> }} />,
          <Trans key="c2" i18nKey="ch1_6.labComp2" ns="ui" components={{ ...mathComponents, strong: <strong /> }} />,
          <Trans key="c3" i18nKey="ch1_6.labComp3" ns="ui" components={{ ...mathComponents, strong: <strong /> }} />,
        ]}
        procedure={[
          { text: <Trans i18nKey="ch1_6.labStep1" ns="ui" components={{ ...mathComponents, strong: <strong /> }} /> },
          { text: <Trans i18nKey="ch1_6.labStep2" ns="ui" components={{ strong: <strong />, var: <MathVar />, nowrap: nowrap }} /> },
          { text: <Trans i18nKey="ch1_6.labStep3" ns="ui" components={{ strong: <strong />, var: <MathVar />, sub: <sub />, nowrap: nowrap }} /> },
          { text: <Trans i18nKey="ch1_6.labStep4" ns="ui" components={{ ...mathComponents, strong: <strong /> }} /> },
          { text: <Trans i18nKey="ch1_6.labStep5" ns="ui" components={{ strong: <strong />, var: <MathVar />, sub: <sub /> }} /> },
          { text: <Trans i18nKey="ch1_6.labStep6" ns="ui" components={{ strong: <strong />, var: <MathVar />, nowrap: nowrap }} /> },
        ]}
        expectedResult={
          <Trans
            i18nKey="ch1_6.labExpected"
            ns="ui"
            components={{
              var: <MathVar />,
            }}
          />
        }
        connectionToTheory={
          <Trans
            i18nKey="ch1_6.labConnection"
            ns="ui"
            components={{
              var: <MathVar />,
              nowrap: nowrap,
            }}
          />
        }
        troubleshooting={[
          <Trans key="t1" i18nKey="ch1_6.labTrouble1" ns="ui" components={{ strong: <strong /> }} />,
          <Trans key="t2" i18nKey="ch1_6.labTrouble2" ns="ui" components={{ strong: <strong /> }} />,
          <Trans key="t3" i18nKey="ch1_6.labTrouble3" ns="ui" components={{ strong: <strong /> }} />,
        ]}
      />

      {/* ── Quiz ────────────────────────────────────────────── */}
      <Quiz
        title={t('ch1_6.quizTitle')}
        storageKey={STORAGE_KEYS.quizProgress(CHAPTER_ID)}
        questions={quizQuestions}
      />
    </>
  )
}
