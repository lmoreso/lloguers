import { useState } from 'react'
import { Button, Group, Select, Stack, Textarea } from '@mantine/core'
import { modals } from '@mantine/modals'
import { notifications } from '@mantine/notifications'
import { useTranslation } from 'react-i18next'
import { CampData } from '../components/CampData'
import { buitANull } from '../utils/formulari'
import { esOk } from '../utils/resultat'
import { TIPUS_DOCUMENT_CONTRACTE } from '../../../shared/tipus'
import type { DocumentContracte, TipusDocumentContracte } from '../../../shared/tipus'

interface Props {
  document: DocumentContracte
  onDesat: () => void
}

// Contingut de la finestra d'edició d'un document ja adjuntat. El fitxer no es canvia:
// només el tipus, la data del document i els comentaris.
function EditarDocument({ document, onDesat }: Props): React.JSX.Element {
  const { t } = useTranslation()
  const [tipus, setTipus] = useState<TipusDocumentContracte>(document.tipus)
  const [data, setData] = useState<string | null>(document.data_document)
  const [comentaris, setComentaris] = useState(document.comentaris ?? '')

  async function desar(): Promise<void> {
    const resposta = await window.api.documents.actualitzar(document.id, {
      tipus,
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
        data={TIPUS_DOCUMENT_CONTRACTE.map((c) => ({ value: c, label: t(`documents.tipus.${c}`) }))}
        value={tipus}
        onChange={(v) => v && setTipus(v as TipusDocumentContracte)}
      />
      <CampData clearable label={t('documents.camps.data')} value={data} onChange={setData} />
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
