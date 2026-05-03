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
  // Stylised E-I lamination block: outer rectangle with horizontal
  // stripes hinting at the laminations, plus a coil winding on a
  // central leg.
  const W = 130
  const H = 80
  const x0 = ILLUS_CX - W / 2
  const y0 = ILLUS_CY - H / 2
  const stripes = 5

  return (
    <g stroke="currentColor" strokeWidth={2} fill="none" strokeLinecap="round">
      {/* Outer brick */}
      <rect x={x0} y={y0} width={W} height={H} rx={3} />

      {/* Lamination stripes */}
      <g opacity={0.45}>
        {Array.from({ length: stripes }).map((_, i) => (
          <line
            key={i}
            x1={x0 + 4}
            y1={y0 + (H * (i + 1)) / (stripes + 1)}
            x2={x0 + W - 4}
            y2={y0 + (H * (i + 1)) / (stripes + 1)}
          />
        ))}
      </g>

      {/* Central window — implies the E-I shape: an inner cutout where
          the windings would sit on the centre leg */}
      <rect
        x={x0 + 30}
        y={y0 + 16}
        width={W - 60}
        height={H - 32}
        fill="hsl(var(--card))"
        opacity={0.7}
      />

      {/* Coil winding around the central leg — drawn as a stack of
          horizontal bumps inside the inner window */}
      <g strokeWidth={1.6}>
        {Array.from({ length: 4 }).map((_, i) => {
          const cy = y0 + 24 + i * 12
          return (
            <path
              key={i}
              d={`M ${x0 + 38} ${cy} a 6 4 0 0 1 ${W - 76} 0`}
              fill="none"
            />
          )
        })}
      </g>
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
