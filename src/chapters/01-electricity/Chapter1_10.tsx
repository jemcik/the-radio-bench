// Chapter 1.10 — Diodes
import { useMemo } from 'react'
import { useTranslation, Trans } from 'react-i18next'
import { Callout } from '@/components/ui/callout'
import { Section } from '@/components/ui/section-heading'
import { MathVar } from '@/components/ui/math'
import { G } from '@/features/glossary/glossary-term'
import LabActivity from '@/components/lab/LabActivity'
import Quiz, { buildQuizFromI18n } from '@/components/quiz/Quiz'
import DiodeIVCurve from '@/components/widgets/DiodeIVCurve'
import HalfWaveRectifierSchematic from '@/components/diagrams/HalfWaveRectifierSchematic'
import HalfWaveRectifierWaveform from '@/components/diagrams/HalfWaveRectifierWaveform'
import BridgeRectifierSchematic from '@/components/diagrams/BridgeRectifierSchematic'
import RippleSmoothingWidget from '@/components/widgets/RippleSmoothingWidget'
import ZenerRegulatorSchematic from '@/components/diagrams/ZenerRegulatorSchematic'
import ZenerRegulatorWidget from '@/components/widgets/ZenerRegulatorWidget'
import FlybackDiodeSchematic from '@/components/diagrams/FlybackDiodeSchematic'
import VaractorTunerSchematic from '@/components/diagrams/VaractorTunerSchematic'
import { STORAGE_KEYS } from '@/lib/storage-keys'
import { mathComponents } from '@/lib/trans-defaults'

const CHAPTER_ID = '1-10'
const QUIZ_QUESTION_COUNT = 8

function nowrapSpan() {
  return <span style={{ whiteSpace: 'nowrap' }} />
}

export default function Chapter1_10() {
  const { t } = useTranslation('ui')
  const nowrap = nowrapSpan()

  const quizQuestions = useMemo(
    () => buildQuizFromI18n(t, 'ch1_10', QUIZ_QUESTION_COUNT, {
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
          i18nKey="ch1_10.intro1"
          ns="ui"
          components={{
            ...mathComponents,
            strong: <strong />,
            nowrap,
            d: <G k="diode" />,
            ac: <G k="ac" />,
            dc: <G k="dc" />,
          }}
        />
      </p>

      <p>
        <Trans
          i18nKey="ch1_10.intro2"
          ns="ui"
          components={{ strong: <strong /> }}
        />
      </p>

      {/* ── Section 1: What a diode does ───────────────────────── */}
      <Section id="symbol" labelKey="ch1_10.sectionSymbol" />
      <p>
        <Trans
          i18nKey="ch1_10.symbolIntro"
          ns="ui"
          components={{
            ...mathComponents,
            strong: <strong />,
            anode: <G k="anode" />,
            cathode: <G k="cathode" />,
          }}
        />
      </p>
      <Callout variant="key">
        <p>
          <Trans
            i18nKey="ch1_10.symbolKey"
            ns="ui"
            components={{ strong: <strong /> }}
          />
        </p>
      </Callout>

      {/* ── Section 2: I–V curve and forward voltage drop ─────── */}
      <Section id="iv" labelKey="ch1_10.sectionIv" />
      <p>
        <Trans
          i18nKey="ch1_10.ivIntro"
          ns="ui"
          components={{
            ...mathComponents,
            strong: <strong />,
            fvd: <G k="forward voltage drop" />,
            res: <G k="resistor" />,
          }}
        />
      </p>

      <DiodeIVCurve />

      <p>
        <Trans
          i18nKey="ch1_10.ivCurveExplain"
          ns="ui"
          components={{
            ...mathComponents,
            strong: <strong />,
            unit: <span />,
          }}
        />
      </p>
      <p>
        <Trans
          i18nKey="ch1_10.ivKnee"
          ns="ui"
          components={{
            ...mathComponents,
            strong: <strong />,
            unit: <span />,
            fvd: <G k="forward voltage drop" />,
            schottky: <G k="schottky diode" />,
          }}
        />
      </p>
      <Callout variant="tip">
        <p>
          <Trans
            i18nKey="ch1_10.ivRule"
            ns="ui"
            components={{
              ...mathComponents,
              strong: <strong />,
              unit: <span />,
              nowrap: nowrap,
            }}
          />
        </p>
      </Callout>
      <Callout variant="experiment">
        <p>
          <Trans
            i18nKey="ch1_10.ivCalloutExperiment"
            ns="ui"
            components={{
              ...mathComponents,
              strong: <strong />,
              unit: <span />,
            }}
          />
        </p>
      </Callout>

      {/* ── Section 3: Half-wave rectifier ────────────────────── */}
      <Section id="halfWave" labelKey="ch1_10.sectionHalfWave" />
      <p>
        <Trans
          i18nKey="ch1_10.halfWaveIntro"
          ns="ui"
          components={{
            ac: <G k="ac" />,
            dc: <G k="dc" />,
            rect: <G k="rectification" />,
          }}
        />
      </p>

      <HalfWaveRectifierSchematic />

      <p>
        <Trans
          i18nKey="ch1_10.halfWaveExplain"
          ns="ui"
          components={{ ...mathComponents }}
        />
      </p>

      <HalfWaveRectifierWaveform />

      <Callout variant="caution">
        <p>
          <Trans
            i18nKey="ch1_10.halfWaveCaution"
            ns="ui"
            components={{ strong: <strong /> }}
          />
        </p>
      </Callout>

      {/* ── Section 4: Bridge rectifier + smoothing capacitor ── */}
      <Section id="bridge" labelKey="ch1_10.sectionBridge" />
      <p>
        <Trans
          i18nKey="ch1_10.bridgeIntro"
          ns="ui"
          components={{ strong: <strong /> }}
        />
      </p>

      <BridgeRectifierSchematic />

      <p>
        <Trans
          i18nKey="ch1_10.bridgeAfter"
          ns="ui"
          components={{
            strong: <strong />,
            cap: <G k="capacitor" />,
            ripple: <G k="ripple" />,
          }}
        />
      </p>

      <RippleSmoothingWidget />

      <Callout variant="math">
        <p>
          <Trans
            i18nKey="ch1_10.rippleCalloutMath"
            ns="ui"
            components={{
              ...mathComponents,
              strong: <strong />,
              nowrap: nowrap,
            }}
          />
        </p>
      </Callout>

      <Callout variant="note">
        <p>
          <Trans
            i18nKey="ch1_10.bridgeNote"
            ns="ui"
            components={{ strong: <strong /> }}
          />
        </p>
      </Callout>

      {/* ── Section 5: Zener voltage reference ────────────────── */}
      <Section id="zener" labelKey="ch1_10.sectionZener" />
      <p>
        <Trans
          i18nKey="ch1_10.zenerIntro"
          ns="ui"
          components={{ ...mathComponents, strong: <strong /> }}
        />
      </p>

      <ZenerRegulatorWidget />

      {/* The reader's blocker is exactly «but the curve isn't truly
          vertical, so where IS the stabilization?» — a concrete-numbers
          rebuttal goes here, BEFORE the regulator schematic, so that
          when the schematic appears the reader is already primed to
          look for V_in → R_s → Zener → GND with R_s as the absorber. */}
      <p>
        <Trans
          i18nKey="ch1_10.zenerHowSlope"
          ns="ui"
          components={{
            ...mathComponents,
            strong: <strong />,
            ivc: <G k="iv curve" />,
          }}
        />
      </p>
      {/* The «battery + r_z» mental model + the etymology of «dynamic».
          Two reader-blockers landed here: (a) the V/I confusion (Ohm's
          law applied directly gives a wildly varying R because the
          curve doesn't pass through 0,0 — the «5.1 V battery» part
          dominates); (b) «dynamic» = describes change, not «varying».
          Without this paragraph the reader has to infer V_Z = V_Z + I·r_z
          from Step 3 of the example below; with it, Step 3 is just the
          model spelled out in numbers. */}
      <p>
        <Trans
          i18nKey="ch1_10.zenerHowModel"
          ns="ui"
          components={{ ...mathComponents, strong: <strong />, nowrap: nowrap }}
        />
      </p>
      <p>
        <Trans
          i18nKey="ch1_10.zenerHowCircuit"
          ns="ui"
          components={{
            ...mathComponents,
            nowrap: nowrap,
            vd: <G k="voltage divider" />,
          }}
        />
      </p>

      <Callout variant="math">
        <p>
          <Trans
            i18nKey="ch1_10.zenerHowExample"
            ns="ui"
            components={{
              ...mathComponents,
              strong: <strong />,
              nowrap: nowrap,
            }}
          />
        </p>
      </Callout>

      <p>
        <Trans
          i18nKey="ch1_10.zenerHowAnalogy"
          ns="ui"
          components={{ ...mathComponents, strong: <strong /> }}
        />
      </p>

      <ZenerRegulatorSchematic />

      <p>
        <Trans
          i18nKey="ch1_10.zenerSizing"
          ns="ui"
          components={{ ...mathComponents, nowrap: nowrap }}
        />
      </p>

      <Callout variant="caution">
        <p>
          <Trans
            i18nKey="ch1_10.zenerLimitations"
            ns="ui"
            components={{ ...mathComponents, strong: <strong /> }}
          />
        </p>
      </Callout>

      {/* ── Section 6: Flyback diode ───────────────────────────── */}
      <Section id="flyback" labelKey="ch1_10.sectionFlyback" />
      <p>
        <Trans
          i18nKey="ch1_10.flybackIntro"
          ns="ui"
          components={{ ind: <G k="inductor" /> }}
        />
      </p>

      <Callout variant="math">
        <p>
          <Trans
            i18nKey="ch1_10.flybackKeyMath"
            ns="ui"
            components={{
              ...mathComponents,
              nowrap: nowrap,
              indN: <G k="inductance" />,
            }}
          />
        </p>
      </Callout>

      <FlybackDiodeSchematic />

      <Callout variant="tip">
        <p>
          <Trans
            i18nKey="ch1_10.flybackTip"
            ns="ui"
            components={{ strong: <strong /> }}
          />
        </p>
      </Callout>

      {/* ── Section 7: Diode family gallery ───────────────────── */}
      <Section id="family" labelKey="ch1_10.sectionFamily" />
      <p>{t('ch1_10.familyIntro')}</p>

      <ul className="not-prose space-y-3 my-6 text-foreground">
        {[
          { key: 'familyTableSignal',    glossKey: undefined },
          { key: 'familyTableRectifier', glossKey: undefined },
          { key: 'familyTableSchottky',  glossKey: 'schottky diode' },
          { key: 'familyTableZener',     glossKey: undefined },
          { key: 'familyTableLed',       glossKey: 'led' },
          { key: 'familyTableVaractor',  glossKey: undefined },
          { key: 'familyTablePin',       glossKey: undefined },
        ].map(({ key }) => (
          <li
            key={key}
            className="flex gap-3 items-start rounded-md border border-border bg-card/40 px-4 py-3 leading-6"
          >
            <span aria-hidden="true" className="shrink-0 mt-[7px] inline-block w-2 h-2 rounded-full bg-primary/70" />
            <span className="flex-1 min-w-0 text-sm">
              <Trans
                i18nKey={`ch1_10.${key}`}
                ns="ui"
                components={{
                  ...mathComponents,
                  strong: <strong />,
                  em: <em />,
                  s11: <G k="s11" />,
                  vfo: <G k="vfo" />,
                  capN: <G k="junction capacitance" />,
                  lc: <G k="lc" />,
                  resfreq: <G k="resonant frequency" />,
                  pin: <G k="pin diode" />,
                }}
              />
              {/* Varactor's «two pins, two jobs» bias network needs
                  a picture; embed the tuner schematic immediately
                  beneath the varactor row's prose so reader's eye
                  goes prose → diagram in one motion. Other family-
                  table rows are short enough to read without an
                  illustration. */}
              {key === 'familyTableVaractor' && (
                <div className="mt-3">
                  <VaractorTunerSchematic />
                </div>
              )}
            </span>
          </li>
        ))}
      </ul>

      {/* ── Lab ────────────────────────────────────────────────── */}
      <LabActivity
        label="1.10"
        goal={<Trans i18nKey="ch1_10.labGoal" ns="ui" components={{ strong: <strong /> }} />}
        equipment={[
          t('ch1_10.labEquip1'),
          t('ch1_10.labEquip2'),
          t('ch1_10.labEquip3'),
          t('ch1_10.labEquip4'),
        ]}
        components={[
          t('ch1_10.labComp1'),
          t('ch1_10.labComp2'),
          t('ch1_10.labComp3'),
          <Trans key="comp4" i18nKey="ch1_10.labComp4" ns="ui" components={{ ...mathComponents }} />,
          t('ch1_10.labComp5'),
        ]}
        procedure={[
          { text: t('ch1_10.labStep1') },
          { text: t('ch1_10.labStep2') },
          { text: t('ch1_10.labStep3') },
          { text: <Trans i18nKey="ch1_10.labStep4" ns="ui" components={{ strong: <strong /> }} /> },
          { text: <Trans i18nKey="ch1_10.labStep5" ns="ui" components={{ ...mathComponents }} /> },
        ]}
        expectedResult={<Trans i18nKey="ch1_10.labExpected" ns="ui" components={{ ...mathComponents }} />}
        connectionToTheory={<Trans i18nKey="ch1_10.labConnection" ns="ui" components={{ ...mathComponents }} />}
        troubleshooting={[
          t('ch1_10.labTrouble1'),
          t('ch1_10.labTrouble2'),
          t('ch1_10.labTrouble3'),
        ]}
      />

      {/* ── Quiz ───────────────────────────────────────────────── */}
      <Quiz
        title={t('ch1_10.quizTitle')}
        storageKey={STORAGE_KEYS.quizProgress(CHAPTER_ID)}
        questions={quizQuestions}
      />
    </>
  )
}
