import path from 'path'
import { DADES, docsDir } from './database'

// Error amb el codi que `traduirError` reconeix (el Renderer en veu el text traduït).
export function fitxerNoTrobat(): Error {
  return Object.assign(new Error('Fitxer no trobat'), { code: 'FITXER_NO_TROBAT' })
}

// Nom de fitxer segur per al disc: sense separadors de ruta, caràcters reservats ni de control,
// i amb una longitud raonable. L'extensió es conserva.
export function nomSegur(nom: string): string {
  const net = (s: string): string =>
    [...s.replace(/[\\/:*?"<>|]/g, '_')]
      .filter((c) => c.charCodeAt(0) >= 32)
      .join('')
      .trim()
  const ext = path.extname(nom)
  const base = net(path.basename(nom, ext)).slice(0, 120) || 'document'
  return base + net(ext).slice(0, 20)
}

// Converteix la ruta relativa de la BD (`documents/...`) en absoluta i comprova que queda DINS de
// documents/: una ruta amb `..` o absoluta es rebutja.
export function rutaDins(relativa: string): string {
  const absoluta = path.resolve(DADES, relativa)
  if (!absoluta.startsWith(docsDir + path.sep)) throw new Error('Ruta fora de documents')
  return absoluta
}
