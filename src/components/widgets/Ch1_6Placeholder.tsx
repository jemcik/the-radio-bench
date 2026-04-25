// Shared placeholder used by ch1.6 widgets/diagrams that haven't been
// built yet. Renders an obvious "[ component ]" block so the prose
// flow can be reviewed without the visuals being mistaken for content.
// Will be removed as each real widget/diagram lands.

interface Props {
  label: string
}

export default function Ch1_6Placeholder({ label }: Props) {
  return (
    <div className="not-prose my-6 rounded-md border-2 border-dashed border-amber-400/60 bg-amber-50/30 dark:bg-amber-950/20 p-6 text-center">
      <span className="font-mono text-sm text-amber-700 dark:text-amber-400">
        [ {label} ]
      </span>
      <div className="text-xs text-muted-foreground/70 mt-1">
        placeholder — visual lands in Phase B/C
      </div>
    </div>
  )
}
