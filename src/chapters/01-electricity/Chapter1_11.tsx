// Chapter 1.11 — Transistors
import { useMemo } from 'react'
import { useTranslation, Trans } from 'react-i18next'
import { Callout } from '@/components/ui/callout'
import { Section } from '@/components/ui/section-heading'
import { MathVar } from '@/components/ui/math'
import { G } from '@/features/glossary/glossary-term'
import LabActivity from '@/components/lab/LabActivity'
import Quiz, { buildQuizFromI18n } from '@/components/quiz/Quiz'
import TransistorSymbolPanel from '@/components/diagrams/TransistorSymbolPanel'
import BjtSwitchSchematic from '@/components/diagrams/BjtSwitchSchematic'
import MosfetSwitchSchematic from '@/components/diagrams/MosfetSwitchSchematic'
import CommonEmitterAmplifierSchematic from '@/components/diagrams/CommonEmitterAmplifierSchematic'
import BjtBiasingDiagram from '@/components/diagrams/BjtBiasingDiagram'
import BjtOutputCurves from '@/components/diagrams/BjtOutputCurves'
import BjtOperationVisualizer from '@/components/widgets/BjtOperationVisualizer'
import BjtSwitchDesigner from '@/components/widgets/BjtSwitchDesigner'
import LoadLinePlotter from '@/components/widgets/LoadLinePlotter'
import CeGainCalculator from '@/components/widgets/CeGainCalculator'
import { STORAGE_KEYS } from '@/lib/storage-keys'
import { mathComponents } from '@/lib/trans-defaults'

const CHAPTER_ID = '1-11'
const QUIZ_QUESTION_COUNT = 5

function nowrapSpan() {
  return <span style={{ whiteSpace: 'nowrap' }} />
}

export default function Chapter1_11() {
  const { t } = useTranslation('ui')
  const nowrap = nowrapSpan()

  const quizQuestions = useMemo(
    () => buildQuizFromI18n(t, 'ch1_11', QUIZ_QUESTION_COUNT, {
      nowrap: nowrapSpan(),
      var: <MathVar />,
      sub: <sub />,
      sup: <sup />,
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
          i18nKey="ch1_11.intro1"
          ns="ui"
          components={{
            ...mathComponents,
            strong: <strong />,
            d: <G k="diode" />,
            tn: <G k="transistor" />,
            ac: <G k="ac" />,
            dc: <G k="dc" />,
          }}
        />
      </p>
      <p>
        <Trans
          i18nKey="ch1_11.intro2"
          ns="ui"
          components={{
            ...mathComponents,
            strong: <strong />,
            em: <em />,
            bjtT: <G k="bjt" />,
            fetT: <G k="fet" />,
            dc: <G k="dc" />,
          }}
        />
      </p>

      {/* ── Section 1: Two species ──────────────────────────── */}
      <Section id="families" labelKey="ch1_11.sectionFamilies" />
      <p>
        <Trans
          i18nKey="ch1_11.familiesIntro"
          ns="ui"
          components={{
            strong: <strong />,
            jfetT: <G k="jfet" />,
          }}
        />
      </p>

      <TransistorSymbolPanel />

      <p>{t('ch1_11.familiesAfter')}</p>
      <ul className="not-prose space-y-3 my-4 text-foreground">
        <li className="flex gap-3 items-start rounded-md border border-border bg-card/40 px-4 py-3 leading-6">
          <span aria-hidden="true" className="shrink-0 mt-[7px] inline-block w-2 h-2 rounded-full bg-primary/70" />
          <span className="flex-1 min-w-0 text-sm">
            <Trans
              i18nKey="ch1_11.familiesBjtRow"
              ns="ui"
              components={{
                ...mathComponents,
                strong: <strong />,
                nowrap,
                npn: <G k="npn" />,
                pnp: <G k="pnp" />,
                baseT: <G k="base" />,
                colT: <G k="collector" />,
                emi: <G k="emitter" />,
              }}
            />
          </span>
        </li>
        <li className="flex gap-3 items-start rounded-md border border-border bg-card/40 px-4 py-3 leading-6">
          <span aria-hidden="true" className="shrink-0 mt-[7px] inline-block w-2 h-2 rounded-full bg-primary/70" />
          <span className="flex-1 min-w-0 text-sm">
            <Trans
              i18nKey="ch1_11.familiesFetRow"
              ns="ui"
              components={{
                ...mathComponents,
                strong: <strong />,
                nowrap,
                m: <G k="mosfet" />,
                dr: <G k="drain" />,
                ll2: <G k="logic level" />,
              }}
            />
          </span>
        </li>
      </ul>

      {/* ── Section 2: How a transistor actually works ───────── */}
      {/* This section was added after the user reported being unable
          to truly understand the chapter without ~6 rounds of chat
          Q&A. The previous flow jumped from «BJT has three pins»
          straight into «here is a BJT switch» without ever showing
          the internal mechanism. */}
      <Section id="inside" labelKey="ch1_11.sectionInside" />
      <p>
        <Trans
          i18nKey="ch1_11.insideIntro"
          ns="ui"
          components={{ strong: <strong /> }}
        />
      </p>
      <p>
        <Trans
          i18nKey="ch1_11.insideDopingNote"
          ns="ui"
          components={{ strong: <strong />, em: <em /> }}
        />
      </p>
      <p>
        <Trans
          i18nKey="ch1_11.insideMechanism"
          ns="ui"
          components={{ ...mathComponents, strong: <strong />, nowrap }}
        />
      </p>

      <BjtOperationVisualizer />

      <p>
        <Trans
          i18nKey="ch1_11.insideBiasNote"
          ns="ui"
          components={{ ...mathComponents, strong: <strong /> }}
        />
      </p>

      <BjtBiasingDiagram />

      <Callout variant="tip">
        <p>
          <Trans
            i18nKey="ch1_11.insideWhyEmitterInjects"
            ns="ui"
            components={{ ...mathComponents, strong: <strong />, em: <em /> }}
          />
        </p>
      </Callout>

      <Callout variant="tip">
        <p>
          <Trans
            i18nKey="ch1_11.insideWhyIcIndependent"
            ns="ui"
            components={{ ...mathComponents, strong: <strong />, em: <em />, nowrap }}
          />
        </p>
      </Callout>

      <p>{t('ch1_11.insideTwoLawsIntro')}</p>
      <ul className="not-prose space-y-3 my-4 text-foreground">
        <li className="flex gap-3 items-start rounded-md border border-border bg-card/40 px-4 py-3 leading-6">
          <span aria-hidden="true" className="shrink-0 mt-[7px] inline-block w-2 h-2 rounded-full bg-primary/70" />
          <span className="flex-1 min-w-0 text-sm">
            <Trans
              i18nKey="ch1_11.insideTwoLawsVoltage"
              ns="ui"
              components={{ ...mathComponents, strong: <strong />, nowrap, ivc: <G k="iv curve" /> }}
            />
          </span>
        </li>
        <li className="flex gap-3 items-start rounded-md border border-border bg-card/40 px-4 py-3 leading-6">
          <span aria-hidden="true" className="shrink-0 mt-[7px] inline-block w-2 h-2 rounded-full bg-primary/70" />
          <span className="flex-1 min-w-0 text-sm">
            <Trans
              i18nKey="ch1_11.insideTwoLawsCurrent"
              ns="ui"
              components={{ ...mathComponents, strong: <strong />, nowrap }}
            />
          </span>
        </li>
      </ul>
      <p>
        <Trans
          i18nKey="ch1_11.insideTwoLawsCompete"
          ns="ui"
          components={{ ...mathComponents, strong: <strong />, nowrap }}
        />
      </p>
      <p>
        <Trans
          i18nKey="ch1_11.insideTwoLawsWidget"
          ns="ui"
          components={{ ...mathComponents, strong: <strong />, nowrap }}
        />
      </p>
      <p>
        <Trans
          i18nKey="ch1_11.insideRegions"
          ns="ui"
          components={{ ...mathComponents, strong: <strong />, nowrap }}
        />
      </p>

      {/* ── Section 3: BJT as a switch ───────────────────────── */}
      <Section id="bjtSwitch" labelKey="ch1_11.sectionBjtSwitch" />
      <p>
        <Trans
          i18nKey="ch1_11.bjtSwitchIntro"
          ns="ui"
          components={{ strong: <strong /> }}
        />
      </p>

      <BjtSwitchSchematic />

      <p>
        <Trans
          i18nKey="ch1_11.bjtSwitchHowItWorks"
          ns="ui"
          components={{
            ...mathComponents,
            strong: <strong />,
            em: <em />,
            nowrap,
            sat: <G k="transistor saturation" />,
            baseT: <G k="base" />,
            colT: <G k="collector" />,
            emi: <G k="emitter" />,
          }}
        />
      </p>

      <p>
        <Trans
          i18nKey="ch1_11.bjtSwitchWhyRb"
          ns="ui"
          components={{ ...mathComponents, strong: <strong />, nowrap }}
        />
      </p>

      <Callout variant="key">
        <p>
          <Trans
            i18nKey="ch1_11.bjtSwitchKey"
            ns="ui"
            components={{
              ...mathComponents,
              strong: <strong />,
              nowrap,
              res: <G k="resistor" />,
            }}
          />
        </p>
      </Callout>

      <BjtSwitchDesigner />

      <Callout variant="tip">
        <p>
          <Trans
            i18nKey="ch1_11.bjtSwitchTip"
            ns="ui"
            components={{ strong: <strong /> }}
          />
        </p>
      </Callout>

      <Callout variant="caution">
        <p>
          <Trans
            i18nKey="ch1_11.bjtSwitchInductiveCaution"
            ns="ui"
            components={{
              ...mathComponents,
              strong: <strong />,
              flyback: <em />,
              ind: <G k="inductor" />,
              cat: <G k="cathode" />,
            }}
          />
        </p>
      </Callout>

      {/* ── Section 3: MOSFET as a switch ───────────────────── */}
      <Section id="mosfetSwitch" labelKey="ch1_11.sectionMosfetSwitch" />
      <p>
        <Trans
          i18nKey="ch1_11.mosfetSwitchIntro"
          ns="ui"
          components={{
            strong: <strong />,
            m: <G k="mosfet" />,
            ll2: <G k="logic level" />,
          }}
        />
      </p>

      <MosfetSwitchSchematic />

      <p>
        <Trans
          i18nKey="ch1_11.mosfetSwitchVsBjt"
          ns="ui"
          components={{ strong: <strong /> }}
        />
      </p>
      <ul className="not-prose space-y-3 my-4 text-foreground">
        <li className="flex gap-3 items-start rounded-md border border-border bg-card/40 px-4 py-3 leading-6">
          <span aria-hidden="true" className="shrink-0 mt-[7px] inline-block w-2 h-2 rounded-full bg-primary/70" />
          <span className="flex-1 min-w-0 text-sm">
            <Trans
              i18nKey="ch1_11.mosfetSwitchVsBjtBjt"
              ns="ui"
              components={{ strong: <strong />, var: <MathVar /> }}
            />
          </span>
        </li>
        <li className="flex gap-3 items-start rounded-md border border-border bg-card/40 px-4 py-3 leading-6">
          <span aria-hidden="true" className="shrink-0 mt-[7px] inline-block w-2 h-2 rounded-full bg-primary/70" />
          <span className="flex-1 min-w-0 text-sm">
            <Trans
              i18nKey="ch1_11.mosfetSwitchVsBjtMosfet"
              ns="ui"
              components={{ ...mathComponents, strong: <strong /> }}
            />
          </span>
        </li>
      </ul>

      <Callout variant="tip">
        <p>
          <Trans
            i18nKey="ch1_11.mosfetSwitchLogicLevel"
            ns="ui"
            components={{
              ...mathComponents,
              strong: <strong />,
              em: <em />,
            }}
          />
        </p>
      </Callout>

      {/* ── Section 4: Output curves ────────────────────────── */}
      <Section id="curves" labelKey="ch1_11.sectionCurves" />
      <p>
        <Trans
          i18nKey="ch1_11.curvesIntro"
          ns="ui"
          components={{
            ...mathComponents,
            strong: <strong />,
            em: <em />,
            enh: <G k="enhancement mode" />,
          }}
        />
      </p>

      <BjtOutputCurves />

      <p>
        <Trans
          i18nKey="ch1_11.curvesWhatChangesVce"
          ns="ui"
          components={{ ...mathComponents, strong: <strong />, em: <em />, nowrap }}
        />
      </p>

      <p>
        <Trans
          i18nKey="ch1_11.curvesActiveRegion"
          ns="ui"
          components={{
            ...mathComponents,
            strong: <strong />,
            nowrap,
            ar: <G k="active region" />,
          }}
        />
      </p>
      <p>
        <Trans
          i18nKey="ch1_11.curvesSaturation"
          ns="ui"
          components={{ ...mathComponents, strong: <strong /> }}
        />
      </p>
      <p>
        <Trans
          i18nKey="ch1_11.curvesCutoff"
          ns="ui"
          components={{ strong: <strong /> }}
        />
      </p>

      {/* ── Section 4b: Two mental models — switch vs current source.
           Placed AFTER curves (so «horizontal plateaus on the family
           of characteristics» is a callback, not a forward ref) and
           BEFORE the load line / CE amplifier sections (where the
           current-source intuition becomes the working model). ───── */}
      <Section id="twoModels" labelKey="ch1_11.sectionTwoModels" />
      <p>
        <Trans
          i18nKey="ch1_11.twoModelsIntro"
          ns="ui"
          components={{ ...mathComponents, strong: <strong /> }}
        />
      </p>
      <p>
        <Trans
          i18nKey="ch1_11.twoModelsSwitch"
          ns="ui"
          components={{ ...mathComponents, strong: <strong />, nowrap }}
        />
      </p>
      <p>
        <Trans
          i18nKey="ch1_11.twoModelsAmplifier"
          ns="ui"
          components={{ ...mathComponents, strong: <strong />, nowrap }}
        />
      </p>
      <p>
        <Trans
          i18nKey="ch1_11.twoModelsBoth"
          ns="ui"
          components={{ ...mathComponents, strong: <strong />, nowrap }}
        />
      </p>

      {/* ── Section 5: Load line ───────────────────────────── */}
      <Section id="loadLine" labelKey="ch1_11.sectionLoadLine" />
      <p>
        <Trans
          i18nKey="ch1_11.loadLineIntro"
          ns="ui"
          components={{
            ...mathComponents,
            strong: <strong />,
            em: <em />,
            ll: <G k="load line" />,
          }}
        />
      </p>

      <Callout variant="math">
        <p>
          <Trans
            i18nKey="ch1_11.loadLineDerivation"
            ns="ui"
            components={{
              ...mathComponents,
              strong: <strong />,
              nowrap,
              kvl: <G k="kvl" />,
            }}
          />
        </p>
      </Callout>

      <Callout variant="key">
        <p>
          <Trans
            i18nKey="ch1_11.loadLineQpointKey"
            ns="ui"
            components={{
              ...mathComponents,
              strong: <strong />,
              em: <em />,
              qp: <G k="q point" />,
            }}
          />
        </p>
      </Callout>

      <p>
        <Trans
          i18nKey="ch1_11.loadLineSwingNote"
          ns="ui"
          components={{ ...mathComponents, strong: <strong />, nowrap }}
        />
      </p>

      <LoadLinePlotter />

      {/* ── Section 6: Common-emitter amplifier ────────────── */}
      <Section id="ce" labelKey="ch1_11.sectionCe" />
      <p>
        <Trans
          i18nKey="ch1_11.ceTerminology"
          ns="ui"
          components={{ ...mathComponents, strong: <strong />, em: <em /> }}
        />
      </p>
      <p>
        <Trans
          i18nKey="ch1_11.ceIntro"
          ns="ui"
          components={{
            ...mathComponents,
            strong: <strong />,
            ce: <G k="common emitter" />,
            ac: <G k="ac" />,
          }}
        />
      </p>

      <CommonEmitterAmplifierSchematic />

      <p>
        <Trans
          i18nKey="ch1_11.ceGainStory"
          ns="ui"
          components={{ ...mathComponents, strong: <strong />, nowrap }}
        />
      </p>
      <Callout variant="math">
        <p>
          <Trans
            i18nKey="ch1_11.ceGainFormula"
            ns="ui"
            components={{ ...mathComponents, strong: <strong /> }}
          />
        </p>
      </Callout>
      <Callout variant="tip">
        <p>
          <Trans
            i18nKey="ch1_11.ceWhyInverted"
            ns="ui"
            components={{ ...mathComponents, strong: <strong />, nowrap, brk: <br /> }}
          />
        </p>
      </Callout>
      <p>
        <Trans
          i18nKey="ch1_11.ceGainAfter"
          ns="ui"
          components={{ ...mathComponents, strong: <strong />, nowrap }}
        />
      </p>

      <Callout variant="math">
        <p>
          <Trans
            i18nKey="ch1_11.ceWorkedExample"
            ns="ui"
            components={{ ...mathComponents, strong: <strong />, nowrap }}
          />
        </p>
      </Callout>

      <CeGainCalculator />

      <Callout variant="caution">
        <p>
          <Trans
            i18nKey="ch1_11.ceClippingNote"
            ns="ui"
            components={{ ...mathComponents, strong: <strong /> }}
          />
        </p>
      </Callout>

      {/* ── Section 7: Common-source amplifier ────────────── */}
      <Section id="cs" labelKey="ch1_11.sectionCs" />
      <p>
        <Trans
          i18nKey="ch1_11.csIntro"
          ns="ui"
          components={{
            ...mathComponents,
            strong: <strong />,
            cs: <G k="common source" />,
          }}
        />
      </p>
      <Callout variant="math">
        <p>
          <Trans
            i18nKey="ch1_11.csGainFormula"
            ns="ui"
            components={{ ...mathComponents, strong: <strong /> }}
          />
        </p>
      </Callout>
      <p>
        <Trans
          i18nKey="ch1_11.csGainAfter"
          ns="ui"
          components={{
            ...mathComponents,
            strong: <strong />,
            nowrap,
            tc: <G k="transconductance" />,
            inI: <G k="input impedance" />,
          }}
        />
      </p>

      {/* ── Section 8: Why biasing is hard ─────────────────── */}
      <Section id="bias" labelKey="ch1_11.sectionBias" />
      <p>
        <Trans
          i18nKey="ch1_11.biasIntro"
          ns="ui"
          components={{ ...mathComponents, strong: <strong />, em: <em /> }}
        />
      </p>
      <p>
        <Trans
          i18nKey="ch1_11.biasFix"
          ns="ui"
          components={{ ...mathComponents, strong: <strong /> }}
        />
      </p>
      <Callout variant="note">
        <p>
          <Trans
            i18nKey="ch1_11.biasTempNote"
            ns="ui"
            components={{ ...mathComponents, strong: <strong /> }}
          />
        </p>
      </Callout>

      {/* ── Lab ────────────────────────────────────────────── */}
      <LabActivity
        label="1.11"
        goal={<Trans i18nKey="ch1_11.labGoal" ns="ui" components={{ ...mathComponents, strong: <strong /> }} />}
        equipment={[
          t('ch1_11.labEquip1'),
          t('ch1_11.labEquip2'),
          t('ch1_11.labEquip3'),
          t('ch1_11.labEquip4'),
        ]}
        components={[
          t('ch1_11.labComp1'),
          <Trans key="comp2" i18nKey="ch1_11.labComp2" ns="ui" components={{ ...mathComponents }} />,
          t('ch1_11.labComp3'),
          t('ch1_11.labComp4'),
          t('ch1_11.labComp5'),
        ]}
        procedure={[
          { text: <Trans i18nKey="ch1_11.labStep1" ns="ui" components={{ strong: <strong /> }} /> },
          { text: t('ch1_11.labStep2') },
          { text: <Trans i18nKey="ch1_11.labStep3" ns="ui" components={{ ...mathComponents }} /> },
          { text: <Trans i18nKey="ch1_11.labStep4" ns="ui" components={{ ...mathComponents, em: <em /> }} /> },
          { text: <Trans i18nKey="ch1_11.labStep5" ns="ui" components={{ ...mathComponents, strong: <strong />, em: <em /> }} /> },
        ]}
        expectedResult={<Trans i18nKey="ch1_11.labExpected" ns="ui" components={{ ...mathComponents, strong: <strong />, em: <em /> }} />}
        connectionToTheory={<Trans i18nKey="ch1_11.labConnection" ns="ui" components={{ strong: <strong /> }} />}
        troubleshooting={[
          <Trans key="trouble1" i18nKey="ch1_11.labTrouble1" ns="ui" components={{ an: <G k="anode" />, strong: <strong /> }} />,
          <Trans key="trouble2" i18nKey="ch1_11.labTrouble2" ns="ui" components={{ ...mathComponents }} />,
          <Trans key="trouble3" i18nKey="ch1_11.labTrouble3" ns="ui" components={{ ...mathComponents }} />,
        ]}
      />

      {/* ── Quiz ────────────────────────────────────────────── */}
      <Quiz
        title={t('ch1_11.quizTitle')}
        storageKey={STORAGE_KEYS.quizProgress(CHAPTER_ID)}
        questions={quizQuestions}
      />
    </>
  )
}
