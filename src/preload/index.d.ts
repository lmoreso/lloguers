import { ElectronAPI } from '@electron-toolkit/preload'
import type {
  Config,
  ConfigObtinguda,
  Contracte,
  ContracteDades,
  ContracteLlistat,
  DocumentContracte,
  DocumentDades,
  DocumentLlistat,
  Immoble,
  ImmobleDades,
  Inquili,
  InquiliDades,
  NomsClasses,
  Resultat,
  TipusDocument
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
      tipusDocument: {
        obtenir: () => Promise<Resultat<TipusDocument[]>>
        sembrar: (noms: NomsClasses) => Promise<Resultat<number>>
      }
      contractes: {
        obtenir: (idInmoble: number) => Promise<Resultat<ContracteLlistat[]>>
        obtenirUn: (id: number) => Promise<Resultat<Contracte | null>>
        crear: (dades: ContracteDades) => Promise<Resultat<Contracte>>
        actualitzar: (id: number, dades: ContracteDades) => Promise<Resultat<void>>
        eliminar: (id: number) => Promise<Resultat<void>>
        tancar: (id: number, dataFi: string) => Promise<Resultat<void>>
        revisarLloguer: (
          id: number,
          lloguerNou: number,
          dataRevisio: string
        ) => Promise<Resultat<void>>
      }
      documents: {
        obtenir: (idContracte: number) => Promise<Resultat<DocumentLlistat[]>>
        adjuntar: (
          idContracte: number,
          idTipus: number,
          titolDialeg: string
        ) => Promise<Resultat<DocumentContracte[]>>
        actualitzar: (id: number, dades: DocumentDades) => Promise<Resultat<void>>
        eliminar: (id: number) => Promise<Resultat<void>>
        obrir: (id: number) => Promise<Resultat<void>>
      }
    }
  }
}
