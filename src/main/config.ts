import { app } from 'electron'
import fs from 'fs'
import path from 'path'
import { DADES } from './database'
import type { Config, Idioma } from '../shared/tipus'

const configPath = path.join(DADES, 'config.json')

export function esIdioma(valor: unknown): valor is Idioma {
  return valor === 'ca' || valor === 'es'
}

// Idioma del sistema (p. ex. 'es-ES' -> 'es'). Si no és ca ni es, usem 'ca'.
function idiomaDelSistema(): Idioma {
  const base = app.getLocale().split('-')[0]
  return esIdioma(base) ? base : 'ca'
}

export function desarConfig(config: Config): void {
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2) + '\n', 'utf-8')
}

// Si el fitxer no existeix o és invàlid, usa el valor per defecte i el crea.
export function obtenirConfig(): Config {
  try {
    const brut = JSON.parse(fs.readFileSync(configPath, 'utf-8')) as { idioma?: unknown }
    if (esIdioma(brut.idioma)) return { idioma: brut.idioma }
  } catch {
    // No existeix o no és JSON vàlid: es tracta com a valor per defecte.
  }
  const config: Config = { idioma: idiomaDelSistema() }
  desarConfig(config)
  return config
}
