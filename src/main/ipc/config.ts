import { ipcMain } from 'electron'
import { executar } from '../errors'
import { obtenirConfig, desarConfig } from '../config'
import { esDiesAvis, esIdioma, esPathDirectory, esPosicioMenu } from '../../shared/validacions'
import { esFormatExportacio } from '../../shared/validacions'
import type { Config } from '../../shared/tipus'

export function registrarIpcConfig(): void {
  ipcMain.handle('config:obtenir', () => executar(() => obtenirConfig()))

  ipcMain.handle('config:desar', (_, parcial: Partial<Config>) =>
    executar(() => {
      // El Renderer no és de fiar: es valida abans d'escriure al disc.
      if (typeof parcial !== 'object' || parcial === null || Array.isArray(parcial)) {
        throw new Error('[ipc-config] Configuració invàlida')
      }

      const configNeta: Partial<Config> = { ...parcial }

      // eslint-disable-next-line prettier/prettier
      if (configNeta.pathExportFiles !== undefined && !esPathDirectory(configNeta.pathExportFiles)
      ) {
        console.log(
          `[ipc.config.desr] Ruta d'exportació invàlida (${configNeta.pathExportFiles}); s'ignora la propietat`
        )
        delete configNeta.pathExportFiles
      }

      if (configNeta.pathImportDocs !== undefined && !esPathDirectory(configNeta.pathImportDocs)) {
        console.log(
          `[ipc.config.desar] Ruta d'importació invàlida (${configNeta.pathImportDocs}); s'ignora la propietat`
        )
        delete configNeta.pathImportDocs
      }

      if (configNeta.idioma !== undefined && !esIdioma(configNeta.idioma)) {
        console.log(
          `[ipc.config.desar] Idioma invàlid (${configNeta.idioma}); s'ignora la propietat`
        )
        delete configNeta.idioma
      }

      // eslint-disable-next-line prettier/prettier
      if (configNeta.formatExportacio !== undefined && !esFormatExportacio(configNeta.formatExportacio)) {
        console.log(
          `[ipc.config.desar] Format d'exportació invàlid (${configNeta.formatExportacio}); s'ignora la propietat`
        )
        delete configNeta.formatExportacio
      }

      if (configNeta.posicioMenu !== undefined && !esPosicioMenu(configNeta.posicioMenu)) {
        console.log(
          `[ipc.config.desar] Posició del menú invàlida (${configNeta.posicioMenu}); s'ignora la propietat`
        )
        delete configNeta.idioma
      }

      if (
        configNeta.diesAvisDocumentCaducat !== undefined &&
        !esDiesAvis(configNeta.diesAvisDocumentCaducat)
      ) {
        console.log(
          `[ipc.config.desar] Dies avis docs caducats invàlids (${configNeta.diesAvisDocumentCaducat}); s'ignora la propietat`
        )
        delete configNeta.diesAvisDocumentCaducat
      }

      if (
        configNeta.diesAvisFiContracte !== undefined &&
        !esDiesAvis(configNeta.diesAvisFiContracte)
      ) {
        console.log(
          `[ipc.config.desar] Dies avis fi contracte invàlids (${configNeta.diesAvisFiContracte}); s'ignora la propietat`
        )
        delete configNeta.diesAvisFiContracte
      }

      if (
        configNeta.diesAvisRevisioLloguer !== undefined &&
        !esDiesAvis(configNeta.diesAvisRevisioLloguer)
      ) {
        console.log(
          `[ipc.config.desar] Dies avis revisió lloguer invàlids (${configNeta.diesAvisRevisioLloguer}); s'ignora la propietat`
        )
        delete configNeta.diesAvisRevisioLloguer
      }

      if (Object.keys(configNeta).length > 0) {
        desarConfig(configNeta)
      } else {
        console.log('[ipc.config.desr] No hi ha propietats vàlides per desar')
        throw new Error('[ipc.config.desr] Totes les propietats de la configuració són invàlides')
      }
    })
  )
}
