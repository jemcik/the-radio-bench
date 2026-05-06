/**
 * Chapter 1.9 §6 — comparison gallery of the three transformer-core
 * families a reader will actually encounter at the bench. Each panel
 * is a stylised illustration paired with the family name and its
 * frequency-range / use-case summary.
 *
 * Layout: a CSS grid of three independent SVGs. One column on mobile
 * (stacked), three columns on md+ (the canonical row).
 *
 * The core glyphs are deliberately diagrammatic — a lamination brick
 * for iron, a dark donut for ferrite, a paler donut for powdered iron
 * — not buildable to scale. They give the reader a visual anchor for
 * each family the prose discusses.
 */
import { useTranslation, Trans } from 'react-i18next'

type CoreKind = 'iron' | 'ferrite' | 'powderedIron'

const PANELS: CoreKind[] = ['iron', 'ferrite', 'powderedIron']

const VB_W = 220
const VB_H = 200

const TITLE_Y = 22
const TITLE_FONT = 14
const USE_FONT = 12

// Illustration block — centred horizontally, takes up middle of viewBox
const ILLUS_CX = VB_W / 2
const ILLUS_CY = 100
const USE_Y = VB_H - 18

function IronCore() {
  // Front-view of a laminated E-I transformer (Gemini-designed after
  // three hand-drawn attempts failed visual recognition). Layered
  // build:
  //   1. Faint-fill rectangle = whole iron block silhouette
  //   2. Vertical lamination stripes across the entire block
  //   3. Inner rectangle filled with the page background = the bobbin
  //      «window» (the laminations behind it are occluded, creating
  //      the visual of an E-I frame around a hollow centre)
  //   4. Horizontal coil-turn lines that EXTEND past the bobbin's
  //      left/right edges — each line is one turn of wire wrapping
  //      around the hidden central leg behind the bobbin
  //   5. Crisp outlines drawn last on top of everything
  // The vertical-laminations / horizontal-windings contrast is what
  // keeps iron and coil from visually merging into a picket fence.
  const CORE_W = 120
  const CORE_H = 96
  const CORE_X = ILLUS_CX - CORE_W / 2
  const CORE_Y = ILLUS_CY - CORE_H / 2

  const COIL_W = 72
  const COIL_H = 64
  const COIL_X = ILLUS_CX - COIL_W / 2
  const COIL_Y = ILLUS_CY - COIL_H / 2

  const NUM_LAMINATIONS = 16
  const NUM_WINDINGS = 14

  return (
    <g>
      {/* Layer 1: Core body with faint fill */}
      <rect
        x={CORE_X}
        y={CORE_Y}
        width={CORE_W}
        height={CORE_H}
        rx={4}
        ry={4}
        fill="currentColor"
        opacity={0.15}
      />

      {/* Layer 2: Vertical lamination lines across the whole core */}
      <g stroke="currentColor" strokeWidth={1} opacity={0.4}>
        {Array.from({ length: NUM_LAMINATIONS }).map((_, i) => {
          const x = CORE_X + 4 + (i * (CORE_W - 8)) / (NUM_LAMINATIONS - 1)
          return <line key={i} x1={x} y1={CORE_Y} x2={x} y2={CORE_Y + CORE_H} />
        })}
      </g>

      {/* Layer 3: Coil area cutout. This is drawn on top of the laminations,
          hiding the central parts and creating the E-I frame illusion. */}
      <rect
        x={COIL_X}
        y={COIL_Y}
        width={COIL_W}
        height={COIL_H}
        rx={2}
        ry={2}
        fill="hsl(var(--card))"
      />

      {/* Layer 4: Horizontal coil windings */}
      <g stroke="currentColor" strokeWidth={1.6} fill="none" strokeLinecap="round">
        {Array.from({ length: NUM_WINDINGS }).map((_, i) => {
          const y = COIL_Y + 4 + (i * (COIL_H - 8)) / (NUM_WINDINGS - 1)
          // Lines extend slightly past the cutout to imply wrapping around a central leg
          const x1 = COIL_X - 5
          const x2 = COIL_X + COIL_W + 5
          return <line key={i} x1={x1} y1={y} x2={x2} y2={y} />
        })}
      </g>

      {/* Layer 5: Final outlines, drawn on top for crispness */}
      <rect
        x={COIL_X}
        y={COIL_Y}
        width={COIL_W}
        height={COIL_H}
        rx={2}
        ry={2}
        stroke="currentColor"
        strokeWidth={2}
        fill="none"
      />
      <rect
        x={CORE_X}
        y={CORE_Y}
        width={CORE_W}
        height={CORE_H}
        rx={4}
        ry={4}
        stroke="currentColor"
        strokeWidth={2}
        fill="none"
      />
    </g>
  )
}

function FerriteCore() {
  // Toroidal core — dark ring with a coil wound around it, drawn as
  // an arc-grid going round the donut.
  const R_OUTER = 46
  const R_INNER = 22
  return (
    <g>
      {/* Donut body — outer circle filled, inner circle as a hole */}
      <circle
        cx={ILLUS_CX}
        cy={ILLUS_CY}
        r={R_OUTER}
        stroke="currentColor"
        strokeWidth={2}
        fill="currentColor"
        opacity={0.18}
      />
      <circle
        cx={ILLUS_CX}
        cy={ILLUS_CY}
        r={R_OUTER}
        stroke="currentColor"
        strokeWidth={2}
        fill="none"
      />
      <circle
        cx={ILLUS_CX}
        cy={ILLUS_CY}
        r={R_INNER}
        stroke="currentColor"
        strokeWidth={2}
        fill="hsl(var(--card))"
      />

      {/* Coil winding — a series of short arcs going around the donut.
          Each arc represents one turn of wire crossing over the body. */}
      <g stroke="currentColor" strokeWidth={1.6} fill="none" strokeLinecap="round">
        {Array.from({ length: 18 }).map((_, i) => {
          const angle = (i * 360) / 18
          const rad = (angle * Math.PI) / 180
          const r1 = R_INNER - 6
          const r2 = R_OUTER + 6
          const x1 = ILLUS_CX + Math.cos(rad) * r1
          const y1 = ILLUS_CY + Math.sin(rad) * r1
          const x2 = ILLUS_CX + Math.cos(rad) * r2
          const y2 = ILLUS_CY + Math.sin(rad) * r2
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />
        })}
      </g>
    </g>
  )
}

function PowderedIronCore() {
  // Same toroid shape as ferrite but with a different, paler fill —
  // the «red» of T-50-2 mix is the visual hook radio amateurs use.
  // We render it with a warm CSS variable rather than a literal hex
  // so theme overrides can re-tint if needed.
  const R_OUTER = 46
  const R_INNER = 22
  return (
    <g>
      <circle
        cx={ILLUS_CX}
        cy={ILLUS_CY}
        r={R_OUTER}
        stroke="currentColor"
        strokeWidth={2}
        fill="hsl(var(--callout-experiment))"
        opacity={0.30}
      />
      <circle
        cx={ILLUS_CX}
        cy={ILLUS_CY}
        r={R_OUTER}
        stroke="currentColor"
        strokeWidth={2}
        fill="none"
      />
      <circle
        cx={ILLUS_CX}
        cy={ILLUS_CY}
        r={R_INNER}
        stroke="currentColor"
        strokeWidth={2}
        fill="hsl(var(--card))"
      />

      {/* Coil winding — same as ferrite */}
      <g stroke="currentColor" strokeWidth={1.6} fill="none" strokeLinecap="round">
        {Array.from({ length: 18 }).map((_, i) => {
          const angle = (i * 360) / 18
          const rad = (angle * Math.PI) / 180
          const r1 = R_INNER - 6
          const r2 = R_OUTER + 6
          const x1 = ILLUS_CX + Math.cos(rad) * r1
          const y1 = ILLUS_CY + Math.sin(rad) * r1
          const x2 = ILLUS_CX + Math.cos(rad) * r2
          const y2 = ILLUS_CY + Math.sin(rad) * r2
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />
        })}
      </g>
    </g>
  )
}

const ILLUSTRATIONS: Record<CoreKind, () => React.JSX.Element> = {
  iron: IronCore,
  ferrite: FerriteCore,
  powderedIron: PowderedIronCore,
}

const TITLE_KEYS: Record<CoreKind, string> = {
  iron: 'ch1_9.coresGalleryIron',
  ferrite: 'ch1_9.coresGalleryFerrite',
  powderedIron: 'ch1_9.coresGalleryPowderedIron',
}

const USE_KEYS: Record<CoreKind, string> = {
  iron: 'ch1_9.coresGalleryIronUse',
  ferrite: 'ch1_9.coresGalleryFerriteUse',
  powderedIron: 'ch1_9.coresGalleryPowderedIronUse',
}

export default function CoreFamiliesGallery() {
  const { t } = useTranslation('ui')

  return (
    <figure className="not-prose my-6">
      <div
        className="rounded-xl border border-border bg-card p-4 text-[hsl(var(--sketch-stroke))]"
        aria-label={t('ch1_9.coresGalleryAria')}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {PANELS.map(kind => {
            const Illus = ILLUSTRATIONS[kind]
            return (
              <div
                key={kind}
                className="flex flex-col items-center"
              >
                <svg
                  viewBox={`0 0 ${VB_W} ${VB_H}`}
                  width="100%"
                  fill="none"
                  role="img"
                  className="max-w-[260px]"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Title */}
                  <text
                    x={VB_W / 2}
                    y={TITLE_Y}
                    fontSize={TITLE_FONT}
                    fontWeight={600}
                    textAnchor="middle"
                    fill="currentColor"
                  >
                    {t(TITLE_KEYS[kind])}
                  </text>

                  {/* Illustration */}
                  <Illus />

                  {/* Use-case label below the illustration */}
                  <text
                    x={VB_W / 2}
                    y={USE_Y}
                    fontSize={USE_FONT}
                    textAnchor="middle"
                    fill="currentColor"
                    opacity={0.75}
                  >
                    {t(USE_KEYS[kind])}
                  </text>
                </svg>
              </div>
            )
          })}
        </div>
      </div>

      <figcaption className="text-[13px] text-muted-foreground mt-2 px-1">
        <Trans
          i18nKey="ch1_9.coresGalleryCaption"
          ns="ui"
          components={{ strong: <strong /> }}
        />
      </figcaption>
    </figure>
  )
}
