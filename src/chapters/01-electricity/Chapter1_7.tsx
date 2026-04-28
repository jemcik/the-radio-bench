// Chapter 1.7 — Tuned Circuits and Resonance
import { useMemo } from 'react'
import { useTranslation, Trans } from 'react-i18next'
import { Callout } from '@/components/ui/callout'
import { Section } from '@/components/ui/section-heading'
import { MBlock, MathVar } from '@/components/ui/math'
import { G } from '@/features/glossary/glossary-term'
import LabActivity from '@/components/lab/LabActivity'
import Quiz, { buildQuizFromI18n } from '@/components/quiz/Quiz'
import ResonanceCalculator from '@/components/widgets/ResonanceCalculator'
import LcResponseCurve from '@/components/widgets/LcResponseCurve'
import VnaResonanceMock from '@/components/widgets/VnaResonanceMock'
import LcSeriesSchematic from '@/components/diagrams/LcSeriesSchematic'
import LcParallelSchematic from '@/components/diagrams/LcParallelSchematic'
import LcResonanceScale from '@/components/diagrams/LcResonanceScale'
import { STORAGE_KEYS } from '@/lib/storage-keys'
import { mathComponents } from '@/lib/trans-defaults'

const CHAPTER_ID = '1-7'
const QUIZ_QUESTION_COUNT = 8

function nowrapSpan() {
  return <span style={{ whiteSpace: 'nowrap' }} />
}

export default function Chapter1_7() {
  const { t } = useTranslation('ui')
  const nowrap = nowrapSpan()

  const quizQuestions = useMemo(
    () => buildQuizFromI18n(t, 'ch1_7', QUIZ_QUESTION_COUNT, {
      nowrap: nowrapSpan(),
      var: <MathVar />,
      sub: <sub />,
      strong: <strong />,
      em: <em />,
    }),
    [t],
  )

  return (
    <>
      {/* ── Intro ──────────────────────────────────────────────── */}
      <p>
        <Trans
          i18nKey="ch1_7.intro"
          ns="ui"
          components={{
            strong: <strong />,
            var: <MathVar />,
            ind: <G k="capacitor" />,
            coil: <G k="inductor" />,
            res: <G k="resonant frequency" />,
            reson: <G k="resonance" />,
            tank: <G k="tank" />,
            nowrap: nowrap,
          }}
        />
      </p>

      <p>
        <Trans
          i18nKey="ch1_7.introPreview"
          ns="ui"
          components={{
            strong: <strong />,
            var: <MathVar />,
            nowrap: nowrap,
            trap: <G k="trap" />,
            tank: <G k="tank" />,
            q: <G k="q-factor" />,
            bw: <G k="bandwidth" />,
            reac: <G k="reactance" />,
            vna: <G k="vna" />,
            ham: <G k="ham radio" />,
          }}
        />
      </p>

      {/* ── Section 1: Swing analogy ───────────────────────────── */}
      <Section id="swing" labelKey="ch1_7.sectionSwing" />

      <p>
        <Trans
          i18nKey="ch1_7.swingIntro"
          ns="ui"
          components={{ strong: <strong />, em: <em /> }}
        />
      </p>

      <p>
        <Trans
          i18nKey="ch1_7.swingTransition"
          ns="ui"
          components={{ strong: <strong />, em: <em /> }}
        />
      </p>

      {/* ── Section 2: Energy sloshing ─────────────────────────── */}
      <Section id="slosh" labelKey="ch1_7.sectionSlosh" />

      <p>
        <Trans
          i18nKey="ch1_7.sloshIntro"
          ns="ui"
          components={{ var: <MathVar /> }}
        />
      </p>

      <p>
        <Trans
          i18nKey="ch1_7.sloshStep1"
          ns="ui"
          components={{ ...mathComponents, strong: <strong />, nowrap: nowrap }}
        />
      </p>

      <p>
        <Trans
          i18nKey="ch1_7.sloshStep2"
          ns="ui"
          components={{ ...mathComponents, strong: <strong />, nowrap: nowrap }}
        />
      </p>

      <p>
        <Trans
          i18nKey="ch1_7.sloshStep2Aside"
          ns="ui"
          components={{ strong: <strong /> }}
        />
      </p>

      <p>
        <Trans
          i18nKey="ch1_7.sloshStep3"
          ns="ui"
          components={{ strong: <strong />, em: <em /> }}
        />
      </p>

      <p>
        <Trans
          i18nKey="ch1_7.sloshStep4"
          ns="ui"
          components={{ strong: <strong />, var: <MathVar /> }}
        />
      </p>

      <p>
        <Trans
          i18nKey="ch1_7.sloshFreq"
          ns="ui"
          components={{ strong: <strong />, var: <MathVar /> }}
        />
      </p>

      {/* ── Section 3: Resonance condition ─────────────────────── */}
      <Section id="condition" labelKey="ch1_7.sectionCondition" />

      <p>
        <Trans
          i18nKey="ch1_7.conditionIntro"
          ns="ui"
          components={{ ...mathComponents, nowrap: nowrap }}
        />
      </p>

      <MBlock tex="X_L = 2\pi f L \quad\text{and}\quad X_C = \dfrac{1}{2\pi f C}" />

      <p>
        <Trans
          i18nKey="ch1_7.conditionDerive"
          ns="ui"
          components={{ ...mathComponents, nowrap: nowrap }}
        />
      </p>

      <MBlock tex="2\pi f L = \dfrac{1}{2\pi f C} \;\Longrightarrow\; f^2 = \dfrac{1}{4\pi^2 LC}" />

      <p>{t('ch1_7.conditionFormulaIntro')}</p>

      <MBlock tex="f_0 = \dfrac{1}{2\pi\sqrt{LC}}" />

      <p>
        <Trans
          i18nKey="ch1_7.conditionMeaning"
          ns="ui"
          components={{ strong: <strong />, var: <MathVar /> }}
        />
      </p>

      <p>
        <Trans
          i18nKey="ch1_7.conditionScalingNote"
          ns="ui"
          components={{ strong: <strong />, em: <em />, var: <MathVar /> }}
        />
      </p>

      <p>
        <Trans
          i18nKey="ch1_7.conditionCalcIntro"
          ns="ui"
          components={{
            strong: <strong />,
            var: <MathVar />,
            nowrap: nowrap,
            cz: <G k="characteristic impedance" />,
          }}
        />
      </p>

      <ResonanceCalculator />

      {/* ── Section 4: Series LC ───────────────────────────────── */}
      <Section id="series" labelKey="ch1_7.sectionSeries" />

      <LcSeriesSchematic />

      <p>
        <Trans
          i18nKey="ch1_7.seriesIntro"
          ns="ui"
          components={{ var: <MathVar />, nowrap: nowrap }}
        />
      </p>

      <p>
        <Trans
          i18nKey="ch1_7.seriesResonanceBehaviour"
          ns="ui"
          components={{
            strong: <strong />,
            var: <MathVar />,
            q: <G k="q-factor" />,
          }}
        />
      </p>

      <Callout variant="caution">
        <Trans
          i18nKey="ch1_7.seriesVoltageMagnification"
          ns="ui"
          components={{ ...mathComponents, strong: <strong />, nowrap: nowrap }}
        />
      </Callout>

      <p>
        <Trans
          i18nKey="ch1_7.seriesUseTrap"
          ns="ui"
          components={{
            strong: <strong />,
            var: <MathVar />,
            trap: <G k="trap" />,
          }}
        />
      </p>

      {/* ── Section 5: Parallel LC ─────────────────────────────── */}
      <Section id="parallel" labelKey="ch1_7.sectionParallel" />

      <LcParallelSchematic />

      <p>
        <Trans
          i18nKey="ch1_7.parallelIntro"
          ns="ui"
          components={{ em: <em />, var: <MathVar /> }}
        />
      </p>

      <p>
        <Trans
          i18nKey="ch1_7.parallelResonanceBehaviour"
          ns="ui"
          components={{ ...mathComponents, strong: <strong />, nowrap: nowrap }}
        />
      </p>

      <p>
        <Trans
          i18nKey="ch1_7.parallelTankCurrent"
          ns="ui"
          components={{ strong: <strong /> }}
        />
      </p>

      <p>
        <Trans
          i18nKey="ch1_7.parallelUseTank"
          ns="ui"
          components={{
            strong: <strong />,
            var: <MathVar />,
            tuned: <G k="tuned circuit" />,
          }}
        />
      </p>

      <Callout variant="note">
        <Trans
          i18nKey="ch1_7.parallelDuality"
          ns="ui"
          components={{ strong: <strong />, var: <MathVar /> }}
        />
      </Callout>

      {/* ── Section 6: Q factor and bandwidth ──────────────────── */}
      <Section id="q-bandwidth" labelKey="ch1_7.sectionQ" />

      <p>
        <Trans
          i18nKey="ch1_7.qIntro"
          ns="ui"
          components={{ var: <MathVar /> }}
        />
      </p>

      <p>
        <Trans
          i18nKey="ch1_7.qDefRatio"
          ns="ui"
          components={{ ...mathComponents, strong: <strong />, nowrap: nowrap }}
        />
      </p>

      <p>
        <Trans
          i18nKey="ch1_7.qDefBw"
          ns="ui"
          components={{
            strong: <strong />,
            var: <MathVar />,
            bw: <G k="bandwidth" />,
          }}
        />
      </p>

      <MBlock tex="Q = \dfrac{f_0}{BW} \;\;\Longleftrightarrow\;\; BW = \dfrac{f_0}{Q}" />

      <p>
        <Trans
          i18nKey="ch1_7.qBwExample"
          ns="ui"
          components={{ ...mathComponents, nowrap: nowrap }}
        />
      </p>

      <p>
        <Trans
          i18nKey="ch1_7.qComponents"
          ns="ui"
          components={{ strong: <strong />, var: <MathVar /> }}
        />
      </p>

      <Callout variant="note">
        <Trans
          i18nKey="ch1_7.qLoaded"
          ns="ui"
          components={{ ...mathComponents, strong: <strong /> }}
        />
      </Callout>

      <p>
        <Trans
          i18nKey="ch1_7.qWidgetIntro"
          ns="ui"
          components={{ var: <MathVar /> }}
        />
      </p>

      <LcResponseCurve />

      {/* ── Section 7: Magnitude scale ─────────────────────────── */}
      <Section id="scale" labelKey="ch1_7.sectionScale" />

      <p>{t('ch1_7.scaleIntro')}</p>

      <LcResonanceScale />

      <p>
        <Trans
          i18nKey="ch1_7.scaleNotes"
          ns="ui"
          components={{ strong: <strong /> }}
        />
      </p>

      {/* ── Section 8: Reading on a VNA ────────────────────────── */}
      <Section id="vna" labelKey="ch1_7.sectionVna" />

      <p>
        <Trans
          i18nKey="ch1_7.vnaIntro"
          ns="ui"
          components={{
            strong: <strong />,
            vna: <G k="vna" />,
            db: <G k="decibel" />,
          }}
        />
      </p>

      <p>
        <Trans
          i18nKey="ch1_7.vnaCurveBehaviour"
          ns="ui"
          components={{ strong: <strong />, var: <MathVar /> }}
        />
      </p>

      <p>
        <Trans
          i18nKey="ch1_7.vnaMarkers"
          ns="ui"
          components={{ ...mathComponents, strong: <strong />, nowrap: nowrap }}
        />
      </p>

      <VnaResonanceMock />

      <Callout variant="tip">
        <Trans
          i18nKey="ch1_7.vnaPracticeNote"
          ns="ui"
          components={{ strong: <strong /> }}
        />
      </Callout>

      {/* ── Section 9: Applications tour ───────────────────────── */}
      <Section id="applications" labelKey="ch1_7.sectionApplications" />

      <p>{t('ch1_7.appsIntro')}</p>

      <p>
        <Trans
          i18nKey="ch1_7.appsReceivers"
          ns="ui"
          components={{ strong: <strong /> }}
        />
      </p>

      <p>
        <Trans
          i18nKey="ch1_7.appsTransmitters"
          ns="ui"
          components={{ strong: <strong /> }}
        />
      </p>

      <p>
        <Trans
          i18nKey="ch1_7.appsAntennas"
          ns="ui"
          components={{
            strong: <strong />,
            var: <MathVar />,
            atu: <G k="antenna tuner" />,
          }}
        />
      </p>

      <p>
        <Trans
          i18nKey="ch1_7.appsFilters"
          ns="ui"
          components={{ strong: <strong /> }}
        />
      </p>

      {/* ── Summary ────────────────────────────────────────────── */}
      <Section id="summary" labelKey="ch1_7.sectionSummary" />

      <Callout variant="key">
        <p>
          <Trans
            i18nKey="ch1_7.keyTakeaway1"
            ns="ui"
            components={{ strong: <strong />, var: <MathVar />, nowrap: nowrap }}
          />
        </p>
        <p>
          <Trans
            i18nKey="ch1_7.keyTakeaway2"
            ns="ui"
            components={{
              strong: <strong />,
              var: <MathVar />,
              trap: <G k="trap" />,
            }}
          />
        </p>
        <p>
          <Trans
            i18nKey="ch1_7.keyTakeaway3"
            ns="ui"
            components={{
              strong: <strong />,
              var: <MathVar />,
              tank: <G k="tank" />,
            }}
          />
        </p>
        <p>
          <Trans
            i18nKey="ch1_7.keyTakeaway4"
            ns="ui"
            components={{
              ...mathComponents,
              strong: <strong />,
              nowrap: nowrap,
              bw: <G k="bandwidth" />,
            }}
          />
        </p>
        <p>
          <Trans
            i18nKey="ch1_7.keyTakeaway5"
            ns="ui"
            components={{ strong: <strong />, var: <MathVar /> }}
          />
        </p>
      </Callout>

      {/* ── Lab ────────────────────────────────────────────────── */}
      <LabActivity
        label="1.7"
        goal={t('ch1_7.labGoal')}
        equipment={[
          <Trans key="e1" i18nKey="ch1_7.labEquip1" ns="ui" components={{ vna: <G k="vna" /> }} />,
          <Trans key="e2" i18nKey="ch1_7.labEquip2" ns="ui" components={{ oscilloscope: <G k="oscilloscope" /> }} />,
          <Trans key="e3" i18nKey="ch1_7.labEquip3" ns="ui" components={{ breadboard: <G k="breadboard" /> }} />,
          t('ch1_7.labEquip4'),
        ]}
        components={[
          <Trans key="c1" i18nKey="ch1_7.labComp1" ns="ui" components={{ strong: <strong /> }} />,
          <Trans key="c2" i18nKey="ch1_7.labComp2" ns="ui" components={{ strong: <strong /> }} />,
          <Trans key="c3" i18nKey="ch1_7.labComp3" ns="ui" components={{ strong: <strong /> }} />,
        ]}
        procedure={[
          { text: <Trans i18nKey="ch1_7.labStep1" ns="ui" components={{ ...mathComponents, strong: <strong />, nowrap: nowrap }} /> },
          { text: <Trans i18nKey="ch1_7.labStep2" ns="ui" components={{ ...mathComponents, strong: <strong />, em: <em /> }} /> },
          { text: <Trans i18nKey="ch1_7.labStep3" ns="ui" components={{ ...mathComponents, strong: <strong /> }} /> },
          { text: <Trans i18nKey="ch1_7.labStep4" ns="ui" components={{ ...mathComponents, strong: <strong />, em: <em /> }} /> },
          { text: <Trans i18nKey="ch1_7.labStep5" ns="ui" components={{ ...mathComponents, strong: <strong />, em: <em />, nowrap: nowrap }} /> },
          { text: <Trans i18nKey="ch1_7.labStep6" ns="ui" components={{ strong: <strong /> }} /> },
        ]}
        expectedResult={
          <Trans
            i18nKey="ch1_7.labExpected"
            ns="ui"
            components={{ var: <MathVar /> }}
          />
        }
        connectionToTheory={
          <Trans
            i18nKey="ch1_7.labConnection"
            ns="ui"
            components={{ ham: <G k="ham radio" /> }}
          />
        }
        troubleshooting={[
          <Trans key="t1" i18nKey="ch1_7.labTrouble1" ns="ui" components={{ strong: <strong /> }} />,
          <Trans key="t2" i18nKey="ch1_7.labTrouble2" ns="ui" components={{ strong: <strong /> }} />,
          <Trans key="t3" i18nKey="ch1_7.labTrouble3" ns="ui" components={{ strong: <strong /> }} />,
        ]}
      />

      {/* ── Quiz ───────────────────────────────────────────────── */}
      <Quiz
        title={t('ch1_7.quizTitle')}
        storageKey={STORAGE_KEYS.quizProgress(CHAPTER_ID)}
        questions={quizQuestions}
      />
    </>
  )
}
