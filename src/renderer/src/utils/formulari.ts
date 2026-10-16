// Els camps de text d'un formulari són sempre string; a la BD els buits són NULL.
export const buitANull = (s: string): string | null => s.trim() || null

// Accepta coma o punt decimal; a la BD sempre punt. Retorna null si és buit o no és un número.
export function aNumero(s: string): number | null {
  const net = s.trim().replace(',', '.')
  const n = Number(net)
  return net !== '' && Number.isFinite(n) ? n : null
}
