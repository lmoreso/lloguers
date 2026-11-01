import { BrowserWindow, dialog, shell } from 'electron'
import type { OpenDialogOptions } from 'electron'
import fs from 'fs'
import path from 'path'
import { db, docsDir } from './database'
import { fitxerNoTrobat, nomSegur, rutaDins } from './fitxers'
import type { DocumentContracte, DocumentDades, DocumentLlistat } from '../shared/tipus'

const COLUMNES = 'id, id_contracte, id_tipus, nom_original, comentaris, data_document'

export function obtenirDocument(id: number): DocumentContracte | undefined {
  return db.prepare(`SELECT ${COLUMNES} FROM documents_contracte WHERE id = ?`).get(id) as
    DocumentContracte | undefined
}

// Documents d'un contracte, per ordre d'adjuntat, amb el nom i la classe del tipus (JOIN).
// La ruta del fitxer no surt mai del Main.
export function obtenirDocuments(idContracte: number): DocumentLlistat[] {
  return db
    .prepare(
      `SELECT d.id, d.id_contracte, d.id_tipus, d.nom_original, d.comentaris, d.data_document,
        t.nom AS tipus_nom, t.classe AS tipus_classe
       FROM documents_contracte d
       JOIN tipus_document t ON t.id = d.id_tipus
       WHERE d.id_contracte = ?
       ORDER BY d.id`
    )
    .all(idContracte) as DocumentLlistat[]
}

// Obre el diàleg de selecció (múltiple) i adjunta els fitxers triats al contracte: una fila per fitxer, amb el
// mateix tipus, data i comentari (opcional). Si n'hi ha més d'un, el comentari es numera ("1. Sala", "2. Sala"...;
// sense comentari, només "1.", "2."...) en l'ordre dels noms dels fitxers. El Renderer no envia mai rutes.
// Retorna els documents creats, o una llista buida si l'usuari cancel·la. Tot o res.
export async function adjuntarDocuments(
  idContracte: number,
  dades: DocumentDades,
  titolDialeg: string
): Promise<DocumentContracte[]> {
  // El Renderer no és de fiar: es valida tot ABANS d'obrir el diàleg. L'id del contracte forma part d'una
  // ruta del disc: ha de ser un enter.
  if (!Number.isInteger(idContracte)) throw new Error('Contracte invàlid')
  if (!dades || !Number.isInteger(dades.id_tipus)) throw new Error('Tipus de document invàlid')
  if (
    dades.comentaris !== null &&
    dades.comentaris !== undefined &&
    typeof dades.comentaris !== 'string'
  ) {
    throw new Error('Comentari invàlid')
  }
  const comentari = typeof dades.comentaris === 'string' ? dades.comentaris.trim() : ''
  const data = dades.data_document ?? null
  if (data !== null && typeof data !== 'string') throw new Error('Data invàlida')

  const opcions: OpenDialogOptions = {
    title: typeof titolDialeg === 'string' ? titolDialeg : undefined,
    properties: ['openFile', 'multiSelections']
  }
  const finestra = BrowserWindow.getFocusedWindow()
  const triats = finestra
    ? await dialog.showOpenDialog(finestra, opcions)
    : await dialog.showOpenDialog(opcions)
  if (triats.canceled || triats.filePaths.length === 0) return []

  // Ordre pel nom, amb ordre numèric (foto2 abans de foto10).
  const origens = [...triats.filePaths].sort((a, b) =>
    path
      .basename(a)
      .localeCompare(path.basename(b), undefined, { numeric: true, sensitivity: 'base' })
  )
  const n = origens.length
  const comentariDe = (i: number): string | null =>
    n === 1
      ? comentari || null
      : `${String(i + 1).padStart(String(n).length, '0')}.${comentari ? ` ${comentari}` : ''}`

  // Tot o res: si un fitxer falla, es desfan les files i s'esborren els fitxers ja copiats.
  const carpeta = path.join(docsDir, String(idContracte))
  const copiats: string[] = []
  const ids: number[] = []
  try {
    db.transaction(() => {
      fs.mkdirSync(carpeta, { recursive: true })
      origens.forEach((origen, i) => {
        // Primer la fila (amb la ruta buida), per saber l'id i prefixar el nom amb ell.
        const r = db
          .prepare(
            `INSERT INTO documents_contracte (id_contracte, id_tipus, nom_original, ruta, comentaris, data_document)
             VALUES (?, ?, ?, '', ?, ?)`
          )
          .run(idContracte, dades.id_tipus, path.basename(origen), comentariDe(i), data)
        const id = Number(r.lastInsertRowid)
        const fitxer = `${id}_${nomSegur(path.basename(origen))}`
        const desti = path.join(carpeta, fitxer)
        fs.copyFileSync(origen, desti)
        copiats.push(desti)
        // A la BD només es desa la ruta relativa, sempre amb "/".
        db.prepare('UPDATE documents_contracte SET ruta = ? WHERE id = ?').run(
          path.posix.join('documents', String(idContracte), fitxer),
          id
        )
        ids.push(id)
      })
    })()
  } catch (e) {
    for (const f of copiats) fs.rmSync(f, { force: true })
    try {
      fs.rmdirSync(carpeta) // només s'esborra si ha quedat buida
    } catch {
      // no existeix o no és buida: no passa res
    }
    throw e
  }
  return ids.map((id) => obtenirDocument(id) as DocumentContracte)
}

export function actualitzarDocument(id: number, d: DocumentDades): void {
  db.prepare(
    `UPDATE documents_contracte SET id_tipus=@id_tipus, comentaris=@comentaris,
      data_document=@data_document WHERE id=@id`
  ).run({ ...d, id })
}

// Esborra la fila i el fitxer del disc. Si el fitxer ja no hi és, no és un error.
export function eliminarDocument(id: number): void {
  const fila = db.prepare('SELECT ruta FROM documents_contracte WHERE id = ?').get(id) as
    { ruta: string } | undefined
  if (!fila) return
  const absoluta = rutaDins(fila.ruta) // es valida abans de tocar res
  db.prepare('DELETE FROM documents_contracte WHERE id = ?').run(id)
  fs.rmSync(absoluta, { force: true })
}

// Obre el fitxer amb l'aplicació del sistema.
export async function obrirDocument(id: number): Promise<void> {
  const fila = db.prepare('SELECT ruta FROM documents_contracte WHERE id = ?').get(id) as
    { ruta: string } | undefined
  if (!fila) throw fitxerNoTrobat()
  const absoluta = rutaDins(fila.ruta)
  if (!fs.existsSync(absoluta)) throw fitxerNoTrobat()
  const error = await shell.openPath(absoluta) // retorna un text buit si va bé
  if (error) throw new Error(error)
}

// Esborra la carpeta d'un contracte amb tots els seus fitxers. La crida eliminarContracte
// DESPRÉS d'esborrar la fila (que s'emporta els documents en cascada).
export function esborrarCarpetaContracte(idContracte: number): void {
  if (!Number.isInteger(idContracte)) return
  fs.rmSync(path.join(docsDir, String(idContracte)), { recursive: true, force: true })
}
