import { useEffect, useState } from 'react'
import {
  Button,
  Fieldset,
  Group,
  Select,
  SimpleGrid,
  Stack,
  Tabs,
  Text,
  Textarea,
  TextInput
} from '@mantine/core'
import { useForm } from '@mantine/form'
import { modals } from '@mantine/modals'
import { notifications } from '@mantine/notifications'
import { IconCurrencyEuro } from '@tabler/icons-react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { CampData } from '../components/CampData'
import CampNumeric from '../components/CampNumeric'
import CanvisSenseDesar from '../components/CanvisSenseDesar'
import { adreca } from '../utils/adreca'
import { aNumeroForm, buitANull } from '../utils/formulari'
import { esOk } from '../utils/resultat'
import RevisarLloguer from './RevisarLloguer'
import { MOTIUS_FI } from '../../../shared/tipus'
import type {
  Contracte,
  ContracteDades,
  DocumentContracte,
  Immoble,
  Inquili,
  MotiuFi,
  TipusDocumentContracte
} from '../../../shared/tipus'
import { hiHaCapaOberta } from '../utils/teclat'
import { ingresPendent } from '../utils/avisosContracte'
import DocumentUnicContracte from './DocumentUnicContracte'

// Els selectors treballen amb text (id com a string); les dates són text ISO AAAA-MM-DD; els imports, número
// (o text mentre s'escriu).
interface Valors {
  data_inici: string | null
  d_fi_prevista: string | null
  id_inquili: string | null
  id_inquili_2: string | null
  comentaris: string
  lloguer_inicial: number | string
  fianca_adicional: number | string
  lloguer_actual: number | string
  data_ultima_revisio: string | null
  data_fi: string | null
  motiu_fi: string | null
  devolucio_import: number | string
  devolucio_motiu: string
  fianca_import: number | string
  fianca_nc: string
  fianca_data_model2: string | null
  fianca_data_ingres: string | null
  fianca_num_registre: string
  fianca_data_notificacio: string | null
  devolucio_nc: string
  devolucio_data_sollicitud: string | null
  devolucio_data_cobrament: string | null
  fianca_comentari: string
}

// Camps de la pestanya "Fiança INCASOL". Els de l'altra pestanya (Dades) són la resta.
const CAMPS_FIANCA = new Set([
  'fianca_nc',
  'fianca_data_model2',
  'fianca_data_ingres',
  'fianca_num_registre',
  'fianca_data_notificacio',
  'devolucio_nc',
  'devolucio_data_sollicitud',
  'devolucio_data_cobrament',
  'fianca_comentari'
])

// Pestanya del primer error: si n'hi ha cap a Dades, aquesta; si no, Fiança INCASOL.
function pestanyaDelPrimerError(errors: Record<string, unknown>): string {
  return Object.keys(errors).some((k) => !CAMPS_FIANCA.has(k)) ? 'dades' : 'fianca'
}

// Què rep la capçalera (que dibuixa la fitxa) del formulari.
export interface AccionsCapcalera {
  // Executa una acció que canvia de pantalla; si hi ha canvis sense desar, pregunta abans.
  anarAmbGuarda: (accio: () => void) => void
  // Desa el formulari (el mateix que fa Ctrl+S).
  desar: () => void
  // Torna a la llista de contractes de l'immoble (amb la mateixa protecció).
  tornar: () => void
}

interface Props {
  immoble: Immoble // fix: no es pot canviar ni en crear ni en editar
  contracte: Contracte | null // null = contracte nou
  inquilins: Inquili[]
  // Es crida després de desar (alta o edició) amb el contracte tal com ha quedat a la BD.
  onDesat: (contracte: Contracte) => void
  // La fitxa dibuixa la capçalera (títol, subtítol i botons) a dalt del formulari.
  capcalera: (accions: AccionsCapcalera) => React.ReactNode
  // Pestanya activa: viu a la fitxa perquè es conservi quan el formulari es torna a muntar en desar.
  pestanya: string
  onPestanya: (pestanya: string) => void
  // Es crida quan s'afegeix o s'elimina un document des d'un clip (la fitxa refresca la barra d'avisos).
  onDocumentsCanvi: () => void
}

function FormulariContracte({
  immoble,
  contracte,
  inquilins,
  onDesat,
  capcalera,
  pestanya,
  onPestanya,
  onDocumentsCanvi
}: Props): React.JSX.Element {
  const { t } = useTranslation()
  const navigate = useNavigate()

  // Documents del contracte: els de tipus únic són els que mostren els clips. Es desen a l'instant i no formen part
  // del formulari: no afecten el diàleg de canvis sense desar.
  const [documents, setDocuments] = useState<DocumentContracte[]>([])
  const [versioDocs, setVersioDocs] = useState(0)
  const idContracte = contracte?.id ?? null

  useEffect(() => {
    if (idContracte === null) return
    let cancelat = false
    window.api.documents.obtenir(idContracte).then((resposta) => {
      if (cancelat) return
      if (esOk(resposta)) setDocuments(resposta.dades)
    })
    // Si el component es desmunta abans que arribi la resposta, no s'actualitza l'estat.
    return () => {
      cancelat = true
    }
  }, [idContracte, versioDocs])

  function alCanviDocuments(): void {
    setVersioDocs((v) => v + 1)
    onDocumentsCanvi()
  }

  // Etiqueta d'un camp amb la icona del seu document al costat.
  function etiqueta(
    text: string,
    tipus: TipusDocumentContracte,
    obligatori?: boolean
  ): React.ReactNode {
    return (
      <Group gap={6} wrap="nowrap">
        <span>{text}</span>
        {obligatori && <span style={{ color: 'var(--mantine-color-red-6)' }}>*</span>}
        <DocumentUnicContracte
          idContracte={idContracte}
          tipus={tipus}
          doc={documents.find((d) => d.tipus === tipus)}
          onCanvi={alCanviDocuments}
        />
      </Group>
    )
  }

  // Nom de l'inquilí per al desplegable; el NIF ajuda a distingir-ne dos de semblants.
  const opcions = inquilins.map((i) => ({
    value: String(i.id),
    label:
      ([i.nom, i.cognoms].filter(Boolean).join(' ') || t('inquilins.senseNom')) +
      (i.nif ? ` (${i.nif})` : '')
  }))

  // Un nombre >= 0 o buit.
  const nombreOpcional = (v: number | string): string | null => {
    if (v === '') return null
    const n = aNumeroForm(v)
    return n === null || n < 0 ? t('immobles.validacio.numero') : null
  }

  // Suma de la fiança i de la fiança addicional (arrodonida a cèntims, per evitar errors de decimals).
  const sumaFiances = (v: Valors): number =>
    Math.round(
      ((aNumeroForm(v.fianca_import) ?? 0) + (aNumeroForm(v.fianca_adicional) ?? 0)) * 100
    ) / 100

  const form = useForm<Valors>({
    initialValues: {
      data_inici: contracte?.data_inici ?? null,
      d_fi_prevista: contracte?.d_fi_prevista ?? null,
      id_inquili: contracte ? String(contracte.id_inquili) : null,
      id_inquili_2: contracte?.id_inquili_2 ? String(contracte.id_inquili_2) : null,
      comentaris: contracte?.comentaris ?? '',
      lloguer_inicial: contracte?.lloguer_inicial ?? '',
      fianca_adicional: contracte?.fianca_adicional ?? 0,
      lloguer_actual: contracte?.lloguer_actual ?? '',
      data_ultima_revisio: contracte?.data_ultima_revisio ?? null,
      data_fi: contracte?.data_fi ?? null,
      motiu_fi: contracte?.motiu_fi ?? null,
      devolucio_import: contracte?.devolucio_import ?? '',
      devolucio_motiu: contracte?.devolucio_motiu ?? '',
      fianca_import: contracte?.fianca_import ?? '',
      fianca_nc: contracte?.fianca_nc ?? '',
      fianca_data_model2: contracte?.fianca_data_model2 ?? null,
      fianca_data_ingres: contracte?.fianca_data_ingres ?? null,
      fianca_num_registre: contracte?.fianca_num_registre ?? '',
      fianca_data_notificacio: contracte?.fianca_data_notificacio ?? null,
      devolucio_nc: contracte?.devolucio_nc ?? '',
      devolucio_data_sollicitud: contracte?.devolucio_data_sollicitud ?? null,
      devolucio_data_cobrament: contracte?.devolucio_data_cobrament ?? null,
      fianca_comentari: contracte?.fianca_comentari ?? ''
    },
    validate: {
      data_inici: (v) => (v ? null : t('comu.obligatori')),
      d_fi_prevista: (v, vals) => {
        if (!v) return t('comu.obligatori')
        return vals.data_inici && v < vals.data_inici
          ? t('contractes.validacio.fiPrevistaAnterior')
          : null
      },
      data_fi: (v, vals) =>
        v && vals.data_inici && v < vals.data_inici
          ? t('contractes.validacio.dataFiAnterior')
          : null,
      id_inquili: (v) => (v ? null : t('comu.obligatori')),
      id_inquili_2: (v, vals) =>
        v && v === vals.id_inquili ? t('contractes.validacio.mateixInquili') : null,
      lloguer_inicial: (v) => (v === '' ? t('comu.obligatori') : nombreOpcional(v)),
      fianca_adicional: (v) => (v === '' ? t('comu.obligatori') : nombreOpcional(v)),
      fianca_import: nombreOpcional,
      devolucio_import: nombreOpcional,
      // Si l'import a retornar és inferior a la suma de les dues fiances, cal justificar-ho.
      devolucio_motiu: (v, vals) => {
        if (!vals.data_fi || v.trim()) return null
        const retornar = aNumeroForm(vals.devolucio_import)
        return retornar !== null && Math.round(retornar * 100) < Math.round(sumaFiances(vals) * 100)
          ? t('comu.obligatori')
          : null
      },
      // Les parelles de la fiança s'informen juntes: l'error surt al camp que falta.
      fianca_nc: (v, vals) =>
        !v.trim() && vals.fianca_data_model2 ? t('contractes.validacio.parellaModel2') : null,
      fianca_data_model2: (v, vals) =>
        v === null && vals.fianca_nc.trim() ? t('contractes.validacio.parellaModel2') : null,
      fianca_num_registre: (v, vals) =>
        !v.trim() && vals.fianca_data_notificacio
          ? t('contractes.validacio.parellaNotificacio')
          : null,
      fianca_data_notificacio: (v, vals) =>
        v === null && vals.fianca_num_registre.trim()
          ? t('contractes.validacio.parellaNotificacio')
          : null,
      // La devolució: el NC i la data de sol·licitud van junts; l'abonament no és anterior a la sol·licitud, ni la
      // sol·licitud a la fi del contracte.
      devolucio_nc: (v, vals) =>
        !v.trim() && vals.devolucio_data_sollicitud
          ? t('contractes.validacio.parellaDevolucio')
          : null,
      devolucio_data_sollicitud: (v, vals) => {
        if (v === null && vals.devolucio_nc.trim()) {
          return t('contractes.validacio.parellaDevolucio')
        }
        return v && vals.data_fi && v < vals.data_fi ? t('contractes.validacio.solAnterior') : null
      },
      devolucio_data_cobrament: (v, vals) =>
        v && vals.devolucio_data_sollicitud && v < vals.devolucio_data_sollicitud
          ? t('contractes.validacio.cobAnterior')
          : null
    }
  })

  const teFi = Boolean(form.values.data_fi)

  const retornarForm = aNumeroForm(form.values.devolucio_import)
  const justificacioObligatoria =
    teFi &&
    retornarForm !== null &&
    Math.round(retornarForm * 100) < Math.round(sumaFiances(form.values) * 100)

  // Esborrar la data de fi buida les dades que només tenen sentit amb el contracte tancat, i les desactiva. En posar
  // la data de fi per primer cop, l'import a retornar surt amb la suma de les dues fiances (si encara és buit).
  function canviarDataFi(v: string | null): void {
    const teFiAbans = Boolean(form.values.data_fi)
    form.setFieldValue('data_fi', v)
    if (!v) {
      form.setValues({
        motiu_fi: null,
        devolucio_import: '',
        devolucio_motiu: '',
        devolucio_nc: '',
        devolucio_data_sollicitud: null,
        devolucio_data_cobrament: null
      })
      return
    }
    if (!teFiAbans && form.values.devolucio_import === '') {
      const suma = sumaFiances(form.values)
      if (suma > 0) form.setFieldValue('devolucio_import', suma)
    }
  }

  // Revisar lloguer: NO escriu a la BD; només posa el lloguer actual i la data de revisió als camps del formulari,
  // que es desen amb Desar.
  function revisar(): void {
    const dataInici = form.values.data_inici
    if (!dataInici) return
    modals.open({
      title: t('contractes.revisar.titol'),
      children: (
        <RevisarLloguer
          lloguerActual={aNumeroForm(form.values.lloguer_actual) ?? 0}
          dataUltimaRevisio={form.values.data_ultima_revisio ?? dataInici}
          dataInici={dataInici}
          onAcceptar={(lloguer, data) => {
            form.setFieldValue('lloguer_actual', lloguer)
            form.setFieldValue('data_ultima_revisio', data)
          }}
        />
      )
    })
  }

  // Desa el formulari (alta o edició). Retorna el contracte tal com ha quedat a la BD, o null si ha fallat
  // (l'error ja s'ha notificat).
  async function desarValors(v: Valors): Promise<Contracte | null> {
    // Els camps obligatoris ja estan validats: els `as` només ajusten el tipus.
    const lloguerInicial = aNumeroForm(v.lloguer_inicial) as number
    const dades: ContracteDades = {
      id_inmoble: immoble.id,
      data_inici: v.data_inici as string,
      data_fi: v.data_fi,
      motiu_fi: (v.motiu_fi as MotiuFi | null) ?? null,
      id_inquili: Number(v.id_inquili),
      id_inquili_2: v.id_inquili_2 ? Number(v.id_inquili_2) : null,
      d_fi_prevista: v.d_fi_prevista as string,
      lloguer_inicial: lloguerInicial,
      // En crear, el Main fixa el lloguer actual i la data de revisió a partir de l'inicial i de la data d'inici.
      lloguer_actual: contracte ? (aNumeroForm(v.lloguer_actual) as number) : lloguerInicial,
      data_ultima_revisio: contracte ? (v.data_ultima_revisio as string) : (v.data_inici as string),
      fianca_adicional: aNumeroForm(v.fianca_adicional) as number,
      fianca_import: aNumeroForm(v.fianca_import),
      fianca_nc: buitANull(v.fianca_nc),
      fianca_data_model2: v.fianca_data_model2,
      fianca_data_ingres: v.fianca_data_ingres,
      fianca_data_notificacio: v.fianca_data_notificacio,
      fianca_num_registre: buitANull(v.fianca_num_registre),
      fianca_comentari: buitANull(v.fianca_comentari),
      devolucio_nc: buitANull(v.devolucio_nc),
      devolucio_data_sollicitud: v.devolucio_data_sollicitud,
      devolucio_data_cobrament: v.devolucio_data_cobrament,
      devolucio_import: aNumeroForm(v.devolucio_import),
      devolucio_motiu: buitANull(v.devolucio_motiu),
      comentaris: buitANull(v.comentaris)
    }

    let desat: Contracte | null = null
    if (contracte) {
      if (!esOk(await window.api.contractes.actualitzar(contracte.id, dades))) return null // p. ex. CONTRACTE_SOLAPAT
      const r = await window.api.contractes.obtenirUn(contracte.id)
      if (esOk(r)) desat = r.dades
    } else {
      const r = await window.api.contractes.crear(dades)
      if (esOk(r)) desat = r.dades
    }
    if (desat === null) return null

    // Un contracte obert que passa a tancat, amb fiança: queda pendent gestionar la devolució.
    const acabaDeTancar = contracte !== null && contracte.data_fi === null && dades.data_fi !== null
    const teFianca =
      dades.fianca_import !== null ||
      dades.fianca_data_model2 !== null ||
      dades.fianca_data_notificacio !== null
    const avisDevolucio = acabaDeTancar && teFianca
    notifications.show({
      color: avisDevolucio ? 'yellow' : 'green',
      message: avisDevolucio ? t('contractes.desatTancat') : t('contractes.desat')
    })
    // Fiança INCASOL sense la data de l'ingrés: cal gestionar-ne l'ingrés.
    if (ingresPendent(dades)) {
      notifications.show({ color: 'yellow', message: t('contractes.avisIngres') })
    }
    return desat
  }

  async function desar(v: Valors): Promise<void> {
    const desat = await desarValors(v)
    if (desat !== null) onDesat(desat)
  }

  // Desa el formulari (botó Desar i Ctrl+S). Si la validació falla, es canvia a la pestanya del primer error.
  function desarFormulari(): void {
    form.onSubmit(desar, (errors) => onPestanya(pestanyaDelPrimerError(errors)))()
  }

  // Executa una acció que canvia de pantalla; si hi ha canvis sense desar, pregunta abans.
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
            // Si hi ha errors de validació o el desat falla, ens quedem a la pantalla: es tanca el diàleg,
            // es canvia a la pestanya del primer error i els errors es veuen al formulari.
            const validacio = form.validate()
            if (validacio.hasErrors) onPestanya(pestanyaDelPrimerError(validacio.errors))
            const desat = validacio.hasErrors ? null : await desarValors(form.values)
            modals.closeAll()
            if (desat !== null) accio()
          }}
          onDescartar={() => {
            modals.closeAll()
            accio()
          }}
        />
      )
    })
  }

  const tornar = (): void => anarAmbGuarda(() => navigate(`/immobles/${immoble.id}/contractes`))

  // Ctrl+S desa; Escape = Tornar, amb la mateixa protecció. Cap dels dos actua si hi ha una finestra o un
  // desplegable obert (calendari, diàleg de canvis sense desar, revisar lloguer...). Intro NO desa: el formulari no
  // té cap botó d'enviament.
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

  return (
    <>
      {capcalera({ anarAmbGuarda, desar: desarFormulari, tornar })}

      <Tabs value={pestanya} onChange={(v) => v && onPestanya(v)} keepMounted>
        <Tabs.List>
          <Tabs.Tab value="dades">{t('contractes.pestanyes.dades')}</Tabs.Tab>
          <Tabs.Tab value="fianca">{t('contractes.pestanyes.fianca')}</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="dades" pt="md">
          <Stack>
            <Fieldset legend={t('contractes.seccions.dades')}>
              <SimpleGrid cols={{ base: 1, sm: 2 }}>
                <TextInput
                  readOnly
                  variant="filled"
                  label={t('contractes.camps.immoble')}
                  value={adreca(immoble)}
                  style={{ gridColumn: '1 / -1' }}
                />
                <Select
                  withAsterisk
                  searchable
                  data={opcions}
                  nothingFoundMessage={t('comu.capResultat')}
                  placeholder={t('contractes.cercarInquili')}
                  label={t('contractes.camps.inquili')}
                  {...form.getInputProps('id_inquili')}
                />
                <Select
                  searchable
                  clearable
                  data={opcions}
                  nothingFoundMessage={t('comu.capResultat')}
                  placeholder={t('contractes.cercarInquili')}
                  label={t('contractes.camps.inquili2')}
                  {...form.getInputProps('id_inquili_2')}
                />
                <CampData
                  // withAsterisk
                  label={etiqueta(t('contractes.camps.dataInici'), 'contracte', true)}
                  {...form.getInputProps('data_inici')}
                />
                <CampData
                  withAsterisk
                  label={t('contractes.camps.dFiPrevista')}
                  {...form.getInputProps('d_fi_prevista')}
                />
              </SimpleGrid>
              <Textarea
                mt="md"
                autosize
                minRows={2}
                label={t('contractes.camps.comentaris')}
                {...form.getInputProps('comentaris')}
              />
            </Fieldset>

            <Fieldset legend={t('contractes.seccions.lloguer')}>
              <SimpleGrid cols={{ base: 1, sm: 3 }}>
                <CampNumeric
                  withAsterisk
                  tipus="import"
                  label={t('contractes.camps.lloguerInicial')}
                  {...form.getInputProps('lloguer_inicial')}
                />
                <CampNumeric
                  tipus="import"
                  label={t('contractes.camps.fiancaImport')}
                  {...form.getInputProps('fianca_import')}
                />
                <CampNumeric
                  withAsterisk
                  tipus="import"
                  label={t('contractes.camps.fiancaAdicional')}
                  {...form.getInputProps('fianca_adicional')}
                />
                {/* El lloguer actual i la data de revisió només existeixen en editar, i només els canvia Revisar lloguer. */}
                {contracte && (
                  <>
                    <CampNumeric
                      readOnly
                      variant="filled"
                      tipus="import"
                      label={t('contractes.camps.lloguerActual')}
                      value={form.values.lloguer_actual}
                    />
                    <CampData
                      readOnly
                      variant="filled"
                      label={t('contractes.camps.dataUltimaRevisio')}
                      value={form.values.data_ultima_revisio}
                    />
                    {/* A la mateixa línia que els dos camps, a la dreta, a l'altura dels camps. */}
                    <Group justify="flex-end" align="flex-end">
                      <Button
                        variant="default"
                        disabled={teFi}
                        leftSection={<IconCurrencyEuro size={16} />}
                        onClick={revisar}
                      >
                        {t('contractes.revisar.titol')}
                      </Button>
                    </Group>
                  </>
                )}
              </SimpleGrid>
            </Fieldset>

            <Fieldset legend={t('contractes.seccions.tancament')}>
              {!teFi && (
                <Text size="sm" c="dimmed" mb="sm">
                  {t('contractes.nota.senseFi')}
                </Text>
              )}
              <SimpleGrid cols={{ base: 1, sm: 2 }}>
                <CampData
                  clearable
                  label={t('contractes.camps.dataFi')}
                  {...form.getInputProps('data_fi')}
                  onChange={canviarDataFi}
                />
                <Select
                  clearable
                  disabled={!teFi}
                  data={MOTIUS_FI.map((m) => ({ value: m, label: t(`contractes.motiusFi.${m}`) }))}
                  label={t('contractes.camps.motiuFi')}
                  {...form.getInputProps('motiu_fi')}
                />
                <CampNumeric
                  disabled={!teFi}
                  tipus="import"
                  label={t('contractes.camps.importARetornar')}
                  {...form.getInputProps('devolucio_import')}
                />
              </SimpleGrid>
              <Textarea
                mt="md"
                autosize
                minRows={3}
                disabled={!teFi}
                withAsterisk={justificacioObligatoria}
                label={t('contractes.camps.justificacioImport')}
                {...form.getInputProps('devolucio_motiu')}
              />
            </Fieldset>
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="fianca" pt="md">
          <Stack>
            <Fieldset legend={t('contractes.seccions.ingres')}>
              <SimpleGrid cols={{ base: 1, sm: 2 }}>
                <CampNumeric
                  tipus="import"
                  disabled
                  label={t('contractes.camps.fiancaImport')}
                  // {...form.getInputProps('fianca_import')}
                  value={form.values.fianca_import}
                />
                <div />
                <TextInput
                  label={t('contractes.camps.fiancaNc')}
                  {...form.getInputProps('fianca_nc')}
                />
                <CampData
                  clearable
                  label={etiqueta(t('contractes.camps.fiancaDataModel2'), 'fianca_model2')}
                  {...form.getInputProps('fianca_data_model2')}
                />
                <CampData
                  clearable
                  label={etiqueta(t('contractes.camps.fiancaDataIngres'), 'rebut')}
                  // label={t('contractes.camps.fiancaDataIngres')}
                  {...form.getInputProps('fianca_data_ingres')}
                />
                <div />
                <TextInput
                  label={t('contractes.camps.fiancaNumRegistre')}
                  {...form.getInputProps('fianca_num_registre')}
                />
                <CampData
                  clearable
                  label={etiqueta(
                    t('contractes.camps.fiancaDataNotificacio'),
                    'fianca_notificacio'
                  )}
                  {...form.getInputProps('fianca_data_notificacio')}
                />
              </SimpleGrid>
            </Fieldset>

            <Fieldset legend={t('contractes.seccions.devolucio')}>
              {!teFi && (
                <Text size="sm" c="dimmed" mb="sm">
                  {t('contractes.nota.senseFi')}
                </Text>
              )}
              <SimpleGrid cols={{ base: 1, sm: 2 }}>
                <TextInput
                  disabled={!teFi}
                  label={t('contractes.camps.devolucioNc')}
                  {...form.getInputProps('devolucio_nc')}
                />
                <CampData
                  clearable
                  disabled={!teFi}
                  label={etiqueta(t('contractes.camps.devolucioDataSollicitud'), 'fianca_model3')}
                  {...form.getInputProps('devolucio_data_sollicitud')}
                />
                <CampData
                  clearable
                  disabled={!teFi}
                  label={t('contractes.camps.devolucioDataCobrament')}
                  {...form.getInputProps('devolucio_data_cobrament')}
                />
              </SimpleGrid>
            </Fieldset>

            <Fieldset legend={t('contractes.seccions.comentari')}>
              <Textarea
                autosize
                minRows={2}
                label={t('contractes.camps.fiancaComentari')}
                {...form.getInputProps('fianca_comentari')}
              />
            </Fieldset>
          </Stack>
        </Tabs.Panel>
      </Tabs>
    </>
  )
}

export default FormulariContracte
