// Chapter 3.4 — Measurements
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
import MultimeterDiagram from '@/components/diagrams/MultimeterDiagram'
import AnalogMeterDiagram from '@/components/diagrams/AnalogMeterDiagram'
import ShuntMultiplierSchematic from '@/components/diagrams/ShuntMultiplierSchematic'
import CrossNeedleMeter from '@/components/diagrams/CrossNeedleMeter'
import WavemeterDiagram from '@/components/diagrams/WavemeterDiagram'
import BenchMeasurementSchematic from '@/components/diagrams/BenchMeasurementSchematic'
import OscilloscopeDiagram from '@/components/diagrams/OscilloscopeDiagram'
import SwrToReflectedPower from '@/components/widgets/SwrToReflectedPower'
import RfPowerCalculator from '@/components/widgets/RfPowerCalculator'
import DbCalculator from '@/components/widgets/DbCalculator'

const CHAPTER_ID = '3-4'
const QUIZ_QUESTION_COUNT = 10

const SWR_ROWS = ['r1', 'r2', 'r3', 'r4'] as const
const INSTR_ROWS = ['r1', 'r2', 'r3', 'r4', 'r5', 'r6'] as const

export default function Chapter3_4() {
  const { t } = useTranslation('ui')

  const quizQuestions = useMemo(
    () => buildQuizFromI18n(t, 'ch3_4', QUIZ_QUESTION_COUNT, {
      strong: <strong />,
      em: <em />,
      var: <MathVar />,
    }),
    [t],
  )

  return (
    <>
      {/* ── Intro ──────────────────────────────────────────────── */}
      <p><Trans i18nKey="ch3_4.intro1" ns="ui" components={{ ...mathComponents, strong: <strong /> }} /></p>
      <p><Trans i18nKey="ch3_4.intro2" ns="ui" components={{ ...mathComponents, mm: <G k="multimeter" />, swr: <G k="swr" />, wm: <G k="wavemeter" />, dl: <G k="dummy load" /> }} /></p>

      {/* ── §1 Digital multimeter ──────────────────────────────── */}
      <Section id="multimeter" labelKey="ch3_4.sectionMultimeter" />
      <p><Trans i18nKey="ch3_4.mmP1" ns="ui" components={{ ...mathComponents, strong: <strong />, mm: <G k="multimeter" /> }} /></p>
      <p><Trans i18nKey="ch3_4.mmP2" ns="ui" components={{ ...mathComponents, strong: <strong /> }} /></p>
      <MultimeterDiagram />
      <Callout variant="danger">
        <p><Trans i18nKey="ch3_4.mmDanger" ns="ui" components={{ ...mathComponents, em: <em /> }} /></p>
      </Callout>
      <p><Trans i18nKey="ch3_4.mmP3" ns="ui" components={{ ...mathComponents, strong: <strong /> }} /></p>
      <p><Trans i18nKey="ch3_4.mmP4" ns="ui" components={{ ...mathComponents, strong: <strong />, ii: <G k="input impedance" />, vd: <G k="voltage divider" /> }} /></p>
      <Callout variant="note">
        <p><Trans i18nKey="ch3_4.mmTrueRms" ns="ui" components={{ ...mathComponents, strong: <strong />, em: <em />, trms: <G k="true rms" />, acw: <G k="ac" />, dcw: <G k="dc" /> }} /></p>
      </Callout>
      <Callout variant="key">
        <p><Trans i18nKey="ch3_4.mmKey" ns="ui" components={{ ...mathComponents }} /></p>
      </Callout>

      {/* ── §2 Analog meter ────────────────────────────────────── */}
      <Section id="analog" labelKey="ch3_4.sectionAnalog" />
      <p><Trans i18nKey="ch3_4.anP1" ns="ui" components={{ ...mathComponents, strong: <strong /> }} /></p>
      <AnalogMeterDiagram />
      <p><Trans i18nKey="ch3_4.analogMeterCaptionLead" ns="ui" components={{ ...mathComponents }} /></p>
      <p><Trans i18nKey="ch3_4.anP2" ns="ui" components={{ ...mathComponents, strong: <strong />, em: <em /> }} /></p>
      <ShuntMultiplierSchematic />
      <p><Trans i18nKey="ch3_4.anP3" ns="ui" components={{ ...mathComponents, strong: <strong />, sens: <G k="sensitivity" /> }} /></p>
      <p><Trans i18nKey="ch3_4.anP4" ns="ui" components={{ ...mathComponents, strong: <strong /> }} /></p>
      <Callout variant="key">
        <p><Trans i18nKey="ch3_4.anKey" ns="ui" components={{ ...mathComponents, em: <em /> }} /></p>
      </Callout>

      {/* ── §3 SWR meter ───────────────────────────────────────── */}
      <Section id="swr" labelKey="ch3_4.sectionSwr" />
      <p><Trans i18nKey="ch3_4.swrP1" ns="ui" components={{ ...mathComponents, strong: <strong />, swr: <G k="swr" /> }} /></p>
      <p><Trans i18nKey="ch3_4.crossNeedleLead" ns="ui" components={{ ...mathComponents }} /></p>
      <CrossNeedleMeter />
      <p><Trans i18nKey="ch3_4.swrP2" ns="ui" components={{ ...mathComponents, gamma: <G k="reflection coefficient" /> }} /></p>
      <Callout variant="math">
        <p><Trans i18nKey="ch3_4.swrFormula" ns="ui" components={{ ...mathComponents, rl: <G k="return loss" /> }} /></p>
      </Callout>
      <p><Trans i18nKey="ch3_4.swrP3" ns="ui" components={{ ...mathComponents, strong: <strong /> }} /></p>
      <DiagramFigure caption={t('ch3_4.swrTable.caption')}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse text-foreground">
            <thead>
              <tr className="border-b-2 border-border">
                <th className="text-left py-2 px-3 font-semibold">{t('ch3_4.swrTable.hSwr')}</th>
                <th className="text-left py-2 px-3 font-semibold">
                  {t('ch3_4.swrTable.hGamma')} |<MathVar>{'\\Gamma'}</MathVar>|
                </th>
                <th className="text-left py-2 px-3 font-semibold">{t('ch3_4.swrTable.hPower')}</th>
                <th className="text-left py-2 px-3 font-semibold">{t('ch3_4.swrTable.hVerdict')}</th>
              </tr>
            </thead>
            <tbody>
              {SWR_ROWS.map(r => (
                <tr key={r} className="border-b border-border/40 align-top">
                  <th scope="row" className="text-left py-2 px-3 font-mono font-semibold whitespace-nowrap">{t(`ch3_4.swrTable.${r}Swr`)}</th>
                  <td className="py-2 px-3 font-mono">{t(`ch3_4.swrTable.${r}Gamma`)}</td>
                  <td className="py-2 px-3 font-mono">{t(`ch3_4.swrTable.${r}Power`)}</td>
                  <td className="py-2 px-3">{t(`ch3_4.swrTable.${r}Verdict`)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DiagramFigure>
      <p><Trans i18nKey="ch3_4.swrP4" ns="ui" components={{ ...mathComponents }} /></p>
      <SwrToReflectedPower />
      <p><Trans i18nKey="ch3_4.swrP5" ns="ui" components={{ ...mathComponents, strong: <strong /> }} /></p>
      <Callout variant="key">
        <p><Trans i18nKey="ch3_4.swrKey" ns="ui" components={{ ...mathComponents, em: <em />, vna: <G k="vna" />, react: <G k="reactance" /> }} /></p>
      </Callout>

      {/* ── §4 Wavemeter ───────────────────────────────────────── */}
      <Section id="wavemeter" labelKey="ch3_4.sectionWavemeter" />
      <p><Trans i18nKey="ch3_4.wmP1" ns="ui" components={{ ...mathComponents, strong: <strong />, em: <em />, wm: <G k="wavemeter" />, cap: <G k="capacitor" />, tc: <G k="tuned circuit" />, diode: <G k="diode" />, det: <G k="detector" /> }} /></p>
      <WavemeterDiagram />
      <p><Trans i18nKey="ch3_4.wmP2" ns="ui" components={{ ...mathComponents, em: <em />, fc: <G k="frequency counter" />, reson: <G k="resonance" /> }} /></p>
      <Callout variant="key">
        <p><Trans i18nKey="ch3_4.wmKey" ns="ui" components={{ ...mathComponents }} /></p>
      </Callout>

      {/* ── §5 Dummy load + RF power ────────────────────────────── */}
      <Section id="dummy" labelKey="ch3_4.sectionDummy" />
      <p><Trans i18nKey="ch3_4.dlP1" ns="ui" components={{ ...mathComponents, strong: <strong />, dl: <G k="dummy load" />, res: <G k="resistor" /> }} /></p>
      <p><Trans i18nKey="ch3_4.dlP2" ns="ui" components={{ ...mathComponents, strong: <strong />, indc: <G k="inductance" /> }} /></p>
      <p><Trans i18nKey="ch3_4.benchLead" ns="ui" components={{ ...mathComponents }} /></p>
      <BenchMeasurementSchematic />
      <Callout variant="onair">
        <p><Trans i18nKey="ch3_4.dlDanger" ns="ui" components={{ ...mathComponents }} /></p>
      </Callout>
      <p><Trans i18nKey="ch3_4.rfP1" ns="ui" components={{ ...mathComponents, rms: <G k="rms" /> }} /></p>
      <Callout variant="math">
        <p><Trans i18nKey="ch3_4.rfFormula" ns="ui" components={{ ...mathComponents }} /></p>
      </Callout>
      <p><Trans i18nKey="ch3_4.rfP1b" ns="ui" components={{ ...mathComponents }} /></p>
      <p><Trans i18nKey="ch3_4.scopeLead" ns="ui" components={{ ...mathComponents }} /></p>
      <OscilloscopeDiagram />
      <RfPowerCalculator />
      <p><Trans i18nKey="ch3_4.rfP2" ns="ui" components={{ ...mathComponents, pep: <G k="pep" />, mod: <G k="modulation" />, env: <G k="envelope" />, cw: <G k="cw" />, ssb: <G k="ssb" />, fm: <G k="fm" /> }} /></p>
      <p><Trans i18nKey="ch3_4.rfP3" ns="ui" components={{ ...mathComponents, dbm: <G k="dbm" /> }} /></p>
      <DbCalculator />
      <Callout variant="key">
        <p><Trans i18nKey="ch3_4.rfKey" ns="ui" components={{ ...mathComponents }} /></p>
      </Callout>

      {/* ── §6 Cross-check ─────────────────────────────────────── */}
      <Section id="system" labelKey="ch3_4.sectionSystem" />
      <p><Trans i18nKey="ch3_4.sysP1" ns="ui" components={{ ...mathComponents, imp: <G k="impedance" /> }} /></p>
      <p><Trans i18nKey="ch3_4.instrTableLead" ns="ui" components={{ ...mathComponents }} /></p>
      <DiagramFigure caption={t('ch3_4.instrTable.caption')}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse text-foreground">
            <thead>
              <tr className="border-b-2 border-border">
                <th className="text-left py-2 px-3 font-semibold">{t('ch3_4.instrTable.hInstr')}</th>
                <th className="text-left py-2 px-3 font-semibold">{t('ch3_4.instrTable.hMeasures')}</th>
                <th className="text-left py-2 px-3 font-semibold">{t('ch3_4.instrTable.hWatch')}</th>
              </tr>
            </thead>
            <tbody>
              {INSTR_ROWS.map(r => (
                <tr key={r} className="border-b border-border/40 align-top">
                  <th scope="row" className="text-left py-2 px-3 font-semibold whitespace-nowrap">{t(`ch3_4.instrTable.${r}Instr`)}</th>
                  <td className="py-2 px-3">{t(`ch3_4.instrTable.${r}Measures`)}</td>
                  <td className="py-2 px-3">{t(`ch3_4.instrTable.${r}Watch`)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DiagramFigure>
      <Callout variant="key">
        <p><Trans i18nKey="ch3_4.sysKey" ns="ui" components={{ ...mathComponents }} /></p>
      </Callout>

      {/* ── Lab ────────────────────────────────────────────────── */}
      <LabActivity
        label="3.4"
        goal={<Trans i18nKey="ch3_4.labGoal" ns="ui" components={{ ...mathComponents }} />}
        equipment={[t('ch3_4.labEquip1'), t('ch3_4.labEquip2')]}
        components={[t('ch3_4.labComp1'), t('ch3_4.labComp2'), t('ch3_4.labComp3')]}
        procedure={[
          { text: <Trans i18nKey="ch3_4.labStep1" ns="ui" components={{ ...mathComponents, strong: <strong /> }} /> },
          { text: <Trans i18nKey="ch3_4.labStep2" ns="ui" components={{ ...mathComponents, strong: <strong /> }} /> },
          { text: <Trans i18nKey="ch3_4.labStep3" ns="ui" components={{ ...mathComponents, strong: <strong /> }} /> },
          { text: <Trans i18nKey="ch3_4.labStep4" ns="ui" components={{ ...mathComponents, strong: <strong /> }} /> },
          { text: <Trans i18nKey="ch3_4.labStep5" ns="ui" components={{ ...mathComponents, strong: <strong /> }} /> },
          { text: <Trans i18nKey="ch3_4.labStep6" ns="ui" components={{ ...mathComponents, strong: <strong /> }} /> },
        ]}
        expectedResult={<Trans i18nKey="ch3_4.labExpected" ns="ui" components={{ ...mathComponents }} />}
        connectionToTheory={<Trans i18nKey="ch3_4.labConnection" ns="ui" components={{ ...mathComponents }} />}
        troubleshooting={[
          <Trans key="t1" i18nKey="ch3_4.labTrouble1" ns="ui" components={{ ...mathComponents }} />,
          <Trans key="t2" i18nKey="ch3_4.labTrouble2" ns="ui" components={{ ...mathComponents }} />,
          <Trans key="t3" i18nKey="ch3_4.labTrouble3" ns="ui" components={{ ...mathComponents }} />,
        ]}
      />

      {/* ── Quiz ───────────────────────────────────────────────── */}
      <Quiz
        title={t('ch3_4.quizTitle')}
        storageKey={STORAGE_KEYS.quizProgress(CHAPTER_ID)}
        questions={quizQuestions}
      />
    </>
  )
}
