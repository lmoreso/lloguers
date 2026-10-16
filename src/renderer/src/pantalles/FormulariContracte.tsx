import {
  Button,
  Fieldset,
  Group,
  Select,
  SimpleGrid,
  Stack,
  Textarea,
  TextInput
} from '@mantine/core'
import { DatePickerInput } from '@mantine/dates'
import { useForm } from '@mantine/form'
import { notifications } from '@mantine/notifications'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { adreca } from '../utils/adreca'
import { formatData } from '../utils/dates'
import { aNumero, buitANull } from '../utils/formulari'
import { esOk } from '../utils/resultat'
import type { Contracte, ContracteDades, Immoble, Inquili } from '../../../shared/tipus'

interface Props {
  immoble: Immoble // fix: no es pot canviar ni en crear ni en editar
  contracte: Contracte | null // null = contracte nou
  inquilins: Inquili[]
}

// Els selectors treballen amb text (id com a string); les dates són text ISO AAAA-MM-DD.
interface Valors {
  data_inici: string | null
  data_fi: string | null
  d_fi_prevista: string | null
  id_inquili: string | null
  id_inquili_2: string | null
  lloguer_inicial: string
  comentaris: string
  fianca_import: string
  fianca_nc: string
  fianca_data_model2: string | null
  fianca_data_ingres: string | null
  fianca_data_notificacio: string | null
  fianca_num_registre: string
}

function FormulariContracte({ immoble, contracte, inquilins }: Props): React.JSX.Element {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const tornar = `/immobles/${immoble.id}/contractes`

  // Nom de l'inquilí per al desplegable; el NIF ajuda a distingir-ne dos de semblants.
  const opcions = inquilins.map((i) => ({
    value: String(i.id),
    label:
      ([i.nom, i.cognoms].filter(Boolean).join(' ') || t('inquilins.senseNom')) +
      (i.nif ? ` (${i.nif})` : '')
  }))

  const numeroOpcional = (v: string): string | null => {
    if (!v.trim()) return null
    const n = aNumero(v)
    return n === null || n < 0 ? t('immobles.validacio.numero') : null
  }

  const form = useForm<Valors>({
    initialValues: {
      data_inici: contracte?.data_inici ?? null,
      data_fi: contracte?.data_fi ?? null,
      d_fi_prevista: contracte?.d_fi_prevista ?? null,
      id_inquili: contracte ? String(contracte.id_inquili) : null,
      id_inquili_2: contracte?.id_inquili_2 ? String(contracte.id_inquili_2) : null,
      lloguer_inicial: String(contracte?.lloguer_inicial ?? ''),
      comentaris: contracte?.comentaris ?? '',
      fianca_import: String(contracte?.fianca_import ?? ''),
      fianca_nc: contracte?.fianca_nc ?? '',
      fianca_data_model2: contracte?.fianca_data_model2 ?? null,
      fianca_data_ingres: contracte?.fianca_data_ingres ?? null,
      fianca_data_notificacio: contracte?.fianca_data_notificacio ?? null,
      fianca_num_registre: contracte?.fianca_num_registre ?? ''
    },
    validate: {
      data_inici: (v) => (v ? null : t('comu.obligatori')),
      d_fi_prevista: (v, vals) => {
        if (!v) return t('comu.obligatori')
        return vals.data_inici && v < vals.data_inici
          ? t('contractes.validacio.fiPrevistaAnterior')
          : null
      },
      data_fi: (v, vals) =>
        v && vals.data_inici && v < vals.data_inici
          ? t('contractes.validacio.dataFiAnterior')
          : null,
      id_inquili: (v) => (v ? null : t('comu.obligatori')),
      id_inquili_2: (v, vals) =>
        v && v === vals.id_inquili ? t('contractes.validacio.mateixInquili') : null,
      lloguer_inicial: (v) => {
        if (!v.trim()) return t('comu.obligatori')
        return numeroOpcional(v)
      },
      fianca_import: numeroOpcional,
      // Les parelles de la fiança s'informen juntes: l'error surt al camp que falta.
      fianca_nc: (v, vals) =>
        !v.trim() && vals.fianca_data_model2 ? t('contractes.validacio.parellaModel2') : null,
      fianca_data_model2: (v, vals) =>
        v === null && vals.fianca_nc.trim() ? t('contractes.validacio.parellaModel2') : null,
      fianca_num_registre: (v, vals) =>
        !v.trim() && vals.fianca_data_notificacio
          ? t('contractes.validacio.parellaNotificacio')
          : null,
      fianca_data_notificacio: (v, vals) =>
        v === null && vals.fianca_num_registre.trim()
          ? t('contractes.validacio.parellaNotificacio')
          : null
    }
  })

  async function desar(v: Valors): Promise<void> {
    // Els camps obligatoris ja estan validats: els `as` només ajusten el tipus.
    const dades: ContracteDades = {
      id_inmoble: immoble.id,
      data_inici: v.data_inici as string,
      data_fi: v.data_fi,
      id_inquili: Number(v.id_inquili),
      id_inquili_2: v.id_inquili_2 ? Number(v.id_inquili_2) : null,
      d_fi_prevista: v.d_fi_prevista as string,
      lloguer_inicial: aNumero(v.lloguer_inicial) as number,
      fianca_import: aNumero(v.fianca_import),
      fianca_nc: buitANull(v.fianca_nc),
      fianca_data_model2: v.fianca_data_model2,
      fianca_data_ingres: v.fianca_data_ingres,
      fianca_data_notificacio: v.fianca_data_notificacio,
      fianca_num_registre: buitANull(v.fianca_num_registre),
      comentaris: buitANull(v.comentaris)
    }
    const correcte = contracte
      ? esOk(await window.api.contractes.actualitzar(contracte.id, dades))
      : esOk(await window.api.contractes.crear(dades))
    if (!correcte) return // p. ex. CONTRACTE_SOLAPAT: es queda al formulari

    notifications.show({ color: 'green', message: t('contractes.desat') })
    navigate(tornar)
  }

  const euros = new Intl.NumberFormat(i18n.language, { style: 'currency', currency: 'EUR' })

  return (
    <form onSubmit={form.onSubmit(desar)}>
      <Stack>
        <Fieldset legend={t('contractes.seccions.dades')}>
          <SimpleGrid cols={{ base: 1, sm: 2 }}>
            <TextInput
              readOnly
              label={t('contractes.camps.immoble')}
              value={adreca(immoble)}
              style={{ gridColumn: '1 / -1' }}
            />
            <Select
              withAsterisk
              searchable
              data={opcions}
              nothingFoundMessage={t('comu.capResultat')}
              placeholder={t('contractes.cercarInquili')}
              label={t('contractes.camps.inquili')}
              {...form.getInputProps('id_inquili')}
            />
            <Select
              searchable
              clearable
              data={opcions}
              nothingFoundMessage={t('comu.capResultat')}
              placeholder={t('contractes.cercarInquili')}
              label={t('contractes.camps.inquili2')}
              {...form.getInputProps('id_inquili_2')}
            />
            <DatePickerInput
              withAsterisk
              valueFormat="DD/MM/YYYY"
              label={t('contractes.camps.dataInici')}
              {...form.getInputProps('data_inici')}
            />
            <DatePickerInput
              withAsterisk
              valueFormat="DD/MM/YYYY"
              label={t('contractes.camps.dFiPrevista')}
              {...form.getInputProps('d_fi_prevista')}
            />
            <DatePickerInput
              clearable
              valueFormat="DD/MM/YYYY"
              label={t('contractes.camps.dataFi')}
              {...form.getInputProps('data_fi')}
            />
          </SimpleGrid>
          <Textarea
            mt="md"
            autosize
            minRows={2}
            label={t('contractes.camps.comentaris')}
            {...form.getInputProps('comentaris')}
          />
        </Fieldset>

        <Fieldset legend={t('contractes.seccions.lloguer')}>
          <SimpleGrid cols={{ base: 1, sm: 2 }}>
            <TextInput
              withAsterisk
              inputMode="decimal"
              label={t('contractes.camps.lloguerInicial')}
              {...form.getInputProps('lloguer_inicial')}
            />
            {/* En editar, el lloguer actual i la data de revisió són de només lectura: només els canvia l'acció Revisar lloguer. */}
            {contracte && (
              <>
                <TextInput
                  readOnly
                  label={t('contractes.camps.lloguerActual')}
                  value={euros.format(contracte.lloguer_actual)}
                />
                <TextInput
                  readOnly
                  label={t('contractes.camps.dataUltimaRevisio')}
                  value={formatData(contracte.data_ultima_revisio)}
                />
              </>
            )}
          </SimpleGrid>
        </Fieldset>

        <Fieldset legend={t('contractes.seccions.fianca')}>
          <SimpleGrid cols={{ base: 1, sm: 2 }}>
            <TextInput
              inputMode="decimal"
              label={t('contractes.camps.fiancaImport')}
              {...form.getInputProps('fianca_import')}
            />
            <div />
            <TextInput
              label={t('contractes.camps.fiancaNc')}
              {...form.getInputProps('fianca_nc')}
            />
            <DatePickerInput
              clearable
              valueFormat="DD/MM/YYYY"
              label={t('contractes.camps.fiancaDataModel2')}
              {...form.getInputProps('fianca_data_model2')}
            />
            <DatePickerInput
              clearable
              valueFormat="DD/MM/YYYY"
              label={t('contractes.camps.fiancaDataIngres')}
              {...form.getInputProps('fianca_data_ingres')}
            />
            <div />
            <TextInput
              label={t('contractes.camps.fiancaNumRegistre')}
              {...form.getInputProps('fianca_num_registre')}
            />
            <DatePickerInput
              clearable
              valueFormat="DD/MM/YYYY"
              label={t('contractes.camps.fiancaDataNotificacio')}
              {...form.getInputProps('fianca_data_notificacio')}
            />
          </SimpleGrid>
        </Fieldset>

        <Group justify="flex-end">
          <Button variant="default" onClick={() => navigate(tornar)}>
            {t('comu.cancellar')}
          </Button>
          <Button type="submit">{t('comu.desar')}</Button>
        </Group>
      </Stack>
    </form>
  )
}

export default FormulariContracte
