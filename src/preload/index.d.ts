import { ElectronAPI } from '@electron-toolkit/preload'
import type {
  Config,
  Immoble,
  ImmobleDades,
  Inquili,
  InquiliDades,
  Resultat,
  ConfigObtinguda
} from '../shared/tipus'

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
      inquilins: {
        obtenir: () => Promise<Resultat<Inquili[]>>
        obtenirUn: (id: number) => Promise<Resultat<Inquili | null>>
        crear: (dades: InquiliDades) => Promise<Resultat<Inquili>>
        actualitzar: (id: number, dades: InquiliDades) => Promise<Resultat<void>>
        eliminar: (id: number) => Promise<Resultat<void>>
      }
      config: {
        obtenir: () => Promise<Resultat<ConfigObtinguda>>
        desar: (config: Config) => Promise<Resultat<void>>
      }
    }
  }
}
