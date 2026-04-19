// Chapter 1.2 — Ohm's Law and Power
import { useMemo } from 'react'
import { useTranslation, Trans } from 'react-i18next'
import { Callout } from '@/components/ui/callout'
import { Section } from '@/components/ui/section-heading'
import { MBlock, MathVar } from '@/components/ui/math'
import { G } from '@/features/glossary/glossary-term'
import LabActivity from '@/components/lab/LabActivity'
import Quiz, { buildQuizFromI18n } from '@/components/quiz/Quiz'
import OhmsLawPlot from '@/components/widgets/OhmsLawPlot'
import OhmsCalculator from '@/components/widgets/OhmsCalculator'
import SafeZoneCalculator from '@/components/widgets/SafeZoneCalculator'
import RuntimeCalculator from '@/components/widgets/RuntimeCalculator'
import MagnitudeLadder from '@/components/diagrams/MagnitudeLadder'
import { STORAGE_KEYS } from '@/lib/storage-keys'
import { useUnitFormatter } from '@/lib/hooks/useLocaleFormatter'

const CHAPTER_ID = '1-2'
const QUIZ_QUESTION_COUNT = 8

export default function Chapter1_2() {
  const { t } = useTranslation('ui')
  const u = useUnitFormatter()
  const quizQuestions = useMemo(
    () => buildQuizFromI18n(t, 'ch1_2', QUIZ_QUESTION_COUNT),
    [t],
  )

  return (
    <>
      <p>
        <Trans i18nKey="ch1_2.intro" ns="ui" components={{ strong: <strong /> }} />
      </p>

      <p>
        <Trans i18nKey="ch1_2.introPreview" ns="ui" components={{ strong: <strong /> }} />
      </p>

      {/* ── Section 1: Ohm's law ──────────────────────────────────── */}
      <Section id="ohms-law" labelKey="ch1_2.sectionOhm" />

      <p>
        <Trans
          i18nKey="ch1_2.ohmIntro"
          ns="ui"
          components={{
            voltage: <G k="voltage" />,
            current: <G k="current" />,
            resistance: <G k="resistance" />,
            resistor: <G k="resistor" />,
          }}
        />
      </p>

      <MBlock tex="V = I \cdot R" />

      <Callout variant="note">
        <Trans
          i18nKey="ch1_2.notationNote"
          ns="ui"
          components={{ strong: <strong />, var: <MathVar /> }}
        />
      </Callout>

      <p>
        <Trans
          i18nKey="ch1_2.ohmPlotIntro"
          ns="ui"
          components={{ var: <MathVar /> }}
        />
      </p>

      <OhmsLawPlot />

      <p>
        <Trans
          i18nKey="ch1_2.ohmRearrangementsIntro"
          ns="ui"
          components={{ var: <MathVar /> }}
        />
      </p>

      <ul>
        <li>
          <Trans
            i18nKey="ch1_2.ohmRearrangeI"
            ns="ui"
            components={{ var: <MathVar /> }}
          />
        </li>
        <li>
          <Trans
            i18nKey="ch1_2.ohmRearrangeR"
            ns="ui"
            components={{ var: <MathVar /> }}
          />
        </li>
      </ul>

      {/* ── Section 2: Power ─────────────────────────────────────── */}
      <Section id="power" labelKey="ch1_2.sectionPower" />

      <p>
        <Trans
          i18nKey="ch1_2.powerIntro"
          ns="ui"
          components={{
            strong: <strong />,
            resistor: <G k="resistor" />,
            power: <G k="power" />,
          }}
        />
      </p>

      <MBlock tex="P = V \cdot I" />

      <p>
        <Trans
          i18nKey="ch1_2.powerDerivation"
          ns="ui"
          components={{ var: <MathVar /> }}
        />
      </p>

      <MBlock tex="P = I^2 \cdot R \qquad\qquad P = \dfrac{V^2}{R}" />

      <p>
        <Trans
          i18nKey="ch1_2.powerThreeFormsNote"
          ns="ui"
          components={{ var: <MathVar /> }}
        />
      </p>

      <Callout variant="note">
        <Trans
          i18nKey="ch1_2.ohmWorkedExample"
          ns="ui"
          components={{ strong: <strong />, var: <MathVar /> }}
        />
      </Callout>

      <p>
        <Trans
          i18nKey="ch1_2.powerLadderIntro"
          ns="ui"
          components={{ watt: <G k="watt" /> }}
        />
      </p>

      <MagnitudeLadder
        title={t('ch1_2.powerLadderTitle')}
        ariaLabel={t('ch1_2.powerLadderAriaLabel')}
        caption={t('ch1_2.powerLadderCaption')}
        tone="caution"
        items={[
          { value: 0.02,   label: `20 ${u('mw')}`,  description: t('ch1_2.powerLadderLed') },
          { value: 0.5,    label: `500 ${u('mw')}`, description: t('ch1_2.powerLadderHandheld') },
          { value: 5,      label: `5 ${u('w')}`,    description: t('ch1_2.powerLadderQrp') },
          { value: 60,     label: `60 ${u('w')}`,   description: t('ch1_2.powerLadderBulb') },
          { value: 1500,   label: `1.5 ${u('kw')}`, description: t('ch1_2.powerLadderKettle') },
          { value: 100000, label: `100 ${u('kw')}`, description: t('ch1_2.powerLadderBroadcast') },
        ]}
      />

      <Callout variant="caution">
        <Trans
          i18nKey="ch1_2.powerDangerNote"
          ns="ui"
          components={{ strong: <strong />, var: <MathVar /> }}
        />
      </Callout>

      {/* ── Section 3: Calculator widget ──────────────────────────── */}
      <Section id="calculator" labelKey="ch1_2.sectionCalculator" />

      <p>
        <Trans
          i18nKey="ch1_2.calculatorIntro"
          ns="ui"
          components={{ var: <MathVar /> }}
        />
      </p>

      <OhmsCalculator />

      {/* ── Section 4: Resistor power ratings ─────────────────────── */}
      <Section id="ratings" labelKey="ch1_2.sectionRatings" />

      <p>{t('ch1_2.ratingsIntro')}</p>

      <MagnitudeLadder
        title={t('ch1_2.ratingsLadderTitle')}
        ariaLabel={t('ch1_2.ratingsLadderAriaLabel')}
        caption={t('ch1_2.ratingsLadderCaption')}
        tone="primary"
        items={[
          { value: 0.0625, label: `1/16 ${u('w')}`, description: t('ch1_2.ratingsLadderSmd') },
          { value: 0.25,   label: `1/4 ${u('w')}`,  description: t('ch1_2.ratingsLadderQuarterW') },
          { value: 1,      label: `1 ${u('w')}`,    description: t('ch1_2.ratingsLadderOneW') },
          { value: 5,      label: `5 ${u('w')}`,    description: t('ch1_2.ratingsLadderFiveW') },
          { value: 50,     label: `50 ${u('w')}`,   description: t('ch1_2.ratingsLadderFiftyW') },
          { value: 1000,   label: `1 ${u('kw')}`,   description: t('ch1_2.ratingsLadderKilowatt') },
        ]}
      />

      <p>
        <Trans
          i18nKey="ch1_2.ratingsWidgetIntro"
          ns="ui"
          components={{
            var: <MathVar />,
            sub: <sub />,
            nowrap: <span style={{ whiteSpace: 'nowrap' }} />,
          }}
        />
      </p>

      <SafeZoneCalculator />

      <Callout variant="caution">
        <Trans
          i18nKey="ch1_2.deratingNote"
          ns="ui"
          components={{
            strong: <strong />,
            var: <MathVar />,
            sub: <sub />,
            nowrap: <span style={{ whiteSpace: 'nowrap' }} />,
          }}
        />
      </Callout>

      {/* ── Section 5: Energy and battery runtime ─────────────────── */}
      <Section id="energy" labelKey="ch1_2.sectionEnergy" />

      <p>
        <Trans
          i18nKey="ch1_2.energyIntro"
          ns="ui"
          components={{ strong: <strong /> }}
        />
      </p>

      <MBlock tex="E = P \cdot t" />

      <p>
        <Trans
          i18nKey="ch1_2.energyUnitsNote"
          ns="ui"
          components={{ strong: <strong /> }}
        />
      </p>

      <p>
        <Trans
          i18nKey="ch1_2.energyCapacityNote"
          ns="ui"
          components={{
            strong: <strong />,
            charge: <G k="charge" />,
            var: <MathVar />,
          }}
        />
      </p>

      <MBlock tex="E = V \cdot Q \qquad\qquad t = \dfrac{Q}{I}" />

      <RuntimeCalculator />

      <Callout variant="note">
        <Trans
          i18nKey="ch1_2.energyWorkedExample"
          ns="ui"
          components={{ strong: <strong /> }}
        />
      </Callout>

      {/* ── Section 6: Efficiency teaser ──────────────────────────── */}
      <Section id="efficiency" labelKey="ch1_2.sectionEfficiency" />

      <p>
        <Trans
          i18nKey="ch1_2.efficiencyIntro"
          ns="ui"
          components={{ strong: <strong /> }}
        />
      </p>

      <MBlock tex="\eta = \dfrac{P_{\mathrm{out}}}{P_{\mathrm{in}}}" />

      <p>{t('ch1_2.efficiencyExample')}</p>

      {/* ── Kirchhoff's laws teaser — forward-pointer to Ch 1.4 ─── */}
      <Callout variant="note">
        <p>{t('ch1_2.kirchhoffIntro')}</p>
        <ul>
          <li>
            <Trans
              i18nKey="ch1_2.kirchhoffKcl"
              ns="ui"
              components={{ strong: <strong /> }}
            />
          </li>
          <li>
            <Trans
              i18nKey="ch1_2.kirchhoffKvl"
              ns="ui"
              components={{ strong: <strong /> }}
            />
          </li>
        </ul>
        <p>{t('ch1_2.kirchhoffClose')}</p>
      </Callout>

      {/* ── Summary ───────────────────────────────────────────────── */}
      <Section id="summary" labelKey="ch1_2.sectionSummary" />

      <Callout variant="key">
        <Trans
          i18nKey="ch1_2.keyTakeaway"
          ns="ui"
          components={{ var: <MathVar /> }}
        />
      </Callout>

      {/* ── Lab Activity ──────────────────────────────────────────── */}
      <LabActivity
        label="1.2"
        goal={t('ch1_2.labGoal')}
        equipment={[
          <Trans key="e1" i18nKey="ch1_2.labEquip1" ns="ui" components={{ multimeter: <G k="multimeter" /> }} />,
          <Trans key="e2" i18nKey="ch1_2.labEquip2" ns="ui" components={{ breadboard: <G k="breadboard" /> }} />,
          t('ch1_2.labEquip3'),
          t('ch1_2.labEquip4'),
        ]}
        components={[
          t('ch1_2.labComp1'),
          t('ch1_2.labComp2'),
          t('ch1_2.labComp3'),
        ]}
        procedure={[
          { text: <Trans i18nKey="ch1_2.labStep1" ns="ui" components={{ strong: <strong />, var: <MathVar /> }} /> },
          { text: <Trans i18nKey="ch1_2.labStep2" ns="ui" components={{ strong: <strong />, var: <MathVar /> }} /> },
          { text: <Trans i18nKey="ch1_2.labStep3" ns="ui" components={{ strong: <strong />, var: <MathVar /> }} /> },
          { text: <Trans i18nKey="ch1_2.labStep4" ns="ui" components={{ strong: <strong />, var: <MathVar /> }} /> },
          { text: <Trans i18nKey="ch1_2.labStep5" ns="ui" components={{ strong: <strong />, var: <MathVar /> }} /> },
          { text: <Trans i18nKey="ch1_2.labStep6" ns="ui" components={{ strong: <strong />, var: <MathVar /> }} /> },
        ]}
        expectedResult={t('ch1_2.labExpected')}
        connectionToTheory={t('ch1_2.labConnection')}
        troubleshooting={[
          t('ch1_2.labTrouble1'),
          t('ch1_2.labTrouble2'),
          t('ch1_2.labTrouble3'),
        ]}
      />

      {/* ── Quiz ──────────────────────────────────────────────────── */}
      <Quiz
        title={t('ch1_2.quizTitle')}
        storageKey={STORAGE_KEYS.quizProgress(CHAPTER_ID)}
        questions={quizQuestions}
      />
    </>
  )
}
