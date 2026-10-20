import { Badge, Stack } from '@mantine/core'
import { useTranslation } from 'react-i18next'
import {
  aniversariRevisio,
  DIES_AVIS_FI,
  DIES_AVIS_REVISIO,
  estatCaducitat
} from '../utils/caducitat'
import type { ContracteLlistat } from '../../../shared/tipus'

// Avisos d'un contracte. Només els vigents (sense data de fi) en tenen.
function avisos(c: ContracteLlistat): { clau: 'fi' | 'revisio'; estat: 'caducat' | 'aviat' }[] {
  if (c.data_fi !== null) return []
  const llista: { clau: 'fi' | 'revisio'; estat: 'caducat' | 'aviat' }[] = []
  const fi = estatCaducitat(c.d_fi_prevista, DIES_AVIS_FI)
  if (fi) llista.push({ clau: 'fi', estat: fi })
  const revisio = estatCaducitat(aniversariRevisio(c.data_ultima_revisio), DIES_AVIS_REVISIO)
  if (revisio) llista.push({ clau: 'revisio', estat: revisio })
  return llista
}

// Hi ha una data de la fiança informada però no el document adjunt de la classe que la justifica.
// El model 3 justifica la sol·licitud de devolució.
function faltenDocuments(c: ContracteLlistat): boolean {
  return (
    (c.fianca_data_model2 !== null && !c.te_doc_model2) ||
    (c.fianca_data_notificacio !== null && !c.te_doc_notificacio) ||
    (c.devolucio_data_sollicitud !== null && !c.te_doc_model3)
  )
}

// Contracte tancat amb la fiança ja gestionada (model 2 o notificació) però sense el cobrament de
// la devolució: la fiança està per cobrar.
function devolucioPendent(c: ContracteLlistat): boolean {
  return (
    c.data_fi !== null &&
    (c.fianca_data_model2 !== null || c.fianca_data_notificacio !== null) &&
    c.devolucio_data_cobrament === null
  )
}

// Etiquetes d'avís d'un contracte, apilades. Compartit per la llista de contractes d'un immoble
// i per la vista "Últims contractes".
function AvisosContracte({ contracte: c }: { contracte: ContracteLlistat }): React.JSX.Element {
  const { t } = useTranslation()
  return (
    <Stack gap={4} align="flex-start">
      {avisos(c).map((a) => (
        <Badge key={a.clau} color={a.estat === 'caducat' ? 'red' : 'orange'}>
          {t(`contractes.avisos.${a.clau}.${a.estat}`)}
        </Badge>
      ))}
      {faltenDocuments(c) && <Badge color="orange">{t('contractes.avisos.documents')}</Badge>}
      {devolucioPendent(c) && (
        <Badge color="yellow">{t('contractes.avisos.devolucioPendent')}</Badge>
      )}
    </Stack>
  )
}

export default AvisosContracte
