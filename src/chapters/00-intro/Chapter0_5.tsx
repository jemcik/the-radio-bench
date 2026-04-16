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
// One row per symbol: framed SVG on the left, name + description on the
// right. The parent list lays these out as a simple vertical stack, which
// reads left-to-right like a glossary and avoids the cramped 2/3/4-column
// grid that the section used to have.
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
    <div className="flex items-center gap-4 py-1">
      <div className="shrink-0 w-40 sm:w-48 rounded border border-border bg-card/60 p-2 flex items-center justify-center text-[hsl(var(--sketch-stroke))]">
        <SVGDiagram width={svgWidth} height={svgHeight}>
          {children}
        </SVGDiagram>
      </div>
      <div className="flex-1 min-w-0 space-y-1">
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
//
// Canvas-sizing budget:
//   TOP_Y=60 (not 30) — horizontal passives put their label at y-14; LED's
//   CenteredLabel puts "D₁" at y-20 on top of emission arrows that already
//   extend to y-18. Giving 60 px of headroom above lets the label clear the
//   arrow tips and sit comfortably above the zigzag.
//   maxWidth={480} — without it, SVGDiagram's width="100%" scales the 340 px
//   schematic to the full chapter column (~900 px) and it reads as huge.
//   Resistor intentionally carries NO value prop: PassiveLabel's value
//   placement sits right on top of the zigzag (y-2, i.e. inside the ±8 body
//   band). The value is stated in the caption and in step 2 below.
const SCHEMATIC_W = 340
const SCHEMATIC_H = 200
const LEFT_X = 60
const RIGHT_X = 280
const TOP_Y = 60
const BOT_Y = 170
const BAT_Y = 115
const bat = pins2(LEFT_X, BAT_Y, 'down')
const r1  = pins2(150, TOP_Y)
const led = pins2(230, TOP_Y)

function LedCircuit({ caption }: { caption: string }) {
  return (
    <Circuit width={SCHEMATIC_W} height={SCHEMATIC_H} caption={caption} maxWidth={480}>
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
      {/* Designator subscripts omitted — only one of each component in this
          schematic, so numbering adds no information. The symbols-tour
          section above still teaches the R₁/C₁/Q₁ convention. */}
      <Battery x={LEFT_X} y={BAT_Y} orient="down" label="B" value="3V" />
      <Resistor x={150} y={TOP_Y} label="R" />
      <LED x={230} y={TOP_Y} label="D" />
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
          components={{ strong: <strong />, i: <i />, topology: <G k="topology" /> }}
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

      {/* Designators (R₁, C₁, …) are intentionally omitted here — each cell
          already captions the symbol with its name. The horizontal-passive
          label offset (`y - 14` in getLabelPosition) places subscripts right
          on top of the resistor zigzag / capacitor plates / LED emission
          arrows in this tight 110×56 preview canvas. The full worked-example
          schematic below keeps them, where there's room to breathe. */}
      <div className="not-prose my-6 flex flex-col divide-y divide-border">
        <SymbolCell
          name={t('ch0_5.symbolResistorName')}
          description={t('ch0_5.symbolResistorDesc')}
        >
          <Resistor x={55} y={28} />
        </SymbolCell>

        <SymbolCell
          name={t('ch0_5.symbolCapacitorName')}
          description={t('ch0_5.symbolCapacitorDesc')}
        >
          <Capacitor x={55} y={28} />
        </SymbolCell>

        <SymbolCell
          name={t('ch0_5.symbolInductorName')}
          description={t('ch0_5.symbolInductorDesc')}
        >
          <Inductor x={55} y={28} />
        </SymbolCell>

        <SymbolCell
          name={t('ch0_5.symbolBatteryName')}
          description={t('ch0_5.symbolBatteryDesc')}
        >
          {/* svgHeight inherits the default 56 — leads extend to ±30 and
              get clipped by ~2 px at each end of the viewport, which is
              the look we want here (the gallery cell doesn't need full
              pin-length leads the way a wired schematic does). */}
          <Battery x={55} y={28} orient="down" />
        </SymbolCell>

        <SymbolCell
          name={t('ch0_5.symbolGroundName')}
          description={t('ch0_5.symbolGroundDesc')}
        >
          {/* Ground extends y−15 (lead top) to y+10 (shortest line), centre
              offset ≈ −2.5 from component y. y=30 puts the visual centre at
              27.5, matching the viewport centre (28). */}
          <Ground x={55} y={30} />
        </SymbolCell>

        <SymbolCell
          name={t('ch0_5.symbolDiodeName')}
          description={t('ch0_5.symbolDiodeDesc')}
        >
          <Diode x={55} y={28} />
        </SymbolCell>

        <SymbolCell
          name={t('ch0_5.symbolLedName')}
          description={
            <Trans i18nKey="ch0_5.symbolLedDesc" ns="ui" />
          }
        >
          <LED x={55} y={28} />
        </SymbolCell>

        <SymbolCell
          name={t('ch0_5.symbolTransistorName')}
          description={t('ch0_5.symbolTransistorDesc')}
        >
          <TransistorNPN x={55} y={28} />
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
