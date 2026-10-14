import { db } from './database'
import { CLASSES_DOCUMENT } from '../shared/tipus'
import type { ClasseDocument, NomsClasses, TipusDocument } from '../shared/tipus'

export function obtenirTipusDocument(): TipusDocument[] {
  return db
    .prepare('SELECT id, nom, classe FROM tipus_document ORDER BY id')
    .all() as TipusDocument[]
}

// Insereix un tipus per cada classe que no en tingui cap. Idempotent: si ja hi són tots, no fa res.
// Retorna les classes que ha sembrat.
export function sembrarTipusDocument(noms: NomsClasses): ClasseDocument[] {
  // El Renderer no és de fiar: cal un nom no buit per a cada classe coneguda.
  for (const classe of CLASSES_DOCUMENT) {
    const nom = (noms as Record<string, unknown> | null)?.[classe]
    if (typeof nom !== 'string' || !nom.trim()) {
      throw new Error(`Falta el nom de la classe de document "${classe}"`)
    }
  }

  const existents = new Set(
    (db.prepare('SELECT DISTINCT classe FROM tipus_document').all() as { classe: string }[]).map(
      (f) => f.classe
    )
  )
  const inserir = db.prepare('INSERT INTO tipus_document (nom, classe) VALUES (?, ?)')
  const sembrades: ClasseDocument[] = []

  db.transaction(() => {
    for (const classe of CLASSES_DOCUMENT) {
      if (existents.has(classe)) continue
      inserir.run(noms[classe].trim(), classe)
      sembrades.push(classe)
    }
  })()

  console.log(
    sembrades.length > 0
      ? `[tipus] Sembrats ${sembrades.length} tipus de document: ${sembrades.join(', ')}`
      : '[tipus] Tots els tipus de document ja existeixen; no se sembra res'
  )
  return sembrades
}
