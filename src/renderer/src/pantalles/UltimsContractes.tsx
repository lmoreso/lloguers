import { useEffect, useState, useMemo } from 'react'
import {
  ActionIcon,
  Badge,
  Button,
  Grid,
  Group,
  Stack,
  Table,
  Text,
  Title,
  Tooltip
} from '@mantine/core'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import AvisosContracte from '../components/AvisosContracte'
import { adreca, formatM2 } from '../../../shared/utilitats'
import { formatData } from '../../../shared/utilitats'
import { nomInquili } from '../utils/inquilins'
import { esOk } from '../utils/resultat'
import { AccionsContracte, AccionsSenseContracte } from './AccionsContracte'
import type {
  ContracteLlistat,
  FilaDades,
  Immoble,
  ImmobleAmbContractes,
  DadesExportacio,
  FormatExportacio,
  ConfigObtinguda,
  ColumnaIFilesExport
} from '../../../shared/tipus'
import { IconFileExport, IconInfoCircle, IconPencil, IconPlus } from '@tabler/icons-react'
import { useEditarContracte } from '@renderer/utils/useEditarContracte'
// import { AvisosContracteTxt } from '@renderer/utils/avisosContracte'
import ModalExportacio from '../components/ModalExportacio'
import { DadesExportacioDetallades } from '../utils/exportImmoblesIContractes'
import dayjs from 'dayjs'
import FiltresUltimsContractes from '../components/FiltresUltimsContractes'
import { desarFiltres, llegirFiltresGuardats, passaFiltres } from '../utils/filtresUltimsContractes'
import type { Filtres } from '../utils/filtresUltimsContractes'
import AjudaContextual from '@renderer/components/AjudaContextual'
import exportarDades from '@renderer/utils/exportarDades'

interface Props {
  config: ConfigObtinguda
}
// Vista "Últims contractes": per a cada immoble, els contractes en curs (vigents o tancats a futur) i,
// si ja han acabat tots, l'últim. Els immobles sense contracte també hi són.
function UltimsContractes({ config }: Props): React.JSX.Element {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const [dades, setDades] = useState<ImmobleAmbContractes[]>([])
  const [carregant, setCarregant] = useState(true)
  // Cada cop que canvia, l'efecte torna a llegir la llista de la BD.
  const [versio, setVersio] = useState(0)
  const editarContracte = useEditarContracte()
  const [modalExportacioObert, setModalExportacioObert] = useState(false)

  useEffect(() => {
    let cancelat = false
    window.api.contractes.ultims().then((resposta) => {
      if (cancelat) return
      if (esOk(resposta)) setDades(resposta.dades)
      setCarregant(false)
    })
    // Si el component es desmunta abans que arribi la resposta, no s'actualitza l'estat.
    return () => {
      cancelat = true
    }
  }, [versio])

  const euros = new Intl.NumberFormat(i18n.language, { style: 'currency', currency: 'EUR' })

  // Les dades es llegeixen de la BD una sola vegada (`dades`). Les files visibles són una llista derivada que es
  // recalcula en canviar un filtre, sense tornar a llegir res.
  const [filtres, setFiltres] = useState<Filtres>(llegirFiltresGuardats)
  function canviarFiltres(f: Filtres): void {
    desarFiltres(f)
    setFiltres(f)
  }

  const files = useMemo(
    () =>
      dades.flatMap<FilaDades>((d) =>
        d.contractes.length > 0
          ? d.contractes.map((c) => ({ immoble: d.immoble, contracte: c }))
          : [{ immoble: d.immoble, contracte: null }]
      ),
    [dades]
  )

  const filesVisibles = useMemo(() => {
    const avui = dayjs().format('YYYY-MM-DD')
    return files.filter((fila) => passaFiltres(fila, filtres, avui, config))
  }, [files, filtres, config])

  const municipis = useMemo(
    () =>
      [...new Set(files.map((f) => f.immoble.localitat))].sort((a, b) =>
        a.localeCompare(b, 'ca', { sensitivity: 'base' })
      ),
    [files]
  )

  async function exportar(format: FormatExportacio): Promise<void> {
    const dadesCuinades: ColumnaIFilesExport = DadesExportacioDetallades(filesVisibles, t)

    const dadesExportacio: DadesExportacio = {
      nomFitxer: t('exportacio.ultimsContractes.nomFitxer'),
      titolDialog: t('exportacio.ultimsContractes.titolDialog'),
      format,
      columnes: dadesCuinades.columnes,
      files: dadesCuinades.files
    }

    await exportarDades(dadesExportacio, t)
  }

  function infoImmoble(i: Immoble): React.JSX.Element {
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
              {t('contractes.ultims.mesDadesImmoble')}
            </Title>
            <Grid gap="xs">
              <Grid.Col span={5}>
                <Text size="xs">{t('immobles.seccions.adreca')}</Text>
              </Grid.Col>
              <Grid.Col span={7}>
                <Text size="xs">{adreca(i)}</Text>
              </Grid.Col>
            </Grid>
            <Grid gap="xs">
              <Grid.Col span={5}>
                <Text size="xs">{t('immobles.camps.codiPostal')}</Text>
              </Grid.Col>
              <Grid.Col span={7}>
                <Text size="xs">{i.codi_postal}</Text>
              </Grid.Col>
            </Grid>
            <Grid gap="xs">
              <Grid.Col span={5}>
                <Text size="xs">{t('immobles.camps.localitat')}</Text>
              </Grid.Col>
              <Grid.Col span={7}>
                <Text size="xs">{i.localitat}</Text>
              </Grid.Col>
            </Grid>
            <Grid gap="xs">
              <Grid.Col span={5}>
                <Text size="xs">{t('immobles.camps.provincia')}</Text>
              </Grid.Col>
              <Grid.Col span={7}>
                <Text size="xs">{i.provincia}</Text>
              </Grid.Col>
            </Grid>
            <Grid gap="xs">
              <Grid.Col span={5}>
                <Text size="xs">{t('immobles.camps.refCatastral')}</Text>
              </Grid.Col>
              <Grid.Col span={7}>
                <Text size="xs">{i.ref_catastral}</Text>
              </Grid.Col>
            </Grid>
            <Grid gap="xs">
              <Grid.Col span={5}>
                <Text size="xs">{t('immobles.camps.superficie')}</Text>
              </Grid.Col>
              <Grid.Col span={7}>
                <Text size="xs">{formatM2(i.superficie_m2)}</Text>
              </Grid.Col>
            </Grid>
          </Stack>
        }
        multiline
        w={300}
        position="top"
      >
        <ActionIcon variant="subtle" color="gray">
          <IconInfoCircle size={32} />
        </ActionIcon>
      </Tooltip>
    )
  }

  return (
    <>
      <Group justify="space-between" mb="md">
        <Group>
          <Title order={2}>{t('contractes.ultims.titol')} </Title>
          <AjudaContextual fitxer="ultimsContractes" idioma={config.idioma} iconSize={32} />
        </Group>
        {filesVisibles.length > 0 && (
          <Button
            leftSection={<IconFileExport size={16} />}
            onClick={() => setModalExportacioObert(true)}
          >
            {t('exportacio.titol')}
          </Button>
        )}
      </Group>
      {carregant && <Text c="dimmed">{t('comu.carregant')}</Text>}
      {!carregant && files.length === 0 && <Text c="dimmed">{t('immobles.buit')}</Text>}

      {files.length > 0 && (
        <FiltresUltimsContractes
          filtres={filtres}
          onCanvi={canviarFiltres}
          municipis={municipis}
          total={files.length}
          visibles={filesVisibles.length}
        />
      )}
      {files.length > 0 && filesVisibles.length === 0 && (
        <Text c="dimmed">{t('contractes.ultims.filtres.cap')}</Text>
      )}

      {filesVisibles.length > 0 && (
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th />
              <Table.Th>{'Id.'}</Table.Th>
              <Table.Th>{t('immobles.seccions.adreca')}</Table.Th>
              <Table.Th />
              <Table.Th>{t('contractes.camps.dataInici')}</Table.Th>
              <Table.Th>{t('contractes.camps.dataFi')}</Table.Th>
              <Table.Th>{t('contractes.camps.dFiPrevista')}</Table.Th>
              <Table.Th>{t('contractes.camps.inquilins')}</Table.Th>
              <Table.Th>{t('contractes.camps.lloguerActual')}</Table.Th>
              <Table.Th>{t('contractes.camps.dataUltimaRevisio')}</Table.Th>
              <Table.Th>{t('contractes.camps.avisos')}</Table.Th>
              <Table.Th>{t('contractes.accions.titol')}</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {filesVisibles.map(({ immoble, contracte: c }) => (
              <Table.Tr key={c ? `c${c.id}` : `i${immoble.id}`}>
                <Table.Td style={{ width: 1 }}>
                  {c === null ? (
                    <>
                      <Tooltip label={t('immobles.afegirContracte')}>
                        <ActionIcon
                          variant="subtle"
                          aria-label={t('immobles.afegirContracte')}
                          onClick={() => navigate(`/immobles/${immoble.id}/contractes/nou`)}
                        >
                          <IconPlus size={18} />
                        </ActionIcon>
                      </Tooltip>
                    </>
                  ) : (
                    <Tooltip label={t('contractes.editar')}>
                      <ActionIcon
                        variant="subtle"
                        aria-label={t('contractes.editar')}
                        onClick={() =>
                          editarContracte({ ...c, id_inmoble: immoble.id } as ContracteLlistat)
                        }
                      >
                        <IconPencil size={18} />
                      </ActionIcon>
                    </Tooltip>
                  )}
                </Table.Td>
                <Table.Td>{immoble.id}</Table.Td>
                <Table.Td>{adreca(immoble)}</Table.Td>
                <Table.Td>{infoImmoble(immoble)}</Table.Td>
                {c === null ? (
                  <>
                    <Table.Td colSpan={6} ta="center">
                      <Badge variant="outline" color="gray">
                        {t('contractes.ultims.senseContracte')}
                      </Badge>
                    </Table.Td>

                    <Table.Td></Table.Td>
                    <Table.Td style={{ width: 1 }}>
                      <AccionsSenseContracte immoble={immoble} />
                    </Table.Td>
                  </>
                ) : (
                  <>
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
                    <Table.Td>{formatData(c.data_ultima_revisio)}</Table.Td>
                    <Table.Td>
                      <AvisosContracte contracte={c} config={config} />
                    </Table.Td>
                    <Table.Td style={{ width: 1 }}>
                      <AccionsContracte contracte={c} onCanvi={() => setVersio((v) => v + 1)} />
                    </Table.Td>
                  </>
                )}
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      )}
      <ModalExportacio
        obert={modalExportacioObert}
        titol={t('exportacio.ultimsContractes.titolDialog')}
        onAcceptar={(format) => {
          setModalExportacioObert(false)
          void exportar(format)
        }}
        onCancellar={() => setModalExportacioObert(false)}
      />
    </>
  )
}

export default UltimsContractes
