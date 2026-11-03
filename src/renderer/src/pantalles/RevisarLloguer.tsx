import { useState } from 'react'
import { Button, Group, Stack, Text } from '@mantine/core'
import { modals } from '@mantine/modals'
import dayjs from 'dayjs'
import { useTranslation } from 'react-i18next'
import { CampData } from '../components/CampData'
import CampNumeric from '../components/CampNumeric'
import { formatData } from '../utils/dates'
import { aNumeroForm } from '../utils/formulari'

interface Props {
  lloguerActual: number
  dataUltimaRevisio: string
  dataInici: string
  // Rep el lloguer nou i la data de la revisió. NO escriu a la BD: el formulari els posa als seus camps i es
  // desen amb Desar.
  onAcceptar: (lloguer: number, data: string) => void
}

// Contingut de la finestra de l'acció Revisar lloguer: l'import i la data es canvien alhora. L'import pot ser
// igual a l'actual (lloguer congelat).
function RevisarLloguer({
  lloguerActual,
  dataUltimaRevisio,
  dataInici,
  onAcceptar
}: Props): React.JSX.Element {
  const { t, i18n } = useTranslation()
  const euros = new Intl.NumberFormat(i18n.language, { style: 'currency', currency: 'EUR' })
  const [lloguer, setLloguer] = useState<number | string>(lloguerActual)
  const [data, setData] = useState<string | null>(dayjs().format('YYYY-MM-DD'))
  const [errorLloguer, setErrorLloguer] = useState<string | null>(null)
  const [errorData, setErrorData] = useState<string | null>(null)

  function acceptar(): void {
    const n = aNumeroForm(lloguer)
    const eLloguer =
      lloguer === ''
        ? t('comu.obligatori')
        : n === null || n < 0
          ? t('immobles.validacio.numero')
          : null
    const eData = !data
      ? t('comu.obligatori')
      : data < dataInici
        ? t('contractes.validacio.revisioAnterior')
        : null
    setErrorLloguer(eLloguer)
    setErrorData(eData)
    if (eLloguer || eData) return

    modals.closeAll()
    onAcceptar(n as number, data as string)
  }

  return (
    <Stack>
      <Text size="sm" c="dimmed">
        {t('contractes.revisar.actual', {
          lloguer: euros.format(lloguerActual),
          data: formatData(dataUltimaRevisio)
        })}
      </Text>
      <CampNumeric
        tipus="import"
        label={t('contractes.revisar.lloguerNou')}
        value={lloguer}
        onChange={(v) => {
          setLloguer(v)
          setErrorLloguer(null)
        }}
        error={errorLloguer}
      />
      <CampData
        label={t('contractes.revisar.data')}
        value={data}
        onChange={(v) => {
          setData(v)
          setErrorData(null)
        }}
        error={errorData}
        minDate={dataInici}
      />
      <Group justify="flex-end">
        <Button variant="default" onClick={() => modals.closeAll()}>
          {t('comu.cancellar')}
        </Button>
        <Button onClick={acceptar}>{t('comu.acceptar')}</Button>
      </Group>
    </Stack>
  )
}

export default RevisarLloguer
