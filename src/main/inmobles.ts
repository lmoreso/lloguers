import { db } from './database'
import type { Immoble, ImmobleDades } from '../shared/tipus'

const COLUMNES = `id, via, num_via, pis, porta, codi_postal, localitat, provincia,
  ref_catastral, superficie_m2, superficie_pati, cert_en_reg, cert_en_class,
  cert_en_data, cert_en_caduc, ced_hab_reg, ced_hab_data, ced_hab_caduc`

export function obtenirInmobles(): Immoble[] {
  return db
    .prepare(`SELECT ${COLUMNES} FROM inmobles ORDER BY via, num_via, pis, porta`)
    .all() as Immoble[]
}

export function obtenirInmoble(id: number): Immoble | undefined {
  return db.prepare(`SELECT ${COLUMNES} FROM inmobles WHERE id = ?`).get(id) as Immoble | undefined
}

export function crearInmoble(d: ImmobleDades): Immoble {
  const r = db
    .prepare(
      `INSERT INTO inmobles (via, num_via, pis, porta, codi_postal, localitat, provincia,
        ref_catastral, superficie_m2, superficie_pati, cert_en_reg, cert_en_class,
        cert_en_data, cert_en_caduc, ced_hab_reg, ced_hab_data, ced_hab_caduc)
       VALUES (@via, @num_via, @pis, @porta, @codi_postal, @localitat, @provincia,
        @ref_catastral, @superficie_m2, @superficie_pati, @cert_en_reg, @cert_en_class,
        @cert_en_data, @cert_en_caduc, @ced_hab_reg, @ced_hab_data, @ced_hab_caduc)`
    )
    .run(d)
  return obtenirInmoble(Number(r.lastInsertRowid)) as Immoble
}

export function actualitzarInmoble(id: number, d: ImmobleDades): void {
  db.prepare(
    `UPDATE inmobles SET via=@via, num_via=@num_via, pis=@pis, porta=@porta,
      codi_postal=@codi_postal, localitat=@localitat, provincia=@provincia,
      ref_catastral=@ref_catastral, superficie_m2=@superficie_m2,
      superficie_pati=@superficie_pati, cert_en_reg=@cert_en_reg,
      cert_en_class=@cert_en_class, cert_en_data=@cert_en_data,
      cert_en_caduc=@cert_en_caduc, ced_hab_reg=@ced_hab_reg,
      ced_hab_data=@ced_hab_data, ced_hab_caduc=@ced_hab_caduc
     WHERE id=@id`
  ).run({ ...d, id })
}

export function eliminarInmoble(id: number): void {
  db.prepare('DELETE FROM inmobles WHERE id = ?').run(id)
}
