import { Button, Group, MultiSelect, Paper, Stack, Switch, Text, TextInput } from '@mantine/core'
import { IconFilterOff, IconSearch } from '@tabler/icons-react'
import { useTranslation } from 'react-i18next'
import { filtresImmobleBuits, hiHaFiltresImmoble } from '../utils/filtresImmobles'
import type { FiltresImmoble } from '../utils/filtresImmobles'

const INTERRUPTORS = ['certificat', 'cedula'] as const

interface Props {
  filtres: FiltresImmoble
  onCanvi: (filtres: FiltresImmoble) => void
  municipis: string[] // els que hi ha a la taula
  total: number
  visibles: number
}

// Barra de filtres de la llista d'Immobles. No llegeix res de la BD: només edita l'objecte de filtres.
function FiltresImmobles({
  filtres,
  onCanvi,
  municipis,
  total,
  visibles
}: Props): React.JSX.Element {
  const { t } = useTranslation()
  return (
    <Paper withBorder p="sm" mb="md">
      <Stack gap="sm">
        <Group align="flex-end" gap="md">
          <MultiSelect
            clearable
            searchable
            miw={240}
            label={t('immobles.filtres.municipi')}
            placeholder={t('immobles.filtres.tots')}
            data={municipis}
            nothingFoundMessage={t('comu.capResultat')}
            value={filtres.municipis}
            onChange={(v) => onCanvi({ ...filtres, municipis: v })}
          />
          <TextInput
            miw={260}
            label={t('immobles.filtres.adreca')}
            placeholder={t('immobles.filtres.cerca')}
            leftSection={<IconSearch size={16} />}
            value={filtres.adrecaText}
            onChange={(e) => onCanvi({ ...filtres, adrecaText: e.currentTarget.value })}
          />
          <Button
            variant="default"
            leftSection={<IconFilterOff size={16} />}
            disabled={!hiHaFiltresImmoble(filtres)}
            onClick={() => onCanvi(filtresImmobleBuits())}
          >
            {t('immobles.filtres.neteja')}
          </Button>
          <Text size="sm" c="dimmed">
            {t('immobles.filtres.comptador', { visibles, total })}
          </Text>
        </Group>

        <Group gap="xl">
          {INTERRUPTORS.map((k) => (
            <Switch
              key={k}
              label={t(`immobles.filtres.interruptors.${k}`)}
              checked={filtres[k]}
              onChange={(e) => onCanvi({ ...filtres, [k]: e.currentTarget.checked })}
            />
          ))}
        </Group>
      </Stack>
    </Paper>
  )
}

export default FiltresImmobles
