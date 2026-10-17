import { BrowserWindow, dialog, shell } from 'electron'
import type { OpenDialogOptions } from 'electron'
import fs from 'fs'
import path from 'path'
import { DADES, db, docsDir } from './database'
import type { DocumentContracte, DocumentDades, DocumentLlistat } from '../shared/tipus'

const COLUMNES = 'id, id_contracte, id_tipus, nom_original, comentaris, data_document'

// Error amb el codi que `traduirError` reconeix (el Renderer en veu el text traduït).
function fitxerNoTrobat(): Error {
  return Object.assign(new Error('Fitxer no trobat'), { code: 'FITXER_NO_TROBAT' })
}

// Nom de fitxer segur per al disc: sense separadors de ruta, caràcters reservats ni de control,
// i amb una longitud raonable. L'extensió es conserva.
function nomSegur(nom: string): string {
  const net = (s: string): string =>
    [...s.replace(/[\\/:*?"<>|]/g, '_')]
      .filter((c) => c.charCodeAt(0) >= 32)
      .join('')
      .trim()
  const ext = path.extname(nom)
  const base = net(path.basename(nom, ext)).slice(0, 120) || 'document'
  return base + net(ext).slice(0, 20)
}

// Converteix la ruta relativa de la BD (`documents/<contracte>/<fitxer>`) en absoluta i comprova
// que queda DINS de documents/: una ruta amb `..` o absoluta es rebutja.
function rutaDins(relativa: string): string {
  const absoluta = path.resolve(DADES, relativa)
  if (!absoluta.startsWith(docsDir + path.sep)) throw new Error('Ruta fora de documents')
  return absoluta
}

export function obtenirDocument(id: number): DocumentContracte | undefined {
  return db.prepare(`SELECT ${COLUMNES} FROM documents_contracte WHERE id = ?`).get(id) as
    DocumentContracte | undefined
}

// Documents d'un contracte, l'últim adjuntat primer, amb el nom i la classe del tipus (JOIN).
// La ruta del fitxer no surt mai del Main.
export function obtenirDocuments(idContracte: number): DocumentLlistat[] {
  return db
    .prepare(
      `SELECT d.id, d.id_contracte, d.id_tipus, d.nom_original, d.comentaris, d.data_document,
        t.nom AS tipus_nom, t.classe AS tipus_classe
       FROM documents_contracte d
       JOIN tipus_document t ON t.id = d.id_tipus
       WHERE d.id_contracte = ?
       ORDER BY d.id DESC`
    )
    .all(idContracte) as DocumentLlistat[]
}

// Obre el diàleg de selecció (múltiple) i adjunta els fitxers triats al contracte, tots amb el
// mateix tipus. El Renderer no envia mai rutes: només el contracte, el tipus i el títol (ja traduït).
// Retorna els documents creats, o una llista buida si l'usuari cancel·la.
export async function adjuntarDocuments(
  idContracte: number,
  idTipus: number,
  titolDialeg: string
): Promise<DocumentContracte[]> {
  // L'id del contracte forma part d'una ruta del disc: ha de ser un enter.
  if (!Number.isInteger(idContracte) || !Number.isInteger(idTipus)) {
    throw new Error('Contracte o tipus invàlid')
  }

  const opcions: OpenDialogOptions = {
    title: typeof titolDialeg === 'string' ? titolDialeg : undefined,
    properties: ['openFile', 'multiSelections']
  }
  const finestra = BrowserWindow.getFocusedWindow()
  const triats = finestra
    ? await dialog.showOpenDialog(finestra, opcions)
    : await dialog.showOpenDialog(opcions)
  if (triats.canceled || triats.filePaths.length === 0) return []

  // Tot o res: si un fitxer falla, es desfan les files i s'esborren els fitxers ja copiats.
  const copiats: string[] = []
  const ids: number[] = []
  try {
    db.transaction(() => {
      const carpeta = path.join(docsDir, String(idContracte))
      fs.mkdirSync(carpeta, { recursive: true })
      for (const origen of triats.filePaths) {
        // Primer la fila (amb la ruta buida), per saber l'id i prefixar el nom amb ell.
        const r = db
          .prepare(
            `INSERT INTO documents_contracte (id_contracte, id_tipus, nom_original, ruta)
             VALUES (?, ?, ?, '')`
          )
          .run(idContracte, idTipus, path.basename(origen))
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
      }
    })()
  } catch (e) {
    for (const f of copiats) fs.rmSync(f, { force: true })
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
