import { useState } from 'react'
import { Button, Group, Select, Stack, Textarea } from '@mantine/core'
import { modals } from '@mantine/modals'
import { notifications } from '@mantine/notifications'
import { IconPaperclip } from '@tabler/icons-react'
import { useTranslation } from 'react-i18next'
import { CampData } from '../components/CampData'
import { buitANull } from '../utils/formulari'
import { esOk } from '../utils/resultat'
import type { TipusDocument } from '../../../shared/tipus'

interface Props {
  idContracte: number
  tipus: TipusDocument[]
  onAfegits: () => void // es crida quan s'ha adjuntat algun document
}

// Contingut de la finestra "Afegir documents": tipus, data i comentari (tots dos opcionals), comuns a tots els
// fitxers que es triïn. El diàleg de selecció s'obre al Main en prémer "Triar fitxers".
function AfegirDocument({ idContracte, tipus, onAfegits }: Props): React.JSX.Element {
  const { t } = useTranslation()
  // Tipus per defecte: el primer de classe "contracte".
  const inicial = tipus.find((x) => x.classe === 'contracte') ?? tipus[0]
  const [tipusTriat, setTipusTriat] = useState<string | null>(inicial ? String(inicial.id) : null)
  const [data, setData] = useState<string | null>(null)
  const [comentari, setComentari] = useState('')
  const [adjuntant, setAdjuntant] = useState(false)

  async function triar(): Promise<void> {
    if (tipusTriat === null) return
    setAdjuntant(true)
    const resposta = await window.api.documents.adjuntar(
      idContracte,
      {
        id_tipus: Number(tipusTriat),
        comentaris: buitANull(comentari),
        data_document: data
      },
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
        data={tipus.map((x) => ({ value: String(x.id), label: x.nom }))}
        value={tipusTriat}
        onChange={setTipusTriat}
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
        <Button
          leftSection={<IconPaperclip size={16} />}
          loading={adjuntant}
          disabled={tipusTriat === null}
          onClick={triar}
        >
          {t('documents.afegir.triar')}
        </Button>
      </Group>
    </Stack>
  )
}

export default AfegirDocument
