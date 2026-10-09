import 'i18next'
import type ca from './ca.json'

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation'
    resources: { translation: typeof ca }
  }
}
