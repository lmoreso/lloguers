import { contextBridge, ipcRenderer } from 'electron'
import type { Immoble, ImmobleDades, Inquili, InquiliDades, Resultat } from '../shared/tipus'
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
