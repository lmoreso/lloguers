import { useEffect, useState } from 'react'
import {
  ActionIcon,
  Badge,
  Button,
  Group,
  Stack,
  Switch,
  Table,
  Text,
  Title,
  Tooltip
} from '@mantine/core'
import { IconFileExport, IconPencil } from '@tabler/icons-react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { formatData } from '../../../shared/utilitats'
import { nomInquili } from '../utils/inquilins'
import { esOk } from '../utils/resultat'
import type {
  ColumnaIFilesExport,
  ConfigObtinguda,
  DadesExportacio,
  FormatExportacio,
  RevisioLlistat
} from '../../../shared/tipus'
import AjudaContextual from '@renderer/components/AjudaContextual'
import ModalExportacio from '@renderer/components/ModalExportacio'
import exportarDades from '@renderer/utils/exportarDades'
import { DadesExportacioRevisions } from '@renderer/utils/exportCartesRevisio'

// Una carta pendent: sense data d'enviament i amb un increment diferent de 0 (un lloguer congelat no porta carta).
const esPendent = (r: RevisioLlistat): boolean =>
  r.data_enviament === null && Math.round(r.increment_aplicat * 100) !== 0

const adrecaDe = (r: RevisioLlistat): string =>
  `${r.immoble_via} ${r.immoble_num_via}, ${r.immoble_pis}${r.immoble_porta ? ` ${r.immoble_porta}` : ''}`

// Revisions de lloguer de tots els contractes (/revisions): només de consulta. Amb l'interruptor es veuen només les
// cartes pendents d'enviar o totes les revisions. Per modificar-ne una, la icona de la primera columna porta a la
// pantalla de revisions del contracte.
function Revisions({ config }: { config: ConfigObtinguda }): React.JSX.Element {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const euros = new Intl.NumberFormat(i18n.language, { style: 'currency', currency: 'EUR' })
  const nombre = new Intl.NumberFormat(i18n.language, { maximumFractionDigits: 4 })
  const [nomesPendents, setNomesPendents] = useState(true)
  const [revisions, setRevisions] = useState<RevisioLlistat[]>([])
  const [carregant, setCarregant] = useState(true)
  const [modalExportacioObert, setModalExportacioObert] = useState(false)

  useEffect(() => {
    let cancelat = false
    window.api.revisions.llistat(nomesPendents).then((resposta) => {
      if (cancelat) return
      if (esOk(resposta)) setRevisions(resposta.dades)
      setCarregant(false)
    })
    // Si el component es desmunta (o l'interruptor canvia) abans que arribi la resposta, no s'actualitza l'estat.
    return () => {
      cancelat = true
    }
  }, [nomesPendents])

  const pendents = revisions.filter(esPendent).length

  async function exportar(format: FormatExportacio): Promise<void> {
    const dadesCuinades: ColumnaIFilesExport = DadesExportacioRevisions(revisions, t)

    const dadesExportacio: DadesExportacio = {
      nomFitxer: t('exportacio.revisions.nomFitxer'),
      titolDialog: t('exportacio.revisions.titolDialog'),
      format,
      columnes: dadesCuinades.columnes,
      files: dadesCuinades.files
    }

    await exportarDades(dadesExportacio, t)
  }

  return (
    <>
      <Stack gap="sm" mb="md">
        <Group justify="space-between" mb="md">
          <Group>
            <Title order={2}>{t('revisions.titol')}</Title>
            <AjudaContextual fitxer="revisionsLloguer" idioma={config.idioma} iconSize={32} />
          </Group>
          {revisions.length > 0 && (
            <Button
              leftSection={<IconFileExport size={16} />}
              onClick={() => setModalExportacioObert(true)}
            >
              {t('exportacio.titol')}
            </Button>
          )}
        </Group>
        <Group gap="lg">
          <Switch
            checked={nomesPendents}
            onChange={(e) => setNomesPendents(e.currentTarget.checked)}
            label={t('revisions.global.nomesPendents')}
          />
          {!carregant && (
            <Text c="dimmed" size="sm">
              {t('revisions.global.pendents', { count: pendents })}
            </Text>
          )}
        </Group>
      </Stack>

      {carregant && <Text c="dimmed">{t('comu.carregant')}</Text>}
      {!carregant && revisions.length === 0 && (
        <Text c="dimmed">
          {nomesPendents ? t('revisions.global.capPendent') : t('revisions.global.cap')}
        </Text>
      )}

      {revisions.length > 0 && (
        <Table.ScrollContainer minWidth={900}>
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th />
                <Table.Th>{t('revisions.camps.dataEfecte')}</Table.Th>
                <Table.Th>{t('revisions.global.inquilins')}</Table.Th>
                <Table.Th>{t('revisions.global.immoble')}</Table.Th>
                <Table.Th>{t('revisions.camps.lloguerAnterior')}</Table.Th>
                <Table.Th>%</Table.Th>
                <Table.Th>{t('revisions.camps.incrementAplicat')}</Table.Th>
                <Table.Th>{t('revisions.camps.lloguerNou')}</Table.Th>
                <Table.Th>{t('revisions.historial.carta')}</Table.Th>
                <Table.Th>{t('revisions.camps.comentari')}</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {revisions.map((r) => (
                <Table.Tr key={r.id_revisio}>
                  <Table.Td style={{ width: 1 }}>
                    <Tooltip label={t('revisions.global.obrir')}>
                      <ActionIcon
                        variant="subtle"
                        aria-label={t('revisions.global.obrir')}
                        onClick={() =>
                          navigate(
                            `/immobles/${r.immoble_id}/contractes/${r.id_contracte}/revisions`
                          )
                        }
                      >
                        <IconPencil size={18} />
                      </ActionIcon>
                    </Tooltip>
                  </Table.Td>
                  <Table.Td>{formatData(r.data_efecte)}</Table.Td>
                  <Table.Td>
                    <Stack gap={0}>
                      <Text size="sm">{nomInquili(r.inquili_nom, r.inquili_cognoms)}</Text>
                      {(r.inquili2_nom !== null || r.inquili2_cognoms !== null) && (
                        <Text size="sm">{nomInquili(r.inquili2_nom, r.inquili2_cognoms)}</Text>
                      )}
                    </Stack>
                  </Table.Td>
                  <Table.Td>{adrecaDe(r)}</Table.Td>
                  <Table.Td>{euros.format(r.lloguer_anterior)}</Table.Td>
                  {/* El % que ha introduït l'usuari; si no n'hi ha, l'efectiu (increment / lloguer anterior), en gris. */}
                  <Table.Td>
                    {r.percentatge !== null ? (
                      `${nombre.format(r.percentatge)} %`
                    ) : r.percentatge_efectiu !== null ? (
                      <Text size="sm" c="dimmed" span>
                        {`${nombre.format(r.percentatge_efectiu)} %`}
                      </Text>
                    ) : (
                      '—'
                    )}
                  </Table.Td>
                  <Table.Td>{euros.format(r.increment_aplicat)}</Table.Td>
                  <Table.Td>{euros.format(r.lloguer_nou)}</Table.Td>
                  <Table.Td>
                    {r.data_enviament !== null ? (
                      formatData(r.data_enviament)
                    ) : esPendent(r) ? (
                      <Badge color="orange">{t('revisions.historial.pendent')}</Badge>
                    ) : (
                      '—'
                    )}
                  </Table.Td>
                  <Table.Td>{r.comentari}</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      )}

      <ModalExportacio
        obert={modalExportacioObert}
        titol={t('exportacio.revisions.titolDialog')}
        onAcceptar={(format) => {
          setModalExportacioObert(false)
          void exportar(format)
        }}
        onCancellar={() => setModalExportacioObert(false)}
      />
    </>
  )
}

export default Revisions
