// Tipus compartits entre Main, Preload i Renderer.
// No inclouen afegit_el ni ultima_mod: els gestionen els triggers de SQLite.

export interface Immoble {
  id: number
  via: string
  num_via: string
  pis: string
  porta: string | null
  codi_postal: string
  localitat: string
  provincia: string
  ref_catastral: string
  superficie_m2: number
  superficie_pati: number | null
  cert_en_reg: string | null
  cert_en_class: string | null
  cert_en_data: string | null // ISO AAAA-MM-DD
  cert_en_caduc: string | null
  ced_hab_reg: string | null
  ced_hab_data: string | null
  ced_hab_caduc: string | null
}

// Camps editables al formulari (sense id)
export type ImmobleDades = Omit<Immoble, 'id'>

export interface Inquili {
  id: number
  nom: string | null
  cognoms: string | null
  nif: string | null
  telefon_1: string | null
  // A la BD són INTEGER 0/1 (o NULL); el Main els converteix a boolean.
  ck_tel1_wassap: boolean
  ck_tel1_bizum: boolean
}

// Camps editables al formulari (sense id)
export type InquiliDades = Omit<Inquili, 'id'>

// Idiomes de la interfície. Afegir-ne un de nou: afegir-lo aquí, crear el JSON
// i registrar-lo a i18n/index.ts (vegeu "Afegir un idioma nou" a NOTES.md).
export const IDIOMES = ['ca', 'es'] as const
export type Idioma = (typeof IDIOMES)[number]

// Contingut de ~/Lloguers/config.json
export interface Config {
  idioma: Idioma
}

// Resposta de config:obtenir: la configuració, més si ve del fitxer (confirmat)
// o és l'idioma per defecte (no confirmat).
export interface ConfigObtinguda extends Config {
  confirmat: boolean
}

// Codis d'error estables que el Main retorna al Renderer.
// El Renderer els tradueix amb t('errors.<CODI>'); mai es mostra el text de SQLite.
export type CodiError = 'CONTRACTE_SOLAPAT' | 'FK_VIOLADA' | 'CHECK_VIOLAT' | 'DESCONEGUT'

// Resposta uniforme de tots els handlers IPC.
export type Resultat<T> = { ok: true; dades: T } | { ok: false; error: CodiError }
