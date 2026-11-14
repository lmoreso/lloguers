import { dialog } from 'electron'
import path from 'path'
import { obtenirConfig, desarConfig } from './config'
import { writeFile } from 'fs/promises'
import * as XLSX from 'xlsx'
import type { DadesExportacio, ValorExportacio, ResultatExportacio } from '../shared/tipus'

async function mostrarDialogDesament(
  titol: string,
  nomFitxer: string,
  filtre: { name: string; extensions: string[] }
): Promise<string | null> {
  const config = obtenirConfig()
  const carpeta = config.pathExportFiles

  const resultat = await dialog.showSaveDialog({
    title: titol,
    defaultPath: path.join(carpeta, nomFitxer),
    filters: [filtre]
  })

  if (resultat.canceled || !resultat.filePath) return null

  desarConfig({ pathExportFiles: path.dirname(resultat.filePath) })

  return resultat.filePath
}

function convertirValor(valor: ValorExportacio, tipus: string): string {
  if (valor === null) return ''

  if (tipus === 'boolean') {
    return valor ? 'Sí' : 'No'
  }

  if (typeof valor === 'number') {
    return String(valor)
  }

  return String(valor)
}

function escaparValor(valor: string): string {
  if (/[;"\r\n]/.test(valor)) {
    return `"${valor.replace(/"/g, '""')}"`
  }

  return valor
}

export async function exportarCsv(dades: DadesExportacio): Promise<ResultatExportacio> {
  if (dades.format !== 'csv') {
    throw new Error('Format d’exportació no vàlid')
  }

  const nomFitxer = dades.nomFitxer.toLowerCase().endsWith('.csv')
    ? dades.nomFitxer
    : `${dades.nomFitxer}.csv`

  const filePath = await mostrarDialogDesament(dades.titolDialog, nomFitxer, {
    name: 'CSV',
    extensions: ['csv']
  })

  if (!filePath) return { canceled: true }

  const capcalera = dades.columnes.map((c) => escaparValor(c.titol)).join(';')

  const files = dades.files.map((fila) =>
    dades.columnes
      .map((columna, index) => escaparValor(convertirValor(fila[index] ?? null, columna.tipus)))
      .join(';')
  )

  const contingut = [capcalera, ...files].join('\r\n')

  await writeFile(filePath, '\uFEFF' + contingut, 'utf8')

  return { canceled: false, format: 'csv', filePath: filePath }
}

export async function exportarOds(dades: DadesExportacio): Promise<ResultatExportacio> {
  if (dades.format !== 'ods') {
    throw new Error('Format d’exportació no vàlid')
  }

  const nomFitxer = dades.nomFitxer.toLowerCase().endsWith('.ods')
    ? dades.nomFitxer
    : `${dades.nomFitxer}.ods`

  const filePath = await mostrarDialogDesament(dades.titolDialog, nomFitxer, {
    name: 'ODS',
    extensions: ['ods']
  })

  if (!filePath) return { canceled: true }

  const files = dades.files.map((fila) =>
    dades.columnes.map((columna, index) => {
      const valor = fila[index] ?? null

      if (valor === null) return null

      if (columna.tipus === 'data' && typeof valor === 'string') {
        return new Date(`${valor.slice(0, 10)}T00:00:00.000Z`)
      }

      return valor
    })
  )

  const ws = XLSX.utils.aoa_to_sheet([dades.columnes.map((c) => c.titol), ...files], {
    cellDates: true
  })

  // Aplicar el format corresponent a cada columna.
  dades.columnes.forEach((columna, index) => {
    const format =
      columna.tipus === 'numero'
        ? '#,##0'
        : columna.tipus === 'decimal'
          ? '#,##0.00'
          : columna.tipus === 'moneda'
            ? '#,##0.00 "€"'
            : columna.tipus === 'data'
              ? 'dd/mm/yyyy'
              : null

    if (!format) return

    for (let fila = 1; fila <= files.length; fila++) {
      const adreca = XLSX.utils.encode_cell({ r: fila, c: index })

      if (ws[adreca]) {
        ws[adreca].z = format
      }
    }
  })

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Dades')

  XLSX.writeFile(wb, filePath, { bookType: 'ods' })

  return { canceled: false, format: 'ods', filePath: filePath }
}

export async function exportarExcel(dades: DadesExportacio): Promise<ResultatExportacio> {
  if (dades.format !== 'xlsx') {
    throw new Error('Format d’exportació no vàlid')
  }

  const nomFitxer = dades.nomFitxer.toLowerCase().endsWith('.xlsx')
    ? dades.nomFitxer
    : `${dades.nomFitxer}.xlsx`

  const filePath = await mostrarDialogDesament(dades.titolDialog, nomFitxer, {
    name: 'Excel',
    extensions: ['xlsx']
  })

  if (!filePath) return { canceled: true }

  const files = dades.files.map((fila) =>
    dades.columnes.map((columna, index) => {
      const valor = fila[index] ?? null

      if (valor === null) return null

      if (columna.tipus === 'data' && typeof valor === 'string') {
        return new Date(`${valor.slice(0, 10)}T00:00:00.000Z`)
      }

      return valor
    })
  )

  const ws = XLSX.utils.aoa_to_sheet([dades.columnes.map((c) => c.titol), ...files], {
    cellDates: true
  })

  dades.columnes.forEach((columna, index) => {
    const format =
      columna.tipus === 'numero'
        ? '#,##0'
        : columna.tipus === 'decimal'
          ? '#,##0.00'
          : columna.tipus === 'moneda'
            ? '#,##0.00 "€"'
            : columna.tipus === 'data'
              ? 'dd/mm/yyyy'
              : null

    if (!format) return

    for (let fila = 1; fila <= files.length; fila++) {
      const adreca = XLSX.utils.encode_cell({ r: fila, c: index })

      if (ws[adreca]) {
        ws[adreca].z = format
      }
    }
  })

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Dades')

  XLSX.writeFile(wb, filePath, { bookType: 'xlsx' })

  return { canceled: false, format: dades.format, filePath: filePath }
}
