import { ipcMain } from 'electron'
import { executar } from '../errors'
import {
  obtenirContractes,
  obtenirContracte,
  crearContracte,
  actualitzarContracte,
  eliminarContracte,
  tancarContracte,
  revisarLloguer,
  registrarDevolucio,
  obtenirUltimsContractes
} from '../contractes'
import type { ContracteDades, DevolucioDades } from '../../shared/tipus'

export function registrarIpcContractes(): void {
  // Sempre d'un immoble: s'hi entra només des d'Immobles.
  ipcMain.handle('contractes:obtenir', (_, idInmoble: number) =>
    executar(() => obtenirContractes(idInmoble))
  )

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

  ipcMain.handle('contractes:tancar', (_, id: number, dataFi: string) =>
    executar(() => tancarContracte(id, dataFi))
  )

  ipcMain.handle(
    'contractes:revisarLloguer',
    (_, id: number, lloguerNou: number, dataRevisio: string) =>
      executar(() => revisarLloguer(id, lloguerNou, dataRevisio))
  )

  ipcMain.handle('contractes:devolucio', (_, id: number, dades: DevolucioDades) =>
    executar(() => registrarDevolucio(id, dades))
  )

  ipcMain.handle('contractes:ultims', () => executar(() => obtenirUltimsContractes()))
}
