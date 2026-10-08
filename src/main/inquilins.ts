import { db } from './database'
import type { Inquili, InquiliDades } from '../shared/tipus'

// Fila tal com surt de SQLite: els indicadors són 0, 1 o NULL.
type FilaInquili = Omit<Inquili, 'ck_tel1_wassap' | 'ck_tel1_bizum'> & {
  ck_tel1_wassap: number | null
  ck_tel1_bizum: number | null
}

const COLUMNES = 'id, nom, cognoms, nif, telefon_1, ck_tel1_wassap, ck_tel1_bizum'

// SQLite -> aplicació: 1 és true; 0 i NULL són false.
function deFila(f: FilaInquili): Inquili {
  return {
    ...f,
    ck_tel1_wassap: f.ck_tel1_wassap === 1,
    ck_tel1_bizum: f.ck_tel1_bizum === 1
  }
}

// Aplicació -> SQLite: better-sqlite3 no admet boolean com a paràmetre.
function aParametres(d: InquiliDades): Record<string, string | number | null> {
  return {
    ...d,
    ck_tel1_wassap: d.ck_tel1_wassap ? 1 : 0,
    ck_tel1_bizum: d.ck_tel1_bizum ? 1 : 0
  }
}

export function obtenirInquilins(): Inquili[] {
  const files = db
    .prepare(`SELECT ${COLUMNES} FROM inquilins ORDER BY cognoms, nom`)
    .all() as FilaInquili[]
  return files.map(deFila)
}

export function obtenirInquili(id: number): Inquili | undefined {
  const fila = db.prepare(`SELECT ${COLUMNES} FROM inquilins WHERE id = ?`).get(id) as
    FilaInquili | undefined
  return fila ? deFila(fila) : undefined
}

export function crearInquili(d: InquiliDades): Inquili {
  const r = db
    .prepare(
      `INSERT INTO inquilins (nom, cognoms, nif, telefon_1, ck_tel1_wassap, ck_tel1_bizum)
       VALUES (@nom, @cognoms, @nif, @telefon_1, @ck_tel1_wassap, @ck_tel1_bizum)`
    )
    .run(aParametres(d))
  return obtenirInquili(Number(r.lastInsertRowid)) as Inquili
}

export function actualitzarInquili(id: number, d: InquiliDades): void {
  db.prepare(
    `UPDATE inquilins SET nom=@nom, cognoms=@cognoms, nif=@nif, telefon_1=@telefon_1,
      ck_tel1_wassap=@ck_tel1_wassap, ck_tel1_bizum=@ck_tel1_bizum
     WHERE id=@id`
  ).run({ ...aParametres(d), id })
}

export function eliminarInquili(id: number): void {
  db.prepare('DELETE FROM inquilins WHERE id = ?').run(id)
}
