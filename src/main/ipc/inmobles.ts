import { ipcMain } from 'electron'
import { executar } from '../errors'
import {
  obtenirInmobles,
  obtenirInmoble,
  crearInmoble,
  actualitzarInmoble,
  eliminarInmoble
} from '../inmobles'
import type { ImmobleDades } from '../../shared/tipus'

export function registrarIpcInmobles(): void {
  ipcMain.handle('inmobles:obtenir', () => executar(() => obtenirInmobles()))

  ipcMain.handle('inmobles:obtenirUn', (_, id: number) =>
    executar(() => obtenirInmoble(id) ?? null)
  )

  ipcMain.handle('inmobles:crear', (_, dades: ImmobleDades) => executar(() => crearInmoble(dades)))

  ipcMain.handle('inmobles:actualitzar', (_, id: number, dades: ImmobleDades) =>
    executar(() => actualitzarInmoble(id, dades))
  )

  ipcMain.handle('inmobles:eliminar', (_, id: number) => executar(() => eliminarInmoble(id)))
}
