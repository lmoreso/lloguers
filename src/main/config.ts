import { app } from 'electron'
import fs from 'fs'
import path from 'path'
import { DADES } from './database'
import type { Config, ConfigObtinguda, FormatExportacio, Idioma } from '../shared/tipus'
import { esFormatExportacio, esIdioma, esPathDirectory } from '../shared/validacions'

const configPath = path.join(DADES, 'config.json')

let configEnMemoria: ConfigObtinguda | null = null

// Idioma del sistema (p. ex. 'es-ES' -> 'es'). Si l'app no el té, usem 'ca'.
function idiomaDelSistema(): Idioma {
  const locale = app.getLocale()
  const base = locale.split('-')[0]

  if (esIdioma(base)) {
    return base
  }

  console.log(
    `[main.idiomaDelSistema.idioma] Sistema: "${locale}" -> "${base}" no suportat; s'usa "ca"`
  )
  return 'ca'
}

// Valors per defecte de tota la configuració.
function obtenirConfigPerDefecte(): Config {
  return {
    idioma: idiomaDelSistema(),
    pathExportFiles: app.getPath('downloads'),
    pathImportDocs: app.getPath('documents'),
    formatExportacio: 'xlsx'
  }
}

// Comprova cada propietat independentment i recupera les que siguin invàlides.
function normalitzarConfig(brut: unknown): {
  config: Config
  idiomaConfirmat: boolean
} {
  const perDefecte = obtenirConfigPerDefecte()

  const dades =
    brut !== null && typeof brut === 'object' && !Array.isArray(brut)
      ? (brut as Record<string, unknown>)
      : {}

  const idiomaConfirmat = esIdioma(dades.idioma)

  const config: Config = {
    idioma: idiomaConfirmat ? (dades.idioma as Idioma) : perDefecte.idioma,
    pathExportFiles: esPathDirectory(dades.pathExportFiles)
      ? dades.pathExportFiles
      : perDefecte.pathExportFiles,
    pathImportDocs: esPathDirectory(dades.pathImportDocs)
      ? dades.pathImportDocs
      : perDefecte.pathImportDocs,
    formatExportacio: esFormatExportacio(dades.formatExportacio)
      ? (dades.formatExportacio as FormatExportacio)
      : perDefecte.formatExportacio
  }

  return { config, idiomaConfirmat }
}

// Llegeix config.json només la primera vegada.
export function obtenirConfig(): ConfigObtinguda {
  if (configEnMemoria !== null) return configEnMemoria

  if (!fs.existsSync(configPath)) {
    console.log("[main.config.obtenir] config.json no existeix; s'utilitzen els valors per defecte")
    configEnMemoria = { ...obtenirConfigPerDefecte(), confirmat: false }
    return configEnMemoria
  }

  try {
    const brut: unknown = JSON.parse(fs.readFileSync(configPath, 'utf-8'))
    const { config, idiomaConfirmat } = normalitzarConfig(brut)

    if (!idiomaConfirmat) {
      console.log("[main.config.obtenir] Idioma invàlid o absent; s'utilitza el valor per defecte")
    }

    if (
      brut === null ||
      typeof brut !== 'object' ||
      !esPathDirectory((brut as Record<string, unknown>).pathExportFiles) ||
      !esPathDirectory((brut as Record<string, unknown>).pathImportDocs) ||
      !esFormatExportacio((brut as Record<string, unknown>).formatExportacio)
    ) {
      console.log("[main.config.obtenir] Ruta d'exportació invàlida o absent; s'utilitza Baixades")
    }

    configEnMemoria = { ...config, confirmat: idiomaConfirmat }
    return configEnMemoria
  } catch {
    console.log(
      "[main.config.obtenir] config.json no és JSON vàlid; s'utilitzen els valors per defecte"
    )
    configEnMemoria = { ...obtenirConfigPerDefecte(), confirmat: false }
    return configEnMemoria
  }
}

// Actualitza només les propietats rebudes i desa tota la configuració.
export function desarConfig(parcial: Partial<Config>): void {
  const actual = obtenirConfig()
  const { config } = normalitzarConfig({ ...actual, ...parcial })

  fs.writeFileSync(configPath, JSON.stringify(config, null, 2) + '\n', 'utf-8')

  configEnMemoria = { ...config, confirmat: true }
}
