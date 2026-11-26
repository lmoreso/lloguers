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

export function nomsInquilins1i2(
  inquili_nom: string | null,
  inquili_cognoms: string | null,
  inquili2_nom: string | null,
  inquili2_cognoms: string | null
): string {
  const noms = [nomInquili(inquili_nom, inquili_cognoms)]
  if (inquili2_nom !== null) {
    noms.push(nomInquili(inquili2_nom, inquili2_cognoms))
  }
  return noms.join(i18n.t('comu.i'))
}
