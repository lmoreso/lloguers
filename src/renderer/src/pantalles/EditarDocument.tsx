import { useState } from 'react'
import { Button, Group, Select, Stack, Textarea } from '@mantine/core'
import { DatePickerInput } from '@mantine/dates'
import { modals } from '@mantine/modals'
import { notifications } from '@mantine/notifications'
import { useTranslation } from 'react-i18next'
import { buitANull } from '../utils/formulari'
import { esOk } from '../utils/resultat'
import type { DocumentLlistat, TipusDocument } from '../../../shared/tipus'

interface Props {
  document: DocumentLlistat
  tipus: TipusDocument[]
  onDesat: () => void
}

// Contingut de la finestra d'edició d'un document ja adjuntat. El fitxer no es canvia:
// només el tipus, la data del document i els comentaris.
function EditarDocument({ document, tipus, onDesat }: Props): React.JSX.Element {
  const { t } = useTranslation()
  const [idTipus, setIdTipus] = useState<string | null>(String(document.id_tipus))
  const [data, setData] = useState<string | null>(document.data_document)
  const [comentaris, setComentaris] = useState(document.comentaris ?? '')

  async function desar(): Promise<void> {
    if (idTipus === null) return
    const resposta = await window.api.documents.actualitzar(document.id, {
      id_tipus: Number(idTipus),
      comentaris: buitANull(comentaris),
      data_document: data
    })
    if (!esOk(resposta)) return

    modals.closeAll()
    notifications.show({ color: 'green', message: t('documents.desat') })
    onDesat()
  }

  return (
    <Stack>
      <Select
        allowDeselect={false}
        label={t('documents.camps.tipus')}
        data={tipus.map((x) => ({ value: String(x.id), label: x.nom }))}
        value={idTipus}
        onChange={setIdTipus}
      />
      <DatePickerInput
        clearable
        valueFormat="DD/MM/YYYY"
        label={t('documents.camps.data')}
        value={data}
        onChange={setData}
      />
      <Textarea
        autosize
        minRows={2}
        label={t('documents.camps.comentaris')}
        value={comentaris}
        onChange={(e) => setComentaris(e.currentTarget.value)}
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

export default EditarDocument
