import { estatCaducitat } from './caducitat'
import type { Immoble } from '../../../shared/tipus'

const DOCUMENTS = [
  { clau: 'certificat', camp: 'cert_en_caduc' },
  { clau: 'cedula', camp: 'ced_hab_caduc' }
] as const

// Documents d'un immoble que estan caducats o a punt de caducar.
export function alertes(
  i: Immoble
): { clau: 'certificat' | 'cedula'; estat: 'caducat' | 'aviat' }[] {
  return DOCUMENTS.flatMap((d) => {
    const estat = estatCaducitat(i[d.camp])
    return estat ? [{ clau: d.clau, estat }] : []
  })
}
