import { useEffect, useState } from 'react'
import { ActionIcon, Badge, Button, Group, Table, Text, Title, Tooltip } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import AvisosContracte from '../components/AvisosContracte'
import { adreca } from '../utils/adreca'
import { formatData } from '../utils/dates'
import { nomInquili } from '../utils/inquilins'
import { esOk } from '../utils/resultat'
import AccionsContracte from './AccionsContracte'
import type {
  ContracteLlistat,
  Immoble,
  ImmobleAmbContractes,
  DadesExportacio,
  ExtensioExportacio
} from '../../../shared/tipus'
import { IconFileExport, IconPencil, IconPlus } from '@tabler/icons-react'
import { useEditarContracte } from '@renderer/utils/useEditarContracte'
import {
  ingresPendent,
  faltenDocuments,
  devolucioPendent,
  avisos
} from '@renderer/utils/avisosContracte'
import ModalExportacio from '../components/ModalExportacio'

// Una fila de la taula: un contracte, o un immoble sense cap contracte.
interface Fila {
  immoble: Immoble
  contracte: ContracteLlistat | null
}

// Vista "Últims contractes": per a cada immoble, els contractes en curs (vigents o tancats a futur) i,
// si ja han acabat tots, l'últim. Els immobles sense contracte també hi són.
function UltimsContractes(): React.JSX.Element {
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

  // const files: Fila[] = dades.flatMap((d) =>
  const files = dades.flatMap<Fila>((d) =>
    d.contractes.length > 0
      ? d.contractes.map((c) => ({ immoble: d.immoble, contracte: c }))
      : [{ immoble: d.immoble, contracte: null }]
  )

  const AvisosContracteTxt = (c: ContracteLlistat): string | null => {
    const avisosText = new Set<string>()
    if (ingresPendent(c)) avisosText.add(t('contractes.avisos.ingresPendent'))
    if (faltenDocuments(c)) avisosText.add(t('contractes.avisos.documents'))
    if (devolucioPendent(c)) avisosText.add(t('contractes.avisos.devolucioPendent'))
    avisos(c).map((a) => avisosText.add(t(`contractes.avisos.${a.clau}.${a.estat}`)))
    // console.log('AvisosContracteSet', c, avisosText)
    return avisosText.size > 0 ? Array.from(avisosText).join(' | ') : null
  }

  async function exportar(format: ExtensioExportacio): Promise<void> {
    const dadesExportacio: DadesExportacio = {
      nomFitxer: t('exportacio.ultimsContractes.nomFitxer'),
      titolDialog: t('exportacio.ultimsContractes.titolDialog'),
      format,
      columnes: [
        { titol: t('immobles.seccions.adreca'), tipus: 'text' },
        { titol: t('contractes.camps.dataInici'), tipus: 'data' },
        { titol: t('contractes.camps.dataFi'), tipus: 'data' },
        { titol: t('contractes.camps.dFiPrevista'), tipus: 'data' },
        { titol: t('contractes.camps.inquili') + ' 1', tipus: 'text' },
        { titol: t('contractes.camps.inquili') + ' 2', tipus: 'text' },
        { titol: t('contractes.camps.lloguerActual'), tipus: 'moneda' },
        { titol: t('contractes.camps.dataUltimaRevisio'), tipus: 'data' },
        { titol: t('contractes.camps.avisos'), tipus: 'text' }
      ],
      files: files.map(({ immoble, contracte: c }) => [
        adreca(immoble),
        c?.data_inici ?? null,
        c?.data_fi ?? null,
        c?.d_fi_prevista ?? null,
        c === null
          ? t('contractes.ultims.senseContracte')
          : nomInquili(c.inquili_nom, c.inquili_cognoms),
        c === null || c.id_inquili_2 === null
          ? null
          : nomInquili(c.inquili2_nom, c.inquili2_cognoms),
        c?.lloguer_actual ?? null,
        c?.data_ultima_revisio ?? null,
        c === null ? null : AvisosContracteTxt(c)
      ])
    }

    const resposta =
      format === 'csv'
        ? await window.api.exportacio.csv(dadesExportacio)
        : format === 'ods'
          ? await window.api.exportacio.ods(dadesExportacio)
          : await window.api.exportacio.xlsx(dadesExportacio)

    if (!esOk(resposta)) {
      console.error('Error en exportar els contractes:', resposta.error)
    } else {
      notifications.show({
        title: 'exportació correcte',
        message: resposta.dades.filePath,
        color: 'green'
      })
    }
  }

  return (
    <>
      <Group justify="space-between" mb="md">
        <Title order={2}>{t('contractes.ultims.titol')}</Title>

        {files.length > 0 && (
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
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th />
              <Table.Th>{t('immobles.seccions.adreca')}</Table.Th>
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
            {files.map(({ immoble, contracte: c }) => (
              <Table.Tr key={c ? `c${c.id}` : `i${immoble.id}`}>
                <Table.Td style={{ width: 1 }}>
                  {c === null ? (
                    <>
                      <Tooltip label={t('comu.afegir')}>
                        <ActionIcon
                          variant="subtle"
                          aria-label={t('comu.afegir')}
                          onClick={() => navigate(`/immobles/${immoble.id}/contractes/nou`)}
                        >
                          <IconPlus size={18} />
                        </ActionIcon>
                      </Tooltip>
                    </>
                  ) : (
                    <Tooltip label={t('comu.editar')}>
                      <ActionIcon
                        variant="subtle"
                        aria-label={t('comu.editar')}
                        onClick={() =>
                          editarContracte({ ...c, id_inmoble: immoble.id } as ContracteLlistat)
                        }
                      >
                        <IconPencil size={18} />
                      </ActionIcon>
                    </Tooltip>
                  )}
                </Table.Td>

                <Table.Td>{adreca(immoble)}</Table.Td>
                {c === null ? (
                  <>
                    <Table.Td colSpan={7}>
                      <Badge variant="light" color="gray">
                        {t('contractes.ultims.senseContracte')}
                      </Badge>
                    </Table.Td>
                    <Table.Td style={{ width: 1 }}>
                      <Tooltip label={t('comu.afegir')}>
                        <ActionIcon
                          variant="subtle"
                          aria-label={t('comu.afegir')}
                          onClick={() => navigate(`/immobles/${immoble.id}/contractes/nou`)}
                        >
                          <IconPlus size={18} />
                        </ActionIcon>
                      </Tooltip>
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
                      <AvisosContracte contracte={c} />
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
        onCancel·lar={() => setModalExportacioObert(false)}
      />
    </>
  )
}

export default UltimsContractes
