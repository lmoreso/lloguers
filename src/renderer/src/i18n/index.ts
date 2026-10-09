import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import ca from './ca.json'
import es from './es.json'

i18n.use(initReactI18next).init({
  resources: {
    ca: { translation: ca },
    es: { translation: es }
  },
  // Provisional: al pas 9f es llegirà de window.api.config.
  lng: 'ca',
  fallbackLng: 'ca',
  interpolation: { escapeValue: false } // React ja escapa el contingut
})

export default i18n
