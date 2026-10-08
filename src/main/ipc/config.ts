import { ipcMain } from 'electron'
import { executar } from '../errors'
import { obtenirConfig, desarConfig, esIdioma } from '../config'
import type { Config } from '../../shared/tipus'

export function registrarIpcConfig(): void {
  ipcMain.handle('config:obtenir', () => executar(() => obtenirConfig()))

  ipcMain.handle('config:desar', (_, config: Config) =>
    executar(() => {
      // El Renderer no és de fiar: es valida abans d'escriure al disc.
      if (!esIdioma(config?.idioma)) throw new Error('Idioma invàlid')
      desarConfig({ idioma: config.idioma })
    })
  )
}
