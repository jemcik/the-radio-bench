# The Radio Bench — Project Plan
> An interactive, beginner-friendly encyclopaedia for HAM radio enthusiasts who want deep, principled understanding of radio and related physics — not just exam prep.

---

## Vision

A free, open-source, GitHub Pages website built chapter by chapter. Every chapter is:
- **Self-contained** — can be read alone, but deliberately builds on previous chapters
- **Analogy-first** — every abstract concept lands on a real-world anchor before any math
- **Interactive** — diagrams you can poke, sliders you can drag, widgets you can experiment with
- **Tested** — end-of-chapter quiz to confirm understanding before moving on
- **Hands-on** — optional lab activities anchor theory to the physical world
- **ERC 32 aligned** — all topics from the CEPT Novice Examination Syllabus are covered

Target reader: licensed HAM operator (or aspiring one) with no engineering background but genuine curiosity and patience to understand things properly.

---

## Lab Equipment Available

The following equipment is available for lab activities throughout the course. Each chapter that has a practical activity lists exactly which instruments are needed.

| Equipment | Role in the lab |
|---|---|
| **Arduino** (Uno/Nano/similar) | Signal generator, function generator (PWM), controllable voltage source, timing experiments |
| **Multimeter** | DC/AC voltage, current, resistance, continuity, diode test |
| **Oscilloscope** | Visualising waveforms in the time domain — the single most educational instrument for understanding signals |
| **Vector Network Analyser (VNA)** | Measuring impedance, SWR, resonance, filter frequency response — professional-grade tool that unlocks antenna and RF work |
| **Breadboard + jumper wires** | Rapid prototyping without soldering |
| **Resistors, capacitors, inductors** | Component experiments throughout Parts 1 and 2 |
| **Transistors, diodes** | Semiconductor experiments in Chapter 1.10 |

### Suggested additions to your component stock
A small investment rounds out the experiments nicely:
- Variable capacitor (air-spaced, ~100–500 pF) — essential for tuned circuit experiments
- Ferrite rods and toroids (T50-2 or similar) for winding coils
- 1N4007 rectifier diodes and a small Zener (e.g., 1N4733 5.1V)
- BC547 or 2N2222 transistors (you probably already have these)
- Small audio transformer (600Ω:600Ω, or any line-level audio transformer)
- 50Ω dummy load resistors (four 200Ω 1W resistors in parallel = 50Ω 4W)
- SMA or BNC breakout connectors for the VNA
- Ferrite snap-on cores (type 31 material) for interference experiments
- 9V battery + holder (safer than mains for beginner experiments)

---

## Lab Activity Format

Every lab activity in the chapters follows the same structure:

**Goal** — one sentence: what you will observe or measure.
**Equipment needed** — only what's relevant for that activity.
**Components** — parts list with values.
**Procedure** — step-by-step, numbered.
**Expected result** — what you should see, so you know if it worked.
**What to note down** — measurements to record and compare to theory.
**Connection to theory** — explicitly links back to the chapter concept.
**Troubleshooting** — the two or three most common failure modes.

Activities are clearly marked **optional** — the chapter is fully understandable without doing them. But doing them rewires the knowledge from "understood" to "experienced."

---

## Tech Stack

| Concern | Choice | Why |
|---|---|---|
| Framework | React + TypeScript | User's background; great for interactive widgets |
| Build tool | Vite | Fast, zero-config, excellent GitHub Pages support |
| Styling | Tailwind CSS | Utility-first, consistent, responsive by default |
| Diagrams | SVG (inline React components) | Fully interactive, no canvas complexity |
| Interactive widgets | Custom React components | Ohm's law calculators, oscilloscope views, etc. |
| Math rendering | KaTeX | Fast, beautiful, lightweight |
| Quizzes | Custom React components | Simple, no backend required |
| Hosting | GitHub Pages | Free, reliable, custom domain possible |
| Routing | React Router (hash routing) | Works with GitHub Pages without server config |
| Content | MDX or plain TSX | Allows mixing prose, code, and live components |

---

## Repository Structure

```
radiopedia/
├── public/
│   └── favicon.svg
├── src/
│   ├── chapters/           ← one folder per chapter
│   │   ├── 00-fundamentals/
│   │   ├── 01-electricity/
│   │   ├── 02-components/
│   │   └── ...
│   ├── components/         ← shared UI
│   │   ├── Quiz/
│   │   ├── Diagram/
│   │   ├── Widget/
│   │   ├── LabActivity/    ← collapsible lab activity block component
│   │   └── Layout/
│   ├── App.tsx
│   └── main.tsx
├── package.json
├── vite.config.ts
└── tailwind.config.ts
```

Each chapter folder contains:
```
00-fundamentals/
├── index.tsx        ← the chapter page (prose + components)
├── widgets/         ← interactive widgets specific to this chapter
├── diagrams/        ← SVG diagram components
├── lab.tsx          ← optional lab activity section
└── quiz.ts          ← quiz questions/answers
```

---

## Chapter Map

The chapters are organized in four **Parts**. Each part corresponds to a knowledge level. Parts 1–2 lay foundations that most radio books assume you already have. Parts 3–4 cover the ERC Report 32 syllabus in depth, going well beyond it where it builds real understanding.

---

### PART 0 — FOUNDATIONS (Prerequisites)
*What most books assume you already know.*

#### Chapter 0.1 — How to Use This Site
- How chapters build on each other
- How to use the interactive widgets
- How the quizzes work
- How to read a lab activity
- Recommended reading path

#### Chapter 0.2 — Lab Bench Setup *(new)*
*Before touching any circuits — understand your tools.*
- Getting to know the multimeter: modes, probes, safety ratings
- Getting to know the oscilloscope: probes, ground, time/div, volt/div
- Getting to know the VNA: calibration, S11/S21, Smith chart basics (intuition only)
- Getting to know the Arduino: as a tool, not as a programming project
  - Loading the "signal generator" sketch (provided in the chapter)
  - PWM frequency and duty cycle — the two knobs you'll use most
- Breadboard anatomy: power rails, tie strips, how connections work
- Safe voltage habits: below 50V DC is generally safe; always disconnect before rewiring
- **🔬 Lab Activity — Your First Measurement**
  - Goal: verify all instruments work and you understand how to read them
  - Equipment: multimeter, oscilloscope, Arduino, breadboard
  - Procedure: measure a 9V battery with multimeter; generate a 1 kHz square wave from Arduino PWM pin; view it on oscilloscope; measure its amplitude with multimeter
  - Expected result: multimeter reads ~8.4V (real battery, slightly below rated); oscilloscope shows a clean square wave at 1 kHz; multimeter reads ~2.5V RMS on the AC setting (half the 5V peak-to-peak)

#### Chapter 0.3 — Math Toolkit for Radio
*ERC 32 requirement: adding, subtracting, multiplying, dividing; fractions; squaring; square roots; transposing formulae.*

**Sections:**
- **Fractions and ratios** — the language of comparison; voltage divider as the motivating example; "half the voltage" = ½ = 0.5 = 50%
- **Powers of 10 and scientific notation** — why 2,400,000,000 Hz = 2.4 × 10⁹ Hz = 2.4 GHz; how to read and enter scientific notation on a calculator (the EXP/EE button demystified)
- **SI prefixes: pico → tera** — the full ladder from pico to tera with real radio examples at each level (pF capacitors, µA current, kHz shortwave, GHz microwaves)
- **Squaring and square roots** — why they appear in power formulas (P = I²R, P = V²/R); visual: area of a square as an analogy for squaring
- **Transposing formulas** — the "cover the unknown" trick; if you know two things, you can find the third; step-by-step rearrangement walkthrough

**Diagrams:**
- **Prefix Ladder diagram** — logarithmic scale SVG from pico to giga, with real radio examples annotated at each order of magnitude (e.g., pF capacitor, mA LED current, kHz AM broadcast, MHz FM band, GHz Wi-Fi)
- **Formula Triangle diagram** — visual triangle showing how covering one variable reveals the formula (Ohm's law triangle as a preview of Ch 1.2)

**Interactive widgets:**
- **SI Prefix Converter** — type a number, pick source and target prefix, see the conversion with the "move the decimal point" step visualised
- **Scientific Notation Explorer** — enter a number, see it broken into mantissa × 10ⁿ; toggle between engineering notation (exponents divisible by 3) and standard scientific notation
- **Formula Transposer** — pick a formula (V=IR, P=IV, P=I²R, f=1/T), select which variable to solve for, see the step-by-step algebraic rearrangement animated

**Practical sidebar:**
- "Your calculator's secret button" — how to use EXP/EE on a scientific calculator or phone app; common mistake: typing "2.4 × 10 EXP 9" instead of "2.4 EXP 9"

**🔬 Lab Activity — Measure and Convert:**
- Goal: practice expressing the same measurement in different units and prefixes
- Equipment: multimeter, a few resistors (470Ω, 4.7kΩ, 1MΩ)
- Procedure: measure each resistor; write the reading in Ω, kΩ, MΩ, and scientific notation; verify your conversions with the SI Prefix Converter widget
- Connection to theory: builds muscle memory for prefix conversion — the skill used in every chapter that follows

**Quiz:** 10–15 questions covering unit conversion, scientific notation, prefix arithmetic, and formula transposition

#### Chapter 0.4 — The Decibel (dB, dBm, dBd, dBi)
*Not in ERC 32 explicitly but used constantly in every other chapter.*
- Why we use logarithms for ratios (doubling power vs. adding 3 dB)
- dB as a pure ratio (no units): gain, loss, attenuation
- dBm: power relative to 1 milliwatt — the radio operator's favourite unit
- dBd and dBi: antenna gain reference points
- Converting between watts and dBm (the key table to memorise)
- Real examples: typical TX power in dBm, path loss, receiver sensitivity
- **Widget:** Interactive dB calculator — enter watts, get dBm and vice versa
- **Widget:** "What does +3 dB feel like?" — slider shows signal doubling
- **Quiz:** 10 questions on dB conversions
- **🔬 Lab Activity — Measuring dB with a Multimeter**
  - Goal: feel what a 3 dB, 6 dB, and 20 dB difference looks like as a voltage ratio
  - Equipment: multimeter, two resistors as a voltage divider (e.g., 1kΩ + 1kΩ, then 1kΩ + 3kΩ), 9V battery
  - Procedure: measure output of each divider; calculate voltage ratio; convert to dB; compare to theoretical
  - Connection: a 2:1 voltage ratio = 6 dB voltage difference = 6 dB signal difference (not the same as power dB — a great insight)

---

### PART 1 — ELECTRICITY AND CIRCUITS
*ERC 32: Chapter 1 (Electrical theory) + Chapter 2 (Components) + Chapter 3 (Circuits)*

#### Chapter 1.1 — What Is Electricity?
*ERC 32: 1.1 Conductivity*
- Atoms, electrons, and the idea of "wanting to flow"
- Conductors, semiconductors, insulators — the water pipe analogy
- Electric current: what actually moves (electrons vs. conventional current)
- Voltage: pressure that pushes the current
- Resistance: friction against the flow
- Units: Ampere (A), Volt (V), Ohm (Ω)
- **Diagram:** Animated water-flow analogy (pressure → voltage, flow → current, pipe width → resistance)
- **Quiz:** 10 questions on basic definitions and units
- **🔬 Lab Activity — Conductors and Insulators**
  - Goal: classify everyday materials as conductor, semiconductor, or insulator
  - Equipment: multimeter (continuity/resistance mode)
  - Components: coin, pencil graphite core, wood, rubber eraser, paper, aluminium foil, plastic, a piece of silicon die (if available)
  - Procedure: probe each material in resistance mode; record the reading
  - Expected result: metals → near 0Ω; graphite → hundreds of Ω (semiconductor behaviour); rubber/plastic → OL (open circuit)
  - Insight: pencil graphite is carbon — it conducts, but not as well as metal. This is your first taste of "semiconductor."

#### Chapter 1.2 — Ohm's Law and Electric Power
*ERC 32: 1.1 — Ohm's Law (E=I·R), Electric power (P=E·I)*
- Ohm's Law: E = I × R — the most important equation in electronics
- Transposing: find I if you know E and R; find R if you know E and I
- Electric power: P = E × I (and the derived forms P = I²R, P = E²/R)
- The unit watt
- Real-life examples: why a fuse blows, why wires get warm
- **Widget:** Ohm's Law triangle — click any two known values, get the third
- **Widget:** Power calculator — enter voltage and current, see watts
- **Quiz:** 10 calculation problems
- **🔬 Lab Activity — Verify Ohm's Law on a Breadboard**
  - Goal: measure real V and I in a resistive circuit and confirm E = I × R
  - Equipment: multimeter, breadboard
  - Components: 9V battery, 470Ω resistor, 1kΩ resistor, 2.2kΩ resistor, LED (optional)
  - Procedure:
    1. Connect 9V battery → 470Ω resistor → GND. Measure voltage across resistor. Measure current in series (move multimeter probe). Calculate expected I = E/R. Compare.
    2. Repeat with 1kΩ and 2.2kΩ.
    3. Calculate power dissipated in each case. Note which resistor gets warmest.
  - What to note: how close is your measured result to the theoretical? Real resistors have tolerance (±5% or ±1%) — your results will be slightly off, and that's expected.
  - Insight: the warmth you feel on a resistor *is* the power dissipation. P = I²R is not an abstraction — it's heat in your fingers.

#### Chapter 1.3 — DC and AC: Two Kinds of Electricity
*ERC 32: 1.1 (sources), 1.2 (battery and mains)*
- DC (Direct Current): flows one way, like a battery
- AC (Alternating Current): flows back and forth, like mains power
- Why AC is used for mains (easy to transform, long-distance transmission)
- Frequency of AC: 50 Hz (Europe) / 60 Hz (North America)
- Peak voltage vs. RMS voltage (why your 230 V mains is not 230 V peak)
- **Diagram:** Animated sine wave — see AC voltage over time
- **Widget:** Sine wave visualiser — adjust frequency and amplitude
- **Quiz:** 10 questions on DC vs. AC, RMS, frequency
- **🔬 Lab Activity — See DC and AC on the Oscilloscope**
  - Goal: see the fundamental difference between DC and AC as waveforms, not just words
  - Equipment: oscilloscope, Arduino, 9V battery, multimeter
  - Procedure:
    1. Connect oscilloscope probe to 9V battery positive terminal. Observe: flat horizontal line = DC.
    2. Load Arduino with PWM tone sketch (1 kHz, 50% duty cycle on pin 9). Probe pin 9. Observe: square wave — this is AC (it alternates, even if not sinusoidal).
    3. Put a 10µF capacitor between pin 9 and the scope probe with a 10kΩ load resistor. Observe: the square wave smooths out toward a rough sine shape (RC integration).
    4. Measure the RMS voltage of the square wave with multimeter on AC setting. Compare to the peak-to-peak reading on the scope. Verify: RMS = 0.707 × Vpeak for a sine wave, but for a square wave RMS = Vpeak (interesting difference!).
  - Insight: the oscilloscope turns invisible electrical behaviour into a picture. Once you have this habit, electronics becomes far less mysterious.

#### Chapter 1.4 — Resistors in Practice
*ERC 32: 2.1 Resistor*
- Resistance: recap with deeper understanding
- Resistor colour code — how to read the bands
- Power dissipation: why resistors have a wattage rating
- Resistors in series: resistances add
- Resistors in parallel: resistances decrease
- Voltage divider: a fundamental circuit pattern
- **Widget:** Colour code decoder — pick band colours, read resistance
- **Widget:** Series/parallel calculator — enter values, see equivalent resistance
- **Diagram:** Voltage divider with adjustable resistor values
- **Quiz:** 10 questions including colour code reading and series/parallel calculation
- **🔬 Lab Activity — Resistor Colour Code and Voltage Divider**
  - Goal: read colour codes, measure real resistance, build and verify a voltage divider
  - Equipment: multimeter, breadboard
  - Components: 9V battery, assorted resistors (grab 10 random ones from your kit)
  - Procedure:
    1. For each resistor: read the colour code (predict the value), then measure with multimeter. Record both. Calculate how far off you are as a percentage.
    2. Build a voltage divider: 1kΩ on top, 1kΩ on bottom (equal values). Predict the output voltage: 9V × (1k / (1k+1k)) = 4.5V. Measure. Does it match?
    3. Change to 1kΩ top and 2.2kΩ bottom. Predict, then measure.
    4. Build a series combination (1kΩ + 2.2kΩ). Measure equivalent resistance with multimeter. Compare to calculated 3.2kΩ.
    5. Build a parallel combination. Measure. Compare to calculated value.
  - Insight: the voltage divider is the most fundamental circuit in electronics. It appears everywhere — in bias networks, in attenuators, in ADC input scaling on the Arduino.

#### Chapter 1.5 — Capacitors
*ERC 32: 2.2 Capacitor*
- What a capacitor is: two plates, a gap, stored charge
- Capacitance: the unit farad (and why we usually use µF, nF, pF)
- Charging and discharging: the key behaviour
- Types of capacitors and when to use which: air, mica, ceramic, plastic, electrolytic
- Capacitors in series and parallel (opposite to resistors — note why)
- What a capacitor does to AC vs. DC (blocks DC, passes AC — crucial concept)
- **Diagram:** Animated capacitor charging/discharging with voltage over time
- **Widget:** RC time-constant calculator
- **Quiz:** 10 questions
- **🔬 Lab Activity A — RC Time Constant**
  - Goal: measure and verify the RC time constant τ = RC
  - Equipment: oscilloscope, Arduino (as a square-wave source)
  - Components: 10kΩ resistor, 10µF electrolytic capacitor (watch polarity!), breadboard
  - Procedure:
    1. Connect Arduino pin 9 → 10kΩ resistor → one capacitor leg → GND. Probe between resistor and capacitor.
    2. Load a 5 Hz square wave (Arduino sketch or tone()). At 5 Hz each half-cycle is 100ms — slow enough to see the exponential charging curve.
    3. On oscilloscope, measure the time from when the voltage starts rising to when it reaches 63% of its final value. This is τ.
    4. Calculate expected τ: 10,000 × 0.000010 = 0.1 seconds = 100ms.
    5. Compare measured τ to calculated τ.
  - Insight: 63% is the magic number for one time constant. After 5τ (500ms here) the capacitor is 99% charged — effectively full.
- **🔬 Lab Activity B — Capacitor Blocks DC, Passes AC**
  - Goal: demonstrate the fundamental capacitor behaviour
  - Equipment: multimeter, oscilloscope, Arduino
  - Components: 1µF capacitor, 10kΩ resistor, breadboard
  - Procedure:
    1. DC test: connect 9V battery → capacitor → multimeter set to DC mV. Initially you see a spike; then silence. The capacitor blocks DC once charged.
    2. AC test: connect Arduino 1 kHz PWM → capacitor → 10kΩ resistor to GND. Probe after the capacitor on oscilloscope. Signal passes through! Vary the frequency and notice lower frequencies are attenuated more (this is already a high-pass filter).

#### Chapter 1.6 — Coils (Inductors)
*ERC 32: 2.3 Coil*
- A coil resists changes in current (magnetic energy storage)
- Inductance: the unit henry (and µH, mH)
- What a coil does to AC vs. DC (passes DC, opposes AC — opposite of capacitor)
- The idea of reactance: frequency-dependent "resistance"
- Coils in radio: RF chokes, loading coils, impedance matching
- **Diagram:** Magnetic field visualisation around a coil
- **Quiz:** 10 questions
- **🔬 Lab Activity — Wind a Coil and Measure Its Inductance**
  - Goal: build a real inductor from scratch and measure it with the VNA
  - Equipment: VNA (port 1), breadboard, SMA connector
  - Components: ferrite toroid (T50-2 or similar), 0.5mm enamelled copper wire (magnet wire), wire strippers
  - Procedure:
    1. Wind 20 turns of wire through a T50-2 toroid. Note: each pass through the hole counts as one turn.
    2. Scrape the enamel off the ends with sandpaper, tin with solder.
    3. Connect to VNA port 1 via SMA breakout or clip leads.
    4. Calibrate VNA (open/short/load).
    5. Sweep from 1 MHz to 30 MHz. Read inductance at 7 MHz (40m band).
    6. Calculate expected inductance: for T50-2, L(µH) ≈ 0.049 × N². For N=20: L ≈ 0.049 × 400 = 19.6 µH.
    7. Compare your measurement to theory.
  - Bonus: wind 10 more turns (total 30). How does L change? (It should quadruple for 2× the turns — L ∝ N²)
  - Insight: you just built the kind of coil that goes into antenna tuners and RF chokes. The VNA makes visible what the coil is doing at RF frequencies — something no multimeter can show.

#### Chapter 1.7 — Tuned Circuits and Resonance
*ERC 32: 2.7 Tuned circuits, 3.1 Filters*
- What happens when you combine a coil and a capacitor
- Resonant frequency: the one frequency where they "agree"
- Series resonance vs. parallel resonance: different behaviours
- Q factor: the sharpness of tuning (why it matters for selectivity)
- The LC resonance formula: f = 1 / (2π√LC)
- **Widget:** Resonance calculator — enter L and C, get resonant frequency
- **Diagram:** Interactive frequency response curve — drag L or C and watch the peak move
- **Quiz:** 10 questions
- **🔬 Lab Activity — Find Resonance with the VNA**
  - Goal: build an LC circuit, predict its resonant frequency, and measure it
  - Equipment: VNA, breadboard, SMA connector
  - Components: coil wound in previous lab (~20 µH), variable capacitor (100–500 pF) OR a set of fixed capacitors (100, 220, 470 pF)
  - Procedure:
    1. Connect coil (L ≈ 20 µH) in series with 220 pF capacitor.
    2. Calculate expected resonant frequency: f = 1 / (2π × √(20×10⁻⁶ × 220×10⁻¹²)) ≈ 2.4 MHz.
    3. Connect to VNA and sweep 1–10 MHz. Look for the impedance dip (series resonance) or peak (parallel).
    4. Record the actual resonant frequency. How close is it to your calculation?
    5. Change the capacitor to 470 pF. Predict new frequency (~1.6 MHz). Measure. Verify.
  - Insight: this is exactly the same physics as your radio's front-end bandpass filter. You are looking at selectivity being born.

#### Chapter 1.8 — Filters
*ERC 32: 3.1 Filters*
- What a filter does: lets some frequencies through, blocks others
- Low-pass filter: passes everything below a cutoff
- High-pass filter: passes everything above a cutoff
- Band-pass filter: passes a window of frequencies
- Band-stop filter: blocks a window
- Real uses: TX output filter (kills harmonics), receiver front-end filter
- **Diagram:** Animated frequency response plots for each filter type
- **Widget:** Simulate a low-pass filter with adjustable cutoff
- **Quiz:** 10 questions
- **🔬 Lab Activity — Build and Plot a Low-Pass Filter**
  - Goal: build a simple RC low-pass filter and plot its frequency response
  - Equipment: VNA (port 1 → port 2 for S21 measurement), breadboard
  - Components: 1kΩ resistor, 10nF capacitor
  - Procedure:
    1. Build: input → 1kΩ resistor → output node. 10nF capacitor from output node to GND.
    2. Calculate cutoff frequency: f_c = 1 / (2π × RC) = 1 / (2π × 1000 × 10×10⁻⁹) ≈ 15.9 kHz.
    3. Connect VNA port 1 to input, port 2 to output. Sweep 1 kHz to 1 MHz.
    4. View S21 (insertion loss). At the cutoff frequency you should see −3 dB. Above cutoff: signal rolls off at −20 dB per decade.
    5. Read the −3 dB frequency from the VNA. Compare to calculated 15.9 kHz.
  - Bonus: replace the capacitor with your LC resonant circuit from Ch 1.7 to build a band-pass filter. Observe the narrow pass-band on the VNA.
  - Insight: now you understand why your transceiver has a low-pass filter after the PA stage — it kills harmonics (which are well above the fundamental frequency) while passing the wanted signal through.

#### Chapter 1.9 — Transformers
*ERC 32: 2.4 Transformers*
- Magnetic coupling between two coils
- Turns ratio: how voltage and current scale
- Impedance transformation: why this matters for matching
- Real uses: power supply, antenna matching, audio coupling
- **Diagram:** Animated transformer with adjustable turns ratio
- **Quiz:** 10 questions
- **🔬 Lab Activity — Measure a Transformer's Turns Ratio**
  - Goal: measure actual voltage transformation and verify the turns ratio
  - Equipment: multimeter (AC voltage setting), oscilloscope
  - Components: small audio transformer (600Ω:600Ω line transformer, or any small power transformer rated 12V or less), Arduino (as AC source)
  - Procedure:
    1. Feed Arduino PWM 1 kHz square wave into primary winding via a 1kΩ series resistor.
    2. Measure voltage across primary with oscilloscope. Measure voltage across secondary.
    3. Calculate voltage ratio: V_secondary / V_primary. This equals N_secondary / N_primary.
    4. If it's a 1:1 audio transformer, ratio should be ≈1. If it's a step-up, >1.
    5. Try loading the secondary with a 1kΩ resistor and measure again. Note how the voltage drops (the transformer is not ideal at these frequencies with these impedances).
  - Note: a small cheap audio transformer from an electronics shop (Bourns, Xicon) is ideal. Don't use mains transformers for this experiment.

#### Chapter 1.10 — Diodes and Transistors
*ERC 32: 2.5 Diode, 2.6 Transistor*
- Semiconductors: the middle ground between conductor and insulator
- P-N junction: the one-way valve
- Rectifier diodes: turning AC into pulsing DC
- Zener diodes: voltage regulation
- Transistors: the controlled valve
- Transistor as amplifier: a small signal controls a larger one
- Transistor as oscillator: the feedback loop that generates a signal
- **Diagram:** Diode IV curve (interactive — see forward/reverse bias)
- **Diagram:** Transistor amplifier block view
- **Quiz:** 10 questions
- **🔬 Lab Activity A — Half-Wave Rectifier**
  - Goal: turn a pulsing AC into pulsing DC; see the waveform transform
  - Equipment: oscilloscope (two channels if possible)
  - Components: Arduino (AC source via PWM), 1N4007 diode, 1kΩ resistor, 100µF capacitor
  - Procedure:
    1. Connect: Arduino pin 9 → 1N4007 anode → 1kΩ to GND. Probe after the diode on channel 1. Probe before the diode on channel 2.
    2. Load a 100 Hz square wave from Arduino.
    3. Observe: before diode = AC-like square wave. After diode = only positive half-cycles pass through (half-wave rectification).
    4. Add 100µF capacitor in parallel with the 1kΩ load. Observe: the capacitor smooths the pulses into a rough DC with ripple. Increase capacitor to 1000µF if available — ripple reduces further.
  - Insight: this is exactly how the power supply in your radio turns mains AC into DC for the circuits.
- **🔬 Lab Activity B — Transistor as a Switch**
  - Goal: use a small current from Arduino to switch a larger current through an LED
  - Equipment: Arduino, breadboard, multimeter
  - Components: BC547 or 2N2222 NPN transistor, 1kΩ resistor (base), 100Ω resistor (collector), LED
  - Procedure:
    1. Wire: Arduino pin 13 → 1kΩ → transistor base. Transistor collector → 100Ω → LED → 5V. Emitter → GND.
    2. Load a blink sketch on Arduino (pin 13 high/low every second).
    3. Observe LED turning on and off.
    4. Measure base current (voltage drop across 1kΩ divided by 1kΩ ≈ a few milliamps) and collector current (voltage drop across 100Ω).
    5. Calculate hFE (current gain): I_collector / I_base. Should be 100–300 for these transistors.
  - Insight: this gain principle is identical to how an RF amplifier in your radio works — a small signal at the base controls a much larger signal at the collector.

---

### PART 2 — RADIO THEORY
*ERC 32: Chapter 1 continued (1.3–1.6) — the bridge from electricity to radio*

#### Chapter 2.1 — What Are Radio Waves?
*ERC 32: 1.3 Radio Waves*
- Electromagnetic waves: electric and magnetic fields in motion
- How an oscillating current in a wire creates a radio wave
- The speed of light: 300,000 km/s (and why all radio travels at this speed)
- Wavelength, frequency, and the relationship: λ = c / f
- The unit hertz, and why we use kHz, MHz, GHz
- Polarisation: horizontal, vertical, circular
- The electromagnetic spectrum: from ELF to gamma rays — where radio sits
- **Widget:** λ ↔ f converter — type frequency, get wavelength and vice versa
- **Diagram:** Animated EM wave propagation
- **Quiz:** 10 questions
- **🔬 Lab Activity — Make a Wire "Transmit" (and Detect It)**
  - Goal: demonstrate that a wire carrying AC current radiates, and a nearby wire can detect it
  - Equipment: Arduino, oscilloscope
  - Components: two wires ~30cm each, 100Ω resistor
  - Procedure:
    1. Connect Arduino pin 9 to a 30cm wire (the "transmitting antenna") through a 100Ω resistor to GND.
    2. Load a high-frequency PWM sketch (as fast as possible — Arduino can do ~8 MHz with direct port manipulation, or use a crystal oscillator if available).
    3. Suspend the second 30cm wire nearby, connected only to the oscilloscope probe.
    4. At very close range (a few cm), you should see an induced signal on the oscilloscope.
    5. Move the receive wire farther away — signal drops off quickly.
  - Note: this isn't proper radio — Arduino clock frequencies are well below HAM bands, and power is tiny. But it demonstrates the principle: AC in a wire creates a field that induces voltage in a nearby wire.
  - Insight: this is the exact mechanism of your antenna. The scale is different; the physics is identical.

#### Chapter 2.2 — Audio, Digital and Modulated Signals
*ERC 32: 1.4 Audio and digital signals, 1.5 Modulated signals*
- Audio signals: what your voice looks like as a voltage waveform
- Digital signals: ones and zeros, on and off
- Why we need modulation: audio can't travel directly by radio
- The carrier wave: a pure RF frequency we "ride on"
- AM (Amplitude Modulation): vary the strength of the carrier
- SSB (Single Sideband): the smarter version of AM
- FM (Frequency Modulation): vary the frequency of the carrier
- Carrier, sidebands, bandwidth — understanding the RF spectrum
- **Diagram:** Animated AM modulation — see carrier and sidebands
- **Diagram:** FM modulation — see frequency deviation
- **Widget:** Bandwidth visualiser — adjust modulation and see spectrum usage
- **Quiz:** 10 questions
- **🔬 Lab Activity — Visualise AM Modulation on the Oscilloscope**
  - Goal: produce an amplitude-modulated waveform and see the modulation envelope
  - Equipment: oscilloscope, Arduino (two PWM outputs)
  - Procedure:
    1. Configure Arduino: pin 9 = "carrier" at ~490 Hz (Arduino default PWM); pin 6 = "audio" at ~10 Hz (very slow modulation for visual clarity).
    2. Connect pin 6 through a 10kΩ/10kΩ voltage divider to set up a varying DC bias.
    3. Feed both through a simple multiplying circuit (two-resistor mix, or just connect pin 6 output through a 10kΩ into pin 9's load) — this is not true multiplication but creates a visible effect.
    4. View on oscilloscope: you should see the carrier amplitude changing slowly with the "audio" frequency.
    5. For a cleaner demo: use a second small Arduino (or a function generator if you have one) to do proper PWM mixing.
  - Note: true AM multiplication requires an actual analog multiplier (e.g., MC1496). This experiment is illustrative, not precise. The clean version can be built cheaply with an MC1496 or AD633 — consider this as a future build.
  - Insight: looking at AM on a scope is the same view your radio's envelope detector has.

#### Chapter 2.3 — Power: DC Input vs. RF Output
*ERC 32: 1.6 Power*
- DC input power: what comes from your power supply
- RF output power: what actually leaves the antenna
- Efficiency: why these are different (heat loss in PA stages)
- Typical efficiencies for different transmitter types
- PEP (Peak Envelope Power): the HAM standard for SSB power measurement
- **Widget:** Efficiency calculator — enter DC in and RF out, get efficiency %
- **Quiz:** 10 questions
- **🔬 Lab Activity — Measure TX Efficiency**
  - Goal: measure DC input power and RF output power of a real (low-power) transmitter
  - Equipment: multimeter, oscilloscope or RF power meter, dummy load
  - Components: a low-power transmitter (QRP rig, Baofeng, or even an Arduino RF signal experiment), 50Ω dummy load (4× 200Ω 1W resistors in parallel)
  - Procedure:
    1. Connect transmitter to dummy load.
    2. Measure DC input: voltage at power supply terminals while transmitting, and current in series with the supply lead. Calculate P_dc = V × I.
    3. Measure RF output power: if you have an RF power meter, read directly. Alternatively, probe across the dummy load with oscilloscope and calculate P_rf = (Vpeak / √2)² / 50.
    4. Calculate efficiency: η = P_rf / P_dc × 100%.
    5. Typical result: 50–65% for a class-C amplifier, 40–50% for class-B.
  - Insight: the "missing" power is heat. Put your hand near (not on) the PA heatsink — that heat is what the efficiency percentage represents.

---

### PART 3 — STATION EQUIPMENT
*ERC 32: Chapters 4 (Receivers) + 5 (Transmitters) + 6 (Antennas) + 8 (Measurements)*

#### Chapter 3.1 — Receivers: How Your Radio Hears
*ERC 32: 4.1–4.3 Receivers*
- The straight (TRF) receiver: the simplest approach and its limits
- The superheterodyne: the breakthrough that made modern radios possible
- Why mixing frequencies is useful: converting to a fixed IF
- Block-by-block walkthrough:
  - Antenna → RF amplifier → Mixer + Local Oscillator → IF amplifier → Detector → BFO → AF amplifier → Squelch
- Receiver for each mode: CW (A1A), AM (A3E), SSB (J3E), FM (F3E)
- **Diagram:** Interactive block diagram — click any stage for explanation
- **Quiz:** 10 questions
- **🔬 Lab Activity — Build a Crystal Radio (the Original TRF Receiver)**
  - Goal: build the simplest possible radio receiver with no active components
  - Equipment: multimeter (to test connections), oscilloscope (to see the detected signal if available)
  - Components: ferrite rod, 100 turns of 0.3mm wire (for the coil), variable capacitor (~500 pF), 1N34A germanium diode (or a Schottky BAT43), 1µF capacitor, high-impedance earphone or crystal earpiece, 10–20m wire as antenna, ground connection
  - Procedure:
    1. Wind 100 turns of wire on ferrite rod, with a tap at turn 10 for the antenna connection.
    2. Connect coil + variable capacitor in parallel (tuned tank circuit).
    3. Connect 1N34A diode across the tank circuit.
    4. Connect 1µF capacitor and crystal earpiece across the diode.
    5. Connect a 20m outdoor wire as antenna. Connect ground (water pipe or earth).
    6. Slowly tune the variable capacitor. You should hear local AM broadcast stations.
    7. Probe across the diode with oscilloscope — see the modulated RF signal. Probe after the capacitor — see the demodulated audio envelope.
  - Insight: the tuned tank circuit (your LC from Chapter 1.7) selects one station. The diode detects (demodulates) the AM. The capacitor removes the carrier. This is the complete AM detector stage of a real receiver — just without amplification.

#### Chapter 3.2 — Transmitters: How Your Radio Talks
*ERC 32: 5.1–5.3 Transmitters*
- Block-by-block walkthrough: Oscillator → Buffer → Frequency multiplier → Driver → PA → Output filter → Modulator
- Transmitter types: CW (A1A), SSB (J3E), FM (F3E)
- Key characteristics: frequency stability, RF bandwidth, spurious emissions, harmonics
- **Diagram:** Interactive TX block diagram — click stages for explanation
- **Quiz:** 10 questions
- **🔬 Lab Activity — Observe Harmonics with the VNA / Oscilloscope FFT**
  - Goal: see harmonics of a real signal; understand why TX output filters are mandatory
  - Equipment: VNA or oscilloscope with FFT function, dummy load, any low-power RF source
  - Procedure:
    1. Connect a signal source (e.g., Arduino with crystal oscillator, or a cheap signal generator) to the VNA port 1 or oscilloscope via a resistive attenuator to protect the instrument.
    2. Using VNA's spectrum mode or oscilloscope FFT (if your scope has it), look at the fundamental frequency.
    3. Zoom out on the frequency axis. You should see harmonics at 2×, 3×, 4× the fundamental frequency, each smaller than the previous.
    4. Now insert your low-pass filter from Chapter 1.8 between the source and the measurement point. Observe the harmonics being attenuated.
  - Insight: without that filter, harmonics from your transmitter land on TV channels, FM broadcast, or other amateur bands. The low-pass filter in every transmitter is not optional.

#### Chapter 3.3 — Antennas: The Most Important Part of Your Station
*ERC 32: 6.1–6.3 Antennas and Transmission Lines*
- The antenna's job: convert electrical energy into radio waves
- Resonance and antenna length
- Dipole, end-fed, quarter-wave vertical, Yagi
- Gain: dBd / dBi, ERP, EIRP
- Coaxial cable vs. twin feeder
- Impedance and SWR
- ATU: what it does and what it doesn't
- **Diagram:** Interactive dipole + Yagi radiation patterns
- **Widget:** Dipole length calculator
- **Quiz:** 10 questions
- **🔬 Lab Activity — Build a Dipole and Measure It with the VNA**
  - Goal: cut a dipole antenna for a specific frequency, measure its impedance and SWR
  - Equipment: VNA, SMA/BNC connector, coax cable, tape measure
  - Components: ~2m of thin wire (each leg of the dipole), a simple dipole centre piece (two binding posts, or even a choc-bloc strip connector)
  - Procedure:
    1. Choose target frequency: 144 MHz (2m band) is ideal — dipole is only 1m total (50cm each leg). Formula: total length (m) = 143 / f(MHz). At 144 MHz: 143/144 ≈ 0.993m, so ~50cm per leg.
    2. Cut two pieces of wire to 50cm each.
    3. Connect to VNA port 1 via a short piece of coax (VNA calibration must include the coax).
    4. Sweep 130–160 MHz on the VNA. Look at S11 (return loss) or SWR plot.
    5. Find the frequency of minimum SWR (best match). Is it close to 144 MHz?
    6. If too high: lengthen each leg slightly. If too low: trim each leg.
    7. Note the impedance at resonance on the Smith chart: a resonant dipole in free space is ≈73Ω resistive (your VNA will show you the actual measured value, which varies with height and nearby objects).
  - Bonus: measure a short piece of coaxial cable. The VNA shows you the cable's electrical length — a beautiful demonstration of standing waves.
  - Insight: this is what your SWR meter was showing you all along. The VNA adds the "why" — showing you the full impedance picture across a frequency range.

#### Chapter 3.4 — Measurements: Testing What You Built
*ERC 32: 8.1–8.2 Measurements*
- Multimeter: DC/AC voltage, current, resistance
- SWR meter: forward and reflected power, what SWR means
- Absorption wavemeter: finding an unknown frequency
- Dummy load: testing TX safely
- RF power measurement
- **Diagram:** Multimeter connection examples
- **Widget:** SWR to reflected power converter
- **Quiz:** 10 questions
- **🔬 Lab Activity — Full Station Measurement Session**
  - Goal: practice all measurement types as a connected sequence, as you would in a real station setup
  - Equipment: all instruments
  - Procedure (sequential, each step uses a different instrument):
    1. *Multimeter:* measure supply voltage at the transceiver terminals (should be 13.8V ±0.5V for a typical HF rig).
    2. *Multimeter:* measure supply current during transmit (key down, into dummy load). Calculate DC input power.
    3. *Dummy load + RF power meter:* measure RF output power. Calculate efficiency.
    4. *SWR meter:* replace dummy load with your dipole from Chapter 3.3. Read SWR. Should be <2:1 if the antenna is well cut.
    5. *VNA:* confirm SWR reading with VNA. Compare VNA reading to SWR meter reading — they should agree.
    6. *Oscilloscope:* probe the coax between SWR meter and antenna. Observe the RF waveform. Measure peak-to-peak voltage, calculate power: P = Vpeak² / (2 × 50Ω).
  - Insight: every instrument gives you a different window into the same physical reality. Learning to cross-check measurements is a professional habit.

---

### PART 4 — PROPAGATION, INTERFERENCE, REGULATIONS AND OPERATIONS
*ERC 32: Chapter 7 (Propagation) + Chapter 9 (Interference) + Chapter 10 (Safety) + Operating procedures + Regulations*

#### Chapter 4.1 — Frequency Spectrum and Propagation
*ERC 32: Chapter 7*
- Line-of-sight, ground wave, sky wave
- Ionospheric layers: D, E, F1, F2 and HF propagation
- Fading, tropospheric ducting
- Sunspot cycle and solar flux
- HF vs. VHF/UHF propagation characteristics
- HAM band allocation overview
- **Diagram:** Animated ionospheric skip
- **Diagram:** World map — HF grey-line propagation
- **Quiz:** 10 questions
- **🔬 Lab Activity — Propagation Observation Log**
  - Goal: observe real propagation changes and correlate with theory
  - Equipment: your HAM radio receiver, optionally the DX cluster or online tools (DXmaps.com, VOACAP, DX Summit)
  - Procedure:
    1. On 40m (7 MHz) in the evening: tune across the band and note the farthest stations you can hear. Log: time, frequency, callsign, approximate distance.
    2. Try again at noon. The D-layer absorbs 40m during the day — fewer signals from far away.
    3. On 10m (28 MHz): try during good solar conditions (solar flux > 120). When the band is open, you hear stations from thousands of km on a small antenna.
    4. Check solar flux index (spaceweather.com or hamqsl.com widget). Note whether high solar flux correlates with better 10m propagation.
    5. Track observations over a week. Pattern: 40m best at night; 10m/15m best at noon during high solar flux.
  - Insight: this is not a circuit experiment — it's the real sky as your laboratory. Propagation theory becomes real the first time you hear a JA (Japan) station on 10m with 10W and a wire antenna.

#### Chapter 4.2 — Interference and EMC
*ERC 32: Chapter 9*
- What interference is and what your TX can interfere with
- Harmonics, spurious emissions, overloading
- Interference coupling paths
- Remedies: filtering, decoupling, shielding, ferrites
- **Diagram:** Interference coupling paths (interactive)
- **Quiz:** 10 questions
- **🔬 Lab Activity — Demonstrate and Cure RFI**
  - Goal: deliberately create RFI on audio equipment and then cure it with ferrite cores
  - Equipment: Arduino (as RF source), small powered speaker or radio with audio output, ferrite snap-on cores (type 31 material)
  - Procedure:
    1. Place Arduino running a high-frequency PWM sketch (acts as a rough RF source) within 30cm of a powered speaker or AM radio.
    2. Observe: buzzing or interference in the speaker audio proportional to PWM frequency.
    3. Snap a ferrite core onto the speaker cable near the speaker. Does the buzzing reduce?
    4. Add a second ferrite core closer to the source. Add a third. With 3 cores, the interference should be significantly attenuated.
    5. Try wrapping the cable multiple times through a single toroidal ferrite — each pass multiplies the impedance by N².
  - Insight: the ferrite core is an RF choke for the cable. You are filtering the cable as a path for RF — exactly what a professional EMC engineer does. Every ferrite bead inside a PC or phone exists for this reason.

#### Chapter 4.3 — Safety
*ERC 32: Chapter 10*
- Electrical shock: consequences and precautions
- Mains wiring colour codes and fuses
- High voltages and charged capacitors
- RF safety and SAR
- Lightning protection
- **Checklist:** Pre-operation safety checklist (interactive, printable)
- **Quiz:** 10 questions
- **🔬 Lab Activity — Station Grounding and Lightning Protection Inspection**
  - Goal: inspect and improve your station's grounding; no high voltages involved
  - Equipment: multimeter (continuity setting)
  - Procedure:
    1. With the station powered OFF: trace every piece of equipment to its mains earth. Check that each mains plug has a functioning earth (continuity from equipment chassis to the earth pin of the plug).
    2. Check your coaxial cable braid: measure resistance from antenna connector outer shell to equipment chassis. Should be <1Ω (near zero). High resistance here means an RF ground problem.
    3. Inspect the antenna feedthrough point: is there a lightning arrestor? Is it bonded to building earth? If not, plan to add one.
    4. Check for any capacitors in equipment that might hold charge after power-off (look for large electrolytics in PA stages). Note any equipment that needs discharge precautions.
    5. Create a laminated safety checklist to stick next to the station.
  - Insight: most station accidents are not exotic — they are grounding omissions and forgotten capacitor charges. This inspection turns abstract safety rules into station-specific habits.

#### Chapter 4.4 — Operating Procedures
*ERC 32: b) Operating Rules and Procedures*
- Phonetic alphabet, Q-codes, operational abbreviations
- Structure of a QSO; RST system
- Call signs: structure, prefixes, national
- Content of transmissions and code of conduct
- **Widget:** Phonetic alphabet practice
- **Widget:** Q-code flashcards
- **Quiz:** 15 questions
- **🔬 Lab Activity — Your First Deliberate QSO (structured practice)**
  - Goal: practice a complete QSO using correct procedure, with deliberate attention to each element
  - Equipment: your HAM radio
  - Procedure:
    1. Choose a local repeater or a quiet simplex frequency.
    2. Before transmitting: write out what you plan to say for each part of the exchange (CQ call, response, signal report, name and QTH, closing).
    3. Make the contact. After the QSO, review your log entry and note any procedure mistakes.
    4. Repeat the next day with a different band and mode.
    5. Over several sessions: practice using all Q-codes naturally (not reading from a list).
  - Note: this is the only "lab activity" that requires another human. If you're practising alone, a recording exercise — talking into a recorder and playing it back — is a useful substitute to catch habits like forgetting phonetics or saying "over" at the wrong time.

#### Chapter 4.5 — Regulations
*ERC 32: c) National and International Regulations*
- ITU, Amateur Service definition, Article 25, Radio Regions
- CEPT, HAREC, ECC Recommendation (05)06
- National licence conditions: bands, power, modes
- Frequency allocation chart
- Station log: purpose, content, retention
- **Diagram:** World map — click a region to see its amateur bands
- **Quiz:** 10 questions
- No lab activity for this chapter — the "lab" is your local regulator's website and your own licence conditions document.

---

## Interactive Widget Ideas (shared across chapters)

| Widget | Where used |
|---|---|
| Ohm's Law triangle calculator | Ch 1.2 |
| SI prefix / unit converter | Ch 0.3 |
| dB ↔ ratio ↔ dBm converter | Ch 0.4 |
| Sine wave visualiser (frequency, amplitude, phase) | Ch 1.3 |
| Resistor colour code decoder | Ch 1.4 |
| Series/parallel resistor/capacitor calculator | Ch 1.4, 1.5 |
| RC time constant calculator | Ch 1.5 |
| LC resonance frequency calculator | Ch 1.7 |
| Filter frequency response plotter | Ch 1.8 |
| λ ↔ f converter | Ch 2.1 |
| Modulation bandwidth visualiser | Ch 2.2 |
| Dipole length calculator | Ch 3.3 |
| SWR to reflected power converter | Ch 3.4 |
| dBm ↔ Watts ↔ dBW converter | Ch 0.4, 3.3 |
| Phonetic alphabet speller | Ch 4.4 |
| Q-code flashcards | Ch 4.4 |
| TX efficiency calculator | Ch 2.3 |

---

## Lab Activity Summary Table

| Chapter | Lab Activity | Equipment |
|---|---|---|
| 0.2 | Your First Measurement | Multimeter, Oscilloscope, Arduino |
| 0.4 | Measuring dB with a Voltage Divider | Multimeter |
| 1.1 | Conductors and Insulators | Multimeter |
| 1.2 | Verify Ohm's Law | Multimeter, breadboard |
| 1.3 | See DC and AC on the Oscilloscope | Oscilloscope, Arduino |
| 1.4 | Colour Code + Voltage Divider | Multimeter, breadboard |
| 1.5 A | RC Time Constant | Oscilloscope, Arduino |
| 1.5 B | Capacitor Blocks DC / Passes AC | Multimeter, Oscilloscope, Arduino |
| 1.6 | Wind a Coil and Measure It | **VNA** |
| 1.7 | Find Resonance | **VNA** |
| 1.8 | Build and Plot a Low-Pass Filter | **VNA** |
| 1.9 | Transformer Turns Ratio | Oscilloscope, Arduino |
| 1.10 A | Half-Wave Rectifier | Oscilloscope, Arduino |
| 1.10 B | Transistor as a Switch | Arduino, Multimeter |
| 2.1 | Wire Radiation Demo | Oscilloscope, Arduino |
| 2.2 | Visualise AM Modulation | Oscilloscope, Arduino |
| 2.3 | Measure TX Efficiency | Multimeter, RF power meter / Oscilloscope |
| 3.1 | Crystal Radio (TRF Receiver Build) | (components only) |
| 3.2 | Observe Harmonics | **VNA** / Oscilloscope FFT |
| 3.3 | Build and Measure a Dipole | **VNA** |
| 3.4 | Full Station Measurement Session | All instruments |
| 4.1 | Propagation Observation Log | HAM radio |
| 4.2 | Demonstrate and Cure RFI | Arduino, ferrite cores |
| 4.3 | Station Grounding Inspection | Multimeter |
| 4.4 | Structured QSO Practice | HAM radio |

---

## Quiz System Design

Each chapter ends with 10–15 multiple-choice questions. The quiz component:
- Shows one question at a time
- Immediate feedback after each answer (correct/incorrect + brief explanation)
- Score at the end with chapter link for topics answered wrong
- No backend required — all answers are embedded in the page
- Progress can optionally be stored in `localStorage`

---

## Implementation Phases

### Phase 0 — Scaffolding (Do Once)
- [ ] Initialize Vite + React + TypeScript project
- [ ] Configure Tailwind CSS
- [ ] Set up GitHub repository and GitHub Pages deployment (via GitHub Actions)
- [ ] Build basic site layout: nav, chapter list sidebar, content area
- [ ] Build reusable `<Quiz>` component
- [ ] Build reusable `<LabActivity>` collapsible component (coloured differently to distinguish from main text)
- [ ] Build reusable Diagram/Widget shell components

### Phase 1 — Core Foundations (Chapters 0.1–0.4)
- [ ] Chapter 0.1: How to Use This Site
- [ ] Chapter 0.2: Lab Bench Setup
- [ ] Chapter 0.3: Math Toolkit
- [ ] Chapter 0.4: The Decibel

### Phase 2 — Electricity and Circuits (Chapters 1.1–1.10)
One chapter at a time. Each chapter is a GitHub commit + PR.

### Phase 3 — Radio Theory (Chapters 2.1–2.3)

### Phase 4 — Station Equipment (Chapters 3.1–3.4)

### Phase 5 — Propagation, Interference, Safety, Operating, Regulations (Chapters 4.1–4.5)

---

## ERC Report 32 Coverage Map

| ERC 32 Section | Covered In |
|---|---|
| 1.1 Conductivity, Ohm's Law, Power | Ch 1.1, 1.2 |
| 1.2 Sources of electricity | Ch 1.3 |
| 1.3 Radio Waves | Ch 2.1 |
| 1.4 Audio and digital signals | Ch 2.2 |
| 1.5 Modulated signals | Ch 2.2 |
| 1.6 Power (DC/RF) | Ch 2.3 |
| 2.1 Resistor | Ch 1.4 |
| 2.2 Capacitor | Ch 1.5 |
| 2.3 Coil | Ch 1.6 |
| 2.4 Transformers | Ch 1.9 |
| 2.5 Diode | Ch 1.10 |
| 2.6 Transistor | Ch 1.10 |
| 2.7 Tuned circuits | Ch 1.7 |
| 3.1 Filters | Ch 1.8 |
| 4.1–4.3 Receivers | Ch 3.1 |
| 5.1–5.3 Transmitters | Ch 3.2 |
| 6.1–6.3 Antennas + TX lines | Ch 3.3 |
| 7 Frequency spectrum + propagation | Ch 4.1 |
| 8.1–8.2 Measurements | Ch 3.4 |
| 9.1–9.3 Interference and immunity | Ch 4.2 |
| 10.1–10.4 Safety | Ch 4.3 |
| b1 Phonetic alphabet | Ch 4.4 |
| b2 Q-code | Ch 4.4 |
| b3 Operational abbreviations | Ch 4.4 |
| b4 Call signs | Ch 4.4 |
| b5 Operating competences | Ch 4.4 |
| c1 ITU Radio Regulations | Ch 4.5 |
| c2 CEPT Regulations | Ch 4.5 |
| c3 National laws + licence | Ch 4.5 |

---

## Reference Books Available

- **ERC Report 32** — CEPT Amateur Radio Novice Examination Syllabus (uploaded ✓)
- **ARRL Handbook 100th Edition (2023)** — comprehensive technical reference
- Additional books TBD

---

## Notes on Content Philosophy

1. **Analogy before equation.** Introduce every concept with a physical or everyday analogy first. The math comes after, as a way to make the analogy precise — not as a replacement for it.

2. **Spiral learning.** Concepts like impedance, resonance, and dB appear in multiple chapters at increasing depth. Meeting them several times from different angles builds real understanding.

3. **Real radio examples.** Every concept should connect back to something the reader has touched or heard on air. "This is why your 80m dipole doesn't work on 40m without an ATU."

4. **No assumed knowledge of calculus.** Ohm's Law, resonance, power — all can be taught to the required depth without calculus. Any formula used gets a worked example and a calculator widget.

5. **Honest about limits.** Where a full explanation would require calculus or advanced EM theory, say so — and provide enough intuition to work with the concept in practice, plus a pointer for those who want to go deeper.

6. **Lab activities bridge the gap.** Theory understood is different from theory experienced. Where possible, connect every abstract result to something measurable on the bench. The VNA especially transforms RF concepts from invisible to visible — use it liberally.

7. **The VNA is a superpower.** Most amateur radio learners never get to use a VNA. It shows resonance, filter response, antenna impedance, and SWR all in one sweep. Chapters that touch RF phenomena should default to "let's verify this on the VNA" as a natural step.
