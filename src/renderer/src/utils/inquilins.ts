import i18n from '../i18n'

// "Nom Cognoms", o "(sense nom)" si l'inquilí no en té cap dels dos.
export function nomInquili(nom: string | null, cognoms: string | null): string {
  return [nom, cognoms].filter(Boolean).join(' ') || i18n.t('inquilins.senseNom')
}
