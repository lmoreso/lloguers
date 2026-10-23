import { useState } from 'react'
import { Button, Group, Stack, Text } from '@mantine/core'
import { modals } from '@mantine/modals'
import { useTranslation } from 'react-i18next'

interface Props {
  onDesar: () => Promise<void> // desa i continua; tanca el diàleg ella mateixa
  onDescartar: () => void // tanca el diàleg i continua sense desar
}

// Contingut del diàleg "canvis sense desar": Desar i continuar / Descartar / Cancel·lar.
function CanvisSenseDesar({ onDesar, onDescartar }: Props): React.JSX.Element {
  const { t } = useTranslation()
  const [desant, setDesant] = useState(false)

  return (
    <Stack>
      <Text size="sm">{t('comu.canvisSenseDesar.text')}</Text>
      <Group justify="flex-end">
        <Button variant="default" disabled={desant} onClick={() => modals.closeAll()}>
          {t('comu.cancellar')}
        </Button>
        <Button variant="light" color="red" disabled={desant} onClick={onDescartar}>
          {t('comu.canvisSenseDesar.descartar')}
        </Button>
        <Button
          loading={desant}
          onClick={async () => {
            setDesant(true)
            await onDesar()
          }}
        >
          {t('comu.canvisSenseDesar.desarContinuar')}
        </Button>
      </Group>
    </Stack>
  )
}

export default CanvisSenseDesar
