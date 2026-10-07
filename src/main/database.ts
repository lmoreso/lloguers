import Database from 'better-sqlite3'
import type { Database as DatabaseType } from 'better-sqlite3'
import { app } from 'electron'
import fs from 'fs'
import path from 'path'

const DADES = path.join(app.getPath('home'), 'Lloguers')
const dbPath = path.join(DADES, 'lloguers.sqlite')
const docsDir = path.join(DADES, 'documents')

// Carpeta de migracions: en desenvolupament és al codi font
const migracionsDir = path.join(__dirname, '../../src/main/migrations')

fs.mkdirSync(docsDir, { recursive: true })

const db: DatabaseType = new Database(dbPath)

db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

function aplicarMigracions(): void {
  const versioActual = db.pragma('user_version', { simple: true }) as number

  const fitxers = fs
    .readdirSync(migracionsDir)
    .filter((f) => /^\d+_.*\.sql$/.test(f))
    .sort()

  for (const fitxer of fitxers) {
    const versio = parseInt(fitxer.split('_')[0], 10)
    if (versio <= versioActual) continue

    const sql = fs.readFileSync(path.join(migracionsDir, fitxer), 'utf-8')
    const aplicar = db.transaction(() => {
      db.exec(sql)
      db.pragma(`user_version = ${versio}`)
    })
    aplicar()
    console.log(`Migració aplicada: ${fitxer}`)
  }
}

aplicarMigracions()

export { db, docsDir }
