import { ipcMain } from 'electron'
import { executar } from '../errors'
import { obtenirTipusDocument, sembrarTipusDocument } from '../tipusDocument'
import type { NomsClasses } from '../../shared/tipus'

export function registrarIpcTipusDocument(): void {
  ipcMain.handle('tipusDocument:obtenir', () => executar(() => obtenirTipusDocument()))

  // Retorna quants tipus s'han sembrat.
  ipcMain.handle('tipusDocument:sembrar', (_, noms: NomsClasses) =>
    executar(() => sembrarTipusDocument(noms).length)
  )
}
