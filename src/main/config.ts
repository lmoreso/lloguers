import { app } from 'electron'
import fs from 'fs'
import path from 'path'
import { DADES } from './database'
import { IDIOMES } from '../shared/tipus'
import type { Config, ConfigObtinguda, Idioma } from '../shared/tipus'

const configPath = path.join(DADES, 'config.json')

export function esIdioma(valor: unknown): valor is Idioma {
  return (IDIOMES as readonly unknown[]).includes(valor)
}

export function desarConfig(config: Config): void {
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2) + '\n', 'utf-8')
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

// Llegeix config.json. Si no existeix o és invàlid, retorna l'idioma per defecte
// com a NO confirmat i no escriu res: l'usuari el confirma a la pantalla de selecció.
export function obtenirConfig(): ConfigObtinguda {
  let motiu: string
  if (!fs.existsSync(configPath)) {
    motiu = 'config.json no existeix'
  } else {
    try {
      const brut = JSON.parse(fs.readFileSync(configPath, 'utf-8')) as {
        idioma?: unknown
      } | null
      if (esIdioma(brut?.idioma)) {
        console.log(`[idioma] config.json vàlid: "${brut.idioma}" (confirmat)`)
        return { idioma: brut.idioma, confirmat: true }
      }
      motiu = `config.json té un idioma invàlid (${JSON.stringify(brut?.idioma)})`
    } catch {
      motiu = 'config.json no és JSON vàlid'
    }
  }
  const idioma = idiomaDelSistema()
  console.log(`[idioma] ${motiu}; per defecte "${idioma}" (no confirmat, no s'escriu res)`)
  return { idioma, confirmat: false }
}
