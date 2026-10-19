import { useEffect, useState } from 'react'
import {
  ActionIcon,
  Badge,
  Button,
  Group,
  Menu,
  Stack,
  Table,
  Text,
  Title,
  Tooltip
} from '@mantine/core'
import {
  IconCurrencyEuro,
  IconMenu2,
  IconLock,
  IconPencil,
  IconTrash,
  IconReceiptRefund
} from '@tabler/icons-react'
import { modals } from '@mantine/modals'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { adreca } from '../utils/adreca'
import { formatData } from '../utils/dates'
import { esOk } from '../utils/resultat'
import type { ContracteLlistat, Immoble } from '../../../shared/tipus'
import { notifications } from '@mantine/notifications'
import RevisarLloguer from './RevisarLloguer'
import TancarContracte from './TancarContracte'
import DevolucioFianca from './DevolucioFianca'
import {
  aniversariRevisio,
  DIES_AVIS_FI,
  DIES_AVIS_REVISIO,
  estatCaducitat
} from '../utils/caducitat'

// Avisos d'un contracte. Només els vigents (sense data de fi) en tenen.
function avisos(c: ContracteLlistat): { clau: 'fi' | 'revisio'; estat: 'caducat' | 'aviat' }[] {
  if (c.data_fi !== null) return []
  const llista: { clau: 'fi' | 'revisio'; estat: 'caducat' | 'aviat' }[] = []
  const fi = estatCaducitat(c.d_fi_prevista, DIES_AVIS_FI)
  if (fi) llista.push({ clau: 'fi', estat: fi })
  const revisio = estatCaducitat(aniversariRevisio(c.data_ultima_revisio), DIES_AVIS_REVISIO)
  if (revisio) llista.push({ clau: 'revisio', estat: revisio })
  return llista
}

// Hi ha una data de la fiança informada però no el document adjunt de la classe que la justifica.
// El model 3 justifica la sol·licitud de devolució.
function faltenDocuments(c: ContracteLlistat): boolean {
  return (
    (c.fianca_data_model2 !== null && !c.te_doc_model2) ||
    (c.fianca_data_notificacio !== null && !c.te_doc_notificacio) ||
    (c.devolucio_data_sollicitud !== null && !c.te_doc_model3)
  )
}

// Contracte tancat amb la fiança ja gestionada (model 2 o notificació) però sense el cobrament de
// la devolució: la fiança està per cobrar.
function devolucioPendent(c: ContracteLlistat): boolean {
  return (
    c.data_fi !== null &&
    (c.fianca_data_model2 !== null || c.fianca_data_notificacio !== null) &&
    c.devolucio_data_cobrament === null
  )
}

// Contractes d'un immoble. S'hi entra només des d'Immobles (/immobles/:id/contractes).
function Contractes(): React.JSX.Element {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const { id } = useParams()
  const [immoble, setImmoble] = useState<Immoble | null>(null)
  const [contractes, setContractes] = useState<ContracteLlistat[]>([])
  const [carregant, setCarregant] = useState(true)
  // Cada cop que canvia, l'efecte torna a llegir la llista de la BD.
  const [versio, setVersio] = useState(0)

  useEffect(() => {
    let cancelat = false
    Promise.all([
      window.api.inmobles.obtenirUn(Number(id)),
      window.api.contractes.obtenir(Number(id))
    ]).then(([rImmoble, rContractes]) => {
      if (cancelat) return
      if (esOk(rImmoble)) setImmoble(rImmoble.dades)
      if (esOk(rContractes)) setContractes(rContractes.dades)
      setCarregant(false)
    })
    // Si el component es desmunta abans que arribin les respostes, no s'actualitza l'estat.
    return () => {
      cancelat = true
    }
  }, [id, versio])

  const nomInquili = (nom: string | null, cognoms: string | null): string =>
    [nom, cognoms].filter(Boolean).join(' ') || t('inquilins.senseNom')

  const euros = new Intl.NumberFormat(i18n.language, { style: 'currency', currency: 'EUR' })

  // Un contracte tancat (amb data de fi) demana confirmació abans d'editar-lo.
  function editar(c: ContracteLlistat): void {
    const anar = (): void => {
      navigate(`/immobles/${id}/contractes/${c.id}`)
    }
    if (c.data_fi === null) {
      anar()
      return
    }
    modals.openConfirmModal({
      title: t('contractes.editarTancat.titol'),
      children: <Text size="sm">{t('contractes.editarTancat.text')}</Text>,
      labels: { confirm: t('comu.editar'), cancel: t('comu.cancellar') },
      onConfirm: anar
    })
  }

  function demanarEliminar(c: ContracteLlistat): void {
    const inquilins = [
      nomInquili(c.inquili_nom, c.inquili_cognoms),
      ...(c.id_inquili_2 !== null ? [nomInquili(c.inquili2_nom, c.inquili2_cognoms)] : [])
    ].join(' / ')
    modals.openConfirmModal({
      title: t('contractes.eliminar.titol'),
      children: (
        <Text size="sm">
          {t('contractes.eliminar.confirmacio', { inquilins, inici: formatData(c.data_inici) })}
        </Text>
      ),
      labels: { confirm: t('comu.eliminar'), cancel: t('comu.cancellar') },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        const resposta = await window.api.contractes.eliminar(c.id)
        if (!esOk(resposta)) return
        notifications.show({ color: 'green', message: t('contractes.eliminat') })
        setVersio((v) => v + 1)
      }
    })
  }

  function tancar(c: ContracteLlistat): void {
    modals.open({
      title: t('contractes.tancar.titol'),
      children: <TancarContracte contracte={c} onTancat={() => setVersio((v) => v + 1)} />
    })
  }

  function revisar(c: ContracteLlistat): void {
    modals.open({
      title: t('contractes.revisar.titol'),
      children: <RevisarLloguer contracte={c} onRevisat={() => setVersio((v) => v + 1)} />
    })
  }

  function devolucio(c: ContracteLlistat): void {
    modals.open({
      title: t('contractes.devolucio.titol'),
      children: <DevolucioFianca contracte={c} onDesat={() => setVersio((v) => v + 1)} />
    })
  }

  return (
    <>
      {carregant && <Text c="dimmed">{t('comu.carregant')}</Text>}
      {!carregant && immoble === null && <Text c="dimmed">{t('immobles.noTrobat')}</Text>}

      {immoble && (
        <>
          <Group justify="space-between" mb="md">
            <Title order={2}>{t('contractes.titolImmoble', { adreca: adreca(immoble) })}</Title>
            <Button onClick={() => navigate(`/immobles/${immoble.id}/contractes/nou`)}>
              {t('comu.afegir')}
            </Button>
          </Group>

          {contractes.length === 0 && <Text c="dimmed">{t('contractes.buit')}</Text>}

          {contractes.length > 0 && (
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>{t('contractes.camps.estat')}</Table.Th>
                  <Table.Th>{t('contractes.camps.dataInici')}</Table.Th>
                  <Table.Th>{t('contractes.camps.dataFi')}</Table.Th>
                  <Table.Th>{t('contractes.camps.dFiPrevista')}</Table.Th>
                  <Table.Th>{t('contractes.camps.inquilins')}</Table.Th>
                  <Table.Th>{t('contractes.camps.lloguerActual')}</Table.Th>
                  <Table.Th>{t('contractes.camps.avisos')}</Table.Th>
                  <Table.Th>{t('contractes.accions.titol')}</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {contractes.map((c) => (
                  <Table.Tr key={c.id}>
                    <Table.Td>
                      <Badge color={c.data_fi === null ? 'green' : 'gray'}>
                        {c.data_fi === null
                          ? t('contractes.estat.vigent')
                          : t('contractes.estat.tancat')}
                      </Badge>
                    </Table.Td>
                    <Table.Td>{formatData(c.data_inici)}</Table.Td>
                    <Table.Td>{formatData(c.data_fi)}</Table.Td>
                    <Table.Td>{formatData(c.d_fi_prevista)}</Table.Td>
                    <Table.Td>
                      <Text size="sm">{nomInquili(c.inquili_nom, c.inquili_cognoms)}</Text>
                      {c.id_inquili_2 !== null && (
                        <Text size="sm" c="dimmed">
                          {nomInquili(c.inquili2_nom, c.inquili2_cognoms)}
                        </Text>
                      )}
                    </Table.Td>
                    <Table.Td>{euros.format(c.lloguer_actual)}</Table.Td>
                    <Table.Td>
                      <Stack gap={4} align="flex-start">
                        {avisos(c).map((a) => (
                          <Badge key={a.clau} color={a.estat === 'caducat' ? 'red' : 'orange'}>
                            {t(`contractes.avisos.${a.clau}.${a.estat}`)}
                          </Badge>
                        ))}
                        {faltenDocuments(c) && (
                          <Badge color="orange">{t('contractes.avisos.documents')}</Badge>
                        )}
                        {devolucioPendent(c) && (
                          <Badge color="yellow">{t('contractes.avisos.devolucioPendent')}</Badge>
                        )}
                      </Stack>
                    </Table.Td>
                    <Table.Td style={{ width: 1 }}>
                      <Menu position="bottom-end" withinPortal>
                        <Menu.Target>
                          <Tooltip label={t('contractes.accions.titol')}>
                            <ActionIcon variant="subtle" aria-label={t('contractes.accions.titol')}>
                              <IconMenu2 size={18} />
                            </ActionIcon>
                          </Tooltip>
                        </Menu.Target>
                        <Menu.Dropdown>
                          {c.data_fi === null && (
                            <>
                              <Menu.Item
                                leftSection={<IconCurrencyEuro size={16} />}
                                onClick={() => revisar(c)}
                              >
                                {t('contractes.accions.revisarLloguer')}
                              </Menu.Item>
                              <Menu.Item
                                leftSection={<IconLock size={16} />}
                                onClick={() => tancar(c)}
                              >
                                {t('contractes.accions.tancar')}
                              </Menu.Item>
                            </>
                          )}
                          {c.data_fi !== null && (
                            <Menu.Item
                              leftSection={<IconReceiptRefund size={16} />}
                              onClick={() => devolucio(c)}
                            >
                              {t('contractes.accions.devolucio')}
                            </Menu.Item>
                          )}
                          <Menu.Item
                            leftSection={<IconPencil size={16} />}
                            onClick={() => editar(c)}
                          >
                            {t('comu.editar')}
                          </Menu.Item>
                          <Menu.Divider />
                          <Menu.Item
                            color="red"
                            leftSection={<IconTrash size={16} />}
                            onClick={() => demanarEliminar(c)}
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

      <Button mt="md" variant="default" onClick={() => navigate('/immobles')}>
        {t('comu.tornar')}
      </Button>
    </>
  )
}

export default Contractes
