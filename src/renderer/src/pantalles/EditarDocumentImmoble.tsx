import { useState } from 'react'
import { Button, Group, Select, Stack, Textarea } from '@mantine/core'
import { DatePickerInput } from '@mantine/dates'
import { modals } from '@mantine/modals'
import { notifications } from '@mantine/notifications'
import { useTranslation } from 'react-i18next'
import { esOk } from '../utils/resultat'
import { TIPUS_DOCUMENT_IMMOBLE } from '../../../shared/tipus'
import type { DocumentImmoble, TipusDocumentImmoble } from '../../../shared/tipus'

interface Props {
  document: DocumentImmoble
  onDesat: () => void
}

// Contingut de la finestra d'edició d'un document d'immoble. El fitxer no es canvia: només el tipus,
// la data del document i el comentari (obligatori).
function EditarDocumentImmoble({ document, onDesat }: Props): React.JSX.Element {
  const { t } = useTranslation()
  const [tipus, setTipus] = useState<TipusDocumentImmoble>(document.tipus)
  const [data, setData] = useState<string | null>(document.data_document)
  const [comentari, setComentari] = useState(document.comentaris ?? '')
  const [error, setError] = useState<string | null>(null)

  async function desar(): Promise<void> {
    if (!comentari.trim()) {
      setError(t('comu.obligatori'))
      return
    }
    const resposta = await window.api.documentsImmoble.actualitzar(document.id, {
      tipus,
      comentaris: comentari.trim(),
      data_document: data
    })
    if (!esOk(resposta)) return

    modals.closeAll()
    notifications.show({ color: 'green', message: t('documentsImmoble.desat') })
    onDesat()
  }

  return (
    <Stack>
      <Select
        allowDeselect={false}
        label={t('documentsImmoble.camps.tipus')}
        data={TIPUS_DOCUMENT_IMMOBLE.map((c) => ({
          value: c,
          label: t(`documentsImmoble.tipus.${c}`)
        }))}
        value={tipus}
        onChange={(v) => v && setTipus(v as TipusDocumentImmoble)}
      />
      <DatePickerInput
        clearable
        valueFormat="DD/MM/YYYY"
        label={t('documentsImmoble.camps.data')}
        value={data}
        onChange={setData}
      />
      <Textarea
        withAsterisk
        autosize
        minRows={2}
        label={t('documentsImmoble.camps.comentaris')}
        value={comentari}
        onChange={(e) => {
          setComentari(e.currentTarget.value)
          setError(null)
        }}
        error={error}
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

export default EditarDocumentImmoble
