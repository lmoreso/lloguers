import type { FilaDades } from '../../../shared/tipus'

export type EstatContracte = 'senseContracte' | 'vigent' | 'futur' | 'tancat'

export const ESTATS_CONTRACTE: EstatContracte[] = ['senseContracte', 'vigent', 'futur', 'tancat']

// Els filtres de la vista "Últims contractes". Dins de cada grup de tria múltiple val qualsevol de les opcions triades;
// entre grups, una fila ha de passar tots els filtres actius.
export interface Filtres {
  estats: EstatContracte[]
  municipis: string[]
  inquilins: string
}

export const filtresBuits = (): Filtres => ({ estats: [], municipis: [], inquilins: '' })

export const hiHaFiltres = (f: Filtres): boolean =>
  f.estats.length > 0 || f.municipis.length > 0 || f.inquilins.trim() !== ''

// Els filtres es guarden en memòria mentre l'app és oberta: sobreviuen a anar i tornar entre pantalles (la vista es
// torna a muntar) i es perden en tancar l'app.
let guardats: Filtres = filtresBuits()
export const llegirFiltresGuardats = (): Filtres => guardats
export const desarFiltres = (f: Filtres): void => {
  guardats = f
}

// Els estats d'una fila. Un contracte pot tenir-ne dos: vigent (sense data de fi) i futur (encara no ha començat).
// `avui` és ISO AAAA-MM-DD en hora local.
export function estatsDeLaFila(fila: FilaDades, avui: string): EstatContracte[] {
  const c = fila.contracte
  if (c === null) return ['senseContracte']
  const estats: EstatContracte[] = [c.data_fi === null ? 'vigent' : 'tancat']
  if (c.data_inici > avui) estats.push('futur')
  return estats
}

// Sense majúscules ni accents (es treuen els signes combinants U+0300 a U+036F després de descompondre).
function normalitza(text: string): string {
  return [...text.normalize('NFD')]
    .filter((c) => c.charCodeAt(0) < 0x300 || c.charCodeAt(0) > 0x36f)
    .join('')
    .toLowerCase()
}

// Totes les paraules de la cerca han de ser al nom o als cognoms d'algun dels dos inquilins.
function passaInquilins(fila: FilaDades, cerca: string): boolean {
  const paraules = normalitza(cerca).split(' ').filter(Boolean)
  if (paraules.length === 0) return true
  const c = fila.contracte
  if (c === null) return false
  const noms = normalitza(
    [c.inquili_nom, c.inquili_cognoms, c.inquili2_nom, c.inquili2_cognoms].filter(Boolean).join(' ')
  )
  return paraules.every((p) => noms.includes(p))
}

export function passaFiltres(fila: FilaDades, f: Filtres, avui: string): boolean {
  if (f.estats.length > 0 && !estatsDeLaFila(fila, avui).some((e) => f.estats.includes(e))) {
    return false
  }
  if (f.municipis.length > 0 && !f.municipis.includes(fila.immoble.localitat)) return false
  return passaInquilins(fila, f.inquilins)
}
