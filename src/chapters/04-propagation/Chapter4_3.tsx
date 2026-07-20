// Chapter 4.3 — Safety
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
import ShockCurrentScale from '@/components/diagrams/ShockCurrentScale'
import BodyCurrentCalculator from '@/components/widgets/BodyCurrentCalculator'
import MainsColourCode from '@/components/diagrams/MainsColourCode'
import BleederSchematic from '@/components/diagrams/BleederSchematic'
import CapacitorEnergyCalculator from '@/components/widgets/CapacitorEnergyCalculator'
import MpeFrequencyCurve from '@/components/diagrams/MpeFrequencyCurve'
import RfExposureCalculator from '@/components/widgets/RfExposureCalculator'
import GroundPotentialRise from '@/components/diagrams/GroundPotentialRise'
import SafetyChecklist from '@/components/widgets/SafetyChecklist'

const CHAPTER_ID = '4-3'
const QUIZ_QUESTION_COUNT = 15

export default function Chapter4_3() {
  const { t } = useTranslation('ui')

  const quizQuestions = useMemo(
    () => buildQuizFromI18n(t, 'ch4_3', QUIZ_QUESTION_COUNT, {
      strong: <strong />,
      em: <em />,
      var: <MathVar />,
    }),
    [t],
  )

  return (
    <>
      {/* ── Intro ──────────────────────────────────────────────── */}
      <p><Trans i18nKey="ch4_3.intro1" ns="ui" components={{ ...mathComponents, tr: <G k="transistor" />, em: <em /> }} /></p>
      <p><Trans i18nKey="ch4_3.intro2" ns="ui" components={{ ...mathComponents, strong: <strong /> }} /></p>
      <p><Trans i18nKey="ch4_3.intro3" ns="ui" components={{ ...mathComponents, em: <em /> }} /></p>

      {/* ── §1 What actually hurts you ─────────────────────────── */}
      <Section id="shock" labelKey="ch4_3.sectionShock" />
      <p><Trans i18nKey="ch4_3.shockP1" ns="ui" components={{ ...mathComponents, em: <em /> }} /></p>
      <p><Trans i18nKey="ch4_3.shockP2" ns="ui" components={{ ...mathComponents, res2: <G k="resistor" /> }} /></p>
      <p><Trans i18nKey="ch4_3.shockP3" ns="ui" components={{ ...mathComponents, iec: <G k="iec" />, imp: <G k="impedance" />, strong: <strong /> }} /></p>
      <p><Trans i18nKey="ch4_3.shockP4" ns="ui" components={{ ...mathComponents, strong: <strong />, em: <em /> }} /></p>
      <Callout variant="key">
        <p><Trans i18nKey="ch4_3.shockKey1" ns="ui" components={{ ...mathComponents }} /></p>
      </Callout>
      <p><Trans i18nKey="ch4_3.shockP5" ns="ui" components={{ ...mathComponents }} /></p>
      <ShockCurrentScale />
      <p><Trans i18nKey="ch4_3.shockP6" ns="ui" components={{ ...mathComponents, strong: <strong /> }} /></p>
      <p><Trans i18nKey="ch4_3.shockP7" ns="ui" components={{ ...mathComponents, strong: <strong />, em: <em />, vf: <G k="ventricular fibrillation" /> }} /></p>
      <BodyCurrentCalculator />
      <p><Trans i18nKey="ch4_3.shockP8" ns="ui" components={{ ...mathComponents, strong: <strong />, em: <em /> }} /></p>
      <p><Trans i18nKey="ch4_3.shockP9" ns="ui" components={{ ...mathComponents }} /></p>
      <Callout variant="danger">
        <p><Trans i18nKey="ch4_3.shockDanger" ns="ui" components={{ ...mathComponents }} /></p>
      </Callout>

      {/* ── §2 The mains ───────────────────────────────────────── */}
      <Section id="mains" labelKey="ch4_3.sectionMains" />
      <p><Trans i18nKey="ch4_3.mainsP1" ns="ui" components={{ ...mathComponents }} /></p>
      <p><Trans i18nKey="ch4_3.mainsP2" ns="ui" components={{ ...mathComponents, strong: <strong />, em: <em />, pe: <G k="protective earth" /> }} /></p>
      <Callout variant="key">
        <p><Trans i18nKey="ch4_3.mainsKey1" ns="ui" components={{ ...mathComponents }} /></p>
      </Callout>
      <p><Trans i18nKey="ch4_3.mainsP3" ns="ui" components={{ ...mathComponents }} /></p>
      <MainsColourCode />
      <p><Trans i18nKey="ch4_3.mainsP5" ns="ui" components={{ ...mathComponents, strong: <strong /> }} /></p>
      <p><Trans i18nKey="ch4_3.mainsP6" ns="ui" components={{ ...mathComponents, ac: <G k="ac" /> }} /></p>
      <p><Trans i18nKey="ch4_3.mainsP7" ns="ui" components={{ ...mathComponents, strong: <strong />, fuse: <G k="fuse" /> }} /></p>
      <p><Trans i18nKey="ch4_3.mainsP8" ns="ui" components={{ ...mathComponents, strong: <strong />, em: <em /> }} /></p>
      <p><Trans i18nKey="ch4_3.mainsP9" ns="ui" components={{ ...mathComponents, strong: <strong />, em: <em />, tl: <G k="time-lag fuse" /> }} /></p>
      <p><Trans i18nKey="ch4_3.mainsP10" ns="ui" components={{ ...mathComponents, xfmr: <G k="transformer" />, strong: <strong />, ir: <G k="inrush current" /> }} /></p>
      <Callout variant="caution">
        <p><Trans i18nKey="ch4_3.mainsCaution1" ns="ui" components={{ ...mathComponents }} /></p>
      </Callout>
      <p><Trans i18nKey="ch4_3.mainsP11" ns="ui" components={{ ...mathComponents, strong: <strong /> }} /></p>
      <p><Trans i18nKey="ch4_3.mainsP12" ns="ui" components={{ ...mathComponents, strong: <strong />, rcd: <G k="rcd" /> }} /></p>
      <p><Trans i18nKey="ch4_3.mainsP13" ns="ui" components={{ ...mathComponents }} /></p>
      <Callout variant="caution">
        <p><Trans i18nKey="ch4_3.mainsCaution2" ns="ui" components={{ ...mathComponents, strong: <strong />, em: <em />, tnc: <G k="tn-c" /> }} /></p>
      </Callout>

      {/* ── §3 High voltage and charged capacitors ─────────────── */}
      <Section id="hv" labelKey="ch4_3.sectionHv" />
      <p><Trans i18nKey="ch4_3.hvP1" ns="ui" components={{ ...mathComponents, cap: <G k="capacitor" />, em: <em /> }} /></p>
      <p><Trans i18nKey="ch4_3.hvP2" ns="ui" components={{ ...mathComponents, pa: <G k="power amplifier" />, ht: <G k="high tension" /> }} /></p>
      <BleederSchematic />
      <p><Trans i18nKey="ch4_3.hvP3" ns="ui" components={{ ...mathComponents, capn: <G k="capacitance" />, strong: <strong /> }} /></p>
      <CapacitorEnergyCalculator />
      <p><Trans i18nKey="ch4_3.hvP4" ns="ui" components={{ ...mathComponents, em: <em /> }} /></p>
      <p><Trans i18nKey="ch4_3.hvP5" ns="ui" components={{ ...mathComponents, nfpa: <G k="nfpa" />, strong: <strong /> }} /></p>
      <p><Trans i18nKey="ch4_3.hvP6" ns="ui" components={{ ...mathComponents, strong: <strong />, bl: <G k="bleeder resistor" /> }} /></p>
      <p><Trans i18nKey="ch4_3.hvP7" ns="ui" components={{ ...mathComponents }} /></p>
      <p><Trans i18nKey="ch4_3.hvP8" ns="ui" components={{ ...mathComponents, strong: <strong />, em: <em />, ss: <G k="shorting stick" /> }} /></p>
      <p><Trans i18nKey="ch4_3.hvP9" ns="ui" components={{ ...mathComponents, strong: <strong />, da: <G k="dielectric absorption" /> }} /></p>
      <p><Trans i18nKey="ch4_3.hvP10" ns="ui" components={{ ...mathComponents, strong: <strong />, em: <em /> }} /></p>
      <Callout variant="danger">
        <p><Trans i18nKey="ch4_3.hvKey1" ns="ui" components={{ ...mathComponents }} /></p>
      </Callout>

      {/* ── §4 RF exposure ─────────────────────────────────────── */}
      <Section id="rf" labelKey="ch4_3.sectionRf" />
      <p><Trans i18nKey="ch4_3.rfP1" ns="ui" components={{ ...mathComponents }} /></p>
      <p><Trans i18nKey="ch4_3.rfP2" ns="ui" components={{ ...mathComponents, strong: <strong />, em: <em />, ni: <G k="non-ionising" /> }} /></p>
      <p><Trans i18nKey="ch4_3.rfP3" ns="ui" components={{ ...mathComponents, em: <em />, icnirp: <G k="icnirp" />, strong: <strong />, sar: <G k="sar" /> }} /></p>
      <p><Trans i18nKey="ch4_3.rfP4" ns="ui" components={{ ...mathComponents, strong: <strong />, em: <em />, rl: <G k="reference level" /> }} /></p>
      <p><Trans i18nKey="ch4_3.rfP5" ns="ui" components={{ ...mathComponents }} /></p>
      <MpeFrequencyCurve />
      <p><Trans i18nKey="ch4_3.rfP6" ns="ui" components={{ ...mathComponents, reson: <G k="resonance" /> }} /></p>
      <Callout variant="note">
        <p><Trans i18nKey="ch4_3.rfNote1" ns="ui" components={{ ...mathComponents, res: <G k="whole-body resonance" /> }} /></p>
      </Callout>
      <p><Trans i18nKey="ch4_3.rfP7" ns="ui" components={{ ...mathComponents, em: <em />, env: <G k="envelope" />, pep: <G k="pep" />, strong: <strong />, duty: <G k="duty cycle" /> }} /></p>
      <p><Trans i18nKey="ch4_3.rfP8" ns="ui" components={{ ...mathComponents, ssb: <G k="ssb" />, cw: <G k="cw" /> }} /></p>
      <RfExposureCalculator />
      <p><Trans i18nKey="ch4_3.rfP9" ns="ui" components={{ ...mathComponents, strong: <strong /> }} /></p>
      <p><Trans i18nKey="ch4_3.rfP10" ns="ui" components={{ ...mathComponents, rsgb: <G k="rsgb" />, strong: <strong /> }} /></p>
      <p><Trans i18nKey="ch4_3.rfP11" ns="ui" components={{ ...mathComponents, nf: <G k="near field" /> }} /></p>

      {/* ── §5 Lightning ───────────────────────────────────────── */}
      <Section id="lightning" labelKey="ch4_3.sectionLightning" />
      <p><Trans i18nKey="ch4_3.lightP1" ns="ui" components={{ ...mathComponents, strong: <strong /> }} /></p>
      <p><Trans i18nKey="ch4_3.lightP2" ns="ui" components={{ ...mathComponents }} /></p>
      <Callout variant="note">
        <p><Trans i18nKey="ch4_3.lightNote1" ns="ui" components={{ ...mathComponents }} /></p>
      </Callout>
      <p><Trans i18nKey="ch4_3.lightP3" ns="ui" components={{ ...mathComponents, strong: <strong />, em: <em />, ind: <G k="inductance" /> }} /></p>
      <p><Trans i18nKey="ch4_3.lightP4" ns="ui" components={{ ...mathComponents, em: <em /> }} /></p>
      <p><Trans i18nKey="ch4_3.lightP5" ns="ui" components={{ ...mathComponents, strong: <strong />, gpr: <G k="ground potential rise" /> }} /></p>
      <GroundPotentialRise />
      <p><Trans i18nKey="ch4_3.lightP6" ns="ui" components={{ ...mathComponents, strong: <strong /> }} /></p>
      <p><Trans i18nKey="ch4_3.lightP7" ns="ui" components={{ ...mathComponents, strong: <strong />, em: <em />, bond: <G k="bonding" /> }} /></p>
      <Callout variant="key">
        <p><Trans i18nKey="ch4_3.lightKey1" ns="ui" components={{ ...mathComponents }} /></p>
      </Callout>
      <p><Trans i18nKey="ch4_3.lightP8" ns="ui" components={{ ...mathComponents, dc: <G k="dc" />, strong: <strong />, arr: <G k="lightning arrestor" /> }} /></p>
      <p><Trans i18nKey="ch4_3.lightP9" ns="ui" components={{ ...mathComponents, strong: <strong /> }} /></p>
      <Callout variant="danger">
        <p><Trans i18nKey="ch4_3.lightDanger1" ns="ui" components={{ ...mathComponents, strong: <strong /> }} /></p>
      </Callout>

      {/* ── §6 The checklist ───────────────────────────────────── */}
      <Section id="checklist" labelKey="ch4_3.sectionChecklist" />
      <p><Trans i18nKey="ch4_3.checklistP1" ns="ui" components={{ ...mathComponents }} /></p>
      <p><Trans i18nKey="ch4_3.checklistP2" ns="ui" components={{ ...mathComponents }} /></p>
      <SafetyChecklist />

      {/* ── Lab ────────────────────────────────────────────────── */}
      <LabActivity
        label="4.3"
        goal={<Trans i18nKey="ch4_3.labGoal" ns="ui" components={{ ...mathComponents }} />}
        equipment={[t('ch4_3.labEquip1'), t('ch4_3.labEquip2'), t('ch4_3.labEquip3')]}
        procedure={[
          { text: <Trans i18nKey="ch4_3.labStep1" ns="ui" components={{ ...mathComponents, strong: <strong /> }} /> },
          { text: <Trans i18nKey="ch4_3.labStep2" ns="ui" components={{ ...mathComponents, strong: <strong /> }} /> },
          { text: <Trans i18nKey="ch4_3.labStep3" ns="ui" components={{ ...mathComponents, strong: <strong /> }} /> },
          { text: <Trans i18nKey="ch4_3.labStep4" ns="ui" components={{ ...mathComponents, strong: <strong /> }} /> },
          { text: <Trans i18nKey="ch4_3.labStep5" ns="ui" components={{ ...mathComponents, strong: <strong /> }} /> },
        ]}
        expectedResult={<Trans i18nKey="ch4_3.labExpected" ns="ui" components={{ ...mathComponents }} />}
        connectionToTheory={<Trans i18nKey="ch4_3.labConnection" ns="ui" components={{ ...mathComponents, strong: <strong /> }} />}
        troubleshooting={[
          <Trans key="t1" i18nKey="ch4_3.labTrouble1" ns="ui" components={{ ...mathComponents }} />,
          <Trans key="t2" i18nKey="ch4_3.labTrouble2" ns="ui" components={{ ...mathComponents, em: <em /> }} />,
          <Trans key="t3" i18nKey="ch4_3.labTrouble3" ns="ui" components={{ ...mathComponents }} />,
        ]}
      />

      {/* ── Quiz ───────────────────────────────────────────────── */}
      <Quiz
        title={t('ch4_3.quizTitle')}
        storageKey={STORAGE_KEYS.quizProgress(CHAPTER_ID)}
        questions={quizQuestions}
      />
    </>
  )
}
