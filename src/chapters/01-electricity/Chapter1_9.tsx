// Chapter 1.9 — Transformers
import { useMemo } from 'react'
import { useTranslation, Trans } from 'react-i18next'
import { Callout } from '@/components/ui/callout'
import { Section } from '@/components/ui/section-heading'
import { MBlock, MathVar } from '@/components/ui/math'
import { G } from '@/features/glossary/glossary-term'
import LabActivity from '@/components/lab/LabActivity'
import Quiz, { buildQuizFromI18n } from '@/components/quiz/Quiz'
import TurnsRatioCalculator from '@/components/widgets/TurnsRatioCalculator'
import ImpedanceTransformer from '@/components/widgets/ImpedanceTransformer'
import MagnetisingCurrentExplorer from '@/components/widgets/MagnetisingCurrentExplorer'
import TransformerVoltageSchematic from '@/components/diagrams/TransformerVoltageSchematic'
import TransformerImpedanceSchematic from '@/components/diagrams/TransformerImpedanceSchematic'
import AutotransformerSchematic from '@/components/diagrams/AutotransformerSchematic'
import BalunSchematic from '@/components/diagrams/BalunSchematic'
import TransformerLabSchematic from '@/components/diagrams/TransformerLabSchematic'
import LeakageFluxDiagram from '@/components/diagrams/LeakageFluxDiagram'
import CoreFamiliesGallery from '@/components/diagrams/CoreFamiliesGallery'
import { STORAGE_KEYS } from '@/lib/storage-keys'
import { mathComponents } from '@/lib/trans-defaults'

const CHAPTER_ID = '1-9'
const QUIZ_QUESTION_COUNT = 10

function nowrapSpan() {
  return <span style={{ whiteSpace: 'nowrap' }} />
}

export default function Chapter1_9() {
  const { t } = useTranslation('ui')
  const nowrap = nowrapSpan()

  const quizQuestions = useMemo(
    () => buildQuizFromI18n(t, 'ch1_9', QUIZ_QUESTION_COUNT, {
      nowrap: nowrapSpan(),
      var: <MathVar />,
      sub: <sub />,
      sup: <sup />,
      strong: <strong />,
      em: <em />,
      hyst: <G k="hysteresis" />,
      eddy: <G k="eddy current" />,
    }),
    [t],
  )

  return (
    <>
      {/* ── Intro ──────────────────────────────────────────────── */}
      <p>
        <Trans
          i18nKey="ch1_9.intro"
          ns="ui"
          components={{
            strong: <strong />,
            xfmr: <G k="transformer" />,
            feed: <G k="feeder" />,
            fold: <G k="folded dipole" />,
          }}
        />
      </p>

      <p>
        <Trans
          i18nKey="ch1_9.introPreview"
          ns="ui"
          components={{
            ...mathComponents,
            strong: <strong />,
            nowrap: nowrap,
            bln: <G k="balun" />,
            ferr: <G k="ferrite" />,
            toro: <G k="toroid" />,
            hyst: <G k="hysteresis" />,
            eddy: <G k="eddy current" />,
            vrc: <G k="variac" />, imp: <G k="impedance" />, inductance: <G k="inductance" /> }}
        />
      </p>

      {/* ── Section 1: Two coupled coils ───────────────────────── */}
      <Section id="coupled" labelKey="ch1_9.sectionCoupled" />

      <p>{t('ch1_9.coupledRecap')}</p>

      <p>
        <Trans
          i18nKey="ch1_9.coupledIdea"
          ns="ui"
          components={{ strong: <strong /> }}
        />
      </p>

      <p>
        <Trans
          i18nKey="ch1_9.coupledOnlyAc"
          ns="ui"
          components={{ strong: <strong />, ac: <G k="ac" />, dc: <G k="dc" /> }}
        />
      </p>

      <Callout variant="key">
        <p>
          <Trans
            i18nKey="ch1_9.coupledKeyCallout"
            ns="ui"
            components={{ strong: <strong /> }}
          />
        </p>
      </Callout>

      {/* ── Section 2: Voltage ratio ───────────────────────────── */}
      <Section id="voltage" labelKey="ch1_9.sectionVoltage" />

      <p>
        <Trans
          i18nKey="ch1_9.voltageIntuition"
          ns="ui"
          components={{ ...mathComponents, strong: <strong />, nowrap: nowrap }}
        />
      </p>

      <TransformerVoltageSchematic />

      <p>{t('ch1_9.voltageFormulaIntro')}</p>

      <MBlock tex="V_{s} = V_{p} \cdot \dfrac{N_{s}}{N_{p}}" />

      <p>
        <Trans
          i18nKey="ch1_9.voltageStepUpDown"
          ns="ui"
          components={{ strong: <strong /> }}
        />
      </p>

      <p>
        <Trans
          i18nKey="ch1_9.voltageExample"
          ns="ui"
          components={{ ...mathComponents, strong: <strong />, nowrap: nowrap }}
        />
      </p>

      <p>{t('ch1_9.voltageWidgetIntro')}</p>

      <TurnsRatioCalculator />

      <Callout variant="caution">
        <p>{t('ch1_9.voltageGotcha')}</p>
      </Callout>

      {/* ── Section 3: Current ratio ───────────────────────────── */}
      <Section id="current" labelKey="ch1_9.sectionCurrent" />

      <p>
        <Trans
          i18nKey="ch1_9.currentConservation"
          ns="ui"
          components={{ ...mathComponents, nowrap: nowrap }}
        />
      </p>

      <p>
        <Trans
          i18nKey="ch1_9.currentFormulaIntro"
          ns="ui"
          components={{ strong: <strong /> }}
        />
      </p>

      <MBlock tex="I_{p} = I_{s} \cdot \dfrac{N_{s}}{N_{p}}" />

      <p>
        <Trans
          i18nKey="ch1_9.currentInverse"
          ns="ui"
          components={{ strong: <strong /> }}
        />
      </p>

      <p>
        <Trans
          i18nKey="ch1_9.currentExample"
          ns="ui"
          components={{ strong: <strong />, nowrap: nowrap }}
        />
      </p>

      <p>
        <Trans
          i18nKey="ch1_9.currentWireWidth"
          ns="ui"
          components={{ ...mathComponents, strong: <strong />, nowrap: nowrap }}
        />
      </p>

      <Callout variant="key">
        <p>
          <Trans
            i18nKey="ch1_9.currentCallout"
            ns="ui"
            components={{ strong: <strong /> }}
          />
        </p>
      </Callout>

      {/* ── Section 4: Impedance ratio ─────────────────────────── */}
      <Section id="impedance" labelKey="ch1_9.sectionImpedance" />

      <p>
        <Trans
          i18nKey="ch1_9.impedanceWhy"
          ns="ui"
          components={{ strong: <strong />, transceiver: <G k="transceiver" />, swr: <G k="swr" /> }}
        />
      </p>

      <p>
        <Trans
          i18nKey="ch1_9.impedanceDerivation"
          ns="ui"
          components={{ ...mathComponents, strong: <strong />, nowrap: nowrap }}
        />
      </p>

      <p>{t('ch1_9.impedanceFormulaIntro')}</p>

      <MBlock tex="Z_{p} = Z_{s} \cdot \left(\dfrac{N_{p}}{N_{s}}\right)^{2}" />

      <TransformerImpedanceSchematic />

      <p>
        <Trans
          i18nKey="ch1_9.impedanceExample"
          ns="ui"
          components={{
            ...mathComponents,
            strong: <strong />,
            sup: <sup />,
            nowrap: nowrap,
            bln: <G k="balun" />,
          }}
        />
      </p>

      <p>{t('ch1_9.impedanceWidgetIntro')}</p>

      <ImpedanceTransformer />

      <Callout variant="key">
        <p>
          <Trans
            i18nKey="ch1_9.impedanceCallout"
            ns="ui"
            components={{ strong: <strong />, efhw: <G k="efhw" />, unun: <G k="unun" /> }}
          />
        </p>
      </Callout>

      {/* ── Section 5: Real-world losses ───────────────────────── */}
      <Section id="losses" labelKey="ch1_9.sectionLosses" />

      <p>
        <Trans
          i18nKey="ch1_9.lossesIntro"
          ns="ui"
          components={{ strong: <strong /> }}
        />
      </p>

      <p>
        <Trans
          i18nKey="ch1_9.lossesMagnetising"
          ns="ui"
          components={{ ...mathComponents, strong: <strong />, nowrap: nowrap }}
        />
      </p>

      <MagnetisingCurrentExplorer />

      <p>
        <Trans
          i18nKey="ch1_9.lossesLeakage"
          ns="ui"
          components={{ strong: <strong />, ind: <G k="inductor" /> }}
        />
      </p>

      <LeakageFluxDiagram />

      <p>
        <Trans
          i18nKey="ch1_9.lossesCopper"
          ns="ui"
          components={{ ...mathComponents, strong: <strong />, nowrap: nowrap }}
        />
      </p>

      <p>
        <Trans
          i18nKey="ch1_9.lossesCore"
          ns="ui"
          components={{
            strong: <strong />,
            hyst: <G k="hysteresis" />,
            eddy: <G k="eddy current" />,
          }}
        />
      </p>

      <Callout variant="caution">
        <p>
          <Trans
            i18nKey="ch1_9.lossesEfficiencyCallout"
            ns="ui"
            components={{ strong: <strong /> }}
          />
        </p>
      </Callout>

      {/* ── Section 6: Cores ───────────────────────────────────── */}
      <Section id="cores" labelKey="ch1_9.sectionCores" />

      <p>{t('ch1_9.coresIntro')}</p>

      <CoreFamiliesGallery />

      <p>
        <Trans
          i18nKey="ch1_9.coresIron"
          ns="ui"
          components={{ strong: <strong /> }}
        />
      </p>

      <p>
        <Trans
          i18nKey="ch1_9.coresFerrite"
          ns="ui"
          components={{
            strong: <strong />,
            ferr: <G k="ferrite" />,
            toro: <G k="toroid" />,
            emi: <G k="emi" />,
          }}
        />
      </p>

      <p>
        <Trans
          i18nKey="ch1_9.coresPowderedIron"
          ns="ui"
          components={{ strong: <strong />, bw: <G k="bandwidth" /> }}
        />
      </p>

      <p>
        <Trans
          i18nKey="ch1_9.coresAir"
          ns="ui"
          components={{
            strong: <strong />,
            hyst: <G k="hysteresis" />,
          }}
        />
      </p>

      {/* ── Section 7: Topologies ──────────────────────────────── */}
      <Section id="topologies" labelKey="ch1_9.sectionTopologies" />

      <p>
        <Trans
          i18nKey="ch1_9.topologyTwoWinding"
          ns="ui"
          components={{ strong: <strong /> }}
        />
      </p>

      <p>
        <Trans
          i18nKey="ch1_9.topologyAuto"
          ns="ui"
          components={{ strong: <strong /> }}
        />
      </p>

      <AutotransformerSchematic />

      <p>
        <Trans
          i18nKey="ch1_9.topologyBalun"
          ns="ui"
          components={{ strong: <strong />, bln: <G k="balun" /> }}
        />
      </p>

      <BalunSchematic />

      <Callout variant="note">
        <p>
          <Trans
            i18nKey="ch1_9.topologyCallout"
            ns="ui"
            components={{ strong: <strong /> }}
          />
        </p>
      </Callout>

      {/* ── Section 8: Applications ────────────────────────────── */}
      <Section id="applications" labelKey="ch1_9.sectionApplications" />

      <p>
        <Trans
          i18nKey="ch1_9.appsPowerSupply"
          ns="ui"
          components={{ strong: <strong /> }}
        />
      </p>

      <p>
        <Trans
          i18nKey="ch1_9.appsAudio"
          ns="ui"
          components={{ strong: <strong /> }}
        />
      </p>

      <p>
        <Trans
          i18nKey="ch1_9.appsRfMatching"
          ns="ui"
          components={{ strong: <strong /> }}
        />
      </p>

      <p>
        <Trans
          i18nKey="ch1_9.appsBalun"
          ns="ui"
          components={{ strong: <strong />, bln: <G k="balun" /> }}
        />
      </p>

      {/* ── Summary ────────────────────────────────────────────── */}
      <Section id="summary" labelKey="ch1_9.sectionSummary" />

      <Callout variant="key">
        <p>
          <Trans
            i18nKey="ch1_9.keyTakeaway1"
            ns="ui"
            components={{ strong: <strong /> }}
          />
        </p>
        <p>
          <Trans
            i18nKey="ch1_9.keyTakeaway2"
            ns="ui"
            components={{ ...mathComponents, strong: <strong />, nowrap: nowrap }}
          />
        </p>
        <p>
          <Trans
            i18nKey="ch1_9.keyTakeaway3"
            ns="ui"
            components={{ ...mathComponents, strong: <strong />, nowrap: nowrap }}
          />
        </p>
        <p>
          <Trans
            i18nKey="ch1_9.keyTakeaway4"
            ns="ui"
            components={{
              ...mathComponents,
              strong: <strong />,
              sup: <sup />,
              nowrap: nowrap,
            }}
          />
        </p>
        <p>
          <Trans
            i18nKey="ch1_9.keyTakeaway5"
            ns="ui"
            components={{
              ...mathComponents,
              strong: <strong />,
              nowrap: nowrap,
              hyst: <G k="hysteresis" />,
              eddy: <G k="eddy current" />,
            }}
          />
        </p>
        <p>
          <Trans
            i18nKey="ch1_9.keyTakeaway6"
            ns="ui"
            components={{ strong: <strong /> }}
          />
        </p>
      </Callout>

      {/* ── Lab ────────────────────────────────────────────────── */}
      <LabActivity
        label="1.9"
        goal={<Trans i18nKey="ch1_9.labGoal" ns="ui" components={{ square: <G k="square wave" /> }} />}
        equipment={[
          t('ch1_9.labEquip1'),
          t('ch1_9.labEquip2'),
          t('ch1_9.labEquip3'),
          t('ch1_9.labEquip4'),
        ]}
        components={[
          <Trans key="c1" i18nKey="ch1_9.labComp1" ns="ui" components={{ strong: <strong /> }} />,
          <Trans key="c2" i18nKey="ch1_9.labComp2" ns="ui" components={{ strong: <strong />, res: <G k="resistor" /> }} />,
          <Trans key="c3" i18nKey="ch1_9.labComp3" ns="ui" components={{ strong: <strong /> }} />,
        ]}
        procedure={[
          { text: <Trans i18nKey="ch1_9.labStep1" ns="ui" components={{ strong: <strong /> }} /> },
          {
            text: <Trans i18nKey="ch1_9.labStep2" ns="ui" components={{ strong: <strong /> }} />,
            diagram: <TransformerLabSchematic />,
          },
          { text: <Trans i18nKey="ch1_9.labStep3" ns="ui" components={{ ...mathComponents, nowrap: nowrap, code: <code className="bg-muted/50 rounded px-1 font-mono" />, duty: <G k="duty cycle" /> }} /> },
          { text: t('ch1_9.labStep4') },
          { text: <Trans i18nKey="ch1_9.labStep5" ns="ui" components={{ strong: <strong /> }} /> },
          { text: t('ch1_9.labStep6') },
        ]}
        expectedResult={t('ch1_9.labExpected')}
        connectionToTheory={t('ch1_9.labConnection')}
        troubleshooting={[
          <Trans key="t1" i18nKey="ch1_9.labTrouble1" ns="ui" components={{ strong: <strong /> }} />,
          <Trans key="t2" i18nKey="ch1_9.labTrouble2" ns="ui" components={{ ...mathComponents, strong: <strong />, nowrap: nowrap }} />,
          <Trans key="t3" i18nKey="ch1_9.labTrouble3" ns="ui" components={{ strong: <strong /> }} />,
        ]}
      />

      {/* ── Quiz ───────────────────────────────────────────────── */}
      <Quiz
        title={t('ch1_9.quizTitle')}
        storageKey={STORAGE_KEYS.quizProgress(CHAPTER_ID)}
        questions={quizQuestions}
      />
    </>
  )
}
