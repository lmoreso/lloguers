import type { ColumnaExportacio, ColumnaIFilesExport, RevisioLlistat } from '../../../shared/tipus'
import type { TFunction } from 'i18next'
import { nomsInquilins1i2 } from './inquilins'

export function DadesExportacioRevisions(
  dades: RevisioLlistat[],
  t: TFunction
): ColumnaIFilesExport {
  const columnes = [
    { titol: 'Id.Rev.', tipus: 'numero' },
    { titol: 'Id.Contr.', tipus: 'numero' },
    { titol: t('revisions.camps.dataEfecte'), tipus: 'data' },
    { titol: t('revisions.camps.lloguerAnterior'), tipus: 'moneda' },
    { titol: t('revisions.camps.percentatge'), tipus: 'decimal' },
    { titol: t('revisions.camps.percentatgeEfectiu'), tipus: 'decimal' },
    { titol: t('revisions.camps.incrementAplicat'), tipus: 'moneda' },
    { titol: t('revisions.camps.lloguerNou'), tipus: 'moneda' },
    { titol: t('revisions.camps.dataEnviament'), tipus: 'data' },
    { titol: t('revisions.camps.comentari'), tipus: 'text' },

    { titol: t('contractes.camps.dataInici'), tipus: 'data' },

    { titol: `${t('immobles.inquili1')} - ${t('inquilins.camps.nom')}`, tipus: 'text' },
    { titol: `${t('immobles.inquili1')} - ${t('inquilins.camps.cognoms')}`, tipus: 'text' },
    { titol: `${t('immobles.inquili1')} - ${t('inquilins.camps.nif')}`, tipus: 'text' },
    { titol: `${t('immobles.inquili1')} - ${t('inquilins.camps.telefon')}`, tipus: 'text' },

    { titol: `${t('immobles.inquili2')} - ${t('inquilins.camps.nom')}`, tipus: 'text' },
    { titol: `${t('immobles.inquili2')} - ${t('inquilins.camps.cognoms')}`, tipus: 'text' },
    { titol: `${t('immobles.inquili2')} - ${t('inquilins.camps.nif')}`, tipus: 'text' },
    { titol: `${t('immobles.inquili2')} - ${t('inquilins.camps.telefon')}`, tipus: 'text' },

    { titol: t('revisions.global.inquilins'), tipus: 'text' },

    { titol: `Id. ${t('immobles.titol')}`, tipus: 'numero' },
    { titol: t('immobles.camps.via'), tipus: 'text' },
    { titol: t('immobles.camps.numVia'), tipus: 'text' },
    { titol: t('immobles.camps.pis'), tipus: 'text' },
    { titol: t('immobles.camps.porta'), tipus: 'text' },
    { titol: t('immobles.seccions.adreca'), tipus: 'text' },
    { titol: t('immobles.camps.codiPostal'), tipus: 'text' },
    { titol: t('immobles.camps.localitat'), tipus: 'text' },
    { titol: t('immobles.camps.provincia'), tipus: 'text' },
    { titol: t('immobles.camps.refCatastral'), tipus: 'text' }
  ] as ColumnaExportacio[]

  const filesExportades = dades.map((r) => [
    r.id_revisio,
    r.id_contracte,
    r.data_efecte,
    r.lloguer_anterior,
    r.percentatge,
    r.percentatge_efectiu,
    r.increment_aplicat,
    r.lloguer_nou,
    r.data_enviament,
    r.comentari,

    r.contracte_data_inici,

    r.inquili_nom,
    r.inquili_cognoms,
    r.inquili_nif,
    r.inquili_telefon,

    r.inquili2_nom,
    r.inquili2_cognoms,
    r.inquili2_nif,
    r.inquili2_telefon,

    //r.inquilins_noms,
    nomsInquilins1i2(r.inquili_nom, r.inquili_cognoms, r.inquili2_nom, r.inquili2_cognoms),

    r.immoble_id,
    r.immoble_via,
    r.immoble_num_via,
    r.immoble_pis,
    r.immoble_porta,
    r.immoble_adreca,
    r.immoble_codi_postal,
    r.immoble_localitat,
    r.immoble_provincia,
    r.immoble_ref_catastral
  ])

  // console.log(columnes, filesExportades)
  return {
    columnes,
    files: filesExportades
  }
}
