import fs from 'fs'
import path from 'path'
import {
  DIES_MAXIMS_AVIS,
  DIES_MINIMS_AVIS,
  IDIOMES,
  type PosicioMenu,
  type FormatExportacio,
  type Idioma
} from './tipus'

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

export function esPosicioMenu(valor: unknown): valor is PosicioMenu {
  return valor === 'top' || valor === 'left'
}

/**
 * Comproba que els dies de marge pels avisos de immobles i contractes siguin correctes
 *
 * @param valor es de tipus desconegut
 * @returns true si es un numero sencer entre DIES_MINIMS_AVIS (15) i DIES_MAXIMS_AVIS (180)
 */
export function esDiesAvis(valor: unknown): boolean {
  return (
    typeof valor === 'number' &&
    Number.isInteger(valor) &&
    valor >= DIES_MINIMS_AVIS &&
    valor <= DIES_MAXIMS_AVIS
  )
}
