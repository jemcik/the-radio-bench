// Chapter 4.1 — Frequency Spectrum and Propagation
import { useMemo } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { Section } from '@/components/ui/section-heading'
import { Callout } from '@/components/ui/callout'
import { G } from '@/features/glossary/glossary-term'
import { MathVar } from '@/components/ui/math'
import { mathComponents } from '@/lib/trans-defaults'
import DiagramFigure from '@/components/diagrams/DiagramFigure'
import LabActivity from '@/components/lab/LabActivity'
import Quiz, { buildQuizFromI18n } from '@/components/quiz/Quiz'
import { STORAGE_KEYS } from '@/lib/storage-keys'
import ThreeModesDiagram from '@/components/diagrams/ThreeModesDiagram'
import IonosphereLayersDiagram from '@/components/diagrams/IonosphereLayersDiagram'
import SkipGeometryDiagram from '@/components/diagrams/SkipGeometryDiagram'
import FadingDiagram from '@/components/diagrams/FadingDiagram'
import TroposphericDuctDiagram from '@/components/diagrams/TroposphericDuctDiagram'
import SunspotCycleDiagram from '@/components/diagrams/SunspotCycleDiagram'
import RadioHorizonCalculator from '@/components/widgets/RadioHorizonCalculator'
import MufSkipExplorer from '@/components/widgets/MufSkipExplorer'
import BandConditions from '@/components/widgets/BandConditions'

const CHAPTER_ID = '4-1'
const QUIZ_QUESTION_COUNT = 10

const BAND_ROWS = ['r1', 'r2', 'r3', 'r4', 'r5', 'r6', 'r7'] as const

export default function Chapter4_1() {
  const { t } = useTranslation('ui')

  const quizQuestions = useMemo(
    () => buildQuizFromI18n(t, 'ch4_1', QUIZ_QUESTION_COUNT, {
      strong: <strong />,
      em: <em />,
      var: <MathVar />,
    }),
    [t],
  )

  return (
    <>
      {/* ── Intro ──────────────────────────────────────────────── */}
      <p><Trans i18nKey="ch4_1.intro1" ns="ui" components={{ ...mathComponents, strong: <strong /> }} /></p>
      <p><Trans i18nKey="ch4_1.intro2" ns="ui" components={{ ...mathComponents, fad: <G k="fading" />, iono: <G k="ionosphere" />, sun: <G k="sunspot" />, vhf: <G k="vhf" /> }} /></p>

      {/* ── §1 Three modes ─────────────────────────────────────── */}
      <Section id="modes" labelKey="ch4_1.sectionModes" />
      <p><Trans i18nKey="ch4_1.modesP1" ns="ui" components={{ ...mathComponents }} /></p>
      <p><Trans i18nKey="ch4_1.modesP2" ns="ui" components={{ ...mathComponents, strong: <strong />, am: <G k="am" />, gw: <G k="ground wave" /> }} /></p>
      <p><Trans i18nKey="ch4_1.modesP3" ns="ui" components={{ ...mathComponents, sp: <G k="space wave" />, uhf: <G k="uhf" />, vhf: <G k="vhf" /> }} /></p>
      <ThreeModesDiagram />
      <p><Trans i18nKey="ch4_1.horizonLead" ns="ui" components={{ ...mathComponents }} /></p>
      <Callout variant="math">
        <p><Trans i18nKey="ch4_1.horizonFormula" ns="ui" components={{ ...mathComponents }} /></p>
      </Callout>
      <p><Trans i18nKey="ch4_1.horizonP1" ns="ui" components={{ ...mathComponents, strong: <strong />, vhf: <G k="vhf" />, rp: <G k="repeater" /> }} /></p>
      <RadioHorizonCalculator />
      <p><Trans i18nKey="ch4_1.modesP4" ns="ui" components={{ ...mathComponents, em: <em />, hf: <G k="hf" />, sw: <G k="skywave" /> }} /></p>
      <Callout variant="key">
        <p><Trans i18nKey="ch4_1.modesKey" ns="ui" components={{ ...mathComponents }} /></p>
      </Callout>

      {/* ── §2 Ionosphere ──────────────────────────────────────── */}
      <Section id="ionosphere" labelKey="ch4_1.sectionIonosphere" />
      <p><Trans i18nKey="ch4_1.ionoP1" ns="ui" components={{ ...mathComponents, iono: <G k="ionosphere" /> }} /></p>
      <p><Trans i18nKey="ch4_1.ionoLead" ns="ui" components={{ ...mathComponents }} /></p>
      <IonosphereLayersDiagram />
      <p><Trans i18nKey="ch4_1.ionoP2" ns="ui" components={{ ...mathComponents, em: <em />, strong: <strong />, hf: <G k="hf" /> }} /></p>
      <p><Trans i18nKey="ch4_1.ionoP3" ns="ui" components={{ ...mathComponents }} /></p>
      <p><Trans i18nKey="ch4_1.ionoP4" ns="ui" components={{ ...mathComponents, em: <em />, strong: <strong />, cf: <G k="critical frequency" /> }} /></p>
      <Callout variant="key">
        <p><Trans i18nKey="ch4_1.ionoKey" ns="ui" components={{ ...mathComponents }} /></p>
      </Callout>

      {/* ── §3 Skip ────────────────────────────────────────────── */}
      <Section id="skip" labelKey="ch4_1.sectionSkip" />
      <p><Trans i18nKey="ch4_1.skipP1" ns="ui" components={{ ...mathComponents, skd: <G k="skip distance" />, skz: <G k="skip zone" /> }} /></p>
      <SkipGeometryDiagram />
      <p><Trans i18nKey="ch4_1.skipP2" ns="ui" components={{ ...mathComponents, strong: <strong />, hop: <G k="hop" /> }} /></p>
      <p><Trans i18nKey="ch4_1.skipP3" ns="ui" components={{ ...mathComponents, muf: <G k="muf" />, luf: <G k="luf" /> }} /></p>
      <p><Trans i18nKey="ch4_1.mufLead" ns="ui" components={{ ...mathComponents }} /></p>
      <MufSkipExplorer />
      <Callout variant="tip">
        <p><Trans i18nKey="ch4_1.skipTip" ns="ui" components={{ ...mathComponents, strong: <strong /> }} /></p>
      </Callout>
      <Callout variant="key">
        <p><Trans i18nKey="ch4_1.skipKey" ns="ui" components={{ ...mathComponents }} /></p>
      </Callout>

      {/* ── §4 Fading ──────────────────────────────────────────── */}
      <Section id="fading" labelKey="ch4_1.sectionFading" />
      <p><Trans i18nKey="ch4_1.fadingP1" ns="ui" components={{ ...mathComponents, fad: <G k="fading" />, mp: <G k="multipath" />, qsb: <G k="qsb" /> }} /></p>
      <FadingDiagram />
      <p><Trans i18nKey="ch4_1.fadingP2" ns="ui" components={{ ...mathComponents, strong: <strong /> }} /></p>
      <Callout variant="key">
        <p><Trans i18nKey="ch4_1.fadingKey" ns="ui" components={{ ...mathComponents }} /></p>
      </Callout>

      {/* ── §5 Troposphere ─────────────────────────────────────── */}
      <Section id="troposphere" labelKey="ch4_1.sectionTropo" />
      <p><Trans i18nKey="ch4_1.tropoP1" ns="ui" components={{ ...mathComponents, trop: <G k="troposphere" />, uhf: <G k="uhf" />, vhf: <G k="vhf" /> }} /></p>
      <p><Trans i18nKey="ch4_1.tropoP2" ns="ui" components={{ ...mathComponents, strong: <strong />, duct: <G k="tropospheric ducting" />, uhf: <G k="uhf" />, vhf: <G k="vhf" /> }} /></p>
      <TroposphericDuctDiagram />
      <Callout variant="tip">
        <p><Trans i18nKey="ch4_1.tropoTip" ns="ui" components={{ ...mathComponents }} /></p>
      </Callout>
      <Callout variant="key">
        <p><Trans i18nKey="ch4_1.tropoKey" ns="ui" components={{ ...mathComponents }} /></p>
      </Callout>

      {/* ── §6 The sun ─────────────────────────────────────────── */}
      <Section id="sun" labelKey="ch4_1.sectionSun" />
      <p><Trans i18nKey="ch4_1.sunP1" ns="ui" components={{ ...mathComponents, strong: <strong />, sun: <G k="sunspot" /> }} /></p>
      <p><Trans i18nKey="ch4_1.sunP2" ns="ui" components={{ ...mathComponents, strong: <strong />, sfi: <G k="solar flux" />, dx: <G k="dx" /> }} /></p>
      <SunspotCycleDiagram />
      <p><Trans i18nKey="ch4_1.sunP3" ns="ui" components={{ ...mathComponents, strong: <strong /> }} /></p>
      <p><Trans i18nKey="ch4_1.conditionsLead" ns="ui" components={{ ...mathComponents }} /></p>
      <BandConditions />
      <Callout variant="note">
        <p><Trans i18nKey="ch4_1.sunNote" ns="ui" components={{ ...mathComponents }} /></p>
      </Callout>
      <Callout variant="key">
        <p><Trans i18nKey="ch4_1.sunKey" ns="ui" components={{ ...mathComponents }} /></p>
      </Callout>

      {/* ── §7 HF / VHF / UHF ranges ───────────────────────────── */}
      <Section id="ranges" labelKey="ch4_1.sectionRanges" />
      <p><Trans i18nKey="ch4_1.rangesP1" ns="ui" components={{ ...mathComponents, hf: <G k="hf" />, uhf: <G k="uhf" />, vhf: <G k="vhf" /> }} /></p>
      <p><Trans i18nKey="ch4_1.rangesLead" ns="ui" components={{ ...mathComponents, itu: <G k="itu" /> }} /></p>
      <DiagramFigure caption={t('ch4_1.bandTable.caption')}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse text-foreground">
            <thead>
              <tr className="border-b-2 border-border">
                <th className="text-left py-2 px-3 font-semibold">{t('ch4_1.bandTable.hBand')}</th>
                <th className="text-left py-2 px-3 font-semibold">{t('ch4_1.bandTable.hFreq')}</th>
                <th className="text-left py-2 px-3 font-semibold">{t('ch4_1.bandTable.hFreqR2')}</th>
                <th className="text-left py-2 px-3 font-semibold">{t('ch4_1.bandTable.hProp')}</th>
                <th className="text-left py-2 px-3 font-semibold">{t('ch4_1.bandTable.hUse')}</th>
              </tr>
            </thead>
            <tbody>
              {BAND_ROWS.map(r => (
                <tr key={r} className="border-b border-border/40 align-top">
                  <th scope="row" className="text-left py-2 px-3 font-mono font-semibold whitespace-nowrap">{t(`ch4_1.bandTable.${r}Band`)}</th>
                  <td className="py-2 px-3 font-mono whitespace-nowrap">{t(`ch4_1.bandTable.${r}Freq`)}</td>
                  <td className="py-2 px-3 font-mono whitespace-nowrap">{t(`ch4_1.bandTable.${r}FreqR2`)}</td>
                  <td className="py-2 px-3">{t(`ch4_1.bandTable.${r}Prop`)}</td>
                  <td className="py-2 px-3">{t(`ch4_1.bandTable.${r}Use`)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DiagramFigure>
      <p><Trans i18nKey="ch4_1.rangesP2" ns="ui" components={{ ...mathComponents }} /></p>
      <Callout variant="onair">
        <p><Trans i18nKey="ch4_1.rangesRegionOnair" ns="ui" components={{ ...mathComponents, cs: <G k="callsign" /> }} /></p>
      </Callout>
      <Callout variant="key">
        <p><Trans i18nKey="ch4_1.rangesKey" ns="ui" components={{ ...mathComponents }} /></p>
      </Callout>

      {/* ── Lab ────────────────────────────────────────────────── */}
      <LabActivity
        label="4.1"
        goal={<Trans i18nKey="ch4_1.labGoal" ns="ui" components={{ ...mathComponents }} />}
        equipment={[t('ch4_1.labEquip1'), t('ch4_1.labEquip2')]}
        components={[
          <Trans key="c1" i18nKey="ch4_1.labComp1" ns="ui" components={{ ...mathComponents, lb: <G k="logbook" /> }} />,
          t('ch4_1.labComp2'),
          t('ch4_1.labComp3'),
        ]}
        procedure={[
          { text: <Trans i18nKey="ch4_1.labStep1" ns="ui" components={{ ...mathComponents, strong: <strong /> }} /> },
          { text: <Trans i18nKey="ch4_1.labStep2" ns="ui" components={{ ...mathComponents, strong: <strong /> }} /> },
          { text: <Trans i18nKey="ch4_1.labStep3" ns="ui" components={{ ...mathComponents, strong: <strong /> }} /> },
          { text: <Trans i18nKey="ch4_1.labStep4" ns="ui" components={{ ...mathComponents, strong: <strong /> }} /> },
          { text: <Trans i18nKey="ch4_1.labStep5" ns="ui" components={{ ...mathComponents, strong: <strong /> }} /> },
        ]}
        expectedResult={<Trans i18nKey="ch4_1.labExpected" ns="ui" components={{ ...mathComponents }} />}
        connectionToTheory={<Trans i18nKey="ch4_1.labConnection" ns="ui" components={{ ...mathComponents }} />}
        troubleshooting={[
          <Trans key="t1" i18nKey="ch4_1.labTrouble1" ns="ui" components={{ ...mathComponents }} />,
          <Trans key="t2" i18nKey="ch4_1.labTrouble2" ns="ui" components={{ ...mathComponents }} />,
          <Trans key="t3" i18nKey="ch4_1.labTrouble3" ns="ui" components={{ ...mathComponents }} />,
        ]}
      />

      {/* ── Quiz ───────────────────────────────────────────────── */}
      <Quiz
        title={t('ch4_1.quizTitle')}
        storageKey={STORAGE_KEYS.quizProgress(CHAPTER_ID)}
        questions={quizQuestions}
      />
    </>
  )
}
