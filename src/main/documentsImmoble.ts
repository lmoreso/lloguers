import { BrowserWindow, dialog, shell } from 'electron'
import type { OpenDialogOptions } from 'electron'
import fs from 'fs'
import path from 'path'
import { db, docsDir } from './database'
import { fitxerNoTrobat, nomSegur, rutaDins } from './fitxers'
import { TIPUS_DOCUMENT_IMMOBLE } from '../shared/tipus'
import type { DocumentImmoble, DocumentImmobleDades } from '../shared/tipus'

const COLUMNES = 'id, id_inmoble, tipus, nom_original, comentaris, data_document'

// documents/immobles/<id>. Les carpetes dels contractes són documents/<id> (numèriques): no hi ha col·lisió.
function carpetaImmoble(idInmoble: number): string {
  return path.join(docsDir, 'immobles', String(idInmoble))
}

export function obtenirDocumentImmoble(id: number): DocumentImmoble | undefined {
  return db.prepare(`SELECT ${COLUMNES} FROM documents_immoble WHERE id = ?`).get(id) as
    DocumentImmoble | undefined
}

// Documents d'un immoble, per ordre d'adjuntat. La ruta del fitxer no surt mai del Main.
export function obtenirDocumentsImmoble(idInmoble: number): DocumentImmoble[] {
  return db
    .prepare(`SELECT ${COLUMNES} FROM documents_immoble WHERE id_inmoble = ? ORDER BY id`)
    .all(idInmoble) as DocumentImmoble[]
}

// Obre el diàleg de selecció (múltiple) i adjunta els fitxers triats a l'immoble: una fila per fitxer, amb el
// mateix tipus, data i comentari. Si n'hi ha més d'un, el comentari es numera ("1. Sala", "2. Sala"...) en
// l'ordre dels noms dels fitxers. El Renderer no envia mai rutes. Retorna els documents creats, o una llista
// buida si l'usuari cancel·la. Tot o res.
export async function adjuntarDocumentsImmoble(
  idInmoble: number,
  dades: DocumentImmobleDades,
  titolDialeg: string
): Promise<DocumentImmoble[]> {
  // El Renderer no és de fiar: es valida tot ABANS d'obrir el diàleg.
  if (!Number.isInteger(idInmoble)) throw new Error('Immoble invàlid')
  if (!dades || !(TIPUS_DOCUMENT_IMMOBLE as readonly unknown[]).includes(dades.tipus)) {
    throw new Error('Tipus de document invàlid')
  }
  const comentari = typeof dades.comentaris === 'string' ? dades.comentaris.trim() : ''
  if (!comentari) throw new Error('El comentari és obligatori')
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
  const comentariDe = (i: number): string =>
    n === 1 ? comentari : `${String(i + 1).padStart(String(n).length, '0')}. ${comentari}`

  // Tot o res: si un fitxer falla, es desfan les files i s'esborren els fitxers ja copiats.
  const carpeta = carpetaImmoble(idInmoble)
  const copiats: string[] = []
  const ids: number[] = []
  try {
    db.transaction(() => {
      fs.mkdirSync(carpeta, { recursive: true })
      origens.forEach((origen, i) => {
        // Primer la fila (amb la ruta buida), per saber l'id i prefixar el nom amb ell.
        const r = db
          .prepare(
            `INSERT INTO documents_immoble (id_inmoble, tipus, nom_original, ruta, comentaris, data_document)
             VALUES (?, ?, ?, '', ?, ?)`
          )
          .run(idInmoble, dades.tipus, path.basename(origen), comentariDe(i), data)
        const id = Number(r.lastInsertRowid)
        const fitxer = `${id}_${nomSegur(path.basename(origen))}`
        const desti = path.join(carpeta, fitxer)
        fs.copyFileSync(origen, desti)
        copiats.push(desti)
        // A la BD només es desa la ruta relativa, sempre amb "/".
        db.prepare('UPDATE documents_immoble SET ruta = ? WHERE id = ?').run(
          path.posix.join('documents', 'immobles', String(idInmoble), fitxer),
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
  return ids.map((id) => obtenirDocumentImmoble(id) as DocumentImmoble)
}

// Canvia el tipus, la data i el comentari. El tipus i el comentari els valida el CHECK de la BD.
export function actualitzarDocumentImmoble(id: number, d: DocumentImmobleDades): void {
  db.prepare(
    `UPDATE documents_immoble SET tipus=@tipus, comentaris=@comentaris, data_document=@data_document
     WHERE id=@id`
  ).run({
    tipus: d.tipus,
    comentaris: d.comentaris,
    data_document: d.data_document ?? null,
    id
  })
}

// Esborra la fila i el fitxer del disc. Si el fitxer ja no hi és, no és un error.
export function eliminarDocumentImmoble(id: number): void {
  const fila = db.prepare('SELECT ruta FROM documents_immoble WHERE id = ?').get(id) as
    { ruta: string } | undefined
  if (!fila) return
  const absoluta = rutaDins(fila.ruta) // es valida abans de tocar res
  db.prepare('DELETE FROM documents_immoble WHERE id = ?').run(id)
  fs.rmSync(absoluta, { force: true })
}

// Obre el fitxer amb l'aplicació del sistema.
export async function obrirDocumentImmoble(id: number): Promise<void> {
  const fila = db.prepare('SELECT ruta FROM documents_immoble WHERE id = ?').get(id) as
    { ruta: string } | undefined
  if (!fila) throw fitxerNoTrobat()
  const absoluta = rutaDins(fila.ruta)
  if (!fs.existsSync(absoluta)) throw fitxerNoTrobat()
  const error = await shell.openPath(absoluta) // retorna un text buit si va bé
  if (error) throw new Error(error)
}

// Esborra la carpeta d'un immoble amb tots els seus fitxers. La crida eliminarInmoble DESPRÉS d'esborrar la
// fila (que s'emporta els documents en cascada).
export function esborrarCarpetaImmoble(idInmoble: number): void {
  if (!Number.isInteger(idInmoble)) return
  fs.rmSync(carpetaImmoble(idInmoble), { recursive: true, force: true })
}
