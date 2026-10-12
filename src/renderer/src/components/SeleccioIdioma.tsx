import { useState } from 'react'
import { Button, Stack, Title } from '@mantine/core'
import { useTranslation } from 'react-i18next'
import { IDIOMES } from '../../../shared/tipus'
import type { Idioma } from '../../../shared/tipus'
import { esOk } from '../utils/resultat'

interface Props {
  inicial: Idioma // l'idioma per defecte, preseleccionat
  onConfirmat: () => void
}

// Pantalla del primer arrencament. Els textos surten en l'idioma ressaltat, que canvia en memòria;
// no es desa res al disc fins a confirmar.
function SeleccioIdioma({ inicial, onConfirmat }: Props): React.JSX.Element {
  const { t, i18n } = useTranslation()
  const [triat, setTriat] = useState<Idioma>(inicial)

  async function ressaltar(idioma: Idioma): Promise<void> {
    setTriat(idioma)
    await i18n.changeLanguage(idioma)
    console.log(`[idioma] Ressaltat: "${idioma}"`)
  }

  async function confirmar(): Promise<void> {
    const resposta = await window.api.config.desar({ idioma: triat })
    if (!esOk(resposta)) return
    console.log(`[idioma] Confirmat i desat: "${triat}"`)
    onConfirmat()
  }

  return (
    <Stack align="center" justify="center" mih="100vh" gap="lg">
      <Title order={2}>{t('seleccioIdioma.titol')}</Title>
      <Stack w={260}>
        {IDIOMES.map((i) => (
          <Button key={i} variant={i === triat ? 'filled' : 'default'} onClick={() => ressaltar(i)}>
            {i18n.getFixedT(i)('idiomaNom')}
          </Button>
        ))}
      </Stack>
      <Button w={260} onClick={confirmar}>
        {t('seleccioIdioma.confirmar')}
      </Button>
    </Stack>
  )
}

export default SeleccioIdioma
