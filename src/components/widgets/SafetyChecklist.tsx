/**
 * Chapter 4.3 §6 — the pre-operation safety checklist.
 *
 * Every item here is a compressed restatement of something the chapter argued
 * for, in the chapter's own order (shock → mains → stored charge → RF →
 * lightning). Nothing appears in this list that the reader has not been given
 * the mechanism for — a checklist of rules you don't understand is exactly the
 * thing this chapter opens by refusing to be.
 *
 * Ticks persist to localStorage: the reader is meant to walk round the station
 * with this open, and a page reload halfway through should not lose their
 * place.
 */
import { useCallback, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import Widget from '@/components/ui/widget'
import { mathComponents } from '@/lib/trans-defaults'
import { STORAGE_KEYS } from '@/lib/storage-keys'

/** Checklist item keys, grouped by the section that earned them. */
const GROUPS: { titleKey: string; items: string[] }[] = [
  { titleKey: 'checklistGroupPower', items: ['checkPower1', 'checkPower2', 'checkPower3'] },
  { titleKey: 'checklistGroupCharge', items: ['checkCharge1', 'checkCharge2'] },
  { titleKey: 'checklistGroupRf', items: ['checkRf1', 'checkRf2'] },
  { titleKey: 'checklistGroupStorm', items: ['checkStorm1', 'checkStorm2'] },
  { titleKey: 'checklistGroupHabit', items: ['checkHabit1', 'checkHabit2', 'checkHabit3'] },
]

const ALL_ITEMS = GROUPS.flatMap(g => g.items)

function loadTicks(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.safetyChecklist)
    return raw ? (JSON.parse(raw) as Record<string, boolean>) : {}
  } catch {
    // A corrupt or unavailable store must never break the chapter — an
    // un-ticked checklist is a perfectly good fallback.
    return {}
  }
}

export default function SafetyChecklist() {
  const { t } = useTranslation('ui')
  // Lazy initialiser, not an effect: this is a client-rendered SPA, so there is
  // no server pass to diverge from, and reading the store up-front avoids a
  // frame where every box flashes un-ticked.
  const [ticks, setTicks] = useState<Record<string, boolean>>(loadTicks)

  const toggle = useCallback((key: string) => {
    setTicks(prev => {
      const next = { ...prev, [key]: !prev[key] }
      try {
        localStorage.setItem(STORAGE_KEYS.safetyChecklist, JSON.stringify(next))
      } catch {
        // Ignore — a full or blocked store shouldn't stop the tick registering
        // in this session.
      }
      return next
    })
  }, [])

  const done = ALL_ITEMS.filter(k => ticks[k]).length

  return (
    <Widget
      title={t('ch4_3.checklistTitle')}
      description={
        <Trans i18nKey="ch4_3.checklistDescription" ns="ui" components={{ ...mathComponents }} />
      }
    >
      <div className="text-[13px] text-muted-foreground">
        {t('ch4_3.checklistProgress', { done, total: ALL_ITEMS.length })}
      </div>

      <div className="space-y-4">
        {GROUPS.map(g => (
          <div key={g.titleKey}>
            <h4 className="text-[13px] font-semibold text-foreground mb-2">
              {t(`ch4_3.${g.titleKey}`)}
            </h4>
            <ul className="space-y-1.5 not-prose">
              {g.items.map(key => (
                <li key={key} className="flex items-start gap-2.5">
                  <input
                    id={`chk-${key}`}
                    type="checkbox"
                    checked={!!ticks[key]}
                    onChange={() => toggle(key)}
                    className="mt-1 shrink-0 accent-primary"
                  />
                  <label
                    htmlFor={`chk-${key}`}
                    className="text-sm text-foreground cursor-pointer"
                  >
                    <Trans
                      i18nKey={`ch4_3.${key}`}
                      ns="ui"
                      components={{ ...mathComponents, strong: <strong /> }}
                    />
                  </label>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Widget>
  )
}
