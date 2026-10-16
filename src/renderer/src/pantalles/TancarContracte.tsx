import { useState } from 'react'
import { Button, Group, Stack } from '@mantine/core'
import { DatePickerInput } from '@mantine/dates'
import { modals } from '@mantine/modals'
import { notifications } from '@mantine/notifications'
import dayjs from 'dayjs'
import { useTranslation } from 'react-i18next'
import { esOk } from '../utils/resultat'
import type { ContracteLlistat } from '../../../shared/tipus'

interface Props {
  contracte: ContracteLlistat
  onTancat: () => void
}

// Contingut de la finestra de l'acció Tancar: demana la data de fi (>= data d'inici).
function TancarContracte({ contracte, onTancat }: Props): React.JSX.Element {
  const { t } = useTranslation()
  const [dataFi, setDataFi] = useState<string | null>(dayjs().format('YYYY-MM-DD'))
  const [error, setError] = useState<string | null>(null)

  async function tancar(): Promise<void> {
    if (!dataFi) {
      setError(t('comu.obligatori'))
      return
    }
    if (dataFi < contracte.data_inici) {
      setError(t('contractes.validacio.dataFiAnterior'))
      return
    }
    const resposta = await window.api.contractes.tancar(contracte.id, dataFi)
    if (!esOk(resposta)) return

    modals.closeAll()
    notifications.show({ color: 'green', message: t('contractes.tancar.fet') })
    onTancat()
  }

  return (
    <Stack>
      <DatePickerInput
        valueFormat="DD/MM/YYYY"
        label={t('contractes.tancar.dataFi')}
        value={dataFi}
        onChange={(valor) => {
          setDataFi(valor)
          setError(null)
        }}
        error={error}
        minDate={contracte.data_inici}
      />
      <Group justify="flex-end">
        <Button variant="default" onClick={() => modals.closeAll()}>
          {t('comu.cancellar')}
        </Button>
        <Button onClick={tancar}>{t('comu.tancar')}</Button>
      </Group>
    </Stack>
  )
}

export default TancarContracte
