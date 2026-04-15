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
import { STORAGE_KEYS } from '@/lib/storage-keys'

const CHAPTER_ID = '0-4'
const QUIZ_QUESTION_COUNT = 10

export default function Chapter0_4() {
  const { t } = useTranslation('ui')
  const quizQuestions = useMemo(
    () => buildQuizFromI18n(t, 'ch0_4', QUIZ_QUESTION_COUNT),
    [t],
  )

  return (
    <>
      <p>
        <Trans i18nKey="ch0_4.intro" ns="ui"
          components={{ decibel: <G k="decibel" /> }}
        />
      </p>

      <Callout variant="key">{t('ch0_4.introNote')}</Callout>

      <p>{t('ch0_4.introPreview')}</p>

      <DbRulerDiagram />

      {/* ── Logarithms in Three Examples ───────────────────────── */}
      <Section id="logarithms" labelKey="ch0_4.sectionLogs" />

      <p>
        <Trans i18nKey="ch0_4.logsIntro" ns="ui"
          components={{ logarithm: <G k="logarithm" />, i: <i /> }}
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
          components={{ strong: <strong /> }}
        />
      </p>

      <Callout variant="key">{t('ch0_4.logsKey')}</Callout>

      {/* ── dB as a Pure Ratio ─────────────────────────────────── */}
      <Section id="ratio" labelKey="ch0_4.sectionRatio" />

      <p>
        <Trans i18nKey="ch0_4.ratioIntro" ns="ui"
          components={{ strong: <strong /> }}
        />
      </p>

      <p>{t('ch0_4.ratioPower')}</p>

      <MBlock tex="\text{dB} = 10 \cdot \log_{10}\!\left(\frac{P_1}{P_2}\right)" />

      <p>{t('ch0_4.ratioVoltage')}</p>

      <MBlock tex="\text{dB} = 20 \cdot \log_{10}\!\left(\frac{V_1}{V_2}\right)" />

      <p>
        <Trans i18nKey="ch0_4.ratioWhyTen" ns="ui"
          components={{ strong: <strong /> }}
        />
      </p>

      <p>
        <Trans i18nKey="ch0_4.ratioWhyTenMultiply" ns="ui"
          components={{ strong: <strong />, i: <i /> }}
        />
      </p>

      <p>
        <Trans i18nKey="ch0_4.ratioWhyPowerUnit" ns="ui"
          components={{ strong: <strong /> }}
        />
      </p>

      <p>
        <Trans i18nKey="ch0_4.ratioWhyPowerUnitDetail" ns="ui"
          components={{ strong: <strong />, i: <i /> }}
        />
      </p>

      <p>
        <Trans i18nKey="ch0_4.ratioWhy" ns="ui"
          components={{ strong: <strong /> }}
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
          components={{ ham: <G k="ham radio" /> }}
        />
      </Callout>

      <DbCalculator />

      {/* ── dBm — Power Relative to 1 mW ──────────────────────── */}
      <Section id="dbm" labelKey="ch0_4.sectionDbm" />

      <p>
        <Trans i18nKey="ch0_4.dbmIntro" ns="ui"
          components={{ strong: <strong />, dbm: <G k="dbm" /> }}
        />
      </p>

      <p>{t('ch0_4.dbmTableTitle')}</p>

      <p>
        <Trans i18nKey="ch0_4.dbmNegative" ns="ui"
          components={{ strong: <strong /> }}
        />
      </p>

      {/* ── dBd and dBi — Two Antenna References ──────────────── */}
      <Section id="antenna" labelKey="ch0_4.sectionAntenna" />

      <p>{t('ch0_4.antennaIntro')}</p>

      <ul>
        <li>
          <Trans i18nKey="ch0_4.antennaDbi" ns="ui"
            components={{ strong: <strong />, dbi: <G k="dbi" />, isotropic: <G k="isotropic" /> }}
          />
        </li>
        <li>
          <Trans i18nKey="ch0_4.antennaDbd" ns="ui"
            components={{ strong: <strong />, dbd: <G k="dbd" />, dipole: <G k="dipole" /> }}
          />
        </li>
      </ul>

      <p>{t('ch0_4.antennaConvert')}</p>

      <Callout variant="caution">{t('ch0_4.antennaCaution')}</Callout>

      <p>{t('ch0_4.antennaPreview')}</p>

      {/* ── Reading Log-Scale Plots ───────────────────────────── */}
      <Section id="log-axis" labelKey="ch0_4.sectionLogAxis" />

      <p>
        <Trans i18nKey="ch0_4.logAxisIntro" ns="ui"
          components={{ strong: <strong /> }}
        />
      </p>

      <ul>
        <li>
          <Trans i18nKey="ch0_4.logAxisFact1" ns="ui"
            components={{ strong: <strong />, i: <i /> }}
          />
        </li>
        <li>
          <Trans i18nKey="ch0_4.logAxisFact2" ns="ui"
            components={{ strong: <strong /> }}
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
          components={{ qso: <G k="qso" /> }}
        />
      </p>

      <ul>
        <li>
          <Trans i18nKey="ch0_4.recognise1" ns="ui"
            components={{ hf: <G k="hf" />, transceiver: <G k="transceiver" /> }}
          />
        </li>
        <li>
          <Trans i18nKey="ch0_4.recognise2" ns="ui"
            components={{ qrp: <G k="qrp" /> }}
          />
        </li>
        <li>
          <Trans i18nKey="ch0_4.recognise3" ns="ui"
            components={{ vhf: <G k="vhf" /> }}
          />
        </li>
        <li>{t('ch0_4.recognise4')}</li>
        <li>{t('ch0_4.recognise5')}</li>
        <li>{t('ch0_4.recognise6')}</li>
        <li>
          <Trans i18nKey="ch0_4.recognise7" ns="ui"
            components={{ coax: <G k="coax" /> }}
          />
        </li>
        <li>
          <Trans i18nKey="ch0_4.recognise8" ns="ui"
            components={{ yagi: <G k="yagi" /> }}
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
          { text: <Trans i18nKey="ch0_4.labStep1" ns="ui" components={{ multimeter: <G k="multimeter" /> }} /> },
          { text: <Trans i18nKey="ch0_4.labStep2" ns="ui" components={{ voltageDivider: <G k="voltage divider" /> }} /> },
          { text: t('ch0_4.labStep3') },
          { text: t('ch0_4.labStep4') },
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
