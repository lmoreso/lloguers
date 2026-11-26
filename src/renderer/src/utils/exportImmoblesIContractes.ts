import type { ColumnaExportacio, ColumnaIFilesExport, FilaDades } from '../../../shared/tipus'
// import { adreca, nomSencer } from '../../../shared/utilitats'
import type { TFunction } from 'i18next'

/**
 * Dades necessàries per exportar un immoble amb el seu contracte i els dos inquilins.
 *

export function DadesExportacioResum(dades: FilaDades[], t: TFunction): ColumnaIFilesExport {
  // console.log('t rebut:', t, typeof t)

  const columnes: ColumnaExportacio[] = [
    { titol: t('immobles.seccions.adreca'), tipus: 'text' },
    { titol: t('contractes.camps.dataInici'), tipus: 'data' },
    { titol: t('contractes.camps.dataFi'), tipus: 'data' },
    { titol: t('contractes.camps.dFiPrevista'), tipus: 'data' },
    { titol: t('contractes.camps.inquili') + ' 1', tipus: 'text' },
    { titol: t('contractes.camps.inquili') + ' 2', tipus: 'text' },
    { titol: t('contractes.camps.lloguerActual'), tipus: 'moneda' },
    { titol: t('contractes.camps.dataUltimaRevisio'), tipus: 'data' }
  ]

  const filesExportades = dades.map(({ immoble, contracte: c }) => {
    return [
      adreca(immoble),
      c?.data_inici ?? null,
      c?.data_fi ?? null,
      c?.d_fi_prevista ?? null,
      c === null
        ? t('contractes.ultims.senseContracte')
        : nomSencer(c.inquili_nom!, c.inquili_cognoms!),
      c === null || c.id_inquili_2 === null
        ? null
        : nomSencer(c.inquili2_nom!, c.inquili2_cognoms!),
      c?.lloguer_actual ?? null,
      c?.data_ultima_revisio ?? null
    ]
  })

  return {
    columnes,
    files: filesExportades
  }
}
 */

/**
 * Dades necessàries per exportar un immoble amb el seu contracte i els dos inquilins.
 *
 */
export function DadesExportacioDetallades(dades: FilaDades[], t: TFunction): ColumnaIFilesExport {
  const columnes = [
    // IMMOBLE
    { titol: t('immobles.camps.id'), tipus: 'numero' },
    { titol: t('immobles.camps.via'), tipus: 'text' },
    { titol: t('immobles.camps.numVia'), tipus: 'text' },
    { titol: t('immobles.camps.pis'), tipus: 'text' },
    { titol: t('immobles.camps.porta'), tipus: 'text' },
    { titol: t('immobles.camps.codiPostal'), tipus: 'text' },
    { titol: t('immobles.camps.localitat'), tipus: 'text' },
    { titol: t('immobles.camps.provincia'), tipus: 'text' },
    { titol: t('immobles.camps.refCatastral'), tipus: 'text' },
    { titol: t('immobles.camps.superficie'), tipus: 'decimal' },
    { titol: t('immobles.camps.superficiePati'), tipus: 'decimal' },
    {
      titol: `${t('immobles.seccions.certificat')} - ${t('immobles.camps.registre')}`,
      tipus: 'text'
    },
    {
      titol: `${t('immobles.seccions.certificat')} - ${t('immobles.camps.classe')}`,
      tipus: 'text'
    },
    { titol: `${t('immobles.seccions.certificat')} - ${t('immobles.camps.data')}`, tipus: 'data' },
    {
      titol: `${t('immobles.seccions.certificat')} - ${t('immobles.camps.caducitat')}`,
      tipus: 'data'
    },
    { titol: `${t('immobles.seccions.cedula')} - ${t('immobles.camps.registre')}`, tipus: 'text' },
    { titol: `${t('immobles.seccions.cedula')} - ${t('immobles.camps.data')}`, tipus: 'data' },
    { titol: `${t('immobles.seccions.cedula')} - ${t('immobles.camps.caducitat')}`, tipus: 'data' },
    {
      titol: `${t('immobles.seccions.cedula')} - ${t('immobles.camps.superficieUtil')}`,
      tipus: 'decimal'
    },
    { titol: t('immobles.camps.valCadastralTotal'), tipus: 'moneda' },
    { titol: t('immobles.camps.valCadastralConstr'), tipus: 'moneda' },
    { titol: t('immobles.camps.anyConstruccio'), tipus: 'numero' },
    { titol: t('immobles.camps.dataCompra'), tipus: 'data' },
    { titol: t('immobles.camps.valorCompra'), tipus: 'moneda' },

    // INQUILÍ 1
    { titol: `${t('immobles.inquili1')} - ${t('inquilins.camps.nom')}`, tipus: 'text' },
    { titol: `${t('immobles.inquili1')} - ${t('inquilins.camps.cognoms')}`, tipus: 'text' },
    { titol: `${t('immobles.inquili1')} - ${t('inquilins.camps.nif')}`, tipus: 'text' },
    { titol: `${t('immobles.inquili1')} - ${t('inquilins.camps.telefon')}`, tipus: 'text' },

    // INQUILÍ 2
    { titol: `${t('immobles.inquili2')} - ${t('inquilins.camps.nom')}`, tipus: 'text' },
    { titol: `${t('immobles.inquili2')} - ${t('inquilins.camps.cognoms')}`, tipus: 'text' },
    { titol: `${t('immobles.inquili2')} - ${t('inquilins.camps.nif')}`, tipus: 'text' },
    { titol: `${t('immobles.inquili2')} - ${t('inquilins.camps.telefon')}`, tipus: 'text' },

    // CONTRACTE
    { titol: t('immobles.camps.id') + ' - ' + t('contractes.titol'), tipus: 'numero' },
    { titol: t('contractes.camps.immoble'), tipus: 'numero' },
    { titol: t('contractes.camps.inquili') + ' 1 - ID', tipus: 'numero' },
    { titol: t('contractes.camps.inquili') + ' 2 - ID', tipus: 'numero' },
    { titol: t('contractes.camps.dataInici'), tipus: 'data' },
    { titol: t('contractes.camps.dataFi'), tipus: 'data' },
    { titol: t('contractes.camps.motiuFi'), tipus: 'text' },
    { titol: t('contractes.camps.dFiPrevista'), tipus: 'data' },
    { titol: t('contractes.camps.lloguerInicial'), tipus: 'moneda' },
    { titol: t('contractes.camps.lloguerActual'), tipus: 'moneda' },
    { titol: t('contractes.camps.dataUltimaRevisio'), tipus: 'data' },
    { titol: t('contractes.camps.fiancaAdicional'), tipus: 'moneda' },
    { titol: t('contractes.camps.fiancaImport'), tipus: 'moneda' },
    { titol: t('contractes.camps.fiancaNc'), tipus: 'text' },
    { titol: t('contractes.camps.fiancaDataModel2'), tipus: 'data' },
    { titol: t('contractes.camps.fiancaDataIngres'), tipus: 'data' },
    { titol: t('contractes.camps.fiancaDataNotificacio'), tipus: 'data' },
    { titol: t('contractes.camps.fiancaNumRegistre'), tipus: 'text' },
    { titol: t('contractes.camps.fiancaComentari'), tipus: 'text' },
    { titol: t('contractes.camps.devolucioNc'), tipus: 'text' },
    { titol: t('contractes.camps.devolucioDataSollicitud'), tipus: 'data' },
    { titol: t('contractes.camps.devolucioDataCobrament'), tipus: 'data' },
    { titol: t('contractes.camps.importARetornar'), tipus: 'moneda' },
    { titol: t('contractes.camps.justificacioImport'), tipus: 'text' },
    { titol: t('contractes.camps.comentaris'), tipus: 'text' },
    { titol: t('contractes.avisos.estatCaducitat.fi.literal'), tipus: 'text' },
    { titol: t('contractes.avisos.estatCaducitat.revisio.literal'), tipus: 'text' }
  ] as ColumnaExportacio[]

  const filesExportades = dades.map(({ immoble: i, contracte: c }) => {
    const caducitat_fi_txt =
      !c || !c.caducitat_fi ? null : t(`contractes.avisos.estatCaducitat.fi.${c.caducitat_fi}`)

    const caducitat_revisio_txt =
      !c || !c.caducitat_revisio
        ? null
        : t(`contractes.avisos.estatCaducitat.fi.${c.caducitat_revisio}`)

    console.log(
      i.id,
      c?.id,
      c?.caducitat_fi,
      caducitat_fi_txt,
      c?.caducitat_revisio,
      caducitat_revisio_txt
    )

    return [
      // IMMOBLE
      i.id,
      i.via,
      i.num_via,
      i.pis,
      i.porta,
      i.codi_postal,
      i.localitat,
      i.provincia,
      i.ref_catastral,
      i.superficie_m2,
      i.superficie_pati,
      i.cert_en_reg,
      i.cert_en_class,
      i.cert_en_data,
      i.cert_en_caduc,
      i.ced_hab_reg,
      i.ced_hab_data,
      i.ced_hab_caduc,
      i.ced_hab_superficie_util,
      i.val_cadastral_total,
      i.val_cadastral_constr,
      i.any_construccio,
      i.data_compra,
      i.valor_compra,

      // INQUILÍ 1
      c?.inquili_nom ?? null,
      c?.inquili_cognoms ?? null,
      c?.inquili1_nif ?? null,
      c?.inquili1_telefon ?? null,

      // INQUILÍ 2
      c?.inquili2_nom ?? null,
      c?.inquili2_cognoms ?? null,
      c?.inquili2_nif ?? null,
      c?.inquili2_telefon ?? null,

      // CONTRACTE
      c?.id ?? null,
      c?.id_inmoble ?? null,
      c?.id_inquili ?? null,
      c?.id_inquili_2 ?? null,
      c?.data_inici ?? null,
      c?.data_fi ?? null,
      c?.motiu_fi ? t(`contractes.motiusFi.${c.motiu_fi}`) : null,
      c?.d_fi_prevista ?? null,
      c?.lloguer_inicial ?? null,
      c?.lloguer_actual ?? null,
      c?.data_ultima_revisio ?? null,
      c?.fianca_adicional ?? null,
      c?.fianca_import ?? null,
      c?.fianca_nc ?? null,
      c?.fianca_data_model2 ?? null,
      c?.fianca_data_ingres ?? null,
      c?.fianca_data_notificacio ?? null,
      c?.fianca_num_registre ?? null,
      c?.fianca_comentari ?? null,
      c?.devolucio_nc ?? null,
      c?.devolucio_data_sollicitud ?? null,
      c?.devolucio_data_cobrament ?? null,
      c?.devolucio_import ?? null,
      c?.devolucio_motiu ?? null,
      c?.comentaris ?? null,
      caducitat_fi_txt,
      caducitat_revisio_txt
    ]
  })

  return {
    columnes,
    files: filesExportades
  }
}
