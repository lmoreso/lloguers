import { db } from './database'
import { obtenirContracte } from './contractes'
import type { RevisioDades, RevisioLlistat, RevisioLloguer } from '../shared/tipus'

const COLUMNES = `id, id_contracte, data_efecte, lloguer_anterior, data_revisio_anterior, percentatge,
  increment_aplicat, lloguer_nou, data_enviament, comentari`

// Els imports es calculen en cèntims (enters) per evitar errors de decimals (0,1 + 0,2).
const cents = (v: number): number => Math.round(v * 100)
const euros = (c: number): number => c / 100

// Una data amb forma ISO AAAA-MM-DD. El format l'imposa el CHECK de la BD; aquí només serveix per no comparar com a
// text una data mal escrita (que la BD rebutjarà amb CHECK_VIOLAT).
const esISO = (v: unknown): v is string =>
  typeof v === 'string' && /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(v)

// Una carta pendent: sense data d'enviament i amb un increment diferent de 0 (un lloguer congelat no porta carta).
function esPendent(r: Pick<RevisioLloguer, 'data_enviament' | 'increment_aplicat'>): boolean {
  return r.data_enviament === null && cents(r.increment_aplicat) !== 0
}

export function obtenirRevisio(id: number): RevisioLloguer | undefined {
  return db.prepare(`SELECT ${COLUMNES} FROM revisions_lloguer WHERE id = ?`).get(id) as
    RevisioLloguer | undefined
}

// Les revisions d'un contracte, l'última primer.
export function obtenirRevisions(idContracte: number): RevisioLloguer[] {
  return db
    .prepare(`SELECT ${COLUMNES} FROM revisions_lloguer WHERE id_contracte = ? ORDER BY id DESC`)
    .all(idContracte) as RevisioLloguer[]
}

// L'última revisió d'un contracte (la darrera que s'ha creat).
function ultima(idContracte: number): RevisioLloguer | undefined {
  return db
    .prepare(
      `SELECT ${COLUMNES} FROM revisions_lloguer WHERE id_contracte = ? ORDER BY id DESC LIMIT 1`
    )
    .get(idContracte) as RevisioLloguer | undefined
}

// Totes les revisions (o només les pendents d'enviar: sense data d'enviament i sense increments de 0 €), amb els
// inquilins i l'immoble, per a la pantalla "Revisions de lloguer". Ordenades pel dia d'efecte, els cognoms i el nom
// del primer inquilí.
export function obtenirRevisionsLlistat(nomesPendents: boolean): RevisioLlistat[] {
  const filtre = nomesPendents
    ? 'WHERE data_enviament IS NULL AND round(increment_aplicat, 2) <> 0'
    : ''
  return db
    .prepare(
      `SELECT id_revisio, id_contracte, data_efecte, lloguer_anterior, increment_aplicat, lloguer_nou, percentatge,
        percentatge_efectiu, data_enviament, comentari, contracte_data_inici, inquili_nom, inquili_cognoms,
        inquili2_nom, inquili2_cognoms, immoble_id, immoble_via, immoble_num_via, immoble_pis, immoble_porta
       FROM v_revisions_lloguer ${filtre}
       ORDER BY data_efecte, inquili_cognoms, inquili_nom, id_revisio`
    )
    .all() as RevisioLlistat[]
}

// Valida i normalitza el que envia el Renderer (que no és de fiar). Els imports, a cèntims.
function netejar(d: RevisioDades): RevisioDades {
  if (!d) throw new Error('Revisió invàlida')
  if (typeof d.data_efecte !== 'string') throw new Error("El dia d'efecte és obligatori")
  if (typeof d.increment_aplicat !== 'number' || !Number.isFinite(d.increment_aplicat)) {
    throw new Error('Increment invàlid')
  }
  const pct = d.percentatge ?? null
  if (pct !== null && (typeof pct !== 'number' || !Number.isFinite(pct))) {
    throw new Error('Percentatge invàlid')
  }
  const enviament = d.data_enviament ?? null
  if (enviament !== null && typeof enviament !== 'string')
    throw new Error("Data d'enviament invàlida")
  const comentari = d.comentari ?? null
  if (comentari !== null && typeof comentari !== 'string') throw new Error('Comentari invàlid')
  return {
    data_efecte: d.data_efecte,
    percentatge: pct === null ? null : Math.round(pct * 10000) / 10000,
    increment_aplicat: euros(cents(d.increment_aplicat)),
    data_enviament: enviament,
    comentari: comentari === null ? null : comentari.trim() || null
  }
}

// Crea una revisió del lloguer d'un contracte i n'actualitza el lloguer actual i la data de l'última revisió. No es pot
// crear si l'última carta encara no s'ha enviat. Tot en una transacció: si res falla, no es desa res.
export function crearRevisio(idContracte: number, dades: RevisioDades): RevisioLloguer {
  if (!Number.isInteger(idContracte)) throw new Error('Contracte invàlid')
  const d = netejar(dades)
  return db.transaction(() => {
    const c = obtenirContracte(idContracte)
    if (!c) throw new Error('Contracte inexistent')
    if (c.data_fi !== null) throw new Error('No es poden crear revisions en un contracte tancat')
    const darrera = ultima(idContracte)
    if (darrera && esPendent(darrera)) {
      throw new Error("L'última carta de revisió encara no s'ha enviat")
    }
    if (
      esISO(d.data_efecte) &&
      esISO(c.data_ultima_revisio) &&
      d.data_efecte < c.data_ultima_revisio
    ) {
      throw new Error("El dia d'efecte no pot ser anterior a l'última revisió")
    }
    const nou = euros(cents(c.lloguer_actual) + cents(d.increment_aplicat))
    const r = db
      .prepare(
        `INSERT INTO revisions_lloguer (id_contracte, data_efecte, lloguer_anterior, data_revisio_anterior,
          percentatge, increment_aplicat, lloguer_nou, data_enviament, comentari)
         VALUES (@id_contracte, @data_efecte, @lloguer_anterior, @data_revisio_anterior,
          @percentatge, @increment_aplicat, @lloguer_nou, @data_enviament, @comentari)`
      )
      .run({
        id_contracte: idContracte,
        data_efecte: d.data_efecte,
        lloguer_anterior: c.lloguer_actual,
        data_revisio_anterior: c.data_ultima_revisio,
        percentatge: d.percentatge,
        increment_aplicat: d.increment_aplicat,
        lloguer_nou: nou,
        data_enviament: d.data_enviament,
        comentari: d.comentari
      })
    db.prepare(
      'UPDATE contractes SET lloguer_actual = ?, data_ultima_revisio = ? WHERE id = ?'
    ).run(nou, d.data_efecte, idContracte)
    return obtenirRevisio(Number(r.lastInsertRowid)) as RevisioLloguer
  })()
}

// Només es pot modificar l'última revisió d'un contracte (les anteriors són historial). El contracte en segueix l'import i
// el dia d'efecte. Es pot modificar encara que ja s'hagi enviat; la data d'enviament és un camp més i desar no la toca.
export function actualitzarRevisio(id: number, dades: RevisioDades): void {
  const d = netejar(dades)
  db.transaction(() => {
    const r = obtenirRevisio(id)
    if (!r) return
    const darrera = ultima(r.id_contracte)
    if (!darrera || darrera.id !== r.id) {
      throw new Error("Només es pot modificar l'última revisió del contracte")
    }
    if (
      esISO(d.data_efecte) &&
      esISO(r.data_revisio_anterior) &&
      d.data_efecte < r.data_revisio_anterior
    ) {
      throw new Error("El dia d'efecte no pot ser anterior a la revisió anterior")
    }
    const nou = euros(cents(r.lloguer_anterior) + cents(d.increment_aplicat))
    db.prepare(
      `UPDATE revisions_lloguer SET data_efecte=@data_efecte, percentatge=@percentatge,
        increment_aplicat=@increment_aplicat, lloguer_nou=@lloguer_nou, data_enviament=@data_enviament,
        comentari=@comentari WHERE id=@id`
    ).run({
      data_efecte: d.data_efecte,
      percentatge: d.percentatge,
      increment_aplicat: d.increment_aplicat,
      lloguer_nou: nou,
      data_enviament: d.data_enviament,
      comentari: d.comentari,
      id
    })
    db.prepare(
      'UPDATE contractes SET lloguer_actual = ?, data_ultima_revisio = ? WHERE id = ?'
    ).run(nou, d.data_efecte, r.id_contracte)
  })()
}

// Només es pot eliminar l'última revisió d'un contracte. El contracte recupera el lloguer i la data de l'última revisió
// que tenia abans.
export function eliminarRevisio(id: number): void {
  db.transaction(() => {
    const r = obtenirRevisio(id)
    if (!r) return
    const darrera = ultima(r.id_contracte)
    if (!darrera || darrera.id !== r.id) {
      throw new Error("Només es pot eliminar l'última revisió del contracte")
    }
    db.prepare(
      'UPDATE contractes SET lloguer_actual = ?, data_ultima_revisio = ? WHERE id = ?'
    ).run(r.lloguer_anterior, r.data_revisio_anterior, r.id_contracte)
    db.prepare('DELETE FROM revisions_lloguer WHERE id = ?').run(id)
  })()
}
