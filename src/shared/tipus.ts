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
  ced_hab_superficie_util: number | null
  val_cadastral_total: number | null
  val_cadastral_constr: number | null
  any_construccio: number | null
  data_compra: string | null // ISO AAAA-MM-DD
  valor_compra: number | null
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

// Motius de tancament d'un contracte: llista fixa (el nom visible surt de la traducció). El valida el Main.
export const MOTIUS_FI = ['no_renovacio', 'voluntaria', 'nou_contracte', 'altres'] as const
export type MotiuFi = (typeof MOTIUS_FI)[number]

export interface Contracte {
  id: number
  id_inmoble: number
  data_inici: string // ISO AAAA-MM-DD
  data_fi: string | null // null = contracte vigent
  motiu_fi: MotiuFi | null // només amb el contracte tancat
  id_inquili: number
  id_inquili_2: number | null
  d_fi_prevista: string // ISO AAAA-MM-DD
  lloguer_inicial: number
  lloguer_actual: number
  data_ultima_revisio: string // ISO AAAA-MM-DD
  fianca_adicional: number
  fianca_import: number | null
  fianca_nc: string | null
  fianca_data_model2: string | null
  fianca_data_ingres: string | null
  fianca_data_notificacio: string | null
  fianca_num_registre: string | null
  fianca_comentari: string | null // incidències amb l'INCASOL
  // Devolució de la fiança: les dades només es poden informar amb el contracte tancat.
  devolucio_nc: string | null // el NC i la data de sol·licitud van junts
  devolucio_data_sollicitud: string | null
  devolucio_data_cobrament: string | null // abonament de l'INCASOL
  devolucio_import: number | null // import a retornar a l'inquilí
  devolucio_motiu: string | null
  comentaris: string | null
}

// Camps editables d'un contracte (tots tret de l'id). En crear, el Main fixa `lloguer_actual` i
// `data_ultima_revisio` a partir de `lloguer_inicial` i `data_inici`; en actualitzar, `id_inmoble` s'ignora.
export type ContracteDades = Omit<Contracte, 'id'>

// Fila del llistat: el contracte més els noms dels inquilins (JOIN al Main).
// El llistat és sempre d'un sol immoble, així que l'adreça no cal.
export interface ContracteLlistat extends Contracte {
  inquili_nom: string | null
  inquili_cognoms: string | null
  inquili2_nom: string | null // null si no hi ha segon inquilí
  inquili2_cognoms: string | null
  // Si el contracte té algun document adjunt de la classe corresponent (calculat al Main).
  te_doc_model2: boolean
  te_doc_notificacio: boolean
  te_doc_rebut: boolean
  te_doc_model3: boolean
}

// Una entrada de la vista "Últims contractes": un immoble amb els seus contractes en curs o l'últim.
// La llista és buida si l'immoble no té cap contracte.
export interface ImmobleAmbContractes {
  immoble: Immoble
  contractes: ContracteLlistat[]
}

// Idiomes de la interfície. Afegir-ne un de nou: afegir-lo aquí, crear el JSON
// i registrar-lo a i18n/index.ts (vegeu "Afegir un idioma nou" a NOTES.md).
export const IDIOMES = ['ca', 'es'] as const
export type Idioma = (typeof IDIOMES)[number]

// Tipus de document d'un contracte: llista fixa al codi (el nom visible surt de la traducció). La BD no els
// valida: els valida el Main. Afegir-ne un és codi (aquí, als JSON i a la lògica que l'usi).
export const TIPUS_DOCUMENT_CONTRACTE = [
  'contracte',
  'annex',
  'fianca_model2',
  'fianca_notificacio',
  'fianca_model3',
  'rebut',
  'altres',
  'documents_inquili'
] as const
export type TipusDocumentContracte = (typeof TIPUS_DOCUMENT_CONTRACTE)[number]

// Tipus que admeten un sol document per contracte (tindran un clip a la seva secció del formulari). Ho
// garanteix la pantalla, no la BD.
export const TIPUS_UNICS_CONTRACTE = [
  'contracte',
  'fianca_model2',
  'fianca_notificacio',
  'fianca_model3',
  'rebut'
] as const

// Tipus que es poden afegir i editar des de la pantalla de documents del contracte (els únics es gestionen des del
// formulari del contracte, amb els clips).
export const TIPUS_LLIURES_CONTRACTE: readonly TipusDocumentContracte[] = [
  'annex',
  'altres',
  'documents_inquili'
]

// Un document adjunt d'un contracte. La ruta del fitxer no s'exposa: només la fa servir el Main.
export interface DocumentContracte {
  id: number
  id_contracte: number
  tipus: TipusDocumentContracte
  nom_original: string
  comentaris: string | null
  data_document: string | null // ISO AAAA-MM-DD
}

// Camps editables d'un document ja adjuntat, i els comuns a tots els fitxers en adjuntar-ne diversos.
export type DocumentDades = Pick<DocumentContracte, 'tipus' | 'comentaris' | 'data_document'>

// Tipus de document d'un immoble: llista al codi (el nom visible surt de la traducció). La BD no els valida:
// els valida el Main. Afegir-ne un és codi (aquí, als JSON i a la lògica que l'usi).
export const TIPUS_DOCUMENT_IMMOBLE = [
  'certificat_energetic',
  'cedula_habitabilitat',
  'fitxa_cadastral',
  'fotos',
  'altres'
] as const
export type TipusDocumentImmoble = (typeof TIPUS_DOCUMENT_IMMOBLE)[number]

// Tipus que admeten un sol document per immoble. Ho garanteix la pantalla (només s'hi pot afegir si no n'hi ha
// cap), no la BD.
export const TIPUS_UNICS_IMMOBLE = [
  'certificat_energetic',
  'cedula_habitabilitat',
  'fitxa_cadastral'
] as const

// Tipus que es poden afegir i editar des de la pantalla de documents de l'immoble (els únics es gestionen des
// de l'edició de l'immoble).
export const TIPUS_LLIURES_IMMOBLE: readonly TipusDocumentImmoble[] = ['fotos', 'altres']

// Un document adjunt d'un immoble. La ruta del fitxer no s'exposa: només la fa servir el Main.
export interface DocumentImmoble {
  id: number
  id_inmoble: number
  tipus: TipusDocumentImmoble
  nom_original: string
  comentaris: string | null
  data_document: string | null // ISO AAAA-MM-DD
}

// Camps editables, i els que s'envien en adjuntar (comuns a tots els fitxers de la selecció).
export type DocumentImmobleDades = Pick<DocumentImmoble, 'tipus' | 'comentaris' | 'data_document'>

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
export type CodiError =
  'CONTRACTE_SOLAPAT' | 'FK_VIOLADA' | 'CHECK_VIOLAT' | 'DESCONEGUT' | 'FITXER_NO_TROBAT'

// Resposta uniforme de tots els handlers IPC.
export type Resultat<T> = { ok: true; dades: T } | { ok: false; error: CodiError }

// Tipus per a l'exportació genèrica de dades.
export type TipusColumnaExportacio = 'text' | 'numero' | 'decimal' | 'moneda' | 'data' | 'boolean'

export interface ColumnaExportacio {
  titol: string
  tipus: TipusColumnaExportacio
}

export type FormatExportacio = 'ods' | 'csv' | 'xlsx'

export type ValorExportacio = string | number | boolean | null

export interface DadesExportacio {
  nomFitxer: string
  titolDialog: string
  format: FormatExportacio
  columnes: ColumnaExportacio[]
  files: ValorExportacio[][]
}

export interface ResultatExportacio {
  canceled: boolean
  format?: FormatExportacio
  filePath?: string
  error?: string
}
