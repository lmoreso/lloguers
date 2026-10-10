import { notifications } from '@mantine/notifications'
import i18n from '../i18n'
import type { CodiError, Resultat } from '../../../shared/tipus'

// Mostra una notificació traduïda per a un codi d'error del Main.
export function notificarError(codi: CodiError): void {
  notifications.show({ color: 'red', message: i18n.t(`errors.${codi}`) })
}

// Comprova un Resultat<T>: si ha fallat, notifica l'error i retorna false.
// Si retorna true, TypeScript sap que `resposta.dades` existeix.
export function esOk<T>(resposta: Resultat<T>): resposta is { ok: true; dades: T } {
  if (!resposta.ok) {
    notificarError(resposta.error)
    return false
  }
  return true
}
