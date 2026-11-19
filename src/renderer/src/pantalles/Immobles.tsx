import { useEffect, useState } from 'react'
import {
  ActionIcon,
  Alert,
  Badge,
  Button,
  // Divider,
  Grid,
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
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { esOk } from '../utils/resultat'
import type {
  ConfigObtinguda,
  Immoble,
  ContracteLlistat,
  ImmobleAmbContractes
} from '../../../shared/tipus'
import {
  IconDots,
  IconFileText,
  IconPencil,
  IconTrash,
  IconFiles,
  IconPlus,
  IconInfoCircle
} from '@tabler/icons-react'
import { adreca } from '../../../shared/utilitats'
import { teAvisos } from '../utils/avisosContracte'
import { alertes } from '../utils/avisosImmoble'
import { formatCurrency, formatM2 } from '../../../shared/utilitats'
import { formatData } from '../../../shared/utilitats'
import { nomInquili } from '@renderer/utils/inquilins'
import { useEditarContracte } from '@renderer/utils/useEditarContracte'

interface Props {
  config: ConfigObtinguda
}

function Immobles({ config }: Props): React.JSX.Element {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [immobles, setImmobles] = useState<Immoble[]>([])
  const [carregant, setCarregant] = useState(true)
  // Ids dels immobles amb algun contracte (en curs o l'últim) que té avisos.
  const [ambAvisosContractes, setAmbAvisosContractes] = useState<Set<number>>(new Set())
  // Cada cop que canvia, l'efecte torna a llegir la llista de la BD.
  const [versio, setVersio] = useState(0)
  const [ultimsContractes, setUltimsContractes] = useState<ImmobleAmbContractes[]>([])

  const ambAvisos = immobles.filter(
    (i) => alertes(i, config.diesAvisDocumentCaducat).length > 0
  ).length

  function ultimContracte(idImmoble: number): ContracteLlistat | null {
    const resultat = ultimsContractes.find((x) => x.immoble.id === idImmoble)

    if (!resultat || resultat.contractes.length === 0) return null

    return resultat.contractes[resultat.contractes.length - 1]
  }

  useEffect(() => {
    let cancelat = false
    Promise.all([window.api.inmobles.obtenir(), window.api.contractes.ultims()]).then(
      ([rImmobles, rUltims]) => {
        if (cancelat) return
        if (esOk(rImmobles)) setImmobles(rImmobles.dades)
        if (esOk(rUltims)) {
          setAmbAvisosContractes(
            new Set(
              rUltims.dades
                .filter((x) => x.contractes.some((c) => teAvisos(c, config)))
                .map((x) => x.immoble.id)
            )
          )
          setUltimsContractes(rUltims.dades)
        }
        setCarregant(false)
      }
    )
    // Si el component es desmunta abans que arribin les respostes, no s'actualitza l'estat.
    return () => {
      cancelat = true
    }
  }, [config, versio])

  function demanarEliminar(i: Immoble): void {
    modals.openConfirmModal({
      title: t('immobles.eliminar.titol'),
      children: <Text size="sm">{t('immobles.eliminar.confirmacio', { nom: adreca(i) })}</Text>,
      labels: { confirm: t('comu.eliminar'), cancel: t('comu.cancellar') },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        const resposta = await window.api.inmobles.eliminar(i.id)
        if (!esOk(resposta)) return
        notifications.show({ color: 'green', message: t('immobles.eliminat') })
        setVersio((v) => v + 1)
      }
    })
  }

  // Un contracte tancat (amb data de fi) demana confirmació abans d'editar-lo.
  const editarContracte = useEditarContracte()

  function infoContracte(cntr: ContracteLlistat): React.JSX.Element {
    return (
      <Tooltip
        withArrow
        arrowSize={12}
        label={
          <Stack gap="xs">
            <Title
              order={6}
              c="white"
              ta="center"
              pb={2}
              mb={2}
              style={{ borderBottom: '1px solid white' }}
            >
              {t('immobles.mesDadesContracte')}
            </Title>
            {/* <Divider color="white" /> */}
            <Grid gap="xs">
              <Grid.Col span={5}>
                <Text size="xs">{t('contractes.camps.dataInici')}</Text>
              </Grid.Col>
              <Grid.Col span={7}>
                <Text size="xs">{formatData(cntr.data_inici)}</Text>
              </Grid.Col>
            </Grid>

            {cntr.data_fi ? (
              <Grid gap="xs">
                <Grid.Col span={5}>
                  <Text size="xs">{t('contractes.camps.dataFi')}</Text>
                </Grid.Col>
                <Grid.Col span={7}>
                  <Text size="xs">{formatData(cntr.data_fi)}</Text>
                </Grid.Col>
              </Grid>
            ) : (
              <Grid gap="xs">
                <Grid.Col span={5}>
                  <Text size="xs">{t('contractes.camps.dFiPrevista')}</Text>
                </Grid.Col>
                <Grid.Col span={7}>
                  <Text size="xs">{formatData(cntr.d_fi_prevista)}</Text>
                </Grid.Col>
              </Grid>
            )}
            <Grid gap="xs">
              <Grid.Col span={5}>
                <Text size="xs">{t('contractes.camps.lloguerActual')}</Text>
              </Grid.Col>
              <Grid.Col span={7}>
                <Text size="xs">{formatCurrency(cntr.lloguer_actual)}</Text>
              </Grid.Col>
            </Grid>

            <Grid gap="xs">
              <Grid.Col span={5}>
                <Text size="xs">{t('contractes.camps.dataUltimaRevisio')}</Text>
              </Grid.Col>
              <Grid.Col span={7}>
                <Text size="xs">{formatData(cntr.data_ultima_revisio)}</Text>
              </Grid.Col>
            </Grid>

            <Grid gap="xs">
              <Grid.Col span={5}>
                <Text size="xs">{t('immobles.inquili1')}</Text>
              </Grid.Col>
              <Grid.Col span={7}>
                <Text size="xs">{nomInquili(cntr.inquili_nom, cntr.inquili_cognoms)}</Text>
              </Grid.Col>
            </Grid>

            {cntr.inquili2_nom && (
              <Grid gap="xs">
                <Grid.Col span={5}>
                  <Text size="xs">{t('immobles.inquili2')}</Text>
                </Grid.Col>
                <Grid.Col span={7}>
                  <Text size="xs">{nomInquili(cntr.inquili2_nom, cntr.inquili2_cognoms)}</Text>
                </Grid.Col>
              </Grid>
            )}
          </Stack>
        }
        multiline
        w={300}
        position="top"
      >
        <ActionIcon variant="subtle" color="gray">
          <IconInfoCircle size={24} />
        </ActionIcon>
      </Tooltip>
    )
  }

  return (
    <>
      <Group justify="space-between" mb="md">
        <Title order={2}>{t('menu.immobles')}</Title>
        <Button leftSection={<IconPlus size={16} />} onClick={() => navigate('/immobles/nou')}>
          {t('comu.afegir')}
        </Button>
      </Group>

      {carregant && <Text c="dimmed">{t('comu.carregant')}</Text>}
      {!carregant && immobles.length === 0 && <Text c="dimmed">{t('immobles.buit')}</Text>}
      {ambAvisos > 0 && (
        <Alert color="orange" mb="md">
          {t('immobles.caducitats.avis', { count: ambAvisos })}
        </Alert>
      )}

      {immobles.length > 0 && (
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              {/* La primera columna és només per l'icona d'editar. */}
              <Table.Th></Table.Th>
              <Table.Th>{t('immobles.camps.id')}</Table.Th>
              <Table.Th>{t('immobles.seccions.adreca')}</Table.Th>
              <Table.Th>{t('immobles.camps.localitat')}</Table.Th>
              <Table.Th ta="right" pr="sm">
                {t('immobles.camps.superficie')}
              </Table.Th>
              <Table.Th>{t('contractes.camps.dataInici')}</Table.Th>
              <Table.Th>{t('contractes.camps.dataFi')}</Table.Th>
              <Table.Th>
                {t('inquilins.camps.nom')} {t('contractes.camps.inquili')}
              </Table.Th>
              <Table.Th></Table.Th>
              <Table.Th>{t('immobles.camps.avisos')}</Table.Th>
              <Table.Th>{t('comu.accions')}</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {immobles.map((i) => {
              const contracte = ultimContracte(i.id)

              return (
                <Table.Tr key={i.id}>
                  <Table.Td>
                    <Tooltip label={t('immobles.editar')}>
                      <ActionIcon
                        variant="subtle"
                        aria-label={t('immobles.editar')}
                        onClick={() => navigate(`/immobles/${i.id}`)}
                      >
                        <IconPencil size={18} />
                      </ActionIcon>
                    </Tooltip>
                  </Table.Td>
                  <Table.Td>{i.id}</Table.Td>
                  <Table.Td>{adreca(i)}</Table.Td>
                  <Table.Td>{i.localitat}</Table.Td>
                  <Table.Td ta="right" pr="sm">
                    {formatM2(i.superficie_m2)}
                  </Table.Td>
                  {contracte ? (
                    <>
                      <Table.Td>{formatData(contracte.data_inici)}</Table.Td>
                      <Table.Td>{formatData(contracte.data_fi)}</Table.Td>
                      <Table.Td>{contracte.inquili_nom}</Table.Td>
                      <Table.Td>{infoContracte(contracte)}</Table.Td>
                    </>
                  ) : (
                    <Table.Td colSpan={4} ta="center">
                      <Badge variant="outline" color="gray">
                        {t('contractes.ultims.senseContracte')}
                      </Badge>
                    </Table.Td>
                  )}

                  <Table.Td>
                    <Stack gap={4} align="flex-start">
                      {alertes(i, config.diesAvisDocumentCaducat).map((a) => (
                        <Badge key={a.clau} color={a.estat === 'caducat' ? 'red' : 'orange'}>
                          {t(`immobles.caducitats.${a.clau}`)}:{' '}
                          {t(`immobles.caducitats.${a.estat}`)}
                        </Badge>
                      ))}
                      {ambAvisosContractes.has(i.id) && (
                        <Badge color="orange">{t('immobles.caducitats.contractesAmbAvisos')}</Badge>
                      )}
                    </Stack>
                  </Table.Td>
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
                          leftSection={<IconPencil size={16} />}
                          onClick={() => navigate(`/immobles/${i.id}`)}
                        >
                          {t('immobles.editar')}
                        </Menu.Item>
                        <Menu.Item
                          leftSection={<IconFiles size={16} />}
                          onClick={() => navigate(`/immobles/${i.id}/documents`)}
                        >
                          {t('documentsImmoble.boto')}
                        </Menu.Item>
                        <Menu.Divider />
                        {contracte && (
                          <>
                            <Menu.Item
                              leftSection={<IconPencil size={16} />}
                              onClick={() => editarContracte(contracte)}
                            >
                              {t('contractes.editar')}
                            </Menu.Item>
                            <Menu.Item
                              leftSection={<IconFileText size={16} />}
                              onClick={() => navigate(`/immobles/${i.id}/contractes`)}
                            >
                              {t('immobles.llistaContractes')}
                            </Menu.Item>
                          </>
                        )}
                        <Menu.Item
                          leftSection={<IconPlus size={16} />}
                          onClick={() => navigate(`/immobles/${i.id}/contractes/nou`)}
                        >
                          {t('immobles.afegirContracte')}
                        </Menu.Item>

                        <Menu.Divider />
                        <Menu.Item
                          color="red"
                          leftSection={<IconTrash size={16} />}
                          onClick={() => demanarEliminar(i)}
                        >
                          {t('comu.eliminar')}
                        </Menu.Item>
                      </Menu.Dropdown>
                    </Menu>
                  </Table.Td>
                </Table.Tr>
              )
            })}
          </Table.Tbody>
        </Table>
      )}
    </>
  )
}

export default Immobles
