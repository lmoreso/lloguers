import { Button, Text } from '@mantine/core'
import { useTranslation } from 'react-i18next'

function Lloguers(): React.JSX.Element {
  const { t } = useTranslation()

  return (
    <>
      <Text>{t('app.titol')}</Text>
      <Button>{t('menu.immobles')}</Button>
    </>
  )
}

export default Lloguers
