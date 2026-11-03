import { useState } from 'react'
import { Button, Group, Select, Stack, Textarea } from '@mantine/core'
import { modals } from '@mantine/modals'
import { notifications } from '@mantine/notifications'
import { IconPaperclip } from '@tabler/icons-react'
import { useTranslation } from 'react-i18next'
import { CampData } from '../components/CampData'
import { buitANull } from '../utils/formulari'
import { esOk } from '../utils/resultat'
import { TIPUS_DOCUMENT_CONTRACTE } from '../../../shared/tipus'
import type { TipusDocumentContracte } from '../../../shared/tipus'

interface Props {
  idContracte: number
  onAfegits: () => void // es crida quan s'ha adjuntat algun document
}

// Contingut de la finestra "Afegir documents": tipus, data i comentari (tots dos opcionals), comuns a tots els
// fitxers que es triïn. El diàleg de selecció s'obre al Main en prémer "Triar fitxers".
function AfegirDocument({ idContracte, onAfegits }: Props): React.JSX.Element {
  const { t } = useTranslation()
  const [tipus, setTipus] = useState<TipusDocumentContracte>('contracte')
  const [data, setData] = useState<string | null>(null)
  const [comentari, setComentari] = useState('')
  const [adjuntant, setAdjuntant] = useState(false)

  async function triar(): Promise<void> {
    setAdjuntant(true)
    const resposta = await window.api.documents.adjuntar(
      idContracte,
      { tipus, comentaris: buitANull(comentari), data_document: data },
      t('documents.adjuntar.dialeg')
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
        description={t('documents.afegir.ajuda')}
        value={comentari}
        onChange={(e) => setComentari(e.currentTarget.value)}
      />
      <Group justify="flex-end">
        <Button variant="default" disabled={adjuntant} onClick={() => modals.closeAll()}>
          {t('comu.cancellar')}
        </Button>
        <Button leftSection={<IconPaperclip size={16} />} loading={adjuntant} onClick={triar}>
          {t('documents.afegir.triar')}
        </Button>
      </Group>
    </Stack>
  )
}

export default AfegirDocument
