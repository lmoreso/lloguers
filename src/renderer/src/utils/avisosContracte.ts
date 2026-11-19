import { aniversariRevisio, estatCaducitat } from './caducitat'
import type {
  ConfigObtinguda,
  Contracte,
  ContracteLlistat,
  EstatCaducitat
} from '../../../shared/tipus'
import { TFunction } from 'i18next'

/**
 * Avisos d'un contracte:
 *   - Data de Fi Prevista propera o passada.
 *   - Data de Revisió del Lloguer propera o passada.
 *   - Només te sentit pels contractes vigents (sense data de fi).
 *   - Retorna:
 *      - { clau: 'fi' | 'revisio'; estat: EstatCaducitat }[]
 *      - Actualitza els paràmetres  c.caducitat_fi i c.caducitat_revisio
 */
export function avisos(
  c: ContracteLlistat,
  config: ConfigObtinguda
): { clau: 'fi' | 'revisio'; estat: EstatCaducitat }[] {
  // Si el contracte està tancat no te sentit cap avis
  if (c.data_fi !== null) return []

  const llista: { clau: 'fi' | 'revisio'; estat: 'caducat' | 'aviat' }[] = []

  c.caducitat_fi = null
  c.caducitat_revisio = null

  const estatFi = estatCaducitat(c.d_fi_prevista, config.diesAvisFiContracte)
  if (estatFi) {
    llista.push({ clau: 'fi', estat: estatFi })
    c.caducitat_fi = estatFi
  }

  const estatRev = estatCaducitat(
    aniversariRevisio(c.data_ultima_revisio),
    config.diesAvisRevisioLloguer
  )
  if (estatRev) {
    llista.push({ clau: 'revisio', estat: estatRev })
    c.caducitat_revisio = estatRev
  }
  return llista
}

export function AvisosContracteTxt(
  c: ContracteLlistat,
  config: ConfigObtinguda,
  t: TFunction
): string | null {
  const avisosText = new Set<string>()
  if (ingresPendent(c)) avisosText.add(t('contractes.avisos.ingresPendent'))
  if (faltenDocuments(c)) avisosText.add(t('contractes.avisos.documents'))
  if (devolucioPendent(c)) avisosText.add(t('contractes.avisos.devolucioPendent'))
  avisos(c, config).map((a) => avisosText.add(t(`contractes.avisos.${a.clau}.${a.estat}`)))
  // console.log('AvisosContracteSet', c, avisosText)
  return avisosText.size > 0 ? Array.from(avisosText).join(' | ') : null
}

// Documents de la fiança que falten: hi ha una data informada però no el document adjunt que la justifica.
// El model 3 justifica la sol·licitud de devolució.
export function documentsQueFalten(
  c: ContracteLlistat
): ('model2' | 'notificacio' | 'model3' | 'rebut')[] {
  const llista: ('model2' | 'notificacio' | 'model3' | 'rebut')[] = []
  if (c.fianca_data_model2 !== null && !c.te_doc_model2) llista.push('model2')
  // Si no te document de notificació però ja s'ha informat la data d'ingrés, cal que el gestor adjunti el rebut.
  if (c.fianca_data_ingres !== null && c.fianca_data_notificacio === null && !c.te_doc_rebut)
    llista.push('rebut')
  if (c.fianca_data_notificacio !== null && !c.te_doc_notificacio) llista.push('notificacio')
  if (c.devolucio_data_sollicitud !== null && !c.te_doc_model3) llista.push('model3')
  return llista
}

export function faltenDocuments(c: ContracteLlistat): boolean {
  return documentsQueFalten(c).length > 0
}

// Contracte obert amb fiança INCASOL però sense la data de l'ingrés: cal gestionar l'ingrés a l'INCASOL.
// Accepta un contracte o només aquests tres camps (així el formulari el pot cridar amb el que acaba de desar).
export function ingresPendent(
  c: Pick<Contracte, 'data_fi' | 'fianca_import' | 'fianca_data_ingres'>
): boolean {
  return c.data_fi === null && (c.fianca_import ?? 0) > 0 && c.fianca_data_ingres === null
}

// Contracte amb una carta de revisió del lloguer pendent d'enviar: una revisió sense data d'enviament i amb un
// increment diferent de 0 (un lloguer congelat no porta carta). L'indicador el calcula el Main; compta també als
// contractes tancats.
export function cartaPendent(c: ContracteLlistat): boolean {
  return c.carta_pendent
}

// Contracte tancat amb la fiança ja gestionada (model 2, notificació o sol·licitud de devolució) però sense
// l'abonament de la devolució: la fiança està per cobrar.
export function devolucioPendent(c: ContracteLlistat): boolean {
  return (
    c.data_fi !== null &&
    (c.fianca_data_model2 !== null ||
      c.fianca_data_notificacio !== null ||
      c.devolucio_data_sollicitud !== null) &&
    c.devolucio_data_cobrament === null
  )
}

// Cert si el contracte té algun avís de qualsevol tipus.
export function teAvisos(c: ContracteLlistat, config: ConfigObtinguda): boolean {
  return (
    avisos(c, config).length > 0 ||
    cartaPendent(c) ||
    faltenDocuments(c) ||
    ingresPendent(c) ||
    devolucioPendent(c)
  )
}
