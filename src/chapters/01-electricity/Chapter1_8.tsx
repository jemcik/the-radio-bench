// Chapter 1.8 — Filters
import { useMemo } from 'react'
import { useTranslation, Trans } from 'react-i18next'
import { Callout } from '@/components/ui/callout'
import { Section } from '@/components/ui/section-heading'
import { MBlock, MathVar } from '@/components/ui/math'
import { G } from '@/features/glossary/glossary-term'
import LabActivity from '@/components/lab/LabActivity'
import Quiz, { buildQuizFromI18n } from '@/components/quiz/Quiz'
import CutoffCalculator from '@/components/widgets/CutoffCalculator'
import BodePlotter from '@/components/widgets/BodePlotter'
import VnaFilterSweepMock from '@/components/widgets/VnaFilterSweepMock'
import FilterTypeGallery from '@/components/diagrams/FilterTypeGallery'
import RcLowPassSchematic from '@/components/diagrams/RcLowPassSchematic'
import RcLpfLabSchematic from '@/components/diagrams/RcLpfLabSchematic'
import RcHighPassSchematic from '@/components/diagrams/RcHighPassSchematic'
import LcLowPassSchematic from '@/components/diagrams/LcLowPassSchematic'
import CascadedRcSchematic from '@/components/diagrams/CascadedRcSchematic'
import LcBandPassSchematic from '@/components/diagrams/LcBandPassSchematic'
import LcNotchSchematic from '@/components/diagrams/LcNotchSchematic'
import BodePlotReadingGuide from '@/components/diagrams/BodePlotReadingGuide'
import { STORAGE_KEYS } from '@/lib/storage-keys'
import { mathComponents } from '@/lib/trans-defaults'

const CHAPTER_ID = '1-8'
const QUIZ_QUESTION_COUNT = 10

function nowrapSpan() {
  return <span style={{ whiteSpace: 'nowrap' }} />
}

export default function Chapter1_8() {
  const { t } = useTranslation('ui')
  const nowrap = nowrapSpan()

  const quizQuestions = useMemo(
    () => buildQuizFromI18n(t, 'ch1_8', QUIZ_QUESTION_COUNT, {
      nowrap: nowrapSpan(),
      var: <MathVar />,
      sub: <sub />,
      strong: <strong />,
      em: <em />,
      // Glossary tags used in quiz prose. Without these mappings,
      // <Trans> renders «&lt;pa&gt;…&lt;/pa&gt;» as visible escaped
      // text instead of resolving to a tooltip.
      adc: <G k="adc" />,
      pa: <G k="power amplifier" />,
      swr: <G k="swr" />,
      atu: <G k="antenna tuner" />,
    }),
    [t],
  )

  return (
    <>
      {/* ── Intro ──────────────────────────────────────────────── */}
      <p>
        <Trans
          i18nKey="ch1_8.intro"
          ns="ui"
          components={{
            strong: <strong />,
            adc: <G k="adc" />,
            bpf: <G k="band-pass" />,
            bsf: <G k="band-stop" />,
            dc: <G k="dc" />,
            filt: <G k="filter" />,
            hh: <G k="harmonic" />,
            hpf: <G k="high-pass" />,
            lpf: <G k="low-pass" />,
            notch: <G k="notch" />,
            pb: <G k="passband" />,
            sb: <G k="stopband" />,
          }}
        />
      </p>

      <p>
        <Trans
          i18nKey="ch1_8.introPreview"
          ns="ui"
          components={{
            ...mathComponents,
            strong: <strong />,
            nowrap: nowrap,
            adc: <G k="adc" />,
            bes: <G k="bessel" />,
            bode: <G k="bode plot" />,
            bw: <G k="butterworth" />,
            cb: <G k="chebyshev" />,
            cf: <G k="cutoff frequency" />,
            db: <G k="decibel" />,
            dec: <G k="decade" />,
            ell: <G k="elliptic" />,
            fam: <G k="family" />,
            hpf: <G k="high-pass" />,
            iff: <G k="if filter" />,
            lpf: <G k="low-pass" />,
            pa: <G k="power amplifier" />,
            ro: <G k="roll-off" />,
            sdr: <G k="sdr" />,
            vna: <G k="vna" />, lc: <G k="lc" />, res: <G k="resistor" />, cap: <G k="capacitor" />, sel: <G k="selectivity" /> }}
        />
      </p>

      {/* ── Section 1: Sieve analogy + 4 shapes ────────────────── */}
      <Section id="sieve" labelKey="ch1_8.sectionSieve" />

      <p>
        <Trans
          i18nKey="ch1_8.sieveIntro"
          ns="ui"
          components={{ strong: <strong />, em: <em /> }}
        />
      </p>

      <p>
        <Trans
          i18nKey="ch1_8.sieveTransition"
          ns="ui"
          components={{ strong: <strong />, cf: <G k="cutoff frequency" /> }}
        />
      </p>

      <FilterTypeGallery />

      <p>
        <Trans
          i18nKey="ch1_8.sieveFourShapes"
          ns="ui"
          components={{
            ...mathComponents,
            strong: <strong />,
            db: <G k="decibel" />,
            ord: <G k="order" />,
            pb: <G k="passband" />,
            sb: <G k="stopband" />, lpf: <G k="low-pass" />, hpf: <G k="high-pass" /> }}
        />
      </p>

      {/* ── Section 2: RC low-pass ─────────────────────────────── */}
      <Section id="rc-lpf" labelKey="ch1_8.sectionRcLpf" />

      <p>{t('ch1_8.rcLpfIntro')}</p>

      <RcLowPassSchematic />

      <p>
        <Trans
          i18nKey="ch1_8.rcLpfBehaviour"
          ns="ui"
          components={{
            ...mathComponents,
            strong: <strong />,
            nowrap: nowrap,
            reac: <G k="reactance" />, vd: <G k="voltage divider" /> }}
        />
      </p>

      <p>
        <Trans
          i18nKey="ch1_8.rcLpfWhereFcComesFrom"
          ns="ui"
          components={{ ...mathComponents, nowrap: nowrap }}
        />
      </p>

      <p>{t('ch1_8.rcLpfFormulaIntro')}</p>

      <MBlock tex="f_c = \dfrac{1}{2\pi R C}" />

      {/* ── Section 3: RC high-pass ────────────────────────────── */}
      <Section id="rc-hpf" labelKey="ch1_8.sectionRcHpf" />

      <p>{t('ch1_8.rcHpfIntro')}</p>

      <RcHighPassSchematic />

      <p>
        <Trans
          i18nKey="ch1_8.rcHpfBehaviour"
          ns="ui"
          components={{
            ...mathComponents,
            strong: <strong />,
            nowrap: nowrap,
            cc: <G k="coupling capacitor" />,
            dc: <G k="dc" />,
          }}
        />
      </p>

      <Callout variant="key">
        <p>
          <Trans
            i18nKey="ch1_8.rcHpfDuality"
            ns="ui"
            components={{ strong: <strong /> }}
          />
        </p>
      </Callout>

      {/* ── Section 4: Cutoff frequency ────────────────────────── */}
      <Section id="cutoff" labelKey="ch1_8.sectionCutoff" />

      <p>
        <Trans
          i18nKey="ch1_8.cutoffIntro"
          ns="ui"
          components={{
            ...mathComponents,
            strong: <strong />,
            nowrap: nowrap,
            cf: <G k="cutoff frequency" />,
            db: <G k="decibel" />,
          }}
        />
      </p>

      <p>
        <Trans
          i18nKey="ch1_8.cutoffCalcIntro"
          ns="ui"
          components={{ ...mathComponents, nowrap: nowrap }}
        />
      </p>

      <CutoffCalculator />

      <Callout variant="tip">
        <Trans
          i18nKey="ch1_8.cutoffRule"
          ns="ui"
          components={{ ...mathComponents, strong: <strong />, nowrap: nowrap }}
        />
      </Callout>

      {/* ── Section 5: Bode plot literacy ──────────────────────── */}
      <Section id="bode" labelKey="ch1_8.sectionBode" />

      <p>
        <Trans
          i18nKey="ch1_8.bodeIntro"
          ns="ui"
          components={{
            strong: <strong />,
            bode: <G k="bode plot" />,
            db: <G k="decibel" />,
            dec: <G k="decade" />,
          }}
        />
      </p>

      <BodePlotReadingGuide />

      <p>
        <Trans
          i18nKey="ch1_8.bodeFact1"
          ns="ui"
          components={{
            ...mathComponents,
            strong: <strong />,
            nowrap: nowrap,
            db: <G k="decibel" />,
          }}
        />
      </p>

      <p>
        <Trans
          i18nKey="ch1_8.bodeFact2"
          ns="ui"
          components={{
            strong: <strong />,
            db: <G k="decibel" />,
            dec: <G k="decade" />,
            lpf: <G k="low-pass" />,
            hpf: <G k="high-pass" />,
          }}
        />
      </p>

      <p>
        <Trans
          i18nKey="ch1_8.bodeNotARightAngle"
          ns="ui"
          components={{ ...mathComponents, strong: <strong /> }}
        />
      </p>

      {/* ── Section 6: Order and steepness ─────────────────────── */}
      <Section id="order" labelKey="ch1_8.sectionOrder" />

      <p>
        <Trans
          i18nKey="ch1_8.orderIntro"
          ns="ui"
          components={{ strong: <strong />, ind: <G k="inductor" /> }}
        />
      </p>

      <CascadedRcSchematic />

      <p>
        <Trans
          i18nKey="ch1_8.orderBufferAside"
          ns="ui"
          components={{ strong: <strong />, imp: <G k="impedance" /> }}
        />
      </p>

      <p>
        <Trans
          i18nKey="ch1_8.orderRule"
          ns="ui"
          components={{
            strong: <strong />,
            pa: <G k="power amplifier" />,
            lpf: <G k="low-pass" />,
          }}
        />
      </p>

      <p>
        <Trans
          i18nKey="ch1_8.orderTradeoff"
          ns="ui"
          components={{ strong: <strong /> }}
        />
      </p>

      <p>{t('ch1_8.orderWidgetIntro')}</p>

      <BodePlotter />

      {/* ── Section 7: LC filters ──────────────────────────────── */}
      <Section id="lc" labelKey="ch1_8.sectionLc" />

      <p>
        <Trans
          i18nKey="ch1_8.lcIntro"
          ns="ui"
          components={{ strong: <strong />, reso: <G k="resonance" /> }}
        />
      </p>

      <p>
        <Trans
          i18nKey="ch1_8.lcLpfRecap"
          ns="ui"
          components={{ strong: <strong />, pa: <G k="power amplifier" />, ac: <G k="ac" />, rip: <G k="ripple" /> }}
        />
      </p>

      <LcLowPassSchematic />

      <p>
        <Trans
          i18nKey="ch1_8.lcBandPassIntro"
          ns="ui"
          components={{
            ...mathComponents,
            strong: <strong />,
            nowrap: nowrap,
            q: <G k="q-factor" />, resfreq: <G k="resonant frequency" />, bandwidth: <G k="bandwidth" /> }}
        />
      </p>

      <LcBandPassSchematic />

      <p>
        <Trans
          i18nKey="ch1_8.lcNotchIntro"
          ns="ui"
          components={{ ...mathComponents, strong: <strong />, tank: <G k="tank" />, tuned: <G k="tuned circuit" /> }}
        />
      </p>

      <LcNotchSchematic />

      {/* ── Section 8: Filter families ─────────────────────────── */}
      <Section id="families" labelKey="ch1_8.sectionFamilies" />

      <p>
        <Trans
          i18nKey="ch1_8.familiesIntro"
          ns="ui"
          components={{ strong: <strong /> }}
        />
      </p>

      <p>
        <Trans
          i18nKey="ch1_8.familiesButter"
          ns="ui"
          components={{ strong: <strong />, bw: <G k="butterworth" /> }}
        />
      </p>

      <p>
        <Trans
          i18nKey="ch1_8.familiesCheby"
          ns="ui"
          components={{ strong: <strong />, cb: <G k="chebyshev" /> }}
        />
      </p>

      <p>
        <Trans
          i18nKey="ch1_8.familiesBessel"
          ns="ui"
          components={{ strong: <strong />, bes: <G k="bessel" /> }}
        />
      </p>

      <p>
        <Trans
          i18nKey="ch1_8.familiesElliptic"
          ns="ui"
          components={{ strong: <strong />, em: <em />, ell: <G k="elliptic" /> }}
        />
      </p>

      <Callout variant="tip">
        <Trans
          i18nKey="ch1_8.familiesCallout"
          ns="ui"
          components={{
            strong: <strong />,
            elsie: (
              <a
                href="https://tonnesoftware.com/elsie2.html"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline hover:no-underline"
              />
            ),
            changpuak: (
              <a
                href="https://www.changpuak.ch/electronics/butterworth_lowpass.php"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline hover:no-underline"
              />
            ),
          }}
        />
      </Callout>

      {/* ── Section 9: VNA sweep ───────────────────────────────── */}
      <Section id="vna" labelKey="ch1_8.sectionVna" />

      <p>
        <Trans
          i18nKey="ch1_8.vnaIntro"
          ns="ui"
          components={{
            strong: <strong />,
            db: <G k="decibel" />,
            vna: <G k="vna" />,
            s21: <G k="s21" />,
          }}
        />
      </p>

      <p>
        <Trans
          i18nKey="ch1_8.vnaCurves"
          ns="ui"
          components={{ strong: <strong /> }}
        />
      </p>

      <VnaFilterSweepMock />

      <Callout variant="tip">
        <Trans
          i18nKey="ch1_8.vnaMarkerHint"
          ns="ui"
          components={{ ...mathComponents, strong: <strong />, nowrap: nowrap }}
        />
      </Callout>

      {/* ── Section 10: Where filters live ─────────────────────── */}
      <Section id="applications" labelKey="ch1_8.sectionApplications" />

      <p>{t('ch1_8.appsIntro')}</p>

      <p>
        <Trans
          i18nKey="ch1_8.appsHarmonicLpf"
          ns="ui"
          components={{
            strong: <strong />,
            lpf: <G k="low-pass" />,
            pa: <G k="power amplifier" />,
          }}
        />
      </p>

      <p>
        <Trans
          i18nKey="ch1_8.appsIfFilter"
          ns="ui"
          components={{
            strong: <strong />,
            cw: <G k="cw" />,
            iff: <G k="if filter" />,
            ssb: <G k="ssb" />,
          }}
        />
      </p>

      <p>
        <Trans
          i18nKey="ch1_8.appsCrossover"
          ns="ui"
          components={{ strong: <strong /> }}
        />
      </p>

      <p>
        <Trans
          i18nKey="ch1_8.appsAntiAlias"
          ns="ui"
          components={{
            strong: <strong />,
            adc: <G k="adc" />,
            sdr: <G k="sdr" />,
          }}
        />
      </p>

      {/* ── Summary ────────────────────────────────────────────── */}
      <Section id="summary" labelKey="ch1_8.sectionSummary" />

      <Callout variant="key">
        <p>
          <Trans
            i18nKey="ch1_8.keyTakeaway1"
            ns="ui"
            components={{
              strong: <strong />,
              bpf: <G k="band-pass" />,
              bsf: <G k="band-stop" />,
              hpf: <G k="high-pass" />,
              lpf: <G k="low-pass" />,
            }}
          />
        </p>
        <p>
          <Trans
            i18nKey="ch1_8.keyTakeaway2"
            ns="ui"
            components={{ ...mathComponents, strong: <strong />, nowrap: nowrap }}
          />
        </p>
        <p>
          <Trans
            i18nKey="ch1_8.keyTakeaway3"
            ns="ui"
            components={{
              ...mathComponents,
              strong: <strong />,
              db: <G k="decibel" />,
              dec: <G k="decade" />,
            }}
          />
        </p>
        <p>
          <Trans
            i18nKey="ch1_8.keyTakeaway4"
            ns="ui"
            components={{
              strong: <strong />,
              bpf: <G k="band-pass" />,
              bsf: <G k="band-stop" />,
            }}
          />
        </p>
        <p>
          <Trans
            i18nKey="ch1_8.keyTakeaway5"
            ns="ui"
            components={{
              strong: <strong />,
              bes: <G k="bessel" />,
              bw: <G k="butterworth" />,
              cb: <G k="chebyshev" />,
              ell: <G k="elliptic" />,
            }}
          />
        </p>
      </Callout>

      {/* ── Lab ────────────────────────────────────────────────── */}
      <LabActivity
        label="1.8"
        goal={t('ch1_8.labGoal')}
        equipment={[
          <Trans key="e1" i18nKey="ch1_8.labEquip1" ns="ui" components={{ vna: <G k="vna" /> }} />,
          <Trans key="e2" i18nKey="ch1_8.labEquip2" ns="ui" components={{ breadboard: <G k="breadboard" /> }} />,
          t('ch1_8.labEquip3'),
          t('ch1_8.labEquip4'),
        ]}
        components={[
          <Trans key="c1" i18nKey="ch1_8.labComp1" ns="ui" components={{ strong: <strong /> }} />,
          <Trans key="c2" i18nKey="ch1_8.labComp2" ns="ui" components={{ strong: <strong /> }} />,
          <Trans key="c3" i18nKey="ch1_8.labComp3" ns="ui" components={{ strong: <strong /> }} />,
        ]}
        procedure={[
          { text: <Trans i18nKey="ch1_8.labStep1" ns="ui" components={{ ...mathComponents, nowrap: nowrap }} /> },
          {
            text: <Trans i18nKey="ch1_8.labStep2" ns="ui" components={{ ...mathComponents, strong: <strong /> }} />,
            diagram: <RcLpfLabSchematic />,
          },
          { text: <Trans i18nKey="ch1_8.labStep3" ns="ui" components={{ ...mathComponents }} /> },
          { text: t('ch1_8.labStep4') },
          { text: <Trans i18nKey="ch1_8.labStep5" ns="ui" components={{ ...mathComponents }} /> },
          { text: <Trans i18nKey="ch1_8.labStep6" ns="ui" components={{ ...mathComponents }} /> },
        ]}
        expectedResult={
          <Trans
            i18nKey="ch1_8.labExpected"
            ns="ui"
            components={{ ...mathComponents }}
          />
        }
        connectionToTheory={t('ch1_8.labConnection')}
        troubleshooting={[
          <Trans key="t1" i18nKey="ch1_8.labTrouble1" ns="ui" components={{ strong: <strong />, inductance: <G k="inductance" /> }} />,
          <Trans key="t2" i18nKey="ch1_8.labTrouble2" ns="ui" components={{ ...mathComponents, strong: <strong /> }} />,
          <Trans key="t3" i18nKey="ch1_8.labTrouble3" ns="ui" components={{ ...mathComponents, strong: <strong /> }} />,
        ]}
      />

      {/* ── Quiz ───────────────────────────────────────────────── */}
      <Quiz
        title={t('ch1_8.quizTitle')}
        storageKey={STORAGE_KEYS.quizProgress(CHAPTER_ID)}
        questions={quizQuestions}
      />
    </>
  )
}
