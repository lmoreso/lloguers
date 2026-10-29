import type { ImmobleDades } from '../shared/tipus'

// Una data ISO AAAA-MM-DD que existeix (rebutja '2025-1-1' i '2025-02-30').
function esDataISO(v: unknown): v is string {
  if (typeof v !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(v)) return false
  const d = new Date(`${v}T00:00:00Z`)
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === v
}

// Un nombre finit >= 0, o buit (null/undefined).
function nombreOpcional(nom: string, v: unknown): void {
  if (v === null || v === undefined) return
  if (typeof v !== 'number' || !Number.isFinite(v) || v < 0) throw new Error(`${nom} invàlid`)
}

// Validacions de l'immoble que no fa la BD: les columnes noves no porten CHECK. El formulari ja les fa, però el
// Renderer no és de fiar. Cada regla entre dos camps només s'aplica si hi són els dos.
export function validarImmoble(d: ImmobleDades): void {
  nombreOpcional('superficie_m2', d.superficie_m2)
  nombreOpcional('superficie_pati', d.superficie_pati)
  nombreOpcional('ced_hab_superficie_util', d.ced_hab_superficie_util)
  nombreOpcional('val_cadastral_total', d.val_cadastral_total)
  nombreOpcional('val_cadastral_constr', d.val_cadastral_constr)
  nombreOpcional('valor_compra', d.valor_compra)

  const anyConstr = d.any_construccio ?? null
  if (
    anyConstr !== null &&
    (!Number.isInteger(anyConstr) || anyConstr < 1800 || anyConstr > new Date().getFullYear())
  ) {
    throw new Error('Any de construcció invàlid')
  }

  const compra = d.data_compra ?? null
  if (compra !== null && !esDataISO(compra)) throw new Error('Data de compra invàlida')

  const util = d.ced_hab_superficie_util ?? null
  if (util !== null && util > d.superficie_m2) {
    throw new Error('La superfície útil no pot ser superior a la superfície')
  }

  const constr = d.val_cadastral_constr ?? null
  const total = d.val_cadastral_total ?? null
  if (constr !== null && total !== null && constr > total) {
    throw new Error('El valor cadastral de la construcció no pot superar el total')
  }

  if (compra !== null && anyConstr !== null && compra < `${anyConstr}-01-01`) {
    throw new Error("La data de compra no pot ser anterior a l'any de construcció")
  }
}
