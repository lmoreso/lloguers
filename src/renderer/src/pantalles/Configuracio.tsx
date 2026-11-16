import { Stack, Text, Title } from '@mantine/core'
import { useTranslation } from 'react-i18next'
import SelectorIdioma from '../components/SelectorIdioma'
import SelectorPosicioMenu from '../components/SelectorPosicioMenu'
import type { PosicioMenu } from '../../../shared/tipus'

interface Props {
  posicioMenu: PosicioMenu
  onCanviarPosMenu: (posicio: PosicioMenu) => void
}

function Configuracio({ posicioMenu, onCanviarPosMenu }: Props): React.JSX.Element {
  const { t } = useTranslation()

  return (
    <>
      <Title order={2} mb="md">
        {t('configuracio.titol')}
      </Title>

      <Stack gap="lg" maw={350}>
        <Stack gap="xs">
          <Text fw={500}>{t('configuracio.idioma')}</Text>
          <SelectorIdioma />
        </Stack>

        <Stack gap="xs">
          <Text fw={500}>{t('configuracio.posicioMenu')}</Text>
          <SelectorPosicioMenu posicio={posicioMenu} onCanviar={onCanviarPosMenu} />
        </Stack>
      </Stack>
    </>
  )
}

export default Configuracio
