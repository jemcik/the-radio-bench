import { type ReactNode, useEffect, useState } from 'react'
import i18n, { type i18n as I18n } from 'i18next'
import { I18nextProvider, initReactI18next } from 'react-i18next'

import enUi from '@/i18n/locales/en/ui.json'
import ukUi from '@/i18n/locales/uk/ui.json'

/**
 * Build an isolated i18next instance for tests.
 *
 * Separate from the production instance in src/i18n/index.ts so:
 *  - no language detector side effects
 *  - tests can pin a specific language deterministically
 *  - production state is never mutated by tests
 */
function createTestI18n(language: 'en' | 'uk' = 'en'): I18n {
  const instance = i18n.createInstance()
  instance.use(initReactI18next).init({
    lng: language,
    fallbackLng: 'en',
    supportedLngs: ['en', 'uk'],
    defaultNS: 'ui',
    resources: {
      en: { ui: enUi },
      uk: { ui: ukUi },
    },
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
  })
  return instance
}

interface I18nTestProviderProps {
  language?: 'en' | 'uk'
  children: ReactNode
}

export function I18nTestProvider({ language = 'en', children }: I18nTestProviderProps) {
  // Keep the instance stable per (language) so children don't see it swap mid-test.
  const [instance] = useState(() => createTestI18n(language))

  useEffect(() => {
    if (instance.language !== language) {
      void instance.changeLanguage(language)
    }
  }, [instance, language])

  return <I18nextProvider i18n={instance}>{children}</I18nextProvider>
}
