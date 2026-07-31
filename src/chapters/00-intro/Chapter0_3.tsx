// Chapter 0.3 — Math Toolkit for Radio
import { useMemo } from 'react'
import { useTranslation, Trans } from 'react-i18next'
import LabActivity from '@/components/lab/LabActivity'
import { Callout } from '@/components/ui/callout'
import { Section } from '@/components/ui/section-heading'
import { G } from '@/features/glossary/glossary-term'
import { MBlock, MathVar } from '@/components/ui/math'
import PowersOfTenTable from '@/components/diagrams/PowersOfTenTable'
import PrefixLadderDiagram from '@/components/diagrams/PrefixLadderDiagram'
import FormulaTriangleDiagram from '@/components/diagrams/FormulaTriangleDiagram'
import PrefixConverter from '@/components/widgets/PrefixConverter'
import SciNotationExplorer from '@/components/widgets/SciNotationExplorer'
import FormulaTransposer from '@/components/widgets/FormulaTransposer'
import Quiz, { buildQuizFromI18n } from '@/components/quiz/Quiz'
import { STORAGE_KEYS } from '@/lib/storage-keys'
import { mathComponents } from '@/lib/trans-defaults'

const CHAPTER_ID = '0-3'
const QUIZ_QUESTION_COUNT = 12

// Quantities shown in the "Units at a glance" cheat-sheet. Each entry
// identifies a family of i18n keys — `unitsQuantity_{id}`,
// `unitsUnit_{id}`, `unitsPrefixes_{id}` — so the whole table is
// driven by a single array + three parallel template lookups.
const UNIT_QUANTITIES = [
  'voltage',
  'current',
  'resistance',
  'power',
  'frequency',
  'capacitance',
  'inductance',
] as const

// The formula symbol for each quantity. Latin in every locale — that is the
// point `unitsIntro` makes, and the table has to show it for the claim to land.
const QUANTITY_SYMBOLS: Record<(typeof UNIT_QUANTITIES)[number], string> = {
  voltage: 'V',
  current: 'I',
  resistance: 'R',
  power: 'P',
  frequency: 'f',
  capacitance: 'C',
  inductance: 'L',
}

export default function Chapter0_3() {
  const { t } = useTranslation('ui')
  const quizQuestions = useMemo(
    () => buildQuizFromI18n(t, 'ch0_3', QUIZ_QUESTION_COUNT, {
      nowrap: <span style={{ whiteSpace: 'nowrap' }} />,
      // `capacitor` (full word) avoids collision with the chapter's
      // existing `cap` alias which maps to «capacitance» (the
      // quantity/property), used in `intro` / `whatItIsIntro`.
      capacitor: <G k="capacitor" />,
    }),
    [t],
  )

  return (
    <>
      <p>
        <Trans i18nKey="ch0_3.intro" ns="ui"
          components={{ ...mathComponents, freq: <G k="frequency" />, cap: <G k="capacitance" />, res: <G k="resistance" />, si: <G k="si" /> }}
        />
      </p>

      {/* ── Fractions and Ratios ─────────────────────────────── */}
      <Section id="fractions" labelKey="ch0_3.sectionFractions" />

      <p>
        <Trans i18nKey="ch0_3.fractionsIntro" ns="ui"
          components={{ ...mathComponents, voltage: <G k="voltage" />, i: <i /> }}
        />
      </p>

      <p>
        <Trans i18nKey="ch0_3.fractionsExample" ns="ui"
          components={{ ...mathComponents, voltageDivider: <G k="voltage divider" />, res: <G k="resistor" /> }}
        />
      </p>

      <Callout variant="key">
        <Trans i18nKey="ch0_3.fractionsKey" ns="ui"
          components={{ nowrap: <span style={{ whiteSpace: 'nowrap' }} /> }}
        />
      </Callout>

      {/* ── Powers of 10 and Scientific Notation ────────────── */}
      <Section id="powers-of-10" labelKey="ch0_3.sectionPowersOf10" />

      <p>
        <Trans i18nKey="ch0_3.powersIntro" ns="ui"
          components={{ ...mathComponents, strong: <strong />, fm: <G k="fm" />, am: <G k="am" />,
            modulation: <G k="modulation" />, sciNotation: <G k="scientific notation" /> }}
        />
      </p>

      <p>{t('ch0_3.powersTable')}</p>

      <PowersOfTenTable />

      {/* This paragraph must stay ABOVE the explorer: the widget's second toggle
          is labelled «Engineering», and a reader who meets that button before the
          word has been explained has no idea what it switches. */}
      <p>
        <Trans i18nKey="ch0_3.sciNotationEngineering2" ns="ui"
          components={{ ...mathComponents, strong: <strong />,
            nowrap: <span style={{ whiteSpace: 'nowrap' }} /> }}
        />
      </p>

      <SciNotationExplorer />

      <Callout variant="tip">
        <p className="font-semibold mb-1">{t('ch0_3.powersCalcTip')}</p>
        <p>{t('ch0_3.powersCalcDetail')}</p>
      </Callout>

      {/* ── SI Prefixes ─────────────────────────────────────── */}
      <Section id="si-prefixes" labelKey="ch0_3.sectionSIPrefixes" />

      <p>
        <Trans i18nKey="ch0_3.prefixesIntro" ns="ui"
          components={{ ...mathComponents, si: <G k="si" />, farad: <G k="farad" /> }}
        />
      </p>

      <PrefixLadderDiagram />

      <p>
        <Trans i18nKey="ch0_3.prefixesRule" ns="ui"
          components={{ ...mathComponents, strong: <strong />,
            nowrap: <span style={{ whiteSpace: 'nowrap' }} /> }}
        />
      </p>

      <p>
        <Trans i18nKey="ch0_3.prefixesConvert" ns="ui"
          components={{ ...mathComponents, strong: <strong />,
            nowrap: <span style={{ whiteSpace: 'nowrap' }} /> }}
        />
      </p>

      {/* The two directions were the tail of a nine-idea paragraph, ending on an
          elliptical dash («moving to a smaller unit — right»). A two-item list is
          what the sentence was already trying to be. */}
      <p>{t('ch0_3.prefixesRuleDirections')}</p>
      <ul>
        <li>
          <Trans i18nKey="ch0_3.prefixesRuleBigger" ns="ui"
            components={{ ...mathComponents, strong: <strong /> }} />
        </li>
        <li>
          <Trans i18nKey="ch0_3.prefixesRuleSmaller" ns="ui"
            components={{ ...mathComponents, strong: <strong /> }} />
        </li>
      </ul>

      <PrefixConverter />

      {/* ── Squaring and Square Roots ───────────────────────── */}
      <Section id="squaring" labelKey="ch0_3.sectionSquaring" />

      <p>
        <Trans i18nKey="ch0_3.squaringIntro" ns="ui"
          components={{
            voltage: <G k="voltage" />,
            current: <G k="current" />,
            power: <G k="power" />,
            nowrap: <span style={{ whiteSpace: 'nowrap' }} />,
          }}
        />
      </p>

      <p>
        <Trans i18nKey="ch0_3.squaringPower" ns="ui"
          components={{ strong: <strong />, var: <MathVar />,
            nowrap: <span style={{ whiteSpace: 'nowrap' }} /> }}
        />
      </p>

      <MBlock tex="P = I \times V \qquad P = I^2 \times R \qquad P = \frac{V^2}{R}" />

      <p>
        <Trans i18nKey="ch0_3.squaringWhy" ns="ui"
          components={{ ...mathComponents, strong: <strong />,
            nowrap: <span style={{ whiteSpace: 'nowrap' }} /> }}
        />
      </p>

      <Callout variant="key">
        <Trans i18nKey="ch0_3.squaringKey" ns="ui"
          components={{ ...mathComponents, strong: <strong /> }}
        />
      </Callout>

      {/* ── Transposing Formulas ─────────────────────────────── */}
      <Section id="transposing" labelKey="ch0_3.sectionTransposing" />

      <p>{t('ch0_3.transposingIntro')}</p>

      <p>
        <Trans i18nKey="ch0_3.transposingCover" ns="ui"
          components={{ ...mathComponents, i: <i />,
            nowrap: <span style={{ whiteSpace: 'nowrap' }} /> }}
        />
      </p>

      <FormulaTriangleDiagram />

      <p>{t('ch0_3.transposingStepsLead')}</p>
      <ol>
        <li>{t('ch0_3.transposingStep1')}</li>
        <li>{t('ch0_3.transposingStep2')}</li>
        <li>{t('ch0_3.transposingStep3')}</li>
      </ol>
      <p>{t('ch0_3.transposingStepsClosing')}</p>

      <p>
        <Trans i18nKey="ch0_3.transposingWidgetIntro" ns="ui"
          components={{ ...mathComponents, strong: <strong />, freq: <G k="frequency" />,
            nowrap: <span style={{ whiteSpace: 'nowrap' }} /> }}
        />
      </p>

      <FormulaTransposer />

      {/* ── Units at a glance (cheat sheet) ───────────────────── */}
      <Section id="units-at-a-glance" labelKey="ch0_3.sectionUnits" />

      <p>
        <Trans i18nKey="ch0_3.unitsIntro" ns="ui" components={{ ...mathComponents }} />
      </p>

      {/* `not-prose` so chapter prose typography doesn't fight the
          compact table padding. Mirrors the Ch0.4 dBm-table pattern. */}
      <div className="not-prose my-4 flex justify-center">
        <table className="text-sm border-collapse">
          <thead>
            <tr className="border-b-2 border-border">
              <th className="text-left py-2 px-4 font-semibold text-foreground">
                {t('ch0_3.unitsHeaderQuantity')}
              </th>
              <th className="text-left py-2 px-4 font-semibold text-foreground">
                {t('ch0_3.unitsHeaderUnit')}
              </th>
              <th className="text-left py-2 px-4 font-semibold text-foreground">
                {t('ch0_3.unitsHeaderPrefixes')}
              </th>
            </tr>
          </thead>
          <tbody>
            {UNIT_QUANTITIES.map(q => (
              <tr key={q} className="border-b border-border/40">
                <td className="py-1.5 px-4 font-semibold text-foreground">
                  {t(`ch0_3.unitsQuantity_${q}`)}{' '}
                  {/* The symbol is what `unitsIntro` claims stays Latin in every
                      locale — without it in the table, the claim points at nothing. */}
                  <span className="text-muted-foreground font-normal">
                    (<MathVar>{QUANTITY_SYMBOLS[q]}</MathVar>)
                  </span>
                </td>
                <td className="py-1.5 px-4 text-foreground">
                  {t(`ch0_3.unitsUnit_${q}`)}
                </td>
                <td className="py-1.5 px-4 font-mono text-foreground">
                  {t(`ch0_3.unitsPrefixes_${q}`)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Lab Activity ────────────────────────────────────── */}
      <LabActivity
        label="0.3"
        goal={t('ch0_3.labGoal')}
        equipment={[
          t('ch0_3.labEquip1'),
          t('ch0_3.labEquip2'),
        ]}
        procedure={[
          { text: <Trans i18nKey="ch0_3.labStep1" ns="ui" components={{ ...mathComponents, multimeter: <G k="multimeter" /> }} /> },
          { text: t('ch0_3.labStep2') },
          { text: t('ch0_3.labStep3') },
          { text: t('ch0_3.labStep4') },
          { text: t('ch0_3.labStep5') },
        ]}
        expectedResult={
          <Trans i18nKey="ch0_3.labExpected" ns="ui"
            components={{ nowrap: <span style={{ whiteSpace: 'nowrap' }} /> }}
          />
        }
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
