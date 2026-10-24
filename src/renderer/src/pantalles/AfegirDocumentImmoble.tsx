import { useState } from 'react'
import { Button, Group, Select, Stack, Textarea } from '@mantine/core'
import { DatePickerInput } from '@mantine/dates'
import { modals } from '@mantine/modals'
import { notifications } from '@mantine/notifications'
import { IconPaperclip } from '@tabler/icons-react'
import { useTranslation } from 'react-i18next'
import { esOk } from '../utils/resultat'
import { TIPUS_DOCUMENT_IMMOBLE } from '../../../shared/tipus'
import type { TipusDocumentImmoble } from '../../../shared/tipus'

interface Props {
  idInmoble: number
  onAfegits: () => void // es crida quan s'ha adjuntat algun document
}

// Contingut de la finestra "Afegir documents": tipus, data (opcional) i comentari (obligatori), comuns
// a tots els fitxers que es triïn. El diàleg de selecció s'obre al Main en prémer "Triar fitxers".
function AfegirDocumentImmoble({ idInmoble, onAfegits }: Props): React.JSX.Element {
  const { t } = useTranslation()
  const [tipus, setTipus] = useState<TipusDocumentImmoble>('fotos')
  const [data, setData] = useState<string | null>(null)
  const [comentari, setComentari] = useState('')
  const [adjuntant, setAdjuntant] = useState(false)

  async function triar(): Promise<void> {
    setAdjuntant(true)
    const resposta = await window.api.documentsImmoble.adjuntar(
      idInmoble,
      { tipus, comentaris: comentari.trim(), data_document: data },
      t('documentsImmoble.afegir.dialeg')
    )
    setAdjuntant(false)
    if (!esOk(resposta)) return
    // Una llista buida vol dir que l'usuari ha cancel·lat el diàleg: la finestra es queda oberta.
    if (resposta.dades.length === 0) return

    modals.closeAll()
    notifications.show({
      color: 'green',
      message: t('documents.adjuntats', { count: resposta.dades.length })
    })
    onAfegits()
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
        description={t('documentsImmoble.afegir.ajuda')}
        value={comentari}
        onChange={(e) => setComentari(e.currentTarget.value)}
      />
      <Group justify="flex-end">
        <Button variant="default" disabled={adjuntant} onClick={() => modals.closeAll()}>
          {t('comu.cancellar')}
        </Button>
        <Button
          leftSection={<IconPaperclip size={16} />}
          loading={adjuntant}
          disabled={comentari.trim() === ''}
          onClick={triar}
        >
          {t('documentsImmoble.afegir.triar')}
        </Button>
      </Group>
    </Stack>
  )
}

export default AfegirDocumentImmoble
