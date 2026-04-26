// Chapter 1.5 — Capacitors
import { useMemo } from 'react'
import { useTranslation, Trans } from 'react-i18next'
import { Callout } from '@/components/ui/callout'
import { Section } from '@/components/ui/section-heading'
import { MBlock, MathVar } from '@/components/ui/math'
import { G } from '@/features/glossary/glossary-term'
import LabActivity from '@/components/lab/LabActivity'
import Quiz, { buildQuizFromI18n } from '@/components/quiz/Quiz'
import CapacitanceBuilder from '@/components/widgets/CapacitanceBuilder'
import SeriesParallelCapCalc from '@/components/widgets/SeriesParallelCapCalc'
import RCChargeDischarge from '@/components/widgets/RCChargeDischarge'
import CapacitorTypeGallery from '@/components/diagrams/CapacitorTypeGallery'
import CapSeriesParallelSchematic from '@/components/diagrams/CapSeriesParallelSchematic'
import BlocksDcPassesAcDiagram from '@/components/diagrams/BlocksDcPassesAcDiagram'
import BlocksHighPassSchematic from '@/components/diagrams/BlocksHighPassSchematic'
import CouplingCapSchematic from '@/components/diagrams/CouplingCapSchematic'
import BypassCapSchematic from '@/components/diagrams/BypassCapSchematic'
import SeriesIslandIllustration from '@/components/diagrams/SeriesIslandIllustration'
import RCChargingSchematic from '@/components/diagrams/RCChargingSchematic'
import { STORAGE_KEYS } from '@/lib/storage-keys'
import { mathComponents } from '@/lib/trans-defaults'

const CHAPTER_ID = '1-5'
const QUIZ_QUESTION_COUNT = 8

/* Shared component-mapping shorthands. Every Trans in this chapter needs
 * some subset of these; defining them once keeps the JSX terse. */
function nowrapSpan() {
  return <span style={{ whiteSpace: 'nowrap' }} />
}

export default function Chapter1_5() {
  const { t } = useTranslation('ui')
  const nowrap = nowrapSpan()

  const quizQuestions = useMemo(
    () => buildQuizFromI18n(t, 'ch1_5', QUIZ_QUESTION_COUNT, {
      nowrap: nowrapSpan(),
      var: <MathVar />,
      sub: <sub />,
      strong: <strong />,
      cap: <G k="capacitance" />,
    }),
    [t],
  )

  return (
    <>
      {/* ── Intro ──────────────────────────────────────────────── */}
      <p>
        <Trans
          i18nKey="ch1_5.intro"
          ns="ui"
          components={{
            strong: <strong />,
            var: <MathVar />, res: <G k="resistor" />, capt: <G k="capacitor" /> }}
        />
      </p>

      <p>
        <Trans
          i18nKey="ch1_5.introPreview"
          ns="ui"
          components={{
            strong: <strong />,
            cap: <G k="capacitance" />,
            diel: <G k="dielectric" />,
            elec: <G k="electrolytic" />,
            tc: <G k="time constant" />,
            nowrap: nowrap,
            var: <MathVar />, ac: <G k="ac" />, dc: <G k="dc" />, reac: <G k="reactance" /> }}
        />
      </p>

      {/* ── Section 1: What capacitance is ─────────────────────── */}
      <Section id="what-it-is" labelKey="ch1_5.sectionWhatItIs" />

      <p>
        <Trans
          i18nKey="ch1_5.whatItIsIntro"
          ns="ui"
          components={{
            cap: <G k="capacitance" />,
            var: <MathVar />,
          }}
        />
      </p>

      <p>{t('ch1_5.whatItIsQV')}</p>

      <MBlock tex="Q = C \cdot V" />

      <p>
        <Trans
          i18nKey="ch1_5.whatItIsDefinitions"
          ns="ui"
          components={{
            strong: <strong />,
            var: <MathVar />,
            coul: <G k="coulomb" />,
            far: <G k="farad" />,
          }}
        />
      </p>

      <p>
        <Trans
          i18nKey="ch1_5.whatItIsRateForm"
          ns="ui"
          components={{
            var: <MathVar />,
            nowrap: nowrap,
            deriv: <G k="derivative" />,
          }}
        />
      </p>

      <MBlock tex="I = C \cdot \dfrac{dV}{dt}" />

      <p>
        <Trans
          i18nKey="ch1_5.whatItIsRateNote"
          ns="ui"
          components={{
            strong: <strong />,
            var: <MathVar />,
            nowrap: nowrap,
          }}
        />
      </p>

      {/* ── Section 2: Plates, spacing, dielectric ─────────────── */}
      <Section id="geometry" labelKey="ch1_5.sectionGeometry" />

      <p>{t('ch1_5.geometryIntro')}</p>

      <MBlock tex="C = \varepsilon_0 \cdot \varepsilon_r \cdot \dfrac{A}{d}" />

      <p>
        <Trans
          i18nKey="ch1_5.geometryVars"
          ns="ui"
          components={{
            var: <MathVar />,
            sub: <sub />,
            strong: <strong />,
            diel: <G k="dielectric" />,
          }}
        />
      </p>

      <p>
        <Trans
          i18nKey="ch1_5.geometryDielectrics"
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
          i18nKey="ch1_5.geometryBuilderIntro"
          ns="ui"
          components={{ var: <MathVar /> }}
        />
      </p>

      <CapacitanceBuilder />

      {/* ── Section 3: Types ──────────────────────────────────── */}
      <Section id="types" labelKey="ch1_5.sectionTypes" />

      <p>{t('ch1_5.typesIntro')}</p>

      <CapacitorTypeGallery />

      <p>
        <Trans
          i18nKey="ch1_5.typesCeramicIntro"
          ns="ui"
          components={{ ...mathComponents, strong: <strong /> }}
        />
      </p>

      <Callout variant="caution">
        <Trans
          i18nKey="ch1_5.typesCeramicCallout"
          ns="ui"
          components={{ ...mathComponents, strong: <strong />, filt: <G k="filter" /> }}
        />
      </Callout>

      <p>
        <Trans
          i18nKey="ch1_5.typesFilmIntro"
          ns="ui"
          components={{ ...mathComponents, strong: <strong /> }}
        />
      </p>

      <p>
        <Trans
          i18nKey="ch1_5.typesElectrolyticIntro"
          ns="ui"
          components={{ ...mathComponents, strong: <strong />,
            elec: <G k="electrolytic" />,
            esr: <G k="esr" />, }}
        />
      </p>

      <Callout variant="danger">
        <Trans
          i18nKey="ch1_5.typesElectrolyticCallout"
          ns="ui"
          components={{ ...mathComponents, strong: <strong />, diode: <G k="diode" /> }}
        />
      </Callout>

      <p>
        <Trans
          i18nKey="ch1_5.typesOthers"
          ns="ui"
          components={{ ...mathComponents, strong: <strong /> }}
        />
      </p>

      {/* ── Section 4: Series and parallel ─────────────────────── */}
      <Section id="combinations" labelKey="ch1_5.sectionCombinations" />

      <p>
        <Trans
          i18nKey="ch1_5.combinationsIntro"
          ns="ui"
          components={{ ...mathComponents, strong: <strong /> }}
        />
      </p>

      <CapSeriesParallelSchematic />

      <p>
        <Trans
          i18nKey="ch1_5.parallelFormulaLead"
          ns="ui"
          components={{
            strong: <strong />,
            var: <MathVar />,
            sub: <sub />,
            nowrap: nowrap,
          }}
        />
      </p>

      <MBlock tex="C_{\mathrm{parallel}} = C_1 + C_2" />

      <p>
        <Trans
          i18nKey="ch1_5.parallelIntuition"
          ns="ui"
          components={{ ...mathComponents, strong: <strong /> }}
        />
      </p>

      <p>
        <Trans
          i18nKey="ch1_5.seriesFormulaLead"
          ns="ui"
          components={{
            strong: <strong />,
            charge: <G k="charge" />,
            var: <MathVar />,
            sub: <sub />,
            nowrap: nowrap,
          }}
        />
      </p>

      <SeriesIslandIllustration />

      <MBlock tex="V = \dfrac{Q}{C_1} + \dfrac{Q}{C_2} = Q \cdot \left(\dfrac{1}{C_1} + \dfrac{1}{C_2}\right)" />

      <p>
        <Trans
          i18nKey="ch1_5.seriesFormulaReciprocal"
          ns="ui"
          components={{
            var: <MathVar />,
            sub: <sub />,
            nowrap: nowrap,
          }}
        />
      </p>

      <MBlock tex="\dfrac{1}{C_{\mathrm{series}}} = \dfrac{1}{C_1} + \dfrac{1}{C_2} + \cdots + \dfrac{1}{C_n}" />

      <p>{t('ch1_5.seriesShortcut')}</p>

      <MBlock tex="C_{\mathrm{series}} = \dfrac{C_1 \cdot C_2}{C_1 + C_2}" />

      <p>
        <Trans
          i18nKey="ch1_5.seriesIntuition"
          ns="ui"
          components={{ ...mathComponents, strong: <strong /> }}
        />
      </p>

      <Callout variant="caution">
        <Trans
          i18nKey="ch1_5.seriesVoltageSharing"
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
          i18nKey="ch1_5.combinationsCalcIntro"
          ns="ui"
          components={{ ...mathComponents, em: <em /> }}
        />
      </p>

      <SeriesParallelCapCalc />

      {/* ── Section 5: Energy ──────────────────────────────────── */}
      <Section id="energy" labelKey="ch1_5.sectionEnergy" />

      <p>
        <Trans
          i18nKey="ch1_5.energyIntro"
          ns="ui"
          components={{
            strong: <strong />,
            var: <MathVar />,
            nowrap: nowrap,
          }}
        />
      </p>

      <MBlock tex="U = \tfrac{1}{2} C V^{2}" />

      <p>
        <Trans
          i18nKey="ch1_5.energyWorkedExample"
          ns="ui"
          components={{
            var: <MathVar />,
            nowrap: nowrap,
          }}
        />
      </p>

      {/* ── Section 6: RC time constant ────────────────────────── */}
      <Section id="rc-time-constant" labelKey="ch1_5.sectionRC" />

      <RCChargingSchematic />

      <p>
        <Trans
          i18nKey="ch1_5.rcIntro"
          ns="ui"
          components={{
            strong: <strong />,
            var: <MathVar />,
            sub: <sub />,
            cap: <G k="capacitance" />,
            nowrap: nowrap,
          }}
        />
      </p>

      <MBlock tex="V(t) = V_{\mathrm{in}} \left(1 - e^{-t/\tau}\right), \quad \tau = R \cdot C" />

      <p>
        <Trans
          i18nKey="ch1_5.rcTauDefn"
          ns="ui"
          components={{
            strong: <strong />,
            var: <MathVar />,
            tc: <G k="time constant" />,
            nowrap: nowrap,
          }}
        />
      </p>

      <p>
        <Trans
          i18nKey="ch1_5.rcShortcuts"
          ns="ui"
          components={{ ...mathComponents, strong: <strong />, nowrap: nowrap }}
        />
      </p>

      <p>
        <Trans
          i18nKey="ch1_5.rcCurvePoints"
          ns="ui"
          components={{
            strong: <strong />,
            var: <MathVar />,
            sub: <sub />,
            deb: <G k="debouncing" />,
          }}
        />
      </p>

      <p>
        <Trans
          i18nKey="ch1_5.rcDischargeDerivation"
          ns="ui"
          components={{
            strong: <strong />,
            var: <MathVar />,
            sub: <sub />,
          }}
        />
      </p>

      <MBlock tex="V(t) = V_{0} \, e^{-t/\tau}" />

      <p>
        <Trans
          i18nKey="ch1_5.rcWidgetIntro"
          ns="ui"
          components={{ var: <MathVar /> }}
        />
      </p>

      <RCChargeDischarge />

      <Callout variant="danger">
        <Trans
          i18nKey="ch1_5.rcSafetyCallout"
          ns="ui"
          components={{ ...mathComponents, strong: <strong />, nowrap: nowrap }}
        />
      </Callout>

      <Callout variant="note">
        <div className="space-y-3">
          <p>
            <Trans
              i18nKey="ch1_5.rcWorkedExampleProblem"
              ns="ui"
              components={{ strong: <strong />, var: <MathVar /> }}
            />
          </p>

          <p>
            <Trans
              i18nKey="ch1_5.rcWorkedExampleStep1"
              ns="ui"
              components={{ strong: <strong />, var: <MathVar />, nowrap: nowrap }}
            />
          </p>
          <MBlock tex="V_{\mathrm{in}} \cdot \left(1 - e^{-t/RC}\right) \;=\; \tfrac{2}{3}\, V_{\mathrm{in}}" />

          <p>
            <Trans
              i18nKey="ch1_5.rcWorkedExampleStep2"
              ns="ui"
              components={{ strong: <strong />, var: <MathVar /> }}
            />
          </p>
          <MBlock tex="1 - e^{-t/RC} \;=\; \tfrac{2}{3}" />

          <p>
            <Trans
              i18nKey="ch1_5.rcWorkedExampleStep3"
              ns="ui"
              components={{
                strong: <strong />,
                var: <MathVar />,
                nowrap: nowrap,
                sup: <sup />,
              }}
            />
          </p>
          <MBlock tex="-\,\dfrac{t}{RC} \;=\; -\ln 3" />

          <p>
            <Trans
              i18nKey="ch1_5.rcWorkedExampleStep3b"
              ns="ui"
              components={{ ...mathComponents, strong: <strong /> }}
            />
          </p>
          <MBlock tex="\dfrac{t}{RC} \;=\; \ln 3 \;\;\Longrightarrow\;\; t \;=\; RC \cdot \ln 3" />

          <p>
            <Trans
              i18nKey="ch1_5.rcWorkedExampleStep3c"
              ns="ui"
              components={{ ...mathComponents, nowrap: nowrap }}
            />
          </p>
          <MBlock tex="t \;\approx\; 1{,}10 \cdot RC" />

          <p>
            <Trans
              i18nKey="ch1_5.rcWorkedExampleStep4"
              ns="ui"
              components={{ strong: <strong />, var: <MathVar />, nowrap: nowrap }}
            />
          </p>
          <MBlock tex="RC = \dfrac{t}{\ln 3} = \dfrac{1\,\mathrm{s}}{1{,}10} \approx 0{,}91\,\mathrm{s}" />

          <p>
            <Trans
              i18nKey="ch1_5.rcWorkedExampleStep5"
              ns="ui"
              components={{ strong: <strong />, var: <MathVar />, nowrap: nowrap }}
            />
          </p>
          <MBlock tex="R = \dfrac{0{,}91\,\mathrm{s}}{10\,\mathrm{\mu F}} \approx 91\,\mathrm{k\Omega}" />

          <p>
            <Trans
              i18nKey="ch1_5.rcWorkedExampleStep6"
              ns="ui"
              components={{ strong: <strong />, var: <MathVar />, nowrap: nowrap }}
            />
          </p>
        </div>
      </Callout>

      {/* ── Section 7: Blocks DC, passes AC ────────────────────── */}
      <Section id="blocks-dc-passes-ac" labelKey="ch1_5.sectionBlocksDcPassesAc" />

      <p>
        <Trans
          i18nKey="ch1_5.blocksIntro"
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
          i18nKey="ch1_5.blocksPassesAc"
          ns="ui"
          components={{
            strong: <strong />,
            var: <MathVar />,
            sub: <sub />,
            nowrap: nowrap, imp: <G k="impedance" /> }}
        />
      </p>

      <BlocksHighPassSchematic />

      <BlocksDcPassesAcDiagram />

      <p>{t('ch1_5.blocksApplications')}</p>

      <p>
        <Trans
          i18nKey="ch1_5.blocksCouplingCap"
          ns="ui"
          components={{ ...mathComponents, strong: <strong />,
            coupl: <G k="coupling capacitor" />, }}
        />
      </p>

      <CouplingCapSchematic />

      <p>
        <Trans
          i18nKey="ch1_5.blocksBypassCap"
          ns="ui"
          components={{ ...mathComponents, strong: <strong />,
            bypass: <G k="bypass capacitor" />, }}
        />
      </p>

      <BypassCapSchematic />

      {/* ── Summary ─────────────────────────────────────────────── */}
      <Section id="summary" labelKey="ch1_5.sectionSummary" />

      <Callout variant="key">
        <p>
          <Trans
            i18nKey="ch1_5.keyTakeaway1"
            ns="ui"
            components={{
              var: <MathVar />,
              nowrap: nowrap,
            }}
          />
        </p>
        <p>{t('ch1_5.keyTakeaway2')}</p>
        <p>
          <Trans
            i18nKey="ch1_5.keyTakeaway3"
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
            i18nKey="ch1_5.keyTakeaway4"
            ns="ui"
            components={{
              var: <MathVar />,
              nowrap: nowrap,
            }}
          />
        </p>
        <p>
          <Trans
            i18nKey="ch1_5.keyTakeaway5"
            ns="ui"
            components={{ ...mathComponents, coupl: <G k="coupling capacitor" />,
              bypass: <G k="bypass capacitor" />, }}
          />
        </p>
      </Callout>

      {/* ── Lab ─────────────────────────────────────────────────── */}
      <LabActivity
        label="1.5"
        goal={
          <Trans
            i18nKey="ch1_5.labGoal"
            ns="ui"
            components={{
              var: <MathVar />,
              nowrap: nowrap,
            }}
          />
        }
        equipment={[
          t('ch1_5.labEquip1'),
          <Trans key="e2" i18nKey="ch1_5.labEquip2" ns="ui" components={{ ...mathComponents, multimeter: <G k="multimeter" /> }} />,
          <Trans key="e3" i18nKey="ch1_5.labEquip3" ns="ui" components={{ ...mathComponents, breadboard: <G k="breadboard" /> }} />,
          t('ch1_5.labEquip4'),
        ]}
        components={[
          <Trans key="c1" i18nKey="ch1_5.labComp1" ns="ui" components={{ ...mathComponents, strong: <strong /> }} />,
          <Trans key="c2" i18nKey="ch1_5.labComp2" ns="ui" components={{ ...mathComponents, strong: <strong /> }} />,
          t('ch1_5.labComp3'),
        ]}
        procedure={[
          { text: <Trans i18nKey="ch1_5.labStep1" ns="ui" components={{ ...mathComponents, strong: <strong /> }} /> },
          { text: <Trans i18nKey="ch1_5.labStep2" ns="ui" components={{ strong: <strong />, var: <MathVar />, sub: <sub />, nowrap: nowrap }} /> },
          { text: <Trans i18nKey="ch1_5.labStep3" ns="ui" components={{ strong: <strong />, var: <MathVar />, sub: <sub /> }} /> },
          { text: <Trans i18nKey="ch1_5.labStep4" ns="ui" components={{ var: <MathVar />, sub: <sub /> }} /> },
          { text: <Trans i18nKey="ch1_5.labStep5" ns="ui" components={{ var: <MathVar /> }} /> },
          { text: <Trans i18nKey="ch1_5.labStep6" ns="ui" components={{ ...mathComponents, em: <em /> }} /> },
        ]}
        expectedResult={
          <Trans
            i18nKey="ch1_5.labExpected"
            ns="ui"
            components={{
              var: <MathVar />,
              nowrap: nowrap,
            }}
          />
        }
        connectionToTheory={
          <Trans
            i18nKey="ch1_5.labConnection"
            ns="ui"
            components={{
              var: <MathVar />,
              sub: <sub />,
              nowrap: nowrap,
            }}
          />
        }
        troubleshooting={[
          <Trans key="t1" i18nKey="ch1_5.labTrouble1" ns="ui" components={{ strong: <strong />, var: <MathVar />, sub: <sub /> }} />,
          <Trans key="t2" i18nKey="ch1_5.labTrouble2" ns="ui" components={{ strong: <strong />, var: <MathVar />, sub: <sub /> }} />,
          <Trans key="t3" i18nKey="ch1_5.labTrouble3" ns="ui" components={{ ...mathComponents, strong: <strong /> }} />,
        ]}
      />

      {/* ── Quiz ────────────────────────────────────────────────── */}
      <Quiz
        title={t('ch1_5.quizTitle')}
        storageKey={STORAGE_KEYS.quizProgress(CHAPTER_ID)}
        questions={quizQuestions}
      />
    </>
  )
}
