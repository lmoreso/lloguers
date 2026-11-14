import fs from 'fs'
import path from 'path'
import { IDIOMES, type FormatExportacio, type Idioma } from './tipus'

export function esFormatExportacio(valor: unknown): valor is FormatExportacio {
  return ['csv', 'ods', 'xlsx'].includes(valor as string)
}

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
