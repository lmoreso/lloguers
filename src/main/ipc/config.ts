import { ipcMain } from 'electron'
import { executar } from '../errors'
import { obtenirConfig, desarConfig, esIdioma, esPathDirectory } from '../config'
import type { Config } from '../../shared/tipus'

export function registrarIpcConfig(): void {
  ipcMain.handle('config:obtenir', () => executar(() => obtenirConfig()))

  ipcMain.handle('config:desar', (_, parcial: Partial<Config>) =>
    executar(() => {
      // El Renderer no és de fiar: es valida abans d'escriure al disc.
      if (typeof parcial !== 'object' || parcial === null || Array.isArray(parcial)) {
        throw new Error('Configuració invàlida')
      }

      if (parcial.idioma !== undefined && !esIdioma(parcial.idioma)) {
        throw new Error('Idioma invàlid')
      }

      if (parcial.pathExportFiles !== undefined && !esPathDirectory(parcial.pathExportFiles)) {
        throw new Error("Ruta d'exportació invàlida")
      }

      if (parcial.pathImportDocs !== undefined && !esPathDirectory(parcial.pathImportDocs)) {
        throw new Error("Ruta d'importació invàlida")
      }

      desarConfig(parcial)
    })
  )
}
