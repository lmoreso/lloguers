import { ipcMain } from 'electron'
import { executarAsync } from '../errors'
import { exportarCsv, exportarOds, exportarExcel } from '../exportacio'
import type { DadesExportacio } from '../../shared/tipus'

export function registrarIpcExportacio(): void {
  ipcMain.handle('exportacio:csv', (_, dades: DadesExportacio) =>
    executarAsync(() => exportarCsv(dades))
  )

  ipcMain.handle('exportacio:ods', (_, dades: DadesExportacio) =>
    executarAsync(() => exportarOds(dades))
  )

  ipcMain.handle('exportacio:xlsx', (_, dades: DadesExportacio) =>
    executarAsync(() => exportarExcel(dades))
  )
}
