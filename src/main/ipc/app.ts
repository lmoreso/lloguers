import { app, ipcMain, shell } from 'electron'
import { executar, executarAsync } from '../errors'

export function registrarIpcApp(): void {
  // Versió de l'aplicació, la del package.json (app.getVersion()).
  ipcMain.handle('app:versio', () => executar(() => app.getVersion()))

  // Obre una adreça al navegador del sistema. Només s'accepten adreces https: el Renderer no és de fiar,
  // i no volem que pugui obrir fitxers locals (file://) ni executar res (javascript:).
  ipcMain.handle('app:obrirEnllac', (_, url: string) =>
    executarAsync(async () => {
      const adreca = new URL(url)
      if (adreca.protocol !== 'https:') throw new Error('Enllaç no permès')
      await shell.openExternal(adreca.toString())
    })
  )
}
