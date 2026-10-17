import { useEffect, useState } from 'react'
import { Table, Text } from '@mantine/core'
import { useTranslation } from 'react-i18next'
import { formatData } from '../utils/dates'
import { esOk } from '../utils/resultat'
import type { Contracte, DocumentLlistat } from '../../../shared/tipus'

// Documents adjunts d'un contracte (pestanya "Documents" de la fitxa).
function DocumentsContracte({ contracte }: { contracte: Contracte }): React.JSX.Element {
  const { t } = useTranslation()
  const [documents, setDocuments] = useState<DocumentLlistat[]>([])
  const [carregant, setCarregant] = useState(true)

  useEffect(() => {
    let cancelat = false
    window.api.documents.obtenir(contracte.id).then((resposta) => {
      if (cancelat) return
      if (esOk(resposta)) setDocuments(resposta.dades)
      setCarregant(false)
    })
    // Si el component es desmunta abans que arribi la resposta, no s'actualitza l'estat.
    return () => {
      cancelat = true
    }
  }, [contracte.id])

  return (
    <>
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
