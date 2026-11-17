import { Fieldset, Stack, Text, Title } from '@mantine/core'
import { useTranslation } from 'react-i18next'
import { Config, ConfigObtinguda } from '../../../shared/tipus'
import SelectorIdioma from '../components/SelectorIdioma'
import SelectorPosicioMenu from '../components/SelectorPosicioMenu'
import SelectorDiesAvis from '@renderer/components/SelectorDiesAvis'

interface Props {
  config: ConfigObtinguda
  onCanviarConfig: (canvis: Partial<Config>) => void
}

function Configuracio({ config, onCanviarConfig }: Props): React.JSX.Element {
  const { t } = useTranslation()

  return (
    <>
      <Stack gap="lg" maw={500} mx="auto">
        <Title order={2} mb="md">
          {t('configuracio.titol')}
        </Title>

        <Stack gap="xs">
          <Text fw={500}>{t('configuracio.idioma')}</Text>
          <SelectorIdioma />
        </Stack>

        <Stack gap="xs">
          <Text fw={500}>{t('configuracio.posicioMenu')}</Text>
          <SelectorPosicioMenu
            posicio={config.posicioMenu}
            onCanviar={(posicio) => onCanviarConfig({ posicioMenu: posicio })}
          />
        </Stack>

        <Fieldset legend={t('configuracio.avisos')}>
          <Stack gap="lg">
            <SelectorDiesAvis
              label={t('configuracio.diesDocumentCaducat')}
              valor={config.diesAvisDocumentCaducat}
              clau="diesAvisDocumentCaducat"
              onCanviar={(valor) => onCanviarConfig({ diesAvisDocumentCaducat: valor })}
            />

            <SelectorDiesAvis
              label={t('configuracio.diesFiContracte')}
              valor={config.diesAvisFiContracte}
              clau="diesAvisFiContracte"
              onCanviar={(valor) => onCanviarConfig({ diesAvisFiContracte: valor })}
            />

            <SelectorDiesAvis
              label={t('configuracio.diesRevisioLloguer')}
              valor={config.diesAvisRevisioLloguer}
              clau="diesAvisRevisioLloguer"
              onCanviar={(valor) => onCanviarConfig({ diesAvisRevisioLloguer: valor })}
            />
          </Stack>
        </Fieldset>
      </Stack>
    </>
  )
}

export default Configuracio
