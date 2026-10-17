import type { CodiError, Resultat } from '../shared/tipus'

// Converteix una excepció de better-sqlite3 en un codi estable.
// better-sqlite3 posa el codi de SQLite a la propietat `code` de l'error.
export function traduirError(e: unknown): CodiError {
  const codi = (e as { code?: string } | null)?.code

  switch (codi) {
    case 'SQLITE_CONSTRAINT_TRIGGER':
      return 'CONTRACTE_SOLAPAT'
    case 'SQLITE_CONSTRAINT_FOREIGNKEY':
      return 'FK_VIOLADA'
    case 'SQLITE_CONSTRAINT_CHECK':
      return 'CHECK_VIOLAT'
    case 'ENOENT': // un fitxer que no existeix (codi de Node)
    case 'FITXER_NO_TROBAT':
      return 'FITXER_NO_TROBAT'
    default:
      console.error('Error de BD no reconegut:', e)
      return 'DESCONEGUT'
  }
}

// Executa una operació de BD i la converteix en un Resultat<T>.
// Els handlers IPC l'usen perquè mai llancin excepcions cap al Renderer.
export function executar<T>(operacio: () => T): Resultat<T> {
  try {
    return { ok: true, dades: operacio() }
  } catch (e) {
    return { ok: false, error: traduirError(e) }
  }
}

// Igual que executar, per a operacions asíncrones (diàlegs, obrir fitxers...).
export async function executarAsync<T>(operacio: () => Promise<T>): Promise<Resultat<T>> {
  try {
    return { ok: true, dades: await operacio() }
  } catch (e) {
    return { ok: false, error: traduirError(e) }
  }
}
