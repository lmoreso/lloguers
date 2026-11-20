import { avisos } from './avisosContracte'
import { alertes } from './avisosImmoble'
import type { ConfigObtinguda, FilaDades } from '../../../shared/tipus'

export type EstatContracte = 'senseContracte' | 'vigent' | 'futur' | 'tancat'

export const ESTATS_CONTRACTE: EstatContracte[] = ['senseContracte', 'vigent', 'futur', 'tancat']

// Els filtres de la vista "Últims contractes". Dins de cada grup de tria múltiple val qualsevol de les opcions triades;
// entre filtres, una fila ha de passar-los tots. Els quatre interruptors són "tot o res": activat, només es veuen les
// files amb l'avís corresponent (caducat o proper), amb la mateixa lògica que les etiquetes d'avís.
export interface Filtres {
  estats: EstatContracte[]
  municipis: string[]
  inquilins: string
  fiPrevista: boolean
  revisio: boolean
  certificat: boolean
  cedula: boolean
}

export const filtresBuits = (): Filtres => ({
  estats: [],
  municipis: [],
  inquilins: '',
  fiPrevista: false,
  revisio: false,
  certificat: false,
  cedula: false
})

export const hiHaFiltres = (f: Filtres): boolean =>
  f.estats.length > 0 ||
  f.municipis.length > 0 ||
  f.inquilins.trim() !== '' ||
  f.fiPrevista ||
  f.revisio ||
  f.certificat ||
  f.cedula

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

// `config` porta els terminis dels avisos dels contractes; `diesAvisImmoble`, el dels documents de l'immoble
// (certificat i cèdula). Són els mateixos que fan servir les etiquetes.
export function passaFiltres(
  fila: FilaDades,
  f: Filtres,
  avui: string,
  config: ConfigObtinguda
): boolean {
  if (f.estats.length > 0 && !estatsDeLaFila(fila, avui).some((e) => f.estats.includes(e))) {
    return false
  }
  if (f.municipis.length > 0 && !f.municipis.includes(fila.immoble.localitat)) return false
  if (!passaInquilins(fila, f.inquilins)) return false

  // Avisos del contracte (només els vigents en tenen: un tancat o una fila sense contracte no passa mai).
  const c = fila.contracte
  if (f.fiPrevista || f.revisio) {
    const delContracte = c === null ? [] : avisos(c, config)
    if (f.fiPrevista && !delContracte.some((a) => a.clau === 'fi')) return false
    if (f.revisio && !delContracte.some((a) => a.clau === 'revisio')) return false
  }
  // Avisos de l'immoble: valen per a totes les files d'aquell immoble, tinguin contracte o no.
  if (f.certificat || f.cedula) {
    const delsDocuments = alertes(fila.immoble, config.diesAvisDocumentCaducat)
    if (f.certificat && !delsDocuments.some((a) => a.clau === 'certificat')) return false
    if (f.cedula && !delsDocuments.some((a) => a.clau === 'cedula')) return false
  }
  return true
}
