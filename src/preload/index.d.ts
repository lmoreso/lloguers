import { ElectronAPI } from '@electron-toolkit/preload'
import type {
  Config,
  ConfigObtinguda,
  Contracte,
  ContracteDades,
  ContracteLlistat,
  DocumentContracte,
  DocumentDades,
  Immoble,
  ImmobleDades,
  Inquili,
  InquiliDades,
  Resultat,
  ImmobleAmbContractes,
  DocumentImmoble,
  DocumentImmobleDades,
  DadesExportacio,
  ResultatExportacio
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
      contractes: {
        obtenir: (idInmoble: number) => Promise<Resultat<ContracteLlistat[]>>
        ultims: () => Promise<Resultat<ImmobleAmbContractes[]>>
        obtenirUn: (id: number) => Promise<Resultat<Contracte | null>>
        crear: (dades: ContracteDades) => Promise<Resultat<Contracte>>
        actualitzar: (id: number, dades: ContracteDades) => Promise<Resultat<void>>
        eliminar: (id: number) => Promise<Resultat<void>>
      }
      documents: {
        obtenir: (idContracte: number) => Promise<Resultat<DocumentContracte[]>>
        adjuntar: (
          idContracte: number,
          dades: DocumentDades,
          titolDialeg: string
        ) => Promise<Resultat<DocumentContracte[]>>
        actualitzar: (id: number, dades: DocumentDades) => Promise<Resultat<void>>
        eliminar: (id: number) => Promise<Resultat<void>>
        obrir: (id: number) => Promise<Resultat<void>>
      }
      app: {
        versio: () => Promise<Resultat<string>>
        obrirEnllac: (url: string) => Promise<Resultat<void>>
      }
      documentsImmoble: {
        obtenir: (idInmoble: number) => Promise<Resultat<DocumentImmoble[]>>
        adjuntar: (
          idInmoble: number,
          dades: DocumentImmobleDades,
          titolDialeg: string
        ) => Promise<Resultat<DocumentImmoble[]>>
        actualitzar: (id: number, dades: DocumentImmobleDades) => Promise<Resultat<void>>
        eliminar: (id: number) => Promise<Resultat<void>>
        obrir: (id: number) => Promise<Resultat<void>>
      }
      exportacio: {
        csv: (dades: DadesExportacio) => Promise<Resultat<ResultatExportacio>>
        ods: (dades: DadesExportacio) => Promise<Resultat<ResultatExportacio>>
        xlsx: (dades: DadesExportacio) => Promise<Resultat<ResultatExportacio>>
      }
    }
  }
}
