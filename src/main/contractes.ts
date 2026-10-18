import { db } from './database'
import type { Contracte, ContracteDades, ContracteLlistat } from '../shared/tipus'
import { esborrarCarpetaContracte } from './documents'

const COLUMNES = `id, id_inmoble, data_inici, data_fi, id_inquili, id_inquili_2, d_fi_prevista,
  lloguer_inicial, lloguer_actual, data_ultima_revisio, fianca_import, fianca_nc,
  fianca_data_model2, fianca_data_ingres, fianca_data_notificacio, fianca_num_registre,
  devolucio_data_sollicitud, devolucio_data_cobrament, devolucio_import, devolucio_motiu,
  comentaris`

// Les mateixes columnes amb el prefix de la taula, més els noms dels dos inquilins (JOIN) i si el
// contracte té algun document de les classes de la fiança (EXISTS: 0 o 1).
const COLUMNES_LLISTAT = `${COLUMNES.split(',')
  .map((c) => `c.${c.trim()}`)
  .join(', ')},
  q.nom AS inquili_nom, q.cognoms AS inquili_cognoms,
  q2.nom AS inquili2_nom, q2.cognoms AS inquili2_cognoms,
  EXISTS (SELECT 1 FROM documents_contracte d JOIN tipus_document t ON t.id = d.id_tipus
    WHERE d.id_contracte = c.id AND t.classe = 'fianca_model2') AS te_doc_model2,
  EXISTS (SELECT 1 FROM documents_contracte d JOIN tipus_document t ON t.id = d.id_tipus
    WHERE d.id_contracte = c.id AND t.classe = 'fianca_notificacio') AS te_doc_notificacio`

// Fila tal com surt de SQLite: els dos indicadors són 0 o 1. El Main els converteix a boolean.
type FilaLlistat = Omit<ContracteLlistat, 'te_doc_model2' | 'te_doc_notificacio'> & {
  te_doc_model2: number
  te_doc_notificacio: number
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
  return files.map((f) => ({
    ...f,
    te_doc_model2: f.te_doc_model2 === 1,
    te_doc_notificacio: f.te_doc_notificacio === 1
  }))
}

export function obtenirContracte(id: number): Contracte | undefined {
  return db.prepare(`SELECT ${COLUMNES} FROM contractes WHERE id = ?`).get(id) as
    Contracte | undefined
}

// En crear, el lloguer actual i la data de l'última revisió surten del lloguer inicial i de la
// data d'inici (el formulari no els demana). Un trigger no podria: la columna NOT NULL fallaria abans.
export function crearContracte(d: ContracteDades): Contracte {
  const r = db
    .prepare(
      `INSERT INTO contractes (id_inmoble, data_inici, data_fi, id_inquili, id_inquili_2,
        d_fi_prevista, lloguer_inicial, lloguer_actual, data_ultima_revisio, fianca_import,
        fianca_nc, fianca_data_model2, fianca_data_ingres, fianca_data_notificacio,
        fianca_num_registre, comentaris)
       VALUES (@id_inmoble, @data_inici, @data_fi, @id_inquili, @id_inquili_2,
        @d_fi_prevista, @lloguer_inicial, @lloguer_inicial, @data_inici, @fianca_import,
        @fianca_nc, @fianca_data_model2, @fianca_data_ingres, @fianca_data_notificacio,
        @fianca_num_registre, @comentaris)`
    )
    .run(d)
  return obtenirContracte(Number(r.lastInsertRowid)) as Contracte
}

// L'immoble no es pot canviar: `id_inmoble` s'ignora. Les dades de devolució i les de
// Revisar lloguer tampoc es toquen aquí, excepte l'arrossegament de més avall.
export function actualitzarContracte(id: number, d: ContracteDades): void {
  db.transaction(() => {
    const antic = obtenirContracte(id)
    if (!antic) return

    // Mentre el contracte no s'ha revisat mai (la data de l'última revisió és la d'inici), el
    // lloguer actual i la data de revisió segueixen el lloguer inicial i la data d'inici.
    // Un cop revisat, són independents i només els canvia l'acció Revisar lloguer.
    const maiRevisat = antic.data_ultima_revisio === antic.data_inici

    const camps: Partial<ContracteDades> = { ...d }
    delete camps.id_inmoble

    db.prepare(
      `UPDATE contractes SET data_inici=@data_inici, data_fi=@data_fi, id_inquili=@id_inquili,
        id_inquili_2=@id_inquili_2, d_fi_prevista=@d_fi_prevista,
        lloguer_inicial=@lloguer_inicial, lloguer_actual=@lloguer_actual,
        data_ultima_revisio=@data_ultima_revisio, fianca_import=@fianca_import,
        fianca_nc=@fianca_nc, fianca_data_model2=@fianca_data_model2,
        fianca_data_ingres=@fianca_data_ingres,
        fianca_data_notificacio=@fianca_data_notificacio,
        fianca_num_registre=@fianca_num_registre, comentaris=@comentaris
       WHERE id=@id`
    ).run({
      ...camps,
      id,
      lloguer_actual: maiRevisat ? d.lloguer_inicial : antic.lloguer_actual,
      data_ultima_revisio: maiRevisat ? d.data_inici : antic.data_ultima_revisio
    })
  })()
}

// Esborra el contracte. Les files de documents_contracte s'esborren en cascada; els fitxers del disc
// (la carpeta del contracte) s'esborren després, un cop confirmat l'esborrat de la fila.
export function eliminarContracte(id: number): void {
  db.prepare('DELETE FROM contractes WHERE id = ?').run(id)
  esborrarCarpetaContracte(id)
}

// Acció Tancar: informa la data de fi. El CHECK (data_fi >= data_inici) i els triggers de
// solapament validen la resta. Es rebutja un valor que no sigui text: un null reobriria el contracte.
export function tancarContracte(id: number, dataFi: string): void {
  if (typeof dataFi !== 'string') throw new Error('Data de fi invàlida')
  db.prepare('UPDATE contractes SET data_fi = ? WHERE id = ?').run(dataFi, id)
}

// Acció Revisar lloguer: l'import i la data es canvien alhora. L'import pot ser igual a l'actual
// (lloguer congelat). El CHECK imposa que la data no sigui anterior a l'inici del contracte.
export function revisarLloguer(id: number, lloguerNou: number, dataRevisio: string): void {
  if (typeof lloguerNou !== 'number' || !Number.isFinite(lloguerNou) || lloguerNou < 0) {
    throw new Error('Lloguer invàlid')
  }
  if (typeof dataRevisio !== 'string') throw new Error('Data de revisió invàlida')
  db.prepare('UPDATE contractes SET lloguer_actual = ?, data_ultima_revisio = ? WHERE id = ?').run(
    lloguerNou,
    dataRevisio,
    id
  )
}
