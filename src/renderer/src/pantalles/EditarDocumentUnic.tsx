import { useState } from 'react'
import { Button, Group, Stack, Textarea } from '@mantine/core'
import { DatePickerInput } from '@mantine/dates'
import { modals } from '@mantine/modals'
import { notifications } from '@mantine/notifications'
import { useTranslation } from 'react-i18next'
import { buitANull } from '../utils/formulari'
import { esOk } from '../utils/resultat'
import type { DocumentImmoble } from '../../../shared/tipus'

interface Props {
  doc: DocumentImmoble
  ambData: boolean // només la fitxa cadastral
  onDesat: () => void
}

// Contingut de la finestra "Editar" d'un document únic: el comentari (opcional) i, a la fitxa cadastral, la data.
// El fitxer no se substitueix: per canviar-lo, s'elimina i se'n torna a adjuntar un.
function EditarDocumentUnic({ doc, ambData, onDesat }: Props): React.JSX.Element {
  const { t } = useTranslation()
  const [comentari, setComentari] = useState(doc.comentaris ?? '')
  const [data, setData] = useState<string | null>(doc.data_document)

  async function desar(): Promise<void> {
    const resposta = await window.api.documentsImmoble.actualitzar(doc.id, {
      tipus: doc.tipus,
      comentaris: buitANull(comentari),
      data_document: ambData ? data : doc.data_document
    })
    if (!esOk(resposta)) return

    modals.closeAll()
    notifications.show({ color: 'green', message: t('documentsImmoble.desat') })
    onDesat()
  }

  return (
    <Stack>
      <Textarea
        autosize
        minRows={2}
        label={t('documentsImmoble.camps.comentaris')}
        value={comentari}
        onChange={(e) => setComentari(e.currentTarget.value)}
      />
      {ambData && (
        <DatePickerInput
          clearable
          valueFormat="DD/MM/YYYY"
          label={t('documentsImmoble.camps.data')}
          value={data}
          onChange={setData}
        />
      )}
      <Group justify="flex-end">
        <Button variant="default" onClick={() => modals.closeAll()}>
          {t('comu.cancellar')}
        </Button>
        <Button onClick={desar}>{t('comu.desar')}</Button>
      </Group>
    </Stack>
  )
}

export default EditarDocumentUnic
