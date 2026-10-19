import { useEffect, useState } from 'react'
import { ActionIcon, Alert, Button, Group, Select, Table, Text, Tooltip } from '@mantine/core'
import { modals } from '@mantine/modals'
import { notifications } from '@mantine/notifications'
import { IconExternalLink, IconPaperclip, IconPencil, IconTrash } from '@tabler/icons-react'
import { useTranslation } from 'react-i18next'
import { formatData } from '../utils/dates'
import { esOk } from '../utils/resultat'
import EditarDocument from './EditarDocument'
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

  // S'obre amb l'aplicació del sistema. Si el fitxer ja no és al disc, esOk mostra
  // l'error traduït (FITXER_NO_TROBAT).
  async function obrir(d: DocumentLlistat): Promise<void> {
    esOk(await window.api.documents.obrir(d.id))
  }

  function editar(d: DocumentLlistat): void {
    modals.open({
      title: t('documents.editar.titol'),
      children: (
        <EditarDocument document={d} tipus={tipus} onDesat={() => setVersio((v) => v + 1)} />
      )
    })
  }

  function demanarEliminar(d: DocumentLlistat): void {
    modals.openConfirmModal({
      title: t('documents.eliminar.titol'),
      children: (
        <Text size="sm">{t('documents.eliminar.confirmacio', { nom: d.nom_original })}</Text>
      ),
      labels: { confirm: t('comu.eliminar'), cancel: t('comu.cancellar') },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        const resposta = await window.api.documents.eliminar(d.id)
        if (!esOk(resposta)) return
        notifications.show({ color: 'green', message: t('documents.eliminat') })
        setVersio((v) => v + 1)
      }
    })
  }

  // Dades de la fiança informades però sense el document adjunt de la classe corresponent.
  // Només s'avisa un cop carregada la llista, per no parpellejar.
  const faltaModel2 =
    !carregant &&
    contracte.fianca_data_model2 !== null &&
    !documents.some((d) => d.tipus_classe === 'fianca_model2')
  const faltaNotificacio =
    !carregant &&
    contracte.fianca_data_notificacio !== null &&
    !documents.some((d) => d.tipus_classe === 'fianca_notificacio')
  const faltaModel3 =
    !carregant &&
    contracte.devolucio_data_sollicitud !== null &&
    !documents.some((d) => d.tipus_classe === 'fianca_model3')

  return (
    <>
      {(faltaModel2 || faltaNotificacio || faltaModel3) && (
        <Alert color="orange" mb="md">
          {faltaModel2 && <Text size="sm">{t('documents.avis.model2')}</Text>}
          {faltaNotificacio && <Text size="sm">{t('documents.avis.notificacio')}</Text>}
          {faltaModel3 && <Text size="sm">{t('documents.avis.model3')}</Text>}
        </Alert>
      )}
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
              <Table.Th colSpan={3} />
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
                <Table.Td style={{ width: 1 }}>
                  <Tooltip label={t('documents.obrir')}>
                    <ActionIcon
                      variant="subtle"
                      aria-label={t('documents.obrir')}
                      onClick={() => obrir(d)}
                    >
                      <IconExternalLink size={18} />
                    </ActionIcon>
                  </Tooltip>
                </Table.Td>
                <Table.Td style={{ width: 1 }}>
                  <Tooltip label={t('comu.editar')}>
                    <ActionIcon
                      variant="subtle"
                      aria-label={t('comu.editar')}
                      onClick={() => editar(d)}
                    >
                      <IconPencil size={18} />
                    </ActionIcon>
                  </Tooltip>
                </Table.Td>
                <Table.Td style={{ width: 1 }}>
                  <Tooltip label={t('comu.eliminar')}>
                    <ActionIcon
                      variant="subtle"
                      color="red"
                      aria-label={t('comu.eliminar')}
                      onClick={() => demanarEliminar(d)}
                    >
                      <IconTrash size={18} />
                    </ActionIcon>
                  </Tooltip>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      )}
    </>
  )
}

export default DocumentsContracte
