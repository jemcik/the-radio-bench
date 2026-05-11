/**
 * Chapter 1.11 §1 — transistor symbol panel.
 *
 * Four-cell grid showing the four common transistor schematic symbols
 * side by side: NPN, PNP, n-channel enhancement MOSFET, p-channel
 * enhancement MOSFET. Each cell carries a small italic caption naming
 * the polarity. Reader's first encounter with the symbol family — the
 * goal is recognition, not memorisation.
 *
 * Pure `@/lib/circuit` primitives; reuses the same TransistorNPN /
 * TransistorPNP / TransistorNMOS / TransistorPMOS bodies that schematic
 * diagrams later in the chapter compose into circuits.
 */
import { Trans } from 'react-i18next'
import {
  TransistorNPN,
  TransistorPNP,
  TransistorNMOS,
  TransistorPMOS,
} from '@/lib/circuit/symbols/semiconductors'
import SVGDiagram from '@/components/diagrams/SVGDiagram'
import { G } from '@/features/glossary/glossary-term'

const CELL_W = 140
const CELL_H = 130
const PANEL_W = CELL_W * 4
const PANEL_H = CELL_H

const CY = 50
const CX = (col: number) => CELL_W * col + CELL_W / 2
const LABEL_Y = CELL_H - 14

export default function TransistorSymbolPanel() {
  return (
    <figure className="not-prose mx-auto max-w-[640px]">
      <div className="rounded-xl border border-border bg-card overflow-hidden p-4 text-[hsl(var(--sketch-stroke))]">
        <SVGDiagram width={PANEL_W} height={PANEL_H}>
          <TransistorNPN x={CX(0)} y={CY} />
          <TransistorPNP x={CX(1)} y={CY} />
          <TransistorNMOS x={CX(2)} y={CY} />
          <TransistorPMOS x={CX(3)} y={CY} />

          <text x={CX(0)} y={LABEL_Y} fontSize={13} fontStyle="italic" textAnchor="middle" fill="currentColor" opacity="0.85" fontFamily="Georgia, serif">
            NPN
          </text>
          <text x={CX(1)} y={LABEL_Y} fontSize={13} fontStyle="italic" textAnchor="middle" fill="currentColor" opacity="0.85" fontFamily="Georgia, serif">
            PNP
          </text>
          <text x={CX(2)} y={LABEL_Y} fontSize={13} fontStyle="italic" textAnchor="middle" fill="currentColor" opacity="0.85" fontFamily="Georgia, serif">
            n-channel MOSFET
          </text>
          <text x={CX(3)} y={LABEL_Y} fontSize={13} fontStyle="italic" textAnchor="middle" fill="currentColor" opacity="0.85" fontFamily="Georgia, serif">
            p-channel MOSFET
          </text>
        </SVGDiagram>
        <figcaption className="mt-3 text-sm text-muted-foreground italic leading-relaxed">
          <Trans
            i18nKey="ch1_11.familiesSymbolPanelCaption"
            ns="ui"
            components={{ strong: <strong />, enh: <G k="enhancement mode" /> }}
          />
        </figcaption>
      </div>
    </figure>
  )
}
