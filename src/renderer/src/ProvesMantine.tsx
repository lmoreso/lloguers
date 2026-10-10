import { Button, Group, Paper, Stack, Text, Title, Anchor } from '@mantine/core'
import { useTranslation } from 'react-i18next'
import SelectorIdioma from './components/SelectorIdioma'
import { DatePickerInput } from '@mantine/dates'
import dayjs from 'dayjs'
import { useState } from 'react'
import { esOk } from './utils/resultat'
import { Idioma } from '../../shared/tipus'

type ProvesMantineProps = {
  onTornar: () => void
}

function ProvesMantine({ onTornar }: ProvesMantineProps): React.JSX.Element {
  const { t } = useTranslation()
  const [data, setData] = useState<string | null>(dayjs().format('YYYY-MM-DD'))

  async function provarError(): Promise<void> {
    const r = await window.api.config.desar({ idioma: 'fr' as Idioma })
    console.log('esOk (error) ->', esOk(r))
  }

  return (
    <Stack p="lg" gap="xs">
      <Group justify="space-between">
        <Button variant="subtle" onClick={onTornar}>
          {`← ${t('proves.tornar')}`}
        </Button>

        <Text c="dimmed" size="sm">
          Laboratori de components
        </Text>
      </Group>

      <Title order={2}>{t('proves.titol')}</Title>

      <Paper withBorder shadow="md" radius="md" p="lg">
        <Stack gap="md">
          <Title order={4}>Primera secció</Title>

          <Text>
            El component Paper crea una superfície delimitada per a agrupar informació relacionada.
          </Text>

          <Group justify="flex-end">
            <Button variant="default">{t('comu.cancellar')}</Button>
            <Button onClick={() => console.log(t('comu.desar'))}>{t('comu.desar')}</Button>
          </Group>

          <Stack gap="md">
            <Text>{t('proves.canviIdioma')}</Text>
            <SelectorIdioma />
            <DatePickerInput label={t('proves.dataPicker')} value={data} onChange={setData} />
            <Button mt="md" onClick={provarError}>
              Frances (error)
            </Button>
          </Stack>
        </Stack>
      </Paper>

      <Anchor href="https://mantine.dev" target="_blank">
        Visita la web de Mantine
      </Anchor>
    </Stack>
  )
}

export default ProvesMantine
