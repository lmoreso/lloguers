import { Button, Stack, Text } from '@mantine/core'
import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import ProvesMantine from './ProvesMantine'

function App(): React.JSX.Element {
  const { t } = useTranslation()

  const [mostrarProves, setMostrarProves] = useState(true)

  if (mostrarProves) {
    return <ProvesMantine onTornar={() => setMostrarProves(false)} />
  }

  // return (
  //   <>
  //     <Text>{t('app.titol')}</Text>
  //     <Button>{t('menu.immobles')}</Button>
  //   </>
  // )

  return (
    <Stack p="lg" gap="lg">
      <Text>{t('app.titol')}</Text>

      <Button onClick={() => setMostrarProves(true)}>Obrir proves de Mantine</Button>
    </Stack>
  )
}

export default App
