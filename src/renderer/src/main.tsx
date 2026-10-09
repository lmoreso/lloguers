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

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MantineProvider>
      {/* Locale fix de moment; al pas 9 es connectarà a l'idioma de config.json */}
      <DatesProvider settings={{ locale: 'ca' }}>
        <ModalsProvider>
          <Notifications />
          <App />
        </ModalsProvider>
      </DatesProvider>
    </MantineProvider>
  </StrictMode>
)
