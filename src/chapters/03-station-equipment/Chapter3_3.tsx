// Chapter 3.3 — Antennas and Transmission Lines
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
import DipoleCurrentVoltage from '@/components/diagrams/DipoleCurrentVoltage'
import AntennaTypesGallery from '@/components/diagrams/AntennaTypesGallery'
import GainPolarPatterns from '@/components/diagrams/GainPolarPatterns'
import CoaxVsTwinLead from '@/components/diagrams/CoaxVsTwinLead'
import LcLadderLine from '@/components/diagrams/LcLadderLine'
import AntennaSystemBlock from '@/components/diagrams/AntennaSystemBlock'
import DipoleLengthCalculator from '@/components/widgets/DipoleLengthCalculator'
import ErpCalculator from '@/components/widgets/ErpCalculator'
import SwrExplorer from '@/components/widgets/SwrExplorer'
import DipoleRadiation from '@/components/widgets/DipoleRadiation'

const CHAPTER_ID = '3-3'
const QUIZ_QUESTION_COUNT = 10

const LINES_ROWS = ['r1', 'r2', 'r3', 'r4', 'r5'] as const
const SWR_ROWS = ['r1', 'r2', 'r3', 'r4'] as const
const CHOOSE_ROWS = ['r1', 'r2', 'r3', 'r4'] as const

export default function Chapter3_3() {
  const { t } = useTranslation('ui')

  const quizQuestions = useMemo(
    () => buildQuizFromI18n(t, 'ch3_3', QUIZ_QUESTION_COUNT, {
      strong: <strong />,
      em: <em />,
      var: <MathVar />,
    }),
    [t],
  )


  return (
    <>
      {/* ── Intro ──────────────────────────────────────────────── */}
      <p><Trans i18nKey="ch3_3.intro1" ns="ui" components={{ ...mathComponents, ant: <G k="antenna" /> }} /></p>
      <p><Trans i18nKey="ch3_3.intro2" ns="ui" components={{ ...mathComponents, strong: <strong />, em: <em />, balun: <G k="balun" />, feeder: <G k="feeder" />, reson: <G k="resonance" />, swr: <G k="swr" /> }} /></p>

      {/* ── §1 What an antenna does ────────────────────────────── */}
      <Section id="transducer" labelKey="ch3_3.sectionTransducer" />
      <p><Trans i18nKey="ch3_3.transducerP1" ns="ui" components={{ ...mathComponents, strong: <strong />, radio: <G k="radio wave" /> }} /></p>
      <p><Trans i18nKey="ch3_3.transducerP2" ns="ui" components={{ ...mathComponents, strong: <strong />, em: <em /> }} /></p>
      <DipoleRadiation />
      <p><Trans i18nKey="ch3_3.transducerP2b" ns="ui" components={{ ...mathComponents, dipole: <G k="dipole" />, sw: <G k="standing wave" /> }} /></p>
      <DipoleCurrentVoltage />
      <p><Trans i18nKey="ch3_3.transducerP3" ns="ui" components={{ ...mathComponents, radres: <G k="radiation resistance" /> }} /></p>
      <Callout variant="key">
        <p><Trans i18nKey="ch3_3.transducerKey" ns="ui" components={{ ...mathComponents, strong: <strong /> }} /></p>
      </Callout>

      {/* ── §2 Resonance & the dipole ──────────────────────────── */}
      <Section id="resonance" labelKey="ch3_3.sectionResonance" />
      <p><Trans i18nKey="ch3_3.resonanceP1" ns="ui" components={{ ...mathComponents, em: <em />, dipole: <G k="dipole" />, reson: <G k="resonance" />, wl: <G k="wavelength" /> }} /></p>
      <p><Trans i18nKey="ch3_3.resonanceP2" ns="ui" components={{ ...mathComponents, strong: <strong /> }} /></p>
      <Callout variant="math">
        <p><Trans i18nKey="ch3_3.resonanceFormula" ns="ui" components={{ ...mathComponents }} /></p>
      </Callout>
      <p><Trans i18nKey="ch3_3.resonanceP3" ns="ui" components={{ ...mathComponents, strong: <strong /> }} /></p>
      <DipoleLengthCalculator />
      <p><Trans i18nKey="ch3_3.resonanceP4" ns="ui" components={{ ...mathComponents, react: <G k="reactance" />, swr: <G k="swr" /> }} /></p>
      <Callout variant="key">
        <p><Trans i18nKey="ch3_3.resonanceKey" ns="ui" components={{ ...mathComponents, strong: <strong />, dbd: <G k="dbd" /> }} /></p>
      </Callout>

      {/* ── §3 A family of antennas ────────────────────────────── */}
      <Section id="types" labelKey="ch3_3.sectionTypes" />
      <p><Trans i18nKey="ch3_3.typesP1" ns="ui" components={{ ...mathComponents }} /></p>
      <p><Trans i18nKey="ch3_3.typesP2" ns="ui" components={{ ...mathComponents, strong: <strong />, gp: <G k="ground plane" />, mono: <G k="monopole" />, pol: <G k="polarisation" />, radial: <G k="radial" /> }} /></p>
      <p><Trans i18nKey="ch3_3.typesP3" ns="ui" components={{ ...mathComponents, strong: <strong />, efhw: <G k="efhw" />, qrp: <G k="qrp" />, unun: <G k="unun" /> }} /></p>
      <p><Trans i18nKey="ch3_3.typesP4" ns="ui" components={{ ...mathComponents, strong: <strong />, em: <em />, driven: <G k="driven element" />, parasitic: <G k="parasitic element" /> }} /></p>
      <AntennaTypesGallery />
      <Callout variant="tip">
        <p><Trans i18nKey="ch3_3.typesTip" ns="ui" components={{ ...mathComponents, strong: <strong /> }} /></p>
      </Callout>

      {/* ── §4 Pattern & gain ──────────────────────────────────── */}
      <Section id="gain" labelKey="ch3_3.sectionGain" />
      <p><Trans i18nKey="ch3_3.gainP1" ns="ui" components={{ ...mathComponents, strong: <strong />, em: <em /> }} /></p>
      <p><Trans i18nKey="ch3_3.gainP2" ns="ui" components={{ ...mathComponents, strong: <strong />, em: <em />, radpat: <G k="radiation pattern" /> }} /></p>
      <GainPolarPatterns />
      <p><Trans i18nKey="ch3_3.gainP3" ns="ui" components={{ ...mathComponents, dbd: <G k="dbd" />, dbi: <G k="dbi" />, iso: <G k="isotropic" /> }} /></p>
      <Callout variant="math">
        <p><Trans i18nKey="ch3_3.gainFormula" ns="ui" components={{ ...mathComponents, dbd: <G k="dbd" />, dbi: <G k="dbi" /> }} /></p>
      </Callout>
      <p><Trans i18nKey="ch3_3.gainP4" ns="ui" components={{ ...mathComponents, strong: <strong />, em: <em />, eirp: <G k="eirp" />, erp: <G k="erp" /> }} /></p>
      <Callout variant="math">
        <p><Trans i18nKey="ch3_3.gainErpFormula" ns="ui" components={{ ...mathComponents, erp: <G k="erp" /> }} /></p>
      </Callout>
      <p><Trans i18nKey="ch3_3.gainP5" ns="ui" components={{ ...mathComponents, strong: <strong /> }} /></p>
      <ErpCalculator />
      <Callout variant="key">
        <p><Trans i18nKey="ch3_3.gainKey" ns="ui" components={{ ...mathComponents, strong: <strong /> }} /></p>
      </Callout>

      {/* ── §5 Transmission lines ──────────────────────────────── */}
      <Section id="lines" labelKey="ch3_3.sectionLines" />
      <p><Trans i18nKey="ch3_3.linesP1" ns="ui" components={{ ...mathComponents, feeder: <G k="feeder" /> }} /></p>
      <p><Trans i18nKey="ch3_3.linesP2" ns="ui" components={{ ...mathComponents, strong: <strong />, coax: <G k="coax" />, ladder: <G k="ladder line" />, twin: <G k="twin-lead" /> }} /></p>
      <CoaxVsTwinLead />
      <p><Trans i18nKey="ch3_3.linesP2b" ns="ui" components={{ ...mathComponents, em: <em /> }} /></p>
      <p><Trans i18nKey="ch3_3.linesP3" ns="ui" components={{ ...mathComponents, ci: <G k="characteristic impedance" /> }} /></p>
      <LcLadderLine />
      <p><Trans i18nKey="ch3_3.linesP3b" ns="ui" components={{ ...mathComponents, em: <em /> }} /></p>
      <p><Trans i18nKey="ch3_3.linesP4" ns="ui" components={{ ...mathComponents, em: <em />, vf: <G k="velocity factor" /> }} /></p>
      <DiagramFigure caption={t('ch3_3.linesTable.caption')}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse text-foreground">
            <thead>
              <tr className="border-b-2 border-border">
                <th className="text-left py-2 px-3 font-semibold">{t('ch3_3.linesTable.hType')}</th>
                <th className="text-left py-2 px-3 font-semibold">{t('ch3_3.linesTable.hZ0')}</th>
                <th className="text-left py-2 px-3 font-semibold">{t('ch3_3.linesTable.hVf')}</th>
                <th className="text-left py-2 px-3 font-semibold">{t('ch3_3.linesTable.hNote')}</th>
              </tr>
            </thead>
            <tbody>
              {LINES_ROWS.map(r => (
                <tr key={r} className="border-b border-border/40 align-top">
                  <th scope="row" className="text-left py-2 px-3 font-semibold whitespace-nowrap">{t(`ch3_3.linesTable.${r}Type`)}</th>
                  <td className="py-2 px-3 font-mono whitespace-nowrap">{t(`ch3_3.linesTable.${r}Z0`)}</td>
                  <td className="py-2 px-3 font-mono">{t(`ch3_3.linesTable.${r}Vf`)}</td>
                  <td className="py-2 px-3">{t(`ch3_3.linesTable.${r}Note`)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DiagramFigure>
      <p><Trans i18nKey="ch3_3.linesP5" ns="ui" components={{ ...mathComponents, uhf: <G k="uhf" />, vhf: <G k="vhf" /> }} /></p>

      {/* ── §6 SWR & matching ──────────────────────────────────── */}
      <Section id="swr" labelKey="ch3_3.sectionSwr" />
      <p><Trans i18nKey="ch3_3.swrP1" ns="ui" components={{ ...mathComponents, sw: <G k="standing wave" /> }} /></p>
      <p><Trans i18nKey="ch3_3.swrP2" ns="ui" components={{ ...mathComponents, em: <em />, gamma: <G k="reflection coefficient" />, swr: <G k="swr" />, rl: <G k="return loss" /> }} /></p>
      <p><Trans i18nKey="ch3_3.swrP3" ns="ui" components={{ ...mathComponents, hf: <G k="hf" /> }} /></p>
      <DiagramFigure caption={t('ch3_3.swrTable.caption')}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse text-foreground">
            <thead>
              <tr className="border-b-2 border-border">
                <th className="text-left py-2 px-3 font-semibold">{t('ch3_3.swrTable.hSwr')}</th>
                <th className="text-left py-2 px-3 font-semibold">
                  {t('ch3_3.swrTable.hGamma')} |<MathVar>{'\\Gamma'}</MathVar>|
                </th>
                <th className="text-left py-2 px-3 font-semibold">{t('ch3_3.swrTable.hPower')}</th>
                <th className="text-left py-2 px-3 font-semibold">{t('ch3_3.swrTable.hVerdict')}</th>
              </tr>
            </thead>
            <tbody>
              {SWR_ROWS.map(r => (
                <tr key={r} className="border-b border-border/40 align-top">
                  <th scope="row" className="text-left py-2 px-3 font-mono font-semibold whitespace-nowrap">{t(`ch3_3.swrTable.${r}Swr`)}</th>
                  <td className="py-2 px-3 font-mono">{t(`ch3_3.swrTable.${r}Gamma`)}</td>
                  <td className="py-2 px-3 font-mono">{t(`ch3_3.swrTable.${r}Power`)}</td>
                  <td className="py-2 px-3">{t(`ch3_3.swrTable.${r}Verdict`)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DiagramFigure>
      <p><Trans i18nKey="ch3_3.swrP4" ns="ui" components={{ ...mathComponents }} /></p>
      <SwrExplorer />
      <Callout variant="caution">
        <p><Trans i18nKey="ch3_3.swrP5" ns="ui" components={{ ...mathComponents, strong: <strong />, em: <em />, dload: <G k="dummy load" /> }} /></p>
      </Callout>
      <Callout variant="key">
        <p><Trans i18nKey="ch3_3.swrKey" ns="ui" components={{ ...mathComponents, strong: <strong /> }} /></p>
      </Callout>

      {/* ── §7 Baluns & the ATU ────────────────────────────────── */}
      <Section id="matching" labelKey="ch3_3.sectionMatching" />
      <p><Trans i18nKey="ch3_3.matchingP1" ns="ui" components={{ ...mathComponents, strong: <strong />, em: <em />, cm: <G k="common-mode current" /> }} /></p>
      <p><Trans i18nKey="ch3_3.matchingP2" ns="ui" components={{ ...mathComponents, strong: <strong />, em: <em />, balun: <G k="balun" />, choke: <G k="choke" />, efhw: <G k="efhw" />, unun: <G k="unun" /> }} /></p>
      <p><Trans i18nKey="ch3_3.matchingP3" ns="ui" components={{ ...mathComponents, strong: <strong />, em: <em />, atu: <G k="antenna tuner" />, imp: <G k="impedance" /> }} /></p>
      <AntennaSystemBlock />
      <ul className="list-disc pl-6 space-y-1 text-foreground">
        <li>{t('ch3_3.matchingList.notTune')}</li>
        <li>{t('ch3_3.matchingList.notSwr')}</li>
        <li>{t('ch3_3.matchingList.notLoss')}</li>
      </ul>
      <p><Trans i18nKey="ch3_3.matchingP4" ns="ui" components={{ ...mathComponents }} /></p>
      <Callout variant="key">
        <p><Trans i18nKey="ch3_3.matchingKey" ns="ui" components={{ ...mathComponents, strong: <strong /> }} /></p>
      </Callout>

      {/* ── §8 The whole system ────────────────────────────────── */}
      <Section id="system" labelKey="ch3_3.sectionSystem" />
      <p><Trans i18nKey="ch3_3.systemP1" ns="ui" components={{ ...mathComponents, strong: <strong />, atu: <G k="antenna tuner" />, balun: <G k="balun" />, ci: <G k="characteristic impedance" /> }} /></p>
      <p><Trans i18nKey="ch3_3.systemP2" ns="ui" components={{ ...mathComponents, strong: <strong /> }} /></p>
      <DiagramFigure caption={t('ch3_3.chooseTable.caption')}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse text-foreground">
            <thead>
              <tr className="border-b-2 border-border">
                <th className="text-left py-2 px-3 font-semibold">{t('ch3_3.chooseTable.hAntenna')}</th>
                <th className="text-left py-2 px-3 font-semibold">{t('ch3_3.chooseTable.hPattern')}</th>
                <th className="text-left py-2 px-3 font-semibold">{t('ch3_3.chooseTable.hFeed')}</th>
                <th className="text-left py-2 px-3 font-semibold">{t('ch3_3.chooseTable.hBest')}</th>
              </tr>
            </thead>
            <tbody>
              {CHOOSE_ROWS.map(r => (
                <tr key={r} className="border-b border-border/40 align-top">
                  <th scope="row" className="text-left py-2 px-3 font-semibold whitespace-nowrap">{t(`ch3_3.chooseTable.${r}Antenna`)}</th>
                  <td className="py-2 px-3">{t(`ch3_3.chooseTable.${r}Pattern`)}</td>
                  <td className="py-2 px-3 font-mono whitespace-nowrap">{t(`ch3_3.chooseTable.${r}Feed`)}</td>
                  <td className="py-2 px-3">{t(`ch3_3.chooseTable.${r}Best`)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DiagramFigure>
      <p><Trans i18nKey="ch3_3.systemP3" ns="ui" components={{ ...mathComponents }} /></p>
      <Callout variant="key">
        <p><Trans i18nKey="ch3_3.systemKey" ns="ui" components={{ ...mathComponents, strong: <strong /> }} /></p>
      </Callout>

      {/* ── Lab ────────────────────────────────────────────────── */}
      <LabActivity
        label="3.3"
        goal={<Trans i18nKey="ch3_3.labGoal" ns="ui" components={{ ...mathComponents, swr: <G k="swr" />, vna: <G k="vna" /> }} />}
        equipment={[t('ch3_3.labEquip1'), t('ch3_3.labEquip2')]}
        components={[t('ch3_3.labComp1'), t('ch3_3.labComp2'), t('ch3_3.labComp3')]}
        procedure={[
          { text: <Trans i18nKey="ch3_3.labStep1" ns="ui" components={{ ...mathComponents, strong: <strong /> }} /> },
          { text: <Trans i18nKey="ch3_3.labStep2" ns="ui" components={{ ...mathComponents }} /> },
          { text: <Trans i18nKey="ch3_3.labStep3" ns="ui" components={{ ...mathComponents }} /> },
          { text: <Trans i18nKey="ch3_3.labStep4" ns="ui" components={{ ...mathComponents }} /> },
          { text: <Trans i18nKey="ch3_3.labStep5" ns="ui" components={{ ...mathComponents }} /> },
          { text: <Trans i18nKey="ch3_3.labStep6" ns="ui" components={{ ...mathComponents }} /> },
        ]}
        expectedResult={<Trans i18nKey="ch3_3.labExpected" ns="ui" components={{ ...mathComponents }} />}
        connectionToTheory={<Trans i18nKey="ch3_3.labConnection" ns="ui" components={{ ...mathComponents, em: <em /> }} />}
        troubleshooting={[t('ch3_3.labTrouble1'), t('ch3_3.labTrouble2'), t('ch3_3.labTrouble3')]}
      />

      {/* ── Quiz ───────────────────────────────────────────────── */}
      <Quiz
        title={t('ch3_3.quizTitle')}
        storageKey={STORAGE_KEYS.quizProgress(CHAPTER_ID)}
        questions={quizQuestions}
      />
    </>
  )
}
