import { useState } from 'react'
import { Button, Group, Stack, Textarea } from '@mantine/core'
import { DatePickerInput } from '@mantine/dates'
import { modals } from '@mantine/modals'
import { notifications } from '@mantine/notifications'
import { IconPaperclip } from '@tabler/icons-react'
import { useTranslation } from 'react-i18next'
import { esOk } from '../utils/resultat'
import type { TipusDocumentImmoble } from '../../../shared/tipus'

interface Props {
  idInmoble: number
  tipus: TipusDocumentImmoble
  ambData: boolean // només la fitxa cadastral: no té cap data a l'immoble
  onAfegit: () => void
}

// Contingut de la finestra "Afegir" d'un document únic (certificat, cèdula o fitxa cadastral): comentari
// opcional i, a la fitxa cadastral, la data. El diàleg de selecció s'obre al Main i només deixa triar un fitxer.
function AfegirDocumentUnic({ idInmoble, tipus, ambData, onAfegit }: Props): React.JSX.Element {
  const { t } = useTranslation()
  const [comentari, setComentari] = useState('')
  const [data, setData] = useState<string | null>(null)
  const [adjuntant, setAdjuntant] = useState(false)

  async function triar(): Promise<void> {
    setAdjuntant(true)
    const resposta = await window.api.documentsImmoble.adjuntar(
      idInmoble,
      { tipus, comentaris: comentari.trim(), data_document: ambData ? data : null },
      t('documentsImmoble.unic.dialeg')
    )
    setAdjuntant(false)
    if (!esOk(resposta)) return
    // Una llista buida vol dir que l'usuari ha cancel·lat el diàleg: la finestra es queda oberta.
    if (resposta.dades.length === 0) return

    modals.closeAll()
    notifications.show({ color: 'green', message: t('documents.adjuntats', { count: 1 }) })
    onAfegit()
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
        <Button variant="default" disabled={adjuntant} onClick={() => modals.closeAll()}>
          {t('comu.cancellar')}
        </Button>
        <Button leftSection={<IconPaperclip size={16} />} loading={adjuntant} onClick={triar}>
          {t('documentsImmoble.unic.triar')}
        </Button>
      </Group>
    </Stack>
  )
}

export default AfegirDocumentUnic
