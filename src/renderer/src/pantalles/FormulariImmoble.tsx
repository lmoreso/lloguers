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
// Les dates són text ISO AAAA-MM-DD (o null), tal com les desa la BD.
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
  cert_en_reg: string
  cert_en_class: string
  cert_en_data: string | null
  cert_en_caduc: string | null
  ced_hab_reg: string
  ced_hab_data: string | null
  ced_hab_caduc: string | null
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
      cert_en_reg: immoble?.cert_en_reg ?? '',
      cert_en_class: immoble?.cert_en_class ?? '',
      cert_en_data: immoble?.cert_en_data ?? null,
      cert_en_caduc: immoble?.cert_en_caduc ?? null,
      ced_hab_reg: immoble?.ced_hab_reg ?? '',
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
      superficie_pati: (v) => {
        if (!v.trim()) return null
        const n = aNumero(v)
        return n === null || n < 0 ? t('immobles.validacio.numero') : null
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
      ced_hab_superficie_util: immoble?.ced_hab_superficie_util ?? null,
      val_cadastral_total: immoble?.val_cadastral_total ?? null,
      val_cadastral_constr: immoble?.val_cadastral_constr ?? null,
      any_construccio: immoble?.any_construccio ?? null,
      data_compra: immoble?.data_compra ?? null,
      valor_compra: immoble?.valor_compra ?? null
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
            // Si hi ha errors de validació o el desat falla, ens quedem a la pantalla: es tanca el diàleg
            // i els errors es veuen al formulari (tots els camps obligatoris són a la primera pestanya).
            const validacio = form.validate()
            if (validacio.hasErrors) onPestanya('adreca')
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

      {/* Si la validació falla, es canvia a la primera pestanya: hi són tots els camps obligatoris. */}
      <form id={ID_FORMULARI} onSubmit={form.onSubmit(desar, () => onPestanya('adreca'))}>
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
                  <div />
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
