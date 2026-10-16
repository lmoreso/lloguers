import { Button, Fieldset, Group, SimpleGrid, Stack, TextInput } from '@mantine/core'
import { DatePickerInput } from '@mantine/dates'
import { useForm } from '@mantine/form'
import { notifications } from '@mantine/notifications'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { esOk } from '../utils/resultat'
import type { Immoble, ImmobleDades } from '../../../shared/tipus'
import { aNumero, buitANull } from '../utils/formulari'

// Els camps de text són sempre string al formulari; a la BD els buits són NULL.
// Les dates són text ISO AAAA-MM-DD (o null), tal com les desa la BD.
interface Valors {
  via: string
  num_via: string
  pis: string
  porta: string
  codi_postal: string
  localitat: string
  provincia: string
  ref_catastral: string
  superficie_m2: string
  superficie_pati: string
  cert_en_reg: string
  cert_en_class: string
  cert_en_data: string | null
  cert_en_caduc: string | null
  ced_hab_reg: string
  ced_hab_data: string | null
  ced_hab_caduc: string | null
}

function FormulariImmoble({ immoble }: { immoble: Immoble | null }): React.JSX.Element {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const form = useForm<Valors>({
    initialValues: {
      via: immoble?.via ?? '',
      num_via: immoble?.num_via ?? '',
      pis: immoble?.pis ?? '',
      porta: immoble?.porta ?? '',
      codi_postal: immoble?.codi_postal ?? '',
      localitat: immoble?.localitat ?? '',
      provincia: immoble?.provincia ?? '',
      ref_catastral: immoble?.ref_catastral ?? '',
      superficie_m2: String(immoble?.superficie_m2 ?? ''),
      superficie_pati: String(immoble?.superficie_pati ?? ''),
      cert_en_reg: immoble?.cert_en_reg ?? '',
      cert_en_class: immoble?.cert_en_class ?? '',
      cert_en_data: immoble?.cert_en_data ?? null,
      cert_en_caduc: immoble?.cert_en_caduc ?? null,
      ced_hab_reg: immoble?.ced_hab_reg ?? '',
      ced_hab_data: immoble?.ced_hab_data ?? null,
      ced_hab_caduc: immoble?.ced_hab_caduc ?? null
    },
    validate: {
      via: (v) => (v.trim() ? null : t('comu.obligatori')),
      num_via: (v) => (v.trim() ? null : t('comu.obligatori')),
      pis: (v) => (v.trim() ? null : t('comu.obligatori')),
      codi_postal: (v) => (v.trim() ? null : t('comu.obligatori')),
      localitat: (v) => (v.trim() ? null : t('comu.obligatori')),
      provincia: (v) => (v.trim() ? null : t('comu.obligatori')),
      ref_catastral: (v) => (v.trim() ? null : t('comu.obligatori')),
      superficie_m2: (v) => {
        if (!v.trim()) return t('comu.obligatori')
        const n = aNumero(v)
        return n === null || n < 0 ? t('immobles.validacio.numero') : null
      },
      superficie_pati: (v) => {
        if (!v.trim()) return null
        const n = aNumero(v)
        return n === null || n < 0 ? t('immobles.validacio.numero') : null
      }
    }
  })

  async function desar(v: Valors): Promise<void> {
    const dades: ImmobleDades = {
      via: v.via.trim(),
      num_via: v.num_via.trim(),
      pis: v.pis.trim(),
      porta: buitANull(v.porta),
      codi_postal: v.codi_postal.trim(),
      localitat: v.localitat.trim(),
      provincia: v.provincia.trim(),
      ref_catastral: v.ref_catastral.trim(),
      superficie_m2: aNumero(v.superficie_m2) as number, // ja validat: no és buit
      superficie_pati: aNumero(v.superficie_pati),
      cert_en_reg: buitANull(v.cert_en_reg),
      cert_en_class: buitANull(v.cert_en_class),
      cert_en_data: v.cert_en_data,
      cert_en_caduc: v.cert_en_caduc,
      ced_hab_reg: buitANull(v.ced_hab_reg),
      ced_hab_data: v.ced_hab_data,
      ced_hab_caduc: v.ced_hab_caduc
    }
    const correcte = immoble
      ? esOk(await window.api.inmobles.actualitzar(immoble.id, dades))
      : esOk(await window.api.inmobles.crear(dades))
    if (!correcte) return

    notifications.show({ color: 'green', message: t('immobles.desat') })
    navigate('/immobles')
  }

  return (
    <form onSubmit={form.onSubmit(desar)}>
      <Stack>
        <Fieldset legend={t('immobles.seccions.adreca')}>
          <SimpleGrid cols={{ base: 1, sm: 2 }}>
            <TextInput
              withAsterisk
              label={t('immobles.camps.via')}
              {...form.getInputProps('via')}
            />
            <TextInput
              withAsterisk
              label={t('immobles.camps.numVia')}
              {...form.getInputProps('num_via')}
            />
            <TextInput
              withAsterisk
              label={t('immobles.camps.pis')}
              {...form.getInputProps('pis')}
            />
            <TextInput label={t('immobles.camps.porta')} {...form.getInputProps('porta')} />
            <TextInput
              withAsterisk
              label={t('immobles.camps.codiPostal')}
              {...form.getInputProps('codi_postal')}
            />
            <TextInput
              withAsterisk
              label={t('immobles.camps.localitat')}
              {...form.getInputProps('localitat')}
            />
            <TextInput
              withAsterisk
              label={t('immobles.camps.provincia')}
              {...form.getInputProps('provincia')}
            />
          </SimpleGrid>
        </Fieldset>

        <Fieldset legend={t('immobles.seccions.cadastre')}>
          <SimpleGrid cols={{ base: 1, sm: 2 }}>
            <TextInput
              withAsterisk
              label={t('immobles.camps.refCatastral')}
              {...form.getInputProps('ref_catastral')}
            />
            <TextInput
              withAsterisk
              inputMode="decimal"
              label={t('immobles.camps.superficie')}
              {...form.getInputProps('superficie_m2')}
            />
            <TextInput
              inputMode="decimal"
              label={t('immobles.camps.superficiePati')}
              {...form.getInputProps('superficie_pati')}
            />
          </SimpleGrid>
        </Fieldset>

        <Fieldset legend={t('immobles.seccions.certificat')}>
          <SimpleGrid cols={{ base: 1, sm: 2 }}>
            <TextInput
              label={t('immobles.camps.registre')}
              {...form.getInputProps('cert_en_reg')}
            />
            <TextInput
              label={t('immobles.camps.classe')}
              {...form.getInputProps('cert_en_class')}
            />
            <DatePickerInput
              clearable
              valueFormat="DD/MM/YYYY"
              label={t('immobles.camps.data')}
              {...form.getInputProps('cert_en_data')}
            />
            <DatePickerInput
              clearable
              valueFormat="DD/MM/YYYY"
              label={t('immobles.camps.caducitat')}
              {...form.getInputProps('cert_en_caduc')}
            />
          </SimpleGrid>
        </Fieldset>

        <Fieldset legend={t('immobles.seccions.cedula')}>
          <SimpleGrid cols={{ base: 1, sm: 2 }}>
            <TextInput
              label={t('immobles.camps.registre')}
              {...form.getInputProps('ced_hab_reg')}
            />
            <div />
            <DatePickerInput
              clearable
              valueFormat="DD/MM/YYYY"
              label={t('immobles.camps.data')}
              {...form.getInputProps('ced_hab_data')}
            />
            <DatePickerInput
              clearable
              valueFormat="DD/MM/YYYY"
              label={t('immobles.camps.caducitat')}
              {...form.getInputProps('ced_hab_caduc')}
            />
          </SimpleGrid>
        </Fieldset>

        <Group justify="flex-end">
          <Button variant="default" onClick={() => navigate('/immobles')}>
            {t('comu.cancellar')}
          </Button>
          <Button type="submit">{t('comu.desar')}</Button>
        </Group>
      </Stack>
    </form>
  )
}

export default FormulariImmoble
