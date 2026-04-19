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
  reactance: {
    tip: 'AC-only opposition — the frequency-dependent resistance of a capacitor or an inductor.',
    detail:
      'Reactance is the opposition that capacitors and inductors present to AC, and only to AC. A capacitor blocks DC completely (after its initial charge-up) but passes AC more and more easily as frequency rises; an inductor does the opposite — passes DC freely but opposes AC more strongly at higher frequencies. Unlike resistance, which dissipates power as heat, reactance is lossless: energy goes into the capacitor\'s electric field or the inductor\'s magnetic field on one half of the cycle and returns to the circuit on the other. The two reactances have names: capacitive reactance X_C = 1 / (2πfC), inductive reactance X_L = 2πfL. We meet both properly in Chapters 1.5 and 1.6; in Chapter 1.3 «reactance» is used only to name the frequency-dependent AC opposition.',
    unit: 'Ohm (Ω)',
    formula: 'X_C = 1 / (2πfC)  •  X_L = 2πfL',
    see: ['capacitor', 'inductor', 'impedance', 'frequency'],
  },
  filter: {
    tip: 'A circuit that lets some frequencies through and blocks others.',
    detail:
      'A filter is a circuit designed to pass certain frequencies while blocking others — the four canonical types are low-pass (passes DC and low frequencies, blocks high), high-pass (opposite), band-pass (passes a band in the middle), and band-stop / notch (blocks a band). Filters are built from the frequency-dependent behaviour of capacitors and inductors (and sometimes resistors, op-amps, crystals). Every radio transmitter and receiver contains filters: to clean up harmonics at the transmitter, to select a single station at the receiver, to remove noise, to split frequency bands. We design filters properly in Chapter 1.8.',
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
      'Rectification turns an alternating signal into a pulsating one-direction signal. Mathematically it is the |V(t)| operation: the negative half of the wave is flipped up, so both halves point the same way. For a pure sine, rectification produces a series of half-cycle humps; the average of that rectified sine is 2/π ≈ 0.637 of the peak — which is what an averaging-type multimeter responds to in its AC mode. Physical rectification is done by diodes inside a power supply; a bridge rectifier uses four diodes to flip both halves of the AC input. The diode itself is introduced in Chapter 1.10; in Chapter 1.3 we use the word «rectified» only to name the |·| operation on a waveform.',
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
    see: ['hf', 'fm'],
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
}
