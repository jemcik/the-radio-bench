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
  psu: {
    tip: 'Power Supply Unit — converts wall AC (or a battery) into the regulated DC voltages a circuit needs.',
    detail:
      'A PSU is whatever stands between the wall socket and your circuit\'s "+5 V" rail: a transformer-rectifier-regulator chain in a linear bench supply, or a switching converter in a phone charger. The two numbers that matter are the output voltage range and the maximum output current; a 0–30 V / 0–3 A bench PSU with current-limit knobs is the standard tool for prototyping. Switching PSUs are smaller and more efficient but inject high-frequency noise into the rail; linear PSUs are cleaner but heavier and run hot. "PSU" is the everyday acronym in datasheets, schematics, and product blurbs.',
    see: ['ac', 'dc', 'rectification'],
  },
  emi: {
    tip: 'ElectroMagnetic Interference — unwanted electromagnetic energy that couples from one circuit into another.',
    detail:
      'EMI covers anything from the buzz a switch-mode power supply puts on a nearby radio to the spike that crashes a microcontroller when a relay opens. It travels both as conducted noise (along power and signal wires) and radiated noise (through space, like a tiny unintentional transmitter). The standard defences are filtering (ferrite beads, X/Y capacitors), shielding (metal cans, braided coax shields), and physical separation. In radio practice EMI is a two-sided problem: your equipment must not generate too much of it (regulatory limits), and it must keep working when surrounded by everyone else\'s.',
    see: ['ferrite', 'choke', 'bypass capacitor'],
  },
  pcb: {
    tip: 'Printed Circuit Board — the rigid fibreglass slab with copper traces that carries components in any modern circuit.',
    detail:
      'A PCB is a sandwich of insulating substrate (most often FR-4 fibreglass) with one or more copper layers etched into the wires of your schematic. Components solder to copper pads on the surface; for a multi-layer board, plated-through "vias" connect signals between layers. Hobbyists commission PCBs from online fabs (JLCPCB, OSH Park, PCBWay) for a few dollars per panel; the design files come from EDA tools like KiCad. Compared to a breadboard, a PCB has predictable parasitics, much shorter signal paths, and the mechanical robustness needed for anything that has to leave the bench.',
    see: ['surface mount', 'breadboard'],
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
  power: {
    tip: 'The rate at which energy is transferred or dissipated — volts times amps.',
    detail:
      'Power (P) is how fast energy moves through or is spent in a circuit element. For a resistive element it is simply voltage times current, and because Ohm\'s law ties V, I, and R together, the same power can be written three ways: P = V·I, P = I²·R, and P = V²/R. One watt equals one joule per second. In a resistor, that power leaves as heat.',
    unit: 'Watt (W)',
    formula: 'P = V · I',
    see: ['voltage', 'current', 'resistance', 'watt'],
  },
  watt: {
    tip: 'The SI unit of power — one joule per second.',
    detail:
      'The watt (W) is the SI unit of power, defined as one joule of energy transferred per second. It is named after James Watt, the Scottish engineer whose work on the steam engine in the 1760s turned "how much energy per second" into a fundamental engineering quantity. In electronics, 1 W = 1 V × 1 A.',
    unit: 'Watt (W)',
    see: ['power'],
  },
  efficiency: {
    tip: 'The fraction of input power that comes out the other side as useful output rather than heat — a transformer\'s most-quoted figure of merit.',
    detail:
      'Efficiency (η, the Greek letter eta) is output power divided by input power, usually expressed as a percentage. A small mains transformer for a hobby supply might run at 85–92 % efficient; a power transformer in a substation routinely exceeds 99 %; a Class-A audio amplifier struggles to reach 25 %. The «lost» fraction always comes out as heat — copper losses (I²R in the windings) and core losses (hysteresis and eddy currents in iron, dielectric losses in capacitors) are what get warm. Efficiency tells you how big a heat sink you need and how much of the wall-socket power is doing the actual job.',
    unit: 'Percent (%)',
    formula: 'η = P_{out} / P_{in}',
    see: ['power', 'transformer'],
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
  'junction capacitance': {
    tip: 'The voltage-dependent capacitance of a reverse-biased P-N junction’s depletion region — unwanted in switching diodes, deliberately exploited by varactors.',
    detail:
      'A reverse-biased P-N junction has a depletion region — a layer free of mobile charge carriers, sandwiched between the doped P and N zones. Electrically that depletion region acts as a thin dielectric between two conductive bodies, so the junction itself behaves like a small capacitor. The depletion-region width depends on the reverse voltage: more reverse voltage widens the depletion → smaller capacitance; less reverse voltage narrows it → larger capacitance. In ordinary signal and rectifier diodes this junction capacitance is unwanted parasitic — it limits switching speed and adds attenuation at high frequencies. In a varactor (varicap) diode the doping profile is engineered to MAXIMISE this voltage-dependent behaviour, turning the junction itself into a voltage-controlled capacitor with a few pF of capacitance tunable across 1–30 V of reverse bias. Every modern voltage-controlled oscillator and phase-locked-loop frequency synthesizer uses varactors to tune frequency electronically without moving parts.',
    unit: 'Farad (F)',
    see: ['capacitance', 'diode'],
  },
  vfo: {
    tip: 'Variable-frequency oscillator — an oscillator whose output frequency can be tuned by an external control (a knob, a voltage, a digital command).',
    detail:
      'A VFO (Variable-Frequency Oscillator) is the part of a radio that generates the carrier frequency you transmit on or the local-oscillator frequency that mixes with received signals. «Variable» means the frequency is adjustable across a band — the user turns a tuning knob or a digital control sets the value. In old equipment the variable element was a mechanical air-gap variable capacitor inside a resonant tank; in modern radios it is a varactor diode whose junction capacitance changes with control voltage, often inside a phase-locked-loop circuit that locks the VFO to a precise crystal-derived reference. Stability and phase noise of the VFO directly limit the radio\'s on-air signal quality.',
    see: ['frequency'],
  },
  kvl: {
    tip: 'Kirchhoff\'s Voltage Law — the sum of voltage rises and drops around any closed loop in a circuit equals zero.',
    detail:
      'KVL (Kirchhoff\'s Voltage Law) says: walk around any closed loop in a circuit, add the voltage rise from each source you enter and subtract the voltage drop across each component you traverse, and the total comes back to zero. Equivalent statement: «what goes up must come down» applied to potential. KVL is the partner of KCL (Kirchhoff\'s Current Law, current into a node = current out) — together they let you write enough equations to solve any DC circuit. Worked example: a 9 V battery with two resistors in series; the 9 V rise across the battery must equal the sum of the two voltage drops across the resistors.',
    see: ['voltage'],
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
  s11: {
    tip: 'VNA reflection parameter — how much of the signal sent into a port comes back.',
    detail:
      'S11 is the first of the four S-parameters (S = "scattering") that a VNA measures. It is the ratio of the wave reflected from port 1 back to the source, expressed in decibels. A perfect match swallows everything: S11 plunges to −∞ dB. A short or open reflects everything: S11 ≈ 0 dB. In practice, an antenna or filter input is "good enough" when S11 sits below −10 dB across the band of interest (about 10 % of the power reflected, equivalent to SWR ≈ 2:1). On a Smith chart S11 is the dot itself; on a magnitude-vs-frequency plot it is the curve filter designers stare at.',
    see: ['vna', 'swr', 'impedance', 's21'],
  },
  s21: {
    tip: 'VNA transmission parameter — how much of the signal sent into port 1 makes it out of port 2.',
    detail:
      'S21 is the forward transmission gain (or, more often for passive parts, loss) measured by a VNA, expressed in dB. A lossless wire gives S21 = 0 dB; a 3 dB attenuator gives S21 = −3 dB; a filter\'s stopband can drop S21 below −60 dB. The S21 vs frequency trace is the textbook "frequency response" of a filter or amplifier — passband shape, cut-off, roll-off, and ripple are all read directly off it. S11 and S21 together fully describe a two-port network from port 1\'s side; S22 and S12 cover the reverse direction.',
    see: ['vna', 's11', 'decibel', 'low-pass'],
  },
  sma: {
    tip: 'SMA — a small threaded RF connector rated to ~18 GHz, the workhorse on VNAs and most hobbyist test gear.',
    detail:
      'SMA (SubMiniature version A) is a 50 Ω coaxial connector with a 1/4-inch threaded coupling. It is small (the body is about the diameter of a pencil), reasonably cheap, and good to about 18 GHz, which is why nearly every VNA, NanoVNA, signal generator, and SDR uses it. The male centre pin sits inside the female barrel; you tighten the outer nut to mate them — finger-tight is fine for bench work, 5 in-lb (0.6 N·m) for a torque-controlled lab. RP-SMA ("reverse-polarity SMA") swaps the genders and is common on Wi-Fi gear; the two are not interchangeable, so check the photo before you buy adapters.',
    see: ['coax', 'vna', 'impedance'],
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
    see: ['hertz', 'period', 'time/div'],
  },
  harmonic: {
    tip: 'A sine wave whose frequency is an integer multiple of the fundamental — the building blocks of every periodic signal.',
    detail:
      'A harmonic is a sine wave whose frequency is an integer multiple of the fundamental (base) frequency. For a square wave at frequency f, the 1st harmonic is f itself (the fundamental); the 3rd harmonic is 3f, the 5th is 5f, and so on — a square wave contains only odd harmonics, each with smaller amplitude than the previous. A triangle wave also has only odd harmonics, but with a different amplitude distribution. A pure sine wave is the only waveform with NO harmonics — it is just its fundamental and nothing else. Harmonics matter in radio: a transmitter that is not clean radiates at its fundamental PLUS at 2f, 3f, … — which can interfere with other users. Filters at the final amplifier stage remove these harmonics.',
    see: ['fourier', 'filter', 'frequency', 'sine wave', 'square wave'],
  },
  fourier: {
    tip: 'A method that decomposes any periodic signal into a sum of sines at different frequencies — the basis of signal processing.',
    detail:
      'Fourier analysis, named after Joseph Fourier (1768–1830), decomposes any periodic signal into a sum of sine waves at different frequencies, amplitudes, and phases. Read in reverse: any periodic waveform — however complex — can be built by adding sine waves together. A square wave = fundamental + 3rd + 5th + 7th + … harmonics; a triangle wave = the same, with a different weighting. A single musical note = its fundamental plus overtones in characteristic ratios that define the instrument\'s timbre. Fourier analysis underlies every digital signal processor, every spectrum analyser, every filter design, and most of modern communications engineering.',
    see: ['harmonic', 'frequency', 'filter', 'sine wave'],
  },
  carrier: {
    tip: 'The clean sine wave at the transmitter\'s operating frequency — information is modulated onto it and broadcast from the antenna.',
    detail:
      'A carrier (or carrier wave) is the clean sine wave at the transmitter\'s operating frequency (e.g. 14 MHz for a 20-metre amateur-band signal) that conveys information across space. The carrier itself contains no audio or data — it is simply a sine at one specific frequency. Modulation encodes information by varying one of the sine\'s three parameters: amplitude (AM), frequency (FM), or phase (PM). At the receiver the carrier is stripped away («demodulation») to recover the original audio or data. «Clean» means the carrier has no spurious signals (harmonics, noise) — essential both for legal compliance and so the transmitter does not disturb neighbouring bands.',
    see: ['frequency', 'sine wave', 'harmonic', 'am', 'fm'],
  },
  modulation: {
    tip: 'Loading information onto a carrier by varying one of its properties — its amplitude, frequency, or phase.',
    detail:
      'Modulation is how a radio signal carries information. A bare carrier — a pure sine wave — conveys almost nothing; modulation makes it useful by varying one of its three parameters in step with a message: its amplitude (giving AM), its frequency (FM), or its phase (PM). The original low-frequency message (a voice, Morse, or data) is the «baseband» signal; modulation lifts it onto a high-frequency carrier that an antenna can radiate efficiently and that can be tuned to its own slot in the spectrum. At the receiver the reverse process, demodulation, strips the carrier away to recover the message.',
    see: ['carrier', 'am', 'fm', 'ssb', 'baseband', 'sideband'],
  },
  baseband: {
    tip: 'The raw, low-frequency message — voice, Morse, or data — before it is modulated onto a carrier.',
    detail:
      'Baseband is the original information signal at its natural, low frequencies, before any modulation. For voice it is the audio from a microphone, roughly 300 Hz to 3 kHz; for data it is the stream of bits. Baseband cannot be radiated directly: its wavelength is far too long for a practical antenna, and every source would occupy the same band. Modulation shifts the baseband up onto a carrier for transmission; demodulation brings it back down to baseband at the receiver.',
    see: ['modulation', 'carrier', 'sideband'],
  },
  sideband: {
    tip: 'A band of frequencies just above or below the carrier, created by modulation — this is where the information actually sits.',
    detail:
      'When a carrier is amplitude-modulated by a tone, the result contains three frequencies: the carrier, an upper sideband (carrier + tone) and a lower sideband (carrier − tone). With real speech each sideband is a band of frequencies, not a single tone. The two sidebands are mirror images carrying identical information, and the carrier between them carries none — which is why SSB can keep just one sideband and discard both the carrier and the other sideband with no loss of content. «USB» (upper sideband) keeps the band above the carrier; «LSB» (lower sideband) keeps the band below it.',
    see: ['carrier', 'am', 'ssb', 'bandwidth'],
  },
  envelope: {
    tip: 'The smooth outline traced by the peaks of a modulated carrier — in AM it is a copy of the original audio.',
    detail:
      'The envelope is the slowly-varying outline that connects the peaks of a fast carrier. In amplitude modulation the envelope is a direct copy of the message: as you speak, the carrier\'s peaks swell and shrink, and the curve linking them reproduces your voice. An AM receiver\'s detector recovers the sound simply by tracing this envelope and throwing the fast carrier away. If modulation is pushed past 100 % the envelope distorts («overmodulation»), tearing the signal and splattering interference into neighbouring channels.',
    see: ['am', 'modulation', 'modulation index'],
  },
  'modulation index': {
    tip: 'How hard a carrier is modulated — for AM, the message height divided by the carrier height (0 to 1, or 0–100 %).',
    detail:
      'The modulation index measures how deeply a carrier is modulated. In AM it is the message amplitude divided by the carrier amplitude: 0 means an unmodulated carrier, and 1 (100 %) means the envelope just touches zero at the quietest instant — the maximum without distortion. Beyond 100 % the signal overmodulates and splatters. In FM the modulation index is the peak frequency deviation divided by the highest audio frequency, and it controls how many sidebands appear and therefore how wide the signal becomes.',
    see: ['am', 'fm', 'envelope', 'deviation'],
  },
  deviation: {
    tip: 'In FM, how far the carrier\'s frequency swings away from its rest value — set by the loudness of the audio.',
    detail:
      'Frequency deviation is the amount an FM carrier shifts above and below its rest (centre) frequency. The louder the audio, the larger the deviation — how far the carrier\'s frequency swings from centre; the pitch of the audio sets how fast it swings back and forth around that centre, not how far. Amateur FM on VHF/UHF typically uses about ±5 kHz deviation, with narrowband channels at about ±2.5 kHz. Deviation drives the signal\'s bandwidth: wider deviation means a wider signal (see Carson\'s rule).',
    unit: 'Hertz (Hz)',
    see: ['fm', 'modulation index', "carson's rule", 'bandwidth'],
  },
  "carson's rule": {
    tip: 'A quick estimate of an FM signal\'s bandwidth: about twice the sum of the deviation and the highest audio frequency.',
    detail:
      'Carson\'s rule estimates how much spectrum an FM (or PM) signal occupies — about 98 % of its power. The formula is bandwidth ≈ 2 × (peak deviation + highest modulating frequency). For an amateur 2-metre FM signal with ±5 kHz deviation and 3 kHz audio, that is 2 × (5 + 3) = 16 kHz. It is only an estimate, looser than the legal occupied-bandwidth definition, but it captures why FM is far wider than SSB and so lives mainly on the roomier VHF/UHF bands.',
    formula: 'BW ≈ 2 × (deviation + audio)',
    unit: 'Hertz (Hz)',
    see: ['fm', 'deviation', 'bandwidth'],
  },
  pep: {
    tip: 'Peak Envelope Power — the power in the single strongest RF cycle, at the crest of the modulation envelope; the standard way to rate and limit transmitter power.',
    detail:
      'Peak envelope power (PEP) is the average power over one RF cycle taken at the crest of the modulation envelope — the most a signal ever reaches. It exists because modes like SSB and AM never hold a steady level: an SSB voice falls to nothing between words and peaks on loud sounds, so a single «power» figure would be meaningless. PEP captures that worst-case peak, which is what matters for interference, so regulators specify limits in PEP (often 1.5 kW) and radios are rated this way («100 W PEP»). The average power that actually heats the amplifier is much lower for voice — only about a fifth of the PEP.',
    unit: 'Watts (W)',
    see: ['ssb', 'am', 'envelope', 'efficiency'],
  },
  'dummy load': {
    tip: 'A non-radiating 50 Ω resistor that stands in for an antenna, soaking up a transmitter\'s full output as heat so you can test it without going on the air.',
    detail:
      'A dummy load is a resistor — close to 50 Ω so it matches the transmitter\'s output — built to absorb full transmit power and turn it into heat instead of radiating it. It lets you tune up, measure output power, or test a rig without transmitting on a real antenna, and so without interfering with anyone. The two things that matter are its impedance (50 Ω, for a low SWR) and its power rating: a homebrew load of four 200 Ω resistors in parallel makes 50 Ω, while oil-filled «cantenna» loads handle high power. Reading the RF voltage across a dummy load on an oscilloscope is a common way to measure output power.',
    see: ['impedance', 'swr'],
  },
  wavemeter: {
    tip: 'A passive tuned circuit (coil + variable capacitor) held near a transmitter; tune it for a meter peak at resonance and read the approximate frequency off its dial.',
    detail:
      'An absorption wavemeter is the simplest frequency indicator there is: a coil and a variable capacitor forming a tuned circuit, with a diode and a small meter (or a lamp). Hold its coil near the transmitter so the two couple loosely, then turn the capacitor until the circuit resonates at the transmitter\'s frequency — at resonance it absorbs the most energy and the meter peaks. You read the frequency off the capacitor\'s calibrated dial. Because the resonance is broad (low Q), the reading is only approximate; a frequency counter has long since replaced it for precise work, but the wavemeter survives as a teaching tool and a quick band check.',
    see: ['frequency counter', 'resonance', 'frequency'],
  },
  'frequency counter': {
    tip: 'A digital instrument that counts a signal\'s cycles over a precise time interval and displays the frequency directly, to many digits.',
    detail:
      'A frequency counter measures frequency by counting how many cycles of the input occur during a precisely known gate time, then displaying the result directly in Hz, kHz or MHz. Its accuracy comes from a stable internal time base (a crystal or oven-controlled oscillator), so a good counter is far more precise than an absorption wavemeter and needs no tuning or interpretation. It is the modern answer to «what frequency is this?» — the wavemeter\'s digital replacement.',
    see: ['wavemeter', 'frequency', 'oscillator'],
  },
  'linear amplifier': {
    tip: 'An amplifier that reproduces its input\'s exact shape, only bigger — required for modes like SSB and AM whose information lives in the changing amplitude.',
    detail:
      'A linear amplifier produces an output that is a faithful, scaled-up copy of its input. That faithfulness matters whenever the message rides on the signal\'s amplitude: SSB and AM both live in the envelope, so a nonlinear amplifier would distort them and splatter interference into neighbouring channels. Linear amplifiers run in Class A, AB, or B, keeping the device conducting for at least half of each cycle — which buys linearity at the cost of efficiency. Constant-amplitude modes (FM, CW) carry no information in the envelope, so they can use a more efficient nonlinear Class-C amplifier instead.',
    see: ['efficiency', 'am', 'ssb'],
  },
  reactance: {
    tip: 'AC-only opposition — the frequency-dependent resistance of a capacitor or an inductor.',
    detail:
      'Reactance is the opposition that capacitors and inductors present to AC, and only to AC. A capacitor blocks DC completely (after its initial charge-up) but passes AC more and more easily as frequency rises; an inductor does the opposite — passes DC freely but opposes AC more strongly at higher frequencies. Unlike resistance, which dissipates power as heat, reactance is lossless: energy goes into the capacitor\'s electric field or the inductor\'s magnetic field on one half of the cycle and returns to the circuit on the other. The two reactances have names: capacitive reactance X_C = 1 / (2πfC), inductive reactance X_L = 2πfL. Both are covered in detail in the capacitor and inductor chapters.',
    unit: 'Ohm (Ω)',
    formula: 'X_C = 1 / (2πfC)  •  X_L = 2πfL',
    see: ['capacitor', 'inductor', 'impedance', 'frequency'],
  },
  filter: {
    tip: 'A circuit that lets some frequencies through and blocks others.',
    detail:
      'A filter is a circuit designed to pass certain frequencies while blocking others — the four canonical types are low-pass (passes DC and low frequencies, blocks high), high-pass (opposite), band-pass (passes a band in the middle), and band-stop / notch (blocks a band). Filters are built from the frequency-dependent behaviour of capacitors and inductors (and sometimes resistors, op-amps, crystals). Every radio transmitter and receiver contains filters: to clean up harmonics at the transmitter, to select a single station at the receiver, to remove noise, to split frequency bands. Filter design is the subject of Chapter 1.8.',
    see: ['reactance', 'capacitor', 'inductor'],
  },
  ripple: {
    tip: 'The small residual AC component left on a DC signal after imperfect smoothing.',
    detail:
      'Ripple is the small periodic fluctuation that remains on a DC output when the filter that turned AC into DC hasn\'t smoothed it perfectly. A typical mains-powered power supply rectifies the 50 Hz AC into pulsating DC, then smooths it with a large capacitor; what comes out is mostly steady DC with a small saw-tooth ripple at 100 Hz (twice the mains frequency, because both halves of the AC cycle are rectified). Ripple magnitude is usually specified in millivolts peak-to-peak; less ripple means cleaner DC, which matters for sensitive circuits like oscillators and low-level amplifiers. In a multimeter measurement, ripple shows up as a non-zero reading in AC mode on a nominally-DC source.',
    unit: 'Volts peak-to-peak (V_pp)',
    see: ['ac', 'dc', 'rectification'],
  },
  'form factor': {
    tip: 'Waveform-shape ratio of RMS to rectified average — a pure-shape number that lets averaging meters estimate RMS.',
    detail:
      'Form factor is the ratio RMS ÷ (rectified average) of a waveform. It depends only on the waveform\'s shape, not its amplitude or frequency. For a pure sine, form factor is π/(2√2) ≈ 1.111; for a square wave it is exactly 1; for a triangle it is 2/√3 ≈ 1.155. Cheap averaging-type multimeters rectify the input, average it, and multiply by 1.111 (the sine-wave form factor) to report an «RMS» reading — which is why they give correct readings on sines and wrong readings on squares (11 % high) and triangles (≈ 3.8 % low). Only a true-RMS meter measures the actual RMS regardless of shape.',
    formula: 'FF = V_rms / V_avg (rectified)',
    see: ['rms', 'rectification', 'true rms'],
  },
  rectification: {
    tip: 'Folding the negative half of an AC waveform up above zero — so the signal no longer changes direction.',
    detail:
      'Rectification turns an alternating signal into a pulsating one-direction signal. Mathematically it is the |V(t)| operation: the negative half of the wave is flipped up, so both halves point the same way. For a pure sine, rectification produces a series of half-cycle humps; the average of that rectified sine is 2/π ≈ 0.637 of the peak — which is what an averaging-type multimeter responds to in its AC mode. Physical rectification is done by diodes inside a power supply; a bridge rectifier uses four diodes to flip both halves of the AC input. The diode that does this physically is the subject of Chapter 1.10; the word «rectified» is also used in a purely mathematical sense — the |·| operation on a waveform, with no diode implied.',
    see: ['diode', 'rms'],
  },
  hertz: {
    tip: 'The SI unit of frequency — one hertz means one cycle per second.',
    detail:
      'The hertz (Hz) is the SI unit of frequency: 1 Hz equals one complete cycle of a periodic event per second. Named after Heinrich Hertz (1857–1894), the German physicist who first produced and detected radio waves experimentally and confirmed Maxwell\'s prediction of their existence. Multiples in everyday use: mains is 50 Hz (Europe, Ukraine) or 60 Hz (USA); human hearing spans ≈ 20 Hz to 20 kHz; the FM broadcast band is 88–108 MHz; Wi-Fi 2.4 GHz means 2.4 × 10⁹ cycles per second. Hz is a count-per-second unit, so it has no direction — a signal can\'t have «negative Hz».',
    unit: 'Hertz (Hz)',
    formula: '1 Hz = 1 cycle / s',
    see: ['frequency', 'period', 'si'],
  },
  rms: {
    tip: 'Root Mean Square — the effective DC-equivalent value of an AC signal.',
    detail:
      'RMS is the value of AC voltage or current that delivers the same power as an equivalent DC value. For a sine wave, RMS = peak × 0.707. For a 50% duty cycle square wave, RMS = peak × 0.707 as well. Most multimeters display RMS readings. True-RMS meters measure the actual waveform; cheaper meters are calibrated for sine waves only and can give wrong readings for non-sinusoidal signals.',
    formula: 'V_rms = V_peak / √2  (sine wave)',
    see: ['voltage', 'oscilloscope'],
  },

  'sine wave': {
    tip: 'A smooth periodic oscillation — the natural shape of an electromagnetic wave or an LC-circuit resonance.',
    detail:
      'A sine wave is the shape of the purest periodic signal — a smooth oscillation that swings up and down at a constant rate. Rotating machinery, tuned LC circuits, and radiating antennas all naturally produce sine waves because the underlying physics is a linear oscillation. Three numbers fully describe a sine: its amplitude (how tall it swings), its frequency (how fast it repeats), and its phase (where in the cycle it starts). Every other periodic signal can be decomposed into a sum of sine waves at different frequencies — the insight behind Fourier analysis, and the reason sines are the reference waveform for everything else.',
    see: ['amplitude', 'frequency', 'period', 'phase', 'ac'],
  },
  amplitude: {
    tip: 'How far a signal swings from its centre to its peak — the \'height\' of the waveform.',
    detail:
      'Amplitude is the maximum distance a waveform reaches from its zero (or average) line. For a sine wave centred on zero with peaks at +3 V and −3 V, the amplitude is 3 V. Amplitude is not the same as peak-to-peak: the peak-to-peak voltage of that wave is 6 V (from −3 to +3). For an AC signal, amplitude most often means the peak amplitude — the voltage at the instant of maximum excursion.',
    unit: 'Volts (V), Amperes (A), …',
    see: ['peak-to-peak', 'rms', 'sine wave'],
  },
  period: {
    tip: 'The time it takes for a repeating signal to complete one full cycle.',
    detail:
      'Period (T) is the duration of one complete cycle of a repeating waveform — the time from any point on the wave to the next identical point. A 1 kHz signal has a period of 1 ms; a 50 Hz mains cycle lasts 20 ms. Frequency and period are reciprocals: f = 1/T. On an oscilloscope, you measure the period directly by reading how many time-per-division squares one cycle occupies; the scope then computes and displays the frequency for you.',
    unit: 'Seconds (s)',
    formula: 'T = 1 / f',
    see: ['frequency', 'sine wave', 'time/div'],
  },
  phase: {
    tip: 'How far into a cycle a signal is — which part of the sine curve it is tracing right now.',
    detail:
      'Phase describes the position within a cycle of a periodic signal, usually expressed in degrees (0°–360°) or radians (0–2π). Two sines of the same frequency can be at different phases — one may peak at t = 0 while the other peaks a quarter-cycle (90°) later. That phase difference is what distinguishes a capacitor (current leads voltage by 90°) from an inductor (current lags by 90°) at AC, and is central to impedance, filters, and antenna arrays. In amateur-radio work you will hear "in phase" (0°), "quadrature" (90°), and "anti-phase" (180°) most often.',
    unit: 'Degrees (°) or radians (rad)',
    see: ['sine wave', 'impedance', 'frequency'],
  },
  mains: {
    tip: 'The AC electricity supplied to buildings by the national grid — 230 V, 50 Hz in Europe and Ukraine; 120 V, 60 Hz in the USA.',
    detail:
      'Mains (also called line power or grid power) is the alternating-current electricity distributed by the national electricity network. The standard values differ by region: 230 V RMS at 50 Hz across most of Europe, the UK, Ukraine, Africa, and Asia; 120 V RMS at 60 Hz across North America and parts of Latin America; a handful of other standards (100 V in Japan, 220 V at 60 Hz in parts of the Americas) survive historically. Mains voltage is always specified as RMS; the actual peak voltage is √2 larger (≈ 325 V peak for a 230 V mains, ≈ 170 V peak for a 120 V mains) — important for rating capacitors and insulation that see the peak, not the RMS.',
    unit: 'Volts RMS (V)',
    see: ['ac', 'rms', 'frequency'],
  },
  'true rms': {
    tip: 'A meter that measures the real RMS of any waveform, not just sines — essential for square waves, pulses, and distorted signals.',
    detail:
      'A true-RMS meter digitises the waveform (or uses an analogue computation circuit) and calculates the root-mean-square value from the actual sample values — so it reads correctly on any waveform: sine, square, triangle, pulse train, chopped mains. A cheaper average-responding meter scales its average reading by 1.11 (the form factor of a rectified sine), which is only correct for pure sines. On a square wave, an averaging meter reads about 11 % high; on a triangle wave, about 4 % low. Look for the phrase "True RMS" on the front panel before trusting any reading of a non-sinusoidal signal.',
    see: ['rms', 'multimeter', 'square wave'],
  },

  // ── Components ───────────────────────────────────────────────────
  resistor: {
    tip: 'Passive component that limits current flow.',
    detail:
      'Resistors are the most common electronic component. Their value in ohms sets the ratio of voltage to current (Ohm\'s Law). Colour bands encode the value: the first bands give significant digits, followed by a multiplier and tolerance band. Power rating matters too — exceed it and the resistor overheats.',
    unit: 'Ohm (Ω)',
    formula: 'V = I × R',
    see: ['resistance', 'voltage', 'current', 'tolerance', 'colour code'],
  },
  tolerance: {
    tip: 'How far a component\'s actual value may drift from the number printed on it — expressed as a percentage.',
    detail:
      'A 10 kΩ resistor with ±5 % tolerance may measure anywhere from 9.5 kΩ to 10.5 kΩ and still be within spec. The looser the tolerance the cheaper the part: ±20 % is bottom-of-the-barrel, ±5 % is the hobby default, ±1 % is the precision-divider grade, ±0.1 % is for instrumentation. Capacitor tolerances are typically looser than resistor tolerances (±10 % to ±20 % is normal). Tolerance interacts with the preferred-value series: a ±5 % part is sold in 24 values per decade, a ±1 % part in 96, because finer tolerance narrows the gap between values.',
    see: ['resistor', 'preferred value'],
  },
  'preferred value': {
    tip: 'A resistor or capacitor value from the standard E-series — the reason "4.7 kΩ" exists but "5 kΩ" mostly doesn\'t.',
    detail:
      'Preferred values are a worldwide convention that spaces component values logarithmically across each decade. The E12 series (±10 % tolerance) has 12 values: 10, 12, 15, 18, 22, 27, 33, 39, 47, 56, 68, 82. E24 (±5 %) has 24, E48 (±2 %) has 48, E96 (±1 %) has 96. Each value is chosen so that the ±tolerance window of one part just meets the window of the next — if you need 5 kΩ at ±5 %, the nearest E24 value of 4.7 kΩ (within tolerance of anything from 4.47 to 4.94 kΩ) is what you get, and 5 kΩ is simply not manufactured.',
    see: ['tolerance', 'resistor'],
  },
  'colour code': {
    tip: 'Coloured bands on a through-hole resistor that encode its value and tolerance.',
    detail:
      'A through-hole resistor is normally too small to print numbers on, so the value is encoded as 3 to 6 coloured bands read from the tolerance-band end inward. 4-band parts: first two bands = significant digits, third band = decimal multiplier (×10ⁿ), fourth band = tolerance. 5-band (precision) parts have three significant-digit bands. The digit-colour mapping runs through the spectrum (black=0, brown=1, red=2, orange=3, yellow=4, green=5, blue=6, violet=7, grey=8, white=9); tolerance colours are a separate set (gold=±5 %, silver=±10 %, brown=±1 %, red=±2 %). Surface-mount resistors are too small for bands and use a printed 3- or 4-digit number instead.',
    see: ['resistor', 'tolerance'],
  },
  'power rating': {
    tip: 'The maximum power a component can dissipate as heat before it is damaged.',
    detail:
      'Every resistor has a power rating: ⅛ W and ¼ W are the hobby-shelf defaults; 1 W, 2 W and larger sizes exist for power circuits. When current flows through a resistor it dissipates P = I²R watts as heat. Exceed the rating and the part drifts in value, discolours, and eventually burns open. Good practice: pick a resistor rated at two to four times the worst-case dissipation, so it runs cool and lasts. The rating is printed in datasheets, not on the part itself — you read it from the physical size of the resistor body (a ¼ W axial is a couple of millimetres across; a 2 W wirewound is finger-sized).',
    unit: 'Watt (W)',
    formula: 'P = I² × R',
    see: ['power', 'resistor'],
  },
  potentiometer: {
    tip: 'A three-terminal variable resistor used as an adjustable voltage divider.',
    detail:
      'A potentiometer ("pot") is a resistor with a sliding contact that taps off a fraction of the total resistance — mechanically, that is exactly the schematic of a voltage divider with the divide ratio under your finger. The three terminals are the two ends of the resistive track plus the wiper. Wire the two ends across a supply and the wiper gives a variable voltage; wire only one end and the wiper, and you have a plain variable resistor (rheostat). Volume knobs, contrast controls, and bench-supply adjust knobs are almost always potentiometers.',
    see: ['voltage divider', 'resistor'],
  },
  'surface mount': {
    tip: 'A component package soldered flat onto pads on the board surface — no leads through the board.',
    detail:
      'Surface-mount (SMT, also SMD for "device") components replaced most through-hole parts in mass production from the 1990s onward. A surface-mount resistor is a flat rectangular ceramic chip a millimetre or two long, with metallised ends that sit on top of the board\'s copper pads. You lose the colour-code — values are printed as 3- or 4-digit numbers ("472" = 47 × 10² = 4.7 kΩ). Standard sizes are named by their imperial dimensions in hundredths of an inch: 0805 (2 mm × 1.3 mm), 0603, 0402, 0201. Hobbyists usually stick to 0805 and above because smaller parts need reflow ovens and steady hands.',
    see: ['resistor', 'colour code'],
  },
  conductance: {
    tip: 'The reciprocal of resistance — how easily current flows through a component. Measured in siemens (S).',
    detail:
      'Conductance (symbol G) is just resistance written the other way up: G = 1/R. A 1 Ω resistor has conductance 1 S; a 1 kΩ resistor has 1 mS; a 1 MΩ resistor has 1 µS. Why bother with a separate name? Because of a beautiful symmetry in how circuits combine: series resistances add (R = R₁ + R₂ + …) and parallel conductances add (G = G₁ + G₂ + …), in the same arithmetic shape. The unit is the siemens (S), named after the German industrialist Werner von Siemens; its older name was the mho ("ohm" spelled backwards, symbol ℧), which you still see on some vintage schematics and in older American textbooks. Conductance becomes genuinely useful once you are thinking about admittance in AC circuits (ch 1.6 / 1.8) — where Y = G + jB generalises Z = R + jX.',
    unit: 'Siemens (S)',
    formula: 'G = 1 / R',
    see: ['resistance', 'resistor'],
  },
  capacitor: {
    tip: 'Stores energy in an electric field. Blocks DC, passes AC.',
    detail:
      'Capacitors come in many types: ceramic (small, cheap, unpolarised), electrolytic (large values, polarised — watch the polarity!), and film (precise, stable). In AC circuits, a capacitor\'s opposition to current (reactance) decreases with frequency — this is why capacitors are used in filters and tuning circuits.',
    unit: 'Farad (F)',
    formula: 'Xc = 1 / (2πfC)',
    see: ['capacitance', 'dielectric', 'impedance'],
  },
  derivative: {
    tip: 'The rate of change — how fast a quantity is changing at a given instant.',
    detail:
      'The derivative measures how fast one quantity is changing with respect to another — usually with respect to time. If a voltage V is climbing at 2 volts per second, then its derivative dV/dt equals 2 V/s. A steady, unchanging quantity has derivative zero. A quantity that climbs linearly with time has a constant derivative. The key intuition: the derivative answers the question "how fast?". In the capacitor equation I = C·dV/dt, the derivative dV/dt is literally "how fast the voltage across the capacitor is changing right now", and the equation says the current flowing into the capacitor is proportional to that rate.',
    formula: 'dV/dt  •  "rate of change of V with respect to t"',
  },
  dielectric: {
    tip: 'The insulating material between the plates of a capacitor — sets how much charge the capacitor stores per volt.',
    detail:
      'A dielectric is the insulating layer sandwiched between the two conductive plates of a capacitor. It serves two roles: it prevents current from flowing between the plates (otherwise you have a short, not a capacitor), and its electrical property — the dielectric constant εr — multiplies the capacitance you get for a given plate area and spacing. Air has εr = 1 (the reference); polyester film is ≈ 3; ceramic C0G is ≈ 45; ceramic X7R is ≈ 3000; aluminium oxide (inside electrolytics) is ≈ 8. The dielectric also sets the capacitor\'s voltage rating — every material has a breakdown field strength above which it ionises and conducts, destroying the capacitor. A thicker dielectric survives higher voltages but reduces capacitance for the same plate area.',
    see: ['capacitor', 'capacitance'],
  },
  electrolytic: {
    tip: 'A polarised capacitor type using an oxide-on-metal-foil dielectric — gives large capacitance in a small can, but only works with correct polarity.',
    detail:
      'In an electrolytic capacitor, the dielectric is a very thin oxide layer (aluminium oxide or tantalum pentoxide) grown on one metal foil; the "other plate" is a conductive electrolyte (liquid or gel) in contact with the oxide. The oxide is thin and the effective plate area is enormous (foils are rolled up or made of porous pressed powder), so capacitance can reach hundreds of thousands of microfarads in a finger-sized can. The catch is polarity: the oxide is grown electrochemically in one direction, so reverse voltage breaks it down — an aluminium electrolytic then heats, swells, and vents; a tantalum electrolytic can literally explode. The longer lead (or the un-striped side of SMT tantalums) is positive; the stripe on an aluminium can marks the negative lead.',
    see: ['capacitor', 'dielectric'],
  },
  mlcc: {
    tip: 'Multi-Layer Ceramic Capacitor — the tiny rectangular chip caps that dominate modern PCBs.',
    detail:
      'An MLCC stacks dozens to hundreds of paper-thin ceramic dielectric layers with metal electrodes interleaved between them, so the effective plate area is large but the package stays tiny. They are unpolarised, cheap, available from picofarads up to tens of microfarads, and good to GHz frequencies — the reasons every modern PCB is dotted with little brown rectangles. The big caveat is that high-permittivity ceramic types (X7R, Y5V) lose a chunk of their capacitance as the applied DC voltage approaches the rating ("DC bias derating"); for stable values use Class 1 (C0G / NP0) ceramic instead.',
    see: ['capacitor', 'np0', 'surface mount', 'dielectric'],
  },
  np0: {
    tip: 'Class 1 ceramic dielectric (also called C0G) — the most stable, most predictable capacitor dielectric, used wherever the value must hold across temperature and voltage.',
    detail:
      'NP0 (sometimes written N P 0, "Negative-Positive 0 ppm/°C") and the equivalent EIA code C0G describe the same Class 1 ceramic dielectric: capacitance changes by no more than ±30 ppm/°C across the full −55 °C to +125 °C range, with negligible voltage coefficient and very low loss. The trade-off is permittivity — Class 1 ceramics give only picofarads to a few nanofarads in a sensible package, so you find C0G / NP0 in tuned circuits, oscillators, and RF filters where every percent of capacitance counts, but not in bulk decoupling where Class 2 (X7R, Y5V) wins on capacitance per millimetre.',
    see: ['capacitor', 'mlcc', 'dielectric', 'tolerance'],
  },
  'time constant': {
    tip: 'The product τ = R · C fully determines how fast a capacitor charges or discharges through a resistor.',
    detail:
      'When a capacitor C charges through a resistor R toward a supply voltage, its voltage follows the curve V(t) = V∞·(1 − e^(−t/RC)). One time constant later (t = RC), the voltage has reached 63 % of its final value; at 2RC, 86 %; at 3RC, 95 %; at 5RC, 99.3 % — considered "fully charged" for most engineering purposes. Discharge follows the mirror image. The units work out neatly: ohms × farads = seconds. A useful mnemonic — megohms × microfarads = seconds, kilohms × microfarads = milliseconds. Time constants govern everything from 555-timer delays and debouncing networks to power-supply smoothing and audio high-pass filters.',
    unit: 'Seconds (s)',
    formula: 'τ = R · C  •  V(t) = V∞ · (1 − e^(−t/RC))',
    see: ['capacitor', 'rc circuit', 'capacitance', 'rl time constant'],
  },
  'rl time constant': {
    tip: 'The ratio τ = L / R fully determines how fast the current in an inductor builds up or decays through a resistor — same exponential shape as RC, but with R in the denominator (so doubling R halves τ instead of doubling it).',
    detail:
      'When a series RL circuit is connected to a supply, the current rises along I(t) = I∞·(1 − e^(−t/τ)) where τ = L / R and I∞ = V/R. One time constant later, the current has reached 63 % of its steady-state value; at 2τ, 86 %; at 3τ, 95 %; at 5τ, 99.3 % — considered "fully established" for most engineering purposes. Open the switch and the current decays along the mirror image, I(t) = I₀ · e^(−t/τ), provided a discharge path (a parallel resistor or a flyback diode) is available. The units work out: henries / ohms = seconds. Useful mnemonics — millihenries / ohms = milliseconds, microhenries / kilohms = nanoseconds. Note the inversion vs RC: in RC, R is in the numerator (R·C), so a larger R makes the curve slower; in RL, R is in the denominator (L/R), so a larger R makes the curve faster. RL time constants govern flyback transients, RF choke settling, switching-supply ramp times, and snubber design.',
    unit: 'Seconds (s)',
    formula: 'τ = L / R  •  I(t) = I∞ · (1 − e^(−t/τ))',
    see: ['inductor', 'inductance', 'time constant', 'back-emf'],
  },
  debouncing: {
    tip: 'Filtering out the burst of spurious pulses a mechanical switch emits when its springs bounce open-and-closed after being pressed.',
    detail:
      'When you press a mechanical switch or button, the contacts do not make a single clean connection — the moving spring bounces physically against the fixed contact for 1–10 ms before settling, emitting a burst of spurious ON/OFF pulses. A microcontroller reading the pin would see what looks like ten rapid button presses when only one happened. "Debouncing" filters that burst down to a single clean event. The classic hardware solution is a small RC low-pass network (a resistor feeding a capacitor with a time constant τ ≈ 10 ms) that turns the bounce burst into one smooth rising edge; firmware then reads the settled level. In software, the same idea is implemented as "ignore further pin changes for N ms after the first edge."',
    see: ['rc circuit', 'time constant'],
  },
  'rc circuit': {
    tip: 'A resistor and a capacitor wired together — the simplest circuit with a memory of the recent past.',
    detail:
      'An RC circuit is any circuit containing a resistor R in series or parallel with a capacitor C. Its characteristic behaviour is a smooth exponential response: a step input does not appear instantly at the output but builds up (or decays) on a timescale of τ = R·C seconds. In the time domain that means timing, debouncing, and edge-softening; in the frequency domain the same circuit is a first-order filter — arrange R and C one way and you have a low-pass (passes DC, attenuates high frequencies); swap them and you have a high-pass (blocks DC, passes AC above the cutoff). The cutoff frequency where response has dropped 3 dB is f_c = 1 / (2πRC). RC circuits appear everywhere: power-supply smoothing, microphone coupling, op-amp compensation, 555 timers, Arduino button debouncing.',
    formula: 'τ = RC  •  f_c = 1 / (2πRC)',
    see: ['capacitor', 'time constant', 'filter', 'reactance'],
  },
  'coupling capacitor': {
    tip: 'A capacitor wired in series to pass an AC signal from one stage to the next while blocking any DC offset.',
    detail:
      'A coupling capacitor sits in series between two circuit stages whose DC operating points are different but whose AC signals must travel between them intact. Because a capacitor blocks DC once charged, but passes AC (the higher the frequency, the more easily), it acts as a DC block and an AC pass-through. Typical uses: between amplifier stages so each transistor\'s bias is independent; between a microphone and the first preamp stage; at the input of an oscilloscope in AC-coupling mode. Value is chosen so the capacitor looks like a near-short at the lowest frequency of interest — for audio (20 Hz and up) that\'s typically 1–10 µF into a kΩ-range load; for RF it drops to nanofarads or picofarads.',
    see: ['capacitor', 'bypass capacitor', 'filter'],
  },
  'bypass capacitor': {
    tip: 'A capacitor wired between a DC supply rail and ground — shorts high-frequency noise to ground while leaving the DC voltage intact.',
    detail:
      'A bypass capacitor (also called a decoupling capacitor) sits between a DC power rail and ground, as close as possible to the pin of the chip it serves. The DC supply passes straight through the chip untouched; any high-frequency noise that would otherwise ride on the rail sees a near-short to ground through the capacitor instead, because a capacitor\'s reactance falls as frequency rises. A typical arrangement is a 100 nF ceramic at every chip plus a bigger 10 µF electrolytic once per board — the small ceramic handles fast transients, the electrolytic buffers slower sags. Skipping bypass capacitors is one of the most common causes of "it works on the bench but fails on the oscilloscope" bugs in digital and RF designs.',
    see: ['capacitor', 'coupling capacitor'],
  },
  esr: {
    tip: 'Equivalent Series Resistance — the real-world series resistance of a capacitor, responsible for its losses and self-heating under AC.',
    detail:
      'ESR (Equivalent Series Resistance) models the unavoidable ohmic losses inside a real capacitor — from lead wires, plates, electrolyte conductivity, and dielectric hysteresis — as a single lumped resistance in series with the ideal capacitance. Ceramic capacitors have ESR of milliohms; film caps a few tens of milliohms; aluminium electrolytics typically 50 mΩ to several ohms; older tired electrolytics can drift to 10 Ω or more. ESR matters most in switch-mode power supplies, where the capacitor handles high ripple currents and the I²·ESR heat can dry out the electrolyte. "Low-ESR" electrolytics exist precisely for this application. ESR is specified at a test frequency (commonly 100 kHz) because it depends on frequency.',
    unit: 'Ohm (Ω)',
    see: ['capacitor', 'electrolytic'],
  },
  inductor: {
    tip: 'Coil of wire that stores energy in a magnetic field.',
    detail:
      'An inductor opposes changes in current by generating a back-EMF. Its reactance increases with frequency — the opposite behaviour to a capacitor. Combined with a capacitor, it forms an LC circuit that resonates at a specific frequency. Inductors are essential in RF filters, matching networks, and power supplies.',
    unit: 'Henry (H)',
    formula: 'XL = 2πfL',
    see: ['inductance', 'henry', 'impedance', 'frequency'],
  },
  inductance: {
    tip: 'The property of a coil that opposes changes in the current through it — quantified as the voltage induced per rate of change of current.',
    detail:
      'Inductance L is the property of any wire (especially when wound into a coil) that develops a back-EMF whenever the current through it changes. Its defining equation is V = L · dI/dt — the voltage across the coil equals L times the rate of change of current. Inductance depends on geometry (number of turns squared, cross-sectional area, length) and the magnetic permeability of the core material. The unit is the henry (H). Don\'t confuse the property with the component — an inductor is the physical coil; inductance is the quantity it has.',
    unit: 'Henry (H)',
    formula: 'V = L · dI/dt',
    see: ['inductor', 'henry', 'self-inductance'],
  },
  henry: {
    tip: 'The SI unit of inductance — one volt of induced opposition per ampere-per-second of current change.',
    detail:
      'One henry (H) means a coil that produces one volt of induced voltage when its current changes at one ampere per second. A henry is a large unit — most real inductors are measured in millihenries (mH = 10⁻³ H), microhenries (µH = 10⁻⁶ H), or nanohenries (nH = 10⁻⁹ H). A 1 H choke is a fist-sized iron-cored part used in mains-frequency power supplies; a 100 nH coil is a few turns of wire on a small RF former. Named after Joseph Henry (1797–1878), one of the discoverers of electromagnetic induction.',
    unit: 'Henry (H)',
    see: ['inductance', 'inductor', 'si'],
  },
  solenoid: {
    tip: 'A long, evenly wound coil of wire — the standard idealised inductor in physics calculations.',
    detail:
      'A solenoid is a coil where the length is comparable to or longer than its diameter, with turns wound uniformly side by side. Inside a long solenoid the magnetic field is nearly uniform and parallel to the axis; outside it is weak and looks like the field of a bar magnet. The standard inductance formula for an idealised solenoid is L = µ₀·µᵣ·n²·A/l, where n is the number of turns, A the cross-sectional area, l the length, and µᵣ the relative permeability of the core. Most air-core RF coils you wind by hand are solenoids in this sense.',
    formula: 'L = µ₀·µᵣ·n²·A/l',
    see: ['inductor', 'inductance', 'toroid'],
  },
  ferrite: {
    tip: 'A non-conductive ceramic of iron oxide used as a high-permeability core material for RF inductors and transformers.',
    detail:
      'Ferrite is a sintered ceramic made from iron oxide mixed with manganese, zinc, or nickel. It has high relative permeability (1000–10000), which means a few turns on a small ferrite core can give you millihenries of inductance. Crucially, ferrite is a non-conductor — eddy-current losses are tiny even at MHz frequencies — making it the standard core material for RF transformers, switching power supplies, and EMI suppression chokes (the cylindrical lump on USB cables and PC monitor leads is a ferrite bead). Ferrites do saturate at moderate flux densities, so they are not used for high-DC-bias applications.',
    see: ['inductor', 'saturation', 'choke', 'toroid'],
  },
  choke: {
    tip: 'An inductor used specifically to block AC (or RF) while passing DC.',
    detail:
      'A choke is an inductor wired in series with a power-supply path or signal path with the specific job of blocking changing currents while letting steady current through. RF chokes (a few hundred µH to a few mH) keep RF energy from leaking back into supply rails through power lines feeding RF amplifiers. Filter chokes (mH to H, often iron-cored) sit between rectifiers and loads in linear power supplies, opposing AC ripple while passing DC. The choke and a parallel filter capacitor together form the classic LC low-pass filter found in every linear and switching supply.',
    see: ['inductor', 'reactance', 'filter'],
  },
  'back-emf': {
    tip: 'The voltage an inductor induces in itself when the current through it changes — opposes that change by Lenz\'s law.',
    detail:
      'When the current through an inductor changes, a magnetic flux change cuts the wire and induces a voltage in it (Faraday\'s law). Lenz\'s law says the polarity of that voltage always opposes the change in current. This self-induced voltage is called back-EMF — it is what makes an inductor "oppose AC". In practical terms: try to interrupt 1 A through a 1 mH coil in 1 µs and the back-EMF reaches 1000 V — enough to arc across mechanical contacts or destroy a transistor switch. This is why every coil-driven circuit needs a flyback diode or snubber across the coil to dissipate the stored energy safely.',
    formula: 'V = -L · dI/dt',
    see: ['inductor', 'self-inductance', 'inductance'],
  },
  'self-inductance': {
    tip: 'The induction effect a coil produces on itself by its own changing current — distinct from mutual inductance between two separate coils.',
    detail:
      'Self-inductance is the inductance L of an isolated coil — the voltage it induces in itself when its own current changes, V = L · dI/dt. It contrasts with mutual inductance M, which describes the voltage one coil induces in a second nearby coil through magnetic coupling. Self-inductance is the single-coil quantity; mutual inductance — the key concept behind transformers (Chapter 1.9) — is the two-coil one. Every wire has some self-inductance, even straight pieces — a 10 cm length of bare wire has roughly 100 nH, which becomes important above 100 MHz.',
    see: ['inductance', 'inductor', 'transformer', 'back-emf'],
  },
  transformer: {
    tip: 'Two coils sharing a magnetic core — energy passes between circuits through the magnetic field, with voltage stepped up or down by the turns ratio.',
    detail:
      'A transformer is two inductors wound on the same magnetic core so their fields are tightly coupled. AC current in the primary winding produces a changing flux in the core; that flux induces a voltage in the secondary winding. The voltage ratio equals the turns ratio (Vsec/Vpri = Nsec/Npri); the current ratio is its inverse. Transformers transfer power between circuits at different impedance levels, isolate them galvanically, and step voltages up or down — they are the workhorse of mains power distribution and RF impedance matching. Chapter 1.9 covers them in detail.',
    formula: 'V₂/V₁ = N₂/N₁',
    see: ['inductor', 'inductance', 'self-inductance'],
  },
  toroid: {
    tip: 'A doughnut-shaped magnetic core; coils wound on it have very low external field leakage.',
    detail:
      'A toroid is a ring-shaped core (most often ferrite or iron powder) with the wire wound around the entire ring. The closed magnetic loop means almost all the flux stays inside the core — a toroidal coil radiates very little magnetic field externally and is itself very hard to disturb with external fields. This makes toroids the preferred form factor for RF transformers, common-mode chokes, and switching-supply inductors where stray field is a problem. Iron-powder toroids in radio amateur work are colour-coded by mix (T-50-2 «red» for HF, T-50-6 «yellow» for upper HF / VHF) to identify their permeability and frequency range.',
    see: ['inductor', 'ferrite', 'choke'],
  },
  balun: {
    tip: 'BALanced–UNbalanced — a transformer or choke that matches a balanced antenna feed (like a dipole) to an unbalanced coaxial cable, also blocking common-mode current from running on the outside of the coax shield.',
    detail:
      'A balun sits between an antenna whose feed point is balanced — both feed wires carry equal currents 180° out of phase, like a dipole\'s two legs — and a coaxial transmission line, where the inner conductor and the grounded shield are not symmetric. Without one, common-mode current flows on the outside of the coax shield: the cable becomes part of the antenna, the radiation pattern distorts, RF appears in the shack (causing computer glitches and «RF in the audio»), and SWR readings become inconsistent. Two functional types are common in amateur radio. (1) Current / choke baluns (1:1) — pass the differential signal but choke off common-mode current with high impedance; built as a few turns of coax through a ferrite toroid, or as a stack of ferrite beads on the cable. (2) Voltage baluns (typically 4:1) — true transformers with a turns ratio that also transforms impedance, used for folded dipoles (≈ 200 Ω feed) and OCF (off-centre-fed) dipoles. Core material follows the job, and the two types want opposite things. A voltage/transformer balun for 100 W-class HF work is traditionally wound on mix 43, whose high permeability gives ample winding reactance with few turns. A choke (current) balun instead wants a lossy, resistive impedance, and there mix 31 is the best all-round performer across the HF bands — clearly the material of choice at 5 MHz and below, where it offers several dB more choking impedance than mix 43. Between 5 and 20 MHz mix 43 is about 1 dB ahead and above 20 MHz the two are equivalent, so that single decibel rarely decides anything and one mix 31 core covers every HF band — the HF transmitting chokes currently recommended in the ARRL Handbook are wound on mix 31 toroids. Mix 43 suppresses from roughly 20 MHz to 250 MHz, so it suits the upper HF and VHF end; mix 61 only suppresses above about 200 MHz, and below that it serves as an inductor material, useful up to about 25 MHz. SWR alone does NOT detect a missing balun — even a perfectly matched antenna will radiate from the cable.',
    see: ['transformer', 'toroid', 'ferrite', 'antenna', 'coax'],
  },
  unun: {
    tip: 'UNbalanced–UNbalanced — an impedance-matching transformer between two unbalanced lines, most often between 50 Ω coax and a high-impedance random-wire or end-fed-half-wave antenna.',
    detail:
      'An unun is the impedance-matching cousin of the balun: both sides of the line are unbalanced, so there is no symmetry-balancing role — only impedance transformation. Three ratios dominate amateur use. (1) 9:1 unun — converts 50 Ω to ≈ 450 Ω, used at the feed point of a random-wire antenna (the «9:1 long wire»); the high-impedance side connects to the radiator with a counterpoise as the return. (2) 49:1 unun — converts 50 Ω to ≈ 2450 Ω, used at the feed point of an end-fed-half-wave (EFHW) antenna, where a half-wavelength wire presents a very high impedance at its end. (3) 4:1 unun — converts 50 Ω to 200 Ω for some long-wire and shortened-vertical variants. Ununs are wound on ferrite or iron-powder toroids (FT-140-43 is a common 100 W EFHW choice) with bifilar or trifilar windings depending on the ratio. Unlike a balun, an unun does NOT block common-mode current — if the load is asymmetric (and most random-wire and EFHW antennas are), the coax shield will still radiate unless you add a separate 1:1 current choke a quarter-wavelength down the coax.',
    see: ['transformer', 'toroid', 'antenna', 'coax'],
  },
  'folded dipole': {
    tip: 'A dipole variant: two parallel conductors of the same length, joined at the ends to form a closed loop, fed at the centre of one of them. Feed-point impedance ≈ 280 Ω (four times that of a straight dipole), conveniently matched to 50 Ω coax through a 4:1 balun.',
    detail:
      'A folded dipole is built like a regular half-wave dipole but doubled back on itself: two parallel rods or wires (a few centimetres apart) of equal length, electrically connected at both ends, fed at the centre break of one wire. The two parallel paths share the antenna current, which raises the feed-point impedance to roughly 4× that of a single dipole — about 280 Ω in free space, ~200 Ω in a typical real installation. That ≈200 Ω feed is the canonical reason 4:1 baluns exist in amateur radio: a 4:1 balun (1:2 turns ratio, 1:4 impedance ratio) drops 200 Ω to 50 Ω so the rig sees a clean match. Folded dipoles also tend to be slightly more broadband than single dipoles and are mechanically self-supporting (the second conductor doubles as a structural element), which is why they are common in TV reception (the original 300 Ω twin-lead application) and in commercial VHF/UHF base-station antennas.',
    see: ['dipole', 'balun', 'antenna', 'coax'],
  },
  feeder: {
    tip: 'The transmission line — usually coaxial cable — that carries RF power between the transceiver and the antenna.',
    detail:
      'A feeder (or feedline) is the cable that connects a transceiver to its antenna. In amateur use it is almost always coaxial cable with a 50 Ω characteristic impedance (RG-58, RG-213, LMR-400 and so on); historically and in some specialist installations parallel «ladder line» (300–600 Ω open-wire feeder) is used for its lower loss on low bands. The job of the feeder is to deliver as much of the transmitter power as possible to the antenna with minimal loss and minimal radiation from the cable itself. Two numbers matter: characteristic impedance (which must match both the transmitter output and, ideally, the antenna feed-point impedance, otherwise SWR rises and power reflects back) and loss per 100 m at the working frequency (rising sharply above ~30 MHz, which is why thicker, lower-loss cable is worth the cost on VHF/UHF). Mismatched impedance does NOT make a feeder lossy on its own — but it does cause the standing waves that increase ohmic loss in lossy cable and that can raise voltage at the cable\'s antinodes high enough to damage thin dielectric.',
    see: ['coax', 'characteristic impedance', 'swr', 'antenna'],
  },
  efhw: {
    tip: 'End-Fed Half-Wave — a half-wavelength wire antenna fed at one end (rather than the middle). Presents a very high feed-point impedance (≈ 2 450 Ω), so it needs a 49:1 unun to match 50 Ω coax.',
    detail:
      'An EFHW antenna is just a wire that is one half-wavelength long at the operating frequency, but instead of being fed at its centre (where the impedance is ~73 Ω), it is fed at one end, where the standing-wave pattern puts a voltage maximum and a current minimum. That gives a feed-point impedance of roughly 2 450 Ω in free space — far too high for 50 Ω coax. A 49:1 unun (turns ratio 1:7, impedance ratio 1:49) brings 2 450 Ω down to ~50 Ω so the rig sees a usable match. EFHWs are popular for portable and field-day operation because they are easy to deploy: hang one end from a tree or telescopic mast, run the wire out at any convenient angle, and feed at the low end where the unun and coax can sit on the ground. They also work as multiband antennas — a half-wave on 40 m is also a full wave on 20 m, three half-waves on 15 m, and four half-waves on 10 m, and the high-impedance end-feed condition repeats at every harmonic. The trade-off is that a 1:1 current choke is usually needed a quarter-wavelength down the coax to stop the cable shield from radiating (the antenna itself is asymmetric, so common-mode current would otherwise flow on the cable braid).',
    see: ['unun', 'antenna', 'coax', 'transformer'],
  },
  variac: {
    tip: 'A variable autotransformer with a sliding contact on the winding, used for smoothly adjusting AC mains voltage on the bench. Known in post-Soviet labs as ЛАТР (Lab AutoTRansformer).',
    detail:
      'A Variac (Variable AC, the Western trade name; ЛАТР — Лабораторний АвтоТрансформатор — in Eastern-European labs) is a single-winding autotransformer with a brush that slides along the bare-copper face of the winding to pick off any fraction of the mains voltage from 0 V up to ~110% of mains. Because it is an autotransformer rather than a two-winding transformer, the input and output share a common neutral — there is no galvanic isolation between mains and load. That makes it dangerous for working on equipment whose chassis might be live; pair it with a separate 1:1 isolation transformer when servicing such gear. Typical bench Variacs are rated 1–3 kVA, with the brush mounted on a knob calibrated 0–250 V (or 0–270 V). They are useful for slow turn-on of newly-built power supplies (so a wiring error trips a fuse instead of vapourising a rectifier), for testing how equipment behaves at low or high mains, and for precision-controlled heating of coils being prepared for varnish impregnation.',
    see: ['transformer', 'mains', 'isolation transformer'],
  },
  hysteresis: {
    tip: 'A magnetic core\'s resistance to changing direction — the core «remembers» its previous flux, so reversing the field costs energy each cycle, dissipated as heat.',
    detail:
      'Hysteresis is the lag between cause and effect in any magnetic material. Magnetise an iron core in one direction, then reverse the field — the core does not flip cleanly to follow; it resists, and only changes once the new field is strong enough to overcome the existing alignment of its magnetic domains. The energy spent forcing each flip is dissipated as heat. On a B-vs-H plot the relationship traces out a closed loop (the «hysteresis loop») whose enclosed area equals the energy lost per cycle. Hysteresis loss is one of the four loss mechanisms in a real transformer, alongside leakage inductance, copper I²R heating, and eddy-current loss. Materials with narrow hysteresis loops (silicon steel, ferrites) are preferred for transformer cores because they waste the least energy per AC cycle.',
    see: ['transformer', 'ferrite', 'saturation'],
  },
  'eddy current': {
    tip: 'Circulating currents induced inside the body of a conductor by a changing magnetic field — they dissipate as heat and limit how thick a transformer\'s core can be at high frequencies.',
    detail:
      'Whenever a changing magnetic flux passes through a conductor, it induces voltages — and where there are voltages, current flows. In a solid metal core, those induced currents form little circular loops inside the metal itself, perpendicular to the field direction. Each loop dissipates energy as I²R heating. The loss rises with the square of the frequency and the square of the core\'s thickness, which is why low-frequency iron-core transformers use thin laminated sheets (each lamination is a much smaller loop than a solid block) and why high-frequency cores are made of insulating ferrite (no metallic conduction path = no eddy currents). Eddy currents have constructive uses too: induction heating, eddy-current brakes, metal detectors, and the velocity-feedback damping in some moving-coil meters all depend on them.',
    see: ['transformer', 'ferrite', 'hysteresis'],
  },
  saturation: {
    tip: 'When the magnetic core of an inductor reaches its maximum flux; further current produces almost no extra flux, so the inductance collapses.',
    detail:
      'Magnetic cores have a finite limit on the flux density they can support. As current rises and flux density approaches the saturation level (typically 0.3–0.5 T for ferrite, 1–2 T for iron), the core stops responding to further current and the effective inductance drops sharply — sometimes by a factor of 10 or more. In a power supply this means the inductor is no longer doing its job, and the current can spike to dangerous levels. Iron-powder cores have a soft, gradual saturation curve and tolerate large DC bias; ferrites have a sharp saturation knee and require careful design when DC currents are present.',
    see: ['inductor', 'ferrite'],
  },
  'right-hand rule': {
    tip: 'A mnemonic for finding the direction of the magnetic field around a current-carrying wire — curl your right hand\'s fingers in the direction of the current and your thumb points along the field.',
    detail:
      'The right-hand rule is the standard mnemonic that links the direction of an electric current to the direction of the magnetic field it produces. There are two common forms. (1) STRAIGHT WIRE: point your right thumb in the direction the current flows; your curled fingers show the direction the magnetic field circles around the wire. (2) COIL: curl your right hand\'s fingers in the direction the current goes around the loops of the coil; your thumb then points along the axis in the direction of the magnetic field inside the coil (the «north» end). The rule works because of the convention that current flows from + to − through the external circuit (conventional current). Use it any time you need to know which way the field points without doing a cross-product by hand.',
    see: ['inductor', 'inductance'],
  },
  'faradays law': {
    tip: 'A changing magnetic flux through any closed loop of wire induces a voltage in that loop, proportional to how fast the flux is changing.',
    detail:
      'Faraday\'s law of induction is the rule that ties magnetic and electric phenomena together: any change in the magnetic flux through a loop of wire produces a voltage (an «electromotive force», EMF) in that loop. The faster the flux changes, the larger the induced voltage; the formula is V = −dΦ/dt, where Φ is the flux through the loop. The minus sign is Lenz\'s law — the induced voltage always opposes the change that produced it. Faraday\'s law explains why a coil resists changes in its own current (self-inductance), why two nearby coils can transfer energy through the magnetic field (mutual inductance, transformers), and why moving a magnet near a coil generates a voltage (every electric generator and dynamic microphone). Together with Ampère\'s law it forms the magnetic half of Maxwell\'s equations.',
    formula: 'V = -dΦ/dt',
    see: ['inductor', 'self-inductance', 'back-emf', 'transformer'],
  },

  // ── Resonance ──────────────────────────────────────────────────
  resonance: {
    tip: 'A system\'s tendency to oscillate hardest at one natural frequency. In an LC circuit that is where the reactances cancel (X_L = X_C); in an antenna or a guitar string it is where the length fits the wave.',
    detail:
      'Resonance is the condition where a system exchanges energy most freely at its own natural frequency. In a lumped LC circuit it is where the inductive reactance X_L = 2πfL exactly equals the capacitive reactance X_C = 1/(2πfC): the two cancel, energy oscillates freely between the coil\'s magnetic field and the capacitor\'s electric field at f = 1/(2π√(LC)), and the circuit looks purely resistive. Below resonance the capacitor dominates, above it the inductor does; in series LC that gives minimum impedance (a notch / trap), in parallel LC maximum impedance (a tank). The very same idea governs a DISTRIBUTED resonator — an antenna, a guitar string, an organ pipe — only there the natural frequency is set by geometry: a wave runs along the length and reinforces itself when that length holds a whole number of half-waves (a half-wave dipole is the simplest case). Either way the reactances cancel at resonance and the response peaks — which is how every receiver and transmitter picks one frequency out of the noise on the antenna.',
    formula: 'f = 1 / (2π√(LC))',
    see: ['lc', 'reactance', 'standing wave', 'tank', 'q-factor', 'bandwidth'],
  },
  'resonant frequency': {
    tip: 'The natural oscillation frequency of an LC circuit — where X_L = X_C and energy passes freely between L and C.',
    detail:
      'The resonant frequency f₀ of an LC circuit is given by f₀ = 1/(2π√(LC)). At this frequency the inductive and capacitive reactances are equal and opposite, so they cancel — leaving only the resistive losses. f₀ scales with the inverse square root of both L and C: quadrupling either component halves the frequency. A handy check: at 1 MHz, 1 µH × 25 nF ≈ resonance; for the 7 MHz amateur band (40 m), 4 µH × 130 pF lands close. The same f₀ applies to series and parallel LC alike — what differs is what happens AT that frequency (current peak vs impedance peak).',
    formula: 'f₀ = 1 / (2π√(LC))',
    see: ['resonance', 'lc', 'reactance'],
  },
  'tank': {
    tip: 'A parallel LC circuit — energy «sloshes» between the inductor and capacitor like fluid in a tank, and the impedance peaks at the resonant frequency.',
    detail:
      'A tank circuit is an inductor and a capacitor wired in parallel. The name comes from the way energy is stored: like fluid moving back and forth in a tank, charge oscillates between the capacitor (electric-field storage) and the inductor (magnetic-field storage). At the resonant frequency f₀ = 1/(2π√(LC)), the parallel combination presents its maximum impedance — only the loss resistance limits how high. Above and below f₀ the impedance falls. Tank circuits are the most common form of LC in radio: every traditional receiver front-end, every transmitter output stage, and most antenna matching networks contain at least one. The «circulating current» inside the tank can be many times larger than the line current feeding it (multiplied by Q), which is why the tank capacitor must handle several times the current the rest of the circuit sees.',
    formula: 'Z_max = Q · X_L (at resonance)',
    see: ['resonance', 'lc', 'q-factor', 'reactance'],
  },
  'tuned circuit': {
    tip: 'A general name for any LC circuit used to select or reject a specific frequency — series-tuned (notch) or parallel-tuned (tank).',
    detail:
      'Tuned circuit is the umbrella term for any LC circuit deliberately built to act on one frequency more strongly than its neighbours. Series-tuned circuits present a low impedance at f₀ and a high impedance off-resonance — used as a band-pass element in series with the signal path or as a «trap» that shorts unwanted frequencies to ground. Parallel-tuned (tank) circuits do the opposite: high impedance at f₀, low impedance off-resonance — the workhorse of receiver front-ends and transmitter output networks. Adjustable tuned circuits use a variable capacitor or a slug-tuned inductor (a screwdriver-adjustable ferrite core) to set the operating frequency. The selectivity of a tuned circuit — how cleanly it picks out f₀ from neighbouring frequencies — is set by its Q.',
    see: ['resonance', 'lc', 'tank', 'q-factor', 'selectivity'],
  },
  'q-factor': {
    tip: 'Quality factor — figure of merit for an LC tank: stored energy divided by energy lost per cycle. Higher Q means a sharper, more selective response.',
    detail:
      'The quality factor Q (also called Q-factor or just Q) tells you how «good» a resonant circuit is at storing energy compared to losing it. Three exactly equivalent definitions: (1) Q = 2π × (energy stored) / (energy lost per cycle) — the fundamental definition; (2) Q = X / R — the ratio of reactance to series loss resistance, useful for components; (3) Q = f₀ / BW — the resonant frequency divided by the −3 dB bandwidth, useful when you can sweep the response on a VNA. In a real LC tank, the inductor\'s winding resistance (and skin-effect losses at HF and above) almost always dominate; capacitors of decent quality have Q in the thousands. Typical numbers: a hand-wound air-core RF coil might give Q ≈ 100–300; a toroid on the right ferrite mix Q ≈ 50–200; a high-end mechanical filter or quartz crystal Q ≈ 10 000–100 000. Loaded Q (Q_L) is what you actually measure once the source and load impedances are connected — it is always lower than the unloaded Q (Q_U) of the bare tank.',
    formula: 'Q = X_L / R_loss = f₀ / BW',
    see: ['resonance', 'tank', 'bandwidth', 'selectivity'],
  },
  'frequency response': {
    tip: 'How a circuit\'s output amplitude (and phase) varies with frequency — the magnitude side is what you read off a Bode plot or a VNA S21 trace.',
    detail:
      'The frequency response is the gain (or attenuation) of a network plotted against frequency, and it is the single most useful description of any filter, amplifier, or transducer. The magnitude part — almost always plotted in dB on a log-frequency axis — tells you the passband, the cut-off, the roll-off slope, and the stopband rejection at a glance; the phase part tells you about group delay and time-domain behaviour. In English-language texts you will see it written as «frequency response» or «magnitude response»; Soviet-era and modern Ukrainian textbooks call the magnitude part the «амплітудно-частотна характеристика» (AЧХ) and the phase part the «фазочастотна характеристика» (ФЧХ). All three names refer to the same plot, generated the same way: drive the input with a swept sinewave (or a VNA), record output amplitude (and phase) at each frequency, and plot.',
    see: ['decibel', 'bode plot', 's21', 'bandwidth'],
  },
  bandwidth: {
    tip: 'The width in frequency between the two −3 dB (half-power) points of a resonant response — bandwidth = f₀ / Q.',
    detail:
      'Bandwidth (BW) of a resonant circuit is the frequency span between the two points where the response has fallen to half its peak power (−3 dB on a log scale, 0.707 of peak amplitude on a linear scale). For a parallel tank the response is the impedance versus frequency curve; for a series-LC the response is the current versus frequency curve. The bandwidth-Q relationship BW = f₀ / Q is universal: a 1 MHz tank with Q = 100 has a bandwidth of 10 kHz. Wider radio applications use deliberately low-Q (broad) tuned circuits — an FM broadcast stage needs ≈ 200 kHz bandwidth at 100 MHz, so Q ≈ 500 is plenty. Narrow applications (CW filters, crystal filters) demand Q in the thousands or tens of thousands. The same word «bandwidth» is also used in entirely different contexts (signal occupied bandwidth, oscilloscope analogue bandwidth, data-transmission bandwidth) — always check what the speaker actually means.',
    formula: 'BW = f₀ / Q',
    unit: 'Hertz (Hz)',
    see: ['q-factor', 'resonance', 'selectivity'],
  },
  selectivity: {
    tip: 'A receiver or filter\'s ability to separate a wanted frequency from a nearby unwanted one — driven by the Q of its tuned circuits.',
    detail:
      'Selectivity is the qualitative term for how cleanly a circuit picks out one frequency from its neighbours. A highly selective receiver can hear a 14.250 MHz signal while ignoring a much stronger station 5 kHz away on 14.245 MHz; a poorly selective one cannot. Selectivity is not a single number — it depends on the shape of the response curve, not just how wide the passband is. Engineers put a number on that shape with the «shape factor», which says how steep the filter\'s edges are. You measure the passband\'s width near the top — where the signal has dropped by 6 dB, to about half its voltage — and again far down where it has dropped by 60 dB (practically gone), then divide the lower width by the upper one. A perfect «brick-wall» filter is just as narrow at the bottom as at the top, so its shape factor is 1 — perfectly vertical edges; the larger the number, the more the edges slope outward. Cheap LC filters land around 5–10, while multi-pole crystal and mechanical filters approach a steep 1.5–2. In practice, a single LC tank gives modest selectivity; cascading several tanks (with the right coupling between them) sharpens the skirts dramatically and is the basis of the IF filter chain in every superhet receiver.',
    see: ['q-factor', 'bandwidth', 'resonance', 'filter'],
  },
  'characteristic impedance': {
    tip: 'For an LC tank, Z₀ = √(L/C) — the impedance that appears at the inductor and capacitor at resonance. (The same name and formula reappear for transmission lines.)',
    detail:
      'The characteristic impedance of an LC tank, Z₀ = √(L/C), is the magnitude of the reactance of either L or C at the resonant frequency (because at f₀ they are equal). It is the «impedance scale» of the tank: a 1 µH × 100 pF tank has Z₀ = 100 Ω; a 100 µH × 100 pF tank has Z₀ = 1 kΩ. For matching purposes Z₀ is what the tank looks like to the source at resonance once its losses are factored in, and the value drives how easily the tank can be coupled to a 50 Ω feedline. The same name and formula also describe a transmission line\'s characteristic impedance (the ratio of the voltage to the current of a wave travelling down a coax cable) — same maths, different physical context.',
    formula: 'Z₀ = √(L/C)',
    unit: 'Ohm (Ω)',
    see: ['lc', 'reactance', 'impedance'],
  },
  trap: {
    tip: 'An LC circuit placed in a signal path to block or shunt one specific frequency — the standard tool for notching out a single unwanted carrier.',
    detail:
      'A trap is an LC circuit deliberately tuned to one frequency and inserted into a signal path to reject it. Two common topologies, named by how the trap is connected to the signal path: SHUNT TRAP — series LC wired from signal line to ground; series LC has near-zero impedance at f₀, so the unwanted frequency is drained to ground while everything else passes. SERIES TRAP — parallel LC wired in series with the signal path; parallel LC has near-infinite impedance at f₀, so the unwanted frequency is blocked in the line while everything else passes through the residual reactance. Multi-band antennas use series traps to make a single radiator behave as different lengths on different bands (a typical trap dipole has 7 MHz parallel-LC traps that go high-Z at 14 MHz and disconnect the outer wire sections). TVI and RFI fixes routinely use shunt traps — a series LC across the input of a stereo to drain the 28 MHz signal a nearby ham\'s amplifier injects into the speaker leads.',
    see: ['resonance', 'lc', 'filter'],
  },
  'antenna tuner': {
    tip: 'An adjustable LC matching network between the transceiver and the feedline that brings whatever the antenna presents back to a 50 Ω match.',
    detail:
      'An antenna tuner (also called an «ATU», antenna tuning unit, or sometimes a «transmatch») is the adjustable LC network that matches a transmitter\'s 50 Ω output to whatever impedance the antenna actually presents at the operating frequency. Most antennas are only well-matched on their design band — on a different band, or at a slightly off frequency, the SWR can be 3:1 or worse. Many transmitters fold back power above 1.5:1 SWR to protect the output stage; the tuner solves this by inserting a variable LC matching network that brings the feedline-side impedance back to 50 Ω, regardless of what is going on the other side. Common topologies: T-network (two series capacitors with a shunt inductor between them), L-network (one series inductor + one shunt capacitor, four possible arrangements), and Pi-network (one series inductor with two shunt capacitors). All three are LC structures whose adjustability lets the operator move resonance and impedance level around. A tuner does NOT make a bad antenna a good radiator — it just protects the transmitter: by presenting it with a matched 50 Ω load, the tuner lets it deliver full power regardless of what the antenna\'s actual impedance is.',
    see: ['lc', 'resonance', 'impedance', 'swr'],
  },

  diode: {
    tip: 'Semiconductor that allows current in one direction only.',
    detail:
      'A diode has an anode (+) and cathode (−). Current flows easily from anode to cathode (forward biased) with a small voltage drop (0.6 V for silicon, 0.3 V for Schottky). In reverse, almost no current flows until the breakdown voltage is reached. Diodes are used for rectification (AC→DC), protection, and signal detection.',
    see: ['anode', 'cathode', 'rectification', 'diode testing'],
  },
  anode: {
    tip: 'The terminal of a diode, LED, or battery on the «positive» side — where conventional current enters the device.',
    detail:
      'The anode is one of the two terminals of a diode, LED, or other polarised component. By convention, current enters the device through the anode and leaves through the cathode. In the diode schematic symbol, the anode sits at the flat side of the triangle (the wide end). On a real through-hole diode, the anode is the lead WITHOUT the band painted on the body. On an LED, the anode is the longer lead (and inside the bulb, the larger frame). Word origin: from Greek «ἄνοδος» — «way up», where positive current «enters».',
    see: ['cathode', 'diode', 'led'],
  },
  cathode: {
    tip: 'The terminal of a diode, LED, or battery on the «negative» side — where conventional current leaves the device.',
    detail:
      'The cathode is the second of the two terminals of a polarised component (the anode is the other). By convention, current leaves the device through the cathode. In the diode schematic symbol, the cathode is the bar at the tip of the triangle. On a real through-hole diode, the cathode is the lead with the painted BAND on the body — same end as the bar in the symbol. On an LED, the cathode is the shorter lead (and inside the bulb, the smaller frame next to the reflector). Get this end the wrong way round and the diode simply will not conduct in normal operation. Word origin: Greek «κάθοδος» — «way down».',
    see: ['anode', 'diode', 'led'],
  },
  'forward voltage drop': {
    tip: 'The voltage that develops across a conducting diode — roughly constant (≈ 0.6 V for silicon) over a wide range of currents.',
    detail:
      'The forward voltage drop V_F is the (almost) flat voltage that a diode pushes back when current flows through it in the conducting direction. It depends on the semiconductor material, not on the current level: small-signal silicon diodes (1N4148) sit at ≈ 0.6–0.7 V over the entire 1–100 mA range; Schottky diodes (1N5819) at ≈ 0.2–0.3 V; LEDs at ≈ 1.8 V (red), ≈ 2.1 V (green), ≈ 3.0 V (blue/white). For circuit design the rule is «treat the diode as a constant battery in series with the wire»: a 5 V supply driving a series silicon diode + load resistor only delivers 4.3 V to the resistor. The drop varies a little with current — about 60 mV per decade — which is the «slope of the I–V curve past the knee».',
    formula: 'V_F ≈ 0.7 V (Si) | 0.3 V (Schottky) | 1.8–3.0 V (LED)',
    see: ['diode', 'schottky diode', 'led'],
  },
  'iv curve': {
    tip: 'The graph of current through a device versus voltage across it. For an ideal resistor it is a straight line with slope 1/R; for non-linear elements (diodes, transistors, Zeners) it has a characteristic shape that captures how the device responds to applied voltage at every operating point.',
    detail:
      'The I–V («current-voltage») curve is the simplest way to characterize a two-terminal device. Voltage on the X axis, current on the Y axis; any operating point falls somewhere on this curve. For a resistor the curve is a straight line through the origin (slope 1/R, Ohm’s law). For real semiconductors the curve has a shape that captures the device’s non-linear behaviour: the diode’s exponential knee, the Zener’s near-vertical breakdown cliff, the transistor’s saturation region. Together with KVL and KCL, the I–V curve fully determines the device’s behaviour in any circuit — the operating point is just the intersection of the device curve with the «load line» drawn from the rest of the circuit.',
    see: ['diode', 'forward voltage drop', 'load line'],
  },
  'load line': {
    tip: 'A straight line drawn on a device’s I–V curve representing the constraint imposed by the rest of the circuit (typically a series resistor and a supply voltage). The actual operating point is where the device curve and the load line cross.',
    detail:
      'The load line is the graphical solution to «what voltage and current does the circuit settle at when the device is non-linear?». For a device in series with a resistor R driven by a supply V_in, KVL says V_device = V_in − I · R — a straight line in (V, I) space with slope −1/R, x-intercept V_in (when I = 0), and y-intercept V_in / R (when V_device = 0). Plotting that line on top of the device’s I–V curve, the operating point is simply the intersection. As V_in or R changes, the line slides; the operating point traces along the device’s curve. The same technique sets up transistor bias points, sizes diode rectifiers, and predicts op-amp output behaviour — any time a non-linear device sits between a fixed supply and a passive load.',
    see: ['iv curve'],
  },
  'pin diode': {
    tip: 'A diode with an undoped «intrinsic» silicon layer between the P- and N-doped regions; at radio frequencies the charge stored in that layer can’t drain fast enough to follow the signal, so the diode behaves as a resistor whose value is set by the DC bias current.',
    detail:
      'A PIN diode is a three-layer structure: P-type → Intrinsic (undoped) → N-type. The intrinsic middle layer acts as a charge bucket — a small DC bias current floods it with carriers, and once full, the carriers take microseconds to drain. That’s far longer than one RF half-cycle, so at radio frequencies the bucket stays full no matter what the signal does, and the diode stops behaving like a rectifier. Instead, the RF current through the i-layer is carried by those very same stored carriers — their density sets the layer’s ohmic resistance, and the DC bias current sets the density (more DC → more carriers → lower RF resistance). That mechanism — a small DC current modulating a much larger RF signal — is why PIN diodes are the standard parts for RF switches, attenuators, and limiters. Common amateur-radio uses: the transmit/receive switch in handheld transceivers (a pair of PIN diodes plus a bias network), electronically-variable attenuators for front-end protection, and high-power RF protection circuits. Typical parts: BAR63, HSMP-3893, BAP-50.',
    see: ['diode', 'rf'],
  },
  'schottky diode': {
    tip: 'A diode built from a metal–semiconductor junction instead of two pieces of doped silicon — half the forward drop, and switches faster.',
    detail:
      'A Schottky diode replaces one of the two doped-silicon halves of an ordinary diode with a metal layer (often platinum or molybdenum). The metal-semiconductor interface conducts at a much lower voltage than a silicon-silicon junction: V_F ≈ 0.2–0.3 V instead of 0.6–0.7 V, halving the power wasted in a low-voltage rectifier. Schottky diodes also have negligible «reverse-recovery time» — they stop conducting almost instantly when the polarity reverses — which makes them the only practical choice in switching power supplies running at hundreds of kHz. The trade-offs: higher reverse leakage current (microamps instead of nanoamps) and lower reverse-breakdown voltage (40–60 V is typical; 100 V is rare). Common parts: 1N5819 (40 V, 1 A), BAT54 (SMD signal Schottky), MBRP40045 (high-current bridge for solar/automotive).',
    formula: 'V_F ≈ 0.3 V at 1 mA',
    see: ['diode', 'forward voltage drop', 'rectification'],
  },
  antenna: {
    tip: 'Converts electrical signals to radio waves and vice versa.',
    detail:
      'An antenna is a conductor sized to efficiently radiate or receive electromagnetic waves at a particular frequency. A half-wave dipole — the most fundamental antenna — has a total length of about half the wavelength, and that is where the 143/f rule comes from: since λ = c/f with c ≈ 3×10⁸ m/s, a full wavelength is 300/f metres, half of that is 150/f, and a real wire is cut roughly 5% shorter (end effect) to ≈ 143/f. Impedance matching between the antenna and feedline is critical — poor matching means reflected power and reduced range.',
    formula: 'λ/2 dipole ≈ 143 / f(MHz) m  (= 0.95 × ½λ, with λ = c/f)',
    see: ['impedance', 'swr', 'frequency'],
  },

  'electric field': {
    tip: 'The region of influence around anything that has a voltage on it.',
    detail:
      'An electric field is a region of space in which a stray electric charge would feel a force — the electrical counterpart of gravity, with charge playing the role mass plays for gravity. It surrounds any object carrying a voltage and stores energy: pulling charges apart (as a capacitor does) loads energy into the field, which is released when they are allowed to move back together. In a radio wave the electric field oscillates at right angles to the magnetic field; its strength is measured in volts per metre (V/m) and is the part of the wave usually measured.',
    unit: 'Volts per metre (V/m)',
    see: ['magnetic field', 'electromagnetic wave', 'voltage', 'charge'],
  },
  'magnetic field': {
    tip: 'The region of influence around anything carrying an electric current.',
    detail:
      'A magnetic field is a region of space that exerts a force on moving charge (current) and on magnets. It appears whenever current flows — the field around a current-carrying coil (Chapter 1.6) — and stores energy that is released when the current is allowed to change. In an electromagnetic wave the magnetic field sits at a perfect right angle to the electric field and oscillates in step with it; its strength is measured in amperes per metre (A/m).',
    unit: 'Amperes per metre (A/m)',
    see: ['electric field', 'electromagnetic wave', 'current', 'inductor'],
  },
  'electromagnetic wave': {
    tip: 'A self-sustaining ripple of linked electric and magnetic fields travelling through space.',
    detail:
      'An electromagnetic wave is created when the energy stored in an electric or magnetic field changes: a changing magnetic field spawns a changing electric field and vice versa, so the pair regenerate each other and travel outward at the speed of light, needing no wire or medium to carry them. The two fields are not separate things that happen to overlap — they are two aspects of one entity, held at right angles and oscillating in phase. Maxwell predicted such waves in 1864; Hertz demonstrated them in 1886. Radio waves, light, and X-rays are all electromagnetic waves, differing only in frequency.',
    see: ['radio wave', 'electric field', 'magnetic field', 'frequency'],
  },
  'radio wave': {
    tip: 'An electromagnetic wave at a frequency low enough to generate and use for radio.',
    detail:
      'A radio wave is an electromagnetic wave in the part of the spectrum we can practically generate with a circuit and radiate from an antenna — conventionally from about 3 kHz up to 300 GHz. Launching, shaping, and catching radio waves is the whole craft of radio. Like every electromagnetic wave it travels at the speed of light and carries energy in linked electric and magnetic fields, with a wavelength set by its frequency.',
    see: ['electromagnetic wave', 'frequency', 'antenna'],
  },
  'speed of light': {
    tip: 'The fixed speed at which every electromagnetic wave travels — about 300 000 km/s in empty space.',
    detail:
      'The speed of light, written c, is the speed at which every electromagnetic wave — radio, light, X-rays — travels through empty space: about 3 × 10⁸ metres per second, or 300 000 kilometres per second. It is the same for every frequency, which is exactly why wavelength and frequency are just two views of one wave (λ = c / f). Waves slow a little in materials — to roughly two-thirds of c inside the polyethylene of coaxial cable — but in air and vacuum c is treated as a constant.',
    see: ['wavelength', 'frequency', 'electromagnetic wave'],
  },
  wavelength: {
    tip: 'The distance from one crest of a wave to the next.',
    detail:
      'Wavelength (λ) is the physical distance a wave covers in one complete cycle — crest to crest. For a radio wave it is set by the frequency through λ = c / f, so higher frequencies have shorter wavelengths. Amateur bands are named by wavelength: the «20-metre band» sits near 14 MHz. A handy shortcut is λ in metres ≈ 300 / f in MHz. Antenna sizes scale with wavelength, which is why a 2-metre antenna is small and an 80-metre antenna is huge.',
    formula: 'λ (m) = 300 / f (MHz)',
    see: ['frequency', 'speed of light', 'radio wave', 'antenna'],
  },
  polarisation: {
    tip: 'The orientation of the electric field in a radio wave — vertical, horizontal, or rotating (circular).',
    detail:
      'Polarisation is the direction in which the electric field of a wave oscillates, relative to the ground. A vertical whip antenna radiates a vertically polarised wave; a horizontal dipole or Yagi radiates a horizontal one; a helical antenna radiates a circularly polarised wave whose field rotates as it travels. It matters because a receiving antenna should match the polarisation of the wave: using a vertical antenna for a horizontally polarised signal, or the reverse — called cross-polarisation — can cut the received signal by more than 20 dB.',
    see: ['electric field', 'antenna', 'electromagnetic wave'],
  },
  'electromagnetic spectrum': {
    tip: 'The full range of electromagnetic waves ordered by frequency — radio at the low end through to gamma rays.',
    detail:
      'The electromagnetic spectrum is the continuum of all electromagnetic waves arranged by frequency (and so by wavelength). Radio occupies the low-frequency end, roughly 3 kHz to 300 GHz, subdivided into VLF, LF, MF, HF, VHF, UHF, SHF and EHF. Above radio come infrared, a narrow band of visible light, ultraviolet, X-rays and gamma rays. They are all the same phenomenon — oscillating electric and magnetic fields — differing only in frequency, and all travel at the speed of light.',
    see: ['radio wave', 'frequency', 'electromagnetic wave'],
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
  rf: {
    tip: 'Radio frequency — the AC signal range where radios actually transmit and receive.',
    detail:
      'RF (radio frequency) spans roughly 3 kHz to 300 GHz — the range of AC frequencies at which signals radiate efficiently as electromagnetic waves from practical-size antennas. Amateur radio splits this into HF (3–30 MHz, long-distance via ionosphere), VHF (30–300 MHz, mostly line-of-sight, 2 m band), and UHF (300 MHz – 3 GHz, 70 cm band, microwave edge). Below RF you cannot radiate efficiently without impractically large antennas; far above it you are in microwave and optical territory. In conversation "RF" often means "the signal that goes to the antenna" — as opposed to AF (audio frequency), which is what a microphone produces before it gets modulated onto the RF carrier.',
    see: ['hf', 'vhf'],
  },
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
  'space wave': {
    tip: 'The line-of-sight radio wave that travels in a near-straight line to the horizon — the main VHF/UHF mode.',
    detail:
      'The space wave travels directly from transmitting to receiving antenna in an almost straight line, bent only slightly downward by the lower atmosphere so it reaches about 15% past the visual horizon. It dominates at VHF and UHF, where the ionosphere no longer returns signals to earth. Its range is set mainly by antenna height — the radio horizon grows with the square root of height — which is why VHF/UHF operators mount antennas as high as they can.',
    see: ['vhf', 'uhf', 'troposphere'],
  },
  'critical frequency': {
    tip: 'The highest frequency the ionosphere still sends straight back when a wave is fired vertically upward.',
    detail:
      'Point a transmitter straight up and slowly raise the frequency: above a certain point the wave no longer returns — it passes through the layer into space. That threshold is the critical frequency (for the F2 layer, written foF2). It gauges how strongly the layer is ionised, rising by day and with solar activity and falling at night. Waves sent at a shallow angle can still be returned at frequencies well above the critical frequency (up to the MUF, the maximum usable frequency), because a glancing wave needs less bending to be turned back.',
    see: ['ionosphere', 'muf'],
  },
  'skip distance': {
    tip: 'The ground distance from the transmitter to where the first sky-wave hop returns to earth.',
    detail:
      'A sky wave launched at a given angle is refracted by the ionosphere and comes back to earth some distance away — that distance is the skip distance. Lower take-off angles give longer skip distances (up to about 4000 km for a single F2 hop); steeper angles come down closer. It depends on the layer height, the take-off angle and the frequency, and it sets the inner edge of where the signal can be heard.',
    see: ['skywave', 'skip zone', 'muf'],
  },
  'skip zone': {
    tip: 'The silent ring of ground beyond ground-wave range but nearer than the first sky-wave landing.',
    detail:
      'Between the point where the ground wave has faded and the point where the first sky-wave hop returns to earth, neither wave reaches the ground — this silent ring is the skip zone (or dead zone). It is why a station 2000 km away can be perfectly readable while one 200 km away hears nothing. Raising the frequency toward the MUF (the maximum usable frequency), or using a higher take-off angle, shrinks the skip zone.',
    see: ['skip distance', 'skywave'],
  },
  muf: {
    tip: 'Maximum Usable Frequency — the highest frequency an ionospheric path will return to earth.',
    detail:
      'The MUF is the top of the usable window for a sky-wave path: above it the wave bends too little and passes through the ionosphere into space. It is the critical frequency multiplied by a factor that grows as the path lengthens (the take-off angle lowers), so long DX paths can use higher bands than short ones. The MUF rises by day and with solar activity and falls at night; operators aim just below it, where absorption is least.',
    see: ['critical frequency', 'luf', 'skywave'],
  },
  luf: {
    tip: 'Lowest Usable Frequency — below it, D-layer absorption swallows a sky-wave signal before it can return.',
    detail:
      'The LUF is the bottom of the usable window: frequencies below it are absorbed by the D layer (strongest at low frequencies and in daylight) before they can complete the path. Together with the MUF (the maximum usable frequency) it brackets the band of frequencies that actually work on a given path at a given time. The LUF climbs during the day as D-layer absorption strengthens, and falls at night when the D layer fades.',
    see: ['muf', 'ionosphere'],
  },
  hop: {
    tip: 'One up-and-down bounce of a sky wave off the ionosphere and back to earth.',
    detail:
      'A single hop is one refraction off the ionosphere that returns the wave to the ground, spanning up to about 4000 km off the F2 layer. For greater distances the wave reflects off the ground and repeats — two-hop, three-hop and so on — chaining across the world. Each hop loses energy to ground reflection and absorption, so multi-hop signals arrive weaker.',
    see: ['skywave', 'skip distance'],
  },
  fading: {
    tip: 'The slow rise and fall of a received signal\'s strength — known by the Morse abbreviation QSB.',
    detail:
      'Fading (QSB) is the ever-changing strength of a sky-wave signal. Most often it is multipath fading: the signal arrives by two or more paths of slightly different length through a moving ionosphere, and as they drift in and out of phase they alternately reinforce and cancel. Polarisation fading (the ionosphere twisting the wave\'s polarisation) and absorption fading also occur. Automatic gain control and spaced (diversity) antennas help counter it.',
    see: ['multipath', 'skywave', 'ionosphere'],
  },
  qsb: {
    tip: 'QSB — the Morse/Q-code abbreviation for fading, a signal rising and falling in strength.',
    detail:
      'QSB is the Q-code operators use for fading: the received signal swelling and sinking over seconds or minutes, usually because a sky wave arrives by several drifting paths. Like other Q-codes it works as both a question and a statement — "QSB?" asks "is my signal fading?", "QSB" reports "your signal is fading". It is a compact shorthand inherited from the CW era and still used on every mode.',
    see: ['fading', 'multipath'],
  },
  multipath: {
    tip: 'A signal arriving by more than one path at once, the paths having slightly different lengths.',
    detail:
      'When a wave reaches the receiver by several routes — for example a two-hop and a three-hop sky-wave path — the copies arrive at slightly different times. Depending on the exact path-length difference they add up or partly cancel, and as the ionosphere drifts this balance keeps changing, producing multipath fading. Multipath also smears digital signals in time, which is why data modes use error correction and guard intervals.',
    see: ['fading', 'skywave'],
  },
  troposphere: {
    tip: 'The lowest layer of the atmosphere — the bottom ~12 km where weather happens.',
    detail:
      'The troposphere is where clouds, wind and temperature changes live. For radio it matters mainly at VHF and UHF: normally these bands pass straight through it line-of-sight, but a temperature inversion can bend or trap them, producing tropospheric ducting that carries signals far past the horizon. Unlike the ionosphere, the troposphere\'s effects follow the weather rather than the sun.',
    see: ['tropospheric ducting', 'vhf', 'space wave'],
  },
  'tropospheric ducting': {
    tip: 'A weather effect that traps VHF/UHF signals in a layer and guides them far beyond the horizon.',
    detail:
      'When a temperature inversion puts warm air above cooler air (typical of stable high pressure, or a warm evening over the sea), radio waves bend toward the denser cool air and can become trapped in a duct between the warm lid and the surface. VHF and UHF signals then travel hundreds — occasionally over a thousand — kilometres past the normal line-of-sight horizon. A "tropo opening" follows the weather map and is prime time for VHF/UHF DX.',
    see: ['troposphere', 'vhf', 'uhf'],
  },
  sunspot: {
    tip: 'A dark, cooler patch on the sun whose count tracks solar activity over an ~11-year cycle.',
    detail:
      'Sunspots are regions of intense magnetic activity that look darker because they are slightly cooler than the surrounding surface. Their number rises and falls over roughly eleven years — the sunspot (solar) cycle. More sunspots mean more ultraviolet output, which more strongly ionises the F2 layer, raises the MUF (the maximum usable frequency) and opens the high HF bands for worldwide work. Sunspot counts have been recorded since the 1600s, one of the longest scientific data series we have.',
    see: ['solar flux', 'ionosphere', 'muf'],
  },
  'solar flux': {
    tip: 'The Solar Flux Index (SFI) — the sun\'s 10.7 cm radio output, a daily gauge of how well HF will propagate.',
    detail:
      'The solar flux index measures the sun\'s radio noise at a wavelength of 10.7 cm and closely tracks the ultraviolet that ionises the ionosphere. It runs from about 65 at a quiet solar minimum to over 200 at an active maximum; the higher it is, the higher the MUF (the maximum usable frequency) and the better the high HF bands. It is quoted alongside the A and K indices (which measure geomagnetic disturbance) on DX-cluster and space-weather pages — you want the flux high and the K index low.',
    unit: 'sfu',
    see: ['sunspot', 'muf', 'hf'],
  },
  cw: {
    tip: 'Continuous Wave — Morse-code transmission, an unmodulated carrier keyed on and off.',
    detail:
      'CW (Continuous Wave) is the original radio mode: the transmitter emits an unmodulated carrier on the operating frequency, and the operator keys it on and off in Morse code (dots and dashes). Because the signal is just one frequency, CW occupies extremely narrow bandwidth — typically 100–500 Hz, set by the keying speed and the receiver filter. The narrow bandwidth is why CW «punches through» weak signals: a 50 Hz CW filter has 100× more SNR advantage than a 5 kHz SSB filter on the same noise floor. CW is the most efficient mode in human-operated amateur radio for long-distance, low-power (QRP) work, and the simplest to build a transmitter for — a switched oscillator and a key are enough.',
    see: ['ssb', 'qrp', 'bandwidth'],
  },
  ssb: {
    tip: 'Single Sideband — voice modulation that uses half the bandwidth of full AM by removing one sideband and the carrier.',
    detail:
      'SSB (Single Sideband) is the dominant voice mode on HF amateur and commercial radio. Full AM produces a carrier and two sidebands carrying the same audio; SSB filters out the carrier and one sideband, transmitting only the other (USB — upper sideband, or LSB — lower sideband). Bandwidth drops from ~6 kHz (AM) to ~3 kHz (SSB), and all transmitter power goes into useful information rather than the redundant carrier. The trade-off is receiver complexity: SSB needs a stable beat-frequency oscillator (BFO) to reinsert the missing carrier on demodulation. By convention, USB is used above 10 MHz and on VHF/UHF, LSB below 10 MHz on HF amateur bands.',
    see: ['am', 'cw', 'bandwidth'],
  },
  sdr: {
    tip: 'Software-Defined Radio — a receiver or transmitter where signal processing happens in software instead of analogue circuits.',
    detail:
      'Software-Defined Radio replaces most of the analogue signal-processing chain (IF amplifiers, mixers, filters, demodulators) with an analogue-to-digital converter and a CPU/DSP/FPGA running signal-processing code. The hardware front-end shrinks to a low-noise amplifier, a quadrature mixer, and an ADC; everything else — filtering, demodulation, audio output — happens in software. A single radio can receive any mode (AM, FM, SSB, CW, digital protocols) by reloading software, and visual «waterfall» displays of the spectrum become trivial to implement. Hobbyist receivers like the RTL-SDR (~$30) cover 24 MHz to 1.7 GHz; transmit-capable SDRs like the HackRF or PlutoSDR support both directions. The direct-conversion architectures most SDRs use still need front-end LC filters to reject out-of-band signals.',
    see: ['am', 'fm', 'ssb', 'cw'],
  },

  // ── Decibels (Chapter 0.4) ───────────────────────────────────────
  decibel: {
    tip: 'A logarithmic way of expressing a ratio between two values — usually power, voltage, or current.',
    detail:
      'A decibel (dB) is one tenth of a bel and represents a ratio, not an absolute value. For powers, dB = 10 · log₁₀(P₁ / P₂); for voltages or currents, dB = 20 · log₁₀(V₁ / V₂). The factor of 2 difference is because power scales with the square of voltage. Two landmark values cover most situations: +3 dB ≈ doubling power, +10 dB = tenfold increase. Adding decibels is the same as multiplying ratios — that is why every gain and loss in a radio chain can be tallied with simple addition.',
    formula: 'dB = 10·log₁₀(P₁/P₂)  •  dB = 20·log₁₀(V₁/V₂)',
    see: ['dbm', 'logarithm'],
  },
  dbm: {
    tip: 'Power expressed in dB referenced to one milliwatt — the standard absolute power unit in radio.',
    detail:
      'dBm is decibels relative to 1 mW: dBm = 10 · log₁₀(P / 1 mW). Unlike plain dB (a pure ratio), dBm is an absolute power level. Key landmarks: 0 dBm = 1 mW, +30 dBm = 1 W, +60 dBm = 1 kW; on the receive side, −60 dBm = 1 µW and roughly −120 dBm is the noise floor of a sensitive HF receiver. Because dBm uses logs, a chain of gains and losses through cables, amplifiers, and antennas can be added together as +/− dB values instead of multiplied.',
    unit: 'dBm',
    formula: 'P(dBm) = 10·log₁₀(P / 1 mW)',
    see: ['decibel', 'logarithm'],
  },
  dbd: {
    tip: 'Antenna gain measured against a half-wave dipole as the reference.',
    detail:
      'dBd expresses an antenna\'s gain relative to a half-wave dipole — the simplest practical antenna. A dipole itself is 0 dBd. A 3-element Yagi might be 5 dBd, meaning it concentrates roughly three times more power in its preferred direction than a dipole would. dBd is the more honest quote for amateur antennas because it compares to something real and easy to build.',
    unit: 'dBd',
    see: ['dbi', 'antenna'],
  },
  dbi: {
    tip: 'Antenna gain measured against an isotropic radiator as the reference.',
    detail:
      'dBi is gain compared to an isotropic radiator — an imaginary point source that radiates equally in every direction. Because a real dipole already has about 2.15 dB of gain over isotropic, dBi numbers are always 2.15 dB larger than dBd numbers for the same antenna (dBi ≈ dBd + 2.15). Manufacturers prefer dBi because the larger number sells better; the underlying antenna is the same.',
    unit: 'dBi',
    formula: 'dBi ≈ dBd + 2.15',
    see: ['dbd', 'antenna'],
  },
  logarithm: {
    tip: 'The exponent you would have to raise 10 to in order to get a given number.',
    detail:
      'A logarithm answers the question: "what power do I need to raise the base to in order to get this number?" The base most often used in engineering is 10, written log₁₀. Three values worth memorising: log₁₀(1) = 0, log₁₀(10) = 1, log₁₀(1000) = 3. The killer feature of logs is that they turn multiplication into addition: log(a × b) = log(a) + log(b). That is exactly why decibels are useful — multiplying gain stages becomes adding decibel values.',
    formula: 'log₁₀(10ⁿ) = n  •  log(a×b) = log(a) + log(b)',
    see: ['decibel', 'scientific notation'],
  },
  decade: {
    tip: 'A factor-of-10 step in frequency — the natural unit on a logarithmic axis.',
    detail:
      'A decade is a 10:1 frequency ratio. On a log-scale plot the screen distance from 100 Hz to 1 kHz is the same as from 1 kHz to 10 kHz — both are one decade. Filter rolloff is commonly quoted "per decade" for the same reason: a textbook RC low-pass filter loses 20 dB of gain for every decade above its cutoff frequency, no matter where on the spectrum you measure it.',
    see: ['logarithm', 'frequency'],
  },

  // ── Antennas, radio practice (Chapter 0.4 vocabulary) ────────────
  isotropic: {
    tip: 'An imaginary antenna that radiates equally in every direction — used as the zero-gain reference for dBi.',
    detail:
      'An isotropic radiator is a theoretical point source that broadcasts the same power in every direction in 3D space (a perfect sphere of radiation). No real antenna can do this — even a simple dipole concentrates its energy into a doughnut shape. The isotropic radiator exists only on paper, as the convenient zero-gain reference for dBi: a real antenna\'s dBi figure tells you how many decibels stronger it is in its best direction than this imaginary point would be.',
    see: ['dbi', 'antenna', 'dipole'],
  },
  dipole: {
    tip: 'The simplest practical antenna — a straight wire cut to about half a wavelength and fed in the middle.',
    detail:
      'A dipole is two pieces of conductor, each a quarter-wavelength long, fed by a feedline at the join in the middle. For the 20-metre amateur band (14 MHz) that\'s about 5 m of total wire. Despite being trivially simple, it works well: about 2.15 dBi of gain broadside to the wire, and it resonates naturally at the design frequency. The dipole is the reference antenna behind dBd, and the starting point for almost every other amateur antenna (Yagis, log-periodics, end-feds — all are elaborations of it).',
    see: ['dbd', 'antenna', 'yagi'],
  },
  'ham radio': {
    tip: 'A ham is a licensed amateur radio operator — someone with a government licence to transmit on amateur radio bands as a hobby.',
    detail:
      'A "ham" is a licensed amateur radio operator. To become one you pass a written exam (covering basic electronics, regulations, and operating practice) and receive a unique callsign from your national authority — FCC in the US, Ofcom in the UK, UCRF (Ukrainian State Centre of Radio Frequencies) in Ukraine. Once licensed, you can transmit on the amateur radio bands: talking to other hams locally, around the world, bouncing signals off the moon, even contacting astronauts on the ISS. The hobby covers everything from casual chats on a handheld to homebuilt antennas, software-defined radios, satellite work, and emergency communications when normal networks fail. The word "ham" started as a 1900s nickname (originally a put-down for sloppy telegraph operators) and is now worn proudly.',
    see: ['arrl', 'cept'],
  },
  transceiver: {
    tip: 'A radio that combines transmitter and receiver in one box, sharing one antenna and frequency control.',
    detail:
      'Most modern amateur radios are transceivers — single units that can both send and receive, rather than separate boxes. The internals share one frequency knob, one antenna jack, and switch between transmit and receive modes when you press PTT (push-to-talk). The word itself is a portmanteau of TRANSmitter + reCEIVER. A typical HF transceiver outputs 100 W (+50 dBm); a handheld VHF/UHF transceiver typically outputs 5 W (+37 dBm).',
    see: ['hf', 'vhf', 'dbm'],
  },
  qrp: {
    tip: 'Low-power operating, usually 5 W or less — a self-imposed challenge that rewards good antennas and clever operating.',
    detail:
      'QRP is the practice of transmitting with very low power — by convention 5 W or less on CW (Morse) and 10 W on SSB voice. It\'s a self-imposed challenge: getting a contact across thousands of kilometres with the same power as a small bicycle lamp takes good antennas, good propagation, and skilled operating. "QRP" is one of the old Q-codes from the telegraphy era; the original meaning was the question "shall I reduce my transmitter power?", but today it\'s a noun describing the activity itself ("I\'m running QRP tonight").',
    see: ['transceiver', 'dbm'],
  },
  vhf: {
    tip: 'Very High Frequency — the 30–300 MHz range, home of the 2-metre amateur band, FM broadcast, and most handheld radios.',
    detail:
      'VHF (Very High Frequency) covers 30–300 MHz. In amateur radio the headline VHF band is 2 metres (144–148 MHz in most countries), where handheld and mobile FM rigs operate through local repeaters. VHF signals travel mostly line-of-sight — they don\'t bounce off the ionosphere the way HF does — so typical range is 30–60 km on flat terrain, much further from a hilltop or with a directional antenna. Commercial FM broadcast radio (88–108 MHz) and old analogue TV channels also live in VHF.',
    see: ['hf', 'fm', 'uhf'],
  },
  uhf: {
    tip: 'Ultra-High Frequency — the 300–3000 MHz range, home of the 70 cm amateur band, mobile phones, Wi-Fi (2.4 GHz), and microwave ovens.',
    detail:
      'UHF (Ultra-High Frequency) covers 300–3000 MHz — wavelengths from one metre down to ten centimetres, which is where the spectrum starts to get crowded with everything modern: GSM/LTE mobile, Wi-Fi 2.4 GHz, Bluetooth, GPS, microwave ovens, and the amateur 70 cm band (430–440 MHz in most countries). Like VHF, UHF propagation is essentially line-of-sight; unlike VHF, the wavelengths are short enough that you can build a useful Yagi or dish in a backpack-sized package, and the antennas on a UHF handheld radio are stubby rather than the foot-long whips you see on 2 m gear. UHF also penetrates buildings less well than VHF, which is why VHF FM radios still rule for portable line-of-sight work.',
    see: ['vhf', 'hf', 'antenna'],
  },
  yagi: {
    tip: 'Directional antenna with one driven element and several parasitic rods — focuses radiated power in one direction.',
    detail:
      'A Yagi-Uda antenna (usually just "Yagi") has a single driven dipole element, a slightly longer "reflector" element behind it, and one or more shorter "director" elements in front. The reflector and directors aren\'t electrically connected — they shape the radiation pattern by parasitic coupling. The result is a beam: 5–15 dBi of gain concentrated forward, with much weaker reception from the sides and rear. Rooftop TV antennas are usually Yagis, as are most serious amateur antennas for VHF/UHF and HF DX work.',
    see: ['antenna', 'dipole', 'dbi', 'dbd'],
  },
  coax: {
    tip: 'Coaxial cable — central conductor inside a tubular shield, used to feed RF between radios and antennas.',
    detail:
      'Coaxial cable (coax) carries RF signals between a radio and its antenna with controlled impedance — 50 Ω is the amateur-radio standard, 75 Ω is used for TV and video. The two conductors are concentric: a centre wire surrounded by a foil or braid shield, separated by an insulator. The geometry keeps the signal contained inside the cable and rejects external interference. Coax has loss that grows with frequency: thin RG-58 might drop 5 dB per 30 m at 144 MHz; thicker LMR-400 cuts that to about 1.5 dB. Cable loss is something you\'ll routinely express in dB.',
    see: ['antenna', 'impedance', 'decibel'],
  },
  qso: {
    tip: 'A two-way radio contact between two amateur stations — the basic unit of activity on the bands.',
    detail:
      'QSO is one of the old Q-codes from the telegraphy era; the literal meaning was the question "can you communicate with X?", but today it is used as a noun for the contact itself ("I had a nice QSO with a station in Japan last night"). A typical QSO exchanges callsigns, signal reports, location, name, and equipment, then closes with 73 (best regards). QSOs can last seconds (a quick contest exchange) or hours (a relaxed ragchew). Hams log every QSO they make — date, time, frequency, mode, signal report — both for personal records and for awards that require proof of contact with specific places.',
    see: ['ham radio', 'transceiver'],
  },
  topology: {
    tip: 'The pattern of connections in a circuit — what is joined to what — independent of how the drawing is laid out on the page.',
    detail:
      'A schematic encodes topology, not geometry. Two drawings that look completely different on paper can describe the same circuit if every component is connected to the same neighbours in both. A neat rectangle and a tangled zig-zag with identical connections are the same circuit. In design practice "topology" also names specific connection patterns — voltage divider, bridge rectifier, common-emitter amplifier — each with a characteristic electrical behaviour that holds no matter how it is drawn.',
  },

  // ── Ch 1.1 terms ─────────────────────────────────────────────────
  charge: {
    tip: 'A property of matter: positive, negative, or neutral. Unlike charges attract, like charges repel.',
    detail:
      'Electric charge is a fundamental property of matter, carried by protons (positive) and electrons (negative); neutrons have none. An atom with equal numbers of protons and electrons is electrically neutral. Imbalance one way or the other and you have an ion with a net charge. Charge is measured in coulombs. A single electron carries about −1.602 × 10⁻¹⁹ C, so one coulomb is an enormous pile of them (~6.25 × 10¹⁸). In circuits we rarely count individual electrons; we count the rate at which charge flows past a point, which is called current.',
    unit: 'Coulomb (C)',
    see: ['coulomb', 'current', 'voltage'],
  },
  coulomb: {
    tip: 'The SI unit of electric charge — about 6.25 × 10¹⁸ electrons.',
    detail:
      'One coulomb (C) is the quantity of charge carried by approximately 6.25 × 10¹⁸ electrons, or equivalently, the charge delivered in one second by a current of one ampere (1 C = 1 A·s). Named after French physicist Charles-Augustin de Coulomb (1736–1806). The coulomb is a large unit in everyday electronics — a typical AA battery can deliver about 10 000 C of charge over its lifetime, but instantaneous currents of interest involve fractions of a coulomb per second.',
    unit: 'Coulomb (C)',
    see: ['charge', 'current', 'ampere'],
  },
  ampere: {
    tip: 'The SI unit of current — one coulomb of charge flowing past a point per second.',
    detail:
      'One ampere (A) is a flow rate of one coulomb per second (1 A = 1 C/s). Typical magnitudes: an LED runs on about 10 mA; an Arduino output pin can source or sink up to about 20 mA; a phone charger delivers 1–3 A; a household lighting circuit is protected at around 15 A; a lightning bolt peaks in the tens of thousands of amperes. The ampere is named after André-Marie Ampère (1775–1836), who worked out the mathematical laws relating currents to the magnetic fields they produce.',
    unit: 'Ampere (A)',
    formula: '1 A = 1 C/s',
    see: ['current', 'coulomb'],
  },
  ohm: {
    tip: 'The SI unit of resistance — one volt across the component produces one ampere of current.',
    detail:
      'One ohm (Ω) is the resistance that permits one ampere of current when one volt is applied across it (1 Ω = 1 V/A). Copper wire has a few milliohms per metre; a typical current-limiting resistor in a hobby circuit is in the range 100 Ω to 10 kΩ; dry human skin can measure 100 kΩ or more. The ohm is named after Georg Simon Ohm (1787–1854), who discovered that current is proportional to voltage in most materials — a relationship now known as Ohm\'s Law.',
    unit: 'Ohm (Ω)',
    formula: '1 Ω = 1 V/A',
    see: ['resistance', 'voltage', 'current'],
  },
  conductor: {
    tip: 'A material in which charges move easily — metals, especially copper and silver.',
    detail:
      'Conductors have loosely-bound outer electrons that can drift through the material when a voltage is applied, carrying current. The best conductors at room temperature are silver, copper, and gold; copper wins in practice because it is cheap, abundant, and almost as good as silver. Aluminium is lighter and cheaper still but about 60 % more resistive than copper for the same cross-section. Conductors are not perfect — every real wire has some resistance, which shows up as heat when current flows.',
    see: ['insulator', 'semiconductor', 'resistance'],
  },
  insulator: {
    tip: 'A material that blocks current flow — rubber, glass, plastic, dry air.',
    detail:
      'Insulators have electrons tightly bound to individual atoms, so charges cannot drift freely when a voltage is applied. Typical resistivity is ten to twenty orders of magnitude higher than copper. In practice no insulator is perfect — given a high enough voltage, any material will eventually break down and conduct (lightning through air, a spark across a spark plug). The voltage at which breakdown occurs is called the dielectric strength. Common insulators: PVC and rubber on wires, ceramic on antenna stand-offs, glass on high-voltage feedthroughs, air between capacitor plates.',
    see: ['conductor', 'semiconductor'],
  },
  semiconductor: {
    tip: 'A material with conductivity between a conductor and an insulator — most often silicon.',
    detail:
      'Semiconductors are materials like silicon and germanium whose conductivity is much lower than a metal but much higher than an insulator, and — crucially — can be controlled by chemical doping, electric fields, light, heat, or other stimuli. Their behaviour is what makes diodes, transistors, LEDs, photodiodes, and integrated circuits possible. Almost every modern electronic device is built from doped-silicon junctions. A full treatment of semiconductor physics is the subject of Chapter 1.10.',
    see: ['conductor', 'insulator', 'diode'],
  },
  'drift velocity': {
    tip: 'The average speed at which charge carriers crawl through a conductor when a voltage is applied — typically under 1 mm/s.',
    detail:
      'When a voltage is applied to a wire, the free electrons inside do not zip along like water through a pipe. They collide constantly with the atoms of the metal, and the net effect of the applied field is only to nudge their random thermal motion slightly in one direction. The average forward speed — the drift velocity — is surprisingly slow: a fraction of a millimetre per second at everyday currents. The reason a light switch works instantly is that the electric field propagates through the wire near the speed of light, pushing every electron in the wire simultaneously; the same electron does not need to travel from switch to lamp. What you feel as "fast" is the field, not the carriers.',
    see: ['current', 'conductor'],
  },
  'conventional current': {
    tip: 'The universal convention that current flows from + to −, even though electrons actually flow the other way.',
    detail:
      'Benjamin Franklin guessed the direction of current flow in the 18th century, before anyone knew that electrons existed. He picked + to − — the wrong way around, it turned out, since electrons are negative and actually move from − to +. But his convention was already embedded in every schematic, equation, and arrow symbol in the field by the time electrons were discovered in 1897, and changing it would have broken every document in existence. So we keep Franklin\'s convention: arrows in schematics, the direction of current in every formula, and the transistor-emitter arrow all point the way positive charge would move. Electrons actually flow the opposite direction, but for circuit analysis the difference is cosmetic — the math works out the same either way.',
    see: ['current'],
  },
  emf: {
    tip: 'Electromotive force — an older name for voltage, still used in some contexts (especially for sources).',
    detail:
      'EMF (electromotive force) is the energy per unit charge that a source provides to push charges around a circuit. Historically the distinction between EMF and voltage was important: EMF described the source, voltage described the difference between any two points. In modern practice the terms are used interchangeably for most purposes, and the unit is the same (the volt). You will see EMF more often in physics textbooks and older engineering literature; schematics and datasheets almost always just say "voltage".',
    unit: 'Volt (V)',
    see: ['voltage'],
  },

  // ── Chapter 1.8 — Filters ────────────────────────────────────────
  'low-pass': {
    tip: 'A filter that lets low frequencies through and attenuates high ones — passes DC, blocks AC above its cutoff.',
    detail:
      'A low-pass filter passes signals at frequencies below its cutoff frequency f_c with little loss, and attenuates signals above f_c at a rate set by the filter\'s order (−20 dB per decade per pole). The simplest is a series resistor and a shunt capacitor to ground. R and C act as a voltage divider: at low frequency the capacitor\'s reactance is much larger than R, so almost all of V_in drops across the capacitor — and the output, taken across the capacitor, is practically equal to V_in. At high frequency the reactance shrinks to a near-short to ground, the voltage drops across R instead, and the output collapses. Low-pass filters appear everywhere — at every transmitter\'s output (the harmonic LPF that keeps harmonics off the air), in every audio crossover (feeding the woofer), and ahead of every analogue-to-digital converter (the anti-alias filter).',
    formula: 'f_c = 1 / (2π·R·C)   (first-order RC)',
    see: ['filter', 'high-pass', 'cutoff frequency', 'roll-off'],
  },
  'high-pass': {
    tip: 'A filter that lets high frequencies through and attenuates low ones — blocks DC, passes AC above its cutoff.',
    detail:
      'A high-pass filter is the dual of the low-pass: it passes signals above its cutoff frequency f_c and attenuates signals below f_c. The first-order topology is a series capacitor and shunt resistor — opposite arrangement to the low-pass, but exactly the same parts. At DC the capacitor blocks everything; well above f_c the capacitor looks like a short and the signal passes through. The same circuit is called a "coupling capacitor" when its job is to block DC supply voltage from a downstream stage while letting the audio or RF signal through unaffected.',
    formula: 'f_c = 1 / (2π·R·C)   (first-order RC)',
    see: ['filter', 'low-pass', 'cutoff frequency', 'coupling capacitor'],
  },
  'band-pass': {
    tip: 'A filter that lets one band of frequencies through and attenuates everything outside it.',
    detail:
      'A band-pass filter has two cutoffs — a lower one and an upper one — and passes signals between them while attenuating signals on either side. The simplest LC band-pass is a series-LC pair: at the resonant frequency f_0 = 1 / (2π√(LC)) the series LC looks like a near-short, so the signal at f_0 passes; off-resonance the impedance climbs and signals are blocked. Band-pass filters are the core of every receiver\'s IF strip — the IF filter sets the receiver\'s selectivity, with bandwidth matched to the mode (≈ 2.4 kHz for SSB, ≈ 500 Hz for CW). The bandwidth is set by the loaded Q: BW = f_0 / Q.',
    formula: 'BW = f_0 / Q',
    see: ['filter', 'band-stop', 'resonance', 'q-factor', 'bandwidth'],
  },
  'band-stop': {
    tip: 'A filter that blocks one band of frequencies and lets everything else through — also called a notch.',
    detail:
      'A band-stop filter (also called a notch) is the dual of the band-pass: it attenuates signals inside one frequency band and passes everything outside. A typical LC implementation is a series-LC pair wired from the signal line to ground — at f_0 the series pair has near-zero impedance, so it drains f_0 straight to ground and the output collapses into a deep notch; off-resonance the pair is high-impedance, draws almost no current, and everything else passes through untouched. (The mirror topology wires a parallel-LC tank in series with the line, where its near-infinite impedance at f_0 blocks that frequency instead.) Notch filters are used to remove specific unwanted carriers — broadcast-band rejection at the front of an HF receiver, mains-hum traps in audio, and the RF-trap that keeps a strong nearby station from desensing your receiver.',
    see: ['filter', 'band-pass', 'notch', 'resonance'],
  },
  notch: {
    tip: 'Another name for a band-stop filter; in English usage often specifically the narrow-stopband variant designed to remove one frequency.',
    detail:
      'A notch filter is essentially a band-stop filter — same circuit class, same behaviour. In English engineering literature the two terms diverge slightly: "band-stop" is the general class, while "notch" often refers specifically to a band-stop with a very narrow stopband, designed to remove one specific frequency or a narrow range without affecting the rest of the spectrum. Hams use notch filters to suppress an unwanted local carrier (a broadcast station, a noise source, or a strong adjacent ham), to remove mains hum from audio, or as a "trap" tuned to a specific harmonic. The depth and width of the rejection are set by the Q of the resonant element: a low-Q notch is broad and shallow, a high-Q notch is narrow and deep.',
    see: ['band-stop', 'filter', 'trap'],
  },
  'cutoff frequency': {
    tip: 'The frequency at which a filter\'s output has dropped to −3 dB — half the input power, 0.707 of the input voltage.',
    detail:
      'The cutoff frequency f_c is the canonical descriptor of any filter: the frequency at which the response has dropped to −3 dB (half the input power, equivalent to 1 / √2 ≈ 0.707 of the input voltage). For a first-order RC filter, f_c = 1 / (2π·R·C); for an LC band-pass it is the resonant frequency f_0 = 1 / (2π√(LC)). The cutoff is also the hinge of the Bode plot — far above (or below, depending on filter type) f_c the magnitude follows a straight-line roll-off; far on the passband side it stays flat; the corner is centred on f_c.',
    formula: 'f_c = 1 / (2π·R·C)   (first-order RC)',
    see: ['filter', 'roll-off', 'bode plot', 'reactance'],
  },
  passband: {
    tip: 'The range of frequencies a filter lets through with little or no attenuation.',
    detail:
      'The passband of a filter is the range of frequencies where the output is approximately equal to the input. Conventionally the edge of the passband is taken as the −3 dB point — the cutoff frequency. A low-pass filter\'s passband runs from DC up to f_c; a high-pass\'s passband runs from f_c upward; a band-pass\'s passband is the slice between its two cutoffs. The flatness of the passband is a quality metric: Butterworth filters give a maximally-flat passband, while Chebyshev Type I trades flatness for a steeper transition and shows visible ripple in the passband.',
    see: ['filter', 'cutoff frequency', 'stopband'],
  },
  stopband: {
    tip: 'The range of frequencies a filter heavily attenuates.',
    detail:
      'The stopband of a filter is the frequency range where the output is heavily attenuated — typically 40–80 dB or more below the input. The stopband is set by the filter\'s order (slope) and family (corner shape and any ripple). A first-order filter does not really have a sharp stopband edge — it just slopes down forever at −20 dB/decade. Higher-order filters reach a defined stopband floor more quickly. Filter datasheets specify the stopband by giving a frequency at which the attenuation reaches some required value (e.g. "60 dB rejection at 2× cutoff").',
    see: ['filter', 'cutoff frequency', 'passband'],
  },
  order: {
    tip: 'How many independent storage elements a filter has — sets the steepness of its roll-off.',
    detail:
      'The order of a filter counts the number of independent reactive elements (capacitors and inductors) that contribute to its frequency response. A single RC pair is first-order; a single LC pair is second-order; cascaded sections add up. The roll-off in the stopband is −20 dB per decade per pole, so a 1st-order is −20 dB/decade, a 2nd-order is −40 dB/decade, a 5th-order is −100 dB/decade. Higher orders give sharper transitions at the cost of more parts, more passband loss, and worse transient response (ringing on a fast edge).',
    see: ['filter', 'roll-off', 'bode plot'],
  },
  'roll-off': {
    tip: 'How steeply a filter\'s response falls in the stopband — measured in dB per decade or dB per octave.',
    detail:
      'Roll-off is the slope of the filter\'s magnitude response far from the cutoff, in dB per decade (a ×10 step in frequency) or dB per octave (a ×2 step). The fundamental rule is −20 dB per decade per pole: every additional reactive element doubles the slope. A 1st-order RC rolls off at −20 dB/decade (or equivalently −6 dB/octave); a 5-pole LC harmonic LPF rolls off at −100 dB/decade. On a Bode plot (log-log axes), the roll-off appears as a straight line — which is the main reason filter designers use log-log axes.',
    see: ['filter', 'order', 'bode plot', 'decade', 'decibel'],
  },
  'bode plot': {
    tip: 'A plot of filter (or amplifier) gain versus frequency, on logarithmic axes — the standard way to show frequency response.',
    detail:
      'A Bode plot, named after Hendrik Bode (Bell Labs, 1945), shows the magnitude (in decibels) of a circuit\'s transfer function versus frequency on a logarithmic horizontal axis. Two facts dominate filter Bode plots: at the cutoff frequency the response is −3 dB, and far from cutoff the response is a straight line with slope −20 dB per decade per pole. The straight-line behaviour is the whole reason for log-log axes — on linear axes, filter responses spend most of their range hugging zero or hugging unity, and the corner is hard to read. The phase plot is sometimes drawn alongside the magnitude (a separate set of axes); each pole adds 90° of phase lag.',
    see: ['filter', 'roll-off', 'decibel', 'decade'],
  },
  butterworth: {
    tip: 'The default filter family — gives a maximally-flat passband at the cost of a moderately steep transition.',
    detail:
      'A Butterworth filter, named after Stephen Butterworth (1930), optimises for the flattest possible passband — the magnitude response in the passband is monotonic with no ripple. The transition into the stopband is moderate (steeper than Bessel, gentler than Chebyshev or elliptic), and the transient response is well-behaved. Butterworth is the default filter family — almost every textbook filter response you have seen is one. Use Butterworth unless you have a strong reason to pick something else (Chebyshev for selectivity, Bessel for fast transients, elliptic for the steepest possible).',
    see: ['filter', 'family', 'chebyshev', 'bessel', 'elliptic'],
  },
  chebyshev: {
    tip: 'A filter family that trades passband flatness for a steeper transition — comes in Type I (passband ripple) and Type II (stopband ripple).',
    detail:
      'A Chebyshev filter, named after Pafnuty Chebyshev (1854), accepts a chosen amount of ripple — Type I in the passband, Type II in the stopband — and uses that freedom to sharpen the transition between passband and stopband. At the same order, a Chebyshev gives a noticeably steeper skirt than a Butterworth. Use Chebyshev when selectivity matters more than flatness — IF filters in receivers, narrow LPFs after a transmitter PA, and audio crossovers in PA systems. The ripple amplitude is a design parameter; 0.1 dB and 0.5 dB are common choices.',
    see: ['filter', 'family', 'butterworth', 'elliptic'],
  },
  bessel: {
    tip: 'A filter family that optimises for flat group delay — best transient response (least ringing) of any family.',
    detail:
      'A Bessel filter, named after the Bessel functions used in its design, is optimised for maximally flat group delay across the passband — meaning all frequencies pass through with the same time delay, so a fast edge is not smeared by the filter. The cost is the gentlest transition of any common family — at the same order a Bessel\'s skirt is much shallower than a Butterworth. Use Bessel anywhere the time-domain shape of the signal matters: digital-mode anti-alias filters, oscilloscope-front-end filters, audio applications where phase distortion would smear transients.',
    see: ['filter', 'family', 'butterworth'],
  },
  elliptic: {
    tip: 'The steepest filter family — allows ripple in both passband and stopband, gets the sharpest possible transition in return.',
    detail:
      'An elliptic filter (also called a Cauer filter, after Wilhelm Cauer who derived its design equations) is the steepest filter family possible at a given order. It allows ripple in both the passband and the stopband and uses that freedom to push the transition between them as steep as theory permits — a 2nd-order elliptic skirt can be sharper than a 4th-order Butterworth. Used wherever nothing gentler is steep enough: narrow IF crystal filters, low-order harmonic-suppression LPFs, anti-alias filters ahead of band-edge ADCs. The price is more ringing on transients than any other family — you cannot have steep skirts and a clean step response at the same time.',
    see: ['filter', 'family', 'butterworth', 'chebyshev'],
  },
  family: {
    tip: 'The mathematical recipe that picks the shape of a filter\'s response corner — Butterworth, Chebyshev, Bessel, or elliptic.',
    detail:
      'A filter\'s family is the mathematical pattern used to choose the values of its inductors, capacitors, and resistors. At a given order and cutoff, infinitely many parameter sets give the same nominal cutoff — the family picks one based on what to optimise: passband flatness (Butterworth), transition steepness (Chebyshev, elliptic), or transient response (Bessel). The four common families are Butterworth, Chebyshev, Bessel, and elliptic, listed roughly in increasing order of skirt steepness and decreasing order of transient quality.',
    see: ['filter', 'butterworth', 'chebyshev', 'bessel', 'elliptic'],
  },
  'if filter': {
    tip: 'The narrow filter at a receiver\'s intermediate-frequency stage — sets the receiver\'s selectivity and matches its bandwidth to the mode.',
    detail:
      'In a superheterodyne receiver, the mixer translates the antenna signal down to a fixed intermediate frequency (IF), and the IF filter sitting between the mixer and the demodulator selects only the bandwidth of the wanted signal — rejecting strong adjacent stations. Modern transceivers carry several IF filters selectable from the front panel: ≈ 2.4 kHz for SSB, ≈ 500 Hz for CW, ≈ 250 Hz for narrow data modes, ≈ 6 kHz for AM. The IF filter is the receiver\'s most important selectivity component — its skirts determine how close in frequency a strong unwanted station can sit without bleeding into the wanted one. IF filters are typically built from quartz crystals or mechanical resonators for very high Q.',
    see: ['filter', 'band-pass', 'q-factor'],
  },
  adc: {
    tip: 'Analogue-to-Digital Converter — turns a continuous voltage into a stream of numbers a computer can process.',
    detail:
      'An ADC samples an analogue voltage at a fixed rate (the sample rate, e.g. 100 kSPS = 100 000 samples per second) and turns each sample into a binary number with some resolution (e.g. 12-bit = 4096 levels). The Nyquist rule says an ADC at sample rate f_s can represent frequencies up to f_s / 2; signals above that fold back into the baseband as aliases that cannot be undone. For this reason every ADC needs an analogue anti-alias filter (a low-pass with cutoff just below f_s / 2) ahead of it. Modern SDR receivers digitise the entire HF spectrum at once with a fast ADC and use digital filters from there.',
    see: ['filter', 'low-pass', 'sdr'],
  },
  'power amplifier': {
    tip: 'The final amplifier stage in a transmitter that boosts the signal to the watts radiated by the antenna.',
    detail:
      'A power amplifier (PA) is the high-power final stage of a transmitter, taking a low-power modulated signal and amplifying it to the level radiated by the antenna — typically tens to hundreds of watts in amateur service. Class-AB and class-C PAs are non-linear and generate strong harmonics of the carrier (2nd, 3rd, 5th…); a harmonic low-pass filter immediately after the PA suppresses them by 50 dB or more before they reach the antenna. Without that filter your 14 MHz transmission would also radiate on 28 MHz, 42 MHz, 70 MHz, and so on — straight into other amateur and broadcast bands.',
    see: ['filter', 'low-pass', 'harmonic'],
  },
  'amplifier stage': {
    tip: 'One self-contained block in a multi-stage amplifier — typically one transistor (or tube, or op-amp) plus its bias, gain-setting, and coupling components.',
    detail:
      'Real amplifiers almost always run as a chain of «stages»: a low-noise input stage extracts a tiny signal from the antenna, one or two intermediate stages add gain, and a final power stage drives the load. Each stage solves one problem — input impedance, gain, output impedance, linearity — and the chain composes them. The stages are decoupled from one another by coupling capacitors (which pass the AC signal but block each stage\'s DC bias point) and by separate bias networks; that decoupling is what lets you design and tune one stage at a time without the others drifting. The Ukrainian term «каскад» is used the same way and dates back to the tube era; «ступінь» is a more modern synonym preferred in beginner texts.',
    see: ['power amplifier', 'coupling capacitor', 'bypass capacitor'],
  },

  // ── Transistors ───────────────────────────────────────────────────
  transistor: {
    tip: 'A three-terminal semiconductor device whose conduction between two terminals is controlled by a signal applied to the third — the building block of every active circuit.',
    detail:
      'A transistor is a three-terminal device in which a small signal at the control terminal sets a much larger current flowing between the other two. That property — power amplification — is what distinguishes it from passives like resistors, capacitors, and inductors. Two big families exist: bipolar junction transistors (BJTs), where a small base current controls a much larger collector current, and field-effect transistors (FETs), where a gate voltage controls drain current with no DC gate current at all. Both come in two polarities (NPN/PNP for BJTs, n-channel/p-channel for FETs) and both do the same two jobs — switch (fully on or fully off, the basis of digital logic) and amplify (somewhere in between, the basis of every analog signal path). Every modern integrated circuit, microcontroller, and radio is built from billions of transistors fabricated together on one piece of silicon.',
    see: ['bjt', 'fet', 'mosfet', 'amplifier stage'],
  },
  bjt: {
    tip: 'Bipolar Junction Transistor — three-terminal current-controlled device where a small base current controls a much larger collector current.',
    detail:
      'A BJT (Bipolar Junction Transistor) is a sandwich of three doped silicon layers — NPN or PNP — with three terminals: base, collector, emitter. Conduction relies on both kinds of charge carrier (electrons AND holes), which is what «bipolar» means. The base-emitter junction acts as a forward-biased diode (~0.7 V drop when on); a small base current I_B causes a much larger collector current I_C, related by I_C = β · I_B, where β (also called h_FE) is the current gain — typically 50–500. β is the BJT\'s most useful and least reliable parameter: it varies factor-of-three across specimens and 30–50 % across temperature, which is why every well-designed BJT circuit makes its operating point depend on resistor ratios rather than on β. Common small-signal NPN parts: 2N3904, BC547, 2N2222.',
    formula: 'I_C = β · I_B',
    see: ['transistor', 'fet', 'common emitter', 'beta'],
  },
  fet: {
    tip: 'Field-Effect Transistor — three-terminal voltage-controlled device where a gate voltage controls drain current, with no DC gate current.',
    detail:
      'A FET (Field-Effect Transistor) controls conduction between drain and source via the electric field produced by a voltage applied to the gate. Two flavours of gate exist — JFETs use a reverse-biased diode junction, MOSFETs use a thin oxide insulator — and two channel-doping modes — depletion (channel conducts at zero gate bias) and enhancement (channel does not conduct until gate is biased past a threshold V_th). The FET\'s defining advantage is its near-infinite DC input impedance: the gate draws no current, so a FET amplifier can be driven from very weak sources without loading them down. The drain current depends on the over-drive (V_GS − V_th); the slope ∂I_D/∂V_GS is the transconductance g_m, which takes the role of «1/R_E» in the FET equivalent of the common-emitter gain formula.',
    see: ['transistor', 'bjt', 'mosfet', 'jfet', 'transconductance'],
  },
  mosfet: {
    tip: 'Metal-Oxide-Semiconductor FET — the dominant FET type today, with a glass-insulated gate and almost zero DC gate current.',
    detail:
      'A MOSFET is the FET variant whose gate is separated from the channel by a thin layer of silicon dioxide (glass) — typically only a few nm thick. That insulator means the DC gate current is essentially zero (10⁻¹⁴ A range), giving the MOSFET its near-infinite input impedance. MOSFETs come in n-channel and p-channel polarities and almost always operate in enhancement mode (channel does not conduct until V_GS exceeds threshold V_th). For switching, the on-state behaviour is dominated by R_DS(on) — the on-resistance of the channel, which can be a few milliohms in modern power MOSFETs. That low R_DS(on) is why MOSFETs replaced BJTs in every modern motor driver, switching power supply, and battery management chip: a 5 A load through 5 mΩ wastes 125 mW, where a BJT at the same current burns 1 W. «Logic-level» MOSFETs are designed to turn fully on at 3 V or 2.5 V V_GS so they can be driven directly from microcontroller pins. The thin gate oxide is delicate: an electrostatic discharge from your finger can puncture it permanently, so MOSFETs ship with shorting clips and need ESD precautions during handling. Common parts: 2N7000 (small-signal n-MOS), IRLZ44N (logic-level power n-MOS), IRF540 (standard-level power n-MOS).',
    see: ['fet', 'transistor', 'enhancement mode'],
  },
  jfet: {
    tip: 'Junction FET — a FET whose gate is a reverse-biased diode junction with the channel; depletion-mode only and uncommon outside low-noise audio and RF front ends.',
    detail:
      'A JFET (Junction Field-Effect Transistor) controls channel conduction via the depletion region of a reverse-biased p-n junction between gate and channel. The junction must stay reverse-biased — forward-biasing it would draw current and destroy the JFET\'s «no gate current» property — so JFETs only operate in depletion mode (channel conducts at V_GS = 0; cutoff requires V_GS biased away from the channel polarity). Compared to MOSFETs, JFETs have lower 1/f (flicker) noise and better RF noise performance, which is why they survive in low-noise preamplifier designs (e.g. the BF862 in HF receiver front ends and the 2SK170 in audio phono stages). For general digital and switching work, MOSFETs have eclipsed JFETs.',
    see: ['fet', 'transistor'],
  },
  npn: {
    tip: 'BJT polarity where the emitter arrow points outward — operates with collector positive relative to emitter; built from N-type / P-type / N-type silicon layers.',
    detail:
      'NPN is the more common BJT polarity in beginner circuits and modern silicon. The acronym describes the physical structure: an N-doped collector layer, a P-doped base layer in the middle, and an N-doped emitter layer. Conventional current flows from collector to emitter when the transistor is on; the base-emitter junction must be forward-biased (~0.7 V, base positive relative to emitter) for any current to flow. The schematic symbol shows an outward-pointing arrow on the emitter — current flows out of the emitter. Common parts: 2N3904, BC547, 2N2222.',
    see: ['bjt', 'pnp'],
  },
  pnp: {
    tip: 'BJT polarity opposite to NPN — emitter arrow points inward, operates with emitter positive relative to collector. Used for «high-side» switching.',
    detail:
      'PNP is the polarity-mirror of NPN: a P-doped collector, N-doped base, P-doped emitter. Voltages and currents reverse — the emitter is the most-positive terminal, current flows into the emitter, base must be 0.7 V below emitter to turn the transistor on. Schematic symbol has an inward-pointing arrow on the emitter. PNPs appear most often in «high-side» switches (load returned to ground, switch sits between V+ and load) and in complementary push-pull output stages. Common parts: 2N3906, BC557 (the complements of 2N3904 and BC547).',
    see: ['bjt', 'npn'],
  },
  base: {
    tip: 'The middle (control) terminal of a BJT — a small current here controls the much larger current flowing from collector to emitter.',
    detail:
      'The base is the BJT\'s control terminal — physically the thin P-doped layer (in NPN) sandwiched between the two N-doped collector and emitter. Forward-biasing the base-emitter junction (~0.7 V) injects minority carriers into the base, where they are swept across into the collector. That small base current commands a much larger collector current via the relation I_C = β · I_B; in a working circuit you size the base resistor so the desired I_B flows when the input is HIGH. The base IS NOT a voltage input — it is a current input. Treating it as a voltage source would draw an enormous current as soon as you exceed the V_BE threshold.',
    see: ['bjt', 'collector', 'emitter'],
  },
  collector: {
    tip: 'The high-current «output» terminal of a BJT — collects the carriers that flow through the base region under control of the base current.',
    detail:
      'The collector is the BJT terminal at which the controlled current emerges (NPN) or enters (PNP). It connects to one of the heavily-doped outer regions (N for NPN, P for PNP). In normal active operation, the base-collector junction is reverse-biased — current does not flow because of the diode, but rather because carriers injected into the base are swept across to the collector by the field. The collector typically connects through a load resistor to the supply rail; the voltage at the collector is V_CC − I_C · R_C, which is the amplifier\'s output node.',
    see: ['bjt', 'base', 'emitter'],
  },
  emitter: {
    tip: 'The «source» terminal of a BJT — emits the carriers that flow under control of the base. Marked with an arrow on the schematic symbol indicating polarity.',
    detail:
      'The emitter is the heavily-doped terminal of a BJT that supplies the carriers that the rest of the transistor steers into the collector. In an NPN it is N-doped and supplies electrons; in a PNP it is P-doped and supplies holes. The schematic-symbol arrow on the emitter is the polarity marker — outward for NPN (current flows OUT of the emitter), inward for PNP. In the standard common-emitter circuit the emitter is grounded (or returned to ground via a small R_E) and the input signal is applied to the base; in an emitter follower the emitter is the OUTPUT and the collector is tied to the rail.',
    see: ['bjt', 'base', 'collector'],
  },
  gate: {
    tip: 'The control terminal of a FET — voltage applied here sets drain-source conduction without drawing DC current (the gate is insulated for MOSFETs, reverse-biased for JFETs).',
    detail:
      'The gate is the FET\'s voltage-controlled input. In a MOSFET it is a thin metal/polysilicon layer separated from the channel by a glass insulator; in a JFET it is a reverse-biased p-n junction. Either way, no DC current flows into the gate — the FET responds purely to the gate VOLTAGE. The drain current depends on V_GS − V_th, where V_th is the threshold voltage at which the channel begins to conduct. That voltage-control behaviour gives FETs their near-infinite input impedance, which is essential when driving the input from a high-impedance source (e.g. a piezo pickup, a glass-electrode pH sensor, or the previous stage\'s collector output). The gate-oxide of a MOSFET is fragile: ESD from your finger can punch through it permanently.',
    see: ['fet', 'mosfet', 'drain', 'source', 'transistor'],
  },
  drain: {
    tip: 'The high-current «output» terminal of a FET — the FET equivalent of a BJT\'s collector.',
    detail:
      'The drain is the terminal at which controlled current emerges in an n-channel FET (or enters in a p-channel). The current is set by V_GS over the threshold V_th, and is nearly independent of drain-source voltage V_DS over the active region of the FET\'s output curves. In a common-source amplifier, the drain connects through a load resistor R_D to the supply rail and is the amplifier\'s output node — exactly analogous to the collector in a common-emitter BJT amplifier.',
    see: ['fet', 'mosfet', 'gate', 'source', 'transistor'],
  },
  'fet source': {
    tip: 'The reference / common terminal of a FET — the FET equivalent of a BJT\'s emitter.',
    detail:
      'The source is the FET terminal that supplies the channel carriers (electrons for n-channel, holes for p-channel) and which the gate voltage is measured against (V_GS = V_gate − V_source). In a common-source amplifier the source is grounded (or returned to ground via a small R_S for emitter-degeneration-style bias stability), and the input signal is applied to the gate. In a source follower (the FET equivalent of an emitter follower) the source is the OUTPUT terminal and the drain is tied to the rail.',
    see: ['fet', 'mosfet', 'gate', 'drain'],
  },
  'transistor saturation': {
    tip: 'The «closed switch» mode of a BJT — V_CE has been pulled down to ~0.2 V and the load (not β) sets the collector current.',
    detail:
      'A BJT in saturation has both junctions forward-biased: base-emitter is on (~0.7 V), and the base-collector junction has also gone into forward conduction because V_CE dropped low enough. In this state V_CE is fixed at ~0.1–0.3 V (regardless of current), and the collector current is whatever the external load and supply rail allow — Ohm\'s law on (R_C + load), with V_CE_sat as a small offset. The transistor\'s β no longer matters as long as β · I_B exceeds the load\'s I_C demand by a healthy margin (typically 5–10×). This is the «on» state of a BJT switch. The companion state, with no base current and no collector current, is cutoff. The «in-between» state where V_CE > 0.5 V and I_C ≈ β · I_B is the active region — used for amplification, not switching. (The same English word also names magnetic-core saturation in inductors and transformers — a different physical phenomenon; see the «saturation» entry for the magnetic-core variant.)',
    formula: 'V_CE_sat ≈ 0.2 V; I_C_max = (V_CC − V_CE_sat) / R_load',
    see: ['bjt', 'cutoff', 'active region', 'saturation'],
  },
  cutoff: {
    tip: 'The «open switch» mode of a transistor — base current (BJT) or gate-source voltage (FET) is below threshold, so essentially no current flows from collector/drain to emitter/source.',
    detail:
      'A transistor in cutoff has no carriers flowing through it, except for tiny leakage currents (nanoamps for BJTs, picoamps for FETs). For a BJT, cutoff means base current is zero (or V_BE is below the ~0.6 V turn-on threshold) — the base-emitter diode is not conducting, so no carriers are injected into the base, and the collector current drops to leakage levels. For a FET, cutoff means V_GS is below V_th — the channel does not conduct. This is the «off» state of any transistor switch and the resting state of an amplifier between signal swings.',
    see: ['saturation', 'active region', 'transistor'],
  },
  'active region': {
    tip: 'The flat middle part of a BJT\'s output curves where I_C ≈ β · I_B and barely depends on V_CE — the region used for linear amplification.',
    detail:
      'The active region is the operating regime in which a transistor amplifies linearly. For a BJT: base-emitter junction forward-biased, base-collector junction reverse-biased, V_CE typically above ~0.5 V. In this region the collector behaves like a current source whose value is set by I_B, and the slope of the output curve (∂I_C/∂V_CE) is small — the transistor approximates an ideal current source. The «family» of output curves you see in textbooks is a sequence of these flat regions stacked vertically, one per base current setting. To amplify, you place the Q-point (quiescent operating point) somewhere in the active region and let the AC signal modulate around it; as long as the swing stays inside the active region, the output is a faithful (if larger) replica of the input.',
    see: ['saturation', 'cutoff', 'q point', 'bjt'],
  },
  'q point': {
    tip: 'Quiescent point — the steady-state (V_CE, I_C) at which a transistor sits when no AC signal is applied. The Q-point is the centre of the swing.',
    detail:
      'The Q-point (or operating point, or bias point) is the DC operating point of an amplifier — where the transistor sits when the AC input is zero. It is found graphically as the intersection of the load line (set by V_CC and R_C) with the output curve corresponding to the chosen base current. The «right» Q-point is usually the middle of the load line at V_CE ≈ V_CC / 2, which gives equal swing room toward saturation (V_CE → 0) and toward cutoff (V_CE → V_CC) before the output clips. Bias too close to either end and one half of the signal smashes into the rail. In practice the Q-point is set by the four-resistor bias network (R_1, R_2 divider plus R_E), chosen so that I_C lands where you want it regardless of which specific transistor you grabbed from the bin.',
    see: ['load line', 'active region', 'common emitter'],
  },
  'common emitter': {
    tip: 'The standard single-transistor BJT voltage amplifier: input on the base, output on the collector, emitter grounded (or returned to ground through a small R_E). Gain ≈ −R_C / R_E, with phase inversion.',
    detail:
      'The common-emitter (CE) amplifier is the BJT amplifier topology you\'ll see most often. Voltage-divider bias (R_1 + R_2) holds the base steady at a chosen DC voltage; the emitter is connected to ground through a small resistor R_E that sets the emitter current by Ohm\'s law (I_E = V_E / R_E); the collector connects through R_C to V_CC. An AC input wiggles the base voltage, the emitter follows it (V_BE is a near-constant 0.7 V drop), R_E converts the emitter wiggle into an emitter-current wiggle, and R_C converts the collector-current wiggle (≈ I_E) into an output voltage wiggle. The result is gain = −R_C / R_E — a clean ratio of resistors, β-independent and temperature-stable. The minus sign is phase inversion: a positive input wiggle becomes a negative output wiggle. Typical gains are 5–100 per stage; for higher gains, several stages are cascaded in series.',
    formula: 'A_v ≈ −R_C / R_E',
    see: ['bjt', 'common source', 'q point', 'load line'],
  },
  'common source': {
    tip: 'The FET equivalent of the common-emitter amplifier: input on the gate, output on the drain. Gain ≈ −g_m · R_D, with phase inversion.',
    detail:
      'The common-source (CS) amplifier is the FET version of the common-emitter circuit. The gate is biased to a voltage that puts the FET in its active region; the drain connects through R_D to the supply rail; the source is grounded (or returned to ground via a small R_S). An AC input on the gate produces a drain current swing g_m · v_in, where g_m = ∂I_D/∂V_GS is the transconductance (typically 1–100 mS depending on the FET and operating current). That drain current swing drops across R_D as v_out = −g_m · R_D · v_in. The minus sign is phase inversion. The CS topology shares the CE\'s strengths (single-stage gain, easy biasing) and adds the FET\'s near-infinite input impedance — useful when the source is a piezo, electrometer, or any other high-impedance node.',
    formula: 'A_v ≈ −g_m · R_D',
    see: ['fet', 'mosfet', 'common emitter', 'transconductance'],
  },
  transconductance: {
    tip: 'The slope of a device\'s output current versus input voltage — ∂I_out / ∂V_in. Units are siemens (S = A/V). For a FET, g_m sets the voltage gain in a common-source amplifier the same way 1/R_E sets the gain in a BJT common-emitter amplifier.',
    detail:
      'Transconductance g_m measures how strongly an input voltage modulates an output current. For a FET, g_m = ∂I_D / ∂V_GS at a given operating point; values are typically 1–100 mS depending on the device and bias current. For a BJT operated as a transconductance device (Ebers-Moll picture), g_m = I_C / V_T where V_T ≈ 25 mV is the thermal voltage at room temperature — so a BJT at 1 mA collector current has g_m ≈ 40 mS, much higher than most FETs. Transconductance shows up directly in the gain formulae of voltage amplifiers: A_v = −g_m · R_load, regardless of whether the transistor is a BJT or a FET. The unit is the siemens (S), or equivalently the «mho» (ohm spelled backwards).',
    formula: 'g_m = ∂I_out / ∂V_in',
    see: ['common source', 'fet', 'mosfet'],
  },
  beta: {
    tip: 'The current gain of a BJT — β = I_C / I_B. Typically 50–500 for a small-signal NPN, but varies factor-of-three across specimens and 30–50 % across temperature.',
    detail:
      'β (or h_FE on datasheets) is the BJT\'s current-gain ratio: a base current I_B causes a collector current of about β · I_B, as long as the transistor is in the active region. For a typical small-signal NPN like the 2N3904, β is between 100 and 300 at I_C = 10 mA and room temperature; that range is the spread across specimens of the same part number. β also varies with collector current (usually peaks somewhere in the mA range and rolls off at low and high I_C) and with temperature (rises ~0.5 % per °C). β is useful as an order-of-magnitude estimate, but circuits should not depend on a specific β value — the standard four-resistor bias circuit is designed so β cancels out of the answer, leaving the operating point set by resistor ratios alone. The Greek letter is read «beta» and used interchangeably with h_FE in the literature.',
    formula: 'β = I_C / I_B',
    see: ['bjt', 'common emitter'],
  },
  'enhancement mode': {
    tip: 'A FET in which the channel does NOT conduct at zero gate voltage — V_GS must be raised past a threshold V_th to turn it on. The dominant species in modern MOSFETs.',
    detail:
      'An enhancement-mode FET starts non-conducting at V_GS = 0; you must «enhance» the channel by applying a gate voltage past the threshold V_th (typically 1–4 V for n-channel) to allow current flow. Almost every modern MOSFET is enhancement mode, because that mode\'s «off-by-default» behaviour matches the way logic gates and switches need to behave. The complementary mode is depletion (channel conducts at V_GS = 0; gate voltage must «deplete» it to turn it off); JFETs are depletion-only, MOSFETs come in either mode but enhancement dominates. The schematic symbol marks enhancement with a BROKEN channel line (three short segments) — visual shorthand for «no channel until you turn it on».',
    see: ['mosfet', 'fet'],
  },
  'logic level': {
    tip: 'Of a MOSFET: rated to turn fully on at low gate-drive voltages (V_GS ≈ 2.5–3 V) so it can be driven directly from a 3.3 V or 5 V microcontroller pin without an extra driver stage.',
    detail:
      'A «logic-level» MOSFET is one whose datasheet quotes R_DS(on) at V_GS values below ~3 V — meaning it turns fully on with a 3.3 V or 5 V microcontroller pin as the gate drive, no booster circuit needed. Standard-level MOSFETs (e.g. IRF540) are designed for V_GS ≥ 10 V to be fully on, and a 3.3 V or 5 V drive will leave them only partially on (high R_DS(on), excessive heat dissipation). The convention in part numbers is the letter L: IRLZ44N is logic-level, IRFZ44N is standard. Always check the datasheet curve of R_DS(on) vs V_GS at your intended V_GS — at room temperature, with V_GS at the value your microcontroller actually outputs.',
    see: ['mosfet', 'fet'],
  },
  oscillator: {
    tip: 'A circuit that generates a steady, repeating signal of its own — with no input — by feeding part of an amplifier\'s output back to its input in phase (positive feedback).',
    detail:
      'An oscillator turns DC power into a continuous AC waveform with no input signal. It is an amplifier wrapped in a positive-feedback loop: a fraction of the output is returned to the input in phase, so any tiny disturbance grows. Two conditions sustain a clean oscillation — the round-trip phase shift is 0° (the feedback is in phase) and the loop gain (amplifier gain × feedback fraction) is at least 1, so the amplifier replaces the energy the loop loses each cycle. To start, the loop gain is a touch above 1 and the signal builds out of the amplifier\'s own noise; as the swing grows the gain sags until the loop gain settles at exactly 1 and the amplitude holds. A frequency-selective network in the loop — usually an LC tank or a quartz crystal — fixes the frequency, because it returns the signal in phase at only one frequency. Oscillators generate the carrier in every transmitter and the local oscillator in every superheterodyne receiver.',
    see: ['vfo', 'crystal oscillator', 'tuned circuit', 'carrier'],
  },
  'crystal oscillator': {
    tip: 'An oscillator whose frequency is set by a thin slice of quartz instead of an LC tank — far steadier, because the crystal behaves like a resonator with an enormous Q.',
    detail:
      'A crystal oscillator uses a piezoelectric quartz crystal as the frequency-selective element in the feedback loop. Electrically the crystal behaves like an LC tank with a very high Q factor — typically tens of thousands, against a couple of hundred for a coil-and-capacitor tank — so the oscillation frequency barely drifts with temperature, supply voltage, or mechanical knocks. The trade-off is that a crystal is cut for one fixed frequency and can only be «pulled» a few parts per million, so it is not tunable across a band the way an LC VFO is. Crystals are the timekeeping reference in nearly all digital and radio equipment; the same 32.768 kHz crystal that ticks in a quartz watch keeps time in countless microcontrollers. Common crystal-oscillator circuits include the Pierce and Colpitts topologies.',
    see: ['oscillator', 'vfo', 'q-factor'],
  },

  // ── Receivers (Chapter 3.1) ──────────────────────────────────────
  superheterodyne: {
    tip: 'A receiver design that shifts every incoming station down to one fixed «intermediate» frequency, where a single well-tuned filter and amplifier do all the selecting and amplifying.',
    detail:
      'The superheterodyne (or «superhet») mixes each incoming signal with a local oscillator to produce a fixed intermediate frequency (IF), then does almost all of its filtering and amplification at that one frequency. Because the hard work happens at a single fixed frequency, the sharp selectivity and high gain are built and tuned once instead of being re-tuned for every station — tuning the radio just means moving the local oscillator. Invented by Edwin Armstrong in 1918, it is the architecture behind nearly every receiver made since. Its one weakness is the image frequency: a second input frequency, twice the IF away from the wanted one, that maps to the same IF and must be rejected by a filter ahead of the mixer.',
    see: ['mixer', 'intermediate frequency', 'local oscillator', 'image frequency', 'trf'],
  },
  trf: {
    tip: 'Tuned Radio Frequency receiver — the simplest design, where every stage is tuned to the station\'s own frequency and the signal travels «straight» through to the detector.',
    detail:
      'A TRF («tuned radio frequency»), or «straight», receiver amplifies and filters the signal at the station\'s own frequency, with no frequency conversion. Several tuned RF amplifier stages in a row select and boost the signal, then a detector recovers the audio. It works — it was the first practical design — but it has three weaknesses the superheterodyne fixes: every tuned stage must be re-tuned together to change station, the selectivity changes across the band, and high gain at one frequency tends to break into oscillation. A crystal radio is the most basic TRF receiver of all.',
    see: ['superheterodyne', 'selectivity', 'detector'],
  },
  'intermediate frequency': {
    tip: 'The single fixed frequency a superheterodyne shifts every station down to, where all the sharp filtering and most of the gain happen.',
    detail:
      'The intermediate frequency (IF) is the fixed frequency produced when the mixer beats the incoming signal against the local oscillator — the difference between the two. Every station, wherever it sits in the band, is converted to this same IF, so the receiver\'s sharp filter and high-gain amplifier are built and tuned once for all stations. The choice of IF is a trade-off: a higher IF pushes the image frequency further away (easier to reject), while a lower IF makes narrow, sharp selectivity easier to build. Classic values are 455 kHz for AM broadcast and HF sets, 10.7 MHz for FM broadcast receivers, and around 9 MHz in HF amateur rigs.',
    unit: 'Hz (kHz, MHz)',
    see: ['superheterodyne', 'mixer', 'image frequency'],
  },
  mixer: {
    tip: 'A stage that combines two frequencies and produces their sum and difference — the heart of the frequency-shifting in a superheterodyne.',
    detail:
      'A mixer takes two signals — the incoming station and the local oscillator — and produces new signals at the sum and the difference of their frequencies (this combining is called heterodyning). In a superheterodyne receiver a filter keeps the difference, which is the fixed intermediate frequency, so the mixer is the stage that slides the chosen station down to the IF. The same process, run the other way, shifts a signal up to the transmit frequency in a transmitter. Because only the size of the gap between its two inputs matters, the mixer cannot tell a wanted signal from its image, which sits the same gap away on the other side of the local oscillator.',
    see: ['superheterodyne', 'local oscillator', 'intermediate frequency', 'image frequency'],
  },
  'local oscillator': {
    tip: 'The oscillator inside a receiver that the mixer beats the incoming signal against; tuning the radio means moving its frequency.',
    detail:
      'The local oscillator (LO) generates a clean, steady tone inside the receiver for the mixer to beat the incoming signal against. Its frequency decides which station lands on the fixed intermediate frequency, so the LO is the tuning control: a variable-frequency oscillator (VFO) sweeps it across a band, or a switchable crystal oscillator fixes it on set channels. Keeping the LO clean and stable matters — drift moves the station off the IF filter, and oscillator noise can let strong nearby signals leak in.',
    see: ['oscillator', 'mixer', 'superheterodyne', 'vfo'],
  },
  bfo: {
    tip: 'Beat Frequency Oscillator — a small oscillator that supplies the carrier CW and SSB leave out, so the detector can turn them back into sound.',
    detail:
      'The beat frequency oscillator (BFO) is an extra oscillator used only for CW and SSB reception. CW (Morse) is just a carrier switched on and off, and SSB has had its carrier removed to save power; in both cases the detector needs a carrier to beat against. The BFO supplies it: beating against a Morse carrier turns each dot and dash into an audible tone (typically around 600 Hz), and feeding a product detector lets it rebuild an SSB voice. For AM and FM the BFO is switched off.',
    see: ['cw', 'ssb', 'detector', 'carrier'],
  },
  squelch: {
    tip: 'A circuit that mutes a receiver\'s audio when no signal is present, so you do not have to listen to background hiss between transmissions.',
    detail:
      'Squelch silences the audio amplifier whenever the received signal falls below a set threshold, so an idle channel stays quiet instead of pouring out background noise. It is most associated with FM, where an unused channel hisses loudly; the squelch opens the moment a signal appears and closes again when it ends. A simple «carrier» squelch responds to signal strength; more selective schemes (such as CTCSS sub-audible tones) open only for signals carrying the right tone.',
    see: ['fm', 'detector'],
  },
  'image frequency': {
    tip: 'An unwanted second frequency, twice the intermediate frequency away from the station you want, that the mixer shifts down to the same IF.',
    detail:
      'Because a mixer only knows the size of the gap between the station and the local oscillator, two input frequencies — one on each side of the oscillator — produce the same intermediate frequency. The wanted station is one; the image is the other, sitting twice the IF away. A strong signal on the image frequency lands right on top of the wanted one and cannot be separated after mixing, so it must be rejected before the mixer by the tuned front-end filter. Raising the IF moves the image further away and makes it easier to filter out — one of the main reasons receivers use the IF values they do.',
    formula: 'f_image = f_RF ± 2 × f_IF',
    see: ['superheterodyne', 'mixer', 'intermediate frequency'],
  },
  detector: {
    tip: 'The stage that recovers the original message — voice, Morse or data — from the modulated signal; also called a demodulator.',
    detail:
      'The detector (or demodulator) undoes what the transmitter\'s modulator did, recovering the audio or data from the radio signal. The circuit depends on the mode: AM uses a diode envelope detector that follows the rising and falling amplitude; SSB and CW use a product detector together with a BFO that supplies the missing carrier; FM uses a limiter followed by a discriminator that converts frequency changes into audio. In a superheterodyne the detector always works at the fixed intermediate frequency, so it never has to change as you tune from one station to another — the only thing that decides which detector you need is the mode, not the frequency.',
    see: ['envelope', 'am', 'ssb', 'fm', 'bfo'],
  },
  'high-impedance earpiece': {
    tip: 'A crystal or magnetic earpiece with a high impedance (a few kΩ up to tens of kΩ), able to turn the tiny power a detector radio recovers into sound.',
    detail:
      'A high-impedance earpiece is the classic output for a crystal (detector) radio, which has no amplifier and pulls only microwatts from the antenna. Its high impedance — a piezo/crystal element runs to tens of kΩ, a sensitive magnetic type is a few kΩ — lets it make sound from very little power. A normal 8 Ω loudspeaker or low-impedance earbud would load the detector right down and stay silent. If all you have is low-impedance headphones, a small audio transformer (high-impedance primary, low-impedance secondary) matches them to the detector.',
    see: ['impedance', 'detector'],
  },
  sensitivity: {
    tip: 'A receiver\'s ability to hear very weak signals; set by how little noise the receiver\'s own front-end electronics add.',
    detail:
      'Sensitivity measures the smallest signal a receiver can pull out of the noise and still present usefully — often just a fraction of a microvolt at the antenna. It is limited not by raw gain (gain is easy) but by the noise the receiver\'s own first stages add: the RF amplifier and mixer at the front end set the floor, which is why the RF amplifier is built to be as quiet as possible. Beyond a point, more gain only amplifies the noise along with the signal, so sensitivity is really about a good signal-to-noise ratio at the front end. It is the natural partner of selectivity — one is about hearing the weak, the other about rejecting the unwanted.',
    see: ['selectivity', 'detector'],
  },
  limiter: {
    tip: 'An FM stage that flattens the signal to a constant amplitude, clipping off noise spikes before the discriminator recovers the audio.',
    detail:
      'A limiter clips the intermediate-frequency signal to a constant amplitude, removing any variation in strength. In an FM receiver this is essential: FM carries its message in frequency, not amplitude, so anything riding on the amplitude — static crashes, ignition noise, fading — is unwanted, and the limiter strips it away before the discriminator. This is a large part of why FM sounds so much cleaner than AM in the presence of noise. AM and SSB, whose information lives in the amplitude, must not be limited.',
    see: ['fm', 'discriminator', 'detector'],
  },
  discriminator: {
    tip: 'An FM detector that turns the signal\'s frequency changes into an audio voltage.',
    detail:
      'A discriminator is the detector used for FM: it produces an output voltage that follows the instantaneous frequency of the signal, so as the carrier swings up and down the output reproduces the original audio. Classic forms exploit the steep slope of a tuned circuit (the Foster–Seeley discriminator and the ratio detector); modern radios often do the same job digitally. It is normally preceded by a limiter, which removes amplitude variations the discriminator would otherwise pass on as noise.',
    see: ['fm', 'limiter', 'detector'],
  },

  // ── Chapter 3.3 — antennas and transmission lines ────────────────
  'radiation resistance': {
    tip: 'The part of an antenna\'s feed-point resistance that stands for power actually radiated as radio waves, rather than lost as heat.',
    detail:
      'From the feedline\'s side, an antenna\'s feed point looks like a resistor absorbing power. The portion of that resistance which represents energy leaving as radio waves — the useful part — is the radiation resistance. For a half-wave dipole in the clear it is about 73 Ω. A small loss resistance (warm conductors, lossy ground) always adds to it; an efficient antenna keeps its radiation resistance much larger than its loss resistance, so most of the power radiates instead of heating the surroundings.',
    see: ['dipole', 'impedance', 'antenna'],
  },
  'radiation pattern': {
    tip: 'A map of the directions in which an antenna radiates strongly and weakly.',
    detail:
      'The radiation pattern shows how an antenna spreads its energy in space. A dipole\'s is a broadside figure-of-eight with deep nulls off its ends; a vertical\'s, seen from above, is a uniform circle; a Yagi\'s is a single forward lobe with a small rear lobe. Two numbers describe a directional pattern: the beamwidth (how wide the main lobe is) and the front-to-back ratio (how much weaker the rear is than the front). Being reciprocal, the pattern is the same on transmit and receive.',
    see: ['dipole', 'yagi', 'isotropic'],
  },
  'velocity factor': {
    tip: 'The fraction of the free-space speed of light at which a wave travels along a particular feedline.',
    detail:
      'Radio waves move more slowly inside a cable than in free space, because the insulation (dielectric) slows the field. The velocity factor is that fraction: about 0.66 for solid-polyethylene coax, 0.80 for foam coax, and over 0.90 for open ladder line. It matters whenever you cut a line to a fraction of a wavelength — a quarter-wave matching stub made of 0.66 coax is only 66 % as long as a quarter-wave in air.',
    see: ['coax', 'feeder', 'wavelength'],
  },
  'standing wave': {
    tip: 'The fixed pattern of high and low voltage along a feedline when a forward wave and a reflected wave overlap.',
    detail:
      'When a load does not absorb all the power a line delivers, the reflected wave travels back and interferes with the forward wave. Where they add you get a voltage maximum, where they cancel a minimum, and because those points stay put, the pattern is called a standing wave. The ratio of the maximum to the minimum is the SWR. The very same effect produces the current and voltage distribution along a resonant antenna.',
    see: ['swr', 'reflection coefficient', 'feeder'],
  },
  'reflection coefficient': {
    tip: 'How much of a wave bounces back from a mismatched load, as a fraction of the wave arriving — written Γ.',
    detail:
      'The reflection coefficient Γ is the ratio of the reflected wave to the forward wave at the load: Γ = (Z − Z₀) / (Z + Z₀), where Z is the load impedance and Z₀ the line impedance. It is 0 for a perfect match and reaches 1 for a total reflection (an open or short circuit). The fraction of power reflected is |Γ|², and Γ ties directly to SWR through SWR = (1 + |Γ|) / (1 − |Γ|).',
    see: ['swr', 'return loss', 'impedance'],
  },
  'return loss': {
    tip: 'The reflected power expressed in decibels below the forward power; a bigger number means a better match.',
    detail:
      'Return loss is another way to state how well a load is matched: RL(dB) = −20·log₁₀|Γ|. A perfect match reflects nothing, so its return loss is infinite; a 2:1 SWR is about 9.5 dB, and a 1.5:1 SWR about 14 dB. Where SWR counts upward as the match worsens, return loss counts downward — high return loss is good. A VNA usually plots return loss (as S11) directly.',
    see: ['swr', 'reflection coefficient', 's11'],
  },
  erp: {
    tip: 'Effective Radiated Power — the power your station behaves as if it were radiating, measured against a dipole.',
    detail:
      'ERP starts from the transmitter output, subtracts feedline and component losses, and adds the antenna\'s gain in dBd: ERP = P × 10^((G − L) / 10). It answers “how strong is my signal in the favoured direction, compared with feeding a plain dipole?” A 100 W rig, a 1 dB feedline and a 6 dBd Yagi give +5 dB of system gain, so an ERP of about 316 W. Licence and band-plan limits are often written as ERP rather than raw transmitter watts.',
    see: ['dbd', 'eirp', 'power'],
  },
  eirp: {
    tip: 'Effective Isotropic Radiated Power — like ERP, but measured against an isotropic source instead of a dipole.',
    detail:
      'EIRP is the same idea as ERP, only referenced to the isotropic radiator and so using antenna gain in dBi. Because a dipole is 2.15 dB stronger than isotropic, the EIRP of any station is always 2.15 dB (a factor of about 1.64) larger than its ERP. EIRP is the form most used at VHF/UHF and for satellite and regulatory work; if a limit just says “radiated power” with no reference stated, a dipole (ERP) is usually meant.',
    see: ['dbi', 'erp', 'isotropic'],
  },
  'ground plane': {
    tip: 'A conducting surface beneath a vertical antenna that supplies the antenna\'s missing other half by reflection.',
    detail:
      'A quarter-wave vertical is electrically half a dipole; the ground plane provides the other half as a mirror image. It can be the earth itself, a metal vehicle roof, or — most often — a set of radial wires. A poor ground plane wastes power as heat in the soil and raises the feed impedance, which is why ground-mounted verticals use many radials. The better the ground plane, the more efficient the vertical.',
    see: ['monopole', 'radial', 'antenna'],
  },
  radial: {
    tip: 'One of the wires that together form the ground plane of a vertical antenna.',
    detail:
      'Radials are wires spread out from the base of a vertical antenna to make its ground plane. Laid on or under the ground they give the return currents a low-loss path instead of the lossy soil; for a ground-mounted vertical their exact length and thickness are not critical — many radials (a few dozen) beat a few long ones, so number and coverage matter most. Raised off the ground the radials instead act as a tuned counterpoise: as few as four work well, but each must be resonant, about a quarter-wave long — the same length as the element (L ≈ 71 / f(MHz) in metres). Drooping the four radials about 30° raises the feed impedance from roughly 36 Ω (radials horizontal) toward the 50 Ω that matches common coax.',
    see: ['ground plane', 'monopole'],
  },
  monopole: {
    tip: 'A single-element vertical antenna a quarter-wave tall, working against a ground plane — half a dipole stood on end.',
    detail:
      'A monopole is the quarter-wave vertical: one rod or wire about a quarter-wavelength long, fed against a ground plane that supplies its missing half. It radiates equally in all horizontal directions (omnidirectional), is vertically polarised, and has a feed impedance around 36 Ω over perfect ground, nearer 50 Ω in practice. Its low takeoff angle suits distant contacts and its small footprint suits tight spaces — at the price of needing a good radial system.',
    see: ['dipole', 'ground plane', 'polarisation'],
  },
  'driven element': {
    tip: 'The element of a multi-element antenna that is actually connected to the feedline.',
    detail:
      'In a Yagi or similar beam, only one element — the driven element — is fed by the transmitter; it is essentially a dipole. The other elements (the reflector and directors) are parasitic: connected to nothing, they are energised only by the driven element\'s field and re-radiate it. The driven element sets the feed impedance and the operating frequency; the parasitic elements shape the beam.',
    see: ['yagi', 'parasitic element', 'dipole'],
  },
  'parasitic element': {
    tip: 'An antenna element with no feedline of its own, energised only by a nearby driven element, used to shape the beam.',
    detail:
      'Parasitic elements are the reflector and directors of a Yagi: they connect to nothing, but the driven element\'s field induces a current in them and they re-radiate it. A slightly longer element behind the driven one acts as a reflector; slightly shorter elements in front act as directors. Their lengths and spacings are chosen so the re-radiated waves add up forwards and cancel backwards, turning a bare dipole\'s figure-of-eight into a forward beam.',
    see: ['yagi', 'driven element'],
  },
  'ladder line': {
    tip: 'A low-loss balanced feedline of two parallel conductors held apart by an insulating web, with an impedance near 450 Ω.',
    detail:
      'Ladder line (or window line) is a balanced feedline whose two conductors are spaced by a plastic strip with regular cut-outs — the “windows” that name it. Its characteristic impedance is around 450 Ω and its velocity factor about 0.90. Because most of its field is in open air, it loses far less power than coax even at high SWR, which makes it the classic feeder for a tuner-fed multiband doublet — but it must be kept clear of metal and run to a balanced tuner or a balun.',
    see: ['feeder', 'twin-lead', 'balun'],
  },
  'twin-lead': {
    tip: 'A flat balanced feedline of two parallel wires moulded in a plastic ribbon, typically 300 Ω.',
    detail:
      'Twin-lead is the flat “ribbon” feeder once common for television aerials: two conductors moulded a fixed distance apart in a plastic strip, giving a characteristic impedance around 300 Ω. Like all balanced lines it loses little power and does not radiate when its currents stay balanced, but its performance suffers when it is wet or run near metal. It belongs to the same parallel-line family as ladder line and open-wire feeder.',
    see: ['feeder', 'ladder line', 'characteristic impedance'],
  },
  'common-mode current': {
    tip: 'Unwanted current flowing on the outside of a coax shield, which makes the feedline radiate and brings RF back into the shack.',
    detail:
      'Coax is meant to carry equal and opposite currents on its inner conductor and the inside of its shield, so its fields stay sealed inside. But skin effect lets a separate current flow on the outside of the shield — the common-mode current. Fed straight to a balanced antenna such as a dipole, the coax takes up this current: it radiates (distorting the pattern and filling nulls), flows back to the equipment as RF in the shack, and upsets SWR readings. A choke (current) balun blocks it.',
    see: ['balun', 'coax', 'feeder'],
  },
  rfi: {
    tip: 'Radio-Frequency Interference — the disturbance an unwanted radio signal causes in a receiver or electronic device.',
    detail:
      'RFI is the everyday, ham-radio face of EMI: your transmitter getting into a neighbour\'s television, a switch-mode charger hashing across your receiver, a plasma screen wiping out a whole band. Every case has three parts — a source of radio energy, a path that carries it, and a victim that reacts — and breaking any one of them cures it. The standard fixes are filters, ferrite chokes, shielding, bonding, and simply more distance or less power.',
    see: ['emi', 'emc', 'harmonic', 'common-mode current', 'ferrite'],
  },
  emc: {
    tip: 'ElectroMagnetic Compatibility — the engineering discipline of getting equipment to coexist without interfering with each other.',
    detail:
      'EMC has two halves: emission (your device must not radiate more electromagnetic energy than the rules allow) and immunity (it must keep working while bathed in everyone else\'s). A radio station sits squarely in both — a clean transmitter is good emission behaviour, and a receiver that rejects strong out-of-band signals is good immunity. When compatibility breaks down the result is interference (RFI/EMI). Good EMC is designed in with shielding, filtering, grounding and bonding, and sensible layout.',
    see: ['emi', 'rfi', 'shielding', 'rf earth'],
  },
  tvi: {
    tip: 'TeleVision Interference — interference caused to a television receiver, historically the classic amateur-radio complaint.',
    detail:
      'TVI was the signature interference problem of the analogue-TV era: harmonics of a short-wave transmitter landing on a television channel, or a strong signal overloading the set\'s front end and putting herringbone patterns or rolling bars across the picture. The cures split by cause — a low-pass filter at the transmitter for harmonics, a high-pass filter at the television for overload, and ferrite chokes for common-mode pickup on the aerial lead. Digital television is more robust but not immune; strong overload can still freeze or break up the picture.',
    see: ['rfi', 'bci', 'harmonic', 'front-end overload'],
  },
  bci: {
    tip: 'Broadcast Interference — interference caused to a broadcast radio receiver, such as an AM or FM set.',
    detail:
      'BCI is the audio-broadcast cousin of TVI: a strong nearby transmitter breaking through into an AM or FM receiver, often heard as your speech appearing faintly under the station the listener is tuned to. Cheap sets with poor front-end selectivity are the usual victims (fundamental overload), so the cure is frequently at the receiver — a filter at its antenna input — rather than at your, possibly perfectly clean, transmitter.',
    see: ['rfi', 'tvi', 'front-end overload', 'am'],
  },
  spurious: {
    tip: 'A spurious emission is any signal a transmitter radiates outside its intended channel — harmonics, mixer products, or noise.',
    detail:
      'No transmitter is perfectly clean. Alongside the wanted signal it radiates weaker spurious emissions: harmonics at integer multiples of the operating frequency (the most common), mixer and multiplier products, broadband noise, and parasitic oscillations. Regulations set limits on how strong these may be, because they land on other users\' frequencies. The cure is at the transmitter — a well-designed output filter and a properly adjusted, un-overdriven amplifier.',
    see: ['harmonic', 'parasitic oscillation', 'filter', 'rfi'],
  },
  'parasitic oscillation': {
    tip: 'A parasitic oscillation is an unwanted, self-sustaining oscillation in an amplifier at a frequency unrelated to the wanted signal.',
    detail:
      'An amplifier stage has enough gain to oscillate if stray feedback finds a path — through lead inductance, inter-electrode capacitance, or a poorly-decoupled supply. When it does, it breaks into a parasitic oscillation, often far from the operating frequency (sometimes at VHF in a short-wave amplifier). The result is wasted power, distortion, spurious emissions, and sometimes a destroyed device. Cures include parasitic-suppressor resistors, neutralisation, and better layout and decoupling.',
    see: ['spurious', 'harmonic', 'filter'],
  },
  'front-end overload': {
    tip: 'Front-end overload is a receiver being swamped by a signal too strong for its input stage to reject — even a perfectly clean one.',
    detail:
      'A receiver is supposed to select the wanted signal and reject everything else, but a strong enough nearby transmitter can overwhelm its first (front-end) stage regardless of frequency — this is fundamental overload. Nothing need be wrong with the offending signal; it is simply too strong and too close. The give-away is that reducing the transmitter\'s power makes the interference vanish abruptly. Because the weakness is in the victim, the cure goes there: a filter or attenuator at its antenna input, or more distance.',
    see: ['rfi', 'bci', 'tvi', 'filter'],
  },
  'common-mode choke': {
    tip: 'A common-mode choke is a ferrite core around a cable that blocks common-mode RF while passing the wanted differential signal.',
    detail:
      'Wind a cable through a ferrite core and any common-mode current (flowing the same way on every conductor) sees the core\'s full impedance — its fields add and the core presents hundreds to thousands of ohms in series. The differential signal inside (out and back on the pair) makes fields that cancel in the core, so it passes untouched. Impedance rises with the square of the number of turns, so a few turns through one core beat a single pass through several. It is the workhorse cure for cable-borne interference.',
    see: ['ferrite', 'common-mode current', 'choke', 'inductor'],
  },
  shielding: {
    tip: 'Shielding is a conductive enclosure that stops electromagnetic energy radiating into or out of a circuit.',
    detail:
      'A conductive box, braid, or mesh reflects and absorbs radio waves, keeping them from reaching sensitive circuitry or from escaping a noisy one. Reflection does most of the work for radio-frequency and electric-field coupling, so even thin metal or fine mesh is effective; low-frequency magnetic fields are far harder and need thick, high-permeability material. Shields only work if they are continuous — a seam left un-bonded, or a gap a fair fraction of a wavelength long, leaks like a slot antenna. Coax braid, the can around a tuner, and the lid over an oscillator are all shields.',
    see: ['emc', 'coax', 'rf earth'],
  },
  'rf earth': {
    tip: 'An RF earth is a low-impedance reference that keeps a station\'s equipment at the same voltage at radio frequencies — not a drain for noise.',
    detail:
      'Beginners often imagine earth as a sink that swallows unwanted signals; it is not. Ground is a shared voltage reference, and a good RF earth means every box in the station sits at the same potential, achieved by bonding them together with short, heavy straps. Length is everything: a long wire to a ground rod is, at radio frequencies, simply an antenna — it will radiate your harmonics around the house and can make interference worse. Bonding, not a longer wire, is what cures RF-earth problems.',
    see: ['emc', 'shielding', 'end-fed'],
  },
  'end-fed': {
    tip: 'An end-fed antenna is a wire fed at one end rather than the middle — convenient, but prone to putting RF on the station and its earth.',
    detail:
      'An end-fed wire is fed at a high-voltage, high-impedance point, usually through a matching unit. Bring it straight into the shack and the return current has to flow on whatever is to hand — the equipment cases, the mains earth, the feed lines — so the whole station can end up with RF on it, a classic self-inflicted interference source. Fed properly, with a good counterpoise or a common-mode choke on the feed line and solid bonding, end-fed antennas work well; fed carelessly they are an EMC headache.',
    see: ['rf earth', 'common-mode choke', 'antenna', 'rfi'],
  },
  // ── Ch 4.3 — Safety ──────────────────────────────────────────────
  'ventricular fibrillation': {
    tip: 'Ventricular fibrillation is a state in which the heart muscle quivers instead of beating, so it stops pumping blood — this is what electrocution actually is.',
    detail:
      'The heart pumps because its muscle fibres contract together, in a coordinated wave. A current passing through the chest can scramble that coordination, leaving the fibres twitching independently: the muscle is still moving, but it no longer squeezes, so no blood is pushed anywhere. IEC 60479-1 puts the threshold near 40 mA of alternating current lasting more than a second or two — a level a 230 V mains contact exceeds several times over. It rarely stops on its own; a defibrillator works by shocking the whole muscle into stopping at once, in the hope that it restarts in step.',
    see: ['current', 'mains', 'rcd'],
  },
  'protective earth': {
    tip: 'The protective earth (PE) is the third conductor in a mains cable, coloured yellow-green, whose job is to blow the fuse if a live wire ever touches an equipment case.',
    detail:
      'It is not a drain for stray electricity, which is the usual misconception. It is a trigger. It provides a fat, low-resistance path from the metal case back to the supply, so a live-to-case fault draws hundreds of amps and clears the fuse in milliseconds. Without it the case simply sits at mains voltage, looking entirely normal, drawing no current and alerting nobody — until a person completes the circuit. On cable cores it is yellow-green; be warned that inside a Ukrainian switchboard those same colours mean live phases.',
    see: ['fuse', 'mains', 'bonding', 'rcd'],
  },
  fuse: {
    tip: 'A fuse is a deliberately weak conductor that melts and disconnects the supply before a fault can start a fire.',
    detail:
      'Two numbers describe it. The rating is how much current it passes indefinitely — under IEC 60127 that is simply the equipment’s normal running current, unlike the American UL convention of rating at 125–150 %. The letter is its speed: F (flink) is quick-acting, T (träge) is time-lag. Neither type is required to blow at 1.5× its rating for a full hour, which tells you what a fuse is really for: it protects against short circuits and fire, not against working equipment hard. Fitting a larger fuse to stop it blowing removes the protection and hands the fusing job to your wiring.',
    see: ['time-lag fuse', 'inrush current', 'protective earth', 'mains'],
  },
  'time-lag fuse': {
    tip: 'A time-lag (T, slow-blow) fuse tolerates a brief overload before melting, so a transformer’s switch-on surge does not blow it every time.',
    detail:
      'The letter comes from the German träge, sluggish; F for flink, nimble, is the quick-acting opposite. The difference is large where it matters: at ten times its rating an F fuse clears in 20–40 ms, a T fuse tolerates up to 300 ms. That tolerance exists because a mains transformer draws ten to twelve times its running current for the first few cycles at switch-on, while the reservoir capacitor behind it is still empty and looks like a short. An F fuse would clear inside that window, every single power-up. A T fuse rides it out and still clears a genuine fault.',
    see: ['fuse', 'inrush current', 'transformer'],
  },
  'inrush current': {
    tip: 'Inrush current is the large, brief surge a transformer or power supply draws in the first few cycles after switch-on, before it settles to its normal current.',
    detail:
      'Two things cause it. A transformer’s core has to be magnetised from scratch, which briefly draws ten to twelve times the running current — and up to twenty-five times in the first half-cycle. Meanwhile the reservoir capacitor behind the rectifier is empty, and an empty capacitor is electrically indistinguishable from a short circuit. Both effects last only a few cycles, but they are the reason a linear supply needs a time-lag fuse: a quick-acting fuse cannot tell this perfectly normal surge from a fault.',
    see: ['time-lag fuse', 'transformer', 'psu', 'capacitor'],
  },
  rcd: {
    tip: 'An RCD (ПЗВ in Ukraine, GFCI in the US) is a device that compares the current going out along the line with the current returning on the neutral, and disconnects if they differ.',
    detail:
      'In a healthy circuit the two are equal. If some current is going missing it must be leaking somewhere it should not — through the earth, or through a person — and the device trips. For personal protection the threshold is 30 mA, acting within 300 ms at that current or 40 ms at five times it. Note carefully what that means: it does not prevent the shock, it ends it. And it has a blind spot — hold the line in one hand and the neutral in the other and your current returns on the neutral, perfectly balanced, so the device sees an ordinary load and never trips. In Ukraine ПУЕ forbids fitting one to a TN-C installation.',
    see: ['tn-c', 'protective earth', 'mains', 'ventricular fibrillation'],
  },
  'tn-c': {
    tip: 'TN-C is an earthing arrangement in which one conductor does the job of both neutral and protective earth along the whole installation — the norm in Soviet-era housing.',
    detail:
      'The combined conductor is called PEN. It is cheaper by one wire, and its weakness is total: if the PEN conductor ever breaks, every earthed case downstream rises to mains voltage, because the thing that was supposed to be earth was also carrying the return current. This is why an RCD cannot be used on TN-C — there is no separate earth for a leakage current to flow through, so there is nothing for the device to detect. ПУЕ 1.7.81 forbids it outright. Modern practice is TN-C-S, splitting PEN into separate PE and N near the point of supply.',
    see: ['rcd', 'protective earth', 'mains'],
  },
  'high tension': {
    tip: 'High tension (HT) is the high-voltage supply rail inside valve equipment and power amplifiers — hundreds to thousands of volts.',
    detail:
      'The name is old British usage; American sources say B+ or simply HV. It is produced by rectifying and smoothing a transformer’s secondary, and the smoothing capacitors are what make it dangerous long after the plug is out: at 4 kV an ordinary 50 µF reservoir holds 400 joules. Because stored energy goes as the square of the voltage, an HT supply is not merely a worse version of a 12 V rail — it is in a different category, and it is why bleeder resistors, shorting sticks and metering-before-touching are standard practice around valve gear.',
    see: ['bleeder resistor', 'shorting stick', 'power amplifier', 'psu'],
  },
  'bleeder resistor': {
    tip: 'A bleeder resistor is a resistor left permanently across a power supply’s reservoir capacitor to drain its charge once the supply is switched off.',
    detail:
      'It is sized to pull the rail down to a safe level within about thirty seconds — slow enough not to waste power in normal use, fast enough that the supply disarms itself while you fetch a screwdriver. It costs a few cents and is the difference between a supply that makes itself safe and one that waits for you. The essential caveat is that you must never trust one: bleeders fail open, and a failed bleeder is visually identical to a working one. Always meter the rail, and discharge it yourself anyway.',
    see: ['high tension', 'shorting stick', 'capacitor', 'psu'],
  },
  'shorting stick': {
    tip: 'A shorting stick is an insulated rod with an earthed lead on the end, used to discharge a capacitor deliberately rather than hoping it is already empty.',
    detail:
      'For anything holding more than a few joules the right tool is a discharge stick — the same thing with a high-wattage, low-value resistor in series, limiting the discharge to roughly 5–10 amps. The resistor is there for the capacitor’s sake as much as yours: a dead short across a large charged capacitor can damage it through internal thermal and magnetic stress. Never substitute a screwdriver. It brings your hand far closer to the live part than an insulated rod does, and it wrecks the blade.',
    see: ['bleeder resistor', 'high tension', 'capacitor', 'dielectric absorption'],
  },
  'dielectric absorption': {
    tip: 'Dielectric absorption, or soakage, is the tendency of a discharged capacitor to charge itself partly back up after the short is removed.',
    detail:
      'Charge does not only sit on the plates; some of it becomes trapped in the dielectric, and it seeps back out over seconds to minutes once you stop shorting the terminals. A non-solid aluminium electrolytic recovers 10–15 % of the voltage it started at. On a 400 V supply that is a 40–60 V surprise — a spark and a swear word. On a 4 kV valve supply the same percentage is several hundred volts, appearing by itself in a rig you have already made safe. This is why discharged capacitors are left shorted, and why large ones are shipped with their terminals tied together.',
    see: ['shorting stick', 'capacitor', 'electrolytic', 'high tension'],
  },
  'non-ionising': {
    tip: 'Non-ionising radiation is electromagnetic energy whose photons are too weak to knock electrons off atoms — which includes every radio wave, however powerful the transmitter.',
    detail:
      'Whether radiation can ionise depends on the energy per photon, which depends on frequency, not on how much of it there is. X-rays and gamma rays are ionising: a single photon can break a chemical bond and damage DNA directly. Radio photons are millions of times too weak for that, and no amount of transmitter power changes the energy of an individual photon. That does not make radio harmless — it heats tissue, which is what SAR measures — but it does mean the hazard is thermal, and quite different from what the word radiation usually suggests.',
    see: ['sar', 'radio wave', 'electromagnetic spectrum'],
  },
  sar: {
    tip: 'SAR (specific absorption rate) is the rate at which body tissue absorbs radio energy, in watts per kilogram — the quantity RF exposure limits are actually written in.',
    detail:
      'Because radio waves heat tissue rather than ionise it, the meaningful measure of exposure is a heating rate per unit mass. ICNIRP’s general-public limits are 0.08 W/kg averaged over the whole body and 2 W/kg averaged over any 10 g of head or torso. The practical problem is that you cannot measure watts per kilogram inside your own head, so the guidelines restate the limits as reference levels — field strengths in the air chosen so that meeting them guarantees meeting the SAR limit.',
    see: ['reference level', 'whole-body resonance', 'non-ionising', 'duty cycle'],
  },
  'reference level': {
    tip: 'A reference level is an RF field strength in the air — volts per metre, or watts per square metre — set so that staying under it guarantees staying under the SAR limit inside the body.',
    detail:
      'The real limit is SAR, and SAR is unmeasurable in practice, so the guidelines translate it into something you can measure or model. Meeting the reference level always means meeting the SAR limit; exceeding it does not automatically mean you have exceeded the SAR limit, only that a proper assessment is now needed. The levels are frequency-dependent, dipping to their strictest across 30–400 MHz where the body is resonant. Below 30 MHz ICNIRP deliberately defines no power-density level at all, and requires the electric and magnetic fields to be checked separately.',
    see: ['sar', 'whole-body resonance', 'near field'],
  },
  'whole-body resonance': {
    tip: 'Whole-body resonance is the frequency range where a human body couples most efficiently to a radio field — roughly 30–200 MHz — because the body is about half a wavelength long there.',
    detail:
      'A body is an antenna, and like any antenna it absorbs best when resonant. A standing adult is around half a wavelength near 70 MHz, dropping to about 35 MHz when standing on conductive ground. Across that range a given field produces far more heating than the same field would at HF or at 70 cm, so the exposure limit has to come down to compensate: it flattens out at 27.7 V/m from 30 to 400 MHz, its strictest anywhere. The 4 m and 2 m bands sit in that trough.',
    see: ['sar', 'reference level', 'resonance', 'dipole'],
  },
  'duty cycle': {
    tip: 'Duty cycle is the fraction of the time a transmitter is actually putting out full power — about 20 % for ordinary SSB speech, 100 % for FM and digital modes.',
    detail:
      'RF exposure limits are averaged over minutes, so what matters is not peak envelope power but the average. Two independent factors reduce it: the duty cycle of the mode, and the fraction of the time you transmit rather than listen. Ordinary SSB speech only reaches peak power on the loudest syllables (about 20 %); CW is about 40 %, SSB with heavy processing about 50 %, and anything with a constant carrier — FM, RTTY, FT8 — is 100 %. So 100 W of SSB in a normal conversation averages about 10 W, while the same 100 W of FM averages five times that. The mode matters more than the amplifier.',
    see: ['sar', 'pep', 'ssb', 'fm'],
  },
  'near field': {
    tip: 'The near field is the region close to an antenna — within roughly a sixth of a wavelength — where the wave has not yet settled into its far-field form and simple distance formulas do not apply.',
    detail:
      'Out in the far field, energy travels as a plane wave and power density falls predictably with distance, which is what the usual safe-distance formula assumes. Closer in, the electric and magnetic fields are not yet in the fixed relationship that assumption requires. This matters practically on HF: at 14 MHz the reactive near field extends about 3.4 m, while the plane-wave formula would put the compliance distance at around 1.5 m — an answer computed from a region where the equation is invalid. It is why ICNIRP defines no power-density limit below 30 MHz.',
    see: ['reference level', 'sar', 'wavelength', 'antenna'],
  },
  'ground potential rise': {
    tip: 'Ground potential rise is the voltage an earth electrode reaches above true earth while a large current — a lightning strike — flows into it.',
    detail:
      'It is simply V = I·R, and the numbers are brutal: 30 kA into a typical 25 Ω rod puts that rod 750 kV above true earth, and even a heroic 1 Ω rod would sit at 30 kV. No achievable earth resistance keeps the ground near zero. The danger appears when a station has two separate electrodes — one under the mast, one for the mains. A strike lifts the mast electrode to hundreds of kilovolts while the mains electrode, a few metres away, stays near true earth — and that difference appears across whatever bridges the two, which is your coax, through your radio. The cure is bonding, not a better earth.',
    see: ['bonding', 'lightning arrestor', 'rf earth', 'protective earth'],
  },
  bonding: {
    tip: 'Bonding means connecting every piece of equipment together electrically so that no voltage difference can appear between them — as distinct from earthing, which is a connection to the ground itself.',
    detail:
      'The distinction matters because you cannot hold anything near zero volts during a lightning strike. What you can do is make sure the whole station rises together: bond the mast, the feedline shield and every chassis to one single point, and a surge lifts them all in step, so nothing appears across the equipment. Nothing is drained away — the rod may still be at 750 kV — but damage comes from the difference, not the rise. Bonding conductors should be short, heavy and straight, because at the frequencies in a strike it is inductance, not resistance, that develops the voltage.',
    see: ['ground potential rise', 'rf earth', 'lightning arrestor', 'inductance'],
  },
  'lightning arrestor': {
    tip: 'A lightning arrestor is a device fitted in the feedline at the point it enters the building, which clamps a surge to the bonded entrance panel instead of letting it reach the radio.',
    detail:
      'Two kinds are common. A gas discharge tube is broadband and passes DC — necessary if the coax also feeds a masthead preamplifier or remote switch — but takes about a hundred nanoseconds to fire and lets a few hundred volts through first. A quarter-wave stub is a DC short to ground that is invisible at the operating frequency, has no turn-on delay because it is always connected, and lets through roughly forty times less; the price is that it works on one band only. Neither replaces the single most effective measure: unplugging the feedline from the radio and putting that loose end outside the building, not on the operating desk.',
    see: ['bonding', 'ground potential rise', 'coax', 'feeder'],
  },
  iec: {
    tip: 'The IEC (International Electrotechnical Commission) is the body that writes the international standards for electrical equipment — including the ones on fuses and on what current does to a human body.',
    detail:
      'It is not a regulator and cannot fine anyone; it publishes standards that national bodies then adopt, often word for word. Ukraine adopts them as ДСТУ IEC or ДСТУ EN documents. Three IEC standards bear on electrical safety: IEC 60479 on the effects of current on human beings, IEC 60127 on miniature fuses, and IEC 62305 on lightning protection. They are the ones to follow rather than American sources because they describe the equipment actually sold in Ukraine and the EU, and the conventions differ in ways that change the answer.',
    see: ['fuse', 'ventricular fibrillation'],
  },
  icnirp: {
    tip: 'ICNIRP (the International Commission on Non-Ionizing Radiation Protection) is the independent scientific body whose exposure guidelines the EU and most of the world use for radio fields.',
    detail:
      'It reviews the research and publishes limits — most recently in 2020 — expressed as SAR, with reference levels derived from them. Like the IEC it has no enforcement power; the EU adopted its 1998 guidelines as a Council Recommendation, and national regulators apply them. The important difference from the American FCC is who counts as occupationally exposed: under ICNIRP a hobbyist is not, so the general-public limits — five times stricter in SAR — apply to you in your own shack.',
    see: ['sar', 'reference level', 'non-ionising', 'fcc'],
  },
  fcc: {
    tip: 'The FCC (Federal Communications Commission) is the American communications regulator — worth knowing about mainly because most English-language radio writing assumes its rules, which differ from Europe’s.',
    detail:
      'Two divergences matter to a reader outside the United States. On RF exposure the FCC lets a licence-holder apply the looser occupational limits to themselves and their household; ICNIRP does not. On fuses the American UL convention marks a fuse at about 135 % of what it carries continuously, so US sources say to rate at 125–150 % of the running current — advice that fits an oversized fuse to IEC-rated equipment.',
    see: ['icnirp', 'sar', 'fuse'],
  },
  nfpa: {
    tip: 'The NFPA (National Fire Protection Association) is an American standards body whose electrical-safety document, NFPA 70E, is widely cited for stored-energy work thresholds.',
    detail:
      'Its Article 360 is the source of a voltage-dependent capacitor rule for stored-energy work: a stored energy above 100 J counts as hazardous below 100 V, above 1 J from 100 V, and above just 0.25 J from 400 V. The thresholds are work-control limits — the point at which you should treat a capacitor as live and use proper procedure — not predictions about electrocution. It is worth knowing that at the tightest tier the injury being prevented is largely the startle reaction and what you do in the quarter-second afterwards.',
    see: ['bleeder resistor', 'shorting stick', 'high tension'],
  },
  rsgb: {
    tip: 'The RSGB (Radio Society of Great Britain) is the British national amateur radio society, whose EMF guidance is the most usable practical RF-exposure material in Europe.',
    detail:
      'Its best-known contribution is a rule of thumb: for time-averaged powers up to 100 W, keeping people about 2.4 m from anything that radiates has been validated by a wide range of assessments and measurements. That matters because the alternative — computing a compliance distance — is invalid on HF, where the formula’s far-field assumption does not hold. The RSGB works to ICNIRP, so its conclusions transfer to a Ukrainian station in a way that American ones do not.',
    see: ['icnirp', 'duty cycle', 'near field'],
  },
  'пуе': {
    tip: 'ПУЕ (Правила улаштування електроустановок) is Ukraine’s own electrical installation code — the rules that actually govern the wiring in a Ukrainian building.',
    detail:
      'The 2017 edition replaced the Soviet ПУЭ of 1986, which is why so much older housing stock does not match it. One clause matters here and has no EU equivalent: ПУЕ 1.7.81 forbids fitting an RCD to a TN-C installation, which is what most Soviet-era two-wire wiring is.',
    see: ['protective earth', 'rcd', 'tn-c', 'mains'],
  },
  'дсту': {
    tip: 'ДСТУ is the prefix on a Ukrainian national standard; ДСТУ EN or ДСТУ IEC means Ukraine has adopted a European or international standard as its own.',
    detail:
      'The relevant one here is ДСТУ EN 60445:2022, which is where the harmonised conductor colours come from: brown for line, light blue for neutral, yellow-green for protective earth. Note the division of labour, because Ukrainian sources routinely get it wrong: the colour code is ДСТУ’s, not ПУЕ’s — the word «коричневий» does not appear anywhere in ПУЕ. ПУЕ mandates only the protective-earth and neutral colours.',
    see: ['пуе', 'protective earth', 'iec'],
  },
  'пзв': {
    tip: 'ПЗВ (пристрій захисного вимкнення) is the Ukrainian name for a residual-current device — the same thing called an RCD in Europe and a GFCI in the United States.',
    detail:
      'It compares the current flowing out along the line with the current returning on the neutral and disconnects if they differ, on the reasoning that the missing current must be leaking through the earth — or through a person. For personal protection the threshold is 30 mA. ПУЕ classes it as an additional protective measure that can never be the only one, and forbids it entirely on TN-C wiring. It does not prevent a shock; it ends one.',
    see: ['rcd', 'tn-c', 'пуе', 'protective earth'],
  },
}
