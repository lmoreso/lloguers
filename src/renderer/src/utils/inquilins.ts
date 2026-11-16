import { ContracteLlistat } from '../../../shared/tipus'
import i18n from '../i18n'

// "Nom Cognoms", o "(sense nom)" si l'inquilí no en té cap dels dos.
export function nomInquili(nom: string | null, cognoms: string | null): string {
  return [nom, cognoms].filter(Boolean).join(' ') || i18n.t('inquilins.senseNom')
}

export function nomsInquilinsContracte(c: ContracteLlistat): string {
  const noms = [nomInquili(c.inquili_nom, c.inquili_cognoms)]
  if (c.id_inquili_2 !== null) {
    noms.push(nomInquili(c.inquili2_nom, c.inquili2_cognoms))
  }
  return noms.join(i18n.t('comu.i'))
}
