// Sense majúscules ni accents (es treuen els signes combinants U+0300 a U+036F després de descompondre).
export function normalitza(text: string): string {
  return [...text.normalize('NFD')]
    .filter((c) => c.charCodeAt(0) < 0x300 || c.charCodeAt(0) > 0x36f)
    .join('')
    .toLowerCase()
}

// Totes les paraules de la cerca (separades per espais) han de ser al text, sense distingir accents ni majúscules.
// Una cerca buida ho compleix tot.
export function conteTotesLesParaules(text: string, cerca: string): boolean {
  const paraules = normalitza(cerca).split(' ').filter(Boolean)
  if (paraules.length === 0) return true
  const net = normalitza(text)
  return paraules.every((p) => net.includes(p))
}
