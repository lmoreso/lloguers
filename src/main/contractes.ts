import { db } from './database'
import { esborrarCarpetaContracte } from './documents'
import { obtenirInmobles } from './inmobles'
import { MOTIUS_FI } from '../shared/tipus'
import type {
  Contracte,
  ContracteDades,
  ContracteLlistat,
  ImmobleAmbContractes
} from '../shared/tipus'

// Camps editables d'un contracte: tots els de la taula tret de l'id i dels d'auditoria.
const CAMPS: (keyof ContracteDades)[] = [
  'id_inmoble',
  'data_inici',
  'data_fi',
  'motiu_fi',
  'id_inquili',
  'id_inquili_2',
  'd_fi_prevista',
  'lloguer_inicial',
  'lloguer_actual',
  'data_ultima_revisio',
  'fianca_adicional',
  'fianca_import',
  'fianca_nc',
  'fianca_data_model2',
  'fianca_data_ingres',
  'fianca_data_notificacio',
  'fianca_num_registre',
  'fianca_comentari',
  'devolucio_nc',
  'devolucio_data_sollicitud',
  'devolucio_data_cobrament',
  'devolucio_import',
  'devolucio_motiu',
  'comentaris'
]

const COLUMNES = ['id', ...CAMPS].join(', ')

// Les mateixes columnes amb el prefix de la taula, més els noms dels dos inquilins (JOIN) i si el
// contracte té algun document de les classes de la fiança (EXISTS: 0 o 1).
const COLUMNES_LLISTAT = `${['id', ...CAMPS].map((c) => `c.${c}`).join(', ')},
  q.nom AS inquili_nom, q.cognoms AS inquili_cognoms,
  q2.nom AS inquili2_nom, q2.cognoms AS inquili2_cognoms,
  EXISTS (SELECT 1 FROM documents_contracte d
    WHERE d.id_contracte = c.id AND d.tipus = 'fianca_model2') AS te_doc_model2,
  EXISTS (SELECT 1 FROM documents_contracte d
    WHERE d.id_contracte = c.id AND d.tipus = 'fianca_notificacio') AS te_doc_notificacio,
  EXISTS (SELECT 1 FROM documents_contracte d
    WHERE d.id_contracte = c.id AND d.tipus = 'fianca_model3') AS te_doc_model3`

// Fila tal com surt de SQLite: els tres indicadors són 0 o 1. El Main els converteix a boolean.
type FilaLlistat = Omit<
  ContracteLlistat,
  'te_doc_model2' | 'te_doc_notificacio' | 'te_doc_model3'
> & {
  te_doc_model2: number
  te_doc_notificacio: number
  te_doc_model3: number
}

function aLlistat(f: FilaLlistat): ContracteLlistat {
  return {
    ...f,
    te_doc_model2: f.te_doc_model2 === 1,
    te_doc_notificacio: f.te_doc_notificacio === 1,
    te_doc_model3: f.te_doc_model3 === 1
  }
}

// Contractes d'un immoble, l'últim primer. S'hi entra només des d'Immobles.
// El segon inquilí és opcional, per això el LEFT JOIN; el primer és obligatori (JOIN).
export function obtenirContractes(idInmoble: number): ContracteLlistat[] {
  const files = db
    .prepare(
      `SELECT ${COLUMNES_LLISTAT}
       FROM contractes c
       JOIN inquilins q ON q.id = c.id_inquili
       LEFT JOIN inquilins q2 ON q2.id = c.id_inquili_2
       WHERE c.id_inmoble = ?
       ORDER BY c.data_inici DESC, c.id DESC`
    )
    .all(idInmoble) as FilaLlistat[]
  return files.map(aLlistat)
}

// Els contractes de cada immoble que encara no han acabat (sense data de fi, o amb data de fi d'avui o
// posterior) més el de data d'inici més recent (en empat, l'id més alt). Així, un immoble amb un contracte
// tancat a futur i un altre de posterior mostra els dos; amb un vigent i un d'antic, només el vigent; i si
// tots han acabat, només l'últim. Els immobles sense contracte hi surten igualment, amb la llista buida.
// Dins d'un immoble, en ordre cronològic. Els immobles, ordenats com a Immobles.
export function obtenirUltimsContractes(): ImmobleAmbContractes[] {
  // "Avui" en hora local (no en UTC, que és el que dona date('now') de SQLite).
  const d = new Date()
  const avui = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

  const files = db
    .prepare(
      `SELECT ${COLUMNES_LLISTAT}
       FROM contractes c
       JOIN inquilins q ON q.id = c.id_inquili
       LEFT JOIN inquilins q2 ON q2.id = c.id_inquili_2
       WHERE c.data_fi IS NULL
          OR c.data_fi >= @avui
          OR c.id = (
            SELECT c2.id FROM contractes c2
            WHERE c2.id_inmoble = c.id_inmoble
            ORDER BY c2.data_inici DESC, c2.id DESC
            LIMIT 1
          )
       ORDER BY c.data_inici, c.id`
    )
    .all({ avui }) as FilaLlistat[]

  const perImmoble = new Map<number, ContracteLlistat[]>()
  for (const f of files) {
    const llista = perImmoble.get(f.id_inmoble) ?? []
    llista.push(aLlistat(f))
    perImmoble.set(f.id_inmoble, llista)
  }
  return obtenirInmobles().map((immoble) => ({
    immoble,
    contractes: perImmoble.get(immoble.id) ?? []
  }))
}

export function obtenirContracte(id: number): Contracte | undefined {
  return db.prepare(`SELECT ${COLUMNES} FROM contractes WHERE id = ?`).get(id) as
    Contracte | undefined
}

// ---- Validació (el Renderer no és de fiar; les columnes noves no porten CHECK) ----

// Un text, o buit (null/undefined/en blanc -> null).
function text(nom: string, v: unknown): string | null {
  if (v === null || v === undefined) return null
  if (typeof v !== 'string') throw new Error(`${nom} invàlid`)
  return v.trim() || null
}

function nombreOpcional(nom: string, v: unknown): number | null {
  if (v === null || v === undefined) return null
  if (typeof v !== 'number' || !Number.isFinite(v) || v < 0) throw new Error(`${nom} invàlid`)
  return v
}

function nombreObligatori(nom: string, v: unknown): number {
  const n = nombreOpcional(nom, v)
  if (n === null) throw new Error(`${nom} és obligatori`)
  return n
}

// Normalitza i valida un contracte. Retorna les dades netes, o llança un error.
function preparar(d: ContracteDades): ContracteDades {
  if (!d) throw new Error('Contracte invàlid')
  const p: ContracteDades = {
    ...d,
    data_fi: d.data_fi ?? null,
    id_inquili_2: d.id_inquili_2 ?? null,
    fianca_data_model2: d.fianca_data_model2 ?? null,
    fianca_data_ingres: d.fianca_data_ingres ?? null,
    fianca_data_notificacio: d.fianca_data_notificacio ?? null,
    devolucio_data_sollicitud: d.devolucio_data_sollicitud ?? null,
    devolucio_data_cobrament: d.devolucio_data_cobrament ?? null,
    comentaris: text('comentaris', d.comentaris),
    fianca_nc: text('fianca_nc', d.fianca_nc),
    fianca_num_registre: text('fianca_num_registre', d.fianca_num_registre),
    fianca_comentari: text('fianca_comentari', d.fianca_comentari),
    devolucio_nc: text('devolucio_nc', d.devolucio_nc),
    devolucio_motiu: text('devolucio_motiu', d.devolucio_motiu),
    motiu_fi: text('motiu_fi', d.motiu_fi) as ContracteDades['motiu_fi'],
    lloguer_inicial: nombreObligatori('lloguer_inicial', d.lloguer_inicial),
    lloguer_actual: nombreObligatori('lloguer_actual', d.lloguer_actual),
    fianca_adicional: nombreObligatori('fianca_adicional', d.fianca_adicional ?? 0),
    fianca_import: nombreOpcional('fianca_import', d.fianca_import),
    devolucio_import: nombreOpcional('devolucio_import', d.devolucio_import)
  }

  if (p.motiu_fi !== null && !(MOTIUS_FI as readonly unknown[]).includes(p.motiu_fi)) {
    throw new Error('Motiu de tancament invàlid')
  }
  // El NC i la data de sol·licitud de la devolució s'informen junts.
  if ((p.devolucio_nc === null) !== (p.devolucio_data_sollicitud === null)) {
    throw new Error("El NC i la data de sol·licitud de la devolució s'han d'informar junts")
  }
  // Les dades de tancament només amb el contracte tancat. (La BD ja ho exigeix per a la resta de la devolució.)
  if (p.data_fi === null && (p.devolucio_nc !== null || p.motiu_fi !== null)) {
    throw new Error('Les dades de tancament només es poden informar amb el contracte tancat')
  }
  const sol = p.devolucio_data_sollicitud
  const cob = p.devolucio_data_cobrament
  if (sol !== null && cob !== null && cob < sol) {
    throw new Error("L'abonament no pot ser anterior a la sol·licitud")
  }
  if (sol !== null && p.data_fi !== null && sol < p.data_fi) {
    throw new Error('La sol·licitud no pot ser anterior a la fi del contracte')
  }
  return p
}

// ---- CRUD ----

const SQL_INSERT = `INSERT INTO contractes (${CAMPS.join(', ')})
  VALUES (${CAMPS.map((c) => `@${c}`).join(', ')})`

// L'immoble no es pot canviar: no entra a l'UPDATE.
const CAMPS_UPDATE = CAMPS.filter((c) => c !== 'id_inmoble')
const SQL_UPDATE = `UPDATE contractes SET ${CAMPS_UPDATE.map((c) => `${c}=@${c}`).join(', ')}
  WHERE id=@id`

// En crear, el lloguer actual i la data de l'última revisió surten del lloguer inicial i de la data d'inici
// (el formulari no els demana): s'ignora el que arribi. Un trigger no podria: la columna NOT NULL fallaria abans.
export function crearContracte(d: ContracteDades): Contracte {
  const p = preparar({ ...d, lloguer_actual: d.lloguer_inicial, data_ultima_revisio: d.data_inici })
  const r = db.prepare(SQL_INSERT).run(Object.fromEntries(CAMPS.map((c) => [c, p[c]])))
  return obtenirContracte(Number(r.lastInsertRowid)) as Contracte
}

// L'immoble no es pot canviar (`id_inmoble` s'ignora). Mentre el contracte no s'ha revisat mai (la data de
// l'última revisió és la d'inici), si el lloguer actual i la data de revisió arriben iguals als desats, segueixen
// el lloguer inicial i la data d'inici. Si arriben diferents, és una revisió feta des del formulari: s'accepta
// (la BD exigeix que la data sigui >= data_inici).
export function actualitzarContracte(id: number, d: ContracteDades): void {
  db.transaction(() => {
    const antic = obtenirContracte(id)
    if (!antic) return
    const p = preparar(d)
    const maiRevisat = antic.data_ultima_revisio === antic.data_inici
    const senseRevisar =
      p.lloguer_actual === antic.lloguer_actual &&
      p.data_ultima_revisio === antic.data_ultima_revisio
    if (maiRevisat && senseRevisar) {
      p.lloguer_actual = p.lloguer_inicial
      p.data_ultima_revisio = p.data_inici
    }
    db.prepare(SQL_UPDATE).run({
      ...Object.fromEntries(CAMPS_UPDATE.map((c) => [c, p[c]])),
      id
    })
  })()
}

// Esborra el contracte. Les files de documents_contracte s'esborren en cascada; els fitxers del disc (la carpeta
// del contracte) s'esborren després, un cop confirmat l'esborrat de la fila.
export function eliminarContracte(id: number): void {
  db.prepare('DELETE FROM contractes WHERE id = ?').run(id)
  esborrarCarpetaContracte(id)
}
