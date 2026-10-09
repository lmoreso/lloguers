import { Button, Stack, Text } from '@mantine/core'
import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import ProvesMantine from './ProvesMantine'
import Lloguers from './lloguers'

function App(): React.JSX.Element {
  const { t } = useTranslation()

  const [mostrarProves, setMostrarProves] = useState(false)
  const [mostrarLloguers, setMostrarLloguers] = useState(true)

  if (mostrarProves) {
    return <ProvesMantine onTornar={() => setMostrarProves(false)} />
  }

  if (mostrarLloguers) {
    return <Lloguers />
  }

  return (
    <Stack p="lg" gap="lg">
      <Text>{t('app.titol')}</Text>

      <Button onClick={() => setMostrarProves(true)}>Obrir proves de Mantine</Button>
      <Button onClick={() => setMostrarLloguers(true)}>{t('menu.immobles')}</Button>
    </Stack>
  )
}

export default App
