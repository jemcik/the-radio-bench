import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'

/**
 * Figure wrapper shared by every diagram on the site.
 *
 * Replaces the repeated
 *   <figure className="my-8 not-prose">
 *     <div className="rounded-xl border border-border bg-muted/40 p-4 overflow-x-auto">
 *       {children}
 *     </div>
 *     {caption && <figcaption … />}
 *   </figure>
 * block that appeared once per diagram file. Keep the box shape in a
 * single place so diagram padding/border/rounded corners stay visually
 * consistent across chapters.
 */

interface DiagramFigureProps {
  /** Caption rendered below the diagram box. */
  caption?: ReactNode
  /** Optional extra classes on the outer <figure>. */
  className?: string
  children: ReactNode
}

export default function DiagramFigure({ caption, className, children }: DiagramFigureProps) {
  return (
    <figure className={cn('my-8 not-prose', className)}>
      <div className="rounded-xl border border-border bg-muted/40 p-4 overflow-x-auto">
        {children}
      </div>
      {caption && (
        <figcaption className="mt-2 text-center text-[13px] text-muted-foreground">
          {caption}
        </figcaption>
      )}
    </figure>
  )
}
