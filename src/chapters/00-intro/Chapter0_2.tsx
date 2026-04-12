// Chapter 0.2 — Lab Bench Setup
import LabActivity from '@/components/LabActivity/LabActivity'
import MultimeterDiagram from '@/components/diagrams/MultimeterDiagram'
import OscilloscopeDiagram from '@/components/diagrams/OscilloscopeDiagram'
import BreadboardDiagram from '@/components/diagrams/BreadboardDiagram'
import { Callout } from '@/components/ui/callout'
import { Section } from '@/components/ui/section-heading'
import { G } from '@/components/ui/glossary-term'

export default function Chapter0_2() {
  return (
    <>
      <p>
        Before we touch a single resistor or frequency formula, let's get comfortable with the
        instruments. A bench without working, understood tools is just a flat surface with
        expensive decorations on it.
      </p>

      <p>
        This chapter covers the four instruments you'll use throughout the course:{' '}
        <G k="multimeter">multimeter</G>, <G k="oscilloscope">oscilloscope</G>,{' '}
        <G k="vna">VNA (Vector Network Analyser)</G>, and the{' '}
        <strong>Arduino</strong> in its role as a signal generator.
      </p>

      <Section id="multimeter">The multimeter</Section>

      <p>
        The multimeter is the most fundamental instrument in electronics. It measures three
        things you'll use constantly: <G>voltage</G>, <G>current</G>, and{' '}
        <G>resistance</G>. Most also do <G>continuity</G> (beeps when connected),{' '}
        <G k="diode testing">diode testing</G>, and <G k="capacitance">capacitance</G>.
      </p>

      <Callout variant="danger">
        Always check which mode you're in before probing. Measuring voltage in current mode
        blows the fuse. Measuring mains voltage in resistance mode can damage the meter — or
        injure you.
      </Callout>

      <MultimeterDiagram />

      <ul>
        <li>
          <strong>Voltage:</strong> probes go in parallel with the thing you're measuring.
          Red probe to the positive side, black to ground.
        </li>
        <li>
          <strong>Current:</strong> the meter goes in series — you must break the circuit and
          put the meter in the gap. Use the mA input for small currents, the A input for large
          ones. Most meters have a separate socket for the red probe in current mode.
        </li>
        <li>
          <strong>Resistance:</strong> power must be off. The meter applies its own small
          voltage to measure resistance — an external voltage will give wrong readings and may
          damage it.
        </li>
      </ul>

      <Section id="oscilloscope">The oscilloscope</Section>

      <p>
        The oscilloscope is the instrument that turns invisible electrical behaviour into a
        picture. It draws a graph of voltage against time — and once you have that habit, so
        much of electronics clicks into place.
      </p>

      <p>
        The two main controls are <G>time/div</G> (how stretched the time axis is) and{' '}
        <G>volt/div</G> (how stretched the voltage axis is). If you can't see a signal, it's
        almost always one of these two settings that needs adjusting.
      </p>

      <OscilloscopeDiagram />

      <Callout variant="key">
        The oscilloscope probe has a ground clip (usually a crocodile clip on a short wire near
        the probe tip). This <strong>must</strong> be connected to the circuit's ground —
        otherwise you'll see noise or incorrect readings. On a bench with multiple instruments,
        all grounds should share a common point.
      </Callout>

      <Section id="vna">The VNA (Vector Network Analyser)</Section>

      <p>
        The VNA is — for amateur radio purposes — the most powerful instrument of the three.
        It sweeps a range of frequencies and measures how a component or circuit responds to
        each one. This makes it ideal for measuring antenna <G>impedance</G> and <G k="swr">SWR</G>,
        finding resonant frequencies of <G k="lc">LC</G> circuits, and plotting filter responses.
      </p>

      <Callout variant="caution">
        Before any measurement, a VNA must be <G>calibrated</G> using an open, short, and
        load standard (usually supplied as three small terminations). Calibration removes the
        effect of cables and adapters between the VNA port and your circuit. One minute of
        calibration saves many minutes of puzzling over wrong results.
      </Callout>

      <p>
        We'll use the VNA starting in Chapter 1.6. For now: know where the calibration
        standards are, and read your VNA's quick-start guide for the calibration procedure —
        each model is slightly different.
      </p>

      <Section id="arduino">The Arduino as a signal source</Section>

      <p>
        Throughout the lab activities, we use the Arduino not as a microcontroller project but
        purely as a convenient, programmable voltage source. Specifically:{' '}
        <G k="pwm">PWM output</G> (Pulse Width Modulation) gives us a <G k="square wave">square wave</G> at
        a controllable <G k="frequency">frequency</G> and duty cycle, which is good enough for demonstrating <G k="ac">AC</G> behaviour,
        charging curves, and simple modulation concepts.
      </p>

      <p>
        The Arduino's <G k="pwm">PWM</G> pins (typically pins 3, 5, 6, 9, 10, 11 on an Uno)
        output 5V amplitude square waves at frequencies between ~490 Hz and ~8 kHz depending
        on the pin and timer settings. For our early experiments, this is perfectly adequate.
      </p>

      <Callout variant="note">
        You don't need deep Arduino programming knowledge. The sketches used in the lab
        activities are short and provided inline — typically 10–15 lines of code.
      </Callout>

      <Section id="breadboard">Breadboard basics</Section>

      <p>
        A <G>breadboard</G> lets you build circuits without soldering. Understanding how the rows and
        columns connect is essential before the first experiment:
      </p>

      <BreadboardDiagram />

      <ul>
        <li>
          The long rails at the top and bottom (marked + and −) run the full length of the
          board horizontally. Use them for power (5V) and ground.
        </li>
        <li>
          The short rows in the middle run horizontally in groups of 5, separated by a gap.
          A component leg in one hole connects to every other hole in that row of 5.
        </li>
        <li>
          The gap in the middle is intentional — it separates the two sides so you can bridge
          a <G k="dip chip">DIP chip</G> across it.
        </li>
      </ul>

      <Section id="voltage-safety">Voltage safety</Section>

      <p>
        All the lab activities in this course operate at <strong>5V <G k="dc">DC</G> or less</strong> —
        completely safe to touch. The only time mains voltage appears is in the safety chapter
        (4.3), and even there the activity is limited to inspecting and measuring grounding,
        not opening live equipment.
      </p>

      <Callout variant="tip">
        Always disconnect power before rewiring. It takes two seconds and prevents the majority
        of "it's not working" puzzles from ever arising.
      </Callout>

      <LabActivity
        goal="Verify that all four instruments work correctly and that you can read basic measurements from each one."
        equipment={[
          'Multimeter',
          'Oscilloscope with probe',
          <><G k="arduino">Arduino</G> Uno (or similar) with <G k="usb">USB</G> cable</>,
          'Breadboard',
        ]}
        components={[
          'AA battery with holder (or clip leads)',
          '470Ω resistor',
          'Short jumper wires',
        ]}
        procedure={[
          {
            text: <>Set your multimeter to <G k="dc">DC</G> voltage (2V or 20V range). Touch the red probe to the AA battery positive terminal (+) and the black probe to negative (−). Read the voltage.</>,
            note: 'A fresh AA battery reads about 1.5–1.6V. A partially used one might show 1.2–1.4V. This is normal.',
          },
          {
            text: <>Connect the <G k="arduino">Arduino</G> to your computer with the <G k="usb">USB</G> cable. Open the <G k="ide">Arduino IDE</G>, load File → Examples → 01.Basics → Blink, and upload it. Pin 13 <G k="led">LED</G> should blink once per second.</>,
          },
          {
            text: 'Open File → Examples → 01.Basics → AnalogReadSerial... actually, load this simple sketch instead:',
            note: <>void setup() {'{'} pinMode(9, OUTPUT); {'}'} void loop() {'{'} tone(9, 1000); {'}'} — This outputs a 1 kHz <G k="square wave">square wave</G> on pin 9 continuously.</>,
          },
          {
            text: <>Connect the oscilloscope probe tip to <G k="arduino">Arduino</G> pin 9. Clip the probe ground to <G k="arduino">Arduino</G> <G k="gnd">GND</G>. Set <G k="time/div">time/div</G> to 0.5ms and <G k="volt/div">volt/div</G> to 2V.</>,
          },
          {
            text: <>You should see a clean <G k="square wave">square wave</G>. Measure its period with the oscilloscope <G k="cursor">cursors</G> (two full cycles should take 2ms, confirming 1 kHz).</>,
          },
          {
            text: <>Switch your multimeter to <G k="ac">AC</G> voltage. Probe pin 9 and <G k="gnd">GND</G>. Read the <G k="rms">RMS</G> voltage — it should read approximately 2.5V <G k="ac">AC</G> (the <G k="rms">RMS</G> value of a 0–5V <G k="square wave">square wave</G>).</>,
          },
          {
            text: <>Insert the 470Ω resistor between pin 9 and <G k="gnd">GND</G> on the <G k="breadboard">breadboard</G>. Probe across the resistor with the oscilloscope. Signal should be unchanged (the scope's <G k="input impedance">input impedance</G> is much higher than 470Ω).</>,
          },
        ]}
        expectedResult={<>Multimeter shows ~1.5V for the battery. Oscilloscope shows a clean 1 kHz <G k="square wave">square wave</G> at 5V <G k="peak-to-peak">peak-to-peak</G>. Multimeter reads ~2.5V <G k="ac">AC</G> on the <G k="pwm">PWM</G> pin. All connections register.</>}
        connectionToTheory={<>The oscilloscope is showing you something the multimeter cannot: the shape of the signal over time. Both instruments are measuring the same voltage, but they tell you different things about it. This distinction — <G k="dc">DC</G> value vs. waveform — runs through every chapter that follows.</>}
        troubleshooting={[
          <>Oscilloscope shows noise / flat line: check the ground clip is connected to <G k="arduino">Arduino</G> <G k="gnd">GND</G>, and try adjusting <G k="volt/div">volt/div</G>.</>,
          'No signal on pin 9: confirm the sketch uploaded successfully and the tone() call uses pin 9.',
          <>Battery reads 0V: check probe polarity and multimeter is in <G k="dc">DC</G> voltage mode (not resistance or current).</>,
        ]}
      />
    </>
  )
}
