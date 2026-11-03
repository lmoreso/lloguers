import { ipcMain } from 'electron'
import { executar } from '../errors'
import {
  actualitzarContracte,
  crearContracte,
  eliminarContracte,
  obtenirContracte,
  obtenirContractes,
  obtenirUltimsContractes
} from '../contractes'
import type { ContracteDades } from '../../shared/tipus'

export function registrarIpcContractes(): void {
  // Sempre d'un immoble: s'hi entra des d'Immobles.
  ipcMain.handle('contractes:obtenir', (_, idInmoble: number) =>
    executar(() => obtenirContractes(idInmoble))
  )

  ipcMain.handle('contractes:ultims', () => executar(() => obtenirUltimsContractes()))

  ipcMain.handle('contractes:obtenirUn', (_, id: number) =>
    executar(() => obtenirContracte(id) ?? null)
  )

  ipcMain.handle('contractes:crear', (_, dades: ContracteDades) =>
    executar(() => crearContracte(dades))
  )

  ipcMain.handle('contractes:actualitzar', (_, id: number, dades: ContracteDades) =>
    executar(() => actualitzarContracte(id, dades))
  )

  ipcMain.handle('contractes:eliminar', (_, id: number) => executar(() => eliminarContracte(id)))
}
