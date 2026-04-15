// Chapter 0.5 — How to Read a Schematic
import { useMemo, type ReactNode } from 'react'
import { useTranslation, Trans } from 'react-i18next'
import LabActivity from '@/components/lab/LabActivity'
import { Callout } from '@/components/ui/callout'
import { Section } from '@/components/ui/section-heading'
import { G } from '@/features/glossary/glossary-term'
import SVGDiagram from '@/components/diagrams/SVGDiagram'
import {
  Circuit, Wire,
  Resistor, Capacitor, Inductor,
  Battery, Ground,
  Diode, LED, TransistorNPN,
  Meter,
  pins2,
} from '@/lib/circuit'
import Quiz, { buildQuizFromI18n } from '@/components/quiz/Quiz'
import { STORAGE_KEYS } from '@/lib/storage-keys'

const CHAPTER_ID = '0-5'
const QUIZ_QUESTION_COUNT = 6

// ─── Symbol tour helper ──────────────────────────────────────────────────────
// Renders a single symbol inside a tiny framed SVG card with its name and
// one-line description underneath. The grid below then tiles these into a
// responsive 2/3/4-column layout.
interface SymbolCellProps {
  name: string
  description: ReactNode
  svgWidth?: number
  svgHeight?: number
  children: ReactNode
}
function SymbolCell({
  name, description, svgWidth = 110, svgHeight = 56, children,
}: SymbolCellProps) {
  return (
    <div className="flex flex-col items-center text-center gap-2">
      <div className="w-full rounded border border-border bg-card/60 p-2 flex items-center justify-center text-[hsl(var(--sketch-stroke))]">
        <SVGDiagram width={svgWidth} height={svgHeight}>
          {children}
        </SVGDiagram>
      </div>
      <div className="space-y-1 px-1">
        <p className="text-sm font-semibold text-foreground">{name}</p>
        <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </div>
  )
}

// ─── Walkthrough schematic: 3 V battery → R₁ → LED → back ───────────────────
// Used both as an in-prose example and as the schematic the reader builds
// in the lab. Pinned topology:
//   B₁ (battery, vertical on left rail) → top wire → R₁ → wire → D₁ (LED)
//   → right rail down → bottom wire → back to B₁
const SCHEMATIC_W = 300
const SCHEMATIC_H = 160
const LEFT_X = 50
const RIGHT_X = 250
const TOP_Y = 30
const BOT_Y = 130
const bat = pins2(LEFT_X, 80, 'down')
const r1  = pins2(130, TOP_Y)
const led = pins2(210, TOP_Y)

function LedCircuit({ caption }: { caption: string }) {
  return (
    <Circuit width={SCHEMATIC_W} height={SCHEMATIC_H} caption={caption}>
      {/* Left rail + top wire to R₁ */}
      <Wire points={[bat.p1, { x: LEFT_X, y: TOP_Y }, r1.p1]} />
      {/* R₁ to LED */}
      <Wire points={[r1.p2, led.p1]} />
      {/* LED right → down right rail → across bottom → back to battery */}
      <Wire points={[
        led.p2,
        { x: RIGHT_X, y: TOP_Y },
        { x: RIGHT_X, y: BOT_Y },
        { x: LEFT_X,  y: BOT_Y },
        bat.p2,
      ]} />
      <Battery x={LEFT_X} y={80} orient="down" label="B₁" value="3 V" />
      <Resistor x={130} y={TOP_Y} label="R₁" value="220 Ω" />
      <LED x={210} y={TOP_Y} label="D₁" />
      {/* No <Junction>s — this is a single loop with only bends, no
          T-joins. Serves as a live example of the chapter's wire rule:
          every corner is a bend, not a junction. */}
    </Circuit>
  )
}

export default function Chapter0_5() {
  const { t } = useTranslation('ui')
  const quizQuestions = useMemo(
    () => buildQuizFromI18n(t, 'ch0_5', QUIZ_QUESTION_COUNT),
    [t],
  )

  return (
    <>
      <p>
        <Trans i18nKey="ch0_5.intro" ns="ui"
          components={{ strong: <strong />, i: <i /> }}
        />
      </p>

      <p>{t('ch0_5.introPreview')}</p>

      {/* ── Wires and junctions ─────────────────────────────────── */}
      <Section id="wires" labelKey="ch0_5.sectionWires" />

      <p>
        <Trans i18nKey="ch0_5.wiresIntro" ns="ui"
          components={{ strong: <strong /> }}
        />
      </p>

      <ul>
        <li>
          <Trans i18nKey="ch0_5.wiresRule1" ns="ui"
            components={{ strong: <strong /> }}
          />
        </li>
        <li>
          <Trans i18nKey="ch0_5.wiresRule2" ns="ui"
            components={{ strong: <strong /> }}
          />
        </li>
        <li>
          <Trans i18nKey="ch0_5.wiresRule3" ns="ui"
            components={{ strong: <strong /> }}
          />
        </li>
      </ul>

      <Callout variant="key">
        <Trans i18nKey="ch0_5.wiresKey" ns="ui"
          components={{ strong: <strong /> }}
        />
      </Callout>

      {/* ── Symbol tour ─────────────────────────────────────────── */}
      <Section id="symbols" labelKey="ch0_5.sectionSymbols" />

      <p>
        <Trans i18nKey="ch0_5.symbolsIntro" ns="ui"
          components={{ strong: <strong /> }}
        />
      </p>

      <div className="not-prose my-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        <SymbolCell
          name={t('ch0_5.symbolResistorName')}
          description={t('ch0_5.symbolResistorDesc')}
        >
          <Resistor x={55} y={28} label="R₁" />
        </SymbolCell>

        <SymbolCell
          name={t('ch0_5.symbolCapacitorName')}
          description={t('ch0_5.symbolCapacitorDesc')}
        >
          <Capacitor x={55} y={28} label="C₁" />
        </SymbolCell>

        <SymbolCell
          name={t('ch0_5.symbolInductorName')}
          description={t('ch0_5.symbolInductorDesc')}
        >
          <Inductor x={55} y={28} label="L₁" />
        </SymbolCell>

        <SymbolCell
          name={t('ch0_5.symbolBatteryName')}
          description={t('ch0_5.symbolBatteryDesc')}
          svgHeight={70}
        >
          <Battery x={55} y={35} orient="down" label="B₁" value="3 V" />
        </SymbolCell>

        <SymbolCell
          name={t('ch0_5.symbolGroundName')}
          description={t('ch0_5.symbolGroundDesc')}
          svgHeight={56}
        >
          <Ground x={55} y={20} />
        </SymbolCell>

        <SymbolCell
          name={t('ch0_5.symbolDiodeName')}
          description={t('ch0_5.symbolDiodeDesc')}
        >
          <Diode x={55} y={28} label="D₁" />
        </SymbolCell>

        <SymbolCell
          name={t('ch0_5.symbolLedName')}
          description={
            <Trans i18nKey="ch0_5.symbolLedDesc" ns="ui" />
          }
        >
          <LED x={55} y={28} label="D₂" />
        </SymbolCell>

        <SymbolCell
          name={t('ch0_5.symbolTransistorName')}
          description={t('ch0_5.symbolTransistorDesc')}
          svgHeight={72}
        >
          <TransistorNPN x={55} y={36} label="Q₁" />
        </SymbolCell>

        <SymbolCell
          name={t('ch0_5.symbolVoltmeterName')}
          description={
            <Trans i18nKey="ch0_5.symbolVoltmeterDesc" ns="ui" components={{ i: <i /> }} />
          }
          svgHeight={56}
        >
          <Meter x={55} y={28} letter="V" />
        </SymbolCell>

        <SymbolCell
          name={t('ch0_5.symbolAmmeterName')}
          description={
            <Trans i18nKey="ch0_5.symbolAmmeterDesc" ns="ui" components={{ i: <i /> }} />
          }
          svgHeight={56}
        >
          <Meter x={55} y={28} letter="A" />
        </SymbolCell>
      </div>

      {/* ── Worked example ─────────────────────────────────────── */}
      <Section id="example" labelKey="ch0_5.sectionExample" />

      <p>
        <Trans i18nKey="ch0_5.exampleIntro" ns="ui" />
      </p>

      <LedCircuit caption={t('ch0_5.exampleCaption')} />

      <ol>
        <li>
          <Trans i18nKey="ch0_5.exampleStep1" ns="ui"
            components={{ strong: <strong /> }}
          />
        </li>
        <li>
          <Trans i18nKey="ch0_5.exampleStep2" ns="ui"
            components={{ strong: <strong /> }}
          />
        </li>
        <li>
          <Trans i18nKey="ch0_5.exampleStep3" ns="ui"
            components={{ strong: <strong /> }}
          />
        </li>
        <li>
          <Trans i18nKey="ch0_5.exampleStep4" ns="ui"
            components={{ strong: <strong /> }}
          />
        </li>
      </ol>

      <Callout variant="key">
        <Trans i18nKey="ch0_5.exampleTakeaway" ns="ui"
          components={{ strong: <strong /> }}
        />
      </Callout>

      <p>{t('ch0_5.keyTakeaway')}</p>

      {/* ── Lab Activity ──────────────────────────────────────── */}
      <LabActivity
        label="0.5"
        goal={t('ch0_5.labGoal')}
        equipment={[
          <Trans key="e1" i18nKey="ch0_5.labEquip1" ns="ui"
            components={{ multimeter: <G k="multimeter" /> }}
          />,
          <Trans key="e2" i18nKey="ch0_5.labEquip2" ns="ui"
            components={{ breadboard: <G k="breadboard" /> }}
          />,
          t('ch0_5.labEquip3'),
          t('ch0_5.labEquip4'),
        ]}
        components={[
          <Trans key="c1" i18nKey="ch0_5.labComp1" ns="ui"
            components={{ led: <G k="led" /> }}
          />,
          t('ch0_5.labComp2'),
          t('ch0_5.labComp3'),
        ]}
        procedure={[
          { text: t('ch0_5.labStep1') },
          { text: t('ch0_5.labStep2') },
          { text: t('ch0_5.labStep3') },
          { text: t('ch0_5.labStep4') },
          { text: t('ch0_5.labStep5') },
          {
            text: <Trans i18nKey="ch0_5.labStep6" ns="ui"
              components={{ strong: <strong /> }}
            />,
          },
        ]}
        expectedResult={t('ch0_5.labExpected')}
        connectionToTheory={t('ch0_5.labConnection')}
        troubleshooting={[
          t('ch0_5.labTrouble1'),
          t('ch0_5.labTrouble2'),
          t('ch0_5.labTrouble3'),
        ]}
      />

      {/* ── Quiz ───────────────────────────────────────────────── */}
      <Quiz
        title={t('ch0_5.quizTitle')}
        storageKey={STORAGE_KEYS.quizProgress(CHAPTER_ID)}
        questions={quizQuestions}
      />
    </>
  )
}
