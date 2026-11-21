import { Button, Fieldset, Group, MultiSelect, Stack, Switch, Text, TextInput } from '@mantine/core'
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
    <Fieldset
      legend={
        <Group gap={4}>
          <span style={{ fontWeight: 700 }}> Filtres - </span>
          <Text size="sm" c="dimmed">
            {t('immobles.filtres.comptador', { visibles, total })}
          </Text>
        </Group>
      }
      mb={8}
    >
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
          <Stack gap="md">
            {INTERRUPTORS.map((k) => (
              <Switch
                key={k}
                label={t(`immobles.filtres.interruptors.${k}`)}
                checked={filtres[k]}
                onChange={(e) => onCanvi({ ...filtres, [k]: e.currentTarget.checked })}
              />
            ))}
          </Stack>
          {/* <Tooltip label={t('immobles.filtres.neteja')}>
            <ActionIcon
              mb={5}
              variant="default"
              disabled={!hiHaFiltresImmoble(filtres)}
              onClick={() => onCanvi(filtresImmobleBuits())}
              aria-label={t('immobles.filtres.neteja')}
            >
              <IconFilterOff size={30} />
            </ActionIcon>
          </Tooltip> */}
          <Button
            variant="default"
            leftSection={<IconFilterOff size={16} />}
            disabled={!hiHaFiltresImmoble(filtres)}
            onClick={() => onCanvi(filtresImmobleBuits())}
          >
            {t('immobles.filtres.neteja')}
          </Button>
        </Group>
      </Stack>
    </Fieldset>
  )
}

export default FiltresImmobles
