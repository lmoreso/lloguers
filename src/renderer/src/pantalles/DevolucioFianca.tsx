import { useState } from 'react'
import { Button, Group, Stack, Text, Textarea, TextInput } from '@mantine/core'
import { DatePickerInput } from '@mantine/dates'
import { modals } from '@mantine/modals'
import { notifications } from '@mantine/notifications'
import { useTranslation } from 'react-i18next'
import { aNumero, buitANull } from '../utils/formulari'
import { esOk } from '../utils/resultat'
import type { ContracteLlistat } from '../../../shared/tipus'

interface Props {
  contracte: ContracteLlistat // sempre tancat: només s'ofereix als contractes amb data de fi
  onDesat: () => void
}

interface Errors {
  sol: string | null
  cob: string | null
  imp: string | null
}

// Contingut de la finestra de l'acció Devolució de la fiança. Cap camp és obligatori: es pot desar
// només la sol·licitud i afegir el cobrament quan arribi. Tot buit esborra la devolució.
function DevolucioFianca({ contracte, onDesat }: Props): React.JSX.Element {
  const { t, i18n } = useTranslation()
  const euros = new Intl.NumberFormat(i18n.language, { style: 'currency', currency: 'EUR' })
  const dataFi = contracte.data_fi as string

  const [sol, setSol] = useState<string | null>(contracte.devolucio_data_sollicitud)
  const [cob, setCob] = useState<string | null>(contracte.devolucio_data_cobrament)
  const [imp, setImp] = useState(String(contracte.devolucio_import ?? ''))
  const [motiu, setMotiu] = useState(contracte.devolucio_motiu ?? '')
  const [errors, setErrors] = useState<Errors>({ sol: null, cob: null, imp: null })

  async function desar(): Promise<void> {
    const nombre = aNumero(imp)
    const e: Errors = {
      sol: sol && sol < dataFi ? t('contractes.validacio.solAnterior') : null,
      cob: sol && cob && cob < sol ? t('contractes.validacio.cobAnterior') : null,
      imp: imp.trim() && (nombre === null || nombre < 0) ? t('immobles.validacio.numero') : null
    }
    setErrors(e)
    if (e.sol || e.cob || e.imp) return

    const resposta = await window.api.contractes.devolucio(contracte.id, {
      devolucio_data_sollicitud: sol,
      devolucio_data_cobrament: cob,
      devolucio_import: nombre,
      devolucio_motiu: buitANull(motiu)
    })
    if (!esOk(resposta)) return

    modals.closeAll()
    notifications.show({ color: 'green', message: t('contractes.devolucio.fet') })
    onDesat()
  }

  return (
    <Stack>
      {contracte.fianca_import !== null && (
        <Text size="sm" c="dimmed">
          {t('contractes.devolucio.fianca', { import: euros.format(contracte.fianca_import) })}
        </Text>
      )}
      <DatePickerInput
        clearable
        valueFormat="DD/MM/YYYY"
        label={t('contractes.devolucio.dataSollicitud')}
        value={sol}
        onChange={(v) => {
          setSol(v)
          setErrors((x) => ({ ...x, sol: null, cob: null }))
        }}
        error={errors.sol}
        minDate={dataFi}
      />
      <DatePickerInput
        clearable
        valueFormat="DD/MM/YYYY"
        label={t('contractes.devolucio.dataCobrament')}
        value={cob}
        onChange={(v) => {
          setCob(v)
          setErrors((x) => ({ ...x, cob: null }))
        }}
        error={errors.cob}
        minDate={sol ?? dataFi}
      />
      <TextInput
        inputMode="decimal"
        label={t('contractes.devolucio.import')}
        value={imp}
        onChange={(ev) => {
          setImp(ev.currentTarget.value)
          setErrors((x) => ({ ...x, imp: null }))
        }}
        error={errors.imp}
      />
      <Textarea
        autosize
        minRows={2}
        label={t('contractes.devolucio.motiu')}
        value={motiu}
        onChange={(ev) => setMotiu(ev.currentTarget.value)}
      />
      <Group justify="flex-end">
        <Button variant="default" onClick={() => modals.closeAll()}>
          {t('comu.cancellar')}
        </Button>
        <Button onClick={desar}>{t('comu.desar')}</Button>
      </Group>
    </Stack>
  )
}

export default DevolucioFianca
