// Chapter 1.1 — What Is Electricity?
import { useMemo } from 'react'
import { useTranslation, Trans } from 'react-i18next'
import LabActivity from '@/components/lab/LabActivity'
import { Callout } from '@/components/ui/callout'
import { Section } from '@/components/ui/section-heading'
import { G } from '@/features/glossary/glossary-term'
import { MathVar } from '@/components/ui/math'
import {
  Circuit, Wire,
  Resistor, Battery, LED,
  pins2,
  SCHEMATIC_PAD_TOP,
  schematicHeight,
  type LegendEntry,
} from '@/lib/circuit'
import Quiz, { buildQuizFromI18n } from '@/components/quiz/Quiz'
import CurrentExplorer from '@/components/widgets/CurrentExplorer'
import WaterPipeDiagram from '@/components/diagrams/WaterPipeDiagram'
import DriftVelocitySketch from '@/components/diagrams/DriftVelocitySketch'
import MaterialsComparison from '@/components/diagrams/MaterialsComparison'
import MagnitudeLadder from '@/components/diagrams/MagnitudeLadder'
import ResistanceCollision from '@/components/diagrams/ResistanceCollision'
import AtomicDiagram from '@/components/diagrams/AtomicDiagram'
import { STORAGE_KEYS } from '@/lib/storage-keys'
import { useUnitFormatter, useLocaleFormatter } from '@/lib/hooks/useLocaleFormatter'
import { formatNumber } from '@/lib/format'
import { mathComponents } from '@/lib/trans-defaults'

const CHAPTER_ID = '1-1'
const QUIZ_QUESTION_COUNT = 8

// ─── Simple LED loop schematic for "Putting it together" ────────────────────
// Same layout as Ch 0.5's worked example — a 3 V battery pushing current
// through a resistor and LED, labelled with V, I, R so the reader sees the
// three quantities in their natural circuit roles.
const SCHEMATIC_W = 340
const RAIL_SPAN = 130
const TOP_Y = SCHEMATIC_PAD_TOP
const BOT_Y = TOP_Y + RAIL_SPAN
const SCHEMATIC_H = schematicHeight(RAIL_SPAN)
const LEFT_X = 60
const RIGHT_X = 280
const BAT_Y = (TOP_Y + BOT_Y) / 2
const bat = pins2(LEFT_X, BAT_Y, 'down')
const r1 = pins2(150, TOP_Y)
const led = pins2(230, TOP_Y)

function LedCircuit({ caption, legend }: { caption: string; legend: LegendEntry[] }) {
  return (
    <Circuit width={SCHEMATIC_W} height={SCHEMATIC_H} caption={caption} legend={legend}>
      <Wire points={[bat.p1, { x: LEFT_X, y: TOP_Y }, r1.p1]} />
      <Wire points={[r1.p2, led.p1]} />
      <Wire points={[
        led.p2,
        { x: RIGHT_X, y: TOP_Y },
        { x: RIGHT_X, y: BOT_Y },
        { x: LEFT_X,  y: BOT_Y },
        bat.p2,
      ]} />
      <Battery x={LEFT_X} y={BAT_Y} orient="down" label="V" value="3V" />
      <Resistor x={150} y={TOP_Y} label="R" />
      <LED x={230} y={TOP_Y} label="I" />
    </Circuit>
  )
}

export default function Chapter1_1() {
  const { t } = useTranslation('ui')
  const u = useUnitFormatter()
  const { locale } = useLocaleFormatter()
  const quizQuestions = useMemo(
    () => buildQuizFromI18n(t, 'ch1_1', QUIZ_QUESTION_COUNT, {
      nowrap: <span style={{ whiteSpace: 'nowrap' }} />,
    }),
    [t],
  )

  return (
    <>
      <p>
        <Trans i18nKey="ch1_1.intro" ns="ui"
          components={{ ...mathComponents, strong: <strong /> }}
        />
      </p>

      <p>{t('ch1_1.introPreview')}</p>

      {/* ── Section 1: The water-pipe picture ─────────────────────── */}
      <Section id="water" labelKey="ch1_1.sectionWater" />

      <p>{t('ch1_1.waterIntro')}</p>

      <WaterPipeDiagram />

      <ul>
        <li><Trans i18nKey="ch1_1.waterBullet1" ns="ui" components={{ ...mathComponents, strong: <strong /> }} /></li>
        <li><Trans i18nKey="ch1_1.waterBullet2" ns="ui" components={{ ...mathComponents, strong: <strong /> }} /></li>
        <li><Trans i18nKey="ch1_1.waterBullet3" ns="ui" components={{ ...mathComponents, strong: <strong />, res: <G k="resistor" /> }} /></li>
      </ul>

      <p>{t('ch1_1.waterPayoff')}</p>

      <Callout variant="note">
        <Trans i18nKey="ch1_1.waterBreaks" ns="ui" components={{ ...mathComponents, strong: <strong />, ac: <G k="ac" /> }} />
      </Callout>

      {/* ── Section 2: Charge ─────────────────────────────────────── */}
      <Section id="charge" labelKey="ch1_1.sectionCharge" />

      <p>
        <Trans i18nKey="ch1_1.chargeIntro" ns="ui"
          components={{ ...mathComponents, charge: <G k="charge" />, strong: <strong /> }}
        />
      </p>

      <p>
        <Trans i18nKey="ch1_1.chargeMagnitude" ns="ui"
          components={{ ...mathComponents, coulomb: <G k="coulomb" /> }}
        />
      </p>

      <AtomicDiagram />

      {/* ── Section 3: Current ────────────────────────────────────── */}
      <Section id="current" labelKey="ch1_1.sectionCurrent" />

      <p>
        <Trans i18nKey="ch1_1.currentIntro" ns="ui"
          components={{ current: <G k="current" />, ampere: <G k="ampere" />, var: <MathVar /> }}
        />
      </p>

      <p>
        <Trans i18nKey="ch1_1.currentDirection" ns="ui"
          components={{ ...mathComponents, strong: <strong /> }}
        />
      </p>

      <p>
        <Trans i18nKey="ch1_1.currentConvention" ns="ui"
          components={{ ...mathComponents, conventionalcurrent: <G k="conventional current" /> }}
        />
      </p>

      <Callout variant="note">
        <Trans i18nKey="ch1_1.currentFranklin" ns="ui" components={{ ...mathComponents, strong: <strong /> }} />
      </Callout>

      <p>{t('ch1_1.currentMagnitudes')}</p>

      <MagnitudeLadder
        title={t('ch1_1.currentLadderTitle')}
        ariaLabel={t('ch1_1.currentLadderAriaLabel')}
        caption={t('ch1_1.currentLadderCaption')}
        tone="note"
        items={[
          { value: 0.01,  label: `10 ${u('ma')}`, description: t('ch1_1.currentLadderLed') },
          { value: 0.02,  label: `20 ${u('ma')}`, description: t('ch1_1.currentLadderArduino') },
          { value: 2,     label: `1–3 ${u('a')}`, description: t('ch1_1.currentLadderCharger') },
          { value: 15,    label: `15 ${u('a')}`,  description: t('ch1_1.currentLadderFuse') },
          { value: 30000, label: `30 ${u('ka')}`, description: t('ch1_1.currentLadderLightning') },
        ]}
      />

      <Callout variant="key">
        <Trans i18nKey="ch1_1.currentDriftNote" ns="ui"
          components={{ ...mathComponents, drift: <G k="drift velocity" />, strong: <strong /> }}
        />
      </Callout>

      <DriftVelocitySketch />

      {/* ── Section 4: Voltage ────────────────────────────────────── */}
      <Section id="voltage" labelKey="ch1_1.sectionVoltage" />

      <p>
        <Trans i18nKey="ch1_1.voltageIntro" ns="ui"
          components={{ voltage: <G k="voltage" />, var: <MathVar />, nowrap: <span style={{ whiteSpace: 'nowrap' }} /> }}
        />
      </p>

      <p>
        <Trans i18nKey="ch1_1.voltageBetween" ns="ui"
          components={{ ...mathComponents, strong: <strong /> }}
        />
      </p>

      <p>
        <Trans i18nKey="ch1_1.voltageSources" ns="ui"
          components={{ ...mathComponents, strong: <strong /> }}
        />
      </p>

      <p>{t('ch1_1.voltageMagnitudes')}</p>

      <MagnitudeLadder
        title={t('ch1_1.voltageLadderTitle')}
        ariaLabel={t('ch1_1.voltageLadderAriaLabel')}
        caption={t('ch1_1.voltageLadderCaption')}
        tone="primary"
        items={[
          { value: 1.5,    label: `${formatNumber(1.5, locale)} ${u('v')}`,                       description: t('ch1_1.voltageLadderAA') },
          { value: 5,      label: `${formatNumber(3.3, locale)}–5 ${u('v')}`,                     description: t('ch1_1.voltageLadderLogic') },
          { value: 12,     label: `12 ${u('v')}`,                                                  description: t('ch1_1.voltageLadderCar') },
          { value: 230,    label: `230 ${u('v')}`,                                                 description: t('ch1_1.voltageLadderMains') },
          { value: 400000, label: `400 ${u('kv')}`,                                                description: t('ch1_1.voltageLadderTransmission') },
        ]}
      />

      <p>
        <Trans i18nKey="ch1_1.voltageEmfNote" ns="ui"
          components={{ ...mathComponents, emf: <G k="emf" /> }}
        />
      </p>

      {/* ── Section 5: Resistance ─────────────────────────────────── */}
      <Section id="resistance" labelKey="ch1_1.sectionResistance" />

      <p>
        <Trans i18nKey="ch1_1.resistanceIntro" ns="ui"
          components={{ resistance: <G k="resistance" />, ohm: <G k="ohm" />, var: <MathVar /> }}
        />
      </p>

      <p>{t('ch1_1.resistanceMechanism')}</p>

      <ResistanceCollision />

      <p>{t('ch1_1.resistanceMaterials')}</p>

      <ul>
        <li>
          <Trans i18nKey="ch1_1.resistanceCat1" ns="ui"
            components={{ ...mathComponents, strong: <strong />, conductor: <G k="conductor" /> }}
          />
        </li>
        <li>
          <Trans i18nKey="ch1_1.resistanceCat2" ns="ui"
            components={{ ...mathComponents, strong: <strong />, insulator: <G k="insulator" />, cap: <G k="capacitor" /> }}
          />
        </li>
        <li>
          <Trans i18nKey="ch1_1.resistanceCat3" ns="ui"
            components={{ ...mathComponents, strong: <strong />, semiconductor: <G k="semiconductor" /> }}
          />
        </li>
      </ul>

      <MaterialsComparison />

      <p>
        <Trans i18nKey="ch1_1.resistanceResistor" ns="ui"
          components={{ ...mathComponents, strong: <strong /> }}
        />
      </p>

      <p>{t('ch1_1.resistanceMagnitudes')}</p>

      <MagnitudeLadder
        title={t('ch1_1.resistanceLadderTitle')}
        ariaLabel={t('ch1_1.resistanceLadderAriaLabel')}
        caption={t('ch1_1.resistanceLadderCaption')}
        tone="caution"
        items={[
          { value: 0.005,  label: `5 ${u('milliohm')}`,  description: t('ch1_1.resistanceLadderWire') },
          { value: 1000,   label: `1 ${u('kohm')}`,      description: t('ch1_1.resistanceLadderLimiting') },
          { value: 10000,  label: `10 ${u('kohm')}`,     description: t('ch1_1.resistanceLadderPullup') },
          { value: 100000, label: `100 ${u('kohm')}`,    description: t('ch1_1.resistanceLadderSkin') },
        ]}
      />

      {/* ── Section 6: Putting it together ────────────────────────── */}
      <Section id="circuit" labelKey="ch1_1.sectionCircuit" />

      <p>{t('ch1_1.circuitIntro')}</p>

      <LedCircuit
        caption={t('ch1_1.circuitCaption')}
        legend={[
          { heading: t('ch1_1.circuitLegendQuantitiesTitle') },
          // Quantity letter lives in the swatch column, right-aligned there
          // so its right edge touches the grid gap and the descriptions in
          // the label column line up flush across rows. Using a plain
          // italic-serif span (not MathVar) on purpose — KaTeX adds internal
          // math spacing around single glyphs that would desync the letter
          // from the right edge of the column, breaking the alignment.
          { swatch: <span className="font-serif italic text-[15px] leading-none">V</span>, label: t('ch1_1.circuitLegendV') },
          { swatch: <span className="font-serif italic text-[15px] leading-none">R</span>, label: t('ch1_1.circuitLegendR') },
          { swatch: <span className="font-serif italic text-[15px] leading-none">I</span>, label: t('ch1_1.circuitLegendI') },
          { heading: t('ch1_1.circuitLegendComponentsTitle') },
          { kind: 'battery',  label: t('ch1_1.circuitLegendBatteryName') },
          { kind: 'resistor', label: t('ch1_1.circuitLegendResistorName') },
          { kind: 'led',      label: t('ch1_1.circuitLegendLedName') },
        ]}
      />

      <p>
        <Trans i18nKey="ch1_1.circuitOhmPreview" ns="ui"
          components={{ ...mathComponents, strong: <strong /> }}
        />
      </p>

      {/* Interactive — try V, R, I before the formula lands in Ch 1.2 */}
      <CurrentExplorer />

      {/* ── Section 7: Names, units, vocabulary ───────────────────── */}
      <Section id="terms" labelKey="ch1_1.sectionTerms" />

      <p>{t('ch1_1.termsIntro')}</p>

      <div className="not-prose my-6 overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 pr-4 font-semibold">{t('ch1_1.termsHeaderQuantity')}</th>
              <th className="text-left py-2 pr-4 font-semibold">{t('ch1_1.termsHeaderSymbol')}</th>
              <th className="text-left py-2 pr-4 font-semibold">{t('ch1_1.termsHeaderUnit')}</th>
              <th className="text-left py-2 font-semibold">{t('ch1_1.termsHeaderNamed')}</th>
            </tr>
          </thead>
          <tbody className="text-muted-foreground">
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4">{t('ch1_1.termsChargeRow')}</td>
              <td className="py-2 pr-4 font-mono">Q</td>
              <td className="py-2 pr-4 font-mono">{t('ch1_1.termsUnitCharge')}</td>
              <td className="py-2">{t('ch1_1.termsCoulombNamed')}</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4">{t('ch1_1.termsCurrentRow')}</td>
              <td className="py-2 pr-4 font-mono">I</td>
              <td className="py-2 pr-4 font-mono">{t('ch1_1.termsUnitCurrent')}</td>
              <td className="py-2">{t('ch1_1.termsAmpereNamed')}</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4">{t('ch1_1.termsVoltageRow')}</td>
              <td className="py-2 pr-4 font-mono">V</td>
              <td className="py-2 pr-4 font-mono">{t('ch1_1.termsUnitVoltage')}</td>
              <td className="py-2">{t('ch1_1.termsVoltNamed')}</td>
            </tr>
            <tr>
              <td className="py-2 pr-4">{t('ch1_1.termsResistanceRow')}</td>
              <td className="py-2 pr-4 font-mono">R</td>
              <td className="py-2 pr-4 font-mono">{t('ch1_1.termsUnitResistance')}</td>
              <td className="py-2">{t('ch1_1.termsOhmNamed')}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <Callout variant="tip">
        <Trans i18nKey="ch1_1.termsVocabNote" ns="ui" components={{ ...mathComponents, strong: <strong /> }} />
      </Callout>

      {/* ── Section 8: Traffic analogy (secondary) ────────────────── */}
      <Section id="traffic" labelKey="ch1_1.sectionTraffic" />

      <p>{t('ch1_1.trafficIntro')}</p>

      <ul>
        <li><Trans i18nKey="ch1_1.trafficBullet1" ns="ui" components={{ ...mathComponents, strong: <strong /> }} /></li>
        <li><Trans i18nKey="ch1_1.trafficBullet2" ns="ui" components={{ ...mathComponents, strong: <strong /> }} /></li>
        <li><Trans i18nKey="ch1_1.trafficBullet3" ns="ui" components={{ ...mathComponents, strong: <strong /> }} /></li>
      </ul>

      <p>{t('ch1_1.trafficClosing')}</p>

      <Callout variant="key">
        {t('ch1_1.keyTakeaway')}
      </Callout>

      {/* ── Lab Activity ──────────────────────────────────────────── */}
      <LabActivity
        label="1.1"
        goal={t('ch1_1.labGoal')}
        equipment={[
          <Trans key="e1" i18nKey="ch1_1.labEquip1" ns="ui" components={{ ...mathComponents, multimeter: <G k="multimeter" /> }} />,
          <Trans key="e2" i18nKey="ch1_1.labEquip2" ns="ui" components={{ ...mathComponents, breadboard: <G k="breadboard" /> }} />,
          t('ch1_1.labEquip3'),
          t('ch1_1.labEquip4'),
        ]}
        components={[
          t('ch1_1.labComp1'),
          t('ch1_1.labComp2'),
          t('ch1_1.labComp3'),
        ]}
        procedure={[
          { text: <Trans i18nKey="ch1_1.labStep1" ns="ui" components={{ ...mathComponents, strong: <strong />, dc: <G k="dc" /> }} /> },
          { text: <Trans i18nKey="ch1_1.labStep2" ns="ui" components={{ ...mathComponents, strong: <strong /> }} /> },
          { text: <Trans i18nKey="ch1_1.labStep3" ns="ui" components={{ ...mathComponents, strong: <strong /> }} /> },
          { text: <Trans i18nKey="ch1_1.labStep4" ns="ui" components={{ ...mathComponents, strong: <strong /> }} /> },
          { text: <Trans i18nKey="ch1_1.labStep5" ns="ui" components={{ strong: <strong />, var: <MathVar />, nowrap: <span style={{ whiteSpace: 'nowrap' }} /> }} /> },
          { text: <Trans i18nKey="ch1_1.labStep6" ns="ui" components={{ ...mathComponents, strong: <strong /> }} /> },
        ]}
        expectedResult={<Trans i18nKey="ch1_1.labExpected" ns="ui" components={{ var: <MathVar />, nowrap: <span style={{ whiteSpace: 'nowrap' }} /> }} />}
        connectionToTheory={t('ch1_1.labConnection')}
        troubleshooting={[
          t('ch1_1.labTrouble1'),
          t('ch1_1.labTrouble2'),
          t('ch1_1.labTrouble3'),
        ]}
      />

      {/* ── Quiz ──────────────────────────────────────────────────── */}
      <Quiz
        title={t('ch1_1.quizTitle')}
        storageKey={STORAGE_KEYS.quizProgress(CHAPTER_ID)}
        questions={quizQuestions}
      />
    </>
  )
}
