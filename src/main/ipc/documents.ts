import { ipcMain } from 'electron'
import { executar, executarAsync } from '../errors'
import {
  actualitzarDocument,
  adjuntarDocuments,
  eliminarDocument,
  obrirDocument,
  obtenirDocuments
} from '../documents'
import type { DocumentDades } from '../../shared/tipus'

export function registrarIpcDocuments(): void {
  ipcMain.handle('documents:obtenir', (_, idContracte: number) =>
    executar(() => obtenirDocuments(idContracte))
  )

  // El diàleg de selecció s'obre al Main: el Renderer només envia el contracte, les dades comunes (tipus, data
  // i comentari opcional) i el títol del diàleg (ja traduït). No envia mai rutes.
  ipcMain.handle(
    'documents:adjuntar',
    (_, idContracte: number, dades: DocumentDades, titolDialeg: string) =>
      executarAsync(() => adjuntarDocuments(idContracte, dades, titolDialeg))
  )

  ipcMain.handle('documents:actualitzar', (_, id: number, dades: DocumentDades) =>
    executar(() => actualitzarDocument(id, dades))
  )

  ipcMain.handle('documents:eliminar', (_, id: number) => executar(() => eliminarDocument(id)))

  ipcMain.handle('documents:obrir', (_, id: number) => executarAsync(() => obrirDocument(id)))
}
