import { Button, Group, MultiSelect, Paper, Stack, Switch, Text, TextInput } from '@mantine/core'
import { IconFilterOff, IconSearch } from '@tabler/icons-react'
import { useTranslation } from 'react-i18next'
import { ESTATS_CONTRACTE, filtresBuits, hiHaFiltres } from '../utils/filtresUltimsContractes'
import type { EstatContracte, Filtres } from '../utils/filtresUltimsContractes'

const INTERRUPTORS = ['fiPrevista', 'revisio', 'certificat', 'cedula'] as const

interface Props {
  filtres: Filtres
  onCanvi: (filtres: Filtres) => void
  municipis: string[] // els que hi ha a la taula
  total: number
  visibles: number
}

// Barra de filtres de "Últims contractes". No llegeix res de la BD: només edita l'objecte de filtres.
function FiltresUltimsContractes({
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
            miw={240}
            label={t('contractes.ultims.filtres.estat')}
            placeholder={t('contractes.ultims.filtres.tots')}
            data={ESTATS_CONTRACTE.map((e) => ({
              value: e,
              label: t(`contractes.ultims.filtres.estats.${e}`)
            }))}
            value={filtres.estats}
            onChange={(v) => onCanvi({ ...filtres, estats: v as EstatContracte[] })}
          />
          <MultiSelect
            clearable
            searchable
            miw={240}
            label={t('contractes.ultims.filtres.municipi')}
            placeholder={t('contractes.ultims.filtres.tots')}
            data={municipis}
            nothingFoundMessage={t('comu.capResultat')}
            value={filtres.municipis}
            onChange={(v) => onCanvi({ ...filtres, municipis: v })}
          />
          <TextInput
            miw={220}
            label={t('contractes.ultims.filtres.inquilins')}
            placeholder={t('contractes.ultims.filtres.cerca')}
            leftSection={<IconSearch size={16} />}
            value={filtres.inquilins}
            onChange={(e) => onCanvi({ ...filtres, inquilins: e.currentTarget.value })}
          />
          <Button
            variant="default"
            leftSection={<IconFilterOff size={16} />}
            disabled={!hiHaFiltres(filtres)}
            onClick={() => onCanvi(filtresBuits())}
          >
            {t('contractes.ultims.filtres.neteja')}
          </Button>
          <Text size="sm" c="dimmed">
            {t('contractes.ultims.filtres.comptador', { visibles, total })}
          </Text>
        </Group>

        <Group gap="xl">
          {INTERRUPTORS.map((k) => (
            <Switch
              key={k}
              label={t(`contractes.ultims.filtres.interruptors.${k}`)}
              checked={filtres[k]}
              onChange={(e) => onCanvi({ ...filtres, [k]: e.currentTarget.checked })}
            />
          ))}
        </Group>
      </Stack>
    </Paper>
  )
}

export default FiltresUltimsContractes
