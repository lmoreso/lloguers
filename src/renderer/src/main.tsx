import './assets/main.css'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { MantineProvider } from '@mantine/core'
import { DatesProvider } from '@mantine/dates'
import { ModalsProvider } from '@mantine/modals'
import { Notifications } from '@mantine/notifications'
import '@mantine/core/styles.css'
// Els estils de dates i notificacions van després dels de core.
import '@mantine/dates/styles.css'
import '@mantine/notifications/styles.css'
// Locales de dayjs per als components de dates (ca i es, com preveu NOTES.md).
import 'dayjs/locale/ca'
import 'dayjs/locale/es'
import App from './App'
import i18n from './i18n'

async function arrencar(): Promise<void> {
  // L'idioma es llegeix de ~/Lloguers/config.json abans de pintar res.
  const resposta = await window.api.config.obtenir()
  const idioma = resposta.ok ? resposta.dades.idioma : 'ca'
  await i18n.changeLanguage(idioma)

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <MantineProvider>
        {/* Locale de dates fix de moment; es connectarà a l'idioma al pas 9g */}
        <DatesProvider settings={{ locale: 'ca' }}>
          <ModalsProvider>
            <Notifications />
            <App />
          </ModalsProvider>
        </DatesProvider>
      </MantineProvider>
    </StrictMode>
  )
}

arrencar()
