import { adreca } from '../../../shared/utilitats'
import { alertes } from './avisosImmoble'
import { conteTotesLesParaules } from './text'
import type { Immoble } from '../../../shared/tipus'

// Els filtres de la llista d'Immobles. Dins del municipi (tria múltiple) val qualsevol dels triats; entre filtres,
// un immoble ha de passar-los tots. Els dos interruptors són "tot o res": activat, només es veuen els immobles amb
// l'avís corresponent (caducat o proper), amb la mateixa lògica que les etiquetes de la columna Avisos.
export interface FiltresImmoble {
  municipis: string[]
  adrecaText: string
  certificat: boolean
  cedula: boolean
}

export const filtresImmobleBuits = (): FiltresImmoble => ({
  municipis: [],
  adrecaText: '',
  certificat: false,
  cedula: false
})

export const hiHaFiltresImmoble = (f: FiltresImmoble): boolean =>
  f.municipis.length > 0 || f.adrecaText.trim() !== '' || f.certificat || f.cedula

// En memòria mentre l'app és oberta: sobreviuen a anar i tornar entre pantalles i es perden en tancar l'app.
let guardats: FiltresImmoble = filtresImmobleBuits()
export const llegirFiltresImmoblesGuardats = (): FiltresImmoble => guardats
export const desarFiltresImmobles = (f: FiltresImmoble): void => {
  guardats = f
}

// `diesAvis` és el termini dels avisos dels documents de l'immoble (el mateix que fan servir les etiquetes).
export function passaFiltresImmoble(i: Immoble, f: FiltresImmoble, diesAvis: number): boolean {
  if (f.municipis.length > 0 && !f.municipis.includes(i.localitat)) return false
  if (!conteTotesLesParaules(adreca(i), f.adrecaText)) return false
  if (f.certificat || f.cedula) {
    const dels = alertes(i, diesAvis)
    if (f.certificat && !dels.some((a) => a.clau === 'certificat')) return false
    if (f.cedula && !dels.some((a) => a.clau === 'cedula')) return false
  }
  return true
}
