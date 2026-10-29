import { Button, Stack } from '@mantine/core'
import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import ProvesMantine from './ProvesMantine'
import Lloguers from './lloguers'

function App(): React.JSX.Element {
  const { t } = useTranslation()
  const opcioIni = 'Proves' as 'Inici' | 'Proves' | 'Lloguers'

  const [mostrarProves, setMostrarProves] = useState(opcioIni === 'Proves')
  const [mostrarLloguers, setMostrarLloguers] = useState(opcioIni === 'Lloguers')

  if (mostrarProves) {
    return <ProvesMantine onTornar={() => setMostrarProves(false)} />
  }

  if (mostrarLloguers) {
    return <Lloguers />
  }

  return (
    <Stack p="lg" gap="lg">
      <Button onClick={() => setMostrarProves(true)}>{t('proves.titol')}</Button>
      <Button onClick={() => setMostrarLloguers(true)}>{t('app.titol')}</Button>
    </Stack>
  )
}

export default App
