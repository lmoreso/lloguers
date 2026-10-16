import { useState } from 'react'
import { Button, Group, Stack, Text, TextInput } from '@mantine/core'
import { DatePickerInput } from '@mantine/dates'
import { modals } from '@mantine/modals'
import { notifications } from '@mantine/notifications'
import dayjs from 'dayjs'
import { useTranslation } from 'react-i18next'
import { formatData } from '../utils/dates'
import { aNumero } from '../utils/formulari'
import { esOk } from '../utils/resultat'
import type { ContracteLlistat } from '../../../shared/tipus'

interface Props {
  contracte: ContracteLlistat
  onRevisat: () => void
}

// Contingut de la finestra de l'acció Revisar lloguer: l'import i la data es canvien alhora.
// L'import pot ser igual a l'actual (lloguer congelat).
function RevisarLloguer({ contracte, onRevisat }: Props): React.JSX.Element {
  const { t, i18n } = useTranslation()
  const euros = new Intl.NumberFormat(i18n.language, { style: 'currency', currency: 'EUR' })
  const [lloguer, setLloguer] = useState(String(contracte.lloguer_actual))
  const [data, setData] = useState<string | null>(dayjs().format('YYYY-MM-DD'))
  const [errorLloguer, setErrorLloguer] = useState<string | null>(null)
  const [errorData, setErrorData] = useState<string | null>(null)

  async function revisar(): Promise<void> {
    const import_ = aNumero(lloguer)
    const eLloguer = !lloguer.trim()
      ? t('comu.obligatori')
      : import_ === null || import_ < 0
        ? t('immobles.validacio.numero')
        : null
    const eData = !data
      ? t('comu.obligatori')
      : data < contracte.data_inici
        ? t('contractes.validacio.revisioAnterior')
        : null
    setErrorLloguer(eLloguer)
    setErrorData(eData)
    if (eLloguer || eData) return

    const resposta = await window.api.contractes.revisarLloguer(
      contracte.id,
      import_ as number,
      data as string
    )
    if (!esOk(resposta)) return

    modals.closeAll()
    notifications.show({ color: 'green', message: t('contractes.revisar.fet') })
    onRevisat()
  }

  return (
    <Stack>
      <Text size="sm" c="dimmed">
        {t('contractes.revisar.actual', {
          lloguer: euros.format(contracte.lloguer_actual),
          data: formatData(contracte.data_ultima_revisio)
        })}
      </Text>
      <TextInput
        inputMode="decimal"
        label={t('contractes.revisar.lloguerNou')}
        value={lloguer}
        onChange={(e) => {
          setLloguer(e.currentTarget.value)
          setErrorLloguer(null)
        }}
        error={errorLloguer}
      />
      <DatePickerInput
        valueFormat="DD/MM/YYYY"
        label={t('contractes.revisar.data')}
        value={data}
        onChange={(valor) => {
          setData(valor)
          setErrorData(null)
        }}
        error={errorData}
        minDate={contracte.data_inici}
      />
      <Group justify="flex-end">
        <Button variant="default" onClick={() => modals.closeAll()}>
          {t('comu.cancellar')}
        </Button>
        <Button onClick={revisar}>{t('comu.desar')}</Button>
      </Group>
    </Stack>
  )
}

export default RevisarLloguer
