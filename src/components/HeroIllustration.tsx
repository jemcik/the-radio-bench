import SVGDiagram from './diagrams/SVGDiagram'
import { useTheme } from '@/context/ThemeContext'
import { THEMES } from '@/lib/themes'

/**
 * Welcome page hero illustration — HF Skywave Propagation.
 *
 * Shows a superheterodyne TX/RX pair communicating via ionospheric skip.
 * Earth rendered with procedural SVG feTurbulence noise (land/ocean).
 * Circuit symbols use ARRL standard notation.
 *
 * Adapts to light/dark themes via the app's theme context.
 */
export default function HeroIllustration() {
  const { theme } = useTheme()
  const isDark = THEMES.find(t => t.id === theme)?.isDark ?? false

  // Theme-adaptive color palette
  const c = isDark
    ? {
        sky: '#353b50',
        legendBg: '#2a3044',
        boxFill: '#12161f',
        starFill: 'white',
        starOpacity: 1,       // base multiplier
        titleFill: '#d4a44a',
        ionoLabelBg: '#15362e',
        ionoLabelText: '#7edcc9',
        antenna: '#d0d0d0',
        wire: '#888',
        mic: '#bbb',
        micText: '#999',
        speaker: '#ccc',
        legendText: '#bbb',
        legendAntenna: '#ccc',
        distanceText: '#e0e2e8',
        distanceOpacity: 0.9,
        multiHopBg: 'none',
        oceanStops: ['#1a5a8a', '#0f4470', '#081e3a'],
      }
    : {
        sky: '#dce4f0',
        legendBg: '#e8ecf4',
        boxFill: '#f5f6f9',
        starFill: '#8090a8',
        starOpacity: 0.6,
        titleFill: '#9a7520',
        ionoLabelBg: '#c8efe8',
        ionoLabelText: '#1a6e5e',
        antenna: '#556',
        wire: '#778',
        mic: '#667',
        micText: '#667',
        speaker: '#556',
        legendText: '#556',
        legendAntenna: '#556',
        distanceText: '#445',
        distanceOpacity: 0.85,
        multiHopBg: 'none',
        oceanStops: ['#3a8ac0', '#2a70a0', '#1a5080'],
      }

  // Accent colors stay the same across themes but slightly adjusted for light
  const tx = isDark ? '#daa030' : '#b08020'
  const rx = isDark ? '#5cc4b0' : '#2a9a82'
  const lc = isDark ? '#5cc4b0' : '#2a9a82'
  const vfoTx = isDark ? '#b88a20' : '#9a7018'
  const vfoRx = isDark ? '#4aaa96' : '#2a8a72'
  const ionoBand = isDark ? '#2d9c8a' : '#60d4be'
  const ionoShimmer = isDark ? '#5cc4b0' : '#80e0cc'

  return (
    <div className="rounded-2xl overflow-hidden border border-border bg-card mt-8 mb-8">
      <SVGDiagram
        width={820}
        height={500}
        aria-label="HF radio propagation: superheterodyne transmitter and receiver communicate via ionospheric skywave multi-hop"
      >
        <defs>
          {/* Station glow halos */}
          <radialGradient id="gTx" cx=".5" cy=".5" r=".5">
            <stop offset="0%" stopColor={tx} stopOpacity={isDark ? '.2' : '.12'} />
            <stop offset="100%" stopColor={tx} stopOpacity="0" />
          </radialGradient>
          <radialGradient id="gRx" cx=".5" cy=".5" r=".5">
            <stop offset="0%" stopColor={rx} stopOpacity={isDark ? '.2' : '.12'} />
            <stop offset="100%" stopColor={rx} stopOpacity="0" />
          </radialGradient>

          {/* Ocean depth gradient */}
          <linearGradient id="oceanGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={c.oceanStops[0]} />
            <stop offset="30%" stopColor={c.oceanStops[1]} />
            <stop offset="100%" stopColor={c.oceanStops[2]} />
          </linearGradient>

          {/* Fractal noise → land texture (coarse continents) */}
          <filter id="landNoise" x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
            <feTurbulence type="fractalNoise" baseFrequency="0.008 0.012" numOctaves={4} seed={42} result="noise" />
            <feComponentTransfer in="noise" result="thresh">
              <feFuncR type="discrete" tableValues="0 0 0 0 0 1 1 1 1 1" />
              <feFuncG type="discrete" tableValues="0 0 0 0 0 1 1 1 1 1" />
              <feFuncB type="discrete" tableValues="0 0 0 0 0 1 1 1 1 1" />
            </feComponentTransfer>
            <feColorMatrix
              in="thresh"
              type="matrix"
              values={isDark
                ? `0   0   0   0  0.11
                   0.4 0.1 0   0  0.28
                   0   0   0   0  0.08
                   0.8 0   0   0  0`
                : `0   0   0   0  0.15
                   0.5 0.15 0  0  0.35
                   0   0   0   0  0.1
                   0.85 0  0   0  0`
              }
            />
          </filter>

          {/* Finer terrain detail overlay */}
          <filter id="terrainDetail" x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
            <feTurbulence type="fractalNoise" baseFrequency="0.025 0.035" numOctaves={5} seed={77} result="fine" />
            <feComponentTransfer in="fine" result="fineThresh">
              <feFuncR type="discrete" tableValues="0 0 0 0.3 0.5 0.7 1 1" />
              <feFuncG type="discrete" tableValues="0 0 0 0.3 0.5 0.7 1 1" />
              <feFuncB type="discrete" tableValues="0 0 0 0.3 0.5 0.7 1 1" />
            </feComponentTransfer>
            <feColorMatrix
              in="fineThresh"
              type="matrix"
              values={isDark
                ? `0   0   0   0  0.06
                   0.3 0.1 0   0  0.22
                   0   0   0   0  0.04
                   0.6 0   0   0  0`
                : `0   0   0   0  0.08
                   0.35 0.12 0  0  0.28
                   0   0   0   0  0.05
                   0.65 0  0   0  0`
              }
            />
          </filter>

          {/* Ocean surface texture (subtle ripple) */}
          <filter id="oceanTexture" x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
            <feTurbulence type="fractalNoise" baseFrequency="0.04 0.02" numOctaves={3} seed={99} result="water" />
            <feColorMatrix
              in="water"
              type="matrix"
              values={isDark
                ? `0   0   0   0  0.06
                   0   0   0   0  0.15
                   0.3 0.1 0   0  0.35
                   0.15 0  0   0  0`
                : `0   0   0   0  0.08
                   0   0   0   0  0.2
                   0.35 0.12 0  0  0.45
                   0.18 0  0   0  0`
              }
            />
          </filter>

          {/* Cloud wisps */}
          <filter id="clouds" x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
            <feTurbulence type="fractalNoise" baseFrequency="0.012 0.006" numOctaves={3} seed={31} result="cloud" />
            <feComponentTransfer in="cloud" result="cloudThresh">
              <feFuncR type="discrete" tableValues="0 0 0 0 0 0 0 0 1 1" />
              <feFuncG type="discrete" tableValues="0 0 0 0 0 0 0 0 1 1" />
              <feFuncB type="discrete" tableValues="0 0 0 0 0 0 0 0 1 1" />
            </feComponentTransfer>
            <feColorMatrix
              in="cloudThresh"
              type="matrix"
              values={`0   0   0   0  1
                       0   0   0   0  1
                       0   0   0   0  1
                       ${isDark ? '0.12' : '0.18'} 0  0   0  0`}
            />
          </filter>

          {/* Atmospheric glow at horizon */}
          <linearGradient id="atmosGlow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4db8d4" stopOpacity={isDark ? '.2' : '.3'} />
            <stop offset="50%" stopColor="#2a8ab0" stopOpacity={isDark ? '.08' : '.12'} />
            <stop offset="100%" stopColor="#1a5a8a" stopOpacity="0" />
          </linearGradient>

          {/* Earth clip path — strong curvature (bow≈80) */}
          <clipPath id="earthClip">
            <path d="M-10 280 Q 410 200 830 280 L830 500 L-10 500Z" />
          </clipPath>

          {/* Atmosphere haze clip (slightly above earth) */}
          <clipPath id="atmosClip">
            <path d="M-10 264 Q 410 184 830 264 L830 300 Q 410 220 -10 300Z" />
          </clipPath>
        </defs>

        {/* ── Keyframe animations ── */}
        <style>{`
          @keyframes ray {
            0%   { stroke-dashoffset: 1200; opacity: 0; }
            6%   { opacity: .95; }
            80%  { opacity: .85; }
            100% { stroke-dashoffset: 0; opacity: 0; }
          }
          @keyframes blink {
            0%, 100% { opacity: .45; }
            50%      { opacity: 1; }
          }
        `}</style>

        {/* ── SKY ── */}
        <rect width="820" height="500" fill={c.sky} />

        {/* Stars */}
        <g fill={c.starFill} opacity={c.starOpacity}>
          <circle cx={48} cy={16} r={0.8} opacity={0.1} />
          <circle cx={140} cy={9} r={0.7} opacity={0.14} />
          <circle cx={270} cy={32} r={0.8} opacity={0.1} />
          <circle cx={400} cy={12} r={0.9} opacity={0.14} />
          <circle cx={540} cy={26} r={0.7} opacity={0.1} />
          <circle cx={680} cy={14} r={0.8} opacity={0.14} />
          <circle cx={780} cy={30} r={0.7} opacity={0.1} />
          <circle cx={90} cy={46} r={0.8} opacity={0.12} />
          <circle cx={350} cy={44} r={0.7} opacity={0.1} />
          <circle cx={600} cy={40} r={0.9} opacity={0.12} />
          <circle cx={200} cy={22} r={0.6} opacity={0.08} />
          <circle cx={470} cy={37} r={0.7} opacity={0.1} />
          <circle cx={740} cy={42} r={0.8} opacity={0.09} />
          <circle cx={30} cy={34} r={0.6} opacity={0.11} />
          <circle cx={810} cy={11} r={0.7} opacity={0.08} />
          <circle cx={160} cy={40} r={0.5} opacity={0.07} />
          <circle cx={320} cy={18} r={0.6} opacity={0.09} />
          <circle cx={510} cy={8} r={0.7} opacity={0.11} />
          <circle cx={630} cy={30} r={0.5} opacity={0.08} />
          <circle cx={760} cy={20} r={0.6} opacity={0.1} />
        </g>

        {/* Title */}
        <text
          x={410} y={36}
          textAnchor="middle" fontSize={16} fill={c.titleFill}
          letterSpacing={3} fontWeight={700} opacity={0.85}
        >
          HIGH FREQUENCY SKYWAVE PROPAGATION
        </text>

        {/* ── Ionosphere band (curved to match earth) ── */}
        <path d="M-10 72 Q 410 40 830 72 L830 98 Q 410 66 -10 98 Z" fill={ionoBand} opacity={isDark ? 0.18 : 0.3}>
          <animate attributeName="opacity" values={isDark ? '.14;.26;.14' : '.25;.4;.25'} dur="5s" repeatCount="indefinite" />
        </path>
        <path d="M-10 82 Q 410 52 830 82 L830 90 Q 410 60 -10 90 Z" fill={ionoShimmer} opacity={isDark ? 0.1 : 0.15} />
        {/* Ionosphere label */}
        <rect x={340} y={59} width={140} height={20} rx={10} fill={c.ionoLabelBg} opacity={0.85} />
        <text
          x={410} y={69}
          dominantBaseline="central"
          textAnchor="middle" fontSize={11.5} fontWeight={600}
          fill={c.ionoLabelText} letterSpacing={1}
        >
          IONOSPHERE
        </text>

        {/* ════════════════════════════════════════════════
            EARTH — Procedural texture layers
            ════════════════════════════════════════════════ */}

        {/* Layer 1: Deep ocean base */}
        <path d="M-10 280 Q 410 200 830 280 L830 500 L-10 500Z" fill="url(#oceanGrad)" />

        {/* Layer 2: Ocean surface texture */}
        <g clipPath="url(#earthClip)">
          <rect x={0} y={180} width={820} height={320} filter="url(#oceanTexture)" opacity={0.7} />
        </g>

        {/* Layer 3: Land masses (fractal noise → thresholded green) */}
        <g clipPath="url(#earthClip)">
          <rect x={0} y={180} width={820} height={320} filter="url(#landNoise)" opacity={0.95} />
        </g>

        {/* Layer 4: Finer terrain detail */}
        <g clipPath="url(#earthClip)">
          <rect x={0} y={180} width={820} height={320} filter="url(#terrainDetail)" opacity={0.4} />
        </g>

        {/* Layer 5: Cloud wisps */}
        <g clipPath="url(#earthClip)">
          <rect x={0} y={180} width={820} height={320} filter="url(#clouds)" />
        </g>

        {/* Layer 6: Atmospheric haze band at horizon */}
        <g clipPath="url(#atmosClip)">
          <rect x={0} y={170} width={820} height={140} fill="url(#atmosGlow)" />
        </g>

        {/* Horizon highlight line */}
        <path d="M-10 280 Q 410 200 830 280" fill="none" stroke="#4db8d4" strokeWidth={1.5} opacity={isDark ? 0.3 : 0.4} />
        <path d="M-10 280 Q 410 200 830 280" fill="none" stroke="#8ad4e8" strokeWidth={0.6} opacity={isDark ? 0.25 : 0.35} />

        {/* ── Station glow halos ── */}
        <circle cx={148} cy={242} r={90} fill="url(#gTx)" />
        <circle cx={672} cy={242} r={90} fill="url(#gRx)" />

        {/* ── SIGNAL RAYS ── */}
        {/* Single hop */}
        <polyline
          points="148,188 410,84 672,188"
          fill="none" stroke={tx} strokeWidth={3}
          strokeLinecap="round" strokeLinejoin="round"
          strokeDasharray="1200" strokeDashoffset="1200"
          style={{ animation: 'ray 3.2s ease-in-out 0s infinite' }}
        />
        {/* Two hops */}
        <polyline
          points="148,188 278,84 410,268 542,84 672,188"
          fill="none" stroke={tx} strokeWidth={2.2}
          strokeLinecap="round" strokeLinejoin="round"
          strokeDasharray="1200" strokeDashoffset="1200"
          style={{ animation: 'ray 3.2s ease-in-out 1.1s infinite' }}
        />
        {/* Three hops */}
        <polyline
          points="148,188 235,84 322,260 410,80 498,260 585,84 672,188"
          fill="none" stroke={tx} strokeWidth={1.5}
          strokeLinecap="round" strokeLinejoin="round"
          strokeDasharray="1200" strokeDashoffset="1200"
          style={{ animation: 'ray 3.2s ease-in-out 2.1s infinite' }}
        />

        {/* Ground bounce glows */}
        <circle cx={410} cy={268} r={5} fill={tx} opacity={0.12} />
        <circle cx={322} cy={260} r={4} fill={tx} opacity={0.08} />
        <circle cx={498} cy={260} r={4} fill={tx} opacity={0.08} />

        {/* ════════════════════════════════════════════════
            TX STATION
            ════════════════════════════════════════════════ */}
        {/* Antenna */}
        <g stroke={c.antenna} strokeWidth={1.5} strokeLinecap="round">
          <line x1={148} y1={216} x2={148} y2={188} />
          <line x1={148} y1={188} x2={131} y2={170} />
          <line x1={148} y1={188} x2={165} y2={170} />
        </g>
        <circle cx={148} cy={188} r={4.5} fill={tx}>
          <animate attributeName="opacity" values=".4;1;.4" dur="1.4s" repeatCount="indefinite" />
        </circle>

        {/* TX schematic box */}
        <rect x={71} y={220} width={154} height={64} rx={8} fill={c.boxFill} stroke={tx} strokeWidth={1.3} />

        {/* MIC */}
        <circle cx={85} cy={256} r={5.5} fill="none" stroke={c.mic} strokeWidth={0.9} opacity={0.5} />
        <text x={85} y={270} textAnchor="middle" fontSize={5.5} fill={c.micText} opacity={0.5}>MIC</text>

        {/* AF amp */}
        <line x1={91} y1={256} x2={99} y2={256} stroke={c.wire} strokeWidth={0.8} />
        <polygon points="101,250 101,262 113,256" fill="none" stroke={tx} strokeWidth={1.2} />
        <text x={107} y={272} textAnchor="middle" fontSize={5.5} fill={tx} opacity={0.6}>AF</text>

        {/* Mixer */}
        <line x1={113} y1={256} x2={121} y2={256} stroke={c.wire} strokeWidth={0.8} />
        <circle cx={131} cy={256} r={7.5} fill="none" stroke={tx} strokeWidth={1.2} />
        <line x1={126} y1={251} x2={136} y2={261} stroke={tx} strokeWidth={1} />
        <line x1={136} y1={251} x2={126} y2={261} stroke={tx} strokeWidth={1} />
        <text x={131} y={274} textAnchor="middle" fontSize={5.5} fill={tx} opacity={0.6}>MIX</text>

        {/* VFO */}
        <line x1={131} y1={264} x2={131} y2={276} stroke={c.wire} strokeWidth={0.6} strokeDasharray="2 1.5" />
        <path
          d="M 123 277 C 126 272 130 272 133 277 C 136 282 140 282 143 277"
          fill="none" stroke={vfoTx} strokeWidth={1} strokeLinecap="round" opacity={0.6}
        />

        {/* LC filter: inductor then capacitor */}
        <line x1={139} y1={256} x2={145} y2={256} stroke={c.wire} strokeWidth={0.8} />
        <path
          d="M 145 256 a 2.8 3.8 0 0 0 5.5 0 a 2.8 3.8 0 0 0 5.5 0"
          fill="none" stroke={lc} strokeWidth={1.2} strokeLinecap="round"
        />
        <line x1={156} y1={256} x2={161} y2={256} stroke={c.wire} strokeWidth={0.8} />
        <line x1={161} y1={249} x2={161} y2={263} stroke={lc} strokeWidth={1} />
        <line x1={165} y1={249} x2={165} y2={263} stroke={lc} strokeWidth={1} />
        <line x1={165} y1={256} x2={171} y2={256} stroke={c.wire} strokeWidth={0.8} />

        {/* PA */}
        <polygon points="173,250 173,262 187,256" fill="none" stroke={tx} strokeWidth={1.3} />
        <text x={180} y={272} textAnchor="middle" fontSize={5.5} fill={tx} opacity={0.7}>PA</text>

        {/* Wire from PA up to antenna mast */}
        <line x1={187} y1={256} x2={201} y2={256} stroke={c.wire} strokeWidth={0.7} />
        <line x1={201} y1={256} x2={201} y2={226} stroke={c.wire} strokeWidth={0.7} />
        <line x1={201} y1={226} x2={148} y2={226} stroke={c.wire} strokeWidth={0.7} />
        <line x1={148} y1={226} x2={148} y2={220} stroke={c.wire} strokeWidth={0.7} />

        {/* TX label with pill background */}
        <rect x={128} y={290} width={40} height={20} rx={10} fill={c.boxFill} opacity={isDark ? 0 : 0.7} />
        <text
          x={148} y={304}
          textAnchor="middle" fontSize={14} fontWeight={700}
          fill={tx} letterSpacing={2}
        >
          TX
        </text>

        {/* ════════════════════════════════════════════════
            RX STATION
            ════════════════════════════════════════════════ */}
        {/* Antenna */}
        <g stroke={c.antenna} strokeWidth={1.5} strokeLinecap="round">
          <line x1={672} y1={216} x2={672} y2={188} />
          <line x1={672} y1={188} x2={655} y2={170} />
          <line x1={672} y1={188} x2={689} y2={170} />
        </g>
        <circle cx={672} cy={188} r={4.5} fill={rx}>
          <animate attributeName="opacity" values=".4;1;.4" dur="1.4s" begin=".7s" repeatCount="indefinite" />
        </circle>

        <rect x={595} y={220} width={154} height={64} rx={8} fill={c.boxFill} stroke={rx} strokeWidth={1.3} />

        {/* Wire from antenna down to RF amp */}
        <line x1={672} y1={220} x2={672} y2={226} stroke={c.wire} strokeWidth={0.7} />
        <line x1={672} y1={226} x2={605} y2={226} stroke={c.wire} strokeWidth={0.7} />
        <line x1={605} y1={226} x2={605} y2={256} stroke={c.wire} strokeWidth={0.7} />
        <line x1={605} y1={256} x2={609} y2={256} stroke={c.wire} strokeWidth={0.7} />
        {/* RF amp */}
        <polygon points="609,250 609,262 623,256" fill="none" stroke={rx} strokeWidth={1.2} />
        <text x={615} y={272} textAnchor="middle" fontSize={5.5} fill={rx} opacity={0.6}>RF</text>

        {/* Mixer */}
        <line x1={623} y1={256} x2={631} y2={256} stroke={c.wire} strokeWidth={0.8} />
        <circle cx={641} cy={256} r={7.5} fill="none" stroke={rx} strokeWidth={1.2} />
        <line x1={636} y1={251} x2={646} y2={261} stroke={rx} strokeWidth={1} />
        <line x1={646} y1={251} x2={636} y2={261} stroke={rx} strokeWidth={1} />
        <text x={641} y={274} textAnchor="middle" fontSize={5.5} fill={rx} opacity={0.6}>MIX</text>

        {/* VFO */}
        <line x1={641} y1={264} x2={641} y2={276} stroke={c.wire} strokeWidth={0.6} strokeDasharray="2 1.5" />
        <path
          d="M 633 277 C 636 272 640 272 643 277 C 646 282 650 282 653 277"
          fill="none" stroke={vfoRx} strokeWidth={1} strokeLinecap="round" opacity={0.6}
        />

        {/* IF filter: inductor then capacitor */}
        <line x1={649} y1={256} x2={655} y2={256} stroke={c.wire} strokeWidth={0.8} />
        <path
          d="M 655 256 a 2.8 3.8 0 0 0 5.5 0 a 2.8 3.8 0 0 0 5.5 0"
          fill="none" stroke={lc} strokeWidth={1.2} strokeLinecap="round"
        />
        <line x1={666} y1={256} x2={671} y2={256} stroke={c.wire} strokeWidth={0.8} />
        <line x1={671} y1={249} x2={671} y2={263} stroke={lc} strokeWidth={1} />
        <line x1={675} y1={249} x2={675} y2={263} stroke={lc} strokeWidth={1} />
        <line x1={675} y1={256} x2={681} y2={256} stroke={c.wire} strokeWidth={0.8} />

        {/* AF amp */}
        <polygon points="683,250 683,262 697,256" fill="none" stroke={rx} strokeWidth={1.2} />
        <text x={690} y={272} textAnchor="middle" fontSize={5.5} fill={rx} opacity={0.6}>AF</text>

        {/* Speaker */}
        <line x1={697} y1={256} x2={707} y2={256} stroke={c.wire} strokeWidth={0.8} />
        <polygon points="709,251 709,261 715,264 715,248" fill="none" stroke={c.speaker} strokeWidth={0.8} opacity={0.5} />
        <line x1={715} y1={248} x2={721} y2={244} stroke={c.speaker} strokeWidth={0.6} opacity={0.3} />
        <line x1={715} y1={264} x2={721} y2={268} stroke={c.speaker} strokeWidth={0.6} opacity={0.3} />

        {/* RX label with pill background */}
        <rect x={652} y={290} width={40} height={20} rx={10} fill={c.boxFill} opacity={isDark ? 0 : 0.7} />
        <text
          x={672} y={304}
          textAnchor="middle" fontSize={14} fontWeight={700}
          fill={rx} letterSpacing={2}
        >
          RX
        </text>

        {/* Distance label with pill background */}
        <rect x={290} y={315} width={240} height={22} rx={11} fill={c.boxFill} opacity={isDark ? 0 : 0.7} />
        <text
          x={410} y={331}
          textAnchor="middle" fontSize={13}
          fill={c.distanceText} opacity={c.distanceOpacity} letterSpacing={1.5}
        >
          worldwide via multi-hop
        </text>

        {/* ════════════════════════════════════════════════
            LEGEND
            ════════════════════════════════════════════════ */}
        <rect x={0} y={418} width={820} height={82} fill={c.legendBg} opacity={0.95} />

        {/* Row 1: Diagram elements */}
        <g transform="translate(30,440)">
          <line x1={0} y1={0} x2={22} y2={0} stroke={tx} strokeWidth={2.5} strokeLinecap="round" />
          <text x={30} y={4} fontSize={10.5} fill={c.legendText}>Signal path</text>

          <rect x={128} y={-5} width={26} height={10} rx={5} fill={ionoBand} opacity={0.45} />
          <text x={162} y={4} fontSize={10.5} fill={c.legendText}>Ionosphere</text>

          <g transform="translate(264,0)" stroke={c.legendAntenna} strokeWidth={1.3}>
            <line x1={0} y1={7} x2={0} y2={-2} />
            <line x1={0} y1={-2} x2={-7} y2={-10} />
            <line x1={0} y1={-2} x2={7} y2={-10} />
          </g>
          <text x={280} y={4} fontSize={10.5} fill={c.legendText}>Antenna</text>

          {/* TX: mini schematic box with amber accent */}
          <rect x={358} y={-8} width={30} height={16} rx={3} fill={c.boxFill} stroke={tx} strokeWidth={0.9} />
          <polygon points="363,-2 363,4 369,1" fill="none" stroke={tx} strokeWidth={0.8} />
          <circle cx={376} cy={1} r={3} fill="none" stroke={tx} strokeWidth={0.7} />
          <line x1={374} y1={-1} x2={378} y2={3} stroke={tx} strokeWidth={0.5} />
          <line x1={378} y1={-1} x2={374} y2={3} stroke={tx} strokeWidth={0.5} />
          <text x={396} y={4} fontSize={10.5} fill={c.legendText}>TX (transmitter)</text>

          {/* RX: mini schematic box with teal accent */}
          <rect x={528} y={-8} width={30} height={16} rx={3} fill={c.boxFill} stroke={rx} strokeWidth={0.9} />
          <polygon points="533,-2 533,4 539,1" fill="none" stroke={rx} strokeWidth={0.8} />
          <circle cx={546} cy={1} r={3} fill="none" stroke={rx} strokeWidth={0.7} />
          <line x1={544} y1={-1} x2={548} y2={3} stroke={rx} strokeWidth={0.5} />
          <line x1={548} y1={-1} x2={544} y2={3} stroke={rx} strokeWidth={0.5} />
          <text x={566} y={4} fontSize={10.5} fill={c.legendText}>RX (receiver)</text>
        </g>

        {/* Row 2: Circuit symbols */}
        <g transform="translate(30,468)">
          <path
            d="M 0 0 a 2.5 3.5 0 0 0 5 0 a 2.5 3.5 0 0 0 5 0 a 2.5 3.5 0 0 0 5 0 a 2.5 3.5 0 0 0 5 0"
            fill="none" stroke={lc} strokeWidth={1.3} strokeLinecap="round"
          />
          <text x={28} y={3} fontSize={10.5} fill={c.legendText}>Inductor</text>

          <g transform="translate(112,0)">
            <line x1={-2} y1={-6} x2={-2} y2={6} stroke={lc} strokeWidth={1.1} />
            <line x1={2} y1={-6} x2={2} y2={6} stroke={lc} strokeWidth={1.1} />
          </g>
          <text x={122} y={3} fontSize={10.5} fill={c.legendText}>Capacitor</text>

          <polyline
            points="216,0 219,-5 225,5 231,-5 237,5 240,0"
            fill="none" stroke={tx} strokeWidth={1.2} strokeLinecap="round" strokeLinejoin="round"
          />
          <text x={248} y={3} fontSize={10.5} fill={c.legendText}>Resistor</text>

          <polygon points="332,-5 332,5 344,0" fill="none" stroke={tx} strokeWidth={1.1} />
          <text x={352} y={3} fontSize={10.5} fill={c.legendText}>Amplifier</text>

          <circle cx={432} cy={0} r={6} fill="none" stroke={tx} strokeWidth={1.1} />
          <line x1={428} y1={-4} x2={436} y2={4} stroke={tx} strokeWidth={0.9} />
          <line x1={436} y1={-4} x2={428} y2={4} stroke={tx} strokeWidth={0.9} />
          <text x={446} y={3} fontSize={10.5} fill={c.legendText}>Mixer</text>

          <path
            d="M 510,0 C 514,-7 520,-7 524,0 C 528,7 534,7 538,0"
            fill="none" stroke={vfoTx} strokeWidth={1.4} strokeLinecap="round"
          />
          <text x={546} y={3} fontSize={10.5} fill={c.legendText}>Oscillator</text>
        </g>
      </SVGDiagram>

      <div className="px-6 pt-4 pb-4 text-center text-sm leading-relaxed text-muted-foreground border-t border-border">
        <p>
          This is a <strong className="text-foreground font-medium">superheterodyne radio link</strong> — the same architecture used in most real transceivers.
          Each symbol in the TX and RX boxes represents a real circuit stage: amplifiers, mixers, filters, and oscillators.
        </p>
        <p className="mt-2 italic opacity-80">
          Keep learning — by the end of this guide, every part of this diagram will make complete sense!
        </p>
      </div>
    </div>
  )
}
