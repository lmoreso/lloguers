import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { MantineProvider } from '@mantine/core'
import { ModalsProvider } from '@mantine/modals'
import { Notifications } from '@mantine/notifications'
import '@mantine/core/styles.css'
// Els estils de dates i notificacions van després dels de core.
import '@mantine/dates/styles.css'
import '@mantine/notifications/styles.css'
// Locales de dayjs per als components de dates.
import 'dayjs/locale/ca'
import 'dayjs/locale/es'
import App from './App'
import DatesAmbIdioma from './components/DatesAmbIdioma'
import SeleccioIdioma from './components/SeleccioIdioma'
import i18n from './i18n'
import type { Idioma } from '../../shared/tipus'
import { CLASSES_DOCUMENT } from '../../shared/tipus'
import type { NomsClasses } from '../../shared/tipus'

async function arrencar(): Promise<void> {
  // 1. Es demana la configuració al Main abans de pintar res.
  const resposta = await window.api.config.obtenir()
  console.log('[idioma] Configuració rebuda del Main:', resposta)

  let idioma: Idioma = 'ca'
  let confirmat = true
  if (resposta.ok) {
    idioma = resposta.dades.idioma
    confirmat = resposta.dades.confirmat
  } else {
    // Si no es pot llegir, s'arrenca en català sense preguntar (desar tampoc funcionaria).
    console.error("[idioma] No s'ha pogut llegir la configuració:", resposta.error)
  }
  await i18n.changeLanguage(idioma)

  const arrel = createRoot(document.getElementById('root')!)

  async function pintarApp(): Promise<void> {
    // Sembrat dels tipus de document: amb l'idioma ja definitiu, el Renderer envia al Main el nom
    // traduït de cada classe, i el Main n'insereix un per cada classe que no en tingui cap.
    const noms = Object.fromEntries(
      CLASSES_DOCUMENT.map((classe) => [classe, i18n.t(`documents.classes.${classe}`)])
    ) as NomsClasses
    const sembrat = await window.api.tipusDocument.sembrar(noms)
    if (sembrat.ok) {
      console.log(`[tipus] Sembrats ${sembrat.dades} tipus de document`)
    } else {
      // Les notificacions encara no estan muntades: només es registra i l'app arrenca igualment.
      console.error("[tipus] No s'han pogut sembrar els tipus de document:", sembrat.error)
    }

    arrel.render(
      <StrictMode>
        <MantineProvider>
          <DatesAmbIdioma>
            <ModalsProvider>
              <Notifications />
              <App />
            </ModalsProvider>
          </DatesAmbIdioma>
        </MantineProvider>
      </StrictMode>
    )
  }

  if (confirmat) {
    await pintarApp()
    return
  }

  // 2. Primer arrencament: es pregunta l'idioma abans de pintar l'app.
  console.log(`[idioma] Es mostra la pantalla de selecció (per defecte "${idioma}")`)
  arrel.render(
    <StrictMode>
      <MantineProvider>
        <Notifications />
        <SeleccioIdioma inicial={idioma} onConfirmat={pintarApp} />
      </MantineProvider>
    </StrictMode>
  )
}

arrencar()
