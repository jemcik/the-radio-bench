import { useTranslation } from 'react-i18next'
import { SI_PREFIXES } from '@/features/si/prefixes'

/**
 * Chapter 0.3 — "Powers of 10 you'll use most often" reference table.
 *
 * Data-driven from the canonical `SI_PREFIXES` list so the table cannot
 * drift from the prefix diagrams or converter widget.
 */
export default function PowersOfTenTable() {
  const { t } = useTranslation('ui')

  return (
    <div className="my-4 overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-border">
            <th scope="col" className="text-left py-2 px-3 font-semibold text-muted-foreground">{t('ch0_3.powersTablePower')}</th>
            <th scope="col" className="text-left py-2 px-3 font-semibold text-muted-foreground">{t('ch0_3.powersTableValue')}</th>
            <th scope="col" className="text-left py-2 px-3 font-semibold text-muted-foreground">{t('ch0_3.powersTableName')}</th>
            <th scope="col" className="text-left py-2 px-3 font-semibold text-muted-foreground">{t('ch0_3.powersTableExample')}</th>
          </tr>
        </thead>
        <tbody>
          {SI_PREFIXES.map(({ powerLabel, valueLabel, nameKey, exampleKey }) => (
            <tr key={powerLabel} className="border-b border-border/50">
              <td className="py-2 px-3 font-mono text-primary">{powerLabel}</td>
              <td className="py-2 px-3 font-mono text-muted-foreground">{valueLabel}</td>
              <td className="py-2 px-3">{t(`ch0_3.${nameKey}`)}</td>
              <td className="py-2 px-3 text-muted-foreground">{t(`ch0_3.${exampleKey}`)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
