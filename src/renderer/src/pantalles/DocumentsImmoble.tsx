import { useEffect, useState } from 'react'
import { ActionIcon, Button, Group, Menu, Stack, Table, Text, Title, Tooltip } from '@mantine/core'
import { modals } from '@mantine/modals'
import { notifications } from '@mantine/notifications'
import {
  IconCornerUpLeft,
  IconDots,
  IconEye,
  IconPencil,
  IconPlus,
  IconTrash
} from '@tabler/icons-react'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { adreca } from '../utils/adreca'
import { formatData } from '../utils/dates'
import { esOk } from '../utils/resultat'
import AfegirDocumentImmoble from './AfegirDocumentImmoble'
import EditarDocumentImmoble from './EditarDocumentImmoble'
import { TIPUS_UNICS_IMMOBLE } from '../../../shared/tipus'
import type { DocumentImmoble, Immoble } from '../../../shared/tipus'
import { useTornar } from '../utils/useTornar'

// Documents d'un immoble (/immobles/:id/documents). Les accions van a la capçalera, no a sota.
// Els tipus únics (certificat, cèdula i fitxa cadastral) aquí només es poden visualitzar i eliminar: s'afegeixen
// i s'editen des de l'edició de l'immoble.
function DocumentsImmoble(): React.JSX.Element {
  const { t } = useTranslation()
  const { id } = useParams()
  const [immoble, setImmoble] = useState<Immoble | null>(null)
  const [documents, setDocuments] = useState<DocumentImmoble[]>([])
  const [carregant, setCarregant] = useState(true)
  // Cada cop que canvia, l'efecte torna a llegir la llista de la BD.
  const [versio, setVersio] = useState(0)
  // Torna a la pantalla que ha cridat aquesta (la llista d'Immobles o l'edició de l'immoble). Per defecte, l'edició
  // de l'immoble; si l'immoble no existeix, la llista d'Immobles.
  const tornar = useTornar(immoble === null ? '/immobles' : `/immobles/${id}`)

  useEffect(() => {
    let cancelat = false
    Promise.all([
      window.api.inmobles.obtenirUn(Number(id)),
      window.api.documentsImmoble.obtenir(Number(id))
    ]).then(([rImmoble, rDocuments]) => {
      if (cancelat) return
      if (esOk(rImmoble)) setImmoble(rImmoble.dades)
      if (esOk(rDocuments)) setDocuments(rDocuments.dades)
      setCarregant(false)
    })
    // Si el component es desmunta abans que arribin les respostes, no s'actualitza l'estat.
    return () => {
      cancelat = true
    }
  }, [id, versio])

  const recarregar = (): void => setVersio((v) => v + 1)

  const esUnic = (d: DocumentImmoble): boolean =>
    (TIPUS_UNICS_IMMOBLE as readonly string[]).includes(d.tipus)

  // La data d'un certificat o d'una cèdula és la de la seva secció a l'immoble; la dels altres tipus, la del document.
  function dataDe(d: DocumentImmoble): string | null {
    if (d.tipus === 'certificat_energetic') return immoble?.cert_en_data ?? null
    if (d.tipus === 'cedula_habitabilitat') return immoble?.ced_hab_data ?? null
    return d.data_document
  }

  // S'obre amb l'aplicació del sistema. Si el fitxer ja no és al disc, esOk mostra l'error traduït.
  async function visualitzar(d: DocumentImmoble): Promise<void> {
    esOk(await window.api.documentsImmoble.obrir(d.id))
  }

  function afegir(): void {
    if (!immoble) return
    modals.open({
      title: t('documentsImmoble.afegir.titol'),
      children: <AfegirDocumentImmoble idInmoble={immoble.id} onAfegits={recarregar} />
    })
  }

  function editar(d: DocumentImmoble): void {
    modals.open({
      title: t('documentsImmoble.editar.titol'),
      children: <EditarDocumentImmoble document={d} onDesat={recarregar} />
    })
  }

  function demanarEliminar(d: DocumentImmoble): void {
    modals.openConfirmModal({
      title: t('documentsImmoble.eliminar.titol'),
      children: (
        <Text size="sm">{t('documentsImmoble.eliminar.confirmacio', { nom: d.nom_original })}</Text>
      ),
      labels: { confirm: t('comu.eliminar'), cancel: t('comu.cancellar') },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        const resposta = await window.api.documentsImmoble.eliminar(d.id)
        if (!esOk(resposta)) return
        notifications.show({ color: 'green', message: t('documentsImmoble.eliminat') })
        recarregar()
      }
    })
  }

  return (
    <>
      {carregant && <Text c="dimmed">{t('comu.carregant')}</Text>}

      {!carregant && immoble === null && (
        <>
          <Text c="dimmed">{t('immobles.noTrobat')}</Text>
          <Button mt="md" variant="default" onClick={tornar}>
            {t('comu.tornar')}
          </Button>
        </>
      )}

      {immoble && (
        <>
          <Stack gap="sm" mb="md">
            <div>
              <Group justify="space-between">
                <Title order={2}>{t('documentsImmoble.titol')}</Title>
                <Button
                  variant="default"
                  onClick={tornar}
                  leftSection={<IconCornerUpLeft size={16} />}
                >
                  {t('comu.tornar')}
                </Button>
              </Group>

              <Text c="dimmed">{adreca(immoble)}</Text>
            </div>
            {/* Mateixa fila que a l'edició d'immoble: Afegir a l'esquerra, Tornar a la dreta. */}
            <Group justify="space-between">
              <Button leftSection={<IconPlus size={16} />} onClick={afegir}>
                {t('comu.afegir')}
              </Button>
            </Group>
          </Stack>

          {documents.length === 0 && <Text c="dimmed">{t('documentsImmoble.buit')}</Text>}

          {documents.length > 0 && (
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th />
                  <Table.Th>{t('documentsImmoble.camps.tipus')}</Table.Th>
                  <Table.Th>{t('documentsImmoble.camps.fitxer')}</Table.Th>
                  <Table.Th>{t('documentsImmoble.camps.data')}</Table.Th>
                  <Table.Th>{t('documentsImmoble.camps.comentaris')}</Table.Th>
                  <Table.Th>{t('comu.accions')}</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {documents.map((d) => (
                  <Table.Tr key={d.id}>
                    <Table.Td>
                      <Tooltip label={t('documentsImmoble.visualitzar')}>
                        <ActionIcon
                          variant="subtle"
                          aria-label={t('documentsImmoble.visualitzar')}
                          onClick={() => visualitzar(d)}
                        >
                          <IconEye size={18} />
                        </ActionIcon>
                      </Tooltip>
                    </Table.Td>
                    <Table.Td>{t(`documentsImmoble.tipus.${d.tipus}`)}</Table.Td>
                    <Table.Td>{d.nom_original}</Table.Td>
                    <Table.Td>{formatData(dataDe(d))}</Table.Td>
                    <Table.Td>{d.comentaris}</Table.Td>
                    <Table.Td style={{ width: 1 }}>
                      <Menu position="bottom-end" withinPortal>
                        <Menu.Target>
                          <Tooltip label={t('comu.accions')}>
                            <ActionIcon variant="subtle" aria-label={t('comu.accions')}>
                              <IconDots size={18} />
                            </ActionIcon>
                          </Tooltip>
                        </Menu.Target>
                        <Menu.Dropdown>
                          <Menu.Item
                            leftSection={<IconEye size={16} />}
                            onClick={() => visualitzar(d)}
                          >
                            {t('documentsImmoble.visualitzar')}
                          </Menu.Item>
                          {!esUnic(d) && (
                            <Menu.Item
                              leftSection={<IconPencil size={16} />}
                              onClick={() => editar(d)}
                            >
                              {t('comu.editar')}
                            </Menu.Item>
                          )}
                          <Menu.Divider />
                          <Menu.Item
                            color="red"
                            leftSection={<IconTrash size={16} />}
                            onClick={() => demanarEliminar(d)}
                          >
                            {t('comu.eliminar')}
                          </Menu.Item>
                        </Menu.Dropdown>
                      </Menu>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          )}
        </>
      )}
    </>
  )
}

export default DocumentsImmoble
