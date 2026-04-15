// Chapter 0.3 — Math Toolkit for Radio
import { useMemo } from 'react'
import { useTranslation, Trans } from 'react-i18next'
import LabActivity from '@/components/lab/LabActivity'
import { Callout } from '@/components/ui/callout'
import { Section } from '@/components/ui/section-heading'
import { G } from '@/features/glossary/glossary-term'
import { MBlock } from '@/components/ui/math'
import PowersOfTenTable from '@/components/diagrams/PowersOfTenTable'
import PrefixLadderDiagram from '@/components/diagrams/PrefixLadderDiagram'
import FormulaTriangleDiagram from '@/components/diagrams/FormulaTriangleDiagram'
import PrefixConverter from '@/components/widgets/PrefixConverter'
import SciNotationExplorer from '@/components/widgets/SciNotationExplorer'
import FormulaTransposer from '@/components/widgets/FormulaTransposer'
import Quiz, { buildQuizFromI18n } from '@/components/quiz/Quiz'
import { STORAGE_KEYS } from '@/lib/storage-keys'

const CHAPTER_ID = '0-3'
const QUIZ_QUESTION_COUNT = 12

export default function Chapter0_3() {
  const { t } = useTranslation('ui')
  const quizQuestions = useMemo(
    () => buildQuizFromI18n(t, 'ch0_3', QUIZ_QUESTION_COUNT),
    [t],
  )

  return (
    <>
      <p>
        <Trans i18nKey="ch0_3.intro" ns="ui"
          components={{ freq: <G k="frequency" />, cap: <G k="capacitance" />, res: <G k="resistance" /> }}
        />
      </p>

      {/* ── Fractions and Ratios ─────────────────────────────── */}
      <Section id="fractions" labelKey="ch0_3.sectionFractions" />

      <p>
        <Trans i18nKey="ch0_3.fractionsIntro" ns="ui"
          components={{ voltage: <G k="voltage" />, i: <i /> }}
        />
      </p>

      <p>
        <Trans i18nKey="ch0_3.fractionsExample" ns="ui"
          components={{ voltageDivider: <G k="voltage divider" /> }}
        />
      </p>

      <Callout variant="key">{t('ch0_3.fractionsKey')}</Callout>

      {/* ── Powers of 10 and Scientific Notation ────────────── */}
      <Section id="powers-of-10" labelKey="ch0_3.sectionPowersOf10" />

      <p>
        <Trans i18nKey="ch0_3.powersIntro" ns="ui"
          components={{ fm: <G k="fm" />, sciNotation: <G k="scientific notation" /> }}
        />
      </p>

      <p>{t('ch0_3.powersTable')}</p>

      <PowersOfTenTable />

      <SciNotationExplorer />

      <Callout variant="tip">
        <p className="font-semibold mb-1">{t('ch0_3.powersCalcTip')}</p>
        <p>{t('ch0_3.powersCalcDetail')}</p>
      </Callout>

      {/* ── SI Prefixes ─────────────────────────────────────── */}
      <Section id="si-prefixes" labelKey="ch0_3.sectionSIPrefixes" />

      <p>
        <Trans i18nKey="ch0_3.prefixesIntro" ns="ui"
          components={{ si: <G k="si" />, farad: <G k="farad" /> }}
        />
      </p>

      <PrefixLadderDiagram />

      <p>
        <Trans i18nKey="ch0_3.prefixesRule" ns="ui"
          components={{ strong: <strong /> }}
        />
      </p>

      <PrefixConverter />

      {/* ── Squaring and Square Roots ───────────────────────── */}
      <Section id="squaring" labelKey="ch0_3.sectionSquaring" />

      <p>
        <Trans i18nKey="ch0_3.squaringIntro" ns="ui"
          components={{ voltage: <G k="voltage" />, current: <G k="current" /> }}
        />
      </p>

      <p>{t('ch0_3.squaringPower')}</p>

      <MBlock tex="P = I^2 \times R \qquad P = \frac{V^2}{R}" />

      <p>
        <Trans i18nKey="ch0_3.squaringWhy" ns="ui"
          components={{ strong: <strong /> }}
        />
      </p>

      <Callout variant="key">
        <Trans i18nKey="ch0_3.squaringKey" ns="ui"
          components={{ strong: <strong /> }}
        />
      </Callout>

      {/* ── Transposing Formulas ─────────────────────────────── */}
      <Section id="transposing" labelKey="ch0_3.sectionTransposing" />

      <p>{t('ch0_3.transposingIntro')}</p>

      <p>
        <Trans i18nKey="ch0_3.transposingCover" ns="ui"
          components={{ i: <i /> }}
        />
      </p>

      <FormulaTriangleDiagram />

      <p>{t('ch0_3.transposingSteps')}</p>

      <FormulaTransposer />

      {/* ── Lab Activity ────────────────────────────────────── */}
      <LabActivity
        label="0.3"
        goal={t('ch0_3.labGoal')}
        equipment={[
          t('ch0_3.labEquip1'),
          t('ch0_3.labEquip2'),
        ]}
        procedure={[
          { text: <Trans i18nKey="ch0_3.labStep1" ns="ui" components={{ multimeter: <G k="multimeter" /> }} /> },
          { text: t('ch0_3.labStep2') },
          { text: t('ch0_3.labStep3') },
          { text: t('ch0_3.labStep4') },
          { text: t('ch0_3.labStep5') },
        ]}
        expectedResult={t('ch0_3.labExpected')}
        connectionToTheory={t('ch0_3.labConnection')}
        troubleshooting={[
          t('ch0_3.labTrouble1'),
          t('ch0_3.labTrouble2'),
        ]}
      />

      {/* ── Quiz ────────────────────────────────────────────── */}
      <Quiz
        title={t('ch0_3.quizTitle')}
        storageKey={STORAGE_KEYS.quizProgress(CHAPTER_ID)}
        questions={quizQuestions}
      />
    </>
  )
}
