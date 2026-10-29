import { db } from './database'
import { esborrarCarpetaImmoble } from './documentsImmoble'
import { validarImmoble } from './validacionsImmoble'
import type { Immoble, ImmobleDades } from '../shared/tipus'

const COLUMNES = `id, via, num_via, pis, porta, codi_postal, localitat, provincia,
  ref_catastral, superficie_m2, superficie_pati, cert_en_reg, cert_en_class,
  cert_en_data, cert_en_caduc, ced_hab_reg, ced_hab_data, ced_hab_caduc,
  ced_hab_superficie_util, val_cadastral_total, val_cadastral_constr, any_construccio,
  data_compra, valor_compra`

// better-sqlite3 exigeix totes les claus d'un objecte de paràmetres: un objecte sense els camps nous
// (codi antic) es desa amb NULL en lloc de fallar.
function parametres(d: ImmobleDades): ImmobleDades {
  return {
    ...d,
    ced_hab_superficie_util: d.ced_hab_superficie_util ?? null,
    val_cadastral_total: d.val_cadastral_total ?? null,
    val_cadastral_constr: d.val_cadastral_constr ?? null,
    any_construccio: d.any_construccio ?? null,
    data_compra: d.data_compra ?? null,
    valor_compra: d.valor_compra ?? null
  }
}

export function obtenirInmobles(): Immoble[] {
  return db
    .prepare(`SELECT ${COLUMNES} FROM inmobles ORDER BY via, num_via, pis, porta`)
    .all() as Immoble[]
}

export function obtenirInmoble(id: number): Immoble | undefined {
  return db.prepare(`SELECT ${COLUMNES} FROM inmobles WHERE id = ?`).get(id) as Immoble | undefined
}

export function crearInmoble(d: ImmobleDades): Immoble {
  const p = parametres(d)
  validarImmoble(p)
  const r = db
    .prepare(
      `INSERT INTO inmobles (via, num_via, pis, porta, codi_postal, localitat, provincia,
        ref_catastral, superficie_m2, superficie_pati, cert_en_reg, cert_en_class,
        cert_en_data, cert_en_caduc, ced_hab_reg, ced_hab_data, ced_hab_caduc,
        ced_hab_superficie_util, val_cadastral_total, val_cadastral_constr, any_construccio,
        data_compra, valor_compra)
       VALUES (@via, @num_via, @pis, @porta, @codi_postal, @localitat, @provincia,
        @ref_catastral, @superficie_m2, @superficie_pati, @cert_en_reg, @cert_en_class,
        @cert_en_data, @cert_en_caduc, @ced_hab_reg, @ced_hab_data, @ced_hab_caduc,
        @ced_hab_superficie_util, @val_cadastral_total, @val_cadastral_constr, @any_construccio,
        @data_compra, @valor_compra)`
    )
    .run(p)
  return obtenirInmoble(Number(r.lastInsertRowid)) as Immoble
}

export function actualitzarInmoble(id: number, d: ImmobleDades): void {
  const p = parametres(d)
  validarImmoble(p)
  db.prepare(
    `UPDATE inmobles SET via=@via, num_via=@num_via, pis=@pis, porta=@porta,
      codi_postal=@codi_postal, localitat=@localitat, provincia=@provincia,
      ref_catastral=@ref_catastral, superficie_m2=@superficie_m2,
      superficie_pati=@superficie_pati, cert_en_reg=@cert_en_reg,
      cert_en_class=@cert_en_class, cert_en_data=@cert_en_data,
      cert_en_caduc=@cert_en_caduc, ced_hab_reg=@ced_hab_reg,
      ced_hab_data=@ced_hab_data, ced_hab_caduc=@ced_hab_caduc,
      ced_hab_superficie_util=@ced_hab_superficie_util,
      val_cadastral_total=@val_cadastral_total, val_cadastral_constr=@val_cadastral_constr,
      any_construccio=@any_construccio, data_compra=@data_compra, valor_compra=@valor_compra
     WHERE id=@id`
  ).run({ ...p, id })
}

// Esborra l'immoble. Els documents (files) s'esborren en cascada; la carpeta del disc, després. Un immoble amb
// contractes continua bloquejat (FK_VIOLADA), i llavors no es toca cap fitxer.
export function eliminarInmoble(id: number): void {
  db.prepare('DELETE FROM inmobles WHERE id = ?').run(id)
  esborrarCarpetaImmoble(id)
}
