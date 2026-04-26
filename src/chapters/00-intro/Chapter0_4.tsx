// Chapter 0.4 — The Decibel
import { useMemo } from 'react'
import { useTranslation, Trans } from 'react-i18next'
import LabActivity from '@/components/lab/LabActivity'
import { Callout } from '@/components/ui/callout'
import { Section } from '@/components/ui/section-heading'
import { G } from '@/features/glossary/glossary-term'
import { MBlock } from '@/components/ui/math'
import DbCalculator from '@/components/widgets/DbCalculator'
import LogAxisToggle from '@/components/widgets/LogAxisToggle'
import LogVsLinearDiagram from '@/components/diagrams/LogVsLinearDiagram'
import DbRulerDiagram from '@/components/diagrams/DbRulerDiagram'
import Quiz, { buildQuizFromI18n } from '@/components/quiz/Quiz'
import { useUnitFormatter } from '@/lib/hooks/useLocaleFormatter'
import { STORAGE_KEYS } from '@/lib/storage-keys'
import { mathComponents } from '@/lib/trans-defaults'

// Memorable dBm landmarks — a power decade every 10 dBm. The 0 dBm row
// is the anchor (reference point 1 mW). Values extend from TX levels
// (+60 dBm = 1 kW) down to receive-side noise-floor territory.
// Strings like "+60 dBm" are culture-invariant; only the unit suffix
// needs locale awareness (kw/w/mw/uw/nw/pw/fw live in units.* i18n).
// Explicitly typed (rather than `as const`) so `anchor?` is optional
// on every row — otherwise the destructure in .map() would complain
// that rows without `anchor: true` don't have the property.
interface DbmRow { dbm: string; unit: string; anchor?: boolean }
const DBM_TABLE: readonly DbmRow[] = [
  { dbm: '+60',  unit: 'kw' },
  { dbm: '+30',  unit: 'w'  },
  { dbm: '0',    unit: 'mw', anchor: true },
  { dbm: '−30',  unit: 'uw' },
  { dbm: '−60',  unit: 'nw' },
  { dbm: '−90',  unit: 'pw' },
  { dbm: '−120', unit: 'fw' },
]

const CHAPTER_ID = '0-4'
const QUIZ_QUESTION_COUNT = 10

export default function Chapter0_4() {
  const { t } = useTranslation('ui')
  const tUnit = useUnitFormatter()
  const quizQuestions = useMemo(
    () => buildQuizFromI18n(t, 'ch0_4', QUIZ_QUESTION_COUNT, {
      nowrap: <span style={{ whiteSpace: 'nowrap' }} />,
    }),
    [t],
  )

  return (
    <>
      <p>
        <Trans i18nKey="ch0_4.intro" ns="ui"
          components={{ ...mathComponents, decibel: <G k="decibel" /> }}
        />
      </p>

      <Callout variant="key">{t('ch0_4.introNote')}</Callout>

      <p>{t('ch0_4.introPreview')}</p>

      <DbRulerDiagram />

      {/* ── Logarithms in Three Examples ───────────────────────── */}
      <Section id="logarithms" labelKey="ch0_4.sectionLogs" />

      <p>
        <Trans i18nKey="ch0_4.logsIntro" ns="ui"
          components={{ ...mathComponents, logarithm: <G k="logarithm" />, i: <i /> }}
        />
      </p>

      <p>{t('ch0_4.logsThree')}</p>

      <ul>
        <li><code>{t('ch0_4.logsBullet1')}</code></li>
        <li><code>{t('ch0_4.logsBullet2')}</code></li>
        <li><code>{t('ch0_4.logsBullet3')}</code></li>
      </ul>

      <p>
        <Trans i18nKey="ch0_4.logsWhy" ns="ui"
          components={{ strong: <strong />, nowrap: <span style={{ whiteSpace: 'nowrap' }} /> }}
        />
      </p>

      <Callout variant="key">{t('ch0_4.logsKey')}</Callout>

      {/* ── dB as a Pure Ratio ─────────────────────────────────── */}
      <Section id="ratio" labelKey="ch0_4.sectionRatio" />

      <p>
        <Trans i18nKey="ch0_4.ratioIntro" ns="ui"
          components={{ ...mathComponents, strong: <strong /> }}
        />
      </p>

      <p>{t('ch0_4.ratioPower')}</p>

      <MBlock tex="\text{dB} = 10 \cdot \log_{10}\!\left(\frac{P_1}{P_2}\right)" />

      <p>{t('ch0_4.ratioVoltage')}</p>

      <MBlock tex="\text{dB} = 20 \cdot \log_{10}\!\left(\frac{V_1}{V_2}\right)" />

      <p>
        <Trans i18nKey="ch0_4.ratioWhyTen" ns="ui"
          components={{ ...mathComponents, strong: <strong /> }}
        />
      </p>

      <p>
        <Trans i18nKey="ch0_4.ratioWhyTenMultiply" ns="ui"
          components={{ ...mathComponents, strong: <strong />, i: <i /> }}
        />
      </p>

      <p>
        <Trans i18nKey="ch0_4.ratioWhyPowerUnit" ns="ui"
          components={{ ...mathComponents, strong: <strong /> }}
        />
      </p>

      <p>
        <Trans i18nKey="ch0_4.ratioWhyPowerUnitDetail" ns="ui"
          components={{ ...mathComponents, strong: <strong />, i: <i /> }}
        />
      </p>

      <p>
        <Trans i18nKey="ch0_4.ratioWhy" ns="ui"
          components={{ ...mathComponents, strong: <strong /> }}
        />
      </p>

      {/* Four-step derivation — substitute P = V²/R into the power
          formula and let the log identity do the rest. Makes the
          "10 becomes 20" transition concrete instead of hand-wavy. */}
      <MBlock tex="\begin{aligned}
        \text{dB} &= 10 \cdot \log_{10}\!\left(\tfrac{P_1}{P_2}\right) \\
                  &= 10 \cdot \log_{10}\!\left(\tfrac{V_1^{\,2}}{V_2^{\,2}}\right) \\
                  &= 10 \cdot 2 \cdot \log_{10}\!\left(\tfrac{V_1}{V_2}\right) \\
                  &= 20 \cdot \log_{10}\!\left(\tfrac{V_1}{V_2}\right)
      \end{aligned}" />

      <p>{t('ch0_4.ratioLandmarks')}</p>

      <Callout variant="caution">{t('ch0_4.ratioTrap')}</Callout>

      {/* ── The 3 / 10 Shortcut ───────────────────────────────── */}
      <Section id="shortcut" labelKey="ch0_4.sectionShortcut" />

      <p>{t('ch0_4.shortcutIntro')}</p>

      <ul>
        <li><strong>{t('ch0_4.shortcutPlus3')}</strong></li>
        <li><strong>{t('ch0_4.shortcutPlus10')}</strong></li>
      </ul>

      <p>{t('ch0_4.shortcutChainTitle')}</p>

      <ul>
        <li><code>{t('ch0_4.shortcutEg1')}</code></li>
        <li><code>{t('ch0_4.shortcutEg2')}</code></li>
        <li><code>{t('ch0_4.shortcutEg3')}</code></li>
        <li><code>{t('ch0_4.shortcutEg4')}</code></li>
      </ul>

      <Callout variant="tip">
        <Trans i18nKey="ch0_4.shortcutTip" ns="ui"
          components={{ ...mathComponents, ham: <G k="ham radio" /> }}
        />
      </Callout>

      <DbCalculator />

      {/* ── dBm — Power Relative to 1 mW ──────────────────────── */}
      <Section id="dbm" labelKey="ch0_4.sectionDbm" />

      <p>
        <Trans i18nKey="ch0_4.dbmIntro" ns="ui"
          components={{ ...mathComponents, strong: <strong />, dbm: <G k="dbm" /> }}
        />
      </p>

      <p>{t('ch0_4.dbmTableTitle')}</p>

      {/* The dBm ↔ power mental table. `not-prose` opts out of the chapter's
          prose typography so default table padding doesn't fight our
          compact design. Uses font-mono for column alignment; the 0 dBm
          anchor row is bolded to highlight the reference point. */}
      <div className="not-prose my-4 flex justify-center">
        <table className="font-mono text-sm border-collapse">
          <thead>
            <tr className="border-b-2 border-border">
              <th className="text-right py-2 px-4 font-semibold text-foreground">
                {t('ch0_4.dbmTableHeaderDbm')}
              </th>
              <th className="text-left py-2 px-4 font-semibold text-foreground">
                {t('ch0_4.dbmTableHeaderPower')}
              </th>
            </tr>
          </thead>
          <tbody>
            {DBM_TABLE.map(({ dbm, unit, anchor }) => (
              <tr key={dbm}
                  className={anchor
                    ? 'bg-callout-experiment/10 font-bold'
                    : 'border-b border-border/40'}>
                <td className="text-right py-1.5 px-4 text-foreground">
                  {dbm} {tUnit('dbm')}
                </td>
                <td className="text-left py-1.5 px-4 text-foreground">
                  1 {tUnit(unit)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p>
        <Trans i18nKey="ch0_4.dbmNegative" ns="ui"
          components={{ ...mathComponents, strong: <strong /> }}
        />
      </p>

      {/* ── dBd and dBi — Two Antenna References ──────────────── */}
      <Section id="antenna" labelKey="ch0_4.sectionAntenna" />

      <p>{t('ch0_4.antennaIntro')}</p>

      <ul>
        <li>
          <Trans i18nKey="ch0_4.antennaDbi" ns="ui"
            components={{ ...mathComponents, strong: <strong />, dbi: <G k="dbi" />, isotropic: <G k="isotropic" /> }}
          />
        </li>
        <li>
          <Trans i18nKey="ch0_4.antennaDbd" ns="ui"
            components={{ ...mathComponents, strong: <strong />, dbd: <G k="dbd" />, dipole: <G k="dipole" /> }}
          />
        </li>
      </ul>

      <p>
        <Trans i18nKey="ch0_4.antennaConvert" ns="ui"
          components={{ nowrap: <span style={{ whiteSpace: 'nowrap' }} /> }}
        />
      </p>

      <Callout variant="caution">{t('ch0_4.antennaCaution')}</Callout>

      <p>{t('ch0_4.antennaPreview')}</p>

      {/* ── Reading Log-Scale Plots ───────────────────────────── */}
      <Section id="log-axis" labelKey="ch0_4.sectionLogAxis" />

      <p>
        <Trans i18nKey="ch0_4.logAxisIntro" ns="ui"
          components={{ ...mathComponents, strong: <strong /> }}
        />
      </p>

      <ul>
        <li>
          <Trans i18nKey="ch0_4.logAxisFact1" ns="ui"
            components={{ ...mathComponents, strong: <strong />, i: <i />, decade: <G k="decade" /> }}
          />
        </li>
        <li>
          <Trans i18nKey="ch0_4.logAxisFact2" ns="ui"
            components={{ ...mathComponents, strong: <strong />, i: <i />, filt: <G k="filter" /> }}
          />
        </li>
      </ul>

      <LogVsLinearDiagram />

      <p>{t('ch0_4.logAxisWhy')}</p>

      <LogAxisToggle />

      {/* ── Real Radio Numbers to Recognise ───────────────────── */}
      <Section id="recognise" labelKey="ch0_4.sectionRecognise" />

      <p>
        <Trans i18nKey="ch0_4.recogniseIntro" ns="ui"
          components={{ ...mathComponents, qso: <G k="qso" /> }}
        />
      </p>

      <ul>
        <li>
          <Trans i18nKey="ch0_4.recognise1" ns="ui"
            components={{ ...mathComponents, hf: <G k="hf" />, transceiver: <G k="transceiver" /> }}
          />
        </li>
        <li>
          <Trans i18nKey="ch0_4.recognise2" ns="ui"
            components={{ ...mathComponents, qrp: <G k="qrp" /> }}
          />
        </li>
        <li>
          <Trans i18nKey="ch0_4.recognise3" ns="ui"
            components={{ ...mathComponents, vhf: <G k="vhf" /> }}
          />
        </li>
        <li>{t('ch0_4.recognise4')}</li>
        <li>
          <Trans i18nKey="ch0_4.recognise5" ns="ui"
            components={{ ...mathComponents, rf: <G k="rf" /> }}
          />
        </li>
        <li>{t('ch0_4.recognise6')}</li>
        <li>
          <Trans i18nKey="ch0_4.recognise7" ns="ui"
            components={{ ...mathComponents, coax: <G k="coax" /> }}
          />
        </li>
        <li>
          <Trans i18nKey="ch0_4.recognise8" ns="ui"
            components={{ ...mathComponents, yagi: <G k="yagi" /> }}
          />
        </li>
      </ul>

      {/* ── Lab Activity ──────────────────────────────────────── */}
      <LabActivity
        label="0.4"
        goal={t('ch0_4.labGoal')}
        equipment={[
          t('ch0_4.labEquip1'),
          t('ch0_4.labEquip2'),
          t('ch0_4.labEquip3'),
        ]}
        procedure={[
          { text: <Trans i18nKey="ch0_4.labStep1" ns="ui" components={{ ...mathComponents, multimeter: <G k="multimeter" /> }} /> },
          { text: <Trans i18nKey="ch0_4.labStep2" ns="ui" components={{ ...mathComponents, voltageDivider: <G k="voltage divider" /> }} /> },
          { text: <Trans i18nKey="ch0_4.labStep3" ns="ui" components={{ nowrap: <span style={{ whiteSpace: 'nowrap' }} /> }} /> },
          { text: <Trans i18nKey="ch0_4.labStep4" ns="ui" components={{ nowrap: <span style={{ whiteSpace: 'nowrap' }} /> }} /> },
          { text: t('ch0_4.labStep5') },
        ]}
        expectedResult={t('ch0_4.labExpected')}
        connectionToTheory={t('ch0_4.labConnection')}
        troubleshooting={[
          t('ch0_4.labTrouble1'),
          t('ch0_4.labTrouble2'),
        ]}
      />

      {/* ── Quiz ──────────────────────────────────────────────── */}
      <Quiz
        title={t('ch0_4.quizTitle')}
        storageKey={STORAGE_KEYS.quizProgress(CHAPTER_ID)}
        questions={quizQuestions}
      />
    </>
  )
}
