import { useEffect, useState } from 'react'
import {
  ActionIcon,
  Alert,
  Badge,
  Button,
  Fieldset,
  Group,
  SimpleGrid,
  ScrollArea,
  Stack,
  Table,
  Text,
  Textarea,
  Title,
  Tooltip
} from '@mantine/core'
import { useForm } from '@mantine/form'
import { modals } from '@mantine/modals'
import { notifications } from '@mantine/notifications'
import { IconCheck, IconCornerUpLeft, IconPencil, IconPlus, IconTrash } from '@tabler/icons-react'
import dayjs from 'dayjs'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { CampData } from '../components/CampData'
import CampNumeric from '../components/CampNumeric'
import CanvisSenseDesar from '../components/CanvisSenseDesar'
import { adreca } from '../utils/adreca'
import { aniversariRevisio } from '../utils/caducitat'
import { formatData } from '../utils/dates'
import { aNumeroForm, buitANull } from '../utils/formulari'
import { esOk } from '../utils/resultat'
import { hiHaCapaOberta } from '../utils/teclat'
import type { ContracteLlistat, Immoble, RevisioDades, RevisioLloguer } from '../../../shared/tipus'
import { nomsInquilinsContracte } from '../utils/inquilins'
import { useTornar } from '../utils/useTornar'

// Els imports i el percentatge són número (o text mentre s'escriu); les dates, text ISO AAAA-MM-DD.
interface Valors {
  data_efecte: string | null
  percentatge: number | string
  increment_aplicat: number | string
  data_enviament: string | null
  comentari: string
}

// Una carta pendent: sense data d'enviament i amb un increment diferent de 0 (un lloguer congelat no porta carta).
const esPendent = (r: RevisioLloguer): boolean =>
  r.data_enviament === null && Math.round(r.increment_aplicat * 100) !== 0

const cts = (n: number): number => Math.round(n * 100)

interface PantallaProps {
  immoble: Immoble
  contracte: ContracteLlistat
  revisions: RevisioLloguer[] // l'última primer
  revisio: RevisioLloguer | null // la que s'edita; null = una de nova
  pendent: boolean // l'última té la carta pendent
  tancat: boolean
  onEdicio: (edicio: number | 'nova') => void
  onDesat: (id: number) => void
  onEliminada: () => void
}

// La pantalla amb el formulari. Es munta de nou (key) cada cop que canvia la revisió que s'edita.
function PantallaRevisions({
  immoble,
  contracte,
  revisions,
  revisio,
  pendent,
  tancat,
  onEdicio,
  onDesat,
  onEliminada
}: PantallaProps): React.JSX.Element {
  const { t, i18n } = useTranslation()
  const euros = new Intl.NumberFormat(i18n.language, { style: 'currency', currency: 'EUR' })
  const nombre = new Intl.NumberFormat(i18n.language, { maximumFractionDigits: 4 })
  const tornarUrl = `/immobles/${immoble.id}/contractes/${contracte.id}`
  const tornarEnrere = useTornar(tornarUrl)
  // Amb el contracte tancat no es poden crear revisions noves: sense una revisió carregada, la pantalla és només de consulta.
  const nomesConsulta = tancat && revisio === null
  const nomsInquilins = nomsInquilinsContracte(contracte)

  // El lloguer del qual parteix la revisió, i el dia a partir del qual pot tenir efecte.
  const lloguerAnterior = revisio ? revisio.lloguer_anterior : contracte.lloguer_actual
  const minEfecte = revisio ? revisio.data_revisio_anterior : contracte.data_ultima_revisio
  const efecteDefecte =
    aniversariRevisio(contracte.data_ultima_revisio) ?? dayjs().format('YYYY-MM-DD')

  const form = useForm<Valors>({
    initialValues: revisio
      ? {
          data_efecte: revisio.data_efecte,
          percentatge: revisio.percentatge ?? '',
          increment_aplicat: revisio.increment_aplicat,
          data_enviament: revisio.data_enviament,
          comentari: revisio.comentari ?? ''
        }
      : {
          data_efecte: efecteDefecte,
          percentatge: '',
          increment_aplicat: '',
          data_enviament: null,
          comentari: ''
        },
    validate: {
      data_efecte: (v) => {
        if (!v) return t('comu.obligatori')
        return v < minEfecte
          ? t('revisions.validacio.efecteAnterior', { data: formatData(minEfecte) })
          : null
      },
      percentatge: (v) =>
        v === '' || aNumeroForm(v) !== null ? null : t('immobles.validacio.numero'),
      increment_aplicat: (v) => {
        if (v === '') return t('comu.obligatori')
        const n = aNumeroForm(v)
        if (n === null) return t('immobles.validacio.numero')
        return cts(lloguerAnterior) + cts(n) < 0 ? t('revisions.validacio.lloguerNegatiu') : null
      }
    }
  })

  // Valors calculats (només es mostren): l'increment que surt del %, i el lloguer nou.
  const pct = aNumeroForm(form.values.percentatge)
  const incrementCalculat = pct === null ? '' : Math.round(lloguerAnterior * pct) / 100
  const incrementAplicat = aNumeroForm(form.values.increment_aplicat)
  const lloguerNou =
    incrementAplicat === null ? '' : (cts(lloguerAnterior) + cts(incrementAplicat)) / 100

  // En canviar el %, l'increment aplicat es posa igual al calculat (després es pot modificar a mà).
  function canviarPercentatge(v: number | string): void {
    form.setFieldValue('percentatge', v)
    const p = aNumeroForm(v)
    if (p !== null) form.setFieldValue('increment_aplicat', Math.round(lloguerAnterior * p) / 100)
  }

  // Desa la revisió (nova o existent). Retorna si ha anat bé (l'error ja s'ha notificat).
  async function desarValors(v: Valors): Promise<boolean> {
    // Els camps obligatoris ja estan validats: els `as` només ajusten el tipus.
    const dades: RevisioDades = {
      data_efecte: v.data_efecte as string,
      percentatge: aNumeroForm(v.percentatge),
      increment_aplicat: aNumeroForm(v.increment_aplicat) as number,
      data_enviament: v.data_enviament,
      comentari: buitANull(v.comentari)
    }
    let id: number
    if (revisio) {
      if (!esOk(await window.api.revisions.actualitzar(revisio.id, dades))) return false
      id = revisio.id
    } else {
      const r = await window.api.revisions.crear(contracte.id, dades)
      if (!esOk(r)) return false
      id = r.dades.id
    }
    notifications.show({ color: 'green', message: t('revisions.desada') })
    onDesat(id)
    return true
  }

  // Desa el formulari (botó Desar i Ctrl+S). La validació mostra els errors als camps.
  function desarFormulari(): void {
    if (nomesConsulta) return
    form.onSubmit((v) => {
      void desarValors(v)
    })()
  }

  // Executa una acció que canvia de pantalla o de revisió; si hi ha canvis sense desar, pregunta abans.
  function anarAmbGuarda(accio: () => void): void {
    if (!form.isDirty()) {
      accio()
      return
    }
    modals.open({
      title: t('comu.canvisSenseDesar.titol'),
      children: (
        <CanvisSenseDesar
          onDesar={async () => {
            // Si hi ha errors de validació o el desat falla, ens quedem a la pantalla.
            const validacio = form.validate()
            const correcte = validacio.hasErrors ? false : await desarValors(form.values)
            modals.closeAll()
            if (correcte) accio()
          }}
          onDescartar={() => {
            modals.closeAll()
            accio()
          }}
        />
      )
    })
  }

  const tornar = (): void => anarAmbGuarda(tornarEnrere)

  // Elimina l'última revisió: el contracte recupera el lloguer i la data de revisió que tenia abans.
  function demanarEliminar(r: RevisioLloguer): void {
    modals.openConfirmModal({
      title: t('revisions.eliminar.titol'),
      children: (
        <Text size="sm">
          {t('revisions.eliminar.confirmacio', {
            efecte: formatData(r.data_efecte),
            lloguer: euros.format(r.lloguer_anterior),
            data: formatData(r.data_revisio_anterior)
          })}
        </Text>
      ),
      labels: { confirm: t('comu.eliminar'), cancel: t('comu.cancellar') },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        const resposta = await window.api.revisions.eliminar(r.id)
        if (!esOk(resposta)) return
        notifications.show({ color: 'green', message: t('revisions.eliminada') })
        onEliminada()
      }
    })
  }

  // Ctrl+S desa; Escape = Tornar, amb la mateixa protecció. Cap dels dos actua si hi ha una finestra o un desplegable
  // visible. Intro NO desa: el formulari no té cap botó d'enviament.
  useEffect(() => {
    function alTeclat(e: KeyboardEvent): void {
      if (e.defaultPrevented) return
      if (hiHaCapaOberta()) return
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault()
        desarFormulari()
      } else if (e.key === 'Escape') {
        tornar()
      }
    }
    window.addEventListener('keydown', alTeclat)
    return () => window.removeEventListener('keydown', alTeclat)
  })

  const darrera = revisions[0] ?? null

  return (
    <>
      <Stack gap="sm" mb="md">
        <div>
          <Group justify="space-between">
            <Title order={2}>{t('contractes.revisar.titol')}</Title>
            <Button variant="default" onClick={tornar} leftSection={<IconCornerUpLeft size={16} />}>
              {t('comu.tornar')}
            </Button>
          </Group>

          <Text c="dimmed">
            {t('revisions.subtitol', {
              adreca: adreca(immoble),
              inici: formatData(contracte.data_inici),
              inquilins: nomsInquilins
            })}
          </Text>
        </div>

        <Text>
          {t('revisions.actual', {
            lloguer: euros.format(contracte.lloguer_actual),
            data: formatData(contracte.data_ultima_revisio)
          })}
        </Text>

        {pendent && <Alert color="orange">{t('revisions.pendent')}</Alert>}
        {tancat && <Alert color="gray">{t('revisions.tancat')}</Alert>}

        <Group justify="space-between">
          <Group gap="xs">
            <Button
              leftSection={<IconCheck size={16} />}
              disabled={nomesConsulta}
              onClick={desarFormulari}
            >
              {t('comu.desar')}
            </Button>
            {revisio && (
              <>
                <Button
                  variant="default"
                  disabled={pendent || tancat}
                  leftSection={<IconPlus size={16} />}
                  onClick={() => anarAmbGuarda(() => onEdicio('nova'))}
                >
                  {t('revisions.nova')}
                </Button>
                <Button
                  variant="default"
                  color="red"
                  leftSection={<IconTrash size={16} />}
                  onClick={() => demanarEliminar(revisio)}
                >
                  {t('comu.eliminar')}
                </Button>
              </>
            )}
          </Group>
        </Group>
      </Stack>

      <Stack>
        {!nomesConsulta && (
          <Fieldset
            legend={
              revisio
                ? t('revisions.seccions.editar', { data: formatData(revisio.data_efecte) })
                : t('revisions.seccions.nova')
            }
          >
            <SimpleGrid cols={{ base: 1, sm: 2 }}>
              <CampNumeric
                disabled
                tipus="import"
                label={t('revisions.camps.lloguerAnterior')}
                value={lloguerAnterior}
              />
              <CampData
                disabled
                label={t('contractes.camps.dataUltimaRevisio')}
                value={contracte.data_ultima_revisio}
              />
              {/* El % és un camp numèric amb el sufix canviat; pot ser negatiu (una baixada de lloguer). */}
              <CampNumeric
                tipus="percentatge"
                suffix=" %"
                decimalScale={4}
                allowNegative
                label={t('revisions.camps.percentatge')}
                {...form.getInputProps('percentatge')}
                onChange={canviarPercentatge}
              />
              <CampNumeric
                disabled
                tipus="import"
                allowNegative
                label={t('revisions.camps.incrementCalculat')}
                value={incrementCalculat}
              />
              <CampNumeric
                withAsterisk
                tipus="import"
                allowNegative
                label={t('revisions.camps.incrementAplicat')}
                {...form.getInputProps('increment_aplicat')}
              />
              <CampNumeric
                disabled
                tipus="import"
                label={t('revisions.camps.lloguerNou')}
                value={lloguerNou}
              />
              <CampData
                withAsterisk
                label={t('revisions.camps.dataEfecte')}
                {...form.getInputProps('data_efecte')}
              />
              <CampData
                clearable
                label={t('revisions.camps.dataEnviament')}
                {...form.getInputProps('data_enviament')}
              />
            </SimpleGrid>
            <Textarea
              mt="md"
              autosize
              minRows={2}
              label={t('revisions.camps.comentari')}
              {...form.getInputProps('comentari')}
            />
          </Fieldset>
        )}

        <Fieldset legend={t('revisions.seccions.historial')}>
          {revisions.length === 0 && <Text c="dimmed">{t('revisions.historial.buit')}</Text>}
          {revisions.length > 0 && (
            <>
              <Text size="sm" c="dimmed" mb="xs">
                {t('revisions.historial.nota')}
              </Text>
              <ScrollArea.Autosize mah={320} type="auto">
                <Table striped highlightOnHover stickyHeader>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th />
                      <Table.Th>{t('revisions.camps.dataEfecte')}</Table.Th>
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
                      <Table.Tr
                        key={r.id}
                        style={
                          revisio?.id === r.id
                            ? { backgroundColor: 'var(--mantine-color-blue-light)' }
                            : undefined
                        }
                      >
                        <Table.Td style={{ width: 1 }}>
                          {/* Només l'última revisió es pot modificar. */}
                          {r.id === darrera?.id && revisio?.id !== r.id && (
                            <Tooltip label={t('comu.editar')}>
                              <ActionIcon
                                variant="subtle"
                                aria-label={t('comu.editar')}
                                onClick={() => anarAmbGuarda(() => onEdicio(r.id))}
                              >
                                <IconPencil size={18} />
                              </ActionIcon>
                            </Tooltip>
                          )}
                        </Table.Td>
                        <Table.Td>{formatData(r.data_efecte)}</Table.Td>
                        <Table.Td>{euros.format(r.lloguer_anterior)}</Table.Td>
                        <Table.Td>
                          {r.percentatge === null ? '—' : `${nombre.format(r.percentatge)} %`}
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
              </ScrollArea.Autosize>
            </>
          )}
        </Fieldset>
      </Stack>
    </>
  )
}

// /immobles/:id/contractes/:idContracte/revisions
function RevisionsContracte(): React.JSX.Element {
  const { t } = useTranslation()
  const { id, idContracte } = useParams()
  const [immoble, setImmoble] = useState<Immoble | null>(null)
  const [contracte, setContracte] = useState<ContracteLlistat | null>(null)
  const [revisions, setRevisions] = useState<RevisioLloguer[]>([])
  const [carregant, setCarregant] = useState(true)
  // Cada cop que canvia, l'efecte torna a llegir les dades de la BD.
  const [versio, setVersio] = useState(0)
  // La revisió que s'edita: el seu id, 'nova', o null (la que toca per defecte).
  const [edicio, setEdicio] = useState<number | 'nova' | null>(null)
  // Canvia cada cop que han arribat dades noves de la BD. El formulari es torna a muntar amb aquesta clau (i no amb
  // `versio`, que canvia abans que les dades arribin: llavors el formulari agafaria les antigues).
  const [versioDades, setVersioDades] = useState(0)
  // Per al missatge de "no trobat": si no n'hi ha cap pantalla anterior, a la llista de contractes (o a Immobles, si l'immoble no existeix).
  const tornarNoTrobat = useTornar(immoble === null ? '/immobles' : `/immobles/${id}/contractes`)

  useEffect(() => {
    let cancelat = false
    Promise.all([
      window.api.inmobles.obtenirUn(Number(id)),
      window.api.contractes.obtenirUnExt(Number(idContracte)),
      window.api.revisions.obtenir(Number(idContracte))
    ]).then(([rImmoble, rContracte, rRevisions]) => {
      if (cancelat) return
      if (esOk(rImmoble)) setImmoble(rImmoble.dades)
      if (esOk(rContracte)) setContracte(rContracte.dades)
      if (esOk(rRevisions)) setRevisions(rRevisions.dades)
      setCarregant(false)
      setVersioDades((v) => v + 1)
    })
    // Si el component es desmunta abans que arribin les respostes, no s'actualitza l'estat.
    return () => {
      cancelat = true
    }
  }, [id, idContracte, versio])

  // Un contracte que no existeix, o que és d'un altre immoble, es tracta com a no trobat.
  const noTrobat =
    !carregant && (immoble === null || contracte === null || contracte.id_inmoble !== Number(id))

  const darrera = revisions[0] ?? null
  const pendent = darrera !== null && esPendent(darrera)
  const tancat = contracte !== null && contracte.data_fi !== null
  // Quina revisió s'edita: l'última (si s'ha triat, o si és pendent), una de nova (només amb el contracte obert i
  // l'última enviada), o cap (contracte tancat: només consulta).
  let actual: number | 'nova' | 'cap'
  if (typeof edicio === 'number' && darrera?.id === edicio) actual = edicio
  else if (tancat) actual = 'cap'
  else if (edicio === 'nova' && !pendent) actual = 'nova'
  else actual = pendent && darrera ? darrera.id : 'nova'
  const revisio = typeof actual === 'number' ? (darrera as RevisioLloguer) : null
  return (
    <>
      {carregant && <Text c="dimmed">{t('comu.carregant')}</Text>}

      {noTrobat && (
        <>
          <Text c="dimmed">
            {immoble === null ? t('immobles.noTrobat') : t('contractes.noTrobat')}
          </Text>
          <Button
            mt="md"
            variant="default"
            leftSection={<IconCornerUpLeft size={16} />}
            onClick={tornarNoTrobat}
          >
            {t('comu.tornar')}
          </Button>
        </>
      )}

      {!carregant && !noTrobat && immoble && contracte && (
        <PantallaRevisions
          key={`${actual}-${versioDades}`}
          immoble={immoble}
          contracte={contracte}
          revisions={revisions}
          revisio={revisio}
          pendent={pendent}
          tancat={tancat}
          onEdicio={setEdicio}
          onDesat={(idDesat) => {
            setEdicio(idDesat)
            setVersio((v) => v + 1)
          }}
          onEliminada={() => {
            setEdicio(null)
            setVersio((v) => v + 1)
          }}
        />
      )}
    </>
  )
}

export default RevisionsContracte
