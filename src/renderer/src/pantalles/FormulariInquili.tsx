import { Button, Checkbox, Group, Stack, TextInput } from '@mantine/core'
import { useForm } from '@mantine/form'
import { notifications } from '@mantine/notifications'
import { useTranslation } from 'react-i18next'
import { esOk } from '../utils/resultat'
import type { Inquili, InquiliDades } from '../../../shared/tipus'
import { buitANull } from '../utils/formulari'

interface Props {
  inquili: Inquili | null // null = nou inquilí
  onTancar: () => void
  onDesat: () => void
}

function FormulariInquili({ inquili, onTancar, onDesat }: Props): React.JSX.Element {
  const { t } = useTranslation()

  const form = useForm({
    initialValues: {
      nom: inquili?.nom ?? '',
      cognoms: inquili?.cognoms ?? '',
      nif: inquili?.nif ?? '',
      telefon_1: inquili?.telefon_1 ?? '',
      ck_tel1_wassap: inquili?.ck_tel1_wassap ?? false,
      ck_tel1_bizum: inquili?.ck_tel1_bizum ?? false
    },
    validate: {
      nom: (valor, valors) =>
        !valor.trim() && !valors.cognoms.trim() ? t('inquilins.validacio.nomOCognoms') : null
    }
  })

  async function desar(valors: typeof form.values): Promise<void> {
    const dades: InquiliDades = {
      nom: buitANull(valors.nom),
      cognoms: buitANull(valors.cognoms),
      nif: buitANull(valors.nif),
      telefon_1: buitANull(valors.telefon_1),
      ck_tel1_wassap: valors.ck_tel1_wassap,
      ck_tel1_bizum: valors.ck_tel1_bizum
    }
    const correcte = inquili
      ? esOk(await window.api.inquilins.actualitzar(inquili.id, dades))
      : esOk(await window.api.inquilins.crear(dades))
    if (!correcte) return

    notifications.show({ color: 'green', message: t('inquilins.desat') })
    onDesat()
  }

  return (
    <form onSubmit={form.onSubmit(desar)}>
      <Stack>
        <TextInput label={t('inquilins.camps.nom')} {...form.getInputProps('nom')} />
        <TextInput label={t('inquilins.camps.cognoms')} {...form.getInputProps('cognoms')} />
        <TextInput label={t('inquilins.camps.nif')} {...form.getInputProps('nif')} />
        <TextInput label={t('inquilins.camps.telefon')} {...form.getInputProps('telefon_1')} />
        <Checkbox
          label={t('inquilins.camps.wassap')}
          {...form.getInputProps('ck_tel1_wassap', { type: 'checkbox' })}
        />
        <Checkbox
          label={t('inquilins.camps.bizum')}
          {...form.getInputProps('ck_tel1_bizum', { type: 'checkbox' })}
        />
        <Group justify="flex-end">
          <Button variant="default" onClick={onTancar}>
            {t('comu.cancellar')}
          </Button>
          <Button type="submit">{t('comu.desar')}</Button>
        </Group>
      </Stack>
    </form>
  )
}

export default FormulariInquili
