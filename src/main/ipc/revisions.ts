import { ipcMain } from 'electron'
import { executar } from '../errors'
import {
  actualitzarRevisio,
  crearRevisio,
  eliminarRevisio,
  obtenirRevisions,
  obtenirRevisionsLlistat
} from '../revisions'
import type { RevisioDades } from '../../shared/tipus'

export function registrarIpcRevisions(): void {
  // Les revisions d'un contracte, l'última primer.
  ipcMain.handle('revisions:obtenir', (_, idContracte: number) =>
    executar(() => obtenirRevisions(idContracte))
  )

  // Totes les revisions, o només les pendents d'enviar.
  ipcMain.handle('revisions:llistat', (_, nomesPendents: boolean) =>
    executar(() => obtenirRevisionsLlistat(nomesPendents === true))
  )

  ipcMain.handle('revisions:crear', (_, idContracte: number, dades: RevisioDades) =>
    executar(() => crearRevisio(idContracte, dades))
  )

  ipcMain.handle('revisions:actualitzar', (_, id: number, dades: RevisioDades) =>
    executar(() => actualitzarRevisio(id, dades))
  )

  ipcMain.handle('revisions:eliminar', (_, id: number) => executar(() => eliminarRevisio(id)))
}
