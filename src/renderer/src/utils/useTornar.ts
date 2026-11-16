import { useLocation, useNavigate } from 'react-router-dom'

// Torna a la pantalla que ha cridat l'actual (l'entrada anterior de l'historial). Si no n'hi ha cap (l'app s'ha obert
// directament en aquesta pantalla, o s'ha recarregat), va a `alternativa`. Cada pantalla només passa la seva pantalla
// "natural" de sortida.
export function useTornar(alternativa: string): () => void {
  const navigate = useNavigate()
  const { key } = useLocation()
  return () => {
    // La primera entrada de l'historial té la clau 'default': no hi ha res on tornar.
    if (key !== 'default') navigate(-1)
    else navigate(alternativa, { replace: true })
  }
}
