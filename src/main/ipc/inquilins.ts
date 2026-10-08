import { ipcMain } from 'electron'
import { executar } from '../errors'
import {
  obtenirInquilins,
  obtenirInquili,
  crearInquili,
  actualitzarInquili,
  eliminarInquili
} from '../inquilins'
import type { InquiliDades } from '../../shared/tipus'

export function registrarIpcInquilins(): void {
  ipcMain.handle('inquilins:obtenir', () => executar(() => obtenirInquilins()))

  ipcMain.handle('inquilins:obtenirUn', (_, id: number) =>
    executar(() => obtenirInquili(id) ?? null)
  )

  ipcMain.handle('inquilins:crear', (_, dades: InquiliDades) => executar(() => crearInquili(dades)))

  ipcMain.handle('inquilins:actualitzar', (_, id: number, dades: InquiliDades) =>
    executar(() => actualitzarInquili(id, dades))
  )

  ipcMain.handle('inquilins:eliminar', (_, id: number) => executar(() => eliminarInquili(id)))
}
