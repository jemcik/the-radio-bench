import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FlaskConical, ChevronDown, Zap, Wrench, ListOrdered, Eye, Link2, AlertTriangle } from 'lucide-react'
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

export interface LabStep {
  text: React.ReactNode
  note?: React.ReactNode
}

export interface LabActivityProps {
  label?: string
  goal: React.ReactNode
  equipment: React.ReactNode[]
  components?: React.ReactNode[]
  procedure: LabStep[]
  expectedResult: React.ReactNode
  connectionToTheory: React.ReactNode
  troubleshooting?: React.ReactNode[]
}

function Section({ icon: Icon, title, children }: {
  icon: React.ElementType
  title: string
  children: React.ReactNode
}) {
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-2">
        <Icon className="w-3.5 h-3.5 text-teal-500" />
        <span className="text-xs font-semibold uppercase tracking-wider text-teal-600 dark:text-teal-500">
          {title}
        </span>
      </div>
      {children}
    </div>
  )
}

export default function LabActivity({
  label, goal, equipment, components, procedure,
  expectedResult, connectionToTheory, troubleshooting,
}: LabActivityProps) {
  const { t } = useTranslation('ui')
  const [open, setOpen] = useState(true)
  const title = label ? `${t('lab.title')} ${label}` : t('lab.title')

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="my-8">
      <div className={cn(
        'rounded-xl border transition-colors overflow-hidden',
        open
          ? 'border-teal-500/40 bg-teal-500/5'
          : 'border-border bg-card hover:border-teal-500/30 hover:bg-teal-500/3'
      )}>
        {/* Trigger */}
        <CollapsibleTrigger className="flex items-center gap-3 w-full px-5 py-4 text-left">
          <div className="shrink-0 w-9 h-9 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center">
            <FlaskConical className="w-4 h-4 text-teal-500" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <Badge variant="lab" className="text-[10px]">{t('lab.optional')}</Badge>
              <span className="text-sm font-semibold text-foreground">{title}</span>
            </div>
            <p className="text-sm text-muted-foreground truncate">{goal}</p>
          </div>
          <ChevronDown className={cn(
            'w-4 h-4 text-muted-foreground transition-transform shrink-0',
            open && 'rotate-180'
          )} />
        </CollapsibleTrigger>

        {/* Body */}
        <CollapsibleContent>
          <Separator className="opacity-50" />
          <div className="px-5 py-5 space-y-5">

            {/* Equipment + Components */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Section icon={Wrench} title={t('lab.equipment')}>
                <ul className="space-y-1.5">
                  {equipment.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-card-foreground">
                      <span className="text-teal-500 shrink-0 mt-0.5">›</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </Section>

              {components && components.length > 0 && (
                <Section icon={Zap} title={t('lab.components')}>
                  <ul className="space-y-1.5">
                    {components.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-card-foreground">
                        <span className="text-teal-500 shrink-0 mt-0.5">›</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </Section>
              )}
            </div>

            <Separator className="opacity-30" />

            {/* Procedure */}
            <Section icon={ListOrdered} title={t('lab.procedure')}>
              <ol className="space-y-3">
                {procedure.map((step, i) => (
                  <li key={i} className="flex gap-3 text-sm">
                    <span className="font-mono text-teal-500 font-bold shrink-0 w-5 text-right mt-0.5">
                      {i + 1}.
                    </span>
                    <div>
                      <span className="text-card-foreground">{step.text}</span>
                      {step.note && (
                        <p className="text-muted-foreground italic text-xs mt-1">{step.note}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            </Section>

            <Separator className="opacity-30" />

            {/* Expected result + Connection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card surface="muted" radius="lg" className="p-4">
                <Section icon={Eye} title={t('lab.expectedResult')}>
                  <p className="text-sm text-card-foreground">{expectedResult}</p>
                </Section>
              </Card>

              <Card surface="teal" radius="lg" className="p-4">
                <Section icon={Link2} title={t('lab.connectionToTheory')}>
                  <p className="text-sm text-teal-700 dark:text-teal-300">{connectionToTheory}</p>
                </Section>
              </Card>
            </div>

            {/* Troubleshooting */}
            {troubleshooting && troubleshooting.length > 0 && (
              <Section icon={AlertTriangle} title={t('lab.troubleshooting')}>
                <ul className="space-y-1.5">
                  {troubleshooting.map((tip, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="text-primary shrink-0 mt-0.5">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </Section>
            )}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  )
}
