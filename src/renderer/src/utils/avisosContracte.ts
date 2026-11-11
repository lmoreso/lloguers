import { aniversariRevisio, DIES_AVIS_FI, DIES_AVIS_REVISIO, estatCaducitat } from './caducitat'
import type { Contracte, ContracteLlistat } from '../../../shared/tipus'

// Avisos d'un contracte. Només els vigents (sense data de fi) en tenen.
export function avisos(
  c: ContracteLlistat
): { clau: 'fi' | 'revisio'; estat: 'caducat' | 'aviat' }[] {
  if (c.data_fi !== null) return []
  const llista: { clau: 'fi' | 'revisio'; estat: 'caducat' | 'aviat' }[] = []
  const fi = estatCaducitat(c.d_fi_prevista, DIES_AVIS_FI)
  if (fi) llista.push({ clau: 'fi', estat: fi })
  const revisio = estatCaducitat(aniversariRevisio(c.data_ultima_revisio), DIES_AVIS_REVISIO)
  if (revisio) llista.push({ clau: 'revisio', estat: revisio })
  return llista
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
export function teAvisos(c: ContracteLlistat): boolean {
  return avisos(c).length > 0 || faltenDocuments(c) || ingresPendent(c) || devolucioPendent(c)
}
