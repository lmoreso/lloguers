import { contextBridge, ipcRenderer } from 'electron'
import type {
  Config,
  Immoble,
  ImmobleDades,
  Inquili,
  InquiliDades,
  Resultat,
  ConfigObtinguda,
  NomsClasses,
  TipusDocument,
  Contracte,
  ContracteDades,
  ContracteLlistat,
  DocumentContracte,
  DocumentDades,
  DocumentLlistat,
  DevolucioDades,
  ImmobleAmbContractes
} from '../shared/tipus'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  inmobles: {
    obtenir: (): Promise<Resultat<Immoble[]>> => ipcRenderer.invoke('inmobles:obtenir'),
    obtenirUn: (id: number): Promise<Resultat<Immoble | null>> =>
      ipcRenderer.invoke('inmobles:obtenirUn', id),
    crear: (dades: ImmobleDades): Promise<Resultat<Immoble>> =>
      ipcRenderer.invoke('inmobles:crear', dades),
    actualitzar: (id: number, dades: ImmobleDades): Promise<Resultat<void>> =>
      ipcRenderer.invoke('inmobles:actualitzar', id, dades),
    eliminar: (id: number): Promise<Resultat<void>> => ipcRenderer.invoke('inmobles:eliminar', id)
  },
  inquilins: {
    obtenir: (): Promise<Resultat<Inquili[]>> => ipcRenderer.invoke('inquilins:obtenir'),
    obtenirUn: (id: number): Promise<Resultat<Inquili | null>> =>
      ipcRenderer.invoke('inquilins:obtenirUn', id),
    crear: (dades: InquiliDades): Promise<Resultat<Inquili>> =>
      ipcRenderer.invoke('inquilins:crear', dades),
    actualitzar: (id: number, dades: InquiliDades): Promise<Resultat<void>> =>
      ipcRenderer.invoke('inquilins:actualitzar', id, dades),
    eliminar: (id: number): Promise<Resultat<void>> => ipcRenderer.invoke('inquilins:eliminar', id)
  },
  config: {
    obtenir: (): Promise<Resultat<ConfigObtinguda>> => ipcRenderer.invoke('config:obtenir'),
    desar: (config: Config): Promise<Resultat<void>> => ipcRenderer.invoke('config:desar', config)
  },
  tipusDocument: {
    obtenir: (): Promise<Resultat<TipusDocument[]>> => ipcRenderer.invoke('tipusDocument:obtenir'),
    sembrar: (noms: NomsClasses): Promise<Resultat<number>> =>
      ipcRenderer.invoke('tipusDocument:sembrar', noms)
  },
  contractes: {
    obtenir: (idInmoble: number): Promise<Resultat<ContracteLlistat[]>> =>
      ipcRenderer.invoke('contractes:obtenir', idInmoble),
    obtenirUn: (id: number): Promise<Resultat<Contracte | null>> =>
      ipcRenderer.invoke('contractes:obtenirUn', id),
    crear: (dades: ContracteDades): Promise<Resultat<Contracte>> =>
      ipcRenderer.invoke('contractes:crear', dades),
    actualitzar: (id: number, dades: ContracteDades): Promise<Resultat<void>> =>
      ipcRenderer.invoke('contractes:actualitzar', id, dades),
    eliminar: (id: number): Promise<Resultat<void>> =>
      ipcRenderer.invoke('contractes:eliminar', id),
    tancar: (id: number, dataFi: string): Promise<Resultat<void>> =>
      ipcRenderer.invoke('contractes:tancar', id, dataFi),
    revisarLloguer: (
      id: number,
      lloguerNou: number,
      dataRevisio: string
    ): Promise<Resultat<void>> =>
      ipcRenderer.invoke('contractes:revisarLloguer', id, lloguerNou, dataRevisio),
    devolucio: (id: number, dades: DevolucioDades): Promise<Resultat<void>> =>
      ipcRenderer.invoke('contractes:devolucio', id, dades),
    ultims: (): Promise<Resultat<ImmobleAmbContractes[]>> => ipcRenderer.invoke('contractes:ultims')
  },
  documents: {
    obtenir: (idContracte: number): Promise<Resultat<DocumentLlistat[]>> =>
      ipcRenderer.invoke('documents:obtenir', idContracte),
    adjuntar: (
      idContracte: number,
      idTipus: number,
      titolDialeg: string
    ): Promise<Resultat<DocumentContracte[]>> =>
      ipcRenderer.invoke('documents:adjuntar', idContracte, idTipus, titolDialeg),
    actualitzar: (id: number, dades: DocumentDades): Promise<Resultat<void>> =>
      ipcRenderer.invoke('documents:actualitzar', id, dades),
    eliminar: (id: number): Promise<Resultat<void>> => ipcRenderer.invoke('documents:eliminar', id),
    obrir: (id: number): Promise<Resultat<void>> => ipcRenderer.invoke('documents:obrir', id)
  },
  app: {
    versio: (): Promise<Resultat<string>> => ipcRenderer.invoke('app:versio'),
    obrirEnllac: (url: string): Promise<Resultat<void>> =>
      ipcRenderer.invoke('app:obrirEnllac', url)
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
