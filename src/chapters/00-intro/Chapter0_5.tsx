// Chapter 0.5 — How to Read a Schematic
import { useMemo, type ReactNode } from 'react'
import { useTranslation, Trans } from 'react-i18next'
import LabActivity from '@/components/lab/LabActivity'
import { Callout } from '@/components/ui/callout'
import { Section } from '@/components/ui/section-heading'
import { G } from '@/features/glossary/glossary-term'
import { MathVar } from '@/components/ui/math'
import SVGDiagram from '@/components/diagrams/SVGDiagram'
import WireRulesDiagram from '@/components/diagrams/WireRulesDiagram'
import {
  Circuit, Wire,
  Resistor, ResistorIEC, Capacitor, CapacitorElectrolytic, Inductor,
  BatteryMulti, Ground,
  Diode, LED, TransistorNPN,
  Meter,
  pins2,
  SCHEMATIC_PAD_TOP,
  schematicHeight,
  type LegendItem,
} from '@/lib/circuit'
import Quiz, { buildQuizFromI18n } from '@/components/quiz/Quiz'
import { STORAGE_KEYS } from '@/lib/storage-keys'
import { mathComponents } from '@/lib/trans-defaults'

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
        {/* 14 px (0.875rem) — rem-based so it scales with the FontContext
            size setting. Weight carries the name/description hierarchy,
            not size. */}
        <p className="text-[0.875rem] font-semibold text-foreground">{name}</p>
        <p className="text-[0.875rem] text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </div>
  )
}

// ─── Walkthrough schematic: 3 V battery → R → LED → back ───────────────────
// Used both as an in-prose example and as the schematic the reader builds
// in the lab. Pinned topology:
//   B (battery, vertical on left rail) → top wire → R → wire → D (LED)
//   → right rail down → bottom wire → back to B
//
// Vertical layout is derived from the shared SCHEMATIC_PAD_TOP /
// schematicHeight() helpers in @/lib/circuit/layout so every schematic in
// the project has the same top/bottom padding — see that file for the
// reasoning behind the specific numbers. The author only picks the
// rail-to-rail span; top/bottom padding and total height follow.
// Designators carry their subscripts (B₁ / R₁ / D₁) so the reference-designator
// convention `symbolsIntro` teaches is visible on the one schematic the chapter
// walks through — reader-review finding: R₁ appeared in a sentence and nowhere
// else, C₁ and Q₁ nowhere at all.
//
// R₁ carries its value for the same reason: `symbolResistorDesc` tells the reader
// values are «written next to the symbol», and this drawing used to carry none.
// Schematic values use the compact form (`220Ω`, not `220 Ω`) per diagram-quality
// §9; the prose keeps the spaced form. The battery deliberately carries none —
// CenteredLabel puts a vertical symbol's value at y+9, exactly where BatteryMulti
// draws its «−» marker (measured overlap in the browser), and the legend beside
// the drawing already reads «battery (3 V)».
//
// BatteryMulti, not Battery: `exampleIntro` calls this a 3 V pack of two AA
// cells, and the single-cell `Battery` symbol drew one cell. Its wider plate gap
// also separates the «+» and «−» markers, which used to merge into one glyph.
const SCHEMATIC_W = 340
const RAIL_SPAN = 130
// R₁ sits on the top rail with both a label and a value, which PassiveLabel
// stacks at y−32 — 6 px above the canvas at the shared padding. Measured: the
// «R₁» glyph spilled 11 px past the SVG top edge. EXTRA_TOP buys that back here
// rather than raising SCHEMATIC_PAD_TOP for every schematic in the course.
const EXTRA_TOP = 14
const TOP_Y = SCHEMATIC_PAD_TOP + EXTRA_TOP
const BOT_Y = TOP_Y + RAIL_SPAN
const SCHEMATIC_H = schematicHeight(RAIL_SPAN) + EXTRA_TOP
const LEFT_X = 60
const RIGHT_X = 280
const BAT_Y = (TOP_Y + BOT_Y) / 2 // battery centred on the left rail
const bat = pins2(LEFT_X, BAT_Y, 'down')
const r1  = pins2(150, TOP_Y)
const led = pins2(230, TOP_Y)

// No maxWidth on the Circuit below: with a legend, Circuit puts the cap on the
// OUTER wrapper holding BOTH columns, so a 340 px cap squeezes the SVG column to
// a sliver (measured scale 0.09 in the browser). The legend branch already caps
// itself — which is why check:circuit-maxwidth exempts legend Circuits.
function LedCircuit({ caption, legend }: { caption: string; legend: LegendItem[] }) {
  return (
    <Circuit width={SCHEMATIC_W} height={SCHEMATIC_H} caption={caption} legend={legend}>
      {/* Left rail + top wire to R */}
      <Wire points={[bat.p1, { x: LEFT_X, y: TOP_Y }, r1.p1]} />
      {/* R to LED */}
      <Wire points={[r1.p2, led.p1]} />
      {/* LED right → down right rail → across bottom → back to battery */}
      <Wire points={[
        led.p2,
        { x: RIGHT_X, y: TOP_Y },
        { x: RIGHT_X, y: BOT_Y },
        { x: LEFT_X,  y: BOT_Y },
        bat.p2,
      ]} />
      {/* Designators carry their subscripts here on purpose: `symbolsIntro`
          promises «(B₁, R₁, D₁, …) … you will see them on the worked schematic
          below», and the walkthrough prose names R₁ and D₁ to match. Do not
          strip them back to bare letters — the promise and the prose both
          depend on them. */}
      <BatteryMulti x={LEFT_X} y={BAT_Y} orient="down" label="B₁" />
      <Resistor x={150} y={TOP_Y} label="R₁" value="220Ω" />
      <LED x={230} y={TOP_Y} label="D₁" />
      {/* No <Junction>s — this is a single loop with only bends, no
          T-joins. Serves as a live example of the chapter's wire rule:
          every corner is a bend, not a junction. */}
    </Circuit>
  )
}

export default function Chapter0_5() {
  const { t } = useTranslation('ui')
  const quizQuestions = useMemo(
    () => buildQuizFromI18n(t, 'ch0_5', QUIZ_QUESTION_COUNT, {
      inputz: <G k="input impedance" />,
    }),
    [t],
  )

  return (
    <>
      <p>
        <Trans i18nKey="ch0_5.intro" ns="ui"
          components={{ ...mathComponents, strong: <strong />, i: <i />, topology: <G k="topology" /> }}
        />
      </p>

      <p>{t('ch0_5.introPreview')}</p>

      {/* ── Wires and junctions ─────────────────────────────────── */}
      <Section id="wires" labelKey="ch0_5.sectionWires" />

      <p>
        <Trans i18nKey="ch0_5.wiresIntro" ns="ui"
          components={{ ...mathComponents, strong: <strong /> }}
        />
      </p>

      <ul>
        <li>
          <Trans i18nKey="ch0_5.wiresRule1" ns="ui"
            components={{ ...mathComponents, strong: <strong /> }}
          />
        </li>
        <li>
          <Trans i18nKey="ch0_5.wiresRule2" ns="ui"
            components={{ ...mathComponents, strong: <strong /> }}
          />
        </li>
        <li>
          <Trans i18nKey="ch0_5.wiresRule3" ns="ui"
            components={{ ...mathComponents, strong: <strong />, i: <i /> }}
          />
        </li>
      </ul>

      <WireRulesDiagram />

      <Callout variant="key">
        <Trans i18nKey="ch0_5.wiresKey" ns="ui"
          components={{ ...mathComponents, strong: <strong /> }}
        />
      </Callout>

      {/* ── Symbol tour ─────────────────────────────────────────── */}
      <Section id="symbols" labelKey="ch0_5.sectionSymbols" />

      <p>
        <Trans i18nKey="ch0_5.symbolsIntro" ns="ui"
          components={{ ...mathComponents, strong: <strong /> }}
        />
      </p>

      {/* Designators (R₁, C₁, …) are intentionally omitted here — each cell
          already captions the symbol with its name. The horizontal-passive
          label offset (`y - 14` in getLabelPosition) places subscripts right
          on top of the resistor zigzag / capacitor plates / LED emission
          arrows in this tight 110×56 preview canvas. The full worked-example
          schematic below keeps them, where there's room to breathe. */}
      <div className="not-prose my-6 flex flex-col divide-y divide-border">
        {/* Both styles in one cell: the description contrasts the zigzag with
            the rectangle, and the reader has to be able to recognise the one
            they will actually meet in IEC-style (European, Ukrainian) documents. */}
        <SymbolCell
          name={t('ch0_5.symbolResistorName')}
          description={
            <Trans i18nKey="ch0_5.symbolResistorDesc" ns="ui" components={{ var: <MathVar />, arrl: <G k="arrl" />, iec: <G k="iec" /> }} />
          }
          svgWidth={150}
        >
          <Resistor x={40} y={28} />
          <ResistorIEC x={112} y={28} />
        </SymbolCell>

        <SymbolCell
          name={t('ch0_5.symbolCapacitorName')}
          description={
            <Trans i18nKey="ch0_5.symbolCapacitorDesc" ns="ui" components={{ var: <MathVar />, cap: <G k="capacitor" />, chg: <G k="charge" /> }} />
          }
        >
          <Capacitor x={55} y={28} />
        </SymbolCell>

        {/* The polarised variant gets its own cell so the reader can see the two
            side by side. `Capacitor` above draws two straight plates (the general
            symbol in IEC 60617 and the one this course uses); this one draws a
            curved plate plus a «+». Note the card does NOT say «curve ⇒
            polarised» — IEEE 315 also curves a plate on ordinary capacitors to
            mark the outside electrode. The «+» is the identifier. */}
        <SymbolCell
          name={t('ch0_5.symbolCapacitorPolarName')}
          description={
            <Trans i18nKey="ch0_5.symbolCapacitorPolarDesc" ns="ui" components={{ var: <MathVar />, strong: <strong /> }} />
          }
        >
          <CapacitorElectrolytic x={55} y={28} />
        </SymbolCell>

        <SymbolCell
          name={t('ch0_5.symbolInductorName')}
          description={
            <Trans i18nKey="ch0_5.symbolInductorDesc" ns="ui" components={{ var: <MathVar /> }} />
          }
        >
          <Inductor x={55} y={28} />
        </SymbolCell>

        <SymbolCell
          name={t('ch0_5.symbolBatteryName')}
          description={
            <Trans i18nKey="ch0_5.symbolBatteryDesc" ns="ui" components={{ strong: <strong />, dc: <G k="dc" /> }} />
          }
        >
          {/* BatteryMulti, not Battery: symbolBatteryDesc tells the reader that
              cells drawn one above the other ARE that many cells, and points at
              «two AA cells drawn this way». A single-cell symbol made that
              sentence describe something not on screen. Same primitive as the
              worked schematic, so the two agree.
              svgHeight inherits the default 56 — leads extend to ±30 and get
              clipped by ~2 px at each end, which is the look we want here. */}
          <BatteryMulti x={55} y={28} orient="down" />
        </SymbolCell>

        <SymbolCell
          name={t('ch0_5.symbolGroundName')}
          description={
            <Trans i18nKey="ch0_5.symbolGroundDesc" ns="ui" components={{ strong: <strong /> }} />
          }
        >
          {/* Ground in `orient='right'` (canonical pin-up, stripes-down).
              With the compact primitive: pin tip at y−10, stripes at
              y+0/+5/+10. Total height 20; visual centre at y.
              y=28 places the visual centre at 28, matching viewport
              vertical centre (viewBox is 110×56). */}
          <Ground x={55} y={28} orient="right" />
        </SymbolCell>

        <SymbolCell
          name={t('ch0_5.symbolDiodeName')}
          description={
            <Trans i18nKey="ch0_5.symbolDiodeDesc" ns="ui" components={{ var: <MathVar />, an: <G k="anode" />, cat: <G k="cathode" /> }} />
          }
        >
          <Diode x={55} y={28} />
        </SymbolCell>

        <SymbolCell
          name={t('ch0_5.symbolLedName')}
          description={
            <Trans i18nKey="ch0_5.symbolLedDesc" ns="ui" components={{ diode: <G k="diode" /> }} />
          }
        >
          <LED x={55} y={28} />
        </SymbolCell>

        <SymbolCell
          name={t('ch0_5.symbolTransistorName')}
          description={
            <Trans i18nKey="ch0_5.symbolTransistorDesc" ns="ui" components={{ var: <MathVar />, strong: <strong /> }} />
          }
        >
          <TransistorNPN x={55} y={28} />
        </SymbolCell>

        <SymbolCell
          name={t('ch0_5.symbolVoltmeterName')}
          description={
            <Trans i18nKey="ch0_5.symbolVoltmeterDesc" ns="ui" components={{ i: <i />, var: <MathVar />, imp: <G k="input impedance" /> }} />
          }
          svgHeight={56}
        >
          <Meter x={55} y={28} letter="V" />
        </SymbolCell>

        <SymbolCell
          name={t('ch0_5.symbolAmmeterName')}
          description={
            <Trans i18nKey="ch0_5.symbolAmmeterDesc" ns="ui" components={{ i: <i />, var: <MathVar /> }} />
          }
          svgHeight={56}
        >
          <Meter x={55} y={28} letter="A" />
        </SymbolCell>
      </div>

      {/* ── Worked example ─────────────────────────────────────── */}
      <Section id="example" labelKey="ch0_5.sectionExample" />

      <p>
        <Trans i18nKey="ch0_5.exampleIntro" ns="ui" components={{ res: <G k="resistor" /> }} />
      </p>

      <LedCircuit
        caption={t('ch0_5.exampleCaption')}
        legend={[
          { kind: 'battery',  label: t('ch0_5.legendBattery') },
          { kind: 'resistor', label: t('ch0_5.legendResistor') },
          { kind: 'led',      label: t('ch0_5.legendLed') },
        ]}
      />

      <ol>
        <li>
          <Trans i18nKey="ch0_5.exampleStep1" ns="ui"
            components={{ ...mathComponents, strong: <strong /> }}
          />
        </li>
        <li>
          <Trans i18nKey="ch0_5.exampleStep2" ns="ui"
            components={{ ...mathComponents, strong: <strong /> }}
          />
        </li>
        <li>
          <Trans i18nKey="ch0_5.exampleStep3" ns="ui"
            components={{ ...mathComponents, strong: <strong /> }}
          />
        </li>
        <li>
          <Trans i18nKey="ch0_5.exampleStep4" ns="ui"
            components={{ ...mathComponents, strong: <strong /> }}
          />
        </li>
      </ol>

      <Callout variant="key">
        <Trans i18nKey="ch0_5.exampleTakeaway" ns="ui"
          components={{ ...mathComponents, strong: <strong /> }}
        />
      </Callout>

      <p>{t('ch0_5.keyTakeaway')}</p>

      {/* ── Lab Activity ──────────────────────────────────────── */}
      <LabActivity
        label="0.5"
        goal={t('ch0_5.labGoal')}
        equipment={[
          <Trans key="e1" i18nKey="ch0_5.labEquip1" ns="ui"
            components={{ ...mathComponents, multimeter: <G k="multimeter" /> }}
          />,
          <Trans key="e2" i18nKey="ch0_5.labEquip2" ns="ui"
            components={{ ...mathComponents, breadboard: <G k="breadboard" /> }}
          />,
          t('ch0_5.labEquip3'),
          t('ch0_5.labEquip4'),
        ]}
        components={[
          <Trans key="c1" i18nKey="ch0_5.labComp1" ns="ui"
            components={{ ...mathComponents, led: <G k="led" /> }}
          />,
          t('ch0_5.labComp2'),
          t('ch0_5.labComp3'),
        ]}
        procedure={[
          { text: <Trans i18nKey="ch0_5.labStep1" ns="ui" components={{ ...mathComponents, strong: <strong /> }} /> },
          { text: <Trans i18nKey="ch0_5.labStep2" ns="ui" components={{ ...mathComponents, strong: <strong /> }} /> },
          { text: <Trans i18nKey="ch0_5.labStep3" ns="ui" components={{ ...mathComponents, strong: <strong /> }} /> },
          { text: <Trans i18nKey="ch0_5.labStep4" ns="ui" components={{ ...mathComponents, strong: <strong /> }} /> },
          { text: t('ch0_5.labStep5') },
          {
            text: <Trans i18nKey="ch0_5.labStep6" ns="ui"
              components={{ ...mathComponents, strong: <strong /> }}
            />,
          },
        ]}
        expectedResult={<Trans i18nKey="ch0_5.labExpected" ns="ui" components={{ ...mathComponents }} />}
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
