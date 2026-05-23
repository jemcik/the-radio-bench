// Chapter 2.1 — What Are Radio Waves?
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
import EMWaveDiagram from '@/components/diagrams/EMWaveDiagram'
import PolarisationDiagram from '@/components/diagrams/PolarisationDiagram'
import EmSpectrumLadder from '@/components/diagrams/EmSpectrumLadder'
import WavelengthFrequencyConverter from '@/components/widgets/WavelengthFrequencyConverter'

const CHAPTER_ID = '2-1'
const QUIZ_QUESTION_COUNT = 8

export default function Chapter2_1() {
  const { t } = useTranslation('ui')

  const quizQuestions = useMemo(
    () => buildQuizFromI18n(t, 'ch2_1', QUIZ_QUESTION_COUNT, {
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
        <Trans i18nKey="ch2_1.intro1" ns="ui" components={{ ...mathComponents, em: <em />, strong: <strong /> }} />
      </p>
      <p>
        <Trans i18nKey="ch2_1.intro2" ns="ui" components={{ ...mathComponents, em: <em />, strong: <strong />, ac: <G k="ac" /> }} />
      </p>

      {/* ── §1 Two invisible fields ────────────────────────────── */}
      <Section id="fields" labelKey="ch2_1.sectionFields" />
      <p>
        <Trans i18nKey="ch2_1.fieldsP1" ns="ui" components={{ ...mathComponents, em: <em />, strong: <strong /> }} />
      </p>
      <p>
        <Trans
          i18nKey="ch2_1.fieldsP2"
          ns="ui"
          components={{ ...mathComponents, em: <em />, strong: <strong />, ef: <G k="electric field" />, mf: <G k="magnetic field" />, cap: <G k="capacitor" />, res: <G k="resistor" /> }}
        />
      </p>

      {/* ── §2 How a radio wave is born ────────────────────────── */}
      <Section id="birth" labelKey="ch2_1.sectionBirth" />
      <p>
        <Trans i18nKey="ch2_1.birthP1" ns="ui" components={{ ...mathComponents, em: <em />, strong: <strong /> }} />
      </p>
      <p>
        <Trans
          i18nKey="ch2_1.birthP2"
          ns="ui"
          components={{ ...mathComponents, em: <em />, strong: <strong />, ac: <G k="ac" />, emw: <G k="electromagnetic wave" />, rw: <G k="radio wave" /> }}
        />
      </p>
      <p>
        <Trans i18nKey="ch2_1.birthP3" ns="ui" components={{ ...mathComponents, em: <em />, strong: <strong /> }} />
      </p>
      <EMWaveDiagram />

      {/* ── §3 The speed of light ──────────────────────────────── */}
      <Section id="speed" labelKey="ch2_1.sectionSpeed" />
      <p>
        <Trans i18nKey="ch2_1.speedP1" ns="ui" components={{ ...mathComponents, em: <em />, strong: <strong />, sol: <G k="speed of light" /> }} />
      </p>
      <p>
        <Trans i18nKey="ch2_1.speedP2" ns="ui" components={{ ...mathComponents, em: <em />, strong: <strong />, coax: <G k="coax" /> }} />
      </p>

      {/* ── §4 Wavelength and frequency ────────────────────────── */}
      <Section id="wavelength" labelKey="ch2_1.sectionWavelength" />
      <p>
        <Trans i18nKey="ch2_1.wlP1" ns="ui" components={{ ...mathComponents, em: <em />, strong: <strong />, wl: <G k="wavelength" />, freq: <G k="frequency" /> }} />
      </p>
      <p>
        <Trans i18nKey="ch2_1.wlP2" ns="ui" components={{ ...mathComponents, em: <em />, strong: <strong /> }} />
      </p>
      <p>
        <Trans i18nKey="ch2_1.wlP3" ns="ui" components={{ ...mathComponents, em: <em />, strong: <strong /> }} />
      </p>
      <WavelengthFrequencyConverter />

      {/* ── §5 Polarisation ────────────────────────────────────── */}
      <Section id="polarisation" labelKey="ch2_1.sectionPolarisation" />
      <p>
        <Trans i18nKey="ch2_1.polP1" ns="ui" components={{ ...mathComponents, em: <em />, strong: <strong />, pol: <G k="polarisation" /> }} />
      </p>
      <p>
        <Trans i18nKey="ch2_1.polP2" ns="ui" components={{ ...mathComponents, em: <em />, strong: <strong />, ssb: <G k="ssb" /> }} />
      </p>
      <PolarisationDiagram />

      {/* ── §6 The spectrum ────────────────────────────────────── */}
      <Section id="spectrum" labelKey="ch2_1.sectionSpectrum" />
      <p>
        <Trans i18nKey="ch2_1.specP1" ns="ui" components={{ ...mathComponents, em: <em />, strong: <strong />, ems: <G k="electromagnetic spectrum" /> }} />
      </p>
      <p>
        <Trans i18nKey="ch2_1.specP2" ns="ui" components={{ ...mathComponents, em: <em />, strong: <strong />, hf: <G k="hf" />, vhf: <G k="vhf" />, uhf: <G k="uhf" /> }} />
      </p>
      <EmSpectrumLadder />

      {/* ── Summary ────────────────────────────────────────────── */}
      <Section id="summary" labelKey="ch2_1.sectionSummary" />
      <Callout variant="key">
        <ul className="list-disc pl-5 space-y-2">
          <li><Trans i18nKey="ch2_1.keyTakeaway1" ns="ui" components={{ ...mathComponents, strong: <strong /> }} /></li>
          <li><Trans i18nKey="ch2_1.keyTakeaway2" ns="ui" components={{ ...mathComponents, strong: <strong /> }} /></li>
          <li><Trans i18nKey="ch2_1.keyTakeaway3" ns="ui" components={{ ...mathComponents, strong: <strong /> }} /></li>
          <li><Trans i18nKey="ch2_1.keyTakeaway4" ns="ui" components={{ ...mathComponents, strong: <strong /> }} /></li>
          <li><Trans i18nKey="ch2_1.keyTakeaway5" ns="ui" components={{ ...mathComponents, strong: <strong /> }} /></li>
          <li><Trans i18nKey="ch2_1.keyTakeaway6" ns="ui" components={{ ...mathComponents, strong: <strong /> }} /></li>
        </ul>
      </Callout>

      {/* ── Lab ────────────────────────────────────────────────── */}
      <LabActivity
        label="2.1"
        goal={<Trans i18nKey="ch2_1.labGoal" ns="ui" components={{ ...mathComponents, strong: <strong /> }} />}
        equipment={[t('ch2_1.labEquip1'), t('ch2_1.labEquip2')]}
        components={[t('ch2_1.labComp1'), t('ch2_1.labComp2')]}
        procedure={[
          { text: <Trans i18nKey="ch2_1.labStep1" ns="ui" components={{ em: <em /> }} /> },
          { text: t('ch2_1.labStep2') },
          { text: t('ch2_1.labStep3') },
          { text: <Trans i18nKey="ch2_1.labStep4" ns="ui" components={{ em: <em /> }} /> },
          { text: t('ch2_1.labStep5') },
        ]}
        expectedResult={<Trans i18nKey="ch2_1.labExpected" ns="ui" components={{ em: <em /> }} />}
        connectionToTheory={<Trans i18nKey="ch2_1.labConnection" ns="ui" components={{ ant: <G k="antenna" /> }} />}
        troubleshooting={[
          t('ch2_1.labTrouble1'),
          t('ch2_1.labTrouble2'),
          t('ch2_1.labTrouble3'),
        ]}
      />

      {/* ── Quiz ───────────────────────────────────────────────── */}
      <Quiz
        title={t('ch2_1.quizTitle')}
        storageKey={STORAGE_KEYS.quizProgress(CHAPTER_ID)}
        questions={quizQuestions}
      />
    </>
  )
}
