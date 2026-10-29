import { useEffect } from 'react'
import { Fieldset, SimpleGrid, Stack, Tabs, TextInput } from '@mantine/core'
import { DatePickerInput } from '@mantine/dates'
import { useForm } from '@mantine/form'
import { modals } from '@mantine/modals'
import { notifications } from '@mantine/notifications'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import CanvisSenseDesar from '../components/CanvisSenseDesar'
import { esOk } from '../utils/resultat'
import type { Immoble, ImmobleDades } from '../../../shared/tipus'
import { aNumero, buitANull } from '../utils/formulari'

// Els camps de text són sempre string al formulari; a la BD els buits són NULL.
// Les dates són text ISO AAAA-MM-DD (o null), tal com les desa la BD. Els números (superfícies, imports i
// l'any) són text, amb coma o punt decimal; es converteixen en desar.
interface Valors {
  via: string
  num_via: string
  pis: string
  porta: string
  codi_postal: string
  localitat: string
  provincia: string
  ref_catastral: string
  superficie_m2: string
  superficie_pati: string
  val_cadastral_total: string
  val_cadastral_constr: string
  any_construccio: string
  data_compra: string | null
  valor_compra: string
  cert_en_reg: string
  cert_en_class: string
  cert_en_data: string | null
  cert_en_caduc: string | null
  ced_hab_reg: string
  ced_hab_superficie_util: string
  ced_hab_data: string | null
  ced_hab_caduc: string | null
}

// Camps de la primera pestanya ("Adreça i cadastre"). Els de la segona són la resta.
const CAMPS_ADRECA = [
  'via',
  'num_via',
  'pis',
  'porta',
  'codi_postal',
  'localitat',
  'provincia',
  'ref_catastral',
  'superficie_m2',
  'superficie_pati',
  'val_cadastral_total',
  'val_cadastral_constr',
  'any_construccio',
  'data_compra',
  'valor_compra'
]

// Pestanya on hi ha el primer camp amb error: si n'hi ha cap a la primera, aquesta; si no, la segona.
function pestanyaDelPrimerError(errors: Record<string, unknown>): string {
  return CAMPS_ADRECA.some((k) => k in errors) ? 'adreca' : 'certificat'
}

// Què rep la capçalera (que dibuixa la fitxa) del formulari.
export interface AccionsCapcalera {
  // Executa una acció que canvia de pantalla; si hi ha canvis sense desar, pregunta abans.
  anarAmbGuarda: (accio: () => void) => void
  // `id` del formulari: el botó Desar de la capçalera hi queda enllaçat amb l'atribut `form`.
  idFormulari: string
  // Torna a la llista d'Immobles (amb la mateixa protecció).
  tornar: () => void
}

interface Props {
  immoble: Immoble | null
  // Es crida després de desar (alta o edició) amb l'immoble tal com ha quedat a la BD.
  onDesat: (immoble: Immoble) => void
  // La fitxa dibuixa la capçalera (títol, avisos i botons) a dalt del formulari.
  capcalera: (accions: AccionsCapcalera) => React.ReactNode
  // Pestanya activa: viu a la fitxa perquè es conservi quan el formulari es torna a muntar en desar.
  pestanya: string
  onPestanya: (pestanya: string) => void
}

const ID_FORMULARI = 'formulari-immoble'

function FormulariImmoble({
  immoble,
  onDesat,
  capcalera,
  pestanya,
  onPestanya
}: Props): React.JSX.Element {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const anyActual = new Date().getFullYear()

  // Un nombre >= 0 o buit (els imports i les superfícies opcionals).
  const nombreOpcional = (v: string): string | null => {
    if (!v.trim()) return null
    const n = aNumero(v)
    return n === null || n < 0 ? t('immobles.validacio.numero') : null
  }

  const form = useForm<Valors>({
    initialValues: {
      via: immoble?.via ?? '',
      num_via: immoble?.num_via ?? '',
      pis: immoble?.pis ?? '',
      porta: immoble?.porta ?? '',
      codi_postal: immoble?.codi_postal ?? '',
      localitat: immoble?.localitat ?? '',
      provincia: immoble?.provincia ?? '',
      ref_catastral: immoble?.ref_catastral ?? '',
      superficie_m2: String(immoble?.superficie_m2 ?? ''),
      superficie_pati: String(immoble?.superficie_pati ?? ''),
      val_cadastral_total: String(immoble?.val_cadastral_total ?? ''),
      val_cadastral_constr: String(immoble?.val_cadastral_constr ?? ''),
      any_construccio: String(immoble?.any_construccio ?? ''),
      data_compra: immoble?.data_compra ?? null,
      valor_compra: String(immoble?.valor_compra ?? ''),
      cert_en_reg: immoble?.cert_en_reg ?? '',
      cert_en_class: immoble?.cert_en_class ?? '',
      cert_en_data: immoble?.cert_en_data ?? null,
      cert_en_caduc: immoble?.cert_en_caduc ?? null,
      ced_hab_reg: immoble?.ced_hab_reg ?? '',
      ced_hab_superficie_util: String(immoble?.ced_hab_superficie_util ?? ''),
      ced_hab_data: immoble?.ced_hab_data ?? null,
      ced_hab_caduc: immoble?.ced_hab_caduc ?? null
    },
    validate: {
      via: (v) => (v.trim() ? null : t('comu.obligatori')),
      num_via: (v) => (v.trim() ? null : t('comu.obligatori')),
      pis: (v) => (v.trim() ? null : t('comu.obligatori')),
      codi_postal: (v) => (v.trim() ? null : t('comu.obligatori')),
      localitat: (v) => (v.trim() ? null : t('comu.obligatori')),
      provincia: (v) => (v.trim() ? null : t('comu.obligatori')),
      ref_catastral: (v) => (v.trim() ? null : t('comu.obligatori')),
      superficie_m2: (v) => {
        if (!v.trim()) return t('comu.obligatori')
        const n = aNumero(v)
        return n === null || n < 0 ? t('immobles.validacio.numero') : null
      },
      superficie_pati: nombreOpcional,
      valor_compra: nombreOpcional,
      val_cadastral_total: nombreOpcional,
      // La construcció no pot valer més que el total (si hi són els dos).
      val_cadastral_constr: (v, vals) => {
        const e = nombreOpcional(v)
        if (e) return e
        const constr = aNumero(v)
        const total = aNumero(vals.val_cadastral_total)
        return constr !== null && total !== null && constr > total
          ? t('immobles.validacio.construccioMajor')
          : null
      },
      any_construccio: (v) => {
        if (!v.trim()) return null
        const n = Number(v)
        return Number.isInteger(n) && n >= 1800 && n <= anyActual
          ? null
          : t('immobles.validacio.anyInvalid', { max: anyActual })
      },
      // La compra no pot ser anterior a l'1 de gener de l'any de construcció (si hi són els dos).
      data_compra: (v, vals) => {
        const any = Number(vals.any_construccio)
        return v && vals.any_construccio.trim() && Number.isInteger(any) && v < `${any}-01-01`
          ? t('immobles.validacio.compraAnterior')
          : null
      },
      // La superfície útil no pot superar la superfície (si hi són les dues).
      ced_hab_superficie_util: (v, vals) => {
        const e = nombreOpcional(v)
        if (e) return e
        const util = aNumero(v)
        const sup = aNumero(vals.superficie_m2)
        return util !== null && sup !== null && util > sup
          ? t('immobles.validacio.utilMajor')
          : null
      }
    }
  })

  // Desa el formulari (alta o edició). Retorna l'immoble tal com ha quedat a la BD, o null si ha fallat
  // (l'error ja s'ha notificat).
  async function desarValors(v: Valors): Promise<Immoble | null> {
    const dades: ImmobleDades = {
      via: v.via.trim(),
      num_via: v.num_via.trim(),
      pis: v.pis.trim(),
      porta: buitANull(v.porta),
      codi_postal: v.codi_postal.trim(),
      localitat: v.localitat.trim(),
      provincia: v.provincia.trim(),
      ref_catastral: v.ref_catastral.trim(),
      superficie_m2: aNumero(v.superficie_m2) as number, // ja validat: no és buit
      superficie_pati: aNumero(v.superficie_pati),
      cert_en_reg: buitANull(v.cert_en_reg),
      cert_en_class: buitANull(v.cert_en_class),
      cert_en_data: v.cert_en_data,
      cert_en_caduc: v.cert_en_caduc,
      ced_hab_reg: buitANull(v.ced_hab_reg),
      ced_hab_data: v.ced_hab_data,
      ced_hab_caduc: v.ced_hab_caduc,
      ced_hab_superficie_util: aNumero(v.ced_hab_superficie_util),
      val_cadastral_total: aNumero(v.val_cadastral_total),
      val_cadastral_constr: aNumero(v.val_cadastral_constr),
      any_construccio: v.any_construccio.trim() ? Number(v.any_construccio) : null, // ja validat
      data_compra: v.data_compra,
      valor_compra: aNumero(v.valor_compra)
    }
    let desat: Immoble | null = null
    if (immoble) {
      if (!esOk(await window.api.inmobles.actualitzar(immoble.id, dades))) return null
      const r = await window.api.inmobles.obtenirUn(immoble.id)
      if (esOk(r)) desat = r.dades
    } else {
      const r = await window.api.inmobles.crear(dades)
      if (esOk(r)) desat = r.dades
    }
    if (desat === null) return null

    notifications.show({ color: 'green', message: t('immobles.desat') })
    return desat
  }

  async function desar(v: Valors): Promise<void> {
    const desat = await desarValors(v)
    if (desat !== null) onDesat(desat)
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

  const tornar = (): void => anarAmbGuarda(() => navigate('/immobles'))

  // Escape = Tornar, amb la mateixa protecció. No actua si hi ha una finestra o un desplegable obert
  // (calendari, diàleg de canvis sense desar...): llavors Escape només tanca això.
  useEffect(() => {
    function alTeclat(e: KeyboardEvent): void {
      if (e.key !== 'Escape' || e.defaultPrevented) return
      if (document.querySelector('[role="dialog"], .mantine-Popover-dropdown')) return
      tornar()
    }
    window.addEventListener('keydown', alTeclat)
    return () => window.removeEventListener('keydown', alTeclat)
  })

  return (
    <>
      {capcalera({ anarAmbGuarda, idFormulari: ID_FORMULARI, tornar })}

      {/* Si la validació falla, es canvia a la pestanya del primer camp amb error. */}
      <form
        id={ID_FORMULARI}
        onSubmit={form.onSubmit(desar, (errors) => onPestanya(pestanyaDelPrimerError(errors)))}
      >
        <Tabs value={pestanya} onChange={(v) => v && onPestanya(v)} keepMounted>
          <Tabs.List>
            <Tabs.Tab value="adreca">{t('immobles.pestanyes.adreca')}</Tabs.Tab>
            <Tabs.Tab value="certificat">{t('immobles.pestanyes.certificat')}</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="adreca" pt="md">
            <Stack>
              <Fieldset legend={t('immobles.seccions.adreca')}>
                <SimpleGrid cols={{ base: 1, sm: 2 }}>
                  <TextInput
                    withAsterisk
                    label={t('immobles.camps.via')}
                    {...form.getInputProps('via')}
                  />
                  <TextInput
                    withAsterisk
                    label={t('immobles.camps.numVia')}
                    {...form.getInputProps('num_via')}
                  />
                  <TextInput
                    withAsterisk
                    label={t('immobles.camps.pis')}
                    {...form.getInputProps('pis')}
                  />
                  <TextInput label={t('immobles.camps.porta')} {...form.getInputProps('porta')} />
                  <TextInput
                    withAsterisk
                    label={t('immobles.camps.codiPostal')}
                    {...form.getInputProps('codi_postal')}
                  />
                  <TextInput
                    withAsterisk
                    label={t('immobles.camps.localitat')}
                    {...form.getInputProps('localitat')}
                  />
                  <TextInput
                    withAsterisk
                    label={t('immobles.camps.provincia')}
                    {...form.getInputProps('provincia')}
                  />
                </SimpleGrid>
              </Fieldset>

              <Fieldset legend={t('immobles.seccions.cadastre')}>
                <SimpleGrid cols={{ base: 1, sm: 2 }}>
                  <TextInput
                    withAsterisk
                    label={t('immobles.camps.refCatastral')}
                    {...form.getInputProps('ref_catastral')}
                  />
                  <TextInput
                    withAsterisk
                    inputMode="decimal"
                    label={t('immobles.camps.superficie')}
                    {...form.getInputProps('superficie_m2')}
                  />
                  <TextInput
                    inputMode="decimal"
                    label={t('immobles.camps.superficiePati')}
                    {...form.getInputProps('superficie_pati')}
                  />
                  <div />
                  <TextInput
                    inputMode="decimal"
                    label={t('immobles.camps.valCadastralTotal')}
                    {...form.getInputProps('val_cadastral_total')}
                  />
                  <TextInput
                    inputMode="decimal"
                    label={t('immobles.camps.valCadastralConstr')}
                    {...form.getInputProps('val_cadastral_constr')}
                  />
                  <TextInput
                    inputMode="numeric"
                    label={t('immobles.camps.anyConstruccio')}
                    {...form.getInputProps('any_construccio')}
                  />
                  <DatePickerInput
                    clearable
                    valueFormat="DD/MM/YYYY"
                    label={t('immobles.camps.dataCompra')}
                    {...form.getInputProps('data_compra')}
                  />
                  <TextInput
                    inputMode="decimal"
                    label={t('immobles.camps.valorCompra')}
                    {...form.getInputProps('valor_compra')}
                  />
                </SimpleGrid>
              </Fieldset>
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="certificat" pt="md">
            <Stack>
              <Fieldset legend={t('immobles.seccions.certificat')}>
                <SimpleGrid cols={{ base: 1, sm: 2 }}>
                  <TextInput
                    label={t('immobles.camps.registre')}
                    {...form.getInputProps('cert_en_reg')}
                  />
                  <TextInput
                    label={t('immobles.camps.classe')}
                    {...form.getInputProps('cert_en_class')}
                  />
                  <DatePickerInput
                    clearable
                    valueFormat="DD/MM/YYYY"
                    label={t('immobles.camps.data')}
                    {...form.getInputProps('cert_en_data')}
                  />
                  <DatePickerInput
                    clearable
                    valueFormat="DD/MM/YYYY"
                    label={t('immobles.camps.caducitat')}
                    {...form.getInputProps('cert_en_caduc')}
                  />
                </SimpleGrid>
              </Fieldset>

              <Fieldset legend={t('immobles.seccions.cedula')}>
                <SimpleGrid cols={{ base: 1, sm: 2 }}>
                  <TextInput
                    label={t('immobles.camps.registre')}
                    {...form.getInputProps('ced_hab_reg')}
                  />
                  <TextInput
                    inputMode="decimal"
                    label={t('immobles.camps.superficieUtil')}
                    {...form.getInputProps('ced_hab_superficie_util')}
                  />
                  <DatePickerInput
                    clearable
                    valueFormat="DD/MM/YYYY"
                    label={t('immobles.camps.data')}
                    {...form.getInputProps('ced_hab_data')}
                  />
                  <DatePickerInput
                    clearable
                    valueFormat="DD/MM/YYYY"
                    label={t('immobles.camps.caducitat')}
                    {...form.getInputProps('ced_hab_caduc')}
                  />
                </SimpleGrid>
              </Fieldset>
            </Stack>
          </Tabs.Panel>
        </Tabs>
      </form>
    </>
  )
}

export default FormulariImmoble
