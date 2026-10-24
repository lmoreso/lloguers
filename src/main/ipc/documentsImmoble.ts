import { ipcMain } from 'electron'
import { executar, executarAsync } from '../errors'
import {
  actualitzarDocumentImmoble,
  adjuntarDocumentsImmoble,
  eliminarDocumentImmoble,
  obrirDocumentImmoble,
  obtenirDocumentsImmoble
} from '../documentsImmoble'
import type { DocumentImmobleDades } from '../../shared/tipus'

export function registrarIpcDocumentsImmoble(): void {
  ipcMain.handle('documentsImmoble:obtenir', (_, idInmoble: number) =>
    executar(() => obtenirDocumentsImmoble(idInmoble))
  )

  // El diàleg de selecció s'obre al Main: el Renderer només envia l'immoble, les dades comunes i el
  // títol del diàleg (ja traduït). No envia mai rutes.
  ipcMain.handle(
    'documentsImmoble:adjuntar',
    (_, idInmoble: number, dades: DocumentImmobleDades, titolDialeg: string) =>
      executarAsync(() => adjuntarDocumentsImmoble(idInmoble, dades, titolDialeg))
  )

  ipcMain.handle('documentsImmoble:actualitzar', (_, id: number, dades: DocumentImmobleDades) =>
    executar(() => actualitzarDocumentImmoble(id, dades))
  )

  ipcMain.handle('documentsImmoble:eliminar', (_, id: number) =>
    executar(() => eliminarDocumentImmoble(id))
  )

  ipcMain.handle('documentsImmoble:obrir', (_, id: number) =>
    executarAsync(() => obrirDocumentImmoble(id))
  )
}
