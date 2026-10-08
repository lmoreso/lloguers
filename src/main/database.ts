import Database from 'better-sqlite3'
import type { Database as DatabaseType } from 'better-sqlite3'
import { app } from 'electron'
import fs from 'fs'
import path from 'path'

const DADES = path.join(app.getPath('home'), 'Lloguers')
const dbPath = path.join(DADES, 'lloguers.sqlite')
const docsDir = path.join(DADES, 'documents')

// Les migracions s'incrusten al codi en compilar (Vite), així no depenen de cap carpeta del disc.
const migracions = import.meta.glob('./migrations/*.sql', {
  query: '?raw',
  import: 'default',
  eager: true
}) as Record<string, string>

fs.mkdirSync(docsDir, { recursive: true })

const db: DatabaseType = new Database(dbPath)

db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

function aplicarMigracions(): void {
  const versioActual = db.pragma('user_version', { simple: true }) as number

  const pendents = Object.entries(migracions)
    .map(([ruta, sql]) => ({ nom: path.basename(ruta), sql }))
    .filter((m) => /^\d+_.*\.sql$/.test(m.nom))
    .map((m) => ({ ...m, versio: parseInt(m.nom.split('_')[0], 10) }))
    .filter((m) => m.versio > versioActual)
    .sort((a, b) => a.versio - b.versio)

  for (const { nom, sql, versio } of pendents) {
    const aplicar = db.transaction(() => {
      db.exec(sql)
      db.pragma(`user_version = ${versio}`)
    })
    aplicar()
    console.log(`Migració aplicada: ${nom}`)
  }
}

aplicarMigracions()

export { db, docsDir, DADES }
