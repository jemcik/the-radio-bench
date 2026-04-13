import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import enUi from './locales/en/ui.json'
import ukUi from './locales/uk/ui.json'

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { ui: enUi },
      uk: { ui: ukUi },
    },
    defaultNS: 'ui',
    fallbackLng: 'en',
    supportedLngs: ['en', 'uk'],

    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'trb-lang',
      caches: ['localStorage'],
    },

    interpolation: {
      escapeValue: false, // React already escapes
    },
  })

function syncDocumentLang(lng: string) {
  if (typeof document === 'undefined') return
  const base = lng.split('-')[0]?.toLowerCase() ?? 'en'
  document.documentElement.lang = base === 'uk' ? 'uk' : 'en'
}

syncDocumentLang(i18n.language)
i18n.on('languageChanged', lng => {
  syncDocumentLang(lng)
})

export default i18n
