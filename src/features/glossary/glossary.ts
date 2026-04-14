/**
 * Centralized glossary of HAM radio / electronics terms.
 *
 * `tip`    — 1-sentence hover tooltip (quick peek)
 * `detail` — longer explanation for the pinned popup reference card
 * `unit`   — SI unit / symbol (optional)
 * `formula`— key equation (optional)
 * `see`    — related glossary keys (optional)
 */

export interface GlossaryEntry {
  tip: string
  detail: string
  unit?: string
  formula?: string
  see?: string[]
}

export const glossary: Record<string, GlossaryEntry> = {
  // ── Common abbreviations ─────────────────────────────────────────
  ac: {
    tip: 'Alternating Current — electric current that reverses direction periodically.',
    detail:
      'AC (Alternating Current) flows back and forth, changing direction many times per second. The number of direction changes per second is the frequency (measured in Hz). Household mains power is AC (50 or 60 Hz depending on country). Most radio signals are AC at much higher frequencies. AC behaves differently from DC in circuits — capacitors and inductors respond to it in ways they don\'t to DC.',
    see: ['dc', 'frequency', 'rms'],
  },
  dc: {
    tip: 'Direct Current — electric current that flows in one direction only.',
    detail:
      'DC (Direct Current) flows steadily from positive to negative. Batteries produce DC. Most electronic circuits run on DC power internally, even if they plug into an AC wall outlet (a power supply converts AC to DC). When you measure a battery with a multimeter, you use the DC voltage mode.',
    see: ['ac', 'voltage'],
  },
  fm: {
    tip: 'Frequency Modulation — a method of encoding audio onto a radio wave by varying its frequency.',
    detail:
      'FM (Frequency Modulation) carries information by slightly shifting the frequency of the carrier wave up and down. It produces higher-fidelity audio and better noise rejection than AM, which is why FM is used for music broadcasting (the FM band runs from 88 to 108 MHz in most countries). In amateur radio, FM is the standard mode on VHF/UHF repeaters.',
    see: ['frequency', 'ac'],
  },
  am: {
    tip: 'Amplitude Modulation — a method of encoding audio onto a radio wave by varying its strength.',
    detail:
      'AM (Amplitude Modulation) carries information by varying the strength (amplitude) of the carrier wave while keeping the frequency constant. It was the first voice modulation technique used in radio. The AM broadcast band runs from about 530 to 1700 kHz. AM is simpler but more susceptible to noise than FM.',
    see: ['frequency', 'ac'],
  },
  led: {
    tip: 'Light-Emitting Diode — a diode that gives off light when current flows through it.',
    detail:
      'An LED is a special type of diode that emits light when forward-biased. LEDs are polarised — the longer leg is positive (anode) and the shorter leg is negative (cathode). They always need a current-limiting resistor in series to avoid burning out. Different colours have different forward voltage drops (red ≈ 1.8V, blue/white ≈ 3.0V).',
    see: ['diode', 'resistor'],
  },
  usb: {
    tip: 'Universal Serial Bus — standard connector for data transfer and power.',
    detail:
      'USB (Universal Serial Bus) is the most common way to connect peripherals to a computer. In electronics prototyping, USB provides both a data connection (for programming microcontrollers like Arduino) and a 5V power supply. USB-A is the rectangular plug; USB-B and USB-C are other shapes you\'ll see on development boards.',
  },
  si: {
    tip: 'Système International — the modern metric system used worldwide for scientific measurements.',
    detail:
      'SI (Système International d\'Unités) is the international standard for units of measurement. In electronics and radio, SI gives us the volt (V), ampere (A), ohm (Ω), farad (F), henry (H), hertz (Hz), and watt (W). SI prefixes like kilo (k), mega (M), and giga (G) let us express very large or very small values without writing long strings of zeros.',
    see: ['frequency', 'capacitance', 'resistance'],
  },
  farad: {
    tip: 'The SI unit of capacitance — how much charge a capacitor can store per volt.',
    detail:
      'One farad (F) means the capacitor stores one coulomb of charge when one volt is applied. A farad is an enormous amount of capacitance — most real capacitors are measured in microfarads (µF = 10⁻⁶ F), nanofarads (nF = 10⁻⁹ F), or picofarads (pF = 10⁻¹² F). Electrolytics used in power supplies are typically 10–1000 µF; ceramic capacitors for RF work are often 10–100 pF.',
    unit: 'Farad (F)',
    see: ['capacitance', 'si'],
  },
  gnd: {
    tip: 'Ground — the zero-volt reference point in a circuit.',
    detail:
      'GND (ground) is the common reference point that all voltages in a circuit are measured against. It\'s the "zero" level. On a breadboard, the blue rail is typically used for ground. On an Arduino, the pin labelled GND connects to the board\'s ground plane. Every circuit needs a complete path back to ground for current to flow.',
    see: ['voltage', 'power rails'],
  },
  ide: {
    tip: 'Integrated Development Environment — software for writing and uploading code.',
    detail:
      'An IDE (Integrated Development Environment) is an application where you write, edit, and upload code to a microcontroller. The Arduino IDE is a simple, beginner-friendly IDE that lets you write sketches (programs), compile them, and upload them to your Arduino board over USB with a single click.',
  },
  arrl: {
    tip: 'American Radio Relay League — the main ham radio organisation in the US.',
    detail:
      'The ARRL (American Radio Relay League) is the national association for amateur radio in the United States, founded in 1914. They publish The ARRL Handbook, one of the most comprehensive references for radio and electronics. They also administer licence exams, represent amateurs to regulators, and run contests and award programs.',
  },
  cept: {
    tip: 'European Conference of Postal and Telecommunications Administrations.',
    detail:
      'CEPT (Conférence Européenne des administrations des Postes et des Télécommunications) is a European organisation that coordinates telecommunications policy. For ham radio operators, the CEPT licence is important because it allows European amateurs to operate in other CEPT member countries without obtaining a separate licence. The CEPT Novice syllabus defines what beginner radio operators need to learn.',
  },
  erc: {
    tip: 'European Radiocommunications Committee — sets radio regulation guidelines.',
    detail:
      'The ERC (European Radiocommunications Committee) was part of CEPT, responsible for radio spectrum regulation in Europe. ERC Report 32 defines the syllabus and examination standards for amateur radio licences across CEPT member countries. It has since been succeeded by the ECC (Electronic Communications Committee), but the report numbers are still widely referenced.',
    see: ['cept'],
  },
  lc: {
    tip: 'Inductor-Capacitor circuit — resonates at a specific frequency.',
    detail:
      'An LC circuit combines an inductor (L) and a capacitor (C). Together they pass energy back and forth between the magnetic field of the inductor and the electric field of the capacitor, oscillating at a natural resonant frequency. LC circuits are fundamental to radio — they are used in tuning circuits, filters, and oscillators to select or reject specific frequencies.',
    formula: 'f = 1 / (2π√(LC))',
    see: ['inductor', 'capacitor', 'frequency'],
  },

  // ── Electrical fundamentals ──────────────────────────────────────
  voltage: {
    tip: 'The electrical "pressure" that pushes charges through a circuit.',
    detail:
      'Voltage (also called electromotive force or potential difference) is the energy per unit charge that drives current through a conductor. Think of it as water pressure in a pipe — higher voltage means more push. It is always measured between two points; a single point has no voltage on its own.',
    unit: 'Volt (V)',
    formula: 'V = I × R  (Ohm\'s Law)',
    see: ['current', 'resistance'],
  },
  current: {
    tip: 'The flow of electric charge through a conductor.',
    detail:
      'Current is the rate at which electric charge passes a point in a circuit, measured in amperes. Conventional current flows from positive to negative; electron flow is the opposite direction. In a series circuit, current is the same everywhere. In parallel branches, it divides.',
    unit: 'Ampere (A)',
    formula: 'I = V / R',
    see: ['voltage', 'resistance'],
  },
  resistance: {
    tip: 'The opposition to current flow in a material.',
    detail:
      'Resistance converts electrical energy into heat. Every conductor has some resistance; insulators have very high resistance. Resistors are components designed to provide a precise, known resistance. In series they add up; in parallel the total is less than any individual value.',
    unit: 'Ohm (Ω)',
    formula: 'R = V / I',
    see: ['voltage', 'current', 'impedance'],
  },
  impedance: {
    tip: 'Total opposition to AC current, combining resistance and reactance.',
    detail:
      'Impedance extends the concept of resistance to AC circuits. It has two parts: resistance (energy lost as heat) and reactance (energy stored and returned by capacitors and inductors). Impedance is a complex number — its magnitude tells you how much the circuit opposes current, and its angle tells you how much voltage and current are out of step.',
    unit: 'Ohm (Ω)',
    formula: 'Z = R + jX',
    see: ['resistance', 'swr'],
  },
  'voltage divider': {
    tip: 'Two resistors in series that split an input voltage into a smaller output voltage.',
    detail:
      'A voltage divider is one of the most common circuits in electronics. Two resistors (R₁ and R₂) are connected in series across a voltage source. The output is taken from the junction between them. The output voltage is Vout = Vin × R₂ / (R₁ + R₂). Voltage dividers are used for biasing transistors, reading sensors, and setting reference voltages. They only work correctly when the load impedance is much higher than the divider resistance.',
    formula: 'Vout = Vin × R₂ / (R₁ + R₂)',
    see: ['voltage', 'resistance'],
  },
  'scientific notation': {
    tip: 'A way of writing very large or very small numbers as a mantissa times a power of 10.',
    detail:
      'Scientific notation expresses any number in the form a × 10ⁿ, where a (the mantissa) is between 1 and 10, and n (the exponent) is an integer. For example, 2,400,000,000 Hz = 2.4 × 10⁹ Hz. Engineering notation is a variant where the exponent is always a multiple of 3, aligning with SI prefixes (kilo, mega, giga). Scientific notation makes arithmetic with very large or very small numbers much easier — you add exponents when multiplying and subtract when dividing.',
    see: ['frequency'],
  },
  capacitance: {
    tip: 'The ability to store energy in an electric field between two plates.',
    detail:
      'A capacitor stores charge on two conductive plates separated by an insulator (dielectric). Larger plates, closer spacing, and higher-permittivity dielectrics all increase capacitance. Capacitors block DC but pass AC — the higher the frequency, the lower the opposition (capacitive reactance). They are essential in filters, tuning circuits, and power supplies.',
    unit: 'Farad (F)',
    formula: 'Xc = 1 / (2πfC)',
    see: ['impedance', 'frequency'],
  },
  continuity: {
    tip: 'A test that checks whether current can flow between two points.',
    detail:
      'In continuity mode, the multimeter sends a tiny current through the probes and beeps if the resistance is very low (typically under 30 Ω). Use it to verify wires are intact, solder joints are solid, and fuses haven\'t blown. Always test with power off — applying external voltage in this mode can damage the meter.',
    see: ['multimeter', 'resistance'],
  },
  'diode testing': {
    tip: 'A meter mode that checks whether a diode conducts in one direction only.',
    detail:
      'The multimeter applies a small voltage (usually 0.5–0.7 V) across the diode. In the forward direction, you\'ll read the forward voltage drop (around 0.6 V for silicon). In reverse, you should read "OL" (open line). If it conducts both ways, the diode is shorted; if it conducts neither way, it\'s open.',
    see: ['multimeter'],
  },

  // ── Instruments ──────────────────────────────────────────────────
  multimeter: {
    tip: 'Handheld instrument that measures voltage, current, and resistance.',
    detail:
      'The multimeter (often called a DMM — Digital MultiMeter) is the most-used bench instrument. It typically offers DC and AC voltage, DC and AC current, resistance, continuity, diode test, and often capacitance and frequency modes. Always check which mode and range you\'re in before probing — the wrong mode can blow the internal fuse or damage the meter.',
    see: ['voltage', 'current', 'resistance', 'continuity'],
  },
  oscilloscope: {
    tip: 'Instrument that graphs voltage against time, showing signal shapes.',
    detail:
      'Where a multimeter gives you one number (the RMS or DC value), the oscilloscope shows you the complete waveform — amplitude, frequency, rise time, noise, distortion, and timing relationships between signals. The two key controls are time/div (horizontal scale) and volt/div (vertical scale). Modern digital scopes also do FFT, protocol decode, and automatic measurements.',
    see: ['time/div', 'volt/div', 'rms'],
  },
  vna: {
    tip: 'Vector Network Analyser — measures how circuits respond across frequencies.',
    detail:
      'A VNA sweeps a signal across a range of frequencies and measures both the magnitude and phase of the reflected and transmitted signals. This gives you impedance, SWR, return loss, insertion loss, and S-parameters — everything you need to characterise antennas, filters, and transmission lines. Must be calibrated before each measurement session using open/short/load standards.',
    see: ['impedance', 'swr', 'calibrated'],
  },
  'time/div': {
    tip: 'Oscilloscope control: how much time each horizontal grid division represents.',
    detail:
      'Turning the time/div knob stretches or compresses the horizontal axis. A setting of 1 ms/div means each of the (usually 10) grid squares spans 1 millisecond, so the full screen shows 10 ms. To see a 1 kHz signal (1 ms period) comfortably, set time/div so 2–3 complete cycles fill the screen — around 0.5 ms/div.',
    see: ['oscilloscope', 'volt/div', 'frequency'],
  },
  'volt/div': {
    tip: 'Oscilloscope control: how many volts each vertical grid division represents.',
    detail:
      'Adjusting volt/div scales the vertical axis. A 5 V peak-to-peak signal at 2 V/div will span 2.5 divisions on screen. If the waveform is clipped (flat top/bottom), increase volt/div. If it\'s too small to read, decrease it. Most probes have a 10× attenuation switch that effectively multiplies your volt/div setting by 10.',
    see: ['oscilloscope', 'time/div'],
  },
  calibrated: {
    tip: 'Removing cable and adapter errors from VNA measurements.',
    detail:
      'VNA calibration uses three known standards — an open circuit, a short circuit, and a precision 50 Ω load — to mathematically remove the effects of cables, connectors, and adapters from your measurements. Without calibration, the VNA is measuring its own cables as much as your device. Calibrate every time you change cables, adapters, or frequency range.',
    see: ['vna', 'impedance'],
  },
  swr: {
    tip: 'Standing Wave Ratio — how well impedances are matched.',
    detail:
      'When a transmitter\'s output impedance doesn\'t match the antenna\'s impedance, some power reflects back. SWR quantifies this mismatch: 1:1 means perfect match (zero reflection), 2:1 means about 11% of power is reflected, and 3:1 means 25% reflected. High SWR wastes power and can damage transmitters. Most radios want SWR below 2:1.',
    formula: 'SWR = (1 + |Γ|) / (1 − |Γ|)',
    see: ['impedance', 'vna'],
  },

  arduino: {
    tip: 'A small, inexpensive microcontroller board popular for electronics projects.',
    detail:
      'An Arduino is an open-source circuit board with a programmable chip. You write simple programs (called sketches) on your computer and upload them via USB. The board can then generate signals, read sensors, and control outputs. In this course we use it purely as a handy signal source — its PWM pins produce square waves at controllable frequencies, which is all we need for bench experiments.',
    see: ['pwm', 'ide', 'usb'],
  },

  // ── Signals & waveforms ──────────────────────────────────────────
  pwm: {
    tip: 'Pulse Width Modulation — square wave with controllable on/off ratio.',
    detail:
      'PWM rapidly switches a pin between high and low voltage. The duty cycle (percentage of time spent high) controls the average output voltage. At 50% duty cycle, a 5 V PWM signal averages 2.5 V. Arduino uses PWM for analogWrite() and tone(). It\'s useful for dimming LEDs, controlling motors, and generating test signals.',
    see: ['square wave', 'frequency'],
  },
  'square wave': {
    tip: 'A signal that alternates sharply between two voltage levels.',
    detail:
      'A square wave spends equal time at a high voltage and a low voltage with near-instant transitions. It\'s the simplest AC waveform and contains the fundamental frequency plus all odd harmonics (3rd, 5th, 7th…). This harmonic content is why a square wave sounds buzzy compared to a smooth sine wave, and why it\'s useful for testing filter response.',
    see: ['frequency', 'pwm', 'rms'],
  },
  frequency: {
    tip: 'How many times a signal repeats per second.',
    detail:
      'Frequency is the reciprocal of period (the time for one complete cycle). A 1 kHz signal completes 1000 cycles per second, with each cycle lasting 1 ms. In radio, frequency determines which band you\'re operating in, how signals propagate, and what size antenna you need (antenna length is related to wavelength, which is inversely proportional to frequency).',
    unit: 'Hertz (Hz)',
    formula: 'f = 1 / T  •  λ = c / f',
    see: ['time/div'],
  },
  rms: {
    tip: 'Root Mean Square — the effective DC-equivalent value of an AC signal.',
    detail:
      'RMS is the value of AC voltage or current that delivers the same power as an equivalent DC value. For a sine wave, RMS = peak × 0.707. For a 50% duty cycle square wave, RMS = peak × 0.707 as well. Most multimeters display RMS readings. True-RMS meters measure the actual waveform; cheaper meters assume a sine wave and can give wrong readings for non-sinusoidal signals.',
    formula: 'V_rms = V_peak / √2  (sine wave)',
    see: ['voltage', 'oscilloscope'],
  },

  // ── Components ───────────────────────────────────────────────────
  resistor: {
    tip: 'Passive component that limits current flow.',
    detail:
      'Resistors are the most common electronic component. Their value in ohms sets the ratio of voltage to current (Ohm\'s Law). Colour bands encode the value: the first bands give significant digits, followed by a multiplier and tolerance band. Power rating matters too — exceed it and the resistor overheats.',
    unit: 'Ohm (Ω)',
    formula: 'V = I × R',
    see: ['resistance', 'voltage', 'current'],
  },
  capacitor: {
    tip: 'Stores energy in an electric field. Blocks DC, passes AC.',
    detail:
      'Capacitors come in many types: ceramic (small, cheap, unpolarised), electrolytic (large values, polarised — watch the polarity!), and film (precise, stable). In AC circuits, a capacitor\'s opposition to current (reactance) decreases with frequency — this is why capacitors are used in filters and tuning circuits.',
    unit: 'Farad (F)',
    formula: 'Xc = 1 / (2πfC)',
    see: ['capacitance', 'impedance'],
  },
  inductor: {
    tip: 'Coil of wire that stores energy in a magnetic field.',
    detail:
      'An inductor opposes changes in current by generating a back-EMF. Its reactance increases with frequency — the opposite behaviour to a capacitor. Combined with a capacitor, it forms an LC circuit that resonates at a specific frequency. Inductors are essential in RF filters, matching networks, and power supplies.',
    unit: 'Henry (H)',
    formula: 'XL = 2πfL',
    see: ['impedance', 'frequency'],
  },
  diode: {
    tip: 'Semiconductor that allows current in one direction only.',
    detail:
      'A diode has an anode (+) and cathode (−). Current flows easily from anode to cathode (forward biased) with a small voltage drop (0.6 V for silicon, 0.3 V for Schottky). In reverse, almost no current flows until the breakdown voltage is reached. Diodes are used for rectification (AC→DC), protection, and signal detection.',
    see: ['diode testing'],
  },
  antenna: {
    tip: 'Converts electrical signals to radio waves and vice versa.',
    detail:
      'An antenna is a conductor sized to efficiently radiate or receive electromagnetic waves at a particular frequency. A half-wave dipole (the most fundamental antenna) has a total length of approximately half the wavelength. Impedance matching between the antenna and feedline is critical — poor matching means reflected power and reduced range.',
    formula: 'λ/2 dipole length ≈ 143 / f(MHz) metres',
    see: ['impedance', 'swr', 'frequency'],
  },

  'input impedance': {
    tip: 'How much an instrument resists the signal it is measuring — higher is better.',
    detail:
      'Input impedance is the resistance (and reactance) that a measuring instrument presents to the circuit under test. An oscilloscope typically has 1 MΩ (one million ohms) input impedance, meaning it draws almost no current from the circuit and barely affects the measurement. A multimeter in voltage mode also has very high input impedance. The rule of thumb: the measuring device should have at least 10× the impedance of the circuit being measured so it doesn\'t change what you\'re trying to observe.',
    unit: 'Ohm (Ω)',
    see: ['impedance', 'oscilloscope'],
  },
  'peak-to-peak': {
    tip: 'The full swing of a signal from its lowest point to its highest point.',
    detail:
      'Peak-to-peak voltage (Vpp) measures the total vertical distance of a waveform — from its minimum to its maximum. For a 0–5 V square wave, Vpp is 5 V. For a sine wave centered on zero with peaks at ±3 V, Vpp is 6 V. This is different from RMS voltage (which gives the effective DC-equivalent value) and from peak voltage (measured from zero to the top). Oscilloscopes commonly display Vpp; multimeters typically display RMS.',
    unit: 'Volts (V)',
    see: ['rms', 'voltage', 'oscilloscope'],
  },
  cursor: {
    tip: 'Moveable measurement lines on an oscilloscope screen.',
    detail:
      'Cursors are on-screen markers you can drag across the waveform to measure precise time intervals or voltage differences. Most oscilloscopes have two horizontal cursors (for voltage) and two vertical cursors (for time). Place one cursor on the start of a feature and the other on the end — the oscilloscope calculates the difference automatically. Cursors are more accurate than eyeballing the grid divisions.',
    see: ['oscilloscope', 'time/div', 'volt/div'],
  },

  // ── Breadboard ───────────────────────────────────────────────────
  breadboard: {
    tip: 'Prototyping board for building circuits without soldering.',
    detail:
      'A breadboard has a grid of holes with internal metal clips that connect groups of holes together. The long edge rails run the full length (used for power and ground). The main area has short rows of 5 holes connected vertically, split by a center gap sized for DIP IC packages. Components push into the holes and are held by spring contacts.',
    see: ['power rails', 'dip chip'],
  },
  'power rails': {
    tip: 'Long horizontal strips on a breadboard for supply voltage and ground.',
    detail:
      'Power rails (also called bus strips) run along the top and bottom edges, marked with red (+) and blue (−) lines. They are connected horizontally for the full length of the board. Connect your power supply to one end and every point along the rail has the same voltage. Some breadboards have a break in the middle — use a jumper wire to bridge it if needed.',
    see: ['breadboard'],
  },
  'dip chip': {
    tip: 'Dual Inline Package — IC with two rows of pins for breadboard use.',
    detail:
      'DIP (Dual Inline Package) is the classic through-hole IC format with pins spaced 0.1" (2.54 mm) apart in two parallel rows. The center gap on a breadboard is exactly the right width for a DIP chip to straddle it, putting each pin in its own isolated row for easy wiring. DIP packages are being replaced by surface-mount in production, but remain ideal for prototyping.',
    see: ['breadboard'],
  },

  // ── Radio / propagation ──────────────────────────────────────────
  hf: {
    tip: 'High Frequency — the 3–30 MHz range used for long-distance radio.',
    detail:
      'The HF band is the backbone of amateur long-distance (DX) communication. Signals in this range can refract off the ionosphere and bounce back to earth, repeating multiple times to reach worldwide distances. Propagation depends heavily on solar activity, time of day, and season. Lower HF bands (3–7 MHz) work better at night; higher bands (14–28 MHz) during the day.',
    see: ['ionosphere', 'skywave'],
  },
  ionosphere: {
    tip: 'Charged upper atmosphere layers that refract HF radio waves back to earth.',
    detail:
      'The ionosphere (60–1000 km altitude) contains several layers (D, E, F1, F2) of gas ionised by solar radiation. The F2 layer is most important for HF — it refracts radio waves back toward the ground, enabling skip propagation. The D layer absorbs lower HF frequencies during daytime, which is why 80m and 160m bands work better at night when the D layer fades.',
    see: ['hf', 'skywave'],
  },
  'ground wave': {
    tip: 'Radio propagation that follows the earth\'s surface.',
    detail:
      'Ground wave propagation works best at lower frequencies (below ~2 MHz) where the signal diffracts around the earth\'s curvature. Range is typically 50–200 km depending on terrain, power, and frequency. AM broadcast radio relies heavily on ground wave during the day. At HF, ground wave range is very limited — skywave dominates.',
    see: ['skywave', 'hf'],
  },
  skywave: {
    tip: 'HF propagation via ionospheric bounces, enabling worldwide range.',
    detail:
      'Skywave (also called skip propagation) occurs when HF signals travel upward at an angle, refract off the ionosphere, and return to earth hundreds or thousands of kilometres away. The signal can then bounce off the ground and repeat the process (multi-hop), reaching the other side of the planet. The skip zone is the area between the end of ground wave coverage and where the first skywave hop lands.',
    see: ['ionosphere', 'hf', 'ground wave'],
  },
}
