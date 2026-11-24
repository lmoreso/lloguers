import { useEffect, useState } from 'react'
import {
  ActionIcon,
  Alert,
  Button,
  Group,
  Menu,
  Stack,
  Table,
  Text,
  Title,
  Tooltip
} from '@mantine/core'
import { modals } from '@mantine/modals'
import { notifications } from '@mantine/notifications'
import {
  IconCornerUpLeft,
  IconDots,
  // IconExternalLink,
  IconEye,
  IconPencil,
  IconPlus,
  IconTrash
} from '@tabler/icons-react'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { adreca } from '../../../shared/utilitats'
import { formatData } from '../../../shared/utilitats'
import { esOk } from '../utils/resultat'
import AfegirDocument from './AfegirDocument'
import EditarDocument from './EditarDocument'
import type { Contracte, DocumentContracte, Immoble } from '../../../shared/tipus'
import { TIPUS_LLIGATS_CONTRACTE, TIPUS_UNICS_CONTRACTE } from '../../../shared/tipus'
import { useTornar } from '../utils/useTornar'

// Documents d'un contracte (/immobles/:id/contractes/:idContracte/documents). Les accions van a la capçalera,
// no a sota.
function DocumentsContracte(): React.JSX.Element {
  const { t } = useTranslation()
  const { id, idContracte } = useParams()
  const [immoble, setImmoble] = useState<Immoble | null>(null)
  const [contracte, setContracte] = useState<Contracte | null>(null)
  const [documents, setDocuments] = useState<DocumentContracte[]>([])
  const [carregant, setCarregant] = useState(true)
  // Cada cop que canvia, l'efecte torna a llegir la llista de la BD.
  const [versio, setVersio] = useState(0)

  useEffect(() => {
    let cancelat = false
    Promise.all([
      window.api.inmobles.obtenirUn(Number(id)),
      window.api.contractes.obtenirUn(Number(idContracte)),
      window.api.documents.obtenir(Number(idContracte))
    ]).then(([rImmoble, rContracte, rDocuments]) => {
      if (cancelat) return
      if (esOk(rImmoble)) setImmoble(rImmoble.dades)
      if (esOk(rContracte)) setContracte(rContracte.dades)
      if (esOk(rDocuments)) setDocuments(rDocuments.dades)
      setCarregant(false)
    })
    // Si el component es desmunta abans que arribin les respostes, no s'actualitza l'estat.
    return () => {
      cancelat = true
    }
  }, [id, idContracte, versio])

  const recarregar = (): void => setVersio((v) => v + 1)
  const esUnic = (d: DocumentContracte): boolean =>
    (TIPUS_UNICS_CONTRACTE as readonly string[]).includes(d.tipus) ||
    (TIPUS_LLIGATS_CONTRACTE as readonly string[]).includes(d.tipus)

  // La data d'un document únic és la de la seva secció del contracte (sempre va sincronitzada); la dels altres
  // tipus, la del document.
  function dataDe(d: DocumentContracte): string | null {
    if (d.tipus === 'contracte') return contracte?.data_inici ?? null
    if (d.tipus === 'fianca_model2') return contracte?.fianca_data_model2 ?? null
    if (d.tipus === 'fianca_notificacio') return contracte?.fianca_data_notificacio ?? null
    if (d.tipus === 'fianca_model3') return contracte?.devolucio_data_sollicitud ?? null
    return d.data_document
  }

  // Un contracte que no existeix, o que és d'un altre immoble, es tracta com a no trobat.
  const noTrobat =
    !carregant && (immoble === null || contracte === null || contracte.id_inmoble !== Number(id))

  const tornar = useTornar(`/immobles/${id}/contractes/${idContracte}`)
  // Per al missatge de "no trobat": si no n'hi ha cap pantalla anterior, a la llista de contractes (o a Immobles, si l'immoble no existeix).
  const tornarNoTrobat = useTornar(immoble === null ? '/immobles' : `/immobles/${id}/contractes`)

  // S'obre amb l'aplicació del sistema. Si el fitxer ja no és al disc, esOk mostra l'error traduït.
  async function visualitzar(d: DocumentContracte): Promise<void> {
    esOk(await window.api.documents.obrir(d.id))
  }

  function afegir(): void {
    if (!contracte) return
    modals.open({
      title: t('documents.afegir.titol'),
      children: <AfegirDocument idContracte={contracte.id} onAfegits={recarregar} />
    })
  }

  function editar(d: DocumentContracte): void {
    modals.open({
      title: t('documents.editar.titol'),
      children: <EditarDocument document={d} onDesat={recarregar} />
    })
  }

  function demanarEliminar(d: DocumentContracte): void {
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
        recarregar()
      }
    })
  }

  // Dades de la fiança informades però sense el document adjunt de la classe corresponent.
  const faltaModel2 =
    contracte !== null &&
    contracte.fianca_data_model2 !== null &&
    !documents.some((d) => d.tipus === 'fianca_model2')
  const faltaNotificacio =
    contracte !== null &&
    contracte.fianca_data_notificacio !== null &&
    !documents.some((d) => d.tipus === 'fianca_notificacio')
  const faltaModel3 =
    contracte !== null &&
    contracte.devolucio_data_sollicitud !== null &&
    !documents.some((d) => d.tipus === 'fianca_model3')

  return (
    <>
      {carregant && <Text c="dimmed">{t('comu.carregant')}</Text>}

      {noTrobat && (
        <>
          <Group justify="space-between">
            <Title order={2}>{t('documents.titol')}</Title>
            <Button
              mt="md"
              variant="default"
              onClick={tornarNoTrobat}
              leftSection={<IconCornerUpLeft size={16} />}
            >
              {t('comu.tornar')}
            </Button>
          </Group>
          <Text c="dimmed">
            {immoble === null ? t('immobles.noTrobat') : t('contractes.noTrobat')}
          </Text>
        </>
      )}

      {!carregant && !noTrobat && immoble && contracte && (
        <>
          <Stack gap="sm" mb="md">
            <div>
              <Group justify="space-between">
                <Title order={2}>{t('documents.titol')}</Title>
                <Button
                  variant="default"
                  onClick={tornar}
                  leftSection={<IconCornerUpLeft size={16} />}
                >
                  {t('comu.tornar')}
                </Button>
              </Group>

              <Text c="dimmed">
                {t('documents.subtitol', {
                  adreca: adreca(immoble),
                  inici: formatData(contracte.data_inici)
                })}
              </Text>
            </div>

            {(faltaModel2 || faltaNotificacio || faltaModel3) && (
              <Alert color="orange">
                {faltaModel2 && <Text size="sm">{t('documents.avis.model2')}</Text>}
                {faltaNotificacio && <Text size="sm">{t('documents.avis.notificacio')}</Text>}
                {faltaModel3 && <Text size="sm">{t('documents.avis.model3')}</Text>}
              </Alert>
            )}

            {/* Mateixa fila que a l'edició: accions a l'esquerra, Tornar a la dreta. */}
            <Group justify="space-between">
              <Button leftSection={<IconPlus size={16} />} onClick={afegir}>
                {t('comu.afegir')}
              </Button>
            </Group>
          </Stack>

          {documents.length === 0 && <Text c="dimmed">{t('documents.buit')}</Text>}

          {documents.length > 0 && (
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th />
                  <Table.Th>{t('documents.camps.tipus')}</Table.Th>
                  <Table.Th>{t('documents.camps.fitxer')}</Table.Th>
                  <Table.Th>{t('documents.camps.data')}</Table.Th>
                  <Table.Th>{t('documents.camps.comentaris')}</Table.Th>
                  <Table.Th>{t('comu.accions')}</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {documents.map((d) => (
                  <Table.Tr key={d.id}>
                    <Table.Td>
                      <Tooltip label={t('documents.visualitzar')}>
                        <ActionIcon
                          variant="subtle"
                          aria-label={t('documents.visualitzar')}
                          onClick={() => visualitzar(d)}
                        >
                          <IconEye size={18} />
                        </ActionIcon>
                      </Tooltip>
                    </Table.Td>
                    <Table.Td>{t(`documents.tipus.${d.tipus}`)}</Table.Td>
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
                            {t('documents.visualitzar')}
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

export default DocumentsContracte
