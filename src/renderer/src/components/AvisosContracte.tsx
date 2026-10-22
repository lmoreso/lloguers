import { Badge, Stack } from '@mantine/core'
import { useTranslation } from 'react-i18next'
import { avisos, devolucioPendent, faltenDocuments } from '../utils/avisosContracte'
import type { ContracteLlistat } from '../../../shared/tipus'

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
