import { useEffect, useState } from 'react'
import { Button, Group, Select, Table, Text } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { IconPaperclip } from '@tabler/icons-react'
import { useTranslation } from 'react-i18next'
import { formatData } from '../utils/dates'
import { esOk } from '../utils/resultat'
import type { Contracte, DocumentLlistat, TipusDocument } from '../../../shared/tipus'

// Documents adjunts d'un contracte (pestanya "Documents" de la fitxa).
function DocumentsContracte({ contracte }: { contracte: Contracte }): React.JSX.Element {
  const { t } = useTranslation()
  const [documents, setDocuments] = useState<DocumentLlistat[]>([])
  const [tipus, setTipus] = useState<TipusDocument[]>([])
  const [tipusTriat, setTipusTriat] = useState<string | null>(null)
  const [carregant, setCarregant] = useState(true)
  const [adjuntant, setAdjuntant] = useState(false)
  // Cada cop que canvia, l'efecte torna a llegir la llista de la BD.
  const [versio, setVersio] = useState(0)

  useEffect(() => {
    let cancelat = false
    Promise.all([
      window.api.documents.obtenir(contracte.id),
      window.api.tipusDocument.obtenir()
    ]).then(([rDocuments, rTipus]) => {
      if (cancelat) return
      if (esOk(rDocuments)) setDocuments(rDocuments.dades)
      if (esOk(rTipus)) {
        setTipus(rTipus.dades)
        // Tipus per defecte: el primer de classe "contracte". No trepitja una tria ja feta.
        const perDefecte = rTipus.dades.find((x) => x.classe === 'contracte') ?? rTipus.dades[0]
        setTipusTriat((actual) => actual ?? (perDefecte ? String(perDefecte.id) : null))
      }
      setCarregant(false)
    })
    // Si el component es desmunta abans que arribin les respostes, no s'actualitza l'estat.
    return () => {
      cancelat = true
    }
  }, [contracte.id, versio])

  async function adjuntar(): Promise<void> {
    if (tipusTriat === null) return
    setAdjuntant(true)
    // El diàleg de selecció s'obre al Main; el Renderer només envia el tipus i el títol.
    const resposta = await window.api.documents.adjuntar(
      contracte.id,
      Number(tipusTriat),
      t('documents.adjuntar.dialeg')
    )
    setAdjuntant(false)
    // Una llista buida vol dir que l'usuari ha cancel·lat el diàleg: no cal notificar res.
    if (!esOk(resposta) || resposta.dades.length === 0) return
    notifications.show({
      color: 'green',
      message: t('documents.adjuntats', { count: resposta.dades.length })
    })
    setVersio((v) => v + 1)
  }

  return (
    <>
      <Group align="flex-end" mb="md">
        <Select
          label={t('documents.camps.tipus')}
          data={tipus.map((x) => ({ value: String(x.id), label: x.nom }))}
          value={tipusTriat}
          onChange={setTipusTriat}
        />
        <Button
          leftSection={<IconPaperclip size={16} />}
          loading={adjuntant}
          disabled={tipusTriat === null}
          onClick={adjuntar}
        >
          {t('documents.adjuntar.boto')}
        </Button>
      </Group>

      {carregant && <Text c="dimmed">{t('comu.carregant')}</Text>}
      {!carregant && documents.length === 0 && <Text c="dimmed">{t('documents.buit')}</Text>}

      {documents.length > 0 && (
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>{t('documents.camps.tipus')}</Table.Th>
              <Table.Th>{t('documents.camps.fitxer')}</Table.Th>
              <Table.Th>{t('documents.camps.data')}</Table.Th>
              <Table.Th>{t('documents.camps.comentaris')}</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {documents.map((d) => (
              <Table.Tr key={d.id}>
                {/* El nom del tipus és dada de l'usuari: no es tradueix. */}
                <Table.Td>{d.tipus_nom}</Table.Td>
                <Table.Td>{d.nom_original}</Table.Td>
                <Table.Td>{formatData(d.data_document)}</Table.Td>
                <Table.Td>{d.comentaris}</Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      )}
    </>
  )
}

export default DocumentsContracte
