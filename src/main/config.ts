import { app } from 'electron'
import fs from 'fs'
import path from 'path'
import { DADES } from './database'
import { IDIOMES } from '../shared/tipus'
import type { Config, ConfigObtinguda, Idioma } from '../shared/tipus'

const configPath = path.join(DADES, 'config.json')

let configEnMemoria: ConfigObtinguda | null = null

export function esIdioma(valor: unknown): valor is Idioma {
  return (IDIOMES as readonly unknown[]).includes(valor)
}

// Comprova que la ruta existeix i correspon a una carpeta.
export function esPathDirectory(valor: unknown): valor is string {
  if (typeof valor !== 'string' || valor.trim() === '' || !path.isAbsolute(valor)) {
    return false
  }

  try {
    return fs.statSync(valor).isDirectory()
  } catch {
    return false
  }
}

// Idioma del sistema (p. ex. 'es-ES' -> 'es'). Si l'app no el té, usem 'ca'.
function idiomaDelSistema(): Idioma {
  const locale = app.getLocale()
  const base = locale.split('-')[0]

  if (esIdioma(base)) {
    console.log(`[idioma] Sistema: "${locale}" -> "${base}" (suportat)`)
    return base
  }

  console.log(`[idioma] Sistema: "${locale}" -> "${base}" no suportat; s'usa "ca"`)
  return 'ca'
}

// Valors per defecte de tota la configuració.
function obtenirConfigPerDefecte(): Config {
  return {
    idioma: idiomaDelSistema(),
    pathExportFiles: app.getPath('downloads'),
    pathImportDocs: app.getPath('documents')
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
      : perDefecte.pathImportDocs
  }

  return { config, idiomaConfirmat }
}

// Llegeix config.json només la primera vegada.
export function obtenirConfig(): ConfigObtinguda {
  if (configEnMemoria !== null) return configEnMemoria

  if (!fs.existsSync(configPath)) {
    console.log("[config] config.json no existeix; s'utilitzen els valors per defecte")
    configEnMemoria = { ...obtenirConfigPerDefecte(), confirmat: false }
    return configEnMemoria
  }

  try {
    const brut: unknown = JSON.parse(fs.readFileSync(configPath, 'utf-8'))
    const { config, idiomaConfirmat } = normalitzarConfig(brut)

    if (!idiomaConfirmat) {
      console.log("[config] Idioma invàlid o absent; s'utilitza el valor per defecte")
    }

    if (
      brut === null ||
      typeof brut !== 'object' ||
      !esPathDirectory((brut as Record<string, unknown>).pathExportFiles)
    ) {
      console.log("[config] Ruta d'exportació invàlida o absent; s'utilitza Baixades")
    }

    configEnMemoria = { ...config, confirmat: idiomaConfirmat }
    return configEnMemoria
  } catch {
    console.log("[config] config.json no és JSON vàlid; s'utilitzen els valors per defecte")
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
