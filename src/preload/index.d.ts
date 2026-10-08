import { ElectronAPI } from '@electron-toolkit/preload'
import type { Immoble, ImmobleDades, Resultat } from '../shared/tipus'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      inmobles: {
        obtenir: () => Promise<Resultat<Immoble[]>>
        obtenirUn: (id: number) => Promise<Resultat<Immoble | null>>
        crear: (dades: ImmobleDades) => Promise<Resultat<Immoble>>
        actualitzar: (id: number, dades: ImmobleDades) => Promise<Resultat<void>>
        eliminar: (id: number) => Promise<Resultat<void>>
      }
    }
  }
}
