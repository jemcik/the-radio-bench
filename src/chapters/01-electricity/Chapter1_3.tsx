// Chapter 1.3 — DC and AC
import { useMemo } from 'react'
import { useTranslation, Trans } from 'react-i18next'
import { Callout } from '@/components/ui/callout'
import { Section } from '@/components/ui/section-heading'
import { MBlock, MathVar } from '@/components/ui/math'
import { G } from '@/features/glossary/glossary-term'
import LabActivity from '@/components/lab/LabActivity'
import Quiz, { buildQuizFromI18n } from '@/components/quiz/Quiz'
import SineExplorer from '@/components/widgets/SineExplorer'
import RmsSelector from '@/components/widgets/RmsSelector'
import WaveformGallery from '@/components/diagrams/WaveformGallery'
import SineOriginDiagram from '@/components/diagrams/SineOriginDiagram'
import { STORAGE_KEYS } from '@/lib/storage-keys'
import { mathComponents } from '@/lib/trans-defaults'

const CHAPTER_ID = '1-3'
const QUIZ_QUESTION_COUNT = 8

export default function Chapter1_3() {
  const { t } = useTranslation('ui')
  const quizQuestions = useMemo(
    () => buildQuizFromI18n(t, 'ch1_3', QUIZ_QUESTION_COUNT, {
      nowrap: <span style={{ whiteSpace: 'nowrap' }} />,
    }),
    [t],
  )

  return (
    <>
      <p>
        <Trans i18nKey="ch1_3.intro" ns="ui" components={{ ...mathComponents, strong: <strong /> }} />
      </p>

      <p>
        <Trans i18nKey="ch1_3.introPreview" ns="ui" components={{ ...mathComponents, strong: <strong /> }} />
      </p>

      {/* ── Section 1: DC vs AC — two kinds of electricity ───────── */}
      <Section id="sources" labelKey="ch1_3.sectionSources" />

      <p>
        <Trans
          i18nKey="ch1_3.sourcesIntro"
          ns="ui"
          components={{ ...mathComponents, dc: <G k="dc" /> }}
        />
      </p>

      <p>
        <Trans
          i18nKey="ch1_3.sourcesAcIntro"
          ns="ui"
          components={{ ...mathComponents, ac: <G k="ac" /> }}
        />
      </p>

      <p>{t('ch1_3.sourcesWhy')}</p>

      <p>{t('ch1_3.sourcesBridge')}</p>

      {/* ── Section 2: The sine wave ─────────────────────────────── */}
      <Section id="sine-wave" labelKey="ch1_3.sectionSineWave" />

      <p>
        <Trans
          i18nKey="ch1_3.sineWaveIntro"
          ns="ui"
          components={{ ...mathComponents, sine: <G k="sine wave" /> }}
        />
      </p>

      <p>
        <Trans
          i18nKey="ch1_3.sineWaveOrigin"
          ns="ui"
          components={{ ...mathComponents, strong: <strong />, code: <code /> }}
        />
      </p>

      <SineOriginDiagram />

      <p>
        <Trans
          i18nKey="ch1_3.sineWaveThreeProps"
          ns="ui"
          components={{
            strong: <strong />,
            var: <MathVar />,
            amplitude: <G k="amplitude" />,
            frequency: <G k="frequency" />,
            phase: <G k="phase" />,
            hertz: <G k="hertz" />,
            period: <G k="period" />,
          }}
        />
      </p>

      <p>
        <Trans
          i18nKey="ch1_3.sineWaveFormula"
          ns="ui"
          components={{ var: <MathVar /> }}
        />
      </p>

      <MBlock tex="V(t) = A \cdot \sin(2 \pi f \cdot t)" />

      <p>
        <Trans
          i18nKey="ch1_3.sineWaveFormulaExplain"
          ns="ui"
          components={{ strong: <strong />, var: <MathVar /> }}
        />
      </p>

      <p>{t('ch1_3.sineWavePeriodNote')}</p>

      <p>
        <Trans
          i18nKey="ch1_3.sineWaveExplorerIntro"
          ns="ui"
          components={{ var: <MathVar /> }}
        />
      </p>

      <SineExplorer />

      {/* ── Section 3: Peak / PP / Avg / RMS ─────────────────────── */}
      <Section id="levels" labelKey="ch1_3.sectionLevels" />

      <p>{t('ch1_3.levelsIntro')}</p>

      <p>
        <Trans
          i18nKey="ch1_3.levelsPeak"
          ns="ui"
          components={{ strong: <strong />, var: <MathVar />, sub: <sub />, nowrap: <span style={{ whiteSpace: "nowrap" }} /> }}
        />
      </p>

      <p>
        <Trans
          i18nKey="ch1_3.levelsPeakToPeak"
          ns="ui"
          components={{ strong: <strong />, var: <MathVar />, sub: <sub />, pp: <G k="peak-to-peak" />, nowrap: <span style={{ whiteSpace: "nowrap" }} /> }}
        />
      </p>

      <p>
        <Trans
          i18nKey="ch1_3.levelsAverage"
          ns="ui"
          components={{ strong: <strong />, var: <MathVar />, sub: <sub />, em: <em />, rectification: <G k="rectification" /> }}
        />
      </p>

      <Callout variant="note">
        <Trans
          i18nKey="ch1_3.levelsAverageDerivation"
          ns="ui"
          components={{ ...mathComponents, strong: <strong /> }}
        />
      </Callout>

      <p>
        <Trans
          i18nKey="ch1_3.levelsRmsIntro"
          ns="ui"
          components={{ strong: <strong />, var: <MathVar />, sub: <sub />, rms: <G k="rms" /> }}
        />
      </p>

      <MBlock tex="V_{\mathrm{rms}} = \dfrac{V_{\mathrm{pk}}}{\sqrt{2}} \approx 0.707 \cdot V_{\mathrm{pk}}" />

      <Callout variant="note">
        <Trans
          i18nKey="ch1_3.levelsRmsDerivation"
          ns="ui"
          components={{ strong: <strong />, var: <MathVar />, sub: <sub />, nowrap: <span style={{ whiteSpace: "nowrap" }} /> }}
        />
      </Callout>

      <p>
        <Trans
          i18nKey="ch1_3.levelsRmsFormula"
          ns="ui"
          components={{ var: <MathVar />, sub: <sub /> }}
        />
      </p>

      <p>
        <Trans
          i18nKey="ch1_3.rmsSelectorIntro"
          ns="ui"
          components={{ var: <MathVar /> }}
        />
      </p>

      <RmsSelector />

      <Callout variant="key">
        <Trans
          i18nKey="ch1_3.rmsSelectorTakeaway"
          ns="ui"
          components={{ var: <MathVar />, sub: <sub />, nowrap: <span style={{ whiteSpace: "nowrap" }} /> }}
        />
      </Callout>

      {/* ── Section 4: Mains ─────────────────────────────────────── */}
      <Section id="mains" labelKey="ch1_3.sectionMains" />

      <p>
        <Trans
          i18nKey="ch1_3.mainsIntro"
          ns="ui"
          components={{ em: <em />, mains: <G k="mains" />, nowrap: <span style={{ whiteSpace: "nowrap" }} /> }}
        />
      </p>

      <p>
        <Trans
          i18nKey="ch1_3.mainsWorkedEurope"
          ns="ui"
          components={{ strong: <strong />, var: <MathVar />, sub: <sub />, nowrap: <span style={{ whiteSpace: "nowrap" }} /> }}
        />
      </p>

      <p>
        <Trans
          i18nKey="ch1_3.mainsWorkedUsa"
          ns="ui"
          components={{ strong: <strong />, var: <MathVar />, sub: <sub />, nowrap: <span style={{ whiteSpace: "nowrap" }} /> }}
        />
      </p>

      <Callout variant="caution">
        <Trans
          i18nKey="ch1_3.mainsCapacitorCallout"
          ns="ui"
          components={{ ...mathComponents, strong: <strong /> }}
        />
      </Callout>

      {/* ── Section 5: Non-sine + DMM gotcha ─────────────────────── */}
      <Section id="non-sine" labelKey="ch1_3.sectionNonSine" />

      <p>
        <Trans
          i18nKey="ch1_3.nonSineIntro"
          ns="ui"
          components={{ var: <MathVar />, sub: <sub />, square: <G k="square wave" />, nowrap: <span style={{ whiteSpace: "nowrap" }} /> }}
        />
      </p>

      <p>
        <Trans
          i18nKey="ch1_3.nonSineGalleryIntro"
          ns="ui"
          components={{ ...mathComponents, strong: <strong />, formFactor: <G k="form factor" /> }}
        />
      </p>

      <WaveformGallery />

      <p>
        <Trans
          i18nKey="ch1_3.nonSineErrors"
          ns="ui"
          components={{ strong: <strong />, nowrap: <span style={{ whiteSpace: "nowrap" }} /> }}
        />
      </p>

      <Callout variant="note">
        <Trans
          i18nKey="ch1_3.trueRmsNote"
          ns="ui"
          components={{ ...mathComponents, strong: <strong />, truerms: <G k="true rms" /> }}
        />
      </Callout>

      {/* ── Section 6: Forward pointers ──────────────────────────── */}
      <Section id="forward" labelKey="ch1_3.sectionForward" />

      <p>
        <Trans
          i18nKey="ch1_3.forwardReactance"
          ns="ui"
          components={{ ...mathComponents, strong: <strong />, em: <em />, reactance: <G k="reactance" /> }}
        />
      </p>

      <p>
        <Trans
          i18nKey="ch1_3.forwardHarmonics"
          ns="ui"
          components={{ ...mathComponents, strong: <strong />, em: <em />, filter: <G k="filter" />, harmonic: <G k="harmonic" />, fourier: <G k="fourier" />, carrier: <G k="carrier" /> }}
        />
      </p>

      {/* ── Summary ──────────────────────────────────────────────── */}
      <Section id="summary" labelKey="ch1_3.sectionSummary" />

      <Callout variant="key">
        <p>
          <Trans i18nKey="ch1_3.keyTakeaway1" ns="ui" />
        </p>
        <p>
          <Trans
            i18nKey="ch1_3.keyTakeaway2"
            ns="ui"
            components={{ var: <MathVar />, sub: <sub />, nowrap: <span style={{ whiteSpace: 'nowrap' }} /> }}
          />
        </p>
        <p>
          <Trans
            i18nKey="ch1_3.keyTakeaway3"
            ns="ui"
            components={{ var: <MathVar />, sub: <sub />, nowrap: <span style={{ whiteSpace: 'nowrap' }} /> }}
          />
        </p>
        <p>
          <Trans i18nKey="ch1_3.keyTakeaway4" ns="ui" />
        </p>
      </Callout>

      {/* ── Lab ──────────────────────────────────────────────────── */}
      <LabActivity
        label="1.3"
        goal={t('ch1_3.labGoal')}
        equipment={[
          <Trans key="e1" i18nKey="ch1_3.labEquip1" ns="ui" components={{ ...mathComponents, multimeter: <G k="multimeter" /> }} />,
          <Trans key="e2" i18nKey="ch1_3.labEquip2" ns="ui" components={{ ...mathComponents, breadboard: <G k="breadboard" /> }} />,
          <Trans key="e3" i18nKey="ch1_3.labEquip3" ns="ui" components={{ ...mathComponents, arduino: <G k="arduino" /> }} />,
          t('ch1_3.labEquip4'),
        ]}
        components={[
          t('ch1_3.labComp1'),
          t('ch1_3.labComp2'),
          t('ch1_3.labComp3'),
        ]}
        procedure={[
          { text: <Trans i18nKey="ch1_3.labStep1" ns="ui" components={{ ...mathComponents, strong: <strong />, em: <em /> }} /> },
          { text: <Trans i18nKey="ch1_3.labStep2" ns="ui" components={{ ...mathComponents, strong: <strong />, em: <em />, ripple: <G k="ripple" /> }} /> },
          { text: <Trans i18nKey="ch1_3.labStep3" ns="ui" components={{ ...mathComponents, strong: <strong />, code: <code /> }} /> },
          { text: <Trans i18nKey="ch1_3.labStep4" ns="ui" components={{ ...mathComponents, strong: <strong /> }} /> },
          { text: <Trans i18nKey="ch1_3.labStep5" ns="ui" components={{ ...mathComponents, strong: <strong /> }} /> },
          { text: <Trans i18nKey="ch1_3.labStep6" ns="ui" components={{ ...mathComponents, strong: <strong />, code: <code /> }} /> },
        ]}
        expectedResult={t('ch1_3.labExpected')}
        connectionToTheory={t('ch1_3.labConnection')}
        troubleshooting={[
          t('ch1_3.labTrouble1'),
          t('ch1_3.labTrouble2'),
          t('ch1_3.labTrouble3'),
        ]}
      />

      {/* ── Quiz ─────────────────────────────────────────────────── */}
      <Quiz
        title={t('ch1_3.quizTitle')}
        storageKey={STORAGE_KEYS.quizProgress(CHAPTER_ID)}
        questions={quizQuestions}
      />
    </>
  )
}
