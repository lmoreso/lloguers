import { DatesProvider } from '@mantine/dates'
import { useTranslation } from 'react-i18next'

// DatesProvider que segueix l'idioma actiu d'i18next (ca o es).
function DatesAmbIdioma({ children }: { children: React.ReactNode }): React.JSX.Element {
  const { i18n } = useTranslation()
  return <DatesProvider settings={{ locale: i18n.language }}>{children}</DatesProvider>
}

export default DatesAmbIdioma
